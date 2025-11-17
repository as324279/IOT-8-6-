package com.lot86.practice_app_backend; // 네 폴더 경로와 일치할 거야

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {

    @GetMapping("/api/hello")
    public String hello() {
        return "Hello From My Spring Boot Server!";
    }
}