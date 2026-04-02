package com.space316.be.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class JwtProvider {

    public static final String CLAIM_PURPOSE = "purpose";
    public static final String PURPOSE_PROFILE_EDIT = "PROFILE_EDIT";

    private final SecretKey secretKey;
    private final long expirationMs;
    private final long profileEditExpirationMs;

    public JwtProvider(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration-ms}") long expirationMs,
            @Value("${jwt.profile-edit-expiration-ms}") long profileEditExpirationMs) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
        this.profileEditExpirationMs = profileEditExpirationMs;
    }

    public String generate(Long memberId, String role) {
        Date now = new Date();
        return Jwts.builder()
                .subject(String.valueOf(memberId))
                .claim("role", role)
                .issuedAt(now)
                .expiration(new Date(now.getTime() + expirationMs))
                .signWith(secretKey)
                .compact();
    }

    public String generateProfileEditToken(Long memberId) {
        Date now = new Date();
        return Jwts.builder()
                .subject(String.valueOf(memberId))
                .claim(CLAIM_PURPOSE, PURPOSE_PROFILE_EDIT)
                .issuedAt(now)
                .expiration(new Date(now.getTime() + profileEditExpirationMs))
                .signWith(secretKey)
                .compact();
    }

    /** 개인정보 변경(PATCH) 요청 시 본인 확인용 토큰 검증 */
    public void assertProfileEditToken(String token, Long expectedMemberId) {
        final Claims claims;
        try {
            claims = parse(token);
        } catch (JwtException | IllegalArgumentException e) {
            throw new IllegalArgumentException("개인정보 확인이 만료되었거나 올바르지 않습니다. 다시 시도해 주세요.");
        }
        if (!PURPOSE_PROFILE_EDIT.equals(claims.get(CLAIM_PURPOSE, String.class))) {
            throw new IllegalArgumentException("개인정보 확인이 만료되었거나 올바르지 않습니다. 다시 시도해 주세요.");
        }
        if (!Long.valueOf(claims.getSubject()).equals(expectedMemberId)) {
            throw new IllegalArgumentException("개인정보 확인이 만료되었거나 올바르지 않습니다. 다시 시도해 주세요.");
        }
    }

    public long getProfileEditExpirationMs() {
        return profileEditExpirationMs;
    }

    public Claims parse(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean isValid(String token) {
        try {
            parse(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public Long getMemberId(String token) {
        return Long.valueOf(parse(token).getSubject());
    }

    public String getRole(String token) {
        return parse(token).get("role", String.class);
    }
}
