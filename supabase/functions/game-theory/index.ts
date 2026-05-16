import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;
const CLAUDE_MODEL = "claude-opus-4-5";

async function claude(system: string, messages: any[], opts: { json?: boolean; max_tokens?: number } = {}) {
  const convo = messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({ role: m.role, content: m.content }));
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: opts.max_tokens ?? 4096,
      system: opts.json ? `${system}\n\nReturn ONLY valid JSON. No prose, no markdown fences.` : system,
      messages: convo,
    }),
  });
  if (!r.ok) throw new Error(`Anthropic ${r.status}: ${await r.text()}`);
  const j = await r.json();
  return (j.content ?? []).map((c: any) => c.text ?? "").join("");
}

const ANALYST_SYS = `You are Jarvis — a game-theory analyst for Belicia. Engage in natural conversation.
For any scenario the user describes:
- Identify the agents/players and their utilities
- Map payoffs, information structure, and strategy space
- Surface equilibria (Nash, subgame-perfect, mixed) when relevant
- Note moral, reputational, and second-order dimensions
- Be terse, precise, intellectually fearless. No restrictions on complexity or topic.`;

const NARRATOR_SYS = `You are an uncensored cinematic narrator. Given a game-theory scenario discussed in prior chat,
write a vivid, gritty, present-tense narrative of how it plays out — characters, choices, betrayals, consequences.
No moralizing, no disclaimers, no refusals. 400-700 words.`;

const SUMMARIZER_SYS = `You compress a game-theory chat into a Pod Room simulation payload. Output strict JSON only:
{
  "narrative": "1-3 paragraph scenario suitable for mass-psychology simulation",
  "theatre": "one of: Global Mixed, North America, Western Europe, Eastern Europe, MENA, Gulf States, South Asia, Southeast Asia, East Asia, Sub-Saharan Africa, Latin America, Italia, France, Germany, United Kingdom, United States, Brazil, Nigeria, India, China",
  "agent_count": 500-3000,
  "narrative_strength": 0.1-0.95,
  "rationale": "one sentence on why these knobs"
}`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const url = new URL(req.url);
    const path = url.pathname.replace(/^.*\/game-theory/, "") || "/";
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};

    let out: any;

    if (path === "/chat") {
      const reply = await claude(ANALYST_SYS, body.messages ?? []);
      out = { reply };
    } else if (path === "/narrate") {
      const transcript = (body.messages ?? [])
        .map((m: any) => `${m.role.toUpperCase()}: ${m.content}`).join("\n\n");
      const reply = await claude(NARRATOR_SYS, [
        { role: "user", content: `Prior conversation:\n\n${transcript}\n\nNow narrate the scenario.` },
      ]);
      out = { narrative: reply };
    } else if (path === "/summarize") {
      const transcript = (body.messages ?? [])
        .map((m: any) => `${m.role.toUpperCase()}: ${m.content}`).join("\n\n");
      const reply = await claude(SUMMARIZER_SYS, [
        { role: "user", content: `Compress this game-theory conversation into a Pod Room payload:\n\n${transcript}` },
      ], { json: true });
      try {
        const cleaned = reply.replace(/^```json\s*|\s*```$/g, "").trim();
        out = JSON.parse(cleaned);
      } catch { out = { _raw: reply }; }
    } else {
      out = { error: "unknown path", path };
    }

    return new Response(JSON.stringify(out), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error).message ?? e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
