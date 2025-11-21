package com.lot86.practice_app_backend.shopping.repo;

import com.lot86.practice_app_backend.shopping.entity.PurchaseHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface PurchaseHistoryRepository extends JpaRepository<PurchaseHistory, UUID> {
}