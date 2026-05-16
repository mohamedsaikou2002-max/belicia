const API = (import.meta.env.VITE_API_URL as string) ?? "http://localhost:8000";

async function post<T>(path: string, body: object): Promise<T> {
  const r = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

async function get<T>(path: string): Promise<T> {
  const r = await fetch(`${API}${path}`);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export const podSetup = (
  narrative: string,
  theatre: string,
  agent_count = 500,
  insurgent_pct = 0.0,
  force_refresh = false,
) => post<any>("/pod/setup", { narrative, theatre, agent_count, insurgent_pct, force_refresh });

export const podStep = (rounds = 1) => post<{ rounds: any[] }>("/pod/step", { rounds });

export const podInject = (narrative_strength: number, event = "", force_rederive = false) =>
  post<any>("/pod/inject", { narrative_strength, event, force_rederive });

export const podPredict = () => get<any>("/pod/predict");
export const podCanvas = () => get<any>("/pod/canvas");
export const podReset = () => post<any>("/pod/reset", {});
export const podWorldState = () => get<any>("/pod/world-state");
export const podInterrogate = (agent_index: number, question: string) =>
  post<{ response: string }>("/pod/interrogate", { agent_index, question });
export const getTheatres = () => get<{ theatres: string[] }>("/pod/theatres");
export const corpusIngest = (texts: string[], ids: string[], collection = "agent") =>
  post<any>("/corpus/ingest", { texts, ids, collection });
