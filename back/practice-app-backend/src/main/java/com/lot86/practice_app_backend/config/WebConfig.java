package com.lot86.practice_app_backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

//이미지를 받아서 서버 폴더(uploads/)에 저장하고, URL을 뱉어주는 기능 생성
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // "/images/**" URL로 요청이 오면 로컬 "uploads/" 폴더의 파일을 보여줌
        registry.addResourceHandler("/images/**")
                .addResourceLocations("file:uploads/");
    }
}