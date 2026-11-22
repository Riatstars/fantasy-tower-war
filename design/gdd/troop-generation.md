# Troop Generation

> **Status**: In Review (revised 2026-11-22 after the second review and the cross-GDD review, pending re-review)
> **Author**: user + Claude
> **Last Updated**: 2026-11-22
> **Last Verified**: 2026-11-22
> **Creative Director Review (CD-GDD-ALIGN)**: skipped — Lean mode
> **Implements Pillar**: 2. A tug-of-war you read at a glance (`design/gdd/game-concept.md` § Pillars)

## Summary

Troop Generation makes owned keeps add troops automatically on a steady 2.5-second beat, faster at higher keep levels, up to a cap of 60; neutral keeps never grow. It is the income that drives the whole match: it sets how fast keeps level up and how many pawns the player's ropes can pour onto a target, while sending troops stays free so a keep only loses troops when attacked. Its invariant I3 keeps an unfed keep from out-growing a single attacking rope; a keep fed by an allied rope can (an ally rope adds about 1.67 troops/s), which is the strongest move a player has.

> **Quick reference** — Layer: `Foundation` · Priority: `MVP` · Key deps: `Keep Levels, Campaign Level Data, Factions (soft, UAT-2)`

## Overview

Troop Generation is the income of a match. Every keep that belongs to a player or the rival holds a
count of troops and adds to it automatically on a steady beat; the higher the keep's level, the more
it adds per beat, up to a cap of 60. Neutral keeps do not generate: they hold a fixed garrison
that attackers wear down. The system is fully automatic: the player never presses anything to make
troops. Instead the player decides where the troops go, by tying ropes (Rope Links) that send them
out for free (a keep only loses troops when attacked). This makes the generation rate the metronome
of the whole game: it sets how fast keeps level up, how many pawns a rope can pour onto a target,
and how quickly a garrison grows back. Without it, there would be nothing to spend on ropes and no
reason for a match to move forward.

The system owns the keep's troop count and the generation beat. It does not decide the keep's level
(Keep Levels derives that from the count) and does not move troops out of the keep (Rope Links and
Troop Marching & Clashes do).

## Detailed Design

### Core Rules

1. Every keep carries four values: `owner` (neutral, player or rival), `troops` (a whole number, normally
   0 to `troop_cap`; it sits above the cap only when the cap was lowered under it, Edge Cases), `level` (1–3, supplied by Keep Levels) and a generation timer counted in whole game steps,
   from 0 up to `gen_interval_steps = round(gen_interval × 60)`.
2. Only owned keeps generate. A neutral keep's timer does not run and its troops never rise on their
   own; attackers wear its garrison down and it does not grow back.
3. Generation is discrete. Each fixed game step an owned keep's timer advances by 1. When the timer reaches
   `gen_interval_steps`, that is subtracted from it and the keep gains troops by F1: up to
   `troop_cap`, and nothing if it already holds `troop_cap` or more (a count above a lowered cap is kept, never cut). The level used is the one Keep Levels computed at the end of the previous
   step. Beats are phase 1 of the shared per-step order in Troop Marching & Clashes § Formulas.
4. At `troop_cap` a beat adds nothing, but the timer keeps running, so a keep knocked below the cap
   gains again on its next beat rather than waiting a full interval.
5. Generation is unconditional. It does not pause while the keep is under attack, has ropes tied, is
   sending pawns or is receiving allied pawns. Sending is free: launching a pawn never reduces
   `troops`. **One exception, decided 2026-11-22 (`game-concept.md` § Rival):** on a level whose
   `wait_for_first_rope` is true (only `gv-01` at baseline, Campaign Level Data) no keep generates
   until the player's first rope is accepted. That step is step 0 of the level clock and runs the
   full per-step order, beat phase included, so every owned keep's timer reads 1 after it. Level
   State & Match Flow owns the clock and the start trigger (its rule 2); before it starts, every
   timer stays at 0. On every other level timers run from the match's step 0 (AC26).
