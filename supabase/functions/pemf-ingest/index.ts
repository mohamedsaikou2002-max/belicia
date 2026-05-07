import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function recoveryFromCoherence(c: number): string {
  if (c < 30) return "depleted";
  if (c < 56) return "recovering";
  if (c < 80) return "optimal";
  return "peak";
}

function recommendation(state: string): string {
  switch (state) {
    case "depleted": return "Your field requires stillness. Defer non-essential decisions.";
    case "recovering": return "Re-stabilize with breath-dhikr. Light tasks only.";
    case "optimal": return "Field is steady. Engage your work with focus.";
    case "peak": return "Coherence is high. This is your window. Move on the mission.";
    default: return "";
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { userId = "default", apiKey, readings } = await req.json();
    const expected = Deno.env.get("PEMF_DEVICE_KEY");
    if (expected && apiKey !== expected) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!readings || typeof readings.coherence_score !== "number") {
      return new Response(JSON.stringify({ error: "invalid readings" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const recovery_state = recoveryFromCoherence(readings.coherence_score);

    await supabase.from("pemf_readings").insert({
      user_id: userId,
      hrv_score: readings.hrv_score,
      coherence_score: readings.coherence_score,
      stress_index: readings.stress_index,
      recovery_state,
      dominant_frequency: readings.dominant_frequency,
      ambient_field_delta: readings.ambient_field_delta,
      session_type: readings.session_type ?? "passive",
      raw_data: readings.raw_data ?? {},
    });

    if (readings.coherence_score < 40 && (readings.stress_index ?? 0) > 70) {
      await supabase.from("scheduled_briefs").insert({
        user_id: userId,
        brief_type: "recovery_alert",
        content: "Coherence is low and stress is elevated. Step away. Breath-dhikr × 5 minutes.",
        delivery_channel: "push",
        status: "pending",
        scheduled_for: new Date().toISOString(),
      });
    }

    await supabase.from("belicia_profile")
      .update({
        current_pemf_state: {
          coherenceScore: readings.coherence_score,
          recoveryState: recovery_state,
          hrvScore: readings.hrv_score,
          updatedAt: new Date().toISOString(),
        },
      })
      .eq("user_id", userId);

    return new Response(JSON.stringify({
      success: true,
      recoveryState: recovery_state,
      recommendation: recommendation(recovery_state),
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
