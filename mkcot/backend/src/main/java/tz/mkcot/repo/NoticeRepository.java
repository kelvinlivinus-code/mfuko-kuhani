package tz.mkcot.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import tz.mkcot.model.Notice;

public interface NoticeRepository extends JpaRepository<Notice, String> {
}
