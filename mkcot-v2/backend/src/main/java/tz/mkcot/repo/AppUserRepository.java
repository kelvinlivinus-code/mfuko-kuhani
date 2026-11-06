package tz.mkcot.repo;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import tz.mkcot.model.AppUser;

public interface AppUserRepository extends JpaRepository<AppUser, String> {
    Optional<AppUser> findByEmailIgnoreCase(String email);
}
