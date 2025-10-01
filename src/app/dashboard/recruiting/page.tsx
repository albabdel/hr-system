
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function JobsPage() {
  const [rows,setRows] = useState<any[]>([]);
  const [title,setTitle] = useState("");
  const [isPublic, setIsPublic] = useState(true);
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
      const r = await fetch("/api/jobs",{ method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ title, isPublic, description:"", department:"", location:"Remote" }) });
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
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input className="flex-1" value={title} onChange={e=>setTitle(e.target.value)} placeholder="New job title (e.g., Senior Software Engineer)" />
            <Button onClick={create}>Create Job</Button>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="is-public" checked={isPublic} onCheckedChange={(c) => setIsPublic(Boolean(c))} />
            <Label htmlFor="is-public" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Publicly list this job on the careers page
            </Label>
          </div>
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
