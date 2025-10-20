package com.lot86.practice_app_backend.user;

import com.lot86.practice_app_backend.config.jwt.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service // 이 클래스가 비즈니스 로직을 담당하는 '서비스' 역할임을 알려줍니다.
@RequiredArgsConstructor // final 필드에 대한 생성자를 자동으로 만들어줍니다 (DI).
public class UserService {

    private final UserRepository userRepository; // '창고 관리인'을 불러옵니다.
    private final PasswordEncoder passwordEncoder;   // '비밀번호 암호화기'를 불러옵니다.
    private final JwtUtil jwtUtil; // '출입증 발급기'를 주입

    public void signup(UserSignupRequestDto requestDto) {
        // 1. 이메일 중복 확인
        if (userRepository.findByEmail(requestDto.getEmail()).isPresent()) {
            // 이미 사용 중인 이메일이면 예외를 발생시킵니다.
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }

        // 2. 비밀번호 암호화
        String encodedPassword = passwordEncoder.encode(requestDto.getPassword());

        // 3. 사용자 정보 생성 및 저장
        User newUser = new User(
                requestDto.getEmail(),
                encodedPassword, // 암호화된 비밀번호를 저장합니다.
                requestDto.getName()
        );

        userRepository.save(newUser); // '창고 관리인'에게 저장을 명령합니다.
    }

    // 반환 타입을 void에서 String으로 변경
    public String login(UserLoginRequestDto requestDto) {
        User user = userRepository.findByEmail(requestDto.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("가입되지 않은 이메일입니다."));

        if (!passwordEncoder.matches(requestDto.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("잘못된 비밀번호입니다.");
        }
        // 3. 이메일 인증 여부 확인 (요구사항) - 지금은 주석 처리. JWT 도입 후 활성화
        // if (!user.isEmailVerified()) {
        //     throw new IllegalStateException("이메일 인증이 완료되지 않았습니다.");
        // }


        // 로그인 성공 시, 해당 유저의 이메일로 JWT를 생성하여 반환합니다.
        return jwtUtil.generateToken(user.getEmail());

    }





}