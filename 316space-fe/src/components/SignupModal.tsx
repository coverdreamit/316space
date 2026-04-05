import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../auth/AuthContext'

const LOGIN_ID_PATTERN = /^[a-zA-Z0-9._-]{3,30}$/

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

interface SignupModalProps {
  onClose: () => void
  onSwitchToLogin: () => void
}

interface FormState {
  name: string
  loginId: string
  contactEmail: string
  phone: string
  password: string
  passwordConfirm: string
  agreeTerms: boolean
  agreePrivacy: boolean
}

type FormErrors = Partial<Record<keyof FormState, string>>

export default function SignupModal({ onClose, onSwitchToLogin }: SignupModalProps) {
  const { register } = useAuth()
  const nameRef = useRef<HTMLInputElement>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState<FormState>({
    name: '',
    loginId: '',
    contactEmail: '',
    phone: '',
    password: '',
    passwordConfirm: '',
    agreeTerms: false,
    agreePrivacy: false,
  })
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    nameRef.current?.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const set = (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(prev => ({
        ...prev,
        [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
      }))

  const validate = (): boolean => {
    const next: FormErrors = {}
    if (!form.name.trim()) next.name = '이름을 입력해주세요.'
    const id = form.loginId.trim()
    if (!id) next.loginId = '아이디를 입력해주세요.'
    else if (!LOGIN_ID_PATTERN.test(id)) {
      next.loginId = '아이디는 3~30자, 영문·숫자·._- 만 사용할 수 있습니다.'
    }
    if (form.password.length < 8) next.password = '비밀번호는 8자 이상이어야 합니다.'
    if (form.password !== form.passwordConfirm) next.passwordConfirm = '비밀번호가 일치하지 않습니다.'
    if (!isValidOptionalEmail(form.contactEmail)) next.contactEmail = '이메일 형식을 확인해주세요.'
    if (form.phone.trim()) {
      if (!toRegisterPhone(form.phone)) {
        next.phone = '010으로 시작하는 11자리 번호를 입력해 주세요. (예: 01012345678)'
      }
    }
    if (!form.agreeTerms) next.agreeTerms = '이용약관에 동의해주세요.'
    if (!form.agreePrivacy) next.agreePrivacy = '개인정보 처리방침에 동의해주세요.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    if (!validate()) return
    const phoneFormatted = form.phone.trim() ? toRegisterPhone(form.phone) : null
    if (form.phone.trim() && !phoneFormatted) return
    setLoading(true)
    try {
      await register({
        loginId: form.loginId.trim(),
        password: form.password,
        name: form.name.trim(),
        email: form.contactEmail.trim() || undefined,
        phone: phoneFormatted ?? undefined,
      })
      onSwitchToLogin()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : '회원가입에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="회원가입"
    >
      <div className="modal modal--signup">
        <div className="modal__header modal__header--signup">
          <div className="modal__header-main">
            <span className="modal__eyebrow">316스페이스</span>
            <h2 className="modal__title">회원가입</h2>
          </div>
          <button type="button" className="modal__close" onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>

        <form className="modal__form" onSubmit={handleSubmit} noValidate>
          {submitError && (
            <p className="modal__error modal__error--banner">{submitError}</p>
          )}

          <div className="modal__field">
            <label className="modal__label" htmlFor="signup-name">
              이름 <span className="modal__required">*</span>
            </label>
            <input
              id="signup-name"
              ref={nameRef}
              className="modal__input"
              type="text"
              value={form.name}
              onChange={set('name')}
              placeholder="홍길동"
              autoComplete="name"
            />
            {errors.name && <span className="modal__error">{errors.name}</span>}
          </div>

          <div className="modal__field">
            <label className="modal__label" htmlFor="signup-login-id">
              아이디 <span className="modal__required">*</span>
            </label>
            <input
              id="signup-login-id"
              className="modal__input"
              type="text"
              value={form.loginId}
              onChange={set('loginId')}
              placeholder="영문·숫자·._- (3~30자)"
              autoComplete="username"
            />
            {errors.loginId && <span className="modal__error">{errors.loginId}</span>}
          </div>

          <div className="modal__field">
            <label className="modal__label" htmlFor="signup-password">
              비밀번호 <span className="modal__required">*</span>
            </label>
            <input
              id="signup-password"
              className="modal__input"
              type="password"
              value={form.password}
              onChange={set('password')}
              placeholder="8자 이상"
              autoComplete="new-password"
            />
            {errors.password && <span className="modal__error">{errors.password}</span>}
          </div>

          <div className="modal__field">
            <label className="modal__label" htmlFor="signup-password-confirm">
              비밀번호 확인 <span className="modal__required">*</span>
            </label>
            <input
              id="signup-password-confirm"
              className="modal__input"
              type="password"
              value={form.passwordConfirm}
              onChange={set('passwordConfirm')}
              placeholder="••••••••"
              autoComplete="new-password"
            />
            {errors.passwordConfirm && <span className="modal__error">{errors.passwordConfirm}</span>}
          </div>

          <div className="modal__field">
            <label className="modal__label" htmlFor="signup-contact-email">
              이메일 <span className="modal__optional">(선택)</span>
            </label>
            <input
              id="signup-contact-email"
              className="modal__input"
              type="email"
              value={form.contactEmail}
              onChange={set('contactEmail')}
              placeholder="연락용 이메일"
              autoComplete="email"
            />
            {errors.contactEmail && <span className="modal__error">{errors.contactEmail}</span>}
          </div>

          <div className="modal__field">
            <label className="modal__label" htmlFor="signup-phone">
              휴대폰 번호 <span className="modal__optional">(선택)</span>
            </label>
            <input
              id="signup-phone"
              className="modal__input"
              type="tel"
              value={form.phone}
              onChange={set('phone')}
              placeholder="01012345678"
              autoComplete="tel"
            />
            {errors.phone && <span className="modal__error">{errors.phone}</span>}
          </div>

          <div className="modal__divider" />

          <div className="modal__agreements">
            <label className="modal__check-row">
              <input
                className="modal__checkbox"
                type="checkbox"
                checked={form.agreeTerms}
                onChange={set('agreeTerms')}
              />
              <span className="modal__check-label">
                <span className="modal__required">[필수]</span> 이용약관 동의
              </span>
            </label>
            {errors.agreeTerms && <span className="modal__error">{errors.agreeTerms}</span>}

            <label className="modal__check-row">
              <input
                className="modal__checkbox"
                type="checkbox"
                checked={form.agreePrivacy}
                onChange={set('agreePrivacy')}
              />
              <span className="modal__check-label">
                <span className="modal__required">[필수]</span> 개인정보 처리방침 동의
              </span>
            </label>
            {errors.agreePrivacy && <span className="modal__error">{errors.agreePrivacy}</span>}
          </div>

          <button className="modal__submit" type="submit" disabled={loading}>
            {loading ? '처리 중…' : '가입하기'}
          </button>

          <button className="modal__signup" type="button" onClick={onSwitchToLogin}>
            이미 계정이 있으신가요? 로그인
          </button>
        </form>
      </div>
    </div>
  )
}
