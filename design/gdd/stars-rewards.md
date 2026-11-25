# Stars & Rewards

> **Status**: In Design
> **Author**: the player + Claude Code (/design-system)
> **Last Updated**: 2026-11-25
> **Last Verified**: 2026-11-25
> **Implements Pillar**: 3. Paint the map, grow the army (`design/gdd/game-concept.md` § Pillars)

> **Creative Director Review (CD-GDD-ALIGN)**: skipped — Lean mode

## Summary

Stars & Rewards gives every level three stars: one for winning, one for winning within the level's star time, one for winning without losing a keep. Stars are kept once earned; each pays gold once, every win pays a little more, and conquering a region pays diamonds on the map. It is the reason to replay a level and the source of everything the army layer spends.

> **Quick reference** — Layer: `Feature` · Priority: `MVP (UAT-2)` · Key deps: `Level State & Match Flow, Troop Marching & Clashes, Campaign Level Data, Save & Progress, World Map & Regions, Currencies & Economy`

## Overview

Stars & Rewards decides what a win is worth. Every level has three star goals: win the level, win it within the level's star time, and win it without losing a keep. Each goal is kept once it is earned, in any attempt, so a level's stars are the number of goals the player holds (0–3). A win pays gold once for each goal earned for the first time, plus a small amount for every win, and conquering a region pays a fixed number of diamonds, shown in the World Map's conquest sequence. The system watches each match for a lost keep, scores the win when Level State asks, stores which goals are held, and hands the amounts to Currencies & Economy, which owns the wallets and the numbers. The player meets it on the Win overlay (which stars this attempt earned and what they paid) and on the map (stars under each banner). Without it a win only opens the next node: there would be no reason to replay a level and nothing to spend on the army (Pillar 3).

## Detailed Design

### Core Rules

1. **Three goals per level.** Each level has the same three goals, each worth one star:
   - `win`: the level is won.
   - `time`: the level is won with `time` ≤ the level's `star_time`, where `time` is the result record's time (Level State F3, `match_time`, whole tenths of a second).
   - `clean`: the level is won with `keeps_lost` = 0 (rule 3).
   A goal is **met** by one attempt; it is **held** once any attempt has met it. A loss, a quit and a restart meet nothing.
2. **Held goals are kept.** A held goal is never lost: a later, worse win changes nothing. A level's stars are `held_stars`, the number of goals held (F2, 0–3). `time` and `clean` can be earned in different attempts (decided 2026-11-25).
3. **`keeps_lost`** counts, in one match, every `keep_captured(keep, old_owner, new_owner)` (Troop Marching & Clashes rule 12) whose `old_owner` is the player, from the match build up to and including the deciding step. A keep the player captured and then lost counts, and losing the same keep twice counts twice. The count starts at 0 on every `start(level_id)` (first start, Restart, Retry, Next level). The match shows no count.
4. **`star_time`** is one value per level, in the level record's reserved `stars` block as `stars.time` (Campaign Level Data rule 3): seconds, in whole tenths, > 0. A record with no `stars` block has no `time` goal, so that level can hold at most 2 stars; this is logged once per load. A level may be authored that way on purpose.
5. **Scoring a win.** At the end of the deciding step of a won match, before Level State records the result (its rule 6), Level State calls `score_win(level_id, time)`. In order, Stars & Rewards:
   1. works out the goals met by this attempt (F1);
   2. finds `new_goals`, the goals met that were not held before;
   3. marks them held in its own block of the progress file (rule 9);
   4. grants gold (rule 6);
   5. keeps a **win report** for the overlay (rule 8);
   6. returns `held_stars` after the merge.
   Level State puts that number in the result record's `stars` and passes it to `record_level_result`, then calls `flush()`. Stars, goals and gold therefore reach the device in the same write as the result.
6. **Gold for a win** (decided 2026-11-25) has two parts, added together in one call to `add_currency(gold, amount)` (Currencies & Economy rule 6):
   - **star gold**: `star_gold(level_id)` for each goal in `new_goals`; each goal of each level pays once, ever;
   - **win gold**: `win_gold(level_id)` for every win, including the first and every replay.
   The total is F3. Both amounts are Currencies & Economy's (its F2: star gold rises by region, win gold is a share of it). `add_currency` takes a whole amount of 1 or more, so a total of 0 is not sent. A loss pays nothing.
