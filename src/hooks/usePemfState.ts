import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type PemfState = {
  coherenceScore: number;
  recoveryState: "depleted" | "recovering" | "optimal" | "peak";
  hrvScore: number;
  updatedAt: string;
} | null;

export function usePemfState(userId = "default") {
  const [pemf, setPemf] = useState<PemfState>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchState = async () => {
      const { data } = await supabase
        .from("belicia_profile")
        .select("current_pemf_state")
        .eq("user_id", userId)
        .maybeSingle();
      const state = (data?.current_pemf_state ?? null) as PemfState;
      if (cancelled) return;
      setPemf(state);
      if (state?.updatedAt) {
        const ageMs = Date.now() - new Date(state.updatedAt).getTime();
        setConnected(ageMs < 5 * 60 * 1000);
      } else {
        setConnected(false);
      }
    };
    fetchState();
    const t = setInterval(fetchState, 30_000);
    return () => { cancelled = true; clearInterval(t); };
  }, [userId]);

  return { pemf, connected };
}
