package tz.mkcot.service;

import java.time.OffsetDateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tz.mkcot.model.AuditEntry;
import tz.mkcot.repo.AuditRepository;
import tz.mkcot.security.ClientIp;
import tz.mkcot.security.CurrentUser;

/** Inaandika kumbukumbu za ukaguzi (audit log). Kosa la kuandika halizuii kazi kuu. */
@Service
public class AuditService {
    private static final Logger log = LoggerFactory.getLogger(AuditService.class);
    private final AuditRepository repo;

    public AuditService(AuditRepository repo) {
        this.repo = repo;
    }

    public void log(CurrentUser u, String action, String target, String targetId, String detail) {
        log(u == null ? null : u.id(), u == null ? null : u.email(), action, target, targetId, detail);
    }

    public void log(String userId, String email, String action, String target, String targetId, String detail) {
        try {
            AuditEntry e = new AuditEntry();
            e.setAt(OffsetDateTime.now());
            e.setUserId(userId);
            e.setUserEmail(cut(email, 200));
            e.setAction(cut(action, 40));
            e.setTarget(cut(target, 40));
            e.setTargetId(cut(targetId, 40));
            e.setIp(ClientIp.current());
            e.setDetail(cut(detail, 500));
            repo.save(e);
        } catch (RuntimeException ex) {
            log.warn("Audit log haikuandikwa: {}", ex.getMessage());
        }
    }

    /** Kila siku saa 9 usiku: futa kumbukumbu za ukaguzi zenye zaidi ya miaka 2. */
    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void prune() {
        repo.deleteOlderThan(OffsetDateTime.now().minusYears(2));
    }

    private static String cut(String s, int n) {
        return s == null ? null : (s.length() > n ? s.substring(0, n) : s);
    }
}
