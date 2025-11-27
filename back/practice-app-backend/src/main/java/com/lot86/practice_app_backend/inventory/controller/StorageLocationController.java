package com.lot86.practice_app_backend.inventory.controller;

import com.lot86.practice_app_backend.common.ApiResponse;
import com.lot86.practice_app_backend.inventory.dto.StorageLocationCreateRequest;
import com.lot86.practice_app_backend.inventory.dto.StorageLocationResponse;
import com.lot86.practice_app_backend.inventory.service.StorageLocationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class StorageLocationController {

    private final StorageLocationService locationService;

    // 1. 보관 장소(방) 생성
    // POST /api/v1/groups/{groupId}/locations
    @PostMapping("/groups/{groupId}/locations")
    public ApiResponse<StorageLocationResponse> createLocation(
            @PathVariable UUID groupId,
            @RequestBody @Valid StorageLocationCreateRequest request
    ) {
        return ApiResponse.ok(locationService.createLocation(groupId, request));
    }

    // 2. 보관 장소 목록 조회
    // GET /api/v1/groups/{groupId}/locations
    @GetMapping("/groups/{groupId}/locations")
    public ApiResponse<List<StorageLocationResponse>> getLocations(@PathVariable UUID groupId) {
        return ApiResponse.ok(locationService.getGroupLocations(groupId));
    }

    // 3. 보관 장소 삭제
    // DELETE /api/v1/locations/{locationId}
    @DeleteMapping("/locations/{locationId}")
    public ApiResponse<Void> deleteLocation(@PathVariable UUID locationId) {
        locationService.deleteLocation(locationId);
        return ApiResponse.ok(null);
    }
}