package com.lot86.practice_app_backend.notification.controller;

import com.lot86.practice_app_backend.common.ApiResponse;
import com.lot86.practice_app_backend.notification.entity.Notification;
import com.lot86.practice_app_backend.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /** 내 알림 조회 (GET /api/v1/notifications) */
    @GetMapping
    public ApiResponse<List<Notification>> getMyNotifications(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("로그인이 필요합니다.");
        }
        // SecurityContext에서 userId 꺼내기
        UUID userId = (UUID) authentication.getPrincipal();

        return ApiResponse.ok(notificationService.getMyNotifications(userId));
    }
}