import { supabase } from "@/integrations/supabase/client";
const FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/game-theory`;
const ANON = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export type GTMessage = { role: "user" | "assistant"; content: string };

async function call(path: string, body: any) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error("Sign in to run game theory simulations");
  const r = await fetch(`${FN_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: ANON,
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export const gtChat = (messages: GTMessage[]) =>
  call("/chat", { messages }) as Promise<{ reply: string }>;

export const gtNarrate = (messages: GTMessage[]) =>
  call("/narrate", { messages }) as Promise<{ narrative: string }>;

export const gtSummarize = (messages: GTMessage[]) =>
  call("/summarize", { messages }) as Promise<{
    narrative: string;
    theatre: string;
    agent_count: number;
    narrative_strength: number;
    rationale: string;
  }>;
