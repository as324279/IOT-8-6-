package com.lot86.practice_app_backend.shopping.dto;

import com.lot86.practice_app_backend.shopping.entity.ShoppingList;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@AllArgsConstructor
public class ShoppingListResponse {
    private UUID listId;
    private String title;
    private String status;
    private OffsetDateTime createdAt;
    private List<ShoppingItemResponse> items; // 아이템 목록 포함

    public static ShoppingListResponse fromEntity(ShoppingList list, List<ShoppingItemResponse> items) {
        return new ShoppingListResponse(
                list.getListId(),
                list.getTitle(),
                list.getStatus(),
                list.getCreatedAt(),
                items
        );
    }
}