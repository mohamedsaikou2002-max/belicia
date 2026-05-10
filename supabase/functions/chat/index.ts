import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { buildBaytSystemPrompt, fetchIAExcerpts } from "./corpus.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SCENE_TRIGGERS: Array<{ re: RegExp; scene: string }> = [
  { re: /\b(entering focus|deep work|focus mode)\b/i, scene: "focus_mode" },
  { re: /\b(prayer time|salah|adhan|salat)\b/i, scene: "prayer_mode" },
  { re: /\b(going to sleep|rest now|sleep mode|good night)\b/i, scene: "sleep_mode" },
  { re: /\b(recovery mode|wind down|recover)\b/i, scene: "recovery_mode" },
];

function importanceFor(mode: string, content: string): number {
  let base = 0.6;
  if (mode === "conquest") base = 1.0;
  else if (mode === "tafsir") base = 0.8;
  else if (mode === "cosmology") base = 0.75;
  if (/\b(decision|mission|never|always|remember|important)\b/i.test(content)) base = Math.min(1, base + 0.1);
  return base;
}

function extractTags(content: string): string[] {
  const words = content.toLowerCase().match(/\b[a-z]{5,}\b/g) ?? [];
  const stop = new Set(["which", "their", "there", "about", "would", "could", "should", "these", "those", "where", "while"]);
  const freq: Record<string, number> = {};
  for (const w of words) if (!stop.has(w)) freq[w] = (freq[w] ?? 0) + 1;
  return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([w]) => w);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const message: string = body.message;
    const user_id: string = body.userId ?? body.user_id ?? "default";
    const session_id: string | undefined = body.sessionId ?? body.session_id;
    const mode: string = body.inquiryMode ?? body.mode ?? "wisdom";
    const use_archive: boolean = body.archiveMode ?? body.use_archive ?? false;
    const pemfContext = body.pemfContext ?? null;

    if (!message) {
      return new Response(JSON.stringify({ error: "message required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const userImportance = importanceFor(mode, message);
    const userTags = extractTags(message);

    const { data: userRow } = await supabase.from("belicia_memory").insert({
      user_id, role: "user", content: message,
      importance: Math.round(userImportance * 10),
      session_id, inquiry_mode: mode, memory_type: "exchange",
      pemf_coherence_at_time: pemfContext?.coherenceScore ?? null,
      tags: userTags,
    }).select("id").single();

    // Recent + important history (importance DESC then recency)
    const { data: history } = await supabase
      .from("belicia_memory")
      .select("role, content, importance, created_at")
      .eq("user_id", user_id)
      .order("importance", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(20);

    const { data: profileRows } = await supabase
      .from("belicia_profile").select("*").eq("user_id", user_id).limit(1);
    const profile = profileRows?.[0];

    const iaExcerpts = use_archive ? await fetchIAExcerpts(message, 3, 600) : [];

    let system = buildBaytSystemPrompt(mode, iaExcerpts);

    if (profile) {
      system += "\n\n## User Profile\n";
      if (profile.display_name || profile.name) system += `Name: ${profile.display_name ?? profile.name}\n`;
      if (profile.active_missions?.length) system += `Active missions: ${JSON.stringify(profile.active_missions)}\n`;
      if (profile.strategic_context) system += `Strategic context: ${profile.strategic_context}\n`;
      if (profile.spiritual_station) system += `Spiritual station: ${profile.spiritual_station}\n`;
      if (profile.preferences) system += `Preferences: ${JSON.stringify(profile.preferences)}\n`;
      if (profile.response_depth) system += `Response depth preference: ${profile.response_depth}\n`;
    }

    if (pemfContext) {
      system += `\n\n## Current Biofield State\nCoherence: ${pemfContext.coherenceScore}/100 · Recovery: ${pemfContext.recoveryState} · HRV: ${pemfContext.hrvScore}\n`;
      system += "Calibrate tone to this state. Depleted → brevity & stillness. Peak → full engagement.\n";
    }

    const ordered = (history ?? []).slice().reverse();
    const seen = new Set<string>();
    const messages: Array<{ role: string; content: string }> = [{ role: "system", content: system }];
    for (const m of ordered) {
      const k = m.content.slice(0, 80);
      if (!seen.has(k)) { messages.push({ role: m.role, content: m.content }); seen.add(k); }
    }

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
    let reply: string = aiData.choices?.[0]?.message?.content ?? "";
    const finishReason = aiData.choices?.[0]?.finish_reason ?? null;
    console.log("AI finish_reason:", finishReason, "reply length:", reply.length);

    // Fallback if model returns empty (e.g. safety filter or content policy)
    if (!reply || !reply.trim()) {
      console.warn("Empty reply from primary model, retrying with fallback model");
      const fallback = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ model: "google/gemini-2.5-pro", messages }),
      });
      if (fallback.ok) {
        const fb = await fallback.json();
        reply = fb.choices?.[0]?.message?.content ?? "";
      }
      if (!reply || !reply.trim()) {
        reply = "I cannot speak to that one right now — the question pressed against a content filter and the answer came back empty. Try rephrasing it, or ask me to approach it from a theological, ethical, or fiqh angle and I will respond.";
      }
    }

    const asstImportance = importanceFor(mode, reply);
    const { data: asstRow } = await supabase.from("belicia_memory").insert({
      user_id, role: "assistant", content: reply,
      importance: Math.round(asstImportance * 10),
      session_id, inquiry_mode: mode, memory_type: "exchange",
      pemf_coherence_at_time: pemfContext?.coherenceScore ?? null,
      tags: extractTags(reply),
    }).select("id").single();

    // Auto scene trigger (silent, non-blocking)
    let triggeredScene: string | null = null;
    for (const t of SCENE_TRIGGERS) {
      if (t.re.test(reply) || t.re.test(message)) { triggeredScene = t.scene; break; }
    }
    if (triggeredScene) {
      const baseUrl = Deno.env.get("SUPABASE_URL")!;
      fetch(`${baseUrl}/functions/v1/home-bridge`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        },
        body: JSON.stringify({ userId: user_id, command: { type: "scene", action: triggeredScene, params: {} } }),
      }).catch(() => {});
    }

    return new Response(JSON.stringify({
      response: reply,
      sessionId: session_id ?? null,
      memoryId: asstRow?.id ?? null,
      userMemoryId: userRow?.id ?? null,
      mode,
      used_archive: use_archive,
      triggered_scene: triggeredScene,
      ia_sources: iaExcerpts.map((e) => ({ title: e.source, author: e.author, year: e.year, iaId: e.iaId })),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
