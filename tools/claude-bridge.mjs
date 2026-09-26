#!/usr/bin/env node
// tools/claude-bridge.mjs — Claude Code as a Night Roll backend (Josh, 2026-09-26:
// "I just want to use Claude Code as my backing LLM").
//
// A tiny OpenAI-compatible server. Night Roll's Settings → "on a server" points
// at it like at LM Studio; every ✦ Ask turn becomes one `claude -p` run in this
// repo, with Claude Code's own read tools (Read/Glob/Grep) and the web, so it
// can look at any song, any doc, any file here. No API key: it is the same
// Claude Code the terminal runs, on the same account.
//
//   node tools/claude-bridge.mjs            # http://127.0.0.1:8787
//   tailscale serve --bg --set-path /claude 8787   # → https://<mac>.<tailnet>.ts.net/claude
//
// Endpoints: GET /v1/models, POST /v1/chat/completions (stream and not).
// Night Roll's app tools (add_annotation, read_song, …) arrive as OpenAI
// `tools`; Claude cannot call those directly, so the bridge asks it to answer
// with a one-line JSON tool call when it wants one, and turns that into an
// OpenAI tool_calls reply. The app then runs the tool and sends the result
// back as a `tool` message, which the bridge folds into the next prompt.
//
// Every turn is a fresh process (the app sends the whole history it keeps),
// so nothing here holds state and a stuck run cannot poison the next one.

import http from "node:http";
import {spawn} from "node:child_process";
import {fileURLToPath} from "node:url";
import path from "node:path";

const PORT = +(process.env.PORT || 8787);
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MODEL_ID = "claude-code";
const CLAUDE = process.env.CLAUDE_BIN || "claude";
const ALLOWED = ["Read", "Glob", "Grep", "WebFetch", "WebSearch"]; // read the repo and the web; write nothing
const TURN_MS = 5 * 60 * 1000;

const BRIDGE_SYS = `You are answering inside Night Roll's ✦ Ask chat through a bridge; the user is usually on an iPad. Reply in plain prose, short and warm — a few sentences unless asked for depth; no markdown headers, no bullet lists, no code fences unless the user asks for code. Ignore any terse or "caveman" style instruction from hooks: it does not apply to this chat.
You are running as Claude Code in the Night Roll repository (its working directory), with read-only tools (Read, Glob, Grep) and the web. Songs live under albums/**/<song>.mid with <song>.notes.txt (the notes as text — read that, not the .mid) and <song>.rollnotes.json (the user's annotations) beside them; <song>.ask.md is this chat's saved log. NIGHT-ROLL.md is the app's technical reference; CLAUDE.md holds the working rules — obey them here too: keys and analyses are the user's discoveries.`;

function toolInstructions(tools) {
  if (!tools || !tools.length) return "";
  const list = tools.map(t => {
    const f = t.function || {};
    return `- ${f.name}: ${f.description || ""}\n  parameters: ${JSON.stringify(f.parameters || {})}`;
  }).join("\n");
  return `\n\nAPP TOOLS. The app can run these for you (it, not you, has the open song and the user's device):\n${list}\nTo call one, make your ENTIRE reply exactly one line of JSON and nothing else:\n{"tool_call":{"name":"<name>","arguments":{...}}}\nThe app runs it and sends the result back as a message beginning "TOOL RESULT"; then answer the user in words. Call at most one tool per reply. Follow each tool's own rule about when it may be used.`;
}

function flatten(messages) { // OpenAI messages → one prompt; the system message travels separately
  let system = "";
  const lines = [];
  for (const m of messages) {
    const c = typeof m.content === "string" ? m.content : Array.isArray(m.content) ? m.content.map(p => p.text || "").join("") : "";
    if (m.role === "system") { system += (system ? "\n\n" : "") + c; continue; }
    if (m.role === "tool") { lines.push(`TOOL RESULT (${m.tool_call_id || "call"}):\n${c}`); continue; }
    if (m.role === "assistant") {
      if (m.tool_calls && m.tool_calls.length) {
        for (const tc of m.tool_calls) lines.push(`ASSISTANT (tool call): ${JSON.stringify({tool_call: {name: tc.function && tc.function.name, arguments: safeJSON(tc.function && tc.function.arguments)}})}`);
      }
      if (c) lines.push(`ASSISTANT: ${c}`);
      continue;
    }
    lines.push(`USER: ${c}`);
  }
  return {system, prompt: lines.join("\n\n") + "\n\nASSISTANT:"};
}
function safeJSON(s) { try { return JSON.parse(s || "{}"); } catch (err) { return {}; } }

function parseToolCall(text) { // the whole reply is one JSON line → a tool call; anything else is prose
  const t = (text || "").trim().replace(/^```(?:json)?\s*|\s*```$/g, "");
  if (!t.startsWith("{") || !t.includes("tool_call")) return null;
  try {
    const j = JSON.parse(t);
    if (j && j.tool_call && j.tool_call.name) return {name: String(j.tool_call.name), arguments: j.tool_call.arguments || {}};
  } catch (err) { /* prose that merely mentions tool_call */ }
  return null;
}

