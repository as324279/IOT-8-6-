package com.lot86.practice_app_backend.group.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GroupUpdateRequest {
    @NotBlank(message = "변경할 그룹 이름은 필수입니다.")
    @Size(max = 100, message = "그룹 이름은 최대 100자까지 가능합니다.")
    private String name;
}