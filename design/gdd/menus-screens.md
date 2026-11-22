# Menus & Screens

> **Status**: Designed (pending /design-review in a fresh session)
> **Author**: user + Claude
> **Last Updated**: 2026-11-22
> **Last Verified**: 2026-11-22
> **Creative Director Review (CD-GDD-ALIGN)**: skipped — Lean mode
> **Implements Pillar**: 3. Paint the map, grow the army (`design/gdd/game-concept.md` § Pillars): the Win overlay is where a level's reward is read; the Title and Pause keep the player "at the war table" (art bible §2)

## Summary

Menus & Screens draws every screen and overlay that is not the World Map or the Level: the Title, the Pause overlay, the Win and Lose overlays, the confirmation box, the message box and the transition cover (and, from the Vertical Slice, the Settings frame). It owns their layout, buttons and text, reads the result record and the stored best time to fill the Win and Lose overlays, and enables *Next level* from World Map's `is_unlocked`. It owns no flow (Screen Flow decides every move) and no data. It exists so a win is read as a reward and a loss as "again", in the frame register the art bible sets.

> **Quick reference** — Layer: `Presentation` · Priority: `MVP` (UAT-1) · Key deps: `Screen Flow & Scene Manager, Level State & Match Flow, Save & Progress, World Map & Regions, Campaign Level Data, Touch & Mouse Input`

## Overview

Menus & Screens is the frame around the game: the screens and overlays the player passes through between and around matches. Screen Flow & Scene Manager decides which of them is showing and what every button does; this GDD decides what each one looks like, what it says and how its buttons are laid out. In UAT-1 that is seven things: the Title (splash art, the game's name, Start, the controls for this device), the Pause overlay (Resume, Restart, Quit over the dimmed, frozen table), the Win overlay (the level taken, this attempt's time beside the best, *Next level* and *World Map*), the Lose overlay (a forgiving card with *Retry* as the brightest thing on it), the confirmation box (one box, three texts), the message box (one text, *Continue*) and the transition cover that hides every screen change. All of them use the frame register from the art bible: dark wood, parchment, rune dividers, anime splash where a moment is earned, and primary buttons in royal blue edged with gold because moving forward is the player's own move. Every string comes from the strings table so the writer and localization can change them without code. Without this system the game would have rules and a map but no door.

## Detailed Design

### Core Rules

