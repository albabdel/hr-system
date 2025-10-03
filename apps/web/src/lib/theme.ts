export type Branding = {
  brandName: string;
  logoUrl?: string | null;
  primaryColor: string;
  accentColor: string;
  sidebarBg: string;
  sidebarText: string;
  scheme: 'SYSTEM'|'LIGHT'|'DARK';
};

export function applyBranding(b: Branding) {
  const root = document.documentElement;
  root.style.setProperty('--color-primary', b.primaryColor);
  root.style.setProperty('--color-accent', b.accentColor);
  root.style.setProperty('--sidebar-bg', b.sidebarBg);
  root.style.setProperty('--sidebar-text', b.sidebarText);

  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  let dark = false;
  if (b.scheme === 'DARK') dark = true;
  else if (b.scheme === 'SYSTEM') dark = prefersDark;
  document.documentElement.classList.toggle('dark', dark);
}