6. Other systems change `troops` only in these ways, all applied by Troop Marching & Clashes: an enemy
   pawn arriving removes 1; an allied pawn arriving adds 1 while below `troop_cap` (at or above the cap
   it is reported for Rope Links to relay, or lost past the relay limit); capture sets `troops` to 1.
7. On capture the owner changes, `troops` becomes 1, the timer resets to 0 and Keep Levels sets the
   level to 1. The new owner's generation starts on the next step. (Prototype difference: the
   prototype did not reset the timer, so a freshly captured keep could gain a troop at once.)
8. Timing counts fixed game steps, never the wall clock, so a paused game generates nothing and the
   same seed gives the same result. Generation uses no randomness.
9. Initial owner and troop counts come from Campaign Level Data; every timer starts at 0.
10. The numbers in Formulas are the neutral baseline. From UAT-2 (the army layer), Factions may supply
    `GenerationModifiers` (interval multiplier, per-level amount offsets, cap offset); with none
    supplied they are the identity and the baseline applies unchanged.

### States and Transitions

| State | Condition | Behaviour | Leaves when |
|-------|-----------|-----------|-------------|
| Neutral | `owner` is neutral | No timer, no gain | Captured: becomes Generating for the new owner (troops 1, timer 0) |
| Generating | Owned, `troops` below `troop_cap` | Timer runs; each beat adds `gen_amount[level]` | `troops` reaches `troop_cap` → Full. Captured by the other side → Generating for the new owner (troops 1, timer 0) |
| Full | Owned, `troops` at or above `troop_cap` | Timer runs; a beat adds 0 | `troops` falls below `troop_cap` (enemy pawns arrive) → Generating. A keep can only be captured at 0 troops, so it always passes through Generating first |

There is no state in which an owned keep stops generating for any other reason.

### Interactions with Other Systems

| System | Direction | Data | Interface owner |
|--------|-----------|------|-----------------|
| Keep Levels | both | In: `level` (1–3). Out: `troops`. Keep Levels derives the level from `troops`; Troop Generation reads it to pick `gen_amount`. Per step, Keep Levels recomputes the level first, then Troop Generation uses it on its next beat, so neither calls the other mid-step | Troop Generation owns `gen_amount[level]`; Keep Levels owns the level thresholds |
| Troop Marching & Clashes | in | Changes `troops` (±1 per arrival) and raises `keep_captured` | Troop Marching & Clashes |
| Rope Links | out | Reads `troops` and `troop_cap` to detect a full keep (its rule 10); I3 bounds its `send_interval`. Sending is free, so ropes never change `troops` | Rope Links owns `send_interval`; Troop Generation owns the count |
| Level State & Match Flow | out | Reads `owner` and `troops` to decide win and loss | Troop Generation (read-only to others) |
| Rival AI | out | Reads `owner` and `troops` of every keep (`level` comes from Keep Levels), and `troop_cap` as the scale of its stall gate (Rival AI F3); follows the same generation rules | Troop Generation |
| Campaign Level Data | in | Initial `owner` and `troops` per keep | Campaign Level Data |
| Level HUD, Feedback & Juice | out | Event "keep gained troops" (keep, amount) and "keep reached cap" | Troop Generation |
| Factions (UAT-2) | in | `GenerationModifiers`: interval multiplier, per-level amount offsets, cap offset (identity by default) | Factions defines values, Troop Generation defines the hook |

## Formulas

### F1. Generation beat

The generation_beat formula is defined as:

`troops_after = troops` if `troops ≥ troop_cap`, else `min(troop_cap, troops + gen_amount[level])`, applied each time the timer reaches `gen_interval_steps` (the timer then loses `gen_interval_steps`; baseline 150 steps).

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| troops | int | 0–`troop_cap` (above it only after the cap was lowered) | calculated | Keep's troop count before the beat |
| level | int | 1–3 | calculated (Keep Levels) | Keep's level; neutral keeps never beat |
| gen_amount[level] | int | 1–8 (baseline 1 / 2 / 3) | data file (`gen_l1`..`gen_l3`, registered as `gen_amount_level_1`..`3`) | Troops gained per beat at that level |
| gen_interval | float, seconds | 0.3–6 (baseline 2.5) | data file | Time between beats |
| troop_cap | int | 20–200 (baseline 60) | data file | Most troops a keep holds from generation |

