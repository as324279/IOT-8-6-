package com.lot86.practice_app_backend.group.dto;

import com.lot86.practice_app_backend.entity.AppUser;
import com.lot86.practice_app_backend.group.entity.AppGroup;

import java.time.OffsetDateTime;
import java.util.UUID;

public record GroupCreateResponse(
        UUID groupId,
        String name,
        Creator createdBy,
        OffsetDateTime createdAt,
        OffsetDateTime dissolvedAt
) {
    public record Creator(
            UUID userId,
            String email,
            String name,
            OffsetDateTime createdAt
    ) {}

    public static GroupCreateResponse fromEntity(AppGroup group) {
        AppUser creator = group.getCreatedBy();

        Creator creatorDto = new Creator(
                creator.getUserId(),
                creator.getEmail(),
                creator.getName(),
                creator.getCreatedAt()
        );

        return new GroupCreateResponse(
                group.getGroupId(),
                group.getName(),
                creatorDto,
                group.getCreatedAt(),
                group.getDissolvedAt()
        );
    }
}