7. **Diamonds for a region** (decided 2026-11-22 and 2026-11-25). When a region is recorded as conquered for the first time (World Map & Regions rule 6: `record_region_conquered(region)` after the conquest sequence and its fog clear), Stars & Rewards adds `region_diamonds` through `add_currency(diamonds, amount)` before that record is flushed. The record is made once per region, so the reward is paid once per region. The amount is shown inside the conquest sequence, before it is granted; World Map reads it with `region_reward(region_id)`. If the app closes before the record, the sequence plays again and the diamonds are paid then: never lost, never twice.
8. **The win report** is what the Win overlay reads, read-only, with `win_report()`: the three goals, each marked *met this attempt*, *new* (first time held) and *held*; the level's `star_time` (or none); `keeps_lost`; star gold, win gold and their total. It describes the latest scored win only, is not stored, and is replaced by the next `score_win`. Menus & Screens draws from it; World Map draws stars per node from the stored best stars (its rule 12), which rule 5 keeps equal to `held_stars`.
9. **What is stored.** One named block in the progress file (Save & Progress rule 3): for each level id, the set of held goals. Save's own per-level best stars stays the number this system returned, so the two always agree; on load, if they differ, the held goals win and best stars is rewritten (logged). A held goal on a level that is not `beaten` is cleared (the same rule as Save rule 10). The block is removed by Delete progress with the rest of the profile, and currencies with it (Currencies & Economy).
10. **Old saves are re-scored** (decided 2026-11-25). The migration step that adds this block gives every `beaten` level the `win` goal, and the `time` goal when its stored best time ≤ its `star_time`. `clean` is never given: an old save does not say whether a keep was lost. Star gold is granted for each goal given; no win gold. Each region already in Save's conquered set is paid its `region_diamonds` once. The step runs once per file (Save rule 9), so nothing is paid twice. It runs after Currencies & Economy's step that creates the wallet (its rule 12), so every grant has a wallet to land in.
11. **Loss, quit, restart.** A loss records 0 stars (Level State rule 5) and never calls `score_win`. A quit or a restart discards the match and its `keeps_lost`; nothing is paid.
12. **Data.** `star_time` per level, and the amounts read from Currencies & Economy, are data-file values, never hardcoded. This system holds no amount of its own.

### States and Transitions

The system has one small tracker per match and no state between matches beyond the stored block.

| State | Meaning | Leaves when | Goes to |
|-------|---------|-------------|---------|
| Idle | No match is running; the stored block is readable; the last win report (if any) stays readable | Level State builds a match (`start(level_id)`) | Tracking, with `keeps_lost` 0 and the previous win report dropped |
| Tracking | Counting `keep_captured` events against the player (rule 3) | `score_win` is called (a win) | Scored |
| Tracking | (same) | The match is lost, quit or restarted | Idle (count discarded; a restart re-enters Tracking at 0) |
| Scored | Goals merged, gold granted, win report ready; further `keep_captured` events are ignored | The next `start(level_id)`, or the return to the World Map | Tracking, or Idle |

`score_win` is accepted only in Tracking, once per match; a second call returns the same number and pays nothing.

### Interactions with Other Systems

