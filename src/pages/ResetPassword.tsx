import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Recovery links arrive with type=recovery in the URL hash; the supabase
    // client exchanges it and fires PASSWORD_RECOVERY.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    if (window.location.hash.includes("type=recovery")) setReady(true);
    return () => subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated");
      navigate("/", { replace: true });
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-sm w-full border border-white/15 rounded-2xl p-8 bg-white/5 space-y-6">
        <h1 className="text-xl font-light tracking-[0.3em] text-glow text-center">NEW PASSWORD</h1>
        {!ready ? (
          <p className="text-sm text-white/50 text-center">
            Waiting for the recovery link… open this page from the link in your email.
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
