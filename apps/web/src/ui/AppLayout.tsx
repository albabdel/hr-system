import React, { useEffect, useRef } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { getAuth, clearAuth } from "../lib/auth";
import { api } from "../lib/api";
import { applyBranding, Branding as BrandingType } from "../lib/theme";

export function AppLayout() {
  const nav = useNavigate();
  const loc = useLocation();
  const auth = getAuth();
  const tenant = auth?.tenantSlug || "—";
  const user = auth?.user?.email || "—";
  const liveRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch branding and apply on mount
    (async () => {
      try {
        const b = await api<BrandingType>("/v1/branding");
        applyBranding(b);
        document.title = b.brandName;
      } catch {
        // ignore
      }
    })();
  }, []);

  useEffect(() => {
    // Announce route change for screen readers
    if (liveRef.current) {
      liveRef.current.textContent = `Page changed: ${document.title}`;
    }
    // Move focus to main content
    const main = document.getElementById("main-content");
    if (main) main.focus();
  }, [loc.pathname]);

  const link = (to: string, label: string) => (
    <Link to={to} className={`block hover:underline ${loc.pathname.startsWith(to) ? "font-semibold" : ""}`}>{label}</Link>
  );

  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr]">
      {/* Skip link */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-white text-black border px-3 py-1 rounded">
        Skip to content
      </a>

      <aside className="border-r p-4 space-y-4" style={{ background: "var(--sidebar-bg)", color: "var(--sidebar-text)" }}>
        <div className="text-lg font-semibold">HR SaaS</div>
        <nav className="space-y-2">
          {link("/employees", "Employees")}
          {link("/lms", "LMS")}
          {link("/analytics", "Analytics")}
          <div className="pt-2 text-gray-500 text-xs uppercase">Settings</div>
          {link("/settings/integrations", "Integrations")}
          {link("/settings/branding", "Branding")}
        </nav>
      </aside>

      <main id="main-content" tabIndex={-1} className="p-6 outline-none">
        <header className="flex items-center justify-between mb-6">
          <div className="text-sm" style={{ color: "var(--sidebar-text)" }}>
            Tenant: <span className="font-medium">{tenant}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span aria-label="Current user email">{user}</span>
            <button
              aria-label="Logout"
              className="rounded px-3 py-1 text-sm"
              style={{ background: "var(--color-primary)", color: "white" }}
              onClick={() => { clearAuth(); nav("/login"); }}
            >Logout</button>
          </div>
        </header>

        {/* Live region for announcements */}
        <div aria-live="polite" aria-atomic="true" className="sr-only" ref={liveRef}></div>

        <Outlet />
      </main>
    </div>
  );
}
