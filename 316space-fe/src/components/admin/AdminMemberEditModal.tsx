import { useEffect, useRef, useState } from 'react'
import {
  type AdminMemberDto,
  type MemberStatus,
  MEMBER_STATUS_LABEL,
  deleteAdminMember,
  patchAdminMember,
} from '../../api/adminMembers'

interface AdminMemberEditModalProps {
  member: AdminMemberDto
  onClose: () => void
  onSaved: (updated: AdminMemberDto) => void
  onDeleted: (id: number) => void
}

export default function AdminMemberEditModal({
  member,
  onClose,
  onSaved,
  onDeleted,
}: AdminMemberEditModalProps) {
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const [name, setName] = useState(member.name)
  const [email, setEmail] = useState(member.email ?? '')
  const [phone, setPhone] = useState(member.phone ?? '')
  const [status, setStatus] = useState<MemberStatus>(member.status)
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    closeBtnRef.current?.focus()
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const pw = newPassword.trim()
    setSaving(true)
    try {
      const body: Parameters<typeof patchAdminMember>[1] = {
        name: name.trim(),
        email: email.trim() === '' ? null : email.trim(),
        phone: phone.trim() === '' ? null : phone.trim(),
        status,
      }
      if (pw !== '') body.password = pw
      const updated = await patchAdminMember(member.id, body)
      onSaved(updated)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setError(null)
    const ok = window.confirm(
      `회원「${member.loginId}」을(를) DB에서 완전히 삭제할까요?\n연결된 예약·문의의 회원 참조는 해제됩니다. 이 작업은 되돌릴 수 없습니다.`,
    )
    if (!ok) return
    setDeleting(true)
    try {
      await deleteAdminMember(member.id)
      onDeleted(member.id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : '삭제에 실패했습니다.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="admin-member-edit-title">
      <div className="modal">
        <div className="modal__header">
          <span className="modal__eyebrow">관리자</span>
          <h2 className="modal__title" id="admin-member-edit-title">
            회원 정보 수정
          </h2>
          <button
            ref={closeBtnRef}
            type="button"
            className="modal__close"
            onClick={onClose}
            aria-label="닫기"
          >
            ×
          </button>
        </div>
        <form className="modal__form" onSubmit={handleSubmit}>
          <div className="modal__field">
            <label className="modal__label" htmlFor="admin-edit-login-id">
              로그인 ID
            </label>
            <input
              id="admin-edit-login-id"
              className="modal__input modal__input--readonly"
              readOnly
              value={member.loginId}
            />
          </div>
          <div className="modal__field">
            <label className="modal__label" htmlFor="admin-edit-name">
              이름
            </label>
            <input
              id="admin-edit-name"
              className="modal__input"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              maxLength={50}
              autoComplete="name"
            />
          </div>
          <div className="modal__field">
            <label className="modal__label" htmlFor="admin-edit-email">
              이메일
            </label>
            <input
              id="admin-edit-email"
              className="modal__input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              maxLength={100}
              autoComplete="email"
            />
          </div>
          <div className="modal__field">
            <label className="modal__label" htmlFor="admin-edit-phone">
              전화
            </label>
            <input
              id="admin-edit-phone"
              className="modal__input"
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              maxLength={20}
              autoComplete="tel"
            />
          </div>
          <div className="modal__field">
            <label className="modal__label" htmlFor="admin-edit-status">
              상태
            </label>
            <select
              id="admin-edit-status"
              className="admin-select admin-select--modal"
              value={status}
              onChange={e => setStatus(e.target.value as MemberStatus)}
            >
              {(Object.keys(MEMBER_STATUS_LABEL) as MemberStatus[]).map(s => (
                <option key={s} value={s}>
                  {MEMBER_STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </div>
          <div className="modal__field">
            <label className="modal__label" htmlFor="admin-edit-password">
              새 비밀번호 <span className="modal__optional">(선택)</span>
            </label>
            <input
              id="admin-edit-password"
              className="modal__input"
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="변경하지 않으려면 비워 두세요"
            />
          </div>
          {error && <p className="modal__error modal__error--banner">{error}</p>}
          <div className="admin-modal-actions">
            <button
              type="button"
              className="admin-btn-danger"
              onClick={() => void handleDelete()}
              disabled={saving || deleting}
            >
              {deleting ? '삭제 중…' : '회원 삭제'}
            </button>
            <div className="admin-modal-actions__end">
              <button type="button" className="modal__signup" onClick={onClose} disabled={saving || deleting}>
                취소
              </button>
              <button type="submit" className="modal__submit" disabled={saving || deleting}>
                {saving ? '저장 중…' : '저장'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
