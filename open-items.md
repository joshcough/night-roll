# Open Items

Standing list of things agreed but not done, and questions asked but not
answered. Prune as items close; add as they appear. (Claude: check this at
session start alongside the quiz.)

## THE MENU — everything on deck (consolidated 2026-08-19)

**Music (the point of all of this):**
1. ~~B-part study → write the B~~ **JOSH WROTE THE B FIRST**
   (2026-08-19: cool-b-maj-with-b-part — key change to ♭VII, formal
   deceptive resolution across two Breaks, parallel-minor exit, a
   labeled Turn, prepared bass-alone dropouts, harmonic-rhythm shift
   as the "Deceptive A part"'s contrast device). The STUDY now runs in
   reverse: analyze the corpus's B parts to name what he already did
   and find what he hasn't tried. Protocol below still applies.
2. Bass variation in Cool Bmaj — the lead voice's two verbatim bars.
3. Rename his tracks in-app (top/chords/bass/counter — feature shipped
   2026-08-19, names settled in the 08-18 handoff). Josh's two minutes.
4. The `top` voice question — back to square (matched pair with bass)
   or keep sawtooth separation? Josh's ear call, parked.
5. FF1 analysis thread: prologue F#–C tritone (THE NEXT MOVE), 6.1
   Gm-vs-C7 open, prologue key untested; older per-song queue below.

**App — built, awaiting Josh:**
6. ✅ MERGED 2026-08-19 — Web MIDI → ● Record is on main. Awaiting
   Josh's Jamstik field test (desktop Chrome; Safari has no Web MIDI).

**App — design work wanted before code:**
7. Context-aware drum generation (Drummer-style; full requirements
   below — seeds, one-tap reroll, constrained randomness).
8. ✅ Drums in the score view — SHIPPED v1 2026-08-19 (percussion
   clef, role positions, x-heads, hands-up/feet-down voices, kit staff
   at the bottom). Read-only: score-side kit ENTRY still open; open-hat
   "o" marks and flams someday.
9. iPhone top-row treatment (chips unreachable on phones).

**App — implementation-ready, medium:** ALL SHIPPED 2026-08-19 —
10. ✅ Chord bands ride rigid moves (label transposes) + ⚠ stale marker.
11. ✅ Tombstones: deleted synced annotations stay deleted across
    reloads; cleared on Sync.
12. ✅ Adaptive 32nd grid (Josh's spec: only when the song HAS 32nds or
    you pick the 32nd duration). REMAINING pipeline half: fitBpm could
    label TMNT2-style 32nd-run captures 150 instead of 300 now that
    the editor grid can hold them — capture-side change, re-capture
    required, treat separately.

**Someday:**
13. music21 private answer key (guardrails below; useful at ~10
    annotated songs).
14. Instrument-panel piano zoom (parked until fat-fingers bite).
15. Guitar audio input (monophonic pitch tracking) — superseded for
    now by the Jamstik/MIDI path, kept as the amp-and-cable dream.

## RESTART CONTEXT — updated 2026-08-15 late night (the seven-hour app marathon)

**Analysis thread unchanged:** prologue F#–C tritone is still THE NEXT
MOVE (see the 08-14 block below — nothing analytical happened tonight).

**App, all shipped and pushed tonight (2026-08-15 evening session):**
NSF import (File → Import…, byte-sniffed picker; captures = local
drafts; audition → rename in the panel row → ✕ duds → Commit import
publishes the album), local MIDI imports persist as `local/` drafts
(reopenable from Open → drafts, never synced), 36 sampled FluidR3
instruments in a family-grouped voice menu (~85MB in vendor/soundfonts/,
lazy per track per pitch; the 08-15 synth patches left the menu),
full-width color picker (swatches removed), track-row layout fixes
(▾ hugs chips, transport pinned top), voice menu holds position + ✕.
Tests 45/45. Details in NIGHT-ROLL.md.

**DATA-LOCATION CONFIG SHIPPED (2026-08-17 afternoon; physical split
DEFERRED):** Night Roll is now configured with where songs, analysis,
and NSFs live (Sync → Data locations; cfg()/songsURL/analysisURL/
nsfURL/repoApi in index.html; spec in NIGHT-ROLL.md). nsf-archive is
PUBLIC (Josh's considered reversal of never-publish; chip audio is
tokenless everywhere; archive default branch renamed master→main).
Advisor-reviewed plan incl. the deferred ost-songs/ost-analysis
physical split lives at
~/.claude/plans/velvety-shimmying-quail.md — execute it when a second
analyst is real, with its baked-in ordering fixes: git filter-repo for
history, extend the token BEFORE verification, DROP night-roll from
the token at prune time (stale cached tabs must fail loudly, not sync
into a pruned repo). Leftover for Josh: delete the empty duplicate
repo joshcough/nsf-vault (needs delete_repo scope I don't have).

**MM2 STATUS AFTER THE ALL-NIGHTER (2026-08-17 ~3am):** Flash Man (t3)
"sounds really good"; Wily 1 (t11) "pretty great"; title (t1) "really
really close" after the snap-residual raw-timing gate. Shipped in the
final hour: per-note duty timbres (chip instrument choice, CC70),
chip software envelopes (per-note decay targets as aftertouch —
targets the "tremolo" flat-sustain beating; Josh had NOT yet auditioned
this build), linear velocity map (the ^1.6 experiment pumped gallop
accents — reverted), auto raw-timing for tracks one grid can't hold
(t1 mid-song tempo change, t2 triplet gallops).

**OPEN: title theme (t2) bars 17-25 "train wreck — band not together"**
(fresh capture, rest of song good). Autopsy data: that section is
32nd-note arpeggio runs — IOIs alternate 2/3 frames (33ms notes) vs
the clean 5-frame 16ths elsewhere; channels perfectly synced (p2 lag 0
for 61/67 notes), so data is chip-true — the wreck is RENDERING walls
of 33ms notes (osc-per-note attack/release blur, possibly also the
snap-residual gate keeping raw timing so the roll grid misleads).
Ideas: envelope build may already help (unheard); if not, consider
arp-aware rendering (merge rapid same-channel runs into one osc with
frequency steps — the chip IS one osc changing pitch, not N osc
attacks). Also unheard-yet: whether bars 17-25 improve under the decay
envelopes. FIRST MORNING STEP: re-capture t2 on latest build, listen.

**MM2 "notes cut off" (Josh's earlier report before bed 2026-08-17
~2am) — analysis + one fix shipped, LISTENING VERDICT NEEDED:**
import now works end-to-end (the tab-killer was a negative backported
time running the MIDI varint writer unbounded — found by the
independent advisor, fixed + regression-tested). On the remaining
"songs still fucked up / notes cut off": overnight data says the
CAPTURE data is largely right — median durations legato (duty ~1,
matching chip behavior), timing frame-exact, wily1 triangle matches
its transcription 72% on a 50ms lattice (the pulse "mismatch" is
mostly tempo drift: chip 150.01/180.01 vs transcribers' rounded
148/175, plus echo/vibrato simplifications in the transcriptions).
Prime suspect for the EAR: the app's fixed note envelope — 8ms attack
+ 30ms release ate 76% of a 50ms note, and MM2's 300bpm tracks are
FULL of 50ms notes → "cut off" percept. Fix shipped: envelope now
scales with duration (short notes keep ~75% body). Morning protocol:
re-listen to a 300bpm track (Quick Man t9, Flash Man t3); if still
wrong, Josh should name ONE track + ONE spot (bar/second) and whether
it's the roll (data wrong) or only the sound (synthesis wrong) — that
one datum decides capture-vs-playback. Also possible next lever:
chip volume envelopes (MM2 fades notes; our render holds full level —
sounds LONGER than game, not shorter).

**MM2 bug #2 ALSO FIXED overnight (autonomous session with Josh's
reference MIDIs + mm2.nsf):** after the fitBpm fix he reported "much
better but still broken." Raw APU write dumps showed the real remainder:
MM2's driver renders GLISSANDI as per-frame period steps (Flash Man's
falling bass: A G F Eb D, one frame each) — reconstruct() turned each
step into its own note: hundreds of 1-frame notes ("confetti"), which
is the mess he heard in dense passages. Fixes in reconstruct():
(1) ±70-cent vibrato guard vs the note's start frequency (same-frame
setup writes exempt — the pitch-sweep tests catch that), (2) slide
collapse: chains of abutting ≤2-frame moving-pitch notes merge — into
the held target note (portamento) or the first pitch (fall-off).
Verified: MM2 t3 confetti 335→8, fits land 150/180 (t9's 300 = real
32nd runs); FF1 event counts byte-identical (507/432/703/333) so repo
regeneration is untouched; 45/45. Track↔reference matching (interval
5-grams): t1/2/23=title, t3=flash, t5=crash, t8=metal, t9=quick,
t11=wily1, t22=end(1.00). MORNING STEP: hard reload → re-import mm2 →
Re-capture all → listen. Reference MIDIs live on Josh's Desktop
(Megaman_2/); transcription bpms (140/148/175) vs chip-true fits
(150/150/180) — chip wins, transcribers rounded.
Josh supplied mm2.nsf; IOI histograms showed MM2's driver is
frame-integer (16th = exactly 5 or 6 frames → 180/150bpm) while fitBpm
only searched ±15% around the cold seed of 120 — it fit ~134bpm and
snapBeat quantized every note onto a grid that doesn't exist. Fix in
tools/nsf/notes.mjs (shared by app + offline dumper): fitBpm now also
tests the chip-native family (integer frames per 16th, half-steps
included), and among near-tied fits (double/half grids —
timing-identical, different labels) picks the bpm closest to the seed.
Verified: MM2 tracks land exact (180/150/300 — 300 = real 32nd-note
arps needing the fine grid); FF1 overworld cold-fits its true 150.
Josh must RE-CAPTURE MM2 once more (needs Pages deploy + reload).
Known remaining softness: FF1-style accumulator drivers (fractional
frames per 16th, e.g. battle) still fit imperfectly cold — repo FF1
is loop-calibrated so unaffected; snap-residual raw-timing fallback
remains future work if a cold accumulator-driver NSF sounds rough.
mm2.nsf lives in Josh's scratchpad copy only — NOT committed (he may
want it in reference/ later). Reference MIDIs: Josh finding tomorrow.

