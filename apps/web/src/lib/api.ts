import { API_URL } from "../env";
import { getAuth, setAuth, clearAuth } from "./auth";

async function refreshOnce(tenantSlug: string, refreshToken: string) {
  const r = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-tenant-id": tenantSlug },
    body: JSON.stringify({ refreshToken })
  });
  if (!r.ok) throw new Error("refresh failed");
  return r.json() as Promise<{ accessToken: string; refreshToken: string }>;
}

export async function api<T>(path: string, init: RequestInit = {}, opts?: { tenant?: string; noAuth?: boolean }): Promise<T> {
  const auth = getAuth();
  const tenant = opts?.tenant || auth?.tenantSlug;
  const headers: Record<string, string> = {
    ...(init.headers as any),
    "content-type": "application/json",
    ...(tenant ? { "x-tenant-id": tenant } : {})
  };
  let token = auth?.accessToken;
  if (token && !opts?.noAuth) headers["authorization"] = `Bearer ${token}`;

  const doFetch = () => fetch(`${API_URL}${path}`, { ...init, headers });
  let res = await doFetch();

  if (res.status === 401 && auth && !opts?.noAuth) {
    try {
      const upd = await refreshOnce(auth.tenantSlug, auth.refreshToken);
      setAuth({ ...auth, accessToken: upd.accessToken, refreshToken: upd.refreshToken });
      headers["authorization"] = `Bearer ${upd.accessToken}`;
      res = await doFetch();
    } catch {
      clearAuth();
      throw new Error("Unauthorized");
    }
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `${res.status}`);
  }
  return res.json() as Promise<T>;
}
