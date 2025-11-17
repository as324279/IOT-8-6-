package com.lot86.practice_app_backend.auth;

import com.lot86.practice_app_backend.auth.dto.UserLoginRequest;
import com.lot86.practice_app_backend.auth.dto.UserSignupRequest;
import com.lot86.practice_app_backend.auth.event.UserSignedUpEvent;
import com.lot86.practice_app_backend.config.jwt.JwtUtil;
import com.lot86.practice_app_backend.entity.AppUser;
import com.lot86.practice_app_backend.repo.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
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
    private final ApplicationEventPublisher publisher;

    /** 회원가입 */
    @Transactional
    public void signup(UserSignupRequest requestDto) {
        // 1) 이메일 정규화
        String email = requestDto.getEmail().trim().toLowerCase();

        // 2) 중복 체크
        if (userRepository.findByEmailIgnoreCase(email).isPresent()) {
            throw new IllegalStateException("이미 사용 중인 이메일입니다.");
        }

        // 3) 비밀번호 해시 + 유저 생성
        String encodedPassword = passwordEncoder.encode(requestDto.getPassword());

        AppUser newUser = new AppUser(
                email,                 // 정규화된 이메일
                encodedPassword,
                requestDto.getName()
        );

        // 4) 저장
        userRepository.save(newUser);

        // 5) 회원가입 완료 이벤트 발행 (이후 EmailVerificationService가 인증번호 발송)
        publisher.publishEvent(new UserSignedUpEvent(newUser.getUserId(), newUser.getEmail()));
    }

    /** 로그인 */
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

        // JWT 발급
        return jwtUtil.createAccess(user.getUserId(), user.isEmailVerified());
    }
}
