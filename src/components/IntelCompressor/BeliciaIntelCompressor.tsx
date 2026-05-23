import { useEffect, useRef, useState } from "react";
import { X, Search, FileText, Link2, Sparkles, Loader2, Archive } from "lucide-react";
import JSZip from "jszip";
import * as pdfjsLib from "pdfjs-dist";
// @ts-ignore - vite worker import
import PdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?worker";

pdfjsLib.GlobalWorkerOptions.workerPort = new PdfWorker();

type Mode = "archive" | "paste" | "url" | "zip";
type ArchiveDoc = { identifier: string; title?: string; creator?: string; year?: string; description?: string };
type Chapter = { index: number; title: string; word_count: number; char_count: number; full_text: string };
type Distillation = { chapter_index: number; chapter_title: string; distillation: string };

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

async function streamDistill(
  body: any,
  onDelta: (s: string) => void,
  onDone: () => void,
  onError: (e: string) => void,
) {
  try {
    const r = await fetch(`${SUPABASE_URL}/functions/v1/intel-distill`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${PUBLISHABLE_KEY}` },
      body: JSON.stringify(body),
    });
    if (!r.ok || !r.body) { onError(`HTTP ${r.status}`); return; }
    const reader = r.body.getReader();
    const dec = new TextDecoder();
    let buf = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let nl;
      while ((nl = buf.indexOf("\n")) !== -1) {
        const line = buf.slice(0, nl);
        buf = buf.slice(nl + 1);
        if (!line.startsWith("data: ")) continue;
        const payload = line.slice(6);
        if (payload === "[DONE]") { onDone(); return; }
        if (payload.startsWith("ERROR")) { onError(payload); return; }
        onDelta(payload);
      }
    }
    onDone();
  } catch (e) {
    onError(e instanceof Error ? e.message : String(e));
  }
}

async function archiveCall(action: string, payload: any) {
  const r = await fetch(`${SUPABASE_URL}/functions/v1/intel-archive`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${PUBLISHABLE_KEY}` },
    body: JSON.stringify({ action, ...payload }),
  });
  return await r.json();
}

async function extractPdfText(data: ArrayBuffer): Promise<string> {
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const parts: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const tc = await page.getTextContent();
    parts.push((tc.items as any[]).map((it) => it.str).join(" "));
    page.cleanup();
  }
  await pdf.destroy();
  return parts.join("\n\n");
}

function stripHtml(s: string) {
  return s.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ").trim();
}

interface Props { onClose: () => void }

