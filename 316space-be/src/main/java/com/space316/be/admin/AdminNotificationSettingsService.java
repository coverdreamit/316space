package com.space316.be.admin;

import com.space316.be.audit.ActivityAuditAction;
import com.space316.be.audit.AuditLogService;
import com.space316.be.admin.dto.NotificationSettingsResponse;
import com.space316.be.admin.dto.NotificationSettingsUpdateRequest;
import com.space316.be.domain.settings.AppSetting;
import com.space316.be.domain.settings.AppSettingRepository;
import com.space316.be.slack.SlackIncomingWebhookNotifier;
import com.space316.be.slack.SlackNotificationsEnabled;
import com.space316.be.slack.SlackWebhookUrlProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminNotificationSettingsService {

  private final AppSettingRepository appSettingRepository;
  private final SlackWebhookUrlProvider slackWebhookUrlProvider;
  private final SlackNotificationsEnabled slackNotificationsEnabled;
  private final SlackIncomingWebhookNotifier slackIncomingWebhookNotifier;
  private final AuditLogService auditLogService;

  @Transactional(readOnly = true)
  public NotificationSettingsResponse getNotificationSettings() {
    boolean db = slackWebhookUrlProvider.hasDatabaseValue();
    String source = db ? "DATABASE" : "NONE";
    var effective = slackWebhookUrlProvider.currentWebhookUrl();
    String url = effective.orElse(null);
    boolean enabled = slackNotificationsEnabled.isEnabled();
    return new NotificationSettingsResponse(effective.isPresent(), source, url, enabled);
  }

  @Transactional
  public NotificationSettingsResponse updateNotificationSettings(NotificationSettingsUpdateRequest req) {
    if (req.slackIncomingWebhookUrl() != null) {
      updateWebhookUrl(req.slackIncomingWebhookUrl());
    }
    if (req.slackNotificationsEnabled() != null) {
      if (Boolean.TRUE.equals(req.slackNotificationsEnabled())) {
        appSettingRepository.deleteById(AppSetting.KEY_SLACK_NOTIFICATIONS_ENABLED);
      } else {
        saveNotificationsEnabledFlag(false);
      }
    }
    if (req.slackIncomingWebhookUrl() != null || req.slackNotificationsEnabled() != null) {
      auditLogService.recordForCurrentAdmin(
          ActivityAuditAction.ADMIN_NOTIFICATION_SETTINGS_UPDATE, "SETTINGS", "notifications", null);
    }
    return getNotificationSettings();
  }

  private void updateWebhookUrl(String raw) {
    if (raw.isBlank()) {
      appSettingRepository.deleteById(AppSetting.KEY_SLACK_INCOMING_WEBHOOK_URL);
      return;
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
  }

  private void saveNotificationsEnabledFlag(boolean enabled) {
    String value = enabled ? "true" : "false";
    appSettingRepository
        .findById(AppSetting.KEY_SLACK_NOTIFICATIONS_ENABLED)
        .ifPresentOrElse(
            row -> {
              row.updateValue(value);
              appSettingRepository.save(row);
            },
            () ->
                appSettingRepository.save(
                    AppSetting.create(AppSetting.KEY_SLACK_NOTIFICATIONS_ENABLED, value)));
  }

  public void sendSlackTestMessage() {
    if (slackWebhookUrlProvider.currentWebhookUrl().isEmpty()) {
      throw new IllegalArgumentException(
          "Slack 웹훅 URL이 없습니다. 관리자 화면에서 URL을 저장한 뒤 다시 시도해 주세요.");
    }
    if (!slackIncomingWebhookNotifier.sendTestMessage()) {
      throw new IllegalArgumentException("Slack으로 테스트 메시지를 보내지 못했습니다. URL을 확인하세요.");
    }
    auditLogService.recordForCurrentAdmin(
        ActivityAuditAction.ADMIN_NOTIFICATION_TEST, "SETTINGS", "notifications", "Slack 테스트 전송");
  }

}
