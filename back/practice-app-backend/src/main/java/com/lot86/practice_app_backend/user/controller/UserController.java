package com.lot86.practice_app_backend.user.controller;

import com.lot86.practice_app_backend.common.ApiResponse;
import com.lot86.practice_app_backend.user.dto.*;
import com.lot86.practice_app_backend.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    private UUID getCurrentUserId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("로그인이 필요합니다.");
        }
        return (UUID) authentication.getPrincipal();
    }

    // 1. 내 프로필 조회
    @GetMapping("/me")
    public ApiResponse<UserProfileResponse> getMyProfile(Authentication authentication) {
        return ApiResponse.ok(userService.getProfile(getCurrentUserId(authentication)));
    }

    // 2. 내 프로필 수정 (이름, 사진)
    @PatchMapping("/me")
    public ApiResponse<UserProfileResponse> updateMyProfile(
            @RequestBody @Valid UserProfileUpdateRequest request,
            Authentication authentication
    ) {
        return ApiResponse.ok(userService.updateProfile(getCurrentUserId(authentication), request));
    }

    // 3. 비밀번호 변경
    @PutMapping("/me/password")
    public ApiResponse<Void> changePassword(
            @RequestBody @Valid PasswordChangeRequest request,
            Authentication authentication
    ) {
        userService.changePassword(getCurrentUserId(authentication), request);
        return ApiResponse.ok(null);
    }

    // 4. 회원 탈퇴
    @PostMapping("/me/withdraw")
    public ApiResponse<Void> withdraw(
            @RequestBody @Valid AccountDeleteRequest request,
            Authentication authentication
    ) {
        userService.deleteAccount(getCurrentUserId(authentication), request.getPassword());
        return ApiResponse.ok(null);
    }
}