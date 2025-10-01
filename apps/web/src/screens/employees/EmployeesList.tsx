import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";

type Emp = { id:string; firstName:string; lastName:string; email:string; position?:string|null; status:string };
type Resp = { items: Emp[]; nextCursor: string|null; total: number };

export default function EmployeesList() {
  const [search, setSearch] = React.useState("");
  const [cursor, setCursor] = React.useState<string|undefined>(undefined);
  const [limit, setLimit] = React.useState(10);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["employees", { search, cursor, limit }],
    queryFn: () => api<Resp>(`/v1/employees?limit=${limit}${cursor ? `&cursor=${cursor}` : ""}${search ? `&search=${encodeURIComponent(search)}` : ""}`)
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <input
          placeholder="Search name/email"
          className="border rounded px-3 py-2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (setCursor(undefined), refetch())}
        />
        <button className="rounded bg-gray-200 px-3 py-2" onClick={() => { setCursor(undefined); refetch(); }}>Search</button>
        <Link to="/employees/new" className="ml-auto rounded bg-blue-600 text-white px-3 py-2" onClick={(e) => e.preventDefault()}>
          {/* Quick modal-less create flow: navigate to edit with "new" not implemented yet. */}
          Create
        </Link>
      </div>

      {isLoading && <div>Loading…</div>}
      {!isLoading && (
        <>
          <table className="w-full border text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Position</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border"></th>
              </tr>
            </thead>
            <tbody>
              {data?.items.map((e) => (
                <tr key={e.id} className="odd:bg-gray-50/50">
                  <td className="p-2 border">{e.firstName} {e.lastName}</td>
                  <td className="p-2 border">{e.email}</td>
                  <td className="p-2 border">{e.position || "—"}</td>
                  <td className="p-2 border">{e.status}</td>
                  <td className="p-2 border text-right">
                    <Link to={`/employees/${e.id}`} className="text-blue-600">Open</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Total: {data?.total ?? 0}</span>
            <button
              disabled={!data?.nextCursor}
              className="ml-auto rounded bg-gray-200 px-3 py-2 disabled:opacity-50"
              onClick={() => setCursor(data?.nextCursor || undefined)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
