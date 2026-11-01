import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    const finish = async () => {
      try {
        const url = new URL(window.location.href);
        const providerError = url.searchParams.get("error_description") || url.searchParams.get("error");
        if (providerError) throw new Error(providerError);
        const code = url.searchParams.get("code");
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
        }
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!data.session) throw new Error("No authenticated session was received. Please sign in again.");
        if (active) navigate("/", { replace: true });
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Could not complete sign in.");
      }
    };
    void finish();
    return () => { active = false; };
  }, [navigate]);
  return <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-white">
    <h1 className="text-xl tracking-widest">BELICIA</h1>
    <p className="text-sm text-white/60">{error ?? "Completing secure sign-in…"}</p>
    {error && <Link className="underline" to="/auth">Return to sign in</Link>}
  </main>;
}
