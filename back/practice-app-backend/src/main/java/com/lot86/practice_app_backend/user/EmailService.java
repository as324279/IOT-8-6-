package com.lot86.practice_app_backend.user;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final String senderEmail;
    private final String senderName; // [신규] 발송자 이름 추가

    public EmailService(JavaMailSender mailSender,
                        @Value("${spring.mail.username}") String senderEmail,
                        @Value("${app.mail.sender-name:Practice App}") String senderName) {
        this.mailSender = mailSender;
        this.senderEmail = senderEmail;
        this.senderName = senderName;
    }

    public void sendVerification(String to, String code) {
        if (to == null || to.isBlank()) throw new IllegalArgumentException("수신자 이메일이 비어 있습니다.");

        SimpleMailMessage msg = new SimpleMailMessage();
        // [변경] "앱이름 <이메일>" 형식으로 발송자 설정
        msg.setFrom(senderName + " <" + senderEmail + ">");
        msg.setTo(to);
        msg.setSubject("[" + senderName + "] 이메일 인증번호 안내");
        msg.setText(
                "안녕하세요.\n\n" +
                        "이메일 인증을 위해 아래 인증번호를 입력해주세요.\n\n" +
                        "📌 인증번호: " + code + "\n\n" +
                        "10분 내에 입력해주세요.\n" +
                        "감사합니다.\n- " + senderName
        );
        mailSender.send(msg);
    }
}