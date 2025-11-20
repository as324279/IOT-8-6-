package com.lot86.practice_app_backend.user;

import com.lot86.practice_app_backend.entity.EmailVerification;
import com.lot86.practice_app_backend.repo.AppUserRepository;
import com.lot86.practice_app_backend.repo.EmailVerificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;

@Service
@RequiredArgsConstructor
@Transactional
public class EmailVerificationService {

    private final EmailVerificationRepository verificationRepository;
    private final AppUserRepository userRepository;
    private final EmailService emailService;

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final String PURPOSE_SIGNUP = "signup"; // 회원가입용 인증 목적 상수

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }

    private String generateCode() {
        int code = RANDOM.nextInt(900000) + 100000;
        return String.valueOf(code);
    }

    // [변경] 인증 코드 발송 (가입 전 단계)
    public void sendSignupCode(String rawEmail) {
        String email = normalizeEmail(rawEmail);
        if (email == null || email.isBlank()) throw new IllegalArgumentException("이메일을 입력해주세요.");

        // 이미 가입된 이메일인지 체크
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalStateException("이미 가입된 이메일입니다.");
        }

        String code = generateCode();

        // 인증 정보 저장 (만료시간 10분)
        EmailVerification ev = new EmailVerification();
        ev.setEmail(email);
        ev.setToken(code);
        ev.setPurpose(PURPOSE_SIGNUP);
        ev.setExpiresAt(OffsetDateTime.now(ZoneOffset.UTC).plusMinutes(10));

        verificationRepository.save(ev);
        emailService.sendVerification(email, code);
    }

    // [변경] 인증 코드 검증 (사용자가 입력한 코드 확인)
    public void verifySignupCode(String rawEmail, String code) {
        String email = normalizeEmail(rawEmail);
        if (code == null || code.isBlank()) throw new IllegalArgumentException("인증 코드를 입력해주세요.");

        // 해당 이메일로 발송된 최신 인증 정보 조회
        EmailVerification ev = verificationRepository
                .findTopByEmailAndPurposeOrderByCreatedAtDesc(email, PURPOSE_SIGNUP)
                .orElseThrow(() -> new IllegalStateException("먼저 인증코드를 발급받아주세요."));

        if (ev.isUsed()) throw new IllegalStateException("이미 사용된 인증코드입니다.");
        if (ev.isExpired()) throw new IllegalStateException("인증코드가 만료되었습니다.");
        if (!ev.getToken().equals(code)) throw new IllegalStateException("인증코드가 일치하지 않습니다.");

        // 인증 성공 처리 (usedAt 기록)
        ev.markUsed();
        verificationRepository.save(ev);
    }

    // [신규] 회원가입 최종 단계에서 '정말 인증했는지' 확인하는 메소드
    public void assertEmailVerifiedForSignup(String rawEmail) {
        String email = normalizeEmail(rawEmail);
        EmailVerification ev = verificationRepository
                .findTopByEmailAndPurposeOrderByCreatedAtDesc(email, PURPOSE_SIGNUP)
                .orElseThrow(() -> new IllegalStateException("이메일 인증을 먼저 진행해주세요."));

        if (ev.isExpired()) throw new IllegalStateException("인증코드가 만료되었습니다.");
        if (!ev.isUsed()) throw new IllegalStateException("이메일 인증이 완료되지 않았습니다.");
    }
}