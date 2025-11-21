package com.lot86.practice_app_backend.shopping.repo;

import com.lot86.practice_app_backend.shopping.entity.ShoppingItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ShoppingItemRepository extends JpaRepository<ShoppingItem, UUID> {
    // 특정 리스트에 속한 아이템 목록 조회
    List<ShoppingItem> findByShoppingList_ListId(UUID listId);
}