export type AuthState = {
  accessToken: string;
  refreshToken: string;
  tenantSlug: string;
  tenantId: string;
  user: { id: string; email: string; name: string; role: string };
};

const KEY = "hr.auth";

export function getAuth(): AuthState | null {
  const raw = localStorage.getItem(KEY);
  return raw ? (JSON.parse(raw) as AuthState) : null;
}
export function setAuth(a: AuthState) {
  localStorage.setItem(KEY, JSON.stringify(a));
}
export function clearAuth() { localStorage.removeItem(KEY); }
export function isAuthed() { return !!getAuth()?.accessToken; }
