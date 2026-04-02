import { useEffect, useRef, useState } from 'react'
import { apiFetch, apiFetchJson, readErrorMessage } from '../api/client'

function toRegisterPhone(input: string): string | null {
  const d = input.replace(/\D/g, '')
  if (d.length === 11 && d.startsWith('010')) {
    return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7, 11)}`
  }
  return null
}

function isValidOptionalEmail(s: string): boolean {
  const t = s.trim()
  if (!t) return true
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)
}

interface MemberProfile {
  loginId: string
  name: string
  email: string | null
  phone: string | null
}

interface ProfileModalProps {
  profileAccessToken: string
  onClose: () => void
}

export default function ProfileModal({ profileAccessToken, onClose }: ProfileModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [loginId, setLoginId] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string
    email?: string
    phone?: string
    newPassword?: string
    newPasswordConfirm?: string
  }>({})

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoadError(null)
      setLoading(true)
      try {
        const data = await apiFetchJson<MemberProfile>('/api/members/me')
        if (cancelled) return
        setLoginId(data.loginId)
        setName(data.name ?? '')
        setEmail(data.email ?? '')
        setPhone(data.phone?.replace(/\D/g, '') ?? '')
      } catch (e) {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : '불러오지 못했습니다.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!loading && !loadError) nameRef.current?.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [loading, loadError, onClose])

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) onClose()
  }

  const validate = (): boolean => {
    const next: typeof fieldErrors = {}
    if (!name.trim()) next.name = '이름을 입력해주세요.'
    if (!isValidOptionalEmail(email)) next.email = '이메일 형식을 확인해주세요.'
    if (phone.trim()) {
      if (!toRegisterPhone(phone)) {
        next.phone = '010으로 시작하는 11자리 번호를 입력해 주세요.'
      }
    }
    const wantPwChange = Boolean(newPassword.trim() || newPasswordConfirm.trim())
    if (wantPwChange) {
      if (!newPassword.trim()) next.newPassword = '새 비밀번호를 입력해 주세요.'
      else if (newPassword.length < 8) next.newPassword = '새 비밀번호는 8자 이상이어야 합니다.'
      else if (newPassword.length > 30) next.newPassword = '새 비밀번호는 30자 이하여야 합니다.'
      if (newPassword !== newPasswordConfirm) next.newPasswordConfirm = '새 비밀번호가 일치하지 않습니다.'
    }
    setFieldErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    if (!validate()) return
    const phoneFormatted = phone.trim() ? toRegisterPhone(phone) : null
    if (phone.trim() && !phoneFormatted) return
    setSaving(true)
    try {
      const body: Record<string, unknown> = {
        name: name.trim(),
        email: email.trim() || null,
        phone: phoneFormatted,
        profileAccessToken,
      }
      if (newPassword.trim()) {
        body.newPassword = newPassword
      }
      const res = await apiFetch('/api/members/me', {
        method: 'PATCH',
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error(await readErrorMessage(res))
      onClose()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : '저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="modal-overlay"
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="개인정보 변경"
    >
      <div className="modal modal--signup">
        <div className="modal__header">
          <span className="modal__eyebrow">316스페이스</span>
          <h2 className="modal__title">개인정보 변경</h2>
        </div>

        {loading && <p className="modal__form">불러오는 중…</p>}
        {loadError && (
          <p className="modal__form modal__error modal__error--banner">{loadError}</p>
        )}

        {!loading && !loadError && (
          <form className="modal__form" onSubmit={handleSubmit} noValidate>
            {submitError && (
              <p className="modal__error modal__error--banner">{submitError}</p>
            )}

            <div className="modal__field">
              <label className="modal__label" htmlFor="profile-login-id">
                아이디 <span className="modal__optional">(변경 불가)</span>
              </label>
              <input
                id="profile-login-id"
                className="modal__input modal__input--readonly"
                type="text"
                value={loginId}
                readOnly
                tabIndex={-1}
                aria-readonly="true"
                autoComplete="username"
              />
            </div>

            <div className="modal__field">
              <label className="modal__label" htmlFor="profile-name">
                이름 <span className="modal__required">*</span>
              </label>
              <input
                id="profile-name"
                ref={nameRef}
                className="modal__input"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                autoComplete="name"
              />
              {fieldErrors.name && <span className="modal__error">{fieldErrors.name}</span>}
            </div>

            <div className="modal__divider" />
            <p className="modal__hint">비밀번호를 바꾸지 않으면 아래 새 비밀번호 칸은 비워 두세요.</p>

            <div className="modal__field">
              <label className="modal__label" htmlFor="profile-new-password">
                새 비밀번호 <span className="modal__optional">(선택)</span>
              </label>
              <input
                id="profile-new-password"
                className="modal__input"
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="8~30자"
                autoComplete="new-password"
              />
              {fieldErrors.newPassword && <span className="modal__error">{fieldErrors.newPassword}</span>}
            </div>

            <div className="modal__field">
              <label className="modal__label" htmlFor="profile-new-password-confirm">
                새 비밀번호 확인 <span className="modal__optional">(선택)</span>
              </label>
              <input
                id="profile-new-password-confirm"
                className="modal__input"
                type="password"
                value={newPasswordConfirm}
                onChange={e => setNewPasswordConfirm(e.target.value)}
                autoComplete="new-password"
              />
              {fieldErrors.newPasswordConfirm && (
                <span className="modal__error">{fieldErrors.newPasswordConfirm}</span>
              )}
            </div>

            <div className="modal__divider" />

            <div className="modal__field">
              <label className="modal__label" htmlFor="profile-email">
                이메일 <span className="modal__optional">(선택)</span>
              </label>
              <input
                id="profile-email"
                className="modal__input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
              {fieldErrors.email && <span className="modal__error">{fieldErrors.email}</span>}
            </div>

            <div className="modal__field">
              <label className="modal__label" htmlFor="profile-phone">
                휴대폰 번호 <span className="modal__optional">(선택)</span>
              </label>
              <input
                id="profile-phone"
                className="modal__input"
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="01012345678"
                autoComplete="tel"
              />
              {fieldErrors.phone && <span className="modal__error">{fieldErrors.phone}</span>}
            </div>

            <button className="modal__submit" type="submit" disabled={saving}>
              {saving ? '저장 중…' : '저장'}
            </button>
          </form>
        )}

        <button className="modal__close" type="button" onClick={onClose} aria-label="닫기">
          ✕
        </button>
      </div>
    </div>
  )
}
