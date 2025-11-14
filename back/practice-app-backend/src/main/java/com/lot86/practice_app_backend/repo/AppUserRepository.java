package com.lot86.practice_app_backend.repo;

import com.lot86.practice_app_backend.entity.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

// JpaRepository<어떤 테이블을, 그 테이블의 ID 타입은>
public interface AppUserRepository extends JpaRepository<AppUser, UUID> {

    // 'findBy' + '필드이름' 으로 메소드를 만들면
    // Spring Data JPA가 알아서 이메일로 사용자를 찾아주는 SQL을 자동으로 만들어줍니다.
    // "SELECT * FROM app_user WHERE email = ?"
    Optional<AppUser> findByEmail(String email);

}