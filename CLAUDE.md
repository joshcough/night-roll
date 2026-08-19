# CLAUDE.md — working rules for this repo

Read `open-items.md` at session start (restart context, queues, open
questions). `NIGHT-ROLL.md` is the app's technical reference — read it
before touching the player.

## Shipping checklist — EVERY user-facing feature, no exceptions

1. **Code** + tests green: `npm test` (vm suite) AND `npm run test:e2e`
   (Playwright, chromium + webkit). The e2e stubs WebAudio — a real
   AudioContext stalls ~20s headless.
2. **Help sheet** entry in index.html (#helpsheet, right tab section,
   touch gesture first, keyboard equivalent after).
3. **HELP.md**: `node tools/build_help.mjs` — NEVER hand-edit it.
4. **Drift keyword** in tests/night-roll.test.mjs FEATURES list (must
   appear in the help-sheet region; the suite fails otherwise).
5. **Doc sweep — ask of every change:**
   - `NIGHT-ROLL.md` — new subsystem, convention, or tool? Document it.
   - `WEB-SESSION.md` — does it change what an analysis session should
     read or run? (The query tools were missed here once. Don't repeat.)
   - `README.md` — does it change what the project IS?
   - `glossary.md` — did a new music-theory term come up? Add it
     (encountered vs demonstrated — promote only with evidence).
   - `open-items.md` — new queued work, closed items, design decisions.
6. Browser-verify via claude-in-chrome, commit, push with hash check
   (`git rev-parse HEAD origin/main` must match). Pushes auto-deploy
   Pages; do NOT manually kick builds (collisions email Josh failures) —
   only kick if a build visibly hangs.

## Hard rules

- **Josh's songs are his.** Never edit files under
  albums/compositions/ (or any .mid/.rollnotes) without his explicit
  per-instance approval. Test against scratch compositions or FF1
  songs, never his music.
- **Keys/analyses are Josh's discoveries.** Never pre-fill answers,
  name chords for him, or seed analysis. Tools report facts; findings
  are his. (Query tools in tools/ embody this — use them, extend them
  in the same spirit.)
- **Annotations + the .mid are the only real state.** No feature state
  in localStorage that belongs to the song (lane pins, voices, volumes
  → track:/lane: annotations). Device-local prefs (UI toggles) may use
  localStorage.
- **No native dialogs** (alert/confirm/prompt): they hard-block the
  main thread and all automation. Use appConfirm()/in-app sheets.
- **Ear reports are measurements.** When Josh says something sounds
  wrong, it is a failing test; verified layers only narrow the search.
- **Plain git/grep for verification.** The rtk wrapper mangles
  `git show`, curl pipes, and some greps — use /usr/bin/git and
  /usr/bin/grep when the answer matters.
- One-file app: index.html, no build step. Match its comment style —
  comments explain constraints, not narration.

## Where things are

- Tests: tests/night-roll.test.mjs + tests/nsf.test.mjs (vm harness in
  tests/harness.mjs extracts the inline script); tests/e2e/ (Playwright).
- Query tools: tools/*.mjs (at, span, pitch-census, song-diff,
  annotations, loop-targets) — harness-backed, facts only.
- Pipeline: tools/nsf/ (6502+APU capture), tools/dump_notes.mjs
  (.notes.txt for web sessions — commits also write it in-app).
- Parked branch: `midi-input` (Web MIDI → record; awaiting Josh's test).
