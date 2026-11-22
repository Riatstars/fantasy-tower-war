# Keep Levels

> **Status**: In Review (revised 2026-11-22, pending re-review)
> **Author**: user + Claude
> **Last Updated**: 2026-11-22
> **Last Verified**: 2026-11-22
> **Creative Director Review (CD-GDD-ALIGN)**: skipped — Lean mode
> **Implements Pillar**: none (no game-pillars.md yet)

## Summary

Keep Levels derives each keep's level 1–3 (barracks, keep, castle) from its troop count: it rises the moment troops reach 15 or 35 and falls only when they drop 5 below that, so a keep under attack does not flicker. The level is how many ropes the keep may hold (1, 2, 3) and feeds Troop Generation's rate; on a drop the newest rope is cut, and capture resets to level 1. It exists so that holding troops in a keep is the game's one way to earn more ropes.

> **Quick reference** — Layer: `Core` · Priority: `MVP` · Key deps: `Troop Generation (hard), Campaign Level Data and Factions (soft)`

## Overview

Keep Levels turns a keep's troop count into its rank: level 1 is a wooden barracks, level 2 a
stone keep with a stable, level 3 a castle with a summoning circle. The level is the hook of the
whole game, because it is how many ropes the keep may hold at once (one, two or three) and, through
Troop Generation, how fast it grows. A keep rises a level the moment its troops reach a threshold
(15 for level 2, 35 for level 3) and only falls when its troops drop a clear margin below that
threshold (below 10, below 30), so a keep under attack does not flicker between levels and shed
ropes on every stray arrival. When it does fall, its newest rope is cut. A captured keep starts
again at level 1.

The player does nothing to level a keep except hold troops in it, which makes every rope a
trade: pouring troops out slows the sender's growth toward its next rope. Keep Levels owns the
thresholds, the drop margin and the ropes-per-level table, and recomputes every keep's level at
the end of each game step, before Troop Generation reads it. It does not own the troop count
(Troop Generation), the ropes themselves (Rope Links) or the keep's drawing (Level HUD and the art).

## Detailed Design

### Core Rules

`game-designer`, `art-director`, `narrative-director` and `systems-designer` not consulted — Lean mode. Review manually before production.

1. **Every keep has a level** of 1, 2 or 3, owned, neutral or rival alike. The level is derived from the keep's `troops` (Troop Generation owns that count) and from the keep's previous level; it is never set directly by another system, except the reset on capture (rule 7).
2. **Rising is immediate.** When `troops` reaches `lv2_at` the keep is at least level 2; when it reaches `lv3_at`, level 3. A keep can rise two levels in one step if its troops jump past both thresholds.
3. **Falling has a margin.** A keep at level L falls only when `troops` drops below `threshold[L] − level_drop_margin` (baseline: below 10 for level 2, below 30 for level 3). Between the rise threshold and the drop point the keep keeps its level. It can fall two levels in one step if its troops fall below the level 2 drop point.
4. **Per-step order.** At the end of every game step, after all troop changes of that step (beats, arrivals, captures), Keep Levels recomputes every keep's level. Troop Generation uses the recomputed level on its next beat; Rope Links reads it when a tie is attempted and when a drop needs ropes cut. This is the order both sides agreed to resolve the cycle between the two systems.
5. **Ropes per level.** A keep at level L may hold at most `max_ropes[L]` outgoing ropes: 1, 2 and 3. Rope Links enforces this when a rope is tied. Neutral keeps hold no ropes whatever their level.
6. **On a drop**, if the keep holds more ropes than its new level allows, Keep Levels raises `level_dropped(keep, old, new)` and Rope Links cuts the keep's **newest** ropes until the count fits. The cut ropes behave like any cut rope (Rope Links owns the sag and the pawns already on the rope).
7. **On capture** (Troop Marching & Clashes raises `keep_captured`; it sets the owner and `troops` to 1), the level is reset to 1 at once, in the same step, with no margin. Keep Levels raises no `level_dropped` for a capture: Rope Links cuts every outgoing rope on `keep_captured` itself (its rule 7). Troop Generation's Core Rule 7 already states the same reset.
8. **At match start** every keep's level is the rise rule applied to its initial troops (rule 2), with no history: a neutral with 25 troops starts at level 2, the player's keep with 10 at level 1.
9. **Events.** Keep Levels raises `level_rose(keep, old, new)` and `level_dropped(keep, old, new)` on the step the level changes (not for the capture reset, rule 7). Level HUD and Feedback & Juice react to them; Rope Links reacts to `level_dropped`.
10. **Data.** `lv2_at`, `lv3_at`, `level_drop_margin` and `max_ropes[1..3]` come from the data file. In Alpha, Factions may supply `LevelModifiers` (threshold offsets, a margin override, a `max_ropes` override per level); with none supplied the baseline applies. Every modified set must satisfy the invariants in Formulas.
11. **No other input.** Time held, kills, gold or anything else never changes a level; only troops do. This keeps the rule readable at a glance on the plaque.

