package com.lot86.practice_app_backend.group.dto; // 패키지 경로는 실제 위치에 맞게 조절해줘.

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GroupCreateRequest {

    @NotBlank(message = "그룹 이름은 필수 입력값입니다.") // 요구사항: 그룹 이름 필수 입력
    @Size(max = 100, message = "그룹 이름은 최대 100자까지 가능합니다.") // DB 스키마 varchar(100) 반영
    private String name; // 그룹 이름 필드
}