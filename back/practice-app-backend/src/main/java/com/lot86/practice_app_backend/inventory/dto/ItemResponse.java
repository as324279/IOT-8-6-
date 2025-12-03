package com.lot86.practice_app_backend.inventory.dto;

import com.lot86.practice_app_backend.inventory.entity.Item;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@AllArgsConstructor
public class ItemResponse {
    private UUID itemId;
    private String name;
    private String categoryName;

    private String locationName;
    private UUID locationId; // [추가] 방 식별을 위한 ID

    private BigDecimal quantity;
    private String unit;
    private LocalDate expiryDate;
    private String status;
    private byte[] photoBytes;

    public static ItemResponse fromEntity(Item item) {
        return new ItemResponse(
                item.getItemId(),
                item.getName(),
                item.getCategory() != null ? item.getCategory().getName() : null,
                item.getLocation() != null ? item.getLocation().getName() : null,
                item.getLocation() != null ? item.getLocation().getLocationId() : null, // [추가] ID 반환
                item.getQuantity(),
                item.getUnit(),
                item.getExpiryDate(),
                item.getStatus(),
                item.getPhotoBytes()//사진 저장용 타입 변환
        );
    }
}