"use client";
import { useEffect, useState } from "react";
type Me = { role: "OWNER"|"HR_ADMIN"|"MANAGER"|"EMPLOYEE"; tenantId: string; email: string };

export function useSession() {
  const [me, setMe] = useState<Me|null>(null);
  useEffect(()=>{ fetch("/api/me").then(r=>r.json()).then(d=>setMe(d?.ok?d.user:null)).catch(()=>{}); },[]);
  return me;
}
