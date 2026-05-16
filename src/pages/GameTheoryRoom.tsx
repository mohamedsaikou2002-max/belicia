import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Brain, Send, Sparkles, Film, Loader2, Copy, Check } from "lucide-react";
import { TopNav } from "@/components/TopNav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { gtChat, gtNarrate, gtSummarize, type GTMessage } from "@/lib/gtApi";

export default function GameTheoryRoom() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<GTMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [narrating, setNarrating] = useState(false);
  const [narrative, setNarrative] = useState("");
  const [summarizing, setSummarizing] = useState(false);
  const [payload, setPayload] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, narrative]);

  const send = async () => {
    if (!input.trim() || sending) return;
    const next: GTMessage[] = [...messages, { role: "user", content: input.trim() }];
    setMessages(next);
    setInput("");
    setSending(true);
    try {
      const { reply } = await gtChat(next);
      setMessages([...next, { role: "assistant", content: reply }]);
    } catch (e: any) {
      toast.error("Chat failed: " + e.message);
    } finally { setSending(false); }
  };

  const narrate = async () => {
    if (!messages.length) { toast.error("Discuss a scenario first"); return; }
    setNarrating(true);
    try {
      const { narrative } = await gtNarrate(messages);
      setNarrative(narrative);
    } catch (e: any) { toast.error("Narrate failed: " + e.message); }
    finally { setNarrating(false); }
  };

  const summarize = async () => {
    if (!messages.length) { toast.error("Discuss a scenario first"); return; }
    setSummarizing(true);
    try {
      const p = await gtSummarize(messages);
      setPayload(p);
      toast.success("Pod Room payload ready");
    } catch (e: any) { toast.error("Summarize failed: " + e.message); }
    finally { setSummarizing(false); }
  };

  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const copyToClipboard = async (text: string, idx?: number) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
      if (idx !== undefined) {
        setCopiedIdx(idx);
        setTimeout(() => setCopiedIdx(null), 1500);
      }
    } catch {
      toast.error("Copy failed");
    }
  };

  const sendToPod = () => {
    if (!payload) return;
    sessionStorage.setItem("gt_pod_payload", JSON.stringify(payload));
    navigate("/pod-room");
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-[Tektur]">
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-white/60 hover:text-white"><ArrowLeft size={18} /></Link>
          <Brain size={20} className="text-white/80" />
          <h1 className="text-lg tracking-[0.3em]">GAME THEORY ROOM</h1>
        </div>
        <TopNav />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        {/* Chat */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-card/40 border-white/10 p-4 h-[60vh] overflow-y-auto" ref={scrollRef as any}>
            {messages.length === 0 && (
              <div className="text-white/40 text-sm">
                Describe a scenario. Jarvis will model agents, payoffs, equilibria, and second-order effects.
                No restrictions on topic or complexity.
              </div>
            )}
            <div className="space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={m.role === "user" ? "text-right" : "group"}>
                  <div className={`relative inline-block max-w-[85%] px-3 py-2 rounded text-sm whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-white/10 text-white"
                      : "bg-indigo-500/10 border border-indigo-500/20 text-white/90"
                  }`}>
                    {m.content}
                    {m.role === "assistant" && (
                      <button
                        onClick={() => copyToClipboard(m.content, i)}
                        className="absolute -top-2 -right-2 p-1 rounded bg-card border border-white/10 text-white/60 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Copy"
                      >
                        {copiedIdx === i ? <Check size={10} /> : <Copy size={10} />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {sending && (
                <div className="text-white/40 text-xs flex items-center gap-2">
                  <Loader2 size={12} className="animate-spin" /> Jarvis thinking...
                </div>
              )}
            </div>
          </Card>

          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send(); }}
              placeholder="Describe the scenario... (⌘/Ctrl+Enter to send)"
              rows={3}
              className="flex-1"
            />
            <Button onClick={send} disabled={sending}>
              <Send size={14} />
            </Button>
          </div>

          {narrative && (
            <Card className="bg-card/40 border-white/10 p-4 group relative">
              <button
                onClick={() => copyToClipboard(narrative)}
                className="absolute top-3 right-3 p-1 rounded bg-card border border-white/10 text-white/60 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                title="Copy narrative"
              >
                <Copy size={12} />
              </button>
              <div className="text-[11px] tracking-[0.25em] text-white/60 mb-2 flex items-center gap-2">
                <Film size={12} /> NARRATIVE
              </div>
              <pre className="font-mono text-[12px] whitespace-pre-wrap text-white/85">{narrative}</pre>
            </Card>
          )}
        </div>

        {/* Right rail */}
        <div className="space-y-4">
          <Card className="bg-card/40 border-white/10 p-4 space-y-3">
            <div className="text-[11px] tracking-[0.25em] text-white/60">ACTIONS</div>
            <Button variant="outline" className="w-full" onClick={narrate} disabled={narrating || !messages.length}>
              {narrating ? <><Loader2 size={14} className="animate-spin mr-2" /> Narrating...</> : <><Film size={14} className="mr-2" /> Narrate (Dolphin)</>}
            </Button>
            <Button variant="outline" className="w-full" onClick={summarize} disabled={summarizing || !messages.length}>
              {summarizing ? <><Loader2 size={14} className="animate-spin mr-2" /> Summarizing...</> : <><Sparkles size={14} className="mr-2" /> Send to Pod Room</>}
            </Button>
          </Card>

          {payload && (
            <Card className="bg-card/40 border-white/10 p-4 space-y-3">
              <div className="text-[11px] tracking-[0.25em] text-white/60">POD ROOM PAYLOAD</div>
              <div className="text-xs space-y-2">
                <div><span className="text-white/40">Theatre:</span> {payload.theatre}</div>
                <div><span className="text-white/40">Agents:</span> {payload.agent_count}</div>
                <div><span className="text-white/40">Strength:</span> {Number(payload.narrative_strength).toFixed(2)}</div>
                <div className="text-white/40 text-[10px] italic">{payload.rationale}</div>
                <div className="pt-2 border-t border-white/10">
                  <div className="text-white/40 text-[10px] mb-1">NARRATIVE</div>
                  <div className="text-white/80 text-[11px] whitespace-pre-wrap">{payload.narrative}</div>
                </div>
              </div>
              <Button className="w-full" onClick={sendToPod}>Open in Pod Room →</Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
