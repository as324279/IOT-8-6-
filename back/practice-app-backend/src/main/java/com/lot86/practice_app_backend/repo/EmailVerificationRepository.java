package com.lot86.practice_app_backend.repo;

import com.lot86.practice_app_backend.entity.EmailVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.UUID;

public interface EmailVerificationRepository extends JpaRepository<EmailVerification, UUID> {

    @Query("""
        SELECT ev FROM EmailVerification ev
        WHERE ev.token = :token
          AND ev.usedAt IS NULL
          AND ev.expiresAt > CURRENT_TIMESTAMP
    """)
    Optional<EmailVerification> findActiveToken(String token);

    Optional<EmailVerification> findTopByUserIdOrderByCreatedAtDesc(UUID userId);
}
