import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  MSG_NETWORK_UNAVAILABLE,
  notifyNetworkFailure,
  notifyUpstreamErrorIfNeeded,
  readErrorMessage,
  setAccessTokenGetter,
  setAuthFailureHandler,
} from "../api/client";
import { clearStoredAuth, loadStoredAuth, saveStoredAuth } from "./storage";
import type { StoredAuth, TokenResponse } from "./types";

interface AuthContextValue {
  accessToken: string | null;
  role: string | null;
  loginId: string | null;
  isAuthenticated: boolean;
  login: (loginId: string, password: string) => Promise<void>;
  register: (payload: {
    loginId: string;
    password: string;
    name: string;
    email?: string | null;
    phone?: string | null;
  }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function toStoredAuth(data: TokenResponse, loginId: string): StoredAuth {
  return { accessToken: data.accessToken, role: data.role, loginId };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<StoredAuth | null>(() => loadStoredAuth());
  const authRef = useRef(auth);
  authRef.current = auth;

  /**
   * 자식 컴포넌트의 useEffect가 부모 AuthProvider의 useEffect보다 먼저 실행될 수 있어,
   * 토큰 getter를 렌더마다 동기 갱신합니다. 그렇지 않으면 /admin 새로고침 시 첫 API가
   * Authorization 없이 나가 401 → 세션 정리로 로그아웃처럼 보일 수 있습니다.
   */
  setAccessTokenGetter(() => authRef.current?.accessToken ?? null);

  const login = useCallback(async (loginId: string, password: string) => {
    let res: Response;
    try {
      res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginId: loginId.trim(), password }),
      });
    } catch {
      notifyNetworkFailure();
      throw new Error(MSG_NETWORK_UNAVAILABLE);
    }
    await notifyUpstreamErrorIfNeeded(res);
    if (!res.ok)
      throw new Error(
        await readErrorMessage(res, { replaceForbiddenWithSessionHint: false }),
      );
    const data = (await res.json()) as TokenResponse;
    const next = toStoredAuth(data, loginId.trim());
    saveStoredAuth(next);
    setAuth(next);
  }, []);

  const register = useCallback(
    async (payload: {
      loginId: string;
      password: string;
      name: string;
      email?: string | null;
      phone?: string | null;
    }) => {
      const body: Record<string, unknown> = {
        loginId: payload.loginId.trim(),
        password: payload.password,
        name: payload.name.trim(),
      };
      const email = payload.email?.trim();
      if (email) body.email = email;
      const phone = payload.phone?.trim();
      if (phone) body.phone = phone;

      let res: Response;
      try {
        res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } catch {
        notifyNetworkFailure();
        throw new Error(MSG_NETWORK_UNAVAILABLE);
      }
      await notifyUpstreamErrorIfNeeded(res);
      if (!res.ok) throw new Error(await readErrorMessage(res));
    },
    [],
  );

  const logout = useCallback(() => {
    clearStoredAuth();
    setAuth(null);
  }, []);

  useEffect(() => {
    setAuthFailureHandler(logout);
    return () => setAuthFailureHandler(null);
  }, [logout]);

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
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
