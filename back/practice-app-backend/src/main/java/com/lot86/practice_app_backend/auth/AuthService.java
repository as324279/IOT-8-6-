package com.lot86.practice_app_backend.auth;

import com.lot86.practice_app_backend.auth.dto.UserLoginRequest;
import com.lot86.practice_app_backend.auth.dto.UserSignupRequest;
import com.lot86.practice_app_backend.auth.event.UserSignedUpEvent; // [수정] 1단계에서 만든 이벤트 임포트
import com.lot86.practice_app_backend.config.jwt.JwtUtil;
import com.lot86.practice_app_backend.entity.AppUser;
import com.lot86.practice_app_backend.repo.AppUserRepository;
// import com.lot86.practice_app_backend.user.EmailVerificationService; // [삭제] 직접 호출 안 함
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher; // [추가] 이벤트 발행기 임포트
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    // private final EmailVerificationService emailVerificationService; // [삭제]
    private final ApplicationEventPublisher publisher; // [추가] 이벤트 발행기 주입

    @Transactional
    public void signup(UserSignupRequest requestDto) {
        if (userRepository.findByEmail(requestDto.getEmail()).isPresent()) {
            throw new IllegalStateException("이미 사용 중인 이메일입니다.");
        }

        String encodedPassword = passwordEncoder.encode(requestDto.getPassword());

        AppUser newUser = new AppUser(
                requestDto.getEmail(),
                encodedPassword,
                requestDto.getName()
        );

        userRepository.save(newUser); // 1. DB에 사용자 저장 (트랜잭션 A)

        // 2. [수정] 트랜잭션 A가 커밋된 후 실행될 이벤트를 발행
        //    (newUser.getUserId()와 .getEmail()이 AppUser 엔티티에 존재해야 함)
        publisher.publishEvent(new UserSignedUpEvent(newUser.getUserId(), newUser.getEmail()));
        // emailVerificationService.issueAndSend(newUser); // [삭제]
    }

    @Transactional
    public String login(UserLoginRequest requestDto) {
        AppUser user = userRepository.findByEmail(requestDto.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("가입되지 않은 이메일입니다."));

        if (!passwordEncoder.matches(requestDto.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("잘못된 비밀번호입니다.");
        }

        if (!user.isEmailVerified()) {
            throw new IllegalStateException("이메일 인증이 완료되지 않았습니다.");
        }

        // (user.getUserId()와 .isEmailVerified()가 AppUser 엔티티에 존재해야 함)
        return jwtUtil.createAccess(user.getUserId(), user.isEmailVerified());
    }
}

