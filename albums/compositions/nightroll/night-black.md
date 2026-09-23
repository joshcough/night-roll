# Night Black — how it was made

Josh's composition, written 2026-09-19 → 22 (web session, feedback and
theory-on-demand only). This file is his account of the design, taken
from that session's handoff and confirmed by him 2026-09-23 ("all that
stuff seems correct, and I did all those things intentionally, even if I
didn't know the words for them"). The analysis-facing note dump is the
`.notes.txt` sibling; annotations live in `night-black.rollnotes.json`
(`tools/annotations.mjs night-black` reports no anomalies).

He considers it done in every structural way; what remains is polish.

## Form (loop 21.1 → 5.1)

- Bars 1–4: intro. E ↔ C vamp, pulse2 held chords, no melody.
- Bars 5–12: A section. Same vamp; melody enters at 5.
- Bars 13–20: B section. C♯m/G♯ | G♯ | A | F♯m–D♯°–E, then the same
  three bars again, then bar 20: C (beats 1–2) → B13 (beats 3–4) → loop
  to E.

## Design facts (Josh's, stated in session)

- **Every important harmonic move is a half-step sag:** G♯→G across the
  vamp, B→B♭ in the melody (bar 11), C→B suspension on G♯, A→Am in the B
  part, bass C→B in the final cadence.
- **The B section keeps the A section's rhythms** — the bass rhythm and
  the melody's rhythm (quarter, two eighths, rest, dotted quarter) — and
  changes only pitches and the pulse2 texture.
- **Bar 12 is the seam fix.** Pulse2 switches from held chords to the
  B-section eighth-note cell one bar early. Before that, the A→B seam
  failed because pulse2 was the only voice with nothing in common across
  it. Josh: this restored the rhythmic chug his guitar had been supplying
  under the vamp all along.
- **The B-section pulse2 cell** (bars 13–15, 17–19): top note on 1 and 3,
  lower chord tone on the "and" of 1, 2, 3, 4; rests on 2 and 4. It
  interlocks with the bass, which rests on the "and" of 1 and on beat 3.
  All three voices converge on the "and" of 3. (The name for this, new
  to him that week: hocket — see glossary.md.)
- **Drums drop out** for bars 17–18, quarter hats in 19 (plus the "and"
  of 3 and 4), full kit returns for the bar-20 cadence. Intentional.
- **Pulse2 in the A section is deliberately polyphonic** (three-note
  chords). He tried monophonic alternatives, rejected them, and is
  keeping the chords, with rising inversions across the three passes and
  a two-note thinning in bars 11–12. Not an NES-purity project; do not
  "fix" this.

## Terms he used or was given here (glossary anchors)

Chromatic mediant (the E ↔ C vamp), hocket (bars 13–19), Lydian ♯4 /
C(♯11) (bar 7 and 20.2), 13th chord (20.3, B13), accented passing tone
(20.2 — his reading of the F♯ over C). Quiz correction given once: the
bar-20 melody G♯ is a neighbor tone, not a passing tone; the A on beat 4
is metrically the stronger note, so the strict reading is B7 with
neighbor G♯, B13 still defensible.

## Process notes he wants kept

- His section-writing skill (playing over a vamp on guitar until
  something locks) now transfers to B sections; the missing skill was
  choosing the second vamp's chords and stitching seams.
- Seam rule: when a transition works on guitar but not in Night Roll,
  ask what the guitar was doing that none of the four voices is doing
  now. Usually rhythm.
- Translating guitar chugs and gallops to chip voices: accents have to
  become pitch (root vs octave), length (short notes + rests), or move to
  the noise channel / triangle, since pulse notes have no per-note
  dynamics.
- B-section checklist: change harmonic rhythm, start off-tonic, change
  texture/register, carry one A-section element across, give the last
  bar a real cadence.

## His open polish list (not requests)

- Lighter or different drum pattern for bars 13–16 to mark the B section.
- Probably remove a fill or two; he thinks there are too many.
