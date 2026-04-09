package com.space316.be.admin.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * @param slackIncomingWebhookUrl null이면 URL은 변경하지 않음. 빈 문자열이면 DB 웹훅 삭제. 값이 있으면 DB에 저장.
 * @param slackNotificationsEnabled null이면 변경하지 않음.
 */
public record NotificationSettingsUpdateRequest(
    @JsonProperty("slackIncomingWebhookUrl") String slackIncomingWebhookUrl,
    @JsonProperty("slackNotificationsEnabled") Boolean slackNotificationsEnabled) {}
