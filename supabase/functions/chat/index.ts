/**
 * Belicia — Supabase Edge Function: chat/index.ts
 *
 * Architecture: thin auth + routing proxy.
 * Heavy work (ChromaDB, embeddings, model calls) stays in FastAPI.
 * This function: authenticates, enriches headers, streams response back.
 *
 * Model: claude-opus-4-7 (current flagship as of May 2026)
 */

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

// ─── Constants ───────────────────────────────────────────────────────────────

const DEFAULT_MODEL = Deno.env.get("DEFAULT_MODEL") ?? "claude-opus-4-7";
const FASTAPI_URL   = Deno.env.get("FASTAPI_URL") ?? "";
const FASTAPI_SECRET = Deno.env.get("FASTAPI_SECRET") ?? "";
const DIRECT_KEY    = Deno.env.get("DIRECT_ANTHROPIC_KEY") ?? Deno.env.get("ANTHROPIC_API_KEY") ?? "";

const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VER = "2023-06-01";

const REQUEST_TIMEOUT_MS = 120_000;
const MAX_HISTORY_TOKENS_EST = 12_000;

// ─── CORS helpers ────────────────────────────────────────────────────────────

const CORS_HEADERS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-room-id, x-agent-mode",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function corsPreflightResponse(): Response {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

function jsonError(msg: string, status = 400): Response {
  return new Response(
    JSON.stringify({ error: msg }),
    { status, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
  );
}

// ─── Token estimator ────────────────────────────────────────────────────────

function estimateTokens(messages: ChatMessage[]): number {
  return messages.reduce((acc, m) => {
    const text = typeof m.content === "string" ? m.content : JSON.stringify(m.content);
    return acc + Math.ceil(text.length / 4);
  }, 0);
}

function trimHistory(messages: ChatMessage[], maxTokens: number): ChatMessage[] {
  const system  = messages.filter(m => m.role === "system");
  const convo   = messages.filter(m => m.role !== "system");

  let budget = maxTokens - estimateTokens(system);
  const kept: ChatMessage[] = [];

  for (let i = convo.length - 1; i >= 0; i--) {
    const t = estimateTokens([convo[i]]);
    if (budget - t < 0) break;
    budget -= t;
    kept.unshift(convo[i]);
  }

  return [...system, ...kept];
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface ChatMessage {
  role:    "system" | "user" | "assistant";
  content: string | unknown;
}

interface ChatRequest {
  messages:    ChatMessage[];
  model?:      string;
  stream?:     boolean;
  max_tokens?: number;
  temperature?: number;
  room_id?:   string;
  agent_mode?: string;
  use_rag?:   boolean;
}

// ─── Main handler ────────────────────────────────────────────────────────────

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return corsPreflightResponse();
  if (req.method !== "POST")    return jsonError("Method not allowed", 405);

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    return jsonError("Missing or malformed Authorization header", 401);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { auth: { persistSession: false } }
  );

  const token = authHeader.replace("Bearer ", "").trim();
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return jsonError("Unauthorized", 401);
  }

  let body: ChatRequest;
  try {
    body = await req.json() as ChatRequest;
  } catch {
    return jsonError("Invalid JSON body");
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return jsonError("messages array is required and must not be empty");
  }

  body.messages = trimHistory(body.messages, MAX_HISTORY_TOKENS_EST);

  body.model     = body.model ?? DEFAULT_MODEL;
  body.stream    = body.stream ?? true;
  body.max_tokens = body.max_tokens ?? 4096;

  if (FASTAPI_URL) {
    return await proxyToFastAPI(req, body, user.id);
  } else if (DIRECT_KEY) {
    return await callAnthropicDirect(body);
  } else {
    return jsonError(
      "No backend configured. Set FASTAPI_URL or DIRECT_ANTHROPIC_KEY in edge function secrets.",
      503
    );
  }
});

// ─── Route A: Proxy to FastAPI ────────────────────────────────────────────────

async function proxyToFastAPI(
  originalReq: Request,
  body: ChatRequest,
  userId: string
): Promise<Response> {
  const controller = new AbortController();
  const timeout    = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const roomId    = originalReq.headers.get("x-room-id")    ?? body.room_id    ?? "";
  const agentMode = originalReq.headers.get("x-agent-mode") ?? body.agent_mode ?? "";

  try {
    const upstream = await fetch(`${FASTAPI_URL}/chat`, {
      method:  "POST",
      signal:  controller.signal,
      headers: {
        "Content-Type":    "application/json",
        "X-User-Id":       userId,
        "X-Belicia-Token": FASTAPI_SECRET,
        "X-Room-Id":       roomId,
        "X-Agent-Mode":    agentMode,
      },
      body: JSON.stringify(body),
    });

    clearTimeout(timeout);

    if (!upstream.ok) {
      const errText = await upstream.text();
      return new Response(errText, {
        status: upstream.status,
        headers: {
          ...CORS_HEADERS,
          "Content-Type": upstream.headers.get("Content-Type") ?? "application/json",
        },
      });
    }

    return new Response(upstream.body, {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        "Content-Type":  upstream.headers.get("Content-Type") ?? "text/event-stream",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
      },
    });

  } catch (err) {
    clearTimeout(timeout);

    const isTimeout = (err as Error).name === "AbortError";

    if (DIRECT_KEY && !isTimeout) {
      console.warn("[belicia/chat] FastAPI unreachable, falling back to direct Anthropic call");
      return await callAnthropicDirect(body);
    }

    return jsonError(
      isTimeout ? "Request timed out" : `FastAPI error: ${(err as Error).message}`,
      isTimeout ? 504 : 502
    );
  }
}

// ─── Route B: Direct Anthropic ───────────────────────────────────────────────

async function callAnthropicDirect(body: ChatRequest): Promise<Response> {
  const controller = new AbortController();
  const timeout    = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const systemMessages = body.messages.filter(m => m.role === "system");
  const chatMessages   = body.messages.filter(m => m.role !== "system");

  const systemPrompt = systemMessages
    .map(m => (typeof m.content === "string" ? m.content : JSON.stringify(m.content)))
    .join("\n\n");

  const payload = {
    model:      body.model,
    max_tokens: body.max_tokens,
    temperature: body.temperature,
    stream:     body.stream,
    ...(systemPrompt ? { system: systemPrompt } : {}),
    messages:   chatMessages,
  };

  try {
    const anthropicRes = await fetch(ANTHROPIC_API, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type":   "application/json",
        "x-api-key":      DIRECT_KEY,
        "anthropic-version": ANTHROPIC_VER,
      },
      body: JSON.stringify(payload),
    });

    clearTimeout(timeout);

    return new Response(anthropicRes.body, {
      status: anthropicRes.status,
      headers: {
        ...CORS_HEADERS,
        "Content-Type":  anthropicRes.headers.get("Content-Type") ?? "text/event-stream",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
        "X-Belicia-Route": "direct",
      },
    });

  } catch (err) {
    clearTimeout(timeout);
    const isTimeout = (err as Error).name === "AbortError";
    return jsonError(
      isTimeout ? "Anthropic request timed out" : `Anthropic error: ${(err as Error).message}`,
      isTimeout ? 504 : 502
    );
  }
}
