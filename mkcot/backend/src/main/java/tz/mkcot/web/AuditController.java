package tz.mkcot.web;

import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import tz.mkcot.model.AuditEntry;
import tz.mkcot.model.Roles;
import tz.mkcot.repo.AuditRepository;
import tz.mkcot.security.CurrentUser;
import tz.mkcot.service.Permissions;

/** Msimamizi na Mkaguzi wanaona kumbukumbu za ukaguzi (nani alibadilisha nini). */
@RestController
@RequestMapping("/api/audit")
public class AuditController {
    private final AuditRepository repo;

    public AuditController(AuditRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<AuditEntry> list(@RequestParam(defaultValue = "200") int limit) {
        CurrentUser u = CurrentUser.get();
        if (!Roles.MSIMAMIZI.equals(u.role()) && !Roles.MSOMAJI.equals(u.role())) {
            throw Permissions.forbidden();
        }
        return repo.findAllByOrderByAtDesc(PageRequest.of(0, Math.max(1, Math.min(limit, 1000))));
    }
}
