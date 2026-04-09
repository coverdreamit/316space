let getAccessToken: () => string | null = () => null;
let onAuthFailure: (() => void) | null = null;

export function setAccessTokenGetter(fn: () => string | null): void {
  getAccessToken = fn;
}

/** 로그아웃 등 세션 정리. AuthProvider에서 등록합니다. */
export function setAuthFailureHandler(fn: (() => void) | null): void {
  onAuthFailure = fn;
}

/** 401만 세션 만료로 본다. 403은 로그인은 됐으나 리소스 권한이 없는 경우가 많아 로그아웃하면 안 됨. */
function maybeInvalidateSession(res: Response): void {
  if (res.ok) return;
  if (res.status !== 401) return;
  if (!getAccessToken()) return;
  onAuthFailure?.();
}

export type ReadErrorMessageOptions = {
  /** false이면 403일 때 세션 만료 안내 대신 서버의 error 필드·본문을 그대로 씁니다. (로그인 요청 등) */
  replaceForbiddenWithSessionHint?: boolean;
};

async function readErrorMessage(
  res: Response,
  options: ReadErrorMessageOptions = {},
): Promise<string> {
  const useSessionHintOn403 = options.replaceForbiddenWithSessionHint !== false;
  const text = await res.text();
  try {
    const j = JSON.parse(text) as Record<string, unknown>;
    const msg =
      (typeof j.message === "string" && j.message) ||
      (typeof j.detail === "string" && j.detail) ||
      (typeof j.title === "string" && j.title);
    if (msg) return msg;
    // Spring 기본 에러 JSON 등에서 message가 비어 있고 error만 있는 경우(예: Forbidden)
    if (typeof j.error === "string" && j.error && res.status === 403) {
      if (useSessionHintOn403) {
        return "로그인이 만료되었거나 권한이 없습니다. 다시 로그인한 뒤 시도해 주세요.";
      }
      return j.error;
    }
    if (typeof j.error === "string" && j.error) return j.error;
    return text || res.statusText;
  } catch {
    if (res.status === 403 && useSessionHintOn403) {
      return "로그인이 만료되었거나 권한이 없습니다. 다시 로그인한 뒤 시도해 주세요.";
    }
    return text || res.statusText;
  }
}

export async function apiFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(init.headers);
  const token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body != null && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(path, { ...init, headers });
  maybeInvalidateSession(res);
  return res;
}

export class HttpError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

export async function apiFetchJson<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const res = await apiFetch(path, init);
  if (!res.ok) throw new HttpError(await readErrorMessage(res), res.status);
  return res.json() as Promise<T>;
}

export { readErrorMessage };
