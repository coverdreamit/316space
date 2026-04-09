import type { StoredAuth } from './types'

const KEY = '316space.auth'

export function loadStoredAuth(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Record<string, unknown>
    if (typeof parsed.accessToken !== 'string' || typeof parsed.role !== 'string') return null
    const loginId =
      typeof parsed.loginId === 'string'
        ? parsed.loginId
        : typeof parsed.email === 'string'
          ? parsed.email
          : ''
    return { accessToken: parsed.accessToken, role: parsed.role, loginId }
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
