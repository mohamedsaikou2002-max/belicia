// Eagle Eye OSINT orchestrator - cloud-runnable subset of the homelab pipeline.
// Modules implemented here:
//   02 Username Enumeration  - HTTP probe across 40+ platforms (Maigret-style, no key)
//   04 EXIF                  - accepted from client (parsed in browser via exifr)
//   05 Contact Harvest       - HIBP unified breach check (free endpoint, no key required for breach list)
//   07 Digital Footprint     - aggregates checked platforms into timeline scaffold
//   09 Behavioral Synthesis  - Lovable AI Gateway (Gemini) reads the graph -> profile
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

// --- Platform map (subset of Sherlock/Maigret/WhatsMyName) ---
// status === 'claimed' if HEAD/GET returns 200 AND optional `absent` string isn't present.
type Site = { name: string; url: (u: string) => string; absent?: string };
const SITES: Site[] = [
  { name: "GitHub",       url: u => `https://github.com/${u}` },
  { name: "GitLab",       url: u => `https://gitlab.com/${u}` },
  { name: "Twitter/X",    url: u => `https://x.com/${u}` },
  { name: "Instagram",    url: u => `https://www.instagram.com/${u}/`, absent: "Page Not Found" },
  { name: "TikTok",       url: u => `https://www.tiktok.com/@${u}` },
  { name: "Reddit",       url: u => `https://www.reddit.com/user/${u}/about.json` },
  { name: "YouTube",      url: u => `https://www.youtube.com/@${u}` },
  { name: "Twitch",       url: u => `https://www.twitch.tv/${u}` },
  { name: "Medium",       url: u => `https://medium.com/@${u}` },
  { name: "DevTo",        url: u => `https://dev.to/${u}` },
  { name: "HackerNews",   url: u => `https://news.ycombinator.com/user?id=${u}` },
  { name: "Pinterest",    url: u => `https://www.pinterest.com/${u}/` },
  { name: "SoundCloud",   url: u => `https://soundcloud.com/${u}` },
  { name: "Spotify",      url: u => `https://open.spotify.com/user/${u}` },
  { name: "Steam",        url: u => `https://steamcommunity.com/id/${u}` },
  { name: "Vimeo",        url: u => `https://vimeo.com/${u}` },
  { name: "Behance",      url: u => `https://www.behance.net/${u}` },
  { name: "Dribbble",     url: u => `https://dribbble.com/${u}` },
  { name: "Flickr",       url: u => `https://www.flickr.com/people/${u}` },
  { name: "Keybase",      url: u => `https://keybase.io/${u}` },
  { name: "Replit",       url: u => `https://replit.com/@${u}` },
  { name: "Kaggle",       url: u => `https://www.kaggle.com/${u}` },
  { name: "StackOverflow",url: u => `https://stackoverflow.com/users/${u}` },
  { name: "ProductHunt",  url: u => `https://www.producthunt.com/@${u}` },
  { name: "Patreon",      url: u => `https://www.patreon.com/${u}` },
  { name: "Substack",     url: u => `https://${u}.substack.com` },
  { name: "Bandcamp",     url: u => `https://${u}.bandcamp.com` },
  { name: "Mixcloud",     url: u => `https://www.mixcloud.com/${u}` },
  { name: "Last.fm",      url: u => `https://www.last.fm/user/${u}` },
  { name: "Goodreads",    url: u => `https://www.goodreads.com/${u}` },
  { name: "Letterboxd",   url: u => `https://letterboxd.com/${u}` },
  { name: "Wikipedia",    url: u => `https://en.wikipedia.org/wiki/User:${u}` },
  { name: "AboutMe",      url: u => `https://about.me/${u}` },
  { name: "Gravatar",     url: u => `https://gravatar.com/${u}` },
  { name: "Telegram",     url: u => `https://t.me/${u}` },
  { name: "Mastodon.social", url: u => `https://mastodon.social/@${u}` },
  { name: "BlueSky",      url: u => `https://bsky.app/profile/${u}.bsky.social` },
  { name: "Threads",      url: u => `https://www.threads.net/@${u}` },
  { name: "Snapchat",     url: u => `https://www.snapchat.com/add/${u}` },
  { name: "Quora",        url: u => `https://www.quora.com/profile/${u}` },
  { name: "VK",           url: u => `https://vk.com/${u}` },
  { name: "Roblox",       url: u => `https://www.roblox.com/user.aspx?username=${u}` },
];

async function probe(site: Site, username: string, signal: AbortSignal) {
  const url = site.url(username);
  try {
    const r = await fetch(url, {
      method: "GET",
      redirect: "manual",
      signal,
      headers: { "User-Agent": "Mozilla/5.0 EagleEye/1.0" },
    });
    if (r.status >= 200 && r.status < 300) {
      if (site.absent) {
        const txt = (await r.text()).slice(0, 5000);
        if (txt.includes(site.absent)) return null;
      }
      return { platform: site.name, url, status: "claimed" };
    }
    return null;
  } catch { return null; }
}

async function enumerate(username: string) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 12000);
  const results = await Promise.all(SITES.map(s => probe(s, username, ctrl.signal)));
  clearTimeout(t);
  return results.filter(Boolean) as { platform: string; url: string; status: string }[];
}

// HIBP unified breach lookup (legacy free endpoint). May 401 without key for /api/v3 — use breachedaccount fallback.
async function breachCheck(email: string) {
  try {
    const r = await fetch(
      `https://haveibeenpwned.com/unifiedsearch/${encodeURIComponent(email)}`,
      { headers: { "User-Agent": "EagleEye-OSINT" } },
    );
    if (!r.ok) return { breaches: [], pastes: [], note: `HIBP ${r.status}` };
    const j = await r.json().catch(() => ({}));
    return j;
  } catch (e) { return { breaches: [], pastes: [], note: String(e) }; }
}

