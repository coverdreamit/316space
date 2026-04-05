package com.space316.be.member.dto;

public record ProfileAccessResponse(String profileAccessToken, long expiresIn) {

    public static ProfileAccessResponse of(String token, long expiresInMs) {
        return new ProfileAccessResponse(token, expiresInMs / 1000);
    }
}
