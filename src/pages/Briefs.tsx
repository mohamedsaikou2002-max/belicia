import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TopNav } from "@/components/TopNav";

type Brief = {
  id: string;
  brief_type: string | null;
  content: string | null;
  delivery_channel: string | null;
  status: string;
  delivered_at: string | null;
  scheduled_for: string | null;
  created_at: string;
};

const Briefs = () => {
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("scheduled_briefs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      setBriefs((data ?? []) as Brief[]);
      setLoading(false);
    })();
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground p-6">
      <header className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-light tracking-[0.3em] text-glow">BRIEFS</h1>
          <p className="text-xs text-white/50 tracking-widest mt-1">PROACTIVE TRANSMISSIONS</p>
        </div>
        <TopNav />
      </header>

      {loading && <p className="text-white/40 text-sm">Loading…</p>}
      {!loading && briefs.length === 0 && (
        <p className="text-white/40 text-sm">No briefs yet. The morning brief scheduler will populate this.</p>
      )}

      <div className="space-y-4 max-w-3xl">
        {briefs.map((b) => (
          <article key={b.id} className="border border-white/15 rounded-2xl p-5 bg-white/5">
            <div className="flex items-center justify-between text-[10px] tracking-widest text-white/50 mb-3">
              <span>{(b.brief_type ?? "—").toUpperCase()} · {b.status.toUpperCase()}</span>
              <span>{new Date(b.delivered_at ?? b.created_at).toLocaleString()}</span>
            </div>
            <p className="text-sm text-white/85 whitespace-pre-line leading-relaxed">{b.content}</p>
          </article>
        ))}
      </div>
    </main>
  );
};

export default Briefs;
