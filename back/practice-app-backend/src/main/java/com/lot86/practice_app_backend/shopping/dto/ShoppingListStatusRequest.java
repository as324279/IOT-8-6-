package com.lot86.practice_app_backend.shopping.dto;

import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ShoppingListStatusRequest {
    // 허용되는 값만 입력받도록 검증
    @Pattern(regexp = "^(DRAFT|CONFIRMED|ORDERED|CLOSED)$", message = "잘못된 상태 값입니다.")
    private String status;
}