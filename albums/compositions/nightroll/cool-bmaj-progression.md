# Cool Bmaj Progression — how it was made

Josh's first multi-voice composition. B major, 4/4, ends at 75bpm,
intro + A form with a hardware-style loop (`loop: 6.4 → 2.4` — the
fanfare plays once, the body cycles, and the loop seam lands exactly
where the drums enter). This file is the iteration journal, rebuilt
from git history plus Josh's own telling; the analysis-facing note dump
is the `.notes.txt` sibling.

## The versions (git archaeology, app-parser verified)

| commit | when | what changed |
|---|---|---|
| `981d362` | 08-17 16:07 | The raw take: everything on pulse1 (87 notes, 60bpm). Played on guitar in one pass after ~15 min of jamming — "one instrument to me." |
| `2bdbeb5` | 08-17 17:27 | Dealt out with ⇄: melody stays pulse1 (41), chords → pulse2 (60, voice=guitar), first bass on triangle (18 notes: 3 long + 15 short). |
| `44ab68d` | 08-17 17:29 | Bass doubled to 36 notes (6 long / 30 short); outro extends the song to 5.8 bars. |
| `4f1288f`–`3f796db` | 08-18 01:12–10:17 | **The groove iterations** (see below): long bass notes 6 → 4, shorts 30 → 36, one at a time across three saves. |
| `4d87ed7` | 08-18 17:51 | The big arrangement session: tempo 60 → **75**; drums enter (100 hits, first hit at **bar 2 beat 4** = the loop point); pulse2 grows to 70 (new tones + the final chord re-voiced root-position, B on the bottom — an ear-driven fix from an earlier fifth-in-bass voicing); chords raised to v100, kick v111, hats v80 — velocity used as a mixer. |
| `2f94fcb` | 08-18 18:10 | One-time cleanup: 200 stacked duplicate notes removed (a paste bug, since fixed in the app). Unique-note counts unchanged — nothing musical was touched. |

## The bass groove iteration (Josh, verbatim intent)

> "I had twice as many long notes in the bass as I do now. And I
> listened to it and I just kind of got bored... I took out every
> other long note and replaced it with something that felt more groovy
> to me and I don't really know how I did it. I just sort of did it...
> I knew there was something wrong and I knew roughly how to change
> it. But I didn't know exactly. I just did it and it just worked.
> Feels good and weird at the same time."

The data confirms it: long notes 6 → 4, short notes +6, spread over
three saves across a day. Boredom as the diagnostic, ear as the tool.

## The favorite change (one note, commit 4f1288f, 08-18 01:12)

Both bass walkdowns were identical: B2–F♯3–E3–D♯3. Josh changed the
FINAL one's second note: **B2–C♯3–E3–D♯3**. His verdict: "that's the
best part of the whole song." Why it lands, named after the fact:
contour reversal (descent-from-above becomes rise-leap-settle); the
C♯ is the add9 — the closing chord's signature color, now sung by the
bass, resolving 9→3 (C♯→D♯); and because those four notes sit right
before the loop jump, differentiating them from the bar-4 seam makes
"continuing" and "coming around" audibly different — a four-note
TURNAROUND, written by instinct before the turns study ever started.

## What the song is (Josh's thesis)

**The bass is the real melody.** Inverted texture: pulse1's "melody"
(pedal B5, the E–D♯–B triplet turn) deliberately stands still so the
triangle can drive — "it works because the bass line is so good. It is
the driver of the song." The melody's plainness is support, not
weakness.

## Craft inventory (things done by ear, named after)

- **Inverted texture** — bass leads, top voices frame (see thesis).
- **Cross-rhythm** — triplet turn over the straight gallop; later,
  straight-16th hats under the triplet melody. Works because the bass
  ostinato holds the pulse steady.
- **Pedal tones** — long B5 through the chord sway; a second pedal
  (F♯6, a fifth up) added in the fourth pass because "the melody was
  boring — it did the same exact thing every time." Varied repetition.
- **Motivic unity** — the bass's F♯–E–D♯ walkdowns at section seams
  are the melody's E–D♯–B turn, augmented.
- **Agogic snares** — only 8 snares, placed on the bass's long notes:
  weight added where the line already carries weight.
- **Velocity as mixing** — kick 111 / chords 100 / hats & melody 80:
  foreground and background separated by dynamics, not just register.
- **Game-music form** — intro once, body loops; the drum entry, the
  loop target, and the groove downbeat are the same instant (2.4).
- **Badd9 close** — final reach: D♯–F♯–C♯ over the ringing B; Josh
  named it add9 by ear before any analysis did.

## The failed experiment worth keeping (breakdown at 6.3)

Before drums existed, bass-alone at 6.3 "sounded so beautiful." After
the groove established, cutting the drums there for a beat read as a
dropout, not a spotlight — expectation had formed. Kept the drums in.
LESSON LOGGED: dropouts need preparation (phrase boundary, marked
edge, section length). The bass-alone sound is unspent material — a
candidate for the future B part, where the drums can leave *on
purpose*.

## Open threads

- **B part** — blocked intentionally on the A/B-contrast study (see
  open-items.md: the rhythm hypothesis, the revert test, the turns).
- **Bass variation** — the loop's two bass bars are verbatim copies;
  the walkdowns at the seams are the model for varying them. The lead
  voice deserves a second idea.
