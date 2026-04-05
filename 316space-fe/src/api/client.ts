let getAccessToken: () => string | null = () => null

export function setAccessTokenGetter(fn: () => string | null): void {
  getAccessToken = fn
}

async function readErrorMessage(res: Response): Promise<string> {
  const text = await res.text()
  try {
    const j = JSON.parse(text) as Record<string, unknown>
    const msg =
      (typeof j.message === 'string' && j.message) ||
      (typeof j.detail === 'string' && j.detail) ||
      (typeof j.title === 'string' && j.title)
    if (msg) return msg
    // Spring 기본 에러 JSON 등에서 message가 비어 있고 error만 있는 경우(예: Forbidden)
    if (typeof j.error === 'string' && j.error && res.status === 403) {
      return '로그인이 만료되었거나 권한이 없습니다. 다시 로그인한 뒤 시도해 주세요.'
    }
    if (typeof j.error === 'string' && j.error) return j.error
    return text || res.statusText
  } catch {
    if (res.status === 403) {
      return '로그인이 만료되었거나 권한이 없습니다. 다시 로그인한 뒤 시도해 주세요.'
    }
    return text || res.statusText
  }
}

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers)
  const token = getAccessToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (init.body != null && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  return fetch(path, { ...init, headers })
}

export async function apiFetchJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await apiFetch(path, init)
  if (!res.ok) throw new Error(await readErrorMessage(res))
  return res.json() as Promise<T>
}

export { readErrorMessage }
