package tz.mkcot.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import tz.mkcot.model.LedgerEntry;

public interface LedgerEntryRepository extends JpaRepository<LedgerEntry, String> {
}
