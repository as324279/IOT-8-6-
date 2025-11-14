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
        final String email = requestDto.getEmail();
        final String rawPw = requestDto.getPassword();
        final String name  = requestDto.getName();

        // citext라서 findByEmail이면 충분 (IgnoreCase 불필요)
        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalStateException("이미 사용 중인 이메일입니다.");
        }

        AppUser newUser = new AppUser();
        newUser.setEmail(email);
        newUser.setPasswordHash(passwordEncoder.encode(rawPw));
        newUser.setName(name);

        userRepository.save(newUser);

        // 회원가입 후 이메일 인증 이벤트 발행
        publisher.publishEvent(new UserSignedUpEvent(newUser.getUserId(), newUser.getEmail()));
    }

    /** 로그인 */
    @Transactional
    public String login(UserLoginRequest requestDto) {
        final String email = requestDto.getEmail();
        final String rawPw = requestDto.getPassword();

        AppUser user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("가입되지 않은 이메일입니다."));

        if (!passwordEncoder.matches(rawPw, user.getPasswordHash())) {
            throw new IllegalArgumentException("잘못된 비밀번호입니다.");
        }
        if (!user.isEmailVerified()) {
            throw new IllegalStateException("이메일 인증이 완료되지 않았습니다.");
        }

        // ✅ JwtUtil의 실제 시그니처에 맞춰 호출 (예: createAccessToken)
        return jwtUtil.createAccessToken(user.getUserId(), user.getEmail(), user.isEmailVerified());
    }
}
