package tz.mkcot.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import tz.mkcot.model.Loan;

public interface LoanRepository extends JpaRepository<Loan, String> {
}
