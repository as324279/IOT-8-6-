package com.lot86.practice_app_backend.repo;

import com.lot86.practice_app_backend.entity.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface AppUserRepository extends JpaRepository<AppUser, UUID> {
    Optional<AppUser> findByEmailIgnoreCase(String email);

    // [신규] 이메일 중복 가입 방지용 체크 메소드
    boolean existsByEmailIgnoreCase(String email);
}