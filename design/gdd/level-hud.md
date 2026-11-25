# Level HUD

> **Status**: Approved (2026-11-22, lean /design-review; see its review log)
> **Author**: user + Claude
> **Last Updated**: 2026-11-22
> **Last Verified**: 2026-11-22
> **Creative Director Review (CD-GDD-ALIGN)**: skipped — Lean mode
> **Implements Pillar**: 2. A tug-of-war you read at a glance (`design/gdd/game-concept.md` § Pillars)

## Summary

Level HUD is everything the player sees during a match: the table layer (keeps with troop plaques and rope-slot dots, rune ropes in their states, marching pawns, the drag preview, ring, refusal cross and swipe trail, and the small effects the owning GDDs specify) and a screen layer of one top band (level title, three-segment strength bar, Pause button) and one bottom strip (one message line by priority). It is read-only: every value it shows belongs to another system, and it raises only `pause_pressed`. It exists so a level reads in one glance on a phone in portrait.

> **Quick reference** — Layer: `Presentation` · Priority: `MVP` (UAT-1) · Key deps: `Keep Levels, Rope Links, Troop Generation, Troop Marching & Clashes, Level State & Match Flow, Touch & Mouse Input, Campaign Level Data, Screen Flow & Scene Manager`

## Overview

Level HUD is everything the player sees during a match. It has two layers. The **table layer** draws the world from the data the gameplay systems publish each frame: keeps with their plaques (troop count and rope-slot dots), the rune ropes in their states, the marching pawns, the drag preview and target ring, the swipe trail, and the small effects the owning GDDs specify (a beat pop, a level-rise flourish, a clash puff, a capture burst). The **screen layer** sits in a thin band at the top and a strip at the bottom: the level title, the three-segment strength bar, the Pause button, and one message line that carries rope refusals, the first-rope hint and, later, tutorial prompts. The HUD owns no gameplay state and changes nothing; it is read-only, and every number it shows is someone else's. Its one design rule is Pillar 2: a level must read in one glance on a phone in portrait, so nothing is drawn that the player does not need to read the tug-of-war, and nothing but plaques sits over the table. Without it the match would be invisible.

## Detailed Design

### Core Rules

