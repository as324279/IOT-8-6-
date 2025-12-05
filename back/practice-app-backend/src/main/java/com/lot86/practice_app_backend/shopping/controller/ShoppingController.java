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

    // 6. 쇼핑리스트 상태 변경 (확정/종료 등)
    // PATCH /api/v1/shopping-lists/{listId}/status
    @PatchMapping("/shopping-lists/{listId}/status")
    public ApiResponse<ShoppingListResponse> updateStatus(
            @PathVariable UUID listId,
            @RequestBody @Valid ShoppingListStatusRequest request,
            Authentication authentication
    ) {
        UUID userId = getCurrentUserId(authentication);
        return ApiResponse.ok(shoppingService.updateListStatus(listId, userId, request.getStatus()));
    }

    // 7. 그룹 내 아이템 바로 조회
    @GetMapping("/groups/{groupId}/shopping-items")
    public ApiResponse<List<ShoppingItemResponse>> getGroupItems(@PathVariable UUID groupId) {
        return ApiResponse.ok(shoppingService.getAllItemsInGroup(groupId));
    }

    // 8. 그룹에 아이템 바로 추가
    @PostMapping("/groups/{groupId}/shopping-items")
    public ApiResponse<ShoppingItemResponse> addItemToGroup(
            @PathVariable UUID groupId,
            @RequestBody @Valid ShoppingItemAddRequest request,
            Authentication authentication
    ) {
        UUID userId = getCurrentUserId(authentication);
        return ApiResponse.ok(shoppingService.addItemToGroup(groupId, userId, request));
    }

    // 9. [추가] 댓글 작성
    @PostMapping("/shopping-lists/{listId}/comments")
    public ApiResponse<ShoppingCommentResponse> addComment(
            @PathVariable UUID listId,
            @RequestBody @Valid ShoppingCommentRequest request,
            Authentication authentication
    ) {
        UUID userId = getCurrentUserId(authentication);
        return ApiResponse.ok(shoppingService.addComment(listId, userId, request.getBody()));
    }

    // 10. [추가] 댓글 목록 조회
    @GetMapping("/shopping-lists/{listId}/comments")
    public ApiResponse<List<ShoppingCommentResponse>> getComments(@PathVariable UUID listId) {
        return ApiResponse.ok(shoppingService.getComments(listId));
    }

    // 11. [추가] 댓글 삭제
    @DeleteMapping("/shopping-comments/{commentId}")
    public ApiResponse<Void> deleteComment(
            @PathVariable UUID commentId,
            Authentication authentication
    ) {
        UUID userId = getCurrentUserId(authentication);
        shoppingService.deleteComment(commentId, userId);
        return ApiResponse.ok(null);
    }

    // 12. [추가] 항목 수정 (수량, 메모 등)
    @PatchMapping("/shopping-items/{itemRowId}")
    public ApiResponse<ShoppingItemResponse> updateItem(
            @PathVariable UUID itemRowId,
            @RequestBody ShoppingItemUpdateRequest request,
            Authentication authentication
    ) {
        UUID userId = getCurrentUserId(authentication);
        return ApiResponse.ok(shoppingService.updateItem(itemRowId, userId, request));
    }

    // 13. [추가] 쇼핑 리스트 제목 수정
    // PATCH /api/v1/shopping-lists/{listId}
    @PatchMapping("/shopping-lists/{listId}")
    public ApiResponse<ShoppingListResponse> updateListTitle(
            @PathVariable UUID listId,
            @RequestBody @Valid ShoppingListUpdateRequest request
    ) {
        return ApiResponse.ok(shoppingService.updateListTitle(listId, request.getTitle()));
    }

    // 14. [추가] 쇼핑 리스트 삭제
    // DELETE /api/v1/shopping-lists/{listId}
    @DeleteMapping("/shopping-lists/{listId}")
    public ApiResponse<Void> deleteList(@PathVariable UUID listId) {
        shoppingService.deleteList(listId);
        return ApiResponse.ok(null);
    }

}