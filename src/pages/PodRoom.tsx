import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Brain, ArrowLeft, RefreshCw, Settings2, Download, ChevronDown, ChevronUp } from "lucide-react";
import { TopNav } from "@/components/TopNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import {
  podSetup, podStep, podInject, podPredict, podCanvas, podReset,
  podWorldState, podInterrogate, getTheatres, corpusIngest,
} from "@/lib/podApi";
// @ts-ignore - JS module
import CORPUS_DOCS, { CORPUS_BY_CATEGORY, TOTAL_DOCS } from "@/lib/mass_psych_corpus.js";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, ReferenceLine, Legend, CartesianGrid,
} from "recharts";

// ─── color helpers ────────────────────────────────────────────
function beliefColor(b: number) {
  const c = Math.max(0, Math.min(1, b));
  const stops = [
    [0.0, [220, 50, 50]],
    [0.5, [180, 140, 40]],
    [1.0, [40, 200, 100]],
  ] as const;
  for (let i = 0; i < stops.length - 1; i++) {
    const [a, ca] = stops[i];
    const [d, cb] = stops[i + 1];
    if (c >= a && c <= d) {
      const t = (c - a) / (d - a);
      const r = Math.round(ca[0] + t * (cb[0] - ca[0]));
      const g = Math.round(ca[1] + t * (cb[1] - ca[1]));
      const bl = Math.round(ca[2] + t * (cb[2] - ca[2]));
      return `rgb(${r},${g},${bl})`;
    }
  }
  return "rgb(180,180,180)";
}
const seirOpacity = (s: string) => ({ S: 0.35, E: 0.65, I: 1, R: 0.25 } as any)[s] ?? 1;

