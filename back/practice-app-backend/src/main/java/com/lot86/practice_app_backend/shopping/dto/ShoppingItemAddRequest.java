package com.lot86.practice_app_backend.shopping.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
public class ShoppingItemAddRequest {

    @NotBlank(message = "상품 이름은 필수입니다.")
    private String itemName;

    @NotNull(message = "수량은 필수입니다.")
    @Min(value = 0, message = "수량은 0보다 커야 합니다.")
    private BigDecimal desiredQty;

    private String unit = "ea";

    // (선택) 기존 재고 아이템과 연결하려면 ID를 보냄
    private UUID linkedItemId;
    // [변경] 방 ID로 자동 연결 이름 대신 ID 사용
    // 프론트에서 현재 방의 ID를 보내면됨.
    private UUID locationId;

    private String note; // [추가] 메모 필드2025.11.21 ㅇㅅㅂ
}