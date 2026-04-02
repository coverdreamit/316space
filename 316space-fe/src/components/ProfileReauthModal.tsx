import { useEffect, useRef, useState } from 'react'
import { apiFetch, readErrorMessage } from '../api/client'
import { useAuth } from '../auth/AuthContext'

interface ProfileAccessResponse {
  profileAccessToken: string
  expiresIn: number
}

interface ProfileReauthModalProps {
  onClose: () => void
  onVerified: (profileAccessToken: string) => void
}

export default function ProfileReauthModal({ onClose, onVerified }: ProfileReauthModalProps) {
  const { loginId } = useAuth()
  const overlayRef = useRef<HTMLDivElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    passwordRef.current?.focus()
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await apiFetch('/api/members/me/profile-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (!res.ok) throw new Error(await readErrorMessage(res))
      const data = (await res.json()) as ProfileAccessResponse
      onVerified(data.profileAccessToken)
    } catch (err) {
      setError(err instanceof Error ? err.message : '확인에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="modal-overlay"
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="개인정보 본인 확인"
    >
      <div className="modal modal--signup">
        <div className="modal__header">
          <span className="modal__eyebrow">316스페이스</span>
          <h2 className="modal__title">본인 확인</h2>
        </div>

        <form className="modal__form" onSubmit={handleSubmit}>
          <p className="modal__hint modal__hint--first">
            개인정보 변경을 위해 현재 비밀번호를 입력해 주세요.
          </p>
          {error && <p className="modal__error modal__error--banner">{error}</p>}
          {loginId ? (
            <input
              className="modal__visually-hidden"
              type="text"
              name="username"
              value={loginId}
              readOnly
              tabIndex={-1}
              autoComplete="username"
              aria-hidden="true"
            />
          ) : null}
          <div className="modal__field">
            <label className="modal__label" htmlFor="profile-reauth-password">
              현재 비밀번호
            </label>
            <input
              id="profile-reauth-password"
              ref={passwordRef}
              className="modal__input"
              type="password"
              name="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          <button className="modal__submit" type="submit" disabled={loading}>
            {loading ? '확인 중…' : '다음'}
          </button>
        </form>

        <button className="modal__close" type="button" onClick={onClose} aria-label="닫기">
          ✕
        </button>
      </div>
    </div>
  )
}
