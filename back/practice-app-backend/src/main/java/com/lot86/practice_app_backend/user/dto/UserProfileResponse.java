package com.lot86.practice_app_backend.user.dto;

import com.lot86.practice_app_backend.entity.AppUser;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.UUID;

@Getter
@AllArgsConstructor
public class UserProfileResponse {
    private UUID userId;
    private String email;
    private String name;
    private String profileImage;

    public static UserProfileResponse fromEntity(AppUser user) {
        return new UserProfileResponse(
                user.getUserId(),
                user.getEmail(),
                user.getName(),
                user.getProfileImage()
        );
    }
}