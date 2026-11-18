package tz.mkcot.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import tz.mkcot.model.Meeting;

public interface MeetingRepository extends JpaRepository<Meeting, String> {
}
