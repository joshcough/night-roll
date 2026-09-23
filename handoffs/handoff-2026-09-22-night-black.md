# Handoff — composition session, 2026-09-19 → 2026-09-22

Composition session, not an FF1 analysis session. Two originals in
`albums/compositions/nightroll/`: **Carnival** (files still named
`town-theme.*`) and **Night Black**. Everything below is Josh's work; my role
was feedback and theory-on-demand. All repo items are PROPOSED — Josh signs
off before anything lands.

## Night Black — state at session end

Josh considers it done in every structural way. Remaining items are polish
and are his call.

**Form (loop 21.1 → 5.1):**
- Bars 1–4: intro, E ↔ C vamp, pulse2 held chords, no melody.
- Bars 5–12: A section. Same vamp; melody enters at 5.
- Bars 13–20: B section. C♯m/G♯ | G♯ | A | F♯m–D♯°–E, then the same three
  bars again, then bar 20: C (beats 1–2) → B13 (beats 3–4) → loop to E.
- Annotations in `night-black.rollnotes.json` are current and
  `tools/annotations.mjs night-black` reports no anomalies.

**Design facts worth keeping in an analysis doc (all Josh's, stated in
session):**
- Every important harmonic move is a half-step sag: G♯→G across the vamp,
  B→B♭ in the melody (bar 11), C→B suspension on G♯, A→Am in the B part,
  bass C→B in the final cadence.
- The B section keeps the A section's bass rhythm and the melody's rhythm
  (quarter, two eighths, rest, dotted quarter) and changes only pitches
  and the pulse2 texture.
- Bar 12 pulse2 switches from held chords to the B-section eighth-note
  cell one bar early. This is the fix that made the A→B seam work; before
  it, the seam failed because pulse2 was the only voice with nothing in
  common across it. Josh: this restored the rhythmic chug his guitar had
  been supplying under the vamp all along.
- B-section pulse2 cell (bars 13–15, 17–19): top note on 1 and 3, lower
  chord tone on the "and" of 1, 2, 3, 4; rests on 2 and 4. Interlocks with
  the bass (which rests on the "and" of 1 and beat 3). All three voices
  converge on the "and" of 3.
- Drums drop out for bars 17–18, quarter hats in 19 (plus "and" of 3 and
  4), full kit returns for the bar-20 cadence. Intentional.
- Pulse2 in the A section is deliberately polyphonic (three-note chords).
  Josh tried monophonic alternatives, rejected them, and is keeping the
  chords with rising inversions across the three passes and a two-note
  thinning in bars 11–12. Not an NES-purity project; do not "fix" this.

**Josh's own open polish list (not requests — just what he said):**
- Lighter/different drum pattern for bars 13–16 to mark the B section.
- Probably remove a fill or two; he thinks there are too many.

## Carnival (formerly Town Theme) — state

- Rebuilt from the old bars 8–9 after Josh scrapped the original
  B♭–C–Am–Dm material. Six-bar loop, motif climbs F–F–Gm–Am–B♭–C7.
- Melody rewritten 2026-09-20 with an arc (climb in bar 4, peak in bar 5
  on B♭ with the C7 as a 9th, descent in bar 6).
- Drums: auto-generated attempt was rejected; Josh intends to pencil them
  by hand. Empty as of last pull.
- **PROPOSED:** rename files `town-theme.*` → `carnival.*` and update any
  manifest/index entry. The title changed in the UI but the paths did not.

## Process notes (Josh's, for future sessions)

- His section-writing skill (playing over a vamp on guitar until something
  locks) now transfers to B sections; the skill that was missing was
  choosing the second vamp's chords and stitching seams.
- Seam rule he arrived at: when a transition works on guitar but not in
  Night Roll, ask what the guitar was doing that none of the four voices
  is doing now. Usually rhythm.
- Translating guitar chugs/gallops to chip voices: accents have to become
  pitch (root vs octave), length (short notes + rests), or move to the
  noise channel / triangle, since pulse notes have no per-note dynamics.
- B-section checklist he's using: change harmonic rhythm, start off-tonic,
  change texture/register, carry one A-section element across, give the
  last bar a real cadence.


## Quiz results (end of session, from this session's material)

| Term | Type | Result |
| --- | --- | --- |
| Chromatic mediant | encountered | `[~]` needed a nudge ("mediant" given); re-ask |
| 13th chord (which note is the 13th; B6 vs B13 = presence of the 7th) | demonstrated | `[x]` |
| Hocket | encountered (same-session gimme) | `[x]` re-ask cold |
| Phrygian cadence (♭II → i in E minor) | encountered | `[x]` answered correctly while doubting; knows ♭II is borrowed from Phrygian |
| Lydian ♯4 / C(♯11) | demonstrated | `[x]` and correctly argued the F♯ in 20.2 is an accented passing tone, not a chord tone |

Corrections given in the quiz (say once, then drop): bar 20 melody G♯ is a
neighbor tone not a passing tone; the A on beat 4 is metrically the
stronger note, so strict reading is B7 with neighbor G♯, B13 still
defensible. "C augmented four" is not a usable label ("augmented" = ♯5);
write C(♯11) or Cadd♯4, say "C with a sharp eleven."

## PROPOSED glossary additions

Encountered: mordent, Phrygian cadence (♭II→i; note ♭II→I major is
Phrygian dominant, and the textbook "Phrygian half cadence" is iv6→V),
augmented sixth, line cliché, tritone substitution, neighbor tone
(distinct from passing tone; Josh has been calling neighbors "passing").

Demonstrated (Josh's own anchors): chromatic mediant (Night Black vamp,
E ↔ C), hocket (Night Black bars 13–19, pulse2 vs bass), Lydian ♯4 / C(♯11)
(Night Black 7 and 20.2; also Graveyard B section per Josh), 13th chord
(Night Black 20.3, B13), accented passing tone (Night Black 20.2).
## Tooling friction observed

- `tools/*.mjs` resolve a bare song name but not a path under
  `albums/compositions/`; `annotations.mjs albums/compositions/nightroll/night-black`
  errors, `annotations.mjs night-black` works. Fine, but the error message
  says "no song named … under albums/" which is misleading since the file
  is there. Low priority.
- Reading composition sessions from `.notes.txt` by eye led me to assert
  the drums ignored the B section when they didn't (I hadn't read past bar
  12 of the drum track). Same error class the tools exist for; I should
  have run `span.mjs` on the drum track.

## Not done this session

- No FF1 analysis. Quiz was run at session end (above), not start.
- No changes to `open-items.md`, `glossary.md`, or `supplemental-learning.md`
  proposed beyond what's above.
