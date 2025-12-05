package com.lot86.practice_app_backend.shopping.repo;

import com.lot86.practice_app_backend.shopping.entity.ShoppingComment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ShoppingCommentRepository extends JpaRepository<ShoppingComment, UUID> {
    List<ShoppingComment> findByShoppingList_ListIdOrderByCreatedAtAsc(UUID listId);
}