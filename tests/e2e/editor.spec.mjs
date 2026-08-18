// Gesture-layer specs: real pointer events through the real canvas — the
// territory where the lasso-drag, id-collision, and off-screen-fill bugs
// lived. Chromium = desktop; webkit ≈ iPad Safari.
import { test, expect } from "@playwright/test";
import { openApp, newComposition, seedChord, selectAll, noteXY, drag, notes, cleanup } from "./helpers.mjs";

test.beforeEach(async ({ page }) => {
  await openApp(page);
  await newComposition(page);
  await seedChord(page);
});
test.afterEach(async ({ page }) => cleanup(page));

test("drag moves the whole selection as a chord (lasso mode stays on)", async ({ page }) => {
  await selectAll(page);
  await page.evaluate(() => { lassoMode = true; draw(); });
  const from = await noteXY(page, 240, 64);
  const up3 = await page.evaluate(() => view.rowH * 3);
  await drag(page, from, { x: from.x, y: from.y - up3 });
  expect((await notes(page)).map(n => n.p).sort((a, b) => a - b)).toEqual([63, 67, 70]);
});

test("dragging a selected note's right edge resizes every selected note", async ({ page }) => {
  await selectAll(page);
  const edge = await noteXY(page, 470, 64); // within the 8px-in-ticks grab zone of t+d=480
  const px16 = await page.evaluate(() => (240 / song.ppq) * view.pxq);
  await drag(page, edge, { x: edge.x - px16, y: edge.y });
  expect((await notes(page)).map(n => n.d)).toEqual([240, 240, 240]);
});

test("with no tool armed, dragging over a note only pans", async ({ page }) => {
  await page.evaluate(() => {
    document.querySelector('#modeseg button[data-mode="select"]').click(); // toggles OFF
  });
  const from = await noteXY(page, 240, 64);
  const before = await page.evaluate(() => view.x);
  await drag(page, from, { x: from.x - 90, y: from.y });
  expect(await page.evaluate(() => view.x)).not.toBe(before);
  expect((await notes(page)).map(n => n.t)).toEqual([0, 0, 0]); // untouched
});

test("pencil tap places one grid unit; pencil drag stretches the note", async ({ page }) => {
  await page.evaluate(() => {
    document.querySelector('#modeseg button[data-mode="pencil"]').click();
    pencilDur = 0.25;
  });
  const at = await noteXY(page, 960, 72);
  await page.mouse.click(at.x, at.y);
  const stretchFrom = await noteXY(page, 1440, 76);
  const px480 = await page.evaluate(() => (480 / song.ppq) * view.pxq);
  await drag(page, stretchFrom, { x: stretchFrom.x + px480, y: stretchFrom.y });
  const added = (await notes(page)).slice(3);
  expect(added[0]).toMatchObject({ t: 960, d: 120, p: 72 });
  expect(added[1].p).toBe(76);
  expect(added[1].d).toBeGreaterThanOrEqual(480);
});

test("🗑 deletes the selection; ⟲ restores it", async ({ page }) => {
  await selectAll(page);
  await page.click("#delbtn");
  expect(await notes(page)).toHaveLength(0);
  await page.click("#undobtn");
  expect(await notes(page)).toHaveLength(3);
});

test("⧉ duplicates in place and 📋 pastes at the cursor", async ({ page }) => {
  await selectAll(page);
  await page.click("#copybtn");
  expect(await notes(page)).toHaveLength(6);
  await page.click("#undobtn");
  await selectAll(page);
  await page.evaluate(() => { playCursor = 960; });
  await page.click("#pastebtn");
  const pasted = (await notes(page)).filter(n => n.t === 960);
  expect(pasted.map(n => n.p).sort((a, b) => a - b)).toEqual([60, 64, 67]);
});

test("help sheet: tabs switch sections and remember the last one", async ({ page }) => {
  await page.evaluate(() => { showHelpTab("editor"); document.getElementById("helpsheet").classList.add("on"); });
  await expect(page.locator('.hsec[data-hsec="editor"]')).toBeVisible();
  await page.click('#helptabs button[data-hs="playback"]');
  await expect(page.locator('.hsec[data-hsec="playback"]')).toBeVisible();
  await expect(page.locator('.hsec[data-hsec="editor"]')).toBeHidden();
  expect(await page.evaluate(() => localStorage.getItem("ff1roll-helptab"))).toBe("playback");
  await page.click("#helpclose");
});

test("insert dialog stamps a chord and walks the cursor", async ({ page }) => {
  await page.evaluate(() => { playCursor = 1920; }); // empty bar — inserts skip notes that already exist
  await page.click("#insbtn");
  await page.click('#chquals button[data-qual="maj7"]');
  await page.click("#chinsert");
  const added = (await notes(page)).slice(3);
  expect(added).toHaveLength(4); // maj7 = four notes
  expect(await page.evaluate(() => playCursor)).toBeGreaterThan(1920);
  await page.click("#chclose");
});

test("drum fill creates the kit and fills a backbeat; lane renders", async ({ page }) => {
  await page.click("#drumfillbtn");
  await page.click("#dpfill");
  const kit = await page.evaluate(() => {
    const di = song.tracks.findIndex((_, ti) => trackIsDrums(ti));
    return { di, n: song.tracks[di].notes.length, laneTop: kitLaneTop() };
  });
  expect(kit.di).toBeGreaterThan(0);
  expect(kit.n).toBeGreaterThan(0);
  expect(kit.laneTop).toBeLessThan(60); // docked under the C-major chord's low C
});

test("Edit menu: undo and redo round-trip a delete", async ({ page }) => {
  await selectAll(page);
  await page.click("#delbtn");
  expect(await notes(page)).toHaveLength(0);
  await page.click("#editsheetbtn");
  await page.click("#emUndo");
  expect(await notes(page)).toHaveLength(3);
  await page.click("#editsheetbtn");
  await page.click("#emRedo");
  expect(await notes(page)).toHaveLength(0);
});

test("velocity slider live-adjusts a selection with one undo step", async ({ page }) => {
  await selectAll(page);
  await page.evaluate(() => {
    const sl = document.getElementById("velslider");
    sl.value = 112;
    sl.dispatchEvent(new Event("input"));
    sl.dispatchEvent(new Event("change"));
  });
  expect((await notes(page)).map(n => n.v)).toEqual([112, 112, 112]);
  await page.click("#undobtn");
  expect((await notes(page)).map(n => n.v)).toEqual([80, 80, 80]);
});
