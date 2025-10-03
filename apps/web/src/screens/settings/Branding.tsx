import React, { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { applyBranding, Branding as BrandingType } from "../../lib/theme";

export default function Branding() {
  const [b, setB] = useState<BrandingType | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const data = await api<BrandingType>("/v1/branding");
      setB(data);
    })();
  }, []);

  if (!b) return <div>Loading…</div>;

  async function save() {
    setSaving(true);
    const next = await api<BrandingType>("/v1/branding", {
      method: "PUT",
      body: JSON.stringify(b),
    });
    setB(next);
    applyBranding(next);
    setSaving(false);
  }

  const input = (label: string, value: string, onChange: (v: string) => void, props: any = {}) => (
    <label className="block text-sm">
      <span className="block mb-1">{label}</span>
      <input
        aria-label={label}
        className="border rounded p-2 w-full"
        value={value}
        onChange={(e)=>onChange(e.target.value)}
        {...props}
      />
    </label>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-xl font-semibold">Branding</h1>

      <div className="grid grid-cols-2 gap-4">
        {input("Brand name", b.brandName, v=>setB({ ...b, brandName: v }))}
        {input("Logo URL", b.logoUrl || "", v=>setB({ ...b, logoUrl: v || null }), { placeholder: "https://…" })}
        <label className="block text-sm">
          <span className="block mb-1">Primary color</span>
          <input aria-label="Primary color" type="color" value={b.primaryColor} onChange={(e)=>setB({ ...b, primaryColor: e.target.value })} />
        </label>
        <label className="block text-sm">
          <span className="block mb-1">Accent color</span>
          <input aria-label="Accent color" type="color" value={b.accentColor} onChange={(e)=>setB({ ...b, accentColor: e.target.value })} />
        </label>
        <label className="block text-sm">
          <span className="block mb-1">Sidebar background</span>
          <input aria-label="Sidebar background" type="color" value={b.sidebarBg} onChange={(e)=>setB({ ...b, sidebarBg: e.target.value })} />
        </label>
        <label className="block text-sm">
          <span className="block mb-1">Sidebar text</span>
          <input aria-label="Sidebar text" type="color" value={b.sidebarText} onChange={(e)=>setB({ ...b, sidebarText: e.target.value })} />
        </label>

        <label className="block text-sm">
          <span className="block mb-1">Color scheme</span>
          <select
            aria-label="Color scheme"
            className="border rounded p-2 w-full"
            value={b.scheme}
            onChange={(e)=>setB({ ...b, scheme: e.target.value as any })}
          >
            <option value="SYSTEM">System</option>
            <option value="LIGHT">Light</option>
            <option value="DARK">Dark</option>
          </select>
        </label>
      </div>

      <div className="flex items-center gap-3">
        <button
          aria-label="Save branding"
          className="rounded px-4 py-2 text-sm"
          style={{ background: "var(--color-primary)", color: "white" }}
          onClick={save}
          disabled={saving}
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          aria-label="Preview branding"
          className="rounded px-4 py-2 text-sm border"
          onClick={()=>applyBranding(b)}
        >
          Preview
        </button>
      </div>

      <div className="mt-6 border rounded p-4">
        <div className="text-sm text-gray-500 mb-2">Preview</div>
        <div className="flex items-center gap-3">
          {b.logoUrl ? <img src={b.logoUrl} alt="Logo preview" className="h-10 w-10 object-contain" /> : null}
          <div className="text-lg font-semibold">{b.brandName}</div>
          <div className="ml-auto">
            <button className="rounded px-3 py-1 text-sm" style={{ background: "var(--color-primary)", color: "white" }}>Primary</button>
            <button className="rounded px-3 py-1 text-sm ml-2" style={{ background: "var(--color-accent)", color: "white" }}>Accent</button>
          </div>
        </div>
      </div>
    </div>
  );
}
