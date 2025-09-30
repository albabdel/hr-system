"use client";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type Emp = { _id:string; firstName:string; lastName:string; position?:string; managerId?:string|null };

function buildTree(list: Emp[]) {
  const map = new Map(list.map(e => [e._id, { ...e, children: [] as any[] }]));
  let roots: any[] = [];
  for (const e of map.values()) {
    if (e.managerId && map.get(String(e.managerId))) {
      map.get(String(e.managerId))!.children.push(e);
    } else {
      roots.push(e);
    }
  }
  return roots;
}

export default function OrgPage() {
  const [emps, setEmps] = useState<Emp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{ 
    setLoading(true);
    fetch("/api/employees")
      .then(r=>r.json())
      .then(setEmps)
      .finally(() => setLoading(false)); 
  },[]);
  const trees = useMemo(()=>buildTree(emps),[emps]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization Chart</CardTitle>
      </CardHeader>
      <CardContent>
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-16 w-1/4" />
          <div className="pl-12 space-y-4 border-l">
            <Skeleton className="h-16 w-1/3" />
             <div className="pl-12 space-y-4 border-l">
                <Skeleton className="h-16 w-1/2" />
             </div>
          </div>
           <Skeleton className="h-16 w-1/4" />
        </div>
      ) : (
        <div className="space-y-6">
          {trees.map(t => <Tree key={t._id} node={t} />)}
        </div>
      )}
      </CardContent>
    </Card>
  );
}

function Tree({ node }: { node: any }) {
  return (
    <div className="ml-4">
      <div className="inline-block mb-2 px-3 py-2 rounded-xl bg-card shadow border">
        <div className="font-semibold">{node.firstName} {node.lastName}</div>
        <div className="text-xs text-muted-foreground">{node.position || "—"}</div>
      </div>
      {node.children?.length > 0 && (
        <div className="pl-6 border-l">
          {node.children.map((c:any)=> <Tree key={c._id} node={c} />)}
        </div>
      )}
    </div>
  );
}
