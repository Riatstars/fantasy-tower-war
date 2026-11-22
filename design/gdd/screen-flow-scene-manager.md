# Screen Flow & Scene Manager

> **Status**: Designed (pending /design-review)
> **Author**: user + Claude
> **Last Updated**: 2026-11-22
> **Last Verified**: 2026-11-22
> **Creative Director Review (CD-GDD-ALIGN)**: skipped — Lean mode
> **Implements Pillar**: none (no game-pillars.md yet)

## Summary

Screen Flow & Scene Manager decides which screen the app shows (Title, World Map, Level, and the Pause, result and confirmation overlays), which moves between them are legal, and what the phone's Back button and background events do. Other systems ask it to move and it carries the level id and the match result with each move. It exists so no screen or match system has to know how to reach the others, and so the phone's own behaviour is handled in one place.

> **Quick reference** — Layer: `Foundation` · Priority: `MVP` · Key deps: `Touch & Mouse Input (soft)`

## Overview

Screen Flow & Scene Manager is the navigation spine of the app. It decides which screen is showing
(title, world map, a level being played, pause, win and lose results, and later settings and the
collection screens), which moves between screens are legal, and what data travels with each move:
which level to start, and which result a finished level hands to the results screen. It also decides
how the app answers events from the phone, such as the back button or the app going to the
background. The player never touches it directly; every button on every other screen asks it to
move.

It owns the list of screens, the single "current screen" state and the legal transitions. It does not
own what is drawn on a screen (Menus & Screens, World Map & Regions, Level HUD), the rules of a
match (Level State & Match Flow), or what is stored between sessions (Save & Progress). Without it
each of those systems would have to know about the others to move between them, and the phone's
back button and background events would have no single place to be handled.

## Detailed Design

### Core Rules

1. There are two kinds of display. A **screen** replaces the previous one: Title, World Map, Level
   (Settings joins in Vertical Slice; the Faction Collection and card-upgrade screens in Alpha). An
   **overlay** sits on top of the Level and freezes it: Pause, Win result, Lose result and the
   confirmation box. Exactly one screen is current at any time, and at most one overlay is open.
2. Every other system moves the app by *asking* Screen Flow to go somewhere, with a payload. Screen
   Flow accepts the request only if the move is in the transitions table below. An illegal request is
   ignored and logged; development builds stop with an error naming both screens.
3. Payloads are carried, never computed here. To the Level: the level id chosen on the World Map. To
   a result overlay: the result record from Level State & Match Flow (outcome, level id, stars,
   elapsed time, keeps captured).
4. One transition at a time. While a screen change is in progress all input is ignored and further
   requests are rejected; input comes back when the new screen is ready.
5. Overlays pause the game. While any overlay is open the match does not advance (no generation, no
   marching). Screen Flow raises the pause state; Level State & Match Flow obeys it.
6. Back (Android Back button, iOS back swipe, Esc on a computer):
   - in the Level with no overlay: opens Pause;
   - in Pause: resumes the match;
   - in a Win or Lose overlay: goes to the World Map;
   - in the confirmation box: answers No;
   - on the World Map and on the Title: ignored.
7. When the app goes to the background during a Level with no overlay, Screen Flow opens Pause. On
   return the player is still in Pause and resumes by choice. On other screens nothing happens. If the
   phone ends the app, the unfinished match is lost (matches are not saved) and the next start is a
   normal launch.
8. **Quit** and **Restart** are both offered in Pause and both end the current match, so both ask for
   confirmation (one confirmation box, different text). Confirming Quit goes to the World Map and
   records no result and no stars. Confirming Restart starts the same level again from its initial
   state. Declining returns to Pause.
9. The app always starts on the Title. The Title goes to the World Map on a tap. The current screen is
   not saved between sessions.
10. When a match ends, Level State & Match Flow asks Screen Flow to open the Win or Lose overlay with
    the result record, after Level State's own end delay. Win offers *Next level* (when one exists and is
    unlocked) and *World Map*; Lose offers *Retry* and *World Map*. After the last level of a region,
    a win goes to the World Map, which shows the conquered region (World Map & Regions owns that view).
