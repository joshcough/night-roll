# Night Roll — Manual

<!-- GENERATED from index.html's help sheet by tools/build_help.mjs — do not edit by hand. -->

Everything here is also in the app: File → Help.

## Views

**𝄞 Score / ▦ Roll**
Switch between piano roll and engraved sheet music. Same timeline, same everything else. Your choice is remembered.

**Drag / pinch**
One finger pans; two fingers zoom — spread horizontally to stretch time, vertically to grow/shrink the pitch rows (roll only). Songs open fitted to the screen. In score view, scroll fully left to see the clefs and key signature.

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
Beside Play, Logic-style: live bar and beat (counted in the declared meter's beats), the tempo at the cursor from the song's own tempo map (scaled by the speed slider), and the declared meter and key. Undeclared stays honest: meter reads "4/4?", key reads "C?" (the display default), a stored tonic reads "B♭?". On your own songs the tempo segment is tappable too — it opens a Tempo change annotation ("tempo: 120" at a bar/beat; the map applies from there, so mid-song tempo changes work; Save writes the full map into the .mid). On analyzed songs the same annotation is an OBSERVATION — it records that the music changes tempo there and leaves playback untouched (the capture's timing is measured fact). The meter·key segment is tappable whenever it shows a "?" — it opens the editor preset to answer it: Time signature if the meter is unset (it wins when both are), Key change otherwise; a stored partial opens its own note with the tonic already filled.

**Blue cursor**
Play starts here. Tap the bar ruler to place it, or drag its handle (triangle under the ruler). Tapping any note also moves it there.

### NO SOUND ON iPAD?

**Silent Mode**
iOS mutes Web Audio (this app's sound engine) when Silent Mode is on — while YouTube keeps playing, which makes it look like an app bug. Control Center → tap the bell. Also try volume-up while playing: the ringer channel has its own volume.

## Tracks

**Track chips (top)**
Tap a chip to select its track. **M** mutes — hides the track and silences it together, instantly, even mid-playback; tap M again to bring it back. **S** solos (only soloed tracks play). One tap each, any time. Tap the selected chip AGAIN for the voice & color menu, organized by family: NES / waves (pulses, triangle, sine, saw; auto = the classic assignment), then real sampled instruments — Keys & mallets (piano, electric piano, harpsichord, celesta, music box, vibraphone, marimba, glockenspiel), Guitar & bass, Strings (solo violin/viola/cello/contrabass, the full section, pizzicato, harp), Winds (flute, piccolo, clarinet, oboe, saxes), Brass (trumpet, trombone, french horn, tuba, section), Organ & choir — 36 FluidR3 soundfont instruments, each fetched only when a track uses it and cached after. Tap a family to open it, ‹ to go back; the menu opens in the current voice's family — and its color — the wide bar at the bottom shows the track's current color and opens a full color picker (any color at all). Both save as a normal synced annotation ("track: pulse1 voice=piano") — playback and display only, the MIDI is never touched. Many tracks wrap onto more rows; a ▾ appears beside the last chip when they overflow — first row always shows, ▾ reveals the rest, ▴ tucks them away (the transport stays pinned to the top row). The ◂ at the far left slides the whole chip cluster away when the row feels busy; ▸ brings it back (remembered). ▶ Play and ⏮ sit on this row; the 𝄞/▦ view toggle lives bottom-left in the footer.

**S**
Solo: hide everyone else instead.

## Explore

**Tap a note**
Inspector shows pitch, bar & beat (counted 1e&a), length, velocity, track — and plays it.

**Copy the pitch list**
When the lasso strip lists selected pitches, tap the text (or the ⧉ copy chip) to copy them comma-separated — after "Chord?", the chord name comes along too.

**⊞ Lasso**
Toggle on, then drag a box over notes (works in all views). Boxes ADD to the selection — draw as many as you need. Tap any note to toggle it in or out (surgical removal of a pedal or neighbor); tap empty space to clear. Shows all the pitch names, low to high.

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
On your own songs (never on captures) a dedicated row appears above the footer: Select / Pencil / Erase, durations 16th–whole incl. dotted, plus 16· (dotted 16th) and 8T/16T triplets — picking a triplet also switches the snap grid to triplet steps (Logic's grid-division trick: your 4/4 stays 4/4, entry just lands on thirds until you pick a straight duration again), p/mf/f velocity, the ♮♯♭ accidental segment in score view, and ⟲ undo.

**Pencil drag**
In Pencil mode, tap places one grid-unit of note — or **keep dragging** and the note stretches under your finger, snapped to the duration grid. The duration buttons set that grid (16T/16th/16· · 8T/8th/8· · ¼…): pick the smallest unit you're thinking in and draw lengths by feel.

**Score entry**
Pencil and Erase work on the engraved score too: tap a staff position and the note lands there — the stave you tap picks the track, the height picks the pitch (ledger lines included), and the key signature supplies sharps/flats automatically. The key/♮/♯/♭ segment overrides the signature when you want an accidental. Erase taps a notehead out.

**Move**
Select notes (lasso or tap one), then **drag them** — up/down transposes, left/right slides in time on a 16th-note grid (triplet steps while a T duration is active), and the whole selection moves together, so a chord moves as a chord. Works straight from lasso mode: start the drag on a selected note. Keyboard: arrows (Shift+↑↓ = octave).

**Resize**
Drag a selected note's **right edge** — every selected note lengthens or shortens by the same amount, so "play this chord half as long" is one gesture. Keyboard: Option+←→.

**Copy**
Tap **⧉** in the edit row: the selection duplicates in place and the COPIES become the selection — drag them (or arrow-key them) to where they go. For copies that land far away, use **📋** instead: it stamps a copy of the selection at the blue cursor (tap the ruler to place it first) — or, with nothing selected, pastes whatever ⌘C last copied. A chord progression is pencil one chord → ⧉ → drag → repeat. With a keyboard there's also Option-drag (drags out a copy) and ⌘C/⌘V (pastes at the playhead, pasted notes arrive selected).

**Insert chord (♫)**
Tap **♫** in the edit row: pick a root, a quality (maj, m, 7, maj7, m7, dim, sus… — triads insert three notes, sevenths four), an octave, and a duration (16th to whole, dotted included), then Insert — the whole chord lands at the blue cursor on the selected track, a matching chord band appears in the ruler, and the cursor walks forward one slot. Repeated inserts build a progression without closing the dialog; the inserted notes arrive selected, ready to nudge. The dialog's **Progression** tab holds a library of whole progressions organized by emotion — triumphant, yearning, ominous, grieving, and twenty more, in Roman numerals so they work anywhere: the tonic pre-fills from the song's declared key when there is one; pick octave and duration, tap a mood, and the entire progression lands one chord per slot with matching chord bands in the ruler, all selected, one ⟲ step. Stretch or rearrange afterwards. The same mood list is also behind the **Progressions** button in the ◯5 dialog, for browsing while analyzing.

**Move to track (⇄)**
Select notes and tap **⇄**, then pick a track — the notes switch instrument, keeping their time and pitch (play a passage into one voice, then deal melody, harmony, and bass out to pulse1/pulse2/triangle). The same sheet has **🧹 Remove stacked duplicates**: notes sitting at exactly the same start and pitch on one track (usually from ⧉ copies that never got dragged) collapse to the single longest one, song-wide, in one tap — ⟲ restores them.

**Drum fill (🥁)**
Tap **🥁**: a one-bar step grid for kick, snare, and hat, sized to your meter (8ths or 16ths), pre-seeded with a standard backbeat. Toggle cells, set the bar range, Fill — the pattern repeats across those bars on the drums track (created automatically if the song has none), skipping hits that already exist. One ⟲ undoes the whole fill; embellish afterwards with the pencil in the kit lane.

**Split**
Select notes and tap **✂**. If the blue cursor sits inside them (tap the ruler to place it), each selected note the cursor crosses splits at that exact spot; if the cursor is elsewhere, each selected note splits in half.

**Join**
Select two or more notes on the same pitch and tap **⁀** — they merge into one note spanning first start to last end (each pitch merges separately, so a lassoed pair of chords joins into one longer chord).

**Velocity**
The **vol slider** in the edit row (1–127, the number beside it shows the value) sets the pencil's loudness — and with notes selected in Select mode, dragging it adjusts ALL of them live, brightness tracking the drag, committing one ⟲ step when you let go. Tap a selection and the slider jumps to its current velocity.

**Delete**
Tap **🗑** in the edit row — every selected note goes at once. Delete key does the same.

**Undo**
Every gesture above — move, resize, copy, paste, delete — is exactly one ⟲ step.

## Annotations

### ANNOTATIONS

**+ Note**
Write a note anchored at the cursor's beat — or tap 🎤 Speak and dictate it. Fill "to bar/beat" to span a range. The ⊙ highlight toggle in the note strip shades the current note's span in the timeline.

**Ruler drag**
Drag along the bar ruler to select a range — + Note pre-fills it, and ▶ Play **cycles** over it, Logic-style: the span glows amber and playback loops just that span (any loop: annotation is ignored while it's armed). Only a DRAG arms the cycle — tapping a section or chord band still selects its range for + Note, without changing playback. Tap the ruler to clear.

**Gold flags**
Existing annotations. Tap one to jump there and read it in the strip above the footer. They also appear as subtitles during playback.

**☰ Notes**
Every annotation in the song, grouped by type — key, meter, sections, chords, loop, text notes. Tap a row to edit or delete it; each group's + adds one of that type. Changes to synced notes need a Sync to become permanent.

**Loop points**
Some songs loop back past an intro (not to bar 1). When you discover one, write a note whose text is **loop: B.Q** (e.g. "loop: 2.1") — the note's anchor is the jump point: when playback reaches it, it returns to B.Q. If the anchor sits at/before the target, the jump happens at the song end instead.

**Sections**
Colored bands in the ruler (A, B…). Make one: select a range, + Note, tick "section", give it a short label. Nest them by containment. Tap a band to select its whole range.

**Chords**
Chord bands — like sections, but typed. Select a range, + Note, "Chord", then tap chips (root · ♭♮♯ · quality · /bass) or type the symbol. Bare root = major, m = minor (Gm). Same label = same color, so a recurring chord is spottable at a glance. Add an optional text note to a chord — it shows as ✱ on the band.

**Chop**
Trim a song without touching the file: put the cursor at the cut, + Note, "Chop", pick "everything before this beat" or "this beat to the end". The chopped part vanishes entirely and bars renumber (chop a 2-bar intro and old bar 3 becomes bar 1 — your annotations shift with it). Delete the chop in ☰ Notes to restore. Made for cleaning up freshly imported captures.

### KEYS

**key: picker**
Songs display in C until YOU set the key. First dropdown is the tonic pitch only; black keys offer three options — fused "A♯/B♭" (spelling undecided) or either asserted spelling. Second dropdown is the mode (major, minor, and the church modes). With both set, the signature previews live — the right key makes most accidentals vanish — and the button writes it ("Set Gm @ bar 1"). Set a different key mid-song for key changes; the score draws the new signature there.

**mode? (partial keys)**
Know the tonic but not the mode yet? Choose "mode?" and Store writes "key: B♭?" — recorded, listed under KEY in ☰ Notes, but NOT applied: no signature, no respelling, until you return with the mode. The dropdown label always says which state the song is in.

## Files & Sync

**File**
Everything file-shaped lives here now. Open… (the song picker — albums, drafts; the current song's title shows above the track chips), New song (name/tempo/meter dialog → blank 3-voice NES composition), Save (commits .mid + .rollnotes to albums/compositions/nightroll/ — chip captures are locked and refuse Save), Save As (forks ANY song, including a locked capture, into nightroll/ with its annotations inherited — write a counter-line over Town), Settings… (GitHub token + the Data locations that tell Night Roll where songs, analysis, and NSFs live), Rename… (works on everything: an uncommitted draft renames its actual file; a committed/repo song keeps its filename — analysis docs and the capture pipeline reference it — and gets a display-title override written to its album.json and the manifest, so the new name shows everywhere), Import… (multi-select capable; byte-sniffs each pick: MIDI files — .mid, .midi, .smf, .kar, even RIFF-wrapped .rmi — ask where they belong: **Keep local** (this-device draft, annotations never sync) or **Create album** — one or many MIDIs become an album folder under drafts, audition/rename/✕ like NSF captures, and ⇪ Commit publishes them to the songs repo so annotations sync everywhere (note: commit rewrites the .mid as notes+tempo+meter — foreign CCs/programs are not preserved); an NSF chip-music file opens the capture panel: every track runs through the same 6502/APU pipeline that dumped the FF1 album — loop detected and trimmed, tempo grid-fitted, hardware loop point recorded as a loop: annotation; the capture window auto-doubles (75 → 150 → 300s) when no loop fits, since the detector needs the intro plus two full passes — and lands as a LOCAL draft under an Import album; names load automatically from the rip's .m3u playlist when you pick it with the NSF (or pick the .m3u alone afterward — even already-captured drafts rename in place); otherwise audition each capture and type its real name right in the panel row — "Dr. Wily's Castle" replaces "track-15" instantly, punctuation preserved through to the song picker; Chip audio is automatic — whenever the app can reach a song's NSF (live import session, this device's cache, or the public archive), it renders the captured register log through the NES 2A03's actual sound hardware (duty sequencers, envelopes, noise LFSR — the console's own voice, not our oscillator approximation) and ▶ plays that; there's no button and nothing to enable. Mute/solo stay live per track, the speed slider acts tape-style, and picking an explicit instrument in a track's voice menu overrides the chip for that track (auto = chip); in Open → drafts each import album is its own FOLDER (tap in for its tracks: ⇪ on a track commits just that song to its album, "⇪ Commit album" pushes the whole folder, ✕ tap-twice discards a dud, and the ✕ on the folder row itself discards the entire album's drafts at once; re-capturing a track — or re-importing the whole NSF, maybe with a longer capture window — simply overwrites the old drafts; File → Commit import still pushes every import draft across all folders at once); expansion-chip audio like VRC6 is not captured), Download .mid (exports any song, works in Logic). Compositions auto-draft to this device on every edit — find them under "Night Roll drafts" in the song picker, where a ✕ (tap twice) deletes a draft from this device; Save is what puts them in the repo, and it updates the dropdown's catalog automatically. Imported MIDI files land there too (prefixed "local /") — they persist on this device and stay editable, but never sync to the repo; Save As forks one into a real composition. Move to… relocates a composition between Night Roll Sketches and My Compositions (files + catalog together). A ＋ track chip appears in the track bar on compositions — and a **＋ drums** chip adds a GM drum kit track: its the kit gets its own LANE just below the pitch rows — kick nearest the bass (you write them together), then snare, toms, hats, cymbals, each on a labeled row of its own, so drums never sit on top of your bass. Delete any track from its voice & color menu (tap the selected chip again → ✕ Delete track, tap twice), penciled like any notes, played with the built-in kit, and exported on MIDI channel 10 so Logic reads them as drums.

**Data locations**
Night Roll is configured with WHERE its data lives (Sync → "Data locations ▾"): three rows — songs (.mid, album.json, catalog), analysis (.rollnotes + docs), and NSF (chip-audio source) — each with a read base URL (blank = this site; or any raw.githubusercontent.com/<owner>/<repo>/<branch> or local server) and an owner/repo write target. One fine-grained token, granted to every repo you write to, covers all commits; write errors name the repo they hit, and a 404 usually means the token hasn't been granted that repo. This is what lets another analyst point their own analysis repo at a shared songs corpus. Defaults: everything in this site's repo, NSFs from the public nsf-archive.

**⚠ Messages**
Errors outlive the moment: anything warning-shaped (failed commits, unreachable NSFs, token-scope problems, even uncaught crashes) is kept in a log, and a ⚠ button appears in the footer only when the log is non-empty — tap it to read timestamped entries, Clear to dismiss. The bottom info strip still shows the latest message; this panel is where the ones you missed went.

**Song links**
The address bar always holds a link to the open song — copy it and anyone who opens it lands directly on that song (?song=…). Local drafts are excluded (they exist only on your device).

**Sync**
Commit your annotations, sections, and keys to GitHub (needs your token, one-time), or Copy/Download the file. "Commit all changed" pushes every song you touched this session, not just the open one — the Sync button shows how many are waiting. "Unsynced" = still only on this device. Repo ↗ opens the GitHub repository in a new tab. ⎘ Web session copies the bootstrap-instructions URL — paste it into a fresh Claude Web chat and it has everything it needs to run an analysis session (process rules, file locations, session shape, handoff format).
