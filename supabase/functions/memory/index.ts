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
        const { data } = await supabase
          .from("belicia_memory")
          .select("role, content, created_at")
          .eq("user_id", user_id)
          .order("created_at", { ascending: false })
          .limit(50);
        return new Response(JSON.stringify({ messages: (data ?? []).reverse() }), {
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