| System | Direction | Data | Owner of the interface |
|--------|-----------|------|------------------------|
| Level State & Match Flow | in/out | In: `start(level_id)` builds (reset the tracker); `score_win(level_id, time)` on a win. Out: `held_stars` for the result record's `stars`, replacing `win_stars` | Level State calls; this GDD defines `score_win` |
| Troop Marching & Clashes | in | `keep_captured(keep, old_owner, new_owner)` for `keeps_lost` | Troop Marching |
| Campaign Level Data | in | The level's `stars.time` (`star_time`); region ids for the diamond reward | Campaign Level Data owns the record; this GDD defines the `stars` block |
| Save & Progress | out | This system's block of held goals; a migration step (rule 10); reads `beaten`, best time and the conquered set in the migration | Save owns storage; this GDD owns the block's meaning |
| Currencies & Economy | in/out | In: the lookups `star_gold(level_id)`, `win_gold(level_id)` (by the level's region) and `region_diamonds(region_id)`. Out: `add_currency(gold, …)` inside `score_win`, `add_currency(diamonds, …)` on a first conquest record, and both in the migration step. The wallet is written by Save in the same flush | Currencies & Economy owns amounts, the wallet and `add_currency` (its rules 6, 8, 11) |
| World Map & Regions | in/out | In: the first-time conquest record (rule 7). Out: `region_reward(region_id)` for the conquest sequence; stars per node come from Save's best stars | World Map owns the sequence and the node art |
| Menus & Screens | out | `win_report()` for the Win overlay's star row and gold lines | Menus & Screens draws; this GDD owns the report |

## Formulas

Every amount is Currencies & Economy's (its F2 and F4). The examples use its defaults: in the Green Vale (region 1) `star_gold` 100, `win_gold` 10; across regions 1–5 `star_gold` 100 / 150 / 200 / 250 / 300 and `win_gold` 10 / 15 / 20 / 25 / 30; `region_diamonds` 50 for every region.

### F1. Goals met by one win

The goals_met formula is defined as:

`goals_met = { win } ∪ { time if star_time exists and time ≤ star_time } ∪ { clean if keeps_lost = 0 }`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| time | float, s | 0.0–180.0 in normal play; no upper bound | calculated (Level State F3, `match_time`) | This win's time, whole tenths |
| star_time | float, s, or none | 0.1 upward; none when the level has no `stars` block | data file (level record, `stars.time`) | The time to beat for the `time` goal |
| keeps_lost | int | 0 upward | calculated (rule 3) | Player keeps captured by the rival in this match |

**Output Range:** a set of 1 to 3 goals on a win; always contains `win`. `time` = `star_time` meets the goal (the comparison includes equality). `time` 0.0 (a win in 1 or 2 steps) meets it for any `star_time`. With `star_time` none the set has at most 2 goals.
**Example:** `time` 96.4, `star_time` 100.0, `keeps_lost` 2 → { win, time }. The same win with `keeps_lost` 0 → { win, time, clean }. `time` 100.1 with `keeps_lost` 0 → { win, clean }.

### F2. Stars held on a level

The held_stars formula is defined as:

`held_stars = count(held_goals)`, where after a win `held_goals = held_goals_before ∪ goals_met`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| held_goals_before | set of goals | 0–3 goals | calculated (this system's stored block) | Goals held before this win |
| goals_met | set of goals | 1–3 goals | calculated (F1) | Goals met by this win |

**Output Range:** 0 (never won) to 3; 1 to 3 after any win; never falls. It is the value stored as Save's best stars and drawn on the map.
**Example:** held { win, time } (2 stars); a slow win with no keep lost meets { win, clean } → held { win, time, clean }, `held_stars` 3, `new_goals` { clean }.

### F3. Gold for a win

The win_payout formula is defined as:

`win_payout = star_gold × count(new_goals) + win_gold`, where `new_goals = goals_met − held_goals_before`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| star_gold | int, gold | 0–2,000; Green Vale 100 | calculated (Currencies & Economy F2, `star_gold(level_id)`, from its data file) | Gold for each goal held for the first time |
| new_goals | set of goals | 0–3 goals | calculated (rule 5) | Goals met now and not held before |
| win_gold | int, gold | 0–200; Green Vale 10 | calculated (Currencies & Economy F2, `win_gold(level_id)`) | Gold for every win |

**Output Range:** `win_gold` (a replay that earns nothing new) to `3 × star_gold + win_gold` (a first win that meets all three), which is Currencies & Economy's `level_gold_max`: 0 to 6,200 over its safe ranges; 10 to 310 in the Green Vale and 30 to 930 in region 5 with its defaults. A total of 0 is not sent (`add_currency` refuses amounts under 1). A grant that would take the balance past `balance_cap` (999,999) is cut by Currencies & Economy (its rule 8); this formula is unchanged.
**Example:** first win of a Green Vale level, slow, one keep lost: `new_goals` { win } → 100 × 1 + 10 = 110. A replay that adds `time`: 100 × 1 + 10 = 110. A replay that adds nothing: 10. The same first win in region 3: 200 × 1 + 20 = 220.

### F4. How much replaying is worth

The replay_ratio formula is defined as:

`replay_ratio = (3 × star_gold) / win_gold`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| star_gold | int, gold | 0–2,000 | calculated (Currencies & Economy F2) | As F3 |
| win_gold | int, gold | > 0 for this formula; 0–200 | calculated (Currencies & Economy F2) | As F3 |

**Output Range:** the number of replay wins that pay as much as one level's three stars. Exactly 30 with the defaults in every region (`replay_percent` 10); above 30 when `replay_percent` is lower, or when `star_gold` is not a multiple of 10 (the floor in Currencies & Economy F2 rounds `win_gold` down). With `win_gold` 0 there is no replay gold and the ratio is not defined (no division is made in the game: this is a design check, not runtime code). **Requirement:** `replay_ratio` ≥ 30, that is `win_gold ≤ star_gold / 10`. Currencies & Economy holds it by construction as its invariant E1 (`replay_percent` ≤ 10). At 2 minutes a win (Pillar 2), 30 wins are about an hour of replay for the gold of one level's stars, so playing on is always the better source and replaying is the fallback for a stuck player.
**Example:** Green Vale: `star_gold` 100, `win_gold` 10 → 300 / 10 = 30. Region 3: 600 / 20 = 30.

**Totals for the UAT build** (5 levels, 1 region, the Green Vale defaults): star gold available 5 × 3 × 100 = 1,500, once; win gold 10 per win, unlimited; diamonds 1 × `region_diamonds` 50, once. Totals for later regions are Currencies & Economy's (its F3 table).

**`star_time` starting values.** Each level's `star_time` is set from UAT-1 playtest times: the time about one tester in three beats on their first win, so the goal is reachable and still asks for a replay from most players. Until those times exist, every level uses 120.0 (the low end of Pillar 2's 2–3 minutes).

**Feedback loops.** (1) Gold buys card upgrades, upgrades make wins faster and cleaner, which earns more stars. It is intended (Pillar 3) and bounded: star gold is a fixed total. (2) Win gold makes a stronger army, which replays faster. It is damped by F4's requirement and by the time a win takes.

## Edge Cases

- **If `time` equals `star_time` exactly**: the `time` goal is met (F1 includes equality).
- **If a level has no `stars` block**: it has no `time` goal; a win can meet `win` and `clean` only; the Win overlay draws the `time` star as unavailable, not as missed; one log line per load names the level.
- **If `star_time` is 0, negative or not a number**: Campaign Level Data's validation rejects the record's `stars` block (its rule for a bad field); this system then treats the level as having no `stars` block.
- **If the player loses a keep and takes it back**: `keeps_lost` stays 1; the `clean` goal is not met in that match.
- **If the player's last keep is captured but pawns still marching retake a keep and the match is later won**: `keeps_lost` ≥ 1, so `clean` is not met; `win` and `time` are judged as usual.
- **If a keep is captured on the deciding step itself**: only a capture *by* the player can decide a win, so it cannot be a loss of a player keep; a player keep lost earlier in the same step (Troop Marching's per-step order) counts.
- **If a neutral keep is captured by the rival**: it does not count; `old_owner` is not the player.
- **If the match is won while Level State is Armed and never Running**: it cannot happen; a win needs captures, which need the clock.
- **If `score_win` is called twice for one match**: the second call returns the same `held_stars`, pays nothing and leaves the win report unchanged.
- **If `score_win` is called for a level id with no stored entry**: an entry is created; this is the normal first win.
- **If the flush after a win fails**: the goals and gold are in memory with the result and are written by the next flush (Save rule 6); if the app closes first, the result, the goals and the gold are lost together, never one without the others.
- **If a replay meets fewer goals than are held**: nothing is removed; `new_goals` is empty; the payout is `win_gold`; the Win overlay shows the held stars as held and this attempt's goals as met.
- **If the stored held goals and Save's best stars disagree on load** (an edited file): the held goals win; best stars is rewritten and logged. If a level has held goals but is not `beaten`, the goals are cleared.
- **If the stored block names a goal this build does not know**: it is kept in the file and ignored, and does not count in `held_stars` (the same rule as Save's unknown ids).
- **If a level's `star_time` is changed in an update**: held goals stay held; nobody loses a star. A level that gains a `stars` block gives its `time` goal only to a later win, not from the stored best time (the re-score in rule 10 runs once, for old saves).
- **If a region is conquered while its diamonds amount is 0 or missing**: nothing is granted, the sequence shows no diamond line, and one log line names the region.
- **If a grant would take the gold or diamond balance past `balance_cap` (999,999)**: Currencies & Economy adds only the part that fits and logs the rest (its rule 8). The goals are still held, the win report shows the full amount earned, and the lost part is never paid again. In the UAT build the cap cannot be reached by normal play.
- **If several regions are pending celebration** (a restored file): each is paid at its own record, in World Map's order (its rule 7).
- **If Delete progress is confirmed**: held goals, gold and diamonds are removed together; replaying pays every goal again. This is not an exploit, because the wallet was emptied too.
- **If the old-save migration finds a beaten level with no stored time**: it gives `win` only.
- **Degenerate strategy, replay farming**: the fastest level can be replayed for `win_gold` without limit. It is accepted and bounded by F4's requirement; if playtests show farming replaces progress, `win_gold` goes to 0 for a level whose three goals are held (Open Question 3).
- **Degenerate strategy, turtling for `clean`**: a player may defend and never attack to keep the goal; the match has no timer, so the cost is their own time and the `time` goal. Accepted: the two goals pull in opposite directions by design.

## Dependencies

| System | Type | Direction | What crosses | Status |
|--------|------|-----------|--------------|--------|
| Level State & Match Flow | Hard | in/out | `start(level_id)`; `score_win(level_id, time)` → `held_stars` for the result record | Approved; needs the edits below |
| Troop Marching & Clashes | Hard | in | `keep_captured(keep, old_owner, new_owner)` | Approved; add this system as a reader |
| Campaign Level Data | Hard | in | `stars.time` per level; region ids | Approved; define the reserved block |
| Save & Progress | Hard | out | A block of held goals; a migration step | Approved; contract already named (its Interactions) |
| Currencies & Economy | Hard | in/out | `star_gold(level_id)`, `win_gold(level_id)`, `region_diamonds(region_id)`; `add_currency` | In Design (Detailed Design and Formulas approved, 2026-11-25); names this system in its Interactions |
| World Map & Regions | Hard | in/out | The first-time conquest record; `region_reward(region_id)`; stars per node (via Save) | Approved; closes its Open Question 6 |
| Menus & Screens | Hard (dependent) | out | `win_report()` for the star row and gold lines | Approved; its star row slot exists |
| Unit Cards & Upgrades, Faction Collection & Unlocks | Soft (dependents) | out | They spend the gold and diamonds granted here, through Currencies & Economy | Not designed |

**Bidirectional check.** Level State, Save & Progress, Campaign Level Data, World Map & Regions and Menus & Screens each already name Stars & Rewards in their Interactions and Dependencies. Troop Marching & Clashes does not: it must list this system as a reader of `keep_captured`. `systems-index.md` row 17 lists Level State, Currencies & Economy, World Map and Save; add Troop Marching & Clashes and Campaign Level Data.

**Edits this GDD asks of other documents** (not made here; each goes to the session that owns the file):

1. `level-state-match-flow.md`: rule 5 and rule 6 call `score_win(level_id, time)` at the end of a won deciding step, before `record_level_result`, and use its return as `stars`; `win_stars` stays as the value used when Stars & Rewards is absent (a UAT-1 build); close Open Question 3.
2. `campaign-level-data.md`: the `stars` block is `{ time }`, seconds in whole tenths, > 0, optional; a bad value rejects the block, not the level; Open Question 5 closes.
3. `troop-marching-clashes.md`: Interactions gains a Stars & Rewards row (out: `keep_captured`).
4. `save-progress.md`: the Stars & Rewards block (held goals per level) and its migration step; best stars is written from `held_stars`; the conquest record must let this system add diamonds before the flush (an event raised on a first-time `record_region_conquered`, or a call from World Map: the architecture decides which); Open Question on "best time with a revive or power" stays open (after UAT).
5. `world-map-regions.md`: the conquest sequence shows `region_reward(region_id)`; Open Question 6 closes; rule 12's stars are `held_stars`.
6. `menus-screens.md`: the Win overlay reads `win_report()`; the star row has three named stars (win, time, clean) and a gold line.
7. `level-hud.md`: no clock is shown during play (its rule 9), so the `time` goal has no in-match readout (Open Question 1).
8. `design/registry/entities.yaml`: register `goals_met`, `held_stars`, `win_payout`, `replay_ratio` (formulas) and note `win_stars` as the UAT-1 fallback.

## Visual/Audio Requirements

This system draws nothing itself; it supplies what three screens draw. `art-director` not consulted — Lean mode. Review manually before production.

- **Three stars, three meanings.** The stars are not interchangeable: each has a fixed place in the row (win, time, clean) and a small mark that tells them apart (art bible §3's UI shape grammar; the marks are the art director's). A player must be able to tell which goal is missing without reading text.
- **Four looks per star** on the Win overlay: *new* (earned now, the splash moment), *held* (earned before), *missed* (an empty outline) and *unavailable* (no `time` goal on this level; drawn absent or struck, never as missed).
- **On the map** a node shows its held stars under the banner, in the same order, at phone size (Pillar 2's glance test applies to the map too).
- **Diamonds** appear in the conquest sequence as an object arriving on the map, not only as a number (Pillar 3).
- **Audio** (after UAT, Audio GDD): one sound per new star, a distinct one for diamonds.

## Game Feel

- **The first stars are a reveal.** In UAT-1 no star was ever drawn (World Map rule 12), so the first Win overlay of UAT-2 is where stars first appear. New stars fill one by one (Menus & Screens' animation constraint), then the gold line counts up.
- **A replay is never a disappointment.** A win that earns nothing new still shows the held stars and pays `win_gold`; nothing on the overlay reads as a loss.
- **A missed star says why.** The overlay puts this attempt's time next to the `star_time`, and names the keep count lost, so the player knows what to do differently. Playtest question for UAT-2: after one win, can testers say what the other two stars ask for?

## UI Requirements

- **Win overlay** (Menus & Screens): the three-star row from `win_report()`; this attempt's time beside the level's `star_time`; a keeps-lost line when `clean` was missed; a gold line (total, with star gold and win gold readable). The buttons do not move (Menus & Screens AC6).
- **World Map**: held stars per Beaten node; the diamond amount inside the conquest sequence.
- **In the match**: nothing new. The HUD shows no clock (Level HUD rule 9), so the `time` goal cannot be read during play (Open Question 1).
- **A wallet readout** (gold and diamonds on the map or the collection) belongs to Currencies & Economy and Collection & Upgrade Screens.

> **📌 UX Flag — Stars & Rewards**: This system has UI requirements. In Phase 4 (Pre-Production), run `/ux-design` for the Win overlay and the World Map before writing epics (both specs are already owed: `/ux-design menus`, `/ux-design world-map`). Stories that reference UI should cite `design/ux/[screen].md`, not the GDD directly.

## Cross-References

| This document references | Target GDD | Specific element | Nature |
|--------------------------|------------|------------------|--------|
| The result record and when it is recorded | `level-state-match-flow.md` | Rules 5 and 6; F3 `match_time`; `win_stars` | This system supplies `stars` |
| Captures of player keeps | `troop-marching-clashes.md` | Rule 12, `keep_captured(keep, old_owner, new_owner)` | Event read |
| The level record's `stars` block | `campaign-level-data.md` | Rule 3 (reserved block), Open Question 5 | This GDD defines the block |
| Storage, merge, flush, migration, validation | `save-progress.md` | Rules 3, 5, 6, 9, 10 | Storage contract |
| The conquest sequence and its record | `world-map-regions.md` | Rules 6, 7, 12; Open Question 6 | Trigger for diamonds; stars per node |
| The Win overlay's star row | `menus-screens.md` | Rule 4, AC6, Animation constraints | Dependent, draws the win report |
| No clock during play | `level-hud.md` | Rule 9 | Constraint on showing the `time` goal |
| Reward amounts, the wallet, the grant call | `currencies-economy.md` (In Design) | Rules 6, 8, 11, 12; F2 (`star_gold`, `win_gold`), `region_diamonds`; invariant E1 | Amounts read by name; grants through `add_currency` |
| Rewards must show on the map or in the collection | `game-concept.md` | Pillar 3 and its test | Design constraint |

## Acceptance Criteria

Amounts use Currencies & Economy's Green Vale defaults `star_gold` 100, `win_gold` 10, `region_diamonds` 50 as test fixtures (a fixture file, not hardcoded values); the criteria hold for any amounts. `qa-lead` lens applied (Lean mode, Section H).

- **AC1 [Logic] (rule 1, F1)**: GIVEN a level with `star_time` 100.0, WHEN it is won in 96.4 with 2 player keeps lost, THEN the goals met are { win, time }.
- **AC2 [Logic] (F1 boundary)**: GIVEN `star_time` 100.0, WHEN a win has `time` 100.0, THEN `time` is met; WHEN `time` is 100.1, THEN it is not.
- **AC3 [Logic] (F1, rule 3)**: GIVEN a match in which no player keep is captured, WHEN it is won in 150.0 with `star_time` 100.0, THEN the goals met are { win, clean }.
- **AC4 [Logic] (rule 3)**: GIVEN a match, WHEN `keep_captured` fires with `old_owner` neutral and `new_owner` rival, and then with `old_owner` rival and `new_owner` player, THEN `keeps_lost` is 0; WHEN it fires with `old_owner` player, THEN `keeps_lost` is 1, and stays 1 after the player retakes that keep.
- **AC5 [Logic] (rule 3, rule 11)**: GIVEN a match with `keeps_lost` 2, WHEN the level is restarted, THEN `keeps_lost` is 0 in the new match.
- **AC6 [Logic] (rule 2, F2)**: GIVEN a level holding { win, time }, WHEN it is won slowly with no keep lost, THEN it holds { win, time, clean }, `score_win` returns 3 and `new_goals` is { clean }.
- **AC7 [Logic] (rule 2)**: GIVEN a level holding all three goals, WHEN it is won slowly with 3 keeps lost, THEN it still holds all three and `score_win` returns 3.
- **AC8 [Logic] (rule 4)**: GIVEN a level record with no `stars` block, WHEN it is won in 1.0 with no keep lost, THEN the goals met are { win, clean }, `score_win` returns 2, and one log line names the level.
- **AC9 [Logic] (F3)**: GIVEN a never-won level, WHEN its first win meets { win } only, THEN 110 gold is added (100 + 10); WHEN a replay then meets { win, time }, THEN 110 is added; WHEN a third win meets nothing new, THEN 10 is added.
- **AC10 [Logic] (F3 boundary)**: GIVEN a never-won level, WHEN its first win meets all three goals, THEN 310 gold is added; GIVEN `star_gold` 0 and `win_gold` 0, WHEN any win is scored, THEN `add_currency` is not called.
- **AC11 [Logic] (rule 5)**: GIVEN a match already scored, WHEN `score_win` is called again, THEN it returns the same number, adds no gold and the win report is unchanged.
- **AC12 [Logic] (rule 11)**: GIVEN a lost match and a quit match, THEN `score_win` was not called, no gold was added and no goal changed.
- **AC13 [Integration: Level State, Save & Progress] (rules 5, 9)**: GIVEN a fresh profile, WHEN gv-01 is won in 90.5 with `star_time` 120.0 and one keep lost, THEN after the deciding step's flush the file holds gv-01 beaten, best stars 2, time 90.5, held goals { win, time } and 210 gold, all from one write.
- **AC14 [Integration: Save & Progress] (rule 5, edge case)**: GIVEN the write after a win fails and the app is closed, WHEN it reopens, THEN the level's result, its held goals and its gold are all absent together.
- **AC15 [Logic] (rule 9)**: GIVEN a file whose held goals for a level are { win, clean } and whose best stars is 3, WHEN it loads, THEN best stars reads 2 and a log line names the level; GIVEN held goals on a level that is not beaten, THEN they are cleared.
- **AC16 [Integration: World Map & Regions] (rule 7)**: GIVEN the last level of a region has just been won, WHEN the conquest sequence ends or is skipped, THEN 50 diamonds are added and written with the conquest record; WHEN the map is opened again, THEN no diamonds are added.
- **AC17 [Integration: World Map & Regions] (rule 7)**: GIVEN the app is closed during the conquest sequence, WHEN it reopens, THEN the sequence plays again and exactly 50 diamonds are added in total.
- **AC18 [Logic] (rule 10)**: GIVEN an old save with gv-01 beaten at 95.0, gv-02 beaten at 140.0, both `star_time` 120.0, and region 1 not conquered, WHEN the new build loads it, THEN gv-01 holds { win, time }, gv-02 holds { win }, best stars are 2 and 1, 300 gold is added and no diamonds; WHEN it loads again, THEN nothing more is added.
- **AC19 [Logic] (rule 10)**: GIVEN an old save with region 1 in the conquered set, WHEN the new build loads it, THEN 50 diamonds are added once and no conquest sequence plays.
- **AC20 [Logic] (rule 8)**: GIVEN the win in AC6, THEN `win_report()` marks `win` held and met, `time` held and not met, `clean` met and new, `keeps_lost` 0, star gold 100, win gold 10, total 110.
- **AC21 [Logic] (F4)**: GIVEN the shipped data file, THEN `win_gold ≤ star_gold / 10` for every level (Currencies & Economy invariant E1, checked at load; this criterion fails if that check is absent).
- **AC22 [UI] (Visual/Audio, UI Requirements)**: retained screenshots in `production/qa/evidence/` on the minimum phone of the Win overlay with: one new star and two missed; three held stars and nothing new; a level with no `time` goal; and of the map with nodes holding 1, 2 and 3 stars. In each, the three stars can be told apart and the buttons are where Menus & Screens AC13 has them.
- **AC23 [Playtest] (Game Feel)**: after one win in UAT-2, at least 4 of 5 testers can say what the other two stars ask for.

**Gaps found by the QA lens.** F4 is a design check, so AC21 tests the data, not a runtime formula. Rule 12 (no hardcoded amounts) is covered by the fixture note, not by its own criterion. AC16, AC17 and AC19 depend on how the conquest record reaches this system (Dependencies, edit 4), which the architecture decides.

## Open Questions

| # | Question | Owner | Resolve by |
|---|----------|-------|------------|
| 1 | The `time` goal cannot be read during play, because the HUD shows no clock (decided 2026-11-22). Show the `star_time` before the level, a target on the HUD, or only on the Win overlay? | Level HUD, Menus & Screens (UX spec) | Before UAT-2 epics |
| 2 | ~~The final `star_gold`, `win_gold` and `region_diamonds`, and whether gold grows by region~~ Closed 2026-11-25: star gold 100 / 150 / 200 / 250 / 300 by region, win gold a tenth of it, 50 diamonds per region (Currencies & Economy F2, F4) | Currencies & Economy | Closed |
| 3 | Should `win_gold` stop on a level whose three goals are held, if playtests show farming? | Currencies & Economy, after UAT-2 playtest | UAT-2 playtest |
| 4 | Each level's `star_time`, from UAT-1 playtest times (120.0 until then) | Level designer | Before the UAT-2 build |
| 5 | Is `clean` reachable on every level? gv-04 and gv-05 open with 4 and 6 rival rope slots (Campaign Level Data balance note) | Level designer, playtest | UAT-2 playtest |
| 6 | Does a win with a god power or a revive still earn `time` and `clean`? | God & Goddess Powers, store build | After UAT |
| 7 | How the first-time conquest record reaches this system before the flush (a Save event or a World Map call) | Architecture (ADR) | Technical Setup |
