package com.lot86.practice_app_backend.user.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AccountDeleteRequest {
    @NotBlank(message = "비밀번호를 입력해주세요.")
    private String password;
}