// Belicia Intel Compressor — Anthropic streaming distillation
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_PROMPT = `You are a high-density distillation engine producing LONG-FORM, exhaustive distillations. Your task: compress a book/source into a deeply detailed, multi-section breakdown that preserves every load-bearing argument, sub-argument, example, and definition. Stay strictly inside the source — do NOT bridge to outside frameworks, projects, or external schemas. No external context. No personalization. Just the work itself.

LENGTH: NO CAP. Write as long as the source warrants — there is no word limit, no page limit, no character limit. Do NOT be terse. Do NOT summarize when you can preserve. Density does not mean brevity — it means zero wasted words across a document that may be enormous. For sources of hundreds or thousands of pages, the distillation should be correspondingly massive and granular. Walk through the source's arc in order, then synthesize. Use every token you need.

DISTILLATION OUTPUT FORMAT — follow this exactly:

LOAD-BEARING IDEAS:
[Every structural concept internal to this source. What holds the whole argument up. One short paragraph each, not one sentence. Include as many as the source actually contains — do not artificially limit.]

KEY CLAIMS & EVIDENCE:
[The author's central claims AND supporting sub-claims, walked through in argumentative order. For each claim: state it, then give the evidence, examples, case studies, data, or reasoning the source uses. Preserve specific names, numbers, dates, quotes, and concrete examples. This section should be the longest.]

INTERNAL STRUCTURE:
[How the argument is organized across the whole work — premises, moves, counter-moves, conclusions. Walk through it section by section or chapter by chapter. Show how parts relate to the whole and how later parts depend on earlier parts.]

NOTABLE TERMS / DEFINITIONS:
[Every term the source introduces or uses in a specific way, with the source's own definition and the context in which it's deployed. Be exhaustive.]

ILLUSTRATIVE EXAMPLES & CASES:
[The concrete examples, stories, case studies, experiments, or anecdotes the source uses to ground its arguments. Preserve specifics — names, places, outcomes.]

TENSIONS & OPEN QUESTIONS:
[Internal contradictions, unresolved threads, places where the source hedges, or questions it raises but doesn't close.]

COMPRESSION RATIO: [X]% noise removed (and approximate word count of this distillation)

STYLE: Maximum semantic density across a LONG document. No padding, no preamble, no outside references. Start with substance. Stay inside the source. Length is required — err on the side of MORE detail, not less.`;

// Approx 1 token ≈ 3.5 chars. Anthropic input cap = 1M tokens. Stay well under.
const MAX_INPUT_CHARS = 2_800_000;
const ANTHROPIC_MAX_OUTPUT_TOKENS_PER_CALL = 64_000;
const CONTINUATION_TAIL_CHARS = 24_000;

function isAnthropicFallback(status: number, text: string): boolean {
  if (status === 401 || status === 402 || status === 429) return true;
  const t = text.toLowerCase();
  return t.includes("credit balance") || t.includes("quota") || t.includes("billing");
}

