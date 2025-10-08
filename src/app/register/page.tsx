"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Loader2 } from "lucide-react";

async function safeJson(res: Response) {
  const text = await res.text();
  try {
    return { data: JSON.parse(text), text };
  } catch {
    return { data: null, text };
  }
}

export default function RegisterTenantPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      tenantSlug: String(fd.get("tenantSlug")).trim(),
      tenantName: String(fd.get("tenantName")).trim(),
      adminEmail: String(fd.get("adminEmail")).trim(),
      adminPassword: String(fd.get("adminPassword")),
    };

    try {
      const res = await fetch("/api/auth/register-tenant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const { data, text } = await safeJson(res);
      if (!res.ok) {
        throw new Error(data?.error?.message || text || "Registration failed");
      }
      
      // Redirect to dashboard, middleware will handle it from here
      window.location.href = '/dashboard';

    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Create your company account</CardTitle>
          <CardDescription>Start managing your HR processes with VRS.</CardDescription>
        </CardHeader>
        <form onSubmit={onSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tenantSlug">Company URL</Label>
              <Input id="tenantSlug" name="tenantSlug" placeholder="e.g., acme" required />
               <p className="text-sm text-muted-foreground">acme.vrs-platform.com</p>
            </div>
             <div className="space-y-2">
              <Label htmlFor="tenantName">Company Name</Label>
              <Input id="tenantName" name="tenantName" placeholder="e.g., Acme Inc." required />
            </div>
            <div className="space-y-2">
               <Label htmlFor="adminEmail">Your Email</Label>
              <Input id="adminEmail" name="adminEmail" type="email" placeholder="you@company.com" required />
            </div>
             <div className="space-y-2">
               <Label htmlFor="adminPassword">Password</Label>
              <Input id="adminPassword" name="adminPassword" type="password" required />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </CardContent>
          <CardFooter className="flex flex-col items-stretch">
            <Button disabled={loading} type="submit">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Creating..." : "Create Account"}
            </Button>
            <p className="mt-4 text-center text-sm">
              Already have an account?{' '}
              <Link href="/login" className="underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
