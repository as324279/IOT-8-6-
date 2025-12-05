package com.lot86.practice_app_backend.notification.repo;

import com.lot86.practice_app_backend.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    // 내 알림 조회 (최신순)
    List<Notification> findByUser_UserIdOrderBySentAtDesc(UUID userId);

    // [추가] 특정 유저의 알림 전체 삭제
    void deleteByUser_UserId(UUID userId);

}