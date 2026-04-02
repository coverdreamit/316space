import type { StoredAuth } from './types'

const KEY = '316space.auth'

export function loadStoredAuth(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredAuth
    if (
      typeof parsed?.accessToken === 'string' &&
      typeof parsed?.role === 'string' &&
      typeof parsed?.email === 'string'
    ) {
      return parsed
    }
    return null
  } catch {
    return null
  }
}

export function saveStoredAuth(auth: StoredAuth): void {
  localStorage.setItem(KEY, JSON.stringify(auth))
}

export function clearStoredAuth(): void {
  localStorage.removeItem(KEY)
}
