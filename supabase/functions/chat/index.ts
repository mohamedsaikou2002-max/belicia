import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { buildBaytSystemPrompt, fetchIAExcerpts } from "./corpus.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { message, user_id = "default", use_archive = false, mode = "wisdom" } = await req.json();
    if (!message) {
      return new Response(JSON.stringify({ error: "message required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    await supabase.from("belicia_memory").insert({
      user_id, role: "user", content: message, importance: 5,
    });

    const { data: recent } = await supabase
      .from("belicia_memory")
      .select("role, content, created_at")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false })
      .limit(20);

    const { data: important } = await supabase
      .from("belicia_memory")
      .select("role, content")
      .eq("user_id", user_id)
      .gte("importance", 7)
      .order("created_at", { ascending: false })
      .limit(10);

    const { data: profileRows } = await supabase
      .from("belicia_profile")
      .select("*")
      .eq("user_id", user_id)
      .limit(1);
    const profile = profileRows?.[0];

    // Stage 1: Retrieve live IA excerpts when archive mode is on
    const iaExcerpts = use_archive ? await fetchIAExcerpts(message, 3, 600) : [];

    // Stage 2: Build Bayt al-Hikmah system prompt
    let system = buildBaytSystemPrompt(mode, iaExcerpts);

    if (profile) {
      system += "\n\n## User Profile\n";
      if (profile.name) system += `Name: ${profile.name}\n`;
      if (profile.preferences) system += `Preferences: ${JSON.stringify(profile.preferences)}\n`;
      if (profile.thought_patterns) system += `Communication style: ${JSON.stringify(profile.thought_patterns)}\n`;
      if (profile.projects) system += `Active projects: ${JSON.stringify(profile.projects)}\n`;
    }

    // dedupe and build messages
    const seen = new Set<string>();
    const history: Array<{ role: string; content: string }> = [];
    for (const m of important ?? []) {
      const k = m.content.slice(0, 80);
      if (!seen.has(k)) { history.push({ role: m.role, content: m.content }); seen.add(k); }
    }
    for (const m of (recent ?? []).slice().reverse()) {
      const k = m.content.slice(0, 80);
      if (!seen.has(k)) { history.push({ role: m.role, content: m.content }); seen.add(k); }
    }

    const messages = [{ role: "system", content: system }, ...history];

    // call lovable AI gateway
    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: "google/gemini-2.5-flash", messages }),
    });

    if (aiResp.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit, try again shortly." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (aiResp.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!aiResp.ok) {
      const t = await aiResp.text();
      throw new Error(`AI error: ${t}`);
    }

    const aiData = await aiResp.json();
    const reply = aiData.choices?.[0]?.message?.content ?? "";

    await supabase.from("belicia_memory").insert({
      user_id, role: "assistant", content: reply, importance: 5,
    });

    return new Response(JSON.stringify({ response: reply, used_archive: use_archive }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
