import { ZodSchema } from "zod";
export async function validate<T>(req: Request, schema: ZodSchema<T>) {
  const body = await req.json().catch(()=> ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const m = parsed.error.issues.map(i=>`${i.path.join(".")}: ${i.message}`).join("; ");
    return { ok: false as const, error: m };
  }
  return { ok: true as const, data: parsed.data };
}
