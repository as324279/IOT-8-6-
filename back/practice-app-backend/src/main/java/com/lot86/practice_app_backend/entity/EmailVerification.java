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

    @Column(name = "user_id", nullable = false, columnDefinition = "uuid")
    private UUID userId;

    // ✅ 6자리 숫자 코드용 컬럼 (unique는 제거: 우연히 중복될 수 있으니까)
    @Column(name = "token", nullable = false, length = 6)
    private String token;   // 예: "123456"

    @Column(name = "purpose", nullable = false, length = 20)
    private String purpose; // 'verify_email','reset_password','change_email'

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
    }

    // (선택) 사용/만료 편의 메소드
    public boolean isExpired() {
        return expiresAt != null && expiresAt.isBefore(OffsetDateTime.now(ZoneOffset.UTC));
    }

    public boolean isUsed() {
        return usedAt != null;
    }
}