1. **Scope.** This GDD draws the Title, Pause, Win, Lose, Confirmation, Message box and the transition cover, and from the Vertical Slice the Settings frame (its contents are the Settings GDD's). The World Map screen is World Map & Regions'; the Level screen is Level HUD's; the UAT-2 Collection screens are their own GDD. Screen Flow owns every transition, payload and Back rule; this GDD never decides where a button goes, only how it looks and what it says. It owns no data: results come from Level State's record and Save & Progress, names from Campaign Level Data, unlock state from World Map.
2. **The Title**: the heroes-and-gods splash (art bible §2) as the background; the game's name; a one-line tagline (placeholder "Rope your keeps. Take the table.", the prototype's; the writer owns it); the **Start** button (primary) going to the World Map (Screen Flow rule 9); the **controls list** for the current device (Touch & Mouse Input UI: touch — drag to tie, swipe or tap a rope to cut; computer — left-drag to tie, right-click or right-drag to cut); a small version string; a Settings button slot (Vertical Slice). There is no New game / Continue choice: one profile exists (Save & Progress), and Start always continues. Save's one-time messages show over the Title before anything else (Screen Flow rules 9, 12).
3. **The Pause overlay**: the Level frozen beneath a Deep Wood dim at about 55% (art bible §4); a parchment panel with "Paused" and the level's title ("Green Vale 3 · Crossroads", Campaign Level Data); buttons **Resume** (primary), **Restart**, **Quit**; a Settings slot (Vertical Slice). Back and the Pause key both act as Resume (Screen Flow rule 6). Restart and Quit open the confirmation (rule 6 below; Restart keeps its confirmation, decided 2026-11-22).
4. **The Win overlay**: the frozen table beneath a warm amber dim at about 45% so the conquered table shows through (art bible §2 Victory, §4); a header naming the level as taken ("Crossroads taken!"; the writer owns the form); **"Clear!"** above **this attempt's time** and the **best time**, as F1 ("Clear!" then "1:30.5 · best 1:12.0"; the same on every win, decided 2026-11-22: no "First clear!" or "New best!" variants); a **star row slot** that is empty in UAT-1 (decided 2026-11-22: no stars until Stars & Rewards exists; the slot keeps the layout stable); buttons **Next level** (primary, shown only when F2 is true) and **World Map**. Back acts as World Map (Screen Flow table). After a region's last level there is no *Next level* and the map plays the conquest (World Map rule 6).
5. **The Lose overlay**: a cool slate dim at about 60%, low contrast, no accent gold (art bible §2 Defeat: "regroup and go again, never shame"); a furled blue banner on a weathered card; a short header ("The keep fell."; writer); this attempt's time, shown and never stored (Level State rule 5); buttons **Retry** (primary, in blue and gold, the brightest thing on the card) and **World Map**. Back acts as World Map. The brief's revive (a rewarded ad or gems) is after UAT and would add one button here (Open Question 3).
6. **The confirmation box**: one parchment box used for Quit, Restart and Delete progress (Screen Flow UI), with a text line per cause — Quit: "Leave this match? Its progress will be lost."; Restart: "Restart this level? Its progress will be lost."; Delete progress: Save & Progress' text — and two buttons, **Yes** and **No**. **No is the default and matches Back**; No is drawn primary (the safe move is the forward move here), Yes in plain Dark Wood. Nothing destructive is ever one tap away.
7. **The message box**: one text and a single **Continue** button, over any screen (Screen Flow rules 11, 12). Texts come from Save & Progress ("Your progress was restored from a backup", "Your progress could not be read and has been reset", "This save is from a newer version of the game. Progress this session will not be saved.", the write-failure text) and the load-failure error. Several messages show one after another (Screen Flow's queue). A message raised during Level State's Ending, while an overlay is open or during a transition waits, and shows over the next screen that has no overlay (Screen Flow rule 1), so a message box is never drawn over another overlay.
8. **The transition cover**: one full-screen cover in dark wood and parchment, never black or white (Screen Flow Visual/Audio), faded in and out at Screen Flow's timings (about 0.15 s each). It carries no text or spinner in UAT-1; Screen Flow keeps it up while a screen loads.
9. **Buttons.** Primary buttons are Royal Blue edged in Heraldic Gold; secondary buttons Dark Wood with a Light Wood bevel and a pressed state; Crimson is never a button colour (art bible §4). A button shows its press state on the frame of the tap (Screen Flow Game Feel). Every button is at least the touch minimum Touch & Mouse Input sets (about 9 mm; the accessibility GDD sets the final size). Every screen or overlay with a Back action shows a visible control for it (Screen Flow UI), so nothing depends on the phone's Back.
10. **Text.** Every string on these screens comes from the strings data file (one plain file, one language in UAT-1; Localization is an after-UAT system, decided 2026-11-22) with room for 30% expansion kept for it; the writer owns the wording and the placeholders above are marked as such in the table. Times use F3's format. No text is drawn from code.
11. **Layout.** Everything lays out inside the 720 × 1,280 portrait frame and respects the display's safe area. Overlay panels are centred, at most `panel_max_w` (600) px wide, and never cover the strength bar's row entirely on Pause (the player may read the state they paused in). The Title and overlays are the only places splash art appears (art bible Principle 3).
12. **Read, never write.** The Win and Lose overlays read the result record Level State passes and the stored best time Save already merged, through Save's read-only getter `best_time(level_id)` (Level State rule 6 records before the overlay). This GDD never writes to any system and calls nothing else except World Map's `is_unlocked` (F2).
13. **Data.** Dims, panel width, fade times and button sizes are data (`menus.tres`); strings are the table's. Nothing is hardcoded.

### States and Transitions

This GDD has no state machine; Screen Flow's table is the authority. Each screen or overlay here has only a **presentation state**:

| Screen / overlay | Opening | Open | Closing |
|---|---|---|---|
| Title | Behind the cover's fade-in | Interactive; messages may sit on top | Cover fades out on Start |
| Pause, Win, Lose, Confirmation, Message box | Fade and slight scale, about 0.2 s (Screen Flow) | Interactive; the screen beneath is frozen and dimmed | Reverse fade, about 0.2 s |
| Transition cover | Fade in about 0.15 s | Opaque; held while loading | Fade out about 0.15 s |

During Opening and Closing, buttons are drawn but Screen Flow has input locked (its rule 4), so a double tap never fires twice. A button's press state lasts `press_time` (0.08 s) and is shown even if the transition starts on the same frame.

### Interactions with Other Systems

| System | Direction | What flows | Owner of the interface |
|---|---|---|---|
| Screen Flow & Scene Manager | both | In: which screen or overlay to show, with its payload (level id, result record, confirmation cause, message text, "where from"); the pause and lock state. Out: button taps as the requests Screen Flow's table names (Start, Resume, Restart, Quit, Yes, No, Continue, Next level, World Map, Retry) | Screen Flow owns the flow; this GDD draws |
| Level State & Match Flow | in | The result record `{outcome, level_id, stars, time}` carried by Screen Flow to the Win or Lose overlay | Level State |
| Save & Progress | in | The stored best time for the level, read with `best_time(level_id)` (for F1; a time, or none for a level never won); the one-time message texts; the Delete-progress confirmation text | Save & Progress |
| World Map & Regions | in | `is_unlocked(next(level))` for the *Next level* button (F2) | World Map |
| Campaign Level Data | in | Level name, region name and order for the Pause and result headers; `next(level)` | Campaign Level Data |
| Touch & Mouse Input | in | Taps on buttons (through Screen Flow's routing); the controls list text per device; the touch minimum | Touch & Mouse Input |
| Settings (Vertical Slice) | out | The Settings frame (panel, Close, Back) around the Settings GDD's contents; Delete progress hidden when opened from Pause | Settings owns contents |
| Stars & Rewards (UAT-2) | in | Fills the Win overlay's star row and adds gold and diamond lines | Stars & Rewards |
| Audio (after UAT-1) | out | Events: `button_pressed`, `overlay_opened(kind)`, `overlay_closed(kind)` | Audio |
| Strings data file | in | Every string on these screens (one plain file, one language in UAT-1) | The writer; Localization takes it over after UAT |
| Accessibility (Alpha) | in | Button size and text size overrides; high-contrast dims | Accessibility |
| Tutorial & Onboarding (after UAT) | in | May add a first-run panel over the Title | Tutorial |

## Formulas

### F1. Win time line

The best_time_label formula is defined as, with `t` this attempt's time and `best` the level's stored best time after Save's merge (which happens before the overlay opens):

```
title = "Clear!"
line  = format(t) + " · best " + format(best)
```

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| t | float, s | ≥ 0.0, to 0.1 | calculated (Level State F3, in the result record) | This attempt's time |
| best | float, s | ≥ 0.0 | calculated (Save & Progress `best_time(level_id)`, merged) | The level's best stored time; never none here, because the first win sets it before the overlay opens |

**Output Range:** one fixed title and one line. Because Save keeps the better time (its rule 5), after the merge `best ≤ t` always holds; on a first clear, a new record or a tie, `best = t` and both times read the same. No label depends on `plays` or on the best before the merge (decided 2026-11-22), so a win after a loss reads like any other win. A loss never reaches F1 (no best is shown on the Lose overlay).
**Example:** stored best 72.0, this win 90.5 → "Clear!" / "1:30.5 · best 1:12.0"; this win 70.0 → `best` becomes 70.0, "Clear!" / "1:10.0 · best 1:10.0"; a first clear in 95.0 → "Clear!" / "1:35.0 · best 1:35.0".

### F2. Next level enabled

The next_level_enabled formula is defined as:

`show_next = next(level) ≠ none ∧ region(next(level)) = region(level) ∧ is_unlocked(next(level))`

**Variables:** `next(level)` (Campaign Level Data F4, which crosses into the next region); `region(level)` (Campaign Level Data); `is_unlocked` (World Map & Regions F1, evaluated after this result is recorded).
**Output Range:** true or false. After a win, `next(level)`'s `prev` is this level, now beaten, so `is_unlocked` is true whenever `next` exists: the button is hidden on a region's last level, even when `next` points into the next region (decided 2026-11-22), so a region's last win always returns to the World Map, which plays the conquest sequence (World Map rule 6); UAT-1's gv-05 has no `next` at all. The World Map call is kept rather than assumed so a reordered campaign cannot show a button to a locked level (Screen Flow's "stale or forged request" edge case).
**Example:** win on gv-03 → `next` gv-04, unlocked → *Next level* shown. Win on gv-05 → `next` none → hidden; *World Map* is the only button.

### F3. Time format

The time_format formula is defined as:

`format(t) = floor(t / 60) + ":" + two-digit floor(t mod 60) + "." + one-digit tenths`

**Variables:** `t` (float, s, to 0.1). **Output Range:** "0:00.0" upward; a 3-minute level reads "3:00.0". **Example:** 90.5 → "1:30.5"; 72.0 → "1:12.0".

### Timings (data; Screen Flow's targets, restated for the overlays this GDD draws)

| Value | Baseline | Range | Owner |
|---|---|---|---|
| overlay_fade | 0.2 s | 0.1–0.4 | Screen Flow Game Feel (target) |
| cover_fade | 0.15 s (each way) | 0.1–0.3 | Screen Flow Game Feel (target) |
| press_time | 0.08 s | 0.05–0.15 | this GDD |
| win_dim / lose_dim / pause_dim | 45% / 60% / 55% | ±10 points | art bible §4 |

### Boundary check

Worked at the extremes (lens: systems-designer): F1 on a first clear shows `best = t`; `t` 0.0 (one step) formats "0:00.0"; a time over an hour formats "60:00.0" and beyond (no cap, matching Level State's no-timeout rule); F2 is false on a one-level campaign. No division except F3's by 60; no loop.

## Edge Cases

- **If the Win overlay opens and Save's `flush()` had failed**: the result is merged in memory (Save AC8), so F1 still has `best`; the overlay shows it. Save's write-failure message, raised on the deciding step, waits through Ending and the overlay and shows over the next screen (Screen Flow rule 1).
- **If `is_unlocked(next(level))` is false after a win** (a reordered campaign, an edited file): *Next level* is hidden and *World Map* is the only button; nothing is logged here (World Map's rule handles the data).
- **If the level name is missing or too long**: the header falls back to "[Region] [order]"; text scales down to `min_font_px` (18) before truncating with an ellipsis; never two lines in the header.
- **If a message is raised while an overlay is open or during Ending**: Screen Flow holds it until no overlay is open (its rule 1), so this GDD never draws a message box over another overlay and only one dim layer is ever drawn.
- **If the player taps Yes and No on the confirmation on the same frame** (two fingers): Screen Flow's first-request-wins rule applies; the box draws one press state.
- **If the device is a desktop with a mouse**: the controls list on the Title reads the computer variant; Esc acts as Back (Screen Flow); hover states are optional and never required to read a button.
- **If the display is not 9:16**: panels centre in the safe area; the Title splash is cropped from its centre, never stretched; the controls list and Start stay inside the safe area.
- **If a string exceeds its room** (in UAT-1 the one-language strings data file; after UAT another locale): the text scales to `min_font_px` and then truncates with an ellipsis; after UAT, Localization's string-freeze check flags it before ship.
- **If the Pause overlay opens while the strip shows a refusal**: the HUD keeps it (Level HUD edge case); the Pause panel is placed so the strip is not covered.
- **If the app is backgrounded on the Title**: nothing changes (Screen Flow rule 7); the splash resumes.
- **If a result overlay is requested for a level with no stored result** (impossible after Level State rule 6, but the view model must not crash): `best` reads `t` and F1 shows "Clear!" / "t · best t".
- **If the player wins the last level of the only region (gv-05 in UAT-1)**: the Win overlay shows no *Next level* and its header is unchanged; the conquest celebration is the map's, not the overlay's.
- **If Settings (Vertical Slice) is opened from Pause**: the frame hides Delete progress (Save rule 11); the frame's Close returns to Pause (Screen Flow table).

## Dependencies

| System | Nature | Direction | What this GDD needs or gives | GDD status |
|---|---|---|---|---|
| Screen Flow & Scene Manager | Hard | both | Which screen to show and its payload; button taps as its named requests | In Review |
| Level State & Match Flow | Hard | in | The result record | Designed |
| Save & Progress | Hard | in | Best time; message texts; delete text | In Review |
| World Map & Regions | Soft | in | `is_unlocked` for F2 | Designed |
| Campaign Level Data | Soft | in | Names, order, `next` | Designed |
| Touch & Mouse Input | Soft | in | Controls list text; touch minimum | In Review |
| **Depended on by** | | | | |
| Settings (Vertical Slice) | Hard | out | The Settings frame | Not yet designed |
| Stars & Rewards (UAT-2) | Hard | out | The Win overlay's star row slot and reward lines | Not yet designed |
| Tutorial & Onboarding (after UAT) | Soft | out | A first-run panel over the Title | Not yet designed |
| Accessibility (Alpha); Localization (after UAT) | Soft | out | Size hooks; the strings data file and its 30% room, which Localization takes over | Not yet designed |

**Bidirectional check.** Screen Flow names Menus & Screens throughout (UI Requirements, AC21). Save & Progress names it (Interactions: "Draws the message boxes"). Level State names it (UI Requirements, Interactions). World Map names it (Interactions, Dependencies, `is_unlocked`). Campaign Level Data names it (Interactions: name and order). Touch & Mouse Input names the Title controls list but not this GDD by name: one line to add. `systems-index.md` lists Screen Flow, Level State and Save & Progress (soft); it should add World Map & Regions, Campaign Level Data and Touch & Mouse Input (soft).

## Visual/Audio Requirements

*Art-director row applied (lens-specialists), from art bible §1–4; these screens are the frame register.*

**Principles that govern the frame** (§1, §3, §4):
- **Splash art is the payoff** (Principle 3): the Title's heroes-and-gods splash and the Win overlay's amber light are the two splash moments this GDD owns; Pause, Lose, the confirmation and the message box are plain frame UI. The register test: splash only where it rewards or frames conquest.
- **Colour belongs to whoever owns it** (Principle 1): the frame is warm and low in saturation (Dark Wood `#4A3226`, Parchment `#E6D6B0`, Ink Brown text); saturation appears only on primary buttons (Royal Blue edged Heraldic Gold) and in the player's blue banner on the Lose card. Crimson never frames or buttons.
- **Frame UI shape grammar** (§3): dark wood frames, parchment panels with rolled edges, rune dividers; buttons are wood slabs with a bevel. Clipped corners belong to the Table HUD, not here.
- **Overlay dims** (§4): Pause Deep Wood at about 55%; Win warm amber `#3A2408` at about 45% so the conquered table shows through; Lose cool slate `#18202E` at about 60%.

**Mood per screen** (§2):

| Screen | Mood row | Light | What is drawn |
|---|---|---|---|
| Title | Pause, menus, Title: "safe and in control, at the war table" | A bright splash | Heroes-and-gods splash, the name in gold-edged letters, parchment controls list, blue Start |
| Pause | same | Lamplit wood, low contrast | Deep Wood dim, parchment panel, three wood buttons, Resume in blue |
| Win | Victory: "triumph and generosity" | Warm amber dim; golden-hour | The taken level's name, times in Ink Brown, an empty star row slot (UAT-1), Next level in blue and gold; the frozen table glows through |
| Lose | Defeat: "regroup and go again, never shame" | Cool slate dim, no accent gold | A furled blue banner on a weathered card, a short line, Retry in blue and gold as the brightest thing, World Map in wood |
| Confirmation, Message | Pause row | Lamplit | A small parchment box; No or Continue in blue, Yes in wood |
| Cover | — | Dark wood and parchment, never black | A full-screen panel; no text in UAT-1 |

**Animation constraints:** overlays fade and scale slightly over `overlay_fade`; nothing bounces or overshoots (the frame is "steady, crafted"). The Win overlay may let the star row fill one by one from UAT-2 (§2 Victory row); in UAT-1 the slot is static. Text is the UI font at integer sizes.

**Audio** (Audio GDD, after UAT-1): a UI tick on every button, a soft wood thunk on overlay open, the Win fanfare and the Lose's hushed sting belong to the Audio GDD; the Title's music bed starts with the splash. Events raised: `button_pressed`, `overlay_opened(kind)`, `overlay_closed(kind)`.

📌 **Asset Spec** — after the art bible is approved, run `/asset-spec system:menus-screens` for the Title splash, the wood and parchment panel set, primary and secondary buttons, the Lose card and banner, the cover, and the icon set (Pause, Back, Settings).

## Game Feel

- **Answered at once.** A button shows its press on the tap frame and the transition starts the same frame (Screen Flow Game Feel). No screen here ever feels like it is thinking.
- **A loss is "again", not a verdict.** The Lose card is brief, cool and forgiving; Retry is the brightest thing on it and one tap away; the time is shown so the player sees how close it was. Playtest question (AC14): after a loss, do testers tap Retry without reading, or stop?
- **A win is read, then kept.** The Win overlay holds the frozen table in warm light long enough to read the time and the best; *Next level* is primary because moving forward is the player's own move (art bible §4). The reward itself (stars, gold) arrives in UAT-2; the slot is already there so it lands without a relayout.
- **Nothing destructive in one tap.** Quit, Restart and Delete progress each pass a box whose default is No. The cost is one extra tap on a deliberate action; the benefit is never losing a 2-minute level to a slip.
- **At the war table.** The Title and Pause are cosy and steady: the player should feel they can put the phone down here. No timers, no pulsing calls to action except the pulse World Map owns on its current node.

## UI Requirements

| Screen / overlay | Elements | Buttons (Screen Flow's requests) | Back shows as |
|---|---|---|---|
| Title | Splash, name, tagline, controls list (per device), version | Start (primary); Settings slot (VS) | — (Back ignored here) |
| Pause | Dim, panel, "Paused", level title | Resume (primary), Restart, Quit; Settings slot (VS) | Resume |
| Win | Amber dim, header, "Clear!", this time · best (F1), star row slot (empty UAT-1) | Next level (primary, F2), World Map | World Map |
| Lose | Slate dim, banner card, header, this time | Retry (primary), World Map | World Map |
| Confirmation | Box, one text line per cause | No (primary, default), Yes | No |
| Message box | Box, one text | Continue (primary) | Continue |
| Cover | Full-screen panel | — | — |
| Settings frame (VS) | Panel, Close | Close; contents by Settings | Close |

Every button meets the touch minimum (about 9 mm; accessibility GDD final). All text from the strings table with 30% room; the placeholders this GDD names (tagline, Win and Lose headers) are flagged for the writer.

> **📌 UX Flag — Menus & Screens**: this system has UI requirements. In Phase 4 (Pre-Production), run `/ux-design menus` (Title, Pause, Win, Lose, Confirmation, Message box, cover) to create the UX spec before writing epics. Stories that reference these screens should cite `design/ux/menus.md`, not this GDD directly. Note this in the systems index for this system.

## Cross-References

| This GDD relies on | In | What it relies on |
|---|---|---|
| Screen Flow & Scene Manager | Rules 4, 6, 8–12; transitions table; Game Feel; UI Requirements; AC21 | Every button's destination; the box texts; fade timings; Back affordance; the cover |
| Level State & Match Flow | Rules 5, 6; UI Requirements; Open Question 4 | The result record; recorded before the overlay; best time shown (closed here) |
| Save & Progress | Rules 5, 11, 14; edge cases | Merge keeps the better time; delete text; the four message texts |
| World Map & Regions | Interactions (`is_unlocked`); Open Question 4 | F2; best time on the overlay (closed here) |
| Campaign Level Data | Rule 2; F4 | Names, order, `next` |
| Touch & Mouse Input | UI Requirements | The controls list per device; the touch minimum |
| design/art/art-bible.md | §1 Principles 1 and 3; §2 Title, Pause, Victory, Defeat rows; §3 Frame UI grammar; §4 UI palette and dims | The frame register |
| prototypes/tower-war/index.html | title, panel, button | The tagline and layout the UAT-1 screens start from |

**Edits other documents need as a result of this GDD** (1–7 applied 2026-11-22):
1. `level-state-match-flow.md`: close Open Question 4 (the Win overlay shows the best time beside this attempt's; F1 here).
2. `world-map-regions.md`: close Open Question 4 (best time is on the Win overlay, not the map, in UAT-1).
3. `screen-flow-scene-manager.md`: UI Requirements line "Result overlays show the result record's stars and times" → stars from UAT-2 (the row is an empty slot in UAT-1); note Restart's confirmation is confirmed kept (its rule 8 stands; the task-list question is closed).
4. `touch-mouse-input.md`: name Menus & Screens as the owner of the Title's controls list.
5. `systems-index.md`: row 13 → Designed with the GDD link and the UX flag; add World Map & Regions, Campaign Level Data and Touch & Mouse Input (soft) to Depends On; progress tracker (UAT-1 13/13).
6. `production/task-list.md`: close the Restart two-step question (kept).
7. `design/registry/entities.yaml`: register `best_time_label` and `next_level_enabled` (formulas).

## Acceptance Criteria

Baseline data: the Green Vale; `overlay_fade` 0.2 s; `press_time` 0.08 s; dims 55 / 45 / 60%. Tags: **[Logic]** automated test in `tests/unit/` against the screen view models (texts, which buttons are shown, their styles); **[Integration: X]** in `tests/integration/`; **[UI]** retained screenshot in `production/qa/evidence/`; **[Playtest]** observed in UAT. `qa-lead` lens applied: every rule and formula has a criterion; boundaries are AC2, AC4, AC6.

- **AC1 [Logic] (F1)**: GIVEN a win on gv-03 with time 90.5 and stored best 72.0, THEN the Win overlay shows "Clear!" and the line "1:30.5 · best 1:12.0"; GIVEN time 70.0 (so best becomes 70.0), THEN "Clear!" and "1:10.0 · best 1:10.0".
- **AC2 [Logic] (F1 boundary)**: GIVEN a first clear in 95.0, or a win after earlier losses (plays > 1, never beaten before), THEN "Clear!" and "1:35.0 · best 1:35.0", and no "First clear!" or "New best!" text appears in any case; GIVEN time 0.0, THEN the time reads "0:00.0".
- **AC3 [Logic] (F2)**: GIVEN a win on gv-03, THEN *Next level* is shown and primary and *World Map* is shown; GIVEN a win on gv-05, THEN only *World Map* is shown; GIVEN a two-region test campaign and a win on region 1's last level (whose `next` is region 2's first level, unlocked), THEN only *World Map* is shown.
- **AC4 [Logic] (F2 boundary)**: GIVEN a win on gv-03 but `is_unlocked(gv-04)` returns false, THEN *Next level* is hidden.
- **AC5 [Logic] (F3)**: GIVEN 72.0 → "1:12.0"; 185.3 → "3:05.3"; 3,600.0 → "60:00.0".
- **AC6 [Logic] (rule 4 boundary)**: GIVEN any win in UAT-1, THEN the star row slot is present in the layout and draws no star; GIVEN Stars & Rewards supplies 2 stars, THEN two stars draw in the same slot without the buttons moving.
- **AC7 [Logic] (rule 6)**: GIVEN the confirmation opens for Quit, THEN its text is "Leave this match? Its progress will be lost.", No is primary and default, Yes is plain; GIVEN Restart, THEN "Restart this level? Its progress will be lost."; GIVEN Delete progress, THEN Save & Progress' text.
- **AC8 [Logic] (rule 2)**: GIVEN a touch device, THEN the Title's controls list reads the touch variant; GIVEN a mouse, THEN the computer variant; GIVEN a fresh install and a returning player, THEN the Title shows the same single Start button.
- **AC9 [Logic] (rule 7)**: GIVEN Save raises "restored from backup", THEN a message box with that text and one *Continue* button shows over the Title before Start can be tapped.
- **AC10 [Logic] (rules 10, 13)**: GIVEN the tagline string changed in the strings table and `pause_dim` changed in the data file, THEN both take effect with no code change.
- **AC11 [Integration: Screen Flow] (rules 3, 9)**: GIVEN Pause open, WHEN Resume is tapped, THEN the press state shows on that frame and the overlay is closed within `overlay_fade`; WHEN Back is pressed, THEN the same as Resume.
- **AC12 [Integration: Screen Flow, Level State] (rule 4)**: GIVEN a win with deciding step D, THEN the Win overlay opens on step D + 90 with the record's time and the frozen table visible beneath an amber dim.
- **AC13 [UI] (rules 2–8)**: retained screenshots on the minimum phone of the Title (touch controls), Pause over a mid-match table, Win on gv-03 (both buttons, empty star slot, time and best), Win on gv-05 (World Map only), Lose, the Quit confirmation, and a message box over the Title. Every button at or above the touch minimum (measured).
- **AC14 [Playtest] (Game Feel)**: after each loss in UAT-1, note whether the tester taps Retry within 3 s; 4 of 5 testers doing so on their first loss passes. Also ask: "Did the loss screen feel fair?"
- **AC15 [UI] (Visual/Audio)**: the Lose screenshot converted to greyscale shows Retry as the highest-contrast element; the Win screenshot shows the table's keeps legible through the dim.
- **AC16 [Logic] (rule 9)**: GIVEN every screen and overlay with a Back action, THEN a visible control performs the same action (Resume, World Map, No, Continue, Close), enumerated against Screen Flow's Back table (its AC8).

**Coverage check.** Rules 1–13 each have a criterion (rule 1's scope is AC13's enumeration; rule 11's layout is AC13 and AC6; rule 12 read-only is implicit in the view-model tests never calling Save or Level State); F1–F3 each have a typical and a boundary case; cross-system: AC9, AC11, AC12.

## Open Questions

| # | Question | Owner | Resolve by |
|---|----------|-------|------------|
| 1 | The Title tagline and the Win and Lose headers are placeholders; the writer's pass over all frame strings | writer | Before the UAT-1 build |
| 2 | Exact panel sizes, button sizes and positions, the Title's layout and the cover's look | ux-designer (`/ux-design menus`), art-director (`/asset-spec`) | Pre-Production |
| 3 | The revive on a loss (a rewarded ad or gems, the brief's provisional idea) adds a button to the Lose overlay and a state to Level State | Store build | After UAT |
| 4 | Whether the Pause panel should show the strength bar's numbers ("You 42 · Rival 31") so the paused state reads without the table | ux-designer | UX spec |
| 5 | Whether the Title needs a "Continue at Green Vale 3" line under Start, or the map's highlight is enough | ux-designer, game-designer | UX spec |
| 6 | Settings frame contents and the Vertical Slice Settings GDD | Settings | Vertical Slice |
