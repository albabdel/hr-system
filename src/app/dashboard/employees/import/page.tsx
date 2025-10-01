"use client";
import Papa from "papaparse";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function ImportEmployeesPage() {
  const [rows,setRows] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();

  function parse(file: File) {
    setRows([]);
    Papa.parse(file, {
      header: true,
      transformHeader: h => h.trim(),
      skipEmptyLines: true,
      complete: (res) => {
        setRows(res.data as any[]);
        toast({ title: "CSV Parsed", description: `${res.data.length} rows found.` });
      },
      error: (e) => toast({ title: "Parsing Error", description: e.message, variant: "destructive" }),
    });
  }

  async function upload() {
    if (!rows.length) return;
    setBusy(true);
    try {
      const r = await fetch("/api/employees/bulk", {
        method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(rows)
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error?.message || "Import failed");
      toast({
        title: "Import Complete",
        description: `Inserted: ${data.inserted || 0}, Upserted: ${data.upserted || 0}, Modified: ${data.modified || 0}`
      });
      setRows([]);
    } catch (err: any) {
      toast({ title: "Import Failed", description: err.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Import Employees from CSV</CardTitle>
          <CardDescription>Upload a CSV file to bulk add or update employees. Expected headers: firstName, lastName, email, department, position, hireDate, managerEmail</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="flex items-center gap-4">
             <Input type="file" accept=".csv" className="max-w-xs" onChange={e=> e.target.files?.[0] && parse(e.target.files[0])} />
             <Button onClick={upload} disabled={!rows.length || busy}>
               {busy ? "Importing..." : `Import ${rows.length > 0 ? `(${rows.length} rows)` : ''}`}
             </Button>
           </div>
        </CardContent>
      </Card>
      
      {rows.length > 0 && (
        <Card>
            <CardHeader>
                <CardTitle>Preview Data</CardTitle>
                <CardDescription>Review the first few rows of your CSV data before importing.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="max-h-96 overflow-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {Object.keys(rows[0]).map(h => <TableHead key={h}>{h}</TableHead>)}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.slice(0, 10).map((row, i) => (
                            <TableRow key={i}>
                                {Object.values(row).map((val: any, j) => <TableCell key={j}>{val}</TableCell>)}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                </div>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
