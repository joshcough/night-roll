# Handoff — town (session 2026-08-02, evening)

Josh derived everything below himself. It is settled — do not re-derive,
and do not extend past what's here without his say-so.

## Verdict

**Opening key: C major.**

Path (record the path, not just the verdict):
1. Read the six half-bar chords in bars 1–3 off the pulse2 arpeggio.
2. All six are diatonic to C; no other key holds the whole set.
3. Diatonic set alone doesn't separate C major from A minor — they share
   it. Tiebreakers: the song opens on C, and the G7 ending bar 3 points
   home.

## Hypothesis scoring

Loop target is **1.1** — the song loops cleanly and needs no loop
directive. Bass at 1.1 is **C** = tonic. **Hit**, and non-circular: the key
was settled from the chords before the bass was consulted.

Town row for `analysis/key-sweep.md`:

| Town | C major | C | hit — non-circular; key called from the chords first | town.md |

## Loop seam typology

**Prepared.** Bar 8 is Gsus4 → G7, and the G7 is a retransition aimed at
the bar-1 tonic. Second confirmed "prepared" example for the typology
thread.

## Chord map (all 8 bars, as committed to town.rollnotes)

| Anchor | Chord |
| --- | --- |
| 1.1–1.2 | C |
| 1.3–1.4 | G/B |
| 2.1–2.2 | Am |
| 2.3–2.4 | C |
| 3.1–3.2 | F |
| 3.3–3.4 | G7/F |
| 4.1–4.2 | C |
| 4.3–4.4 | E7 |
| 5.1–5.2 | Am |
| 5.3–5.4 | D7 |
| 6.1–6.2 | G |
| 6.3–6.4 | C (pulse2 descends C–B–A–G above it; the B is passing) |
| 7.1–7.4 | Bb (the C is passing — no add9) |
| 8.1–8.2 | Gsus4 |
| 8.3–8.4 | G7 |

Sections: A = bars 1–4, B = bars 5–8.

Notes on how these were reached, since the reasoning is the point:
- Both G chords in bars 1–3 are inverted; the arpeggio figure is identical
  in each and only the bass distinguishes them. The 7th of the G7/F lives
  in the triangle, not the arpeggio.
- The C in 5.3 occupies a full quarter on the beat — a chord tone, not a
  passing note. That's what makes it D7 rather than D.
- Bar 7's C and bar 6's B both failed the same three tests (duration,
  metrical position, approached/left by step), so both are passing.
- Bar 8: the C is prepared in bar 7, held over where the third should be,
  and resolves down to B on 8.3. Textbook 4–3 suspension.

## Open questions — Josh's, unresolved. Do NOT answer these for him.

- **Is bar 5 a modulation to A minor, or a tonicization inside C?** Josh's
  own evidence against modulation: the D7 in 5.3 aims at G, not at A, and
  the passage moves through several dominants without settling. He has not
  ruled formally.
- **What is the Bb in bar 7 doing?** First genuinely out-of-key chord in
  the song. Unexamined.
- **Does town modulate internally?** Sweep is opening-key only.

## Tooling — for open-items.md

- **FIXED tonight.** `openEditor()` in index.html didn't prefill the To
  fields for a one-beat ruler selection: `const last = rangeSel.b -
  song.ppq` makes `last` equal `rangeSel.a`, so the guard `if (last >
  rangeSel.a)` failed. Changed to `>=`. Bar 6 beats 3–4 were the first
  single-beat spans in the project, which is why it had never surfaced.
- **iOS audio-after-app-switch fix does NOT work.** Open-items lists the
  08-02 fix (unconditional awaited resume, visibilitychange revival,
  closed-context rebuild) as awaiting Josh's iPad confirmation. Confirmed
  broken: switching to Claude Code and back leaves the playhead stuck,
  play does nothing, and only a reload recovers it. Reopen the item.
- **Stale reads after Sync (not a bug, but bites).** The app reads from
  GitHub's raw CDN, which serves the old file for up to a minute after a
  push. Reloading inside that window shows pre-sync annotations and looks
  like data loss. Worth a cache-buster on the fetch, or a note in the UI.
  Compounded by the audio bug above, which is what forces the reloads.

- **Time signature must not be displayed unless the user sets it.** Opening
  a song currently shows a meter (menu displayed 6/8) taken from the MIDI
  meta event 0x58 at index.html:534. That's the converter's claim, not
  Josh's analysis, and meter is a bigger spoiler than key here — rhythmic
  grammar is his stated gap, and a 6/8 label pre-commits the beat grouping,
  which is most of the analytical work in a compound-meter piece. Treat it
  exactly like `key:` in rollnotes: user-declared, absent by default.
  Display sites are index.html:2165 (stave, `addTimeSignature`) and :2374
  (header line). The parsed value must stay in `song.timesig` — bar width
  (:660), note-end math (:726, :749), serialization (:829) and the editor
  default (:2739) all depend on it. Suppress the display, not the data, and
  add a `timesig:` annotation that turns it back on.

