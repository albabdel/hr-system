"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

type Status = { setupComplete: boolean; theme?: { logoUrl?: string; primary?: string }; name?: string };

export default function SetupPage() {
  const r = useRouter();
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/tenant/status").then(async res=>{
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Failed to fetch status");
      if (data.setupComplete) {
        r.replace("/dashboard");
      } else {
        setStatus(data);
      }
    }).catch(e=>setErr(e.message)).finally(()=>setLoading(false));
  }, [r]);

  async function complete(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name")||"").trim() || status?.name,
      theme: {
        logoUrl: String(fd.get("logoUrl")||"").trim() || status?.theme?.logoUrl,
        primary: String(fd.get("primary")||"").trim() || status?.theme?.primary || "#ffda47",
      }
    };
    try {
      const res = await fetch("/api/tenant/setup", {
        method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Failed to complete setup");
      r.replace("/dashboard");
    } catch(e: any) {
      setErr(e.message);
      setLoading(false);
    }
  }

  const renderContent = () => {
    if (loading) return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-6 w-3/4" />
        <div className="space-y-4 pt-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
    if (err) return <p className="text-red-600">Error: {err}</p>;
    if (status) return (
      <form onSubmit={complete} className="space-y-4">
        <div>
          <Label htmlFor="name">Company Name</Label>
          <Input id="name" name="name" defaultValue={status?.name} />
        </div>
        <div>
          <Label htmlFor="logoUrl">Logo URL</Label>
          <Input id="logoUrl" name="logoUrl" defaultValue={status?.theme?.logoUrl} placeholder="https://your.company/logo.png" />
        </div>
        <div className="flex flex-col space-y-2">
          <Label htmlFor="primary">Brand Color</Label>
          <Input id="primary" name="primary" type="color" defaultValue={status?.theme?.primary || "#ffda47"} className="h-12 p-1"/>
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Saving..." : "Complete Setup & Go to Dashboard"}
        </Button>
      </form>
    );
    return null;
  }


  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Welcome to VRS</CardTitle>
            <CardDescription>Just a few more details to get your workspace ready.</CardDescription>
          </CardHeader>
          <CardContent>
            {renderContent()}
          </CardContent>
      </Card>
    </main>
  );
}
