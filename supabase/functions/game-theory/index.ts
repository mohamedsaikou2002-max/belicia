import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY")!;
const CLAUDE_MODEL = "anthropic/claude-3.5-sonnet";
const DOLPHIN_MODEL = "cognitivecomputations/dolphin-mixtral-8x22b";

async function openrouter(model: string, messages: any[], json = false) {
  const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "HTTP-Referer": "https://lovable.dev",
      "X-Title": "Belicia Game Theory Room",
    },
    body: JSON.stringify({
      model,
      messages,
      ...(json ? { response_format: { type: "json_object" } } : {}),
    }),
  });
  if (!r.ok) throw new Error(`OpenRouter ${r.status}: ${await r.text()}`);
  const j = await r.json();
  return j.choices?.[0]?.message?.content ?? "";
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
      // body: { messages: [{role,content}, ...] }
      const msgs = [{ role: "system", content: ANALYST_SYS }, ...(body.messages ?? [])];
      const reply = await openrouter(CLAUDE_MODEL, msgs);
      out = { reply };
    } else if (path === "/narrate") {
      // body: { messages: [...] }
      const transcript = (body.messages ?? [])
        .map((m: any) => `${m.role.toUpperCase()}: ${m.content}`).join("\n\n");
      const reply = await openrouter(DOLPHIN_MODEL, [
        { role: "system", content: NARRATOR_SYS },
        { role: "user", content: `Prior conversation:\n\n${transcript}\n\nNow narrate the scenario.` },
      ]);
      out = { narrative: reply };
    } else if (path === "/summarize") {
      const transcript = (body.messages ?? [])
        .map((m: any) => `${m.role.toUpperCase()}: ${m.content}`).join("\n\n");
      const reply = await openrouter(CLAUDE_MODEL, [
        { role: "system", content: SUMMARIZER_SYS },
        { role: "user", content: `Compress this game-theory conversation into a Pod Room payload:\n\n${transcript}` },
      ], true);
      try { out = JSON.parse(reply); } catch { out = { _raw: reply }; }
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
