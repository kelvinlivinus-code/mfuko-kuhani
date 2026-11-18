package tz.mkcot.web;

import java.util.Comparator;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import tz.mkcot.model.AppUser;
import tz.mkcot.model.Roles;
import tz.mkcot.repo.AppUserRepository;
import tz.mkcot.security.CurrentUser;
import tz.mkcot.service.Permissions;

/** Msimamizi anaidhinisha watumiaji na kuwapa nafasi. */
@RestController
@RequestMapping("/api/users")
public class UserController {
    public record UpdateReq(String role, String memberId) {}

    private final AppUserRepository users;
    private final Permissions perms;
    private final org.springframework.security.crypto.password.PasswordEncoder encoder;
    private final tz.mkcot.service.AuditService audit;

    public UserController(AppUserRepository users, Permissions perms, org.springframework.security.crypto.password.PasswordEncoder encoder,
                          tz.mkcot.service.AuditService audit) {
        this.users = users;
        this.perms = perms;
        this.encoder = encoder;
        this.audit = audit;
    }

    @GetMapping
    public List<AppUser> list() {
        perms.requireAdmin(CurrentUser.get());
        return users.findAll().stream()
                .sorted(Comparator.comparing(AppUser::getCreatedAt, Comparator.nullsFirst(Comparator.naturalOrder())))
                .toList();
    }

    @PutMapping("/{id}")
    @Transactional
    public AppUser update(@PathVariable String id, @RequestBody UpdateReq req) {
        CurrentUser me = CurrentUser.get();
        perms.requireAdmin(me);
        AppUser u = users.findById(id).orElseThrow(Permissions::notFound);
        if (req.role() != null) {
            if (!Roles.ALL.contains(req.role())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nafasi haijulikani: " + req.role());
            }
            if (u.getId().equals(me.id()) && !Roles.MSIMAMIZI.equals(req.role())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Huwezi kujiondolea nafasi ya Msimamizi mwenyewe.");
            }
            if (!req.role().equals(u.getRole())) {
                audit.log(me, "role_change", "user", u.getId(), u.getEmail() + ": " + u.getRole() + " -> " + req.role());
            }
            u.setRole(req.role());
        }
        if (req.memberId() != null) {
            u.setMemberId(req.memberId().isBlank() ? null : req.memberId());
        }
        return users.save(u);
    }

    public record PasswordReq(String password) {}

    /** Msimamizi anamwekea mtumiaji neno jipya la siri (kwa aliyesahau). */
    @PutMapping("/{id}/password")
    @Transactional
    public java.util.Map<String, Object> setPassword(@PathVariable String id, @RequestBody PasswordReq req) {
        CurrentUser me = CurrentUser.get();
        perms.requireAdmin(me);
        tz.mkcot.security.PasswordPolicy.check(req.password());
        AppUser u = users.findById(id).orElseThrow(Permissions::notFound);
        u.setPasswordHash(encoder.encode(req.password()));
        // Tokeni zote za zamani za mtumiaji huyu zinakufa, na akaunti inafunguliwa kama ilikuwa imefungwa.
        u.setTokenVersion(u.getTokenVersion() + 1);
        u.setFailedLogins(0);
        u.setLockedUntil(null);
        users.save(u);
        audit.log(me, "password_reset", "user", u.getId(), u.getEmail());
        return java.util.Map.of("ok", true);
    }

    @DeleteMapping("/{id}")
    @Transactional
    public void delete(@PathVariable String id) {
        CurrentUser me = CurrentUser.get();
        perms.requireAdmin(me);
        if (id.equals(me.id())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Huwezi kujifuta mwenyewe.");
        }
        AppUser u = users.findById(id).orElseThrow(Permissions::notFound);
        users.delete(u);
        audit.log(me, "user_delete", "user", id, u.getEmail() + " (" + u.getRole() + ")");
    }
}
