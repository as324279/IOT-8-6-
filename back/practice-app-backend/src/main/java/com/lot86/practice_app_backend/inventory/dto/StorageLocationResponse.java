package com.lot86.practice_app_backend.inventory.dto;

import com.lot86.practice_app_backend.inventory.entity.StorageLocation;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.UUID;

@Getter
@AllArgsConstructor
public class StorageLocationResponse {
    private UUID locationId;
    private String name;
    private String storageType;

    public static StorageLocationResponse fromEntity(StorageLocation location) {
        return new StorageLocationResponse(
                location.getLocationId(),
                location.getName(),
                location.getStorageType()
        );
    }
}