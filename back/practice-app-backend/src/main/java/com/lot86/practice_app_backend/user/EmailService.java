package com.lot86.practice_app_backend.user;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final String senderEmail;

    public EmailService(JavaMailSender mailSender,
                        @Value("${spring.mail.username}") String senderEmail) {
        this.mailSender = mailSender;
        this.senderEmail = senderEmail;
    }

    /**
     * 6자리 인증번호 발송용
     * @param to   수신자 이메일
     * @param code 6자리 인증번호 (예: "123456")
     */
    public void sendVerification(String to, String code) {
        SimpleMailMessage msg = new SimpleMailMessage();

        // Gmail은 "이름 <이메일>" 형식이 안정적
        msg.setFrom("Household App <" + senderEmail + ">");
        msg.setTo(to);
        msg.setSubject("[Household] 이메일 인증번호 안내");

        msg.setText(
                "안녕하세요.\n\n" +
                        "이메일 인증을 위해 아래 인증번호를 입력해주세요.\n\n" +
                        "📌 인증번호: " + code + "\n\n" +
                        "인증번호 유효시간: 10분\n" +
                        "앱/웹의 이메일 인증 화면에 위 인증번호를 입력해주세요.\n\n" +
                        "감사합니다."
        );

        mailSender.send(msg);
    }
}
