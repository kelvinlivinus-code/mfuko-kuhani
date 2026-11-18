package tz.mkcot.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import tz.mkcot.model.SupportEvent;

public interface SupportEventRepository extends JpaRepository<SupportEvent, String> {
}
