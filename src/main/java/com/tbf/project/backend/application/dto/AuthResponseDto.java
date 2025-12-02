package com.tbf.project.backend.application.dto;

public record AuthResponseDto(String token,
                              Long expiresAt,
                              String message,
                              String error) {
    public static AuthResponseDto success(String token, Long expiresAt, String message) {
        return new AuthResponseDto(token, System.currentTimeMillis() + 3600000, message, null);
    }
    public static AuthResponseDto failure(String message) {
        return new AuthResponseDto(null, null, message, "AUTH_ERROR");
    }
}
