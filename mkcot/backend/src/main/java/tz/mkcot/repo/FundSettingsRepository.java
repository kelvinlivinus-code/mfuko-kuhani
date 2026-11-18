package tz.mkcot.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import tz.mkcot.model.FundSettings;

public interface FundSettingsRepository extends JpaRepository<FundSettings, Integer> {
}
