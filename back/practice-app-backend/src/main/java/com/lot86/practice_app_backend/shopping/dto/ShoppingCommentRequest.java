package com.lot86.practice_app_backend.shopping.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ShoppingCommentRequest {
    @NotBlank(message = "내용을 입력해주세요.")
    private String body;
}