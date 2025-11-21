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
@Table(name = "invite_code")
public class InviteCode {

    @Id
    @Column(name = "code_id", columnDefinition = "uuid")
    private UUID codeId;

    @Column(name = "group_id", nullable = false, columnDefinition = "uuid")
    private UUID groupId;

    @Column(name = "inviter_id", columnDefinition = "uuid")
    private UUID inviterId;   // 초대한 사람

    @Column(name = "code", nullable = false, length = 12, unique = true)
    private String code;      // 8~12자리 영문+숫자

    @Column(name = "expires_at", nullable = false)
    private OffsetDateTime expiresAt;

    @Column(name = "max_uses", nullable = false)
    private int maxUses;

    @Column(name = "used_count", nullable = false)
    private int usedCount;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "status", nullable = false, length = 12)
    private String status; // 'ACTIVE','EXPIRED','REVOKED'

    @PrePersist
    public void prePersist() {
        if (codeId == null) codeId = UUID.randomUUID();
        if (createdAt == null) createdAt = OffsetDateTime.now(ZoneOffset.UTC);
        if (status == null) status = "ACTIVE";
    }

    /** 사용 가능 여부 체크 */
    public boolean isUsable() {
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        if (!"ACTIVE".equals(status)) return false;
        if (expiresAt != null && expiresAt.isBefore(now)) return false;
        if (usedCount >= maxUses) return false;
        return true;
    }
}
