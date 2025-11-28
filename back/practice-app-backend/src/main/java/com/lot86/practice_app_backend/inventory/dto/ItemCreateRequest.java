package com.lot86.practice_app_backend.inventory.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class ItemCreateRequest {

    @NotBlank(message = "물품 이름은 필수입니다.")
    private String name;

    // 사용자가 선택하거나 입력한 카테고리 이름 (예: "식품", "생활용품")
    private String categoryName;

    // 사용자가 선택하거나 입력한 보관장소 이름 (예: "냉장고", "펜트리")
    private String locationName;

    @NotNull(message = "수량은 필수입니다.")
    private BigDecimal quantity;

    private String unit = "ea"; // 기본값 개

    private LocalDate expiryDate; // 유통기한 (선택)

    private BigDecimal minThreshold; // 알림 설정용 최소 수량 (선택)

    private String photoUrl;
    private String barcode;
}