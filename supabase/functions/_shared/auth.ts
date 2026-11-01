import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Verify the user's access token against Supabase Auth on each invocation.
// The public/anon key alone is NOT authentication.
export async function verifiedUserId(request: Request): Promise<string | null> {
  const value = request.headers.get("authorization") ?? "";
  const match = /^Bearer\s+([^\s]+)$/i.exec(value);
  if (!match) return null;
  const token = match[1];
  const client = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  try {
    const { data, error } = await client.auth.getUser(token);
    return error ? null : (data.user?.id ?? null);
  } catch { return null; }
}

export function authRequired(cors: Record<string, string>) {
  return new Response(JSON.stringify({ error: "Authentication required" }), {
    status: 401, headers: { ...cors, "Content-Type": "application/json" },
  });
}

export function isTrustedJob(request: Request): boolean {
  const secret = Deno.env.get("BELICIA_CRON_SECRET");
  const given = request.headers.get("x-belicia-cron-secret");
  return Boolean(secret && given && given === secret);
}
