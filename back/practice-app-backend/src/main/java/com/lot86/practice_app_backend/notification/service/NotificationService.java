package com.lot86.practice_app_backend.notification.service;

import com.lot86.practice_app_backend.entity.AppUser;
import com.lot86.practice_app_backend.notification.entity.Notification;
import com.lot86.practice_app_backend.notification.repo.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    /** 알림 생성 및 저장 */
    @Transactional
    public void createNotification(AppUser user, String topic, String title, String body) {
        Notification notification = new Notification(user, topic, title, body);
        notificationRepository.save(notification);

        // (추후 여기에 실제 FCM 푸시 발송 로직 추가 가능)
    }
    @Transactional(readOnly = true)
    public List<Notification> getMyNotifications(UUID userId) {
        return notificationRepository.findByUser_UserIdOrderBySentAtDesc(userId);
    }


}