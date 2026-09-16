// Audio tracks end to end, in the OPFS folder sandbox (?folder=opfs): import a
// recording, see it decode into a clip, schedule it, save it beside the .mid,
// and get it back after a reload. Chromium only (OPFS writable streams).
import { test, expect } from "@playwright/test";

const OPFS = "/index.html?folder=opfs";
const KEY = "albums/compositions/nightroll/e2e-audio.mid";

async function wipe(page) {
  await page.evaluate(async () => {
    const root = await navigator.storage.getDirectory();
    for await (const [n] of root.entries()) await root.removeEntry(n, { recursive: true });
    for (const k of Object.keys(localStorage)) if (k.includes("e2e-audio")) localStorage.removeItem(k);
    try { await idbAudioDelete("albums/compositions/nightroll/e2e-audio.mid|tone.wav"); } catch (e) {}
  });
}
async function open(page) {
  await page.route(/^(?!.*localhost)/, r => r.abort());
  await page.goto(OPFS);
  await page.waitForFunction(() => { try { return !!song; } catch (e) { return false; } }, null, { timeout: 15000 });
}

test.describe("audio tracks", () => {
  test.skip(({ browserName }) => browserName !== "chromium", "OPFS + OfflineAudioContext decode: chromium only");
  test.afterEach(async ({ page }) => { await wipe(page); });

  test("import → clip decodes → schedules → saves beside the .mid → reloads @smoke", async ({ page }) => {
    await open(page);
    await wipe(page);
    await page.evaluate(() => { localStorage.removeItem("ff1roll-ghtoken"); createComposition("e2e-audio", 120, 4, 4); });
    // import the fixture through the same path the ＋∿ chip uses
    await page.evaluate(async () => {
      const r = await fetch("/tests/e2e/fixtures/tone.wav");
      const bytes = new Uint8Array(await r.arrayBuffer());
      playCursor = barTicks(); // land at bar 2
      await importAudioFiles([{ name: "tone.wav", bytes, type: "audio/wav" }]);
    });
    const tr = await page.evaluate(() => { const t = song.tracks[song.tracks.length - 1]; return { name: t.name, kind: t.kind, at: t.clip && t.clip.at }; });
    expect(tr.name).toBe("tone");
    expect(tr.kind).toBe("audio");
    expect(tr.at).toBe(4 * 480);
    // the OfflineAudioContext decode lands without any user gesture
    await page.waitForFunction(() => song.tracks[song.tracks.length - 1].clip.status === "ready", null, { timeout: 10000 });
    const clip = await page.evaluate(() => { const c = song.tracks[song.tracks.length - 1].clip; return { dur: c.dur, peaks: c.peaks.length, where: c.where }; });
    expect(clip.dur).toBeCloseTo(1.0, 1);
    expect(clip.peaks).toBeGreaterThan(100);
    expect(clip.where).toBe("device");
    // one clip event in the schedule, at bar 2 = 2s at 120bpm, lasting the file
    const ev = await page.evaluate(() => { buildSchedule(); return schedEvents.filter(e => e.n._clip).map(e => ({ sec: e.sec, dur: e.dur })); });
    expect(ev.length).toBe(1);
    expect(ev[0].sec).toBeCloseTo(2, 3);
    expect(ev[0].dur).toBeCloseTo(1, 1);
    // align-first-sound finds the 250ms of leading silence
    await page.evaluate(() => {
      const ti = song.tracks.length - 1, c = song.tracks[ti].clip;
      const nb = c.peaks.length / 2; let k = 0;
      while (k < nb && Math.max(-c.peaks[k * 2], c.peaks[k * 2 + 1]) < 0.02) k++;
      setClipDir(ti, { offset: +(k * PEAK_BUCKET / c.buffer.sampleRate).toFixed(3) });
    });
    const off = await page.evaluate(() => song.tracks[song.tracks.length - 1].clip.offset);
    expect(off).toBeGreaterThan(0.2);
    expect(off).toBeLessThan(0.3);
    // Save: the bytes land in <song>.audio/ next to the .mid, and the clip knows it
    await page.evaluate(async () => { await commitCompositionNow({ textContent: "" }); });
    const saved = await page.evaluate(async () => {
      const f = await folderRead("albums/compositions/nightroll/e2e-audio.audio/tone.wav");
      const rn = await folderRead("albums/compositions/nightroll/e2e-audio.rollnotes.json");
      return { size: f ? f.size : 0, hasDir: (await rn.text()).includes('"type":"audio"'), where: song.tracks[song.tracks.length - 1].clip.where };
    });
    expect(saved.size).toBeGreaterThan(1000);
    expect(saved.hasDir).toBe(true);
    expect(saved.where).toBe("folder");
    // forget the device copies, reload: the clip comes back from the folder and decodes again
    await page.evaluate(async () => {
      for (const k of Object.keys(localStorage)) if (k.includes("e2e-audio")) localStorage.removeItem(k);
      await idbAudioDelete("albums/compositions/nightroll/e2e-audio.mid|tone.wav");
    });
    await page.goto(OPFS);
    await page.waitForFunction(() => { try { return !!song && Object.keys(CATALOG).length > 0; } catch (e) { return false; } }, null, { timeout: 15000 });
    await page.evaluate(async k => { if (songKey !== k) await loadSong(k); if (song && song.notesReady) await song.notesReady; }, KEY);
    // the boot may still be loading the last song when we get here: wait for THIS song, with tracks, clip decoded
    await page.waitForFunction(k => {
      if (songKey !== k || !song || !song.tracks.length) return false;
      const t = song.tracks[song.tracks.length - 1];
      return t.kind === "audio" && !!t.clip && t.clip.status === "ready";
    }, KEY, { timeout: 15000 });
    const again = await page.evaluate(() => { const c = song.tracks[song.tracks.length - 1].clip; return { where: c.where, at: c.at, offset: c.offset }; });
    expect(again.where).toBe("folder");
    expect(again.at).toBe(4 * 480);
    expect(again.offset).toBeCloseTo(off, 3);
  });
});
