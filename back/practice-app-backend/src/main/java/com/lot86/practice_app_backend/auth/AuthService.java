package com.lot86.practice_app_backend.auth;

import com.lot86.practice_app_backend.auth.dto.UserLoginRequest;
import com.lot86.practice_app_backend.auth.dto.UserSignupRequest;
import com.lot86.practice_app_backend.config.jwt.JwtUtil;
import com.lot86.practice_app_backend.entity.AppUser;
import com.lot86.practice_app_backend.repo.AppUserRepository;
import com.lot86.practice_app_backend.user.EmailVerificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.lot86.practice_app_backend.auth.dto.PasswordResetRequest;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailVerificationService emailVerificationService;

    @Transactional
    public void signup(UserSignupRequest requestDto) {
        String email = requestDto.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalStateException("이미 사용 중인 이메일입니다.");
        }

        // [변경] 약관 동의 체크
        if (!requestDto.isTermsAgreed() || !requestDto.isPrivacyAgreed()) {
            throw new IllegalStateException("약관에 모두 동의해야 합니다.");
        }

        // [변경] 이메일 인증 여부 최종 확인 (인증 안 했으면 여기서 에러 발생)
        emailVerificationService.assertEmailVerifiedForSignup(email);

        // 유저 생성 (인증 완료 상태로 저장)
        String encodedPassword = passwordEncoder.encode(requestDto.getPassword());
        AppUser newUser = new AppUser(email, encodedPassword, requestDto.getName());
        newUser.setEmailVerified(true);

        userRepository.save(newUser);
    }

    @Transactional
    public String login(UserLoginRequest requestDto) {
        String email = requestDto.getEmail().trim().toLowerCase();

        AppUser user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException("가입되지 않은 이메일입니다."));

        if (!passwordEncoder.matches(requestDto.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("잘못된 비밀번호입니다.");
        }

        if (!user.isEmailVerified()) {
            throw new IllegalStateException("이메일 인증이 완료되지 않았습니다.");
        }

        return jwtUtil.createAccess(user.getUserId(), user.isEmailVerified());
    }

    /** [비밀번호 재설정] (비로그인 상태에서 수행) */
    @Transactional
    public void resetPassword(PasswordResetRequest request) {
        // 1. 이메일 인증 코드 검증
        emailVerificationService.verifyResetPasswordCode(request.getEmail(), request.getCode());

        // 2. 사용자 조회
        AppUser user = userRepository.findByEmailIgnoreCase(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("가입되지 않은 이메일입니다."));

        // 3. 비밀번호 변경
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
    }
}