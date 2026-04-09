import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { setApiWarningHandler } from '../api/client'
import './ApiWarningProvider.css'

export function ApiWarningProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null)

  const showWarning = useCallback((msg: string) => {
    setMessage(msg)
  }, [])

  useEffect(() => {
    setApiWarningHandler(showWarning)
    return () => setApiWarningHandler(null)
  }, [showWarning])

  useEffect(() => {
    if (!message) return
    const t = window.setTimeout(() => setMessage(null), 10000)
    return () => window.clearTimeout(t)
  }, [message])

  return (
    <>
      {message ? (
        <div className="api-warning-banner" role="alert">
          <p className="api-warning-banner__text">{message}</p>
          <button
            type="button"
            className="api-warning-banner__dismiss"
            onClick={() => setMessage(null)}
            aria-label="닫기"
          >
            닫기
          </button>
        </div>
      ) : null}
      {children}
    </>
  )
}
