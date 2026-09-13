# Handoff 2026-09-12 — note length editing is broken as a model, not just buggy

Everything below is PROPOSED. Josh signs off before anything lands.
Source read: `index.html` at 341134d (lines cited are from that revision).

## 1. What Josh hit tonight (Ambush, iPad, roll view)

- Could only move notes in quarter-note steps; could not land on 16ths/32nds.
- Pencil with 32nd picked wrote a quarter.
- Could not grab a note's end to shrink or extend it; eventually shrank one
  after "a long time," then could not grow it back.
- His description of the workflow he's forced into: Select → try to extend
  → wrong length → switch to Pencil → pick value × modifier → switch back to
  Select → reselect the note → try again. Four taps and a tool switch to
  change one note's length.

## 2. Check this FIRST — probable cause of the "everything is quarters" symptom

A **custom grid is armed** (View ▾ → Grid…, `gridDiv`, line 1839), most
likely at 4 lines/bar, or a T chip is active. Evidence in code:

- `moveSnapTicks()` (1860): `if (gridDiv) return barTicks()/gridDiv` —
  custom grid outranks everything for moves AND resizes.
- Pencil tap under a custom grid is one cell regardless of the duration
  chip (4448: `snap = gridDiv ? moveSnapTicks() : pencilTicks()`), and the
  chips are dimmed but still tappable-looking. A 4/bar grid makes "I picked
  32nd, got a quarter" exactly.
- `gridDiv` is transient (no persistence) but survives the whole session,
  including switching songs. Set for a Wily quarter-triplet passage earlier
  tonight, it would still rule Ambush.
- Second candidate: `gridFollowNote()` (8690) silently flips the pencil
  chip to a triplet value when you touch a triplet note. Ambush's lead is
  quarter-note triplets (0.667q). Touch one, and the snap becomes 2/3 beat
  — which feels like "quarters" — and the next pencil tap inserts a 4T.

Confirming symptom (Josh, later in the session): a note's end could be
dragged to a 32nd or to a quarter and nothing in between, with the drag
"stuttering" in the gap. That is `gridDiv = 4` exactly: resize snaps the
edge to `bar/4` lines (4622), and the reachable 32nd is not a line but the
`minD` clamp (4616). No other snap value produces that pair.

**Ask:** is there any always-visible indicator that a custom grid or a
triplet snap is in force outside the Grid sheet / dimmed chips? If not,
that's the first fix regardless of anything else below.

## 3. Why resizing is hard even with the grid right — code facts

1. **Edge hit zone is 8 screen px** per end (4394–4396:
   `Math.abs(tickHere - (hn.t + hn.d)) < 8 / pxPerTick()`), and **zero** when
   the note is under 24 px wide (`edgeOk = hn.d * pxPerTick() >= 24`). A
   finger contact on iPad is ~40 px. At the default zoom (`pxq: 56`), the
   gallop's 16ths are 14 px wide → no edge zone at all → every touch is a
   move. The triplet lead notes are ~37 px → an 8 px sliver at each end.
2. **Move vs resize is decided at pointerdown from where the finger landed**,
   with no affordance before and no feedback after — the arm message says
   "grabbed N notes — drag to move" (4497) even when `kind` is `resize`.
   Josh can't tell whether he has the edge until he's already dragged.
3. **Cold grab needs a 160 ms dwell** (`HOLD_MS`, 1840) and the pending edit
   is **cancelled if the finger travels > 20 px** before the timer fires
   (`HOLD_SLOP`, 1841; 4540). A resize gesture naturally begins with
   horizontal movement, so on an unselected note it usually becomes a pan.
   (A *selected* note grabs instantly — 4402 — so tap-then-drag works, but
   that's the two-gesture tax he's complaining about.)
4. **The snap grid is silently one of four things:** custom grid; triplet
   steps if a T chip is armed; 32nds if `songHas32nds()`; else 16ths (1860–
   1867). `songHas32nds()` looks for onsets/durations on 32nd lines — and
   gate-time notes like Ambush's triangle (0.42q / 0.21q) are *not* on 32nd
   lines, so Ambush reads as "no 32nds" and cannot be dragged to a 32nd
   until one is penciled on a beat first. Josh has to know that rule to get
   fine resolution. He shouldn't.
