package com.lot86.practice_app_backend.user.dto;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserProfileUpdateRequest {
    @Size(min = 1, max = 30, message = "이름은 1자 이상 30자 이하이어야 합니다.")
    private String name;

    // [수정] String -> byte[]
    private byte[] profileImage;
}