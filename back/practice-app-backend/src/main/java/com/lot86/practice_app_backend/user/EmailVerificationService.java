package com.lot86.practice_app_backend.user;

import com.lot86.practice_app_backend.auth.event.UserSignedUpEvent; // [추가] 1단계에서 만든 이벤트 임포트
import com.lot86.practice_app_backend.entity.AppUser;
import com.lot86.practice_app_backend.entity.EmailVerification;
import com.lot86.practice_app_backend.repo.AppUserRepository;
import com.lot86.practice_app_backend.repo.EmailVerificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation; // [추가]
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EmailVerificationService {

    private final EmailVerificationRepository verificationRepository;
    private final AppUserRepository userRepository; // 'verify' 메소드에서 필요
    private final EmailService emailService;

    /**
     * [수정] UserSignedUpEvent 이벤트를 수신(listen)하도록 변경
     * AuthService의 트랜잭션이 '커밋'된 후에만 실행됨
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW) // 자신만의 새 트랜잭션으로 실행
    public void onUserSignup(UserSignedUpEvent event) { // [수정] 파라미터 변경
        EmailVerification ev = new EmailVerification();
        ev.setUserId(event.userId()); // [수정] 이벤트에서 userId 가져오기
        ev.setToken(UUID.randomUUID().toString().replace("-", ""));
        ev.setPurpose("verify_email");
        ev.setExpiresAt(OffsetDateTime.now(ZoneOffset.UTC).plusHours(24));

        verificationRepository.save(ev);

        // 실제 이메일 발송
        emailService.sendVerification(event.email(), ev.getToken()); // [수정] 이벤트에서 email 가져오기
    }

    /**
     * (7단계에서 AuthController가 사용할) 이메일 인증 토큰 검증 메소드
     */
    @Transactional
    public void verify(String token) {
        EmailVerification ev = verificationRepository.findActiveToken(token)
                .orElseThrow(() -> new IllegalStateException("만료되었거나 잘못된 토큰입니다."));

        AppUser user = userRepository.findById(ev.getUserId())
                .orElseThrow(() -> new IllegalStateException("존재하지 않는 사용자입니다."));

        user.setEmailVerified(true);
        ev.setUsedAt(OffsetDateTime.now(ZoneOffset.UTC));
    }
}

