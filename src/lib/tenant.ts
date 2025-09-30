export function resolveTenantId(host?: string, headerTenant?: string) {
  if (headerTenant) return headerTenant;
  // subdomain: acme.verifiedrecruitmentservices.com
  const h = host || "";
  const parts = h.split(".");
  if (parts.length >= 3) return parts[0]; // acme
  return "demo"; // fallback for local dev
}
