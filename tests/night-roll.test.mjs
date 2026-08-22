// Unit tests for Night Roll's pure logic (index.html inline script).
// Run: node --test tests/
import test from "node:test";
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { createApp } from "./harness.mjs";

const app = createApp();
const run = (code) => app.run(code);
// vm results live in another realm (different Array prototype breaks deepEqual);
// JSON round-trip localizes them
const val = (code) => JSON.parse(run(`JSON.stringify(${code})`));

// A minimal 4/4 song so functions that read `song` work. ppq 480; second
// tempo doubles the speed at tick 960 (sec computed the way parseMidi does).
function installSong() {
  run(`
    song = {ppq: 480, timesig: [4, 4],
            tempos: [{tick: 0, usq: 500000, sec: 0}, {tick: 960, usq: 250000, sec: 1}],
            tracks: []};
    songKey = "midi/test.mid";
    keyRegions = [];
    previewSf = null;
    playCursor = 0;
  `);
}

test("script loads: core functions exist", () => {
  for (const fn of ["parseMidi", "parseRollnotes", "serializeRollnotes", "keyNameToSf",
                    "nameChord", "durationPieces", "tickToSec", "secToTick", "sfAt"]) {
    assert.equal(run(`typeof ${fn}`), "function", fn);
  }
});

test("keyNameToSf: majors, minors map to relative major, invalid → null", () => {
  const cases = {C: 0, G: 1, D: 2, F: -1, Bb: -2, "F#": 6, Db: -5,
                 Am: 0, Em: 1, Bbm: -5, Dm: -1};
  for (const [name, sf] of Object.entries(cases)) {
    assert.equal(run(`keyNameToSf(${JSON.stringify(name)})`), sf, name);
  }
  assert.equal(run(`keyNameToSf("H")`), null);
  assert.equal(run(`keyNameToSf("")`), null);
});

test("parseRollnotes: anchors, ranges, sections, key directives, comments dropped", () => {
  const text = [
    "# header comment", "",
    "[3.1]", "hello", "world", "",
    "[7.1 - 8.4]", "range note", "",
    "[1.1 - 4.4]", "section: A — G home", "",
    "[9.1]", "key: Bb", "",
    "[2.5]", "fractional beat", "",
  ].join("\n");
  const notes = val(`parseRollnotes(${JSON.stringify(text)})`);
  assert.equal(notes.length, 5);
  const [a, b, c, d, e] = notes;
  assert.deepEqual([a.b1, a.q1, a.b2, a.text], [3, 1, null, "hello\nworld"]);
  assert.deepEqual([b.b1, b.q1, b.b2, b.q2], [7, 1, 8, 4]);
  assert.equal(c.section, true);
  assert.equal(c.text, "A — G home");
  assert.equal(d.keydir, -2);
  assert.equal(d.text, "key: Bb");
  assert.deepEqual([e.b1, e.q1], [2, 5]);
  assert.ok(!notes.some(n => n.text.includes("comment")));
});

test("rollnotes round-trip: parse → serialize → parse is stable", () => {
  installSong();
  const text = [
    "[1.1 - 4.4]", "section: A", "",
    "[3.1]", "a note", "",
    "[5.1]", "key: G", "",
    "[6.1]", "key: Gm", "",
    "[6.2.5]", "off-beat", "",
  ].join("\n");
  run(`rollnotes = parseRollnotes(${JSON.stringify(text)}).map(resolveNote);`);
  const once = run(`serializeRollnotes()`);
  run(`rollnotes = parseRollnotes(${JSON.stringify(once)}).map(resolveNote);`);
  const twice = run(`serializeRollnotes()`);
  assert.equal(twice, once);
  const doc = JSON.parse(once);
  assert.equal(doc.version, 1);
  const secN = doc.notes.find(x => x.type === "section");
  assert.deepEqual([secN.at, secN.to, secN.label.startsWith("A")], [[1, 1], [4, 4], true]);
  assert.ok(doc.notes.some(x => x.type === "key" && x.key === "G" && x.at[0] === 5));
  assert.ok(doc.notes.some(x => x.type === "key" && x.key === "Gm" && x.at[0] === 6)); // minor tonic survives
  assert.equal(run(`rollnotes.find(n => n.text === "key: Gm").keydir`), -2); // Gm = 2 flats
});

test("chop: start/end directives trim the displayed song and renumber", () => {
  installSong();
  run(`
    song.tracks = [{name: "t", notes: []}];
    song.rawNotes = [[
      {t: 0,    d: 480, p: 60},   // bar 1 (chopped)
      {t: 1920, d: 480, p: 62},   // bar 2 → displayed bar 1
      {t: 1680, d: 480, p: 63},   // straddles the cut: clipped to start
      {t: 5760, d: 480, p: 64},   // bar 4 (chopped by end)
    ]];
    chopS = 0; chopE = null; appliedChop = null;
    declaredTs = null;
    rollnotes = parseRollnotes("[2.1]\\nchop: start\\n\\n[4.1]\\nchop: end\\n\\n[1.1 - 1.4]\\nchord: C\\n").map(resolveNote);
    finalizeNotes();
  `);
  assert.equal(run(`chopS`), 1920);
  assert.equal(run(`chopE`), 5760);
  const notes = val(`song.tracks[0].notes.map(n => ({t: n.t, d: n.d, p: n.p}))`);
  assert.deepEqual(notes, [
    {t: 0, d: 480, p: 62},        // slid left by one bar
    {t: 0, d: 240, p: 63},        // straddler clipped at the cut
  ]);
  assert.equal(run(`songEndTick`), 1920); // one displayed bar survives
  // the chord annotation stays in displayed coords: bar 1 as written
  assert.equal(val(`rollnotes.find(n => n.chord)`).start, 0);
  // round-trip: directives serialize verbatim in raw coords
  const once = run(`serializeRollnotes()`);
  const chops = JSON.parse(once).notes.filter(x => x.type === "chop");
  assert.deepEqual(chops.map(x => [x.at[0], x.chop]), [[2, "start"], [4, "end"]]);
  // shiftAnchors: removing the start chop moves displayed anchors right one bar
  run(`shiftAnchors(1920); rollnotes = rollnotes.filter(n => n.chopdir !== "start"); finalizeNotes();`);
  const c = val(`rollnotes.find(n => n.chord)`);
  assert.deepEqual([c.b1, c.b2], [2, 2]);
  assert.equal(run(`chopS`), 0);
  assert.equal(val(`song.tracks[0].notes.length`), 3); // bar-1 note restored
});

test("6/8: beats are eighths — anchors, defaults, re-bar conversion", () => {
  installSong();
  const text = [
    "[1.1]", "timesig: 6/8", "",
    "[1.1 - 1.3]", "chord: Bb", "",
    "[1.4 - 1.6]", "chord: F7", "",
    "[2.1]", "a note", "",
  ].join("\n");
  run(`declaredTs = null; rollnotes = parseRollnotes(${JSON.stringify(text)}).map(resolveNote); finalizeNotes();`);
  assert.deepEqual(val(`effTs()`), [6, 8]);
  assert.equal(run(`beatTicks()`), 240);           // eighth at ppq 480
  assert.equal(run(`barTicks()`), 1440);           // 6 eighths = 3 quarters
  const bb = val(`rollnotes.find(n => n.text === "Bb")`);
  assert.equal(bb.start, 0);
  assert.equal(bb.end, 720);                       // first half of the bar (3 eighths)
  const f7 = val(`rollnotes.find(n => n.text === "F7")`);
  assert.equal(f7.start, 720);                     // second half starts mid-bar
  assert.equal(f7.end, 1440);
  assert.equal(val(`rollnotes.find(n => n.text === "a note")`).start, 1440); // bar 2 = one 6/8 bar in
  // serialize keeps eighth-counted anchors
  assert.ok(JSON.parse(run(`serializeRollnotes()`)).notes.some(x =>
    x.type === "chord" && x.chord === "F7" && x.at[1] === 4 && x.to[1] === 6));
  // re-bar 6/8 → 4/4 preserves absolute positions: eighth 4 of bar 1 = quarter 2.5
  run(`convertAnchors([6, 8], [4, 4]); declaredTs = null;
       rollnotes = rollnotes.filter(n => !n.tsdir); finalizeNotes();`);
  const f74 = val(`rollnotes.find(n => n.text === "F7")`);
  assert.equal(f74.b1, 1);
  assert.equal(f74.q1, 2.5);
  assert.equal(f74.start, 720); // same tick as before
});

test("chord directives: parse, attached note, round-trip", () => {
  installSong();
  const text = [
    "[1.1 - 4.4]", "section: A", "",
    "[1.1 - 1.2]", "chord: C", "",
    "[1.3 - 1.4]", "chord: G7/B", "no 5th — the bass supplies it", "",
    "[2.1]", "plain note", "",
  ].join("\n");
  run(`rollnotes = parseRollnotes(${JSON.stringify(text)}).map(resolveNote); finalizeNotes();`);
  assert.equal(run(`rollnotes.filter(n => n.chord).length`), 2);
  assert.equal(run(`rollnotes.find(n => n.chord && n.b1 === 1 && n.q1 === 1).text`), "C");
  const g7 = val(`rollnotes.find(n => n.text === "G7/B")`);
  assert.equal(g7.chord, true);
  assert.equal(g7.cnote, "no 5th — the bass supplies it");
  assert.equal(run(`rollnotes.find(n => n.text === "C").cnote`), undefined);
  // lane groups (2026-08-19 redesign): chords stack in their OWN group below
  // the sections group — depth is within-type, lane is the display row
  assert.equal(g7.depth, 0);
  assert.equal(g7.lane, 1); // one section row above, chords start below it
  assert.equal(val(`rollnotes.find(n => n.section).lane`), 0);
  // sections stay sections, chords stay chords
  assert.ok(!g7.section);
  const once = run(`serializeRollnotes()`);
  const cN = JSON.parse(once).notes.find(x => x.chord === "G7/B");
  assert.equal(cN.note, "no 5th — the bass supplies it");
  assert.ok(JSON.parse(once).notes.some(x => x.chord === "C"));
  run(`rollnotes = parseRollnotes(${JSON.stringify(once)}).map(resolveNote); finalizeNotes();`);
  assert.equal(run(`serializeRollnotes()`), once);
});

