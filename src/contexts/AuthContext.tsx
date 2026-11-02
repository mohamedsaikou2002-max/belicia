import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
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

  useEffect(() => {
    let active = true;
    let revision = 0;
    const validate = async (s: Session | null, current: number) => {
      const { data, error } = s ? await supabase.auth.getUser() : { data: { user: null }, error: null };
      if (!active || current !== revision) return;
      setSession(!error && data.user ? s : null);
      setLoading(false);
    };
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      const current = ++revision;
      if (!s) {
        setSession(null);
        setLoading(false);
        queryClient.clear();
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
    sessionStorage.removeItem("gt_pod_payload");
  };

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
