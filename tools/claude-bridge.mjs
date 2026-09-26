#!/usr/bin/env node
// tools/claude-bridge.mjs — Claude Code as a Night Roll backend (Josh, 2026-09-26:
// "I just want to use Claude Code as my backing LLM").
//
// A tiny OpenAI-compatible server. Night Roll's Settings → "on a server" points
// at it like at LM Studio; every ✦ Ask turn becomes one `claude -p` run in this
// repo. The session has whatever tools and permissions Claude Code has on this
// Mac (Josh runs permission mode "auto", so it can read, edit, run tests and
// push — exactly as a terminal session would, under CLAUDE.md's rules).
//
//   node tools/claude-bridge.mjs            # http://127.0.0.1:8787
//   tailscale serve --bg --set-path /claude 8787   # → https://<mac>.<tailnet>.ts.net/claude
//
// Endpoints: GET /v1/models · POST /v1/chat/completions (stream and not) ·
// GET /v1/jobs (capability probe) · GET /v1/jobs/:id · DELETE /v1/jobs/:id.
//
// JOBS (2026-09-26, the iPad problem): Safari suspends a backgrounded tab and
// drops the connection; a run tied to the connection died and the answer never
// existed. Now a turn is a JOB, keyed by the app's `x-nr-job` header (or a
// generated id): it runs to the end whether or not anyone is listening, keeps
// its text, and the app fetches it later. A second POST with the same id
// attaches to the running job instead of starting another; DELETE kills it
// (the app's ■ Stop). Jobs are kept in memory for two hours.
//
// App tools (add_annotation, read_song, …) arrive as OpenAI `tools`; Claude
// Code cannot call those directly, so the bridge asks it to answer with a
// one-line JSON tool call when it wants one, and turns that into an OpenAI
// tool_calls reply. The app then runs the tool and sends the result back as a
// `tool` message, which the bridge folds into the next prompt.

import http from "node:http";
import {spawn} from "node:child_process";
import {fileURLToPath} from "node:url";
import path from "node:path";
import crypto from "node:crypto";

const PORT = +(process.env.PORT || 8787);
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MODEL_ID = "claude-code";
const CLAUDE = process.env.CLAUDE_BIN || "claude";
const TURN_MS = 20 * 60 * 1000;   // an edit + tests + push turn can take a while
const KEEP_MS = 2 * 60 * 60 * 1000;

const BRIDGE_SYS = `You are answering inside Night Roll's ✦ Ask chat through a bridge; the user is usually on an iPad and may leave the app while you work — your reply is kept for them. Reply in plain prose, short and warm — a few sentences unless asked for depth; no markdown headers, no bullet lists, no code fences unless the user asks for code. Ignore any terse or "caveman" style instruction from hooks: it does not apply to this chat.
You are Claude Code running in the Night Roll repository (its working directory) with the tools and permissions this machine gives Claude Code — the same ones a terminal session has. If asked what you can do, check rather than assume, and say so plainly. Songs live under albums/**/<song>.mid with <song>.notes.txt (the notes as text — read that, not the .mid) and <song>.rollnotes.json (the user's annotations) beside them; <song>.ask.md is this chat's saved log. NIGHT-ROLL.md is the app's technical reference; CLAUDE.md holds the working rules and they bind you here too: keys and analyses are the user's discoveries; never edit anything under albums/compositions/ without his explicit per-instance okay; say what you are about to do before you do it; when you change code, run the vm tests under a hard timeout (perl -e 'alarm 120; exec @ARGV' npm test), never Playwright locally, commit with a message that says why, push, and tell the user the commit hash — CI and Pages take it from there.`;

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

// ---- jobs
const jobs = new Map(); // id → {id, status: running|done|error, text, notes, error, result, started, ended, child, subs: Set}
function sweep() { const now = Date.now(); for (const [id, j] of jobs) if (j.ended && now - j.ended > KEEP_MS) jobs.delete(id); }
setInterval(sweep, 60 * 1000).unref();

