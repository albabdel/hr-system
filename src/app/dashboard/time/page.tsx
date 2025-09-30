"use client";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Row = { _id:string; employeeId:string; inAt:string; outAt?:string; source:string };

export default function TimePage() {
  const [rows,setRows] = useState<Row[]>([]);
  const [employeeId,setEmployeeId] = useState("");
  const [loading,setLoading] = useState(true);

  useEffect(()=>{ refresh(); },[]);
  async function refresh(){ setLoading(true); const r = await fetch("/api/timeclock"); setRows(await r.json()); setLoading(false); }

  async function clock(action:"IN"|"OUT") {
    if (!employeeId) { alert("Enter employee ID"); return; }
    try {
      const res = await fetch("/api/timeclock", { method:"POST", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ employeeId, action }) });
      const data = await res.json(); if (!res.ok) { throw new Error(data?.error?.message||"Failed"); }
      await refresh();
    } catch (e: any) {
      alert(e.message);
    }
  }

  const open = useMemo(()=>rows.find(r=>r.employeeId===employeeId && !r.outAt), [rows, employeeId]);

  return (
    <main className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Time Clock</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3 items-end">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Input placeholder="Enter Employee ID to Clock In/Out" value={employeeId} onChange={e=>setEmployeeId(e.target.value)} />
            </div>
            {!open && <Button onClick={()=>clock("IN")}>Clock In</Button>}
            {open && <Button variant="destructive" onClick={()=>clock("OUT")}>Clock Out</Button>}
          </div>
           {open && <p className="text-sm text-green-600">Clocked in since {new Date(open.inAt).toLocaleTimeString()}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Clock Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? 
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          :
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>In</TableHead>
                <TableHead>Out</TableHead>
                <TableHead>Hours</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(r=>{
                const hrs = r.outAt ? ((+new Date(r.outAt) - +new Date(r.inAt)) / 36e5).toFixed(2) : "";
                return (
                  <TableRow key={r._id}>
                    <TableCell>{r.employeeId}</TableCell>
                    <TableCell>{new Date(r.inAt).toLocaleString()}</TableCell>
                    <TableCell>{r.outAt ? new Date(r.outAt).toLocaleString() : "—"}</TableCell>
                    <TableCell>{hrs}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        }
        </CardContent>
      </Card>
    </main>
  );
}
