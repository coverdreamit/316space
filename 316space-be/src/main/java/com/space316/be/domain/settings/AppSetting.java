package com.space316.be.domain.settings;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "app_setting")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AppSetting {

  public static final String KEY_SLACK_INCOMING_WEBHOOK_URL = "slack.incoming_webhook_url";

  @Id
  @Column(name = "setting_key", length = 100)
  private String settingKey;

  @Column(name = "setting_value", columnDefinition = "TEXT")
  private String settingValue;

  @Column(name = "updated_at", nullable = false)
  private LocalDateTime updatedAt;

  public static AppSetting create(String key, String value) {
    AppSetting s = new AppSetting();
    s.settingKey = key;
    s.settingValue = value;
    s.updatedAt = LocalDateTime.now();
    return s;
  }

  public void updateValue(String value) {
    this.settingValue = value;
    this.updatedAt = LocalDateTime.now();
  }
}