### States and Transitions

The level is the state. Baseline thresholds 15 / 35 and margin 5.

| From | Condition at end of step | To | Side effect |
|------|--------------------------|----|-------------|
| 1 | `troops` ≥ 15 | 2 (or 3 if ≥ 35) | `level_rose` |
| 2 | `troops` ≥ 35 | 3 | `level_rose` |
| 2 | `troops` < 10 | 1 | `level_dropped`; newest rope cut if 2 held |
| 3 | `troops` < 30 and ≥ 10 | 2 | `level_dropped`; newest rope cut if 3 held |
| 3 | `troops` < 10 | 1 | `level_dropped`; ropes cut down to 1 |
| any | captured this step | 1 | none here; Rope Links cuts all on `keep_captured` |
| any | otherwise | same | none |

Between 10 and 14 troops a keep that was level 2 stays 2 and a keep that was level 1 stays 1: the two histories give two different levels for the same count, which is the margin working as intended. The same holds between 30 and 34 for levels 2 and 3.

### Interactions with Other Systems

| System | Direction | Data | Interface owner |
|--------|-----------|------|-----------------|
| Troop Generation | both | In: `troops` of every keep (read at end of step). Out: `level`, used by its next beat (its Core Rule 3 and Interactions table) | Keep Levels owns thresholds and margin; Troop Generation owns `gen_amount[level]` and `troops` |
| Rope Links | out | `max_ropes[level]` for the tie check; `level_dropped(keep, old, new)` to cut the newest ropes (capture cuts come from Troop Marching's `keep_captured`) | Keep Levels defines the limit and the "newest falls" rule; Rope Links executes cuts |
| Troop Marching & Clashes | in | `keep_captured` (owner change, `troops` = 1) triggers the reset to level 1 in the same step. From Alpha it reads the origin's level at launch to pick the unit | Troop Marching & Clashes |
| Campaign Level Data | in | Initial `troops` per keep, from which the starting level is derived (rule 8); it also decides which neutrals start at level 2 or 3 by giving them enough garrison | Campaign Level Data |
| Rival AI | out | Reads `level` and `max_ropes` of every keep to plan ties and to judge targets | Keep Levels (read-only) |
| Level HUD | out | `level` for the keep's storeys and the rope-slot dots; `level_rose` for the flourish | Keep Levels raises, Level HUD draws |
| Feedback & Juice | out | `level_rose` and `level_dropped` for effects and sound | Keep Levels raises |
| Touch & Mouse Input | none | The F6 target rule and hit tests do not read the level; the slot check it mentions is Rope Links' | Touch & Mouse Input |
| Unit Roster & Stats, Factions (Alpha) | in/out | Out: `level` decides which unit kind a keep produces (barracks soldiers, keep cavalry, castle summons). In: `LevelModifiers` per race | Each owning GDD, inside the invariants |

## Formulas

`systems-designer` lens applied by the author (Lean mode: Section D is a high-risk section). Boundaries worked below.

### F1. Rise level

The rise_level formula is defined as:

`rise_level(troops) = 3 if troops ≥ lv3_at; 2 if troops ≥ lv2_at; else 1`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| troops | int | 0–`troop_cap` (60) | calculated (Troop Generation) | The keep's troop count at end of step |
| lv2_at | int | 2–60 (baseline 15) | data file | Troops at which a keep becomes level 2 |
| lv3_at | int | 5–120 (baseline 35) | data file | Troops at which a keep becomes level 3 |

**Output Range:** 1 to 3. At 0 troops: 1. At the cap (60): 3 with the baseline.
**Example:** 14 → 1; 15 → 2; 34 → 2; 35 → 3.

### F2. Effective level with hysteresis

The effective_level formula is defined as:

`L = prev; while L > 1 and troops < threshold[L] − level_drop_margin: L = L − 1`; then `effective_level(troops, prev) = max(rise_level(troops), L)`, where `threshold[2] = lv2_at`, `threshold[3] = lv3_at`. The keep steps down one band at a time, so it keeps every level whose drop point it is still above.

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| prev | int | 1–3 | calculated | The keep's level at the end of the previous step |
| level_drop_margin | int | 0–20 (baseline 5, the player's choice) | data file | How far below its threshold a keep may fall before it loses the level |
| other variables | | | | As F1 |

**Output Range:** 1 to 3, never below `rise_level(troops)` and never above `prev` unless `rise_level` says so. With `level_drop_margin` 0 the formula equals F1 (the prototype's behaviour).
**Example:** prev 2, troops 12: 12 ≥ 10, so L stays 2 (held). prev 2, troops 9: 9 < 10, L = 1 (dropped). prev 3, troops 25: 25 < 30, L = 2; 25 ≥ 10, stop: 2 (dropped one). prev 3, troops 12: L = 2, 12 ≥ 10: 2 (dropped one, as the States table says). prev 3, troops 8: L = 2, then 8 < 10, L = 1 (dropped two). prev 1, troops 12: L = 1, max(1, 1) = 1 (a level 1 keep does not rise until 15).

### F3. Ropes per level

The max_ropes formula is defined as:

`max_ropes(level) = max_ropes_table[level]`, baseline `[1, 2, 3]`.

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| level | int | 1–3 | calculated (F2) | The keep's effective level |
| max_ropes_table | int[3] | each 1–3, non-decreasing (baseline 1, 2, 3; more than 3 is OQ 6) | data file | Outgoing ropes a keep may hold at each level |

**Output Range:** 1 to 3 at baseline. Rope Links refuses a tie when the keep already holds this many.
**Example:** a level 2 keep holding 2 ropes: a third tie is refused with "Level 2 keep: only 2 ropes."

### F4. Ropes to cut on a drop

The ropes_to_cut formula is defined as:

`ropes_to_cut = max(0, ropes_held − max_ropes(new_level))`, cut newest first.

**Output Range:** 0 to 3. F4 applies to level drops only; on capture Rope Links cuts every rope on `keep_captured` (Core Rule 7).
**Example:** level 3 holding 3 ropes drops to 2: cut 1 (the newest). Drops to 1: cut 2.

### Invariants (checked when the data is loaded; the loader reports a breach)

- **K1.** `1 < lv2_at < lv3_at`, so the three levels are distinct and reachable in order. Together with Troop Generation's I1 (`lv3_at ≤ troop_cap`), level 3 is reachable by generation.
- **K2.** `level_drop_margin < lv2_at`, so the level 2 drop point is above 0 and a level 2 keep at 0 troops is not still level 2 when captured. Baseline 5 < 15.
- **K3.** `level_drop_margin < lv3_at − lv2_at`, so the level 3 drop point (30) stays above the level 2 rise point (15), and a keep is never level 3 with fewer troops than level 2 needs. Baseline 5 < 20.
- **K4.** `max_ropes_table` is non-decreasing and `max_ropes_table[1] ≥ 1`, so a level 1 keep can always tie one rope and levelling up never removes a slot.

**Boundary findings (inputs that break the system without the invariants):**
- `level_drop_margin` 15 with `lv2_at` 15: a level 2 keep never drops (drop point 0). K2 catches it.
- `level_drop_margin` 20 with thresholds 15 / 35: a level 3 keep holds 3 ropes and 1.2 troops per second down to 15 troops, the level 2 rise point, and the level 2 drop point falls below 0. K2 and K3 both catch it; the largest margin valid for both is 14.
- `lv2_at` 2 (its minimum): a just-captured keep (1 troop) reaches level 2 on its first beat, 2.5 s after capture. Allowed by the invariants, since nothing breaks; a balance note, not a defect.
- `max_ropes_table` `[2, 1, 3]`: levelling up would cut a rope. K4 catches it.

### Feedback loop

Keep Levels is one half of Troop Generation's loop (more troops → higher level → faster generation → more troops); the damping (cap, combat, invariant I3) is described there. This GDD adds a second loop: a higher level allows more ropes, and more ropes let the keep attack or reinforce more targets. Since sending is free, more ropes never cost the sender troops, so this loop is damped only by the player's attention (each rope is a target to manage) and by Rope Links' rule that allied keeps do not rope each other both ways. The hysteresis margin damps the reverse loop: a keep losing troops under attack keeps its ropes a while longer, so a single lucky arrival does not cascade into a rope loss.

## Edge Cases

`systems-designer` not consulted — Lean mode. Review manually before production.

- **If a keep's troops rise past two thresholds in one step** (reinforcements from several ropes plus a beat): it rises straight to the higher level; one `level_rose(keep, 1, 3)` event, not two.
- **If a keep's troops fall below the level 2 drop point in one step from level 3**: it drops straight to 1; one `level_dropped(keep, 3, 1)`; ropes are cut down to 1.
- **If a beat and arrivals land on the same step**: Keep Levels runs once, after both, on the final count (rule 4). Troop Generation's own edge rule (beat before arrivals) decides the count; Keep Levels never sees the intermediate value.
- **If a keep is captured on a step its troops would also have crossed a threshold**: capture wins; the level is 1 (rule 7).
- **If a keep holds fewer ropes than its new level allows after a drop**: nothing is cut (F4 gives 0).
- **If a keep at level 2 sits at exactly 10 troops**: it holds level 2 (the drop needs *below* 10). At exactly 15 a level 1 keep rises. Boundaries are inclusive on the rise side and exclusive on the drop side.
- **If `level_drop_margin` is changed during a match** (tuning): the next end-of-step recompute uses the new margin; a keep that is now below its drop point drops on that step. No rope is cut retroactively beyond F4.
- **If a neutral keep's garrison falls below a drop point**: its level drops like any keep's (one rule for all). It has no ropes, so nothing is cut; the change is cosmetic and tells the player the garrison is shrinking.
- **If a neutral keep starts above `lv3_at`** (a guardian or a big garrison): it starts at level 3 and keeps it until its garrison falls below 30. On capture it resets to 1.
- **If the troop count exceeds the cap** (allowed transiently by Troop Generation's cap-offset edge case): the rise rule still applies; level 3 at most.
- **If two keeps change level on the same step**: events are raised in keep id order; nothing depends on the order.
- **If the data breaches K1–K4**: development builds stop with an error naming the rule and the values; shipped builds clamp to the nearest valid set (`lv3_at` raised to `lv2_at + 1`, the margin lowered to the largest valid value, the rope table made non-decreasing) and log it. A level never starts with a breached invariant.
- **If a level value outside 1–3 is ever observed** (a defect, not a data case): development builds stop naming the keep; shipped builds clamp and log, which is what Troop Generation's edge case already expects.
- **If a Factions override lowers a keep's `max_ropes` mid-match** (race change is not possible mid-match, so this cannot happen in play): treated as a drop for rope purposes, newest first.

**Open, owned by other GDDs** (not decided here):
- What happens to pawns already on a rope that is cut by a drop: Rope Links.
- Whether a guardian castle's level is fixed at 3 regardless of garrison: Guardian Castles.

## Dependencies

Troop Generation, Rope Links, Touch & Mouse Input and Troop Marching & Clashes have GDDs and are checked against this one. Every other system here has no GDD yet, so its contract is provisional.

### Depends on (upstream)

| System | Kind | What this system needs | Status |
|--------|------|------------------------|--------|
| Troop Generation | Hard | `troops` of every keep at the end of each step. The cycle (Troop Generation needs the level) is resolved by per-step order: Keep Levels recomputes first, Troop Generation uses the result on its next beat. Both GDDs state it | Checked: Troop Generation Core Rule 3, Interactions, Dependencies and AC11b say the same |
| Campaign Level Data | Soft (data only) | Initial troops per keep, for the starting level | Provisional |
| Factions (Alpha) | Soft | `LevelModifiers`, identity by default | Provisional |

### Depended on by (downstream)

| System | Kind | What it takes from this system |
|--------|------|-------------------------------|
| Troop Generation | Hard | `level` each step, to pick `gen_amount[level]`; thresholds `lv2_at`, `lv3_at` for its F3 and invariant I1 |
| Rope Links | Hard | `max_ropes[level]`; `level_dropped` to cut the newest ropes |
| Troop Marching & Clashes | Soft | Triggers the capture reset (`keep_captured`); does not read the level at MVP, reads the origin's level at launch from Alpha |
| Rival AI | Hard | `level` and `max_ropes` of every keep |
| Level HUD | Hard | `level` for storeys and slot dots; `level_rose` for the flourish |
| Feedback & Juice | Soft | `level_rose`, `level_dropped` |
| Campaign Level Data | Soft (a rule it must know) | Which initial garrisons give a neutral level 2 or 3 (F1) |
| Unit Roster & Stats, Factions (Alpha) | Hard | `level` decides the unit kind produced; `LevelModifiers` |

### Consistency to fix

- Registry: `entities.yaml` (about line 199) copies the old F2 expression; replace it with the step-down form above.

## Visual/Audio Requirements

`art-director` not consulted — Lean mode. Review manually before production. No art bible exists yet; the look follows the brief (anime pixel art, barracks → keep → castle).

**Visual**
- **Three silhouettes, one per level**, readable at phone size without the plaque: level 1 a low wooden barracks with a single banner; level 2 a stone keep, taller, with a stable building beside it; level 3 a castle with towers and a glowing summoning circle at its foot. Each level adds height and width, so a bigger keep reads as stronger from across the map.
- **Owner colour** on banner, roof trim and the circle: royal blue and gold for the player, crimson and black for the rival, monster green for neutrals. The silhouette is the same for every owner; colour and emblem differ.
- **Rising**: a short build-up animation (scaffold or stone rising, about 0.4 s) and a gold spark burst, with a floating text "Level 2 · 2 ropes" / "Level 3 · 3 ropes" so the player learns what the level buys. The new silhouette is in place by the end of the animation.
- **Falling**: a brief crumble (dust puffs, a storey sinking, about 0.3 s) and the newest rope's snap (Rope Links draws the snap). No floating text, to keep a losing moment from feeling like a lecture.
- **Rope slots**: the plaque under each player and rival keep shows `max_ropes` dots, filled for ropes held, hollow for free ones (Troop Generation's UI section already places them; the count comes from here). Neutral keeps hold no ropes and show none.
- Every figure is drawn; no emoji.

**Audio**
- Rising: a two-note upward chime for the player's keeps (louder for level 3). Rival rises are quieter; neutral keeps never change level upward.
- Falling: a low stone thud; the rope snap sound belongs to Rope Links.

📌 **Asset Spec** — Visual/Audio requirements are defined. After the art bible is approved, run `/asset-spec system:keep-levels` to produce per-asset descriptions, dimensions and generation prompts (three keep silhouettes per race, the build-up and crumble animations).

## Game Feel

- **A level-up is a reward the player saw coming.** The plaque's count climbs toward 15 or 35 in plain view, so the rise lands as "finally" rather than a surprise; the flourish and the new slot dot appear on the same step the level changes.
- **Falling is forgiving.** With the 5-troop margin, a keep under attack by one rope keeps its ropes for about 10 more arrivals at level 2 (5.8 s, since it still generates 0.8 troops/s) and 18 at level 3 (10.7 s) after dipping under the threshold, long enough for the player to cut a rope or reinforce. A single enemy pawn never costs a rope by itself.
- **Readable from the silhouette.** A player glancing at the map should know each keep's rope capacity from its shape alone, without reading numbers.
- **Weight**: level 3 feels heavier: a longer build-up, a deeper chime, a bigger castle.
- **Reference feel**: the clear tiers of Mushroom Wars' villages and the satisfying "unlocked one more lane" of Tentacle Wars.

## UI Requirements

- **Plaque**: the troop count (Troop Generation) plus `max_ropes` slot dots, filled and hollow. On a rise the new hollow dot appears with the flourish.
- **Rope refusal**: when a tie is refused for lack of a slot, Rope Links shows "Level L keep: only N ropes. Grow it or cut one." (N = `max_ropes[L]`) (text as in the prototype); Keep Levels supplies L and the limit.
- **Tutorial hook**: the first rise in the first level is the moment Tutorial & Onboarding explains "more troops → higher level → more ropes" (Core Loop in the brief).
- **No level number is shown on the keep**: the silhouette and the slot dots carry it. A number would duplicate the dots.

> **UX Flag — Keep Levels**: This system has UI requirements. In Pre-Production, run `/ux-design` for the plaque (count and slot dots), the level-up float text and the refusal message before writing epics. Stories that reference UI should cite `design/ux/[screen].md`, not this GDD directly.

## Cross-References

Troop Generation, Rope Links, Touch & Mouse Input and Troop Marching & Clashes exist and are checked; every other referenced GDD is still to be written and its entry is provisional.

| This GDD uses | Owned by | Item |
|---------------|----------|------|
| `troops`, the per-step order, the capture reset (its Core Rules 3 and 7), `troop_cap` (60) | Troop Generation | Rules 1, 4, 7; F1's range |
| Its F3 (time to fill) and AC14 (level 2 from 12.5 s, level 3 from 37.5 s) use the rise rule only | Troop Generation | Unchanged by the margin: rising is immediate (rule 2) |
| Tie refusal, cutting the newest ropes, pawns on a cut rope, the both-ways ban | Rope Links | Rules 5, 6; F3, F4 |
| `keep_captured` (owner change, troops 1) | Troop Marching & Clashes | Rule 7 |
| Initial troops per keep | Campaign Level Data | Rule 8 |
| Plaque placement and slot dots | Level HUD (and Troop Generation's UI section) | UI Requirements |
| Unit kind per level (soldiers, cavalry, summons) | Unit Roster & Stats | Interactions |
| `LevelModifiers` | Factions | Rule 10, invariants K1–K4 |
| F6 target rule does not read the level | Touch & Mouse Input | Interactions |

## Acceptance Criteria

Baseline data unless stated: `lv2_at` 15, `lv3_at` 35, `level_drop_margin` 5, `max_ropes` 1/2/3, `troop_cap` 60. Tags: **[Logic]** automated unit test with troop counts injected per step; **[Integration]** automated test with the named system; **[Visual]** screenshot or playtest. `qa-lead` lens applied by the author (Lean mode: Section H is a high-risk section).

**Rise and fall (Rules 1–3, 8; F1, F2)**

- **AC1 [Logic] (F1, rule 2)**: GIVEN a level 1 keep, WHEN its troops end a step at 14, THEN it is level 1; at 15, level 2; at 34, level 2; at 35, level 3.
- **AC2 [Logic] (rule 2)**: GIVEN a level 1 keep at 14 troops, WHEN one step raises it to 36, THEN it is level 3 and exactly one `level_rose(keep, 1, 3)` is raised.
- **AC3 [Logic] (F2, rule 3)**: GIVEN a level 2 keep, WHEN its troops end a step at 10, THEN it stays level 2; at 9, it is level 1 and `level_dropped(keep, 2, 1)` is raised once.
- **AC4 [Logic] (F2)**: GIVEN a level 3 keep, WHEN its troops end a step at 30, THEN it stays 3; at 29, it is level 2; at 12 (one step from 40), level 2 with one `level_dropped(keep, 3, 2)`; at 9, it is level 1 with one `level_dropped(keep, 3, 1)`.
- **AC5 [Logic] (F2, hysteresis)**: GIVEN two keeps both at 12 troops, one previously level 2 and one previously level 1, THEN after the step the first is level 2 and the second is level 1.
- **AC6 [Logic] (F2, margin 0)**: GIVEN `level_drop_margin` 0, THEN `effective_level` equals `rise_level` for every count 0–60 and every previous level (the prototype's rule).
- **AC7 [Logic] (rule 8)**: GIVEN level data with keeps at 10, 25 and 40 troops, WHEN the match starts, THEN their levels are 1, 2 and 3 and no `level_rose` is raised at start.
- **AC8 [Logic] (rule 1, neutrals)**: GIVEN a neutral keep at 16 troops (level 2), WHEN arrivals bring it to 9, THEN it is level 1 and no rope cut is requested.

**Ropes (Rules 5–7; F3, F4)**

- **AC9 [Integration: Rope Links] (F3)**: GIVEN a level 2 keep holding 2 ropes, WHEN a third tie is attempted, THEN it is refused with "Level 2 keep: only 2 ropes. Grow it or cut one."; GIVEN it rises to 3, THEN the third tie succeeds.
- **AC10 [Integration: Rope Links] (rule 6, F4)**: GIVEN a level 3 keep holding ropes tied at times t1 < t2 < t3, WHEN it drops to level 2, THEN only the rope tied at t3 is cut; WHEN it drops to level 1, THEN t3 and t2 are cut and t1 remains.
- **AC11 [Integration: Rope Links] (F4)**: GIVEN a level 3 keep holding 1 rope, WHEN it drops to level 2, THEN no rope is cut.
- **AC12 [Integration: Troop Marching & Clashes, Rope Links] (rule 7)**: GIVEN a level 1 keep holding 1 rope at 0 troops, WHEN an enemy pawn captures it, THEN on that same step its level is 1, its rope is cut with reason `capture`, and no `level_dropped` is raised. With an injected level 3 keep holding 3 ropes: level 1, all 3 cut, no `level_dropped`.

**Per-step order (Rule 4)**

- **AC13 [Integration: Troop Generation] (rule 4)**: GIVEN a level 1 keep at 14 troops whose beat fires on step N, WHEN steps N and N+1 run, THEN its level is 2 at the end of step N and the next beat adds `gen_amount[2]` (the same scenario as Troop Generation's AC11b, from this side).
- **AC14 [Logic] (rule 4)**: GIVEN a step with a beat (+1) and two enemy arrivals (−2) on a keep at 15 troops, THEN Keep Levels evaluates once on 14 and, with the margin, keeps level 2.

**Data and invariants (Rule 10; K1–K4)**

- **AC15 [Logic] (K1)**: GIVEN `lv2_at` 20 and `lv3_at` 20, WHEN data loads in a development build, THEN it stops with an error naming K1 and both values; a shipped build raises `lv3_at` to 21 and logs it.
- **AC16 [Logic] (K2)**: GIVEN `level_drop_margin` 15 with `lv2_at` 15, THEN K2 is reported; a shipped build lowers the margin to 14.
- **AC17 [Logic] (K3)**: GIVEN `level_drop_margin` 20 with thresholds 15 / 35, THEN K2 and K3 are reported; a shipped build lowers the margin to 14.
- **AC18 [Logic] (K4)**: GIVEN `max_ropes` `[2, 1, 3]`, THEN K4 is reported; a shipped build makes it `[2, 2, 3]`.
- **AC19 [Logic] (rule 10)**: GIVEN a Factions `LevelModifiers` that raises `lv2_at` by 5, THEN a keep rises to level 2 at 20 troops and drops below 15, and K1–K4 are re-checked against the modified set.

**Cross-system, visual and feel**

- **AC20 [Integration: Level HUD] [Visual]**: GIVEN a keep rises to level 2, THEN on that step the plaque shows two slot dots (one filled if a rope is held) and the float text "Level 2 · 2 ropes" appears. Retained screenshots in `production/qa/evidence/` show a keep at each level with its dots.
- **AC21 [Visual]**: Retained screenshots show the three silhouettes side by side for the player, the rival and a neutral, each readable at phone size without the plaque (the `figures` scene).
- **AC22 [Visual / playtest]**: GIVEN a new player in level 1, WHEN their first keep rises, THEN they can say what the level bought them (a second rope) without being told; playtest question after the first session.
- **AC23 [Integration: Rival AI]**: GIVEN the rival reads `max_ropes`, THEN it never attempts a tie that Rope Links would refuse for lack of a slot.

**Coverage check:** every core rule (1–11) has at least one criterion; F1–F4 and K1–K4 each have one; boundaries are tested at 14/15, 34/35, 9/10, 29/30 and margin 0. Cross-system: AC9–AC13, AC20, AC23. Rule 11 (no other input) is covered by AC6 and AC7 together: level depends on troops only.

## Open Questions

| # | Question | Owner | Resolve by |
|---|----------|-------|------------|
| 1 | `level_drop_margin` 5 is the player's first choice; is 5 troops (about 10 enemy arrivals at level 2 and 18 at level 3 against one rope, counting generation) enough breathing room, or too much? | game-designer | First Godot playable |
| 2 | Should a guardian's castle be pinned at level 3 whatever its garrison, so it never looks weakened? | Guardian Castles | Alpha |
| 3 | Do neutral keeps need a different level look (ruined, overgrown) so a level 2 neutral does not read as a rival keep? | art-director | Art bible |
| 4 | Which unit kind each level produces per race (barracks soldiers, keep cavalry, castle summons) and whether a drop changes the units already marching | Unit Roster & Stats | Alpha |
| 5 | Should the level-up float text appear only the first few times per session, to reduce clutter for experienced players? | ux-designer | Vertical Slice |
| 6 | Whether `max_ropes` should ever exceed 3 for a race or a god power (the brief says max level 3; the rope table allows up to 5 per level for tuning) | Factions, God & Goddess Powers | Alpha |
