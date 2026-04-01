package com.space316.be.domain.sms;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "sms_verification")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SmsVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 20)
    private String phone;

    @Column(nullable = false, length = 6)
    private String code;

    @Column(nullable = false)
    private boolean verified;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    private SmsVerification(String phone, String code, LocalDateTime expiresAt) {
        this.phone = phone;
        this.code = code;
        this.verified = false;
        this.expiresAt = expiresAt;
        this.createdAt = LocalDateTime.now();
    }

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }

    public void verify() {
        this.verified = true;
    }
}
