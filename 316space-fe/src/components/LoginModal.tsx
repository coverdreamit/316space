import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../auth/AuthContext'

interface LoginModalProps {
  onClose: () => void
  onSwitchToSignup: () => void
}

export default function LoginModal({ onClose, onSwitchToSignup }: LoginModalProps) {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    emailRef.current?.focus()

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
      await login(email, password)
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
      ref={overlayRef}
      onClick={handleOverlayClick}
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
            <label className="modal__label" htmlFor="login-email">
              Email
            </label>
            <input
              id="login-email"
              ref={emailRef}
              className="modal__input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="example@email.com"
              autoComplete="email"
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

        <button className="modal__close" onClick={onClose} aria-label="닫기">
          ✕
        </button>
      </div>
    </div>
  )
}
