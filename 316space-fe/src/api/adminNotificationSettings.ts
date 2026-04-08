import { apiFetch, apiFetchJson, HttpError, readErrorMessage } from './client'

export interface NotificationSettingsDto {
  slackWebhookConfigured: boolean
  slackWebhookSource: 'DATABASE' | 'ENVIRONMENT' | 'NONE' | string
  slackWebhookUrlMasked: string | null
}

export async function fetchNotificationSettings(): Promise<NotificationSettingsDto> {
  return apiFetchJson<NotificationSettingsDto>('/api/admin/settings/notifications')
}

export async function putNotificationSettings(slackIncomingWebhookUrl: string): Promise<NotificationSettingsDto> {
  return apiFetchJson<NotificationSettingsDto>('/api/admin/settings/notifications', {
    method: 'PUT',
    body: JSON.stringify({ slackIncomingWebhookUrl }),
  })
}

export async function postNotificationTest(): Promise<void> {
  const res = await apiFetch('/api/admin/settings/notifications/test', { method: 'POST' })
  if (!res.ok) throw new HttpError(await readErrorMessage(res), res.status)
}
