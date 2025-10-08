
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { verifyJwt } from "./jwt";

export type Session = { userId: string; tenantId: string; role: "OWNER"|"HR_ADMIN"|"MANAGER"|"EMPLOYEE" };

export function getSession(): Session | null {
  const token = cookies().get("vrs_token")?.value;
  if (!token) return null;
  try { return verifyJwt<Session>(token); } catch { return null; }
}

export function requireRole(session: Session | null, roles: (Session["role"])[]) {
  if (!session || !roles.includes(session.role)) {
    throw new Error("Forbidden");
  }
}
