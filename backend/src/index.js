/**
 * Selina's chatbot backend, STAGE 2.
 *
 * Working in this stage:
 *   GET  /health     -> { "status": "ok" }
 *   GET  /services   -> verified categories and services (unknown prices are null)
 *   GET  /locations  -> verified salon locations (or unavailable status if none)
 *   POST /chat       -> real Gemini reply grounded in structured business data
 *
 * Secrets live in Cloudflare, never in this file:
 *   GEMINI_API_KEY   (Secret)
 * Settings (plain text variables):
 *   ALLOWED_ORIGINS  e.g. https://mdsumanmandal01-ui.github.io
 *   GEMINI_MODEL     e.g. gemini-2.5-flash-lite
 *   MAX_MESSAGE_CHARS (optional, default 1000)
 *   AI_TIMEOUT_MS     (optional, default 20000)
 */

import {
  BUSINESS_DATA,
  buildSystemInstruction,
  getPublicServices,
  getPublicLocations,
} from "./data/business.js";

const DEFAULT_MODEL = "gemini-2.5-flash-lite";
const DEFAULT_MAX_MESSAGE_CHARS = 1000;
const DEFAULT_AI_TIMEOUT_MS = 20000;
const MAX_BODY_CHARS = 20000;
const MAX_HISTORY_TURNS = 10;
const MAX_HISTORY_TURN_CHARS = 2000;
const MAX_OUTPUT_TOKENS = 1024;

const SYSTEM_INSTRUCTION = buildSystemInstruction(BUSINESS_DATA);

/* ------------------------------------------------------------------
 * Small helpers
 * ------------------------------------------------------------------ */

