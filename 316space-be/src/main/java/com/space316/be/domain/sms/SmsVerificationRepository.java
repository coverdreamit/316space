package com.space316.be.domain.sms;

import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SmsVerificationRepository extends JpaRepository<SmsVerification, Long> {

    Optional<SmsVerification> findTopByPhoneOrderByCreatedAtDesc(String phone);

    boolean existsByPhoneAndVerifiedTrueAndExpiresAtAfter(String phone, LocalDateTime now);
}