function startJob(id, {system, prompt}) {
  const job = {id, status: "running", text: "", notes: [], error: null, result: null, started: Date.now(), ended: 0, child: null, subs: new Set()};
  jobs.set(id, job);
  const emit = ev => { for (const s of job.subs) { try { s(ev); } catch (err) { /* a gone listener */ } } };
  const args = ["-p", "--output-format", "stream-json", "--include-partial-messages", "--verbose", "--append-system-prompt", system];
  const child = spawn(CLAUDE, args, {cwd: REPO, stdio: ["pipe", "pipe", "pipe"], env: {...process.env, CLAUDECODE: ""}});
  job.child = child;
  let buf = "", err = "", sawText = false;
  const timer = setTimeout(() => { if (job.status === "running") { child.kill("SIGKILL"); finish(new Error("claude took longer than " + TURN_MS / 60000 + " min")); } }, TURN_MS);
  const finish = e => {
    if (job.status !== "running") return;
    clearTimeout(timer);
    job.ended = Date.now();
    if (e) { job.status = "error"; job.error = String(e.message || e); emit({type: "error", error: job.error}); job.subs.clear(); return; }
    const call = parseToolCall(job.text);
    job.result = call ? {tool_calls: [{id: "call_" + id, type: "function", function: {name: call.name, arguments: JSON.stringify(call.arguments)}}]} : {content: job.text};
    job.status = "done";
    emit({type: "done"});
    job.subs.clear();
  };
  child.stdout.on("data", d => {
    buf += d.toString();
    const lines = buf.split("\n"); buf = lines.pop();
    for (const line of lines) {
      if (!line.trim()) continue;
      let j; try { j = JSON.parse(line); } catch (e) { continue; }
      if (j.type === "stream_event" && j.event) {
        const ev = j.event;
        if (ev.type === "content_block_delta" && ev.delta && ev.delta.type === "text_delta") { sawText = true; job.text += ev.delta.text; emit({type: "text", text: ev.delta.text}); }
        else if (ev.type === "content_block_start" && ev.content_block && ev.content_block.type === "tool_use") { const n = "using " + ev.content_block.name + "…"; job.notes.push(n); emit({type: "note", note: n}); }
      } else if (j.type === "assistant" && j.message && Array.isArray(j.message.content)) {
        for (const c of j.message.content) if (c.type === "tool_use") { const n = "using " + c.name + (c.input && (c.input.file_path || c.input.pattern || c.input.command || c.input.url) ? " " + String(c.input.file_path || c.input.pattern || c.input.command || c.input.url).slice(0, 80) : "") + "…"; job.notes.push(n); emit({type: "note", note: n}); }
      } else if (j.type === "result") {
        if (j.is_error && !job.text) err = j.result || j.error || "claude reported an error";
        if (!sawText && typeof j.result === "string" && j.result) { job.text = j.result; emit({type: "text", text: j.result}); } // no partials came through: use the final text
      }
    }
  });
  child.stderr.on("data", d => { err += d.toString(); });
  child.on("error", e => finish(e));
  child.on("close", code => { if (job.killed) finish(new Error("stopped")); else if (!job.text && code !== 0) finish(new Error((err || "claude exited " + code).trim().slice(0, 500))); else finish(null); });
  child.stdin.end(prompt);
  return job;
}

