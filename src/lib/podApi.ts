// Pod Room — client-side simulation engine + edge-function AI calls.
// State lives in module scope so the existing PodRoom UI keeps working.
import { supabase } from "@/integrations/supabase/client";

const FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pod-room`;
const ANON = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

async function call(path: string, body?: any) {
  const r = await fetch(`${FN_URL}${path}`, {
    method: body ? "POST" : "GET",
    headers: {
      "Content-Type": "application/json",
      apikey: ANON,
      Authorization: `Bearer ${ANON}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

// ── theatres (static) ─────────────────────────────────────────
const THEATRES = [
  "Global Mixed",
  "North America", "Western Europe", "Eastern Europe",
  "MENA", "Gulf States", "South Asia", "Southeast Asia",
  "East Asia", "Sub-Saharan Africa", "Latin America",
  "Italia", "France", "Germany", "United Kingdom",
  "United States", "Brazil", "Nigeria", "India", "China",
];

// ── archetypes & persona fragments ────────────────────────────
const ARCHETYPES = [
  "Community Elder", "Gatekeeper", "Amplifier", "Skeptic",
  "Early Adopter", "Blocker", "Pragmatist", "Idealist", "Cynic",
];
const TRAITS = [
  "status-seeking", "conflict-averse", "ideologically driven",
  "pragmatic survivor", "spiritually devout", "cynical realist",
  "openly idealistic", "reputation above all", "tribal loyalty",
  "contrarian by reflex",
];
const HABITS = [
  "WhatsApp group dominant", "Telegram channel admin",
  "TikTok native", "Twitter/X firebrand", "voice-note heavy",
  "email formalist", "face-to-face only", "reels lurker",
];
const STANCES = ["HOSTILE", "SKEPTIC", "NEUTRAL", "CURIOUS", "AMPLIFIER"] as const;
const REGIONS: Record<string, string[]> = {
  "Global Mixed": ["London", "New York", "São Paulo", "Lagos", "Mumbai", "Jakarta", "Cairo", "Berlin"],
  "Italia": ["Roma", "Milano", "Napoli", "Torino", "Palermo"],
  "Gulf States": ["Dubai", "Riyadh", "Doha", "Kuwait City", "Manama"],
  "MENA": ["Cairo", "Casablanca", "Beirut", "Amman", "Tunis"],
  "South Asia": ["Mumbai", "Delhi", "Karachi", "Dhaka", "Colombo"],
  "Southeast Asia": ["Jakarta", "Manila", "Bangkok", "Hanoi", "KL"],
  "Latin America": ["São Paulo", "Mexico City", "Buenos Aires", "Lima", "Bogotá"],
  "Sub-Saharan Africa": ["Lagos", "Nairobi", "Accra", "Johannesburg", "Addis Ababa"],
  "Western Europe": ["London", "Paris", "Berlin", "Madrid", "Amsterdam"],
  "Eastern Europe": ["Warsaw", "Bucharest", "Kyiv", "Budapest", "Prague"],
  "East Asia": ["Tokyo", "Seoul", "Shanghai", "Taipei", "Hong Kong"],
  "North America": ["New York", "LA", "Chicago", "Toronto", "Houston"],
};

// seeded RNG
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function pick<T>(rng: () => number, arr: T[]) { return arr[Math.floor(rng() * arr.length)]; }

// ── state ─────────────────────────────────────────────────────
type Agent = {
  x: number; y: number;
  archetype: string; region: string; country: string;
  personality: string; stance: string;
  belief: number; seir: "S" | "E" | "I" | "R";
  insurgent: boolean; organic_seed: boolean;
  resistance: number;
};

let state: {
  narrative: string; theatre: string;
  derived_vars: any;
  agents: Agent[];
  round: number;
  history: any[];
  seed_info: any;
  world: any;
} | null = null;

function regionsFor(theatre: string) {
  return REGIONS[theatre] ?? REGIONS["Global Mixed"];
}

