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

  /** 관리자 화면에서 DB에 저장한 웹훅만 사용합니다(환경 변수 폴백 없음). */
  public Optional<String> currentWebhookUrl() {
    return appSettingRepository
        .findById(AppSetting.KEY_SLACK_INCOMING_WEBHOOK_URL)
        .map(AppSetting::getSettingValue)
        .map(String::trim)
        .filter(s -> !s.isEmpty());
  }

  public boolean hasDatabaseValue() {
    return currentWebhookUrl().isPresent();
  }
}
