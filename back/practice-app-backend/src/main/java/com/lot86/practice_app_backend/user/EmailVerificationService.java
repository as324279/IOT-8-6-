package com.lot86.practice_app_backend.user;

import com.lot86.practice_app_backend.auth.event.UserSignedUpEvent;
import com.lot86.practice_app_backend.entity.AppUser;
import com.lot86.practice_app_backend.entity.EmailVerification;
import com.lot86.practice_app_backend.repo.AppUserRepository;
import com.lot86.practice_app_backend.repo.EmailVerificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;

@Service
@RequiredArgsConstructor
public class EmailVerificationService {

    private final EmailVerificationRepository verificationRepository;
    private final AppUserRepository userRepository;
    private final EmailService emailService;

    // 🔐 더 안전한 랜덤 코드 생성을 위한 SecureRandom
    private static final SecureRandom RANDOM = new SecureRandom();

    /** 6자리 숫자 인증 코드 생성 (100000 ~ 999999) */
    private String generateCode() {
        int code = RANDOM.nextInt(900000) + 100000;
        return String.valueOf(code);
    }

    /**
     * 회원가입 트랜잭션 커밋 이후 실행:
     * - 6자리 인증번호 발급
     * - email_verification 저장
     * - 사용자에게 이메일 발송
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void onUserSignup(UserSignedUpEvent event) {

        // ✅ 6자리 인증번호 생성
        String code = generateCode();

        EmailVerification ev = new EmailVerification();
        ev.setUserId(event.userId());
        ev.setToken(code);                       // 6자리 숫자 코드 저장
        ev.setPurpose("verify_email");

        // 📌 메일 내용과 일치하도록 유효시간 10분으로 설정
        ev.setExpiresAt(OffsetDateTime.now(ZoneOffset.UTC).plusMinutes(10));

        verificationRepository.save(ev);

        // 📧 실제 이메일 발송 (인증번호 포함)
        emailService.sendVerification(event.email(), code);

        System.out.println("📧 이메일 인증번호 발급 및 전송 완료: " + event.email());
    }

    /**
     * 인증번호(토큰) 검증:
     *  - 유효한 코드인지 확인 (만료/사용 여부)
     *  - 유효하면 해당 사용자 emailVerified = true
     *  - 토큰 usedAt 세팅 후 재사용 방지
     */
    @Transactional
    public void verify(String token) {
        // ⚠️ EmailVerificationRepository에 아래 메소드가 반드시 있어야 함:
        // Optional<EmailVerification> findActiveToken(String token);
        EmailVerification ev = verificationRepository.findActiveToken(token)
                .orElseThrow(() -> new IllegalStateException("만료되었거나 잘못된 인증번호입니다."));

        AppUser user = userRepository.findById(ev.getUserId())
                .orElseThrow(() -> new IllegalStateException("존재하지 않는 사용자입니다."));

        // 이메일 인증 완료 처리
        user.setEmailVerified(true);

        // 토큰 사용 완료 처리 (재사용 방지)
        ev.setUsedAt(OffsetDateTime.now(ZoneOffset.UTC));

        System.out.println("✅ 이메일 인증 완료: userId=" + user.getUserId());
    }
}
