package tz.mkcot.web;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.OffsetDateTime;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
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
import tz.mkcot.security.PasswordPolicy;
import tz.mkcot.service.AuditService;
import tz.mkcot.service.RecordService;

/**
 * Kujisajili, kuingia na neno la siri.
 * Usalama: akaunti inafungwa dakika 15 baada ya majaribio 5 mabaya; ujumbe wa kosa haufichui kama barua pepe ipo;
 * neno la siri likibadilishwa tokeni zote za zamani zinakufa.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    public record RegisterReq(@NotBlank @Email @Size(max = 200) String email, @NotBlank @Size(min = 8, max = 100) String password,
                              @Size(max = 200) String fullName) {}
    public record LoginReq(@NotBlank @Size(max = 200) String email, @NotBlank @Size(max = 100) String password) {}
    public record AuthRes(String token, AppUser user) {}

    static final int MAX_FAILS = 5;
    static final int LOCK_MINUTES = 15;

    private final AppUserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;
    private final AuditService audit;
    private final String adminEmail;
    private final String dummyHash;

    public AuthController(AppUserRepository users, PasswordEncoder encoder, JwtService jwt, AuditService audit,
                          @Value("${mkcot.admin-email:}") String adminEmail) {
        this.users = users;
        this.encoder = encoder;
        this.jwt = jwt;
        this.audit = audit;
        this.adminEmail = adminEmail == null ? "" : adminEmail.trim().toLowerCase();
        // Hash ya bandia: hata barua pepe isipokuwepo, kuingia kunachukua muda ule ule (haifichui nani amesajiliwa).
        this.dummyHash = encoder.encode("mkcot-dummy-" + System.nanoTime());
    }

    /** Je, mfumo una watumiaji tayari? (ukurasa wa kuingia unaonyesha ujumbe wa "mtumiaji wa kwanza") */
    @GetMapping("/status")
    public Map<String, Object> status() {
        return Map.of("hasUsers", users.count() > 0);
    }

    @PostMapping("/register")
    @Transactional
    public AuthRes register(@Valid @RequestBody RegisterReq req) {
        PasswordPolicy.check(req.password());
        String email = req.email().trim().toLowerCase();
        if (users.findByEmailIgnoreCase(email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Barua pepe hii tayari imesajiliwa. Ingia badala yake.");
        }
        AppUser u = new AppUser();
        u.setId(RecordService.newId());
        u.setEmail(email);
        u.setPasswordHash(encoder.encode(req.password()));
        u.setFullName(req.fullName() == null ? null : req.fullName().trim());
        // Msimamizi wa kwanza: kama MKCOT_ADMIN_EMAIL imewekwa, ni barua pepe hiyo tu inayoweza kuwa Msimamizi wa kwanza
        // (inazuia mgeni kuwahi kujisajili kwanza seva ikiwa mpya). Vinginevyo mtumiaji wa kwanza kabisa.
        boolean first = users.count() == 0;
        boolean makeAdmin = adminEmail.isEmpty() ? first : (adminEmail.equals(email) && users.countByRole(Roles.MSIMAMIZI) == 0);
        u.setRole(makeAdmin ? Roles.MSIMAMIZI : Roles.ANASUBIRI);
        u.setCreatedAt(OffsetDateTime.now());
        u.setLastLoginAt(OffsetDateTime.now());
        users.save(u);
        audit.log(u.getId(), email, "register", "user", u.getId(), "nafasi: " + u.getRole());
        return new AuthRes(jwt.issue(u.getId(), u.getTokenVersion()), u);
    }

    @PostMapping("/login")
    @Transactional(noRollbackFor = ResponseStatusException.class)
    public AuthRes login(@Valid @RequestBody LoginReq req) {
        String email = req.email().trim().toLowerCase();
        AppUser u = users.findByEmailIgnoreCase(email).orElse(null);
        OffsetDateTime now = OffsetDateTime.now();
        if (u == null) {
            encoder.matches(req.password(), dummyHash);
            audit.log(null, email, "login_fail", "user", null, "barua pepe haijasajiliwa");
            throw wrong();
        }
        if (u.getLockedUntil() != null && u.getLockedUntil().isAfter(now)) {
            audit.log(u.getId(), email, "login_locked", "user", u.getId(), null);
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                    "Akaunti imefungwa kwa muda kwa sababu ya majaribio mengi. Jaribu tena baada ya dakika " + LOCK_MINUTES + ".");
        }
        if (!encoder.matches(req.password(), u.getPasswordHash())) {
            int fails = u.getFailedLogins() + 1;
            u.setFailedLogins(fails);
            if (fails >= MAX_FAILS) {
                u.setFailedLogins(0);
                u.setLockedUntil(now.plusMinutes(LOCK_MINUTES));
                audit.log(u.getId(), email, "account_locked", "user", u.getId(), "majaribio " + MAX_FAILS + " mabaya");
            } else {
                audit.log(u.getId(), email, "login_fail", "user", u.getId(), "jaribio " + fails);
            }
            users.save(u);
            throw wrong();
        }
        u.setFailedLogins(0);
        u.setLockedUntil(null);
        u.setLastLoginAt(now);
        users.save(u);
        audit.log(u.getId(), email, "login", "user", u.getId(), null);
        return new AuthRes(jwt.issue(u.getId(), u.getTokenVersion()), u);
    }

    @GetMapping("/me")
    public AppUser me() {
        return users.findById(CurrentUser.get().id())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Ingia kwanza."));
    }

    public record PasswordReq(@NotBlank @Size(max = 100) String current, @NotBlank @Size(min = 8, max = 100) String next) {}

    /** Kubadilisha neno la siri: vifaa vingine vyote vilivyoingia vinatolewa; kifaa hiki kinapata tokeni mpya. */
    @PostMapping("/password")
    @Transactional
    public Map<String, Object> changePassword(@Valid @RequestBody PasswordReq req) {
        AppUser u = me();
        if (!encoder.matches(req.current(), u.getPasswordHash())) {
            audit.log(u.getId(), u.getEmail(), "password_fail", "user", u.getId(), null);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Neno la siri la sasa si sahihi.");
        }
        PasswordPolicy.check(req.next());
        u.setPasswordHash(encoder.encode(req.next()));
        u.setTokenVersion(u.getTokenVersion() + 1);
        users.save(u);
        audit.log(u.getId(), u.getEmail(), "password_change", "user", u.getId(), null);
        return Map.of("ok", true, "token", jwt.issue(u.getId(), u.getTokenVersion()));
    }

    /** Toka kwenye vifaa vyote (tokeni zote za mtumiaji huyu zinakufa). */
    @PostMapping("/logout-all")
    @Transactional
    public Map<String, Object> logoutAll() {
        AppUser u = me();
        u.setTokenVersion(u.getTokenVersion() + 1);
        users.save(u);
        audit.log(u.getId(), u.getEmail(), "logout_all", "user", u.getId(), null);
        return Map.of("ok", true);
    }

    private static ResponseStatusException wrong() {
        return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Barua pepe au neno la siri si sahihi.");
    }
}
