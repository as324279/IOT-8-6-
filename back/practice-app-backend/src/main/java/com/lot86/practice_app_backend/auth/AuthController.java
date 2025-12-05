package com.lot86.practice_app_backend.auth;

import com.lot86.practice_app_backend.auth.dto.*;
import com.lot86.practice_app_backend.common.ApiResponse;
import com.lot86.practice_app_backend.user.EmailVerificationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final EmailVerificationService emailVerificationService;

    // [회원가입] 인증 완료된 이메일로 가입 요청
    @PostMapping("/signup")
    public ApiResponse<Void> signup(@Valid @RequestBody UserSignupRequest requestDto) {
        authService.signup(requestDto);
        return ApiResponse.ok(null);
    }

    // [로그인]
    @PostMapping("/login")
    public ApiResponse<String> login(@Valid @RequestBody UserLoginRequest requestDto, HttpServletRequest http) {
        String token = authService.login(requestDto);
        return ApiResponse.ok(token);
    }

    // [신규] 인증코드 발송 요청 API
    @PostMapping("/send-code")
    public ApiResponse<Boolean> sendCode(@Valid @RequestBody EmailSendCodeRequest request) {
        emailVerificationService.sendSignupCode(request.getEmail());
        return ApiResponse.ok(true);
    }

    // [신규] 인증코드 검증 요청 API
    @PostMapping("/verify-code")
    public ApiResponse<Boolean> verifyCode(@Valid @RequestBody EmailVerifyCodeRequest request) {
        emailVerificationService.verifySignupCode(request.getEmail(), request.getCode());
        return ApiResponse.ok(true);
    }

    /** 9) [추가] 비밀번호 재설정 인증코드 발송 */
    @PostMapping("/forgot-password/send-code")
    public ApiResponse<Void> sendResetCode(@Valid @RequestBody EmailSendCodeRequest request) { // EmailSendCodeRequest 재활용
        emailVerificationService.sendResetPasswordCode(request.getEmail());
        return ApiResponse.ok(null);
    }

    /** 10) [추가] 비밀번호 재설정 처리 */
    @PostMapping("/forgot-password/reset")
    public ApiResponse<Void> resetPassword(@Valid @RequestBody PasswordResetRequest request) {
        authService.resetPassword(request);
        return ApiResponse.ok(null);
    }

}
