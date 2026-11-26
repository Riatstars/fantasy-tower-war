# Factions

> **Status**: In Review
> **Author**: user + Claude
> **Last Updated**: 2026-11-25
> **Last Verified**: 2026-11-25
> **Creative Director Review (CD-GDD-ALIGN)**: skipped — Lean mode
> **Implements Pillar**: 3. Paint the map, grow the army (`design/gdd/game-concept.md` § Pillars)

## Summary

Factions defines the races and says which one each side plays. A race is its three units plus one trait that trades an earlier keep level for a later one; the UAT build ships the human (the baseline, no trait) and the beast (level 2 at 12 troops, level 3 at 40). The player leads one owned race, chosen between levels; the rival's race comes from the region. A budget keeps every trait a trade, never a free upgrade.

> **Quick reference** — Layer: `Feature` · Priority: `MVP` (UAT-2) · Key deps: `Unit Roster & Stats, Keep Levels, Troop Generation, Campaign Level Data`

## Overview

Factions defines the races of Tower War and decides which race each side plays in a match. A race is a record in the data file: a name, the roster of three units Unit Roster & Stats gives it, one signature trait that changes a rule of the match within limits other systems already set, and how the player gets it (from the start, or unlocked with diamonds). The UAT build ships two races, the human and the beast; the structure holds five, and the elf, the spirit and the dragon are added later as data (decided 2026-11-25). The player chooses one race to lead before a match, and every keep they own sends that race's units and follows its trait. The rival's race comes from the region the level is in, so each region has its own opponent (decided 2026-11-25). The player meets this system as a choice with consequences: the same level plays differently under a different banner. Without it Unit Roster & Stats would have rosters that nobody is assigned, and the diamonds the campaign rewards would have nothing to unlock.

## Detailed Design

### Core Rules

`game-designer`, `art-director`, `narrative-director` and `systems-designer` not consulted — Lean mode. Review manually before production.

1. **A race is a record in the data file**: `id` (short stable string: `human`, `beast`), `name` (a string key), `order` (its 1-based place in lists), `unlock` (`starter` or `diamonds`) and `trait`. Its three units are the roster Unit Roster & Stats defines under the same id (`<race>_t1` to `<race>_t3`, its rule 2); this GDD does not restate them. Races live in data, never in code.
2. **The UAT build ships two races** (decided 2026-11-25): `human` (`order` 1, `starter`) and `beast` (`order` 2, `diamonds`). The structure holds up to `races_max` (5); the elf, the spirit and the dragon are added later as data, each with a roster and a trait that pass the checks below.
3. **The human is the baseline** (decided 2026-11-25). It is always present, always `starter`, and its trait is empty: a human side plays with every other GDD's baseline numbers, exactly as in UAT-1.
4. **A trait is one named rule change** (decided 2026-11-25): a `name` and a `description` (string keys) and a set of modifiers. In the UAT build a trait may set only two values, both Keep Levels `LevelModifiers` (its rule 10): `lv2_offset` and `lv3_offset`, whole numbers added to `lv2_at` and `lv3_at` (F1). Every other hook stays at its baseline for every race: the margin override and the `max_ropes` override (Keep Levels), `GenerationModifiers` (Troop Generation rule 10) and the `send_interval` override (Rope Links rule 14). They are reserved until a rule prices them (Open Questions).
5. **A trait is a trade, never a free upgrade.** It must pass the trait budget (F2, invariants T1–T3): its offsets stay inside the hard limits `lv2_offset_range` and `lv3_offset_range` (T1; decided 2026-11-25, first review), a race that reaches one keep level sooner than the human reaches the other later, and its time to level 3 stays within `trait_budget` of the human's.
6. **The beast's trait, "Early riders"** (decided 2026-11-25): `lv2_offset` −3 and `lv3_offset` +5. A beast keep rises to level 2 at 12 troops and to level 3 at 40. With the unchanged margin of 5 it drops from level 2 below 7 troops and from level 3 below 35.
7. **A trait follows the keep's owner.** A keep uses the modifiers of its current owner's race for every level check (rise, drop, starting level). A neutral keep has no race and uses the baseline. On capture the keep is reset to level 1 with 1 troop (Keep Levels rule 7) and from that step uses the new owner's thresholds.
8. **`race_of(owner)`** gives the race of a side in the running match: the player's is their active race; the rival's is the level's `rival_race` if the level record has one, else its region's `rival_race`, else `human` (decided 2026-11-25: one rival race per region, a level may override). A neutral has none. The `unit_for(owner, level)` of Unit Roster & Stats and the modifiers of Keep Levels both read it.
9. **Both races are fixed for the match.** `race_of` is resolved when the match is built and frozen until it ends; nothing changes a side's race during a match (Keep Levels assumes this). A change of active race applies from the next match build.
10. **The player leads one race at a time** (decided 2026-11-25): the active race, set on the Collection screen and used for every level until changed. Only an owned race can be active. `human` is owned from the first launch and is the active race until the player picks another. There is no race choice on a level's start panel.
11. **Owning a race.** A `starter` race is owned from the first launch. A `diamonds` race is owned once Faction Collection & Unlocks records the unlock; the purchase and the saved set of owned races and the active race are that GDD's, and the price is Currencies & Economy's (`race_unlock_cost(race_id)`, its rule 11). This GDD gives it `races()` (the records in `order`) and reads back `active_race()` and `is_owned(race)`.
12. **Both sides play by the same rule.** The rival's keeps use its race's roster and trait exactly as the player's do; the rival gets no race the player cannot own and no modifier outside rule 4. Two sides of the same race are legal (an edge case of Unit Roster & Stats).
13. **Checked once at app start**, after the loader of Unit Roster & Stats (its rule 13) and in this fixed order, so a breach names one rule: (a) the race list: the count is 1 to `races_max`, ids and `order` values are unique, and `human` exists with `unlock` `starter` and an empty trait (T0); (b) each race in `order`: its `unlock` is a known value; its trait sets no reserved modifier (rule 4); then T1, T2 and T3. A development build runs every step, then stops with one error listing every breach (race, rule, values). A shipped build repairs and logs: a race whose `unlock` is not a known value is treated as `diamonds` and keeps its units and its trait (decided 2026-11-25, first review: a typo never gives a race away), and the remaining checks of (b) still run on it; a race that fails any other check of (b) keeps its units and loses its trait (empty, the baseline); a list that fails (a) is replaced by the human alone. That fallback human is a built-in default record (`id` `human`, `order` 1, `starter`, empty trait), the one exception to rule 1, so it exists even when the data file does not. The policy is Campaign Level Data's rule 8 for global tuning.
14. **Unknown race ids resolve to `human`.** A `rival_race` in a region or level record, or a saved active race, that names no loaded race or (for the player) no owned race is replaced by `human` and logged; a development build reports a bad `rival_race` as a level-data error first.

