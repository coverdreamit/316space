package com.space316.be.admin.dto;

public record NotificationSettingsResponse(
    boolean slackWebhookConfigured,
    /** DATABASE | ENVIRONMENT | NONE */
    String slackWebhookSource,
    /** 현재 적용 중인 전체 웹훅 URL (없으면 null). 관리자 API 전용. */
    String slackWebhookUrl,
    /** false이면 자동 알림(예약·문의) 전송 안 함. 테스트 전송은 허용. */
    boolean slackNotificationsEnabled) {}
