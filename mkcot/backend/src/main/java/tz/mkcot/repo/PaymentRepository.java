package tz.mkcot.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import tz.mkcot.model.Payment;

public interface PaymentRepository extends JpaRepository<Payment, String> {
}
