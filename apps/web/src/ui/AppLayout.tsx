import React from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { getAuth, clearAuth } from "../lib/auth";

export function AppLayout() {
  const nav = useNavigate();
  const auth = getAuth();
  const tenant = auth?.tenantSlug || "—";
  const user = auth?.user?.email || "—";
  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr]">
      <aside className="border-r p-4 space-y-4">
        <div className="text-lg font-semibold">HR SaaS</div>
        <nav className="space-y-2">
          <Link to="/employees" className="block hover:underline">Employees</Link>
          <Link to="/lms" className="block hover:underline">LMS</Link>
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
