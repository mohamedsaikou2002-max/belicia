import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const GEMINI_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";
const LOVABLE_KEY = Deno.env.get("LOVABLE_API_KEY") ?? "";
const GEMINI_MODELS = [
  Deno.env.get("GEMINI_MODEL"),
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash",
  "gemini-2.5-pro",
].filter((m, i, a): m is string => !!m && a.indexOf(m) === i);

async function geminiNative(system: string, messages: any[], model: string, json = false, max_tokens = 4096): Promise<string> {
  const contents = messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }));
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(GEMINI_KEY)}`;
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: json ? `${system}\n\nReturn ONLY valid JSON. No prose, no markdown fences.` : system }] },
      contents,
      generationConfig: { temperature: 0.7, maxOutputTokens: max_tokens, ...(json ? { responseMimeType: "application/json" } : {}) },
    }),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`Gemini ${model} ${r.status}: ${text.slice(0, 300)}`);
  const j = JSON.parse(text);
  return (j.candidates?.[0]?.content?.parts ?? []).map((p: any) => p.text ?? "").join("");
}

async function geminiGateway(system: string, messages: any[], json = false): Promise<string> {
  if (!LOVABLE_KEY) throw new Error("No Gemini fallback available");
  const msgs = [
    { role: "system", content: json ? `${system}\n\nReturn ONLY valid JSON.` : system },
    ...messages.filter((m) => m.role === "user" || m.role === "assistant"),
  ];
  const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${LOVABLE_KEY}` },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: msgs,
      ...(json ? { response_format: { type: "json_object" } } : {}),
    }),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`Gateway ${r.status}: ${text.slice(0, 300)}`);
  const j = JSON.parse(text);
  return j.choices?.[0]?.message?.content ?? "";
}

async function ai(system: string, messages: any[], opts: { json?: boolean; max_tokens?: number } = {}): Promise<string> {
  if (GEMINI_KEY) {
    for (const model of GEMINI_MODELS) {
      try {
        return await geminiNative(system, messages, model, opts.json, opts.max_tokens ?? 4096);
      } catch (err) {
        console.error(`Gemini ${model} failed:`, (err as Error).message?.slice(0, 200));
      }
    }
  }
  return await geminiGateway(system, messages, opts.json);
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
      const reply = await ai(ANALYST_SYS, body.messages ?? []);
      out = { reply };
    } else if (path === "/narrate") {
      const transcript = (body.messages ?? [])
        .map((m: any) => `${m.role.toUpperCase()}: ${m.content}`).join("\n\n");
      const reply = await ai(NARRATOR_SYS, [
        { role: "user", content: `Prior conversation:\n\n${transcript}\n\nNow narrate the scenario.` },
      ]);
      out = { narrative: reply };
    } else if (path === "/summarize") {
      const transcript = (body.messages ?? [])
        .map((m: any) => `${m.role.toUpperCase()}: ${m.content}`).join("\n\n");
      const reply = await ai(SUMMARIZER_SYS, [
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
