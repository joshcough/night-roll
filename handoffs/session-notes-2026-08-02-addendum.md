# Session Notes — 2026-08-02 ADDENDUM

**This is an addendum to `session-notes-2026-08-02.md`. That file has already been
handed off. Nothing in it is superseded except where explicitly marked below. You do not
need to re-read it — everything needed to act on this addendum is restated here.**

Two things: one correction to a claim in the prior notes, and one new analytical thread
with open questions attached.

---

## 1. CORRECTION — retransition reading, and what the sweep actually scoped

The prior notes framed Gurgu Volcano as "the first song that modulates." **That framing is
wrong and should not be carried forward.** Josh corrected it:

> "The other songs do change key. I just didn't examine them in the detail that we did in
> this one. I was just looking at the beginning of the song and identifying the key at the
> start, and I didn't actually look through the entire rest of the song."

The sweep was deliberately scoped to **opening key only**. So the sweep results say
nothing about whether the other songs modulate internally — most likely several do, and
those modulations are simply unexamined. Gurgu Volcano is not the first song to modulate;
it is the first song whose **opening key resisted a quick read**, which is what pulled the
analysis into the rest of the piece.

### The retransition method is sound — do not record it as an error

Mid-conversation Claude suggested Josh had erred by consulting the song's final measures
to help settle the *opening* key. **Josh corrected this too, and he is right.** Recording
his reasoning, because it generalises:

> "In many of the other songs, looking at the very last measures often gave a very strong
> clue as to what key we're in. Even if those were in a different key at the end, there
> would be a descending bassline that clearly leads us back into the start."

The structural justification: **a loop is a closed circle.** The final bars exist to hand
off to bar 1, so they are *engineered* to point at the opening tonic regardless of what key
they locally sit in. A descending bass in the last measures is a **retransition** — it aims
at the loop target. Reading it backwards to infer the opening key is not borrowing from the
wrong region; it uses the one moment in the song explicitly built to prepare the beginning.

This connects directly to the standing hypothesis in the prior notes ("the bass note at the
structural downbeat / loop target is the tonic"). The retransition is the *approach* to that
same target — same structural fact, read from the other side.

### So the real finding: Gurgu Volcano has no retransition

The method didn't misfire on this song. **There was no signal to read.** Working hypothesis:
because the modulation is executed by transposing a whole block, the ending sits in the new
key with nothing built to lead back to the old one. It is a **hard splice, not a prepared
retransition** — the loop seam cuts rather than approaches.

The absence was therefore informative, but only legible in hindsight. Josh was expecting the
usual pointer and got nothing, which read as difficulty rather than as data.

### NEW CROSS-SONG THREAD — loop seam typology

Add to `key-sweep.md` as a thread to test on every remaining song, and retroactively on the
9 already swept:

> **Does this song prepare its loop seam, or cut?**
> - *Prepared* — final bars contain a retransition (descending bass, dominant approach,
>   anything aimed at the bar-1 tonic).
> - *Splice* — final bars sit in whatever key they landed in, with no approach; loop is a
>   hard cut.

Two confirmed examples already, one of each type: several swept songs show clear retransition
bass motion; Gurgu Volcano appears to be a splice. This is cheap to record per song and may
turn out to correlate with whether the song modulates at all.

---

## 2. NEW ANALYSIS — why the unannounced D Dorian ↔ F Dorian modulation works

Josh asked why the modulation works given that **neither direction is announced** — there is
no pivot chord, no dominant preparation, in either direction. He noted he'd learned from
video lessons that unannounced key changes are simply permissible, but wanted to know why
this specific one succeeds.

### Interval content (Claude supplied this; Josh explicitly asked for it rather than deriving, due to fatigue — not a knowledge gap)

```
D Dorian:  D  E   F  G  A   B   C
F Dorian:  F  G   Ab Bb C   D   Eb
```

- **Shared: 4 of 7** — D, F, G, C
- **Changed: 3** — E→Eb, A→Ab, B→Bb
- Every changed tone moves **down by exactly one semitone**; nothing moves further.
- Each key's tonic lives inside the other's scale: **F is ♭3 of D Dorian; D is the 6th of
  F Dorian.** Neither key is foreign to the other.

### The structural reason (this is the main one)

The interval math is supporting evidence, not the cause. The cause is something **Josh
already discovered in the prior session and had not yet connected to this question**: he
identified the modulation as a **transposed block** — the bars 13–16 vamp moved up a minor
third with numerals intact (♭III and IV7 in both keys).

That is what does the work. The listener is not tracking pitch content; they are tracking a
**pattern**. When the same shape returns at a new pitch level, the ear parses it as
*repetition*, not disruption. The relationship survives even though every note moved.

### Why the return is even easier than the departure

Coming back is not a modulation the ear must parse — it is a **return to material already
heard**. Twelve bars established D Dorian as home. F Dorian is the excursion. The return
isn't arrival somewhere new; it's landing where the listener already was.

---

## OPEN QUESTIONS — for Josh, do not answer in the repo

Both deferred by Josh due to fatigue ("good questions, my brain is too tired"). **Claude
deliberately withheld the answers per the standing ground rules. Do not resolve these in
any analysis file, commit message, or code comment.** Log them in the Gurgu Volcano
per-song Open Questions section and in `key-sweep.md`.

1. **What is the specific pivot pitch at each seam?** Identify the pitch that carries the
   ear across at bar 17 (D Dorian → F Dorian), and separately the one at the return seam
   (F Dorian → D Dorian). The two directions may not use the same pivot.

2. **Is the minor-third transposition related to the ♭III already flagged in the vamp?**
   The vamp contains ♭III; the modulation moves up a minor third. Josh to determine whether
   that is coincidence or whether the transposition interval is drawn from the harmony of
   the material being transposed.

3. *(carried forward, still open)* Whether the "hard splice vs prepared retransition"
   distinction in §1 correlates with whether a song modulates internally.

---

## Prior pending items — unchanged, still open

Everything in `session-notes-2026-08-02.md` remains in force, including: audio race fix,
playhead stutter fix, modal key picker, concept-tag index + in-app search, track-mute UX
plus app-wide `touch-action: manipulation`, updating the Gurgu placeholder keys (`C`/`E♭`)
to D Dorian / F Dorian once the modal picker exists, re-checking swept songs for mid-song
channel-role swaps, and gitignoring `ff1.nsf`.
