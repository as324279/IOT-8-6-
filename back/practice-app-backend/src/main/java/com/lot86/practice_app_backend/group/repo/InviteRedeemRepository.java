package com.lot86.practice_app_backend.group.repo;

import com.lot86.practice_app_backend.group.entity.InviteRedeem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface InviteRedeemRepository extends JpaRepository<InviteRedeem, UUID> {
}
