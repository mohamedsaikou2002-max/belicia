// Belicia Intel Compressor — Anthropic streaming distillation
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_PROMPT = `You are a high-density distillation engine. Your task: compress a book/source into its essential structural content. Stay strictly inside the source — do NOT bridge to outside frameworks, projects, or external schemas. No external context. No personalization. Just the work itself.

DISTILLATION OUTPUT FORMAT — follow this exactly:

LOAD-BEARING IDEAS:
[Only structural concepts internal to this source. What holds the whole argument up. One sentence each.]

KEY CLAIMS & EVIDENCE:
[The author's central claims and the evidence/arguments they use to support them. Faithful to the source.]

INTERNAL STRUCTURE:
[How the argument is organized — premises, moves, conclusions. How parts relate to the whole.]

NOTABLE TERMS / DEFINITIONS:
[Terminology the source introduces or uses in a specific way, with the source's own meaning.]

TENSIONS & OPEN QUESTIONS:
[Internal contradictions, unresolved threads, or questions the source raises but doesn't close.]

COMPRESSION RATIO: [X]% noise

STYLE: Maximum semantic density. No padding. No preamble. No outside references. Start with substance. Stay inside the source.`;

async function streamAnthropic(userMessage: string, maxTokens = 16000): Promise<Response> {
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
      const combined = summaries.map((s: any) => `CHAPTER: ${s.chapter_title || "Unknown"}\n${s.distillation || ""}`).join("\n\n---\n\n");
      const userMessage = `CROSS-CHAPTER SYNTHESIS for "${sourceTitle}":

You have distilled ${summaries.length} chapters. Produce a MASTER SYNTHESIS strictly internal to this source — do NOT reference outside frameworks, projects, or external context:

1. BOOK-LEVEL LOAD-BEARING THESIS
2. CORE ARGUMENTATIVE ARC (how the book builds its case across chapters)
3. KEY CLAIMS & EVIDENCE (strongest, most load-bearing across the whole work)
4. INTERNAL TENSIONS / OPEN QUESTIONS the book raises but does not close
5. OVERALL COMPRESSION RATIO

Previous chapter distillations:
${combined}`;
      return await streamAnthropic(userMessage, 1200);
    }

    const text = String(body.text || "");
    const sourceTitle = body.source_title || "Unknown Source";
    const chapterTitle = body.chapter_title || "";
    const blockMode = body.block_mode || "chapter";
    const focus = String(body.focus || "").trim();
    if (!text) return new Response(JSON.stringify({ error: "no text" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const userMessage = `DISTILL THIS ${blockMode === "chapter" ? "CHAPTER" : "SOURCE"}:

Source: "${sourceTitle}"
${chapterTitle ? `Chapter: ${chapterTitle}` : ""}
${focus ? `\nFOCUS DIRECTIVE — distill ONLY content relevant to:\n${focus}\nIgnore unrelated material. If nothing in the source matches, say so explicitly.\n` : ""}
---
${text}
---

Produce the full distillation. No length cap — be as long as needed, but every sentence must carry weight. Maximum density, zero padding.`;
    return await streamAnthropic(userMessage, 16000);
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
