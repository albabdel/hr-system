import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "../../lib/api";

const Schema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  position: z.string().optional(),
  status: z.enum(["ACTIVE","INACTIVE","ON_LEAVE"]).default("ACTIVE")
});
type Form = z.infer<typeof Schema>;

export default function EmployeeEdit() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === "new"; // reserved route for future create form page
  const nav = useNavigate();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    enabled: !isNew,
    queryKey: ["employee", id],
    queryFn: () => api<any>(`/v1/employees/${id}`),
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(Schema),
    defaultValues: { firstName: "", lastName: "", email: "", position: "", status: "ACTIVE" }
  });

  React.useEffect(() => {
    if (data) reset({ firstName: data.firstName, lastName: data.lastName, email: data.email, position: data.position ?? "", status: data.status });
  }, [data, reset]);

  const mutate = useMutation({
    mutationFn: async (val: Form) => {
      if (isNew) {
        return api<any>("/v1/employees", { method: "POST", body: JSON.stringify(val) });
      } else {
        return api<any>(`/v1/employees/${id}`, { method: "PATCH", body: JSON.stringify(val) });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
      nav("/employees");
    }
  });

  const remove = useMutation({
    mutationFn: () => api<void>(`/v1/employees/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["employees"] }); nav("/employees"); }
  });

  if (!isNew && isLoading) return <div>Loading…</div>;

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-semibold mb-4">{isNew ? "Create Employee" : "Edit Employee"}</h1>
      <form className="grid gap-4" onSubmit={handleSubmit((v)=>mutate.mutate(v))}>
        <div><label className="block text-sm">First name</label><input className="mt-1 w-full border rounded px-3 py-2" {...register("firstName")} />{errors.firstName && <p className="text-red-600 text-sm">{errors.firstName.message}</p>}</div>
        <div><label className="block text-sm">Last name</label><input className="mt-1 w-full border rounded px-3 py-2" {...register("lastName")} />{errors.lastName && <p className="text-red-600 text-sm">{errors.lastName.message}</p>}</div>
        <div><label className="block text-sm">Email</label><input className="mt-1 w-full border rounded px-3 py-2" {...register("email")} />{errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}</div>
        <div><label className="block text-sm">Position</label><input className="mt-1 w-full border rounded px-3 py-2" {...register("position")} /></div>
        <div><label className="block text-sm">Status</label>
          <select className="mt-1 w-full border rounded px-3 py-2" {...register("status")}>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
            <option value="ON_LEAVE">ON_LEAVE</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button disabled={isSubmitting} className="rounded bg-blue-600 text-white px-4 py-2">{isSubmitting ? "..." : "Save"}</button>
          {!isNew && (
            <button type="button" onClick={()=>remove.mutate()} className="rounded bg-red-600 text-white px-4 py-2 ml-auto">Delete</button>
          )}
        </div>
      </form>
    </div>
  );
}
