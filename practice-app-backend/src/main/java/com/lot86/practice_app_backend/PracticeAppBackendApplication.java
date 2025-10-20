package com.lot86.practice_app_backend;

// import 문 3개가 모두 있는지 확인하세요.

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// @SpringBootApplication 뒤에 괄호와 내용이 반드시 있어야 합니다! 머였더라...ㅋ
@SpringBootApplication//(exclude = SecurityAutoConfiguration.class)
public class PracticeAppBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(PracticeAppBackendApplication.class, args);
    }

}