test("modal keys: tonic + mode names map to the relative major's signature", () => {
  installSong();
  assert.equal(run(`keyNameToSf("D dorian")`), 0);   // D dorian shares C major's signature
  assert.equal(run(`keyNameToSf("F dorian")`), -3);  // F dorian shares Eb major's
  assert.equal(run(`keyNameToSf("Bb lydian")`), -1); // Bb lydian shares F major's
  assert.equal(run(`keyNameToSf("E phrygian")`), 0);
  assert.equal(run(`keyNameToSf("G mixolydian")`), 0);
  assert.equal(run(`keyNameToSf("Gm")`), -2);        // legacy minor suffix still works
  // tonic-first naming (2026-08-07 rework): pc + mode -> spelled name + true signature
  assert.deepEqual(val(`keyNameFor(2, "dorian")`), {name: "D dorian", sf: 0, tonic: "D"});
  assert.deepEqual(val(`keyNameFor(5, "dorian")`), {name: "F dorian", sf: -3, tonic: "F"});
  assert.deepEqual(val(`keyNameFor(7, "minor")`), {name: "Gm", sf: -2, tonic: "G"});
  assert.deepEqual(val(`keyNameFor(7, "major")`), {name: "G", sf: 1, tonic: "G"});
  // enharmonic choice lands on the real signature: G#m (5#) not Abm (7b), Db (5b) not C# (7#)
  assert.deepEqual(val(`keyNameFor(8, "minor")`), {name: "G#m", sf: 5, tonic: "G#"});
  assert.deepEqual(val(`keyNameFor(1, "major")`), {name: "Db", sf: -5, tonic: "Db"});
  assert.deepEqual(val(`keyNameFor(10, "major")`), {name: "Bb", sf: -2, tonic: "Bb"});
  assert.equal(val(`keyNameFor(6, "major")`).name, "F#"); // 6#/6b tie: sharp side wins
  // round-trip through rollnotes: the modal name survives and carries its signature
  run(`rollnotes = parseRollnotes("[1.1]\\nkey: D dorian\\n").map(resolveNote); finalizeNotes();`);
  assert.equal(run(`rollnotes[0].keydir`), 0);
  assert.ok(JSON.parse(run(`serializeRollnotes()`)).notes.some(x => x.key === "D dorian"));
});

test("tickToSec/secToTick: piecewise tempo map, mutual inverses", () => {
  installSong();
  assert.equal(run(`tickToSec(song, 480)`), 0.5);
  assert.equal(run(`tickToSec(song, 960)`), 1);
  assert.equal(run(`tickToSec(song, 1440)`), 1.25); // after the tempo doubles
  for (const tick of [0, 100, 480, 960, 1440, 5000]) {
    assert.ok(Math.abs(run(`secToTick(song, tickToSec(song, ${tick}))`) - tick) < 1e-6, "tick " + tick);
  }
});

test("parseMidi: header, tempo, notes, running status", () => {
  // MThd (fmt 0, 1 track, ppq 480) + one track:
  // tempo 500000; C4 on; D4 on via running status; both off (off also running)
  const bytes = [
    0x4D,0x54,0x68,0x64, 0,0,0,6, 0,0, 0,1, 0x01,0xE0,
    0x4D,0x54,0x72,0x6B, 0,0,0,26,
    0x00, 0xFF,0x51,0x03, 0x07,0xA1,0x20,
    0x00, 0x90,0x3C,0x64,
    0x00, 0x3E,0x64,
    0x83,0x60, 0x80,0x3C,0x40,
    0x00, 0x3E,0x40,
    0x00, 0xFF,0x2F,0x00,
  ];
  const s = val(`parseMidi(new Uint8Array([${bytes}]).buffer)`);
  assert.equal(s.ppq, 480);
  assert.equal(s.tempos[0].usq, 500000);
  assert.equal(s.tracks.length, 1);
  const notes = s.tracks[0].notes;
  assert.equal(notes.length, 2);
  assert.deepEqual(notes.map(n => [n.t, n.d, n.p, n.v]), [[0, 480, 60, 100], [0, 480, 62, 100]]);
});

test("durationPieces: whole, dotted, composite splits", () => {
  const P = 480;
  const pieces = (t) => val(`durationPieces(${t}, ${P})`).map(p => p.dur + ".".repeat(p.dots));
  assert.deepEqual(pieces(4 * P), ["w"]);
  assert.deepEqual(pieces(1.5 * P), ["q."]);
  assert.deepEqual(pieces(P), ["q"]);
  assert.deepEqual(pieces(1.25 * P), ["q", "16"]);
  assert.deepEqual(pieces(0.5 * P), ["8"]);
});

test("nameChord: triads, sevenths, inversions, dyads, missing 5th, flat keys", () => {
  installSong();
  const chord = (ps, sf) => run(`nameChord([${ps}], ${sf})`);
  assert.equal(chord([60, 64, 67], 0), "C");
  assert.equal(chord([64, 67, 72], 0), "C/E");
  assert.equal(chord([57, 60, 64, 67], 0), "Am7");
  assert.equal(chord([60, 67], 0), "C5");
  assert.equal(chord([60, 64, 70], 0), "C7 (no 5th)");
  assert.equal(chord([61, 65, 68], -2), "Db"); // spelled per key: Db, not C#
});

test("keySpelling via spellPc: signature notes and chromatic defaults", () => {
  installSong();
  assert.equal(run(`spellPc(6, 1)`), "F#");   // G major's sharp
  assert.equal(run(`spellPc(10, -1)`), "Bb"); // F major's flat
  assert.equal(run(`spellPc(1, 0)`), "C#");   // chromatic: leading-tone-ish → sharp
  assert.equal(run(`spellPc(3, 0)`), "Eb");   // chromatic: borrowed → flat
});

test("sfAt: open keys, ranged keys revert, preview overrides", () => {
  installSong();
  run(`keyRegions = [
    {start: 0, sf: 1, end: null},
    {start: 960, sf: -2, end: 1920},
  ];`);
  assert.equal(run(`sfAt(0)`), 1);
  assert.equal(run(`sfAt(1000)`), -2); // inside the ranged key
  assert.equal(run(`sfAt(2000)`), 1);  // ranged key ended: surrounding key resumes
  run(`previewSf = 3;`);
  assert.equal(run(`sfAt(1000)`), 3);  // dial preview wins
  run(`previewSf = null;`);
});

test("beatLabel: 1e&a counting with fractional fallback", () => {
  const label = (b) => run(`beatLabel(${b})`);
  assert.equal(label(1), "1");
  assert.equal(label(2.25), "2e");
  assert.equal(label(3.5), "3&");
  assert.equal(label(4.75), "4a");
  assert.equal(label(1.33), "1.33");
});

test("loop directive: anchor past target = jump point; else song end; whole song without one", () => {
  installSong();
  run(`rollnotes = parseRollnotes("[25.1]\\nloop: 2.1\\n").map(resolveNote); finalizeNotes();`);
  assert.equal(run(`rollnotes[0].loopTo`), 1920); // bar 2 beat 1 at ppq 480
  run(`songEndTick = 26 * 4 * 480;`);
  const seg = val(`currentLoop()`);
  assert.ok(Math.abs(seg.start - run(`tickToSec(song, 1920)`)) < 1e-9);
  // fires at the [25.1] anchor, not at the song end a bar later
  assert.ok(Math.abs(seg.end - run(`tickToSec(song, 24 * 4 * 480)`)) < 1e-9);
  // anchor at/before the target (auto-written [1.1] files): jump at song end
  run(`rollnotes = parseRollnotes("[1.1]\\nloop: 2.1\\n").map(resolveNote); finalizeNotes();`);
  const seg2 = val(`currentLoop()`);
  assert.ok(Math.abs(seg2.end - run(`tickToSec(song, songEndTick)`)) < 1e-9);
  run(`rollnotes = []; finalizeNotes();`);
  const whole = val(`currentLoop()`);
  assert.equal(whole.start, 0);
  assert.ok(Math.abs(whole.end - run(`tickToSec(song, songEndTick)`)) < 1e-9);
});

test("saveEdits: an added note that was erased is not persisted (regression)", () => {
  installSong();
  run(`
    song.tracks = [{name: "t", notes: [
      {t: 0, d: 480, p: 60, v: 80, added: true, gone: true},
      {t: 480, d: 480, p: 62, v: 80, added: true},
      {t: 960, d: 480, p: 64, v: 80, gone: true},
    ]}];
    saveEdits();
  `);
  const saved = JSON.parse(app.store.get("ff1roll-edits-midi/test.mid"));
  assert.deepEqual(saved.added.map(n => n.p), [62]); // erased added note dropped
  assert.deepEqual(saved.removed, ["0:2"]);          // erased original tracked
});

test("meter: neutral 4/4 until a timesig directive declares one; anchors convert", () => {
  installSong();
  run(`song.timesig = [6, 8];`); // the MIDI's claim
  run(`rollnotes = []; finalizeNotes();`);
  assert.equal(run(`barTicks()`), 4 * 480); // MIDI meter drives nothing: neutral 4/4
  run(`rollnotes = parseRollnotes("[1.1]\\ntimesig: 6/8\\n").map(resolveNote); finalizeNotes();`);
  assert.deepEqual(val(`declaredTs`), [6, 8]);
  assert.equal(run(`barTicks()`), 3 * 480); // declared: 6/8 = 3 quarter-beats per bar
  const once = run(`serializeRollnotes()`);
  assert.ok(JSON.parse(once).notes.some(x => x.timesig === "6/8")); // round-trips like any directive
  // conversion: [2.1] under 6/8 (tick 1440 = 3 quarters) re-expressed in 4/4 = bar 1 beat 4
  run(`rollnotes.push(resolveNote({b1: 2, q1: 1, b2: null, q2: null, text: "hi", added: true})); finalizeNotes();`);
  run(`convertAnchors([6, 8], [4, 4]);`);
  const n = val(`rollnotes.find(x => x.text === "hi")`);
  assert.deepEqual([n.b1, n.q1], [1, 4]);
});

test("instrument panel: degrees vs the recorded tonic, guitar/piano hit maps", () => {
  installSong();
  // degree labels follow the tonic letter of the recorded name (mode-agnostic)
  assert.equal(run(`degreeOf(3, "Bb")`), "4");    // Eb in Bb major
  assert.equal(run(`degreeOf(10, "Gm")`), "♭3");  // Bb in G minor
  assert.equal(run(`degreeOf(11, "Bb")`), "♭2");  // the B natural Josh flagged in menu
  assert.equal(run(`degreeOf(0, null)`), null);   // no declared key → no degrees
  // keyNameAt: ranged key wins inside its span, surrounding key resumes
  run(`keyRegions = [{start: 0, end: null, sf: -2, name: "Bb"},
                     {start: 960, end: 1920, sf: 1, name: "Em"}];`);
  assert.equal(run(`keyNameAt(0)`), "Bb");
  assert.equal(run(`keyNameAt(1000)`), "Em");
  assert.equal(run(`keyNameAt(2000)`), "Bb");
  run(`keyRegions = [];`);
  // guitar: y rows are strings high-e→low-E, x left of the nut = open string
  assert.deepEqual(val(`guitarHit(10, 14, 800, 168)`), {p: 64, si: 0, f: 0});   // open high e
  assert.deepEqual(val(`guitarHit(10, 168, 800, 168)`), {p: 40, si: 5, f: 0});  // open low E
  const g5 = val(`guitarHit(44 + ((800 - 50) / 24) * 2.5, 14, 800, 168)`);      // 3rd fret, high e
  assert.deepEqual(g5, {p: 67, si: 0, f: 3});
  // piano: no song range set here → default C4..B4 octave-aligned keyboard
  run(`song = null;`);
  assert.deepEqual(val(`instRange()`), [60, 71]);
  assert.equal(run(`pianoHit(1, 160, 700, 168)`), 60);          // bottom-left = middle C
  assert.equal(run(`pianoHit(700 / 7 - 2, 10, 700, 168)`), 61); // black-key zone over the C/D seam = C#
});