---

# Session continued — menu (2026-08-04)

Josh moved on to **menu** after finishing town, a couple of days later.
This section is in progress
and was interrupted by tooling work. Nothing here is a final verdict.

## Where he got to

Chords derived so far, all his:

| Bar | Chord |
| --- | --- |
| 1 first half | Bb |
| 1 second half | F7 |
| 2 first half | Bb |
| 2 second half | Dm/A |
| 3 first half | E7 |

Structural observations he made:
- The triangle is an arpeggiated accompaniment figure, not a walking bass:
  three ascending eighths, drop, three more. Two groups per bar in 6/8, so
  harmonic rhythm is two chords per bar and the first note of each group is
  the bass.
- Bar 1 keeps the same bass across both groups and changes the upper notes.
  Bar 2 does the reverse — Bb to A, one voice moving a half step while the
  rest hold.

**Key is NOT determined.** He has not run the sweep on this song. Do not
assign one. Bb is where the piece starts, but that is the hypothesis under
test, not a finding.

Open thread he was mid-way through: E7 contains a tritone, tritones
resolve, and he was about to follow it into bar 4. Leave that for him.

## Tooling — display spelling. THIS IS THE URGENT ONE.

**Note spelling is arbitrary and inconsistent, and it interferes with
analysis.**

Root cause: `NOTE_NAMES` at index.html:495 is a single hardcoded table —
`["C","C#","D","Eb","E","F","F#","G","Ab","A","Bb","B"]`. Someone picked a
name per black key once. C# and F# are spelled sharp; Eb, Ab and Bb are
spelled flat. No key, no context, no reasoning.

Worse, it's not even self-consistent across views. In menu, the roll view
showed Josh flats in bars 1–2 while the score view showed G# in bar 3. Two
different renderings of the same capture inside the same app.

Why this matters and isn't cosmetic: the capture (`menu.notes.txt`) is
sharp-spelled by design, and its header says no key is stated. Correct
spelling is part of the analysis, not an input to it. Tonight the flat
display led Josh to read bar 3's G# as Ab and try to build a chord on Fb —
a chord that doesn't exist in the piece. He lost real time to it.

**Wanted:** default to sharps everywhere, matching the capture, whenever no
key has been set. Make every view agree. Once the user declares a key in
rollnotes, spell from that key instead. The app must never volunteer a
spelling the user didn't ask for.

## Also from this session

