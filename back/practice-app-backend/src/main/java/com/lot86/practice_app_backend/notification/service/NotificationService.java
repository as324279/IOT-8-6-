package com.lot86.practice_app_backend.notification.service;

import com.lot86.practice_app_backend.entity.AppUser;
import com.lot86.practice_app_backend.notification.dto.NotificationResponse; // DTO import
import com.lot86.practice_app_backend.notification.entity.Notification;
import com.lot86.practice_app_backend.notification.repo.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    /** 알림 생성 및 저장 */
    @Transactional
    public void createNotification(AppUser user, String topic, String title, String body) {
        Notification notification = new Notification(user, topic, title, body);
        notificationRepository.save(notification);
    }

    /** * 내 알림 목록 조회 (DTO 반환)
     * - 엔티티를 DTO로 변환하여 반환합니다. (Lazy Loading 에러 방지)
     */
    @Transactional(readOnly = true)
    public List<NotificationResponse> getMyNotifications(UUID userId) {
        return notificationRepository.findByUser_UserIdOrderBySentAtDesc(userId).stream()
                .map(NotificationResponse::fromEntity)
                .collect(Collectors.toList());
    }
}