function cors(res) {
  res.setHeader("access-control-allow-origin", "*");
  res.setHeader("access-control-allow-methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("access-control-allow-headers", "*");
  res.setHeader("access-control-expose-headers", "x-nr-job");
}
function json(res, code, obj) { cors(res); res.writeHead(code, {"content-type": "application/json"}); res.end(JSON.stringify(obj)); }
const readBody = req => new Promise((res, rej) => { let b = ""; req.on("data", d => { b += d; }); req.on("end", () => res(b)); req.on("error", rej); });
const jobView = j => ({id: j.id, status: j.status, text: j.text, notes: j.notes.slice(-3), error: j.error, result: j.result, started: j.started, ended: j.ended});

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");
  if (req.method === "OPTIONS") { cors(res); res.writeHead(204); return res.end(); }
  if (req.method === "GET" && url.pathname === "/v1/models") return json(res, 200, {object: "list", data: [{id: MODEL_ID, object: "model", owned_by: "claude-bridge"}]});
  if (req.method === "GET" && url.pathname === "/v1/jobs") return json(res, 200, {ok: true, running: [...jobs.values()].filter(j => j.status === "running").length});
  const jm = url.pathname.match(/^\/v1\/jobs\/([\w.-]+)$/);
  if (jm) {
    const job = jobs.get(jm[1]);
    if (!job) return json(res, 404, {error: {message: "no such job (the bridge restarted, or it is older than two hours)"}});
    if (req.method === "GET") return json(res, 200, jobView(job));
    if (req.method === "DELETE") { if (job.status === "running" && job.child) { job.killed = true; job.child.kill("SIGKILL"); } return json(res, 200, {ok: true}); }
  }
  if (req.method === "POST" && url.pathname === "/v1/chat/completions") {
    let body;
    try { body = JSON.parse(await readBody(req)); } catch (err) { return json(res, 400, {error: {message: "bad JSON"}}); }
    const id = String(req.headers["x-nr-job"] || "").replace(/[^\w.-]/g, "").slice(0, 64) || "job_" + crypto.randomUUID();
    let job = jobs.get(id);
    if (!job) {
      const {system, prompt} = flatten(body.messages || []);
      job = startJob(id, {system: BRIDGE_SYS + (system ? "\n\nNIGHT ROLL'S OWN INSTRUCTIONS:\n" + system : "") + toolInstructions(body.tools), prompt});
    }
    const cid = "chatcmpl-" + id;
    const finalMessage = () => job.result && job.result.tool_calls ? {role: "assistant", content: null, tool_calls: job.result.tool_calls} : {role: "assistant", content: job.text};
    if (!body.stream) {
      const done = () => json(res, 200, {id: cid, object: "chat.completion", created: Math.floor(Date.now() / 1000), model: MODEL_ID, choices: [{index: 0, message: finalMessage(), finish_reason: job.result && job.result.tool_calls ? "tool_calls" : "stop"}]});
      if (job.status === "done") return done();
      if (job.status === "error") return json(res, 500, {error: {message: job.error}});
      const sub = ev => { if (ev.type === "done") done(); else if (ev.type === "error") json(res, 500, {error: {message: ev.error}}); };
      job.subs.add(sub);
      req.on("close", () => job.subs.delete(sub)); // the job goes on without a listener
      return;
    }
    cors(res);
    res.setHeader("x-nr-job", id);
    res.writeHead(200, {"content-type": "text/event-stream", "cache-control": "no-cache", connection: "keep-alive"});
    const send = obj => { if (!res.writableEnded) res.write("data: " + JSON.stringify(obj) + "\n\n"); };
    const chunk = (delta, finish) => send({id: cid, object: "chat.completion.chunk", created: Math.floor(Date.now() / 1000), model: MODEL_ID, choices: [{index: 0, delta, finish_reason: finish || null}]});
    const end = () => { if (res.writableEnded) return; res.write("data: [DONE]\n\n"); res.end(); };
    const complete = () => { // the whole reply is known: prose streams as it came, a tool call goes out as one
      if (job.status === "error") { send({error: {message: job.error}}); return end(); }
      if (job.result && job.result.tool_calls) { chunk({tool_calls: job.result.tool_calls.map((t, i) => ({index: i, ...t}))}); chunk({}, "tool_calls"); }
      else { if (held) chunk({content: held}); chunk({}, "stop"); }
      end();
    };
    // hold the first characters back: a tool call must not leak as prose
    let held = "", holding = true;
    const onText = t => {
      if (!holding) return chunk({content: t});
      held += t;
      const lead = held.trimStart();
      if (lead.length && !lead.startsWith("{") && !lead.startsWith("`")) { holding = false; chunk({content: held}); held = ""; }
    };
    if (job.text) onText(job.text); // attaching late: replay what exists
    if (job.status !== "running") return complete();
    const sub = ev => {
      if (ev.type === "text") onText(ev.text);
      else if (ev.type === "note") chunk({reasoning_content: ev.note + " "});
      else complete();
    };
    job.subs.add(sub);
    req.on("close", () => job.subs.delete(sub)); // Safari suspended the tab: the job goes on, the app fetches it later
    return;
  }
  json(res, 404, {error: {message: "not found"}});
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`claude-bridge: http://127.0.0.1:${PORT}  (repo ${REPO}, model id "${MODEL_ID}", jobs kept ${KEEP_MS / 3600000}h)`);
});
