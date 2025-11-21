package com.lot86.practice_app_backend.group.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@AllArgsConstructor
public class GroupMemberResponse {

    private UUID userId;
    private String name;
    private String email;
    private String role;
    private OffsetDateTime joinedAt;
    private boolean me;   // 현재 로그인한 유저인지 표시
}
