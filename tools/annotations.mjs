// tools/annotations.mjs <song> [--type section|chord|key|...] [--json]
// Annotations resolved to bar.beat with spans — plus ANOMALY flags:
// duplicate track directives, spans past the song's end, and equal-span
// section/chord pairs. Reports; never interprets.
import { loadSong, fmtBQ, outJson } from "./query-lib.mjs";

const argv = process.argv.slice(2);
const json = argv.includes("--json");
const ti = argv.indexOf("--type");
const typeArg = ti >= 0 ? argv.splice(ti, 2)[1] : null;
const songArg = argv.filter(a => a !== "--json")[0];
if (!songArg) { console.error("usage: annotations.mjs <song> [--type T] [--json]"); process.exit(1); }

const doc = loadSong(songArg);
const typeOf = n =>
  n.section ? "section" : n.chord ? "chord" :
  n.keydir !== undefined || n.keypartial ? "key" :
  n.tsdir ? "timesig" : n.tempodir !== undefined ? "tempo" :
  n.trackdir ? "track" : n.loopTo !== undefined ? "loop" :
  /^lane:/.test(n.text) ? "lane" : /^chop:/.test(n.text) ? "chop" : "text";
const rows = doc.rollnotes.map(n => ({
  type: typeOf(n), at: n.b1 + "." + n.q1, to: n.b2 ? n.b2 + "." + (n.q2 ?? 1) : null,
  text: n.text, note: n.note || undefined,
})).filter(r => !typeArg || r.type === typeArg);

const anomalies = [];
const dirSeen = new Map();
for (const n of doc.rollnotes) {
  if (n.trackdir) {
    const k = n.trackdir.name.toLowerCase();
    if (dirSeen.has(k)) anomalies.push(`duplicate track: directive for "${n.trackdir.name}"`);
    dirSeen.set(k, 1);
  }
  if ((n.section || n.chord) && n.end > doc.endTick + doc.barTicks)
    anomalies.push(`"${n.text}" span ends past the song (${fmtBQ(doc, n.end)})`);
}
const bands = doc.rollnotes.filter(n => n.section || n.chord);
for (const a of bands) for (const b of bands)
  if (a !== b && a.section && b.chord && a.start === b.start && a.end === b.end)
    anomalies.push(`section "${a.text}" and chord "${b.text}" have identical spans (${fmtBQ(doc, a.start)}–${fmtBQ(doc, a.end)})`);

outJson(json, {song: doc.path, annotations: rows, anomalies}, o => {
  let s = `${o.song}\n`;
  for (const r of o.annotations)
    s += `  ${r.type.padEnd(8)} ${r.at}${r.to ? "–" + r.to : ""}  ${r.text}${r.note ? "  ✱ " + r.note.split("\n")[0] : ""}\n`;
  s += o.anomalies.length ? "ANOMALIES:\n" + o.anomalies.map(a => "  ⚠ " + a).join("\n") + "\n" : "no anomalies\n";
  return s;
});
