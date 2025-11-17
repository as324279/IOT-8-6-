package com.lot86.practice_app_backend.group.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@AllArgsConstructor
public class GroupInviteCheckResponse {

    private boolean valid;
    private UUID groupId;
    private String groupName;
    private OffsetDateTime expiresAt;
    private int remainingUses;
    private String status;
}