test("roll zoom-out clamp: floors flush to song extents, fitView lands on them", () => {
  installSong();
  run(`
    RULER_H = 24;
    song.tracks = [{name: "t", notes: [{t: 0, d: 480, p: 60, v: 80},
                                       {t: 7200, d: 480, p: 72, v: 80}]}];
    songEndTick = 16 * 480;
  `);
  // stub viewport 800x600, RULER_W 46: 16 quarters + a ruler-width of right pad = 708/16
  assert.equal(run(`pxqFloor()`), (800 - 92) / 16);
  // 13 pitch rows + 6 rows of air (ROLL_AIR above and below) in 552px = 29.05
  assert.equal(run(`rowHFloor()`), 552 / 19);
  run(`fitView();`);
  assert.equal(run(`view.pxq`), (800 - 92) / 16);
  assert.equal(run(`view.x`), 0);
  assert.equal(run(`view.y`), (96 - 72 - 3) * (552 / 19)); // top pitch sits ROLL_AIR rows below the ruler
  run(`view.pxq = 2; view.rowH = 3; clampView();`); // zoomed out too far → floors
  assert.equal(run(`view.pxq`), (800 - 92) / 16);
  assert.equal(run(`view.rowH`), 552 / 19);
  run(`song = null;`);
  assert.equal(run(`pxqFloor()`), 8); // no song: permissive defaults
  assert.equal(run(`rowHFloor()`), 6);
});

test("guitar octave fold: off-the-neck pitches fold in, shift records the move", () => {
  // 24-fret neck: E2 (40) .. E6 (88)
  assert.deepEqual(val(`gtrFold(60)`), {p: 60, shift: 0});   // middle C: on the neck
  assert.deepEqual(val(`gtrFold(93)`), {p: 81, shift: -1});  // A6 → A5, true pitch above
  assert.deepEqual(val(`gtrFold(36)`), {p: 48, shift: 1});   // C2 → C3, true pitch below
  assert.deepEqual(val(`gtrFold(101)`), {p: 77, shift: -2}); // two octaves over
});

test("chord challenge: evidence report — present/missing/extra vs the label, pedal shows as extra", () => {
  installSong();
  run(`
    trackState = [{muted: false, solo: false}];
    song.tracks = [{name: "t", notes: [
      {t: 0, d: 960, p: 65, v: 80},   // F4
      {t: 0, d: 960, p: 69, v: 80},   // A4
      {t: 0, d: 960, p: 72, v: 80},   // C5
      {t: 0, d: 960, p: 75, v: 80},   // Eb5
      {t: 0, d: 960, p: 58, v: 80},   // Bb3 — the tonic pedal
    ]}];
    keyRegions = [{start: 0, end: null, sf: -2, name: "Bb"}];
  `);
  const ev = val(`(() => { const e = chordEvidence({text: "F7", start: 0, end: 960});
    return {missing: e.missing, extra: e.extra, namer: e.namer}; })()`);
  assert.deepEqual(ev.missing, []);        // all four F7 tones sound
  assert.deepEqual(ev.extra, [10]);        // the Bb pedal — evidence, not verdict
  // wrong label: F named where the seventh sounds → Eb is "extra", nothing missing
  const ev2 = val(`(() => { const e = chordEvidence({text: "F", start: 0, end: 960});
    return {missing: e.missing, extra: e.extra}; })()`);
  assert.deepEqual(ev2.missing, []);
  assert.deepEqual(ev2.extra.sort((a, b) => a - b), [3, 10]); // Eb + the pedal
  // label with a slash bass: bass pc joins the expected set
  const ev3 = val(`(() => { const e = chordEvidence({text: "F7/A", start: 0, end: 960});
    return {missing: e.missing}; })()`);
  assert.deepEqual(ev3.missing, []);
  // label outside the vocabulary → no tone check, namer still reports
  assert.equal(val(`chordEvidence({text: "Fzzz", start: 0, end: 960}).expected`), null);
  // empty span
  assert.equal(run(`chordEvidence({text: "F7", start: 5000, end: 6000}).err`), "no notes sound in this span");
  run(`keyRegions = [];`);
});

test("chord challenge roles: menu's F7 case — guide tones present, root/5th missing, pedal extra", () => {
  installSong();
  run(`
    trackState = [{muted: false, solo: false}];
    song.tracks = [{name: "t", notes: [
      {t: 0, d: 960, p: 58, v: 80},   // Bb3 — tonic pedal
      {t: 0, d: 960, p: 63, v: 80},   // Eb4 — the 7th
      {t: 0, d: 960, p: 69, v: 80},   // A4  — the 3rd
      {t: 0, d: 960, p: 75, v: 80},   // Eb5
      {t: 0, d: 960, p: 81, v: 80},   // A5
    ]}];
    keyRegions = [{start: 0, end: null, sf: -2, name: "Bb"}];
  `);
  const ev = val(`(() => { const e = chordEvidence({text: "F7", start: 0, end: 960});
    return {missing: e.missing.sort((a,b)=>a-b), extra: e.extra, roles: e.roles, namer: e.namer}; })()`);
  assert.deepEqual(ev.missing, [0, 5]);              // C (5th) and F (root) never sound
  assert.deepEqual(ev.extra, [10]);                  // the Bb pedal
  assert.equal(ev.roles[9], "3rd");                  // A
  assert.equal(ev.roles[3], "7th");                  // Eb
  assert.equal(ev.roles[5], "root");
  assert.equal(ev.roles[0], "5th");
  assert.equal(ev.namer, "no standard chord match"); // honest: a bare tritone + pedal names nothing
  run(`keyRegions = [];`);
});

test("lasso toggle: tap adds, tap again removes, empty selection hides Chord?", () => {
  installSong();
  run(`
    trackState = [{muted: false, solo: false}];
    song.tracks = [{name: "t", notes: [
      {t: 0, d: 480, p: 60, v: 80}, {t: 480, d: 480, p: 64, v: 80}]}];
    multiSel = []; multiSelKey = new Set();
    previewNote = async () => {}; // no AudioContext in the vm
    toggleSel({ti: 0, ni: 0});
    toggleSel({ti: 0, ni: 1});
  `);
  assert.equal(run(`multiSel.length`), 2);
  assert.equal(run(`multiSelKey.has("0:1")`), true);
  run(`toggleSel({ti: 0, ni: 0});`); // tap the first one back out
  assert.equal(run(`multiSel.length`), 1);
  assert.equal(run(`multiSelKey.has("0:0")`), false);
  run(`toggleSel({ti: 0, ni: 1});`);
  assert.equal(run(`multiSel.length`), 0);
});

test("partial keys: tonic stored, never applied — round-trips with the ? marker", () => {
  installSong();
  run(`rollnotes = parseRollnotes("[1.1]\\nkey: G#/Ab?\\n").map(resolveNote); finalizeNotes();`);
  assert.equal(run(`rollnotes[0].keypartial`), "G#/Ab");
  assert.equal(run(`rollnotes[0].keydir`), undefined); // not applied:
  assert.equal(run(`keyRegions.length`), 0);           // no region, no signature
  assert.equal(run(`sfDeclaredAt(0)`), null);          // staff renders as unkeyed
  assert.ok(JSON.parse(run(`serializeRollnotes()`)).notes.some(x => x.key === "G#/Ab?")); // survives Sync
  run(`rollnotes = []; finalizeNotes();`);
});

test("asserted tonic spellings: Bb?, A#?, and fused A#/Bb? all round-trip as partials", () => {
  installSong();
  for (const form of ["Bb", "A#", "A#/Bb"]) {
    run(`rollnotes = parseRollnotes(${JSON.stringify("[1.1]\nkey: " + form + "?\n")}).map(resolveNote); finalizeNotes();`);
    assert.equal(run(`rollnotes[0].keypartial`), form, form);
    assert.equal(run(`rollnotes[0].keydir`), undefined, form + " not applied");
    assert.ok(JSON.parse(run(`serializeRollnotes()`)).notes.some(x => x.key === form + "?"), form);
  }
  // option-value mapping: stored name -> the dropdown option that wrote it
  assert.equal(run(`tonicOptionValue("Bb")`), "10:Bb");
  assert.equal(run(`tonicOptionValue("A#")`), "10:A#");
  assert.equal(run(`tonicOptionValue("A#/Bb")`), "10:");
  assert.equal(run(`tonicOptionValue("C")`), "0:");
  run(`rollnotes = []; finalizeNotes();`);
});

test("composition: writeMidi round-trips through the app's own parser", () => {
  installSong();
  const back = val(`(() => {
    const s = {ppq: 480, timesig: [6, 8],
      tempos: [{tick: 0, usq: 500000, sec: 0}],
      tracks: [
        {name: "pulse1", notes: [{t: 0, d: 240, p: 70, v: 96}, {t: 240, d: 480, p: 74, v: 52}]},
        {name: "triangle", notes: [{t: 0, d: 960, p: 46, v: 80}, {t: 960, d: 240, p: 53, v: 112, gone: true}]},
      ]};
    const parsed = parseMidi(writeMidi(s).buffer);
    return {ppq: parsed.ppq, timesig: parsed.timesig, usq: parsed.tempos[0].usq,
            names: parsed.tracks.map(t => t.name),
            notes: parsed.tracks.map(t => t.notes.map(n => [n.t, n.d, n.p, n.v]))};
  })()`);
  assert.equal(back.ppq, 480);
  assert.deepEqual(back.timesig, [6, 8]);
  assert.equal(back.usq, 500000);
  assert.deepEqual(back.names, ["pulse1", "triangle"]);
  assert.deepEqual(back.notes[0], [[0, 240, 70, 96], [240, 480, 74, 52]]);
  assert.deepEqual(back.notes[1], [[0, 960, 46, 80]]); // gone note not written
});