11. Loading a screen is hidden by the transition. If loading fails, the app shows an error message
    with a button back to the previous screen, and the failure is logged.

### States and Transitions

| From | Trigger | To |
|------|---------|----|
| (app start) | Launch | Title |
| Title | Tap Start | World Map |
| World Map | Tap an unlocked level node | Level (payload: level id) |
| World Map | Tap Settings (Vertical Slice) | Settings |
| Settings | Back or Close | The screen it was opened from |
| Level | Pause button, Back, app to background | Pause overlay |
| Pause | Resume, Back | Level (match continues) |
| Pause | Quit or Restart | Confirmation overlay |
| Confirmation | Yes (Quit) | World Map |
| Confirmation | Yes (Restart) | Level (same level id, initial state) |
| Confirmation | No, Back | Pause overlay |
| Level | Level State asks for the Win overlay | Win overlay (payload: result) |
| Level | Level State asks for the Lose overlay | Lose overlay (payload: result) |
| Win overlay | Next level | Level (next level id) |
| Win overlay, Lose overlay | World Map, Back | World Map |
| Lose overlay | Retry | Level (same level id, initial state) |
| Pause | Settings (Vertical Slice) | Settings, returning to Pause |

Any trigger not in this table is ignored. While a transition is in progress every trigger is ignored (Core Rule 4). Alpha adds transitions from the World Map to the Faction Collection and card-upgrade screens, with Back returning to the World Map.

### Interactions with Other Systems

| System | Direction | Data | Interface owner |
|--------|-----------|------|-----------------|
| Level State & Match Flow | both | Out: the pause state (match frozen or running), "start this level" with a level id, "restart". In: the request to open the Win or Lose overlay with the result record | Screen Flow owns the pause state and the transitions; Level State owns the result record |
| World Map & Regions | in/out | In: "open this level" (level id), "return to the map". Out: where the player came from | World Map & Regions |
| Menus & Screens | both | Draws every screen and overlay; its buttons send requests. Screen Flow tells it which screen or overlay to show | Menus & Screens draws; Screen Flow decides |
| Mobile Platform Integration | in | Back event, app to background and foreground events. Screen Flow sends nothing back | Mobile Platform Integration reports events; Screen Flow decides what they mean |
| Touch & Mouse Input | out | Input lock during transitions; which screen is current, so input is routed to it | Touch & Mouse Input |
| Audio | out | "Screen changed" and "overlay opened" events so music can change | Screen Flow raises, Audio reacts |
| Settings, Faction Collection, card-upgrade screens | out | These screens are added to the table when their systems are designed | Their own GDDs list their entry and exit triggers |
| Save & Progress | none | No direct data. Progress is written by Level State and Stars & Rewards before the result overlay opens; Screen Flow never writes saves | Save & Progress |

## Formulas

None. This system defines no numeric rule: its rules are about which screen follows which, and in what order. Transition durations are presentation targets (see Game Feel), not balance values.

## Edge Cases

`systems-designer` not consulted — Lean mode. Review manually before production.

- **If two taps request different moves on the same frame**: the first request in processing order wins; the rest are ignored, because the first starts a transition and Core Rule 4 locks input.
- **If a request arrives while a transition is in progress**: it is ignored (not queued), so a double tap on *Next level* starts one level, not two.
- **If Back is pressed during a transition**: ignored.
- **If the app goes to the background while a transition into the Level is in progress**: the transition finishes, and Pause opens as soon as the Level is ready, before the match advances a step.
- **If the app goes to the background on the Title, World Map, Settings or an overlay**: nothing changes; if a Pause is already open it stays open.
- **If the phone shows a system dialog or call that takes focus without sending a background event**: Mobile Platform Integration reports it as a background event; Screen Flow treats it the same way (Core Rule 7). Until that GDD exists this is a provisional contract.
- **If the match ends on the same step as a Back or background event**: the result overlay wins and Pause does not open.
- **If Level State asks for a result overlay twice**: the second report is ignored; the first overlay stays.
- **If *Next level* is requested but there is no next level or it is locked** (a stale or forged request): ignored and logged; the button is not shown in that case.
- **If a screen is requested that does not exist in this build** (for example Settings before Vertical Slice): ignored and logged; no button should offer it.
- **If loading a Level fails**: an error box with one button returns to the previous screen. If the previous screen was a Level (a failed Restart), return to the World Map instead. The failure is logged. No result and no stars are recorded.
- **If Quit is confirmed**: the match is discarded with no result, no stars and no rewards; progress already earned on earlier levels is untouched.
- **If the player presses Back in Settings**: it closes and returns to the screen it was opened from (World Map, Title or Pause).
- **If the screen rotates or its size changes**: the game is portrait only; layout is the job of Menus & Screens and Mobile Platform Integration, not of Screen Flow.
- **If a desktop player presses Esc**: it is the same as Back.

