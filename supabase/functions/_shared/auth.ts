import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

/** The caller's user ID must come from Supabase, never a request body or query string. */
export class AuthenticationError extends Error {
  constructor(message: string, public readonly status = 401) {
    super(message);
    this.name = "AuthenticationError";
  }
}

export async function authenticatedUserId(req: Request): Promise<string> {
  const token = req.headers.get("Authorization")?.match(/^Bearer\\s+(.+)$/i)?.[1];
  if (!token) throw new AuthenticationError("Sign in to continue.");

  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY");
  if (!url || !key) throw new AuthenticationError("Supabase authentication is not configured.", 500);

  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) throw new AuthenticationError("Your session is invalid or expired.");
  return data.user.id;
}
