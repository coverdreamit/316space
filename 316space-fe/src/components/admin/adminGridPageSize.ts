export const ADMIN_GRID_PAGE_SIZES = [10, 20, 30, 40, 50] as const

export type AdminGridPageSize = (typeof ADMIN_GRID_PAGE_SIZES)[number]

export const DEFAULT_ADMIN_GRID_PAGE_SIZE: AdminGridPageSize = 20

export function isAdminGridPageSize(n: number): n is AdminGridPageSize {
  return (ADMIN_GRID_PAGE_SIZES as readonly number[]).includes(n)
}
