import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const MODEL = "google/gemini-2.5-flash";

async function ai(system: string, user: string, json = true): Promise<any> {
  const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${LOVABLE_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      ...(json ? { response_format: { type: "json_object" } } : {}),
    }),
  });
  if (!r.ok) throw new Error(`AI ${r.status}: ${await r.text()}`);
  const j = await r.json();
  const txt = j.choices?.[0]?.message?.content ?? "";
  if (!json) return txt;
  try { return JSON.parse(txt); } catch { return { _raw: txt }; }
}

async function worldState() {
  const sys = "You are a real-time geopolitical pulse analyst. Output strict JSON.";
  const u = `Snapshot the current global mood right now. Return JSON:
{
  "shock_level": 0..1,
  "world_mood": "positive"|"neutral"|"negative",
  "world_receptivity": 0..1,
  "top_shocks": [3 short current headlines/themes]
}`;
  return await ai(sys, u);
}

async function deriveVars(narrative: string, theatre: string, world: any) {
  const sys = "You are a mass-psychology modeller. Output strict JSON.";
  const u = `Given narrative: """${narrative}"""
Theatre: ${theatre}
World state: ${JSON.stringify(world)}

Derive these spread-modelling variables as JSON. Each value 0..1, with one-sentence reasoning:
{
  "narrative_strength": {"value": 0..1, "reasoning": "..."},
  "world_receptivity":  {"value": 0..1, "reasoning": "..."},
  "base_rate_modifier": {"value": 0..1, "reasoning": "..."},
  "volatility_modifier":{"value": 0..1, "reasoning": "..."},
  "shock_dampener":     {"value": 0..1, "reasoning": "..."}
}`;
  return await ai(sys, u);
}

async function interrogate(agent: any, question: string) {
  const sys = `You roleplay one synthetic agent. Stay in character. 2-4 sentences max.`;
  const u = `Agent persona:
- Archetype: ${agent.archetype}
- Region: ${agent.region}, ${agent.country}
- Personality: ${agent.personality}
- Current stance: ${agent.stance}
- Belief level (0=reject,1=accept): ${(agent.belief ?? 0.5).toFixed(2)}

Question: ${question}

Respond as this person would.`;
  return await ai(sys, u, false);
}

async function predict(state: any) {
  const sys = "You are a strategic foresight analyst. Be concrete, structured, terse.";
  const u = `Simulation final state:
${JSON.stringify({
  derived_vars: state.derived_vars,
  seed_info: state.seed_info,
  summary: state.summary,
  history: state.history?.slice(-20),
}, null, 2)}

Write a prediction report:
1. 72h outlook
2. 7d outlook
3. Tipping point assessment (will it cross 0.5 belief? sustain R₀>1?)
4. Top 3 risks
5. Top 3 levers an operator could pull
6. Confidence (low/medium/high) with reason`;
  return await ai(sys, u, false);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const url = new URL(req.url);
    const path = url.pathname.replace(/^.*\/pod-room/, "") || "/";
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};

    let out: any;
    if (path === "/world-state") out = await worldState();
    else if (path === "/derive") out = await deriveVars(body.narrative, body.theatre, body.world);
    else if (path === "/interrogate") out = { response: await interrogate(body.agent, body.question) };
    else if (path === "/predict") out = { report: await predict(body.state ?? {}) };
    else out = { error: "unknown path", path };

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