function newUuid() {
  if (typeof globalThis.crypto !== "undefined" && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function allowedOrigins(env) {
  return String(env.ALLOWED_ORIGINS || "")
    .split(",")
    .map(function (s) { return s.trim().replace(/\/+$/, ""); })
    .filter(Boolean);
}

function isAllowedOrigin(origin, env) {
  return Boolean(origin) && allowedOrigins(env).includes(origin);
}

function corsHeaders(origin, env) {
  if (!isAllowedOrigin(origin, env)) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function json(body, status, cors) {
  return new Response(JSON.stringify(body), {
    status: status,
    headers: Object.assign(
      {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
      cors || {}
    ),
  });
}

function fail(status, code, message, cors) {
  return json({ error: { code: code, message: message } }, status, cors);
}

function log(event, data) {
  console.log(JSON.stringify(Object.assign({ event: event }, data)));
}

function positiveInt(value, fallback) {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function cleanHistory(input) {
  if (!Array.isArray(input)) return [];
  const turns = [];
  const slice = input.slice(-MAX_HISTORY_TURNS);
  for (let i = 0; i < slice.length; i++) {
    const t = slice[i];
    if (!t || typeof t !== "object") continue;
    const role = t.role === "user" || t.role === "model" ? t.role : null;
    const text = typeof t.text === "string" ? t.text.trim().slice(0, MAX_HISTORY_TURN_CHARS) : "";
    if (role && text) turns.push({ role: role, text: text });
  }
  while (turns.length && turns[0].role !== "user") turns.shift();
  return turns;
}

/* ------------------------------------------------------------------
 * Gemini call
 * ------------------------------------------------------------------ */

async function askGemini(params) {
  const env = params.env;
  const message = params.message;
  const history = params.history;

  const model = /^[a-z0-9.\-]+$/i.test(env.GEMINI_MODEL || "") ? env.GEMINI_MODEL : DEFAULT_MODEL;
  const url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent";
  const controller = new AbortController();
  const timer = setTimeout(function () { controller.abort(); }, positiveInt(env.AI_TIMEOUT_MS, DEFAULT_AI_TIMEOUT_MS));

  const contents = [];
  for (let i = 0; i < history.length; i++) {
    contents.push({ role: history[i].role, parts: [{ text: history[i].text }] });
  }
  contents.push({ role: "user", parts: [{ text: message }] });

  const body = {
    systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
    contents: contents,
    generationConfig: { temperature: 0.3, maxOutputTokens: MAX_OUTPUT_TOKENS },
  };

  const started = Date.now();
  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err) {
    const timedOut = err && err.name === "AbortError";
    log("gemini_network_error", { timedOut: timedOut, ms: Date.now() - started });
    return { ok: false, kind: timedOut ? "timeout" : "network" };
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    log("gemini_http_error", { status: res.status, ms: Date.now() - started });
    return { ok: false, kind: res.status === 429 ? "rate_limited" : "provider_error" };
  }

  let data;
  try {
    data = await res.json();
  } catch (err) {
    log("gemini_bad_json", {});
    return { ok: false, kind: "provider_error" };
  }

  const parts =
    data &&
    data.candidates &&
    data.candidates[0] &&
    data.candidates[0].content &&
    data.candidates[0].content.parts;
  const reply = Array.isArray(parts)
    ? parts.map(function (p) { return typeof p.text === "string" ? p.text : ""; }).join("").trim()
    : "";
  if (!reply) {
    log("gemini_empty_reply", { blocked: Boolean(data && data.promptFeedback && data.promptFeedback.blockReason) });
    return { ok: false, kind: "empty" };
  }
  log("gemini_ok", { ms: Date.now() - started, chars: reply.length });
  return { ok: true, reply: reply };
}

/* ------------------------------------------------------------------
 * Routes
 * ------------------------------------------------------------------ */

function checkReadOrigin(request, env, cors) {
  const origin = request.headers.get("Origin");
  if (origin && !isAllowedOrigin(origin, env)) {
    return fail(403, "forbidden_origin", "This website is not allowed to use this service.", cors);
  }
  return null;
}

async function handleChat(request, env, cors) {
  const origin = request.headers.get("Origin");
  if (!isAllowedOrigin(origin, env)) {
    return fail(403, "forbidden_origin", "This website is not allowed to use the chat service.", cors);
  }

  const contentType = request.headers.get("Content-Type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return fail(415, "unsupported_media_type", "Please send JSON.", cors);
  }

  const declared = Number(request.headers.get("Content-Length") || 0);
  if (declared > MAX_BODY_CHARS) return fail(413, "request_too_large", "The request is too large.", cors);
  const raw = await request.text();
  if (raw.length > MAX_BODY_CHARS) return fail(413, "request_too_large", "The request is too large.", cors);

  let payload;
  try {
    payload = JSON.parse(raw);
  } catch (err) {
    return fail(400, "invalid_json", "The request was not valid JSON.", cors);
  }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return fail(400, "invalid_request", "The request must be a JSON object.", cors);
  }

  const message = typeof payload.message === "string" ? payload.message.trim() : "";
  if (!message) return fail(400, "empty_message", "Please type a message.", cors);
  const maxChars = positiveInt(env.MAX_MESSAGE_CHARS, DEFAULT_MAX_MESSAGE_CHARS);
  if (message.length > maxChars) {
    return fail(413, "message_too_long", "Please keep your message under " + maxChars + " characters.", cors);
  }

  const rawId = typeof payload.conversationId === "string" ? payload.conversationId : payload.sessionId;
  const conversationId =
    typeof rawId === "string" && /^[A-Za-z0-9_-]{8,64}$/.test(rawId) ? rawId : newUuid();

  if (!env.GEMINI_API_KEY) {
    log("missing_secret", { name: "GEMINI_API_KEY" });
    return fail(503, "ai_not_configured", "The assistant is not available right now. Please contact the salon directly.", cors);
  }

  const result = await askGemini({ env: env, message: message, history: cleanHistory(payload.history) });
  if (!result.ok) {
    const map = {
      timeout: [504, "ai_timeout", "The assistant took too long to reply. Please try again."],
      rate_limited: [429, "ai_busy", "The assistant is busy right now. Please try again in a minute."],
      network: [502, "ai_unavailable", "The assistant is unavailable right now. Please try again."],
      provider_error: [502, "ai_unavailable", "The assistant is unavailable right now. Please try again."],
      empty: [502, "ai_no_reply", "The assistant couldn't produce a reply. Please rephrase and try again."],
    };
    const tuple = map[result.kind] || map.provider_error;
    return fail(tuple[0], tuple[1], tuple[2], cors);
  }

  return json({ reply: result.reply, conversationId: conversationId }, 200, cors);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin");
    const cors = corsHeaders(origin, env);

    try {
      if (request.method === "OPTIONS") {
        if (!isAllowedOrigin(origin, env)) return new Response(null, { status: 403 });
        return new Response(null, { status: 204, headers: cors });
      }

      if (url.pathname === "/health") {
        if (request.method !== "GET") return fail(405, "method_not_allowed", "Use GET.", cors);
        return json({ status: "ok" }, 200, cors);
      }

      if (url.pathname === "/services") {
        if (request.method !== "GET") return fail(405, "method_not_allowed", "Use GET.", cors);
        const blocked = checkReadOrigin(request, env, cors);
        if (blocked) return blocked;
        return json(getPublicServices(BUSINESS_DATA), 200, cors);
      }

      if (url.pathname === "/locations") {
        if (request.method !== "GET") return fail(405, "method_not_allowed", "Use GET.", cors);
        const blocked = checkReadOrigin(request, env, cors);
        if (blocked) return blocked;
        return json(getPublicLocations(BUSINESS_DATA), 200, cors);
      }

      if (url.pathname === "/chat") {
        if (request.method !== "POST") return fail(405, "method_not_allowed", "Use POST.", cors);
        return await handleChat(request, env, cors);
      }

      return fail(404, "not_found", "Not found.", cors);
    } catch (err) {
      log("unhandled_error", { name: err && err.name });
      return fail(500, "server_error", "Something went wrong. Please try again.", cors);
    }
  },
};
                              
