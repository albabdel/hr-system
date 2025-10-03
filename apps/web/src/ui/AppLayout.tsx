
import React from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { getAuth, clearAuth } from "../lib/auth";

export function AppLayout() {
  const nav = useNavigate();
  const loc = useLocation();
  const auth = getAuth();
  const tenant = auth?.tenantSlug || "—";
  const user = auth?.user?.email || "—";
  const link = (to: string, label: string) => (
    <Link to={to} className={`block hover:underline ${loc.pathname.startsWith(to) ? "font-semibold" : ""}`}>{label}</Link>
  );
  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr]">
      <aside className="border-r p-4 space-y-4">
        <div className="text-lg font-semibold">HR SaaS</div>
        <nav className="space-y-2">
          {link("/employees", "Employees")}
          {link("/lms", "LMS")}
          {link("/analytics", "Analytics")}
          <div className="pt-2 text-gray-500 text-xs uppercase">Settings</div>
          {link("/settings/integrations", "Integrations")}
        </nav>
      </aside>
      <main className="p-6">
        <header className="flex items-center justify-between mb-6">
          <div className="text-sm text-gray-500">Tenant: <span className="font-medium">{tenant}</span></div>
          <div className="flex items-center gap-3 text-sm">
            <span>{user}</span>
            <button
              className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300"
              onClick={() => { clearAuth(); nav("/login"); }}
            >Logout</button>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
