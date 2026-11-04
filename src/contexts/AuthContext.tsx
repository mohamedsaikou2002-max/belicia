import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();
  const lastVerifiedUserId = useRef<string | null>(null);

  useEffect(() => {
    let active = true;
    let revision = 0;
    const applySession = (verified: Session | null) => {
      const nextUserId = verified?.user.id ?? null;
      if (lastVerifiedUserId.current !== nextUserId) {
        queryClient.clear();
        if (lastVerifiedUserId.current) {
          sessionStorage.removeItem(`gt_pod_payload:${lastVerifiedUserId.current}`);
        }
        lastVerifiedUserId.current = nextUserId;
      }
      setSession(verified);
      setLoading(false);
    };
    const validate = async (s: Session | null, current: number) => {
      const { data, error } = s ? await supabase.auth.getUser() : { data: { user: null }, error: null };
      if (!active || current !== revision) return;
      applySession(!error && data.user ? s : null);
    };
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      const current = ++revision;
      if (!s) {
        applySession(null);
      } else {
        setLoading(true);
        // Do not await Auth calls inside the auth-state callback.
        setTimeout(() => void validate(s, current), 0);
      }
    });
    const initial = revision;
    supabase.auth.getSession().then(({ data }) => {
      if (initial === revision) void validate(data.session, initial);
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, [queryClient]);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    queryClient.clear();
    if (session?.user.id) sessionStorage.removeItem(`gt_pod_payload:${session.user.id}`);
  };

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
