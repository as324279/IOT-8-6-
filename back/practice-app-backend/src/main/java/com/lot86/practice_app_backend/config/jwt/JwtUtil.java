package com.lot86.practice_app_backend.config.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

@Component
public class JwtUtil {

    private final String issuer;
    private final SecretKey secretKey;
    private final long accessSeconds;
    private final long refreshSeconds;

    public JwtUtil(
            @Value("${security.jwt.issuer}") String issuer,
            @Value("${security.jwt.secret}") String secret,
            // 👉 yml에 있는 키 이름에 맞춤 (없으면 기본값 사용)
            @Value("${security.jwt.access-seconds:900}") long accessSeconds,
            @Value("${security.jwt.refresh-seconds:2592000}") long refreshSeconds
    ) {
        this.issuer = issuer;
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessSeconds = accessSeconds;
        this.refreshSeconds = refreshSeconds;
    }

    /**
     * 기존에 쓰던 메서드 그대로 유지
     *  - subject 에 userId(UUID) 저장
     *  - ev 클레임에 이메일 인증 여부 저장
     */
    public String createAccess(UUID userId, boolean emailVerified) {
        Instant now = Instant.now();
        return Jwts.builder()
                .issuer(issuer)
                .subject(userId.toString())
                .claim("ev", emailVerified)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(accessSeconds)))
                .signWith(secretKey)
                .compact();
    }

    /**
     * ✅ AuthService 가 호출하는 시그니처용 래퍼 메서드
     *  - email 파라미터는 지금은 쓰지 않지만, 호환을 위해 받기만 함
     *  - 내부에서는 기존 createAccess 를 그대로 사용
     */
    public String createAccessToken(UUID userId, String email, boolean emailVerified) {
        // 필요하면 여기서 email 도 claim 으로 넣을 수 있음
        return createAccess(userId, emailVerified);
    }

    // 토큰 파싱
    public Jws<Claims> parseSignedClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token);
    }
}
