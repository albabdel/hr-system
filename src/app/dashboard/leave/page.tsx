
"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

type LeaveType = { _id:string; code:string; name:string; allowanceDays:number };
type LeaveRequest = {
  _id:string; employeeId:any; typeCode:string; startDate:string; endDate:string; status:string; reason?:string
};

export default function LeavePage() {
  const [types, setTypes] = useState<LeaveType[]>([]);
  const [rows, setRows] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/leave-types").then(r=>r.json()),
      fetch("/api/leave-requests").then(r=>r.json())
    ]).then(([t, r]) => { setTypes(t); setRows(r); }).finally(()=>setLoading(false));
  }, []);

  async function requestLeave(payload: Partial<LeaveRequest>) {
    const res = await fetch("/api/leave-requests", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(payload) });
    const data = await res.json(); if (!res.ok) throw new Error(data?.error?.message || "Failed");
    setRows(prev => [data, ...prev]);
  }
  async function act(id: string, action: "APPROVE"|"REJECT"|"CANCEL") {
    const res = await fetch(`/api/leave-requests/${id}`, { method:"PATCH", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ action }) });
    const data = await res.json(); if (!res.ok) throw new Error(data?.error?.message || "Failed");
    setRows(prev => prev.map(x => x._id === id ? data : x));
  }

  if (loading) return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
  );

  return (
    <main className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Request Leave</CardTitle>
        </CardHeader>
        <CardContent>
            <LeaveForm types={types} onSubmit={requestLeave} />
        </CardContent>
      </Card>

      <Card>
         <CardHeader>
          <CardTitle>Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(r=>(
                <TableRow key={r._id}>
                  <TableCell>{r.employeeId?.firstName} {r.employeeId?.lastName}</TableCell>
                  <TableCell>{r.typeCode}</TableCell>
                  <TableCell>{new Date(r.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(r.endDate).toLocaleDateString()}</TableCell>
                  <TableCell>{r.status}</TableCell>
                  <TableCell className="space-x-2 text-right">
                    {r.status==="PENDING" && <>
                      <Button size="sm" onClick={()=>act(r._id,"APPROVE")}>Approve</Button>
                      <Button size="sm" variant="secondary" onClick={()=>act(r._id,"REJECT")}>Reject</Button>
                      <Button size="sm" variant="ghost" onClick={()=>act(r._id,"CANCEL")}>Cancel</Button>
                    </>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}

function LeaveForm({ types, onSubmit }: { types: LeaveType[]; onSubmit: (p:any)=>Promise<void> }) {
  const [saving,setSaving] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setSaving(true);
    const fd = new FormData(e.currentTarget);
    try {
      await onSubmit({
        employeeId: fd.get("employeeId"),
        typeCode: fd.get("typeCode"),
        startDate: fd.get("startDate"),
        endDate: fd.get("endDate"),
        reason: fd.get("reason")
      });
      (e.target as HTMLFormElement).reset();
    } catch(e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }
  return (
    <form onSubmit={submit} className="grid md:grid-cols-5 gap-4 items-end">
      <Input name="employeeId" placeholder="Employee ID" required />
       <Select name="typeCode" required>
          <SelectTrigger>
            <SelectValue placeholder="Select type..." />
          </SelectTrigger>
          <SelectContent>
            {types.map(t=> <SelectItem key={t._id} value={t.code}>{t.name}</SelectItem>)}
          </SelectContent>
        </Select>
      <Input type="date" name="startDate" required />
      <Input type="date" name="endDate" required />
      <Button className="w-full" disabled={saving}>{saving?"Submitting…":"Submit"}</Button>
      <Textarea name="reason" placeholder="Reason (optional)" className="md:col-span-5" />
    </form>
  );
}
