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

async function callAnthropicStream(userMessage: string, maxTokens: number, controller: ReadableStreamDefaultController, enc: TextEncoder): Promise<void> {
  const key = Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) {
    controller.enqueue(enc.encode(`data: ERROR: ANTHROPIC_API_KEY not configured\n\n`));
    return;
  }
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
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
        if (evt.type === "content_block_delta" && evt.delta?.type === "text_delta") {
          controller.enqueue(enc.encode(`data: ${evt.delta.text}\n\n`));
        }
      } catch { /* ignore */ }
    }
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

function streamMany(messages: { header?: string; user: string; maxTokens: number }[]): Response {
  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      try {
        for (let i = 0; i < messages.length; i++) {
          const m = messages[i];
          if (m.header) controller.enqueue(enc.encode(`data: ${m.header}\n\n`));
          await callAnthropicStream(m.user, m.maxTokens, controller, enc);
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
        return streamMany([{ user: synthHeader + combinedFull, maxTokens: 48000 }]);
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

      const messages: { header?: string; user: string; maxTokens: number }[] = groups.map((g, i) => {
        const text = g.map((s: any) => `CHAPTER: ${s.chapter_title || "Unknown"}\n${s.distillation || ""}`).join("\n\n---\n\n");
        return {
          header: `\n\n========== PARTIAL SYNTHESIS ${i + 1}/${groups.length} (chapters ${g[0].chapter_index}–${g[g.length-1].chapter_index}) ==========\n\n`,
          user: `PARTIAL CROSS-CHAPTER SYNTHESIS for "${sourceTitle}" — chapters ${g[0].chapter_index} through ${g[g.length-1].chapter_index} of ${summaries.length}.\n\nProduce a LONG-FORM, detailed synthesis of ONLY these chapters: thesis, full argumentative arc, every load-bearing claim with its evidence, notable terms, illustrative examples (preserve specifics — names, numbers, cases), tensions/open questions. Strictly internal to the source. Be exhaustive — this will feed the final master synthesis.\n\nDistillations:\n${text}`,
          maxTokens: 48000,
        };
      });
      messages.push({
        header: `\n\n========== MASTER SYNTHESIS ==========\n\n`,
        user: `Note: the source was too large for one pass. Above are ${groups.length} partial syntheses covering all ${summaries.length} chapters of "${sourceTitle}". Now produce the final LONG-FORM MASTER SYNTHESIS integrating them — NO LENGTH CAP, no word/page/character limit, write as long as the work warrants — strictly internal to this source:\n\n1. BOOK-LEVEL LOAD-BEARING THESIS\n2. CORE ARGUMENTATIVE ARC across the whole work (walk through it in order)\n3. KEY CLAIMS & EVIDENCE (every load-bearing claim, with the source's evidence/examples/data)\n4. NOTABLE TERMS & DEFINITIONS\n5. ILLUSTRATIVE EXAMPLES & CASES (preserve specifics — names, numbers, outcomes)\n6. INTERNAL TENSIONS / OPEN QUESTIONS\n7. OVERALL COMPRESSION RATIO\n\nBe exhaustive. Preserve specifics. Use every token you need. Work from the partial syntheses you just produced as ground truth.`,
        maxTokens: 48000,
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
      return streamMany([{ user: buildMsg(chunks[0]), maxTokens: 48000 }]);
    }
    const msgs = chunks.map((c, i) => ({
      header: `\n\n========== PART ${i + 1}/${chunks.length} ==========\n\n`,
      user: buildMsg(c, i + 1, chunks.length),
      maxTokens: 48000,
    }));
    msgs.push({
      header: `\n\n========== UNIFIED DISTILLATION ==========\n\n`,
      user: `The source "${sourceTitle}" was too large for one pass and was distilled in ${chunks.length} parts above. Now produce a single UNIFIED LONG-FORM distillation merging them, strictly internal to the source, in the full format (LOAD-BEARING IDEAS, KEY CLAIMS & EVIDENCE, INTERNAL STRUCTURE, NOTABLE TERMS / DEFINITIONS, ILLUSTRATIVE EXAMPLES & CASES, TENSIONS & OPEN QUESTIONS, COMPRESSION RATIO). NO LENGTH CAP — no word/page/character limit. Preserve specifics — names, numbers, examples — across the whole work. Use every token you need. Use the part distillations as ground truth.`,
      maxTokens: 48000,
    });
    return streamMany(msgs);
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
