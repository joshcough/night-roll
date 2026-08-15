# Work order for Claude Code — 2026-08-07

Two tasks. Both are small, both are ready, neither needs anything from
Josh. **Do these and stop.** Do not scope-creep into the larger items
mentioned at the bottom.

---

## Task 1 — Surface chip volume in `.notes.txt`

### Background: a caveat Josh has been carrying is wrong

Josh has been telling Claude — and it's in his standing session framing —
that the NSF pipeline discards chip volume, so no accent data exists
anywhere. That's false. The pipeline captures it correctly:

- `tools/nsf/notes.mjs` records the 4-bit level at note start as `vol` on
  each event. The guards are right: it only stores the value when the
  constant-volume flag is set (bit 4 of `$4000`/`$4004`), since otherwise
  that field is the envelope period and means something else, and it stores
  `null` for triangle, which has no volume control.
- `tools/nsf/midi-write.mjs` maps it to MIDI velocity:
  `e.vol == null ? 96 : max(8, round(vol / 15 * 127))`.

So accent data reaches the `.mid` files, and the app's note inspector
already displays velocity. **The only place it's missing is
`.notes.txt`** — which is the one view Josh has when analyzing from the
chat app, so from where he sits the data looks gone.

### The work

Add volume to the `.notes.txt` dumps written by `tools/nsf/dump-all.mjs`.
Regenerate the FF1 album's dumps.

**Format is your call.** Josh explicitly declined to specify it
(2026-08-07) on the grounds that these files are read by Claude, not by
him. Pick something sensible and note the choice in the commit message.
Whatever you pick must handle:

- Fourth field on every note vs. printed only when it changes.
- Raw 0–15 or a friendlier scale.
- `null` rendering — triangle notes and any envelope-mode note. It must
  read as "not applicable," not as "silent." This matters: a reader who
  interprets a triangle's missing volume as zero will draw wrong
  conclusions about the bass line.
- The header comment. It currently states no volume is present. Update it.

### Why it matters

Beyond correcting the record: **accent data is evidence about meter.**
Where the loud notes fall is direct evidence about where the beats are, and
meter is Josh's live open question (menu's is undetermined; the headers are
unreliable fossils with no provenance). This unblocks that work.

---

## Task 2 — Test `midiFromFreq` / `freqOf` round-trip

### Why this one first

The test suite is lopsided. The app's inline script has ~389 lines of tests
against ~4,000 lines of code, and it's good work — round-trip stability,
the piecewise tempo map, chord naming across inversions and flat keys, chop
renumbering, a named regression test for the erased-note bug.

The NSF pipeline has **39 lines of test against ~1,000 lines of code**, and
that's a smoke path, not real coverage.

That's backwards from where the risk is. The 6502 core, the APU
reconstruction, and the note derivation are what every conclusion in every
analysis doc ultimately rests on. A wrong period-to-MIDI conversion doesn't
announce itself — it produces a *plausible* note that gets analyzed as
real, and the error is invisible downstream.

The meter-provenance bug is the existing proof that bad data can launder
itself into apparent fact in this repo and survive for months.

### The work

In `tests/nsf.test.mjs`, test the period → pitch path:

- For every period value in the audible range, assert the derived MIDI
  pitch matches a known-good table.
- **Pulse and triangle separately.** They use different divisors —
  `CLOCK / (16 * (period + 1))` for pulses, `CLOCK / (32 * (period + 1))`
  for triangle. A test that only covers one proves nothing about the other,
  and the triangle is the bass channel Josh reads most.
- Include the boundaries: the pulse floor (`period > 7`) and ceiling
  (`period < 0x800`), and the triangle's `period > 1`.

Generate the expected table from the NES's actual period tables if you can
source them; otherwise from first principles with the frequencies written
out in the test so a human can check them by hand. Do not generate expected
values by calling the function under test.

---

## Not now

Mentioned so you don't go looking for them — **do not start these:**

- **Meter workbench** (onset histograms, beat-grouping audition). Biggest
  real gap in the tool, but needs design decisions from Josh.
- **Chord-band verification**, horizontal/voice-leading reading, corpus
  progression view, claims-as-structured-objects. All from a design sketch
  Josh hasn't read yet. He'll pick from it himself when he's fresh.

There's also a note that `index.html` (~4,000 lines) will need splitting
*before* any large new view goes in — but not as part of this work order.
