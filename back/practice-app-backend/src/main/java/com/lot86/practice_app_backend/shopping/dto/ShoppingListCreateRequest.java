package com.lot86.practice_app_backend.shopping.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ShoppingListCreateRequest {
    @NotBlank(message = "쇼핑 리스트 제목은 필수입니다.")
    private String title;
}