**Open, owned by other GDDs** (not decided here):
- Exactly which phone events Mobile Platform Integration reports as "background": Mobile Platform Integration.
- Whether *Next level* may skip the World Map after the last level of a region: World Map & Regions.

## Dependencies

None of the systems below has a GDD yet, so every contract here is provisional until its GDD is written and the two sides are checked against each other.

**Direction rule.** Screen Flow never calls another system. Other systems call it (requests, with a payload) or send it events, and it answers by changing the current screen and raising the pause state. That keeps it a foundation with no upstream dependency and avoids a cycle with Level State & Match Flow: Level State asks Screen Flow to open the Win or Lose overlay and reads its pause state, rather than Screen Flow querying Level State.

### Depends on (upstream)

| System | Kind | What this system needs | Status |
|--------|------|------------------------|--------|
| Touch & Mouse Input | Soft | A way to lock input during a transition and to route input to the current screen. Without it the lock is silently missing, so it should exist | Provisional. The systems index lists neither side as depending on the other; Input's GDD must provide the lock |
| (none otherwise) | | | |

### Depended on by (downstream)

| System | Kind | What it takes from this system |
|--------|------|-------------------------------|
| Level State & Match Flow | Hard | The pause state; the ability to open the Win and Lose overlays with a result; start and restart of a level |
| World Map & Regions | Hard | Opening a Level from a node; returning to the map |
| Menus & Screens | Hard | Which screen or overlay to show; its buttons send requests |
| Mobile Platform Integration | Hard | Handlers for Back and background events |
| Audio | Soft | "Screen changed" and "overlay opened" events |
| Settings (Vertical Slice) | Soft | An entry in the transitions table |
| Faction Collection & Unlocks, Collection & Upgrade Screens (Alpha) | Soft | Entries in the transitions table |

### Consistency to fix

- `systems-index.md` lists Level State, World Map, Menus & Screens and Mobile Platform Integration as depending on Screen Flow. It does not yet list Audio, Settings, Faction Collection & Unlocks or Collection & Upgrade Screens (soft), nor Screen Flow's soft dependency on Touch & Mouse Input. Add them when those GDDs are written.
- Each downstream GDD must list Screen Flow as a dependency and use only the requests and events defined here.

## Visual/Audio Requirements

A short note only, since this is a Core system and the screens themselves belong to Menus & Screens, World Map & Regions and Level HUD.

- A screen change is covered by a brief fade, so loading is never visible and screens never "pop". The cover uses the game's own dark wood-and-parchment palette, not a plain black or white flash.
- Overlays (Pause, Win, Lose, Confirmation) dim the frozen Level behind them rather than hiding it, so the player keeps the sense of place.
- Audio changes on screen changes are triggered by the events in Interactions; which music plays where is the Audio GDD's choice.

## Game Feel

The player's tap on a button must feel answered at once, even when the next screen takes time to prepare.

- **Tap response**: the button reacts on the frame of the tap (a press state); the transition starts on the same frame.
- **Transition length**: fade out about 0.15 s, then fade in about 0.15 s, with input locked during both. Targets to tune in the first playable, not balance values.
- **Overlay open and close**: about 0.2 s fade and slight scale; the Level stays frozen throughout.
- **No dead time**: after a transition the new screen accepts input on the first visible frame. A screen that needs longer to load keeps the cover up instead of showing an unresponsive screen.
- **Back**: Back on a phone has the same weight as tapping the on-screen button it stands for, with no extra delay.

## UI Requirements

Screen Flow draws almost nothing itself; Menus & Screens draws every screen and overlay. What this system needs from the UI:

- **Transition cover**: one full-screen cover used for every screen change (Visual/Audio).
- **Confirmation box**: one box used for both Quit and Restart, with two buttons (Yes, No) and a text line that differs (for example "Leave this match? Its progress will be lost." and "Restart this level? Its progress will be lost."). The No button is the default and matches Back.
- **Error box**: one box with a message and a single button returning to the previous screen (Core Rule 11).
- **Result overlays**: show the result record's stars and times; their buttons are the ones in Core Rule 10.
- **Back affordance**: every screen with a Back action shows a visible Back control as well, so the behaviour does not depend on the phone's own Back.
- **Touch targets**: every button here is a large touch target (the accessibility GDD sets the minimum size).

> **UX Flag — Screen Flow & Scene Manager**: This system has UI requirements. In Pre-Production, run `/ux-design` to create a UX spec for each screen and overlay (confirmation, error, results) before writing epics. Stories that reference UI should cite `design/ux/[screen].md`, not this GDD directly.

## Cross-References

All referenced GDDs are still to be written; the entries are provisional until each exists.

| This GDD uses | Owned by | Item |
|---------------|----------|------|
| Result record (outcome, level id, stars, elapsed time, keeps captured) | Level State & Match Flow | The payload of the Win and Lose overlays (Rules 3, 10; AC5) |
| Pause state and "match step counter" | Level State & Match Flow | The match obeys Screen Flow's pause (Rule 5; AC7) |
| Level nodes, region order, conquered-region view | World Map & Regions | What a node tap and a last-level win lead to (Rules 3, 10) |
| Screens and overlays drawn | Menus & Screens | The buttons that send requests; confirmation and error boxes |
| Back and background events | Mobile Platform Integration | Rules 6, 7; AC9, AC18 |
| Input lock and routing | Touch & Mouse Input | Rule 4 |
| "Screen changed" and "overlay opened" events | Audio | AC20 |

## Acceptance Criteria

Section D defines no formulas, so the criteria come from Sections C and E alone. Tags: **[Logic]** automated unit test; **[Integration]** automated test with the named system; **[Visual]** screenshot or playtest; **[Device]** measured on the target phone.

**Core rules**

- **AC1 [Logic] (Rule 1)**: GIVEN the app has launched, WHEN any sequence of legal moves is made, THEN after every move exactly one screen is current and at most one overlay is open.
- **AC2 [Logic] (Rule 9)**: GIVEN a fresh launch, with or without saved progress, THEN the current screen is the Title; WHEN Start is tapped, THEN the current screen is the World Map.
- **AC3 [Logic] (Rule 2)**: GIVEN the World Map is current, WHEN a request to open the Win overlay arrives, THEN the current screen is unchanged, a log entry is written, and a development build stops with an error naming both screens.
- **AC4 [Logic] (Rule 3)**: GIVEN the World Map, WHEN the node for level 3 is tapped, THEN the Level starts with level id 3.
- **AC5 [Integration: Level State & Match Flow] (Rules 3, 10)**: GIVEN a won match with result R, WHEN Level State asks for the Win overlay, THEN the overlay opens carrying exactly R's outcome, level id, stars, elapsed time and keeps captured.
- **AC6 [Logic] (Rule 4)**: GIVEN a transition in progress, WHEN a second request and a Back event arrive, THEN both are ignored and the destination is unchanged; WHEN the transition finishes, THEN the new screen accepts input. A double tap on *Next level* starts exactly one Level.
- **AC7 [Integration: Level State & Match Flow] (Rule 5)**: GIVEN a running match, WHEN Pause opens and 5 s pass, THEN the match's step counter has not advanced; WHEN the match resumes, THEN it advances from the same value.
- **AC8 [Logic] (Rule 6, table-driven)**: GIVEN each of Level with no overlay, Pause, Win overlay, Lose overlay, Confirmation, World Map and Title, WHEN Back is pressed, THEN the result is respectively: Pause opens; the match resumes; the World Map; the World Map; the confirmation answers No and Pause shows; nothing; nothing.
- **AC9 [Integration: Mobile Platform Integration] (Rule 7)**: GIVEN a running Level with no overlay, WHEN the app goes to the background and returns, THEN Pause is open on return and the match step counter has not advanced.
- **AC10 [Logic] (Rule 7)**: GIVEN the World Map, WHEN the app goes to the background and returns, THEN the World Map is still current and no overlay is open.
- **AC11 [Logic] (Rule 8)**: GIVEN Pause, WHEN Quit is tapped, THEN the confirmation opens and the screen is unchanged; WHEN Yes is tapped, THEN the World Map is current and no result and no stars are recorded. GIVEN Restart and Yes, THEN the same level id starts from its initial state. GIVEN either and No, THEN Pause is shown again.
- **AC12 [Logic] (Rule 10)**: GIVEN a Win overlay on a level that is not the last in its region, THEN it offers *Next level* and *World Map*; on the last level it offers *World Map* only and leads to the World Map conquered view (checked in World Map & Regions). A Lose overlay offers *Retry* and *World Map*.
- **AC13 [Logic] (Rule 11)**: GIVEN a Level that fails to load, THEN an error box with one button returns to the previous screen and the failure is logged; if the previous screen was a Level (a failed Restart) it returns to the World Map; no result and no stars are recorded.