**AWAITING JOSH:** Mega Man 2 NSF field test on the iPad — mm2.nsf is
downloaded there; the picker bug that blocked .nsf selection (iOS
accept-filter) is fixed. First cold-NSF run: expect grid-fitted 4/4
guesses, per-row capture-seconds bumps for long intros, track naming
during audition. Also: does he want more GM instruments pulled
(~90 remain — sitar, koto, timpani, ocarina, steel drums…)?

Older context below still applies where not superseded.

## RESTART CONTEXT — updated 2026-08-15 (after the 08-14 web session)

**Prologue is the live thread.** 6.3 determined: F#(♭5), root position,
A as passing motion — full derivation path in Josh's
handoff-2026-08-14.md (not yet transcribed to analysis/prologue.md;
needs his go). Pulse-2 independence hypothesis tested bars 1–5 and
FAILED — it's a harmonic voice and testifies at 6.3. Rollnotes already
fixed by Josh himself: 5.3 = chord: D/A, 2.3 = Am7/C. **THE NEXT MOVE,
untouched by his choice: the F#–C tritone thread** (one tritone → two
dominant sevenths; likely bears on 6.1 Gm-vs-C7, which is still open —
new evidence since he wrote Gm: 5.3 is D/A). Key of prologue: F
suspected, untested. He ended the session frustrated the tritone wasn't
resolved — it's fully recorded, nothing lost by having stopped.

Older context below still applies where not superseded.

## RESTART CONTEXT — state as of 2026-08-05, late night

Read this first in a fresh session. Also read the memory files —
especially the interface discovery: **mid-turn text is swallowed by
Josh's client; only each turn's FINAL message reaches him.** Announce
nothing before tool calls; put the whole story in the final message, and
END THE TURN to get his sign-off before touching his analysis files or
rollnotes.

**App (Night Roll, all deployed):** meter is user-declared (neutral 4/4
grid until a timesig: directive; two-tap re-bar warning converts
anchors); spelling is all-sharps until a key is declared; seven-mode key
picker (key: D dorian); fast section flow (drag → +Note → type → Enter);
sync review pane with per-note discard; notehead lasso; aligned score
columns; chip-volume velocities now drive real dynamics. AWAITING JOSH'S
iPAD TEST: the clock-verified audio fix (app-switch-and-return — third
attempt at this bug; resumeAudio now proves audio.currentTime advances
and rebuilds the context if frozen).

**Pipeline:** chip volume preserved end-to-end (velocity + vN column in
notes.txt; pulses/noise only). Shop re-barred to 28 bars of 3/4 per
Josh's determination (first fossil error confirmed; METER_OVERRIDE in
dump-all). Meter audit v1 (tools/nsf/meter_audit.mjs) mechanizes his
barline test; findings quarantined in reference/meter-audit.md — only
epilogue fails (expected: rubato). The fossil design problem (meterOf
reads the pipeline's own output) is documented in open-items below;
detector v2 (grouping/accent second pass, cutting the circular
dependency, full audit sign-off flow) is future work.

**Analysis state:** sweep 11 songs opened (see key-sweep.md). In flight,
awaiting Josh's handoffs: prologue (chords, two open: 6.1 Gm-vs-C7, 6.3
span; key suspected F, undetermined), menu (chords bars 1-3, E7 tritone
thread, meter + key undetermined), matoyas-cave rollnotes synced
2026-08-05 but NO handoff yet — do not process. Floating Castle parked
as Josh's no-help song. Big open rulings HIS to make: the
fifths-in-the-bass script results (key-sweep.md "Script v1"), the
Gurgu seam pivots, victory/gameover bass exercises.

**Conventions that keep biting:** every push must be hash-verified
(iPad syncs race constantly); pure-git commit commands only (the
auto-allow hook); name every file before batch edits; park-before-
pointers when Josh is tired; never pre-declare meters/keys/anything on
his behalf.

## Questions awaiting Josh

0. **Key sweep in progress — see [key-sweep.md](albums/final-fantasy-i/analysis/key-sweep.md).** 10 songs
   opened (gurgu: opening key resisted the quick read — D→F Dorian; other
   songs' interiors remain unexamined), 9 to go. New thread: loop seam
   typology (prepared retransition vs hard splice) — see the sweep doc.
   Hypothesis revised 2026-08-02 to the loop-target form; the naive script
   scoring disagrees with the by-eye sweep (fifths in the bass) and THAT
   ruling is Josh's — see the sweep doc's "Script v1 results".
   **Convention change (Josh, 2026-08-01): per-song open questions now live
   in each song's own doc** (battle.md, airship.md, cave.md,
   chaos-temple.md, overworld.md, cornelia-castle.md all have Open
   Questions sections) — this global list keeps only cross-song and
   tooling items.

1. **Baseball/Beach song:** where did the B–D–F–Ab voicing come from — ear,
   hands, or something you read? Did you know it forms a diminished 7th?
