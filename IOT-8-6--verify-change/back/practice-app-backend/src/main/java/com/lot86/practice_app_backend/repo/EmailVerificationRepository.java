package com.lot86.practice_app_backend.repo;

import com.lot86.practice_app_backend.entity.EmailVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface EmailVerificationRepository extends JpaRepository<EmailVerification, UUID> {

    // [신규] 특정 이메일로 발송된 최신 인증 코드를 조회 (재전송 고려하여 최신순 정렬)
    Optional<EmailVerification> findTopByEmailAndPurposeOrderByCreatedAtDesc(String email, String purpose);
}