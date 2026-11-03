import { createClient } from "npm:@supabase/supabase-js@2";

export async function authenticate(req: Request, cors: Record<string, string>) {
  const reject = () => ({ userId: null, response: new Response(JSON.stringify({ error: "Please sign in to continue" }), {
    status: 401, headers: { ...cors, "Content-Type": "application/json" },
  }) });
  const authorization = req.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) return reject();
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_ANON_KEY");
  if (!url || !key) return reject();
  try {
    const client = createClient(url, key, { auth: { persistSession: false }, global: { headers: { Authorization: authorization } } });
    const { data, error } = await client.auth.getUser(authorization.slice(7));
    if (error || !data.user) return reject();
    return { userId: data.user.id, response: null };
  } catch { return reject(); }
}