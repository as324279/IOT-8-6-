package com.lot86.practice_app_backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@NoArgsConstructor
@Table(name = "app_user")
public class AppUser {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "email", nullable = false, length = 320)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(nullable = false, length = 30)
    private String name;

    @Column(name = "profile_image")
    private String profileImage;

    // [변경] 팀원 스키마 반영: 이메일 인증 여부를 저장하는 컬럼 추가
    // 회원가입 시 인증을 완료하고 들어오므로, 가입 시점에는 true로 설정됨
    @Column(name = "email_verified", nullable = false)
    private boolean emailVerified = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    public AppUser(String email, String passwordHash, String name) {
        this.userId = UUID.randomUUID();
        this.email = email;
        this.passwordHash = passwordHash;
        this.name = name;
        this.emailVerified = false;
    }

    @PrePersist
    public void prePersist() {
        if (this.userId == null) {
            this.userId = UUID.randomUUID();
        }
        normalizeEmail();
    }

    @PreUpdate
    public void preUpdate() {
        normalizeEmail();
    }

    private void normalizeEmail() {
        if (this.email != null) {
            this.email = this.email.trim().toLowerCase();
        }
    }
}