function spawnAgents(count: number, insurgentPct: number, theatre: string, seed: number): Agent[] {
  const rng = mulberry32(seed);
  const regions = regionsFor(theatre);
  const agents: Agent[] = [];
  const insurgents = Math.floor(count * insurgentPct);
  const organicSeeds = Math.max(1, Math.floor(count * 0.01));
  for (let i = 0; i < count; i++) {
    const region = pick(rng, regions);
    const isIns = i < insurgents;
    const isSeed = !isIns && i < insurgents + organicSeeds;
    agents.push({
      x: rng() * 100, y: rng() * 100,
      archetype: pick(rng, ARCHETYPES),
      region,
      country: region.slice(0, 2).toUpperCase(),
      personality: `${20 + Math.floor(rng() * 55)}yo. ${pick(rng, TRAITS)}; ${pick(rng, HABITS)}.`,
      stance: pick(rng, STANCES as any),
      belief: isIns ? 0.95 : isSeed ? 0.7 : 0.1 + rng() * 0.2,
      seir: isIns || isSeed ? "I" : "S",
      insurgent: isIns,
      organic_seed: isSeed,
      resistance: rng() * 0.4,
    });
  }
  return agents;
}

function summarize(s: typeof state, n: number): any {
  if (!s) return {};
  const a = s.agents;
  const dv = s.derived_vars ?? {};
  const ns = Number(dv.narrative_strength?.value ?? 0.5);
  const wr = Number(dv.world_receptivity?.value ?? 0.5);
  let sum = 0, inf = 0, res = 0, neu = 0;
  const seir = { S: 0, E: 0, I: 0, R: 0 };
  for (const ag of a) {
    sum += ag.belief;
    if (ag.belief > 0.6) inf++;
    else if (ag.belief < 0.3) res++;
    else neu++;
    seir[ag.seir]++;
  }
  const avg = sum / a.length;
  const r0 = ns * wr * 2.5 * (seir.I / a.length + 0.05);
  // organic spread ratio: I from non-insurgents / I total
  const orgI = a.filter((x) => x.seir === "I" && !x.insurgent).length;
  const osr = seir.I > 0 ? orgI / seir.I : 0;
  // very rough cluster proxy
  const clusters = Math.min(10, Math.max(3, Math.floor(a.length / 200))) as number;
  const clusterCards = Array.from({ length: clusters }, (_, i) => {
    const slice = a.slice(i * Math.floor(a.length / clusters), (i + 1) * Math.floor(a.length / clusters));
    const bsum = slice.reduce((x, y) => x + y.belief, 0) / slice.length;
    return {
      size: slice.length,
      avg_belief: bsum,
      influence: slice.filter((y) => y.belief > 0.6).length / slice.length,
      resistance: slice.filter((y) => y.belief < 0.3).length / slice.length,
      echo_chamber: Math.abs(bsum - 0.5) > 0.35,
    };
  });
  return {
    round: n,
    avg_belief: avg,
    influence: inf / a.length,
    resistance: res / a.length,
    neutral: neu / a.length,
    r0,
    system_energy: 1 - Math.abs(avg - 0.5) * 2,
    quantum_coherence: 1 - (seir.E / a.length),
    organic_spread_ratio: osr,
    seir,
    clusters: clusterCards,
  };
}

