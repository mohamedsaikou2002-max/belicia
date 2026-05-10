import { useCallback, useEffect, useRef, useState } from "react";
import { TopNav } from "@/components/TopNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Send, Play, FastForward, Zap, FileText, RefreshCw } from "lucide-react";

const MIRO_URL = "https://focrrskgrxdkiddajxuq.supabase.co/functions/v1/mirofish";
const HEADERS = {
  "Content-Type": "application/json",
  apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
};

const THEATRES = [
  { id: "italia", label: "Italia" },
  { id: "gulf", label: "Gulf States" },
  { id: "westaf", label: "West Africa" },
  { id: "sea", label: "SE Asia" },
  { id: "latam", label: "LatAm" },
  { id: "custom", label: "Custom" },
];
const SIM_TYPES = [
  { id: "campaign", label: "Campaign" },
  { id: "redteam", label: "Red Team" },
  { id: "narrative", label: "Narrative Warfare" },
  { id: "humint", label: "HUMINT" },
  { id: "asabiyya", label: "Asabiyya" },
  { id: "financial", label: "Financial Disruption" },
];
const TEMPLATES = [
  { label: "🇮🇹 Olive Oil Launch · Italia", theatre: "italia", sim_type: "campaign",
    narrative: "A new Sicilian olive oil brand 'Terra d'Aciri' launches in Lombardy claiming PDO origin and a 6-generation family farm. Premium price (€28/500ml). Marketed as ethical, slow-pressed, traceable to the grove." },
  { label: "🇦🇪 Halal Fintech · Gulf", theatre: "gulf", sim_type: "campaign",
    narrative: "A new Sharia-compliant savings app 'Barakah' launches in Dubai targeting young professionals. Promises riba-free returns via real-asset backing, fully audited by a council of three respected scholars." },
  { label: "🇮🇹 Counter-Narrative · Red Team", theatre: "italia", sim_type: "redteam",
    narrative: "Anonymous Telegram channels spread the rumor that a beloved local cooperative is laundering money for organised crime. The accusation is sourced to a 'former insider' with no name." },
  { label: "🇧🇷 Community Trust Build · LatAm", theatre: "latam", sim_type: "asabiyya",
    narrative: "A returning diaspora entrepreneur opens a free coding school in a São Paulo favela, promising no fees, local instructors, and job placement with three real partner companies." },
];

type Agent = { id: string; name: string; archetype: string; personality: string; stance: string; color: string; memory?: string[] };
type Event = { agent_id: string; agent_name: string; agent_color: string; archetype: string; stance: string; text: string; type: string; round: number };
type Round = { round: number; events: Event[]; emergence_note: string };

const TABS = ["Narrative Lab", "Swarm Reactor", "Prediction Report", "Interrogate Agent"] as const;
type Tab = typeof TABS[number];

