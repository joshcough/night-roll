// Gesture-decode tests driven headlessly: plain event objects through the
// REAL canvas pointer handlers (see harness.mjs event injection). These are
// vm ports of e2e specs — while both exist, the e2e twin is the referee;
// after a port proves itself green-for-green, the e2e copy can retire.
// Coordinates are canvas-space (the stubbed rect sits at 0,0).
import test from "node:test";
import assert from "node:assert/strict";
import { createApp, pev } from "./harness.mjs";

function boot(name) {
  const app = createApp();
  app.run(`createComposition(${JSON.stringify(name)}, 120, 4, 4)`);
  app.run(`
    song.tracks[0].notes.push(
      {t: 0, d: 480, p: 60, v: 80}, {t: 0, d: 480, p: 64, v: 80}, {t: 0, d: 480, p: 67, v: 80});
    draw();
  `);
  return app;
}

const selectAll = (app) => app.run(`
  multiSel = song.tracks[0].notes.map((_, ni) => ({ti: 0, ni}));
  multiSelKey = new Set(multiSel.map(s => "0:" + s.ni));
  draw();
`);

const notes = (app) => JSON.parse(app.run(
  `JSON.stringify(song.tracks[0].notes.filter(n => !n.gone).map(n => ({t: n.t, d: n.d, p: n.p})))`));

// canvas-pixel position of a tick/pitch on the roll (mirror of e2e noteXY)
const noteXY = (app, tick, pitch, ti = 0) => JSON.parse(app.run(`JSON.stringify({
  x: RULER_W + (${tick} / song.ppq) * view.pxq - view.x,
  y: RULER_H + (topRow() - noteRow(${ti}, ${pitch})) * view.rowH - view.y + view.rowH / 2,
})`));

function drag(app, from, to, props = {}, steps = 8) {
  app.dispatch("roll", pev("pointerdown", { clientX: from.x, clientY: from.y, ...props }));
  for (let i = 1; i <= steps; i++) {
    app.dispatch("roll", pev("pointermove", {
      clientX: from.x + ((to.x - from.x) * i) / steps,
      clientY: from.y + ((to.y - from.y) * i) / steps, ...props }));
  }
  app.dispatch("roll", pev("pointerup", { clientX: to.x, clientY: to.y, ...props }));
}

test("gesture: right-edge drag resizes every selected note", () => {
  const app = boot("vm-gest-resize");
  app.run(`mode = "select"`);
  selectAll(app);
  const edge = noteXY(app, 470, 64); // within the 8px-in-ticks grab zone of t+d=480
  const px16 = app.run(`(240 / song.ppq) * view.pxq`);
  drag(app, edge, { x: edge.x - px16, y: edge.y });
  assert.deepEqual(notes(app).map(n => n.d), [240, 240, 240]);
});

test("gesture: full-song move drags sections and the loop along", () => {
  const app = boot("vm-gest-move");
  app.run(`
    rollnotes = deriveNoteTypes([
      {b1: 1, q1: 1, b2: 1, q2: 2, text: "section: A", added: true},
      {b1: 1, q1: 3, text: "loop: 1.2", added: true},
    ]).map(resolveNote);
    finalizeNotes();
  `);
  selectAll(app);
  app.run(`nudgeSelection(song.ppq, 0)`); // whole song right one beat
  const rn = JSON.parse(app.run(
    `JSON.stringify(rollnotes.map(n => ({q1: n.q1, text: n.text, sec: !!n.section})))`));
  assert.equal(rn.find(n => n.sec).q1, 2);
  assert.equal(rn.find(n => n.text.startsWith("loop")).text, "loop: 1.3");
});

test("gesture: second finger flips pencil into pan — note rolled back, view scrolls", () => {
  const app = boot("vm-gest-pinch");
  app.run(`mode = "pencil"; view.pxq = 600; clampView(); draw();`);
  const before = JSON.parse(app.run(
    `JSON.stringify({x: view.x, n: song.tracks[0].notes.filter(n => !n.gone).length})`));
  const f = (type, id, x, y) => app.dispatch("roll",
    pev(type, { pointerId: id, clientX: x, clientY: y, pointerType: "touch", isPrimary: id === 1 }));
  f("pointerdown", 1, 300, 200);
  f("pointerdown", 2, 300, 300); // second finger: the gesture becomes pinch/pan
  for (let i = 1; i <= 6; i++) { f("pointermove", 1, 300 - i * 20, 200); f("pointermove", 2, 300 - i * 20, 300); }
  f("pointerup", 1, 180, 200); f("pointerup", 2, 180, 300);
  const after = JSON.parse(app.run(
    `JSON.stringify({x: view.x, n: song.tracks[0].notes.filter(n => !n.gone).length})`));
  assert.ok(after.x > before.x, `fingers left -> view scrolled right (${before.x} -> ${after.x})`);
  assert.equal(after.n, before.n); // the pencil's finger-down note was rolled back
});

test("gesture: cycle highlight stretches by its edges, both directions", () => {
  const app = boot("vm-gest-cycle");
  const xy = tk => JSON.parse(app.run(
    `JSON.stringify({x: RULER_W + (${tk} / song.ppq) * view.pxq - view.x, y: 10})`));
  drag(app, xy(480), xy(960)); // arm a one-beat cycle
  const b0 = JSON.parse(app.run(`JSON.stringify({a: rangeSel.a, b: rangeSel.b})`));
  drag(app, xy(b0.b), xy(1440)); // right edge further right
  assert.equal(app.run(`rangeSel.b`), 1440);
  drag(app, xy(480), xy(240)); // left edge further left
  assert.deepEqual(JSON.parse(app.run(`JSON.stringify({a: rangeSel.a, b: rangeSel.b})`)),
                   { a: 240, b: 1440 });
  drag(app, xy(240), xy(720)); // left edge back right (shrink)
  assert.equal(app.run(`rangeSel.a`), 720);
});

test("gesture: pen fast stroke pans; a 230ms dwell grabs (fake clock)", () => {
  const app = boot("vm-gest-dwell");
  app.run(`mode = "select"; view.pxq = 600; clampView(); draw();`);
  selectAll(app);
  const start = noteXY(app, 240, 64);
  const pen = (type, x, y) => app.dispatch("roll",
    pev(type, { pointerId: 7, pointerType: "pen", clientX: x, clientY: y }));
  // fast stroke: down, immediately sweep, up — the selection must not move
  pen("pointerdown", start.x, start.y);
  for (let i = 1; i <= 5; i++) pen("pointermove", start.x - i * 30, start.y);
  pen("pointerup", start.x - 150, start.y);
  assert.deepEqual(notes(app).map(n => n.t), [0, 0, 0]);
  // dwell: down, tick past the hold, then sweep — now it drags
  const s2 = noteXY(app, 240, 64);
  pen("pointerdown", s2.x, s2.y);
  app.tick(230);
  const px16 = app.run(`(240 / song.ppq) * view.pxq`);
  for (let i = 1; i <= 4; i++) pen("pointermove", s2.x + (px16 / 4) * i, s2.y);
  pen("pointerup", s2.x + px16, s2.y);
  assert.deepEqual(notes(app).map(n => n.t), [240, 240, 240]);
});
