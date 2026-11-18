package tz.mkcot.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import tz.mkcot.model.Member;

public interface MemberRepository extends JpaRepository<Member, String> {
}
