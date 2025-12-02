package com.lot86.practice_app_backend.inventory.controller;

import com.lot86.practice_app_backend.common.ApiResponse;
import com.lot86.practice_app_backend.inventory.dto.ItemCreateRequest;
import com.lot86.practice_app_backend.inventory.dto.ItemResponse;
import com.lot86.practice_app_backend.inventory.dto.ItemUpdateRequest;
import com.lot86.practice_app_backend.inventory.service.ItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ItemController {

    private final ItemService itemService;

    private UUID getCurrentUserId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("로그인이 필요합니다.");
        }
        return (UUID) authentication.getPrincipal();
    }

    // 1. 물품 등록
    // POST /api/v1/groups/{groupId}/items
    @PostMapping("/groups/{groupId}/items")
    public ApiResponse<ItemResponse> createItem(
            @PathVariable UUID groupId,
            @RequestBody @Valid ItemCreateRequest request,
            Authentication authentication
    ) {
        UUID userId = getCurrentUserId(authentication);
        ItemResponse response = itemService.createItem(groupId, userId, request);
        return ApiResponse.ok(response);
    }

    // 2. 그룹 물품 목록 조회
    // GET /api/v1/groups/{groupId}/items
    @GetMapping("/groups/{groupId}/items")
    public ApiResponse<List<ItemResponse>> getGroupItems(@PathVariable UUID groupId) {
        List<ItemResponse> items = itemService.getGroupItems(groupId);
        return ApiResponse.ok(items);
    }

    // 3. 물품 상세 조회
    // GET /api/v1/items/{itemId}
    @GetMapping("/items/{itemId}")
    public ApiResponse<ItemResponse> getItem(@PathVariable UUID itemId) {
        ItemResponse item = itemService.getItemDetail(itemId);
        return ApiResponse.ok(item);
    }

    // 4. 물품 삭제 (수정됨: 이력 기록을 위해 userId 전달)
    // DELETE /api/v1/items/{itemId}
    @DeleteMapping("/items/{itemId}")
    public ApiResponse<Void> deleteItem(
            @PathVariable UUID itemId,
            Authentication authentication // [추가] 인증 정보 받기
    ) {
        UUID userId = getCurrentUserId(authentication); // [추가] 사용자 ID 추출

        // 기존 deleteItem(itemId) 대신 이력 저장 기능이 있는 메서드 호출
        itemService.deleteItemWithHistory(itemId, userId);

        return ApiResponse.ok(null);
    }

    // 5. 물품 수정
    // PUT /api/v1/items/{itemId}
    @PutMapping("/items/{itemId}")
    public ApiResponse<ItemResponse> updateItem(
            @PathVariable UUID itemId,
            @RequestBody ItemUpdateRequest request,
            Authentication authentication
    ) {
        UUID userId = getCurrentUserId(authentication);
        ItemResponse response = itemService.updateItem(itemId, userId, request);
        return ApiResponse.ok(response);
    }

    // [추가] 6. 특정 방(Location) 안의 물품 조회
    // GET /api/v1/locations/{locationId}/items
    @GetMapping("/locations/{locationId}/items")
    public ApiResponse<List<ItemResponse>> getLocationItems(@PathVariable UUID locationId) {
        return ApiResponse.ok(itemService.getLocationItems(locationId));
    }
}