1. **Read-only.** The HUD reads published state every frame and raises no gameplay event. Its only outputs are the Pause button (routed to Screen Flow as `pause_pressed`) and, for tools, nothing. A frame with no data change draws the same picture.
2. **Two layers, two coordinate spaces.** The **table layer** is in table pixels (720 × 1,280 logical, Touch & Mouse Input's frame) and scales with the table. The **screen layer** is anchored to the display's safe area: a top band of at most `hud_top_px` (100) and a bottom strip of at most `hud_bottom_px` (60). Nothing in the screen layer is ever drawn over a keep's touch circle (invariant H1, Formulas).
3. **The plaque** (every keep, owned or neutral) is a flat Ink tag at about 85% opacity with clipped corners (art bible §3 UI shape grammar), centred `plaque_offset_px` (36) below the keep's base, height and width from F3 (at least `plaque_min_height_px`, 30, tall). It shows the keep's `troops` (Troop Generation) in Info White, bold, `plaque_font_px` (23; the accessibility GDD may raise it). The tag's edge carries the owner's colour as data (royal blue and gold, crimson and black, neutral grey); nothing else on the tag is coloured.
4. **Slot dots** sit in a row `slot_row_offset_px` (26) below the plaque centre on owned keeps only: `max_ropes[level]` dots (Keep Levels), `slot_spacing_px` (16) apart, drawn as small gold runes, filled for each rope the keep holds that is Active or Extending (Rope Links), hollow for each free slot. Neutral keeps show none. The rival's keeps show theirs (the player's decision, Rope Links UI): the player may read the rival's spare capacity.
5. **Plaque moments**, each from an owning GDD's event: a **beat pop** (the number scales up and back over `pop_time`, 0.25 s) on Troop Generation's "keep gained troops"; a **cap glint** (a short highlight sweep across the tag every `glint_period`, 2.5 s, never steady, within the art bible's 25% glow budget) while `troops = troop_cap`; a **level-rise flourish**: the new hollow dot appears on the same step as `level_rose`, with float text "Level L · N ropes" rising `float_rise_px` (30) and fading over `float_time` (1.6 s). A level drop shows no text (Keep Levels Visual/Audio); the lost dot and the storey crumble are enough.
6. **Ropes** are drawn from Rope Links' per-rope state: **Extending** grows from the origin pin to the target over `rope_extend_time`; **Active** is a taut line of runes in the owner's colour with a send pulse every `send_interval`; **Fading** sags and fades over `rope_fade_time` from the cut point. Each rope is drawn on its lane (`rope_lane` offset to its right); the player's rope is always on its own right (Rope Links F4). Pins at both keeps take the owner colour. Rival ropes are drawn identically but are never hit-testable (Input decides; the HUD only draws).
7. **Pawns** are drawn from Troop Marching's `pawns()` each frame: a small pixel figure in owner colours at its position on its lane, facing its target, bobbing out of phase, depth-sorted with the keeps. A fallen pawn fades over `pawn_fade_time`. The clash puff and sparks, the capture flag burst and the arrival flash are drawn as the owning GDDs' Visual/Audio sections specify; Feedback & Juice (after UAT-1) elaborates them without changing what triggers them.
8. **Input feedback**, from Touch & Mouse Input's drag data and Rope Links' legality: each element is drawn on the next rendered frame after its source publishes it, in every match state where table input is accepted (Armed included: Input and the hit-test provider run every frame, only match steps stop). The legality of the previewed tie (the refusal cross) is Rope Links' `tie_legal` for the resolved target, not Input's. The **preview rope** from the origin keep to the resolved target (or the finger), snapping to the target; no preview rope is drawn while Input's `over_origin` is true (Touch & Mouse Input rule 6); the **target ring** on the resolved keep; the **refusal cross** (UI Red, a white-edged X in a parchment ring) over a greyed preview when the tie would be refused; the **swipe trail** behind a cut gesture. All vanish on the next rendered frame after the gesture ends.
9. **The title line**, top-left of the top band: "[Region] [order] · [Level name]" (Campaign Level Data), an Ink tag. No clock during play (decided 2026-11-22; closes Level State Open Question 7): the match time appears on the result overlays only.
10. **The strength bar**, in the top band under the title: three segments, player | neutral | rival, widths by F1 (each side's keep `troops` only; the neutral segment is the neutral garrisons). Pawns in flight are not counted (decided 2026-11-22, cross-GDD review H4): sending is free, so counting them would make more ropes look like more strength and swing the bar on every cut; the pawns are on the table for the player to see. Owner colours as data, neutral grey, an Ink frame, `bar_width_px` (500) by `bar_height_px` (14). "You N" and "Rival N" labels at the bar's ends in the owner's light colour; the neutral segment is unlabelled. It updates every frame with no easing: the glance must be current (decided 2026-11-22: three segments).
11. **The Pause button**, top-right of the top band, raises `pause_pressed` to Screen Flow, which opens the Pause overlay (its rule 6). It is hidden while Level State reports `pause_allowed = false` (Ending). A mute button is reserved beside it for the Audio GDD (after UAT-1) and is not drawn in UAT-1.
12. **The message strip**, bottom centre, shows at most one line at a time, chosen by priority (F2): a rope refusal (Rope Links' four refusal texts; `self` and `blocked` raise no text) for `strip_time` (2.4 s); then Input's once-per-session cursor hint "Right mouse cuts a rope" (Touch & Mouse Input event `hint_shown("cursor")`, its rule 5) for `strip_time`; then Level State's Armed hint "Tie a rope to begin" for as long as the match is Armed; then, from the Tutorial GDD, tutorial prompts; else nothing. A new refusal replaces the current message and restarts `strip_time`. The strip is an Ink tag sized to its text, never wider than the table minus margins, never two lines.
13. **Match states** (Level State): **Armed** draws everything plus the Armed hint; **Running** draws everything; **Ending** keeps drawing the frozen board (plaques, ropes and pawns stop changing because the data stops), clears the strip and hides the Pause button; while **paused** (Screen Flow's overlay) the HUD is drawn beneath the overlay, frozen, untouched. The HUD never knows why the board stopped.
14. **Both sides, one HUD.** The rival's keeps, ropes and pawns are drawn by the same rules with its colours and marks. Owner is never conveyed by colour alone: banners (sun vs crescent), rope beads vs chevrons and helm shapes carry it too (art bible §4 colour-blind table), so the HUD stays readable on greyscale and dim screens.
15. **Data.** Every pixel size, offset, time and width in this section is a data-file value (`plaque_font_px`, `bar_width_px`, `strip_time`, …), so the UX spec and the accessibility GDD tune the HUD without code changes. Text comes from the UAT-1 strings data file (one language; the player's decision, 2026-11-22), never from code. **One rule for every player-facing string** (cross-GDD review B3): the strings data file holds the text; the GDD that defines a message (Rope Links' refusals, Touch & Mouse Input's hint, Level State's Armed hint, World Map's node hint) owns its key, its placeholders and its draft wording; the writer owns the final wording; the HUD and Menus & Screens only draw it. Localization, an after-UAT system, will replace that file with its strings table.

### States and Transitions

The HUD has no state machine of its own; it mirrors Level State's and Screen Flow's.

| Match state (Level State) | Table layer | Top band | Strip | Pause button |
|---|---|---|---|---|
| Loading | Not drawn (Screen Flow's transition cover) | — | — | — |
| Armed | Drawn; nothing moves | Title, bar | Armed hint (unless a refusal is showing) | Shown |
| Running | Drawn, live | Title, bar live | By priority (F2) | Shown |
| Ending | Drawn, frozen (data stops) | Title, bar frozen | Cleared | Hidden (`pause_allowed` false) |
| Closed (overlay up) | Drawn beneath the dim | Beneath | Cleared | Hidden |
| Paused (Screen Flow overlay) | Drawn beneath the dim, frozen | Beneath | Kept as it was | Hidden by the overlay |

The strip's own timer (`strip_time`) counts rendered frames' elapsed time while the game is not paused (Screen Flow's pause state), not match steps (decided 2026-11-22, cross-GDD review B1): a paused game does not expire a message, and a message shown while Armed, when no match step runs, still expires on time.

### Interactions with Other Systems

| System | Direction | What flows | Owner of the interface |
|---|---|---|---|
| Troop Generation | in | `troops`, `owner` per keep; events "keep gained troops" (beat pop) and "keep reached cap" (glint) | Troop Generation |
| Keep Levels | in | `level` per keep (storeys, dot count via `max_ropes[level]`); `level_rose` (flourish), `level_dropped` (crumble, no text) | Keep Levels |
| Rope Links | in | Per-rope state (Extending, Active, Fading), end points, lane, owner, age; `tie_legal` for the previewed target (the refusal cross); `tie_refused(reason)` for the strip; `rope_tied`, `rope_cut` for the snap effects | Rope Links |
| Troop Marching & Clashes | in | `pawns()` (position, lane, owner, unit); `pawn_clashed`, `keep_hit`, `keep_reinforced`, `keep_captured` for the effects | Troop Marching |
| Touch & Mouse Input | in | Drag feedback, published every frame (pointer, origin, resolved target or none, and `over_origin`: true only while the pointer is over the origin keep during a drag), the swipe trail, and the event `hint_shown("cursor")` | Touch & Mouse Input |
| Level State & Match Flow | in | State (Armed, Running, Ending, Closed), `pause_allowed`; the Armed hint condition. The clock is not shown | Level State |
| Campaign Level Data | in | Region name, level `order`, level `name` for the title | Campaign Level Data |
| Screen Flow & Scene Manager | out/in | Out: `pause_pressed`. In: the pause state (the HUD is drawn beneath overlays) | Screen Flow (its rules 5, 6) |
| Menus & Screens | none | The overlays are Menus & Screens'; the HUD stops at the overlay's dim | — |
| Feedback & Juice, Audio (after UAT-1) | out | The HUD exposes the same events it draws from, so those systems add particles and sound without new triggers | Those GDDs |
| Tutorial & Onboarding (after UAT) | in | Tutorial prompts for the strip (F2's lowest priority) and highlight requests on a keep or rope | Tutorial |
| Accessibility (Alpha) | in | Overrides for `plaque_font_px`, bar height, high-contrast mode | Accessibility |
| Strings data file (UAT-1); Localization (after UAT) | in | The strip texts and labels | The data file; Localization when it exists |

## Formulas

### F1. Strength bar segments

The strength_bar formula is defined as:

```
S_player  = Σ troops over player keeps
S_rival   = Σ troops over rival keeps
S_neutral = Σ troops over neutral keeps
total     = S_player + S_neutral + S_rival
raw(side)  = bar_width_px × S_side / total
w_player   = 0 if S_player = 0, else max(1, round_half_up(raw(player)))
w_rival    = 0 if S_rival = 0,  else max(1, round_half_up(raw(rival)))
w_neutral  = bar_width_px − w_player − w_rival
(if total = 0: 167 / 166 / 167 px, all grey)
```

Widths are whole pixels and always sum to `bar_width_px`. If `S_neutral` = 0, `w_rival` is instead `bar_width_px − w_player`, so the remainder never goes negative. If `S_neutral` > 0 and `w_neutral` would be below 1, it is set to 1 and the pixel is taken from the wider of the two other segments.

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| troops | int | 0–`troop_cap` (60) per keep | calculated (Troop Generation) | Current garrison; pawns in flight are not counted (rule 10) |
| bar_width_px | int, px | 300–660 (500) | data file | Bar length in table pixels |

**Output Range:** three widths summing to `bar_width_px`; a side at 0 has width 0 and its label reads "0". `total` is 0 only when every keep holds 0 troops, which Campaign Level Data B1 allows at start but warns on; the equal-thirds fallback keeps the bar drawn. The labels show `S_player` and `S_rival` as integers.
**Example:** gv-01 at start: player 10, neutrals 36, rival 10 → raw 89.3 / 321.4 / 89.3 → widths 89 / 322 / 89 px of 500 (neutral takes the remainder); labels "You 10", "Rival 10". Player 1, neutral 2,000, rival 1 → raw 0.25 each side → 1 / 498 / 1 px.

### F2. Message strip priority

The strip_message formula is defined as:

`message = first non-empty of [ refusal (while strip_timer > 0), cursor_hint (once per session, while its timer > 0), armed_hint (while state = Armed), tutorial_prompt (Tutorial GDD), none ]`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| strip_time | float, s | 1–5 (2.4) | data file | How long a refusal or hint stays, counted in unpaused rendered time (States and Transitions), in every match state including Armed |
| refusal | string or none | one of Rope Links' four texts (`slots`, `reverse`, `duplicate`, `not_yours`; `self` and `blocked` raise no text) | calculated (`tie_refused`) | Set on the event; a new one restarts `strip_timer` |
| cursor_hint | string or none | "Right mouse cuts a rope" | calculated (Touch & Mouse Input `hint_shown("cursor")`, raised at most once per session) | Set on the event for `strip_time`; a refusal replaces it |

**Output Range:** zero or one line. A refusal always wins; the Armed hint cannot be hidden by anything but a refusal or the cursor hint, and returns when they expire. `strip_time` under 1 s cannot be read on a phone; the range floor is 1.
**Example:** Armed level, the player's first drag is refused with `self` (no text): the strip keeps "Tie a rope to begin". A `slots` refusal on a Running level shows "Level 1 keep: only 1 rope. Grow it or cut one." for 2.4 s, then nothing.

### F3. Plaque width

The plaque_width formula is defined as:

```
digit_width_px   = round_half_up(plaque_font_px × digit_aspect)
plaque_width_px  = plaque_pad_px + digit_width_px × digits(troops)
plaque_height_px = max(plaque_min_height_px, plaque_font_px + 7)
```

**Variables:** `plaque_min_height_px` (30), `plaque_pad_px` (30), `plaque_font_px` (23; 16–40), `digit_aspect` (0.48: the plaque font's digit advance divided by its size, set from the chosen font; 0.4–0.7), `digits(troops)` (1–2 at UAT-1; `troop_cap` 60 has two digits). All data file; the digit width follows the font size, so raising `plaque_font_px` never overflows the tag.
**Output Range:** at baseline the digit is round(11.04) = 11 px, the plaque 41–52 px wide and 30 px tall; at `plaque_font_px` 30 the digit is 14 px, the plaque 44–58 px wide and 37 px tall; a keep sprite plus a 30 px plaque fits the 156 px circle around the keep's base (`keep_hit_radius`; art bible §3), so the plaque never masks a neighbour (Campaign Level Data I2 spacing ≥ 156 px).

### Invariant H1. Screen layer clear of the table

`hud_top_px + keep_hit_radius + keep_hit_lift ≤ min(keep.y) over the level` and `1,280 − hud_bottom_px − keep_hit_radius ≥ max(keep.y)`: no keep's touch circle (centred keep_hit_lift above the keep, Touch & Mouse Input F1) lies under the top band, and no keep's base circle (plaque and slot dots) under the bottom strip. Green Vale: max y 1,110 ≤ 1,280 − 60 − 78 = 1,142 on every level; min y needs ≥ 100 + 78 + 35 = 213, met on gv-01 and gv-02, not on gv-03 (210), gv-04 (200), gv-05 (190), where the loader warns (Campaign Level Data B6) and a shipped build shrinks the top band (97, 87, 77 px), never the table.

### Timings (data)

| Value | Baseline | Range | Effect |
|---|---|---|---|
| pop_time | 0.25 s | 0.1–0.5 | Beat pop length |
| glint_period | 2.5 s | 1.5–5 | Cap glint sweep interval (art bible: never steady) |
| float_time | 1.6 s | 1–3 | Level-rise float text life |
| strip_time | 2.4 s | 1–5 | Message strip hold |

### Boundary check

Worked at the extremes (lens: systems-designer): F1 at `total` 0 falls back to thirds rather than dividing by zero; a side holding every keep at `troop_cap` makes its segment dominate and the neutral band vanish, which is the correct reading; cutting or tying a rope never moves the bar by itself, only troops arriving or leaving keeps do; F3 at three digits (a future `troop_cap` above 99) widens to 63 px, still inside 156; F2 can never show two lines. No feedback loop: the HUD draws and raises only `pause_pressed`.

## Edge Cases

- **If two plaque moments fire on one keep in one step** (a beat pop and a level rise): both play; the float text rises above the pop. If a capture lands on the same step, the capture burst wins the keep's effect slot and the pop is dropped: the owner changed, the number is the new owner's.
- **If a refusal arrives while another refusal is showing**: the new text replaces the old at once and `strip_time` restarts. Two refusals on one step (impossible from one pointer, possible with the rival's calls, which never reach the strip) would show the player's.
- **If the Armed hint and a refusal compete**: the refusal shows for `strip_time`, then the Armed hint returns if the match is still Armed.
- **If `total` in F1 is 0**: the bar draws three grey thirds and both labels read "0" (a legal but warned level).
- **If a side's strength is above 0 but rounds to less than 1 px**: its segment is drawn at a 1 px minimum so a side with one troop left is still visible.
- **If a side holds no keep but still has pawns in flight**: its segment is 0 px and its label reads "0"; its pawns are drawn on the table and may still recapture a keep (Troop Marching rule 2), at which point the bar shows it again.
- **If more than one preview could be drawn** (two pointers on a multi-touch phone): Input publishes one drag at a time (its rule: a second pointer is ignored while one is active), so the HUD draws one preview. The swipe trail follows the single active pointer.
- **If a keep's plaque would overlap another keep's plaque**: Campaign Level Data's I2 (≥ 156 px spacing) makes this impossible at baseline; at a raised `plaque_font_px` the UX spec (`/ux-design level-hud`) re-checks plaque overlap against F3 for every Green Vale level; no loader bound checks it, since plaque size is a HUD setting, not level data.
- **If a keep's touch circle lies under the top band or bottom strip** (H1 breach): the loader warns in development; a shipped build shrinks that band on that level (`hud_top_px` to `min(keep.y) − keep_hit_radius − keep_hit_lift`, or the bottom strip to `1,280 − max(keep.y) − keep_hit_radius`), never moves a keep.
- **If the title text is too long for the tag** (a long level name or a long locale): the tag grows to `title_max_px` (420) and then the text is scaled down; it never wraps or overlaps the bar.
- **If the strip text is too long** (a long string, or later a locale that expands): the tag grows to the table width minus margins; then the text scales down to a floor of `strip_min_font_px` (16); never two lines. UAT-1 has one language in its strings data file; when Localization arrives after UAT, its string-freeze check flags any text that would hit the floor.
- **If the display aspect is not 9:16**: the table is letterboxed or pillarboxed (Touch & Mouse Input's scaling); the screen layer anchors to the display's safe area, so on a taller phone the top band and strip sit in the extra space and H1 is trivially met.
- **If a notch or system bar covers the top band's area**: the band anchors below the safe-area inset; the table does not move. Mobile Platform Integration (after UAT-1) owns the inset values; UAT-1 tests on a phone without a notch or accepts the overlap as a known defect.
- **If Level State is Ending but the strip has a refusal with time left**: the strip clears at once (rule 13); the result is more important than a stale refusal.
- **If the rival's rope and the player's rope share a keep pair**: both are drawn on their own lanes (Rope Links F4), 16 px apart; the player's is always on its own right, so the two never overlap and the clash point sits visibly between them.
- **If pawn count is high** (the 600 backstop): every pawn is still drawn; the budget is Troop Marching AC-M43's (600 pawns on 30 ropes within 0.5 ms per step) plus the HUD's own draw cost, measured in Technical Setup's phone test. No culling rule is designed here; one is added only if the phone test fails.

## Dependencies

| System | Nature | Direction | What this GDD needs or gives | GDD status |
|---|---|---|---|---|
| Troop Generation | Hard | in | `troops`, `owner`; beat and cap events | In Review |
| Keep Levels | Hard | in | `level`, `max_ropes`; `level_rose`, `level_dropped` | In Review |
| Rope Links | Hard | in | Rope states, ends, lanes, ages; `tie_legal` (preview legality); `tie_refused`; tie and cut events | In Review |
| Troop Marching & Clashes | Hard | in | `pawns()`; clash, hit, reinforce, capture events; `pawn_fade_time` | In Review |
| Touch & Mouse Input | Hard | in | Drag feedback and swipe trail; `hint_shown("cursor")` | In Review |
| Level State & Match Flow | Hard | in | State, `pause_allowed`, the Armed condition | In Review |
| Campaign Level Data | Soft | in | Region name, level order and name; its B6 checks H1 | In Review |
| Screen Flow & Scene Manager | Hard | out/in | `pause_pressed` out; pause state in | In Review |
| **Depended on by** | | | | |
| Feedback & Juice, Audio (after UAT-1) | Soft | out | The HUD's event hooks and effect slots | Not yet designed |
| Tutorial & Onboarding (after UAT) | Hard | out | Strip prompts and highlight requests | Not yet designed |
| Accessibility (Alpha) | Hard | out | Size and contrast overrides | Not yet designed |
| Strings data file (UAT-1); Localization (after UAT) | Soft | in | Strip texts and labels; length limits once Localization exists | Data file in UAT-1; Localization not started |

**Bidirectional check** (re-verified 2026-11-22, cross-GDD review round 2). Troop Generation, Keep Levels, Rope Links, Troop Marching, Touch & Mouse Input, Level State, Campaign Level Data and Screen Flow (which names the HUD's Pause button as a source of `pause_pressed`) all name the Level HUD.

## Visual/Audio Requirements

*Art-director row applied (lens-specialists), from art bible §1–4; the HUD is the table register.*

**Principles that govern the HUD** (art bible §1, §3, §4):
- **Colour belongs to whoever owns it** (Principle 1): the HUD is Ink and Info White; owner colour appears only as data — the plaque edge, the slot runes, the bar segments, the rope and pawn colours. Neutral is grey. Crimson never frames anything.
- **Silhouette first, face second** (Principle 2): keeps lead (tallest, outlined), ropes second (continuous lines), pawns support (one stream), terrain falls back (§3 hero and supporting shapes). The HUD draws in that depth order and never puts a tag on a keep's body.
- **Splash art is the payoff** (Principle 3): nothing on the table is splash; the Win overlay's amber dim is where the register changes (Menus & Screens).
- **UI shape grammar** (§3): Table HUD tags are flat with clipped corners and no ornament; only UI has clipped corners, so a tag never reads as a figure. Slot dots are small runes, not circles.
- **Glow budget** (§2): the send pulse along a rope and the cap glint are the only rhythmic glows, each at most 25% brighter than its base, the glint a short sweep every `glint_period` and never steady. Plaques themselves never glow.
- **Colour-blind marks** (§4): the player's rope has round beads on a solid line, the rival's barbed chevrons on a dashed line; banners sun vs crescent; the refusal cross is UI Red (25° warmer than crimson) as a white-edged X in a parchment ring over a greyed preview. The HUD must stay readable in greyscale (AC18).

**Visual feedback per event:**

| Event (owner) | HUD draws |
|---|---|
| Beat (Troop Generation) | Number pops over `pop_time`; the beat is never suppressed by combat effects (Troop Generation Game Feel) |
| Cap reached (Troop Generation) | Glint sweep across the tag every `glint_period` while full |
| Level rose (Keep Levels) | New hollow dot on the same step; float text "Level L · N ropes" rising `float_rise_px`, fading over `float_time`; the storey grows (Keep Levels' art) |
| Level dropped (Keep Levels) | Dot removed; crumble about 0.3 s; no text |
| Rope tied / extending / active (Rope Links) | Rune rope grows over `rope_extend_time`; then a send pulse every `send_interval`; pins in owner colour |
| Rope cut (any reason) | Both halves sag and fade over `rope_fade_time` from the cut point with a brief rune scatter; one snap sign for every cause (Rope Links Visual/Audio) |
| Pawn marching / fallen (Troop Marching) | Figure on its lane, bobbing; fallen fades over `pawn_fade_time` with a dust puff and gold sparks |
| Keep hit / reinforced / captured (Troop Marching) | Brief flash on the plaque edge; on capture a flag burst in the new owner's colour and the plaque recolours on that step |
| Drag, resolved target, refusal, swipe (Input) | Preview rope, target ring, refusal cross, swipe trail |
| Refusal text (Rope Links), hints (Input, Level State) | The strip |

**Audio** (Audio GDD, after UAT-1; listed so the hooks exist): the HUD plays nothing itself. The tie chime, cut snip, refusal "no", level-up chord, capture fanfare and the march thud belong to their owning GDDs and the Audio GDD; the Pause button gets a UI tick.

**Animation and style constraints:** pixel art at the table's logical resolution, no sub-pixel positions for sprites (ropes and the preview may be vector lines); plaque text in the UI font at integer sizes; the top band and strip are screen-space and may use the frame's parchment-free Table HUD style only. A keep sprite plus its plaque fits the 156 px circle around the keep's base (`keep_hit_radius`; §3).

📌 **Asset Spec** — Visual/Audio requirements are defined. After the art bible is approved, run `/asset-spec system:level-hud` for the plaque tag, slot runes, bar frame, strip tag, Pause icon, refusal cross and preview ring.

## Game Feel

- **One glance.** Pillar 2's test: a rule, effect or number that makes the table harder to read in one glance is cut or moved off the table. The HUD's whole table layer is plaques (needed), ropes and pawns (the game) and the preview (the verb); everything else is in the two bands. The playtest check: a first-time tester, shown a frozen mid-level screenshot for two seconds, can say who is winning and which keep is in danger (AC19).
- **Current, never late.** Plaques and the bar update on the frame the data changes; no easing on numbers. A troop count that lags a capture by half a second reads as a bug.
- **Feedback for every action, in place.** A tie draws from the finger; a refusal shows its cross where the finger is and its reason in the strip; a cut leaves a trail and a snap. The player never has to look away from the keep they are acting on to learn what happened.
- **Owner at a glance, not by colour alone.** Beads vs chevrons, sun vs crescent, round vs spiked helms: the greyscale test is a release criterion, not a nice-to-have.
- **Reference feel:** Galcon's number-on-every-planet readability and Mushroom Wars 2's one-bar "who is winning", on a phone in portrait.

## UI Requirements

The HUD is itself the UI of the Level screen. Elements and their owners of content:

| Element | Where | Content from | Notes |
|---|---|---|---|
| Plaque | Under every keep (table layer) | Troop Generation, Keep Levels, Rope Links | Count, slot dots, owner edge |
| Title line | Top band, left | Campaign Level Data | "[Region] [order] · [Name]"; no clock |
| Strength bar | Top band, under the title | Troop Generation | Three segments, two labels; keep troops only |
| Pause button | Top band, right | Screen Flow | Hidden in Ending; a mute slot reserved beside it |
| Message strip | Bottom strip, centre | Rope Links, Input, Level State, Tutorial | One line, priority F2 |
| Preview, ring, cross, trail | Table layer | Touch & Mouse Input | Transient |

Touch targets: the Pause button meets Touch & Mouse Input's I1 minimum (about 9 mm); nothing else in the HUD is tappable (the table's keeps and ropes are Input's hit-test, not the HUD's). All text comes from the UAT-1 strings data file, laid out with room for 30% expansion so Localization (after UAT) needs no layout change.

> **📌 UX Flag — Level HUD**: this system has UI requirements. In Phase 4 (Pre-Production), run `/ux-design level-hud` to create its UX spec (layout, sizes, states, accessibility floor) before writing epics. Stories that reference the HUD should cite `design/ux/level-hud.md`, not this GDD directly. This single spec also closes the UX flags Troop Generation, Keep Levels, Rope Links, Troop Marching & Clashes and Touch & Mouse Input raised for their HUD elements. Note this in the systems index for this system.

## Cross-References

| This GDD relies on | In | What it relies on |
|---|---|---|
| Troop Generation | Rules 1, 4, 6; UI Requirements; AC24 | `troops`, cap, beat event; plaque font 23 px; the strength bar sums |
| Keep Levels | Rules 9, 11; Visual/Audio; UI; AC20 | `level_rose` / `level_dropped`; slot dots; float text; no text on a drop |
| Rope Links | Rules 4, 7, 13; F4; Visual/Audio; UI; AC29 | Rope states and lanes; refusal texts; the one snap sign; rival ropes visible |
| Troop Marching & Clashes | Visual/Audio; AC-M43 | `pawns()`; pawn and clash drawing; the pawn budget |
| Touch & Mouse Input | Rule 6; Visual/Audio; UI; I1 | Drag feedback, trail; the preview states; touch minimum |
| Level State & Match Flow | Rules 2, 10; Interactions; Open Question 7 | Armed hint, `pause_allowed`; no clock (closed here) |
| Campaign Level Data | Rule 2; Content | Names and order |
| Screen Flow & Scene Manager | Rules 5, 6 | Overlays freeze the screen; `pause_pressed` |
| design/art/art-bible.md | §1 Principles 1–3, §2 glow budget, §3 UI shape grammar, §4 UI palette and colour-blind table | The HUD's register |

**Edits other documents need as a result of this GDD** (1–5 applied 2026-11-22; H1 is Campaign Level Data's B6):
1. `level-state-match-flow.md`: close Open Question 7 (no clock during play; time on the result overlays only).
2. `screen-flow-scene-manager.md`: note that the Level HUD's Pause button is a source of `pause_pressed` beside Input's P key.
3. `systems-index.md`: row 12 → Designed with the GDD link and the UX flag; add Troop Generation, Troop Marching & Clashes, Campaign Level Data (soft) and Screen Flow to Depends On.
4. `campaign-level-data.md`: add invariant H1 (no keep's touch circle under the HUD bands) as its warning B6.
5. `design/registry/entities.yaml`: register `strength_bar` and `strip_message` (formulas) and `plaque_font_px` 23, `hud_top_px` 100, `hud_bottom_px` 60, `strip_time` 2.4 (constants; the accessibility and tutorial GDDs will cite them).

## Acceptance Criteria

Baseline data: table 720 × 1,280; `plaque_font_px` 23; `bar_width_px` 500; `strip_time` 2.4 s; `pop_time` 0.25 s; `float_time` 1.6 s; `glint_period` 2.5 s; `hud_top_px` 100; `hud_bottom_px` 60; `keep_hit_radius` 78. Tags: **[Logic]** automated test in `tests/unit/` against the HUD's view model (the values it would draw), **[Integration: X]** in `tests/integration/`, **[UI]** retained screenshot in `production/qa/evidence/`, **[Playtest]** observed in UAT. `qa-lead` lens applied: every rule and formula has a criterion; boundaries are AC2, AC6, AC9.

- **AC1 [Logic] (F1)**: GIVEN gv-01 at start (player 10, neutrals 36, rival 10), THEN the bar widths are 89, 322 and 89 px (±1) and the labels read "You 10" and "Rival 10"; GIVEN 4 player pawns of strength 1 in flight, THEN `S_player` is still 10; GIVEN the player then cuts every rope, THEN the bar does not change on that step.
- **AC2 [Logic] (F1 boundary)**: GIVEN every keep at 0 troops, THEN three equal grey segments and both labels "0"; GIVEN the rival at 1 troop against a player at 599, THEN the rival segment is at least 1 px wide.
- **AC3 [Logic] (F2)**: GIVEN an Armed level, THEN the strip reads "Tie a rope to begin"; WHEN the first drag is refused with `self`, THEN the strip still reads the Armed hint. GIVEN a Running level where a level 1 keep holds 1 rope, WHEN a `slots` refusal arrives, THEN the strip reads "Level 1 keep: only 1 rope. Grow it or cut one." for 2.4 s and then is empty; WHEN a second refusal arrives after 1 s, THEN the new text shows and the timer restarts.
- **AC4 [Logic] (F2, pause)**: GIVEN a refusal showing with 1.0 s left, WHEN the game is paused for 10 s and resumed, THEN the refusal still shows for 1.0 s.
- **AC4b [Logic] (rule 12, `blocked`)**: GIVEN Rope Links refuses a tie with `blocked` (possible only from a direct call; Input redirects a player drag to the nearer keep), THEN the strip shows no text and keeps its current message.
- **AC5 [Logic] (F3, rule 3)**: GIVEN a keep with 7 troops, THEN the plaque is 41 px wide and 30 px tall; GIVEN 60, THEN 52 px wide; GIVEN `plaque_font_px` raised to 30 in the data file, THEN with no code change the digit width is 14 px and the plaque for 60 troops is 58 px wide and 37 px tall, with the number drawn at 30 px inside it.
- **AC6 [Logic] (rule 4 boundary)**: GIVEN a neutral keep, THEN no slot dots; GIVEN a player keep at level 3 holding 2 ropes (one Extending), THEN three dots, two filled; GIVEN a rival keep at level 2 holding 0, THEN two hollow dots.
- **AC7 [Logic] (rule 5)**: GIVEN `level_rose(k, 1, 2)` on step S, THEN on S the plaque shows two dots and the float text "Level 2 · 2 ropes" starts; GIVEN `level_dropped`, THEN no float text.
- **AC8 [Logic] (rule 5)**: GIVEN a keep at `troop_cap`, THEN a glint sweep starts every 150 steps and lasts under 150 steps; GIVEN 59 troops, THEN none.
- **AC9 [Logic] (H1 boundary)**: GIVEN the five Green Vale levels, THEN H1 holds on gv-01 and gv-02 and warns on gv-03, gv-04 and gv-05, whose shipped top bands are 97, 87 and 77 px; max y 1,110 ≤ 1,142 on all five; GIVEN a level with a keep at y 150, THEN the loader warns and the shipped band shrinks to 37 px on that level.
- **AC10 [Logic] (rule 13)**: GIVEN Level State enters Ending with a refusal showing, THEN the strip is empty on that step and the Pause button is hidden; GIVEN the match resumes from Pause, THEN the button is shown again.
- **AC11 [Integration: Rope Links] (rule 6)**: GIVEN a rope tied at step 0, THEN the drawn rope reaches the target at step 12 (`rope_extend_time` 0.2 s), pulses every 36 steps, and after a cut at step 1,200 is gone from the draw list at step 1,254 (`rope_fade_time` 0.9 s).
- **AC12 [Integration: Touch & Mouse Input] (rule 8)**: GIVEN a drag from a player keep resolved to a neutral, THEN the preview and the target ring are drawn on the next rendered frame after Input publishes the drag, on a Running and on an Armed level alike; GIVEN Rope Links' `tie_legal` refuses the target, THEN the preview is greyed and the UI-Red cross is drawn; GIVEN the gesture ends, THEN both vanish on the next rendered frame; GIVEN a drag that returns over its origin keep (Input's `over_origin` true), THEN no preview rope is drawn, and when the pointer leaves the origin over empty space the rope is drawn to the finger again.
- **AC13 [Integration: Troop Marching & Clashes] (rule 7)**: GIVEN `pawns()` returns 300 pawns, THEN 300 figures are drawn on their lanes, and a pawn that fell at step S is drawn fading until step S + 54 and not after.
- **AC14 [Integration: Screen Flow] (rule 11)**: GIVEN Running, WHEN the Pause button is tapped, THEN Screen Flow receives `pause_pressed` and the Pause overlay opens with the HUD frozen beneath its dim.
- **AC15 [Integration: Campaign Level Data] (rule 9)**: GIVEN gv-03 is built, THEN the title reads "Green Vale 3 · Crossroads" and no clock is drawn anywhere on the Level screen.
- **AC16 [Integration: Troop Generation] (rule 5)**: GIVEN a beat adds 2 troops to a keep under attack losing 1 per second, THEN the pop plays on the beat step regardless of the hit flashes (Troop Generation AC24).
- **AC17 [UI] (rules 2–12)**: retained screenshots on the minimum phone in portrait of gv-01 Armed (hint showing), gv-03 mid-match (two sides' ropes on lanes, pawns, a full keep glinting, the bar moved), a refusal moment (cross and strip), and Ending (frozen board, empty strip, no Pause button). Every plaque number is legible at arm's length (tester-confirmed).
- **AC18 [UI] (rule 14)**: the mid-match screenshot converted to greyscale still lets a tester name the owner of every keep, rope and pawn from shape alone.
- **AC19 [Playtest] (Game Feel)**: 5 first-time UAT testers each see a frozen mid-level screenshot for two seconds and are asked who is winning and which keep is in most danger; 4 of 5 correct on both passes.
- **AC20 [Logic] (rule 15)**: GIVEN `strip_time`, `bar_width_px` and `hud_top_px` changed in the data file, THEN the HUD uses the new values with no code change; GIVEN a strip string changed in the UAT-1 strings data file, THEN the new text shows.
- **AC21 [Logic] (F1 rounding)**: GIVEN player 10, neutral 36, rival 10 and nothing marching, THEN the widths are 89 / 322 / 89 px; GIVEN player 1, neutral 2,000, rival 1, THEN 1 / 498 / 1 px; GIVEN player 3, neutral 0, rival 1 (raw 375 / 0 / 125), THEN 375 / 0 / 125 px with the rival taking `bar_width_px − w_player`; in every case the three widths sum to `bar_width_px`.
- **AC22 [Integration: Touch & Mouse Input] (F2, rule 12)**: GIVEN a Running level on a computer, WHEN Input raises `hint_shown("cursor")`, THEN the strip shows "Right mouse cuts a rope" for 2.4 s and then falls to the next priority; WHEN a refusal arrives while the hint shows, THEN the refusal replaces it; GIVEN an Armed level (no match step runs), WHEN the hint event arrives, THEN it shows over the Armed hint and, 2.4 s of unpaused rendered time later with the level still Armed, the Armed hint returns. (No refusal with text can come from player input while Armed, so the cursor hint is the case that proves the timer runs in Armed; an injected `tie_refused` test double may cover a texted refusal.)

**Coverage check.** Rules 1–15 each have a criterion (rule 1's read-only nature is AC14's "only `pause_pressed`" plus the view-model tests never mutating state); F1–F3 and H1 each have a typical and a boundary case (F1 rounding: AC21; F2 cursor hint: AC22); cross-system: AC11–AC16, AC22. Visual and feel criteria carry the required retained-screenshot and playtest forms.

## Open Questions

| # | Question | Owner | Resolve by |
|---|----------|-------|------------|
| 1 | Exact sizes, positions and the safe-area behaviour of the two bands; whether the title and bar share one tag or two | ux-designer (`/ux-design level-hud`) | Pre-Production |
| 2 | Whether a troop count should colour-shift or shake when a keep is under heavy threat (`incoming` high), or whether the hit flash is enough; Pillar 2 says add nothing unless the glance needs it | game-designer, art-director | After UAT-1 playtest (AC19) |
| 3 | Notch and system-bar insets on real phones; UAT-1 accepts overlap as a known defect | Mobile Platform Integration | After UAT-1 |
| 4 | Whether the Armed hint should also show an animated finger from the player's keep (a tutorial element) in UAT-1, or stay text only | Tutorial & Onboarding, ux-designer | Before the UAT-1 build |
| 5 | Pawn draw budget on the minimum phone at 600 pawns; a culling or batching rule only if the test fails | performance-analyst | Technical Setup phone test |
| 6 | Whether the strength bar needs a mid-point marker or "ahead / behind" cue beyond segment widths, and whether keep troops alone (rule 10) read right: AC19 tests it | ux-designer | UX spec |
