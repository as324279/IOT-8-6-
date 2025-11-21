package com.lot86.practice_app_backend.group.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "invite_redeem")
public class InviteRedeem {

    @Id
    @Column(name = "redeem_id", columnDefinition = "uuid")
    private UUID redeemId;

    @Column(name = "code_id", nullable = false, columnDefinition = "uuid")
    private UUID codeId;

    @Column(name = "group_id", nullable = false, columnDefinition = "uuid")
    private UUID groupId;

    @Column(name = "user_id", nullable = false, columnDefinition = "uuid")
    private UUID userId;

    @Column(name = "redeemed_at", nullable = false)
    private OffsetDateTime redeemedAt;

    @PrePersist
    public void prePersist() {
        if (redeemId == null) redeemId = UUID.randomUUID();
        if (redeemedAt == null) redeemedAt = OffsetDateTime.now(ZoneOffset.UTC);
    }
}
