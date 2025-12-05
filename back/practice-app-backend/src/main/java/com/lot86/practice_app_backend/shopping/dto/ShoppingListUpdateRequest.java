package com.lot86.practice_app_backend.shopping.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ShoppingListUpdateRequest {
    @NotBlank(message = "제목은 필수입니다.")
    private String title;
}