export const BeliciaIntelCompressor = ({ onClose }: Props) => {
  const [mode, setMode] = useState<Mode>("archive");

  // archive state
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ArchiveDoc[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<ArchiveDoc | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loadingChapters, setLoadingChapters] = useState(false);

  // paste / url
  const [pasteText, setPasteText] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [urlFocus, setUrlFocus] = useState("");

  // zip
  const [zipName, setZipName] = useState("");
  const [zipProgress, setZipProgress] = useState("");
  const [loadingZip, setLoadingZip] = useState(false);
  const zipInputRef = useRef<HTMLInputElement>(null);

  // distillation
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [output, setOutput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [distillations, setDistillations] = useState<Distillation[]>([]);
  const [synthMode, setSynthMode] = useState(false);
  const [autoRunning, setAutoRunning] = useState(false);
  const autoCancelRef = useRef(false);

  const outRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (outRef.current) outRef.current.scrollTop = outRef.current.scrollHeight;
  }, [output]);

  const runSearch = async () => {
    if (!query.trim()) return;
    setSearching(true); setResults([]); setSelectedDoc(null); setChapters([]);
    try {
      const data = await archiveCall("search", { q: query, rows: 12 });
      setResults(data.results || []);
    } finally { setSearching(false); }
  };

  const loadDoc = async (doc: ArchiveDoc) => {
    setSelectedDoc(doc); setChapters([]); setDistillations([]); setOutput(""); setActiveIdx(null);
    setLoadingChapters(true);
    try {
      const data = await archiveCall("fetch-text", { identifier: doc.identifier });
      setChapters(data.chapters || []);
    } finally { setLoadingChapters(false); }
  };

  const distillChapterAsync = (ch: Chapter) =>
    new Promise<void>((resolve) => {
      setActiveIdx(ch.index); setOutput(""); setStreaming(true); setSynthMode(false);
      let acc = "";
      streamDistill(
        { mode: "single", text: ch.full_text, source_title: selectedDoc?.title || zipName || "Source", chapter_title: ch.title, block_mode: "chapter" },
        (d) => { acc += d; setOutput(acc); },
        () => {
          setStreaming(false);
          setDistillations((prev) => {
            const filtered = prev.filter((p) => p.chapter_index !== ch.index);
            return [...filtered, { chapter_index: ch.index, chapter_title: ch.title, distillation: acc }];
          });
          resolve();
        },
        (e) => { setOutput(acc + "\n\n[ERROR] " + e); setStreaming(false); resolve(); },
      );
    });

  const distillChapter = async (ch: Chapter) => {
    if (streaming) return;
    await distillChapterAsync(ch);
  };

  const distillAll = async () => {
    if (streaming || autoRunning) return;
    autoCancelRef.current = false;
    setAutoRunning(true);
    const pending = chapters.filter((c) => !distillations.some((d) => d.chapter_index === c.index));
    for (const ch of pending) {
      if (autoCancelRef.current) break;
      await distillChapterAsync(ch);
    }
    setAutoRunning(false);
  };

  const distillRaw = async (text: string, sourceTitle: string) => {
    if (!text.trim() || streaming) return;
    setOutput(""); setStreaming(true); setActiveIdx(null); setSynthMode(false);
    let acc = "";
    await streamDistill(
      { mode: "single", text, source_title: sourceTitle, block_mode: "full" },
      (d) => { acc += d; setOutput(acc); },
      () => setStreaming(false),
      (e) => { setOutput(acc + "\n\n[ERROR] " + e); setStreaming(false); },
    );
  };

  const distillUrl = async () => {
    if (!urlInput.trim() || streaming) return;
    setStreaming(true); setOutput("Fetching URL…");
    try {
      const data = await archiveCall("fetch-url", { url: urlInput });
      if (data.error) { setOutput("[ERROR] " + data.error); setStreaming(false); return; }
      setOutput("");
      let acc = "";
      await streamDistill(
        { mode: "single", text: data.text, source_title: urlInput, block_mode: "full", focus: urlFocus },
        (d) => { acc += d; setOutput(acc); },
        () => setStreaming(false),
        (e) => { setOutput(acc + "\n\n[ERROR] " + e); setStreaming(false); },
      );
    } catch (e) {
      setOutput("[ERROR] " + (e instanceof Error ? e.message : String(e)));
      setStreaming(false);
    }
  };

  const handleZipFile = async (file: File) => {
    setLoadingZip(true);
    setZipName(file.name);
    setChapters([]); setDistillations([]); setOutput(""); setActiveIdx(null); setSelectedDoc(null);
    setZipProgress("opening zip…");
    try {
      const zip = await JSZip.loadAsync(file);
      const entries = Object.values(zip.files).filter((f) => !f.dir);
      // sort by path for stable order
      entries.sort((a, b) => a.name.localeCompare(b.name));
      const chs: Chapter[] = [];
      let idx = 0;
      for (const entry of entries) {
        const lower = entry.name.toLowerCase();
        if (/(^|\/)(\._|\.ds_store|thumbs\.db)/i.test(entry.name)) continue;
        setZipProgress(`reading ${idx + 1}/${entries.length}: ${entry.name}`);
        let text = "";
        try {
          if (lower.endsWith(".pdf")) {
            const buf = await entry.async("arraybuffer");
            text = await extractPdfText(buf);
          } else if (lower.endsWith(".txt") || lower.endsWith(".md") || lower.endsWith(".markdown") ||
                     lower.endsWith(".json") || lower.endsWith(".csv") || lower.endsWith(".log") ||
                     lower.endsWith(".rtf") || lower.endsWith(".xml") || lower.endsWith(".srt") ||
                     lower.endsWith(".vtt") || lower.endsWith(".tex") || lower.endsWith(".org")) {
            text = await entry.async("string");
            if (lower.endsWith(".xml")) text = stripHtml(text);
          } else if (lower.endsWith(".html") || lower.endsWith(".htm")) {
            text = stripHtml(await entry.async("string"));
          } else {
            continue; // skip binary / unsupported
          }
        } catch (e) {
          continue;
        }
        text = text.replace(/\s+/g, " ").trim();
        if (text.length < 100) continue;
        chs.push({
          index: idx++,
          title: entry.name,
          word_count: text.split(/\s+/).length,
          char_count: text.length,
          full_text: text,
        });
        // incremental render so user sees progress
        if (idx % 5 === 0) setChapters([...chs]);
      }
      setChapters(chs);
      setZipProgress(`loaded ${chs.length} document${chs.length === 1 ? "" : "s"}`);
    } catch (e) {
      setZipProgress("[ERROR] " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setLoadingZip(false);
    }
  };

  const runSynthesis = async () => {
    if (distillations.length < 2 || streaming) return;
    setOutput(""); setStreaming(true); setSynthMode(true); setActiveIdx(null);
    let acc = "";
    await streamDistill(
      { mode: "batch", source_title: selectedDoc?.title || zipName || "Source", summaries: distillations },
      (d) => { acc += d; setOutput(acc); },
      () => setStreaming(false),
      (e) => { setOutput(acc + "\n\n[ERROR] " + e); setStreaming(false); },
    );
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black text-white font-[Tektur] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/15">
        <div className="flex items-center gap-6">
          <h2 className="text-sm tracking-[0.4em]">⊕ INTEL COMPRESSOR</h2>
          <div className="flex gap-1 text-[10px] tracking-[0.3em]">
            {(["archive", "paste", "url", "zip"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-3 py-1 border ${mode === m ? "border-white text-white" : "border-white/20 text-white/40 hover:text-white/70"}`}
              >
                {m === "archive" && <Search className="w-3 h-3 inline mr-1.5" />}
                {m === "paste" && <FileText className="w-3 h-3 inline mr-1.5" />}
                {m === "url" && <Link2 className="w-3 h-3 inline mr-1.5" />}
                {m === "zip" && <Archive className="w-3 h-3 inline mr-1.5" />}
                {m.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <button onClick={onClose} className="text-white/60 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[420px_1fr] min-h-0">
        {/* Left panel */}
        <div className="border-r border-white/15 overflow-y-auto p-5 space-y-4">
          {mode === "archive" && (
            <>
              <div className="flex gap-2">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && runSearch()}
                  placeholder="search internet archive…"
                  className="flex-1 bg-transparent border border-white/20 px-3 py-2 text-xs focus:outline-none focus:border-white"
                />
                <button onClick={runSearch} disabled={searching} className="border border-white/30 px-3 text-[11px] tracking-widest hover:bg-white hover:text-black transition disabled:opacity-40">
                  {searching ? <Loader2 className="w-3 h-3 animate-spin" /> : "GO"}
                </button>
              </div>

              {!selectedDoc && (
                <div className="space-y-2">
                  {results.map((r) => (
                    <button
                      key={r.identifier}
                      onClick={() => loadDoc(r)}
                      className="w-full text-left p-3 border border-white/10 hover:border-white/50 transition text-[11px]"
                    >
                      <div className="text-white truncate">{r.title || r.identifier}</div>
                      <div className="text-white/50 mt-1 truncate">{r.creator} {r.year ? `· ${r.year}` : ""}</div>
                    </button>
                  ))}
                </div>
              )}

              {selectedDoc && (
                <div className="space-y-3">
                  <button onClick={() => { setSelectedDoc(null); setChapters([]); }} className="text-[10px] tracking-widest text-white/50 hover:text-white">
                    ← BACK TO RESULTS
                  </button>
                  <div className="text-xs text-white border-b border-white/10 pb-2">{selectedDoc.title}</div>
                  {loadingChapters && <div className="text-[11px] text-white/50 flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> loading chapters…</div>}
                </div>
              )}
            </>
          )}

          {mode === "paste" && (
            <>
              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder="paste raw text…"
                className="w-full h-80 bg-transparent border border-white/20 p-3 text-xs focus:outline-none focus:border-white resize-none"
              />
              <button
                onClick={() => distillRaw(pasteText, "Pasted Text")}
                disabled={streaming || !pasteText.trim()}
                className="w-full border border-white/30 py-2 text-[11px] tracking-[0.3em] hover:bg-white hover:text-black transition disabled:opacity-40"
              >
                DISTILL
              </button>
            </>
          )}

          {mode === "url" && (
            <>
              <input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://…"
                className="w-full bg-transparent border border-white/20 px-3 py-2 text-xs focus:outline-none focus:border-white"
              />
              <div className="text-[10px] tracking-[0.3em] text-white/40 pt-1">FOCUS / RESEARCH QUERY (OPTIONAL)</div>
              <textarea
                value={urlFocus}
                onChange={(e) => setUrlFocus(e.target.value)}
                placeholder="e.g. only the section on pricing tiers, or: extract claims about latency benchmarks…"
                className="w-full h-32 bg-transparent border border-white/20 p-3 text-xs focus:outline-none focus:border-white resize-none"
              />
              <button
                onClick={distillUrl}
                disabled={streaming || !urlInput.trim()}
                className="w-full border border-white/30 py-2 text-[11px] tracking-[0.3em] hover:bg-white hover:text-black transition disabled:opacity-40"
              >
                FETCH &amp; DISTILL
              </button>
            </>
          )}

          {mode === "zip" && (
            <>
              <input
                ref={zipInputRef}
                type="file"
                accept=".zip,application/zip"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleZipFile(f);
                  if (zipInputRef.current) zipInputRef.current.value = "";
                }}
              />
              <button
                onClick={() => zipInputRef.current?.click()}
                disabled={loadingZip}
                className="w-full border border-white/30 py-6 text-[11px] tracking-[0.3em] hover:bg-white hover:text-black transition disabled:opacity-40"
              >
                {loadingZip ? <Loader2 className="w-4 h-4 inline animate-spin mr-2" /> : <Archive className="w-4 h-4 inline mr-2" />}
                {zipName || "SELECT .ZIP ARCHIVE"}
              </button>
              {zipProgress && (
                <div className="text-[10px] text-white/50 truncate">{zipProgress}</div>
              )}
              <div className="text-[10px] text-white/40 leading-relaxed">
                Reads PDFs, TXT, MD, HTML, JSON, CSV, XML, SRT/VTT, RTF, TEX. Each file becomes a distillable document. Designed for thousands of pages.
              </div>
            </>
          )}

          {/* Shared chapter / document list (archive + zip) */}
          {(mode === "archive" || mode === "zip") && chapters.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="text-[10px] tracking-[0.3em] text-white/50">
                  {chapters.length} {mode === "zip" ? "DOCUMENT" : "CHAPTER"}{chapters.length === 1 ? "" : "S"}
                </div>
                {!autoRunning ? (
                  <button
                    onClick={distillAll}
                    disabled={streaming}
                    className="text-[10px] tracking-[0.2em] border border-white/40 px-2 py-1 hover:bg-white hover:text-black transition disabled:opacity-30"
                  >
                    DISTILL ALL
                  </button>
                ) : (
                  <button
                    onClick={() => { autoCancelRef.current = true; }}
                    className="text-[10px] tracking-[0.2em] border border-white/40 px-2 py-1 hover:bg-white hover:text-black transition"
                  >
                    STOP
                  </button>
                )}
              </div>
              <div className="max-h-[55vh] overflow-y-auto space-y-2 pr-1">
                {chapters.map((ch) => {
                  const done = distillations.some((d) => d.chapter_index === ch.index);
                  return (
                    <div key={ch.index} className={`border ${activeIdx === ch.index ? "border-white" : "border-white/15"} p-3`}>
                      <div className="text-[11px] text-white truncate">{ch.title}</div>
                      <div className="text-[10px] text-white/40 mt-1">{ch.word_count.toLocaleString()} words {done ? "· ✓ distilled" : ""}</div>
                      <button
                        onClick={() => distillChapter(ch)}
                        disabled={streaming}
                        className="mt-2 text-[10px] tracking-[0.2em] border border-white/30 px-2 py-1 hover:bg-white hover:text-black transition disabled:opacity-30"
                      >
                        DISTILL
                      </button>
                    </div>
                  );
                })}
              </div>
              {distillations.length >= 2 && (
                <button
                  onClick={runSynthesis}
                  disabled={streaming}
                  className="w-full mt-2 border border-white py-2 text-[11px] tracking-[0.3em] hover:bg-white hover:text-black transition disabled:opacity-40"
                >
                  <Sparkles className="w-3 h-3 inline mr-2" />
                  MASTER SYNTHESIS ({distillations.length})
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right output panel */}
        <div ref={outRef} className="overflow-y-auto p-6">
          <div className="text-[10px] tracking-[0.3em] text-white/40 mb-3">
            {synthMode ? "MASTER SYNTHESIS" : "DISTILLATION"} {streaming && "· STREAMING…"} {autoRunning && "· AUTO"}
          </div>
          {output ? (
            <pre className="whitespace-pre-wrap text-xs text-white/90 leading-relaxed font-[Tektur]">{output}</pre>
          ) : (
            <div className="text-white/30 text-xs">Distillation output appears here.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BeliciaIntelCompressor;