test("composition helpers: slugify, isComposition gate, draft store round-trip", () => {
  installSong();
  assert.equal(run(`slugify("  My New Song! ")`), "my-new-song");
  assert.equal(run(`slugify("")`), "untitled");
  run(`songKey = "albums/final-fantasy-i/songs/town.mid";`);
  assert.equal(run(`isComposition()`), false); // chip capture: Save locked
  run(`songKey = "albums/compositions/nightroll/test-tune.mid";`);
  assert.equal(run(`isComposition()`), true);
  run(`
    song = {ppq: 480, timesig: [4, 4], tempos: [{tick: 0, usq: 500000, sec: 0}],
            tracks: [{name: "pulse1", notes: [{t: 0, d: 480, p: 60, v: 80},
                                              {t: 480, d: 480, p: 62, v: 80, gone: true}]}]};
    saveDraft();
  `);
  const d = JSON.parse(app.store.get("ff1roll-draft-albums/compositions/nightroll/test-tune.mid"));
  assert.deepEqual(d.tracks[0].notes, [{t: 0, d: 480, p: 60, v: 80}]); // gone filtered
  assert.deepEqual(d.timesig, [4, 4]);
  run(`songKey = null;`);
});

test("manifest placement: save adds, move relocates, albums resolve by dir", () => {
  installSong();
  assert.equal(run(`albumTitleFor("albums/compositions/nightroll/x.mid")`), "Night Roll Sketches");
  assert.equal(run(`albumTitleFor("albums/compositions/x.mid")`), "My Compositions");
  assert.equal(run(`albumTitleFor("albums/final-fantasy-i/songs/town.mid")`), null);
  const out = val(`(() => {
    const albums = [{title: "My Compositions", songs: [{title: "Old", path: "albums/compositions/old.mid"}]}];
    manifestPlace(albums, null, "albums/compositions/nightroll/test-tune.mid"); // first save
    manifestPlace(albums, "albums/compositions/nightroll/test-tune.mid",
                          "albums/compositions/test-tune.mid");                 // promote
    return albums;
  })()`);
  const sketches = out.find(a => a.title === "Night Roll Sketches");
  assert.deepEqual(sketches.songs, []); // moved out
  const mine = out.find(a => a.title === "My Compositions");
  assert.deepEqual(mine.songs.map(s => s.path).sort(),
    ["albums/compositions/old.mid", "albums/compositions/test-tune.mid"]);
  assert.equal(mine.songs.find(s => s.path.includes("test-tune")).title, "Test Tune");
});

test("NSF import helpers: track keys, album titles, manifest, Sync exclusion", () => {
  assert.equal(run(`impTrackKey("solstice", 7)`), "albums/imports/solstice/track-07.mid");
  assert.equal(run(`albumTitleFor("albums/imports/solstice/track-07.mid")`), "Solstice");
  run(`
    localStorage.setItem("ff1roll-draft-albums/imports/solstice/track-07.mid", "{}");
    localStorage.setItem("ff1roll-notes-albums/imports/solstice/track-07.mid", "[]");
  `);
  assert.deepEqual(val(`importDraftKeys()`), ["albums/imports/solstice/track-07.mid"]);
  // uncommitted captures ride Commit import, not the Sync badge…
  assert.equal(val(`dirtySongs()`).includes("albums/imports/solstice/track-07.mid"), false);
  // …but once the draft is gone (committed), local notes sync normally again
  run(`localStorage.removeItem("ff1roll-draft-albums/imports/solstice/track-07.mid");`);
  assert.equal(val(`dirtySongs()`).includes("albums/imports/solstice/track-07.mid"), true);
  run(`localStorage.removeItem("ff1roll-notes-albums/imports/solstice/track-07.mid");`);
  const out = val(`(() => {
    const albums = [];
    manifestPlace(albums, null, "albums/imports/solstice/track-07.mid");
    return albums;
  })()`);
  assert.equal(out[0].title, "Solstice"); // commit self-creates the album
  assert.deepEqual(out[0].songs, [{title: "Track 07", path: "albums/imports/solstice/track-07.mid"}]);
});

test("sampled voices: every menu entry has its soundfont file; pitch names map to sample keys", () => {
  const sf = val(`SF_VOICES`);
  assert.ok(sf.length >= 8);
  for (const [id, , file] of sf) {
    assert.ok(id.startsWith("sf-"), id);
    const path = new URL("../vendor/soundfonts/" + file + ".json", import.meta.url);
    const map = JSON.parse(readFileSync(path, "utf8")); // missing/corrupt file throws
    assert.ok(map.A4 && map.A4.startsWith("data:audio"), file + " has A4");
    assert.equal(Object.keys(map).length, 88, file + " covers the 88 keys");
  }
  assert.equal(run(`sfNoteName(69)`), "A4");
  assert.equal(run(`sfNoteName(60)`), "C4");
  assert.equal(run(`sfNoteName(61)`), "Db4"); // FluidR3 names use flats
  assert.equal(run(`sfNoteName(21)`), "A0");
  assert.equal(run(`sfNoteName(108)`), "C8");
  // menu carries the sampled set; the retired synth patches are gone from it
  const voices = val(`VOICES`).map(v => v[0]);
  assert.ok(voices.includes("sf-piano") && voices.includes("sf-violin"));
  assert.ok(!voices.includes("pluck") && !voices.includes("bell"));
});

