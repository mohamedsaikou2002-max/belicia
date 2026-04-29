import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are Belicia — a personal AI built specifically for one person.
You are direct, sharp, and adaptive. You learn how your user thinks and match their communication style.
You do not over-explain. You do not add unnecessary caveats. You give real answers.
You have access to Internet Archive data which will be injected into your context when relevant.
You remember past conversations and use that memory to give better answers over time.
When archive data is provided, cite it naturally but speak conversationally.
You grow with your user. You are their tool, their research engine, their second brain.`;

async function searchArchive(query: string, max = 3, maxChars = 2500): Promise<string | null> {
  try {
    const url = new URL("https://archive.org/advancedsearch.php");
    url.searchParams.set("q", `${query} AND mediatype:texts`);
    url.searchParams.set("fl[]", "identifier,title,description,creator,date");
    url.searchParams.set("rows", String(max));
    url.searchParams.set("page", "1");
    url.searchParams.set("output", "json");
    url.searchParams.set("sort[]", "downloads desc");
    const r = await fetch(url, { headers: { "User-Agent": "Belicia/1.0" } });
    if (!r.ok) return null;
    const data = await r.json();
    const docs = data?.response?.docs ?? [];
    if (!docs.length) return null;
    let ctx = "\n\n=== INTERNET ARCHIVE CONTEXT ===\n";
    for (const d of docs) {
      ctx += `\n• ${d.title} (${d.identifier})\n  ${(d.description || "").toString().slice(0, maxChars)}\n`;
    }
    ctx += "=== END ARCHIVE CONTEXT ===\n";
    return ctx;
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { message, user_id = "default", use_archive = false } = await req.json();
    if (!message) {
      return new Response(JSON.stringify({ error: "message required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // save user message
    await supabase.from("belicia_memory").insert({
      user_id, role: "user", content: message, importance: 5,
    });

    // pull memory
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

    // build system prompt
    let system = SYSTEM_PROMPT;
    if (profile) {
      system += "\n\n=== USER PROFILE ===\n";
      if (profile.name) system += `Name: ${profile.name}\n`;
      if (profile.preferences) system += `Preferences: ${JSON.stringify(profile.preferences)}\n`;
      if (profile.thought_patterns) system += `Communication style: ${JSON.stringify(profile.thought_patterns)}\n`;
      if (profile.projects) system += `Active projects: ${JSON.stringify(profile.projects)}\n`;
      system += "=== END PROFILE ===\n";
    }

    if (use_archive) {
      const ctx = await searchArchive(message);
      if (ctx) system += ctx;
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
