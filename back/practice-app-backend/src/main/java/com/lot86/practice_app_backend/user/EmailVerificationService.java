package com.lot86.practice_app_backend.user;

import com.lot86.practice_app_backend.auth.event.UserSignedUpEvent;
import com.lot86.practice_app_backend.entity.AppUser;
import com.lot86.practice_app_backend.entity.EmailVerification;
import com.lot86.practice_app_backend.repo.AppUserRepository;
import com.lot86.practice_app_backend.repo.EmailVerificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EmailVerificationService {

    private final EmailVerificationRepository verificationRepository;
    private final AppUserRepository userRepository;
    private final EmailService emailService;

    private static final SecureRandom RANDOM = new SecureRandom();

    /** 6자리 숫자 인증 코드 생성 (100000 ~ 999999) */
    private String generateCode() {
        int code = RANDOM.nextInt(900000) + 100000;
        return String.valueOf(code);
    }

    /**
     * 회원가입이 끝나면 AuthService.signup() 이
     * new UserSignedUpEvent(userId, email) 을 publish 하고,
     * 그 이벤트를 여기서 받아서 인증메일을 보냄.
     */
    @EventListener
    @Transactional
    public void handleUserSignedUp(UserSignedUpEvent event) {
        // ✅ record 는 이렇게 꺼내야 함
        UUID userId = event.userId();
        String email = event.email().trim().toLowerCase();

        // 6자리 인증번호
        String token = generateCode();

        // 인증 정보 저장
        EmailVerification ev = new EmailVerification();
        ev.setUserId(userId);
        ev.setToken(token);
        ev.setPurpose("verify_email");
        ev.setExpiresAt(OffsetDateTime.now(ZoneOffset.UTC).plusMinutes(10));

        verificationRepository.save(ev);

        // 메일 발송
        emailService.sendVerification(email, token);

        System.out.println("📧 회원가입 이메일 인증번호 전송: userId=" + userId
                + ", email=" + email + ", token=" + token);
    }

    /**
     * GET /api/v1/auth/verify-email?token=인증번호
     * 로 들어오는 요청 처리
     */
    @Transactional
    public void verify(String token) {
        EmailVerification ev = verificationRepository.findActiveToken(token)
                .orElseThrow(() -> new IllegalStateException("만료되었거나 잘못된 인증번호입니다."));

        AppUser user = userRepository.findById(ev.getUserId())
                .orElseThrow(() -> new IllegalStateException("존재하지 않는 사용자입니다."));

        user.setEmailVerified(true);
        ev.setUsedAt(OffsetDateTime.now(ZoneOffset.UTC));

        System.out.println("✅ 이메일 인증 완료: userId=" + user.getUserId());
    }
}
