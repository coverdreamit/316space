import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { readErrorMessage, setAccessTokenGetter } from '../api/client'
import { clearStoredAuth, loadStoredAuth, saveStoredAuth } from './storage'
import type { StoredAuth, TokenResponse } from './types'

interface AuthContextValue {
  accessToken: string | null
  role: string | null
  loginId: string | null
  isAuthenticated: boolean
  login: (loginId: string, password: string) => Promise<void>
  register: (payload: {
    loginId: string
    password: string
    name: string
    email?: string | null
    phone?: string | null
  }) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function toStoredAuth(data: TokenResponse, loginId: string): StoredAuth {
  return { accessToken: data.accessToken, role: data.role, loginId }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<StoredAuth | null>(() => loadStoredAuth())

  useEffect(() => {
    setAccessTokenGetter(() => auth?.accessToken ?? null)
  }, [auth?.accessToken])

  const login = useCallback(async (loginId: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loginId: loginId.trim(), password }),
    })
    if (!res.ok) throw new Error(await readErrorMessage(res))
    const data = (await res.json()) as TokenResponse
    const next = toStoredAuth(data, loginId.trim())
    saveStoredAuth(next)
    setAuth(next)
  }, [])

  const register = useCallback(
    async (payload: {
      loginId: string
      password: string
      name: string
      email?: string | null
      phone?: string | null
    }) => {
      const body: Record<string, unknown> = {
        loginId: payload.loginId.trim(),
        password: payload.password,
        name: payload.name.trim(),
      }
      const email = payload.email?.trim()
      if (email) body.email = email
      const phone = payload.phone?.trim()
      if (phone) body.phone = phone

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error(await readErrorMessage(res))
    },
    [],
  )

  const logout = useCallback(() => {
    clearStoredAuth()
    setAuth(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      accessToken: auth?.accessToken ?? null,
      role: auth?.role ?? null,
      loginId: auth?.loginId ?? null,
      isAuthenticated: Boolean(auth?.accessToken),
      login,
      register,
      logout,
    }),
    [auth, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
