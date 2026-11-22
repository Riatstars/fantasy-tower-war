# Level State & Match Flow

> **Status**: Designed (pending /design-review in a fresh session)
> **Author**: user + Claude
> **Last Updated**: 2026-11-22
> **Last Verified**: 2026-11-22
> **Creative Director Review (CD-GDD-ALIGN)**: skipped — Lean mode
> **Implements Pillar**: 2. A tug-of-war you read at a glance (`design/gdd/game-concept.md` § Pillars)

## Summary

Level State & Match Flow runs one match from build to result: it starts the level clock (on level 1, only at the player's first rope), tests after every step whether the player has won or lost, freezes the board when it ends, records the result through Save & Progress and then asks Screen Flow for the Win or Lose overlay. It also carries Restart and Quit. It exists so every other system can stay free of "is the match over?" logic, and so the world map hears exactly once that a level was beaten.

> **Quick reference** — Layer: `Core` · Priority: `MVP` (UAT-1) · Key deps: `Troop Marching & Clashes, Troop Generation, Rope Links, Screen Flow & Scene Manager, Save & Progress`

## Overview

Level State & Match Flow runs one match from its first frame to its last. It builds the match from a level's data, starts the level clock (on level 1 only when the player ties their first rope), tests after every step whether the player has won or lost, freezes the match when it ends, records the result through Save & Progress, and then asks Screen Flow to show the Win or Lose overlay. It also carries the two ways a match is left early: Restart rebuilds the same level from its initial state, and Quit throws the match away and records nothing. It has no gameplay rules of its own: keeps, ropes and pawns belong to Keep Levels, Rope Links, Troop Generation and Troop Marching & Clashes. This system only decides when a match starts, whether it is won, lost or abandoned, and what is kept afterwards. The player never operates it directly; they feel it as the moment a level ends and the map answers. Without it a match would never end and the world map would never hear that a level was beaten.

## Detailed Design

### Core Rules

1. **One match, one level.** A match is built from one level record (Campaign Level Data): the level id, every keep (position, owner, starting troops), the rival's parameters (for Rival AI) and the flag `wait_for_first_rope`. While building, Level State has each owner initialise itself: Troop Generation (every timer 0), Keep Levels (each keep's level from its starting troops, no history), Rope Links (no ropes, `relay_count` 0, tie counter 0), Troop Marching & Clashes (no pawns, `seq` 0) and Rival AI (its stream reseeded from `rival.seed`, its timer stopped until `clock_started`). A match starts with no ropes and no pawns.
2. **The level clock** counts fixed game steps (1/60 s) and counts nothing while the game is paused. On a level whose `wait_for_first_rope` is false it starts at once: the first step after the build is step 0 of the clock, and `clock_started` is raised on it (decided 2026-11-22; Rival AI and Troop Generation wait for it). On a level where it is true (level 1 at baseline, set in Campaign Level Data) the match is **Armed**: ties are accepted, and no match step runs, so no keep generates, no rope sends, no pawn marches, the rival does nothing and the win and loss test is off. Touch & Mouse Input and Rope Links' hit-test provider are not match steps and keep running every frame, so the first drag of the game shows its preview while Armed (decided 2026-11-22). The step that accepts the player's first `rope_tied` is step 0 of the clock, raises `clock_started` and runs the full per-step order. This is the exception to Troop Generation Rule 5 (decided 2026-11-22, `game-concept.md` § Rival).
3. **The win and loss test** runs once per step, as the last phase (phase 7 of Troop Marching & Clashes' per-step order), on the final state of the step, after arrivals and the level recompute. `won` = every keep's owner is the player. `lost` = the player owns no keep and `pawns_in_flight(player)` is 0. They cannot both hold. A player with no keep but pawns still marching has not lost: a later capture keeps them in (Troop Marching AC-M36). The test does not run while Armed, Ending or Closed.
4. **Ending.** The step on which the test is true is the **deciding step**; the outcome never changes afterwards. From the next step the match is frozen: nothing generates, sends, marches or acts, and ties and cuts are refused. Pawns in flight **freeze in place** and stay drawn behind the overlay (decided 2026-11-22; answers Troop Marching Open Question 8). The frozen board is discarded when the next match is built or the player leaves.
5. **The result record** has four fields: `outcome` (win or loss), `level_id`, `stars` and `time`. On a win, `stars` is `win_stars` (a fixed 1 in UAT-1, decided 2026-11-22; Stars & Rewards supplies it from UAT-2) and `time` is the clock steps up to and including the deciding step ÷ 60, rounded to 0.1 s. On a loss `stars` is 0 and `time` is the same measure; it is shown, never stored.
6. **Recording order.** At the end of the deciding step: on a win call `record_level_result(level_id, stars, time)`; on a loss call `record_level_played(level_id)`; then `flush()`. Then the end delay `end_delay` (1.5 s, decided 2026-11-22) counts down in game steps. When it has elapsed, Level State asks Screen Flow once for the Win or Lose overlay with the record. A failed flush does not delay or cancel the overlay: Save & Progress raises its own message, and Screen Flow holds it until no overlay is open (its rule 1), so it neither pauses the end delay nor covers the result. The result is therefore already on disk before the player sees it, and closing the app during the delay loses nothing (Save & Progress Core Rule 6).
7. **Unlocks and conquest are not decided here.** Level State only records the result. World Map & Regions derives which nodes unlock and when a region is conquered.
8. **Starting again.** Restart (confirmed in Pause), Retry (Lose overlay) and Next level (Win overlay) each start a match for a level id: the current match is discarded entirely and a new one is built by rule 1 (clock 0, `seq` 0, `relay_count` 0, no ropes, no pawns, Armed again where the level says so). Discarding records nothing. A Restart is not a play and does not count (the same as Quit).
9. **Quit** (`match_quit`, confirmed in Pause) discards the match, records nothing and asks Screen Flow for nothing: Screen Flow has already moved to the World Map.
10. **Pause.** Screen Flow & Scene Manager owns the pause state and Level State obeys it: while any overlay is open no step runs and no clock advances. During Ending Level State tells Screen Flow `pause_allowed = false`, so Pause, Back and the app going to the background open nothing until the result overlay is up, and a message raised in Ending waits (Screen Flow rule 1).
11. **Determinism.** This system uses no randomness. The same level record and the same ties and cuts, on the same steps, give the same outcome and the same `time`.
12. **Data.** `end_delay`, `win_stars` and each level's `wait_for_first_rope` are data-file values, never hardcoded.

### States and Transitions

| State | Meaning | Steps run | Table input | Enter when | Leave when |
|---|---|---|---|---|---|
| Loading | Building the match from the level record (rule 1) | No | Locked | A start, Restart, Retry or Next level request | Built → Armed if `wait_for_first_rope`, else Running. A load failure is Screen Flow's (it returns to the previous screen) |
| Armed | Waiting for the player's first rope (rule 2) | No | Ties accepted | Built, flag true | First accepted `rope_tied` → Running |
| Running | The match is played | Yes (not while paused) | Ties and cuts | Built with flag false; or the first rope | Win and loss test true → Ending |
| Ending | Outcome decided; board frozen; end delay counting (rules 4–6) | No (the delay counts) | Locked | The deciding step | `end_delay` elapsed and overlay requested → Closed |
| Closed | Overlay requested; waiting for the player's choice | No | Locked | Overlay requested | Retry or Next level → Loading; World Map → discarded |

| From | Trigger | To |
|---|---|---|
| Armed, Running | `match_quit` | Discarded (nothing recorded) |
| Armed, Running, Closed | Restart (from Pause), Retry or Next level | Loading (the old match discarded, nothing recorded by the discard) |
| Closed | Player goes to the World Map | Discarded |

Any other trigger in a state is ignored. Pause is not a state: it is Screen Flow's flag, which stops all steps in Armed, Running and Closed.

### Interactions with Other Systems

| System | Direction | What flows | Owner of the interface |
|---|---|---|---|
| Campaign Level Data | in | The level record (rule 1) and `wait_for_first_rope` | Campaign Level Data defines the record; Level State consumes it |
| Troop Generation | out/in | Out: initialise (timers 0). In: reads each keep's `owner` for the win test | Troop Generation owns the count and owner |
| Keep Levels | out | Initialise levels from starting troops | Keep Levels |
| Rope Links | out/in | Out: initialise (no ropes). In: `rope_tied` starts the clock (rule 2) | Rope Links raises; Level State reacts |
| Troop Marching & Clashes | out/in | Out: initialise (no pawns). In: `pawns_in_flight(owner)` for the loss test; phase 7 of the per-step order | Troop Marching owns the pawns; Level State owns the test |
| Rival AI | out | `clock_started` and `match_ending`; the rival does nothing before the first and stops at the second | Level State raises; Rival AI obeys |
| Screen Flow & Scene Manager | both | In: start, restart and `match_quit` requests, the pause state. Out: the Win or Lose overlay request with the result record, and `pause_allowed` | Screen Flow owns the pause state and the transitions; Level State owns the record |
| Save & Progress | out | `record_level_result` or `record_level_played`, then `flush()` (rule 6) | Save & Progress merges; Level State decides what a result is |
| Level HUD | out | State (Armed, Running, Ending), clock time, the result record, the Armed hint | Level State raises; HUD draws |
| Touch & Mouse Input | via Screen Flow | Nothing direct. In Ending Level State asks Screen Flow to lock input with `pause_allowed = false`; Screen Flow calls `lock()` (Touch & Mouse Input rule 10) on the deciding step and `unlock()` when the result overlay opens (Closed refuses ties and cuts, so the table stays inert) | Screen Flow owns the lock; Touch & Mouse Input obeys |
| Stars & Rewards (UAT-2) | in/out | In: the star count for a win, replacing `win_stars`. Out: the result record | Stars & Rewards |
| World Map & Regions | out | Nothing directly: it reads the results Save & Progress stores | World Map & Regions |

## Formulas

### F1. Win test

The win_test formula is defined as:

`won = ∀ k ∈ keeps : owner(k) = player`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| keeps | set of keep | 2–N (N set by Campaign Level Data) | data file (level record) | Every keep of the level, neutral, rival and player |
| owner(k) | enum | neutral, player, rival | calculated (Troop Generation owns it) | Current owner of keep k, after phase 6 of the step |

**Output Range:** true or false, once per step, only while Running.
**Example:** a level with 6 keeps, the player owning 5 and the rival 1: false. The step on which the player's pawn takes the sixth: true, and that step is the deciding step.

### F2. Loss test

The loss_test formula is defined as:

`lost = ( |{ k : owner(k) = player }| = 0 ) ∧ ( pawns_in_flight(player) = 0 )`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| owned(player) | int | 0–N | calculated | Keeps the player owns after phase 6 of the step |
| pawns_in_flight(player) | int | 0–`pawns_in_flight_max` (600) | calculated (Troop Marching & Clashes, rule 15) | The player's pawns still marching (Troop Marching's Marching state): a pawn that falls, arrives or is lost leaves the count on that step, and a Fallen pawn still fading on screen is not counted (Troop Marching rule 15, AC-M35; decided 2026-11-22) |

