// Belicia Intel Compressor — Archive proxy + URL fetch
// Actions: search, metadata, fetch-text, fetch-url
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

const ARCHIVE = "https://archive.org";

function splitChapters(text: string) {
  const patterns = [
    /\bCHAPTER\s+(?:[IVXLCDM]+|\d+)\b/gi,
    /\bPART\s+(?:[IVXLCDM]+|\d+)\b/gi,
    /\bSECTION\s+\d+\b/gi,
    /\bBOOK\s+(?:[IVXLCDM]+|\d+)\b/gi,
  ];
  const matches: { idx: number; title: string }[] = [];
  for (const p of patterns) {
    let m;
    while ((m = p.exec(text)) !== null) matches.push({ idx: m.index, title: m[0] });
  }
  matches.sort((a, b) => a.idx - b.idx);
  // dedupe close matches
  const uniq = matches.filter((m, i) => i === 0 || m.idx - matches[i - 1].idx > 500);

  const chapters: any[] = [];
  if (uniq.length >= 2) {
    for (let i = 0; i < uniq.length; i++) {
      const start = uniq[i].idx;
      const end = i + 1 < uniq.length ? uniq[i + 1].idx : text.length;
      const body = text.slice(start, end).trim();
      if (body.length > 200) {
        chapters.push({
          index: chapters.length,
          title: uniq[i].title.slice(0, 80),
          word_count: body.split(/\s+/).length,
          char_count: body.length,
          full_text: body,
        });
      }
    }
    if (chapters.length) return chapters;
  }
  // Fallback chunking
  const words = text.split(/\s+/);
  const size = 3000;
  for (let i = 0; i < words.length; i += size) {
    const chunk = words.slice(i, i + size).join(" ");
    chapters.push({
      index: chapters.length,
      title: `Section ${chapters.length + 1}`,
      word_count: Math.min(size, words.length - i),
      char_count: chunk.length,
      full_text: chunk,
    });
  }
  return chapters;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = await req.json();
    const action = body.action;

    if (action === "search") {
      const q = String(body.q || "");
      const rows = Number(body.rows || 10);
      if (!q) return new Response(JSON.stringify({ error: "missing q" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const url = `${ARCHIVE}/advancedsearch.php?q=${encodeURIComponent(q + " mediatype:texts")}&fl[]=identifier&fl[]=title&fl[]=creator&fl[]=year&fl[]=description&fl[]=downloads&rows=${rows}&page=1&output=json`;
      const r = await fetch(url);
      const data = await r.json();
      return new Response(JSON.stringify({ results: data?.response?.docs ?? [] }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "metadata") {
      const id = String(body.identifier || "");
      const r = await fetch(`${ARCHIVE}/metadata/${id}`);
      const data = await r.json();
      const files = (data.files || []).filter((f: any) => /(_djvu\.txt|_full_text\.txt|\.txt|_djvu\.xml)$/.test(f.name || ""));
      return new Response(JSON.stringify({ identifier: id, metadata: data.metadata, text_files: files }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "fetch-text") {
      const id = String(body.identifier || "");
      let filename = body.filename as string | undefined;
      const maxChars = Number(body.max_chars || 500000);
      if (!id) return new Response(JSON.stringify({ error: "identifier required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

      let files: any[] = [];
      let pdfFile: string | undefined;
      if (!filename) {
        const meta = await (await fetch(`${ARCHIVE}/metadata/${id}`)).json();
        files = meta.files || [];
        for (const ext of ["_djvu.txt", "_hocr_searchtext.txt", "_full_text.txt", ".txt", "_djvu.txt.gz", "_djvu.xml"]) {
          const m = files.find((f: any) => (f.name || "").endsWith(ext));
          if (m) { filename = m.name; break; }
        }
        if (!filename) {
          // Try convention-based fallback (metadata sometimes hides derivatives)
          const guesses = [`${id}_djvu.txt`, `${id}_hocr_searchtext.txt`];
          for (const g of guesses) {
            const h = await fetch(`${ARCHIVE}/download/${id}/${g}`, { method: "HEAD" });
            if (h.ok) { filename = g; break; }
          }
        }
        if (!filename) {
          const pdf = files.find((f: any) => (f.name || "").toLowerCase().endsWith(".pdf"));
          if (pdf) pdfFile = pdf.name;
        }
        if (!filename && !pdfFile) return new Response(JSON.stringify({ error: "no text or pdf file found for this item" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      let raw = "";
      if (filename) {
        const r = await fetch(`${ARCHIVE}/download/${id}/${filename}`);
        if (!r.ok || !r.body) return new Response(JSON.stringify({ error: `download failed (${r.status})` }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        let stream: ReadableStream<Uint8Array> = r.body;
        if (filename.endsWith(".gz")) {
          stream = stream.pipeThrough(new DecompressionStream("gzip"));
        }
        const reader = stream.getReader();
        const dec = new TextDecoder();
        while (raw.length < maxChars) {
          const { done, value } = await reader.read();
          if (done) break;
          raw += dec.decode(value, { stream: true });
        }
        try { reader.cancel(); } catch {}
        if (filename.endsWith(".xml")) raw = raw.replace(/<[^>]+>/g, " ");
      } else if (pdfFile) {
        const r = await fetch(`${ARCHIVE}/download/${id}/${pdfFile}`);
        if (!r.ok) return new Response(JSON.stringify({ error: `pdf download failed (${r.status})` }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        const buf = new Uint8Array(await r.arrayBuffer());
        try {
          const pdfParse = (await import("npm:pdf-parse@1.1.1/lib/pdf-parse.js")).default;
          const { Buffer } = await import("node:buffer");
          const parsed = await pdfParse(Buffer.from(buf));
          raw = parsed.text || "";
        } catch (e) {
          return new Response(JSON.stringify({ error: `pdf parse failed: ${e instanceof Error ? e.message : String(e)}` }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        filename = pdfFile;
      }

      raw = raw.replace(/\s+/g, " ").trim();
      if (!raw) return new Response(JSON.stringify({ error: "extracted text was empty (likely scanned PDF without OCR)" }), { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const chapters = splitChapters(raw);
      return new Response(JSON.stringify({
        identifier: id, filename,
        total_chars: raw.length,
        total_words: raw.split(/\s+/).length,
        chapter_count: chapters.length,
        chapters,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "fetch-url") {
      const url = String(body.url || "");
      if (!url) return new Response(JSON.stringify({ error: "url required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      let target = url;
      try {
        const wb = await (await fetch(`${ARCHIVE}/wayback/available?url=${encodeURIComponent(url)}`)).json();
        const snap = wb?.archived_snapshots?.closest?.url;
        if (snap) target = snap;
      } catch {}
      const r = await fetch(target, { headers: { "User-Agent": "BeliciaBot/1.0" } });
      let html = await r.text();
      html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
                 .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
                 .replace(/<[^>]+>/g, " ")
                 .replace(/\s+/g, " ").trim();
      const words = html.split(" ").slice(0, 30000);
      return new Response(JSON.stringify({ url, source: target === url ? "direct" : "wayback", word_count: words.length, text: words.join(" ") }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "unknown action" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
