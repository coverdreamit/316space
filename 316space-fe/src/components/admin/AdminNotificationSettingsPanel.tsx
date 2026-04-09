import { useCallback, useEffect, useState } from "react";
import {
  fetchNotificationSettings,
  postNotificationTest,
  putNotificationSettings,
  type NotificationSettingsDto,
} from "../../api/adminNotificationSettings";

export default function AdminNotificationSettingsPanel() {
  const [settings, setSettings] = useState<NotificationSettingsDto | null>(
    null,
  );
  const [webhookInput, setWebhookInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const s = await fetchNotificationSettings();
      setSettings(s);
      setWebhookInput("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "설정을 불러오지 못했습니다.",
      );
      setSettings(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const onSave = async () => {
    const trimmed = webhookInput.trim();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const next = await putNotificationSettings({
        slackIncomingWebhookUrl: trimmed,
      });
      setSettings(next);
      setWebhookInput("");
      setSuccess(
        trimmed
          ? "Slack 웹훅 URL을 저장했습니다. 예약·문의 시 이 주소로 알림이 전송됩니다."
          : "저장된 웹훅을 삭제했습니다. 알림을 쓰려면 다시 URL을 저장하세요.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const onTest = async () => {
    setTesting(true);
    setError(null);
    setSuccess(null);
    try {
      await postNotificationTest();
      setSuccess("테스트 메시지를 Slack으로 보냈습니다. 채널을 확인해 주세요.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "테스트 전송에 실패했습니다.",
      );
    } finally {
      setTesting(false);
    }
  };

  const onRemoveWebhook = async () => {
    if (
      !window.confirm(
        "저장된 Slack 웹훅 URL을 삭제할까요? 삭제 후에는 예약·문의 알림이 전송되지 않습니다.",
      )
    ) {
      return;
    }
    setMutating(true);
    setError(null);
    setSuccess(null);
    try {
      const next = await putNotificationSettings({
        slackIncomingWebhookUrl: "",
      });
      setSettings(next);
      setSuccess("웹훅을 삭제했습니다. 알림을 쓰려면 URL을 다시 저장하세요.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제에 실패했습니다.");
    } finally {
      setMutating(false);
    }
  };

  const onSetNotificationsEnabled = async (enabled: boolean) => {
    setMutating(true);
    setError(null);
    setSuccess(null);
    try {
      const next = await putNotificationSettings({ slackNotificationsEnabled: enabled });
      setSettings(next);
      setSuccess(
        enabled
          ? "Slack 자동 알림을 켰습니다. 예약·문의 시 메시지가 전송됩니다."
          : "Slack 자동 알림을 껐습니다. 테스트 전송은 계속할 수 있습니다.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "설정 변경에 실패했습니다.");
    } finally {
      setMutating(false);
    }
  };

  return (
    <div className="admin-module">
      <div className="admin-toolbar admin-toolbar--wrap">
        <h2 className="admin-settings__title">알림 · Slack</h2>
        <button
          type="button"
          className="admin-btn-table"
          onClick={() => void load()}
          disabled={loading}
        >
          새로고침
        </button>
      </div>

      {error && <p className="admin-banner admin-banner--error">{error}</p>}
      {success && (
        <p className="admin-banner admin-banner--success">{success}</p>
      )}
      {loading && <p className="admin-banner">불러오는 중…</p>}

      {!loading && settings && (
        <div className="admin-settings">
          <dl className="admin-settings__meta">
            <div>
              <dt>자동 알림 전송</dt>
              <dd>
                {settings.slackWebhookConfigured && settings.slackNotificationsEnabled
                  ? "예 (예약·문의 시 Slack)"
                  : !settings.slackWebhookConfigured
                    ? "아니오 (웹훅 없음)"
                    : "아니오 (알림 꺼짐)"}
              </dd>
            </div>
            <div>
              <dt>알림 스위치</dt>
              <dd>{settings.slackNotificationsEnabled ? "켜짐" : "꺼짐"}</dd>
            </div>
            <div>
              <dt>적용된 웹훅 URL</dt>
              <dd>
                {settings.slackWebhookUrl ? (
                  <code className="admin-settings__code">
                    {settings.slackWebhookUrl}
                  </code>
                ) : settings.slackWebhookConfigured ? (
                  <span className="admin-settings__url-missing">
                    주소를 응답에서 받지 못했습니다. 백엔드를 최신 코드로 다시 빌드·실행했는지
                    확인해 주세요.
                  </span>
                ) : (
                  <span className="admin-settings__url-missing">—</span>
                )}
              </dd>
            </div>
          </dl>

          <p className="admin-settings__hint">
            Slack 앱의 <strong>Incoming Webhooks</strong>에서 발급한{" "}
            <code className="admin-settings__code">
              https://hooks.slack.com/services/…
            </code>{" "}
            전체를 붙여 넣고 저장하세요. 주소는 <strong>서버 DB에만</strong> 저장되며, 환경 변수로는
            넣지 않습니다.
            <br />
            <strong>비운 채 저장</strong>하거나 <strong>웹훅 제거</strong>를 누르면 저장된 URL이
            지워지고, 예약·문의 알림은 보내지 않습니다.
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
              onChange={(e) => setWebhookInput(e.target.value)}
            />
          </div>

          <div className="admin-settings__actions">
            <button
              type="button"
              className="admin-btn-primary"
              onClick={() => void onSave()}
              disabled={saving || mutating}
            >
              {saving ? "저장 중…" : "저장"}
            </button>
            <button
              type="button"
              className="admin-btn-table"
              onClick={() => void onTest()}
              disabled={testing || mutating || !settings.slackWebhookConfigured}
              title={
                settings.slackWebhookConfigured
                  ? "현재 적용 중인 웹훅으로 테스트 메시지 전송"
                  : "먼저 위에서 웹훅 URL을 저장하세요"
              }
            >
              {testing ? "전송 중…" : "테스트 전송"}
            </button>
            <button
              type="button"
              className="admin-btn-table admin-btn-table--danger"
              onClick={() => void onRemoveWebhook()}
              disabled={mutating || saving || !settings.slackWebhookConfigured}
              title={
                settings.slackWebhookConfigured
                  ? "DB에 저장된 웹훅 URL을 삭제합니다"
                  : "저장된 웹훅이 없습니다"
              }
            >
              웹훅 제거
            </button>
            <button
              type="button"
              className="admin-btn-table"
              onClick={() => void onSetNotificationsEnabled(false)}
              disabled={mutating || saving || !settings.slackNotificationsEnabled}
            >
              알림 끄기
            </button>
            <button
              type="button"
              className="admin-btn-table"
              onClick={() => void onSetNotificationsEnabled(true)}
              disabled={mutating || saving || settings.slackNotificationsEnabled}
            >
              알림 켜기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
