package com.lot86.practice_app_backend.auth.dto;


import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserSignupRequest {

    @NotBlank(message = "이메일은 필수 입력값입니다.")
    @Email(message = "이메일 형식이 올바르지 않습니다.")
    private String email;

    @NotBlank(message = "비밀번호는 필수 입력값입니다.")
    @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,}$", message = "비밀번호는 8자 이상, 영문과 숫자를 포함해야 합니다.")
    private String password;

    @NotBlank(message = "이름은 필수 입력값입니다.")
    @Size(min = 1, max = 30, message = "이름은 1자 이상 30자 이하로 입력해야 합니다.")
    private String name;

    // --- 약관 동의 필드 추가 ---
    @AssertTrue(message = "서비스 이용약관에 동의해야 합니다.") // 이 필드가 true여야 함
    private boolean agreeTos; // 서비스 이용약관 동의 여부

    @AssertTrue(message = "개인정보 수집 및 이용에 동의해야 합니다.") // 이 필드가 true여야 함
    private boolean agreePrivacy; // 개인정보 수집 및 이용 동의 여부
}