package com.lot86.practice_app_backend.shopping.dto;

import com.lot86.practice_app_backend.shopping.entity.ShoppingItem;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@AllArgsConstructor
public class ShoppingItemResponse {
    private UUID itemRowId;
    private String itemName;
    private BigDecimal desiredQty;
    private String unit;
    private String status; // PENDING, PURCHASED
    private boolean isLinked; // 재고 연동 여부
    private String note;//  메모 포함

    public static ShoppingItemResponse fromEntity(ShoppingItem item) {
        return new ShoppingItemResponse(
                item.getItemRowId(),
                item.getItemName(),
                item.getDesiredQty(),
                item.getUnit(),
                item.getStatus(),
                item.getLinkedItem() != null,
                item.getNote()
        );
    }
}