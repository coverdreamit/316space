import { useCallback, useEffect, useState } from 'react'
import { deleteAdminScheduleBlock, fetchAdminScheduleBlocks } from '../../api/adminScheduleBlocks'
import { type ScheduleBlockDto, SCHEDULE_BLOCK_TYPE_LABEL } from '../../api/bookingCalendar'
import AdminScheduleBlockModal from './AdminScheduleBlockModal'

function ymd(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function defaultFromTo(): { from: string; to: string } {
  const start = new Date()
  const end = new Date()
  end.setDate(end.getDate() + 14)
  return { from: ymd(start), to: ymd(end) }
}

function formatRange(iso: string): string {
  try {
    return new Date(iso).toLocaleString('ko-KR', {
      dateStyle: 'short',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

export default function AdminScheduleBlocksPanel() {
  const [{ from, to }, setRange] = useState(defaultFromTo)
  const [hallFilter, setHallFilter] = useState('')
  const [blocks, setBlocks] = useState<ScheduleBlockDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  /** 닫힘 | 신규 | 수정 대상 */
  const [modal, setModal] = useState<'closed' | 'create' | ScheduleBlockDto>('closed')

  const openCreate = () => setModal('create')

  const openEdit = (b: ScheduleBlockDto) => setModal(b)

  const closeModal = () => setModal('closed')

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    if (from > to) {
      setError('시작일은 종료일보다 빠르거나 같아야 합니다.')
      setBlocks([])
      setLoading(false)
      return
    }
    const fromDt = `${from}T00:00:00`
    const toDt = `${to}T23:59:59`
    try {
      const list = await fetchAdminScheduleBlocks({
        from: fromDt,
        to: toDt,
        hallId: hallFilter.trim() === '' ? undefined : hallFilter.trim(),
      })
      setBlocks(list)
    } catch (err) {
      setError(err instanceof Error ? err.message : '목록을 불러오지 못했습니다.')
      setBlocks([])
    } finally {
      setLoading(false)
    }
  }, [from, to, hallFilter])

  useEffect(() => {
    void load()
  }, [load])

  const handleDelete = async (b: ScheduleBlockDto) => {
    if (!window.confirm(`이 블록을 삭제할까요?\n${SCHEDULE_BLOCK_TYPE_LABEL[b.blockType]} · ${formatRange(b.startAt)}`)) {
      return
    }
    try {
      await deleteAdminScheduleBlock(b.id)
      void load()
    } catch (err) {
      window.alert(err instanceof Error ? err.message : '삭제에 실패했습니다.')
    }
  }

  return (
    <div className="admin-module">
      <h3 className="admin-panel-section-title">스케줄 블록</h3>
      <div className="admin-toolbar">
        <div className="admin-field">
          <label className="admin-label" htmlFor="admin-block-from">
            시작일
          </label>
          <input
            id="admin-block-from"
            className="admin-input"
            type="date"
            value={from}
            onChange={e => setRange(r => ({ ...r, from: e.target.value }))}
          />
        </div>
        <div className="admin-field">
          <label className="admin-label" htmlFor="admin-block-to">
            종료일
          </label>
          <input
            id="admin-block-to"
            className="admin-input"
            type="date"
            value={to}
            onChange={e => setRange(r => ({ ...r, to: e.target.value }))}
          />
        </div>
        <div className="admin-field">
          <label className="admin-label" htmlFor="admin-block-hall-filter">
            호실 필터
          </label>
          <input
            id="admin-block-hall-filter"
            className="admin-input"
            type="text"
            placeholder="전체"
            value={hallFilter}
            onChange={e => setHallFilter(e.target.value)}
            maxLength={30}
          />
        </div>
        <button type="button" className="admin-btn-table" onClick={() => void load()} disabled={loading}>
          조회
        </button>
        <button type="button" className="admin-btn-table" onClick={openCreate}>
          블록 추가
        </button>
      </div>

      {error && <p className="admin-banner admin-banner--error">{error}</p>}
      {loading && <p className="admin-banner">불러오는 중…</p>}

      <div className="admin-table-scroll">
        <table className="admin-table">
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">호실</th>
              <th scope="col">구분</th>
              <th scope="col">시작</th>
              <th scope="col">종료</th>
              <th scope="col">제목</th>
              <th scope="col">작업</th>
            </tr>
          </thead>
          <tbody>
            {!loading && blocks.length === 0 && (
              <tr>
                <td className="admin-table__empty" colSpan={7}>
                  {error ? '데이터를 표시할 수 없습니다.' : '해당 기간에 등록된 블록이 없습니다.'}
                </td>
              </tr>
            )}
            {blocks.map(b => (
              <tr key={b.id}>
                <td>{b.id}</td>
                <td>{b.hallId}</td>
                <td>{SCHEDULE_BLOCK_TYPE_LABEL[b.blockType]}</td>
                <td>{formatRange(b.startAt)}</td>
                <td>{formatRange(b.endAt)}</td>
                <td>{b.title ?? '—'}</td>
                <td>
                  <button type="button" className="admin-btn-table" onClick={() => openEdit(b)}>
                    수정
                  </button>{' '}
                  <button type="button" className="admin-btn-table" onClick={() => void handleDelete(b)}>
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal !== 'closed' && (
        <AdminScheduleBlockModal
          key={modal === 'create' ? 'new' : String(modal.id)}
          block={modal === 'create' ? null : modal}
          onClose={closeModal}
          onSaved={() => void load()}
        />
      )}
    </div>
  )
}
