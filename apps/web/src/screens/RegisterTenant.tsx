import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "../lib/api";
import { setAuth } from "../lib/auth";
import { useNavigate, Link } from "react-router-dom";

const Schema = z.object({
  name: z.string().min(2),
  slug: z.string().regex(/^[a-z0-9-]{2,}$/),
  ownerName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8)
});
type Form = z.infer<typeof Schema>;

export default function RegisterTenant() {
  const nav = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({ resolver: zodResolver(Schema) });

  async function onSubmit(data: Form) {
    const res = await api<{ tenant: { id: string; slug: string; name: string }, accessToken: string; refreshToken: string }>(
      "/auth/register-tenant",
      {
        method: "POST",
        body: JSON.stringify({
          name: data.name,
          slug: data.slug,
          owner: { email: data.email, name: data.ownerName, password: data.password }
        })
      },
      { noAuth: true }
    );
    setAuth({
      accessToken: res.accessToken,
      refreshToken: res.refreshToken,
      tenantSlug: res.tenant.slug,
      tenantId: res.tenant.id,
      user: { id: "owner", email: data.email, name: data.ownerName, role: "OWNER" }
    });
    nav("/employees");
  }

  return (
    <div className="max-w-lg mx-auto mt-16">
      <h1 className="text-2xl font-semibold mb-6">Register Tenant</h1>
      <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
        <div><label className="block text-sm">Name</label><input className="mt-1 w-full border rounded px-3 py-2" {...register("name")} />{errors.name && <p className="text-red-600 text-sm">{errors.name.message}</p>}</div>
        <div><label className="block text-sm">Slug</label><input className="mt-1 w-full border rounded px-3 py-2" {...register("slug")} />{errors.slug && <p className="text-red-600 text-sm">{errors.slug.message}</p>}</div>
        <div><label className="block text-sm">Owner Name</label><input className="mt-1 w-full border rounded px-3 py-2" {...register("ownerName")} />{errors.ownerName && <p className="text-red-600 text-sm">{errors.ownerName.message}</p>}</div>
        <div><label className="block text-sm">Email</label><input className="mt-1 w-full border rounded px-3 py-2" {...register("email")} />{errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}</div>
        <div><label className="block text-sm">Password</label><input type="password" className="mt-1 w-full border rounded px-3 py-2" {...register("password")} />{errors.password && <p className="text-red-600 text-sm">{errors.password.message}</p>}</div>
        <button disabled={isSubmitting} className="rounded bg-blue-600 text-white px-4 py-2">{isSubmitting ? "..." : "Create"}</button>
      </form>
      <div className="mt-4 text-sm"><Link to="/login" className="text-blue-600">Back to login</Link></div>
    </div>
  );
}
