import { authFetch } from "@/lib/authFetch";
const FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/game-theory`;

export type GTMessage = { role: "user" | "assistant"; content: string };

async function call(path: string, body: any) {
  const r = await authFetch(`${FN_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
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
