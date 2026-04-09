import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  type AdminMemberDto,
  fetchAdminMembers,
  MEMBER_STATUS_LABEL,
} from '../../api/adminMembers'
import AdminGridPagination from './AdminGridPagination'
import AdminMemberEditModal from './AdminMemberEditModal'
import { DEFAULT_ADMIN_GRID_PAGE_SIZE, type AdminGridPageSize } from './adminGridPageSize'

function formatCreatedAt(iso: string): string {
  try {
    return new Date(iso).toLocaleString('ko-KR', {
      dateStyle: 'short',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

export default function AdminUsersPanel() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [members, setMembers] = useState<AdminMemberDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<AdminMemberDto | null>(null)
  const [userPage, setUserPage] = useState(0)
  const [userPageSize, setUserPageSize] = useState<AdminGridPageSize>(DEFAULT_ADMIN_GRID_PAGE_SIZE)

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(search), 350)
    return () => window.clearTimeout(t)
  }, [search])

  useEffect(() => {
    setUserPage(0)
  }, [debouncedSearch])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const list = await fetchAdminMembers(debouncedSearch)
      setMembers(list)
    } catch (err) {
      setError(err instanceof Error ? err.message : '목록을 불러오지 못했습니다.')
      setMembers([])
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch])

  useEffect(() => {
    void load()
  }, [load])

  const handleSaved = (updated: AdminMemberDto) => {
    setMembers(prev => prev.map(m => (m.id === updated.id ? updated : m)))
  }

  const totalUserPages = useMemo(() => {
    if (members.length === 0) return 0
    return Math.ceil(members.length / userPageSize)
  }, [members.length, userPageSize])

  useEffect(() => {
    if (totalUserPages === 0) return
    if (userPage >= totalUserPages) setUserPage(totalUserPages - 1)
  }, [totalUserPages, userPage])

  const pagedMembers = useMemo(() => {
    const start = userPage * userPageSize
    return members.slice(start, start + userPageSize)
  }, [members, userPage, userPageSize])

  return (
    <div className="admin-module">
      <div className="admin-toolbar">
        <div className="admin-field admin-field--grow">
          <label className="admin-label" htmlFor="admin-user-search">
            검색
          </label>
          <input
            id="admin-user-search"
            className="admin-input"
            type="search"
            name="userSearch"
            placeholder="로그인 ID · 이름"
            autoComplete="off"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button type="button" className="admin-btn-table" onClick={() => void load()} disabled={loading}>
          새로고침
        </button>
      </div>

      {error && <p className="admin-banner admin-banner--error">{error}</p>}
      {loading && <p className="admin-banner">불러오는 중…</p>}

      <div className="admin-table-scroll">
        <table className="admin-table">
          <thead>
            <tr>
              <th scope="col">회원 ID</th>
              <th scope="col">로그인 ID</th>
              <th scope="col">이름</th>
              <th scope="col">이메일</th>
              <th scope="col">전화</th>
              <th scope="col">가입일시</th>
              <th scope="col">상태</th>
              <th scope="col">작업</th>
            </tr>
          </thead>
          <tbody>
            {!loading && members.length === 0 && (
              <tr>
                <td className="admin-table__empty" colSpan={8}>
                  {error ? '데이터를 표시할 수 없습니다.' : '조건에 맞는 회원이 없습니다.'}
                </td>
              </tr>
            )}
            {pagedMembers.map(m => (
              <tr key={m.id}>
                <td>{m.id}</td>
                <td>{m.loginId}</td>
                <td>{m.name}</td>
                <td>{m.email ?? '—'}</td>
                <td>{m.phone ?? '—'}</td>
                <td>{formatCreatedAt(m.createdAt)}</td>
                <td>{MEMBER_STATUS_LABEL[m.status]}</td>
                <td>
                  <button type="button" className="admin-btn-table" onClick={() => setEditing(m)}>
                    수정
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AdminGridPagination
        selectId="admin-users-page-size"
        page={userPage}
        totalPages={totalUserPages}
        pageSize={userPageSize}
        onPageChange={setUserPage}
        onPageSizeChange={size => {
          setUserPage(0)
          setUserPageSize(size)
        }}
        disabled={loading}
        totalElements={members.length}
        hidden={loading || members.length === 0}
      />

      {editing && (
        <AdminMemberEditModal
          member={editing}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
          onDeleted={id => setMembers(prev => prev.filter(m => m.id !== id))}
        />
      )}
    </div>
  )
}
