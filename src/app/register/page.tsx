"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function RegisterTenantPage() {
  const r = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setErr(null); setLoading(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      tenantSlug: String(fd.get("tenantSlug")).trim().toLowerCase(),
      tenantName: String(fd.get("tenantName")).trim(),
      adminEmail: String(fd.get("adminEmail")).trim().toLowerCase(),
      adminPassword: String(fd.get("adminPassword")),
    };
    try {
      const res = await fetch("/api/auth/register-tenant", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Failed");
      r.replace("/setup");
    } catch (e:any) { setErr(e.message); } finally { setLoading(false); }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create your company account</CardTitle>
          <CardDescription>Start managing your HR processes with VRS.</CardDescription>
        </CardHeader>
        <form onSubmit={onSubmit}>
          <CardContent className="space-y-4">
            <Input name="tenantSlug" placeholder="Company URL (e.g. acme)" required />
            <Input name="tenantName" placeholder="Company Name (e.g. Acme Inc.)" required />
            <Input name="adminEmail" type="email" placeholder="Your Email" required />
            <Input name="adminPassword" type="password" placeholder="Password" required />
            {err && <p className="text-red-600 text-sm">{err}</p>}
          </CardContent>
          <CardFooter className="flex flex-col items-stretch">
            <Button disabled={loading} type="submit">{loading ? "Creating..." : "Create Account"}</Button>
            <p className="text-sm text-center mt-4">
              Have an account? <Link href="/login" className="underline">Log in</Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
