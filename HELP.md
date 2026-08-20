# Night Roll — Manual

<!-- GENERATED from index.html's help sheet by tools/build_help.mjs — do not edit by hand. -->

Everything here is also in the app: File → Help.

## Views

**▾ Hide controls**
The ▾ at the footer's left folds the bottom controls (edit row + footer) away so small screens show music instead of buttons — a floating ▴ brings them back. Phones start folded automatically; your explicit choice is remembered per device.

**𝄞 Score / ▦ Roll**
Switch between piano roll and engraved sheet music. Same timeline, same everything else. Your choice is remembered.

**Drag / pinch**
One finger pans; two fingers zoom — spread horizontally to stretch time, vertically to grow/shrink the pitch rows (roll only). Two fingers moving TOGETHER pan — and that works with pencil or select armed; anything the first finger started is rolled back the instant the second finger lands. With an Apple Pencil (or one finger), **hold to grab**: dwell about a quarter second on a note before it drags, and the pencil tool only places a note on a clean tap or a dwell — a fast passing stroke always PANS, so sweeping across the song never moves a note or plants a stray one. A mouse grabs instantly (pressing a mouse button is already deliberate). Songs open fitted to the screen. In score view, scroll fully left to see the clefs and key signature.

**Roll zoom-out limit**
Pinch-out stops once the whole song is in view — per axis: when every bar fits, further pinch-out only reveals pitch; when every note is visible — plus a few rows of breathing room above and below, so the top notes never sit against the ruler — it stops. Opening a song lands exactly on this limit.

**Score zoom limit**
The score stops zooming out where its busiest bar would overflow — engraved notes can't shrink. Mute dense tracks to zoom out further, or use the Roll for the bird's-eye view.

## Playback

**▶ Play / ■ Stop**
NES-style voices; drum tracks get a real kit. Songs loop at their final bar forever.

**⏱ Metronome**
Any meter (1–12 over 2/4/8/16 — bpm counts the denominator beat), tap each beat cell to cycle accent → normal → silent, subdivisions in 2/3/4, slider or tap-tempo. Three modes: **free-running** (its own clock); **follow song** — clicks ride the song's own grid, phase-perfect on the declared meter through tempo changes, speed slider, and loops; **trial meter** — click a meter of YOUR choosing over the real music to A/B candidates by ear (the "shift accents" ‹ › slides the pattern's starting beat, since a right meter can sit offset). Settings stick.

**Count-in**
Optional one-bar click lead-in, only when play starts from bar 1 beat 1 — never mid-song, never when the song loops back around.

**⏮**
Back to bar 1.

**Speed slider**
25–200% of the song's own tempo, for close listening or instrument practice — pitch stays true; only time stretches. Applies when you let go; keeps its setting across songs. A 100% button appears whenever you're off native — tap to snap back.

**Scroll while playing**
Scrolling away suspends the auto-follow camera so you can study any spot; it latches back on when the playhead reaches what you're looking at.

