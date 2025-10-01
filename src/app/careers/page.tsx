
"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

type Job = { _id:string; title:string; department?:string; location?:string; createdAt:string };

export default function CareersPage() {
  const [tenant, setTenant] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [sel, setSel] = useState<Job | null>(null);
  const [msg, setMsg] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    // Ensure this runs only on the client
    const searchParams = new URLSearchParams(window.location.search);
    const tenantParam = searchParams.get("tenant") || "demo";
    setTenant(tenantParam);
  }, []);

  useEffect(() => {
    if (tenant) {
      fetch(`/api/public/jobs?tenant=${tenant}`)
        .then(r => r.json())
        .then(d => setJobs(d.jobs || []))
        .catch(() => toast({ title: "Error", description: "Failed to load jobs.", variant: "destructive" }));
    }
  }, [tenant, toast]);

  const handleTenantChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTenant(e.target.value);
  }

  const handleLoadTenant = () => {
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('tenant', tenant);
    window.history.pushState({}, '', newUrl);
    // Trigger re-fetch
    if (tenant) {
      fetch(`/api/public/jobs?tenant=${tenant}`)
        .then(r => r.json())
        .then(d => setJobs(d.jobs || []))
        .catch(() => toast({ title: "Error", description: "Failed to load jobs for this tenant.", variant: "destructive" }));
    }
  }

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Careers</h1>
        <p className="text-muted-foreground">Join our amazing team. We are hiring!</p>
        <div className="flex gap-2 items-center pt-4">
          <span className="text-sm font-medium">Tenant ID:</span>
          <Input value={tenant} onChange={handleTenantChange} className="max-w-[200px]" placeholder="e.g., demo" />
          <Button onClick={handleLoadTenant}>Load Jobs</Button>
        </div>
        <p className="text-xs text-muted-foreground">Enter a tenant ID to see their public job listings.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Open Roles</CardTitle>
        </CardHeader>
        <CardContent>
          {jobs.length > 0 ? (
            <ul className="space-y-3">
              {jobs.map(j => (
                <li key={j._id} className="border rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="font-semibold">{j.title}</div>
                    <div className="text-sm text-muted-foreground">{j.department || "General"} · {j.location || "Remote"}</div>
                  </div>
                  <Button onClick={() => { setSel(j); setMsg(""); }}>Apply Now</Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No open positions at the moment. Please check back later.</p>
          )}
        </CardContent>
      </Card>

      {sel && <ApplyCard tenant={tenant} job={sel} onDone={(id) => { setSel(null); toast({ title: "Application Submitted!", description: `Your application ID is ${id}. We will be in touch soon.` }); }} onClose={() => setSel(null)} />}
    </main>
  );
}

function ApplyCard({ tenant, job, onDone, onClose }: { tenant: string; job: Job; onDone: (id: string) => void; onClose: () => void }) {
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      tenantId: tenant,
      jobId: job._id,
      firstName: String(fd.get("firstName")),
      lastName: String(fd.get("lastName")),
      email: String(fd.get("email")),
      phone: String(fd.get("phone") || ""),
      resumeUrl: String(fd.get("resumeUrl") || ""),
    };
    try {
      const r = await fetch("/api/public/apply", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const d = await r.json();
      if (!r.ok) throw new Error(d?.error?.message || "Failed to submit application");
      onDone(d.applicationId);
    } catch (error: any) {
      toast({ title: "Submission Error", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Apply for {job.title}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="grid md:grid-cols-2 gap-4">
          <Input name="firstName" placeholder="First name" required />
          <Input name="lastName" placeholder="Last name" required />
          <Input name="email" type="email" className="md:col-span-2" placeholder="Email" required />
          <Input name="phone" className="md:col-span-2" placeholder="Phone (optional)" />
          <Input name="resumeUrl" className="md-col-span-2" placeholder="Resume URL (e.g., LinkedIn profile, portfolio)" />
          <Button type="submit" disabled={submitting} className="md:col-span-2">
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitting ? "Submitting..." : "Submit Application"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