**Edge cases**

- **AC14 [Logic]**: GIVEN a match that ends on the same step a Back event arrives, THEN the Win or Lose overlay is shown and Pause is not.
- **AC15 [Logic]**: GIVEN Level State asks for a result overlay twice, THEN one overlay shows and it carries the first record.
- **AC16 [Logic]**: GIVEN a *Next level* request for a locked or missing level, THEN it is ignored and logged.
- **AC17 [Logic]**: GIVEN a request for a screen that does not exist in the build (Settings in an MVP build), THEN it is ignored and logged.
- **AC18 [Integration: Mobile Platform Integration]**: GIVEN the app goes to the background during a transition into a Level, THEN when the Level is ready Pause is visible and the match step counter is 0.
- **AC19 [Logic]**: GIVEN a desktop build in a Level, WHEN Esc is pressed, THEN Pause opens, as for Back.

**Cross-system, visual and device**

- **AC20 [Integration: Audio]**: GIVEN an overlay opens, THEN Audio receives exactly one "overlay opened" event naming it; GIVEN a screen change, THEN one "screen changed" event naming the new screen.
- **AC21 [Visual]**: Retained screenshots in `production/qa/evidence/` show the Title, World Map, Level, Pause, Confirmation, Win and Lose in their correct states (drawn by Menus & Screens).
- **AC22 [Device]**: On the mid-range Android target, Title to World Map and World Map to Level each reach an input-ready screen within 0.6 s of the tap (target to confirm).

**Coverage check:** every core rule (1–11) has at least one criterion; each state-changing edge case has its own; boundary behaviour (double tap, Back during transition, background at transition) is covered by AC6, AC14, AC18. No formula exists to cover.

## Open Questions

| # | Question | Owner | Resolve by |
|---|----------|-------|------------|
| 1 | Transition style (fade, wipe or a themed wipe) and the 0.15 s / 0.15 s timing | ux-designer, art-director | Vertical Slice art pass |
| 2 | Back on the World Map and Title does nothing (decided). Do the Android store guidelines expect an "Exit game?" prompt on Title? | Mobile Platform Integration | Before the store build |
| 3 | Should Settings be reachable from the Title only, or from the World Map as well? | Settings GDD | Vertical Slice |
| 4 | After the last level of a region, may *Next level* continue straight into the next region, or must the World Map show the conquered region first? | World Map & Regions | Before that GDD |
| 5 | An unfinished match is lost if the phone ends the app (matches are not saved). Reconsider if playtests show frustration | game-designer | After the first mobile playtest |
| 6 | Are two taps (Pause then Restart, plus its confirmation) too heavy for retrying a level? | game-designer | First playable |
| 7 | How screens and overlays are implemented in Godot (one manager, scene swap against instancing) is an architecture decision, not a design one | technical-director | Technical Setup: `/architecture-decision` |
| 8 | The 0.6 s input-ready target (AC22) has not been measured on a phone | gameplay-programmer | Mobile Platform Integration (Vertical Slice) |
