package com.lot86.practice_app_backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

@Entity
@Table(name = "email_verification")
@Getter
@Setter
@NoArgsConstructor
public class EmailVerification {

    @Id
    @Column(name = "token_id", columnDefinition = "uuid")
    private UUID id;

    // [변경] 기존 userId -> email로 변경 (가입 전 인증이므로 유저 ID가 없음)
    @Column(name = "email", nullable = false, length = 320)
    private String email;

    // [변경] 인증 코드 (6자리 숫자) 저장
    @Column(name = "token", nullable = false)
    private String token;

    @Column(name = "purpose", nullable = false, length = 20)
    private String purpose;

    @Column(name = "new_email")
    private String newEmail;

    @Column(name = "expires_at", nullable = false)
    private OffsetDateTime expiresAt;

    @Column(name = "used_at")
    private OffsetDateTime usedAt;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (id == null) id = UUID.randomUUID();
        if (createdAt == null) createdAt = OffsetDateTime.now(ZoneOffset.UTC);
        if (email != null) email = email.trim().toLowerCase();
    }

    public boolean isExpired() {
        return expiresAt != null && expiresAt.isBefore(OffsetDateTime.now(ZoneOffset.UTC));
    }

    public boolean isUsed() {
        return usedAt != null;
    }

    // [신규] 인증 완료 시 시각 기록
    public void markUsed() {
        this.usedAt = OffsetDateTime.now(ZoneOffset.UTC);
    }
}