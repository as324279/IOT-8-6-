package com.lot86.practice_app_backend.shopping.repo;

import com.lot86.practice_app_backend.shopping.entity.ShoppingList;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ShoppingListRepository extends JpaRepository<ShoppingList, UUID> {
    // 그룹별 쇼핑 리스트 조회 (최신순)
    List<ShoppingList> findByGroup_GroupIdOrderByCreatedAtDesc(UUID groupId);
}