### States and Transitions

A race record has no state during a match. For the player a race is in one of three states, kept by Faction Collection & Unlocks; this GDD defines only what they mean.

| State | Meaning | Enter when | Leave when |
|---|---|---|---|
| Locked | Listed, shown, not usable by the player (the rival may still play it) | First launch, for a `diamonds` race | Unlocked → Owned |
| Owned | The player may make it active | First launch for `starter`; an unlock for `diamonds` | Chosen → Active. Never returns to Locked, except when `delete_progress()` gives a fresh profile (Faction Collection & Unlocks rule 17) |
| Active | The race the player's keeps use in the next match built; exactly one race at a time | First launch (`human`); the player's choice on the Collection screen | Another owned race is chosen → Owned |

The match itself has one relevant moment: at match build the two races are resolved (rule 8) and frozen (rule 9).

### Interactions with Other Systems

| System | Direction | Data | Interface owner |
|---|---|---|---|
| Unit Roster & Stats | out/in | Out: `race_of(owner)`, the race ids. In: the roster of each race, and its fallback to the human roster for an id with no roster | Unit Roster & Stats owns units; this GDD owns which race a side plays |
| Keep Levels | out | `LevelModifiers` per race: `lv2_offset`, `lv3_offset` (other fields unset in UAT) | Keep Levels owns the hook and K1–K4; this GDD supplies values |
| Troop Generation | out/in | Out: `GenerationModifiers`, none in UAT (identity for every race). In: `gen_interval` and the per-level amounts, for F2 | Troop Generation |
| Rope Links | out | `send_interval` override: none in UAT | Rope Links |
| Troop Marching & Clashes | in | `capture_troops`, the troops a captured keep starts from (F2) | Troop Marching & Clashes |
| Campaign Level Data | in | `rival_race` on the region record, optional `rival_race` on the level record; starting levels computed with the owner's thresholds | Campaign Level Data owns the records and their loader; this GDD defines the field's meaning |
| Level State & Match Flow | out | `race_of(owner)` for both sides, resolved once when it builds the match and frozen until the match ends (rules 8, 9) | Level State & Match Flow builds the match; this GDD owns the resolution |
| Rival AI | out | `race_of(rival)`; the rival plays that race with no other change | Rival AI |
| Faction Collection & Unlocks (UAT-2) | out/in | Out: `races()` with `unlock`. In: `is_owned(race)`, `active_race()` | Faction Collection & Unlocks |
| Currencies & Economy (UAT-2) | out | Which loaded races are `diamonds` races, for its price check (its E5) | Currencies & Economy owns the price |
| Collection & Upgrade Screens (UAT-2) | out | Each race's name, trait name and description, lock state, and which is active | Collection & Upgrade Screens |
| Level HUD | out | The two races of the match, for the pawn and keep sprites it picks | Level HUD draws |

## Formulas

`systems-designer` lens applied by the author (Lean mode: Section D is a high-risk section). Every variable was worked at its minimum, its maximum and at 0; the findings are under Boundary findings. The numbers were put to the user and accepted (2026-11-25).

### F1. Effective thresholds

The effective_thresholds formula is defined as:

