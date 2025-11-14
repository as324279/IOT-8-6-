package com.lot86.practice_app_backend.auth.event;

import java.util.UUID;

/**
 * AuthService가 회원가입 트랜잭션 커밋 후 발행하는 이벤트 객체.
 * EmailVerificationService가 이 이벤트를 수신(listen)함.
 *
 * @param userId 새로 가입한 사용자의 ID
 * @param email 새로 가입한 사용자의 이메일
 */
public record UserSignedUpEvent(
        UUID userId,
        String email
) {
    // record 클래스는 자동으로 생성자, getter, equals, hashCode, toString을 만듦.
}

