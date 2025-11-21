package com.lot86.practice_app_backend.inventory.repo;

import com.lot86.practice_app_backend.inventory.entity.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ItemRepository extends JpaRepository<Item, UUID> {
    // 그룹 내 모든 아이템 조회 (최신순 정렬)
    List<Item> findByGroup_GroupIdOrderByCreatedAtDesc(UUID groupId);

    // (옵션) 유통기한 임박 상품 조회 로직 등을 나중에 추가할 수 있습니다.
}