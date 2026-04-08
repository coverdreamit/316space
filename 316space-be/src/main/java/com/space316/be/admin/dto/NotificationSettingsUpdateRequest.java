package com.space316.be.admin.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * @param slackIncomingWebhookUrl 비우면 DB에 저장된 웹훅만 삭제(환경 변수로 폴백). 값이 있으면 DB에 저장.
 */
public record NotificationSettingsUpdateRequest(
    @JsonProperty("slackIncomingWebhookUrl") String slackIncomingWebhookUrl) {}
