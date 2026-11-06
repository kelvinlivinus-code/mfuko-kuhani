package tz.mkcot.web;

import com.fasterxml.jackson.databind.JsonNode;
import java.util.Map;
import org.springframework.web.bind.annotation.*;
import tz.mkcot.security.CurrentUser;
import tz.mkcot.service.BackupService;
import tz.mkcot.service.Permissions;

@RestController
@RequestMapping("/api/backup")
public class BackupController {
    private final BackupService backup;
    private final Permissions perms;

    public BackupController(BackupService backup, Permissions perms) {
        this.backup = backup;
        this.perms = perms;
    }

    /** Msimamizi na Mkaguzi (msomaji) wanaweza kupakua nakala ya data yote. */
    @GetMapping
    public Map<String, Object> export() {
        CurrentUser u = CurrentUser.get();
        if (!"msimamizi".equals(u.role()) && !"msomaji".equals(u.role())) {
            throw Permissions.forbidden();
        }
        return backup.export();
    }

    /** Msimamizi pekee: inafuta data iliyopo na kuweka iliyo kwenye nakala. */
    @PostMapping("/import")
    public Map<String, Integer> importAll(@RequestBody JsonNode body) {
        CurrentUser u = CurrentUser.get();
        perms.requireAdmin(u);
        return backup.importAll(u, body);
    }
}
