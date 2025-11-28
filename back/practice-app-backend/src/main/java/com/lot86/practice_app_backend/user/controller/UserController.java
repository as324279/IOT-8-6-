package com.lot86.practice_app_backend.user.controller;

import com.lot86.practice_app_backend.common.ApiResponse;
import com.lot86.practice_app_backend.user.EmailVerificationService; // [필수] import 추가
import com.lot86.practice_app_backend.user.dto.*;
import com.lot86.practice_app_backend.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * 사용자 개인 정보와 관련된 API를 처리하는 컨트롤러
 * (프로필, 비밀번호, 계정 탈퇴, 이메일 변경 등)
 */
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final EmailVerificationService emailVerificationService; // [필수] 주입 추가

    // 인증 정보에서 User UUID 추출 헬퍼
    private UUID getCurrentUserId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("로그인이 필요합니다.");
        }
        return (UUID) authentication.getPrincipal();
    }

    /**
     * 1. 내 프로필 조회
     * GET /api/v1/users/me
     */
    @GetMapping("/me")
    public ApiResponse<UserProfileResponse> getMyProfile(Authentication authentication) {
        return ApiResponse.ok(userService.getProfile(getCurrentUserId(authentication)));
    }

    /**
     * 2. 내 프로필 수정 (이름, 사진)
     * PATCH /api/v1/users/me
     */
    @PatchMapping("/me")
    public ApiResponse<UserProfileResponse> updateMyProfile(
            @RequestBody @Valid UserProfileUpdateRequest request,
            Authentication authentication
    ) {
        return ApiResponse.ok(userService.updateProfile(getCurrentUserId(authentication), request));
    }

    /**
     * 3. 비밀번호 변경
     * PUT /api/v1/users/me/password
     */
    @PutMapping("/me/password")
    public ApiResponse<Void> changePassword(
            @RequestBody @Valid PasswordChangeRequest request,
            Authentication authentication
    ) {
        userService.changePassword(getCurrentUserId(authentication), request);
        return ApiResponse.ok(null);
    }

    /**
     * 4. 회원 탈퇴
     * POST /api/v1/users/me/withdraw
     */
    @PostMapping("/me/withdraw")
    public ApiResponse<Void> withdraw(
            @RequestBody @Valid AccountDeleteRequest request,
            Authentication authentication
    ) {
        userService.deleteAccount(getCurrentUserId(authentication), request.getPassword());
        return ApiResponse.ok(null);
    }

    /**
     * 5. [이메일 변경] 1단계: 인증 코드 발송 요청
     * POST /api/v1/users/me/email/send-code
     * - 현재 비밀번호 확인 후, 새 이메일로 코드 발송
     */
    @PostMapping("/me/email/send-code")
    public ApiResponse<Void> sendChangeEmailCode(
            @RequestBody @Valid EmailChangeRequest request,
            Authentication authentication
    ) {
        UUID userId = getCurrentUserId(authentication);
        emailVerificationService.sendChangeEmailCode(userId, request.getCurrentPassword(), request.getNewEmail());
        return ApiResponse.ok(null);
    }

    /**
     * 6. [이메일 변경] 2단계: 인증 코드 검증 및 변경 적용
     * POST /api/v1/users/me/email/verify-change
     * - 코드가 맞으면 계정 이메일이 즉시 변경됨
     */
    @PostMapping("/me/email/verify-change")
    public ApiResponse<Void> verifyChangeEmail(
            @RequestBody @Valid EmailVerificationRequest request,
            Authentication authentication
    ) {
        UUID userId = getCurrentUserId(authentication);
        userService.finalizeEmailChange(userId, request.getEmail(), request.getCode());
        return ApiResponse.ok(null);
    }
}