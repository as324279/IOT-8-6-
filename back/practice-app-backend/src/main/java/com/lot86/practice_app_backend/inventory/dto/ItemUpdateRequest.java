package com.lot86.practice_app_backend.inventory.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class ItemUpdateRequest {
    // 이름, 카테고리, 위치 등을 수정할 수 있음
    private String name;
    private String categoryName;
    private String locationName;

    private BigDecimal quantity;
    private String unit;
    private LocalDate expiryDate;
    private BigDecimal minThreshold;
    private String status; // ACTIVE, DEPLETED 등 상태 변경 가능

    private String photoUrl;
    private String barcode;
}