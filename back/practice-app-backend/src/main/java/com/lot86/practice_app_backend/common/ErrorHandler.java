package com.lot86.practice_app_backend.common;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.LinkedHashMap;
import java.util.Map;

@Slf4j
// @RestControllerAdvice : 모든 @RestController에서 발생하는 예외를 가로채는 녀석
@RestControllerAdvice
public class ErrorHandler {

    // 1. DTO Validation 예외 처리 (e.g. @NotBlank, @Email)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(e -> errors.put(e.getField(), e.getDefaultMessage()));

        // "validation_error": { "email": "이메일 형식이..." }
        Map<String, String> response = new LinkedHashMap<>();
        response.put("error", "validation_error: " + errors.toString());

        return ResponseEntity.badRequest().body(response);
    }

    // 2. 이미 존재하는 데이터 예외 (e.g. 이메일 중복)
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, String>> handleIllegalState(IllegalStateException ex) {
        // "error": "이미 사용 중인 이메일입니다"
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", ex.getMessage()));
    }

    // 3. 잘못된 요청 예외 (e.g. 비밀번호 불일치)
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", ex.getMessage()));
    }

    // 4. 나머지 모든 예외
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGeneral(Exception ex) {
        // 🔥 여기서 로그 찍기
        log.error("Unhandled exception", ex);

        // 클라이언트에게는 내부 상세는 숨기고, 공통 에러 코드만 전달
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "internal_server_error"));
    }
}