test("data-location config: defaults are legacy-identical; bases and repos route", () => {
  // defaults: relative reads (today's behavior), night-roll writes
  run(`localStorage.removeItem("ff1roll-cfg"); cfg.c = null;`);
  assert.equal(run(`songsURL("albums/manifest.json")`), "albums/manifest.json");
  assert.equal(run(`analysisURL("albums/x/songs/y.rollnotes.json")`), "albums/x/songs/y.rollnotes.json");
  assert.equal(run(`repoApi("songs")`), "https://api.github.com/repos/joshcough/night-roll/contents/");
  assert.equal(run(`repoApi("analysis")`), "https://api.github.com/repos/joshcough/night-roll/contents/");
  assert.equal(run(`repoName("nsf")`), "joshcough/nsf-archive");
  assert.equal(run(`nsfURL("ff1.nsf")`), "https://raw.githubusercontent.com/joshcough/nsf-archive/main/ff1.nsf");
  // configured: any base URL prepends (trailing slashes normalized); writes retarget
  run(`saveCfg({songsBase: "https://raw.githubusercontent.com/other/corpus/main/",
                analysisBase: "http://localhost:8001",
                analysisRepo: "other/my-analysis"});`);
  assert.equal(run(`songsURL("albums/a.mid")`), "https://raw.githubusercontent.com/other/corpus/main/albums/a.mid");
  assert.equal(run(`analysisURL("albums/a.rollnotes.json")`), "http://localhost:8001/albums/a.rollnotes.json");
  assert.equal(run(`repoApi("analysis")`), "https://api.github.com/repos/other/my-analysis/contents/");
  assert.equal(run(`repoApi("songs")`), "https://api.github.com/repos/joshcough/night-roll/contents/"); // unset field keeps default
  // scope-shaped API failures name the repo and the fix
  const msg = run(`apiError("analysis", {status: 404}, "x.rollnotes.json").message`);
  assert.match(msg, /other\/my-analysis/);
  assert.match(msg, /token can't see/);
  run(`localStorage.removeItem("ff1roll-cfg"); cfg.c = null;`); // restore defaults for later tests
});

test("local MIDI imports persist as device drafts: editable, drums intact, never synced", () => {
  installSong();
  run(`
    songKey = "local/some-song.mid";
    song.tracks = [{name: "kit", notes: [{t: 0, d: 480, p: 38, v: 90, ch: 9}]}];
    saveDraft();
  `);
  const d = JSON.parse(app.store.get("ff1roll-draft-local/some-song.mid"));
  assert.equal(d.tracks[0].notes[0].ch, 9); // drum channel survives the draft round-trip
  assert.equal(run(`isLocalDraft()`), true); // pencil editing allowed
  assert.equal(run(`isComposition()`), false); // but Save (commit) stays locked
  run(`localStorage.setItem("ff1roll-notes-local/some-song.mid", "[]");`);
  assert.equal(val(`dirtySongs()`).includes("local/some-song.mid"), false); // no repo path — never syncs
  run(`
    songKey = null;
    localStorage.removeItem("ff1roll-draft-local/some-song.mid");
    localStorage.removeItem("ff1roll-notes-local/some-song.mid");
  `);
});

test("NSF import rename: draft moves, typed title survives, collisions refused", () => {
  run(`
    localStorage.setItem("ff1roll-draft-albums/imports/mm2/track-15.mid", JSON.stringify({title: "track-15", tracks: []}));
    localStorage.setItem("ff1roll-notes-albums/imports/mm2/track-15.mid", "[]");
    localStorage.setItem("ff1roll-draft-albums/imports/mm2/track-16.mid", JSON.stringify({title: "track-16", tracks: []}));
  `);
  assert.equal(run(`renameImportDraft("albums/imports/mm2/track-15.mid", "Dr. Wily's Castle")`),
               "albums/imports/mm2/dr-wily-s-castle.mid");
  const d = JSON.parse(app.store.get("ff1roll-draft-albums/imports/mm2/dr-wily-s-castle.mid"));
  assert.equal(d.title, "Dr. Wily's Castle"); // punctuation intact for the dropdown
  assert.equal(app.store.get("ff1roll-draft-albums/imports/mm2/track-15.mid"), undefined);
  assert.equal(app.store.get("ff1roll-notes-albums/imports/mm2/dr-wily-s-castle.mid"), "[]"); // stash rides along
  // display titles: typed names verbatim, bare slugs prettified
  assert.equal(run(`impDisplayTitle({title: "Dr. Wily's Castle"}, "dr-wily-s-castle")`), "Dr. Wily's Castle");
  assert.equal(run(`impDisplayTitle({title: "airship"}, "airship")`), "Airship");
  assert.equal(run(`impDisplayTitle(null, "track-07")`), "Track 07");
  // collision: another captured track already owns the name
  assert.equal(run(`renameImportDraft("albums/imports/mm2/track-16.mid", "dr wily s castle")`), null);
  run(`
    for (const k of Object.keys(localStorage).filter(k => k.includes("albums/imports/mm2/")))
      localStorage.removeItem(k);
  `);
});

test("NSF import: in-app capture runs the real pipeline and round-trips through parseMidi", async () => {
  // same modules the browser dynamically imports, wired into the vm realm
  const M = {
    ...(await import("../tools/nsf/nsf.mjs")),
    ...(await import("../tools/nsf/notes.mjs")),
    ...(await import("../tools/nsf/midi-write.mjs")),
  };
  const nsf = M.parseNSF(readFileSync(new URL("../albums/final-fantasy-i/reference/ff1.nsf", import.meta.url)));
  app.context.__M = M;
  app.context.__nsf = nsf;
  // track 17 = menu: known 8-bar loop, quick to run. captureNsfTrack is
  // async (the runner yields so iOS Safari's watchdog doesn't kill the tab);
  // the vm shares node's event loop, so await its promise from out here
  run(`__capP = captureNsfTrack(__M, __nsf, 17, 35).then(cap => {
    const parsed = parseMidi(new Uint8Array(cap.bytes).buffer);
    __cap = {looped: cap.looped, bpm: cap.bpm, secs: cap.secs,
             anchor: cap.loopAnchor, target: cap.loopTarget,
             tracks: parsed.tracks.length,
             notes: parsed.tracks.reduce((a, t) => a + t.notes.length, 0)};
  })`);
  await app.context.__capP;
  const got = val(`__cap`);
  assert.equal(got.looped, true, "menu loops on hardware");
  assert.ok(got.bpm > 60 && got.bpm < 300, "grid fit found a sane tempo: " + got.bpm);
  assert.ok(got.secs > 5 && got.secs < 35, "trimmed to intro + one pass");
  assert.ok(got.tracks >= 3, "conductor + chip voices"); // conductor + pulses/triangle
  assert.ok(got.notes > 50, "melody actually captured: " + got.notes + " notes");
});

test("help sheet covers every shipped feature (drift guard — extend this list when you ship)", () => {
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  const help = html.match(/id="helpsheet"[\s\S]*?helpclose/)[0];
  // one recognizable keyword per shipped feature; a missing one means the
  // help sheet silently drifted from the app (it happened to the key dial)
  const FEATURES = [
    "Metronome", "Speed slider", "Lasso", "Chord?", "Challenge?",
    "find:", "Circle of fifths", "key: picker", "mode?", "Instrument panel",
    "Fall", "💬", "Chop", "Loop points", "Sections", "Chords",
    "Roll zoom-out limit", "Score zoom limit", "Pencil", "undo",
    "New song", "Save As", "Move to…", "Download .mid", "Open…", "Score entry",
    "Web session", "Repo ↗", "Sync", "Silent Mode", "copy chip",
    "follow song", "trial meter", "Count-in", "LCD readout", "Tempo change", "voice &amp; color",
    "Import…", "NSF", "Commit import", "color picker", "sampled", "Rename…", "Chip audio", "Data locations", "Settings…", "Create album", "⚠", ".m3u", "real copy", "grayed", "moving TOGETHER pan", "hold to grab", "Revert to repo copy", "8va", "Octave up", "Divide", "magnetic", "never clears your note selection", "note value × modifier", "CELL you touch", "extensions row STACKS", "Pencil drag", "cycles", "Attached notes", "RENAMES the track", "＋ drums", "?song=", "Drum fill", "Delete track", "● Record", "Drum chart", "Edit ▾", "⟳ Redo", "parks", "re-arm", "entire annotation layer", "triangle handle", "left edge", "band by its", "all move-handle", "Insert chord", "organized by emotion", "splits at that exact spot", "merge into one note", "helptabs", 'data-hsec="editor"', "HELP.md",
  ];
  const missing = FEATURES.filter(k => !help.includes(k));
  assert.deepEqual(missing, [], "features with no help entry: " + missing.join(", "));
});

test("tempo: directives rebuild the map from the song's base; removal restores", () => {
  installSong();
  // ANALYSIS song (not under compositions/): the directive is a pure
  // observation — the measured map must not move (Josh's ruling)
  run(`
    song.baseTempos = null;
    song.tempos = [{tick: 0, usq: 500000, sec: 0}];
    rollnotes = parseRollnotes("[3.1]\\ntempo: 60\\n").map(resolveNote);
    finalizeNotes();
  `);
  assert.deepEqual(val(`song.tempos`), [{tick: 0, usq: 500000, sec: 0}]);
  assert.equal(run(`rollnotes[0].tempodir`), 60); // but the observation is recorded
  // CREATED song: the same annotation authors the tempo
  run(`
    songKey = "albums/compositions/nightroll/tempo-test.mid";
    song.baseTempos = null;
    rollnotes = parseRollnotes("[1.1]\\ntimesig: 4/4\\n\\n[3.1]\\ntempo: 60\\n").map(resolveNote);
    finalizeNotes();
  `);
  const map = val(`song.tempos`);
  assert.equal(map.length, 2);
  assert.equal(map[0].usq, 500000);            // base 120bpm until bar 3
  assert.equal(map[1].tick, 2 * 4 * 480);      // directive lands at bar 3
  assert.equal(map[1].usq, 1000000);           // 60bpm
  assert.equal(map[1].sec, 4);                 // 8 quarters at 120bpm = 4s
  run(`rollnotes = rollnotes.filter(n => n.tempodir === undefined); finalizeNotes();`);
  assert.deepEqual(val(`song.tempos`), [{tick: 0, usq: 500000, sec: 0}]); // base restored
  // round-trips like any directive
  run(`rollnotes = parseRollnotes("[1.1]\\ntempo: 90\\n").map(resolveNote); finalizeNotes();`);
  assert.ok(JSON.parse(run(`serializeRollnotes()`)).notes.some(x => x.type === "tempo" && x.bpm === 90));
  assert.equal(val(`song.tempos`)[0].usq, Math.round(6e7 / 90));
  run(`rollnotes = []; finalizeNotes(); song.baseTempos = null; songKey = "midi/test.mid";`);
});

test("track: directive — voice & color as synced annotations, round-tripping", () => {
  installSong();
  run(`
    trackState = [{muted: false, solo: false}, {muted: false, solo: false}];
    song.tracks = [{name: "pulse1", notes: [{t: 0, d: 480, p: 60, v: 80}]},
                   {name: "triangle", notes: [{t: 0, d: 480, p: 48, v: 80}]}];
    rollnotes = parseRollnotes("[1.1]\\ntrack: pulse1 voice=sine color=#0aa2c0\\n").map(resolveNote);
    finalizeNotes();
  `);
  assert.equal(run(`song.tracks[0].voice`), "sine");
  assert.equal(run(`song.tracks[0].color`), "#0aa2c0");
  assert.equal(run(`trackVoice(0)`), "sine");
  assert.equal(run(`trackColor(0)`), "#0aa2c0");
  assert.equal(run(`song.tracks[1].voice`), undefined); // untouched track
  assert.ok(JSON.parse(run(`serializeRollnotes()`)).notes.some(x =>
    x.type === "track" && x.track === "pulse1" && x.voice === "sine" && x.color === "#0aa2c0"));
  // removing the directive reverts to the NES defaults
  run(`rollnotes = []; finalizeNotes();`);
  assert.equal(run(`song.tracks[0].voice`), undefined);
  assert.equal(run(`trackVoice(0)`), "square");
  run(`song = null; songKey = "midi/test.mid";`);
});

test("format identity: text → object → JSON → object yields the SAME object (Josh's spec)", () => {
  installSong();
  const textFile = `# legacy header comment (dropped by design)
[1.1]
timesig: 6/8

[1.1]
key: Bb

[2.1]
key: A#/Bb?

[1.1 - 4.6]
section: A — home

[5.3 - 5.4]
chord: G7/B
no 5th — the bass supplies it
second attached line

[3.1]
tempo: 90

[1.1]
track: pulse1 voice=sine color=#0aa2c0

[2.1]
chop: start

[25.1]
loop: 2.1

[6.2.5]
Plain prose observation,
across two lines.
`;
  const out = val(`(() => {
    const A = parseRollnotes(${JSON.stringify(textFile)});          // text → object
    const json = serializeNotesList(A, 6, "identity-test");         // object → JSON
    const B = parseRollnotes(json);                                 // JSON → object
    const json2 = serializeNotesList(B, 6, "identity-test");        // and once more
    return {A, B, stable: json === json2, isJson: json.trimStart().startsWith("{")};
  })()`);
  assert.equal(out.isJson, true);
  assert.equal(out.stable, true);                 // JSON round-trip is a fixed point
  assert.equal(out.A.length, 10);
  assert.deepEqual(out.B, out.A);                 // the objects are IDENTICAL
  // spot-check the interesting ones survived with full fidelity
  const chord = out.B.find(n => n.chord);
  assert.equal(chord.cnote, "no 5th — the bass supplies it\nsecond attached line");
  assert.equal(out.B.find(n => n.keypartial)?.keypartial, "A#/Bb");
  assert.equal(out.B.find(n => n.tempodir)?.tempodir, 90);
  assert.deepEqual(out.B.find(n => n.trackdir)?.trackdir, {name: "pulse1", voice: "sine", color: "#0aa2c0"});
  assert.equal(out.B.find(n => n.q1 === 2.5)?.text.startsWith("Plain prose"), true); // fractional beat
});

test("cross-device freshness: stamps ride saves, drafts remember their base", () => {
  installSong();
  run(`rollnotes = parseRollnotes("[1.1]\\ntimesig: 4/4\\n");`);
  const stamped = run(`serializeRollnotesStamped(1234567)`);
  assert.equal(JSON.parse(stamped).saved, 1234567);
  const unstamped = run(`serializeRollnotes()`);
  assert.equal(JSON.parse(unstamped).saved, undefined); // pure serialization: no stamp
  // draft carries base stamp + dirty flag; clean save flips dirty off
  run(`
    songKey = "albums/compositions/nightroll/fresh-test.mid";
    song.savedStamp = 1234567;
    saveDraft();      // an edit: dirty
  `);
  let d = JSON.parse(app.store.get("ff1roll-draft-albums/compositions/nightroll/fresh-test.mid"));
  assert.deepEqual([d.savedStamp, d.dirty], [1234567, true]);
  run(`saveDraft(true);`); // post-save: clean
  d = JSON.parse(app.store.get("ff1roll-draft-albums/compositions/nightroll/fresh-test.mid"));
  assert.deepEqual([d.savedStamp, d.dirty], [1234567, false]);
  run(`songKey = "midi/test.mid"; rollnotes = [];`);
  app.store.delete("ff1roll-draft-albums/compositions/nightroll/fresh-test.mid");
});

test("parseMidi: MThd found anywhere — RIFF-wrapped and junk-prefixed files parse", () => {
  installSong();
  const out = val(`(() => {
    const s = {ppq: 480, timesig: [4, 4], tempos: [{tick: 0, usq: 500000, sec: 0}],
      tracks: [{name: "pulse1", notes: [{t: 0, d: 480, p: 60, v: 80}]}]};
    const clean = writeMidi(s);
    // fake an .rmi-style prefix: 20 bytes of RIFF-ish junk before MThd
    const prefix = Uint8Array.from("RIFF....RMIDdata....", c => c.charCodeAt(0));
    const wrapped = new Uint8Array(prefix.length + clean.length);
    wrapped.set(prefix, 0);
    wrapped.set(clean, prefix.length);
    const p = parseMidi(wrapped.buffer);
    return {ppq: p.ppq, notes: p.tracks[0].notes.map(n => [n.t, n.p])};
  })()`);
  assert.equal(out.ppq, 480);
  assert.deepEqual(out.notes, [[0, 60]]);
});

test("m3u playlists: track names parse from the emu-scene format", () => {
  const text = [
    "# Mega Man II",
    "mm2.nsf::NSF,3,Mega Man II - Ogeretsu Kun\\, Manami Matsumae - Flash Man,0:01:17,,0:00:06",
    "mm2.nsf::NSF,11,Mega Man II - Ogeretsu Kun\\, Manami Matsumae - Dr. Wily's Castle,0:02:30,,0:00:11",
    "mm2.nsf::NSF,12,Game - Artist - Dr. Wily's Castle II,0:01:16,,0:00:07",
    "not a track line",
  ].join("\n");
  const list = val(`parseM3u(${JSON.stringify(text)})`);
  assert.deepEqual(list.map(e => [e.n, e.title]), [
    [3, "Flash Man"],
    [11, "Dr. Wily's Castle"], // escaped commas in artist survive; order = playlist order
    [12, "Dr. Wily's Castle II"],
  ]);
});

test("split at cursor / split in half / join — one undo step each", () => {
  installSong();
  run(`
    songKey = "albums/compositions/nightroll/split-test.mid";
    song.tracks = [{name: "pulse1", notes: [
      {t: 0, d: 960, p: 60, v: 80}, {t: 0, d: 960, p: 64, v: 80}, {t: 1920, d: 480, p: 60, v: 80}]}];
    song.rawNotes = null; chopS = 0;
    multiSel = [{ti: 0, ni: 0}, {ti: 0, ni: 1}]; multiSelKey = new Set(["0:0", "0:1"]);
    selNote = null; editUndo = []; pencilDur = 1; pencilVel = 80; selTrack = 0; playCursor = 480;
  `);
  // cursor at 480 crosses both selected notes; the note at 1920 is unselected and untouched
  assert.equal(run(`splitSelectionAt(playCursor)`), 2);
  assert.deepEqual(val(`song.tracks[0].notes.filter(n => !n.gone).map(n => [n.t, n.d, n.p]).sort((a,b)=>a[0]-b[0]||a[2]-b[2])`),
    [[0, 480, 60], [0, 480, 64], [480, 480, 60], [480, 480, 64], [1920, 480, 60]]);
  assert.equal(val(`editUndo.length`), 1);
  assert.equal(val(`editUndo[0].kind`), "group");
  // join everything on pitch 60 back into one note
  run(`multiSel = [{ti:0,ni:0},{ti:0,ni:3}]; multiSelKey = new Set(["0:0","0:3"]);`);
  assert.equal(run(`joinSelection()`), 2);
  assert.deepEqual(val(`song.tracks[0].notes.filter(n => !n.gone && n.p === 60).map(n => [n.t, n.d]).sort((a,b)=>a[0]-b[0])`),
    [[0, 960], [1920, 480]]);
  // undo the join (one step), then undo the split (one step) — original three notes back
  run(`editUndoPop()`);
  run(`editUndoPop()`);
  assert.deepEqual(val(`song.tracks[0].notes.filter(n => !n.gone).map(n => [n.t, n.d, n.p])`),
    [[0, 960, 60], [0, 960, 64], [1920, 480, 60]]);
  // cursor outside the selection: halves mode
  run(`multiSel = [{ti:0,ni:2}]; multiSelKey = new Set(["0:2"]); playCursor = 0;`);
  assert.equal(run(`splitSelectionAt(playCursor) || splitSelectionHalves()`), 1);
  assert.deepEqual(val(`song.tracks[0].notes.filter(n => !n.gone && n.t >= 1920).map(n => [n.t, n.d])`),
    [[1920, 240], [2160, 240]]);
  run(`songKey = null; multiSel = []; multiSelKey = new Set(); editUndo = [];`);
});

test("insert chord: triad and seventh at the cursor, cursor walks, one undo", () => {
  installSong();
  run(`
    songKey = "albums/compositions/nightroll/chord-test.mid";
    song.tracks = [{name: "pulse1", notes: []}];
    song.rawNotes = null; chopS = 0; selTrack = 0;
    multiSel = []; multiSelKey = new Set(); selNote = null;
    editUndo = []; pencilDur = 1; pencilVel = 80; playCursor = 0;
  `);
  // Am triad at the cursor (A4=69), quarter note
  assert.equal(run(`insertChordAt(playCursor, 9, "m", 4)`), 3);
  assert.deepEqual(val(`song.tracks[0].notes.map(n => [n.t, n.d, n.p])`),
    [[0, 480, 69], [0, 480, 72], [0, 480, 76]]);
  assert.equal(val(`playCursor`), 480);
  // next insert lands right after: Fmaj7 = four notes
  assert.equal(run(`insertChordAt(playCursor, 5, "maj7", 4)`), 4);
  assert.deepEqual(val(`song.tracks[0].notes.slice(3).map(n => [n.t, n.p])`),
    [[480, 65], [480, 69], [480, 72], [480, 76]]);
  // inserted notes are the selection; one undo removes the whole chord
  assert.equal(val(`multiSel.length`), 4);
  run(`editUndoPop()`);
  assert.equal(val(`song.tracks[0].notes.filter(n => !n.gone).length`), 3);
  run(`songKey = null; multiSel = []; multiSelKey = new Set(); editUndo = [];`);
});

test("insert progression: numerals resolve, chords land in slots, one undo", () => {
  installSong();
  run(`
    songKey = "albums/compositions/nightroll/prog-test.mid";
    song.tracks = [{name: "pulse1", notes: []}];
    song.rawNotes = null; chopS = 0; selTrack = 0;
    multiSel = []; multiSelKey = new Set(); selNote = null;
    editUndo = []; pencilDur = 0.5; pencilVel = 80; playCursor = 0;
  `);
  // "i – ♭VI – ♭III – ♭VII" in A minor (tonic pc 9, octave 4): Am, F, C, G — eighths
  assert.equal(run(`insertProgressionAt(0, "i – ♭VI – ♭III – ♭VII", 9, 4)`), 12);
  assert.deepEqual(val(`song.tracks[0].notes.map(n => [n.t, n.p])`), [
    [0, 69], [0, 72], [0, 76],        // Am
    [240, 65], [240, 69], [240, 72],  // F
    [480, 60], [480, 64], [480, 67],  // C
    [720, 67], [720, 71], [720, 74],  // G
  ]);
  assert.deepEqual(val(`song.tracks[0].notes.map(n => n.d)`).every(d => d === 240), true);
  assert.equal(val(`playCursor`), 960);
  assert.equal(val(`multiSel.length`), 12);
  // sevenths + diminished parse: "Imaj7 – vi7 – ♯iv°" in C
  assert.equal(run(`insertProgressionAt(playCursor, "Imaj7 – vi7 – ♯iv°", 0, 4)`), 11);
  // one undo removes the whole second progression
  run(`editUndoPop()`);
  assert.equal(val(`song.tracks[0].notes.filter(n => !n.gone).length`), 12);
  // explicit duration overrides the pencil: half-note chords
  run(`playCursor = 0;`);
  assert.equal(run(`insertChordAt(0, 0, "maj", 4, 2)`), 3);
  assert.equal(val(`song.tracks[0].notes.filter(n => !n.gone).slice(-1)[0].d`), 960);
  assert.equal(val(`playCursor`), 960);
  run(`songKey = null; multiSel = []; multiSelKey = new Set(); editUndo = [];`);
});

test("writeMidi: drum tracks export on channel 10, others skip it", () => {
  installSong();
  const bytes = val(`Array.from(writeMidi({ppq: 480, tempos: [{tick: 0, usq: 500000}], timesig: [4, 4],
    tracks: [{name: "pulse1", notes: [{t: 0, d: 240, p: 60, v: 80}]},
             {name: "drums", notes: [{t: 0, d: 120, p: 36, v: 100}]}]}))`);
  const hex = bytes.map(b => b.toString(16).padStart(2, "0")).join(" ");
  assert.ok(hex.includes("99 24 64"), "drum note-on on channel 9 (0x99, kick 36, vel 100)");
  assert.ok(hex.includes("90 3c 50"), "melodic note-on stays channel 0");
});

test("redo: replays undone edits; a fresh edit clears redo history", () => {
  installSong();
  run(`
    songKey = "albums/compositions/nightroll/redo-test.mid";
    song.tracks = [{name: "pulse1", notes: [{t: 0, d: 480, p: 60, v: 80}]}];
    song.rawNotes = null; chopS = 0; selTrack = 0;
    multiSel = [{ti: 0, ni: 0}]; multiSelKey = new Set(["0:0"]);
    selNote = null; editUndo = []; editRedo = []; pencilDur = 1; pencilVel = 80; playCursor = 0;
  `);
  // move up a third, undo, redo — the move comes back
  assert.equal(run(`nudgeSelection(0, 4)`), true);
  run(`editUndoPop()`);
  assert.equal(val(`song.tracks[0].notes[0].p`), 60);
  run(`editRedoPop()`);
  assert.equal(val(`song.tracks[0].notes[0].p`), 64);
  // undo again, then a FRESH edit forks history: redo stack clears
  run(`editUndoPop()`);
  assert.equal(run(`nudgeSelection(480, 0)`), true);
  assert.equal(val(`editRedo.length`), 0);
  run(`editRedoPop()`); // no-op
  assert.deepEqual(val(`[song.tracks[0].notes[0].t, song.tracks[0].notes[0].p]`), [480, 60]);
  // delete → undo → redo round-trip through batch kinds
  run(`multiSel = [{ti: 0, ni: 0}]; multiSelKey = new Set(["0:0"]);`);
  assert.equal(run(`deleteSelection()`), 1);
  run(`editUndoPop()`);
  assert.equal(val(`song.tracks[0].notes.filter(n => !n.gone).length`), 1);
  run(`editRedoPop()`);
  assert.equal(val(`song.tracks[0].notes.filter(n => !n.gone).length`), 0);
  run(`songKey = null; multiSel = []; multiSelKey = new Set(); editUndo = []; editRedo = [];`);
});

test("paste never stacks an identical note; unisons across tracks untouched", () => {
  installSong();
  run(`
    songKey = "albums/compositions/nightroll/stack-test.mid";
    song.tracks = [{name: "pulse1", notes: [{t: 0, d: 480, p: 60, v: 80}]},
                   {name: "pulse2", notes: [{t: 0, d: 480, p: 60, v: 80}]}];
    song.rawNotes = null; chopS = 0; selTrack = 0;
    multiSel = [{ti: 0, ni: 0}]; multiSelKey = new Set(["0:0"]);
    selNote = null; editUndo = []; editRedo = []; pencilDur = 1; pencilVel = 80; playCursor = 0;
  `);
  // paste right back onto itself: nothing stacks
  assert.equal(run(`copySelection()`), 1);
  assert.equal(run(`pasteClipboard(0)`), 0);
  assert.equal(val(`song.tracks[0].notes.filter(n => !n.gone).length`), 1);
  // paste one beat later works
  assert.equal(run(`pasteClipboard(480)`), 1);
  // chord insert over an existing root only adds the missing tones
  run(`playCursor = 0;`);
  assert.equal(run(`insertChordAt(0, 0, "maj", 4, 1)`), 2); // C4 exists — only E4+G4 land
  // the cross-track unison (pulse2's C4) was never touched
  assert.equal(val(`song.tracks[1].notes.filter(n => !n.gone).length`), 1);
  run(`songKey = null; multiSel = []; multiSelKey = new Set(); editUndo = []; rollnotes = [];`);
});

test("stranded ⧉ clones evaporate; dragged clones survive", () => {
  installSong();
  run(`
    songKey = "albums/compositions/nightroll/sweep-test.mid";
    song.tracks = [{name: "pulse1", notes: [{t: 0, d: 480, p: 60, v: 80}]}];
    song.rawNotes = null; chopS = 0; selTrack = 0;
    multiSel = [{ti: 0, ni: 0}]; multiSelKey = new Set(["0:0"]);
    selNote = null; editUndo = []; editRedo = []; dupPending = null; pencilDur = 1; pencilVel = 80;
  `);
  // ⧉ then wander off: the untouched clone evaporates, with its undo entry
  assert.equal(run(`duplicateSelectionInPlace()`), true);
  assert.equal(val(`song.tracks[0].notes.filter(n => !n.gone).length`), 2);
  run(`clearMultiSel()`);
  assert.equal(val(`song.tracks[0].notes.filter(n => !n.gone).length`), 1);
  assert.equal(val(`editUndo.length`), 0);
  // ⧉ then MOVE: the clone is a real note and stays
  run(`multiSel = [{ti: 0, ni: 0}]; multiSelKey = new Set(["0:0"]);`);
  assert.equal(run(`duplicateSelectionInPlace()`), true);
  assert.equal(run(`nudgeSelection(480, 0)`), true);
  run(`clearMultiSel()`);
  assert.equal(val(`song.tracks[0].notes.filter(n => !n.gone).length`), 2);
  run(`songKey = null; multiSel = []; multiSelKey = new Set(); editUndo = []; dupPending = null;`);
});

test("notesTxtFor: text dump matches the pipeline format", () => {
  installSong();
  run(`
    songKey = "albums/compositions/nightroll/dump-test.mid";
    song.timesig = [4, 4];
    song.tempos = [{tick: 0, usq: 500000}];
    song.tracks = [{name: "pulse1", notes: [{t: 0, d: 480, p: 60, v: 80}, {t: 480, d: 240, p: 64, v: 80}]}];
  `);
  const txt = val(`notesTxtFor()`);
  assert.ok(txt.startsWith("# dump-test.mid — 4/4, 120bpm, 1 bars"), txt.split("\n")[0]);
  assert.ok(txt.includes("## track 1 (pulse1)"));
  assert.ok(txt.includes("bar 1: 1 C4 1, 2 E4 0.5"));
  run(`songKey = null;`);
});

test("renameTrack: directives migrate (dupes included), name collisions refused", () => {
  installSong();
  run(`
    songKey = "albums/compositions/nightroll/rn-test.mid";
    song.tracks = [{name: "pulse1", notes: [{t: 0, d: 480, p: 60, v: 80}]},
                   {name: "pulse2", notes: []}];
    song.rawNotes = null; chopS = 0; selTrack = 0; editUndo = []; editRedo = [];
    rollnotes = deriveNoteTypes([
      {b1: 1, q1: 1, b2: null, q2: null, text: "track: pulse1 voice=sawtooth", added: false},
      {b1: 1, q1: 1, b2: null, q2: null, text: "track: pulse1 voice=sawtooth vol=1.1", added: true},
    ]).map(resolveNote);
    finalizeNotes();
  `);
  assert.equal(run(`renameTrack(0, "pulse2")`), "another track is already called that");
  assert.equal(run(`renameTrack(0, "top")`), null);
  assert.equal(val(`song.tracks[0].name`), "top");
  // every directive migrated (load-time dedupe may collapse them, but none may point at the old name)
  assert.equal(val(`rollnotes.filter(n => n.trackdir && n.trackdir.name === "pulse1").length`), 0);
  assert.ok(val(`rollnotes.some(n => n.trackdir && n.trackdir.name === "top")`));
  // settings survived the migration
  assert.equal(val(`song.tracks[0].voice`), "sawtooth");
  run(`songKey = null; rollnotes = [];`);
});

test("attached notes on all annotation types round-trip", () => {
  installSong();
  run(`song = {ppq: 480, timesig: [4, 4], tempos: [{tick: 0, usq: 500000}], tracks: [{name: "t", notes: []}]};
    songKey = "albums/compositions/nightroll/attach-test.mid";`);
  run(`rollnotes = deriveNoteTypes([
    {b1: 1, q1: 1, b2: null, q2: null, text: "key: Bb?\\nwhole-tone material", added: true},
    {b1: 2, q1: 1, b2: null, q2: null, text: "tempo: 75\\nfelt right slower", added: true},
    {b1: 3, q1: 1, b2: null, q2: null, text: "loop: 2.4\\nseam = drum entry", added: true},
    {b1: 4, q1: 1, b2: null, q2: null, text: "plain note\\nsecond line stays", added: true},
  ]).map(resolveNote); finalizeNotes();`);
  assert.equal(val(`rollnotes.find(n => n.keypartial).cnote`), "whole-tone material");
  assert.equal(val(`rollnotes.find(n => n.tempodir).cnote`), "felt right slower");
  assert.equal(val(`rollnotes.find(n => n.loopTo !== undefined).cnote`), "seam = drum entry");
  assert.equal(run(`String(rollnotes.find(n => n.text.startsWith("plain")).cnote)`), "undefined");
  assert.ok(val(`rollnotes.find(n => n.text.startsWith("plain")).text`).includes("second line"));
  const json = JSON.parse(run(`serializeRollnotes()`));
  assert.equal(json.notes.find(n => n.type === "key").note, "whole-tone material");
  assert.equal(json.notes.find(n => n.type === "tempo").note, "felt right slower");
  assert.equal(json.notes.find(n => n.type === "loop").note, "seam = drum entry");
  run(`rollnotes = parseRollnotesJSON(serializeRollnotes()).map(resolveNote); finalizeNotes();`);
  assert.equal(val(`rollnotes.find(n => n.tempodir).cnote`), "felt right slower");
  run(`rollnotes = [];`);
});

test("chord bands ride rigid moves; stale flag when notes stop matching", () => {
  installSong();
  run(`
    songKey = "albums/compositions/nightroll/band-ride.mid";
    song = {ppq: 480, timesig: [4, 4], tempos: [{tick: 0, usq: 500000}],
      tracks: [{name: "pulse1", notes: [
        {t: 0, d: 480, p: 60, v: 80}, {t: 0, d: 480, p: 64, v: 80}, {t: 0, d: 480, p: 67, v: 80}]}]};
    song.rawNotes = null; chopS = 0; selTrack = 0; editUndo = []; editRedo = []; dupPending = null;
    rollnotes = deriveNoteTypes([
      {b1: 1, q1: 1, b2: 1, q2: 2, text: "chord: C", added: true},
    ]).map(resolveNote);
    finalizeNotes();
    multiSel = [{ti: 0, ni: 0}, {ti: 0, ni: 1}, {ti: 0, ni: 2}];
    multiSelKey = new Set(["0:0", "0:1", "0:2"]);
  `);
  // rigid move up 2 semitones and one beat right: band slides AND transposes
  assert.equal(run(`nudgeSelection(480, 2)`), true);
  const band = val(`(() => { const b = rollnotes.find(n => n.chord); return {text: b.text, b1: b.b1, q1: b.q1}; })()`);
  assert.equal(band.text, "D");
  assert.equal(band.b1, 1);
  assert.equal(band.q1, 2);
  // now move ONE note out from under the band: no ride — and no unsolicited
  // flag either (label review is on-demand only; Josh's rule)
  run(`multiSel = [{ti: 0, ni: 1}]; multiSelKey = new Set(["0:1"]);`);
  assert.equal(run(`nudgeSelection(0, 1)`), true); // E→F over a D label
  assert.equal(val(`rollnotes.find(n => n.chord).stale || null`), null); // silent until asked
  run(`updateChordStale()`); // the Check-labels button's path
  const after = val(`(() => { const b = rollnotes.find(n => n.chord); return {text: b.text, stale: b.stale || null}; })()`);
  assert.equal(after.text, "D"); // never rewritten
  assert.ok(after.stale); // flagged because we ASKED
  run(`nudgeSelection(0, 1)`); // any note edit retires review flags
  assert.equal(val(`rollnotes.find(n => n.chord).stale || null`), null);
  run(`songKey = null; rollnotes = []; multiSel = []; multiSelKey = new Set();`);
});

test("full-song move carries the whole annotation layer (intro-cut workflow)", () => {
  installSong();
  run(`
    songKey = "albums/compositions/nightroll/carry-test.mid";
    song = {ppq: 480, timesig: [4, 4], tempos: [{tick: 0, usq: 500000}],
      tracks: [{name: "pulse1", notes: [
        {t: 1920, d: 480, p: 60, v: 80}, {t: 3840, d: 480, p: 64, v: 80}]}]};
    song.rawNotes = null; chopS = 0; selTrack = 0; editUndo = []; editRedo = []; dupPending = null;
    rollnotes = deriveNoteTypes([
      {b1: 2, q1: 1, b2: 3, q2: 4, text: "section: A", added: true},
      {b1: 2, q1: 1, b2: 2, q2: 4, text: "chord: C", added: true},
      {b1: 3, q1: 2, text: "loop: 2.1", added: true},
      {b1: 1, q1: 1, text: "track: pulse1 voice=square50", added: true},
    ]).map(resolveNote);
    finalizeNotes();
    multiSel = [{ti: 0, ni: 0}, {ti: 0, ni: 1}];
    multiSelKey = new Set(["0:0", "0:1"]);
  `);
  // every note moved one bar left: sections, chords, and the loop (anchor AND
  // target) slide with them; the track directive keeps its bar-1 anchor
  assert.equal(run(`nudgeSelection(-1920, 0)`), true);
  const rn = val(`rollnotes.map(n => ({text: n.text, b1: n.b1, q1: n.q1, b2: n.b2 || null,
    section: !!n.section, chord: !!n.chord, loop: n.loopTo !== undefined, track: !!n.trackdir}))`);
  const sec = rn.find(n => n.section);
  assert.equal(sec.b1, 1); assert.equal(sec.b2, 2);
  assert.equal(rn.find(n => n.chord && !n.section).b1, 1);
  const loop = rn.find(n => n.loop);
  assert.equal(loop.text, "loop: 1.1"); // target followed the move
  assert.equal(loop.b1, 2); assert.equal(loop.q1, 2);
  assert.equal(rn.find(n => n.track).b1, 1); // pinned
  // vertical whole-song move transposes chord labels (time anchors untouched)
  assert.equal(run(`nudgeSelection(0, 2)`), true);
  assert.equal(val(`rollnotes.find(n => n.chord && !n.section).text`), "D");
  // ⟲ restores notes AND annotations together (the half-undo bug, 2026-08-20)
  run(`editUndoPop()`);
  assert.equal(val(`rollnotes.find(n => n.chord && !n.section).text`), "C"); // label back
  assert.equal(val(`song.tracks[0].notes[0].p`), 60); // note back with it
  run(`editUndoPop()`);
  const back = val(`rollnotes.map(n => ({b1: n.b1, text: n.text, loop: n.loopTo !== undefined, added: !!n.added}))`);
  assert.equal(back.find(n => n.loop).text, "loop: 2.1"); // loop target restored
  assert.equal(back.find(n => n.text === "A" || n.text.startsWith("section") || n.b1 === 2 && !n.loop).b1, 2);
  assert.ok(back.every(n => n.added)); // added flags survive the round-trip
  // and ⟳ replays the carry
  run(`editRedoPop()`);
  assert.equal(val(`rollnotes.find(n => n.loopTo !== undefined).text`), "loop: 1.1");
  run(`songKey = null; rollnotes = []; multiSel = []; multiSelKey = new Set(); editUndo = []; editRedo = [];`);
});

test("chord quality parse/compose: bases + stacked extensions round-trip", () => {
  installSong();
  const cases = [["", "maj", []], ["m7add9", "m", ["7", "add9"]], ["7b9", "maj", ["7", "b9"]],
                 ["dim7", "dim", ["7"]], ["m7b5", "m", ["7", "b5"]], ["maj9", "maj", ["maj9"]],
                 ["sus4", "sus4", []], ["5", "5", []], ["6", "maj", ["6"]],
                 ["madd13", "m", ["add13"]], ["7#5b9", "maj", ["7", "#5", "b9"]],
                 ["maj13", "maj", ["maj13"]], ["69", "maj", ["6", "9"]],
                 ["7b13", "maj", ["7", "b13"]]];
  for (const [q, base, exts] of cases) {
    const got = val(`chordQualParse(${JSON.stringify(q)})`);
    assert.deepEqual(got, {base, exts}, q);
    assert.equal(val(`chordQualCompose(${JSON.stringify(base)}, ${JSON.stringify(exts)})`), q);
  }
  assert.equal(val(`chordQualParse("weird") || null`), null); // unknown: chips stand down
});

test("transposeTrack: whole track ±12, one undo step, drums refuse", () => {
  installSong();
  run(`
    songKey = "albums/compositions/nightroll/oct-test.mid";
    song = {ppq: 480, timesig: [4, 4], tempos: [{tick: 0, usq: 500000}],
      tracks: [
        {name: "bass", notes: [{t: 0, d: 480, p: 40, v: 90}, {t: 480, d: 480, p: 43, v: 90}]},
        {name: "drums", notes: [{t: 0, d: 60, p: 36, v: 100}]}]};
    song.tracks[1].drums = true;
    song.rawNotes = null; chopS = 0; selTrack = 0; editUndo = []; editRedo = []; dupPending = null;
    rollnotes = []; finalizeNotes();
  `);
  assert.equal(val(`transposeTrack(0, 12)`), 2);
  assert.deepEqual(val(`song.tracks[0].notes.map(n => n.p)`), [52, 55]);
  assert.equal(val(`transposeTrack(0, 12)`), 2); // stacking taps stack octaves
  assert.deepEqual(val(`song.tracks[0].notes.map(n => n.p)`), [64, 67]);
  run(`editUndoPop()`); // each tap is exactly one step
  assert.deepEqual(val(`song.tracks[0].notes.map(n => n.p)`), [52, 55]);
  run(`editUndoPop()`);
  assert.deepEqual(val(`song.tracks[0].notes.map(n => n.p)`), [40, 43]);
  assert.equal(val(`transposeTrack(1, 12)`), 0); // kit pitches are instruments
  run(`songKey = null; rollnotes = [];`);
});

test("divideSelection: N equal parts, triplet math exact, one undo", () => {
  installSong();
  run(`
    songKey = "albums/compositions/nightroll/div-test.mid";
    song.tracks = [{name: "pulse1", notes: [{t: 0, d: 960, p: 60, v: 90}]}]; // a half note
    song.rawNotes = null; chopS = 0; editUndo = []; editRedo = []; dupPending = null;
    multiSel = [{ti: 0, ni: 0}]; multiSelKey = new Set(["0:0"]);
  `);
  assert.equal(val(`divideSelection(3)`), 1); // quarter-note triplets: 1, 1.667, 2.333
  const parts = val(`song.tracks[0].notes.filter(n => !n.gone).map(n => ({t: n.t, d: n.d, p: n.p, v: n.v}))`);
  assert.deepEqual(parts.map(n => n.t).sort((a, b) => a - b), [0, 320, 640]);
  assert.ok(parts.every(n => n.d === 320 && n.p === 60 && n.v === 90)); // inherit everything
  assert.equal(val(`multiSel.length`), 3); // the pieces are the new selection
  run(`editUndoPop()`); // one step back to the whole note
  assert.deepEqual(val(`song.tracks[0].notes.filter(n => !n.gone).map(n => n.d)`), [960]);
  // 5 into a quarter distributes the remainder without gaps
  run(`multiSel = [{ti: 0, ni: 0}]; multiSelKey = new Set(["0:0"]); song.tracks[0].notes[0].d = 480;`);
  assert.equal(val(`divideSelection(5)`), 1);
  const five = val(`song.tracks[0].notes.filter(n => !n.gone).map(n => ({t: n.t, d: n.d})).sort((a, b) => a.t - b.t)`);
  assert.equal(five.length, 5);
  for (let i = 1; i < 5; i++) assert.equal(five[i].t, five[i - 1].t + five[i - 1].d); // seamless
  assert.equal(five[4].t + five[4].d, 480); // total span unchanged
  run(`songKey = null; multiSel = []; multiSelKey = new Set();`);
});

test("rulerSnapX: bar lines are magnetic in pixels; 16ths elsewhere", () => {
  installSong();
  run(`view.pxq = 200; view.x = 0;`); // 1 bar = 800px, 14px magnet ≈ 33 ticks
  const at = x => val(`rulerSnapX(RULER_W + ${x})`);
  assert.equal(at(800), 1920); // dead on bar 2
  assert.equal(at(790), 1920); // 10px shy: magnet grabs it
  assert.equal(at(812), 1920); // 12px past: magnet grabs it
  assert.equal(at(760), 1800); // 40px shy: a 16th, not the bar
  run(`view.pxq = 60;`); // zoomed out: same 14px radius = more ticks
  assert.equal(at(233), 1920); // ~7px shy of bar 2 (240px)
  run(`songKey = null;`);
});

test("HELP.md matches the help sheet (regenerate with node tools/build_help.mjs)", async () => {
  const { buildHelp } = await import("../tools/build_help.mjs");
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  const md = readFileSync(new URL("../HELP.md", import.meta.url), "utf8");
  assert.equal(md, buildHelp(html), "HELP.md is stale — run: node tools/build_help.mjs");
});

test("selection editing: move, resize, copy/paste, delete — with undo restoring", () => {
  installSong();
  run(`
    songKey = "albums/compositions/nightroll/edit-test.mid";
    song.tracks = [{name: "pulse1", notes: [
      {t: 0, d: 480, p: 60, v: 80}, {t: 0, d: 480, p: 64, v: 80}, {t: 0, d: 480, p: 67, v: 80}]}];
    song.rawNotes = null; chopS = 0;
    multiSel = [{ti: 0, ni: 0}, {ti: 0, ni: 1}, {ti: 0, ni: 2}];
    multiSelKey = new Set(["0:0", "0:1", "0:2"]);
    selNote = null; editUndo = []; pencilDur = 1; pencilVel = 80; selTrack = 0; playCursor = 0;
  `);
  // move the whole chord up a third and one beat right
  assert.equal(run(`nudgeSelection(480, 4)`), true);
  assert.deepEqual(val(`song.tracks[0].notes.map(n => [n.t, n.p])`),
    [[480, 64], [480, 68], [480, 71]]);
  // shrink every note by half (the chord shortens as one)
  assert.equal(run(`resizeSelection(-240)`), true);
  assert.deepEqual(val(`song.tracks[0].notes.map(n => n.d)`), [240, 240, 240]);
  // copy, paste at beat 3 (tick 960): a progression from one pencil pass
  assert.equal(run(`copySelection()`), 3);
  run(`playCursor = 960;`);
  assert.equal(run(`pasteClipboard(playCursor)`), 3);
  assert.deepEqual(val(`song.tracks[0].notes.filter(n => !n.gone).map(n => [n.t, n.p, n.d]).slice(3)`),
    [[960, 64, 240], [960, 68, 240], [960, 71, 240]]);
  // paste selected the clones — nudge them down to a new chord
  assert.equal(run(`nudgeSelection(0, -2)`), true);
  assert.deepEqual(val(`song.tracks[0].notes.filter(n => !n.gone).map(n => n.p).slice(3)`), [62, 66, 69]);
  // undo the nudge, then undo the paste
  run(`document.getElementById("undobtn").click ? null : null;`);
  run(`(() => { const u = editUndo.pop(); for (const it of u.items) { const nn = song.tracks[it.ti].notes[it.ni]; nn.t = it.t; nn.d = it.d; nn.p = it.p; } })()`);
  assert.deepEqual(val(`song.tracks[0].notes.filter(n => !n.gone).map(n => n.p).slice(3)`), [64, 68, 71]);
  // delete the pasted chord
  assert.equal(run(`deleteSelection()`), 3);
  assert.equal(val(`song.tracks[0].notes.filter(n => !n.gone).length`), 3);
  run(`songKey = null; multiSel = []; multiSelKey = new Set(); song.rawNotes = null;`);
});
