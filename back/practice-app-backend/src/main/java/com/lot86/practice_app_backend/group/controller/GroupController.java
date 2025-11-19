package com.lot86.practice_app_backend.group.controller;

import com.lot86.practice_app_backend.common.ApiResponse;
import com.lot86.practice_app_backend.group.dto.*;
import com.lot86.practice_app_backend.group.entity.AppGroup;
import com.lot86.practice_app_backend.group.service.GroupService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;

    /** 현재 로그인한 유저의 UUID 가져오기 (편하게 Authentication에서 바로 꺼냄) */
    private UUID getCurrentUserId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("로그인이 필요합니다.");
        }
        return (UUID) authentication.getPrincipal();
    }

    /** 0) 그룹 생성  (POST /api/v1/groups) */
    @PostMapping
    public ResponseEntity<ApiResponse<GroupCreateResponse>> createGroup(
            @RequestBody GroupCreateRequest requestDto,
            Authentication authentication
    ) {
        UUID currentUserId = getCurrentUserId(authentication);

        AppGroup group = groupService.createGroup(requestDto, currentUserId);
        GroupCreateResponse responseDto = GroupCreateResponse.fromEntity(group);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok(responseDto));
    }

    /** 1) 초대코드 생성  (POST /api/v1/groups/{groupId}/invites) */
    @PostMapping("/{groupId}/invites")
    public ApiResponse<GroupInviteCreateResponse> createInvite(
            @PathVariable UUID groupId,
            Authentication authentication
    ) {
        UUID currentUserId = getCurrentUserId(authentication);
        GroupInviteCreateResponse resp = groupService.createInvite(groupId, currentUserId);
        return ApiResponse.ok(resp);
    }

    /** 2) 초대코드 검증  (GET /api/v1/groups/invites/check?code=XXXX) */
    @GetMapping("/invites/check")
    public ApiResponse<GroupInviteCheckResponse> checkInvite(@RequestParam("code") String code) {
        GroupInviteCheckResponse resp = groupService.checkInviteCode(code);
        return ApiResponse.ok(resp);
    }

    /** 3) 초대코드로 그룹 가입  (POST /api/v1/groups/join) */
    @PostMapping("/join")
    public ApiResponse<Void> joinByCode(
            @Valid @RequestBody GroupJoinByCodeRequest request,
            Authentication authentication
    ) {
        UUID currentUserId = getCurrentUserId(authentication);
        groupService.joinGroupByCode(request.getCode(), currentUserId);
        return ApiResponse.ok(null);
    }

    /** 4) 그룹 멤버 목록 조회  (GET /api/v1/groups/{groupId}/members) */
    @GetMapping("/{groupId}/members")
    public ApiResponse<List<GroupMemberResponse>> getMembers(
            @PathVariable UUID groupId,
            Authentication authentication
    ) {
        UUID currentUserId = getCurrentUserId(authentication);
        List<GroupMemberResponse> members = groupService.getGroupMembers(groupId, currentUserId);
        return ApiResponse.ok(members);
    }

    /** 5) 그룹 탈퇴 (본인)  (DELETE /api/v1/groups/{groupId}/members/me) */
    @DeleteMapping("/{groupId}/members/me")
    public ApiResponse<Void> leaveGroup(
            @PathVariable UUID groupId,
            Authentication authentication
    ) {
        UUID currentUserId = getCurrentUserId(authentication);
        groupService.leaveGroup(groupId, currentUserId);
        return ApiResponse.ok(null);
    }
}
