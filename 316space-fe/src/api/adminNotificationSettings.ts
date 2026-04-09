import { apiFetch, apiFetchJson, HttpError, readErrorMessage } from "./client";

export interface NotificationSettingsDto {
  slackWebhookConfigured: boolean;
  slackWebhookSource: "DATABASE" | "ENVIRONMENT" | "NONE" | string;
  slackWebhookUrl: string | null;
  /** false이면 예약·문의 자동 Slack 전송 안 함(테스트 전송은 가능). */
  slackNotificationsEnabled: boolean;
}

/** 구 백엔드 JSON 필드명·필드 누락 호환 */
type NotificationSettingsRaw = Omit<
  NotificationSettingsDto,
  "slackWebhookUrl" | "slackNotificationsEnabled"
> & {
  slackWebhookUrl?: string | null;
  slackWebhookUrlMasked?: string | null;
  slackNotificationsEnabled?: boolean;
};

function normalizeNotificationSettings(raw: NotificationSettingsRaw): NotificationSettingsDto {
  const fromNew = raw.slackWebhookUrl?.trim();
  const fromLegacy = raw.slackWebhookUrlMasked?.trim();
  const slackWebhookUrl = fromNew || fromLegacy || null;
  return {
    slackWebhookConfigured: raw.slackWebhookConfigured,
    slackWebhookSource: raw.slackWebhookSource,
    slackWebhookUrl,
    slackNotificationsEnabled: raw.slackNotificationsEnabled ?? true,
  };
}

export async function fetchNotificationSettings(): Promise<NotificationSettingsDto> {
  const raw = await apiFetchJson<NotificationSettingsRaw>(
    "/api/admin/settings/notifications",
  );
  return normalizeNotificationSettings(raw);
}

export type NotificationSettingsPutBody = {
  slackIncomingWebhookUrl?: string;
  slackNotificationsEnabled?: boolean;
};

export async function putNotificationSettings(
  body: NotificationSettingsPutBody,
): Promise<NotificationSettingsDto> {
  const raw = await apiFetchJson<NotificationSettingsRaw>(
    "/api/admin/settings/notifications",
    {
      method: "PUT",
      body: JSON.stringify(body),
    },
  );
  return normalizeNotificationSettings(raw);
}

export async function postNotificationTest(): Promise<void> {
  const res = await apiFetch("/api/admin/settings/notifications/test", {
    method: "POST",
  });
  if (!res.ok) throw new HttpError(await readErrorMessage(res), res.status);
}
