package com.lot86.practice_app_backend.user.service;

import com.lot86.practice_app_backend.entity.AppUser;
import com.lot86.practice_app_backend.repo.AppUserRepository;
import com.lot86.practice_app_backend.user.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /** 내 정보 조회 */
    public UserProfileResponse getProfile(UUID userId) {
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        return UserProfileResponse.fromEntity(user);
    }

    /** 프로필(이름, 사진) 수정 */
    @Transactional
    public UserProfileResponse updateProfile(UUID userId, UserProfileUpdateRequest request) {
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName());
        }
        if (request.getProfileImage() != null) {
            user.setProfileImage(request.getProfileImage());
        }

        return UserProfileResponse.fromEntity(user);
    }

    /** 비밀번호 변경 */
    @Transactional
    public void changePassword(UUID userId, PasswordChangeRequest request) {
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 현재 비밀번호 확인
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("현재 비밀번호가 일치하지 않습니다.");
        }

        // 새 비밀번호 암호화 저장
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
    }

    /** 회원 탈퇴 */
    @Transactional
    public void deleteAccount(UUID userId, String password) {
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 탈퇴 전 비밀번호 재확인
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않아 탈퇴할 수 없습니다.");
        }

        userRepository.delete(user);
    }
}