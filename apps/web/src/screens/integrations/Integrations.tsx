
import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";

type Integration = {
  id: string;
  type: 'SLACK_WEBHOOK'|'TEAMS_WEBHOOK'|'SMTP';
  name: string;
  isEnabled: boolean;
  config: any;
};

export default function Integrations() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["integrations"],
    queryFn: () => api<Integration[]>("/v1/integrations")
  });

  const saveSlack = useMutation({
    mutationFn: (p: any) => api("/v1/integrations/slack-webhook", { method: "POST", body: JSON.stringify(p) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["integrations"] })
  });
  const saveTeams = useMutation({
    mutationFn: (p: any) => api("/v1/integrations/teams-webhook", { method: "POST", body: JSON.stringify(p) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["integrations"] })
  });
  const saveSmtp = useMutation({
    mutationFn: (p: any) => api("/v1/integrations/smtp", { method: "POST", body: JSON.stringify(p) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["integrations"] })
  });
  const runTest = useMutation({
    mutationFn: (p: any) => api<{results: any[]}>("/v1/integrations/test", { method: "POST", body: JSON.stringify(p) }),
    onSuccess: (res) => alert(JSON.stringify(res.results, null, 2))
  });

  const slack = data?.find(i => i.type === 'SLACK_WEBHOOK');
  const teams = data?.find(i => i.type === 'TEAMS_WEBHOOK');
  const smtp  = data?.find(i => i.type === 'SMTP');

  const [slackUrl, setSlackUrl] = useState("");
  const [teamsUrl, setTeamsUrl] = useState("");
  const [smtpCfg, setSmtpCfg] = useState<any>({ host: "localhost", port: 1025, secure: false, fromEmail: "no-reply@example.com", fromName: "HR" });

  useEffect(() => {
    setSlackUrl(slack?.config?.webhookUrl || "");
    setTeamsUrl(teams?.config?.webhookUrl || "");
    if (smtp) setSmtpCfg(smtp.config);
  }, [data, slack, teams, smtp]);

  return (
    <div className="space-y-8 max-w-3xl">
      <h1 className="text-xl font-semibold">Integrations</h1>

      <section className="border rounded p-4 space-y-3">
        <h2 className="font-semibold">Slack</h2>
        <input className="border rounded p-2 w-full" placeholder="Incoming Webhook URL" value={slackUrl} onChange={e=>setSlackUrl(e.target.value)} />
        <button className="rounded bg-gray-200 px-3 py-2 text-sm" onClick={()=>saveSlack.mutate({ name: "Slack", webhookUrl: slackUrl })}>Save</button>
        <button className="rounded bg-gray-200 px-3 py-2 text-sm ml-2" onClick={()=>runTest.mutate({ channels: ['SLACK'] })}>Send test</button>
      </section>

      <section className="border rounded p-4 space-y-3">
        <h2 className="font-semibold">Microsoft Teams</h2>
        <input className="border rounded p-2 w-full" placeholder="Incoming Webhook URL" value={teamsUrl} onChange={e=>setTeamsUrl(e.target.value)} />
        <button className="rounded bg-gray-200 px-3 py-2 text-sm" onClick={()=>saveTeams.mutate({ name: "Teams", webhookUrl: teamsUrl })}>Save</button>
        <button className="rounded bg-gray-200 px-3 py-2 text-sm ml-2" onClick={()=>runTest.mutate({ channels: ['TEAMS'] })}>Send test</button>
      </section>

      <section className="border rounded p-4 space-y-3">
        <h2 className="font-semibold">Email (SMTP)</h2>
        <div className="grid grid-cols-2 gap-3">
          <input className="border rounded p-2" placeholder="Host" value={smtpCfg.host || ""} onChange={e=>setSmtpCfg((s:any)=>({...s, host:e.target.value}))} />
          <input className="border rounded p-2" placeholder="Port" type="number" value={smtpCfg.port || 1025} onChange={e=>setSmtpCfg((s:any)=>({...s, port:Number(e.target.value)}))} />
          <label className="flex items-center gap-2"><input type="checkbox" checked={!!smtpCfg.secure} onChange={e=>setSmtpCfg((s:any)=>({...s, secure:e.target.checked}))} /> Secure</label>
          <input className="border rounded p-2" placeholder="User (optional)" value={smtpCfg.user || ""} onChange={e=>setSmtpCfg((s:any)=>({...s, user:e.target.value}))} />
          <input className="border rounded p-2" placeholder="Pass (optional)" type="password" value={smtpCfg.pass || ""} onChange={e=>setSmtpCfg((s:any)=>({...s, pass:e.target.value}))} />
          <input className="border rounded p-2" placeholder="From Email" value={smtpCfg.fromEmail || ""} onChange={e=>setSmtpCfg((s:any)=>({...s, fromEmail:e.target.value}))} />
          <input className="border rounded p-2" placeholder="From Name" value={smtpCfg.fromName || ""} onChange={e=>setSmtpCfg((s:any)=>({...s, fromName:e.target.value}))} />
        </div>
        <button className="rounded bg-gray-200 px-3 py-2 text-sm" onClick={()=>saveSmtp.mutate({ name: "SMTP", ...smtpCfg })}>Save</button>
        <button className="rounded bg-gray-200 px-3 py-2 text-sm ml-2" onClick={()=>runTest.mutate({ channels: ['EMAIL'], emailTo: 'dev@example.com' })}>Send test</button>
      </section>
    </div>
  );
}
