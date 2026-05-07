import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function getFajrTime(lat: number, lng: number): Promise<string | null> {
  try {
    const r = await fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=2`);
    const d = await r.json();
    return d?.data?.timings?.Fajr ?? null;
  } catch { return null; }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: profiles } = await supabase.from("belicia_profile").select("*");
    const results: any[] = [];

    for (const profile of profiles ?? []) {
      const userId = profile.user_id;
      const fajr = profile.prayer_location?.lat
        ? await getFajrTime(profile.prayer_location.lat, profile.prayer_location.lng)
        : null;

      const { data: memories } = await supabase
        .from("belicia_memory")
        .select("role, content, importance")
        .eq("user_id", userId)
        .order("importance", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(5);

      const pemf = profile.current_pemf_state;
      const name = profile.display_name ?? profile.name ?? "friend";
      const missions = JSON.stringify(profile.active_missions ?? []);
      const strategic = profile.strategic_context ?? "—";
      const memoryLines = (memories ?? []).map((m: any) => `- ${m.content.slice(0, 120)}`).join("\n");

      const prompt = `Generate a morning brief for ${name}.
Active missions: ${missions}
Strategic context: ${strategic}
${pemf ? `Biofield: coherence ${pemf.coherenceScore}/100 (${pemf.recoveryState})` : ""}
Recent themes:
${memoryLines}

Structure:
1. One ayah or hadith relevant to their situation (cite source)
2. One strategic reflection on their mission (2-3 sentences)
3. One practical intention for today (single sentence)
${pemf ? "4. Biofield guidance based on PEMF state (one sentence)" : ""}

Total under 150 words. Speak directly to ${name}.`;

      const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: "You are Belicia — a spiritually-grounded AI rooted in the Bayt al-Hikmah tradition. Be direct, warm, brief, real." },
            { role: "user", content: prompt },
          ],
        }),
      });

      if (!aiResp.ok) {
        results.push({ userId, error: await aiResp.text() });
        continue;
      }
      const aiData = await aiResp.json();
      const content = aiData.choices?.[0]?.message?.content ?? "";

      const { data: brief } = await supabase.from("scheduled_briefs").insert({
        user_id: userId,
        brief_type: "morning",
        content,
        delivery_channel: profile.push_subscription ? "push" : "silent",
        status: "delivered",
        delivered_at: new Date().toISOString(),
        scheduled_for: new Date().toISOString(),
      }).select("id").single();

      results.push({ userId, briefId: brief?.id, fajr });
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
