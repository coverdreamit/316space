package com.space316.be.admin;

import com.space316.be.admin.dto.NotificationSettingsResponse;
import com.space316.be.admin.dto.NotificationSettingsUpdateRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/settings")
@RequiredArgsConstructor
public class AdminNotificationSettingsController {

  private final AdminNotificationSettingsService adminNotificationSettingsService;

  @GetMapping("/notifications")
  public ResponseEntity<NotificationSettingsResponse> getNotifications() {
    return ResponseEntity.ok(adminNotificationSettingsService.getNotificationSettings());
  }

  @PutMapping("/notifications")
  public ResponseEntity<NotificationSettingsResponse> putNotifications(
      @RequestBody NotificationSettingsUpdateRequest req) {
    return ResponseEntity.ok(adminNotificationSettingsService.updateNotificationSettings(req));
  }

  @PostMapping("/notifications/test")
  public ResponseEntity<Void> testNotifications() {
    adminNotificationSettingsService.sendSlackTestMessage();
    return ResponseEntity.noContent().build();
  }
}
