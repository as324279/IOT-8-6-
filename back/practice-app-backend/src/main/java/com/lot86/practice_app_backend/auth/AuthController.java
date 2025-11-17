package com.lot86.practice_app_backend.auth;

import com.lot86.practice_app_backend.auth.dto.UserLoginRequest;
import com.lot86.practice_app_backend.auth.dto.UserSignupRequest;
import com.lot86.practice_app_backend.common.ApiResponse; // 6단계에서 만든 ApiResponse
import com.lot86.practice_app_backend.user.EmailVerificationService; // 4단계에서 만든 서비스
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController // 1. 컨트롤러 선언
@RequestMapping("/api/v1/auth") // 2. 팀 표준 URL 바꿔도딤 일단 url위치임
@RequiredArgsConstructor // 3. 생성자 주입
public class AuthController {

    private final AuthService authService; // 4. AuthService 주입
    private final EmailVerificationService emailVerificationService; // 5. 이메일 서비스 주입

    // 6. try-catch 제거, ApiResponse<Void> 반환
    @PostMapping("/signup")
    public ApiResponse<Void> signup(@Valid @RequestBody UserSignupRequest requestDto) {
        authService.signup(requestDto);
        return ApiResponse.ok(null); // 성공 시 data: null
    }

    // 7. try-catch 제거, ApiResponse<String> 반환
    @PostMapping("/login")
    public ApiResponse<String> login(@RequestBody UserLoginRequest requestDto, HttpServletRequest http) {
        String token = authService.login(requestDto);
        return ApiResponse.ok(token); // 성공 시 data: "jwt..."
    }

    // 8. [핵심] 이메일 인증을 위한 엔드포인트
    @GetMapping("/verify-email")
    public ApiResponse<Void> verifyEmail(@RequestParam String token) {
        log.info("GET /api/v1/auth/verify-email called with token={}", token);
        emailVerificationService.verify(token);
        return ApiResponse.ok(null);
    }


}

