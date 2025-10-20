package com.lot86.practice_app_backend.user;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Entity
@NoArgsConstructor // JPA는 기본 생성자가 꼭 필요해요!
@Table(name = "app_user") // DB의 'app_user' 테이블과 연결합니다.
public class User {

    @Id // 이 필드가 이 테이블의 대표(Primary Key)입니다.
    @GeneratedValue(strategy = GenerationType.UUID) // UUID는 DB에서 자동으로 생성됩니다.
    @Column(name = "user_id") // DB의 'user_id' 컬럼과 연결합니다.
    private UUID userId;

    @Column(unique = true, nullable = false) // 중복 불가, 필수값
    private String email;

    @Column(name = "password_hash", nullable = false) // DB의 'password_hash' 컬럼
    private String passwordHash;

    @Column(nullable = false, length = 30) // 필수값, 길이 30자 제한
    private String name;

    @Column(name = "profile_image")
    private String profileImage;

    @Column(name = "email_verified", nullable = false)
    private boolean emailVerified = false; // 기본값은 false로 설정

    @CreationTimestamp // 데이터가 처음 생성될 때 자동으로 시간이 찍힙니다.
    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp // 데이터가 수정될 때마다 자동으로 시간이 찍힙니다.
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    // 회원가입 시 사용할 생성자
    public User(String email, String passwordHash, String name) {
        this.email = email;
        this.passwordHash = passwordHash;
        this.name = name;
    }
}