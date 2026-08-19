// Shared loader for the deterministic query tools (web-handoff 2026-08-18).
// Loads a song THROUGH the app's own parser via the vm harness — one parser,
// no drift from what the screen shows. Tools built on this report what IS in
// the file; they never name a chord, infer a key, or classify a note. Facts
// are the tools' job; findings are Josh's.
import { createApp } from "../tests/harness.mjs";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

export function resolveSong(arg) { // "cool-bmaj-progression" | "overworld" | a path
  if (arg.endsWith(".mid")) return path.isAbsolute(arg) ? arg : path.join(ROOT, arg);
  const hits = [];
  const walk = dir => {
    for (const f of readdirSync(path.join(ROOT, dir), {withFileTypes: true})) {
      if (f.isDirectory()) walk(path.join(dir, f.name));
      else if (f.name === arg + ".mid") hits.push(path.join(ROOT, dir, f.name));
    }
  };
  walk("albums");
  if (hits.length === 0) throw new Error("no song named " + arg + " under albums/");
  if (hits.length > 1) throw new Error("ambiguous: " + hits.join(", "));
  return hits[0];
}

export function loadSong(arg, {dedupe = true} = {}) {
  const midPath = resolveSong(arg);
  const rnPath = midPath.replace(/\.mid$/, ".rollnotes.json");
  const app = createApp();
  app.context.midiBytes = [...readFileSync(midPath)];
  app.context.rollnotesText = existsSync(rnPath) ? readFileSync(rnPath, "utf8") : "";
  const doc = JSON.parse(app.run(`(() => {
    song = parseMidi(new Uint8Array(midiBytes).buffer);
    song.rawNotes = null; chopS = 0; chopE = null;
    songKey = ${JSON.stringify(path.relative(ROOT, midPath))};
    rollnotes = rollnotesText ? parseRollnotesJSON(rollnotesText).map(resolveNote) : [];
    finalizeNotes();
    let end = 0;
    song.tracks.forEach(t => t.notes.forEach(n => { if (!n.gone) end = Math.max(end, n.t + n.d); }));
    return JSON.stringify({
      ppq: song.ppq, timesig: effTs(), bpm: Math.round(6e7 / song.tempos[0].usq),
      barTicks: barTicks(), beatTicks: beatTicks(), endTick: end,
      tracks: song.tracks.map(tr => ({name: tr.name || "",
        notes: tr.notes.filter(n => !n.gone).map(n => ({t: n.t, d: n.d, p: n.p, v: n.v}))})),
      rollnotes: rollnotes.map(n => ({text: n.text, note: n.cnote, b1: n.b1, q1: n.q1, b2: n.b2, q2: n.q2,
        start: n.start, end: n.end, section: !!n.section, chord: !!n.chord,
        keydir: n.keydir, keypartial: n.keypartial, tsdir: n.tsdir, tempodir: n.tempodir,
        trackdir: n.trackdir, loopTo: n.loopTo, lane: n.lane})),
    });
  })()`));
  if (dedupe) { // stacked same-start-same-pitch duplicates collapse to the longest
    for (const tr of doc.tracks) {
      const best = new Map();
      for (const n of tr.notes) {
        const k = n.t + ":" + n.p;
        if (!best.has(k) || n.d > best.get(k).d) best.set(k, n);
      }
      tr.notes = [...best.values()].sort((a, b) => a.t - b.t || a.p - b.p);
    }
  }
  doc.path = path.relative(ROOT, midPath);
  return doc;
}

export const isDrumTrack = name => /drum|percussion|kit|noise/i.test(name || "");
export const PC_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
export const pitchName = p => PC_NAMES[p % 12] + (Math.floor(p / 12) - 1);

export function parseBQ(doc, s) { // "2.4" or "2.4.5" (bar 2, beat 4.5) -> tick
  const parts = String(s).split(".");
  const bar = parseInt(parts[0], 10);
  const beat = parts.length > 1 ? parseFloat(parts.slice(1).join(".")) || 1 : 1;
  return (bar - 1) * doc.barTicks + (beat - 1) * doc.beatTicks;
}

export function fmtBQ(doc, tick) {
  const bar = Math.floor(tick / doc.barTicks) + 1;
  const beat = (tick % doc.barTicks) / doc.beatTicks + 1;
  const r = Math.round(beat * 100) / 100;
  return bar + "." + (Number.isInteger(r) ? r : r);
}

export function outJson(flagged, data, textFn) {
  if (flagged) process.stdout.write(JSON.stringify(data, null, 1) + "\n");
  else process.stdout.write(textFn(data));
}
