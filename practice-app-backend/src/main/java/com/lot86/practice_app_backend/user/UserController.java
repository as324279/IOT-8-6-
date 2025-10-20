package com.lot86.practice_app_backend.user;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;

@RestController // 이 클래스가 API 요청을 받는 컨트롤러임을 알려줍니다.
@RequestMapping("/api/auth") // 이 컨트롤러의 모든 API 주소는 '/api/auth'로 시작합니다.
@RequiredArgsConstructor
public class UserController {

    private final UserService userService; // '총괄 셰프'를 불러옵니다.

    // POST /api/auth/signup 주소로 오는 요청을 이 메소드가 처리합니다.
    @PostMapping("/signup")
    public ResponseEntity<String> signup(@Valid @RequestBody UserSignupRequestDto requestDto) {
        // @RequestBody: 손님이 보낸 주문서(JSON)를 UserSignupRequestDto 양식에 맞춰 받습니다.

        try {
            userService.signup(requestDto); // 받은 주문서를 그대로 셰프에게 전달합니다.
            return ResponseEntity.ok("회원가입에 성공했습니다."); // 성공 시 응답
        } catch (IllegalArgumentException e) {
            // 만약 셰프가 "이메일 중복!"이라고 소리치면(예외 발생),
            // 손님에게 에러 메시지를 전달합니다.
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody UserLoginRequestDto requestDto) {
        try {
            // userService로부터 JWT(출입증)를 전달받습니다.
            String token = userService.login(requestDto);
            // 성공 시, 응답 본문에 토큰을 담아 보냅니다.
            return ResponseEntity.ok(token);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }
}