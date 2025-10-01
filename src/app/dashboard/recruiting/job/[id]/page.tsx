
"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { DndContext, DragEndEvent, useDraggable, useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";


type Stage = { _id:string; key:string; name:string; order:number };
type App = { _id:string; candidateId:{_id:string, firstName:string;lastName:string;email:string;source?:string}; stageKey:string };

function DroppableCol({ id, children }: any) {
  const { setNodeRef } = useDroppable({ id });
  return <div ref={setNodeRef} className="space-y-3 min-h-48">{children}</div>;
}
function DraggableCard({ id, children }: any) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 100 : "auto",
  } : undefined;
  return <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="rounded-lg border p-3 bg-card shadow-sm touch-none">{children}</div>;
}

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

  async function onDragEnd(e: DragEndEvent) {
    const appId = String(e.active.id);
    const toStageKey = String(e.over?.id || "");
    const fromStageKey = apps.find(a => a._id === appId)?.stageKey;
    if (!toStageKey || !appId || !fromStageKey || fromStageKey === toStageKey) return;
    
    // Optimistic update
    const originalApps = apps;
    setApps(prev => prev.map(a => a._id === appId ? { ...a, stageKey: toStageKey } : a));

    try {
      const res = await fetch(`/api/applications/${appId}/move`, {
        method:"PATCH", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ toStageKey })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message||"Failed to move candidate");
      // server state is now source of truth
      setApps(prev => prev.map(a => a._id === appId ? data : a));
      toast({ title: "Success", description: "Candidate stage updated." });
    } catch (error: any) {
       toast({ title: "Error", description: error.message, variant: "destructive" });
       setApps(originalApps); // revert on failure
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
        <DndContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {stages.sort((a,b)=>a.order-b.order).map(s=>(
              <div key={s._id} className="min-w-72">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">{s.name} ({(cols[s.key]||[]).length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DroppableCol id={s.key}>
                      <SortableContext items={(cols[s.key]||[]).map(a=>a._id)} strategy={verticalListSortingStrategy}>
                        {(cols[s.key]||[]).map(a=>(
                          <DraggableCard key={a._id} id={a._id}>
                              <div className="font-medium text-sm">{a.candidateId.firstName} {a.candidateId.lastName}</div>
                              <div className="text-xs text-muted-foreground">{a.candidateId.email}</div>
                              <InterviewMini appId={a._id} />
                          </DraggableCard>
                        ))}
                      </SortableContext>
                    </DroppableCol>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </DndContext>
      )}
    </div>
  );
}

function InterviewMini({ appId }: { appId: string }) {
  const [open, setOpen] = useState(false);
  const [list, setList] = useState<any[]>([]);
  const [when, setWhen] = useState<string>("");
  const { toast } = useToast();

  useEffect(()=>{ if(open){ fetch(`/api/applications/${appId}/interviews`).then(r=>r.json()).then(setList);} },[open, appId]);

  async function schedule() {
    if(!when) return;
    try {
      const r = await fetch(`/api/applications/${appId}/interviews`, {
        method:"POST", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ when })
      });
      const d = await r.json(); if(!r.ok) throw new Error(d?.error?.message||"Failed to schedule");
      setList(prev=>[d,...prev]); setWhen("");
      toast({ title:"Scheduled", description:"Interview has been scheduled."});
    } catch(e:any) {
      toast({ title:"Error", description:e.message, variant:"destructive"});
    }
  }

  return (
    <div className="mt-2">
      <Button size="sm" variant="outline" className="h-7 px-2 py-1 text-xs" onClick={()=>setOpen(v=>!v)}>{open ? "Hide" : "Interviews"}</Button>
      {open && (
        <div className="mt-2 p-2 bg-muted/50 rounded space-y-2">
          <div className="flex gap-2 items-end">
            <input type="datetime-local" className="w-full border-input bg-background rounded-md px-2 py-1 text-sm" value={when} onChange={e=>setWhen(e.target.value)} />
            <Button size="sm" className="h-8" onClick={schedule}>Schedule</Button>
          </div>
          <ul className="space-y-1 text-xs">
            {list.map(it=>(
              <li key={it._id} className="border rounded p-2 bg-card">
                {new Date(it.when).toLocaleString()} · {it.type}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
