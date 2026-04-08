package com.space316.be.admin;

import com.space316.be.admin.dto.NotificationSettingsResponse;
import com.space316.be.admin.dto.NotificationSettingsUpdateRequest;
import com.space316.be.domain.settings.AppSetting;
import com.space316.be.domain.settings.AppSettingRepository;
import com.space316.be.slack.SlackIncomingWebhookNotifier;
import com.space316.be.slack.SlackProperties;
import com.space316.be.slack.SlackWebhookUrlProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminNotificationSettingsService {

  private final AppSettingRepository appSettingRepository;
  private final SlackWebhookUrlProvider slackWebhookUrlProvider;
  private final SlackProperties slackProperties;
  private final SlackIncomingWebhookNotifier slackIncomingWebhookNotifier;

  @Transactional(readOnly = true)
  public NotificationSettingsResponse getNotificationSettings() {
    boolean db = slackWebhookUrlProvider.hasDatabaseValue();
    String env = slackProperties.incomingWebhookUrl();
    boolean envSet = env != null && !env.isBlank();
    String source;
    if (db) {
      source = "DATABASE";
    } else if (envSet) {
      source = "ENVIRONMENT";
    } else {
      source = "NONE";
    }
    var effective = slackWebhookUrlProvider.currentWebhookUrl();
    String masked = effective.map(AdminNotificationSettingsService::maskSlackWebhookUrl).orElse(null);
    return new NotificationSettingsResponse(effective.isPresent(), source, masked);
  }

  @Transactional
  public NotificationSettingsResponse updateNotificationSettings(NotificationSettingsUpdateRequest req) {
    String raw = req.slackIncomingWebhookUrl();
    if (raw == null || raw.isBlank()) {
      appSettingRepository.deleteById(AppSetting.KEY_SLACK_INCOMING_WEBHOOK_URL);
      return getNotificationSettings();
    }
    String url = raw.trim();
    if (!url.startsWith("https://hooks.slack.com/services/")) {
      throw new IllegalArgumentException(
          "Slack Incoming Webhook URL은 https://hooks.slack.com/services/ 로 시작해야 합니다.");
    }
    appSettingRepository
        .findById(AppSetting.KEY_SLACK_INCOMING_WEBHOOK_URL)
        .ifPresentOrElse(
            row -> {
              row.updateValue(url);
              appSettingRepository.save(row);
            },
            () -> appSettingRepository.save(AppSetting.create(AppSetting.KEY_SLACK_INCOMING_WEBHOOK_URL, url)));
    return getNotificationSettings();
  }

  public void sendSlackTestMessage() {
    if (slackWebhookUrlProvider.currentWebhookUrl().isEmpty()) {
      throw new IllegalArgumentException(
          "Slack 웹훅 URL이 없습니다. 아래에 URL을 저장하거나 서버 환경 변수 SLACK_WEBHOOK_URL을 설정하세요.");
    }
    if (!slackIncomingWebhookNotifier.sendTestMessage()) {
      throw new IllegalArgumentException("Slack으로 테스트 메시지를 보내지 못했습니다. URL을 확인하세요.");
    }
  }

  static String maskSlackWebhookUrl(String url) {
    if (url == null || url.isBlank()) {
      return null;
    }
    int i = url.lastIndexOf('/');
    if (i <= 0 || i >= url.length() - 1) {
      return "https://hooks.slack.com/services/…";
    }
    return url.substring(0, i + 1) + "…";
  }
}
