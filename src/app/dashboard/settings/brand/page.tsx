"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function BrandSettings() {
  const [name,setName] = useState("");
  const [primary,setPrimary] = useState("#ffda47");
  const [logoUrl,setLogoUrl] = useState("");
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  useEffect(()=>{
    fetch("/api/tenant/status").then(r=>r.json()).then(s=>{
      if (s?.name) setName(s.name);
      if (s?.theme?.primary) setPrimary(s.theme.primary);
      if (s?.theme?.logoUrl) setLogoUrl(s.theme.logoUrl);
    });
  },[]);

  async function save(e:React.FormEvent){
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/tenant/setup",{ method:"POST", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ name, theme:{ primary, logoUrl } }) });
      if (res.ok) { 
        toast({ title: "Success", description: "Brand settings saved." });
        setTimeout(() => location.reload(), 1000);
      } else {
        const data = await res.json();
        throw new Error(data.error?.message || "Failed to save settings");
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Brand Settings</CardTitle>
        <CardDescription>Customize your workspace&apos;s appearance.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={save} className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Company Name</Label>
            <Input id="name" value={name} onChange={e=>setName(e.target.value)}/>
          </div>
           <div className="space-y-2">
            <Label htmlFor="primary">Primary Color</Label>
            <Input id="primary" type="color" className="h-12 p-1" value={primary} onChange={e=>setPrimary(e.target.value)}/>
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="logoUrl">Logo URL</Label>
            <Input id="logoUrl" value={logoUrl} onChange={e=>setLogoUrl(e.target.value)} placeholder="https://your.company/logo.png"/>
          </div>
          <div>
            <Button disabled={loading} type="submit">{loading ? "Saving..." : "Save Changes"}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
