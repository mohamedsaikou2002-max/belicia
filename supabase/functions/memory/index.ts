import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action") ?? "recent";
    const user_id = url.searchParams.get("user_id") ?? "default";

    if (req.method === "GET") {
      if (action === "recent") {
        const session_id = url.searchParams.get("session_id");
        let q = supabase
          .from("belicia_memory")
          .select("role, content, created_at, session_id")
          .eq("user_id", user_id);
        if (session_id) q = q.eq("session_id", session_id);
        const { data } = await q.order("created_at", { ascending: false }).limit(100);
        return new Response(JSON.stringify({ messages: (data ?? []).reverse() }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (action === "sessions") {
        // List distinct sessions with first-message preview + last activity
        const { data } = await supabase
          .from("belicia_memory")
          .select("session_id, content, role, created_at")
          .eq("user_id", user_id)
          .not("session_id", "is", null)
          .order("created_at", { ascending: false })
          .limit(500);
        const map = new Map<string, { session_id: string; preview: string; last: string; first: string }>();
        for (const row of (data ?? [])) {
          const sid = row.session_id as string;
          if (!sid) continue;
          const existing = map.get(sid);
          if (!existing) {
            map.set(sid, { session_id: sid, preview: row.content.slice(0, 80), last: row.created_at, first: row.created_at });
          } else {
            // rows arrive newest-first → keep updating preview to the OLDEST user message we see
            if (row.role === "user") existing.preview = row.content.slice(0, 80);
            existing.first = row.created_at;
          }
        }
        const sessions = Array.from(map.values()).sort((a, b) => b.last.localeCompare(a.last));
        return new Response(JSON.stringify({ sessions }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (action === "profile") {
        const { data } = await supabase
          .from("belicia_profile")
          .select("*")
          .eq("user_id", user_id)
          .limit(1);
        return new Response(JSON.stringify({ profile: data?.[0] ?? null }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    if (req.method === "POST") {
      const body = await req.json();
      if (action === "clear") {
        await supabase.from("belicia_memory").delete().eq("user_id", body.user_id ?? user_id);
        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (action === "profile") {
        const updates = { ...body, user_id: body.user_id ?? user_id, updated_at: new Date().toISOString() };
        const { data } = await supabase
          .from("belicia_profile")
          .upsert(updates, { onConflict: "user_id" })
          .select();
        return new Response(JSON.stringify({ profile: data?.[0] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ error: "unknown action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
