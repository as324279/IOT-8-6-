package com.lot86.practice_app_backend.group.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GroupJoinByCodeRequest {

    @NotBlank(message = "초대 코드는 필수입니다.")
    private String code;
}