async function callGeminiNativeStream(userMessage: string, controller: ReadableStreamDefaultController, enc: TextEncoder): Promise<void> {
  const key = Deno.env.get("GEMINI_API_KEY")!;
  const model = Deno.env.get("GEMINI_MODEL") ?? "gemini-2.5-pro";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${encodeURIComponent(key)}`;
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: "user", parts: [{ text: userMessage }] }],
    }),
  });
  if (!r.ok || !r.body) {
    const t = await r.text();
    controller.enqueue(enc.encode(`data: ERROR: ${t}\n\n`));
    return;
  }
  const reader = r.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
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
        const parts = evt.candidates?.[0]?.content?.parts ?? [];
        for (const p of parts) {
          if (p.text) controller.enqueue(enc.encode(`data: ${p.text}\n\n`));
        }
      } catch { /* ignore */ }
    }
  }
}

async function callGeminiStream(userMessage: string, controller: ReadableStreamDefaultController, enc: TextEncoder): Promise<void> {
  if (Deno.env.get("GEMINI_API_KEY")) {
    try {
      return await callGeminiNativeStream(userMessage, controller, enc);
    } catch (err) {
      console.error("User Gemini key failed, falling back to Lovable gateway:", err);
    }
  }
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) {
    controller.enqueue(enc.encode(`data: ERROR: No Gemini key configured\n\n`));
    return;
  }
  let currentMessage = userMessage;
  let emittedTail = "";
  while (true) {
    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        stream: true,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: currentMessage },
        ],
      }),
    });
    if (!r.ok || !r.body) {
      const t = await r.text();
      controller.enqueue(enc.encode(`data: ERROR: ${t}\n\n`));
      return;
    }
    const reader = r.body.getReader();
    const dec = new TextDecoder();
    let buf = "";
    let finishReason = "";
    let emittedThisPass = "";
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
        if (!payload || payload === "[DONE]") continue;
        try {
          const evt = JSON.parse(payload);
          const delta = evt.choices?.[0]?.delta?.content;
          if (delta) {
            emittedThisPass += delta;
            emittedTail = (emittedTail + delta).slice(-CONTINUATION_TAIL_CHARS);
            controller.enqueue(enc.encode(`data: ${delta}\n\n`));
          }
          const fr = evt.choices?.[0]?.finish_reason;
          if (fr) finishReason = fr;
        } catch { /* ignore */ }
      }
    }
    if (finishReason !== "length" || !emittedThisPass.trim()) break;
    const originalRoom = Math.max(0, MAX_INPUT_CHARS - emittedTail.length - 8000);
    currentMessage = `Continue the previous distillation exactly where it stopped. Do not restart, recap, shorten, or conclude early. Keep following the original instruction and source; preserve exhaustive detail until the work is actually complete.\n\nORIGINAL INSTRUCTION AND SOURCE${userMessage.length > originalRoom ? " (truncated only to fit the provider input window)" : ""}:\n${userMessage.slice(0, originalRoom)}\n\nTAIL OF YOUR PREVIOUS OUTPUT TO CONTINUE FROM:\n${emittedTail}`;
  }
}

async function callAnthropicStream(userMessage: string, controller: ReadableStreamDefaultController, enc: TextEncoder): Promise<void> {
  const key = Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) {
    console.log("[intel-distill] No ANTHROPIC_API_KEY, falling back to Gemini");
    return callGeminiStream(userMessage, controller, enc);
  }

  let currentMessage = userMessage;
  let emittedTail = "";
  let firstAttempt = true;
  while (true) {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: ANTHROPIC_MAX_OUTPUT_TOKENS_PER_CALL,
        system: SYSTEM_PROMPT,
        stream: true,
        messages: [{ role: "user", content: currentMessage }],
      }),
    });
    if (!r.ok || !r.body) {
      const t = await r.text();
      if (firstAttempt && isAnthropicFallback(r.status, t)) {
        console.log("[intel-distill] Anthropic unavailable, falling back to Gemini:", r.status);
        return callGeminiStream(userMessage, controller, enc);
      }
      controller.enqueue(enc.encode(`data: ERROR: ${t}\n\n`));
      return;
    }
    firstAttempt = false;
    const reader = r.body.getReader();
    const dec = new TextDecoder();
    let buf = "";
    let stopReason = "";
    let emittedThisPass = "";
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
            const text = evt.delta.text;
            emittedThisPass += text;
            emittedTail = (emittedTail + text).slice(-CONTINUATION_TAIL_CHARS);
            controller.enqueue(enc.encode(`data: ${text}\n\n`));
          }
          if (evt.type === "message_delta" && evt.delta?.stop_reason) stopReason = evt.delta.stop_reason;
        } catch { /* ignore */ }
      }
    }
    if (stopReason !== "max_tokens" || !emittedThisPass.trim()) break;
    const originalRoom = Math.max(0, MAX_INPUT_CHARS - emittedTail.length - 8000);
    currentMessage = `Continue the previous distillation exactly where it stopped. Do not restart, recap, shorten, or conclude early. Keep following the original instruction and source; preserve exhaustive detail until the work is actually complete.\n\nORIGINAL INSTRUCTION AND SOURCE${userMessage.length > originalRoom ? " (truncated only to fit the provider input window)" : ""}:\n${userMessage.slice(0, originalRoom)}\n\nTAIL OF YOUR PREVIOUS OUTPUT TO CONTINUE FROM:\n${emittedTail}`;
  }
}

function chunkText(text: string, maxChars: number): string[] {
  if (text.length <= maxChars) return [text];
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    let end = Math.min(i + maxChars, text.length);
    if (end < text.length) {
      // try to break on paragraph/sentence
      const slice = text.slice(i, end);
      const breakAt = Math.max(slice.lastIndexOf("\n\n"), slice.lastIndexOf(". "));
      if (breakAt > maxChars * 0.6) end = i + breakAt;
    }
    chunks.push(text.slice(i, end));
    i = end;
  }
  return chunks;
}

function streamMany(messages: { header?: string; user: string }[]): Response {
  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      try {
        for (let i = 0; i < messages.length; i++) {
          const m = messages[i];
          if (m.header) controller.enqueue(enc.encode(`data: ${m.header}\n\n`));
          await callGeminiStream(m.user, controller, enc);
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

      const combinedFull = summaries.map((s: any) => `CHAPTER: ${s.chapter_title || "Unknown"}\n${s.distillation || ""}`).join("\n\n---\n\n");
      const synthHeader = `CROSS-CHAPTER MASTER SYNTHESIS for "${sourceTitle}":\n\nYou have distilled ${summaries.length} chapters. Produce a LONG-FORM MASTER SYNTHESIS with NO LENGTH CAP — write as long as the work warrants, no word/page/character limit — strictly internal to this source — do NOT reference outside frameworks, projects, or external context:\n\n1. BOOK-LEVEL LOAD-BEARING THESIS\n2. CORE ARGUMENTATIVE ARC (walk through how the book builds its case across chapters, in order)\n3. KEY CLAIMS & EVIDENCE (every load-bearing claim across the whole work, with the evidence/examples/data the source uses)\n4. NOTABLE TERMS & DEFINITIONS introduced across the work\n5. ILLUSTRATIVE EXAMPLES & CASES (preserve specifics — names, numbers, outcomes)\n6. INTERNAL TENSIONS / OPEN QUESTIONS the book raises but does not close\n7. OVERALL COMPRESSION RATIO\n\nBe exhaustive. Preserve specifics. Do not shorten at the expense of detail. Use every token you need.\n\nPrevious chapter distillations:\n`;

      if ((synthHeader.length + combinedFull.length) <= MAX_INPUT_CHARS) {
        return streamMany([{ user: synthHeader + combinedFull }]);
      }

      // Hierarchical: group, partial-synth each, then final master synth.
      const groupBudget = MAX_INPUT_CHARS - synthHeader.length - 2000;
      const groups: any[][] = [];
      let cur: any[] = []; let curLen = 0;
      for (const s of summaries) {
        const piece = `CHAPTER: ${s.chapter_title || "Unknown"}\n${s.distillation || ""}\n\n---\n\n`;
        if (curLen + piece.length > groupBudget && cur.length) { groups.push(cur); cur = []; curLen = 0; }
        cur.push(s); curLen += piece.length;
      }
      if (cur.length) groups.push(cur);

      const messages: { header?: string; user: string }[] = groups.map((g, i) => {
        const text = g.map((s: any) => `CHAPTER: ${s.chapter_title || "Unknown"}\n${s.distillation || ""}`).join("\n\n---\n\n");
        return {
          header: `\n\n========== PARTIAL SYNTHESIS ${i + 1}/${groups.length} (chapters ${g[0].chapter_index}–${g[g.length-1].chapter_index}) ==========\n\n`,
          user: `PARTIAL CROSS-CHAPTER SYNTHESIS for "${sourceTitle}" — chapters ${g[0].chapter_index} through ${g[g.length-1].chapter_index} of ${summaries.length}.\n\nProduce a LONG-FORM, detailed synthesis of ONLY these chapters: thesis, full argumentative arc, every load-bearing claim with its evidence, notable terms, illustrative examples (preserve specifics — names, numbers, cases), tensions/open questions. Strictly internal to the source. Be exhaustive — this will feed the final master synthesis.\n\nDistillations:\n${text}`,
        };
      });
      messages.push({
        header: `\n\n========== MASTER SYNTHESIS ==========\n\n`,
        user: `Note: the source was too large for one pass. Above are ${groups.length} partial syntheses covering all ${summaries.length} chapters of "${sourceTitle}". Now produce the final LONG-FORM MASTER SYNTHESIS integrating them — NO LENGTH CAP, no word/page/character limit, write as long as the work warrants — strictly internal to this source:\n\n1. BOOK-LEVEL LOAD-BEARING THESIS\n2. CORE ARGUMENTATIVE ARC across the whole work (walk through it in order)\n3. KEY CLAIMS & EVIDENCE (every load-bearing claim, with the source's evidence/examples/data)\n4. NOTABLE TERMS & DEFINITIONS\n5. ILLUSTRATIVE EXAMPLES & CASES (preserve specifics — names, numbers, outcomes)\n6. INTERNAL TENSIONS / OPEN QUESTIONS\n7. OVERALL COMPRESSION RATIO\n\nBe exhaustive. Preserve specifics. Use every token you need. Work from the partial syntheses you just produced as ground truth.`,
      });
      return streamMany(messages);
    }

    const text = String(body.text || "");
    const sourceTitle = body.source_title || "Unknown Source";
    const chapterTitle = body.chapter_title || "";
    const blockMode = body.block_mode || "chapter";
    const focus = String(body.focus || "").trim();
    if (!text) return new Response(JSON.stringify({ error: "no text" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const buildMsg = (part: string, idx?: number, total?: number) => `DISTILL THIS ${blockMode === "chapter" ? "CHAPTER" : "SOURCE"}${total && total > 1 ? ` (PART ${idx}/${total})` : ""}:

Source: "${sourceTitle}"
${chapterTitle ? `Chapter: ${chapterTitle}` : ""}
${focus ? `\nFOCUS DIRECTIVE — distill ONLY content relevant to:\n${focus}\nIgnore unrelated material. If nothing in this part matches, say so explicitly.\n` : ""}
---
${part}
---

Produce a LONG-FORM distillation for this ${total && total > 1 ? "part" : "source"} — NO LENGTH CAP, no word/page/character limit, write as long as the material warrants. Walk through the source in order. Preserve specific names, dates, numbers, quotes, examples, and case studies. Every sentence must carry weight, but DO NOT shorten at the expense of detail. Err on the side of MORE. Use every token you need.`;

    const chunks = chunkText(text, MAX_INPUT_CHARS - 2000);
    if (chunks.length === 1) {
      return streamMany([{ user: buildMsg(chunks[0]) }]);
    }
    const msgs = chunks.map((c, i) => ({
      header: `\n\n========== PART ${i + 1}/${chunks.length} ==========\n\n`,
      user: buildMsg(c, i + 1, chunks.length),
    }));
    msgs.push({
      header: `\n\n========== UNIFIED DISTILLATION ==========\n\n`,
      user: `The source "${sourceTitle}" was too large for one pass and was distilled in ${chunks.length} parts above. Now produce a single UNIFIED LONG-FORM distillation merging them, strictly internal to the source, in the full format (LOAD-BEARING IDEAS, KEY CLAIMS & EVIDENCE, INTERNAL STRUCTURE, NOTABLE TERMS / DEFINITIONS, ILLUSTRATIVE EXAMPLES & CASES, TENSIONS & OPEN QUESTIONS, COMPRESSION RATIO). NO LENGTH CAP — no word/page/character limit. Preserve specifics — names, numbers, examples — across the whole work. Use every token you need. Use the part distillations as ground truth.`,
    });
    return streamMany(msgs);
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