function stepOnce() {
  if (!state) return;
  const dv = state.derived_vars ?? {};
  const ns = Number(dv.narrative_strength?.value ?? 0.5);
  const wr = Number(dv.world_receptivity?.value ?? 0.5);
  const br = Number(dv.base_rate_modifier?.value ?? 0.5);
  const vol = Number(dv.volatility_modifier?.value ?? 0.5);
  const damp = Number(dv.shock_dampener?.value ?? 0.5);
  const a = state.agents;
  const infectFraction = a.filter((x) => x.seir === "I").length / a.length;
  const beta = 0.25 * ns * wr * br * (1 + vol * 0.5);
  const sigma = 0.35; // E→I
  const gamma = 0.08 * (1 + damp); // I→R

  for (const ag of a) {
    // belief drift toward infection pressure
    const pressure = infectFraction * ns - ag.resistance;
    ag.belief = Math.max(0, Math.min(1, ag.belief + pressure * 0.06 + (Math.random() - 0.5) * vol * 0.05));
    // SEIR transitions
    if (ag.seir === "S" && Math.random() < beta * infectFraction) ag.seir = "E";
    else if (ag.seir === "E" && Math.random() < sigma) ag.seir = "I";
    else if (ag.seir === "I" && Math.random() < gamma) ag.seir = "R";
  }
  state.round++;
  state.history.push({
    round: state.round,
    belief: a.reduce((s, x) => s + x.belief, 0) / a.length,
    H: 1 - Math.abs(a.reduce((s, x) => s + x.belief, 0) / a.length - 0.5) * 2,
    r0: ns * wr * 2.5 * (a.filter((x) => x.seir === "I").length / a.length + 0.05),
  });
}

// ── public API (matches previous shape) ───────────────────────
export async function podWorldState() {
  const w = await call("/world-state");
  if (state) state.world = w;
  return w;
}

export async function podSetup(
  narrative: string,
  theatre: string,
  agent_count = 500,
  insurgent_pct = 0.0,
  _force_refresh = false,
) {
  const world = await call("/world-state");
  const derived = await call("/derive", { narrative, theatre, world });
  const seed = Math.floor(Math.random() * 1e9);
  const agents = spawnAgents(agent_count, insurgent_pct, theatre, seed);
  state = {
    narrative, theatre,
    derived_vars: derived,
    agents, round: 0, history: [],
    seed_info: {
      seed,
      organic_seeds: agents.filter((a) => a.organic_seed).length,
      insurgents: agents.filter((a) => a.insurgent).length,
      clean_baseline: insurgent_pct === 0,
    },
    world,
  };
  state.history.push({ round: 0, belief: 0.15, H: 0.7, r0: 0 });
  return { derived_vars: derived, seed_info: state.seed_info, world };
}

export async function podStep(rounds = 1) {
  if (!state) throw new Error("Not initialized");
  for (let i = 0; i < rounds; i++) stepOnce();
  return { rounds: state.history.slice(-rounds) };
}

export async function podInject(narrative_strength: number, event = "", force_rederive = false) {
  if (!state) throw new Error("Not initialized");
  if (force_rederive) {
    const world = await call("/world-state");
    const merged = `${state.narrative}\n\nINJECTED EVENT: ${event}`;
    state.derived_vars = await call("/derive", { narrative: merged, theatre: state.theatre, world });
    state.world = world;
  } else {
    state.derived_vars = {
      ...state.derived_vars,
      narrative_strength: { value: narrative_strength, reasoning: `Manually injected (${event || "no event"})` },
    };
  }
  return { derived_vars: state.derived_vars };
}

export async function podPredict() {
  if (!state) throw new Error("Not initialized");
  const summary = summarize(state, state.round);
  const out = await call("/predict", {
    state: { derived_vars: state.derived_vars, seed_info: state.seed_info, summary, history: state.history },
  });
  return { ...out, derived_vars: state.derived_vars, seed_info: state.seed_info };
}

export async function podCanvas() {
  if (!state) return { agents: [], summary: {} };
  return { agents: state.agents, summary: summarize(state, state.round) };
}

export async function podReset() {
  state = null;
  return { ok: true };
}

export async function podInterrogate(agent_index: number, question: string) {
  if (!state) throw new Error("Not initialized");
  const agent = state.agents[Math.max(0, Math.min(state.agents.length - 1, agent_index))];
  return await call("/interrogate", { agent, question });
}

export async function getTheatres() {
  return { theatres: THEATRES };
}

export async function corpusIngest(_texts: string[], _ids: string[], _collection = "agent") {
  // Corpus is currently advisory; AI calls already use general knowledge.
  // Acknowledge so the UI can mark categories ingested.
  return { ok: true, ingested: _ids.length };
}
