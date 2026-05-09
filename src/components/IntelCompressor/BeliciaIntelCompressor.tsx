import { useEffect, useRef, useState } from "react";
import { X, Search, FileText, Link2, Sparkles, Loader2 } from "lucide-react";

type Mode = "archive" | "paste" | "url";
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

  // distillation
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [output, setOutput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [distillations, setDistillations] = useState<Distillation[]>([]);
  const [synthMode, setSynthMode] = useState(false);

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

  const distillChapter = async (ch: Chapter) => {
    if (streaming) return;
    setActiveIdx(ch.index); setOutput(""); setStreaming(true); setSynthMode(false);
    let acc = "";
    await streamDistill(
      { mode: "single", text: ch.full_text, source_title: selectedDoc?.title || "Source", chapter_title: ch.title, block_mode: "chapter" },
      (d) => { acc += d; setOutput(acc); },
      () => {
        setStreaming(false);
        setDistillations((prev) => {
          const filtered = prev.filter((p) => p.chapter_index !== ch.index);
          return [...filtered, { chapter_index: ch.index, chapter_title: ch.title, distillation: acc }];
        });
      },
      (e) => { setOutput(acc + "\n\n[ERROR] " + e); setStreaming(false); },
    );
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
        { mode: "single", text: data.text, source_title: urlInput, block_mode: "full" },
        (d) => { acc += d; setOutput(acc); },
        () => setStreaming(false),
        (e) => { setOutput(acc + "\n\n[ERROR] " + e); setStreaming(false); },
      );
    } catch (e) {
      setOutput("[ERROR] " + (e instanceof Error ? e.message : String(e)));
      setStreaming(false);
    }
  };

  const runSynthesis = async () => {
    if (distillations.length < 2 || streaming) return;
    setOutput(""); setStreaming(true); setSynthMode(true); setActiveIdx(null);
    let acc = "";
    await streamDistill(
      { mode: "batch", source_title: selectedDoc?.title || "Source", summaries: distillations },
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
            {(["archive", "paste", "url"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-3 py-1 border ${mode === m ? "border-white text-white" : "border-white/20 text-white/40 hover:text-white/70"}`}
              >
                {m === "archive" && <Search className="w-3 h-3 inline mr-1.5" />}
                {m === "paste" && <FileText className="w-3 h-3 inline mr-1.5" />}
                {m === "url" && <Link2 className="w-3 h-3 inline mr-1.5" />}
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
                  {distillations.length >= 2 && (
                    <button
                      onClick={runSynthesis}
                      disabled={streaming}
                      className="w-full mt-4 border border-white py-2 text-[11px] tracking-[0.3em] hover:bg-white hover:text-black transition disabled:opacity-40"
                    >
                      <Sparkles className="w-3 h-3 inline mr-2" />
                      MASTER SYNTHESIS ({distillations.length})
                    </button>
                  )}
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
              <button
                onClick={distillUrl}
                disabled={streaming || !urlInput.trim()}
                className="w-full border border-white/30 py-2 text-[11px] tracking-[0.3em] hover:bg-white hover:text-black transition disabled:opacity-40"
              >
                FETCH &amp; DISTILL
              </button>
            </>
          )}
        </div>

        {/* Right output panel */}
        <div ref={outRef} className="overflow-y-auto p-6">
          <div className="text-[10px] tracking-[0.3em] text-white/40 mb-3">
            {synthMode ? "MASTER SYNTHESIS" : "DISTILLATION"} {streaming && "· STREAMING…"}
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