2. **Baseball/Beach song:** the bass never sits on G under the "G7♭9" — it
   creeps chromatically around it. Did you notice you'd done that?
3. **The owed quiz** (from the 2026-07-22 concepts — 5 questions):
   modulation recipe; C-major pivot chord's Roman numeral in G and in F;
   why C7 signals F harder than a C triad; V7 resolving to major vs minor
   tonic; key-distance → melodic difficulty. Never taken; still on deck.
4. **Title decision:** Baseball Song or Beach Song (dropdown says
   "Baseball / Beach Song" until you pick).
5. **"Seventh-side resolution"** is a working name, yours to rename.

## Composition exercises owed

- **F-minor (or Bb-minor) half of the key-change exercise.** KeyChangeTest's
  two halves are identical; the dark version was the original assignment.
  Bb-minor route: one Db does the darkening (the bare-octave bar 9 socket).
- **E♮ hypothesis test:** same chords, but feed F its leading tone (E♮ in
  the melody leaning into F) — does F hold the throne this time?
- **Melody revision pass** on KeyChangeTest after studying how Uematsu's
  Overworld melody sustains phrases (bars 1–3 are riff; make them sing).

## Analysis queue

- **Overworld melody (tr1) + counter (tr2)** — bass done, upper tracks never
  opened. Pending verifications listed in overworld.md: bar 10 D major or
  minor; bar 12's predicted G#; tr2's C-natural in bar 4 (D7?); Josh's
  "melody sounds like E minor" instinct.
- **Baseball/Beach song** — Josh annotates his own hearing first (rollnotes
  from bed), then joint session.
