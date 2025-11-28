package com.lot86.practice_app_backend.user;

import com.lot86.practice_app_backend.entity.AppUser;
import com.lot86.practice_app_backend.entity.EmailVerification;
import com.lot86.practice_app_backend.repo.AppUserRepository;
import com.lot86.practice_app_backend.repo.EmailVerificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class EmailVerificationService {

    private final EmailVerificationRepository verificationRepository;
    private final AppUserRepository userRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder; // [추가] 비밀번호 확인용

    private static final SecureRandom RANDOM = new SecureRandom();

    // 목적 상수 비번 찾기, 메일변경 회원가입 기능을 구분하기 위해 만듦
    private static final String PURPOSE_SIGNUP = "signup";
    private static final String PURPOSE_RESET_PASSWORD = "reset_password";
    private static final String PURPOSE_CHANGE_EMAIL = "change_email";

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }

    private String generateCode() {
        int code = RANDOM.nextInt(900000) + 100000;
        return String.valueOf(code);
    }

    /** [회원가입] 인증 코드 발송 */
    public void sendSignupCode(String rawEmail) {
        String email = normalizeEmail(rawEmail);
        if (email == null || email.isBlank()) throw new IllegalArgumentException("이메일을 입력해주세요.");

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalStateException("이미 가입된 이메일입니다.");
        }

        String code = generateCode();

        EmailVerification ev = new EmailVerification();
        ev.setEmail(email);
        ev.setToken(code);
        ev.setPurpose(PURPOSE_SIGNUP);
        ev.setExpiresAt(OffsetDateTime.now(ZoneOffset.UTC).plusMinutes(10));

        verificationRepository.save(ev);
        emailService.sendVerification(email, code);
    }

    /** [회원가입] 인증 코드 검증 */
    public void verifySignupCode(String rawEmail, String code) {
        String email = normalizeEmail(rawEmail);
        assertValidCode(email, code, PURPOSE_SIGNUP);
    }

    /** [회원가입] 최종 확인 */
    public void assertEmailVerifiedForSignup(String rawEmail) {
        String email = normalizeEmail(rawEmail);
        EmailVerification ev = verificationRepository
                .findTopByEmailAndPurposeOrderByCreatedAtDesc(email, PURPOSE_SIGNUP)
                .orElseThrow(() -> new IllegalStateException("이메일 인증을 먼저 진행해주세요."));

        if (ev.isExpired()) throw new IllegalStateException("인증코드가 만료되었습니다.");
        if (!ev.isUsed()) throw new IllegalStateException("이메일 인증이 완료되지 않았습니다.");
    }

    /** [비밀번호 찾기] 인증 코드 발송 */
    public void sendResetPasswordCode(String rawEmail) {
        String email = normalizeEmail(rawEmail);
        if (email == null || email.isBlank()) throw new IllegalArgumentException("이메일을 입력해주세요.");

        if (!userRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("가입되지 않은 이메일입니다.");
        }

        String code = generateCode();

        EmailVerification ev = new EmailVerification();
        ev.setEmail(email);
        ev.setToken(code);
        ev.setPurpose(PURPOSE_RESET_PASSWORD);
        ev.setExpiresAt(OffsetDateTime.now(ZoneOffset.UTC).plusMinutes(10));

        verificationRepository.save(ev);
        emailService.sendVerification(email, code);
    }

    /** [비밀번호 찾기] 인증 코드 검증 */
    public void verifyResetPasswordCode(String rawEmail, String code) {
        String email = normalizeEmail(rawEmail);
        assertValidCode(email, code, PURPOSE_RESET_PASSWORD);
    }

    /** [이메일 변경] 인증 코드 발송 (수정됨) */
    public void sendChangeEmailCode(UUID userId, String currentPassword, String newEmail) {
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 1. 현재 비밀번호 검증
        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new IllegalArgumentException("현재 비밀번호가 일치하지 않습니다.");
        }

        // 2. 새 이메일 중복 체크
        if (userRepository.existsByEmailIgnoreCase(newEmail)) {
            throw new IllegalStateException("이미 사용 중인 이메일입니다.");
        }

        String code = generateCode();

        // 3. 인증 정보 저장
        EmailVerification ev = new EmailVerification();
        // [중요] v1.6 스키마는 user_id 대신 email을 사용합니다.
        // 인증 코드를 받을 '새 이메일'을 식별자로 저장합니다.
        ev.setEmail(newEmail);
        ev.setNewEmail(newEmail); // 명시적으로 newEmail 필드에도 저장
        ev.setToken(code);
        ev.setPurpose(PURPOSE_CHANGE_EMAIL);
        ev.setExpiresAt(OffsetDateTime.now(ZoneOffset.UTC).plusMinutes(10));

        verificationRepository.save(ev);
        emailService.sendVerification(newEmail, code);
    }

    // 만료 확인, 번호 일치 등 중복되는 코드 줄이려고 뺌.
    private void assertValidCode(String email, String code, String purpose) {
        if (code == null || code.isBlank()) throw new IllegalArgumentException("인증 코드를 입력해주세요.");

        EmailVerification ev = verificationRepository
                .findTopByEmailAndPurposeOrderByCreatedAtDesc(email, purpose)
                .orElseThrow(() -> new IllegalStateException("인증코드를 발급받거나 다시 요청해주세요."));

        if (ev.isUsed()) throw new IllegalStateException("이미 사용된 인증코드입니다.");
        if (ev.isExpired()) throw new IllegalStateException("인증코드가 만료되었습니다.");
        if (!ev.getToken().equals(code)) throw new IllegalStateException("인증코드가 일치하지 않습니다.");

        ev.markUsed();
        verificationRepository.save(ev);
    }
}