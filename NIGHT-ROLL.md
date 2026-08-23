# Night Roll — Technical Reference

The complete map of the player (`index.html`) for anyone (especially future
Claude sessions) continuing work. User-facing feature list also lives in the
in-app help sheet (? button). History: git log tells the build story.

Live: https://joshcough.github.io/night-roll/ (GitHub Pages, main
branch, root). Single file app + `vendor/vexflow.js`. No build step —
git push is deployment (~1 min propagation; iPad may need a hard reload).

Tests: `make test` (runs `node --test tests/*.test.mjs` — zero deps, Node's
built-in runner). `make serve` hosts the app at localhost:8000 (fetch needs
http, so file:// won't work). `tests/harness.mjs` extracts the inline `<script>` from index.html
and runs it in a vm with a stub DOM, so the app stays one file. Covers the
pure logic: MIDI parse, rollnotes parse/serialize round-trip, key math,
chord namer, duration decomposition, tempo maps, edit persistence. Run them
before committing player changes; add cases when touching that logic.
Shipping a feature means THREE writes: the code, its help-sheet entry,
and a keyword in the help drift-guard test ("help sheet covers every
shipped feature") — the guard fails the suite when help silently lags
the app, which happened to the key dial (2026-08-15 audit).
(2026-07-31 review verdict, second-opinioned: keep single-file until ~4–5k
lines — splitting adds Pages cache-skew risk for no payoff at this size.)

## Feature inventory

**Views:** piano roll (canvas) and engraved score (VexFlow → per-measure
cached canvases), toggled in the header, persisted. On song load the roll
auto-fits the whole song and its pitch range to the screen (fitView). Both share one
time-linear x-axis, the bar ruler, sections, markers, cursor, playhead,
subtitles, and gestures. Pinch zooms per axis (horizontal = time; vertical
= pitch rows, roll only). Roll zoom-out clamps to the song's own extents
(2026-08-07, Josh's spec): per-axis floors (pxqFloor/rowHFloor) flush to
the chop-trimmed bars and sounding pitch range, no padding — once time
fits, pinch-out only reveals pitch; once everything fits, it stops, and
the view snaps flush. fitView lands on the same floors, so the load view
IS the zoom-out limit. Score extras: intro column (clef/key/time) left
of bar 1; signatures redraw at key changes with cancellation naturals;
rests break beams; playhead/cursor interpolate notehead-to-notehead
(scoreTickToX), hopping glyphs only at key changes; zoom-out floor
computed from the densest measure (scoreModel.pxqMin — relaxes when dense
tracks are muted).

**Playback:** WebAudio. Pulse/pulse/triangle voices by track index; drum
tracks (name match or channel 10) get a synthesized kit. Per-track gain
nodes make mute/solo instant mid-playback. Songs loop at the final bar
(`songEndTick`) or per a "loop:" directive. Rewind ⏮. Speed slider
(25–200%, applies on release, snap-back button when off 100%) scales
tickToSec/secToTick via playRate; persists across songs. Persistent
AudioContext warmed on first touch, declick ramps, notes straddling the
cursor play their remainder (chase). Manual scroll during playback
suspends auto-follow until the playhead re-enters the view.

**Tracks:** chips mute (= fully hide, roll and score) and solo. Score model
rebuilds on toggle. Second tap on the selected chip opens the voice &
color menu, now grouped by family (Josh 2026-08-15: flat list got too
long): NES / waves, then SAMPLED instruments (his call after the synth
patches sounded "just okay") — 36 FluidR3_GM instruments across Keys &
mallets, Guitar & bass, Strings, Winds, Brass, Organ & choir, as
per-note MP3s in vendor/soundfonts/*.json (MIT, see LICENSE.md there;
~2MB per instrument, ~85MB total in the repo — web sessions should
clone with `--filter=blob:limit=1m` to skip them). The menu opens in
the current voice's family; ‹ backs out to the family list. Lazy at every level: nothing
fetches at page load; a track using voice=sf-* fetches its instrument
once (browser-cached) and decodes ONLY the pitches the song actually
plays (a full 88-key decode would cost ~60MB RAM per instrument on the
iPad). finalizeNotes warms the pitch set; an undecoded note falls back
to a quiet triangle for that pass and is sampled by the next loop. The
2026-08-15 synth patches (voice=piano/pluck/strings/organ/bell) still
play for annotations that saved them but left the menu. Color via one
full-width `<input type=color>` picker
(swatch shortcuts removed same day per Josh — any hex, stored in the
track: directive as color=#rrggbb; TRACK_COLORS remains the default
palette for unannotated tracks). The chips hug their content: ▾ sits beside the last
chip, and the transport/LCD cluster stays pinned to the top row when
chips wrap (2026-08-15 iPad fixes). `darkreader-lock` meta keeps the
Dark Reader extension from repainting swatches gray.

**Local MIDI imports** (2026-08-15, Josh lost one to a song switch):
a picked MIDI becomes a device-local draft under `local/<name>.mid` —
reopens from Open → drafts ("local /" prefix), stays editable
(saveDraft allows local/ alongside compositions; note `ch` is preserved
so drums survive), never syncs (dirtySongs excludes local/), never
commits; Save As forks it into a real composition. The file input has
NO accept filter: iOS grays out extensions it doesn't recognize (.nsf
was unpickable) — the byte-sniff is the real gatekeeper.

**Metronome** (2026-08-14, ⏱ in the header): standalone, feature-rich —
meter 1–12 over 2/4/8/16 (bpm counts the DENOMINATOR beat, matching the
app's counting; compound meters default accents on each group of 3),
per-beat accent cells (tap: accent → normal → silent), subdivisions in
2/3/4, tempo slider + tap tempo, lookahead-scheduled NES square blips.
Plays through its own gain node straight to the destination, so the
song transport's master fade can't silence it — it clicks OVER a
playing song, which doubles as a crude meter audition. Settings persist
(ff1roll-met).

**Inspection:** tap note → pitch (spelled per active key), bar, beat in
1e&a counting, duration, velocity, track. Lasso mode (footer toggle):
drag-select across notes in any view (roll, score, fall); pitch list
shown; chord name behind a "Chord?" reveal (templates: triads, 6, 7s,
9s, sus, dim7, power-dyad "5"; slash inversions; missing-5th tolerance).
Lasso selection is EDITABLE (2026-08-07, for targets a rectangle can't
separate — undersea/underwater's interleaved pedal): each new box UNIONS
into the selection, tapping a note toggles it in/out (all three views
hit-test their own geometry: hitNote / scoreLassoTap / fallHitNote),
tapping empty space clears. Touch-first by design — no modifier keys on
iPad. Chord challenge (2026-08-07): tap a chord band in the ruler and
the same footer button reads "Challenge?" — opens a dialog built from
chordEvidence(): each label tone with its role (root/3rd/5th/7th...)
and whether it sounds (gold) or is missing (red), extras under an
"evidence, not verdict" heading (blue — pedals and passing tones land
there by design), per-channel note lists, and the namer's read of the
full stack, with a Copy button. Request-only, labeled bands only.

**Pitch-class finder** (2026-08-07, "find:" dropdown in the footer —
the sweep's most repeated operation, mode-hunting single degrees): pick
a pitch class and every occurrence highlights across all audible
channels while everything else dims to 15% — so zero hits reads as a
confident zero, which mode rulings depend on. Works in roll (accent
stroke), score (accent notehead boxes), and fall. Matches by pitch
CLASS (find Bb catches the capture's A#); options respell per the
governing key and carry the scale degree when one is set; the info
strip reports count + channels. Selector options rebuild on focus so
spellings track the current key.

**Instrument panel** (2026-08-07, 🎹 in the footer): a piano-keyboard /
guitar-fretboard strip above the footer, so Josh can think with the
instrument instead of purely symbolically. Lasso'd pitches light gold on
both instruments; sounding notes light live during playback in their
track's color (same palette as the roll/fall notes); every key
and fret is tappable (plays through master, so track mutes never silence
it — square voice on piano, triangle on guitar). Labels are the pitch
name spelled per the governing key plus the scale degree when a `key:`
directive governs the cursor (degrees never shown for undeclared keys —
key discovery stays the analyst's job). Piano range = the song's own
extent, octave-aligned. Guitar: standard tuning EADGBE, high-e on top
(tab convention), 24 frets, inlay dots, a lit pitch appears at every
playable position; a pitch off the neck octave-folds in (gtrFold),
drawn with a dashed ring + tiny ▴/▾ toward its true octave — seeing it
in the wrong octave beats not seeing it (Josh, 2026-08-07). Open state, tab, and Fall persist in localStorage.

**Fall view** (2026-08-07, ▼ Fall in the panel's tab bar — which sits
BELOW the keys so nothing blocks the landing): Synthesia-style — the
main canvas becomes a vertical drop and notes fall down into the panel's
piano keys, landing on the accent "now" edge the moment they sound (the
keys light via the same live-pitch set). Time maps through seconds
(tickToSec), so tempo maps and the speed slider stay truthful; ~4.5 s of
music fills the drop (FALL_WINDOW). Bar lines ride with numbers, chord
changes ride gold lines with their symbol, black-key lanes are banded,
lasso'd notes keep their gold stroke. Piano-only: enabling Fall forces
the piano tab open; picking Guitar (or closing the panel) returns to
whichever of roll/score was active. Pan/pinch/cursor gestures are
disabled while falling — the view rides the playhead, or sits at the
cursor when stopped — but lasso mode works (finalizeLasso has a fall
branch hit-testing key columns × seconds), so boxed notes light the
keys below.

**Annotations:** see format below. + Note editor is type-first (Text note /
Section / Chord / Key change / Time signature / Loop point) with bar/beat
dropdowns and a 🎤 Speak dictation button (Web Speech API; hidden where
unsupported). Chord type gets a chip widget (root · ♭♮♯ · quality · /bass)
composing into an editable symbol box, plus an optional attached-note text
(✱ on the band). A ruler drag before + Note defaults the type to whichever
of section/chord was saved from a drag last (chord-entry runs stay in chord
mode). ☰ Notes lists everything grouped by type (Key / Meter / Sections /
Chords / Loop / Chop / Text notes; each group's + pre-picks that type),
rows open the editor, Delete works on synced notes too (permanent on Sync).
Chop (2026-08-06, Josh's import-fixup tool): a `chop:` directive
non-destructively trims the displayed song from either end — see the
format spec; implementation is a raw-notes snapshot (`song.rawNotes`)
that applyChop() carves the visible tracks from, so roll, score,
playback, and loop-at-end all follow for free.
Gold ruler flags; subtitle strip follows playback, with a ⊙ toggle that
highlights the active note's span (ambient range tints removed — on a
fully-annotated song they covered everything). The strip is a
constant-height slot (2026-08-07): present for the whole song whenever
the song has text notes, blank between them, long notes scroll inside —
per-note toggling reflowed the layout and made the instrument panel
bounce.

**Meter:** neutral 4/4 grid until a `timesig:` directive declares the
real meter (set via the editor's Time signature type — numerator/
denominator pickers, never free text). Same philosophy as keys: the
rhythmic grouping is the analyst's finding, so the app won't pre-commit
it. Changing meter over existing annotations demands a second Save tap
and converts every anchor (incl. loop directives) to preserve musical
position. cave (2/4) and menu (6/8) carry grandfathered declarations.
**The counted beat is the denominator note** (2026-08-06): X/4 counts
quarters, X/8 counts eighths, X/2 counts halves — so 6/8 bars run
beats 1–6, the way compound meter is actually counted. The roll grid
draws one line per beat, with a medium line every 3 beats in compound
meters (6/8, 9/8, 12/8) marking the big pulses. Anchors, beat
dropdowns, loop targets, and the info strip all use this unit; meter
changes convert anchors across unit changes through absolute time.

**Keys:** display defaults to C until a `key:` annotation exists — key
discovery is Josh's job, by design. Picker reworked 2026-08-07 (Josh's
handoff design, after the old signature-paired list wrote a silent wrong
`key: D`): FIRST dropdown = tonic pitch class only (enharmonic pairs
labeled "G♯/A♭"; keyNameFor picks the spelling landing on a real
signature — G♯m over A♭m, D♭ over C♯), SECOND = mode (major/minor +
church modes). Tonic-without-mode is a first-class PARTIAL: "mode?"
stores `key: G#/Ab?` — round-trips, shows in the ☰ KEY group and the
dropdown label ("tonic stored, NOT applied") — but creates no keyRegion:
no signature, no respelling, nothing downstream until the mode lands.
"Set Gm @ bar N" writes full directives at the cursor's bar.
**◯5 Circle of fifths** (footer button): live canvas chart — majors /
relative minors / vii° rings, signature counts, the movable degree
window (IV·I·V / ii·vi·iii / vii°), gold rim on the song's governing
key. Two independent motions (Josh, 2026-08-07): the WHEEL spins —
drag it anywhere (fractional while dragging, snaps to wedges on
release) or step it with ⟲ ⟳ — putting any key at 12 o'clock; the
degree WINDOW moves separately by tapping a wedge. Opens with the
song's key on top and windowed. Detail block gives the window key's
accidentals, scale, all seven triads, and IV/V neighbors.
Ranged keys revert automatically. The dropdown label reports the recorded
names: "key: not set (C)" vs "key: Gm ✓". Minor names map to the relative
major's signature for engraving (keyNameToSf). MIDI files carry true key signatures (via
tools/fix_keysigs.py) but the app deliberately ignores them for display.

**Compositions** (2026-08-15, File in the header — Josh's rulings from
the 08-14 handoff): New builds a blank 3-voice NES song (name/tempo/
meter dialog; the chosen meter is written as HIS timesig directive) at
`albums/compositions/nightroll/<slug>.mid` — his scratch space; promotion
to compositions/ proper happens via Claude Code on request. A
composition is the standard .mid + .rollnotes pair: writeMidi() (in-page
format-1 SMF writer, round-trip tested against parseMidi) produces the
.mid; File→Save PUTs both via the GitHub API. **Chip captures are
locked** — Save refuses anything outside nightroll/ (regenerable
pipeline output; a stray thumb must not corrupt the corpus) — but
File→Save As forks ANY song into nightroll/ with rollnotes inherited
verbatim plus a "forked from <path>" note (drift is Josh's to own, no
app warnings — ruled). Cross-device freshness (2026-08-16): every repo write stamps the
rollnotes with 'saved' (epoch ms); drafts remember the stamp they're
based on plus a dirty flag. Load compares — newer repo + clean draft
switches to the repo silently; newer repo + dirty draft asks (keep
draft / take newer save); otherwise the draft wins as before. Offline
or unstamped repo = draft wins. Unsaved work auto-drafts to localStorage
(ff1roll-draft-<path>, full song JSON) on every edit; drafts win over
repo fetches on load and are listed under "Night Roll drafts" in the
picker. Pencil upgrades: dotted durations (8·, 4·, whole), p/mf/f
velocity segment, ⟲ single-stack undo; compositions get a ＋ track chip
(empty NES voice). The app maintains albums/manifest.json itself
(2026-08-15): Save inserts the song's catalog entry via the API and
refreshes the dropdown; File→Move to… relocates a composition between
Night Roll Sketches and My Compositions — PUT at the new path, DELETE
the old, manifest updated, every per-song localStorage key renamed
(tokenless fallback: draft-only local move). nightroll/ is its own
album via a nested album.json; build_manifest.mjs now scans one level
of subdirectories for album.json, so offline rebuilds agree with what
the app writes. The editable/locked line is albums/compositions/ as a
whole (the 08-14 lock is on NSF pipeline output, and moved sketches
must stay saveable). **Score-side entry SHIPPED same day** (the promised
follow-up): Pencil/Erase work in score view — the tapped stave picks the
track, the vertical position picks the diatonic step (calibrated at
runtime from VexFlow's own getYForLine, no magic constants; ledger lines
±4), the key signature supplies accidentals with a key/♮/♯/♭ override
segment, and x snaps to the pencil-duration grid through scoreXToTick
(coarse mid-measure on near-empty bars — its linear-within-measure
interpolation has few anchors there). Empty tracks keep staves on
compositions (clef guessed from the voice name) so a blank song is
enterable; erase hit-tests the engraved notehead boxes.

**Data locations** (2026-08-17, Josh's architecture, advisor-reviewed):
the app is CONFIGURED with where its data lives — `ff1roll-cfg` in
localStorage, edited via Sync → "Data locations ▾". Three rows: songs
(.mid/album.json/manifest), analysis (.rollnotes + docs), NSF. Each has
a read BASE URL ("" = this origin/relative — the default, i.e. today's
fused behavior; or any raw.githubusercontent.com/owner/repo/branch or
local server) and an owner/repo write target for the Contents API.
Helpers: `cfg()/songsURL()/analysisURL()/nsfURL()/repoApi(which)`;
every write failure names its repo, and 404 is reported as
"token can't see <repo>" (fine-grained tokens make unlisted repos look
nonexistent). The Sync sheet opens without a loaded song so a broken
config can always be fixed; loadNotes warns instead of rendering
silently empty when this device previously synced annotations for a
path the analysis location now lacks. NSFs read raw-first from the
PUBLIC joshcough/nsf-archive (Josh's considered call, 2026-08-17 —
reversing the earlier never-publish stance; chip audio is tokenless
everywhere), API+token fallback for private forks. The PHYSICAL split
into ost-songs/ost-analysis is designed and deferred until a second
analyst exists — see the plan in open-items; the mirror-tree layout
(rollnotes at identical relative paths) makes it a pure git move.

**Sync:** serializes the full current rollnotes state and commits it to
this repo via the GitHub Contents API (fine-grained token, stored in
browser localStorage, never in the repo). "Commit all changed" syncs every
song with unsynced local notes (one PUT per file; per-song ✓/✗ status;
meter for foreign songs comes from a localStorage stash written on load).
The Sync button shows the dirty-song count. Copy/Download fallbacks. Local
unsynced additions persist in localStorage keyed by song path.

**Import** (2026-08-15, File → Import…, replaces Load MIDI): one file
picker, byte-sniffed — MIDI in any wrapper (.mid/.midi/.smf/.kar,
RIFF-wrapped .rmi; MThd found anywhere) loads directly as a local file;
an NSF (NESM magic) opens the capture panel instead. NSF capture runs
the browser through the SAME pipeline that dumped the FF1 album —
tools/nsf/{nsf,notes,midi-write}.mjs dynamically imported off Pages, so
there is exactly one 6502/APU/loop-detect/tempo-fit code path — per
track: run N seconds (panel field, default 75; the detector needs
intro + 2 full passes in frame, so on "no loop" the window auto-doubles
up to 300s before conceding — 2026-08-16, after MM2's ~35s stage loops
made half the tracks read "no loop" at 75), reconstruct, loop-detect +
trim to intro + one pass, grid-fit
bpm (4/4 seed 120 — meter/tempo stay re-derivable by annotation like
any capture), makeMidi → parseMidi → stored as a LOCAL draft under
`albums/imports/<album-slug>/track-NN.mid`, with a hardware `loop:`
directive stashed as a local note when the loop returns past 1.1.
Nothing touches the repo at capture time (Josh's ruling: audition
first). Flow: Capture all (~10 s for a 23-track NSF) → open each from
the panel or Open → drafts, where every import album is its own folder
(2026-08-16: tap in for the track list; ⇪ per track commits that song
alone to its album, "⇪ Commit album" pushes the whole folder; ✕ on the
folder row two-taps the entire album's drafts away; the folder
disappears as its last draft commits or dies). Re-capture and re-import
OVERWRITE existing drafts for the same album/track (with their stale
loop notes) — the name-collision guard only fires between two rows of
the same import session → recognize a
tune and type its real name in the panel row (the draft renames in
place; the typed title — punctuation intact — becomes the dropdown
title at commit, via an album.json `songs` override when the filename
can't spell it) → ✕ the duds →
Commit import (File menu item with live count, or the panel button)
pushes every surviving import draft in one pass: .mid (writeMidi of the
draft), loop rollnotes (stamped), album.json (self-created so
build_manifest.mjs stays honest), manifest entries — then retires the
local drafts; the album appears in Open like any other. Uncommitted
captures are excluded from the Sync badge (their notes ride Commit, not
Sync — a sidecar without its .mid would be an orphan). Expansion-chip
NSFs (VRC6/FDS/…) capture 2A03 channels only; silent SFX slots report
"silent" and store nothing.

**Chip audio** (2026-08-17, `chip` button in the transport during an
import session): the captured APU register log rendered through a
pure-JS 2A03 DSP (tools/nsf/apu-render.mjs — duty sequencers, hardware
envelope units, length/sweep/linear counters, noise LFSR, Nesdev
output curves, console RC filters). This is the console's own voice:
a 33ms arpeggio run is one pulse wave changing period, not N oscillator
attacks — built after oscillator-per-note rendering could not do MM2's
fast sections justice. Renders ~400x realtime, per-channel buffers so
mute/solo gains still work; loop points honored via buffer looping;
speed slider acts tape-style (pitch follows). Re-capturing invalidates
the render. All async yields (emulation, loop scan, render) use
MessageChannel, not setTimeout — background tabs throttle setTimeout
to ~1/sec.

Chip audio is the DEFAULT wherever a source resolves (Josh: "a million
times better... always use this if possible"; the chip button is the
opt-out, preference in ff1roll-chip). Source chain, honoring the
*.nsf gitignore (ROM music never enters the public repo): live import
session → this device's IndexedDB cache → **joshcough/nsf-archive**,
Josh's PRIVATE repo, fetched via the GitHub API with the same token
Sync uses, then cached. album.json carries only metadata: `nsf:
{vault: "<file>.nsf", tracks: {<base>: {n, secs}}}` — Commit import
writes it and uploads the album's NSF to the archive; FF1's album.json
maps all 19 tracks to ff1.nsf, so the whole analysis album plays with
the console's own voice on any device with the token.

**Robustness:** MIDI parser finds tracks by MTrk magic scan (the original
ff1battle had corrupt length headers — since rebuilt clean, guard kept),
honors end-of-track, clamps note durations to 8
bars, truncates a track at any internal silence > 32 bars (real tacets max
24 in this catalog). ff1ship.mid was truncated at the source
(thefinalfantasy.net serves a 512-byte file); replaced 2026-07-31 with
vgmusic.com's ff1ship2.mid — same transcription, 5 tracks incl. drums.

## .rollnotes format (the spec)

Sidecar file next to each .mid: `<song>.rollnotes.json`. **JSON since
2026-08-15** (version 1; renamed from bare `.rollnotes` same day — the
extension says what the content is) — the file is a direct serialization of the
app's in-memory note objects, one note per line so git diffs stay
line-per-change:

```json
{ "version": 1, "song": "menu", "notes": [
  {"at":[1,1],"type":"timesig","timesig":"6/8"},
  {"at":[1,1],"type":"key","key":"Bb"},
  {"at":[2,1],"type":"key","key":"A#/Bb?"},
  {"at":[1,1],"to":[4,6],"type":"section","label":"A — home"},
  {"at":[5,3],"to":[5,4],"type":"chord","chord":"G7/B","note":"no 5th"},
  {"at":[3,1],"type":"tempo","bpm":90},
  {"at":[1,1],"type":"track","track":"pulse1","voice":"sine","color":"#0aa2c0"},
  {"at":[2,1],"type":"chop","chop":"start"},
  {"at":[25,1],"type":"loop","loop":"2.1"},
  {"at":[6,2.5],"text":"Plain prose observation."}
] }
```

Source fields only: `at`/`to` are [bar, beat] (beats may be fractional;
`to` beat omitted = end of bar), `type` + its value field(s), free
`text` (or `note` attached to a chord). Derived data (ticks, band
depths, region ends, key sf) is computed at load, never stored. The
semantics of every type are exactly the legacy directives below — both
formats reduce to the same raw shape and run through the same
derivation code, and the format-identity test (text → object → JSON →
object, deepEqual) enforces that they can never disagree. The legacy
TEXT format below parses forever (loading sniffs the first character);
any Sync rewrites a song as JSON.

### Legacy text grammar (still parsed, no longer written)

```
[3.1]              ← anchor: bar 3, beat 1 (beats may be fractional: 2.5)
Free text until the next [anchor]. This is a regular note.

[7.1 - 8.4]        ← range: bars 7–8 inclusive (end beat inclusive)
Range note. Tints its span; active for the subtitle across it.

[1.1 - 4.4]
section: A — G home   ← "section:" prefix = arrangement band in the ruler.
                        Nesting inferred by range containment; same label
                        = same color.

[5.1 - 5.2]
chord: Gm          ← "chord:" prefix = chord band. Renders and nests exactly
                     like a section band (containment = depth; same label =
                     same color) but is a distinct type: grouped separately
                     in the ☰ Notes list, entered via the chord widget.
                     Symbol standard = the lasso chord namer's vocabulary:
                     bare root = major (C), m = minor (Gm), then 7/maj7/m7/
                     m7b5/dim/dim7/aug/6/m6/sus4/sus2/5/9/m9/maj9/add9/7b9,
                     slash bass as /E, "(no 5th)" allowed as qualifier.

[5.3 - 5.4]
chord: G7/B        ← lines after the symbol = attached note (shows as ✱ on
no 5th — bass has it   the band, previewed in the ☰ list, kept on round-trip).

[9.1]
key: Bb            ← "key:" prefix = key directive. Open-ended: applies
                     until the next open key directive.

[2.1 - 4.4]
key: Db            ← ranged key: applies bars 2–4, then the surrounding
                     key resumes (score draws cancellation naturals).

[1.1]
timesig: 6/8       ← meter directive. Until one exists the app runs on a
                     neutral 4/4 ruler — the MIDI's meter meta drives
                     nothing visible (meter is analysis, like keys).
                     Declaring one re-bars the song; the editor converts
                     existing anchors through absolute time (two-tap
                     warning) so annotations keep their musical positions.
                     One per song. Beats in anchors count the DENOMINATOR
                     note: under 6/8, [1.4] = the fourth eighth, and the
                     first half-bar chord is [1.1 - 1.3].

[3.1]
tempo: 90          ← tempo directive, TWO meanings by song kind (Josh's
                     ruling, 2026-08-15): on an app-created song it
                     AUTHORS — the tempo map rebuilds from the song's
                     base plus every directive, and playback/LCD/Save
                     follow. On an analyzed song it is an OBSERVATION —
                     records that the music changes tempo here and
                     leaves playback untouched (capture timing is
                     measured fact).

[1.1]
track: pulse1 voice=sine color=#0aa2c0
                   ← track directive (2026-08-15): per-track VOICE (auto NES /
                     pulse 50·25·12.5% / triangle / sine / saw) and COLOR
                     override, set from the chip's voice-&-color menu (tap
                     the selected chip again). A synced annotation like any
                     other — song truth, not device preference. Playback
                     only; the .mid is never touched. Tracks matched by
                     name (or trN index). Removing it reverts to defaults.

[3.1]
chop: start        ← non-destructive trim, RAW capture coordinates (the one
                     annotation type that is): hides everything before raw
                     3.1 and renumbers — raw 3.1 becomes displayed 1.1.
                     At most one per song; "chop: end" likewise hides
                     everything at/after its anchor. All OTHER annotations
                     live in displayed coordinates; adding/removing a start
                     chop shifts them through absolute time (two-tap
                     warning), so chords stay glued to their music. The
                     hidden material is gone entirely (no ghost); the .mid
                     is untouched — delete the directive to restore.
                     Editor prefills the cut from the cursor; ☰ list shows
                     chop anchors with a "raw" tag.

[25.1]
loop: 2.1          ← "loop:" prefix = loop directive. The anchor is the
                     jump point: when playback reaches bar 25 beat 1 it
                     returns to the target (here bar 2, skipping ship's
                     pickup-intro bar). An anchor at/before the target
                     means the jump fires at song end. One per song.
```

- `#` lines are comments — **dropped on round-trip** (the app rewrites the
  whole file on Sync). Never store important info in comments.
- Key names: C G D A E B F# C# F Bb Eb Ab Db Gb Cb, plus minor as "Em",
  "Bbm" (minor maps to its relative major's signature).
- Every FF song is a chip capture (2026-08-02, extracted from the NSF via
  tools/nsf/), trimmed to intro + one loop pass at the frame-exact repeat
  point — see albums/final-fantasy-i/CUTS.md for the verified cut/loop table. Songs whose
  loop returns past a once-only intro carry a measured `loop:` directive
  in their rollnotes (battle, gameover, overworld, ship, victory).

## Code map (index.html, section comments mark these)

catalog → CATALOG built from albums/manifest.json at boot (run
tools/build_manifest.mjs after adding music; album.json per album holds
title/order/name overrides) + two-level song picker (groups sheet → songs;
opens into the current song's group) ·
midi parse → parseMidi + tempo maps · rollnotes → parse/serialize/regions/
sfAt/subtitle · lasso/chord id · load song → setSong (computes songEndTick;
loadGen guards stale async loads) · track chips · drawing → draw/drawRuler (roll) ·
score → buildScoreModel (quantize 16ths, chord-group, clip overlaps,
measure split with ties, rest fill) / renderMeasure (LRU 60 cache,
geometry + timeMap per measure) / drawScore · gestures → pointer/pinch/
lasso/cursor drag; iOS page-zoom suppressed · audio → NES voices, drumHit,
per-track gains, loop scheduler · note editor (type-first) · notes list ·
sync (GitHub Contents API, 409 retry) · key dial · help sheet.

## Project conventions that govern this code

- Keys/analyses are Josh's discoveries: never pre-fill answers into the UI
  or seed analysis for unanalyzed songs (see memory + open-items.md).
- Commits auto-allowed in this repo only (.claude/settings.local.json hook,
  gitignored; script at .claude/hooks/allow-git-commit-push.py).
- Docs: open-items.md (questions/tasks), quizzes.md (protocol + bank),
  score-view-plan.md (score history/limitations), supplemental-learning.md
  (session log = quiz source material).

## Tracks/Arrange view (advisor-designed, 2026-08-22)

Third viewMode ("tracks"; viewbtn cycles Roll -> Tracks -> Score, label
shows the NEXT view; View ▾ has direct rows). RULER_W is now a LET —
148 in tracks (the header column), 46 elsewhere — set ONLY in
applyViewMode; every gutter/time consumer keys off it. Time axis is
the roll's shared map, so ruler/sections/cycle/bar-magnet/playhead/
follow-camera come free. laneGeom(ti) = fit-to-count lanes (44-88px),
thumbnails normalized per lane (min one-octave span; drums use
kitSlots rows). Editing: selection is the arrange currency — lasso =
time-span × lane-span across tracks; drags on selected notes GHOST
(tracksGhost {dT, dLane}) and commit on release: dLane 0 ->
selEditApply time slide, else moveSelectionToTrack(target, dT)
(retrack keeps pitch, one group undo; melodic/drums lanes never mix).
Pencil is roll/score-only (no honest pitch in a squeezed lane); erase
works. Headers: M/S chips, fader (live gains, persists via
saveVoices as vol=), tap = selTrack, second tap = voice menu.
Gesture guards: anything assuming ROLL geometry must check
viewMode === "roll", not !== "score".

## Chrome visibility: applyChrome() is the ONE writer (advisor, 2026-08-22)

editrowHidden/footerHidden (device-local; migrated from the old
combined ff1roll-panelhide key, preserving the phones-start-folded
default). editrow shows iff editable (.on class) AND !editrowHidden
(inline style) — never write editrow.style.display anywhere else.
INVARIANT: the header never hides; View ▾ is always reachable, and a
hidden footer always floats the ▴ restore (which shows both). The
View ▾ menu stays open across toggle taps (batch hiding); every item
mirrors an existing button — buttons are the fast path.

### Listener mode (2026-08-23)

Phones (min-dimension < 500) default to a PLAYER: body.listener CSS
hides File/Edit/View, track chips, edit row, footer, ▴ restore,
metronome/record, instrument panel, #subtitle notes strip — leaving
the roll, ⏮ ▶, the LCD, speed % and 🔊. Section/chord bands fold too:
finalizeNotes caps depth at -1 and nulls chord lanes when listenerMode,
so RULER_H = BASE_RULER_H (applyListener re-runs finalizeNotes on
toggle — idempotent, same pattern as setSecDepth). listenerMode is
declared beside editOn/viewMode: lane math runs at song load, before
applyChrome's boot read (the editOn TDZ lesson).
Rationale: shared ?song= links are for listening.
Device pref ff1roll-listener ("1"/"0"; null = phone default). The
never-strand invariant holds via a header **Full app** button that
only renders in listener mode (one tap opts the device out and
persists "0"); View ▾ → 📻 Listener mode folds it back on any device.
applyListener() is the one class writer, called from applyChrome's
boot read and the two toggles; it early-returns when document.body is
absent (vm harness).

## Bassist (advisor-designed, 2026-08-23)

bsGenerate(seed, opts) mirrors the Drummer's contract: seeded takes,
replace-in-range as ONE group undo, per-bar substreams via the shared
sectionLane(bar) (same label = same bassline), labeled-Break silence,
meter-change refusal, strictly monophonic output (post-sort duration
clamp). Pitch truth ladder: declared chord bands (bsChordTimeline —
slash basses honored, N.C. = key-root pedal, gaps ride the last chord,
unreadable labels ride root+fifth) > INTERNAL melody inference
(bsInferTimeline: per-bar duration+metric-weighted PC census over ALL
sounding voices (one voice alone misreads multi-voice songs), scored
against the declared key's diatonic triads PLUS harmonic minor's
V-major and vii° when the declared key is minor (the graveyard-B
failure: an E# over F#m had no candidate, so every seed shuffled
equally-wrong diatonic picks), an additive mass-scaled smoothness
prior strong enough to hold a pedal (multiplicative ×1.15 amplified
negative scores and let solo lines read as a new root every bar), a
sounded-root bonus, seed draw squared-biased to the best reading and
gated to candidates ≥55% of the top score; a bar where every candidate
scores negative RIDES the previous chord instead of committing to a
confident wrong root. Seeds give different harmonic READINGS
— never displayed, never annotated: naming chords is Josh's; this is
his explicit melody-only "idea machine" case, overriding the
advisor's doctrinal rejection with the display boundary) > key-root
pedal > honest refusal. Styles chug/pump/arp/walk/riff per the spec;
constant rng draws per bar per style (liked-bar stability). Target
track picker never defaults onto a track with notes in range.

## Drummer parts scoping (advisor round 3, 2026-08-22)

parts = chips {kick, snare, hats, fills}. kick/snare/hats scope by
PITCH GROUP; fills is a ROLE (fills contain snares and kicks), scoped
by BAR: the bar before each declared boundary + the boundary/arrival
downbeat crash ticks. Semantics: all four = the literal v1 "all" path,
bit-identical (asserted in vm); groove-only = union of pitch groups,
fillAmt forced 0, no crashes; fills-only = whole-kit rewrite of fill
bars alone (fills knob "off" here = a DE-FILL: strips fills, lays
plain groove); combos = union. DOCUMENTED DECISION: a fills-only
reroll re-seeds the fill bar's groove too, so an identically-labeled
section's restated bar may diverge from its twins there — fill bars
are statement bars and vary on purpose (fills key on absolute bars).
ZERO new rng draws in any pre-existing path — the bit-compat guarantee
is what keeps takes replaying.

## UI convention: menu/row parity (Josh's rule, 2026-08-20)

Every command in the Edit ▾ menu has a corresponding icon button in the
edit row, and vice versa — the menu is the labeled version of the row,
never a superset. Shipping a new edit command means shipping both.
## Drummer (branch `drummer`, awaiting field test)

drGenerate(seed, opts) in index.html: deterministic kit generation.
v2 knobs (advisor-designed from Josh's Logic screenshot, 2026-08-22):
busy (density), hard (velocity — ONE choke point in put(), so hard=3
is bit-identical to v1; hats floored at 40), fills (band + odds),
follow (bass probabilistic / chords deterministic-on-declared-starts
capped 4/bar / off), feel (normal / half = mid-bar backbeat + thinner
hats / double = skank: kick every beat, snare every offbeat 8th,
bass-follow disabled). Legacy positional signature still works and
maps energy -> busy = hard.
Consistency (advisor round 2, 2026-08-22): the GROOVE substream keys on
(fnv1a32(section label) + bar offset in section) for the deepest section
containing the bar's downbeat — sections with an EXACT matching label
restate bar-for-bar (no stemming: "A repeat" != "A1"; renaming is the
manual signal, and it also merges their ruler colors). Bars outside any
section key on the absolute bar — unsectioned songs are bit-identical
to the old engine. Fill + arrival-crash substreams stay absolute-keyed
on purpose (fills are commentary on what comes NEXT). Fill vocabulary:
weighted pick at fills >= 4 (kitfall 3, tomrun/doublekick/buildup 2,
run/tomdrop 1); the metal tier (tomrun, kitfall, doublekick) is 16th-
rate and DENSER than the busy-5 groove it interrupts — the old max-
settings fills were sparser than their surroundings, which is why five
rolls all felt lackluster (7 toms in a whole song; now ~50+/roll). Design invariants (advisor-reviewed, 2026-08-20):
every generation is the same idempotent operation — erase all kit
notes in the bar range + add the new take, pushed as ONE
group{eraseBatch, addBatch} undo entry (no generation-identity
bookkeeping exists to go stale). Randomness is per-bar substreams
(drumRng(seed, barIndex)), so extending the range never reshuffles
bars already liked. The skeleton (kick on 1, meter-table backbeat) is
fixed; seeds only vary hats/ghosts/extra kicks/fill choice. Breaks =
bars where nothing but the bass SOUNDS (sustain-aware), or a section
labeled "break" — the drummer lays out. Fills own their window (the
skeleton yields inside it) and fire on 75% of section/loop boundaries,
crash on the arrival downbeat. Velocity table keeps hats ≥25 under
the bar's backbeat snare (cap 76). Take chips are session-ephemeral UI
snapshots of (seed, energy, from, to) — the winning take IS the notes.

## Query tools (tools/*.mjs — deterministic, facts only)

For any session (web sessions especially) that needs to READ music
without eyeballing dumps. All load through the app's own parser via
tests/harness.mjs (one parser, no drift), de-duplicate stacked notes by
default, and take `--json`. They report what IS in the file — never a
chord name, key inference, or note classification; findings are Josh's.

    node tools/at.mjs <song> <bar.beat> [--span <bar.beat>]
    node tools/span.mjs <song> <from> <to>        # + pitch-class set (no drums)
    node tools/pitch-census.mjs <song> [--track T] # PCs present/absent, duration-weighted
    node tools/song-diff.mjs <old.mid> <new.mid>
    node tools/annotations.mjs <song> [--type T]   # + anomaly flags
    node tools/loop-targets.mjs <song>|--all       # loop-target methodology

<song> = a bare name (resolved under albums/) or a path.

## Shipping checklist (every user-facing feature, Josh's standing rule)

1. **Help dialog**: add/update the entry in index.html's help sheet
   (#helpsheet — tabbed; put it in the right section, touch gesture
   first, keyboard equivalent after).
2. **Full manual**: run `node tools/build_help.mjs` to regenerate
   HELP.md from the help sheet. Never edit HELP.md by hand.
3. **Drift guard**: add a keyword for the feature to the FEATURES list
   in tests/night-roll.test.mjs (the keyword must appear in the help
   sheet region). A separate test fails if HELP.md is stale — so a
   feature with no help entry, or an unregenerated manual, breaks the
   suite by construction.
4. Tests green: `npm test` (vm suite) and `npm run test:e2e`
   (Playwright gesture suite, chromium + webkit ≈ iPad Safari; WebAudio
   is stubbed in e2e — a real AudioContext stalls 20s in headless).
   Mid-iteration, `npm run test:e2e:smoke` runs the @smoke-tagged
   specs chromium-only (~2s); the FULL suite before every push stays
   mandatory — smoke is for the edit loop, not the ship gate.
   The harness (tests/harness.mjs) records element/document/window
   listeners and exposes dispatchEvent, a fake clock (app.tick(ms)
   drives setTimeout + performance.now — the 230ms dwell is
   deterministic), Set-backed classList, and the e2e suite's inert
   FakeAudioContext, so vm tests drive the REAL pointer handlers with
   plain event objects (pev() in harness.mjs; handlers only read data
   properties). tests/gestures.test.mjs holds these ports. Port
   discipline (advisor, 2026-08-23): a vm port lives alongside its e2e
   twin for at least one commit before the e2e spec retires, and every
   port must fail under a knocked-out gesture (mutation check) before
   it is trusted. Irreducible e2e core stays browser-real on chromium
   AND webkit: boot/viewport/CSS, one real drag + pen dwell + pinch,
   sheet visibility, and the button-wiring sweep (the vm stub has no
   querySelector — a vm test can never prove a button is wired).
   Browser-verify via claude-in-chrome, commit, push with hash check;
   the push-triggered Pages build deploys on its own (manual kicks
   collide with it and email failure noise — only kick if it hangs).