- **Retrospective progression pass across analyzed songs (Josh,
  2026-08-06):** the key sweep scoped opening keys only, so nobody ever
  read the progressions across songs — cadence habits, V7 vs modal
  motion, recurring progressions, where rare triads (menu's iii) appear.
  Data exists in analysis/*.md + chord-charts.md; this is a reading pass,
  not new capture. Not now — Josh flagged it to circle back to.
- **Whole-tone exercise — floating castle (deferred 2026-08-07):** Josh
  identified the song as whole-tone material (melody D5–A#5 = five
  consecutive whole steps; static tritone field in the bass; every
  standard test fails because the scale is symmetric — no privileged
  root, three tritones, no leading tone). Stopped deliberately while
  tired. The exercise, fresh: classify every pitch by collection (there
  are exactly two, complements); decide whether the D#/C# material is
  second-collection structure or decoration; whole-tone notation done
  properly (Debussy reference); and whether "opening key" even applies —
  may need its own sweep category. The sweep's recorded Bb tonic has NO
  derivation anywhere — treat as unsupported until re-derived.
- **From the 08-07 sweep session, still open per song:** undersea-shrine
  past chord 2 + why the offbeat D# pedal; ship's Pulse-2 E question
  (position says chord tone/Fmaj7, duration says neighbor — logged
  unresolved) + the withheld-third open fifths; prologue bars 5+ (Gm...
  C7 back to F?); victory's thin two-Db evidence rides on metrical
  placement.
- **Data issues flagged 2026-08-07 (awaiting Josh's go to fix):**
  key-sweep.md Tally shows ? for songs whose rollnotes have keys
  (matoyas-cave B minor, menu Bb) and 8 songs total are recorded but not
  swept; gurgu-volcano carries two key lines (D dorian, F dorian) and
  the sweep only records the first — should it capture section-level
  changes at all?; floating-castle has a sweep entry but no .rollnotes
  (partial key: A#/Bb? added 2026-08-12). RESOLVED 2026-08-14: the
  prologue chord-in-a-section-field entry ("section: F#m or Gbm") was
  both mis-fielded AND stale — Josh fixed it himself via Sync (now
  chord: D/A). It cost session time exactly as the drift-check tooling
  request predicted; that request stands, evidenced.

## Composition in progress — Cool Bmaj Progression (Josh, 2026-08-17 night)

Josh's first real multi-voice composition; came out in a flow state
("I'm not consciously thinking but the thought is there"). State:
melody alone on pulse1 (fanfare, E–D♯–B triplet turn, long B5 pedal),
chords on pulse2 (vi ↔ I⁶ sway, Badd9 close — his hearing, correct),
NEW bass on triangle (root-root-root-fifth ostinato; F♯–E–D♯ walkdowns
at seams = the melody's turn augmented). Cross-rhythm (triplet melody
over straight bass) discussed and blessed — steady-layer principle.
NEXT THREAD (his call, agreed): bass is two bars copy-pasted; vary it
the way pulse2's chords vary — walkdowns at seams are the model; maybe
a passing note in bar 3/4 before the payoff. He may also re-voice
pulse1's instrument. Quiz material: cross-rhythm/steady-layer, pedal
tone, motivic augmentation, add9 naming from a pedal context.

## Composition — NEXT THREAD (Josh, 2026-08-18): B-part study, then write one

Cool Bmaj has intro + A (with variation) and Josh loves it ("the bass
is the real melody" — inverted texture, his diagnosis). He wants a B
part but names A/B contrast as his songwriting weak spot. Agreed plan:
FF1 analysis sessions with a standing question — what makes B parts
work against their A parts — THEN write the B.

**Josh's pre-analysis hypothesis (2026-08-18, to be tested not
assumed):** harmonic departure isn't enough — B contrast lives at
least as much in RHYTHM changes, especially bass and accompaniment.
Evidence from his own song: the A part's identity IS its gallop bass;
new chords over the same gallop would still read as A.

**Listening protocol for each B section:**
1. Score every contrast dimension separately: harmony/key, bass
   rhythm, accompaniment texture, melody register/density.
2. Then the discriminating question: which SINGLE change, if
   reverted, would break the contrast? That separates "things that
   happen to differ" from "the thing doing the work."
3. Expect the answer to vary by song — the rhythm-carried Bs are the
   ones that teach Cool Bmaj's B part.
4. Same treatment for the TURNS (often the C part — his Overworld "C:
   borrowed + turnaround"): what a turn changes, and what it does
   that a B doesn't — setting up the return home vs departing from it.

Starting material: his own Overworld labels (A "G home" / B "Am
visit" / C "borrowed + turnaround") assert the harmonic mechanism;
verify with the now-ear. Also still queued: bass variation in Cool
Bmaj (the lead voice deserves development).

## Glossary (new doc, 2026-08-18)

glossary.md: terms Josh has ENCOUNTERED vs DEMONSTRATED (his
distinction — "I've just encountered them... I don't want to say I've
learned them"). Encountered terms are quiz fodder; passing + deliberate
use promotes to demonstrated, evidence noted inline. Anchors point at
bars/beats; FF anchors are deliberately blank "(find one)" slots —
locating them is analysis homework. Keep it updated when new terms come
up in sessions; promote honestly.

## Design-stage / future (from the 2026-08-18 web-session handoff)

- **Context-aware drum generation — BUILT ON BRANCH `drummer`
  (2026-08-20, Josh green-lit overnight; advisor-reviewed design).**
  v1 shipped to the branch: idempotent replace-in-range as one group
  undo (hand drums back in one ⟲), per-bar PRNG substreams (range
  changes can't scramble liked bars), take chips snapshotting the full
  (seed, energy, range) tuple, fixed skeleton + meter table, velocity
  table with the hats-under-snare ceiling, follow-the-bass kicks,
  chord-downbeat accents, agogic snare on bass long notes, 5-entry
  fill vocabulary incl. the negative fill (75% per boundary, crash on
  arrival), sustain-aware break silence with label override, meter-
  change refusal. AWAITING JOSH'S FIELD TEST before merge.
  **v2 queue (advisor):** layering mode ("keep my kicks, regenerate
  hats"); fill length via per-section annotation; bass-track picker;
  swing/humanize; ride-vs-hat per section; per-instrument density;
  seed provenance as an annotation; tom-groove styles; half-time feel.
  Fill vocabulary to be curated empirically by what Josh keeps.
- **Drums in the score view**: percussion clef, fixed staff ROLES not
  pitches (kick bottom space, snare 3rd space, hats above top line),
  x-heads for cymbals/hats, stems up = hands / down = feet. RULED: kit
  staff always at the BOTTOM. DRUM_SLOTS/DRUM_LABELS exist; needs a
  GM→staff-position/notehead table. VexFlow supports both natively.
- **music21 as Claude's private answer key** (Josh approved): output to
  Claude only, never Josh; hypothesis not ground truth (chip corpus is
  its weak case); hints must still route through the derivation.
  Becomes useful at ~10 annotated songs; Humdrum/kern for corpus-wide
  pattern queries.
- **Tombstone architecture for deleted synced annotations**: the
  general fix behind the duplicate-directive bug (deletions of synced
  notes only exist in memory; localStorage persists added notes only).
  The load-time last-wins dedupe (shipped 2026-08-19) covers track:
  directives; deleting OTHER synced annotation types before a Sync
  still resurrects on reload. Design: tombstone list in localStorage
  the loader subtracts, cleared on Sync.
- **MIDI input branch (`midi-input`, built+parked)**: Web MIDI →
  ● Record with real velocities (Jamstik). Josh testing before merge.

## From the 2026-08-19 web handoff

- **Lasso is the core composition gesture** (Josh: "I used the lasso a
  lot") — pencil is for the first idea, lasso+transpose for everything
  after. Composition-ergonomics priority signal: invest there, not in
  note entry. iPad pencil chord entry is slow; the untested unblock is
  ● Record + the Jamstik (merged, awaiting his field test).
- **Loop annotations corpus gap — JOSH IS DOING IT BY HAND (2026-08-19):**
  he wants them verified-correct and it's a good pass over the corpus
  anyway ("it's only 19 songs"). No script. When done, loop-targets
  --all becomes a full corpus view of every voice at every loop target.
- Song threads (Josh's corrections, 2026-08-19): trumpet (voice5) is
  NOT deliberately held out of the B section — he hasn't tried it yet.
  Plan: not in the B part's first two bars, but it "could very well
  belong" in the remaining bars; probably drops out for the Turn like
  everything else does. Drums stop before the B part. Drums overall
  "could use some work" — accents, fills, variation (feeds the parked
  drummer design, still do-not-implement).
- **Intro replacement (Josh, 2026-08-19):** he no longer likes the
  intro — "I liked it... maybe it could be good for another song. I
  don't think it quite fits anymore." Wants to cut it and slide the
  song back. The enabler shipped same day: a move that carries EVERY
  note now carries the whole annotation layer too (sections, chords,
  loop anchor+target; labels transpose on vertical moves). Workflow:
  delete intro notes → select all → drag left. The old intro is a
  candidate seed for a new song.
- Query tools verdict from the field: zero factual errors in a full
  session (a first); ✱ inline notes and duration-weighted census called
  out as better than spec. Equal-span anomaly retired (false positive
  since the lane redesign).

## Annoyance log (Josh, from writing the B part — no proposals yet)

- **Selection dies on scroll.** Copying bar 3 to bar 16: lasso at 3,
  scroll to 16, selection gone — so he zooms way out until both bars
  fit, and then the notes are too small to lasso. He explicitly did
  NOT propose a fix yet; logged as a real cost of the core gesture.
  (Candidate directions when this comes up: selection survives
  pan/zoom; or paste-at-cursor so the clipboard, not the selection,
  travels. ⧉ Duplicate + drag already survives some of this.)

Shipped same session (2026-08-19): draggable Logic-sized cursor
handle; ⏮ returns to an armed cycle's start; ruler highlight parks/
re-arms instead of dying (his bar-7-to-9 case); ruler drags snap to
16ths (32nd snapping made his B-part section edge land a 16th off —
worth re-dragging that edge, Josh); full-song moves carry annotations.
SUPERSEDED 2026-08-22: ruler snapping is now bar-magnetic (14 screen
px) with 16ths elsewhere, and ruler taps no longer clear the lasso —
both from his 08-21 "reported with real heat" items.

## Composition thread — graveyard (2026-08-20 → 08-22, web sessions)

- 21 bars, F♯ minor (transposed whole from Gm), journal at
  albums/compositions/nightroll/graveyard.md. Intro complete and
  liked; seam built (eighth-rest gap, F♯ hang solved rhythmically,
  hard splice); riff + lead written — lead is "the absolutely most
  beautiful thing I have ever written." Bar 13 DECIDED: harmony, not
  unison (unison washed out the middle voice).
- OPEN, all his: fast-section tempo (at 160; ratio-vs-subdivision
  framing on the table); bar-8 run regrouping now that ➗ exists
  (sextuplet vs two eighth-triplets — his call); which thread carries
  across the seam; real bass arrangement (sketch-pad bass — he's
  studying Ellefson/Rust in Peace); whether the never-sounds-the-tonic
  melody is deliberate (asked, unanswered).
- Housekeeping he may want: duplicate tempo 80 at [1,1] in
  graveyard.rollnotes.json (harmless; HIS file, not touched).
- B-part study now has a second live specimen: graveyard's A→B is a
  rhythm-carried contrast BY DESIGN — the category his 08-18
  hypothesis predicted would be instructive.
- **Quiz owed ×3** (2026-07-22 concepts + leading tone + the 08-21/22
  material: borrowed chord, timbral fusion, pedal vs chord, duration
  vs position, interval inversion); declined three times; draw from
  all banks at once when he's willing.
- **Named recurring pattern — duration vs. metrical position** (was
  two separate open questions, now three instances): Ship's pulse2 E;
  graveyard 7.3's C♯ (short but lands WITH the bass change); graveyard
  bar 6's E (short but recurrent in a fixed metric slot — if it
  counts, bar 6 is an incomplete 7th chord and bar 10 RESOLVES it, not
  just thickens it). Both kinds of evidence are honest; when they
  disagree, record both readings. Suggested annotation form for bar 6:
  F#m7(no5) with the note saying the seventh is rhythmic.
- **graveyard experiments queued, his**: bar-8 voicing audition (bare
  F5 vs full triad — does the third settle it and kill the pull?);
  intro-subdivision lever (thin the constant eighths instead of
  raising the fast tempo — untried); second thematic idea when the
  piece outgrows 6–13 (a scale note, not a criticism); bar-12 note
  (vii°7 reading is the least self-evident label — pending HIS
  wording). Tempo now 96/192 (raised both ends, ratio kept).

## Awaiting Josh's field verdicts (2026-08-19 marathon session)

- **Hold-to-grab friction is REAL but undiagnosed (his 08-20/21 field
  report):** scroll-misfires solved, but moving existing notes up/down
  is now "a pain in the ass." The 230ms dwell is ONE suspect, not the
  diagnosis. DO NOT implement a fix until he reproduces it live and
  narrates (which pointer, note selected or not, grab never starts vs
  starts-then-loses, roll vs score). Candidate shapes logged in the
  handoff: lower dwell / axis-based grab (vertical=grab, horizontal=
  pan) / instant grab on already-selected notes / slop threshold.
  AUDIT 2026-08-22 found the PRIME SUSPECT: with a selection active,
  pressing an UNSELECTED note pans instead of grabbing — a stale
  off-screen lasso silently turns note-presses into pans. Candidate
  fix (NOT shipped, his call): press-on-unselected replaces the
  selection and grabs. Shipped the safe half: an arm cue (✊ info line
  + the note sounds) when the dwell lands.
- Logic-style always-from-top cycle play — he suspects he may want
  mid-span audition back ("i can ask to change it later").
- New since his last load: real copy/paste (⧉ must be tapped before 📋
  works — old lasso→paste habit now grays paste), button graying,
  hold-to-grab, band edge drag, left-edge resize, double-tap bands,
  LCD taps, chord extension chips, on-demand Check labels.

## Drummer v2 seeds from Logic's control surface (Josh shared it, 2026-08-22)

- **Unison-mode bass follow — BUILT, then REVERTED on Josh's caution**
  (2026-08-22): sparse on-beat bass bars (his bar-13 brake) would get a
  kick on every hit, no dice. His worry, probably right: "that could
  extend everywhere" — note-count can't tell a dramatic brake from any
  quiet bar with on-beat bass. Candidates if it returns: only in bars
  where MELODY doubles the bass rhythm (true unison texture), or as an
  explicit per-section annotation, or just leave it manual (3 kicks by
  hand). His current answer: manual. The curation datum (2026-08-22):
  the generator gave kicks on 1, 2, 4 of his four-quarter brake; his
  ear added beat 3 — full unison, no syncopation, when the band hits
  together. First entry in the keep/change trail.

Shipped from it same night: the fills knob (amount+size, decoupled from
energy). v2 SHIPPED overnight 2026-08-22 (advisor-designed): busy/hard split,
follow bass|chords|off, feel normal|half|double. Advisor's v2+ queue:
- Nameable pattern variants (variant index REPLACES the per-group seed
  substream, joins the take tuple) — only if chips prove insufficient
- Per-piece density row (hats/kick/snare less/normal/more)
- Skeleton personas (chip/rock/metal tables) — after fill vocabulary
  matures empirically
- Swing — explicit request only (advisor: mush on chip/metal material)
- Ghost knob — only if busy/hard proves too coarse
- REJECTED: per-section feel annotations (knobs are generation inputs,
  not song state); a Manual tab (the whole app IS the manual tab)
Round 2 (2026-08-22, his "bring in an adviser" ask): same-label
sections now share grooves — TO ACTIVATE ON GRAVEYARD Josh renames
"A repeat" to "A1" (exact match by design; the rename also merges
their ruler colors, visible confirmation). Metal-tier fills shipped
(tomrun/kitfall/doublekick, weighted at fills 4-5). NOT changed, per
advisor: groove logic, fill trigger sites, probability curve, the
five original fill bodies. Pre-update take chips no longer replay
fills identically (pool grew 3->6 at the top band) — session-only,
nothing persisted. Advisor's watch items: hard=1 may re-trigger quiet hats (floor 40 is
the mitigation — Josh's ear rules); chords-follow may machine-gun
under harmonic-rhythm compression (cap 4/bar is a guess — if it
stiffens, bring him the tradeoff, never quietly go probabilistic);
"double" skank vocabulary is unvalidated.

## Quiz platform (Josh, 2026-08-22 — "absurd but it would be pretty cool")

His jiu-jitsu framing: a concept learned once and never drilled decays;
he wants recognition maintained, tracked over time. Design-stage shape
(not built): an in-app quiz mode backed by glossary.md + quizzes.md —
question bank generated from encountered/demonstrated entries and
their anchors ("what device is at graveyard 8-9?" both directions:
term→anchor and anchor→term); spaced-repetition scheduling (miss = see
it sooner, streak = see it later); results tracked in a synced repo
file so history follows him across devices; a passing streak becomes
promotion evidence for encountered→demonstrated. Three quizzes' worth
of owed material is the seed bank. Needs his ruling on: in-app vs
web-session-led; how scores display; whether wrong answers reveal or
park.

## Tooling to-do

- **Kit piece solo/mute in the drum track's voice menu** (Josh,
  2026-08-22): gutter-label tap cycle shipped and approved; if the
  labels prove too small to hit on the iPad, mirror the controls into
  the drum track's chip menu (tap selected chip) — "not necessary
  yet," his call after field use.

- **iPhone treatment (Josh, 2026-08-18, "eventually"):** track chips
  are unreachable on a phone — the top row shows only ⏮ + ▶ pushed
  hard left; the chip cluster gets no room. The bottom panel already
  auto-folds on phones; the top row needs its own phone answer
  (stacked layout? chips behind a single ☰ button? transport-first
  with chips in a drawer?). min-dimension <500px is the existing
  phone gate to reuse.

- **Record button — SHIPPED overnight 2026-08-18** (● beside Play,
  editable songs): key-down/key-up on the 🎹 panel = note start/end on
  the selected track, grid-snapped (triplets honored), count-in
  applies, take = one undo, multi-touch chords per-pointer. AWAITING
  JOSH'S FIRST REAL TAKE — timing feel (snap vs raw + quantize-after)
  is the thing to judge by ear. Future door: WebMIDI for a real
  keyboard.



- **Chord bands vs moving notes (Josh, 2026-08-17):** inserted/authored
  chord annotations go stale when the notes under them are edited.
  Agreed plan, two phases (build when Josh calls for it):
  1. *Bands ride along* (compositions only): when a move/transpose
     gesture's selection covers all sounding notes in a band's span,
     the band moves with it and its label transposes (Cm +2 → Dm).
     Deterministic — no chord-namer guessing.
  2. *Stale marker*: after any edit, a band whose label no longer
     matches what sounds in its span gets a subtle ⚠ tint; tapping it
     offers "notes here now make G7 — rename?" One tap to accept.
     Never silently rewrite — on analysis songs bands are Josh's
     discoveries and must never auto-edit.
- **Playwright e2e suite — SHIPPED overnight 2026-08-18** (Josh's
  green light "work on playwright tests tonight"): `npm run test:e2e`,
  10 gesture specs × chromium + webkit (≈ iPad Safari) in ~10s —
  lasso-drag move, edge resize, tool-off panning, pencil tap+drag,
  🗑/⧉/📋, help tabs, chord insert, drum fill + lane dock, velocity
  slider. Key discovery: headless chromium stalls ~20s constructing an
  AudioContext (no device) — e2e stubs the WebAudio surface (fake ctx
  in tests/e2e/helpers.mjs). Tests store no token: repo-write paths
  provably inert. Extend per feature alongside the vm suite.
- **32nd-note snap grid (2026-08-16):** TMNT2 scene-2a shows tempo 300 —
  real 32nd runs on a 16th-only grid; fitBpm halves to 150 once the grid
  supports 32nds.
- **Full Synthesia-style piano view — SHIPPED 2026-08-07** (▼ Fall in the
  instrument panel): notes fall down the main canvas into the panel's
  keys, chord symbols and bar numbers ride their lines. Possible later
  polish: pinch to change the 4.5 s drop window; scrub-by-drag while
  stopped (gestures currently disabled in Fall).
- **Instrument-panel piano zoom (Josh, 2026-08-07):** wide-range songs
  stretch the auto-fit keyboard thin on the iPad — keys may get too
  narrow to tap. Wanted: a way to zoom the piano in, maybe just a button
  that enables zoom. Parked at Josh's call — leave until fat-finger
  trouble actually shows up in use.
- **Zoom-out clamp to song extents, roll view — SHIPPED 2026-08-07:**
  pinch-out (and ctrl+wheel) stops once the whole song fits; per-axis
  floors, so time stops while pitch keeps revealing; bounded to the
  chop-trimmed extents. The no-padding experiment concluded 2026-08-07:
  flush felt cramped — right/bottom now keep a ruler-width/-height of
  air, mirroring the left/top bars. fitView lands exactly on the floor, so the
  load view = the zoom-out limit. Revises the "unlimited roll zoom-out"
  note under the parked two-regime score item.

### Tooling requests — 08-07 sweep handoff (proposed; Josh signs off)

- **Key picker: tonic-only first dropdown + stored-vs-applied keys —
  SHIPPED 2026-08-07** exactly per the handoff design: 12 tonic pitch
  classes (enharmonics labeled "G♯/A♭", spelling auto-picked to land on
  a real signature), mode entirely in the second dropdown incl. "mode?".
  Partials write `key: G#/Ab?` — stored, listed, round-tripped, and
  clearly labeled NOT applied; no signature or respelling until the mode
  lands. Existing annotations needed no changes (format unchanged for
  full keys — all 14 distinct key lines verified parsing identically).
  Bonus same day: **◯5 circle-of-fifths modal** (Josh's request) — live
  chart with the rotatable degree window, tap-to-recenter, ⟲ ⟳, opens
  on the song's governing key.
- **Lasso: beyond one rectangle — SHIPPED 2026-08-07** (CC's touch-first
  design, per Josh's "build whatever you think appropriate"): boxes
  union into the selection, tapping a note toggles it in/out (works in
  roll, score, and fall), tapping empty space clears. No modifier keys —
  iPad has none. Solves the interleaved-pedal case: box the region, tap
  the pedal notes out.
- **Pitch-class highlight — SHIPPED 2026-08-07** ("find:" dropdown in
  the footer): pick a pitch class, every occurrence lights in all views
  while everything else dims — zero hits reads as a confident zero.
  Matches by pitch class (Bb catches A#), respells per governing key,
  shows scale degree + count + channels in the strip.
- **Asserted spelling should beat the auto-pick once a mode lands
  (2026-08-12 spec's follow-on, not yet built):** when a partial like
  `key: Bb?` gets its mode, keyNameFor currently re-picks the spelling
  by smallest signature; Josh's asserted spelling should win unless it
  exceeds six accidentals. Separate review from the shipped three-option
  picker.
- **Bare-key audit (2026-08-12 spec's cleanup rider):** six songs store
  `key: F/D/G/C/Bb/Eb` with no mode — shorthand for major, or the old
  picker's symptom? Now that the picker states what it writes, Josh can
  settle them. Also key-sweep.md regeneration from rollnotes — awaiting
  his go (his analysis doc).
- **Sweep-vs-rollnotes drift check.** A check that flags any song whose
  rollnotes `key:` disagrees with or is missing from the key-sweep
  Tally — the drift is real (see data issues in the analysis queue).

### Composition mode + File menu — v1 SHIPPED 2026-08-15

Josh's design rulings: setup dialog for New; roll entry v1 with
**score-side note entry as the PROMISED immediate next project** (he
accepted roll-first reluctantly); scratch home albums/compositions/
nightroll/ (flat .mid+.rollnotes pairs; promotion to compositions/
proper happens via Claude Code on his word — no in-app move). Shipped:
File sheet (New/Save/Save As/Load/Download .mid), in-page MIDI writer,
Save locked outside nightroll/, Save As forks any song with rollnotes
inherited + origin note, localStorage drafts (picker group, reload
restore), dotted durations, p/mf/f velocity, ⟲ undo, ＋ track chip.
Still open from the original spec: score entry (NEXT), tempo changes
after creation, rests/ties as first-class, multi-level undo, manifest
auto-pickup for synced compositions (currently needs an offline
manifest rebuild — ask Claude Code after first Save).

### Composition mode + File menu — original 08-14 spec (design open)

- **Composition mode (Josh, 2026-08-14):** flip from analysis straight
  into writing — new files, note entry on roll AND score, tempo,
  new tracks/instruments, finger entry accepted. Today: Pencil/Erase
  exist (roll only, selected track, velocity 80, four durations,
  localStorage-only persistence). Gaps: no score entry, no new-song or
  new-track creation, no MIDI export (penciled notes can't leave the
  device), no tempo control, no undo. Design questions for Josh in the
  handoff (score entry model, new-song defaults, where compositions
  live, MIDI export vs native format).
- **File menu New / Save / Save As (Josh, 2026-08-14):** all three
  wanted. RULED by Josh: Save is BLOCKED on chip-derived songs (they're
  regenerable pipeline output with provenance — a stray thumb must not
  corrupt the corpus); Save As from a locked song is WANTED (fork into
  albums/compositions/ to write e.g. a counter-line over Town — block
  overwrites, never branching); the fork inherits the source's
  .rollnotes verbatim, drift is Josh's to own, no app warnings.
  Open: record fork origin (source + commit hash)?; new track vs pencil
  into existing; what New asks up front. Proposed format: .mid +
  .rollnotes pair like everything else (tools/nsf has a pure-JS MIDI
  writer that could run in the page).

### Backlog — from the 2026-08-07 web-session sketch (recorded, not approved)

Josh hasn't read the design sketch these come from; he picks what gets
built. Phrased as open questions. Source docs live outside the repo as
his downloads: `review-handoff-2026-08-07.md` (code/tool review) and
`tool-design-sketch-2026-08-07.md` (the sketch itself).

- **Meter workbench?** Largest gap: every analytic feature works on
  pitch; meter is declared to the app, never interrogated by it. Candidate
  pieces: onset histogram folded into one bar at candidate bar lengths
  (6/8 piles onsets on 1 and 4; 3/4 on 1, 3, 5); harmonic-change points as
  downbeat evidence; duration weight; accent data (now that chip volume
  exists); an audition mode playing a click in each candidate meter.
  **Needs Josh's design input before any code.** Related but distinct:
  the parked meter-judge v2 plan in reference/meter-detection-plan.md.
- **Chord-band verification — SHIPPED v1 2026-08-07** as "Challenge?":
  tap a chord band, then ask. Reports label tones present/missing, extra
  pitches, and the namer's read of the full stack — Josh ruled the
  sketch's disagree-only restriction out ("what does the system think?"),
  so the namer's name is included, but only ever on request. The pedal
  wrinkle is handled by framing, not filtering: extras are reported as
  evidence (a pedal correctly shows as "extra"), never as a wrong-label
  verdict. Possible v2: mark a pitch as a structural layer so it drops
  out of "extra"; duration-weighting so passing tones read differently
  from held tones.
- **Horizontal / voice reading?** Channel identity survives the pipeline
  and is then used mostly for mute/solo. Nothing reads across time:
  isolate one channel's line, flag notes held across a harmonic change
  (pedal points, detectable without naming them), common tones between
  adjacent chords, voice motion/direction. Josh found menu's tonic pedal
  by eye and the E7→G semitone move by mental arithmetic; both are
  computable from data already in the files.
- **Claims as structured objects?** .rollnotes entries are strings. A
  claim could carry its justifying note range, method, date, confidence,
  dependencies. The method says record the path, not just the verdict —
  but paths live in analysis/*.md prose and verdicts in .rollnotes, with
  nothing linking them. Architectural; a format migration (round-trip
  test exists; eleven songs is nothing to convert).
- **Sealed predictions?** Lock a key prediction before derivation —
  timestamped, hidden — unsealed only when an independent derivation is
  recorded, self-scoring into the sweep tally. Non-circularity currently
  rests on Josh's honesty plus tutor vigilance, not any mechanism.
- **Key-dial caveat in the help text?** The dial minimizes visible
  accidentals, which cannot distinguish a key from its relative and
  cannot see modes — B♭ major and G minor look identical to it. It's a
  hypothesis generator, not a verifier, and nothing in the app says so.
  Small doc fix; matters because the method depends on not mistaking it
  for a verdict.
- **index.html split — flag only.** ~4,000 lines; the single-file
  constraint still pays (no build step, git push deploys, vm harness).
  Split *before* a large new view (e.g. the meter workbench) goes in,
  not after.
- **Concept delivery on demand? (speculative — recorded, not designed.)**
  What unblocked Josh in-session was general concepts arriving at the
  wall — tritone symmetry, pedal point, passing-tone tests — none
  song-specific. Possible: offer a concept keyed to the current selection
  (selected dyad six semitones apart → the tritone concept) while
  withholding every per-song conclusion. Genuinely unclear if it's a good
  idea.

- **NSF pipeline** (scoped 2026-08-01, **built 2026-08-02**): extract
  analysis-grade note data from the actual chip — see
  [reference/nsf-pipeline-plan.md](albums/final-fantasy-i/reference/nsf-pipeline-plan.md).
  Emulator + logger + reconstruction + CLI all working, tested against a
  synthetic NSF. **Blocked on Josh supplying the FF1 NSF file** (archive
  or own-cartridge dump — his call). Motivation confirmed by audit: only
  3 of 21 MIDIs (prelude, shop, victory) stay within the NES's
  3-pitched-voice ceiling; the rest are arrangements, so voice-leading
  analysis on them measures the arranger.
- **iOS audio after app-switch — REOPENED then re-fixed, awaiting test:**
  the 08-02 fix (unconditional awaited resume + visibilitychange revival)
  was confirmed BROKEN on the iPad (playhead stuck, only reload
  recovers). A stronger fix shipped 2026-08-03: resumeAudio now PROVES
  the clock advances (samples currentTime twice), rebuilds the context
  when frozen, and surfaces "audio asleep — tap ▶ again" in the UI.
  **Josh: test app-switch-and-return on the new build.**
- **Fixed from the town/menu handoff (2026-08-03):** one-beat ruler
  selections prefill To=From; display spelling is all-sharps until a key
  is declared (every view agrees with the captures; no more phantom Ab);
  time signature is now a first-class editor type (neutral 4/4 grid until
  declared; declaring re-bars with a two-tap warning + automatic anchor
  conversion — Josh's design, 2026-08-03); rollnotes/manifest fetches
  cache-bust the Pages CDN (stale reads after Sync looked like data
  loss).
- **Duplicate-song audit — RESOLVED 2026-08-02 by the chip migration:**
  the NSF is the authoritative track list (19 songs). dungeon (=cave) and
  elfland (absent from the NSF — likely not FF1 at all) were deleted with
  Josh's sign-off; no annotations existed on either.

- **"Save Music" missing (2026-08-02):** the canonical album (All Sounds
  of FF I·II) lists a Save Music track we never captured. NSF tracks
  20–23 probed: 21/23 are sub-second sfx blips, 20/22 long+sparse —
  none obviously it. Candidates could be captured for Josh to identify
  by ear if he wants the complete album.
- **Adding music — the standing workflow (Josh, 2026-08-02):** hand files
  to Claude (new Logic compositions as .mid, new soundtracks as .nsf, e.g.
  Mega Man 2 → its own albums/ dir); Claude runs the pipeline/dump tools,
  commits, and it appears in the dropdown. In-app upload UI deliberately
  skipped for now — optimize for analysis throughput, revisit if the tool
  grows beyond personal use.
- **Promise annotation (Josh's idea, 2026-08-03 — parked for design):** a
  relation annotation: "this beat aims at that beat" — secondary dominant
  at [4.1] promising delivery at 5.1. First annotation type capturing a
  relation rather than a location; syntax could mirror the loop directive
  (`[4.1] promise: 5.1 — E7 aims at Am`). Drawable as ruler arcs (the
  song's tension→resolution network at a glance); active-span subtitle
  while a promise is "open"; queryable for the concept index (promise
  density, deferral length, unpaid promises). Design questions before
  building: broken/redirected promises (deceptive cadences) as
  first-class; target-less "open" promises (heard the promise, haven't
  found the payment); arc clutter (show near cursor or behind ⊙ only).
  Matches Josh's promise/payment vocabulary from the 07-22 theory
  session — his frame, made into a data structure.
- **Counted loops (Josh's idea, 2026-08-03 — parked, not needed now):**
  extend the loop directive with a repeat count — `loop: 1.1 x5` = jump
  back four times, fifth arrival continues onward (repeat barlines + coda,
  in rollnotes form). Player already shows-but-never-plays material past
  the loop anchor, so the outro slot exists. NB re the epilogue that
  inspired it: the detector found NO exact repetition in its 270s — Josh
  hears ~5 passes + outro, so the passes must vary per pass
  (orchestration? articulation?). Stripping it would lose that variation;
  the better epilogue question someday is *what changes between passes*.
  Counted loops shine instead for Josh's own compositions (vamp ×4 then
  bridge) and future albums with true exact internal repeats.
- ~~Concept index~~ CLOSED 2026-08-22: redundant — glossary.md already
  does it (terms, anchors, statuses); Josh pointed this out when the
  web tutor proposed rebuilding it.
- **Concept index + in-app search (from Josh's 08-02 notes):** notes are
  organized per song but his questions are increasingly per concept
  ("where else have I seen a raised 7th"). Plan: (a) tag convention in
  rollnotes (#harmonic-minor, #chromatic-bass) + a script generating
  concepts.md from all rollnotes; (b) a search box in the app that greps
  all rollnotes across the album and jumps to hits. The tag index is the
  prerequisite for meaningful search. Not built yet.
- **NSF meter/tempo fossil problem + build request (Josh, 2026-08-05):**
  the pipeline reads each song's meter and seed tempo from the .mid it
  itself wrote — a closed loop tracing back to the discarded arrangement
  MIDIs, with no provenance and no error detection. Shop proved a fossil
  wrong (4/4 → Josh determined 3/4). BUILD (in progress 2026-08-05):
  (1) preserve chip volume → MIDI velocity + notes.txt column (pulse
  channels only; triangle has no volume control); (2) best-fit meter
  detector from the capture alone — figure-period barline test first
  (shop's method), then onset grouping and pulse accents; confidence +
  "ambiguous" allowed; note-value naming pinned by a 60–180ish tempo
  window and labeled as convention; (3) key detection DROPPED (Josh's
  job); (4) audit all songs, surface mismatches with evidence, never
  auto-overwrite — full report quarantined in reference/ so
  undetermined meters aren't spoiled in passing.
- **Meter judge — detector v2 researched, parked (2026-08-05/06):** full
  plan in [reference/meter-detection-plan.md](albums/final-fantasy-i/reference/meter-detection-plan.md).
  Two independent judges test Josh's by-ear meter guess (guess required —
  tool refuses to run without one): audio judge (render chip wav from our
  emulator → Beat This! downbeat tracker → beats-per-bar) + symbolic
  judge (McLeod met-detection/met-align PCFG/HMM on header-stripped
  .mid). v1 audit proven too weak (would have passed shop's wrong 4/4).
  Acceptance: shop→3/4, menu→6/8, epilogue→refuses. Open: audio-only
  first vs both; does the APU stage emit samples. Motivation: Mega Man
  and other cold NSFs with no transcription reference.
- **Channel-swap re-check (from gurgu's device find):** re-check
  already-swept songs for mid-song channel role swaps Josh may have read
  through — script idea: per song, which channel holds the lowest pitch
  per bar; report changes. Not built yet.
- **Game Over exercise owed:** bass root notes of all 8 bars as one
  sequence; name the pattern (game-over.md).
- **Browser "Load .nsf" in Night Roll** (idea 2026-08-02; **SHIPPED
  2026-08-15** as File → Import…): one byte-sniffing picker (MIDI loads
  directly; NSF opens the capture panel), captures every track through
  the dynamically-imported tools/nsf/ pipeline into LOCAL drafts under
  albums/imports/<album>/, audition → ✕ duds → Commit import pushes the
  keepers (mid + loop rollnotes + album.json + manifest) as a real
  album. Josh's ruling: nothing commits until auditioned. URL fetching
  was cut by Josh same day (downloading to the iPad turned out easy —
  Files app, then the picker browses it). Standing caveats remain true:
  cold NSFs start grid-fitted 4/4 until bars are counted by ear; tracks
  are numbers until listened to; expansion chips (VRC6/FDS) don't
  capture. First cold-NSF field test planned: Mega Man 2 on the iPad.

- **In-app Claude chat — built but parked on the `claude-chat` branch,
  decision pending** (2026-08-01): a complete chat feature (💬 button,
  per-song conversations, streaming, context injection of
  cursor/rollnotes/lasso, tutor system prompt that won't spoil
  undiscovered keys/chords) is committed on branch `claude-chat` (pushed).
  Blocker: it needs a pay-per-use Anthropic Console API key — Josh's $200
  Max subscription can't fund direct API calls, which frustrated him.
  Options discussed: downgrade Max $200→$100 and fund the API from the
  difference; use the Claude iPad app pointed at this repo (chosen for
  now — albums/final-fantasy-i/songs/*.notes.txt dumps exist so the app can read actual notes);
  or drop the feature. Revisit with Josh; merge the branch if he funds a
  key (it will need a rebase over main's later changes).

- **Two-regime score zoom** (parked 2026-08-01, low priority): pinch
  compresses time down to the engraving floor (current behavior), then
  keeps going by uniformly scaling the whole rendered page — staves,
  glyphs, everything — like stepping back from paper. Discussed and
  deemed workable: uniform scale preserves the shared linear x-axis, and
  the floor-resolution measure cache downscales crisply for free. Cost:
  plumbing a shrink factor through drawing, hit-testing, lasso bands,
  playhead mapping (~an evening). Josh's verdict: not needed now — the
  roll's unlimited zoom-out covers the overview job better anyway (lines
  stay readable where tiny notes wouldn't).

- **Synced-note edits don't survive reload before Sync** (found in 2026-07-31
  code review): editing/deleting a *synced* note then reloading the page
  resurrects the original (edits show as duplicates, deletes revert) because
  localStorage only persists added notes, not tombstones. Sync promptly and
  it's fine. Fix sketch: persist removed-synced tombstones alongside added
  notes and re-apply them in loadNotes.
- **Score cache memory at extreme zoom** (same review): per-measure canvases
  at max pinch zoom are ~9 MB each and the cache caps at 60 *entries*, not
  bytes — iOS Safari may silently blank measures at very high zoom. Fix
  sketch: cap the cache by estimated bytes instead of count.
- **Score view** — DONE, committed 2026-07-31 (see score-view-plan.md for
  known limitations).
- **Score spelling refinement** — Ab in the Baseball song spells as G#
  (static chromatic heuristic); context-aware spelling someday.
- **NES-faithful arrangements** — MOSTLY DONE 2026-08-01: padding tracks
  stripped (tools/strip_tracks.py) from shop (9→3! it was 3 parts × 3
  instrument copies), cave (6→4), airship, town, dungeon, prologue,
  chaostemple, gurgu. Chord tracks kept per Josh (useful when stuck).
  Left alone: elfland (8 tracks) and epilogue (11) — genuinely split
  orchestrations, too tangled to strip safely; battle's brass and
  floatingcastle's twin interlocking arps are real split NES parts, kept.
  If elfland/epilogue bother Josh, hunt leaner transcriptions instead.
  Palette extended to 12 colors so 11-track epilogue no longer repeats.
- **Gurgu Volcano loop "slightly off" to Josh's ear** (2026-08-01): trim
  verified mathematically clean — both passes tick-identical, exactly 42
  bars, no notes crossing the seam. So the seam feel is in the
  transcription itself. Revisit musically if it keeps bothering him.
- **Track visibility variants** — mute now fully hides a track (Josh's
  request); later maybe: dim-but-visible, and audio-mute-only toggles.
- **Lasso later ideas** — cross-staff chord naming conventions, remembering
  reveals per song, maybe a "quiz me" mode built on lasso selections.
- **Mid-song key signature changes** — DONE 2026-07-31: `key:` directives in
  .rollnotes, set from the key dial at the cursor bar; signature drawn at
  change barlines.
- **iPad app** (discussed 2026-07-31, parked — "worth exploring"):
  - Tier 1, ~an hour: web manifest + icon + standalone mode → Add to Home
    Screen gives an app icon, full-screen launch, durable storage; updates
    still flow via git push. Do this first whenever wanted.
  - Tier 2, days + $99/yr: Capacitor/WKWebView wrapper for the App Store.
    Only real feature gain: native MIDI hardware input (play a keyboard
    into the app — iPad Safari has no Web MIDI).
  - Native Swift rewrite: roll/audio/annotations portable in days, but no
    VexFlow equivalent exists — hand-rolling engraving is the months-shaped
    part — and build/sign/install kills the push-and-reload iteration loop
    that built this in six hours. Not worth it.
- **Mid-song time-signature changes** (parked 2026-07-31): a fourth
  annotation type ("Time change") in the type-first editor, like key
  changes. Real work hides underneath: the whole app assumes one meter —
  bar math (ruler numbers, measure boundaries, beat dropdowns, score
  measures, loop end) would need to become region-aware. The MIDI parser
  already sees the 0x58 events; it just keeps only the last one.
- **Enharmonic respelling** (idea, Josh undecided): tap a score note to flip
  G#↔Ab — notehead moves line↔space, choice stored in rollnotes. Maybe
  moot if direction-aware spelling (raise ascending, flatten descending)
  is built first; the static heuristic currently misspells Baseball's Ab
  as G#.
- **Loop passes:** MOSTLY DONE 2026-08-01 — 13 MIDIs with exact repeats
  trimmed to their first pass (tools/trim_loops.py), so anchors now cover
  those songs fully. Battle since rebuilt at 29 bars (3-bar intro +
  26-bar loop). Cornelia had a half-bar of leading silence (whole song
  shifted 2 beats): unshifted + trimmed to its 8-bar loop (2026-08-01) —
  Josh's existing cornelia rollnotes anchors may now sit 2 beats late;
  offer to auto-shift them if they look off.
  Dungeon trimmed to 16 by Josh's ear (2026-08-01). The old "awaiting
  cut bars" list (elfland, epilogue, floatingcastle, prelude, ship,
  victory) is STALE: elfland was deleted 2026-08-02 (not in the NSF),
  and the chip migration auto-trimmed everything with an exact repeat —
  epilogue is the real holdout (no exact repeat; varies per pass).
  Superseded anyway by the in-app `chop:` annotation (built 2026-08-06):
  Josh trims any song himself from the editor, non-destructively.
- **Victory chip loop seam — RESOLVED 2026-08-02:** the "beat 3" reading
  was a trimmer artifact (it sliced mid-way through the loop-seam overlap
  cluster). Fixed detector puts the seam at bar 2 beat 4 — Josh's by-ear
  4& was right within a quarter-beat. Directive now loop: 2.4.
- (Done recently, for orientation: Night Roll player, .rollnotes + sync,
  sections/arrangement lanes, range-select ruler drag, grouped dropdown
  with compositions/, CVD-safe track palette, rewind + Edit toggle.)
