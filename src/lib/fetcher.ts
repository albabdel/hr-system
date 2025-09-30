export async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers||{}) } });
  if (!res.ok) throw new Error((await res.json()).error?.message || "Request failed");
  return res.json();
}
