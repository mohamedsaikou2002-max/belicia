import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [ready, setReady] = useState(false);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    // Do not offer the update form merely because an unverified URL hash says
    // 'recovery'. Only a real, exchanged Supabase Auth session authorizes it.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === "PASSWORD_RECOVERY" && session) {
        setRecoveryError(null);
        setReady(true);
      } else if (event === "SIGNED_OUT") {
        setReady(false);
      }
    });
    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) setRecoveryError(error.message);
      else if (data.session) setReady(true);
      else setRecoveryError("Recovery link is missing, invalid, or expired. Request a new link on the sign-in page.");
    }).catch(() => {
      if (active) setRecoveryError("Unable to verify the recovery link. Try opening it again.");
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated");
      navigate("/chat", { replace: true });
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Unable to update password");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-sm w-full border border-white/15 rounded-2xl p-8 bg-white/5 space-y-6">
        <h1 className="text-xl font-light tracking-[0.3em] text-glow text-center">NEW PASSWORD</h1>
        {!ready ? (
          <p role={recoveryError ? "alert" : undefined} className="text-sm text-white/50 text-center">
            {recoveryError ?? "Validating your recovery link…"}
            {recoveryError && (
              <Button variant="link" type="button" className="block mx-auto" onClick={() => navigate("/auth")}>
                Return to sign in
              </Button>
            )}
          </p>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <Input
              type="password"
              required
              minLength={6}
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-transparent border-white/20 text-white placeholder:text-white/30"
            />
            <Button
              type="submit"
              disabled={busy}
              className="w-full bg-white/15 hover:bg-white/25 border border-white/30 text-white"
            >
              {busy ? "…" : "Update password"}
            </Button>
          </form>
        )}
      </div>
    </main>
  );
};

export default ResetPassword;
