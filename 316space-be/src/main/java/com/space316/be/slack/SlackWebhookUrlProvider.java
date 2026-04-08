package com.space316.be.slack;

import com.space316.be.domain.settings.AppSetting;
import com.space316.be.domain.settings.AppSettingRepository;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SlackWebhookUrlProvider {

  private final AppSettingRepository appSettingRepository;
  private final SlackProperties slackProperties;

  /** DB 값이 있으면 우선, 없으면 `slack.incoming-webhook-url`(환경 변수) */
  public Optional<String> currentWebhookUrl() {
    Optional<String> fromDb =
        appSettingRepository
            .findById(AppSetting.KEY_SLACK_INCOMING_WEBHOOK_URL)
            .map(AppSetting::getSettingValue)
            .map(String::trim)
            .filter(s -> !s.isEmpty());
    if (fromDb.isPresent()) {
      return fromDb;
    }
    String env = slackProperties.incomingWebhookUrl();
    if (env != null && !env.isBlank()) {
      return Optional.of(env.trim());
    }
    return Optional.empty();
  }

  public boolean hasDatabaseValue() {
    return appSettingRepository
        .findById(AppSetting.KEY_SLACK_INCOMING_WEBHOOK_URL)
        .map(AppSetting::getSettingValue)
        .map(String::trim)
        .filter(s -> !s.isEmpty())
        .isPresent();
  }
}
