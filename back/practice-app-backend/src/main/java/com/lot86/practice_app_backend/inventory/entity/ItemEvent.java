package com.lot86.practice_app_backend.inventory.entity;

import com.lot86.practice_app_backend.entity.AppUser;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "item_event")
public class ItemEvent {

    @Id
    @Column(name = "event_id", columnDefinition = "uuid")
    private UUID eventId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_id")
    private AppUser actor;

    // CREATE, UPDATE, DELETE, PURCHASE_IN
    @Column(name = "event_type", nullable = false, length = 16)
    private String eventType;

    @Column(name = "qty_change", precision = 12, scale = 3)
    private BigDecimal qtyChange;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (this.eventId == null) this.eventId = UUID.randomUUID();
    }

    // 생성자 편의 메서드
    public ItemEvent(Item item, AppUser actor, String eventType, BigDecimal qtyChange) {
        this.item = item;
        this.actor = actor;
        this.eventType = eventType;
        this.qtyChange = qtyChange;
    }
}