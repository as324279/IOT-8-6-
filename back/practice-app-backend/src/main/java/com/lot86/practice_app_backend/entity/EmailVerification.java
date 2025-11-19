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

    // ✅ v1.1 스키마: user_id 컬럼 존재
    @Column(name = "user_id", nullable = false, columnDefinition = "uuid")
    private UUID userId;

    // ✅ v1.1 스키마: token TEXT NOT NULL UNIQUE
    @Column(name = "token", nullable = false)
    private String token;   // 6자리 코드 그대로 저장

    @Column(name = "purpose", nullable = false, length = 20)
    private String purpose; // 'verify_email','reset_password','change_email'

    @Column(name = "new_email")
    private String newEmail; // 필요 없으면 안 써도 됨

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

    public boolean isExpired() {
        return expiresAt != null && expiresAt.isBefore(OffsetDateTime.now(ZoneOffset.UTC));
    }

    public boolean isUsed() {
        return usedAt != null;
    }
}
