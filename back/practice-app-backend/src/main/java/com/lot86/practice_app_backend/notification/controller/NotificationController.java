package com.lot86.practice_app_backend.notification.controller;

import com.lot86.practice_app_backend.common.ApiResponse;
import com.lot86.practice_app_backend.notification.entity.Notification;
import com.lot86.practice_app_backend.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

import com.lot86.practice_app_backend.notification.dto.NotificationResponse;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /** 내 알림 조회 (GET /api/v1/notifications) */
    /** 내 알림 조회 */
    @GetMapping
    public ApiResponse<List<NotificationResponse>> getMyNotifications(Authentication authentication) { // [수정] 반환 타입 변경
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("로그인이 필요합니다.");
        }
        UUID userId = (UUID) authentication.getPrincipal();
        return ApiResponse.ok(notificationService.getMyNotifications(userId));
    }
}