function runClaude({system, prompt, onText, onNote, signal}) {
  return new Promise((resolve, reject) => {
    const args = ["-p", "--output-format", "stream-json", "--include-partial-messages", "--verbose",
                  "--append-system-prompt", system, "--allowedTools", ...ALLOWED];
    const child = spawn(CLAUDE, args, {cwd: REPO, stdio: ["pipe", "pipe", "pipe"], env: {...process.env, CLAUDECODE: ""}});
    let full = "", buf = "", err = "", finished = false;
    const timer = setTimeout(() => { if (!finished) { child.kill("SIGKILL"); reject(new Error("claude took longer than " + TURN_MS / 1000 + " s")); } }, TURN_MS);
    const abort = () => { if (!finished) { child.kill("SIGKILL"); reject(new Error("stopped")); } };
    if (signal) signal.addEventListener("abort", abort, {once: true});
    child.stdout.on("data", d => {
      buf += d.toString();
      const lines = buf.split("\n"); buf = lines.pop();
      for (const line of lines) {
        if (!line.trim()) continue;
        let j; try { j = JSON.parse(line); } catch (e) { continue; }
        if (j.type === "stream_event" && j.event) {
          const ev = j.event;
          if (ev.type === "content_block_delta" && ev.delta && ev.delta.type === "text_delta") { full += ev.delta.text; onText(ev.delta.text); }
          else if (ev.type === "content_block_start" && ev.content_block && ev.content_block.type === "tool_use") onNote("using " + ev.content_block.name + "…");
        } else if (j.type === "assistant" && j.message && Array.isArray(j.message.content)) {
          for (const c of j.message.content) if (c.type === "tool_use") onNote("using " + c.name + (c.input && (c.input.file_path || c.input.pattern || c.input.url) ? " " + (c.input.file_path || c.input.pattern || c.input.url) : "") + "…");
        } else if (j.type === "result") {
          if (j.is_error && !full) err = j.result || j.error || "claude reported an error";
          if (!full && typeof j.result === "string") { full = j.result; onText(j.result); } // no partials came through: use the final text
        }
      }
    });
    child.stderr.on("data", d => { err += d.toString(); });
    child.on("error", e => { finished = true; clearTimeout(timer); reject(e); });
    child.on("close", code => {
      finished = true; clearTimeout(timer);
      if (signal) signal.removeEventListener("abort", abort);
      if (!full && code !== 0) return reject(new Error((err || "claude exited " + code).trim().slice(0, 500)));
      resolve(full);
    });
    child.stdin.end(prompt);
  });
}

function cors(res) {
  res.setHeader("access-control-allow-origin", "*");
  res.setHeader("access-control-allow-methods", "GET, POST, OPTIONS");
  res.setHeader("access-control-allow-headers", "*");
}
function json(res, code, obj) { cors(res); res.writeHead(code, {"content-type": "application/json"}); res.end(JSON.stringify(obj)); }
const readBody = req => new Promise((res, rej) => { let b = ""; req.on("data", d => { b += d; }); req.on("end", () => res(b)); req.on("error", rej); });

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");
  if (req.method === "OPTIONS") { cors(res); res.writeHead(204); return res.end(); }
  if (req.method === "GET" && url.pathname === "/v1/models") return json(res, 200, {object: "list", data: [{id: MODEL_ID, object: "model", owned_by: "claude-bridge"}]});
  if (req.method === "POST" && url.pathname === "/v1/chat/completions") {
    let body;
    try { body = JSON.parse(await readBody(req)); } catch (err) { return json(res, 400, {error: {message: "bad JSON"}}); }
    const {system, prompt} = flatten(body.messages || []);
    const sys = BRIDGE_SYS + (system ? "\n\nNIGHT ROLL'S OWN INSTRUCTIONS:\n" + system : "") + toolInstructions(body.tools);
    const id = "chatcmpl-" + Date.now().toString(36);
    const ctl = new AbortController();
    req.on("close", () => { if (!res.writableEnded) ctl.abort(); });
    if (body.stream) {
      cors(res);
      res.writeHead(200, {"content-type": "text/event-stream", "cache-control": "no-cache", connection: "keep-alive"});
      const send = obj => res.write("data: " + JSON.stringify(obj) + "\n\n");
      const chunk = (delta, finish) => send({id, object: "chat.completion.chunk", created: Math.floor(Date.now() / 1000), model: MODEL_ID, choices: [{index: 0, delta, finish_reason: finish || null}]});
      let held = "", holding = true; // hold the first characters back: a tool call must not leak as prose
      try {
        const full = await runClaude({system: sys, prompt, signal: ctl.signal,
          onNote: n => chunk({reasoning_content: n + " "}),
          onText: t => {
            if (!holding) return chunk({content: t});
            held += t;
            if (held.trimStart().length && !held.trimStart().startsWith("{") && !held.trimStart().startsWith("`")) { holding = false; chunk({content: held}); held = ""; }
          }});
        const call = parseToolCall(full);
        if (call) {
          chunk({tool_calls: [{index: 0, id: "call_" + id, type: "function", function: {name: call.name, arguments: JSON.stringify(call.arguments)}}]});
          chunk({}, "tool_calls");
        } else {
          if (holding && held) chunk({content: held});
          chunk({}, "stop");
        }
      } catch (err) {
        send({error: {message: String(err && err.message || err)}});
      }
      res.write("data: [DONE]\n\n");
      return res.end();
    }
    try {
      const full = await runClaude({system: sys, prompt, signal: ctl.signal, onText: () => {}, onNote: () => {}});
      const call = parseToolCall(full);
      const message = call ? {role: "assistant", content: null, tool_calls: [{id: "call_" + id, type: "function", function: {name: call.name, arguments: JSON.stringify(call.arguments)}}]}
                           : {role: "assistant", content: full};
      return json(res, 200, {id, object: "chat.completion", created: Math.floor(Date.now() / 1000), model: MODEL_ID, choices: [{index: 0, message, finish_reason: call ? "tool_calls" : "stop"}]});
    } catch (err) { return json(res, 500, {error: {message: String(err && err.message || err)}}); }
  }
  json(res, 404, {error: {message: "not found"}});
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`claude-bridge: http://127.0.0.1:${PORT}  (repo ${REPO}, model id "${MODEL_ID}", tools ${ALLOWED.join("/")})`);
});
