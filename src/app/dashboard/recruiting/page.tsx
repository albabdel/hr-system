
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function JobsPage() {
  const [rows,setRows] = useState<any[]>([]);
  const [title,setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(()=>{ 
    fetch("/api/jobs")
      .then(r=>r.json())
      .then(setRows)
      .finally(() => setLoading(false));
  },[]);
  
  async function create() {
    if (!title.trim()) return;
    try {
      const r = await fetch("/api/jobs",{ method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ title, description:"", department:"", location:"Remote" }) });
      const j = await r.json(); 
      if (!r.ok) throw new Error(j?.error?.message||"Failed to create job");
      setRows(prev=>[j,...prev]); 
      setTitle("");
      toast({ title: "Success", description: "Job created." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Manage Jobs</CardTitle>
          <CardDescription>Create new job postings and view existing ones.</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Input className="flex-1" value={title} onChange={e=>setTitle(e.target.value)} placeholder="New job title (e.g., Senior Software Engineer)" />
          <Button onClick={create}>Create Job</Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Open Positions</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid md:grid-cols-2 gap-4">
            {rows.map(j=>(
              <li key={j._id} className="border bg-card text-card-foreground rounded-lg p-4 flex items-center justify-between">
                <div>
                  <div className="font-semibold">{j.title}</div>
                  <div className="text-xs text-muted-foreground">{j.location || "—"} · {j.department || "—"}</div>
                </div>
                <Button asChild>
                  <Link href={`/dashboard/recruiting/job/${j._id}`}>Open Board</Link>
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