- **DONE, already fixed by Claude Code tonight:** one-beat ruler selections
  didn't prefill the To fields in `openEditor()`. `const last = rangeSel.b -
  song.ppq` made `last` equal `rangeSel.a`; guard `if (last > rangeSel.a)`
  changed to `>=`. Verified working — town bars 6.3 and 6.4 annotated
  successfully afterward.
- **iOS audio-after-app-switch fix does NOT work** — see the town section
  above. Confirmed broken on iPad tonight. Reopen the item.
- **Stale reads after Sync** — see town section. Raw CDN serves the old file
  for up to a minute; reloading inside that window looks like data loss.
  Cache-buster or a UI note.
- **Time signature must not display unless set** — see town section.
  Opening menu announced 6/8 before Josh had made any rhythmic judgment.
  Same principle as the spelling bug and arguably worse, since rhythm is
  his stated weak area.

---

# Design problem — meter and tempo currently come from the arrangement MIDIs

Discovered while working on menu. This is a pipeline design issue, not a
bug, and it's worth real thought before the next album.

## The finding

The NSF capture does not determine note values. `notes.mjs:221` says it
outright — the chip carries frame counts, not meter. `meterOf()` in
`tools/nsf/dump-all.mjs:60` opens the corresponding `.mid`, reads its 0x58
time-signature meta event and its first tempo, and feeds both into
`toNotesTxt()`. That's what converts frames into "0.5 of a quarter note."

**And the `.mid` it reads is the pipeline's own output.** `menu.mid`
contains three tracks named pulse1, pulse2, triangle — chip channels, not
an arrangement. The downloaded arrangement MIDIs were discarded when the
NSF pipeline was built. Meanwhile `midi-write.mjs:60` writes the 0x58 meta
event from whatever `tsNum`/`tsDen` the caller supplied.

So the loop is closed: the pipeline reads a meter out of a file the
pipeline wrote, from a value it was handed. The 6/8 in `menu.notes.txt` is
a **fossil** — inherited from the original downloaded arrangement, baked
into the regenerated MIDI, and now re-read from itself on every run.

Consequences:
- The provenance is gone. Nothing in the repo records where any song's
  meter or seed tempo originally came from.
- Nothing can flag an error. If the original arranger chose wrong, or if a
  song was seeded by hand, rerunning the pipeline reproduces it forever.
- The rhythmic layer of every `.notes.txt` still traces to the arrangement
  MIDIs, which is exactly the source the NSF pipeline was built to escape.
  It escaped them for pitch and channel identity, not for rhythm.
- Any game without a findable MIDI arrangement can't be seeded at all.

## What could be inferred from the capture alone

- **Onset periodicity.** Autocorrelate note starts across all channels.
  Chip music is on an exact grid, so beat induction should work well.
- **Loop length constraint.** A loop must be a whole number of bars, so
  bars-per-loop divides the total. Kills many candidates cheaply.
- **Harmonic change points.** Where figures restart. Josh did this by hand
  on menu — the triangle's three-note arpeggio recurs twice per bar, which
  is a 3+3 argument built from harmony rather than durations.
- **Chip volume — the unused one.** `notes.mjs:64` already reads the 4-bit
  constant-volume field into `c.vol`, but line 33 only uses it as an on/off
  gate (`c.vol > 0`). The 0–15 value per frame is discarded. That is
  literal accent data from the ROM, and accent is what separates 3/4 from
  6/8.

  **Caveat that limits this:** the NES triangle has no volume control —
  line 19 hardcodes its vol to 1. Accent evidence exists only on the two
  pulse channels. In menu the triangle carries the bass and the arpeggio
  figure, so the most structurally informative channel contributes nothing.

## What is NOT recoverable, ever

Absolute note values and tempo, separately. Only their product is real.
Six equal notes are six equal notes: eighths at 90 and quarters at 45 are
the same music. Any pipeline must *pick* a convention here — that's a
naming decision, not an analytical one, and it should be labeled as such
rather than presented as a finding.

Likewise 3/4 vs 6/8 at a middling tempo is often genuinely ambiguous, not
merely undetermined. Josh tapped menu both ways tonight and both felt
valid. A best-fit algorithm should be able to report low confidence rather
than always committing.

## Requirement if this gets built

**A computed best-fit meter is a guess, and it must be hidden by default,
exactly like the key.** Same rule as the time-signature and note-spelling
items above: the app must not volunteer an analytical conclusion Josh
hasn't reached. Put it behind an explicit reveal for when he's stuck.

## Build request — infer meter and key from the NSF, best-fit

Josh wants this built. Two inference targets, both computed from the
capture alone, with no dependency on any external MIDI.

**1. Preserve chip volume first.** This is the prerequisite and it's cheap.
`notes.mjs:64` already reads the 4-bit constant-volume field into `c.vol`
and line 33 uses it only as an on/off gate. Keep the 0–15 value per note.
Confirmed lost downstream: every note-on in `menu.mid` has velocity 96 —
all 114 of them, one constant. Map chip volume to MIDI velocity, and add a
volume column to the `.notes.txt` format. Reminder: triangle has no volume
control (hardcoded vol 1 at line 19), so this yields accent data on the two
pulse channels only.

**2. Best-fit meter.** Inputs: onset periodicity across channels, loop
length (must divide into whole bars), harmonic/figure change points, and
pulse-channel accent once volume is preserved. Should report a confidence
and be able to say "ambiguous" — 3/4 vs 6/8 at moderate tempo often is.
Note values remain a naming convention: only the duration ratios are real,
so the choice of eighths-at-90 vs quarters-at-45 must be labeled as
convention, not finding.

**Resolving the naming choice by tempo window.** The one free parameter can
be pinned mechanically instead of guessed. Detect the grid, then try each
candidate naming of the smallest common unit — sixteenth, eighth, quarter.
Each implies a tempo. Discard any that put the tempo outside a plausible
range for NES music; roughly 60–180, with the window wider at the top since
chip music skews fast (battle themes especially). Usually one candidate
survives, and every other note value then follows from the ratios — a note
twice the unit is the next value up, three times is dotted, and so on. So
the output is a fully notated score anchored by a single explicit
convention.

If two namings survive the window, flag it rather than picking. Same rule
as meter ambiguity: report, don't silently choose.

**3. Key detection — DROPPED.** Considered and cut. Pitch-class histograms
are blunt, they mislead on songs that modulate (Gurgu) or withhold tonic
chords, and Josh doesn't need it — determining the key is the part he's
doing himself.

**Both outputs must be hidden by default.** Same rule as the key
annotation, the time-signature display, and the note spelling: the app must
never volunteer an analytical conclusion Josh hasn't reached. Put them
behind an explicit reveal, for when he's stuck and chooses to look.

Payoff beyond correctness: it removes the need to find an arrangement MIDI
for every song, which is what currently gates doing other games.

**4. Cut the circular dependency, then audit.** Once detection works,
`meterOf()` stops reading the `.mid` and the pipeline no longer depends on
any external or self-written arrangement. Before switching over, run the
detector across all 19 FF1 songs and diff its output against the values
currently baked into the `.notes.txt` headers.

Do **not** silently overwrite on disagreement. Surface every mismatch to
Josh with the evidence behind it. A disagreement means one of three things
and he wants to decide which:

- the detector is wrong (bug),
- the inherited value is wrong (likely for at least some songs — the
  current values are fossils with no recorded provenance, so they carry
  less authority than they appear to), or
- the song is genuinely ambiguous or does something unusual, which is a
  musical finding and belongs in the analysis, not in a config fix.

The third case is the interesting one and the reason not to auto-correct.


---

# Session — prologue and shop (2026-08-05)

## prologue — chords in progress, key NOT determined

Josh committed chord sections to `prologue.rollnotes` and had them checked.
Verified correct: 1.1 (F5), 1.3 (C/E), 2.3 (Am/C), 3.1 (Bb), 4.1
(Fsus4/C), 4.3 (C), 5.1 (Gm/Bb), 7.3 (G7/F), 8.1 (Am/E), 8.3 (C7), 9.1
(F5).

Corrections he has made or is working through:
- **2.1** — was Bb/F, bass is D. Now Bb/D. Done.
- **3.3** — was "G maj, no 5th". pulse1 has an F for a full quarter on beat
  4, making it a seventh chord. He changed it to G7. Still missing the
  bass figure — the triangle is on B, so it's an inversion like his others.
- **5.3** — was "F#m or Gbm". No C# anywhere in the bar. The D arrives on
  beat 4. Resolved to D/A.
- **6.1** — labelled Gm. Notes are G, Bb, C — no D. He'd originally written
  C7 and talked himself out of it. **Still open.** Both readings are
  legitimate on the notes alone; neither is blocked by a missing fifth or
  third. Deciding evidence would be what the held C does on 6.3, and what
  5.3 (D major) wants to resolve to. His to settle.
- **6.3** — labelled Gb, but the span covers two beats with different
  content; beat 4 swaps in an A and a C. Needs splitting or narrowing.
  **Still open.**

**Key is NOT determined.** He suspects F but is unsure, partly because of
chords that turned out not to exist. Do not assign one.

Method note that came out of this: reading only the chord's onset beat is a
heuristic, not a rule. A chord occupies its whole span and a tone can
arrive late — 5.3 is the case that broke it. Read the full span, weight
what's long and metrically strong.

## shop — INHERITED METER IS WRONG. First confirmed fossil error.

`shop.notes.txt` header says **4/4, 200.01bpm**. That is wrong, and this is
the first hard confirmation that the inherited meters can't be trusted.

Evidence:
- The triangle figure is quarter, eighth+rest, eighth+rest — a pattern
  three quarter-notes long. Under 4/4 it phases across the barlines,
  realigning only every three bars. **A dominant repeating figure that
  doesn't align with the barline means the barline is wrong.**
- Josh re-barred it to 6/8 in the app (three quarters per bar) and the
  figure fits exactly, one per measure, no phasing. Correct barlines.
- But the grouping inside the bar is duple, not triple. Onsets fall at
  eighth-positions 1, 3, 5 — nothing marks position 4 as a second beat. In
  bar 1 pulse1 and pulse2 both attack at quarters 1, 3, 4 with durations
  2, 1, 2 — spans of 4 and 2 eighths, straddling the 3+3 boundary instead
  of respecting it. All three channels agree.
- Josh confirms the bass keeps this pattern for 22 of 28 bars, so it's not
  a local effect.

**Conclusion: shop is 3/4, not 4/4 and not 6/8.** Josh also reports feeling
one strong beat per bar, which is consistent — a fast 3/4 conducted in one.

Note the app's re-bar to 6/8 was Josh's own setting, not a fossil. Only the
4/4 in the header is inherited.

### Free test for the meter detector

This gives a cheap automatic check that needs no hand analysis: **find the
dominant repeating figure and test whether its period divides the bar
length.** If the figure phases across barlines, the meter is wrong. Shop
fails this trivially under 4/4. Run it across all 19 songs as the first
pass of the audit — it will likely catch other fossil errors immediately.

Distinguishing 3/4 from 6/8 once the barlines are right is the harder
second step, and that's where onset positions within the bar (1,3,5 vs
1,4) and eventually pulse-channel volume come in.
