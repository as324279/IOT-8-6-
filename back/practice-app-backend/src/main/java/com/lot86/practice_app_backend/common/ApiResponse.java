package com.lot86.practice_app_backend.common;

// record: Java 16+에서 사용하는 불변 데이터 객체 (Lombok @Data와 유사)
public record ApiResponse<T>(
        T data,
        String error,
        String traceId // (추후 에러 추적을 위해 남겨둠)
) {
    // 성공 시
    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(data, null, null);
    }

    // 실패 시 (ErrorHandler가 사용)
    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(null, message, null);
    }
}
