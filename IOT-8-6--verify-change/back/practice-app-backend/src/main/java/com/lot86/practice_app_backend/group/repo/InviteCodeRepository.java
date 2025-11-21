package com.lot86.practice_app_backend.group.repo;

import com.lot86.practice_app_backend.group.entity.InviteCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface InviteCodeRepository extends JpaRepository<InviteCode, UUID> {

    Optional<InviteCode> findByCode(String code);
}
