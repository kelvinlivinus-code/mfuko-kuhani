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

    public UserController(AppUserRepository users, Permissions perms, org.springframework.security.crypto.password.PasswordEncoder encoder) {
        this.users = users;
        this.perms = perms;
        this.encoder = encoder;
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
        perms.requireAdmin(CurrentUser.get());
        if (req.password() == null || req.password().length() < 8) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Neno la siri liwe na herufi 8 au zaidi.");
        }
        AppUser u = users.findById(id).orElseThrow(Permissions::notFound);
        u.setPasswordHash(encoder.encode(req.password()));
        users.save(u);
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
        users.deleteById(id);
    }
}
