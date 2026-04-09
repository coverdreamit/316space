let getAccessToken: () => string | null = () => null;
let onAuthFailure: (() => void) | null = null;
let onApiWarning: ((message: string) => void) | null = null;

/** 상단 경고 배너. ApiWarningProvider에서 등록합니다. */
export function setApiWarningHandler(fn: ((message: string) => void) | null): void {
  onApiWarning = fn;
}

export const MSG_UPSTREAM_UNAVAILABLE =
  "서버에 일시적으로 연결할 수 없습니다(게이트웨이·프록시 오류). 잠시 후 다시 시도해 주세요.";

export const MSG_NETWORK_UNAVAILABLE =
  "네트워크 오류로 서버에 연결하지 못했습니다. 연결 상태를 확인해 주세요.";

function looksLikeGatewayHtml(preview: string): boolean {
  const head = preview.slice(0, 900).toLowerCase();
  return (
    head.includes("bad gateway") ||
    head.includes("502 bad gateway") ||
    head.includes("503 service") ||
    head.includes("504 gateway") ||
    (head.includes("<html") && head.includes("nginx"))
  );
}

function notifyIfUpstreamIssue(res: Response, bodyPreview: string): void {
  if (res.ok) return;
  const s = res.status;
  if (s === 502 || s === 503 || s === 504) {
    onApiWarning?.(MSG_UPSTREAM_UNAVAILABLE);
    return;
  }
  const ct = res.headers.get("content-type") ?? "";
  if (ct.includes("text/html") && looksLikeGatewayHtml(bodyPreview)) {
    onApiWarning?.(MSG_UPSTREAM_UNAVAILABLE);
  }
}

/** apiFetch를 쓰지 않는 요청(login 등)에서도 동일한 경고를 띄울 때 사용합니다. */
export async function notifyUpstreamErrorIfNeeded(res: Response): Promise<void> {
  if (res.ok) return;
  const text = await res.clone().text();
  notifyIfUpstreamIssue(res, text);
}

/** fetch가 네트워크 단에서 실패했을 때 경고만 띄웁니다. */
export function notifyNetworkFailure(): void {
  onApiWarning?.(MSG_NETWORK_UNAVAILABLE);
}

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

function upstreamOrHtmlErrorMessage(res: Response, text: string): string | null {
  if (res.status === 502 || res.status === 503 || res.status === 504) {
    return MSG_UPSTREAM_UNAVAILABLE;
  }
  const trimmed = text.trimStart();
  if (trimmed.startsWith("<") && looksLikeGatewayHtml(text)) {
    return MSG_UPSTREAM_UNAVAILABLE;
  }
  return null;
}

async function readErrorMessage(
  res: Response,
  options: ReadErrorMessageOptions = {},
): Promise<string> {
  const useSessionHintOn403 = options.replaceForbiddenWithSessionHint !== false;
  const text = await res.text();
  if (!res.ok) {
    const upstream = upstreamOrHtmlErrorMessage(res, text);
    if (upstream) return upstream;
  }
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
  let res: Response;
  try {
    res = await fetch(path, { ...init, headers });
  } catch {
    onApiWarning?.(MSG_NETWORK_UNAVAILABLE);
    throw new Error(MSG_NETWORK_UNAVAILABLE);
  }
  maybeInvalidateSession(res);
  if (!res.ok) {
    const preview = (await res.clone().text()).slice(0, 1200);
    notifyIfUpstreamIssue(res, preview);
  }
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
