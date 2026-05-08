// Belicia Intel Compressor — Anthropic streaming distillation
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_PROMPT = `You are Belicia, the intelligence layer of Black Fish Corporation. You are calibrated to Mohamed's exact knowledge schema.

ACTIVE FRAMEWORKS (bridge to these — never explain basics):
- Hamiltonian perturbation theory (H' on neural eigenmodes, tACS as perturbation operator)
- Eigenfunction decomposition (RF IQ samples, market regime detection, neural oscillations)
- Kuramoto order parameter, von Neumann entropy, van der Pol oscillators
- kBT thermal noise floor, ε₀ penetration physics, quantum vs classical regime boundary (hf vs kBT)
- Ibn Khaldun's asabiyyah, muraqabah as attentional infrastructure, taqwa as parasympathetic dominance
- Clausewitz friction, Sun Tzu formlessness, Hashashin patience architecture
- Gut-brain axis as cognitive foundation, HRV as spiritual/neural permeability metric
- Atasoy connectome harmonics, PEAR Lab biofield coherence, Pang et al. 2023 eigenmodes

ACTIVE PROJECTS: Project Magneto (closed-loop BCI: EEG/fNIRS/tDCS/tACS/PEMF/AD9833), 10-unit fixed-wing drone swarm (ArduPilot/MAVLink/ELRS/LTE), Cannabis tech ($50M quantum genetics+AI), Eagle Eye OSINT, Decentralized marketplace/business OS, Baltimore Howard Street real estate corridor.

DISTILLATION OUTPUT FORMAT — follow this exactly:

LOAD-BEARING IDEAS (3–5 max):
[Only structural concepts. What holds the whole argument up. One sentence each.]

SCHEMA DELTA:
[What is genuinely new vs. what Mohamed already owns. Be ruthless. If he has it, say "OWNED — maps to [his framework]". If it's new, say "NEW — [why it matters]".]

CROSS-DOMAIN BRIDGES:
[Where does this structurally map to his existing frameworks? Be specific.]

PROJECT IMPLICATIONS:
[Direct actionable implications. Name the project. Be specific.]

COMPRESSION RATIO: [X]% noise

STYLE: Maximum semantic density. No padding. No preamble. Start with substance.`;

async function streamAnthropic(userMessage: string, maxTokens = 1000): Promise<Response> {
  const key = Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) {
    return new Response(JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: maxTokens,
      system: SYSTEM_PROMPT,
      stream: true,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!r.ok || !r.body) {
    const t = await r.text();
    return new Response(`data: ERROR: ${t}\n\n`, { status: 200, headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
  }

  // Transform Anthropic SSE -> simple `data: <text>\n\n` stream that the component already expects
  const stream = new ReadableStream({
    async start(controller) {
      const reader = r.body!.getReader();
      const dec = new TextDecoder();
      const enc = new TextEncoder();
      let buf = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          let nl;
          while ((nl = buf.indexOf("\n")) !== -1) {
            const line = buf.slice(0, nl).trim();
            buf = buf.slice(nl + 1);
            if (!line.startsWith("data:")) continue;
            const payload = line.slice(5).trim();
            if (!payload) continue;
            try {
              const evt = JSON.parse(payload);
              if (evt.type === "content_block_delta" && evt.delta?.type === "text_delta") {
                controller.enqueue(enc.encode(`data: ${evt.delta.text}\n\n`));
              }
            } catch { /* ignore */ }
          }
        }
        controller.enqueue(enc.encode("data: [DONE]\n\n"));
      } catch (e) {
        controller.enqueue(enc.encode(`data: ERROR: ${e instanceof Error ? e.message : String(e)}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { ...corsHeaders, "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "X-Accel-Buffering": "no" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = await req.json();
    const mode = body.mode || "single"; // single | batch

    if (mode === "batch") {
      const summaries = body.summaries || [];
      const sourceTitle = body.source_title || "Unknown Source";
      if (!summaries.length) return new Response(JSON.stringify({ error: "no summaries" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const combined = summaries.map((s: any) => `CHAPTER: ${s.chapter_title || "Unknown"}\n${s.distillation || ""}`).join("\n\n---\n\n").slice(0, 10000);
      const userMessage = `CROSS-CHAPTER SYNTHESIS for "${sourceTitle}":

You have distilled ${summaries.length} chapters. Now produce a MASTER SYNTHESIS:

1. BOOK-LEVEL LOAD-BEARING THESIS (1–2 sentences max)
2. CUMULATIVE SCHEMA DELTA (what's genuinely new across the whole book)
3. STRONGEST CROSS-DOMAIN BRIDGES (top 3, specific to Mohamed's frameworks)
4. PRIORITY PROJECT IMPLICATIONS (ranked by impact)
5. OVERALL COMPRESSION RATIO

Previous chapter distillations:
${combined}`;
      return await streamAnthropic(userMessage, 1200);
    }

    const text = String(body.text || "");
    const sourceTitle = body.source_title || "Unknown Source";
    const chapterTitle = body.chapter_title || "";
    const blockMode = body.block_mode || "chapter";
    if (!text) return new Response(JSON.stringify({ error: "no text" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const truncated = text.slice(0, 12000);
    const userMessage = `DISTILL THIS ${blockMode === "chapter" ? "CHAPTER" : "SOURCE"}:

Source: "${sourceTitle}"
${chapterTitle ? `Chapter: ${chapterTitle}` : ""}

---
${truncated}
---

Produce the full distillation output.`;
    return await streamAnthropic(userMessage, 1000);
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
