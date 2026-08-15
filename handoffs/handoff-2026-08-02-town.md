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

# Session continued — menu (same night)

Josh moved on to **menu** after finishing town. This section is in progress
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
