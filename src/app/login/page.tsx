
"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { safeJson } from "@/lib/safeJson";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const r = useRouter();
  const [err, setErr] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setErr(null); setLoading(true);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email")).trim().toLowerCase();
    const password = String(fd.get("password"));
    const tenantId = String(fd.get("tenantId")).trim().toLowerCase();

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-tenant-id": tenantId },
        body: JSON.stringify({ email, password }),
      });

      const { data, text } = await safeJson(res);
      if (!res.ok) throw new Error(data?.error?.message || text || "Login failed");
      
      // Use window.location.href to force a full page reload and trigger middleware
      window.location.href = "/dashboard";
    } catch (e:any) { setErr(e.message); } finally { setLoading(false); }
  }

  return (
     <main className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign in to VRS</CardTitle>
          <CardDescription>Welcome back!</CardDescription>
        </CardHeader>
        <form onSubmit={onSubmit}>
          <CardContent className="space-y-4">
             <div>
              <Label htmlFor="tenantId">Tenant</Label>
              <Input id="tenantId" name="tenantId" placeholder="Your company's identifier" required defaultValue="verifiedrecruitmentservices" />
            </div>
             <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="Email" required />
            </div>
             <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" placeholder="Password" required />
            </div>
            {err && <p className="text-red-600 text-sm">{err}</p>}
          </CardContent>
          <CardFooter className="flex flex-col items-stretch">
            <Button disabled={loading} type="submit">{loading ? "Signing in..." : "Sign in"}</Button>
             <p className="text-sm text-center mt-4">
              New company? <Link href="/register" className="underline">Create an account</Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
