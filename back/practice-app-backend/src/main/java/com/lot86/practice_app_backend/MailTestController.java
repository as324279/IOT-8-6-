package com.lot86.practice_app_backend;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lot86.practice_app_backend.user.EmailService;
//메일 기능 되는지 안되는지 시험용으로 만듦.
@RestController
@RequiredArgsConstructor
@RequestMapping("/test-mail")
public class MailTestController {

    private final EmailService emailService;

    @GetMapping
    public String send() {
        emailService.sendVerification("shonori710@gmail.com", "TEST-CODE");
        return "ok";
    }
}
