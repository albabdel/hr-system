import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from "recharts";

type Series = { period: string; value?: number; net?: number }[];

export default function Analytics() {
  const { data: hc } = useQuery({
    queryKey: ["analytics","headcount"],
    queryFn: () => api<{ series: { period: string; value: number }[] }>("/v1/analytics/headcount?groupBy=day")
  });
  const { data: pc } = useQuery({
    queryKey: ["analytics","payroll"],
    queryFn: () => api<{ series: { period: string; net: number }[] }>("/v1/analytics/payroll-cost")
  });

  const exportMut = useMutation({
    mutationFn: (payload: any) => api<{ jobId: string; status: string }>("/v1/analytics/exports", { method: "POST", body: JSON.stringify(payload) })
  });

  async function runExport(type: 'headcount'|'payroll-cost') {
    const res = await exportMut.mutateAsync({ type });
    // poll job
    let fileId: string | null = null;
    for (let i=0;i<30;i++) {
      const st = await api<{ status: string; fileId: string|null }>(`/v1/analytics/exports/${res.jobId}`);
      if (st.fileId) { fileId = st.fileId; break; }
      await new Promise(r => setTimeout(r, 500));
    }
    if (!fileId) return alert("Export not ready");
    const u = await api<{ url: string }>(`/v1/files/${fileId}/signed-url`);
    window.location.href = u.url;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold">Analytics</h1>
        <button className="rounded bg-gray-200 px-3 py-2 text-sm" onClick={() => runExport('headcount')}>Export Headcount CSV</button>
        <button className="rounded bg-gray-200 px-3 py-2 text-sm" onClick={() => runExport('payroll-cost')}>Export Payroll CSV</button>
      </div>

      <section>
        <h2 className="text-lg font-semibold mb-2">Headcount (daily)</h2>
        <div className="h-64 border rounded p-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={(hc?.series ?? []) as Series}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" hide />
              <YAxis allowDecimals={false}/>
              <Tooltip />
              <Area type="monotone" dataKey="value" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">Payroll Cost (monthly net)</h2>
        <div className="h-64 border rounded p-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={(pc?.series ?? []) as Series}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" hide />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="net" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
