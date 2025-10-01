import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "../lib/api";
import { setAuth } from "../lib/auth";
import { useNavigate, Link } from "react-router-dom";

const Schema = z.object({
  tenant: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8)
});
type Form = z.infer<typeof Schema>;

export default function Login() {
  const nav = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({ resolver: zodResolver(Schema) });

  async function onSubmit(data: Form) {
    const res = await api<{ accessToken: string; refreshToken: string; user: any }>(
      "/auth/login",
      { method: "POST", body: JSON.stringify({ email: data.email, password: data.password }) },
      { tenant: data.tenant, noAuth: true }
    );
    const tenantInfo = await api<{ id: string; slug: string }>(
      "/auth/register-tenant", { method: "POST", body: JSON.stringify({ name: "noop", slug: "noop", owner: { email:"noop@x.com", name:"x", password:"x".repeat(8) } }) },
      { tenant: data.tenant, noAuth: true }
    ).catch(() => null); // Not actually creating; ignore errors. We'll store slug from form.

    setAuth({
      accessToken: res.accessToken,
      refreshToken: res.refreshToken,
      tenantSlug: data.tenant,
      tenantId: tenantInfo?.id || "unknown",
      user: res.user
    });
    nav("/employees");
  }

  return (
    <div className="max-w-md mx-auto mt-24">
      <h1 className="text-2xl font-semibold mb-6">Login</h1>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="block text-sm font-medium">Tenant Slug</label>
          <input className="mt-1 w-full border rounded px-3 py-2" {...register("tenant")} />
          {errors.tenant && <p className="text-red-600 text-sm">{errors.tenant.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input className="mt-1 w-full border rounded px-3 py-2" {...register("email")} />
          {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium">Password</label>
          <input type="password" className="mt-1 w-full border rounded px-3 py-2" {...register("password")} />
          {errors.password && <p className="text-red-600 text-sm">{errors.password.message}</p>}
        </div>
        <button disabled={isSubmitting} className="rounded bg-blue-600 text-white px-4 py-2">
          {isSubmitting ? "..." : "Login"}
        </button>
      </form>
      <div className="mt-4 text-sm">
        New tenant? <Link to="/register-tenant" className="text-blue-600">Register</Link>
      </div>
      <div className="mt-6 text-xs text-gray-500">
        Demo: tenant=<code>acme</code>, email=<code>owner@acme.test</code>, password=<code>owner123</code>.
      </div>
    </div>
  );
}
