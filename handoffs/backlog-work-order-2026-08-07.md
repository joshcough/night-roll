# Follow-up work order — record the backlog, 2026-08-07

Companion to the earlier work order that covered two code tasks (chip
volume in `.notes.txt`, and a `midiFromFreq` round-trip test). **If that
file already contained a "record the backlog" task, this one is a duplicate
— skip it.**

**This task is documentation only. Do not implement anything described
below.** These are backlog entries. Josh picks what gets built, and he
hasn't read the design sketch yet.

Add to the appropriate queues in `open-items.md`, phrased as open questions
rather than decisions.

---

## Already raised (verify it's recorded, add if not)

- **Retrospective progression pass (Josh, 2026-08-06).** The key sweep is
  scoped to opening keys, so nobody's job was ever the progressions
  themselves. Eleven songs of chord data with little cross-song reading of
  what Uematsu does with them — cadence habits, recurring progressions, how
  often a real V7 appears, where rare triads show up. The per-song docs
  have the chords; the synthesis step was skipped. No prerequisite work;
  it's a reading pass over `analysis/*.md` plus `chord-charts.md`.

## New, 2026-08-07

- **Meter workbench.** Largest gap in the tool. Every analytic feature
  works on pitch; meter is *declared* to the app, never interrogated by it.
  Candidate pieces: an onset histogram folding every note onset into a
  single bar at candidate bar lengths (6/8 should pile onsets on positions
  1 and 4; 3/4 on 1, 3, 5), harmonic-change points overlaid as downbeat
  evidence, duration weight, accent data once the volume task lands, and an
  audition mode that plays the song with a click in each candidate meter.
  **Needs Josh's design input before any code.** Rationale: rhythm is his
  active work area (30+ min daily in a separate app), menu's meter is
  undetermined, the header meters are unreliable fossils with no
  provenance, and a prior session spent roughly two hours on 3/4 vs. 6/8
  without resolving it.

- **Chord-band verification — check-on-request only.** The app knows the
  notes under every chord band and never compares them to the label.
  Menu's chord 2 sat mislabeled as F7 for days with the disproof sitting
  directly underneath it. Proposed shape: on request, report that the label
  and the pitches *disagree* and which pitches are unaccounted for — never
  name the chord, never volunteer, never touch an unlabeled span. Wrinkle:
  pedal points and sustained notes will trip a naive checker (the B♭ under
  menu's F7 is exactly this case), so it needs a way to mark a pitch as
  belonging to a separate structural layer or it will cry wolf until it
  gets turned off.

- **Horizontal / voice reading.** Channel identity survives the entire
  pipeline and is then used mostly for mute/solo. Nothing reads across
  time: isolating one channel's line, flagging notes held across a harmonic
  change (pedal points — detectable without naming them), common tones
  between adjacent chords, voice motion and direction. Josh found menu's
  tonic pedal by scanning the lowest note of each chord by eye, and worked
  out an E7→G relationship by mental arithmetic; both are computable from
  data already in the files.

- **Claims as structured objects.** `.rollnotes` entries are strings. A
  claim could instead carry its justifying note range, the method used, the
  date, confidence, and what it depends on. The method already says
  *record the path, not just the verdict* — but paths live in prose in
  `analysis/*.md` while verdicts live in `.rollnotes`, with nothing linking
  them. Architectural, and a format migration, though the round-trip test
  already exists and eleven songs is nothing to convert.

- **Sealed predictions.** Lock a key prediction before derivation —
  timestamped, hidden from the analyst — unsealed only once an independent
  derivation is recorded, then self-scoring into the sweep tally.
  Non-circularity is currently enforced by Josh's honesty plus the tutor's
  vigilance rather than by any mechanism.

- **Key-dial caveat for the help text.** The key? dial works by minimizing
  visible accidentals, which **cannot distinguish a key from its relative
  and cannot see modes at all** — a B♭-major song and a G-minor song look
  identical to it. It's a hypothesis generator, not a verifier, and nothing
  in the app says so. Small doc fix, worth doing because the whole method
  depends on not mistaking it for a verdict.

- **`index.html` split.** ~4,000 lines. Fine today — the single-file
  constraint still pays for itself (no build step, `git push` deploys, the
  vm harness keeps it testable). Flag only: split it *before* a large new
  view such as the meter workbench goes in, not after.

- **Concept delivery on demand (speculative — record, don't design).**
  Josh's own read is that Night Roll is much less useful without a tutor
  working alongside it. But what actually unblocked him in session was
  *general concepts arriving at the moment he hit a wall* — tritone
  symmetry, pedal point, the passing-tone tests — none of them
  song-specific. Possible feature: offer a concept keyed to the current
  selection (e.g. a selected dyad six semitones apart → the tritone
  concept) while withholding every per-song conclusion. Genuinely unclear
  whether this is a good idea.

---

## Source documents

Two longer files exist outside the repo. Josh has them as downloads and
will bring in whatever he wants from them:

- `review-handoff-2026-08-07.md` — full code and tool review.
- `tool-design-sketch-2026-08-07.md` — the design sketch several items
  above are drawn from.

Don't invent their contents.
