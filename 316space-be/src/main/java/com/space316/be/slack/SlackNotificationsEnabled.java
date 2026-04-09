package com.space316.be.slack;

import com.space316.be.domain.settings.AppSetting;
import com.space316.be.domain.settings.AppSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SlackNotificationsEnabled {

  private final AppSettingRepository appSettingRepository;

  /** DB에 명시적으로 false가 아니면 전송 허용(기본 켜짐). */
  public boolean isEnabled() {
    return appSettingRepository
        .findById(AppSetting.KEY_SLACK_NOTIFICATIONS_ENABLED)
        .map(AppSetting::getSettingValue)
        .map(String::trim)
        .map(v -> !"false".equalsIgnoreCase(v))
        .orElse(true);
  }
}
