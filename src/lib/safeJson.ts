export async function safeJson(res: Response) {
  const text = await res.text();
  try { return { data: JSON.parse(text), text }; }
  catch { return { data: null, text }; }
}