**Output Range:** 0 to `troop_cap`, or the unchanged count when the keep already holds `troop_cap` or more. At or above the cap the beat adds 0 and never removes troops. At `troops` 0 an owned keep still gains normally (it is not captured until an enemy pawn arrives).
**Example:** a level 2 keep with 59 troops beats: `min(60, 59 + 2)` = 60. A keep holding 60 under a cap lowered to 50 beats: 60 (unchanged, AC22).

### F2. Generation rate

The generation_rate formula is defined as:

`R_gen(level) = gen_amount[level] / gen_interval`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| gen_amount[level] | int | 1–8 | data file | As F1 |
| gen_interval | float, seconds | 0.3–6 | data file | As F1 |

**Output Range:** baseline 0.4 / 0.8 / 1.2 troops per second at levels 1 / 2 / 3. Must stay below `R_send` (invariant I3).
**Example:** level 3: 3 / 2.5 = 1.2 troops per second.

### F3. Time to fill (no combat)

The fill_time formula is defined as:

`T_fill = gen_interval × Σ over levels ceil(troops gained at that level / gen_amount[level])`, where the troops gained at each level run from the entry count to the next level's threshold (`lv2_at`, `lv3_at`, then `troop_cap`).

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| lv2_at, lv3_at | int | 2–60, 5–120 (baseline 15, 35) | data file (owned by Keep Levels) | Troop counts where the level rises |
| start troops | int | 1–60 (baseline 10 for the player's first keep) | data file (Campaign Level Data) | Troops at the start |
| other variables | | | | As F1 |

**Output Range:** with the baseline, about 60 s from 10 troops to the cap; from 1 troop (a just-captured keep) 14 beats at level 1 (35 s) then the same 10 + 9 beats: 33 beats = 82.5 s.
**Example:** start 10: 5 beats at +1 reach 15 (level 2); 10 beats at +2 reach 35 (level 3); 9 beats at +3 reach 60 (last beat clamped): 24 beats × 2.5 s = 60 s.

### F4. Net change under attack (balance check, owned by this GDD as a constraint)

The attack_drain formula is defined as:

`net_loss(level) = n × R_send − R_gen(level)`, and `T_capture ≈ Σ over the level bands the keep passes through of (troops lost in that band) / net_loss(level)`, plus the last pawn's travel time

The bands come from Keep Levels' drop points (baseline: level 3 down to 30, level 2 down to 10, then level 1 to 0 plus one capturing pawn). `R_send` comes from Rope Links' `send_interval` (one pawn per interval); it is used here only to bound generation. An expected-value approximation: real play is stepped, and the step simulation is the reference for AC15.

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| n | int | 1–3 | calculated | Enemy ropes currently feeding pawns into this keep |
| R_send | float, per second | baseline 1 / 0.6 = 1.67 | data file (`send_interval`, owned by Rope Links) | Pawns per second down one rope |
| R_gen(level) | float | 0.4–1.2 | calculated (F2) | Keep's own generation |

**Output Range:** `net_loss` must be positive for `n` ≥ 1 at every level (invariant I3). Baseline, one rope: 0.47 / 0.87 / 1.27 per second at levels 3 / 2 / 1.
**Example:** level 3 keep with 40 troops, one enemy rope: 11 / 0.47 + 20 / 0.87 + 10 / 1.27 ≈ 23.6 + 23.1 + 7.9 ≈ 55 s (the step simulation, with Keep Levels' margin 5 holding the keep at level 3 down to 30 troops and at level 2 down to 10, gives the last send at 56.3 s and capture at step 3,541 = 59.0 s on a 300 px rope; the player decided on 2026-11-22 to keep the margin and this pace, replacing an earlier ≈ 52 s that had left the margin out); two ropes: 11 / 2.13 + 20 / 2.53 + 10 / 2.93 ≈ 16.5 s (an earlier simulation gave 15.6 s to the last send, but it predates the margin check: re-run it before tuning). Holding the level at 3 would give 88 s, which is why the bands matter.

### Invariants (checked when the data is loaded; the loader reports a breach)

- **I1.** `lv3_at ≤ troop_cap`, so level 3 is reachable by generation.
- **I2.** `1 ≤ gen_l1 ≤ gen_l2 ≤ gen_l3`, so every level gains and levelling up never lowers income.
- **I3.** `R_gen(3) < R_send`, that is `gen_l3 / gen_interval < 1 / send_interval`, so one enemy rope can always wear down a keep that generation alone feeds. It says nothing about a keep that an allied rope also feeds: an ally rope adds `R_send` (1.67 troops/s), more than any generation rate, so a fed keep can out-grow one enemy rope (decided 2026-11-22, cross-GDD review H5: intended; the rival does not feed its keeps this way, Rival AI rule 10). It is the same inequality as Rope Links' R1 and is checked once; a shipped build fixes a breach by lowering `send_interval` (Rope Links' clamp). Factions' `GenerationModifiers` must keep I1–I3 true.

### Feedback loop

More troops → higher level → faster generation → more troops. This is a positive loop and it is intended: it makes holding keeps valuable and rewards early captures. It is damped by `troop_cap` (growth stops at 60), by combat (arriving enemy pawns remove troops), and by I3 (no unfed keep out-grows a single rope; an allied feed rope can, which is the skill the loop rewards). Because sending is free there is no cost to attacking, so the loop is stronger than in a game where sending costs troops.

## Edge Cases

- **If an owned keep has 0 troops when its beat fires**: it gains `gen_amount[level]` as normal. A keep is captured only when an enemy pawn arrives at 0 troops, so a beat on the same step or earlier gives it a reprieve.
- **If a beat and an enemy arrival happen on the same step**: the beat resolves first, then arrivals. A keep at 0 troops that beats on that step survives the arrival.
- **If a keep is captured on the step it would have beaten**: the beat resolves for the old owner first; then capture sets `troops` to 1 and resets the timer for the new owner.
- **If `troops` is at or above `troop_cap` and an allied pawn arrives**: generation does not absorb it; Rope Links relays it onward (or it is lost if the keep has no outgoing rope, or after 6 relays).
- **If enemy pawns bring a Full keep below `troop_cap`**: the timer was still running, so the next beat can come within one `gen_interval`, not a full one.
- **If a keep's `troops` drop below its level's drop point** (Keep Levels' threshold minus its margin): the next beat uses the lower level's `gen_amount`; the timer is unchanged.
- **If `gen_interval` is changed while a game runs** (tuning panel): the timer keeps its value. If it already exceeds the new interval, one beat fires on the next step and the timer loses `gen_interval`. At most one beat fires per step, which is safe because `gen_interval` ≥ 0.3 s is far longer than one step.
- **If the game is paused**: no timer advances. On resume the timers continue where they stopped.
- **If a keep is neutral**: it never reverts to neutral after capture, so there is no transition into the Neutral state during play.
- **If the level input is outside 1–3**: Keep Levels guarantees the range; a value outside it is a defect. Development builds stop with an error naming the keep; shipped builds clamp to the nearest valid level and log it.
- **If the data loader finds a breach of I1, I2 or I3**: development builds stop with an error naming the breached rule and the values; shipped builds clamp and log it (I1 raises `troop_cap`, I2 raises the lower amount, I3 lowers `send_interval`). A level never starts with a breached invariant.
- **If `troop_cap` is lowered below a keep's current `troops`** (a Factions cap offset): troops above the cap are kept, never destroyed. Generation adds nothing until the keep falls below the cap.
- **If a keep is captured and recaptured repeatedly**: each capture sets `troops` to 1 and resets the timer, so a captured keep never gives its new owner a head start.

**Decided in other GDDs:**
- Two pawns of opposite sides arriving at the same keep on the same step: the keep's own side first (Troop Marching & Clashes rule 11).
- A ring of full allied keeps relaying in a loop: bounded by the relay limit (Troop Marching & Clashes rule 13). Generation is unaffected.

## Dependencies

Every system named here that has a GDD (Keep Levels, Rope Links, Troop Marching & Clashes, Rival AI, Level State & Match Flow, Campaign Level Data, Level HUD) was checked against this one in the cross-GDD review of 2026-11-22; the contracts with systems not yet designed (Factions, Unit Roster & Stats, Feedback & Juice) stay provisional until those GDDs exist.

### Depends on (upstream)

| System | Kind | What this system needs | Status |
|--------|------|------------------------|--------|
| Keep Levels | Hard | The keep's `level` (1–3), to pick `gen_amount`. Resolved without a cycle by per-step order: Keep Levels recomputes the level from `troops`, then Troop Generation uses it | Checked: Keep Levels Core Rule 4 states the same order |
| Campaign Level Data | Hard (data only) | Initial `owner` and `troops` of each keep | In Review |
| Factions (UAT-2) | Soft | `GenerationModifiers`, identity by default | Provisional |

### Depended on by (downstream)

| System | Kind | What it takes from this system |
|--------|------|-------------------------------|
| Keep Levels | Hard | `troops` of each keep, to derive the level |
| Troop Marching & Clashes | Hard | Owns the changes it makes to `troops` (±1 per arrival, capture to 1) and the timer reset on capture |
| Rope Links | Soft | `troops` and `troop_cap` to detect a full keep; I3 bounds its `send_interval` |
| Level State & Match Flow | Hard | `owner` and `troops`, for win and loss |
| Rival AI | Hard | `owner` and `troops` of every keep (it reads `level` from Keep Levels); `troop_cap` (its F3 stall gate) |
| Level HUD | Soft | `troops` for the on-screen count; works without events by reading each frame |
| Feedback & Juice | Soft | Events "keep gained troops" and "keep reached cap" |
| Factions (UAT-2) | Soft | Defines `GenerationModifiers` values; must keep invariants I1–I3 |

### Consistency to fix

- `systems-index.md` lists Level State & Match Flow, Rival AI and Level HUD as depending on Troop Generation (checked 2026-11-22); Feedback & Juice is added when its GDD is written.

## Visual/Audio Requirements

`art-director` not consulted — Lean mode. Review manually before production. There is no art bible yet, so no art-bible principle is cited; the look is set by the brief (anime pixel art, rune ropes).

**Visual**
- Each beat on an owned keep shows a small "+N" number rising from the keep and fading in about 0.5 s, in the owner's colour. N is the amount gained (1, 2 or 3).
- The keep's troop count plaque updates on the same frame as the beat and gives a brief scale pulse.
- A keep at `troop_cap` shows a distinct "full" mark (a gold glint on the plaque) so the player can see that further troops are wasted or relayed. The mark disappears as soon as the count drops below the cap.
- Neutral keeps show no beat effects: their stillness tells the player they are not growing.
- Every effect reads at phone size and uses the owner's colour (blue for the player, crimson for the rival); the number is drawn text, never an emoji.

**Audio**
- A soft, short tick or chime plays on each beat of the player's keeps only. The rival's beats are silent so the soundscape is not spammed. Several beats on one step play as one sound.
- A different, brighter note when the player's keep reaches the cap.

**Asset Spec** — Visual/Audio requirements are defined. After the art bible is approved, run `/asset-spec system:troop-generation` to produce per-asset descriptions, dimensions and generation prompts from this section.

## Game Feel

This system has no input of its own, so its feel targets are about readability and rhythm, not responsiveness.

- **Beat feedback latency**: the count change and the "+N" pop appear on the same frame as the beat. No tween delays the number: the displayed count is always the true count.
- **Rhythm**: at baseline a keep beats every 2.5 s. Starting timers are all 0, so every keep beats in step at first; this is a deliberate "heartbeat" of the table until captures desynchronise it (see Open Questions).
- **Weight**: a level 3 keep's +3 reads as heavier than a level 1 keep's +1: a larger number and a stronger pulse, scaled with N.
- **Clarity under attack**: when a keep is losing troops faster than it gains them, the player should still see the beat. Beat effects are not suppressed by combat effects.
- **Reference feel**: the steady, readable troop growth of the send-and-conquer genre (Galcon, Mushroom Wars). The game must never feel like troops arrive too fast to be worn down; invariant I3 protects this.

## UI Requirements

- Every keep, owned or neutral, always shows its current troop count on a plaque under the keep. The number is large enough to read on a phone held in portrait (the prototype used 23 px on a 720 px wide table; the accessibility GDD may raise it).
- Owned keeps (the player's and the rival's) show their rope slots (filled and empty) beside the count: shown by Keep Levels and Rope Links, placed by Level HUD.
- The "full" mark and the beat pop are described under Visual/Audio.
- The Level HUD's global strength bar sums every keep's `troops` for each side (pawns in flight are not counted, Level HUD rule 10); it reads `troops` from this system.

> **UX Flag — Troop Generation**: This system has UI requirements. In Pre-Production, run `/ux-design` to create a UX spec for each screen or HUD element this system contributes to (the keep plaque and the level HUD) before writing epics. Stories that reference UI should cite `design/ux/[screen].md`, not this GDD directly.

## Cross-References

Every entry whose GDD exists was checked in the cross-GDD review of 2026-11-22; entries for Factions, Unit Roster & Stats and Feedback & Juice are provisional until those GDDs exist.

| This GDD uses | Owned by | Item |
|---------------|----------|------|
| Level thresholds `lv2_at` (15), `lv3_at` (35) | Keep Levels | When a keep rises a level (F3, AC14, invariant I1) |
| `level` input each step | Keep Levels | Per-step order (Core Rules 3; AC11b) |
| `send_interval` (0.6 s) and `R_send` | Rope Links | Pawn rate used by invariant I3 and F4 |
| ±1 troop per pawn arrival, capture rule | Troop Marching & Clashes | How `troops` changes outside generation (Rule 6, 7) |
| Relay at `troop_cap` | Rope Links | What happens to allied pawns that reach a full keep (Rule 6, edge cases) |
| Initial owner and troops | Campaign Level Data | Rule 9, AC11 |
| `GenerationModifiers` | Factions | Rule 10, AC12, invariants I1–I3 |
| Win and loss reading | Level State & Match Flow | Reads `owner`, `troops` |

## Acceptance Criteria

Baseline data unless a criterion says otherwise: `gen_interval` 2.5 s, `gen_l1` / `gen_l2` / `gen_l3` = 1 / 2 / 3, `troop_cap` 60, `send_interval` 0.6 s, game step 1/60 s. Tags: **[Logic]** automated unit test; **[Integration]** automated test with the named system; **[Visual]** screenshot or playtest. In unit tests the keep's `level` is injected. Times are whole steps (seconds × 60).

**Core rules and formulas**

- **AC1 [Logic] (Rules 1, 3, F1)**: GIVEN a player keep at level 1 with 10 troops and timer 0, WHEN 150 game steps (2.5 s) run, THEN it has 11 troops.
- **AC2 [Logic] (F1)**: GIVEN three player keeps at levels 1, 2 and 3 with 20 troops each, WHEN one beat fires, THEN they have 21, 22 and 23 troops.
- **AC3 [Logic] (Rule 2)**: GIVEN a neutral keep with 8 troops, WHEN 60 s of steps run, THEN it still has 8 troops and its timer is 0.
- **AC4 [Logic] (Rule 4, F1 boundary)**: GIVEN a level 2 keep with 59 troops, WHEN a beat fires, THEN it has 60; WHEN another beat fires, THEN it still has 60.
- **AC5 [Logic] (Rule 4)**: GIVEN a keep at the cap whose timer reads 1.0 s, WHEN enemy pawns reduce it to 55 troops and 1.5 s of steps then run, THEN a beat fires on that step and it ends with 55 plus its level's `gen_amount`.
- **AC6 [Integration: Troop Marching & Clashes] (Rule 5)**: GIVEN a level 3 keep under attack by one enemy rope, WHEN 2.5 s of steps run, THEN exactly one beat fires for it, whatever the arrivals.
- **AC7 [Integration: Rope Links] (Rule 5)**: GIVEN a player keep with 20 troops and one rope out, WHEN it launches 5 pawns and no beat fires, THEN its `troops` is still 20.
- **AC8 [Integration: Troop Marching & Clashes] (Rules 6, 7)**: GIVEN a rival keep with 0 troops and timer 1.2 s, WHEN a player pawn arrives, THEN its owner is the player, `troops` is 1, its timer is 0 and its level is 1.
- **AC9 [Logic] (Rule 8)**: GIVEN a keep with timer 2.0 s, WHEN the game is paused for 10 s and then resumed for 0.5 s, THEN a beat fires only at the end of that 0.5 s, not before.
- **AC10 [Logic] (Rule 8)**: GIVEN the same level and seed, WHEN the level is run twice with identical inputs for 60 s, THEN every keep's `troops` is equal in both runs at every whole second.
- **AC11 [Logic] (Rule 9)**: GIVEN level data with a player keep at 10 troops and a rival keep at 15, WHEN the level starts, THEN those keeps hold 10 and 15 troops and every timer is 0.
- **AC11b [Integration: Keep Levels] (Rule 3, per-step order)**: GIVEN a keep at 14 troops and level 1 whose beat fires on step N (+1 → 15, which is the level 2 threshold), WHEN steps N and N+1 run, THEN step N's beat adds 1 (level 1), Keep Levels sets level 2 at the end of step N, and the next beat adds 2.
- **AC12 [Logic] (Rule 10)**: GIVEN a Factions modifier that doubles `gen_interval` (and satisfies I1–I3), WHEN 5.0 s of steps run on a level 1 keep, THEN it has beaten exactly once, at 5.0 s.
- **AC13 [Logic] (F2)**: GIVEN baseline data, WHEN `R_gen` is computed for levels 1, 2 and 3, THEN it returns 0.4, 0.8 and 1.2 troops per second.
- **AC14 [Integration: Keep Levels] (F3, boundary)**: GIVEN a player keep at 10 troops with no combat, WHEN the game runs, THEN it has 59 troops at 57.5 s and 60 at 60.0 s, and its level is 2 from 12.5 s and 3 from 37.5 s.
- **AC15 [Integration: Troop Marching & Clashes, Keep Levels] (F4, I3)**: GIVEN a level 3 keep with 40 troops and timer 0, attacked by one enemy rope of 300 px tied at t = 0 and no other change, WHEN the game runs with Keep Levels' margin 5, THEN it is captured between 55 s and 63 s (step simulation: step 3,541 = 59.0 s; same case as Troop Marching AC-M32).
- **AC26 [Integration: Level State & Match Flow] (Rule 5 exception)**: GIVEN `gv-01` (`wait_for_first_rope` true) with every timer at 0, WHEN 600 frames pass while the match is Armed and no rope is tied, THEN every keep's `troops` equals its start value and every timer reads 0; WHEN the player's first rope is accepted on clock step 0, THEN after that step every owned keep's timer reads 1, and its first beat fires on clock step 149. GIVEN a level whose `wait_for_first_rope` is false, THEN timers advance from the match's step 0.

**Invariants and loader**

- **AC16 [Logic] (I1)**: GIVEN data with `troop_cap` 30 and `lv3_at` 35, WHEN it loads in a development build, THEN loading stops with an error naming I1 and both values; in a shipped build `troop_cap` becomes 35 and a log line is written.
- **AC17 [Logic] (I2)**: GIVEN data with `gen_l1` 0, WHEN it loads in a development build, THEN loading stops with an error naming I2; the same for `gen_l1` 2 with `gen_l2` 1.
- **AC18 [Logic] (I3)**: GIVEN data with `gen_l3` 8 and `gen_interval` 0.3, WHEN it loads in a development build, THEN loading stops with an error naming I3, `R_gen(3)` 26.7 and `R_send` 1.67.
- **AC19 [Logic] (Edge)**: GIVEN a level input of 4, WHEN a beat is due, THEN a development build stops with an error naming the keep; a shipped build uses level 3 and logs it.

**Edge cases**

- **AC20 [Logic]**: GIVEN a keep with 0 troops at level 1 whose timer reaches 2.5 s on the same step an enemy pawn arrives, WHEN that step resolves, THEN the beat applies first and the keep ends with 0 troops and is still owned by its owner.
- **AC21 [Logic]**: GIVEN a keep captured on the step its timer also reaches `gen_interval`, WHEN that step resolves, THEN the beat applies for the old owner, then capture leaves `troops` 1 and the timer 0 for the new owner.
- **AC22 [Logic]**: GIVEN a keep with 60 troops and a cap modifier lowering `troop_cap` to 50, WHEN 10 s of steps run, THEN it still has 60 troops (none destroyed) and no beat adds any.
- **AC23 [Logic]**: GIVEN timer 180 steps (3.0 s) and `gen_interval` changed from 6 to 2.5 (150 steps), WHEN the next step runs, THEN one beat fires and the timer reads 31 steps (180 + 1 − 150).

**Cross-system and feel**

- **AC24 [Integration: Level HUD, Feedback & Juice] [Visual]**: GIVEN a player keep, WHEN a beat fires, THEN one "keep gained troops" event (keep, amount) is emitted and the keep's on-screen count shows the new value on the same frame. Screenshot evidence: a keep before and after a beat.
- **AC25 [Visual / playtest]**: GIVEN a recorded first-level playtest, THEN each owned keep's plaque changes on every beat (every 150 steps ± 1), and at least 4 of 5 testers answer "steady" or "fast" to "How did troop growth feel?".

**Performance budget (target to confirm on a phone):** generation for every keep in a level (up to about 15 on the largest planned layout) costs under 0.1 ms per frame on the mid-range Android target.

**Coverage check:** every core rule (1–10, Rule 5's first-rope exception through AC26) and every formula (F1–F4, invariants I1–I3) has at least one criterion; boundary values are covered at the cap (AC4), at 0 troops (AC20) and at invariant limits (AC16–18).

## Open Questions

| # | Question | Owner | Resolve by |
|---|----------|-------|------------|
| 1 | Should keep timers start staggered (for example offset by keep index) instead of all at 0, so beats do not all land on the same frame? Rule 9 currently starts every timer at 0 | game-designer | First Godot playable (MVP playtest) |
| 2 | Capture now resets the timer to 0 (Rule 7); the prototype kept the old timer. Is the difference noticeable or harmful to feel? | game-designer | First Godot playable |
| 3 | Does the rival follow the same generation numbers on every region, or does difficulty also scale through generation (for example a faster `gen_interval`)? I3 limits how far that can go. For UAT-1 the rival uses the same numbers everywhere and difficulty is Rival AI data (`think`, `aggro`; Rival AI rule 2, Campaign Level Data rule 12); revisit for UAT-2 | Rival AI / Campaign Level Data | UAT-2 |
| 4 | Per-race generation differences (Factions): which of interval, per-level amounts or cap may a race change, and how does each stay inside I1–I3? | Factions | UAT-2 |
| 5 | Closed (2026-11-22): the keep's own side first (Troop Marching & Clashes rule 11) | — | — |
| 6 | A ring of three or more full allied keeps relaying in a loop: acceptable, or limited by Rope Links? | Rope Links | Before that GDD |
| 7 | The performance target (under 0.1 ms per frame for all keeps) has not been measured on a phone | gameplay-programmer | Mobile Platform Integration (Vertical Slice) |
