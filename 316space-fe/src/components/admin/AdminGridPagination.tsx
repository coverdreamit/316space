import {
  ADMIN_GRID_PAGE_SIZES,
  isAdminGridPageSize,
  type AdminGridPageSize,
} from './adminGridPageSize'

type Props = {
  selectId: string
  page: number
  totalPages: number
  pageSize: AdminGridPageSize
  onPageChange: (page: number) => void
  onPageSizeChange: (size: AdminGridPageSize) => void
  disabled?: boolean
  totalElements?: number
  hidden?: boolean
}

export default function AdminGridPagination({
  selectId,
  page,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
  disabled = false,
  totalElements,
  hidden = false,
}: Props) {
  if (hidden) return null

  const tp = totalPages < 1 ? 1 : totalPages
  const canPrev = page > 0 && !disabled
  const canNext = totalPages > 0 ? page < totalPages - 1 && !disabled : false

  return (
    <div className="admin-toolbar admin-toolbar--wrap admin-toolbar--pagination" style={{ marginTop: '1rem' }}>
      <select
        id={selectId}
        className="admin-select admin-select--pagination"
        aria-label="페이지당 표시 개수"
        value={pageSize}
        disabled={disabled}
        onChange={e => {
          const v = Number(e.target.value)
          if (isAdminGridPageSize(v)) onPageSizeChange(v)
        }}
      >
        {ADMIN_GRID_PAGE_SIZES.map(s => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <button
        type="button"
        className="admin-btn-table"
        disabled={!canPrev}
        onClick={() => onPageChange(Math.max(0, page - 1))}
      >
        이전
      </button>
      <span
        className="admin-label"
        style={{ alignSelf: 'center', textTransform: 'none', letterSpacing: 'normal' }}
      >
        {page + 1} / {tp}
      </span>
      <button
        type="button"
        className="admin-btn-table"
        disabled={!canNext}
        onClick={() => onPageChange(page + 1)}
      >
        다음
      </button>
      {totalElements != null && (
        <span
          className="admin-label"
          style={{ alignSelf: 'center', textTransform: 'none', letterSpacing: 'normal' }}
        >
          총 {totalElements.toLocaleString('ko-KR')}건
        </span>
      )}
    </div>
  )
}
