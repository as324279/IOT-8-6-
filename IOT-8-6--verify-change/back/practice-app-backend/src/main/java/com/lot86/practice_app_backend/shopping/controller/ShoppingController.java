package com.lot86.practice_app_backend.shopping.controller;

import com.lot86.practice_app_backend.common.ApiResponse;
import com.lot86.practice_app_backend.shopping.dto.*;
import com.lot86.practice_app_backend.shopping.service.ShoppingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ShoppingController {

    private final ShoppingService shoppingService;

    private UUID getCurrentUserId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("로그인이 필요합니다.");
        }
        return (UUID) authentication.getPrincipal();
    }

    // 1. 쇼핑 리스트 생성
    @PostMapping("/groups/{groupId}/shopping-lists")
    public ApiResponse<ShoppingListResponse> createList(
            @PathVariable UUID groupId,
            @RequestBody @Valid ShoppingListCreateRequest request,
            Authentication authentication
    ) {
        UUID userId = getCurrentUserId(authentication);
        return ApiResponse.ok(shoppingService.createList(groupId, userId, request));
    }

    // 2. 그룹의 쇼핑 리스트 목록 조회
    @GetMapping("/groups/{groupId}/shopping-lists")
    public ApiResponse<List<ShoppingListResponse>> getLists(@PathVariable UUID groupId) {
        return ApiResponse.ok(shoppingService.getGroupLists(groupId));
    }

    // 3. 리스트에 항목 추가
    @PostMapping("/shopping-lists/{listId}/items")
    public ApiResponse<ShoppingItemResponse> addItem(
            @PathVariable UUID listId,
            @RequestBody @Valid ShoppingItemAddRequest request,
            Authentication authentication
    ) {
        UUID userId = getCurrentUserId(authentication);
        return ApiResponse.ok(shoppingService.addItem(listId, userId, request));
    }

    // 4. 항목 구매 완료 (체크)
    @PatchMapping("/shopping-items/{itemRowId}/purchase")
    public ApiResponse<Void> purchaseItem(
            @PathVariable UUID itemRowId,
            Authentication authentication
    ) {
        UUID userId = getCurrentUserId(authentication);
        shoppingService.purchaseItem(itemRowId, userId);
        return ApiResponse.ok(null);
    }

    // 5. 항목 삭제
    @DeleteMapping("/shopping-items/{itemRowId}")
    public ApiResponse<Void> deleteItem(@PathVariable UUID itemRowId) {
        shoppingService.deleteItem(itemRowId);
        return ApiResponse.ok(null);
    }
}