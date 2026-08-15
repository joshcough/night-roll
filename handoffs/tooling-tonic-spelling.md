# Tooling request — tonic dropdown can't express a known spelling

**Status: proposed.** Supersedes/sharpens the existing "key picker dropdown"
item on the handoff list. UI-only. No rollnotes format change required.

## The problem

Josh can know that a tonic is Bb and not A#, but the picker gives him no way
to say so. Every black-key tonic renders as a single fused option — "A#/Bb",
"G#/Ab", "C#/Db", "D#/Eb", "F#/Gb" — so the stored result is `key: A#/Bb?`
even in the many cases where the spelling is not in doubt.

Real instance: `albums/final-fantasy-i/songs/floating-castle.rollnotes`,
committed 2026-08-12 as `key: A#/Bb?` at `[1.1]`. Bb is the derived tonic.
The "A#/" half is noise the UI forced in.

(For that one song the ambiguity is arguably real — it's whole-tone material
and the spelling case is genuinely open. That is *not* the general case, and
is why the fix must keep an "I don't know" option rather than replacing it.)

## Cause

`index.html`, around line 2924:

```js
const TONIC_SPELL = [["C"], ["C#","Db"], ["D"], ["D#","Eb"], ["E"], ["F"],
                     ["F#","Gb"], ["G"], ["G#","Ab"], ["A"], ["A#","Bb"], ["B"]];
function tonicLabel(pc) { return TONIC_SPELL[pc].join("/"); }
```

The `<select id="keysel">` options are built with `o.value = String(pc)` — a
pitch class, never a spelling. Spelling is deferred to `keyNameFor(pc, mode)`,
which picks whichever spelling yields the smaller key signature once a mode
arrives. Two consequences:

1. **Tonic-only state:** `key: ` + `tonicLabel(pc)` + `?` — always fused.
   This is the state Josh hits constantly, since tonic-before-mode is the
   normal mid-derivation position.
2. **Full-key state:** the spelling is auto-chosen by signature size, not by
   Josh. Usually agrees with him, but it is still the machine deciding. Lower
   priority than (1), but the same underlying gap.

## What already works — do not change

The partial-key parser at ~line 927 makes the slash half optional:

```js
const kp = n.text.match(/^key:\s*([A-G][#b]?(?:\/[A-G][#b]?)?)\s*\?\s*$/i);
```

So `key: Bb?`, `key: A#?`, and `key: A#/Bb?` all parse today. Existing files
keep working untouched. This is why the fix is UI-only.

## Proposed fix

For the seven natural pitch classes, nothing changes — one option each.

For the five enharmonic pitch classes, offer **three** options rather than one:

| Option label | Meaning | Stored as |
|---|---|---|
| `A#/Bb` | spelling undetermined | `key: A#/Bb?` |
| `Bb` | Josh asserts flat | `key: Bb?` |
| `A#` | Josh asserts sharp | `key: A#?` |

Keeping the fused option is the point — it preserves the honest "I haven't
decided" state instead of forcing a choice Josh may not want to make yet.

Implementation notes:

- Option `value` must carry the spelling, not just the pc. Suggest
  `value = pc + ":" + spelling` with the fused entry as `pc + ":"`, so
  existing pc-only reads degrade predictably.
- `refreshKeyPreview()` and the store path around lines 2984–3015 build the
  stored text from `tonicLabel(pc)`; both need the chosen spelling threaded
  through instead.
- The editor picker `#nkeysel` clones `#keysel`'s options, so it inherits the
  fix for free — but verify, don't assume.
- Round-trip check: load a file with each of the three forms, confirm the
  dropdown reselects the same option it wrote.
- Confirm `keyNameToSf` is unaffected — it never sees the fused form, only
  full keys with modes.

## Follow-on, separate item

When a mode *is* set, let the asserted spelling win over `keyNameFor`'s
smallest-signature pick, unless the result exceeds six accidentals. Worth
doing only after (1) lands; the two can be reviewed independently.

## Related cleanup, unblocked by this

Several songs store bare `key: F`, `key: D`, `key: G`, `key: C`, `key: Bb`,
`key: Eb` with no mode. It has never been established whether that is
shorthand for major or a symptom of this same picker. Once the picker states
clearly what it wrote, an audit of those six can settle it.

`analysis/key-sweep.md` is also out of date independently of this: it shows
`?` for songs that do have keys in their rollnotes, calls
`underwater-palace` "Undersea Shrine," and predates Floating Castle getting a
tonic. Regenerate it from the rollnotes files.
