package com.lot86.practice_app_backend.config.jwt;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component // 스프링의 부품(Bean)으로 등록
public class JwtUtil {

    private final SecretKey secretKey;
    private final long expirationHours;

    public JwtUtil(@Value("${jwt.secret.key}") String secret) {
        // application.properties에서 비밀 키를 가져와서 암호화 키 객체로 변환
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        // 토큰 유효시간 (예: 24시간)
        this.expirationHours = 24L;
    }

    // 이메일을 받아서 JWT를 생성하는 메소드
    public String generateToken(String email) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationHours * 60 * 60 * 1000);

        return Jwts.builder()
                .subject(email) // 토큰의 주체로 이메일을 설정
                .issuedAt(now) // 발급 시간
                .expiration(expiryDate) // 만료 시간
                .signWith(secretKey) // 비밀 키로 서명
                .compact(); // 문자열 형태로 압축
    }
    // JwtUtil.java 안에 추가
    public SecretKey getSecretKey() {
        return secretKey;
    }
}