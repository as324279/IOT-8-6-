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
     * 이메일 인증번호 발송 (6자리 코드)
     */
    public void sendVerification(String to, String code) {

        try {
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
            System.out.println("📧 인증 메일 전송 완료 → " + to);

        } catch (Exception e) {
            System.err.println("❌ 이메일 전송 실패: " + e.getMessage());
            throw new IllegalStateException("이메일 전송 중 문제가 발생했습니다.");
        }
    }
}
