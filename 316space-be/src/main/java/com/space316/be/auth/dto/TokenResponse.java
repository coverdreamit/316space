package com.space316.be.auth.dto;

public record TokenResponse(
        String accessToken,
        String tokenType,
        long expiresIn,
        String role
) {
    public static TokenResponse of(String token, long expiresInMs, String role) {
        return new TokenResponse(token, "Bearer", expiresInMs / 1000, role);
    }
}
