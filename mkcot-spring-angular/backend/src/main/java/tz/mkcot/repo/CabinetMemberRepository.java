package tz.mkcot.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import tz.mkcot.model.CabinetMember;

public interface CabinetMemberRepository extends JpaRepository<CabinetMember, String> {
}
