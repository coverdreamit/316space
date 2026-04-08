package com.space316.be.admin.dto;

public record NotificationSettingsResponse(
    boolean slackWebhookConfigured,
    /** DATABASE | ENVIRONMENT | NONE */
    String slackWebhookSource,
    /** 마지막 경로만 숨긴 미리보기 (전체 URL은 응답에 포함하지 않음) */
    String slackWebhookUrlMasked) {}
