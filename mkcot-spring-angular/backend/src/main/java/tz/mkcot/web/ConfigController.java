package tz.mkcot.web;

import com.fasterxml.jackson.databind.JsonNode;
import java.io.IOException;
import java.util.Map;
import java.util.Set;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import tz.mkcot.model.FundAbout;
import tz.mkcot.model.FundSettings;
import tz.mkcot.security.CurrentUser;
import tz.mkcot.service.ConfigService;
import tz.mkcot.service.Permissions;

@RestController
@RequestMapping("/api/config")
public class ConfigController {
    private static final Set<String> IMAGE_TYPES = Set.of("image/png", "image/jpeg", "image/gif", "image/webp", "image/svg+xml");
    private static final long MAX_LOGO = 1024 * 1024;

    private final ConfigService cfg;
    private final Permissions perms;

    public ConfigController(ConfigService cfg, Permissions perms, tz.mkcot.service.AuditService audit) {
        this.audit = audit;
        this.cfg = cfg;
        this.perms = perms;
    }

    private final tz.mkcot.service.AuditService audit;

    @GetMapping("/settings")
    public FundSettings settings() {
        perms.requireRead(CurrentUser.get(), Permissions.CONFIG);
        return cfg.settings();
    }

    @PutMapping("/settings")
    public FundSettings saveSettings(@RequestBody JsonNode body) {
        CurrentUser u = CurrentUser.get();
        perms.requireAdmin(u);
        audit.log(u, "settings_change", "config", "settings", null);
        return cfg.saveSettings(u.id(), body);
    }

    @GetMapping("/about")
    public FundAbout about() {
        perms.requireRead(CurrentUser.get(), Permissions.CONFIG);
        return cfg.about();
    }

    @PutMapping("/about")
    public FundAbout saveAbout(@RequestBody JsonNode body) {
        CurrentUser u = CurrentUser.get();
        perms.requireWrite(u, Permissions.ABOUT);
        audit.log(u, "about_change", "config", "about", null);
        return cfg.saveAbout(u.id(), body);
    }

    /** Nembo ya mfuko: kila mtu anaweza kuiona (inaonekana hata kwenye ukurasa wa kuingia). */
    @GetMapping("/logo")
    public ResponseEntity<byte[]> logo() {
        FundSettings s = cfg.settings();
        if (s.getLogo() == null || s.getLogoType() == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(s.getLogoType()))
                .cacheControl(CacheControl.noCache())
                .header("X-Content-Type-Options", "nosniff")
                .header("Content-Security-Policy", "default-src 'none'; style-src 'unsafe-inline'")
                .body(s.getLogo());
    }

    @PostMapping(value = "/logo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, Object> uploadLogo(@RequestParam("file") MultipartFile file) throws IOException {
        CurrentUser u = CurrentUser.get();
        perms.requireAdmin(u);
        String type = file.getContentType();
        if (type == null || !IMAGE_TYPES.contains(type)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chagua picha (PNG, JPG, GIF, WEBP au SVG).");
        }
        if (file.getSize() > MAX_LOGO) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Picha isizidi MB 1.");
        }
        FundSettings s = cfg.saveLogo(u.id(), file.getBytes(), type);
        audit.log(u, "logo_change", "config", "logo", type);
        return Map.of("logoVersion", s.getLogoVersion());
    }

    @DeleteMapping("/logo")
    public Map<String, Object> deleteLogo() {
        CurrentUser u = CurrentUser.get();
        perms.requireAdmin(u);
        FundSettings s = cfg.saveLogo(u.id(), null, null);
        return Map.of("logoVersion", s.getLogoVersion());
    }
}