5. Min length is a 32nd (`minD = max(24, ppq/8)`, 3831) — fine, keep.

## 4. Proposed model

### 4.1 One grid, one control, never silent
- A single chip row, visible in **both** Select and Pencil:
  `32 · 16 · 8 · 4 · T · ▦N` — the last chip shows the custom lines-per-bar
  when one is armed (`▦6`) and opens the Grid sheet on tap.
- This row IS the snap for: move, resize (both edges), pencil tap length,
  pencil drag, paste position, record quantize. One number, one place.
- Kill the "32nds only when the song contains them" rule. 32 is a chip.
- Custom grid: keep the sheet, but the chip row always shows it's on, and
  changing songs turns it off (or asks).
- `gridFollowNote`: keep the behavior, but it moves the chip highlight
  visibly and never changes what the pencil inserts without the chip
  showing it. Consider making it opt-in; Josh should say.

### 4.2 Pencil = insert only, then the note is ordinary
- Pencil tap inserts **one grid cell** at the cell touched (already so under
  a custom grid; make it so always). Pencil drag extends in grid cells.
- The value × modifier picker goes away as a separate concept: T is a chip,
  dotted is "drag one more cell." If Josh wants to keep dotted presets,
  they're a long-press on a chip, not a mode.

### 4.3 Resize = drag the edge, in Select, no tool switch, no dwell
- **Edge zones are finger-sized.** Per end: `max(14 px, 30% of note width)`,
  and the zone extends the full row height plus 6 px above/below (a 44 pt
  target). For notes narrower than ~40 px: right-edge zone = right 40% of
  the note, left edge disabled, move = the rest. Never "zoom in to resize."
- **Show the handle.** On hover (mouse) or on touch-down within the zone, draw
  a 3 px bar at that end in the note's color, and change the arm message to
  "✊ end of N note(s) — drag to resize" / "✊ start — drag to resize."
- **No dwell for resize.** If pointerdown lands in an edge zone of a note in
  Select mode, arm immediately for every pointer type; horizontal travel is
  the drag, not a cancel. Keep the dwell only for *moving* an unselected
  note (that's the pan-vs-grab ambiguity; a resize on an edge is not
  ambiguous).
- Resize snaps the moved edge to the nearest grid **line** (already does —
  4622 — keep), live, with a length readout in the info line while dragging
  ("½ · 0.5q", "⅓ T").
- Multi-select: same delta for every selected note (already does — keep).
- Keyboard Option+←→ steps by one grid cell (keep).

### 4.4 What stays as-is
- Hold-to-grab for move on unselected notes, `HOLD_SLOP` 20.
- Absolute snap for the grabbed note; mates keep offsets.
- Left-edge resize keeps the end fixed.
- One undo step per gesture.

## 5. Acceptance (Playwright, roll view, iPad viewport, touch pointer)

1. Open Ambush. With no custom grid and no T chip: drag any lead note; it
   lands on 16ths. Tap `32`; it lands on 32nds. No pre-penciling required.
2. Arm a 6/bar grid, switch to Graveyard: chip row shows `▦6` or the grid is
   off — never silently still on.
3. Touch the right 30% of a 37 px note, move 60 px right immediately (no
   dwell): the note's end extends, snapped; the note did not move; the view
   did not pan.
4. Same on a 14 px gallop note: right 40% resizes; left 60% moves.
5. Touch an edge, hold still: handle bar appears and the info line says
   "resize," not "move."
6. Pencil tap with `16` armed inserts a 16th; with `T`+`8` armed inserts an
   8th triplet; never a quarter unless `4` is armed.
7. Select three notes, drag one's end: all three change by the same delta.

## 6. Process note

Josh: "I wanna click the edge of it and just drag it, extend it as long as I
need it to be, and it should generally snap to 32nds and 16ths … or if we
have the grid in six, it should snap to those intervals." That is the whole
spec in one sentence; everything above is derived from it. The current
design treats length as a *mode* (pencil + chip) rather than a *gesture*
(edge drag), and every symptom tonight traces to that.
