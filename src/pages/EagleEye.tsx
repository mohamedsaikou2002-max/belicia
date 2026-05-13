import { useEffect, useRef, useState } from "react";
import exifr from "exifr";
import { supabase } from "@/integrations/supabase/client";
import { TopNav } from "@/components/TopNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

type Photo = { name: string; dataUrl: string; exif: Record<string, any> };
type Target = {
  id: string;
  subject: string;
  seed_username: string | null;
  accounts: { platform: string; url: string }[];
  photos: Photo[];
  exif: any[];
  contacts: any;
  graph: { nodes: any[]; edges: any[] };
  report: string | null;
  status: string;
  created_at: string;
};

export default function EagleEye() {
  const [subject, setSubject] = useState("");
  const [username, setUsername] = useState("");
  const [emails, setEmails] = useState("");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [running, setRunning] = useState(false);
  const [target, setTarget] = useState<Target | null>(null);
  const [history, setHistory] = useState<Target[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadHistory = async () => {
    const { data } = await supabase.functions.invoke("eagle-eye", { body: { action: "list" } });
    if (data?.targets) setHistory(data.targets);
  };
  useEffect(() => { loadHistory(); }, []);

  const onFiles = async (files: FileList | null) => {
    if (!files) return;
    const out: Photo[] = [];
    for (const f of Array.from(files)) {
      try {
        const exif = (await exifr.parse(f, { gps: true, exif: true, tiff: true })) ?? {};
        const dataUrl = await new Promise<string>((res) => {
          const r = new FileReader();
          r.onload = () => res(r.result as string);
          r.readAsDataURL(f);
        });
        out.push({ name: f.name, dataUrl, exif });
      } catch (e) {
        out.push({ name: f.name, dataUrl: "", exif: {} });
      }
    }
    setPhotos((p) => [...p, ...out]);
  };

  const ignite = async () => {
    if (!subject.trim()) { toast({ title: "Subject required" }); return; }
    setRunning(true);
    setTarget(null);
    try {
      const { data, error } = await supabase.functions.invoke("eagle-eye", {
        body: {
          action: "ignite",
          subject: subject.trim(),
          username: username.trim() || null,
          emails: emails.split(",").map(e => e.trim()).filter(Boolean),
          photos: photos.map(p => ({ name: p.name, exif: p.exif })),
        },
      });
      if (error) throw error;
      setTarget(data.target);
      loadHistory();
    } catch (e: any) {
      toast({ title: "Eagle Eye failed", description: String(e.message ?? e), variant: "destructive" });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-[Tektur]">
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <h1 className="text-lg tracking-[0.4em]">EAGLE EYE</h1>
        <TopNav />
      </header>

      <div className="p-6 grid lg:grid-cols-[420px_1fr] gap-6">
        <Card className="bg-white/5 border-white/10 p-4 space-y-4">
          <div>
            <label className="text-[10px] tracking-[0.3em] text-white/50">SUBJECT</label>
            <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Real name or alias" className="bg-black/40 border-white/10 text-white" />
          </div>
          <div>
            <label className="text-[10px] tracking-[0.3em] text-white/50">SEED USERNAME</label>
            <Input value={username} onChange={e => setUsername(e.target.value)} placeholder="handle (no @)" className="bg-black/40 border-white/10 text-white" />
          </div>
          <div>
            <label className="text-[10px] tracking-[0.3em] text-white/50">EMAILS (comma sep.)</label>
            <Input value={emails} onChange={e => setEmails(e.target.value)} placeholder="a@b.com, c@d.com" className="bg-black/40 border-white/10 text-white" />
          </div>
          <div>
            <label className="text-[10px] tracking-[0.3em] text-white/50">PHOTOS</label>
            <input
              ref={fileRef}
              type="file"
              multiple
              accept="image/*"
              onChange={e => onFiles(e.target.files)}
              className="block w-full text-xs text-white/70 file:mr-3 file:py-2 file:px-3 file:rounded file:border file:border-white/20 file:bg-white/5 file:text-white"
            />
            {photos.length > 0 && (
              <div className="mt-2 grid grid-cols-3 gap-2">
                {photos.map((p, i) => (
                  <div key={i} className="relative">
                    {p.dataUrl ? <img src={p.dataUrl} alt={p.name} className="w-full h-20 object-cover rounded" /> : <div className="w-full h-20 bg-white/10 rounded" />}
                    {(p.exif?.latitude || p.exif?.GPSLatitude) && (
                      <span className="absolute bottom-0 left-0 right-0 bg-emerald-500/80 text-[9px] text-black text-center">GPS</span>
                    )}
                  </div>
                ))}
                <button onClick={() => setPhotos([])} className="text-[10px] text-white/50 col-span-3 mt-1 underline">clear</button>
              </div>
            )}
          </div>
          <Button onClick={ignite} disabled={running} className="w-full bg-white text-black hover:bg-white/90">
            {running ? "ENRICHING..." : "IGNITE"}
          </Button>
          <p className="text-[10px] text-white/40 leading-relaxed">
            Modules: Username Enumeration (40+ platforms) · EXIF/GPS (client-side) · HIBP Breach Check · AI Behavioral Synthesis (Lovable Cloud).
          </p>
        </Card>

        <div className="space-y-4">
          {!target && !running && (
            <Card className="bg-white/5 border-white/10 p-6 text-white/50 text-sm">
              No target loaded. Drop a username, emails, and photos — then ignite.
            </Card>
          )}
          {running && (
            <Card className="bg-white/5 border-white/10 p-6 text-sm animate-pulse">
              Probing platforms · parsing metadata · cross-referencing breaches · synthesizing profile…
            </Card>
          )}
          {target && (
            <>
              <Card className="bg-white/5 border-white/10 p-4">
                <div className="text-[10px] tracking-[0.3em] text-white/50 mb-2">PLATFORM FOOTPRINT · {target.accounts.length} HITS</div>
                <div className="flex flex-wrap gap-2">
                  {target.accounts.map((a, i) => (
                    <a key={i} href={a.url} target="_blank" rel="noreferrer" className="text-xs px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20">
                      {a.platform}
                    </a>
                  ))}
                  {target.accounts.length === 0 && <span className="text-white/40 text-xs">no claimed accounts</span>}
                </div>
              </Card>

              <Card className="bg-white/5 border-white/10 p-4">
                <div className="text-[10px] tracking-[0.3em] text-white/50 mb-2">GEOGRAPHIC SIGNALS (EXIF GPS)</div>
                <div className="space-y-1 text-xs">
                  {target.graph.nodes.filter((n: any) => n.type === "Location").map((n: any, i: number) => (
                    <div key={i} className="flex justify-between border-b border-white/5 py-1">
                      <span>{n.name ?? n.label}</span>
                      <a className="text-blue-300" target="_blank" rel="noreferrer" href={`https://www.google.com/maps?q=${n.lat},${n.lon}`}>
                        {n.lat?.toFixed?.(4)}, {n.lon?.toFixed?.(4)}
                      </a>
                      <span className="text-white/40">{n.device ?? "—"}</span>
                    </div>
                  ))}
                  {target.graph.nodes.filter((n: any) => n.type === "Location").length === 0 && (
                    <span className="text-white/40">no GPS data in supplied photos</span>
                  )}
                </div>
              </Card>

              <Card className="bg-white/5 border-white/10 p-4">
                <div className="text-[10px] tracking-[0.3em] text-white/50 mb-2">BREACH EXPOSURE</div>
                <div className="space-y-2 text-xs">
                  {(target.contacts?.breaches ?? []).map((b: any, i: number) => (
                    <div key={i} className="border-b border-white/5 pb-2">
                      <div className="text-white">{b.email}</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {((b.Breaches ?? b.breaches ?? []) as any[]).map((br: any, j: number) => (
                          <span key={j} className="px-2 py-0.5 rounded bg-red-500/10 border border-red-500/30 text-red-300">{br.Name ?? br.name}</span>
                        ))}
                        {((b.Breaches ?? b.breaches ?? []).length === 0) && <span className="text-white/40">clean</span>}
                      </div>
                    </div>
                  ))}
                  {(!target.contacts?.breaches || target.contacts.breaches.length === 0) && <span className="text-white/40">no emails supplied</span>}
                </div>
              </Card>

              <Card className="bg-white/5 border-white/10 p-4">
                <div className="text-[10px] tracking-[0.3em] text-white/50 mb-2">BEHAVIORAL SYNTHESIS</div>
                <pre className="text-xs whitespace-pre-wrap text-white/80 leading-relaxed font-[Tektur]">{target.report ?? "(none)"}</pre>
              </Card>
            </>
          )}

          {history.length > 0 && (
            <Card className="bg-white/5 border-white/10 p-4">
              <div className="text-[10px] tracking-[0.3em] text-white/50 mb-2">HISTORY</div>
              <div className="space-y-1 text-xs">
                {history.map(h => (
                  <button key={h.id} onClick={() => setTarget(h as any)} className="w-full text-left flex justify-between hover:bg-white/5 px-2 py-1 rounded">
                    <span>{h.subject}</span>
                    <span className="text-white/40">{new Date(h.created_at).toLocaleString()}</span>
                  </button>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
