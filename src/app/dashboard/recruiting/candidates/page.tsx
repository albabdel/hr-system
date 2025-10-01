
"use client";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function CandidatesPage() {
  const [rows,setRows] = useState<any[]>([]);
  const [form,setForm] = useState({ firstName:"", lastName:"", email:"" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(()=>{ 
    fetch("/api/candidates")
      .then(r=>r.json())
      .then(setRows)
      .finally(() => setLoading(false));
  },[]);

  async function add() {
    setSaving(true);
    try {
      const res = await fetch("/api/candidates",{ method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(form) });
      const d = await res.json(); 
      if (!res.ok) throw new Error(d?.error?.message||"Failed to add candidate");
      setRows(prev=>[d,...prev]); 
      setForm({ firstName:"", lastName:"", email:"" });
      toast({ title: "Success", description: "Candidate added." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Candidate</CardTitle>
          <CardDescription>Manually add a new candidate to your talent pool.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4 items-end">
            <Input placeholder="First name" value={form.firstName} onChange={e=>setForm(v=>({...v,firstName:e.target.value}))}/>
            <Input placeholder="Last name" value={form.lastName} onChange={e=>setForm(v=>({...v,lastName:e.target.value}))}/>
            <Input placeholder="Email" value={form.email} onChange={e=>setForm(v=>({...v,email:e.target.value}))}/>
            <Button onClick={add} disabled={saving}>{saving ? "Adding..." : "Add Candidate"}</Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Candidate Pool</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
             <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
              {rows.map(r=>(
                <TableRow key={r._id}>
                  <TableCell className="font-semibold">{r.firstName} {r.lastName}</TableCell>
                  <TableCell>{r.email}</TableCell>
                </TableRow>
              ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
