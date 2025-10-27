package com.lot86.practice_app_backend.group.controller;

import com.lot86.practice_app_backend.common.ApiResponse;
import com.lot86.practice_app_backend.group.entity.AppGroup; // AppGroup 엔티티 임포트
import com.lot86.practice_app_backend.group.dto.GroupCreateRequest; // DTO 임포트 (경로 확인!)
import com.lot86.practice_app_backend.group.service.GroupService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus; // HttpStatus 임포트
import org.springframework.http.ResponseEntity; // ResponseEntity 임포트
import org.springframework.security.core.Authentication; // Authentication 임포트
import org.springframework.security.core.context.SecurityContextHolder; // SecurityContextHolder 임포트
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController // REST 컨트롤러 선언
@RequestMapping("/api/v1/groups") // 이 컨트롤러의 기본 경로
@RequiredArgsConstructor // 생성자 주입
public class GroupController {

    private final GroupService groupService;

    @PostMapping // HTTP POST 요청 처리 (경로는 /api/v1/groups)
    // ResponseEntity를 사용하여 HTTP 상태 코드(201 Created)와 함께 응답
    public ResponseEntity<ApiResponse<AppGroup>> createGroup(@Valid @RequestBody GroupCreateRequest requestDto) {

        // --- 현재 로그인한 사용자 ID 가져오기 ---
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            // 인증되지 않은 사용자 처리 (SecurityConfig에서 걸러지겠지만 방어 코드)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("로그인이 필요합니다."));
        }
        // JwtAuthenticationFilter에서 Principal로 UUID를 저장했으므로 캐스팅
        UUID currentUserId = (UUID) authentication.getPrincipal();
        // --- 여기까지 ---

        AppGroup createdGroup = groupService.createGroup(requestDto, currentUserId);

        // 생성 성공 시 HTTP 상태 코드 201 Created 와 함께 생성된 그룹 정보 반환
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(createdGroup));
    }

    // --- 여기에 그룹 조회, 수정, 삭제, 초대 등 다른 API 엔드포인트 추가 예정 ---
}