**LCD readout**
Beside Play, Logic-style: live bar and beat (counted in the declared meter's beats), the tempo at the cursor from the song's own tempo map (scaled by the speed slider), and the declared meter and key. Undeclared stays honest: meter reads "4/4?", key reads "C?" (the display default), a stored tonic reads "B♭?". On your own songs the tempo segment is tappable too — it opens a Tempo change annotation ("tempo: 120" at a bar/beat; the map applies from there, so mid-song tempo changes work; Save writes the full map into the .mid). On analyzed songs the same annotation is an OBSERVATION — it records that the music changes tempo there and leaves playback untouched (the capture's timing is measured fact). Every readout is a door: tap the tempo to open the tempo annotation governing the cursor (or declare the first one), tap the meter to open the time signature, tap the key to open the key change ruling the cursor — a stored partial opens its own note with the tonic already filled.

**Blue cursor**
Play starts here. Tap the bar ruler to place it, or drag its handle (triangle under the ruler). Tapping any note also moves it there.

### NO SOUND ON iPAD?

**Silent Mode**
iOS mutes Web Audio (this app's sound engine) when Silent Mode is on — while YouTube keeps playing, which makes it look like an app bug. Control Center → tap the bell. Also try volume-up while playing: the ringer channel has its own volume.

## Tracks

**Track chips (top)**
Tap a chip to select its track. **M** mutes — hides the track and silences it together, instantly, even mid-playback; tap M again to bring it back. **S** solos (only soloed tracks play). One tap each, any time. Tap the selected chip AGAIN for the voice & color menu, organized by family: NES / waves (pulses, triangle, sine, saw; auto = the classic assignment, and its menu row SAYS what it resolves to for this track — "auto: pulse 50%", or "auto: chip" when the game's own sound is available), then real sampled instruments — Keys & mallets (piano, electric piano, harpsichord, celesta, music box, vibraphone, marimba, glockenspiel), Guitar & bass, Strings (solo violin/viola/cello/contrabass, the full section, pizzicato, harp), Winds (flute, piccolo, clarinet, oboe, saxes), Brass (trumpet, trombone, french horn, tuba, section), Organ & choir — 36 FluidR3 soundfont instruments, each fetched only when a track uses it and cached after, and loudness-matched to the chip voices automatically — a violin at the same velocity as a pulse now sits at the same level, so velocity stays a musical choice instead of a mixing workaround. Tap a family to open it, ‹ to go back; the menu opens in the current voice's family — and its color — the wide bar at the bottom shows the track's current color and opens a full color picker (any color at all), and a **vol** fader above it sets the track's own volume (0–150%), live while you drag — the mixer answer when one instrument dominates. On your own songs the menu also RENAMES the track (type a name, tap Rename): voice, color, and volume settings migrate with it, and Save bakes the name into the .mid. Name a track "drums" (or "kit"/"percussion") and it becomes a drum track. Both save as a normal synced annotation ("track: pulse1 voice=piano") — playback and display only, the MIDI is never touched. Many tracks wrap onto more rows; a ▾ appears beside the last chip when they overflow — first row always shows, ▾ reveals the rest, ▴ tucks them away (the transport stays pinned to the top row). The ◂ at the far left slides the whole chip cluster away when the row feels busy; ▸ brings it back (remembered). ▶ Play and ⏮ sit on this row; the 𝄞/▦ view toggle lives bottom-left in the footer.

**S**
Solo: hide everyone else instead.

## Explore

**Tap a note**
Inspector shows pitch, bar & beat (counted 1e&a), length, velocity, track — and plays it.

**Copy the pitch list**
When the lasso strip lists selected pitches, tap the text (or the ⧉ copy chip) to copy them comma-separated — after "Chord?", the chord name comes along too.

**⊞ Lasso**
Toggle on, then drag a box over notes (works in all views). Boxes ADD to the selection — draw as many as you need. Tap any note to toggle it in or out (surgical removal of a pedal or neighbor); tap empty space to clear. Shows all the pitch names, low to high — and the **8va** button beside Chord? toggles the octave numbers: off collapses duplicates to bare pitch classes (C · E · G), the chord-reading view; the setting sticks.

**◯5 Circle of fifths**
The classic chart, live: majors outside with their signatures, relative minors inside, diminished chords at the center, and the movable degree window (IV·I·V over ii·vi·iii over vii°). Two independent motions: **drag the wheel** (or ⟲ ⟳) to spin it — put any key at 12 o'clock; **tap a wedge** to move the degree window there. Opens with the song's key on top and highlighted. Below the wheel: the window key's signature accidentals, full scale, all seven triads, and its IV/V neighbors.

**find: (pitch finder)**
Pick a pitch class in the footer dropdown and every occurrence lights up across all visible channels — everything else dims, so nothing lit means a confident zero. Works by pitch class (find B♭ catches A#), shows the count and channels in the strip, and labels the degree when a key is set. Made for mode-hunting: chasing the one accidental that separates two candidate modes.

**Chord?**
After a lasso: reveals what chord those notes make. Hidden by default so you can name it first.

**Challenge?**
Tap one of your chord bands in the ruler, then tap Challenge? — opens the evidence dialog: each label tone with its role and whether it sounds (and where), extra pitches present, the per-channel note lists, and what the namer would call the whole stack. Only when you ask; extra tones are evidence, not verdicts (a pedal point shows as "extra" — correctly).

**💬**
Show/hide the text-note strip (the fixed slot that shows your notes as the playhead crosses them). Off frees the vertical space; setting sticks.

**🎹 Instrument panel**
Opens a piano / guitar fretboard strip above the footer. Lasso'd and sounding notes both light in their track's color (earliest track wins a shared pitch); a lasso'd note gets a white ring for exactly as long as it sounds — so your selection visibly fires as the playhead crosses it. Tap any key or fret to hear it and see its name — plus its scale degree once a key is declared (the readout fades after a few seconds). Guitar is standard tuning, 24 frets: your lasso'd octave lights solid gold, and every OTHER octave of the same note gets a hollow gold ring — select one F♯ and every F♯ on the neck shows. A pitch that doesn't fit the neck shows octave-folded with a dashed ring and a tiny ▴/▾ pointing at its true octave.

**▼ Fall**
Synthesia-style view: the whole timeline turns into a vertical drop and the notes fall down into the piano keys, landing the moment they sound. Bar numbers and chord symbols ride along their lines. Lasso works here too — box the falling notes and they light up on the keys. Piano-only; tap ▼ Fall again (or the Guitar tab) to return to the roll/score.

## Editor

**Edit row**
On your own songs (never on captures) a dedicated row appears above the footer: Select / Pencil / Erase (tap the active tool again to turn it OFF — then dragging only pans, and no note can be grabbed by accident), durations 32nd–whole incl. dotted, plus 16· (dotted 16th) and 8T/16T triplets — picking a triplet also switches the snap grid to triplet steps, and the grid only goes 32nd-fine when the song actually CONTAINS 32nds — to add the first one, pencil it on the beat (the grid upgrades the moment it exists) and drag it where it belongs (Logic's grid-division trick: your 4/4 stays 4/4, entry just lands on thirds until you pick a straight duration again), p/mf/f velocity, the ♮♯♭ accidental segment in score view, and ⟲ undo.

**● Record**
On your own songs: tap the chip of the track you want to record onto, then ● beside Play arms the take — the 🎹 panel opens, ● blinks red, the transport rolls (count-in applies), and every key you play lands on that track at the playhead — hold a key for a long note, slide across keys for runs — or play a REAL MIDI device (a Jamstik, a keyboard): the browser's MIDI input records with your actual velocities, chords included (Chrome/Edge on the computer; Safari/iPad has no Web MIDI). Starts and durations snap to the move grid (16ths, or triplet steps with a T duration active). ● again or ■ stops; the whole take is one ⟲ step.

**Pencil drag**
In Pencil mode, tap places one grid-unit of note — or **keep dragging** and the note stretches under your finger, snapped to the duration grid. The duration buttons set that grid (16T/16th/16· · 8T/8th/8· · ¼…): pick the smallest unit you're thinking in and draw lengths by feel.

**Drum chart (score view)**
The kit renders as a real percussion staff at the BOTTOM of the score: percussion clef, positions are roles not pitches (kick in the bottom space, snare in the third, toms by size, hats above the top line), x-noteheads for hats and cymbals, stems up for hands and down for feet. Read-only for now — kit entry lives in the roll's drum lane; lasso and tap work on the chart like anywhere else.

**Score entry**
Pencil and Erase work on the engraved score too: tap a staff position and the note lands there — the stave you tap picks the track, the height picks the pitch (ledger lines included), and the key signature supplies sharps/flats automatically. The key/♮/♯/♭ segment overrides the signature when you want an accidental. Erase taps a notehead out.

**Move**
Select notes (lasso or tap one), then **drag them** — up/down transposes, left/right slides in time on a 16th-note grid (triplet steps while a T duration is active), and the whole selection moves together, so a chord moves as a chord. Works straight from lasso mode: start the drag on a selected note. Keyboard: arrows (Shift+↑↓ = octave).

**Resize**
Drag a selected note's **right edge** to change its length, or its **left edge** to move the start while the end stays put — every selected note adjusts by the same amount, so "play this chord half as long" is one gesture. Notes too small on screen to have edge zones are all move-handle — zoom in to resize them. Keyboard: Option+←→.

**Copy**
A real copy and a real paste: **⧉** copies whatever is lasso'd (or tapped), **📋** pastes it at the blue cursor — and the copy SURVIVES scrolling, changing selection, even changing tools, so "lasso bar 3, scroll to bar 16, paste" is exactly three gestures. ⌘C fills the same clipboard. Pasting and chord inserts never stack an identical note on an existing one. For stacks from older drafts, **🧹 Remove duplicate notes** in the ⇄ sheet sweeps the whole song (within each track; deliberate unisons BETWEEN tracks are always safe) — then SAVE, so a stale draft can't resurrect them. A chord progression is pencil one chord → ⧉ → 📋 at each cursor stop. Buttons that can't do anything right now are grayed — no selection grays copy/delete/split/join/⇄, an empty clipboard grays paste, empty histories gray ⟲⟳. With a keyboard there's also Option-drag (drags out an in-place copy) and ⌘C/⌘V.

**Insert chord (♫)**
Tap **♫** in the edit row: pick a root, a quality (maj, m, 7, maj7, m7, dim, sus… — triads insert three notes, sevenths four), an octave, and a duration (16th to whole, dotted included), then Insert — the whole chord lands at the blue cursor on the selected track, a matching chord band appears in the ruler, and the cursor walks forward one slot. Repeated inserts build a progression without closing the dialog; the inserted notes arrive selected, ready to nudge. The dialog's **Progression** tab holds a library of whole progressions organized by emotion — triumphant, yearning, ominous, grieving, and twenty more, in Roman numerals so they work anywhere: the tonic pre-fills from the song's declared key when there is one; pick octave and duration, tap a mood, and the entire progression lands one chord per slot with matching chord bands in the ruler, all selected, one ⟲ step. Stretch or rearrange afterwards. The same mood list is also behind the **Progressions** button in the ◯5 dialog, for browsing while analyzing.

**Move to track (⇄)**
Select notes and tap **⇄**, then pick a track — the notes switch instrument, keeping their time and pitch (play a passage into one voice, then deal melody, harmony, and bass out to pulse1/pulse2/triangle). When the selection spans several tracks (doubled unisons), a **move only** row lets you move just one track's copies and leave the others — or solo a track BEFORE lassoing: hidden tracks can't be selected at all.

**Drum fill (🥁)**
Tap **🥁**: a one-bar step grid for kick, snare, and hat, sized to your meter (8ths or 16ths), pre-seeded with a standard backbeat. Toggle cells, set the range — bar typed, beat and 16th-subdivision (· e & a) picked from dropdowns, pre-filled from the cursor, so drums can enter at bar 2 beat 4 exactly — and Fill: the pattern repeats from that point on the drums track (created automatically if the song has none), skipping hits that already exist. One ⟲ undoes the whole fill; embellish afterwards with the pencil in the kit lane.

**Split**
Select notes and tap **✂**. If the blue cursor sits inside them (tap the ruler to place it), each selected note the cursor crosses splits at that exact spot; if the cursor is elsewhere, each selected note splits in half.

**Join**
Select two or more notes on the same pitch and tap **⁀** — they merge into one note spanning first start to last end (each pitch merges separately, so a lassoed pair of chords joins into one longer chord).

**Unsaved dot**
A gold **●** after the title means the song has edits that haven't been committed — it appears the moment you change anything and clears when Save & Commit succeeds (the Save sheet's title says which state you're in, too).

**Edit menu**
An **Edit ▾** menu appears beside File on songs you can edit: ⟲ Undo, ⟳ Redo, ⧉ Duplicate, 📋 Paste at cursor, 🗑 Delete, ✂ Split, ⁀ Join, ⇄ Move to track, ♫ Insert chord, 🥁 Drum pattern — the same actions as the edit-row icons, labeled. Redo replays what Undo took back; making any new edit clears the Redo history (standard editor behavior).

**Velocity**
The **vol slider** in the edit row (1–127, the number beside it shows the value) sets the pencil's loudness — and with notes selected in Select mode, dragging it adjusts ALL of them live, brightness tracking the drag, committing one ⟲ step when you let go. Tap a selection (or a single note) and the slider jumps to its current velocity — and when every selected note shares one velocity, the selection readout says so ("… 6 notes · vel 80").

**Delete**
Tap **🗑** in the edit row — every selected note goes at once. Delete key does the same.

**Undo**
Every gesture above — move, resize, copy, paste, delete — is exactly one ⟲ step.

## Annotations

### ANNOTATIONS

**Attached notes on ANY annotation**
Every typed annotation — key, meter, tempo, section, chord, loop — can carry a text note: in its editor, whatever you write in the text box below the value rides along (for sections, the first line is the label and the rest is the note). The ✱ marker in bands and ☰ Notes says one is there. This is where the DOUBT lives — "whole-tone material, no conventional key" can sit on a key: B♭? and make the open question findable later.

**+ Note**
Write a note anchored at the cursor's beat — or tap 🎤 Speak and dictate it. Fill "to bar/beat" to span a range. The ⊙ highlight toggle in the note strip shades the current note's span in the timeline.

**Ruler drag**
Drag along the bar ruler to select a range — + Note pre-fills it, and ▶ Play **cycles** over it, Logic-style: playback starts from the cycle's top every time and loops just that span (any loop: annotation is ignored while it's armed). Ruler drags snap to 16ths. Only a DRAG arms the cycle — tapping a section or chord band still selects its range for + Note, without changing playback. Tapping the ruler **parks** the highlight (it dims but survives); tap inside the dimmed span to re-arm it without redrawing, or drag a new span to replace it. While a cycle is armed, ⏮ returns to the cycle's start instead of bar 1. The playhead's triangle handle under the ruler is draggable in any mode. On your own songs, drag a section or chord band by its **edge** (in its ruler lane) to move that boundary — snaps to 16ths, saves like any other edit.

**Gold flags**
Existing annotations. Tap one to jump there and read it in the strip above the footer. They also appear as subtitles during playback.

**☰ Notes**
Every annotation in the song, grouped by type — key, meter, sections, chords, loop, text notes. Tap a row to edit or delete it; each group's + adds one of that type. Shortcut: **double-tap** a section or chord band in the ruler to open that annotation directly. Changes to synced notes need a Sync to become permanent.

**Loop points**
Some songs loop back past an intro (not to bar 1). When you discover one, write a note whose text is **loop: B.Q** (e.g. "loop: 2.1") — the note's anchor is the jump point: when playback reaches it, it returns to B.Q. If the anchor sits at/before the target, the jump happens at the song end instead.

**Sections**
Colored bands in the ruler (A, B…). Make one: select a range, + Note, tick "section", give it a short label. Nest them by containment. Tap a band to select its whole range. Sections and chords each get their OWN row group (sections above, chords below), so a section and a chord covering the same bars never fight for a lane.

**Chords**
Chord bands — like sections, but typed. Select a range, + Note, "Chord", then tap chips (root · ♭♮♯ · quality · extensions · /bass) or type the symbol. Bare root = major, m = minor (Gm). The quality row picks ONE (maj/m/dim/aug/sus2/sus4/5); the extensions row STACKS — tap 7 and add9 on top of m for Cm7add9, tap again to remove one. Anything the chips can't spell, type into the box — the label is free text and typing always wins. Same label = same color, so a recurring chord is spottable at a glance. Add an optional text note to a chord — it shows as ✱ on the band. On YOUR songs, moving a selection of EVERY note in the song takes the entire annotation layer with it — sections, chords, the loop point and its target — with chord and key labels transposing on vertical moves (global facts like meter and tempo keep their bar-1 anchor); that's how you cut an intro and slide everything left without orphaning your analysis. Moving a selection that carries one band's every note takes that band along (position slides, label transposes — Cm dragged up two semitones becomes Dm), When YOU ask for it — the **Check labels** button in ☰ Notes' CHORDS group — the app compares each label against what sounds in its span and flags mismatches (⚠ on the band, the reading in the list). It never volunteers this and never rewrites your labels; any note edit clears the flags. The check hears EVERY pitch sounding in the span, so passing tones and dense textures can read as "no standard chord match" — a flag is a nudge to listen, not a verdict.

**Chop**
Trim a song without touching the file: put the cursor at the cut, + Note, "Chop", pick "everything before this beat" or "this beat to the end". The chopped part vanishes entirely and bars renumber (chop a 2-bar intro and old bar 3 becomes bar 1 — your annotations shift with it). Delete the chop in ☰ Notes to restore. Made for cleaning up freshly imported captures.

### KEYS

**key: picker**
Songs display in C until YOU set the key. First dropdown is the tonic pitch only; black keys offer three options — fused "A♯/B♭" (spelling undecided) or either asserted spelling. Second dropdown is the mode (major, minor, and the church modes). With both set, the signature previews live — the right key makes most accidentals vanish — and the button writes it ("Set Gm @ bar 1"). Set a different key mid-song for key changes; the score draws the new signature there.

**mode? (partial keys)**
Know the tonic but not the mode yet? Choose "mode?" and Store writes "key: B♭?" — recorded, listed under KEY in ☰ Notes, but NOT applied: no signature, no respelling, until you return with the mode. The dropdown label always says which state the song is in.

## Files & Sync

**File**
Everything file-shaped lives here now. Open… (the song picker — albums, drafts; the current song's title shows above the track chips), New song (name/tempo/meter dialog → blank 3-voice NES composition), Save (opens the Save & Commit sheet: on your own songs its button commits the .mid AND the annotations together in one go; on analyzed songs the same door is the annotation Sync — one workflow, and what gets pushed is whatever the mode owns), Save As (forks ANY song, including a locked capture, into nightroll/ with its annotations inherited — write a counter-line over Town), Settings… (GitHub token + the Data locations that tell Night Roll where songs, analysis, and NSFs live), Revert to repo copy… (the escape hatch: discards THIS device's draft, unsynced annotations, and deletions for the open song, then loads the repo's last save — for when local edits went somewhere you can't undo your way out of), Rename… (works on everything: an uncommitted draft renames its actual file; a committed/repo song keeps its filename — analysis docs and the capture pipeline reference it — and gets a display-title override written to its album.json and the manifest, so the new name shows everywhere), Import… (multi-select capable; byte-sniffs each pick: MIDI files — .mid, .midi, .smf, .kar, even RIFF-wrapped .rmi — ask where they belong: **Keep local** (this-device draft, annotations never sync) or **Create album** — one or many MIDIs become an album folder under drafts, audition/rename/✕ like NSF captures, and ⇪ Commit publishes them to the songs repo so annotations sync everywhere (note: commit rewrites the .mid as notes+tempo+meter — foreign CCs/programs are not preserved); an NSF chip-music file opens the capture panel: every track runs through the same 6502/APU pipeline that dumped the FF1 album — loop detected and trimmed, tempo grid-fitted, hardware loop point recorded as a loop: annotation; the capture window auto-doubles (75 → 150 → 300s) when no loop fits, since the detector needs the intro plus two full passes — and lands as a LOCAL draft under an Import album; names load automatically from the rip's .m3u playlist when you pick it with the NSF (or pick the .m3u alone afterward — even already-captured drafts rename in place); otherwise audition each capture and type its real name right in the panel row — "Dr. Wily's Castle" replaces "track-15" instantly, punctuation preserved through to the song picker; Chip audio is automatic — whenever the app can reach a song's NSF (live import session, this device's cache, or the public archive), it renders the captured register log through the NES 2A03's actual sound hardware (duty sequencers, envelopes, noise LFSR — the console's own voice, not our oscillator approximation) and ▶ plays that; there's no button and nothing to enable. Mute/solo stay live per track, the speed slider acts tape-style, and picking an explicit instrument in a track's voice menu overrides the chip for that track (auto = chip); in Open → drafts each import album is its own FOLDER (tap in for its tracks: ⇪ on a track commits just that song to its album, "⇪ Commit album" pushes the whole folder, ✕ tap-twice discards a dud, and the ✕ on the folder row itself discards the entire album's drafts at once; re-capturing a track — or re-importing the whole NSF, maybe with a longer capture window — simply overwrites the old drafts; File → Commit import still pushes every import draft across all folders at once); expansion-chip audio like VRC6 is not captured), Download .mid (exports any song, works in Logic). Compositions auto-draft to this device on every edit — find them under "Night Roll drafts" in the song picker, where a ✕ (tap twice) deletes a draft from this device; Save is what puts them in the repo, and it updates the dropdown's catalog automatically. Imported MIDI files land there too (prefixed "local /") — they persist on this device and stay editable, but never sync to the repo; Save As forks one into a real composition. Move to… relocates a composition between Night Roll Sketches and My Compositions (files + catalog together). A ＋ track chip appears in the track bar on compositions — and a **＋ drums** chip adds a GM drum kit track: its the kit gets its own labeled LANE that starts docked under your lowest melodic note — and you can DRAG it anywhere by its labels in the left gutter; the position saves as a normal synced annotation ("lane: N"), so it follows the song to every device. Hats at the top of the lane, kick at the floor. Delete any track from its voice & color menu (tap the selected chip again → ✕ Delete track, tap twice), penciled like any notes, played with the built-in kit, and exported on MIDI channel 10 so Logic reads them as drums.

**Data locations**
Night Roll is configured with WHERE its data lives (Sync → "Data locations ▾"): three rows — songs (.mid, album.json, catalog), analysis (.rollnotes + docs), and NSF (chip-audio source) — each with a read base URL (blank = this site; or any raw.githubusercontent.com/<owner>/<repo>/<branch> or local server) and an owner/repo write target. One fine-grained token, granted to every repo you write to, covers all commits; write errors name the repo they hit, and a 404 usually means the token hasn't been granted that repo. This is what lets another analyst point their own analysis repo at a shared songs corpus. Defaults: everything in this site's repo, NSFs from the public nsf-archive.

**⚠ Messages**
Errors outlive the moment: anything warning-shaped (failed commits, unreachable NSFs, token-scope problems, even uncaught crashes) is kept in a log, and a ⚠ button appears in the footer only when the log is non-empty — tap it to read timestamped entries, Clear to dismiss. The bottom info strip still shows the latest message; this panel is where the ones you missed went.

**Song links**
The address bar always holds a link to the open song — copy it and anyone who opens it lands directly on that song (?song=…). Local drafts are excluded (they exist only on your device).

**Sync**
Commit your annotations, sections, and keys to GitHub (needs your token, one-time), or Copy/Download the file. "Commit all changed" pushes every song you touched this session, not just the open one — the Sync button shows how many are waiting. "Unsynced" = still only on this device. Repo ↗ opens the GitHub repository in a new tab. ⎘ Web session copies the bootstrap-instructions URL — paste it into a fresh Claude Web chat and it has everything it needs to run an analysis session (process rules, file locations, session shape, handoff format).
