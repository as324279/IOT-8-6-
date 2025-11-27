package com.lot86.practice_app_backend.inventory.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StorageLocationCreateRequest {
    @NotBlank(message = "보관 장소 이름은 필수입니다.")
    private String name;

    // 기본값 OTHER (FRIDGE, FREEZER, ROOM_TEMP, PANTRY, OTHER)
    private String storageType = "OTHER";
}