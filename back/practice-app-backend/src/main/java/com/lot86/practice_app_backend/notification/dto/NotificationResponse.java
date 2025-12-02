package com.lot86.practice_app_backend.notification.dto;

import com.lot86.practice_app_backend.notification.entity.Notification;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@AllArgsConstructor
public class NotificationResponse {
    private UUID notifId;
    private String topic;
    private String title;
    private String body;
    private OffsetDateTime sentAt;
    private boolean isRead;

    public static NotificationResponse fromEntity(Notification notification) {
        return new NotificationResponse(
                notification.getNotifId(),
                notification.getTopic(),
                notification.getTitle(),
                notification.getBody(),
                notification.getSentAt(),
                notification.getReadAt() != null
        );
    }
}