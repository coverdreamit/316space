import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../auth/AuthContext'

interface LoginModalProps {
  onClose: () => void
  onSwitchToSignup: () => void
}

export default function LoginModal({ onClose, onSwitchToSignup }: LoginModalProps) {
  const { login } = useAuth()
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const loginIdRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loginIdRef.current?.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(loginId, password)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="로그인"
    >
      <div className="modal">
        <div className="modal__header">
          <span className="modal__eyebrow">316스페이스</span>
          <h2 className="modal__title">Login</h2>
        </div>

        <form className="modal__form" onSubmit={handleSubmit}>
          {error && <p className="modal__error modal__error--banner">{error}</p>}
          <div className="modal__field">
            <label className="modal__label" htmlFor="login-id">
              아이디
            </label>
            <input
              id="login-id"
              ref={loginIdRef}
              className="modal__input"
              type="text"
              value={loginId}
              onChange={e => setLoginId(e.target.value)}
              placeholder="아이디"
              autoComplete="username"
              required
            />
          </div>

          <div className="modal__field">
            <label className="modal__label" htmlFor="login-password">
              Password
            </label>
            <input
              id="login-password"
              className="modal__input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          <button className="modal__submit" type="submit" disabled={loading}>
            {loading ? '처리 중…' : 'Login'}
          </button>

          <button className="modal__signup" type="button" onClick={onSwitchToSignup}>
            회원가입
          </button>
        </form>

        <button type="button" className="modal__close" onClick={onClose} aria-label="닫기">
          ✕
        </button>
      </div>
    </div>
  )
}
