package com.lot86.practice_app_backend.notification.entity;

import com.lot86.practice_app_backend.entity.AppUser;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "notification")
public class Notification {

    @Id
    @Column(name = "notif_id", columnDefinition = "uuid")
    private UUID notifId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    // LOW_STOCK, EXPIRY_SOON, NEW_MEMBER 등
    @Column(nullable = false, length = 24)
    private String topic;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String body;

    @CreationTimestamp
    @Column(name = "sent_at", nullable = false, updatable = false)
    private OffsetDateTime sentAt;

    @Column(name = "read_at")
    private OffsetDateTime readAt;

    @PrePersist
    public void prePersist() {
        if (this.notifId == null) this.notifId = UUID.randomUUID();
    }

    public Notification(AppUser user, String topic, String title, String body) {
        this.user = user;
        this.topic = topic;
        this.title = title;
        this.body = body;
    }
}