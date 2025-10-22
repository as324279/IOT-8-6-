package com.lot86.practice_app_backend.user;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final String senderEmail; // 1. 보내는 사람 이메일 (properties에서 주입)

    // 2. 생성자에서 mailSender와 properties의 spring.mail.username 값을 주입받음
    public EmailService(JavaMailSender mailSender,
                        @Value("${spring.mail.username}") String senderEmail) {
        this.mailSender = mailSender;
        this.senderEmail = senderEmail;
    }

    // 3. 인증 메일 발송
    public void sendVerification(String to, String token) {
        // 4. 프론트엔드 인증 페이지 URL (팀 표준에 맞춰 수정 필요)
        String link = "http://localhost:3000/verify-email?token=" + token; // (임시 프론트 URL)

        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setFrom(senderEmail); // [수정] 보내는 사람 설정 (properties 값)
        msg.setTo(to);
        msg.setSubject("[Household] 이메일 인증을 완료해주세요");
        msg.setText("아래 링크를 눌러 이메일 인증을 완료하세요:\n" + link + "\n\n유효기간: 24시간");

        mailSender.send(msg);
    }
}