async function synthesize(graph: unknown, subject: string) {
  const sys = "You are an OSINT behavioral profiler. Read the enriched graph and produce a structured report covering: identity surface, platform footprint, geographic signals (from EXIF GPS), routine inference (post timestamps), interests, risk/breach exposure, and 3 actionable next-step intel pivots. Keep it concise, factual, no speculation beyond evidence.";
  const userMsg = `Subject: ${subject}\nGraph:\n${JSON.stringify(graph).slice(0, 30000)}`;

  const geminiKey = Deno.env.get("GEMINI_API_KEY");
  const models = [Deno.env.get("GEMINI_MODEL"), "gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash", "gemini-2.5-pro"]
    .filter((m, i, a): m is string => !!m && a.indexOf(m) === i);

  if (geminiKey) {
    for (const model of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(geminiKey)}`;
        const r = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: sys }] },
            contents: [{ role: "user", parts: [{ text: userMsg }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
          }),
        });
        const text = await r.text();
        if (!r.ok) { console.error(`Gemini ${model}:`, r.status, text.slice(0, 200)); continue; }
        const j = JSON.parse(text);
        const out = (j.candidates?.[0]?.content?.parts ?? []).map((p: any) => p.text ?? "").join("");
        if (out) return out;
      } catch (err) { console.error(`Gemini ${model} threw:`, (err as Error).message?.slice(0, 200)); }
    }
  }

  const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [{ role: "system", content: sys }, { role: "user", content: userMsg }],
    }),
  });
  if (!r.ok) return `AI synthesis failed: ${r.status} ${await r.text()}`;
  const j = await r.json();
  return j.choices?.[0]?.message?.content ?? "(empty)";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const supa = createClient(SUPABASE_URL, SERVICE_KEY);
    const { action, target_id, subject, username, emails, photos } = await req.json();

    // --- IGNITE: create or refresh a target row ---
    if (action === "ignite") {
      if (!subject || typeof subject !== "string") {
        return new Response(JSON.stringify({ error: "subject required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data: row, error } = await supa.from("eagle_eye_targets").insert({
        subject, seed_username: username ?? null,
        photos: photos ?? [], exif: (photos ?? []).map((p: any) => p.exif ?? {}),
        status: "scanning",
      }).select().single();
      if (error) throw error;

      // Run modules in parallel
      const [accounts, breachResults] = await Promise.all([
        username ? enumerate(username) : Promise.resolve([]),
        Promise.all(((emails ?? []) as string[]).map(async e => ({ email: e, ...(await breachCheck(e)) }))),
      ]);

      // Pull GPS from EXIF blobs supplied by client
      const gpsPoints: any[] = [];
      for (const p of (photos ?? [])) {
        const ex = p.exif ?? {};
        const lat = ex.latitude ?? ex.GPSLatitude;
        const lon = ex.longitude ?? ex.GPSLongitude;
        if (typeof lat === "number" && typeof lon === "number") {
          gpsPoints.push({ name: p.name, lat, lon, taken: ex.DateTimeOriginal ?? ex.CreateDate ?? null, device: ex.Model ?? null });
        }
      }

      const graph = {
        nodes: [
          { id: "subject", type: "Person", label: subject },
          ...accounts.map(a => ({ id: `acc:${a.platform}`, type: "Account", label: a.platform, url: a.url })),
          ...breachResults.flatMap((b: any) => [
            { id: `email:${b.email}`, type: "Email", label: b.email },
            ...((b.Breaches ?? b.breaches ?? []) as any[]).map((br: any, i: number) => ({
              id: `breach:${b.email}:${i}`, type: "Breach", label: br.Name ?? br.name ?? `breach-${i}`,
            })),
          ]),
          ...gpsPoints.map((g, i) => ({ id: `geo:${i}`, type: "Location", label: `${g.lat.toFixed(3)}, ${g.lon.toFixed(3)}`, ...g })),
        ],
        edges: [
          ...accounts.map(a => ({ from: "subject", to: `acc:${a.platform}`, rel: "HAS_ACCOUNT" })),
          ...breachResults.flatMap((b: any) => [
            { from: "subject", to: `email:${b.email}`, rel: "OWNS" },
            ...((b.Breaches ?? b.breaches ?? []) as any[]).map((_: any, i: number) => ({
              from: `email:${b.email}`, to: `breach:${b.email}:${i}`, rel: "EXPOSED_IN",
            })),
          ]),
          ...gpsPoints.map((_, i) => ({ from: "subject", to: `geo:${i}`, rel: "VISITED" })),
        ],
      };

      const report = await synthesize(graph, subject);

      const { data: updated, error: upErr } = await supa.from("eagle_eye_targets").update({
        accounts, contacts: { breaches: breachResults }, graph, report, status: "complete",
      }).eq("id", row.id).select().single();
      if (upErr) throw upErr;

      return new Response(JSON.stringify({ target: updated }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "list") {
      const { data } = await supa.from("eagle_eye_targets").select("*").order("created_at", { ascending: false }).limit(50);
      return new Response(JSON.stringify({ targets: data ?? [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "get" && target_id) {
      const { data } = await supa.from("eagle_eye_targets").select("*").eq("id", target_id).single();
      return new Response(JSON.stringify({ target: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "unknown action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
