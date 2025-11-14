package com.lot86.practice_app_backend.repo;

import com.lot86.practice_app_backend.entity.EmailVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface EmailVerificationRepository extends JpaRepository<EmailVerification, UUID> {

    // 유효한(사용되지 않았고, 만료되지 않은) 토큰 찾기
    @Query("SELECT e FROM EmailVerification e " +
            "WHERE e.token = :token " +
            "AND e.usedAt IS NULL " +
            "AND e.expiresAt > CURRENT_TIMESTAMP")
    Optional<EmailVerification> findActiveToken(@Param("token") String token);
}
