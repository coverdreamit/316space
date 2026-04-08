import { useCallback, useEffect, useState } from 'react'
import {
  fetchNotificationSettings,
  postNotificationTest,
  putNotificationSettings,
  type NotificationSettingsDto,
} from '../../api/adminNotificationSettings'

const SOURCE_LABEL: Record<string, string> = {
  DATABASE: '데이터베이스에 저장됨',
  ENVIRONMENT: '서버 환경 변수(SLACK_WEBHOOK_URL)',
  NONE: '설정 없음',
}

export default function AdminNotificationSettingsPanel() {
  const [settings, setSettings] = useState<NotificationSettingsDto | null>(null)
  const [webhookInput, setWebhookInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const s = await fetchNotificationSettings()
      setSettings(s)
      setWebhookInput('')
    } catch (err) {
      setError(err instanceof Error ? err.message : '설정을 불러오지 못했습니다.')
      setSettings(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const onSave = async () => {
    const trimmed = webhookInput.trim()
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const next = await putNotificationSettings(trimmed)
      setSettings(next)
      setWebhookInput('')
      setSuccess(
        trimmed
          ? 'Slack 웹훅 URL을 저장했습니다. 예약·문의 시 이 주소로 알림이 전송됩니다.'
          : 'DB에 저장된 웹훅을 지웠습니다. 환경 변수가 있으면 그 값을 사용합니다.',
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const onTest = async () => {
    setTesting(true)
    setError(null)
    setSuccess(null)
    try {
      await postNotificationTest()
      setSuccess('테스트 메시지를 Slack으로 보냈습니다. 채널을 확인해 주세요.')
    } catch (err) {
      setError(err instanceof Error ? err.message : '테스트 전송에 실패했습니다.')
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="admin-module">
      <div className="admin-toolbar admin-toolbar--wrap">
        <h2 className="admin-settings__title">알림 · Slack</h2>
        <button type="button" className="admin-btn-table" onClick={() => void load()} disabled={loading}>
          새로고침
        </button>
      </div>

      {error && <p className="admin-banner admin-banner--error">{error}</p>}
      {success && <p className="admin-banner admin-banner--success">{success}</p>}
      {loading && <p className="admin-banner">불러오는 중…</p>}

      {!loading && settings && (
        <div className="admin-settings">
          <dl className="admin-settings__meta">
            <div>
              <dt>현재 사용 중</dt>
              <dd>{settings.slackWebhookConfigured ? '예' : '아니오 (알림 비활성)'}</dd>
            </div>
            <div>
              <dt>값 출처</dt>
              <dd>{SOURCE_LABEL[settings.slackWebhookSource] ?? settings.slackWebhookSource}</dd>
            </div>
            {settings.slackWebhookUrlMasked && (
              <div>
                <dt>웹훅 URL 미리보기</dt>
                <dd>
                  <code className="admin-settings__code">{settings.slackWebhookUrlMasked}</code>
                </dd>
              </div>
            )}
          </dl>

          <p className="admin-settings__hint">
            Slack 앱의 <strong>Incoming Webhooks</strong>에서 발급한{' '}
            <code className="admin-settings__code">https://hooks.slack.com/services/…</code> 전체를 붙여 넣고 저장하세요.
            <br />
            칸을 <strong>비운 채 저장</strong>하면 DB에만 저장된 URL이 삭제되고, 서버 환경 변수가 있으면 그쪽 값이 사용됩니다.
            <br />
            DB와 환경 변수가 모두 없으면 예약·문의 알림은 보내지 않습니다.
          </p>

          <div className="admin-field admin-field--grow admin-settings__field">
            <label className="admin-label" htmlFor="admin-slack-webhook">
              새 Slack Incoming Webhook URL
            </label>
            <input
              id="admin-slack-webhook"
              className="admin-input"
              type="url"
              name="slackWebhook"
              autoComplete="off"
              placeholder="https://hooks.slack.com/services/…"
              value={webhookInput}
              onChange={e => setWebhookInput(e.target.value)}
            />
          </div>

          <div className="admin-settings__actions">
            <button type="button" className="admin-btn-primary" onClick={() => void onSave()} disabled={saving}>
              {saving ? '저장 중…' : '저장'}
            </button>
            <button
              type="button"
              className="admin-btn-table"
              onClick={() => void onTest()}
              disabled={testing || !settings.slackWebhookConfigured}
              title={
                settings.slackWebhookConfigured
                  ? '현재 적용 중인 웹훅으로 테스트 메시지 전송'
                  : '먼저 웹훅 URL을 저장하거나 환경 변수를 설정하세요'
              }
            >
              {testing ? '전송 중…' : '테스트 전송'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
