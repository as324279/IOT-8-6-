package com.lot86.practice_app_backend.user.service;

import com.lot86.practice_app_backend.entity.AppUser;
import com.lot86.practice_app_backend.entity.EmailVerification;
import com.lot86.practice_app_backend.repo.AppUserRepository;
import com.lot86.practice_app_backend.repo.EmailVerificationRepository;
import com.lot86.practice_app_backend.user.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * 유저 정보 관리 및 계정 설정(비밀번호, 이메일 등)을 담당하는 서비스
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // 이메일 변경 기능을 위해 필요한 리포지토리 주입
    private final EmailVerificationRepository emailVerificationRepository;

    /**
     * [내 정보 조회]
     * 로그인한 사용자의 기본 프로필 정보(이름, 이메일, 사진)를 반환합니다.
     */
    public UserProfileResponse getProfile(UUID userId) {
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        return UserProfileResponse.fromEntity(user);
    }

    /**
     * [프로필 수정]
     * 사용자의 이름이나 프로필 사진 URL을 업데이트합니다.
     * 입력된 값만 선택적으로 수정합니다 (null인 경우 기존 값 유지).
     */
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

    /**
     * [비밀번호 변경]
     * 보안을 위해 '현재 비밀번호'를 확인한 후, 일치할 경우에만 '새 비밀번호'로 변경합니다.
     * 새 비밀번호는 반드시 암호화하여 저장합니다.
     */
    @Transactional
    public void changePassword(UUID userId, PasswordChangeRequest request) {
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 1. 현재 비밀번호 일치 여부 확인
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("현재 비밀번호가 일치하지 않습니다.");
        }

        // 2. 새 비밀번호 암호화 및 저장
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
    }

    /**
     * [회원 탈퇴]
     * 실수로 인한 탈퇴를 막기 위해 비밀번호를 재확인한 후 계정을 영구 삭제합니다.
     * (DB 설정상 CASCADE로 인해 작성한 그룹, 물품 등도 함께 삭제됩니다)
     */
    @Transactional
    public void deleteAccount(UUID userId, String password) {
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않아 탈퇴할 수 없습니다.");
        }

        userRepository.delete(user);
    }

    /**
     * [이메일 변경 최종 처리] (Req 31)
     * 사용자가 입력한 인증 코드가 유효한지 검증하고, 최종적으로 이메일 주소를 변경합니다.
     * * @param userId 변경을 요청한 사용자 ID
     * @param newEmail 변경하려는 새 이메일 주소
     * @param code 사용자가 입력한 인증 코드
     */
    @Transactional
    public void finalizeEmailChange(UUID userId, String newEmail, String code) {
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 1. 인증 코드 조회 (v1.6 DB: user_id가 없으므로 '새 이메일'로 조회해야 함)
        EmailVerification ev = emailVerificationRepository
                .findTopByEmailAndPurposeOrderByCreatedAtDesc(newEmail, "change_email")
                .orElseThrow(() -> new IllegalStateException("해당 이메일로 요청된 변경 내역이 없습니다."));

        // 2. 유효성 검증 (만료, 불일치 등)
        if (ev.isExpired()) throw new IllegalStateException("인증 코드가 만료되었습니다.");
        if (ev.isUsed()) throw new IllegalStateException("이미 사용된 인증 코드입니다.");
        if (!ev.getToken().equals(code)) throw new IllegalStateException("인증 코드가 일치하지 않습니다.");

        // 3. 최종 이메일 업데이트
        user.setEmail(newEmail);
        user.setEmailVerified(true); // 변경 후에도 인증 상태 유지

        // 4. 인증 토큰 사용 처리
        ev.markUsed();
    }
}