package com.lot86.practice_app_backend.inventory.repo;

import com.lot86.practice_app_backend.inventory.entity.ItemEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface ItemEventRepository extends JpaRepository<ItemEvent, UUID> {
    // 추후 특정 아이템의 이력을 조회할 때 사용 가능
    // List<ItemEvent> findByItem_ItemIdOrderByCreatedAtDesc(UUID itemId);
}