`lv2_at_eff = lv2_at + lv2_offset` and `lv3_at_eff = lv3_at + lv3_offset`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| lv2_at | int, troops | 15 (baseline) | data file (Keep Levels) | Troops at which a keep rises to level 2 |
| lv3_at | int, troops | 35 (baseline) | data file (Keep Levels) | Troops at which a keep rises to level 3 |
| lv2_offset | int, troops | −5 to +5, a hard limit (`lv2_offset_range`; human 0, beast −3) | data file (the race's trait) | The race's change to the level 2 threshold |
| lv3_offset | int, troops | −5 to +10, a hard limit (`lv3_offset_range`; human 0, beast +5) | data file (the race's trait) | The race's change to the level 3 threshold |

**Output Range:** `lv2_at_eff` 10 to 20 and `lv3_at_eff` 30 to 45 over the offset ranges, which are hard limits (T1; decided 2026-11-25, first review): `lv2_offset_range` and `lv3_offset_range` are data values, and an offset outside them fails T1. T1 also applies the other systems' limits to the result: a level 2 threshold of 6 or more (above the margin of 5), a level 3 threshold of 60 or less (`troop_cap`), and a gap between them of more than 5. At baseline the offset ranges are the tighter of the two.
**Example:** the beast: 15 − 3 = 12 and 35 + 5 = 40. A neutral keep and a human keep: 15 and 35.

Keep Levels applies the result (its rule 10): the rise rule uses the effective thresholds, and the drop points are each effective threshold minus `level_drop_margin` (beast: 7 and 35; human: 10 and 30).

### F2. Time to a level

The time_to_level formula is defined as:

`time_to_l2 = gen_interval × beats_l1` and `time_to_l3 = gen_interval × (beats_l1 + beats_l2)`, with `beats_l1 = ceil((lv2_at_eff − capture_troops) / gen_amount_level_1)`, `troops_at_l2 = capture_troops + beats_l1 × gen_amount_level_1` and `beats_l2 = max(0, ceil((lv3_at_eff − troops_at_l2) / gen_amount_level_2))`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| gen_interval | float, seconds | 0.3–6 (baseline 2.5) | data file (Troop Generation) | Time between generation beats |
| gen_amount_level_1 | int, troops per beat | 1–8 (baseline 1) | data file (Troop Generation) | Troops a level 1 keep gains per beat |
| gen_amount_level_2 | int, troops per beat | 1–8 (baseline 2) | data file (Troop Generation) | Troops a level 2 keep gains per beat |
| capture_troops | int, troops | 1 (baseline) | data file (Troop Marching & Clashes) | Troops a keep holds just after capture |
| lv2_at_eff, lv3_at_eff | int, troops | 10–20, 30–45 | calculated (F1) | The race's thresholds |
| beats_l1, beats_l2 | int | 9–19, 5–18 | calculated | Beats spent at level 1 and at level 2 |

**Output Range:** `time_to_l3` 47.5 s (thresholds 10 and 30) to 80 s (20 and 45) over the offset ranges; 54 to 66 s for a legal race (T2). The human's is 60 s.
**What it measures:** how long a freshly captured keep, left alone with no rope into it, takes to reach each level by generation. It is the pace at which a side gets its second rope and its riders, then its third rope and its summons, so it is the common unit a threshold trait is priced in. It is a yardstick, not a prediction of a match.
**Example:** the human: `beats_l1` = (15 − 1) / 1 = 14, 35.0 s to level 2; `beats_l2` = (35 − 15) / 2 = 10, 60.0 s to level 3. The beast: `beats_l1` = (12 − 1) / 1 = 11, 27.5 s; `beats_l2` = (40 − 12) / 2 = 14, 62.5 s.

### Shipped races (baseline data)

| Race | `order` | `unlock` | Trait | `lv2_offset` | `lv3_offset` | Level 2 at | Level 3 at | `time_to_l2` | `time_to_l3` |
|---|---|---|---|---|---|---|---|---|---|
| `human` | 1 | `starter` | none | 0 | 0 | 15 | 35 | 35.0 s | 60.0 s |
| `beast` | 2 | `diamonds` | Early riders | −3 | +5 | 12 | 40 | 27.5 s (7.5 s sooner) | 62.5 s (2.5 s later, +4.2%) |

### Invariants (checked at app start, rule 13)

- **T0.** `human` exists, is `starter` and has an empty trait (both offsets 0).
- **T1.** Each offset lies inside its range (`lv2_offset_range` −5 to +5, `lv3_offset_range` −5 to +10; data values), and the race's effective thresholds satisfy Keep Levels' K1, K2 and K3 and Troop Generation's I1, and `capture_troops < lv2_at_eff`. Those GDDs own the inequalities; this check applies them to each race's modified set.
- **T2.** `|time_to_l3(race) − time_to_l3(human)| ≤ trait_budget × time_to_l3(human)`, with `trait_budget` 0.10 (a data value, safe range 0.05–0.15): 54 to 66 s at baseline.
- **T3.** A trait is a trade. Writing `d2 = time_to_l2(race) − time_to_l2(human)` and `d3 = time_to_l3(race) − time_to_l3(human)`: the race fails if `d2 < 0` and `d3 ≤ 0`, or if `d3 < 0` and `d2 ≤ 0`. Equal on both (an empty trait) passes; sooner to one level and later to the other passes.

### Boundary findings

- **Level 2 is also the second rope.** `max_ropes` follows the level (Keep Levels rule 5), so the beast's trait gives its keeps a second rope and riders 7.5 s sooner, and a third rope and summons 2.5 s later. The rope slot, not the unit, is the larger part of the trait.
- **The beast's castle is easier to knock down, its keep harder.** It leaves level 3 below 35 troops (human: below 30) and holds level 2 down to 7 (human: 10).
- **T2 and T3 alone do not bound the early side.** T2 limits only `time_to_l3` and T3 checks only signs, so without the offset limits level 2 at 6 troops with level 3 at 45 would pass: a second rope 22.5 s sooner for a castle 2.5 s later. With `lv2_offset_range` the earliest level 2 is at 10 troops, 22.5 s after capture and 12.5 s sooner than the human (found in the first review, 2026-11-25).
- **T2 alone is not enough.** Offsets −3 and 0 give 57.5 s, inside the 10% window, yet the race is sooner to both levels; T3 rejects it.
- **The edges of the beast's tuning room.** With level 2 at 12, level 3 at 41 or 42 gives 65.0 s and passes; 43 gives 67.5 s and fails T2. Level 3 at 39 gives 62.5 s; 35 gives 57.5 s and fails T3.
- **Nothing divides by zero.** The divisors are `gen_amount_level_1` and `gen_amount_level_2`, both at least 1 (Troop Generation I2). An offset of 0 on both is the identity. `trait_budget` 0 would allow only races whose `time_to_l3` equals the human's exactly, so the beast would lose its trait in a shipped build; hence the safe floor of 0.05.
- **A beast rival changes starting levels.** Starting levels use the owner's thresholds (rule 7), so a rival keep that starts with 12 to 14 troops is level 1 for a human rival and level 2 for a beast rival (gv-03's rival keeps hold 14). The Green Vale's rival is human (decided 2026-11-25), so no shipped level changes.
- **The budget prices generation, not units.** The beast also has quicker soldiers and slower summons (Unit Roster & Stats, inside its own budget U5). The two budgets are checked separately; whether early riders on top of quick soldiers is too strong together is a playtest question (Open Questions).

### Feedback loop

An earlier level 2 means a second rope sooner, which takes keeps sooner, which are themselves level 2 sooner. It is the positive loop Keep Levels and Troop Generation already describe, steeper for the beast in the first half-minute of a keep's life and flatter after it (level 3 comes later and is lost sooner). It is damped by the same things: the troop cap, attrition in clashes, and the level drop.

## Edge Cases

`systems-designer` not consulted — Lean mode. Review manually before production.

- **If the race data file is missing or lists no race**: the list fails rule 13(a). Development builds stop; shipped builds use the human alone, with an empty trait, and log it.
- **If `human` is missing, is not `starter`, or has a trait**: T0 fails. Development builds stop; shipped builds replace the whole list with the human alone (every other race id then resolves to `human`, rule 14) and log it. The human is the reference T2 and T3 measure against, so no other race can be checked without it.
- **If the list holds more than `races_max` races, or two share an id or an `order`**: rule 13(a) fails, with the same outcome as above.
- **If a race's trait fails T1, T2 or T3, or sets a reserved modifier**: the first failing check in rule 13's order is the one named. Development builds stop; shipped builds give that race an empty trait (baseline thresholds), keep its units, and log it.
- **If a race's `unlock` is not a known value**: development builds stop naming the race and the value; shipped builds treat it as `diamonds` (locked until bought, or locked for good if Currencies & Economy has no price for it), keep its units and its trait, and log it (rule 13).
- **If a race has offsets 0 and 0**: legal. It is a race of units only; T3 passes on equality.
- **If a race has a record here but no roster in Unit Roster & Stats**: Unit Roster & Stats' U6 handles it (the human roster is used). The race keeps its trait.
- **If a region or level names a `rival_race` that is not loaded**: the rival plays `human` and it is logged (rule 14); development builds report it as a level-data error.
- **If a level has a `rival_race` but no rival keep**: the value is unused; the level is still legal (Campaign Level Data's edge case).
- **If the saved active race is not owned, or is no longer in the data**: the active race is `human` and it is logged (rule 14). What happens to the saved record is Faction Collection & Unlocks' to decide.
- **If the rival plays a race the player has not unlocked**: legal (rule 12 forbids only races the player *cannot* own). The player meets the beast as an opponent before owning it.
- **If both sides play the same race**: legal; both use the same roster and thresholds, and owner colours and marks tell them apart.
- **If a keep is captured**: it is level 1 with 1 troop (Keep Levels rule 7) and uses the new owner's thresholds from that step (rule 7). A human keep taken by a beast side rises to level 2 at 12 troops; a beast keep taken by a human side at 15. Ownership never changes without this reset, so a keep is never left at a level its new thresholds would not give it.
- **If a neutral keep holds 12 to 14 troops**: it is level 1, whichever races are playing; neutrals use the baseline (rule 7).
- **If the player changes the active race while a match is running** (a second device or a development tool; the Collection screen is not reachable from a match): the running match keeps its races (rule 9); the next match build, a retry included, uses the new one.
- **If the race data changes while a match runs** (development hot reload): the same; the running match keeps the records it was built with.
- **If `trait_budget` is set to 0**: only a race whose `time_to_l3` equals the human's passes T2; the beast (62.5 s) fails and, in a shipped build, plays without its trait. The safe range starts at 0.05.
- **If the player switches race before every level to suit it**: intended. Switching is free and owning more races is the reward; no level may require a `diamonds` race to be winnable (a content rule for Campaign Level Data).

## Dependencies

Unit Roster & Stats, Keep Levels, Troop Generation, Rope Links, Troop Marching & Clashes, Campaign Level Data, Rival AI and Level HUD have GDDs. Level State & Match Flow, Faction Collection & Unlocks, Unit Cards & Upgrades and Currencies & Economy have GDDs too (the last three drafted 2026-11-25). Collection & Upgrade Screens has one since 2026-11-26 (pending review). Statuses are the systems index's on 2026-11-25.

| System | Nature | Direction | What this GDD needs or gives | GDD status |
|---|---|---|---|---|
| Unit Roster & Stats | Hard | in/out | In: a roster per race id; its fallback for an id with no roster. Out: `race_of(owner)` behind `unit_for` | Approved |
| Keep Levels | Hard | out | `LevelModifiers` per race (`lv2_offset`, `lv3_offset`); K1–K3 applied to each race's set (T1) | Approved |
| Troop Generation | Hard | in | `gen_interval`, `gen_amount_level_1`, `gen_amount_level_2` for F2; I1 for T1. Its `GenerationModifiers` hook is unused in UAT | Approved |
| Troop Marching & Clashes | Soft | in | `capture_troops` for F2 | In Review |
| Campaign Level Data | Hard | in | `rival_race` on the region record and, optionally, the level record; starting levels from the owner's thresholds | In Review |
| Rope Links | Soft | out | Its `send_interval` override per race is unused in UAT | Approved |
| **Depended on by** | | | | |
| Level State & Match Flow | Hard | out | `race_of(owner)` for both sides at match build, frozen for the match | Approved |
| Rival AI | Soft | out | `race_of(rival)`; no other change to the rival | Approved |
| Faction Collection & Unlocks (UAT-2) | Hard | out/in | Out: `races()` and each `unlock`. In: `is_owned(race)`, `active_race()` | Designed, pending review |
| Currencies & Economy (UAT-2) | Soft | out | Which loaded races are `diamonds` races (its E5); it owns `race_unlock_cost` | Designed, pending review |
| Unit Cards & Upgrades (UAT-2) | Soft | out | The races whose kinds have cards | Designed, pending review |
| Collection & Upgrade Screens (UAT-2) | Soft | out | Name, trait name and description, lock state and the active marker per race | Designed, pending review |
| Level HUD | Soft | out | The two races of the match, for sprites | Approved |

**Bidirectional check.** Keep Levels (rule 10, Interactions, Dependencies, Open Question 6), Troop Generation (rule 10, Interactions, Dependencies, Open Question 4), Rope Links (rule 14, Interactions), Rival AI (rule 11, Interactions, Dependencies, Open Question 3), Troop Marching & Clashes (rule 16, Interactions) and Unit Roster & Stats (rules 7 and 9, Interactions, Dependencies, Open Questions 5 and 7) name Factions. Faction Collection & Unlocks (rules 1, 3, 10, 15, Interactions) and Currencies & Economy (Interactions, E5) name it too. Campaign Level Data, Level HUD and Level State & Match Flow do not name it yet; the edits they need are listed under Cross-References (items 1, 10 and 11). The systems index lists Factions as depending on Unit Roster & Stats, Troop Generation and Keep Levels; Campaign Level Data should be added.

## Visual/Audio Requirements

`art-director` not consulted — Lean mode (the look of a race is carried by the units and keeps other GDDs specify). Review manually before production. From art bible §3 (shape language) and §4 (colour system).

- **Colour says whose, shape says which race.** Owner colours and owner marks (art bible §4; banner cut and helm, §3) never change with the race. A race reads from silhouettes: its three unit figures (Unit Roster & Stats, Visual/Audio) and its keeps (Keep Levels' asset note: three keep silhouettes per race).
- **A race crest**: one simple emblem per race (the human's and the beast's in the UAT build), readable at 24 px and in greyscale, used on the race's Collection card and wherever a side's race is named. It is not an owner mark and never replaces the sun or the crescent.
- **No in-match effect of its own.** A beast keep rising at 12 troops uses the same build-up animation and float text as any level rise (Keep Levels, Level HUD); nothing new is drawn when a trait takes effect.
- **Beast figures must still carry owner marks.** Art bible §3 gives owner marks to helms and banners, and its beast figure has no rider and no helm. How a beast pawn shows its owner in greyscale is an art question this GDD raises (Open Questions).
- **Audio**: none of its own. A sting for choosing a race belongs to Collection & Upgrade Screens and the Audio GDD.

📌 **Asset Spec** — after the art bible is approved, run `/asset-spec system:factions` for the two race crests. Unit figures and keeps are covered by `system:unit-roster-stats` and `system:keep-levels`.

## Game Feel

- **The same level plays differently under another banner.** A player who replays a level as the beast should feel the opening change within the first half-minute: a captured keep has its second rope 27.5 s after capture instead of 35 s.
- **The beast peaks early and thins late.** Its third rope and summons come 2.5 s later, and its castle falls back to level 2 at 34 troops, where a human's falls only at 29: pressure on a beast castle pays off sooner.
- **Choosing is free and never mid-fight.** There is no input during a match; the choice is made on the Collection screen, costs nothing to change, and takes effect on the next level started.
- **You meet a race before you own it.** A region's rival shows the player what a race does, so the unlock is something they already want.
- **Playtest questions for UAT-2** (not acceptance criteria): after two levels as the beast, can testers say what is different? Do they change race between levels at all? Does a beast rival feel unfair in its first 30 seconds?
- **Reference feel**: faction choice in Mushroom Wars and Kingdom Rush Origins' hero pick: one choice before the level, felt all through it.

## UI Requirements

Nothing new during a match. Outside a match:

- **Collection screen** (Collection & Upgrade Screens owns the layout): one card per race in `order`, with its name, crest, lock state, the active marker, and the trait's name and description. The description is built from the data values, never typed as fixed text: "Keeps reach level 2 at 12 troops and level 3 at 40" must change when the offsets change. The unlock price and button are Faction Collection & Unlocks'.
- **Setting the active race** is one tap on an owned race's card; a locked race's card cannot be made active.
- **The rival's race on a level's start panel** (the panel World Map & Regions and Menus & Screens own): the rival's race name and crest, so the player can choose who to lead before starting. This is a request to those GDDs, not a rule here (Open Questions).

> **UX Flag — Factions**: this system supplies content to the Collection & Upgrade Screens and asks for one line on the level start panel. Run `/ux-design` for those screens before writing epics; stories that touch the UI should cite `design/ux/[screen].md`.

## Cross-References

| This GDD relies on | In | What it relies on |
|---|---|---|
| Unit Roster & Stats | Rules 2, 4, 7, 9; U5, U6; Open Questions 5 and 7 | A roster of three kinds per race id; the human as the default; the fallback for an id with no roster |
| Keep Levels | Rules 2, 3, 5, 7, 8, 10; K1–K4; `lv2_at` (15), `lv3_at` (35), `level_drop_margin` (5) | The `LevelModifiers` hook; rise and drop rules; reset on capture; `max_ropes` by level |
| Troop Generation | Rule 10; I1, I2; `gen_interval` (2.5 s), `gen_amount_level_1` (1), `gen_amount_level_2` (2), `troop_cap` (60) | The beat that F2 counts; the unused `GenerationModifiers` hook |
| Troop Marching & Clashes | Rule 12; M6; `capture_troops` (1) | A captured keep starts from 1 troop |
| Rope Links | Rule 14 | The unused `send_interval` override |
| Campaign Level Data | Rules 1, 2, 8; F3 | Region and level records; the bad-data policy; starting level |
| Rival AI | Rule 11; Open Question 3 | The rival plays an assigned race |
| design/art/art-bible.md | §3 shape language, §4 colour system | Owner marks stay; race reads from shape |
| game-concept.md | § Army; Pillar 3; Open questions | Races as playstyles; diamonds unlock rare races; the two questions closed here |

**Edits other documents need as a result of this GDD** (items 3, 5, 6, 7 and 8 applied 2026-11-25; items 1, 2, 4 and 9 are another session's documents, marked 7a, sent as wording and not yet applied; items 10 and 11 were added by the first review, 2026-11-25, and are not yet applied):

1. `campaign-level-data.md` (7a): add `rival_race` (optional race id, default `human`) to the region record and to the level record; F3 computes a keep's starting level with its owner's effective thresholds; the Green Vale's `rival_race` is `human`; a content rule that no level requires a `diamonds` race.
2. `keep-levels.md` (7a): rule 10's hook is no longer provisional: in UAT a race sets only `lv2_offset` and `lv3_offset`, per owner; neutrals use the baseline; Open Question 6 answered for Factions (no race exceeds 3 ropes).
3. `troop-generation.md`: rule 10 and Open Question 4: no race changes generation in the UAT build.
4. `rope-links.md` (7a): rule 14: no race changes `send_interval` in the UAT build.
5. `rival-ai.md`: rule 11 and Open Question 3: one rival race per region, a level may override; no tuning change per race by default.
6. `unit-roster-stats.md`: Open Question 5 (two races ship) and the Factions rows are no longer "not yet designed".
7. `game-concept.md`: close the two open questions (the rival's race; two races in the UAT build).
8. `systems-index.md`: row 22 → designed, with the GDD link; add Campaign Level Data to its dependencies.
9. `design/registry/entities.yaml` (7a): register `effective_thresholds` and `time_to_level` (formulas), `trait_budget`, `races_max`, `lv2_offset_range` and `lv3_offset_range` (constants), and add this GDD to `referenced_by` of `lv2_at`, `lv3_at`, `level_drop_margin`, `gen_interval`, `gen_amount_level_1`, `gen_amount_level_2`, `capture_troops` and `troop_cap`.
10. `level-state-match-flow.md`: when it builds a match it resolves `race_of` for both sides (Factions rule 8) and keeps them fixed until the match ends (rule 9); a Factions row in its Interactions and Dependencies.
11. `level-hud.md`: it reads the two races of the match to pick pawn and keep sprites; a Factions row in its Interactions and Dependencies.

## Acceptance Criteria

Baseline data unless a criterion says otherwise: `lv2_at` 15, `lv3_at` 35, `level_drop_margin` 5, `gen_interval` 2.5 s, `gen_amount_level_1` 1, `gen_amount_level_2` 2, `capture_troops` 1, `troop_cap` 60, `trait_budget` 0.10, `races_max` 5, `lv2_offset_range` −5 to +5, `lv3_offset_range` −5 to +10, and the two shipped races. Tags: **[Logic]** automated test in `tests/unit/`; **[Integration: X]** in `tests/integration/`; **[UI]** retained screenshot in `production/qa/evidence/`. `qa-lead` lens applied by the author (Lean mode: Section H is a high-risk section).

- **AC1 [Logic] (rules 1–3, 6)**: GIVEN the shipped race data, THEN `races()` returns exactly `human` (`order` 1, `starter`, offsets 0 and 0) and `beast` (`order` 2, `diamonds`, offsets −3 and +5), in that order.
- **AC2 [Logic] (F1)**: GIVEN the shipped data, THEN the effective thresholds are 15 and 35 for a human owner, 12 and 40 for a beast owner, and 15 and 35 for a neutral keep.
- **AC3 [Logic] (F2)**: GIVEN the shipped data, THEN `time_to_l2` and `time_to_l3` are 35.0 s and 60.0 s for the human and 27.5 s and 62.5 s for the beast.
- **AC4 [Integration: Keep Levels] (rules 6, 7)**: GIVEN a beast-owned keep with 11 troops at level 1, WHEN it reaches 12, THEN it is level 2 at the end of that step; GIVEN a human-owned keep with 12 troops, THEN it is level 1, and level 2 at 15. GIVEN a beast keep at level 3, WHEN its troops fall to 35, THEN it stays level 3, and at 34 it is level 2; GIVEN a beast keep at level 2, THEN it stays level 2 at 7 troops and is level 1 at 6.
- **AC5 [Integration: Troop Generation, Keep Levels] (F2)**: GIVEN a keep just captured by a beast side (1 troop, timer 0) with no rope into it, THEN it becomes level 2 on its 11th beat (27.5 s after capture) and level 3 on its 25th (62.5 s); GIVEN the same keep captured by a human side, THEN on its 14th (35.0 s) and 24th (60.0 s).
- **AC6 [Logic] (T2 boundary)**: GIVEN a race with offsets −3 and +7 (thresholds 12 and 42), THEN it validates (`time_to_l3` 65.0 s); GIVEN −3 and +8 (12 and 43), THEN it is rejected naming T2 (67.5 s against a 66 s limit).
- **AC7 [Logic] (T3)**: GIVEN a race with offsets −3 and 0, THEN it is rejected naming T3 (27.5 s and 57.5 s, sooner to both levels) although T2 passes; GIVEN offsets 0 and 0 on a race other than the human, THEN it validates.
- **AC8 [Logic] (T1, rule 13 order)**: GIVEN a race with `lv2_offset` −10 (outside its range; threshold 5, not above the margin of 5; it would also fail T2), THEN the rule named is T1; GIVEN `lv3_offset` +30 (outside its range; threshold 65, above `troop_cap`), THEN T1.
- **AC9 [Logic] (rule 4, reserved modifiers)**: GIVEN a race whose trait sets a `max_ropes` override, a margin override, a generation modifier or a `send_interval` override, THEN it is rejected naming rule 4 and the modifier, before T1 is checked.
- **AC10 [Logic] (rule 13, shipped fallback)**: GIVEN a shipped build and a beast trait of −3 and +8, THEN beast keeps use thresholds 15 and 35, `unit_for` still returns `beast_t1` to `beast_t3` for a beast owner, and exactly one log line names `beast` and T2; GIVEN a development build, THEN it stops with one error naming `beast`, T2 and 67.5 s.
- **AC11 [Logic] (T0, rule 13a)**: GIVEN race data in which `human` has `lv2_offset` −1, or `human` is absent, or two races share `order` 2, THEN a development build stops naming the list rule broken (T0 for the first two); GIVEN a shipped build, THEN `races()` returns `human` alone with offsets 0 and 0, and `race_of` returns `human` for a side saved or authored as `beast`.
- **AC12 [Logic] (rule 8, rival resolution)**: GIVEN a region with `rival_race` `beast`, THEN `race_of(rival)` is `beast` on a level with no `rival_race` and `human` on a level whose record says `human`; GIVEN a region and a level with no `rival_race`, THEN `human`; GIVEN any level, THEN `race_of` of a neutral keep's owner is none.
- **AC13 [Logic] (rules 10, 14)**: GIVEN a save whose active race is `beast` while `is_owned(beast)` is false, THEN `race_of(player)` is `human` and one log line says so; GIVEN a region whose `rival_race` is `orc` (not loaded), THEN the rival plays `human` in a shipped build with one log line, and a development build stops with a level-data error naming the region and `orc` (Campaign Level Data rule 8).
- **AC14 [Integration: Unit Roster & Stats] (rule 8)**: GIVEN the player's active race is `beast` and the rival's is `human`, WHEN a level 1 keep of each side launches a pawn, THEN the player's marches at 132 px/s (`beast_t1`) and the rival's at 110 px/s (`human_t1`).
- **AC15 [Integration: Level State & Match Flow] (rule 9)**: GIVEN a running match built with the player as `human`, WHEN the active race is set to `beast`, THEN the player's keeps still rise at 15 troops and send human units until the match ends; GIVEN a retry of the level, THEN they rise at 12 and send beast units.
- **AC16 [Integration: Troop Marching & Clashes, Keep Levels] (rule 7, capture)**: GIVEN a human rival keep at level 2 with 14 troops, WHEN a beast player captures it, THEN it is level 1 with 1 troop on that step and rises to level 2 at 12; GIVEN a beast keep captured by a human side, THEN it rises at 15; GIVEN a neutral keep with 13 troops in a match where both sides are beast, THEN it is level 1.
- **AC17 [Integration: Campaign Level Data] (rule 7, starting level)**: GIVEN a level whose rival keeps start with 14 troops, THEN they start at level 1 when the rival is `human` and at level 2 when it is `beast`; GIVEN the shipped Green Vale with the player as `human`, THEN every keep on gv-01 to gv-05 starts at the same level as in UAT-1.
- **AC18 [Logic] (rule 12)**: GIVEN a rival whose race is `beast`, THEN its keeps use thresholds 12 and 40 and `unit_for` returns the beast kinds, the same values a beast player gets.
- **AC19 [UI] (UI Requirements)**: retained screenshots in `production/qa/evidence/` show the Collection screen with the human card marked active and the beast card locked, and after an unlock the beast card owned and then active; GIVEN the beast's `lv2_offset` is changed to −2 in data, THEN its trait description reads 13 troops with no other change.
- **AC20 [Logic] (rule 13b, unknown `unlock`)**: GIVEN a shipped build and a beast record whose `unlock` is `gems`, THEN `races()` returns the beast with `unlock` `diamonds` and offsets −3 and +5, beast keeps use thresholds 12 and 40, and exactly one log line names `beast` and `gems`; GIVEN a development build, THEN it stops with one error naming `beast` and `gems`.
- **AC21 [Logic] (rule 13a, count and ids)**: GIVEN race data with six races, or with two races that share the id `beast`, THEN a development build stops naming rule 13(a); GIVEN a shipped build, THEN `races()` returns `human` alone with offsets 0 and 0; GIVEN no race data file at all, THEN the same, from the built-in human record.
- **AC22 [Logic] (T1, offset limits)**: GIVEN a race with offsets −6 and +10 (thresholds 9 and 45; `time_to_l2` 20.0 s, `time_to_l3` 65.0 s, so T2 and T3 would pass), THEN it is rejected naming T1 and `lv2_offset`; GIVEN offsets −5 and +10 (10 and 45; 22.5 s and 67.5 s), THEN the rule named is T2, not T1.

**Coverage check.** Rules 1–3 and 6: AC1, AC2. Rule 4: AC9. Rule 5 and F2 with T1–T3: AC3, AC5–AC8. Rule 7: AC4, AC16, AC17. Rule 8: AC12, AC14. Rule 9: AC15. Rules 10 and 14: AC13. Rule 12: AC18. Rule 13: AC10, AC11, AC20, AC21. The offset limits of T1: AC22. Rule 11 (owning a race) is provisional and is tested in Faction Collection & Unlocks. F1 and F2 each have a typical and a boundary case (AC2, AC3; AC4, AC6); T0–T3 each have one; cross-system: AC4, AC5, AC14–AC17. Not covered by a criterion: hot reload (edge case). Feel statements are playtest questions in Game Feel, not criteria.

## Open Questions

| # | Question | Owner | Resolve by |
|---|----------|-------|------------|
| 1 | Is the beast too strong early? Its trait (second rope 7.5 s sooner) stacks on its quick soldiers (132 px/s); the two budgets, T2 here and U5 in Unit Roster & Stats, are checked separately | game-designer, systems-designer | First UAT-2 playtest; `/balance-check` |
| 2 | A pricing rule for the reserved modifiers (margin, `max_ropes`, generation, `send_interval`) before any race may use them; F2 prices thresholds only | systems-designer | Before a third race is designed |
| 3 | Rosters and traits for the elf, the spirit and the dragon | Factions, Unit Roster & Stats | After the UAT build |
| 4 | Does a beast rival need its own `think` and `aggro`? Default: no change; a level's own numbers already tune it (Rival AI Open Question; Unit Roster & Stats Open Question 7) | Rival AI | First UAT-2 playtest |
| 5 | Which races the rivals of regions 2–5 play (the beast in region 2 is the suggestion), and whether the UAT-2 build has a level with a beast rival at all, since only the Green Vale has levels and its rival is human | Campaign Level Data, the user | When UAT-2 content is planned |
| 6 | Can the beast be unlocked in the UAT build? Closed 2026-11-25 by Currencies & Economy (`race_unlock_cost`, E5): yes; the beast costs 50 diamonds and conquering the Green Vale pays 50 | Currencies & Economy | Closed |
| 7 | How a beast pawn, which has no helm, carries the owner marks in greyscale | art-director | Art bible §5; `/asset-spec` |
| 8 | Do beast keeps get their own three silhouettes in the UAT build, or reuse the human keeps with a beast banner (6 extra keep sprites per owner colouring) | art-director, producer | `/asset-spec system:keep-levels` |
| 9 | Should the level start panel show the rival's race and crest (UI Requirements)? | Menus & Screens, World Map & Regions | Their next revision |
