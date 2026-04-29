import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BeliciaOrb } from "@/components/BeliciaOrb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Mic, MicOff, Send, Trash2, Volume2, VolumeX, Archive } from "lucide-react";
import { toast } from "sonner";

type Msg = { role: "user" | "assistant"; content: string; created_at?: string };

// Web Speech API typing
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const Index = () => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voiceOn, setVoiceOn] = useState(true);
  const [useArchive, setUseArchive] = useState(false);
  const [intensity, setIntensity] = useState(0);

  const recogRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const speakWithBrowser = useCallback((text: string) => {
    if (!("speechSynthesis" in window)) return false;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/[*_#`]/g, ""));
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
    return true;
  }, []);

  // load history once
  useEffect(() => {
    (async () => {
      const url = `https://focrrskgrxdkiddajxuq.supabase.co/functions/v1/memory?action=recent`;
      const r = await fetch(url, {
        headers: {
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
      });
      if (r.ok) {
        const j = await r.json();
        setMessages(j.messages ?? []);
      }
    })();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 1e9, behavior: "smooth" });
  }, [messages, sending]);

  const speak = useCallback(async (text: string) => {
    if (!voiceOn || !text) return;
    try {
      setSpeaking(true);
      const r = await fetch(
        `https://focrrskgrxdkiddajxuq.supabase.co/functions/v1/tts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ text }),
        },
      );
      if (!r.ok) throw new Error(`TTS failed (${r.status})`);
      const contentType = r.headers.get("Content-Type") ?? "";
      if (contentType.includes("application/json")) {
        await r.json();
        if (speakWithBrowser(text)) return;
        throw new Error("Voice playback unavailable");
      }
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current?.pause();
      audioRef.current = audio;
      audio.onended = () => { setSpeaking(false); URL.revokeObjectURL(url); };
      audio.onerror = () => { setSpeaking(false); URL.revokeObjectURL(url); };
      await audio.play();
    } catch (e) {
      console.error(e);
      if (!speakWithBrowser(text)) setSpeaking(false);
    }
  }, [voiceOn, speakWithBrowser]);

  const send = useCallback(async (text: string) => {
    const message = text.trim();
    if (!message || sending) return;
    setSending(true);
    setIntensity(0.6);
    setMessages(m => [...m, { role: "user", content: message }]);
    setInput("");

    try {
      const { data, error } = await supabase.functions.invoke("chat", {
        body: { message, use_archive: useArchive },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      const reply = (data as any).response as string;
      setMessages(m => [...m, { role: "assistant", content: reply }]);
      speak(reply);
    } catch (e: any) {
      toast.error(e.message || "Belicia hit an error");
    } finally {
      setSending(false);
      setIntensity(0);
    }
  }, [sending, useArchive, speak]);

  // voice input
  const toggleListen = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { toast.error("Speech recognition not supported in this browser"); return; }
    if (listening) {
      recogRef.current?.stop();
      return;
    }
    const recog = new SR();
    recog.continuous = false;
    recog.interimResults = true;
    recog.lang = "en-US";
    recog.onstart = () => { setListening(true); setIntensity(0.4); };
    recog.onresult = (ev: any) => {
      let txt = "";
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        txt += ev.results[i][0].transcript;
      }
      setInput(txt);
      setIntensity(0.4 + Math.min(0.5, txt.length / 80));
      if (ev.results[ev.results.length - 1].isFinal) {
        recog.stop();
        send(txt);
      }
    };
    recog.onerror = () => { setListening(false); setIntensity(0); };
    recog.onend = () => { setListening(false); setIntensity(0); };
    recogRef.current = recog;
    recog.start();
  }, [listening, send]);

  const clearMemory = async () => {
    if (!confirm("Wipe all of Belicia's memory?")) return;
    const url = `https://focrrskgrxdkiddajxuq.supabase.co/functions/v1/memory?action=clear`;
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ user_id: "default" }),
    });
    setMessages([]);
    toast.success("Memory cleared");
  };

  const stopSpeaking = () => {
    audioRef.current?.pause();
    setSpeaking(false);
  };

  return (
    <main className="min-h-screen flex flex-col text-foreground">
      <header className="flex items-center justify-between px-6 py-4 bg-glass border-b border-cyan-400/10">
        <div>
          <h1 className="text-2xl font-light tracking-[0.3em] text-glow">BELICIA</h1>
          <p className="text-xs text-cyan-200/50 tracking-widest mt-1">PERSONAL AI · ALWAYS LEARNING</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-cyan-100/70">
            <Archive className="w-3.5 h-3.5" />
            Archive RAG
            <Switch checked={useArchive} onCheckedChange={setUseArchive} />
          </label>
          <Button variant="ghost" size="icon" onClick={() => setVoiceOn(v => !v)} title="Toggle voice">
            {voiceOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={clearMemory} title="Clear memory">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <section className="grid lg:grid-cols-[1fr_minmax(0,520px)] flex-1 gap-0">
        {/* Orb */}
        <div className="relative h-[40vh] lg:h-auto min-h-[300px]">
          <BeliciaOrb intensity={intensity} speaking={speaking || sending} />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center pointer-events-none">
            <p className="text-xs tracking-[0.4em] text-cyan-200/60">
              {sending ? "THINKING…" : speaking ? "SPEAKING…" : listening ? "LISTENING…" : "READY"}
            </p>
          </div>
          {speaking && (
            <button
              onClick={stopSpeaking}
              className="absolute top-6 right-6 text-xs px-3 py-1 bg-glass rounded-full border border-cyan-300/20 hover:border-cyan-300/60 transition"
            >
              Stop
            </button>
          )}
        </div>

        {/* Chat */}
        <aside className="flex flex-col bg-glass border-l border-cyan-400/10 max-h-[60vh] lg:max-h-none">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-cyan-200/40 text-sm pt-12">
                Speak or type. Belicia will remember.
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-cyan-400/10 border border-cyan-400/20 text-cyan-50"
                      : "bg-fuchsia-400/5 border border-fuchsia-300/15 text-fuchsia-50/90"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="px-4 py-2.5 rounded-2xl bg-fuchsia-400/5 border border-fuchsia-300/15">
                  <span className="inline-flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-300 animate-pulse-glow" />
                    <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-300 animate-pulse-glow" style={{ animationDelay: "0.2s" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-300 animate-pulse-glow" style={{ animationDelay: "0.4s" }} />
                  </span>
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); send(input); }}
            className="p-4 border-t border-cyan-400/10 flex gap-2"
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={toggleListen}
              className={listening ? "text-fuchsia-300 border-glow" : "text-cyan-200"}
              title={listening ? "Stop listening" : "Voice input"}
            >
              {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Talk to Belicia…"
              className="bg-transparent border-cyan-400/20 focus-visible:ring-cyan-400/40 text-cyan-50 placeholder:text-cyan-200/30"
              disabled={sending}
            />
            <Button
              type="submit"
              size="icon"
              disabled={sending || !input.trim()}
              className="bg-cyan-400/20 hover:bg-cyan-400/30 border border-cyan-300/30 text-cyan-50"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </aside>
      </section>
    </main>
  );
};

export default Index;