**Output Range:** true or false, once per step, only while Running. With no keeps left the player has no ropes (a captured keep's ropes are cut) and no relays, so `pawns_in_flight(player)` can only fall: a player with no keep is lost within `L_max / pawn_speed` seconds plus one step, unless a landing pawn captures a keep first. The longest legal rope is the diagonal of the box Campaign Level Data's B2 leaves for keep centres, √((720 − 2r)² + (1,280 − 2r)²) with r = `keep_hit_radius`: 1,258 px at baseline r 78, so at `pawn_speed` 110 px/s that is at most about 11.4 s (1,338 px and 12.2 s at the I1 floor r 48).
**Example:** the player's last keep falls while 3 pawns are 2 s from a neutral keep holding 0 troops. Not lost on that step. Two seconds later the first pawn captures it: `owned` is 1, the loss is cancelled. Had the neutral keep held 5 troops, the pawns would die on arrival and `lost` would become true on the step the last one fell.

### F3. Match time

The match_time formula is defined as:

`clock_steps = deciding_step − start_step + 1`, `time = round(clock_steps / 60, 1)`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| start_step | int | ≥ 0 | calculated | The first step the clock counts: the match's step 0, or the step that accepts the first rope on a level that waits (rule 2) |
| deciding_step | int | ≥ start_step | calculated | The step on which F1 or F2 first holds |
| clock_steps | int | ≥ 1 | calculated | Steps counted; paused steps are never counted because no step runs while paused |
| time | float, seconds | 0.0–any (no timeout) | calculated | Stored with a win (Save & Progress `time` ≥ 0), shown on a loss |

**Output Range:** 0.0 s at the least (one step is 1/60 s and rounds to 0.0; in play a pawn needs several seconds to march, so real values start well above that); a normal level is 2–3 minutes (Pillar 2), so about 7,200–10,800 steps and a `time` of 120.0–180.0. There is no upper bound and none is needed: the match has no timer (see Edge Cases).
**Example:** the first rope is accepted on step 0 and the deciding step is 5,430. `clock_steps` = 5,431, `time` = round(90.516, 1) = 90.5 s.

### F4. End delay in steps

The end_delay_steps formula is defined as:

`end_delay_steps = ceil(end_delay × 60)`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| end_delay | float, seconds | 0–5 (baseline 1.5) | data file | Wait between the deciding step and the overlay request |

**Output Range:** 0–300 steps; 90 at baseline. The overlay is requested on step `deciding_step + end_delay_steps`; at 0 it is requested on the step right after the deciding step.
**Example:** `end_delay` 1.5 → 90 steps; deciding step 5,430 → overlay requested on step 5,520.

### Level data invariant L1

A level must start with at least one keep owned by the player and at least one keep not owned by the player, or F1 or F2 would hold at step 0. A development build stops with an error naming the level; a shipped build refuses to load it (Screen Flow's load-failure rule). This is Campaign Level Data's to guarantee; it is stated here because this system is the one that would end the match at once.

### Boundary check and loops

Each formula was worked at its minimum, its maximum and at 0. F1 is vacuously true for an empty level and F2 true for a level with no player keep; L1 closes both. No other input breaks a formula: `end_delay` 0 and 5 both give a sensible delay, and `clock_steps` cannot be 0 because the deciding step itself is counted. This system has no feedback loop: it reads state and ends the match; it changes no value that feeds back into F1 or F2.

## Edge Cases

- **If a keep changes hands twice on one step** (captured, then recaptured in phase 5): the win and loss test sees only the final state of the step. Intermediate ownership never counts, so no win or loss can be missed or invented between two arrivals.
- **If the player takes the rival's last keep on the same step the rival takes the player's last keep**: after the step the player owns the one and the rival the other. Neither F1 nor F2 holds and the match goes on.
- **If the player's last keep falls while their pawns are still marching**: not lost (F2). If a landing pawn captures a keep before the last one falls, the player stays in; otherwise `lost` becomes true on the step the last pawn falls, at most `L_max / pawn_speed` after the keep was lost.
- **If the first rope is attempted but refused** (`tie_refused`, for any reason): the clock does not start. Only an accepted `rope_tied` starts it.
- **If the player cuts the first rope at once**: the clock keeps running. It never returns to Armed; the level is Running for good.
- **If the player never ties a rope on an Armed level**: the match stays Armed with no limit. Nothing generates, nothing moves, the rival does nothing, and no win or loss can occur. There is no timer and no loss for waiting; the Level HUD shows its Armed hint.
- **If the app goes to the background or Pause is opened while Armed**: the Pause overlay opens as for any level; the clock has not started and resuming returns to Armed. A rope tie accepted on the same frame as the Pause press is accepted first (it started the clock), then the pause stops the steps.
- **If Restart is confirmed on an Armed level, or a flagged level is started again** (Retry): the new match is Armed again with the clock at 0 (rule 8). The first-rope wait applies to every attempt, not only the first.
- **If the match has no end** (a stalemate: both sides cannot make progress): this system adds no timer and no draw. Breaking a stalemate is the rival's job (Rival AI's stall breakers); a player can always Quit or Restart from Pause.
- **If the player wins while their pawns are still in flight**: they freeze in place, are drawn behind the overlay and have no effect on the record (rule 4). They are discarded with the match.
- **If the app is killed after the deciding step but before the overlay**: the result was flushed on the deciding step and is stored. On the next launch the player is at the World Map (matches are never saved) with the level shown as beaten, or as played after a loss. If it is killed on the deciding step before `flush()` completes, nothing was recorded and Save & Progress's own backup rules apply.
- **If `flush()` fails** (the device refuses the write): the overlay still opens on time. Save & Progress shows its own message and keeps the result in memory; it is written with the next change (Save & Progress AC8).
- **If a Restart, Retry, Next level or `match_quit` request arrives during Loading or Ending**: ignored. Screen Flow already ignores requests during a transition, and Pause is not offered during Ending (rule 10).
- **If the player wins a level they have already beaten with a better time**: the result is recorded and merged; Save & Progress keeps the better `time` and counts one more play (its Core Rule 5). The overlay shows this attempt's `time`.
- **If a level's data breaks L1** (no player keep, or no other keep): the match is never built; Screen Flow's load-failure rule returns to the previous screen with a message and nothing is recorded.
- **If the player abandons by closing the app during play**: the match is lost with the process; nothing is recorded and no play is counted, the same as Quit.

## Dependencies

| System | Nature | Direction | What this GDD needs or gives | GDD status |
|---|---|---|---|---|
| Troop Marching & Clashes | Hard | in | `pawns_in_flight(owner)` for F2; phase 7 of its per-step order is this system's test | Designed |
| Troop Generation | Hard | in/out | In: each keep's `owner` for F1 and F2. Out: initialise (timers 0) and the Rule 5 exception, which it already records | In Review |
| Rope Links | Hard | in/out | In: `rope_tied` starts the clock (Core Rule 2). Out: initialise (no ropes, counters 0) | In Review |
| Screen Flow & Scene Manager | Hard | both | In: start, Restart, Retry, Next level, `match_quit`, the pause state. Out: the overlay request with the result record, `pause_allowed`, the input lock in Ending | In Review |
| Save & Progress | Hard | out | `record_level_result` or `record_level_played`, then `flush()`, before the overlay request | In Review |
| Keep Levels | Soft | out | Initialise each keep's level from its starting troops (its Rule 8) | In Review |
| Campaign Level Data | Soft (data contract) | in | The level record: `level_id`, `keeps[]` (id, position, owner, starting troops), `wait_for_first_rope`, the rival's parameters. **This GDD defines what it needs; Campaign Level Data fills it.** Not a design cycle: the contract is defined here | Not yet designed (provisional) |
| Touch & Mouse Input | Soft | via Screen Flow | Input is locked during Ending (see Interactions) | In Review |
| **Depended on by** | | | | |
| Rival AI | Hard | out | `clock_started` and `match_ending`; it does nothing before the first and stops at the second | Not yet designed |
| Level HUD | Hard | out | State (Armed, Running, Ending), the clock `time`, the result record and the Armed hint | Not yet designed |
| Campaign Level Data | Hard | out | The record contract above | Not yet designed |
| Menus & Screens | Soft | out | The content of the Win and Lose overlays (the result record) | Not yet designed |
| Stars & Rewards (UAT-2) | Hard | in/out | Supplies `stars` in place of `win_stars`; receives the result record | Not yet designed |

**Bidirectional check.** Troop Marching & Clashes, Troop Generation, Screen Flow & Scene Manager and Save & Progress already name this system. **Rope Links, Keep Levels and Touch & Mouse Input do not**: their GDDs need a line each (see Cross-References). `systems-index.md` lists this system as depending on Troop Marching, Screen Flow and Save & Progress; it should also list Troop Generation, Rope Links, Keep Levels and Campaign Level Data (soft).

## Visual/Audio Requirements

This system draws nothing and plays nothing; it raises the moments others present. It raises `clock_started`, `match_won` and `match_lost` (at the deciding step) and `result_requested` (when the overlay is asked for). Feedback & Juice and Audio (after UAT-1) hang the capture flash, the win or lose sting and the overlay entrance on those events. The one visual requirement that belongs here: at the deciding step the board freezes exactly as it is, pawns included (rule 4), and stays visible for `end_delay`, so the last capture can be read (Pillar 2). The Win and Lose overlays' look is Menus & Screens'.

## Game Feel

- **The end lands, it does not cut.** From the deciding step to the overlay is `end_delay` (1.5 s, 90 steps): long enough to see who took the last keep, short enough that a 2–3 minute level does not stall. Playtest question for UAT-1: did the last capture register before the overlay covered it? (AC27.)
- **Starting is instant.** On an Armed level the first rope is the starting gun: pawns must be visibly marching within 1 s of the tie (Rope Links AC30), and nothing else on the table moves before it, so a first-time player is never rushed.
- **Retry is quick.** Building a match (rule 1) should feel instant after Retry or Restart. A target for the build step on the minimum phone is to be set in Technical Setup; none is invented here.

## UI Requirements

This system has no screen of its own. It gives the Level HUD: the state (Armed, Running, Ending), the clock `time` (optional to show), and, while Armed, the information to show a one-line hint such as "Tie a rope to begin" (wording and place are the HUD's). It gives Menus & Screens the result record for the Win overlay (outcome, stars, `time`, and Next level only when World Map & Regions says one exists) and the Lose overlay (outcome, `time`). In UAT-1 `win_stars` 1 is stored but not drawn: the Win overlay's star row is an empty slot until Stars & Rewards exists (Menus & Screens rule 4, decided 2026-11-22; World Map & Regions rule 12 likewise).

> **UX Flag — Level State & Match Flow**: this system supplies content to the Level HUD and the Win and Lose overlays. Run `/ux-design` for those screens before writing epics; stories that touch the UI should cite `design/ux/[screen].md`.

## Cross-References

| This GDD relies on | In | What it relies on |
|---|---|---|
| Troop Generation | Rule 5; timers; `owner` | Rule 5 gets the first-rope exception (already recorded there); each timer is 0 at build and runs from the clock's step 0 |
| Troop Marching & Clashes | Per-step order phase 7; rule 15 | The win and loss test runs last; `pawns_in_flight(owner)`; Open Question 8 (pawns at match end) is decided here: freeze |
| Save & Progress | Core Rules 5 and 6; AC8, AC20 | `record_level_result`, `record_level_played`, `flush()` before the overlay; quits and restarts record nothing; stars 0–3, time ≥ 0 |
| Screen Flow & Scene Manager | Rules 4, 5, 7, 8, 10 | Pause state, input lock, the Restart and Quit confirmations, Retry and Next level, the overlay request |
| Rope Links | Core Rule 4; events | `rope_tied` starts the clock; initialisation |
| Keep Levels | Rule 8 | A level from starting troops, with no history |
| Touch & Mouse Input | Rule 10 | `lock()` during Ending, called by Screen Flow |

**Edits other documents need as a result of this GDD** (1–8 applied 2026-11-22; the touched GDDs are In Review and their re-review checks the new lines):
1. `rope-links.md`: add Level State & Match Flow to its Dependencies (`rope_tied` starts the clock on a level that waits; initialisation at build). Note that rope timers do not run while the match is Armed or frozen.
2. `keep-levels.md`: add Level State & Match Flow to its Dependencies (initialisation at build).
3. `touch-mouse-input.md`: add that Screen Flow locks input during Ending at Level State's request.
4. `troop-marching-clashes.md`: close Open Question 8 (freeze).
5. `screen-flow-scene-manager.md`: add `pause_allowed` and the Ending state to its Level rules (Pause, Back and the background open nothing during Ending), and state that Pause opened while Armed is allowed.
6. `save-progress.md`: record that the result record is `{outcome, level_id, stars, time}` and that `win_stars` is 1 in UAT-1.
7. `systems-index.md`: add Troop Generation, Rope Links, Keep Levels and Campaign Level Data (soft) to this system's Depends On.
8. `design/registry/entities.yaml`: register `end_delay` (1.5 s), `win_stars` (1), `wait_for_first_rope` and the formulas F1–F4.

## Acceptance Criteria

Baseline data unless a criterion says otherwise: step 1/60 s, `end_delay` 1.5 s (90 steps), `win_stars` 1, `pawn_speed` 110, `lv2_at` 15, `lv3_at` 35, `gen_interval` 2.5 s. Tags: **[Logic]** automated test in `tests/unit/`; **[Integration: X]** automated test in `tests/integration/` with system X; **[Visual]** retained screenshot in `production/qa/evidence/`. Systems with no GDD yet (Rival AI, Campaign Level Data, Level HUD) are marked *provisional* and their criteria are confirmed when those GDDs are written.

- **AC1 [Logic] (rule 1)**: GIVEN a level record with 6 keeps (player 10 troops, rival 10, neutrals 25, 8, 8 and 40), WHEN the match is built, THEN the keeps' levels are 1, 1, 2, 1, 1, 3, every generation timer is 0, there are 0 ropes and 0 pawns, `seq` is 0 and every `relay_count` is 0.
- **AC2 [Logic] (rule 2)**: GIVEN a level with `wait_for_first_rope` true, WHEN 600 steps run with no rope tied, THEN the state is Armed, every keep's `troops` equals its starting value, every timer is 0, `clock_steps` is 0 and no win or loss test ran.
- **AC3 [Logic] (rule 2)**: GIVEN an Armed match, WHEN the player's first tie is accepted on step S, THEN the state is Running, step S runs the full per-step order with `clock_steps` 1 at its end, and the first generation beat arrives when `clock_steps` reaches 150.
- **AC4 [Logic] (rule 2)**: GIVEN an Armed match, WHEN a tie is refused (`tie_refused`, any reason), THEN the state is still Armed and `clock_steps` is 0.
- **AC5 [Logic] (rule 2)**: GIVEN a level with `wait_for_first_rope` false, WHEN the match is built, THEN the state is Running, `clock_started` is raised exactly once, on the first step after the build (step 0), and the first generation beat arrives when `clock_steps` reaches 150, with no rope tied; Rival AI's first think interval is drawn on that same step (Rival AI rule 3).
- **AC6 [Logic] (rule 3, F1)**: GIVEN 3 keeps with the player owning 2 and the third neutral at 0 troops, WHEN a player pawn arrives at it on step S, THEN at the end of S `won` is true, the state is Ending and the deciding step is S.
- **AC7 [Logic] (rule 3, F1 boundary)**: GIVEN 6 keeps with the player owning 5 and the rival 1, WHEN steps run with no ownership change, THEN `won` stays false; GIVEN a keep captured and recaptured on one step so that the final owner is unchanged, THEN no win or loss is reported on that step.
- **AC8 [Logic] (rule 3, F2)**: GIVEN the player owns 1 keep and has 3 pawns marching to a neutral keep at 0 troops, WHEN the rival captures the player's keep, THEN `lost` is false on that step; WHEN a pawn then captures the neutral keep, THEN `owned` is 1 and `lost` stays false.
- **AC9 [Logic] (F2 boundary)**: GIVEN the player owns 0 keeps and 1 pawn (strength 1) marching to a neutral keep holding 5 troops, WHEN the pawn arrives, THEN on that step the keep holds 4, `pawns_in_flight(player)` is 0 and `lost` is true.
- **AC10 [Logic] (F2 bound)**: GIVEN the player owns 0 keeps and one pawn 1,258 px from a neutral keep holding 5 troops, WHEN steps run, THEN `lost` is true no later than step 688 (1,258 px ÷ 110 px/s × 60 = 686.2 → 687 marches).
- **AC11 [Logic] (rule 4)**: GIVEN a deciding step D, WHEN steps D+1 to D+200 are requested, THEN no keep's `troops` changes, no pawn's position changes from its position at D, no `pawn_launched` is raised, and the frozen pawns are still reported by `pawns()`.
- **AC12 [Logic] (rule 5, F3)**: GIVEN a won match whose first rope was accepted on step 0 and whose deciding step is 5,430, THEN the result record is {outcome win, the level id, stars 1, time 90.5}.
- **AC13 [Logic] (rule 5, F3)**: GIVEN a lost match with `clock_steps` 3,610, THEN the record is {outcome loss, the level id, stars 0, time 60.2}.
- **AC14 [Logic] (F3 boundary)**: GIVEN `clock_steps` 1, THEN `time` is 0.0 and `record_level_result` accepts it (Save & Progress requires ≥ 0); GIVEN `clock_steps` 30, THEN `time` is 0.5.
- **AC15 [Logic] (rule 6, F4)**: GIVEN a win with deciding step 5,430, THEN `record_level_result` and `flush()` have both completed by the end of step 5,430, and the overlay is requested exactly once, on step 5,520 and not before.
- **AC16 [Logic] (F4 boundary)**: GIVEN `end_delay` 0, THEN the overlay is requested on step D+1; GIVEN `end_delay` 5, THEN on step D+300.
- **AC17 [Integration: Save & Progress] (rule 6)**: GIVEN a win and a file system that refuses writes, WHEN the deciding step ends, THEN `flush()` reports failure, the overlay is still requested on step D+90, the profile is Dirty, and the next recorded change writes both.
- **AC18 [Integration: Save & Progress] (rule 6)**: GIVEN a loss, THEN `record_level_played` is called once and `record_level_result` is never called; GIVEN a win, THEN `record_level_result` is called once and `record_level_played` never.
- **AC19 [Integration: Screen Flow] (rule 8)**: GIVEN a Running match with 4 ropes and 20 pawns, WHEN Restart is confirmed, THEN the old match is discarded and a new one is built with `clock_steps` 0, `seq` 0, all `relay_count` 0, 0 ropes and 0 pawns, Armed again if the level waits, and Save & Progress's play count for the level is unchanged.
- **AC20 [Integration: Screen Flow, Save & Progress] (rule 9)**: GIVEN a Running match, WHEN `match_quit` arrives, THEN the match is discarded and no write is made to the profile.
- **AC21 [Integration: Screen Flow] (rule 10)**: GIVEN a Pause open for 600 steps, WHEN the match resumes, THEN `clock_steps` is the same as before the Pause; GIVEN the state is Ending, THEN `pause_allowed` is false and a Back press or the app going to the background opens no overlay.
- **AC22 [Logic] (rule 11)**: GIVEN the same level record and the same scripted ties and cuts on the same steps, WHEN the match is run twice, THEN the outcome, the deciding step and `time` are identical.
- **AC23 [Logic] (rule 12, L1)**: GIVEN a level record with no player-owned keep, THEN the match is not built, a load failure is reported and nothing is recorded; likewise a record where the player owns every keep. GIVEN `end_delay` or `win_stars` changed in the data file, THEN the new value is used with no code change.
- **AC24 [Integration: Troop Generation] (rule 2)**: GIVEN an Armed level, WHEN the first tie is accepted, THEN every keep's generation timer starts from 0 on that step and no keep gains troops before `clock_steps` 150.
- **AC25 [Integration: Rival AI, provisional] (rule 2)**: GIVEN an Armed level, WHEN 600 steps run, THEN the rival has tied no rope, sent no pawn and `clock_started` is false; WHEN the first tie is accepted, THEN `clock_started` is true from that step.
- **AC26 [Integration: Troop Marching & Clashes] (rule 3)**: GIVEN the player's pawn captures the rival's last keep in phase 5 of step S, WHEN phase 7 runs, THEN the test sees the post-arrival owners and the win is reported on S, not S+1.
- **AC27 [Visual] (rule 4)**: A retained screenshot in `production/qa/evidence/` taken 1.4 s after a win shows the board frozen with the pawns that were marching still in place, and one taken at 1.6 s shows the Win overlay over it. Playtest question: did the last capture register before the overlay covered it?

**Coverage check.** Rules 1–6 and 8–12 each have at least one criterion; F1–F4 each have one plus a boundary (AC7, AC9, AC14, AC16); L1 is AC23; cross-system criteria are AC17–AC21, AC24–AC26. **Rule 7** (unlocks and conquest are World Map's) has no criterion here by design: it is tested in World Map & Regions. AC25 and the Level HUD's Armed hint are confirmed when those GDDs are written.

## Open Questions

| # | Question | Owner | Resolve by |
|---|----------|-------|------------|
| 1 | Closed (2026-11-22): Rival AI's stall breaker (its F4, `aggro_eff`) raises the rival's aggression by `stall_boost` per `stall_time` (45 s) without a capture, reset by any capture. This system still adds no timer or draw | — | — |
| 2 | Closed (2026-11-22): only the first level of the game (`gv-01`) waits; `wait_for_first_rope` is false elsewhere (Campaign Level Data rule 5) | — | — |
| 3 | `win_stars` 1 is a placeholder for UAT-1; the star rule belongs to Stars & Rewards | Stars & Rewards | UAT-2 |
| 4 | Closed (2026-11-22): yes, the Win overlay shows this attempt's `time` beside the stored best, under "Clear!" on every win, with no first-clear or new-best variants (Menus & Screens F1, revised 2026-11-22) | — | — |
| 5 | Can a loss be revived once (a rewarded ad or gems, in the brief as provisional)? It would add a state after Ending | Store build | After UAT |
| 6 | The build-time target for a match on the minimum phone (Retry should feel instant) | Technical Setup | First phone test |
| 7 | Closed (2026-11-22): no clock during play; `time` is shown on the Win and Lose overlays only (Level HUD rule 9, Pillar 2) | — | — |
