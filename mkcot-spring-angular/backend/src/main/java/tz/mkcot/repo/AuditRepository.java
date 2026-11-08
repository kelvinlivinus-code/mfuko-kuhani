package tz.mkcot.repo;

import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import tz.mkcot.model.AuditEntry;

public interface AuditRepository extends JpaRepository<AuditEntry, Long> {
    List<AuditEntry> findAllByOrderByAtDesc(Pageable page);

    @Modifying
    @Query("delete from AuditEntry a where a.at < ?1")
    int deleteOlderThan(OffsetDateTime cutoff);
}
