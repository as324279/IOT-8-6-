package com.lot86.practice_app_backend.config.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.util.Collections;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil; // 출입증 발급기 (비밀키 접근용)

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // 1. 손님이 헤더에 'Authorization'이라는 이름으로 출입증을 보냈는지 확인
        String authorizationHeader = request.getHeader("Authorization");

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            // 'Bearer ' 부분을 제외한 실제 토큰만 추출
            String token = authorizationHeader.substring(7);

            try {
                // 2. 출입증이 위조되지 않았는지, 유효기간이 남았는지 검증
                Jws<Claims> claimsJws = Jwts.parser()
                        .verifyWith(jwtUtil.getSecretKey()) // 비밀키로 검증
                        .build()
                        .parseSignedClaims(token);

                Claims claims = claimsJws.getPayload();
                String email = claims.getSubject();

                // 3. 출입증이 유효하면, 이 손님은 인증된 것으로 간주
                Authentication authentication = new UsernamePasswordAuthenticationToken(
                        email, null, Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")));

                // Spring Security에게 "이 손님 통과시켜도 좋습니다" 라고 알려줌
                SecurityContextHolder.getContext().setAuthentication(authentication);

            } catch (JwtException e) {
                // 토큰이 유효하지 않을 경우 (위조, 만료 등)
                logger.error("Invalid JWT token: " + e.getMessage());
                SecurityContextHolder.clearContext();
            }
        }

        // 다음 필터로 요청을 전달
        filterChain.doFilter(request, response);
    }

    // JwtUtil의 secretKey에 접근하기 위한 public getter 추가
    // JwtUtil.java 파일에도 getSecretKey() 메소드를 추가해야 함
}