package tz.mkcot.web;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.OffsetDateTime;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import tz.mkcot.model.AppUser;
import tz.mkcot.model.Roles;
import tz.mkcot.repo.AppUserRepository;
import tz.mkcot.security.CurrentUser;
import tz.mkcot.security.JwtService;
import tz.mkcot.service.RecordService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    public record RegisterReq(@NotBlank @Email String email, @NotBlank @Size(min = 8, max = 100) String password, String fullName) {}
    public record LoginReq(@NotBlank String email, @NotBlank String password) {}
    public record AuthRes(String token, AppUser user) {}

    private final AppUserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public AuthController(AppUserRepository users, PasswordEncoder encoder, JwtService jwt) {
        this.users = users;
        this.encoder = encoder;
        this.jwt = jwt;
    }

    /** Je, mfumo una watumiaji tayari? (ukurasa wa kuingia unaonyesha ujumbe wa "mtumiaji wa kwanza") */
    @GetMapping("/status")
    public Map<String, Object> status() {
        return Map.of("hasUsers", users.count() > 0);
    }

    @PostMapping("/register")
    @Transactional
    public AuthRes register(@Valid @RequestBody RegisterReq req) {
        String email = req.email().trim().toLowerCase();
        if (users.findByEmailIgnoreCase(email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Barua pepe hii tayari imesajiliwa. Ingia badala yake.");
        }
        AppUser u = new AppUser();
        u.setId(RecordService.newId());
        u.setEmail(email);
        u.setPasswordHash(encoder.encode(req.password()));
        u.setFullName(req.fullName() == null ? null : req.fullName().trim());
        // Mtumiaji wa kwanza kabisa anakuwa Msimamizi; wengine wanasubiri kuidhinishwa.
        u.setRole(users.count() == 0 ? Roles.MSIMAMIZI : Roles.ANASUBIRI);
        u.setCreatedAt(OffsetDateTime.now());
        users.save(u);
        return new AuthRes(jwt.issue(u.getId()), u);
    }

    @PostMapping("/login")
    public AuthRes login(@Valid @RequestBody LoginReq req) {
        AppUser u = users.findByEmailIgnoreCase(req.email().trim())
                .filter(x -> encoder.matches(req.password(), x.getPasswordHash()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Barua pepe au neno la siri si sahihi."));
        return new AuthRes(jwt.issue(u.getId()), u);
    }

    @GetMapping("/me")
    public AppUser me() {
        return users.findById(CurrentUser.get().id())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Ingia kwanza."));
    }

    public record PasswordReq(@NotBlank String current, @NotBlank @Size(min = 8, max = 100) String next) {}

    @PostMapping("/password")
    @Transactional
    public Map<String, Object> changePassword(@Valid @RequestBody PasswordReq req) {
        AppUser u = me();
        if (!encoder.matches(req.current(), u.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Neno la siri la sasa si sahihi.");
        }
        u.setPasswordHash(encoder.encode(req.next()));
        users.save(u);
        return Map.of("ok", true);
    }
}
