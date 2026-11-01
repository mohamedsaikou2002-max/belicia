import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import "@lovable.dev/cloud-auth-js/styles.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

const Auth = () => {
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [awaitingConfirm, setAwaitingConfirm] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { session, loading } = useAuth();
  const from = (location.state as any)?.from ?? "/";

  useEffect(() => {
    if (!loading && session) navigate(from, { replace: true });
  }, [session, loading, navigate, from]);

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Password reset link sent — check your email");
        setMode("signin");
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        if (!data.session) {
          setAwaitingConfirm(true);
        } else {
          navigate(from, { replace: true });
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      toast.error(err.message ?? "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  const handleOAuth = async (provider: "google" | "lovable") => {
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error(result.error.message ?? "Sign-in failed");
        setBusy(false);
        return;
      }
      if (result.redirected) return; // browser is navigating away
      navigate(from, { replace: true });
    } catch (err: any) {
      toast.error(err.message ?? "Sign-in failed");
      setBusy(false);
    }
  };

  if (awaitingConfirm) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-sm w-full border border-white/15 rounded-2xl p-8 bg-white/5 text-center space-y-4">
          <h1 className="text-xl font-light tracking-[0.3em] text-glow">CHECK YOUR EMAIL</h1>
          <p className="text-sm text-white/60 leading-relaxed">
            We sent a confirmation link to <span className="text-white">{email}</span>. Click it to activate your account, then sign in.
          </p>
          <Button
            variant="ghost"
            className="text-white/60 hover:text-white"
            onClick={() => { setAwaitingConfirm(false); setMode("signin"); }}
          >
            Back to sign in
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-sm w-full border border-white/15 rounded-2xl p-8 bg-white/5 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-light tracking-[0.3em] text-glow">BELICIA</h1>
          <p className="text-[10px] text-white/50 tracking-widest mt-1">BAYT AL-HIKMAH · HOUSE OF WISDOM</p>
        </div>

        <form onSubmit={handleEmail} className="space-y-3">
          <Input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-transparent border-white/20 text-white placeholder:text-white/30"
          />
          {mode !== "forgot" && (
            <Input
              type="password"
              required
              minLength={6}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-transparent border-white/20 text-white placeholder:text-white/30"
            />
          )}
          <Button
            type="submit"
            disabled={busy}
            className="w-full bg-white/15 hover:bg-white/25 border border-white/30 text-white"
          >
            {busy ? "…" : mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}
          </Button>
        </form>

        <div className="flex items-center gap-3 text-[10px] tracking-widest text-white/40">
          <div className="flex-1 h-px bg-white/10" />
          OR
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <div className="space-y-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => handleOAuth("google")}
            className="w-full border border-white/20 rounded-md py-2 text-sm text-white/80 hover:bg-white/10 transition disabled:opacity-50"
          >
            Continue with Google
          </button>
          <button
            type="button"
            disabled={busy}
            className="lovable-auth-button w-full disabled:opacity-50"
            onClick={() => handleOAuth("lovable")}
          >
            Continue with Lovable
          </button>
        </div>

        <div className="text-center text-xs text-white/50 space-y-1">
          {mode === "signin" && (
            <>
              <button type="button" className="hover:text-white block mx-auto" onClick={() => setMode("signup")}>
                Need an account? Sign up
              </button>
              <button type="button" className="hover:text-white block mx-auto" onClick={() => setMode("forgot")}>
                Forgot password?
              </button>
            </>
          )}
          {mode !== "signin" && (
            <button type="button" className="hover:text-white" onClick={() => setMode("signin")}>
              Back to sign in
            </button>
          )}
        </div>
      </div>
    </main>
  );
};

export default Auth;
