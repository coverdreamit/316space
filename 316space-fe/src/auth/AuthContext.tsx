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
  email: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (payload: {
    email: string
    password: string
    name: string
    phone: string
  }) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function toStoredAuth(data: TokenResponse, email: string): StoredAuth {
  return { accessToken: data.accessToken, role: data.role, email }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<StoredAuth | null>(() => loadStoredAuth())

  useEffect(() => {
    setAccessTokenGetter(() => auth?.accessToken ?? null)
  }, [auth?.accessToken])

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) throw new Error(await readErrorMessage(res))
    const data = (await res.json()) as TokenResponse
    const next = toStoredAuth(data, email.trim())
    saveStoredAuth(next)
    setAuth(next)
  }, [])

  const register = useCallback(
    async (payload: { email: string; password: string; name: string; phone: string }) => {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: payload.email.trim(),
          password: payload.password,
          name: payload.name.trim(),
          phone: payload.phone,
        }),
      })
      if (!res.ok) throw new Error(await readErrorMessage(res))
      const data = (await res.json()) as TokenResponse
      const next = toStoredAuth(data, payload.email.trim())
      saveStoredAuth(next)
      setAuth(next)
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
      email: auth?.email ?? null,
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
