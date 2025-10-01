
"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

type Stage = { _id:string; key:string; name:string; order:number };
type App = { _id:string; candidateId:{_id:string, firstName:string;lastName:string;email:string;source?:string}; stageKey:string };

export default function Board({ params }: { params: { id: string } }) {
  const jobId = params.id;
  const [stages,setStages] = useState<Stage[]>([]);
  const [apps,setApps] = useState<App[]>([]);
  const [cands,setCands] = useState<any[]>([]);
  const [candId,setCandId] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(()=>{
    setLoading(true);
    Promise.all([
      fetch(`/api/jobs/${jobId}/stages`).then(r=>r.json()),
      fetch(`/api/jobs/${jobId}/applications`).then(r=>r.json()),
      fetch(`/api/candidates`).then(r=>r.json()),
    ]).then(([st, ap, cs])=>{ 
      setStages(st); 
      setApps(ap); 
      setCands(cs);
    }).finally(() => setLoading(false));
  },[jobId]);

  const cols = useMemo(() => {
    const map: Record<string, App[]> = {};
    for (const s of stages) map[s.key] = [];
    for (const a of apps) if (a.stageKey) (map[a.stageKey] ||= []).push(a);
    return map;
  }, [stages, apps]);

  async function addCandidate() {
    if (!candId) return;
    const stageKey = stages[0]?.key || "SOURCED";
    try {
      const res = await fetch(`/api/jobs/${jobId}/applications`, {
        method:"POST", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ candidateId: candId, stageKey })
      });
      let data = await res.json(); 
      if (!res.ok) throw new Error(data?.error?.message||"Failed to add candidate");
      const cand = cands.find(c => c._id === candId);
      data.candidateId = cand;
      setApps(prev => [data, ...prev]); 
      setCandId("");
      toast({ title: "Success", description: "Candidate added to pipeline." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  }

  async function move(appId:string, toStageKey:string) {
    try {
      const res = await fetch(`/api/applications/${appId}/move`, {
        method:"PATCH", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ toStageKey })
      });
      const data = await res.json(); 
      if (!res.ok) throw new Error(data?.error?.message||"Failed to move candidate");
      setApps(prev => prev.map(a => a._id === appId ? data : a));
      toast({ title: "Success", description: "Candidate stage updated." });
    } catch (error: any) {
       toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recruiting Pipeline</CardTitle>
            <Button variant="outline" asChild>
              <Link href="/dashboard/recruiting">Back to Jobs</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex gap-4 items-end">
            <Select value={candId} onValueChange={setCandId}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select candidate to add..." />
              </SelectTrigger>
              <SelectContent>
                {cands.filter(c => !apps.some(a => a.candidateId._id === c._id)).map((c:any)=> <SelectItem key={c._id} value={c._id}>{c.firstName} {c.lastName} – {c.email}</SelectItem>)}
              </SelectContent>
            </Select>
          <Button onClick={addCandidate}>Add to Pipeline</Button>
        </CardContent>
      </Card>
      
      {loading ? <Skeleton className="h-96 w-full"/> : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.sort((a,b)=>a.order-b.order).map(s=>(
            <div key={s._id} className="min-w-72">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{s.name} ({(cols[s.key]||[]).length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 min-h-48">
                  {(cols[s.key]||[]).map(a=>(
                    <Card key={a._id} className="p-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium text-sm">{a.candidateId.firstName} {a.candidateId.lastName}</div>
                          <div className="text-xs text-muted-foreground">{a.candidateId.email}</div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                             <Button variant="ghost" size="icon" className="h-6 w-6">
                              <MoreHorizontal className="h-4 w-4"/>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            {stages.filter(x=>x.key!==a.stageKey).map(x=>
                              <DropdownMenuItem key={x.key} onSelect={()=>move(a._id, x.key)}>Move to {x.name}</DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