async function api(action: string, method: "GET" | "POST" | "DELETE" = "POST", body?: any) {
  const r = await fetch(`${MIRO_URL}?action=${action}`, {
    method, headers: HEADERS, body: body ? JSON.stringify(body) : undefined,
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`);
  return j;
}

const MiroFish = () => {
  const [tab, setTab] = useState<Tab>("Narrative Lab");

  // Lab inputs
  const [narrative, setNarrative] = useState("");
  const [theatre, setTheatre] = useState("italia");
  const [simType, setSimType] = useState("campaign");
  const [agentCount, setAgentCount] = useState(50);
  const [maxRounds, setMaxRounds] = useState(20);
  const [launching, setLaunching] = useState(false);

  // Sim state
  const [status, setStatus] = useState<string>("idle");
  const [round, setRound] = useState(0);
  const [maxR, setMaxR] = useState(20);
  const [influence, setInfluence] = useState(0);
  const [resistance, setResistance] = useState(0);
  const [clusters, setClusters] = useState(0);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [worldBuild, setWorldBuild] = useState("");
  const [injections, setInjections] = useState<string[]>([]);
  const [report, setReport] = useState("");

  const [stepping, setStepping] = useState(false);
  const [autoRunning, setAutoRunning] = useState(false);
  const [injectOpen, setInjectOpen] = useState(false);
  const [injectText, setInjectText] = useState("");
  const [genReporting, setGenReporting] = useState(false);

  // Interrogate
  const [selectedAgent, setSelectedAgent] = useState<string>("");
  const [chat, setChat] = useState<Record<string, { role: "user" | "agent"; content: string }[]>>({});
  const [chatInput, setChatInput] = useState("");
  const [chatSending, setChatSending] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const s = await api("state", "GET");
      setStatus(s.status);
      setRound(s.round); setMaxR(s.max_rounds);
      setInfluence(s.influence); setResistance(s.resistance); setClusters(s.clusters);
      setAgents(s.agents ?? []);
      setInjections(s.injected_variables ?? []);
      setWorldBuild(s.world_build ?? "");
      setReport(s.report ?? "");
      const rs = await api(`rounds&limit=40`, "GET");
      setRounds(rs.rounds ?? []);
    } catch (e: any) {
      console.error(e);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => {
    if (status !== "running") return;
    const t = setInterval(refresh, 4000);
    return () => clearInterval(t);
  }, [status, refresh]);

  const launch = async () => {
    if (!narrative.trim()) { toast.error("Write a narrative first"); return; }
    setLaunching(true);
    try {
      await api("reset", "DELETE");
      await api("start", "POST", {
        theatre, sim_type: simType, narrative,
        agent_count: agentCount, max_rounds: maxRounds, cold_system_mode: true,
      });
      toast.success("Swarm spawned");
      await refresh();
      setTab("Swarm Reactor");
    } catch (e: any) {
      toast.error(e.message);
    } finally { setLaunching(false); }
  };

  const stepOne = async () => {
    setStepping(true);
    try { await api("step"); await refresh(); }
    catch (e: any) { toast.error(e.message); }
    finally { setStepping(false); }
  };

  const autoRun = async () => {
    setAutoRunning(true);
    try { await api("auto"); toast.success("Simulation complete"); await refresh(); }
    catch (e: any) { toast.error(e.message); }
    finally { setAutoRunning(false); }
  };

  const inject = async () => {
    if (!injectText.trim()) return;
    try {
      await api("inject", "POST", { variable: injectText });
      toast.success("Variable injected");
      setInjectText(""); setInjectOpen(false);
      await refresh();
    } catch (e: any) { toast.error(e.message); }
  };

  const genReport = async () => {
    setGenReporting(true);
    try { const r = await api("report"); setReport(r.report); toast.success("Report ready"); setTab("Prediction Report"); }
    catch (e: any) { toast.error(e.message); }
    finally { setGenReporting(false); }
  };

  const sendChat = async () => {
    if (!chatInput.trim() || !selectedAgent) return;
    const msg = chatInput;
    setChatInput(""); setChatSending(true);
    setChat(c => ({ ...c, [selectedAgent]: [...(c[selectedAgent] ?? []), { role: "user", content: msg }] }));
    try {
      const r = await api("interrogate", "POST", { agent_id: selectedAgent, message: msg });
      setChat(c => ({ ...c, [selectedAgent]: [...(c[selectedAgent] ?? []), { role: "agent", content: r.reply }] }));
    } catch (e: any) { toast.error(e.message); }
    finally { setChatSending(false); }
  };

  const reset = async () => {
    if (!confirm("Reset simulation?")) return;
    await api("reset", "DELETE");
    await refresh();
    toast.success("Reset");
  };

  // Swarm canvas
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d")!;
    const w = cv.width = cv.offsetWidth;
    const h = cv.height = 220;
    const dots = agents.length ? agents.map((a, i) => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      color: a.stance.includes("AMPLIF") ? "#5a3a8a"
        : (a.stance.includes("HOSTILE") || a.stance.includes("RESIST")) ? "#e85d24"
        : a.stance.includes("CURIOUS") ? "#c8a96e" : "#3a7ca5",
    })) : [];
    let raf = 0;
    const draw = () => {
      ctx.fillStyle = "rgba(0,0,0,0.3)"; ctx.fillRect(0, 0, w, h);
      // edges
      ctx.strokeStyle = "rgba(200,169,110,0.15)"; ctx.lineWidth = 1;
      for (let i = 0; i < dots.length; i++) for (let j = i + 1; j < dots.length; j++) {
        const dx = dots[i].x - dots[j].x, dy = dots[i].y - dots[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 120) { ctx.beginPath(); ctx.moveTo(dots[i].x, dots[i].y); ctx.lineTo(dots[j].x, dots[j].y); ctx.stroke(); }
      }
      for (const d of dots) {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0 || d.x > w) d.vx *= -1;
        if (d.y < 0 || d.y > h) d.vy *= -1;
        ctx.beginPath(); ctx.arc(d.x, d.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = d.color; ctx.fill();
        ctx.strokeStyle = d.color + "88"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(d.x, d.y, 10, 0, Math.PI * 2); ctx.stroke();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [agents]);

  const agentForChat = agents.find(a => a.id === selectedAgent);

  return (
    <main className="min-h-screen text-foreground">
      <header className="flex items-center justify-between px-6 py-4 bg-glass border-b border-white/10 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-light tracking-[0.3em] text-glow">🐟 MIROFISH</h1>
          <p className="text-xs text-white/50 tracking-widest mt-1">REACTIVE COLD SYSTEM · SWARM INTELLIGENCE</p>
        </div>
        <TopNav />
      </header>

      <nav className="flex border-b border-white/10 bg-glass">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-3 text-[11px] tracking-[0.3em] font-[Tektur] transition border-b-2 ${tab === t ? "border-white text-white" : "border-transparent text-white/40 hover:text-white/70"}`}>
            {t.toUpperCase()}
          </button>
        ))}
        <div className="ml-auto px-5 py-3 text-[10px] tracking-[0.3em] text-white/50">
          STATUS: <span className="text-white">{status.toUpperCase()}</span> · ROUND {round}/{maxR}
        </div>
      </nav>

      {/* TAB 1: Narrative Lab */}
      {tab === "Narrative Lab" && (
        <section className="max-w-3xl mx-auto p-6 space-y-5">
          <div className="bg-glass border border-purple-500/20 rounded-md p-4 text-sm text-white/80" style={{ borderColor: "rgba(90,58,138,0.4)" }}>
            The swarm begins dormant (cold). You write the narrative below. When you launch, MiroFish injects your narrative as the sole stimulus into the agent population. Agents react based on their cultural archetypes. You watch emergence in real time.
          </div>

          <div>
            <label className="text-[11px] tracking-[0.3em] text-white/60">YOUR NARRATIVE — campaign, rumor, red team, inoculation…</label>
            <Textarea value={narrative} onChange={e => setNarrative(e.target.value)}
              rows={12} placeholder="Write anything you want the AI swarm to react to…"
              className="mt-2 font-mono text-sm bg-transparent border-white/20 text-white placeholder:text-white/30" />
            <div className="text-[10px] text-white/40 mt-1">{narrative.length} chars · {narrative.trim().split(/\s+/).filter(Boolean).length} words</div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="text-[11px] tracking-[0.3em] text-white/60">THEATRE</label>
                <select value={theatre} onChange={e => setTheatre(e.target.value)}
                  className="mt-1 w-full bg-transparent border border-white/20 text-white text-sm px-3 py-2 rounded-md">
                  {THEATRES.map(t => <option key={t.id} value={t.id} className="bg-black">{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[11px] tracking-[0.3em] text-white/60">SIMULATION TYPE</label>
                <select value={simType} onChange={e => setSimType(e.target.value)}
                  className="mt-1 w-full bg-transparent border border-white/20 text-white text-sm px-3 py-2 rounded-md">
                  {SIM_TYPES.map(t => <option key={t.id} value={t.id} className="bg-black">{t.label}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] tracking-[0.3em] text-white/60">AGENT COUNT</label>
                <select value={agentCount} onChange={e => setAgentCount(Number(e.target.value))}
                  className="mt-1 w-full bg-transparent border border-white/20 text-white text-sm px-3 py-2 rounded-md">
                  {[20, 50, 100, 200].map(n => <option key={n} value={n} className="bg-black">{n}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[11px] tracking-[0.3em] text-white/60">MAX ROUNDS</label>
                <select value={maxRounds} onChange={e => setMaxRounds(Number(e.target.value))}
                  className="mt-1 w-full bg-transparent border border-white/20 text-white text-sm px-3 py-2 rounded-md">
                  {[10, 20, 40].map(n => <option key={n} value={n} className="bg-black">{n}</option>)}
                </select>
              </div>
            </div>
          </div>

          <details className="text-sm">
            <summary className="cursor-pointer text-[11px] tracking-[0.3em] text-white/60 hover:text-white">QUICK-LOAD TEMPLATES</summary>
            <div className="mt-3 grid sm:grid-cols-2 gap-2">
              {TEMPLATES.map(t => (
                <button key={t.label} onClick={() => { setNarrative(t.narrative); setTheatre(t.theatre); setSimType(t.sim_type); }}
                  className="text-left px-3 py-2 border border-white/15 text-xs text-white/80 hover:bg-white/5 rounded-md">
                  {t.label}
                </button>
              ))}
            </div>
          </details>

          <div className="flex gap-3 pt-2">
            <Button onClick={launch} disabled={launching}
              className="bg-white/15 hover:bg-white/25 border border-white/30 text-white tracking-[0.2em]">
              <Play className="w-4 h-4" /> {launching ? "BUILDING WORLD…" : "LAUNCH MIROFISH SIMULATION"}
            </Button>
            <Button onClick={reset} variant="ghost" className="text-white/60 hover:text-white">
              <RefreshCw className="w-4 h-4" /> Reset
            </Button>
          </div>
        </section>
      )}

      {/* TAB 2: Swarm Reactor */}
      {tab === "Swarm Reactor" && (
        <section className="grid lg:grid-cols-[1fr_280px] gap-4 p-6">
          <div className="space-y-4">
            <div className="relative bg-glass rounded-md overflow-hidden">
              <canvas ref={canvasRef} className="w-full block" style={{ height: 220 }} />
              <div className="absolute top-3 left-3 text-[10px] tracking-[0.3em] text-white/70">
                🐟 SWARM · ROUND {round}/{maxR} · {theatre.toUpperCase()}
              </div>
              <div className="absolute bottom-3 right-3 text-[10px] tracking-[0.3em] text-white/70 font-mono">
                AGENTS {agents.length} · CLUSTERS {clusters} · INFL {influence}% · RES {resistance}%
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button onClick={stepOne} disabled={stepping || status !== "running"} size="sm" className="bg-white/10 border border-white/30 text-white">
                <Play className="w-3 h-3" /> {stepping ? "Running…" : "Next Round"}
              </Button>
              <Button onClick={autoRun} disabled={autoRunning || status !== "running"} size="sm" variant="outline" className="text-white border-white/30">
                <FastForward className="w-3 h-3" /> {autoRunning ? "Auto-running…" : "Auto-Run"}
              </Button>
              <Button onClick={() => setInjectOpen(v => !v)} size="sm" variant="outline" className="text-orange-400 border-orange-400/40">
                <Zap className="w-3 h-3" /> Inject Variable
              </Button>
              <Button onClick={genReport} disabled={genReporting || rounds.length === 0} size="sm" variant="outline" className="text-white border-white/30">
                <FileText className="w-3 h-3" /> {genReporting ? "Generating…" : "Generate Report"}
              </Button>
            </div>

            {injectOpen && (
              <div className="p-3 border border-orange-400/30 rounded-md space-y-2">
                <Textarea value={injectText} onChange={e => setInjectText(e.target.value)} rows={2}
                  placeholder="A respected elder publicly endorses the brand…"
                  className="bg-transparent border-white/20 text-white text-sm" />
                <Button onClick={inject} size="sm" className="bg-orange-500/20 border border-orange-400/40 text-orange-300">
                  Inject →
                </Button>
              </div>
            )}

            <div className="space-y-3">
              {[...rounds].reverse().map(r => (
                <div key={r.round} className="space-y-2">
                  {(r.events ?? []).map((e, i) => (
                    <div key={i} className="flex gap-3 p-3 bg-glass rounded-md">
                      <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-xs font-mono text-white"
                        style={{ background: e.agent_color }}>{r.round}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] tracking-[0.2em] text-white/60 font-mono">
                          {e.type === "injection" && <span className="text-orange-400 mr-2">⚡ INJECTION</span>}
                          {e.agent_name} · {e.archetype} · <span className="text-white/40">{e.stance}</span>
                        </div>
                        <div className="text-sm text-white/90 mt-1 italic">"{e.text}"</div>
                      </div>
                    </div>
                  ))}
                  {r.emergence_note && (
                    <div className="text-xs italic text-white/50 pl-12">↳ {r.emergence_note}</div>
                  )}
                </div>
              ))}
              {rounds.length === 0 && <div className="text-center text-white/40 text-sm py-8">No rounds yet. Click Next Round.</div>}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Metric label="Influence" value={`${influence}%`} color="#5a3a8a" />
              <Metric label="Resistance" value={`${resistance}%`} color="#e85d24" />
              <Metric label="Rounds" value={`${round}/${maxR}`} color="#c8a96e" />
              <Metric label="Clusters" value={String(clusters)} color="#3a7ca5" />
            </div>

            {injections.length > 0 && (
              <div>
                <div className="text-[10px] tracking-[0.3em] text-white/50 mb-2">INJECTIONS</div>
                <div className="space-y-1">
                  {injections.map((v, i) => (
                    <div key={i} className="text-xs px-2 py-1 rounded bg-orange-500/10 border border-orange-400/30 text-orange-300">⚡ {v}</div>
                  ))}
                </div>
              </div>
            )}

            {worldBuild && (
              <details>
                <summary className="text-[10px] tracking-[0.3em] text-white/50 cursor-pointer">WORLD BUILD</summary>
                <pre className="mt-2 text-[10px] text-white/70 font-mono whitespace-pre-wrap max-h-60 overflow-y-auto p-2 bg-black/40 rounded">{worldBuild}</pre>
              </details>
            )}

            {narrative && (
              <div>
                <div className="text-[10px] tracking-[0.3em] text-white/50 mb-1">ACTIVE NARRATIVE</div>
                <div className="text-xs text-white/80 p-2 bg-yellow-500/5 border border-yellow-500/20 rounded">{narrative.slice(0, 200)}{narrative.length > 200 ? "…" : ""}</div>
              </div>
            )}
          </aside>
        </section>
      )}

      {/* TAB 3: Prediction Report */}
      {tab === "Prediction Report" && (
        <section className="max-w-3xl mx-auto p-6 space-y-5">
          <div className="grid grid-cols-4 gap-3">
            <Metric label="Predicted Spread" value={`${influence}%`} color="#5a3a8a" />
            <Metric label="Resistance" value={`${resistance}%`} color="#e85d24" />
            <Metric label="Rounds" value={`${round}/${maxR}`} color="#c8a96e" />
            <Metric label="Agents" value={String(agents.length)} color="#3a7ca5" />
          </div>

          <div className="bg-glass rounded-md p-5 min-h-[300px]">
            {!report ? (
              <div className="text-white/40 text-sm text-center py-12">Run a simulation then click Generate Report.</div>
            ) : (
              <ReportDisplay text={report} />
            )}
          </div>

          <div className="flex gap-3">
            <Button onClick={genReport} disabled={genReporting} className="bg-white/15 border border-white/30 text-white">
              <FileText className="w-4 h-4" /> {genReporting ? "Generating…" : "Generate AI Report"}
            </Button>
            <Button onClick={() => setTab("Interrogate Agent")} variant="outline" className="border-white/30 text-white">
              Interrogate Agents →
            </Button>
          </div>
        </section>
      )}

      {/* TAB 4: Interrogate */}
      {tab === "Interrogate Agent" && (
        <section className="grid md:grid-cols-[300px_1fr] gap-4 p-6">
          <div className="space-y-3">
            <div className="text-[11px] tracking-[0.3em] text-white/60">SELECT AGENT</div>
            <div className="flex flex-wrap gap-2">
              {agents.map(a => (
                <button key={a.id} onClick={() => setSelectedAgent(a.id)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition ${selectedAgent === a.id ? "text-white" : "text-white/70 border-white/20 hover:border-white/50"}`}
                  style={selectedAgent === a.id ? { background: a.color, borderColor: a.color } : {}}>
                  {a.name} · {a.archetype}
                </button>
              ))}
              <button onClick={() => setSelectedAgent("ReportAgent")}
                className={`text-xs px-3 py-1.5 rounded-full border transition ${selectedAgent === "ReportAgent" ? "bg-purple-700 border-purple-500 text-white" : "text-white/70 border-white/20"}`}>
                🤖 ReportAgent
              </button>
            </div>

            {agentForChat && (
              <div className="p-3 bg-glass rounded-md text-sm space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ background: agentForChat.color }} />
                  <span className="font-mono text-white">{agentForChat.name}</span>
                </div>
                <div className="text-xs text-white/60">{agentForChat.archetype}</div>
                <div className="text-xs text-white/80 italic">{agentForChat.personality}</div>
                <div className="text-[10px] text-white/50 mt-2">Stance: {agentForChat.stance} · Round {round}</div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 min-h-[400px]">
            <div className="flex-1 overflow-y-auto bg-glass rounded-md p-4 space-y-3 max-h-[60vh]">
              {selectedAgent && (chat[selectedAgent] ?? []).length === 0 && (
                <div className="space-y-2">
                  <div className="text-xs text-white/50">Try asking:</div>
                  {[
                    "What did you think when you first heard this narrative?",
                    "Who in your network did you tell about it?",
                    "What would make you more or less convinced?",
                    "What's the risk you see that others are missing?",
                  ].map(q => (
                    <button key={q} onClick={() => setChatInput(q)} className="block text-xs text-white/70 hover:text-white text-left px-3 py-1.5 border border-white/15 rounded-md w-full">
                      {q}
                    </button>
                  ))}
                </div>
              )}
              {selectedAgent && (chat[selectedAgent] ?? []).map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm ${m.role === "user" ? "bg-white/10 border border-white/30" : "bg-purple-900/30 border border-purple-500/30"}`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {!selectedAgent && <div className="text-white/40 text-sm text-center py-12">Select an agent to interrogate.</div>}
            </div>

            <form onSubmit={e => { e.preventDefault(); sendChat(); }} className="flex gap-2">
              <Input value={chatInput} onChange={e => setChatInput(e.target.value)}
                placeholder="Ask this agent anything…" disabled={!selectedAgent || chatSending}
                className="bg-transparent border-white/20 text-white" />
              <Button type="submit" disabled={!selectedAgent || chatSending || !chatInput.trim()}
                className="bg-white/15 border border-white/30 text-white">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </section>
      )}
    </main>
  );
};

const Metric = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <div className="bg-glass p-3 rounded-md">
    <div className="text-[10px] tracking-[0.3em] text-white/50">{label.toUpperCase()}</div>
    <div className="text-2xl font-light mt-1" style={{ color }}>{value}</div>
  </div>
);

const ReportDisplay = ({ text }: { text: string }) => {
  const sections: Array<{ key: string; body: string }> = [];
  const labels = ["HEADLINE", "ADOPTION TRAJECTORY", "CULTURAL DRIVERS", "RESISTANCE ANALYSIS", "EMERGENCE SURPRISES", "CRITICAL PATH", "BELICIA INTEL"];
  const re = new RegExp(`(${labels.join("|")}):`, "g");
  const parts = text.split(re).slice(1);
  for (let i = 0; i < parts.length; i += 2) sections.push({ key: parts[i], body: (parts[i + 1] ?? "").trim() });

  const styleFor = (k: string) => {
    if (k === "HEADLINE") return "text-xl font-light text-white border-l-4 pl-3 border-purple-500";
    if (k === "EMERGENCE SURPRISES") return "p-3 rounded bg-yellow-500/10 border border-yellow-500/30 text-white/90";
    if (k === "CRITICAL PATH") return "p-3 rounded bg-green-500/10 border border-green-500/30 text-white/90";
    if (k === "BELICIA INTEL") return "p-3 rounded bg-purple-700/15 border border-purple-500/30 text-white/90";
    return "text-white/85";
  };

  return (
    <div className="space-y-4 text-sm leading-relaxed">
      {sections.map(s => (
        <div key={s.key}>
          <div className="text-[10px] tracking-[0.3em] text-white/50 mb-1">{s.key}</div>
          <div className={styleFor(s.key)}>{s.body}</div>
        </div>
      ))}
    </div>
  );
};

export default MiroFish;
