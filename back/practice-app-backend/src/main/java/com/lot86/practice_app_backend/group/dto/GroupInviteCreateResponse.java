package com.lot86.practice_app_backend.group.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@AllArgsConstructor
public class GroupInviteCreateResponse {

    private UUID groupId;
    private String code;
    private OffsetDateTime expiresAt;
    private int maxUses;
    private int usedCount;
    private String status;
}
