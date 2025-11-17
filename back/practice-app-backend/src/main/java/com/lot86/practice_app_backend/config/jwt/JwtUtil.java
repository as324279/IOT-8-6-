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

// [팀 표준] 이 클래스가 '출입증 발급기' 역할
// @Component로 Spring Bean으로 등록
@Component
public class JwtUtil {

    private final String issuer;
    private final SecretKey secretKey; // SecretKey 객체로 보관
    private final long accessSeconds;
    private final long refreshSeconds;

    // application.yml에서 값을 읽어와서 JwtUtil을 생성
    public JwtUtil(
            @Value("${security.jwt.issuer}") String issuer,
            @Value("${security.jwt.secret}") String secret,
            @Value("${security.jwt.access-token-validity-seconds}") long accessSeconds,
            @Value("${security.jwt.refresh-token-validity-seconds}") long refreshSeconds
    ) {
        this.issuer = issuer;
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessSeconds = accessSeconds;
        this.refreshSeconds = refreshSeconds;
    }

    // [팀 표준] Access Token 생성 (AuthService에서 호출)
    public String createAccess(UUID userId, boolean emailVerified) {
        Instant now = Instant.now();
        return Jwts.builder()
                .issuer(issuer)//
                .subject(userId.toString()) // [중요] Subject에 email 대신 userId (UUID) 저장
                .claim("ev", emailVerified) // emailVerified 여부
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(accessSeconds)))
                .signWith(secretKey)
                .compact();
    }

    // (RefreshToken 생성 로직은 우선 생략)

    // [팀 표준] 토큰 검증 및 claims 파싱 (JwtAuthenticationFilter에서 호출)
    public Jws<Claims> parseSignedClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token);
    }
}
