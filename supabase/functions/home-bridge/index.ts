import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SCENES: Record<string, Record<string, unknown>> = {
  focus_mode:       { lights: "dim_warm",        pemf: "40hz_gamma",    dnd: true },
  prayer_mode:      { lights: "off_except_ambient", pemf: "schumann_7hz", silence: true },
  sleep_mode:       { lights: "off",             pemf: "delta_2hz",     thermostat: -1 },
  morning_energize: { lights: "bright_cool",     pemf: "10hz_alpha",    play: "adhan" },
  recovery_mode:    { lights: "dim_amber",       pemf: "8hz_theta",     dnd: true },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { userId = "default", command } = await req.json();
    if (!command?.type || !command?.action) {
      return new Response(JSON.stringify({ error: "command.type and command.action required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const haUrl = Deno.env.get("HOME_ASSISTANT_WEBHOOK_URL");
    const pemfUrl = Deno.env.get("PEMF_CONTROLLER_URL");
    const executed: string[] = [];
    let payload: Record<string, unknown> = {};

    if (command.type === "scene") {
      payload = SCENES[command.action] ?? {};
      if (haUrl) {
        try {
          await fetch(haUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ scene: command.action, ...payload }),
          });
          executed.push("home_assistant");
        } catch (_) { /* ignore */ }
      }
      if (pemfUrl && payload.pemf) {
        try {
          await fetch(pemfUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ protocol: payload.pemf }),
          });
          executed.push("pemf_controller");
        } catch (_) { /* ignore */ }
      }
    } else if (command.type === "device" || command.type === "pemf_protocol") {
      const target = command.type === "pemf_protocol" ? pemfUrl : haUrl;
      if (target) {
        try {
          await fetch(target, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: command.action, ...(command.params ?? {}) }),
          });
          executed.push(command.type);
        } catch (_) { /* ignore */ }
      }
    }

    await supabase.from("home_commands").insert({
      user_id: userId,
      command: { ...command, payload },
      status: executed.length ? "executed" : "noop",
    });

    return new Response(JSON.stringify({ success: true, executed, scene: payload }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
