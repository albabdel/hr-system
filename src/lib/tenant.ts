export function resolveTenantId(host?: string, headerTenant?: string) {
  if (headerTenant) return headerTenant;
  // subdomain: acme.verifiedrecruitmentservices.com
  const h = host || "";
  const parts = h.split(".");
  // If we're on a custom domain, the first part is the tenant slug.
  if (parts.length >= 3 && parts[1] !== 'vercel' && parts[1] !== 'localhost') {
    return parts[0];
  }
  // Fallback for local dev or if no subdomain is used
  return "demo";
}