// ─── component ────────────────────────────────────────────────
export default function PodRoom() {
  // world state
  const [world, setWorld] = useState<any>(null);
  const [worldLoading, setWorldLoading] = useState(false);

  // setup
  const [theatres, setTheatres] = useState<string[]>(["Global Mixed"]);
  const [narrative, setNarrative] = useState("");
  const [theatre, setTheatre] = useState("Global Mixed");
  const [agentCount, setAgentCount] = useState(500);
  const [insurgentPct, setInsurgentPct] = useState(0);
  const [forceRefresh, setForceRefresh] = useState(false);
  const [setupLoading, setSetupLoading] = useState(false);
  const [setupStatus, setSetupStatus] = useState("");
  const [initialized, setInitialized] = useState(false);
  const [derivedVars, setDerivedVars] = useState<any>(null);
  const [derivedOpen, setDerivedOpen] = useState(true);
  const [seedInfo, setSeedInfo] = useState<any>(null);

  // sim state
  const [canvas, setCanvas] = useState<any>(null);
  const [stepLoading, setStepLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  // inject
  const [injNarr, setInjNarr] = useState(0.5);
  const [injEvent, setInjEvent] = useState("");
  const [injRederive, setInjRederive] = useState(false);

  // interrogate
  const [agentIdx, setAgentIdx] = useState(0);
  const [agentQ, setAgentQ] = useState("");
  const [agentR, setAgentR] = useState("");
  const [agentLoading, setAgentLoading] = useState(false);

  // prediction
  const [prediction, setPrediction] = useState<any>(null);
  const [predictLoading, setPredictLoading] = useState(false);

  // corpus panel
  const [corpusOpen, setCorpusOpen] = useState(false);
  const [ingested, setIngested] = useState<Record<string, boolean>>({});
  const [manualText, setManualText] = useState("");
  const [manualId, setManualId] = useState("");
  const [manualCol, setManualCol] = useState<"agent" | "shared">("agent");

  // ─── effects ────────────────────────────────────────────────
  const loadWorld = async () => {
    setWorldLoading(true);
    try { setWorld(await podWorldState()); }
    catch (e: any) { toast.error("World state failed: " + e.message); }
    finally { setWorldLoading(false); }
  };

  useEffect(() => {
    loadWorld();
    getTheatres()
      .then((d) => { if (d.theatres?.length) setTheatres(d.theatres); })
      .catch(() => {/* keep defaults */});
    // Bridge: pick up payload from Game Theory Room
    try {
      const raw = sessionStorage.getItem("gt_pod_payload");
      if (raw) {
        const p = JSON.parse(raw);
        if (p.narrative) setNarrative(p.narrative);
        if (p.theatre) setTheatre(p.theatre);
        if (p.agent_count) setAgentCount(Math.max(100, Math.min(5000, Math.round(p.agent_count))));
        sessionStorage.removeItem("gt_pod_payload");
        toast.success("Loaded scenario from Game Theory Room");
      }
    } catch {/* ignore */}
  }, []);

  // ─── actions ────────────────────────────────────────────────
  const onSetup = async () => {
    if (!narrative.trim()) { toast.error("Enter a narrative"); return; }
    setSetupLoading(true);
    try {
      setSetupStatus("Fetching live world state...");
      await new Promise((r) => setTimeout(r, 200));
      setSetupStatus("Claude analyzing variables...");
      const res = await podSetup(narrative, theatre, agentCount, insurgentPct, forceRefresh);
      setSetupStatus("Spawning agents...");
      setDerivedVars((res as any).derived_vars ?? null);
      setSeedInfo((res as any).seed_info ?? null);
      const c = await podCanvas();
      setCanvas(c);
      setHistory([summarize(c, 0)]);
      setInitialized(true);
      toast.success("Pod initialized");
    } catch (e: any) {
      toast.error("Setup failed: " + e.message);
    } finally {
      setSetupLoading(false);
      setSetupStatus("");
    }
  };

  const onStep = async (n: number) => {
    setStepLoading(true);
    try {
      await podStep(n);
      const c = await podCanvas();
      setCanvas(c);
      const round = (c.summary?.round ?? history.length) | 0;
      setHistory((h) => [...h, summarize(c, round)]);
    } catch (e: any) {
      toast.error("Step failed: " + e.message);
    } finally { setStepLoading(false); }
  };

  const onInject = async () => {
    setStepLoading(true);
    try {
      const res = await podInject(injNarr, injEvent, injRederive);
      if (res?.derived_vars) setDerivedVars(res.derived_vars);
      toast.success("Variable injected");
    } catch (e: any) { toast.error("Inject failed: " + e.message); }
    finally { setStepLoading(false); }
  };

  const onPredict = async () => {
    setPredictLoading(true);
    try { setPrediction(await podPredict()); toast.success("Prediction ready"); }
    catch (e: any) { toast.error("Predict failed: " + e.message); }
    finally { setPredictLoading(false); }
  };

  const onReset = async () => {
    try {
      await podReset();
      setInitialized(false); setCanvas(null); setHistory([]);
      setPrediction(null); setDerivedVars(null); setSeedInfo(null);
      toast.success("Pod reset");
    } catch (e: any) { toast.error("Reset failed: " + e.message); }
  };

  const onAsk = async () => {
    if (!agentQ.trim()) return;
    setAgentLoading(true);
    try {
      const r = await podInterrogate(agentIdx, agentQ);
      setAgentR(r.response);
    } catch (e: any) { toast.error("Ask failed: " + e.message); }
    finally { setAgentLoading(false); }
  };

  const onIngestCategory = async (cat: string, docs: any[]) => {
    try {
      await corpusIngest(docs.map((d) => d.text), docs.map((d) => d.id), "agent");
      setIngested((p) => ({ ...p, [cat]: true }));
      toast.success(`Ingested ${docs.length}: ${cat}`);
    } catch (e: any) { toast.error("Ingest failed: " + e.message); }
  };

  const onIngestAll = async () => {
    try {
      await corpusIngest(CORPUS_DOCS.map((d: any) => d.text), CORPUS_DOCS.map((d: any) => d.id), "agent");
      setIngested(Object.fromEntries(Object.keys(CORPUS_BY_CATEGORY).map((k) => [k, true])));
      toast.success(`Ingested ${TOTAL_DOCS} docs`);
    } catch (e: any) { toast.error("Ingest failed: " + e.message); }
  };

  const onIngestManual = async () => {
    if (!manualText.trim() || !manualId.trim()) return;
    try {
      await corpusIngest([manualText], [manualId], manualCol);
      setManualText(""); setManualId("");
      toast.success("Document ingested");
    } catch (e: any) { toast.error("Ingest failed: " + e.message); }
  };

  const downloadReport = () => {
    if (!prediction) return;
    const txt = typeof prediction === "string" ? prediction : (prediction.report ?? JSON.stringify(prediction, null, 2));
    const blob = new Blob([txt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `pod-report-${Date.now()}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  // ─── derived ────────────────────────────────────────────────
  const agents: any[] = canvas?.agents ?? [];
  const summary = canvas?.summary ?? {};
  const archetypeData = useMemo(() => {
    const m = new Map<string, { sum: number; n: number }>();
    for (const a of agents) {
      const k = a.archetype ?? "unknown";
      const r = m.get(k) ?? { sum: 0, n: 0 };
      r.sum += a.belief ?? 0.5; r.n++; m.set(k, r);
    }
    return Array.from(m.entries())
      .map(([archetype, v]) => ({ archetype, belief: v.sum / v.n, count: v.n }))
      .sort((a, b) => b.belief - a.belief);
  }, [agents]);

  const clusters: any[] = (summary.clusters ?? []).slice(0, 10);

  const shockColor = (s: number) => s > 0.6 ? "bg-red-500/20 text-red-300 border-red-500/40"
    : s > 0.3 ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
    : "bg-green-500/20 text-green-300 border-green-500/40";

  // ─── render ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background text-foreground font-[Tektur]">
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-white/60 hover:text-white"><ArrowLeft size={18} /></Link>
          <Brain size={20} className="text-white/80" />
          <h1 className="text-lg tracking-[0.3em]">POD ROOM</h1>
        </div>
        <TopNav />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 p-6">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-4">
          {/* World banner */}
          <Card className="bg-card/40 border-white/10 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-[11px] tracking-[0.25em] text-white/60">WORLD STATE</div>
              <Button size="sm" variant="ghost" onClick={loadWorld} disabled={worldLoading}>
                <RefreshCw size={14} className={worldLoading ? "animate-spin" : ""} />
              </Button>
            </div>
            {world ? (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2 py-0.5 text-[10px] tracking-widest border rounded-full ${shockColor(world.shock_level ?? 0)}`}>
                    SHOCK {(world.shock_level ?? 0).toFixed(2)}
                  </span>
                  <span className="px-2 py-0.5 text-[10px] tracking-widest border border-white/20 rounded-full text-white/70">
                    MOOD {world.world_mood ?? world.mood ?? "neutral"}
                  </span>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] text-white/50 mb-1">
                    <span>RECEPTIVITY</span><span>{Math.round((world.world_receptivity ?? 0) * 100)}%</span>
                  </div>
                  <Progress value={(world.world_receptivity ?? 0) * 100} />
                </div>
                {(world.top_shocks ?? world.shocks ?? []).slice(0, 3).map((s: any, i: number) => (
                  <div key={i} className="text-[10px] text-white/40 truncate">• {typeof s === "string" ? s : s.title ?? s.headline}</div>
                ))}
              </>
            ) : (
              <div className="text-xs text-white/40">No world data. Backend reachable?</div>
            )}
          </Card>

          {/* Corpus toggle */}
          <div className="flex justify-end">
            <Button size="sm" variant="ghost" onClick={() => setCorpusOpen((o) => !o)}>
              <Settings2 size={14} className="mr-1" /> Corpus
            </Button>
          </div>

          {corpusOpen && (
            <Card className="bg-card/40 border-white/10 p-4 space-y-3">
              <div className="flex justify-between items-center">
                <div className="text-[11px] tracking-[0.25em] text-white/60">CORPUS SEEDER</div>
                <Button size="sm" onClick={onIngestAll}>Ingest All ({TOTAL_DOCS})</Button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                {Object.entries(CORPUS_BY_CATEGORY).map(([cat, docs]: any) => (
                  <div key={cat} className="flex items-center justify-between border-b border-white/5 py-1">
                    <div className="text-xs">
                      {cat} <span className="text-white/40">({docs.length})</span>
                      {ingested[cat] && <span className="text-green-400 ml-2">✓</span>}
                    </div>
                    <Button size="sm" variant="outline" onClick={() => onIngestCategory(cat, docs)}>Ingest</Button>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-white/10 space-y-2">
                <div className="text-[10px] tracking-widest text-white/40">MANUAL ENTRY</div>
                <Textarea value={manualText} onChange={(e) => setManualText(e.target.value)} placeholder="Document text..." rows={3} />
                <div className="flex gap-2">
                  <Input value={manualId} onChange={(e) => setManualId(e.target.value)} placeholder="doc-id" />
                  <select value={manualCol} onChange={(e) => setManualCol(e.target.value as any)}
                    className="bg-background border border-white/10 rounded px-2 text-xs">
                    <option value="agent">agent</option>
                    <option value="shared">shared</option>
                  </select>
                  <Button size="sm" onClick={onIngestManual}>Ingest</Button>
                </div>
              </div>
            </Card>
          )}

          {/* Setup panel */}
          {!initialized ? (
            <Card className="bg-card/40 border-white/10 p-4 space-y-4">
              <div className="text-[11px] tracking-[0.25em] text-white/60">SETUP</div>
              <div className="space-y-1">
                <Label className="text-xs">Narrative</Label>
                <Textarea value={narrative} onChange={(e) => setNarrative(e.target.value)}
                  placeholder="Describe the narrative, campaign, or scenario..." rows={5} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Theatre</Label>
                <select value={theatre} onChange={(e) => setTheatre(e.target.value)}
                  className="w-full bg-background border border-white/10 rounded px-3 py-2 text-sm">
                  {theatres.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs flex justify-between">Agents <span className="text-white/50">{agentCount}</span></Label>
                <Slider min={100} max={5000} step={100} value={[agentCount]} onValueChange={(v) => setAgentCount(v[0])} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs flex justify-between">
                  Insurgent Agents (pre-convinced) <span className="text-white/50">{(insurgentPct * 100).toFixed(0)}%</span>
                </Label>
                <Slider min={0} max={0.3} step={0.01} value={[insurgentPct]} onValueChange={(v) => setInsurgentPct(v[0])} />
                {insurgentPct > 0 && (
                  <div className="text-[10px] text-amber-400">⚠ Insurgents reduce organic accuracy</div>
                )}
              </div>
              <label className="flex items-center gap-2 text-xs text-white/70">
                <input type="checkbox" checked={forceRefresh} onChange={(e) => setForceRefresh(e.target.checked)} />
                Force live feed refresh before simulation
              </label>
              <Button className="w-full" onClick={onSetup} disabled={setupLoading}>
                {setupLoading ? setupStatus : "Spawn Agents & Analyze World"}
              </Button>
            </Card>
          ) : (
            <>
              {/* Derived vars */}
              {derivedVars && (
                <Card className="bg-card/40 border-white/10 p-4">
                  <button className="w-full flex justify-between items-center text-[11px] tracking-[0.25em] text-white/60"
                    onClick={() => setDerivedOpen((o) => !o)}>
                    DERIVED VARIABLES {derivedOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  {derivedOpen && (
                    <div className="mt-3 space-y-2">
                      {Object.entries(derivedVars).map(([k, v]: any) => {
                        const val = typeof v === "object" ? v.value : v;
                        const reason = typeof v === "object" ? v.reasoning : "";
                        const num = Number(val) || 0;
                        const favorable = ["narrative_strength", "world_receptivity", "base_rate_modifier"].includes(k);
                        const good = favorable ? num >= 0.5 : num <= 0.5;
                        return (
                          <div key={k} className="text-xs border-l-2 pl-2 border-white/10">
                            <div className="flex justify-between">
                              <span className="text-white/80">{k}</span>
                              <span className={good ? "text-green-400" : "text-red-400"}>{Number(val).toFixed?.(2) ?? String(val)}</span>
                            </div>
                            {reason && <div className="text-white/40 text-[10px] mt-0.5">{reason}</div>}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>
              )}

              {/* Sim controls */}
              <Card className="bg-card/40 border-white/10 p-4 space-y-3">
                <div className="text-[11px] tracking-[0.25em] text-white/60">SIMULATION</div>
                <div className="grid grid-cols-3 gap-2">
                  <Button size="sm" onClick={() => onStep(1)} disabled={stepLoading}>+1</Button>
                  <Button size="sm" onClick={() => onStep(5)} disabled={stepLoading}>+5</Button>
                  <Button size="sm" onClick={() => onStep(10)} disabled={stepLoading}>+10</Button>
                </div>

                <div className="pt-3 border-t border-white/10 space-y-2">
                  <div className="text-[10px] tracking-widest text-white/40">INJECT VARIABLE</div>
                  <div className="flex gap-2">
                    <Input type="number" min={0.01} max={1} step={0.01} value={injNarr}
                      onChange={(e) => setInjNarr(parseFloat(e.target.value))} placeholder="strength" />
                  </div>
                  <Input value={injEvent} onChange={(e) => setInjEvent(e.target.value)} placeholder="event description (optional)" />
                  <label className="flex items-center gap-2 text-xs text-white/70">
                    <input type="checkbox" checked={injRederive} onChange={(e) => setInjRederive(e.target.checked)} />
                    Re-derive all variables from world
                  </label>
                  <Button size="sm" className="w-full" onClick={onInject} disabled={stepLoading}>Inject</Button>
                </div>

                <div className="pt-3 border-t border-white/10 grid grid-cols-2 gap-2">
                  <Button size="sm" variant="outline" onClick={onPredict} disabled={predictLoading}>
                    {predictLoading ? "..." : "Predict"}
                  </Button>
                  <Button size="sm" variant="destructive" onClick={onReset}>Reset</Button>
                </div>
              </Card>

              {/* Interrogate */}
              <Card className="bg-card/40 border-white/10 p-4 space-y-2">
                <div className="text-[11px] tracking-[0.25em] text-white/60">INTERROGATE AGENT</div>
                <div className="flex gap-2">
                  <Input type="number" min={0} max={agentCount - 1} value={agentIdx}
                    onChange={(e) => setAgentIdx(parseInt(e.target.value) || 0)} className="w-24" />
                  <Input value={agentQ} onChange={(e) => setAgentQ(e.target.value)} placeholder="Ask..." />
                  <Button size="sm" onClick={onAsk} disabled={agentLoading}>Ask</Button>
                </div>
                {agentR && (
                  <pre className="font-mono text-[11px] bg-black/40 border border-white/10 rounded p-2 whitespace-pre-wrap">{agentR}</pre>
                )}
              </Card>
            </>
          )}
        </div>

        {/* RIGHT */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="canvas" className="w-full">
            <TabsList className="bg-card/40 border border-white/10">
              <TabsTrigger value="canvas">Canvas</TabsTrigger>
              <TabsTrigger value="archetypes">Archetypes</TabsTrigger>
              <TabsTrigger value="clusters">Clusters</TabsTrigger>
              <TabsTrigger value="prediction">Prediction</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            {/* Canvas */}
            <TabsContent value="canvas" className="mt-4 space-y-3">
              <div className="rounded-lg border border-white/10 overflow-hidden" style={{ background: "#080818" }}>
                <svg viewBox="0 0 100 100" className="w-full aspect-square block">
                  {agents.map((a, i) => (
                    <circle
                      key={i}
                      cx={a.x ?? Math.random() * 100}
                      cy={a.y ?? Math.random() * 100}
                      r={0.7}
                      fill={beliefColor(a.belief ?? 0.5)}
                      fillOpacity={seirOpacity(a.seir ?? "S")}
                      stroke={a.insurgent ? "#fff" : a.organic_seed ? "#f59e0b" : "none"}
                      strokeWidth={a.insurgent ? 0.2 : a.organic_seed ? 0.15 : 0}
                    />
                  ))}
                </svg>
              </div>
              <StatsBar summary={summary} />
            </TabsContent>

            {/* Archetypes */}
            <TabsContent value="archetypes" className="mt-4">
              <Card className="bg-card/40 border-white/10 p-4" style={{ height: 480 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={archetypeData} layout="vertical" margin={{ left: 80 }}>
                    <XAxis type="number" domain={[0, 1]} stroke="rgba(255,255,255,0.4)" />
                    <YAxis dataKey="archetype" type="category" stroke="rgba(255,255,255,0.6)" width={120} />
                    <Tooltip contentStyle={{ background: "#111", border: "1px solid rgba(255,255,255,0.1)" }}
                      formatter={(v: any, _n: any, p: any) => [`${Number(v).toFixed(2)} (n=${p.payload.count})`, "belief"]} />
                    <Bar dataKey="belief">
                      {archetypeData.map((d, i) => <Cell key={i} fill={beliefColor(d.belief)} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </TabsContent>

            {/* Clusters */}
            <TabsContent value="clusters" className="mt-4 space-y-2">
              {clusters.length === 0 && <div className="text-xs text-white/40">No cluster data yet.</div>}
              {clusters.map((c, i) => (
                <Card key={i} className="bg-card/40 border-white/10 p-3">
                  <div className="flex justify-between items-center">
                    <div className="text-sm">Cluster #{i + 1} <span className="text-white/40">· n={c.size}</span></div>
                    {c.echo_chamber && <span className="text-[10px] px-2 py-0.5 bg-red-500/20 border border-red-500/40 text-red-300 rounded">ECHO CHAMBER</span>}
                  </div>
                  <div className="mt-2 text-[11px] text-white/60">avg belief {Number(c.avg_belief ?? 0).toFixed(2)}</div>
                  <div className="mt-1 flex gap-2 text-[10px]">
                    <div className="flex-1">
                      <div className="text-green-400">Influence {Math.round((c.influence ?? 0) * 100)}%</div>
                      <div className="h-1 bg-white/5 rounded"><div className="h-1 bg-green-500/60 rounded" style={{ width: `${(c.influence ?? 0) * 100}%` }} /></div>
                    </div>
                    <div className="flex-1">
                      <div className="text-red-400">Resistance {Math.round((c.resistance ?? 0) * 100)}%</div>
                      <div className="h-1 bg-white/5 rounded"><div className="h-1 bg-red-500/60 rounded" style={{ width: `${(c.resistance ?? 0) * 100}%` }} /></div>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>

            {/* Prediction */}
            <TabsContent value="prediction" className="mt-4 space-y-3">
              {!prediction && <div className="text-xs text-white/40">Click Predict to generate report.</div>}
              {prediction && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <Card className="bg-card/40 border-white/10 p-3 text-xs">
                      <div className="text-white/40 text-[10px] tracking-widest mb-1">DERIVED</div>
                      <pre className="whitespace-pre-wrap text-[10px]">{JSON.stringify(prediction.derived_vars ?? derivedVars ?? {}, null, 2)}</pre>
                    </Card>
                    <Card className="bg-card/40 border-white/10 p-3 text-xs">
                      <div className="text-white/40 text-[10px] tracking-widest mb-1">SEEDS</div>
                      <pre className="whitespace-pre-wrap text-[10px]">{JSON.stringify(prediction.seed_info ?? seedInfo ?? {}, null, 2)}</pre>
                    </Card>
                  </div>
                  <Card className="bg-card/40 border-white/10 p-4 max-h-[500px] overflow-auto">
                    <pre className="font-mono text-[11px] whitespace-pre-wrap">{typeof prediction === "string" ? prediction : (prediction.report ?? JSON.stringify(prediction, null, 2))}</pre>
                  </Card>
                  <Button size="sm" onClick={downloadReport}><Download size={14} className="mr-1" /> Download Report</Button>
                </>
              )}
            </TabsContent>

            {/* History */}
            <TabsContent value="history" className="mt-4">
              <Card className="bg-card/40 border-white/10 p-4" style={{ height: 480 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history}>
                    <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="round" stroke="rgba(255,255,255,0.4)" />
                    <YAxis stroke="rgba(255,255,255,0.4)" />
                    <Tooltip contentStyle={{ background: "#111", border: "1px solid rgba(255,255,255,0.1)" }} />
                    <Legend />
                    <ReferenceLine y={0.5} stroke="rgba(255,255,255,0.3)" strokeDasharray="3 3" label={{ value: "Tipping Point", fill: "rgba(255,255,255,0.5)", fontSize: 10 }} />
                    <ReferenceLine y={1.0} stroke="rgba(255,255,255,0.2)" strokeDasharray="3 3" label={{ value: "Self-sustaining (R₀)", fill: "rgba(255,255,255,0.5)", fontSize: 10 }} />
                    <Line type="monotone" dataKey="belief" stroke="#60a5fa" name="Avg Belief" dot={false} />
                    <Line type="monotone" dataKey="H" stroke="#a78bfa" name="System Energy" dot={false} />
                    <Line type="monotone" dataKey="r0" stroke="#fb923c" name="R₀" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function summarize(c: any, round: number) {
  const s = c?.summary ?? {};
  return {
    round: s.round ?? round,
    belief: Number(s.avg_belief ?? 0),
    H: Number(s.system_energy ?? s.H ?? 0),
    r0: Number(s.r0 ?? s.R0 ?? 0),
  };
}

function StatsBar({ summary }: { summary: any }) {
  if (!summary) return null;
  const osr = Number(summary.organic_spread_ratio ?? 0);
  const osrColor = osr > 0.7 ? "text-green-400" : osr > 0.4 ? "text-amber-400" : "text-red-400";
  const osrLabel = osr > 0.7 ? "High organic resonance" : osr > 0.4 ? "Mixed signal" : "Insurgent-dependent";
  const r0 = Number(summary.r0 ?? summary.R0 ?? 0);
  const seir = summary.seir ?? {};
  const pill = (color: string, label: string, val: any) => (
    <span className={`px-2 py-0.5 text-[10px] tracking-widest border rounded-full ${color}`}>{label} {val}</span>
  );
  return (
    <Card className="bg-card/40 border-white/10 p-3 space-y-2 text-xs">
      <div className="flex flex-wrap items-center gap-3">
        <span>Round <b>{summary.round ?? 0}</b></span>
        <span className="text-green-400">Influence {Math.round((summary.influence ?? 0) * 100)}%</span>
        <span className="text-red-400">Resistance {Math.round((summary.resistance ?? 0) * 100)}%</span>
        <span className="text-gray-400">Neutral {Math.round((summary.neutral ?? 0) * 100)}%</span>
        <span className="text-blue-400">Belief {Number(summary.avg_belief ?? 0).toFixed(2)}</span>
        <span className={r0 > 1 ? "text-red-400" : "text-green-400"}>R₀ {r0.toFixed(2)}</span>
        <span>H {Number(summary.system_energy ?? summary.H ?? 0).toFixed(2)}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-white/50">COHERENCE</span>
        <div className="flex-1 max-w-[160px]"><Progress value={(summary.quantum_coherence ?? 0) * 100} /></div>
        <span className={`${osrColor} text-[10px]`}>OSR {osr.toFixed(2)} · {osrLabel}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {pill("bg-indigo-500/20 text-indigo-300 border-indigo-500/40", "S", seir.S ?? 0)}
        {pill("bg-amber-500/20 text-amber-300 border-amber-500/40", "E", seir.E ?? 0)}
        {pill("bg-green-500/20 text-green-300 border-green-500/40", "I", seir.I ?? 0)}
        {pill("bg-red-500/20 text-red-300 border-red-500/40", "R", seir.R ?? 0)}
      </div>
    </Card>
  );
}
