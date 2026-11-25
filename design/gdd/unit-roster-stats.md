# Unit Roster & Stats

> **Status**: Approved (2026-11-25, fourth lean /design-review; see its review log)
> **Author**: user + Claude
> **Last Updated**: 2026-11-25
> **Last Verified**: 2026-11-22
> **Creative Director Review (CD-GDD-ALIGN)**: skipped — Lean mode
> **Implements Pillar**: 3. Paint the map, grow the army (`design/gdd/game-concept.md` § Pillars)

## Summary

Unit Roster & Stats says what each keep sends. A race has three units, one per keep level (soldier, rider, summon). Each fills Troop Marching's `UnitStats` record with a speed, a strength and a size. Level 2 units are faster, and level 3 units are worth more troops per pawn. A power budget keeps every race at the same strength per tier and every higher tier better than the one below.

> **Quick reference** — Layer: `Feature` · Priority: `MVP` (UAT-2) · Key deps: `Troop Marching & Clashes (contract), Keep Levels`

## Overview

Unit Roster & Stats is the list of units the army layer sends. Troop Marching & Clashes defines what a unit is (a record of speed, strength and size, and nothing else it reads), and this system fills that record in for every race and keep level. A keep sends the unit of its owner's race at its level: level 1 a soldier, level 2 a rider, level 3 a summon. Each step up is better: riders march faster, summons are worth two or three troops per pawn. Races differ in how they spend a shared power budget (the beast is fast and light, the dragon slow and heavy), so a race is a playstyle and never a free upgrade. In UAT-1 there is one unit, the baseline pawn, which is the human soldier. The player meets this system as the pawns themselves: what a keep sends, how fast it arrives and how hard it hits. Without it the army layer would have races and cards but nothing to march.

## Detailed Design

### Core Rules

`game-designer`, `systems-designer`, `gameplay-programmer` and `engine-programmer` not consulted — Lean mode. Review manually before production.

1. **A unit kind is a `UnitStats` record** (Troop Marching rule 16): `id`, `speed`, `strength`, `size`. This GDD fills the values; it adds no field and no rule. Kinds live in the data file, never in code.
2. **Three tiers, one per keep level.** Tier = keep level: tier 1 soldier, tier 2 rider, tier 3 summon (names are the writer's). A race's roster is exactly three kinds, `<race>_t1` to `<race>_t3`.
3. **`unit_for(owner, level)`** returns the kind of the owner's race at tier `level` (clamped to 1–3, logged if outside). Troop Marching calls it at launch with the origin keep's level. Stats are copied at launch; a later level drop or data change never alters a pawn in flight, and a relayed pawn keeps its kind (decided 2026-11-22: accepts Troop Marching's written default, its Open Question 3).
4. **The human race is the baseline.** Its roster is the template. `human_t1` is exactly the UAT-1 pawn (speed 110, strength 1, size 1.0, id `baseline_pawn`'s successor), so with no Factions every owner is human and nothing in UAT-1 changes.
5. **What rises with the level** (decided 2026-11-22): tier 2 raises speed, tier 3 raises strength. Template (human): tier 1 (110, 1, 1.0), tier 2 (172, 1, 1.15), tier 3 (110, 2, 1.3).
6. **One power budget.** `unit_power = strength × (speed / pawn_speed)^speed_exponent` (F1). Each tier has a target power and every kind of every race must lie within a band around it (F2, invariant U1). The bands do not overlap, so a higher tier is always a better unit. Races sit within the tier's band, not on its target: a race may be up to `band_width` above or below at one tier, and U5 keeps its three-tier total level with the human's, so races differ in how they spend the budget (speed or strength, early tier or late), not in how much they have.
7. **Races are allocations.** A race roster may move speed, strength and size within U1–U5; it may not change a rule. Concrete rosters ship for the human and one other race (the beast: faster and lighter, decided 2026-11-22); the structure holds up to five, and the remaining races are data Factions schedules.
8. **Troop Marching's defaults are accepted** (decided 2026-11-22): clashes are attrition (each side loses `min(hp_a, hp_b)`, and a stronger pawn survives with what is left), `size` is drawing and footprint only, and strength decides what a pawn is worth in a clash and on arrival (its rules 7 and 10). This GDD changes none of them.
9. **Neutral keeps launch nothing** (Troop Marching rule 18). The rival uses the same table with its own race, which Factions assigns per region, with an optional override per level (its rule 8).
10. **Card upgrades are a hook** (provisional): Unit Cards & Upgrades may add to a kind's stats for later launches, inside the hard bounds U2–U4. U1 applies to base stats; the extra power cards may add is that GDD's cap.
11. **`speed_min`** for a level is the lowest `speed` across all three kinds of every race a level can launch (the player's and the rival's). This system provides it to Campaign Level Data's R3 check, so the speed floor (U2, 55 px/s) covers the 53.8 px/s a 1,258 px rope needs (the registry's safe upper bound for `longest_rope`; the longest legal rope at baseline is 1,226 px and needs 52.4).
12. **The roster is read at match build and frozen** for the match. It is global tuning, checked once at app start by this system (the bad-data policy of Campaign Level Data rule 8).
13. **Loader order** (decided 2026-11-22, after the first review; completed after the second). The checks run in one fixed order, so a breach always names one rule: (a) the band table: `tier_target` rising and no two bands overlapping (U1 for the table); a failed table is replaced by the baseline for every later check, in either build; (b) the human roster: U6, then its kinds as in step (d) (its U5 total is the reference and holds by definition); (c) each other race in data-file order, then each race id Factions names that has no roster (a missing roster fails U6): U6 first; (d) each of its kinds in tier order, checked U2, then U3, then U4, then U1, stopping at that kind's first failure; (e) U5, on the race's roster with the human kind of its tier standing in for each kind that failed step (d), in either build, so both builds report the same U5 result. Last, the U3 margin warning (U3), which never rejects. **A development build** runs every step, then stops with one error listing every breach found (race, kind, rule, values). **A shipped build** repairs and logs each breach: a failed table is reset to the baseline (1.00, 1.25, 2.00; 0.10); a failed kind is replaced by the human kind of its tier; a race that fails U6, or fails U5 after replacements, has its whole roster replaced by the human one; and if the human roster itself fails any check, every tier of every race, valid races included, sends Troop Marching's default pawn (110, 1, 1.0). The human roster is the template every U5 total and every replacement depends on, so with it broken no other race can be checked or repaired (decided 2026-11-22).

### States and Transitions

The roster has no runtime state machine. A kind passes through load and validation once.

| State | Meaning | Enter when | Leave when |
|---|---|---|---|
| Loaded | Records read from the data file | App start | → Validated, or → Rejected |
| Validated | U1–U6 hold for every race | All checks pass | Frozen into the match at build |
| Rejected | A check of rule 13 fails | A check fails | Development: the build stops with one error listing every breach (race, kind, rule, values). Shipped: repaired as rule 13 says (a kind replaced by the human kind of its tier; a whole roster replaced on U6, or on U5 after replacements; every race on the default pawn if the human roster fails) and logged |

### Interactions with Other Systems

| System | Direction | Data | Interface owner |
|---|---|---|---|
| Troop Marching & Clashes | out/in | Out: `UnitStats` records, `unit_for(owner, level)`. In: its hard bounds M1–M7 | Troop Marching owns the contract and the bounds; this GDD fills the values |
| Keep Levels | in | The keep's `level` (tier); `level_drop_margin` (U3's margin warning) | Keep Levels |
| Factions (UAT-2) | in/out | In: the owner's race. Out: the three kinds per race | Factions chooses the race; this GDD defines what it sends |
| Unit Cards & Upgrades (UAT-2) | in | Stat additions per card level, for later launches (rule 10) | Unit Cards & Upgrades (provisional) |
| Rival AI | out | `unit_for(rival, level)`; `strength` feeds `threat` and `incoming` | Rival AI reads, this GDD supplies |
| Campaign Level Data | out | `speed_min` of the races a level can launch, for R3 and M2 | Campaign Level Data enforces; this GDD supplies |
| Level HUD, art | out | `id` and `size` of the kind, to pick and scale the pawn | Level HUD draws |

## Formulas

`systems-designer` lens applied by the author (Lean mode: Section D is a high-risk section). Every variable was worked at its minimum, its maximum and at 0; the findings are under Boundary findings.

### F1. Unit power

The unit_power formula is defined as:

`unit_power = strength × (speed / pawn_speed)^speed_exponent`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| strength | int | 1–3 (U3) | data file (`UnitStats.strength`) | Troops the pawn is worth in a clash and on arrival |
| speed | float, px/s | 55–220 (U2) | data file (`UnitStats.speed`) | March speed |
| pawn_speed | float, px/s | 110 | data file (Troop Marching & Clashes) | The baseline speed; the unit of the ratio |
| speed_exponent | float | 0.3–1.0 (baseline 0.5) | data file | How much a speed advantage counts toward power |

**Output Range:** 0.71 (strength 1 at 55 px/s) to 4.24 (strength 3 at 220 px/s) over the hard ranges; 0.90 to 2.20 for a legal kind (F2).
**Why 0.5:** a rope sends one pawn every `send_interval` whatever the pawn's speed, so strength multiplies a rope's troops per second and speed only shortens the wait before they land. Speed is therefore worth less than strength; the square root is the starting guess and a tuning knob.
**Example:** the human rider, speed 172, strength 1: 1 × (172 / 110)^0.5 = 1.25.

### F2. Tier bands

The tier_band formula is defined as:

`tier_target[tier] × (1 − band_width) ≤ unit_power ≤ tier_target[tier] × (1 + band_width)`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| tier | int | 1–3 | calculated (the keep's level, Keep Levels) | Which unit of the race's three |
| tier_target | float[3] | rising; baseline 1.00, 1.25, 2.00 | data file | The power every race's unit has at that tier |
| band_width | float | 0–0.11 (baseline 0.10) | data file | How far a race may sit from the target |

**Output Range:** bands 0.90–1.10, 1.125–1.375 and 1.80–2.20 at baseline. They do not overlap, so a higher tier is always the better unit; `band_width` above 0.11 would let tier 1 (1.11) meet tier 2 (1.1125), which U1 forbids.
**Example:** the beast soldier, speed 132, strength 1: (132 / 110)^0.5 = 1.095, inside 0.90–1.10.

**Speed each band allows** (strength is whole, so the band fixes a speed range; whole px/s): tier 1 at strength 1, 90–133 px/s (89 gives 0.8995, below the band); tier 2 at strength 1, 140–207 (139 gives 1.1241 and 208 gives 1.3751, both outside); tier 3 at strength 2, 90–133; tier 3 at strength 3, 55–59 (the floor of U2 to the top of the band): the slow, heavy summon.

### Rosters (baseline data)

| Kind | Speed | Strength | Size | Power |
|---|---|---|---|---|
| `human_t1` soldier (the UAT-1 pawn) | 110 | 1 | 1.0 | 1.00 |
| `human_t2` rider | 172 | 1 | 1.15 | 1.25 |
| `human_t3` summon | 110 | 2 | 1.3 | 2.00 |
| `beast_t1` | 132 | 1 | 0.9 | 1.10 |
| `beast_t2` | 172 | 1 | 1.1 | 1.25 |
| `beast_t3` | 92 | 2 | 1.3 | 1.83 |

The human total is 4.25; the beast's is 4.17 (98% of it): quick soldiers paid for with slow summons.

### Invariants (checked at app start; the loader reports a breach)

- **U1.** Every kind's `unit_power` lies in its tier's band (F2), and the bands do not overlap.
- **U2.** `55 ≤ speed ≤ 220`, inside Troop Marching's M1 (30–400). The floor keeps Campaign Level Data's R3 and Troop Marching's M2 true on every legal rope at baseline `send_interval` (53.8 px/s at the 1,258 px safe upper bound for `longest_rope`; 52.4 at the 1,226 px longest legal rope at baseline).
- **U3.** `strength` is whole and `1 ≤ strength ≤ 3`. *Margin warning (logged, never a breach; decided 2026-11-22):* one pawn arriving at a keep that sits on its level threshold cannot drop it a level only while `strength ≤ level_drop_margin` (baseline 5; Troop Marching's boundary note for this GDD). Keep Levels allows margins 0–20 and Factions may override the margin per race, so the loader logs one warning, naming the margin and the strongest kind, when the base margin or any override is below the largest `strength` of any kind. Nothing is rejected or replaced.
- **U4.** `0.8 ≤ size ≤ 1.5`, inside Troop Marching's M7, so M3 holds at the speed floor: 55 × 0.6 = 33 ≥ `pawn_min_spacing` 20 × 1.5.
- **U5.** The sum of a race's three powers is within ±5% of the human template's (4.25: 4.04 to 4.46), so a race trades one tier against another and is never a free upgrade.
- **U6.** A race has exactly three kinds, one per tier, with unique ids.

### Boundary findings

- `strength` 0 or `speed` 0 gives power 0 and a pawn that does nothing; U2 and U3 exclude both, and nothing divides by a data value except `pawn_speed`, which is positive.
- **Strength 3 is legal only at 55–59 px/s.** A heavy summon is always slow; that is the budget working, not a gap.
- **A level 3 keep's rope carries twice the troops.** At strength 2 one rope delivers 2 / 0.6 = 3.33 troops per second instead of 1.67. Troop Generation's I3 still holds (a rope out-sends any keep), but captures driven from level 3 keeps come faster than Troop Generation's F4 example (59 s), which assumes strength 1: re-run that pace for UAT-2 (Open Questions).
- `speed_exponent` 1.0 would price the rider (172) at 1.56, outside its band; changing the exponent means re-deriving every speed.

### Feedback loop

A higher keep level sends a better unit, which takes keeps faster, which raises more keeps' levels. It is the same positive loop Keep Levels and Troop Generation describe, made steeper at tier 3. It is damped by the tier bands (no unit is worth more than 2.2 soldiers), by attrition in clashes (a counter-rope still cancels strength point for point) and by the level drop: a keep under attack falls back to its soldier.

## Edge Cases

`systems-designer` not consulted — Lean mode. Review manually before production.

- **If `unit_for` is asked for a level outside 1–3**: it clamps to the nearest tier and logs it (Keep Levels guarantees 1–3, so this is a defect, not a data case).
- **If an owner has no race** (UAT-1, or Factions absent): the human roster is used, so every keep sends the baseline pawn at level 1.
- **If a race id has no roster in the data file**: it fails U6 (rule 13, step c). Development builds stop naming the race; shipped builds use the human roster for that owner and log it.
- **If `level_drop_margin`, or a race's Factions margin override, is below the strongest kind's `strength`** (for example margin 0 or 1 against a strength 2 summon): the roster stays valid; the loader logs one warning (U3), and a single arrival can then drop a keep sitting on its threshold.
- **If one kind breaks U2, U3, U4 or U1**: the first failing rule in that order is the one named (rule 13). Development builds stop, listing it with the race, the kind and the values; shipped builds replace that kind with the human kind of the same tier and log it.
- **If a race breaks U6** (not exactly three kinds, one per tier), **or breaks U5** on its roster after any kind was replaced: development builds stop, listing it; shipped builds replace that race's whole roster with the human one and log it. **If the human roster itself fails any check** (U6 included): development builds stop; shipped builds send Troop Marching's default pawn at every tier for every race, valid races included, because every U5 total and every replacement depends on the human template (rule 13).
- **If `tier_target` is not rising, or `band_width` lets two bands overlap**: U1 fails for the table itself, and it is checked first (rule 13). Development builds stop, listing it; shipped builds reset both to the baseline (1.00, 1.25, 2.00 and 0.10) and log it.
- **If a keep's level changes while its pawns are marching**: they keep the kind and stats they were launched with (rule 3); the next launch uses the new tier.
- **If a keep is captured**: pawns it already launched keep their owner and kind; the new owner's race applies from the keep's next launch (at level 1, so its soldier).
- **If a pawn is relayed through a keep of another level**: it keeps its kind and its remaining `hp` (rule 3; Troop Marching AC-M34).
- **If pawns of different speeds share a rope** (the keep rose to tier 2 mid-stream): allied pawns never block each other; the faster one passes through the slower and arrives first. Arrival order is Troop Marching's rule 11, by the step each arrives. Whether the overlap reads well is Open Question 4.
- **If a strength 2 pawn arrives at an enemy keep holding 1 troop, or at an allied keep one below `troop_cap`**: Troop Marching's arrival rules decide (surplus strength is discarded on capture, its rule 12; its F6 handles the cap). Nothing is decided here.
- **If the player and the rival have the same race**: legal; owner colours and marks tell them apart (art bible §4).
- **If a card upgrade would push a stat past U2, U3 or U4**: the stat stops at the bound (rule 10); the surplus is Unit Cards & Upgrades' to refuse or refund.
- **If the roster data changes while a match runs** (development hot reload): the running match keeps the roster it was built with (rule 12); the change applies from the next match build.

## Dependencies

Troop Marching & Clashes, Keep Levels, Rival AI, Campaign Level Data, Level HUD and Factions (designed 2026-11-25, pending review) have GDDs; Unit Cards & Upgrades and Collection & Upgrade Screens have none yet, so those contracts are provisional.

| System | Nature | Direction | What this GDD needs or gives | GDD status |
|---|---|---|---|---|
| Troop Marching & Clashes | Hard | in/out | In: the `UnitStats` contract (its rule 16) and bounds M1–M7. Out: the records and `unit_for(owner, level)` | Approved |
| Keep Levels | Hard | in | The keep's `level` (the tier); `level_drop_margin` for U3's margin warning | Approved |
| Factions (UAT-2) | Soft | in/out | In: each owner's race (`race_of(owner)`, human when absent). Out: the three kinds per race | Designed, pending review |
| **Depended on by** | | | | |
| Unit Cards & Upgrades (UAT-2) | Hard | out | The kinds a card upgrades; the bounds U2–U4 its additions must respect | Not yet designed |
| Rival AI | Soft | out | `unit_for(rival, level)`; `strength` behind `threat` and `incoming` | Approved |
| Campaign Level Data | Soft | out | `speed_min` of the races a level can launch, for R3 and M2 | Approved |
| Level HUD | Soft | out | The kind's `id` and `size`, to pick and scale the pawn sprite | Approved |
| Collection & Upgrade Screens (UAT-2) | Soft | out | Each kind's name, tier, speed and strength for its card | Not yet designed |

**Bidirectional check.** Troop Marching & Clashes (rules 3 and 16, Interactions, Dependencies, AC-M34), Keep Levels (Interactions, Dependencies, Open Question 4) and Rival AI (rule 11, Interactions, Dependencies) name Unit Roster & Stats. Campaign Level Data uses `speed_min` and cites Troop Marching F8 as its source; it should also name this GDD as the supplier from UAT-2. Level HUD draws `pawns()` with a unit field and does not name this GDD.

## Visual/Audio Requirements

`art-director` not consulted — Lean mode. Review manually before production. From art bible §3 (shape language) and §4 (owner marks).

- **Three silhouettes per race, one per tier**, readable at phone size without colour: a soldier on foot, a mounted rider, a summoned creature. The tier must read from the shape alone, as the keep's level does (Keep Levels Visual/Audio).
- **Size follows troop value** (art bible §3: "if unit kinds are worth different troop values, size follows value"): the summon is the largest figure, drawn at its `size`.
- **Width cap.** Art bible §3 keeps pawns 16 px wide or less across the lane so two opposite streams 16 px apart still read. With `size` up to 1.5 the base sprite must be about 10 px wide or less, or `size` must scale height more than width (Open Question 3).
- **Speed reads from the gait**: a rider's bob is quicker and longer than a soldier's; nothing else marks speed.
- **Owner marks are unchanged**: colours, helm shapes and banners (art bible §4) apply to every kind of every race.
- **Audio**: none of its own. The march thud and clash sounds are Troop Marching's and the Audio GDD's; a heavier thud for a summon is a suggestion for that GDD.

📌 **Asset Spec** — after the art bible is approved, run `/asset-spec system:unit-roster-stats` for the three figures of each shipped race (human, beast) in both owner colourings.

## Game Feel

- **You can tell a keep's level from what walks out of it.** A keep that rises to level 2 starts sending riders on its next launch; the player sees the upgrade on the rope, not only on the plaque.
- **Riders arrive sooner.** On a 300 px rope a soldier takes 2.73 s and a rider (172 px/s) 1.74 s: reinforcement from a level 2 keep lands a second earlier.
- **Summons hit harder.** One summon takes 2 troops off a plaque on arrival; a level 3 rope visibly drains a keep twice as fast.
- **A race is a habit, not a number.** The beast's quick soldiers reward early rushing and its slow summons punish waiting for level 3; the player should feel that within one level. Playtest question for UAT-2: can testers say how the beast plays differently after two levels?
- **Reference feel**: Mushroom Wars' unit tiers by building level.

## UI Requirements

Nothing new during a match: the pawn sprite is the only expression, and no strength number is drawn on a pawn (the plaque shows what an arrival did). Outside a match, Collection & Upgrade Screens shows each kind on its card with its tier, speed and strength (as icons or bars, not raw px/s); that GDD owns the layout.

> **UX Flag — Unit Roster & Stats**: this system supplies content to the Collection & Upgrade Screens. Run `/ux-design` for those screens before writing epics; stories that touch the UI should cite `design/ux/[screen].md`.

## Cross-References

| This GDD relies on | In | What it relies on |
|---|---|---|
| Troop Marching & Clashes | Rules 3, 7, 10, 11, 12, 16; M1–M7; F6; AC-M34; Open Questions 1–3 | The `UnitStats` contract; launch-time copy; attrition clashes; arrival and capture; the hard bounds; its three open questions, closed here by accepting the defaults |
| Keep Levels | Rule 1, F2; `level_drop_margin` (5) | The tier is the keep's level; U3's margin warning |
| Campaign Level Data | F1 (R3), `speed_min` | The speed floor U2 guarantees its bound |
| Rope Links | `send_interval` (0.6 s) | A rope's troops per second (Boundary findings) |
| Troop Generation | F4, I3 | The capture pace to re-run at strength 2 |
| Rival AI | Rule 11; F2 (`threat`) | The rival's kinds; strength in `threat` |
| design/art/art-bible.md | §3 shape language, §4 owner marks | Silhouettes, size follows value, the 16 px width cap |
| game-concept.md | § Army; Pillar 3 | Soldiers, riders and summons per keep level; races as playstyles |

**Edits other documents need as a result of this GDD** (none applied yet):
1. `troop-marching-clashes.md`: close Open Questions 1, 2 and 3 (attrition, size is drawing only, a relayed pawn keeps its kind), citing this GDD.
2. `keep-levels.md`: close Open Question 4 (the kind per level is this GDD's rule 2; a drop does not change units already marching).
3. `campaign-level-data.md`: name this GDD as the supplier of `speed_min` from UAT-2.
4. `troop-generation.md`: note under F4 that the capture pace must be re-run for UAT-2 (a tier 3 rope carries strength 2).
5. `design/registry/entities.yaml`: register `unit_power` and `tier_band` (formulas) and `speed_exponent`, `tier_target`, `band_width` and the speed, strength and size bounds (constants).
6. `systems-index.md`: row 21 → designed, with the GDD link.

## Acceptance Criteria

Baseline data unless a criterion says otherwise: `pawn_speed` 110, `speed_exponent` 0.5, `tier_target` 1.00 / 1.25 / 2.00, `band_width` 0.10, the human and beast rosters in Formulas, `level_drop_margin` 5, `send_interval` 0.6. Tags: **[Logic]** automated test in `tests/unit/`; **[Integration: X]** in `tests/integration/`; **[UI]** retained screenshot in `production/qa/evidence/`. `qa-lead` lens applied by the author (Lean mode: Section H is a high-risk section).

- **AC1 [Logic] (rule 4)**: GIVEN the shipped roster, THEN `human_t1` has speed 110, strength 1 and size 1.0, the UAT-1 pawn's values.
- **AC2 [Logic] (rules 2, 3)**: GIVEN a human owner, WHEN `unit_for` is called with levels 1, 2 and 3, THEN it returns `human_t1`, `human_t2` and `human_t3`; GIVEN levels 0 and 4, THEN it returns `human_t1` and `human_t3` with one log line each.
- **AC3 [Integration: Troop Marching & Clashes] (rule 3)**: GIVEN a pawn launched from a level 2 human keep, WHEN the keep drops to level 1 before it arrives, THEN the pawn still marches at 172 px/s, and the keep's next launch is a soldier at 110.
- **AC4 [Logic] (F1)**: GIVEN speed 172 and strength 1, THEN `unit_power` is 1.25 (within 0.01); GIVEN 110 and 2, THEN 2.00; GIVEN 55 and 1, THEN 0.71.
- **AC5 [Logic] (F2, U1 boundary)**: GIVEN a tier 1 kind with strength 1, THEN speed 133 validates (power 1.10) and speed 134 is rejected naming U1 (power 1.104); GIVEN `band_width` 0.12, THEN the table is rejected naming U1 (bands overlap).
- **AC6 [Logic] (U2, rule 13 order)**: GIVEN a kind with speed 54 or 221, THEN the first rule named for it is U2; GIVEN a tier 2 kind with speed 300 (which also breaks U1, power 1.65), THEN U2 is the rule named for it, not U1; GIVEN 55 or 220, THEN the U2 check passes.
- **AC7 [Logic] (U3, rule 13 order)**: GIVEN a tier 3 kind with strength 4 and speed 110 (which also breaks U1, power 4.0), THEN the rule named for it is U3; GIVEN a tier 3 kind with strength 3 and speed 57, THEN it validates (power 2.16).
- **AC8 [Logic] (U4)**: GIVEN a kind with size 1.6 or 0.7, THEN it is rejected naming U4.
- **AC9 [Logic] (U5)**: GIVEN a race whose three powers sum to 4.50, THEN it is rejected naming U5; GIVEN the beast roster (4.17), THEN it validates.
- **AC10 [Logic] (U6)**: GIVEN a race with two kinds, or two kinds at tier 2, THEN it is rejected naming U6.
- **AC11 [Logic] (rule 13, shipped fallback)**: GIVEN a shipped build and a `beast_t2` with speed 300, THEN the beast sends `human_t2`'s stats (172, 1, 1.15) at level 2, its other tiers are unchanged, U5 is checked on the repaired roster (1.095 + 1.25 + 1.83 = 4.17, passes) and exactly one log line names `beast_t2` and U2; GIVEN a development build, THEN it stops with one error naming the race, the kind, U2 and the value 300, and no U5 breach for the beast (U5 is summed with `human_t2` standing in: 4.17). GIVEN a shipped build and a race with two kinds, THEN all three of its tiers send the human kinds and one log line names the race and U6.
- **AC18 [Logic] (rule 13, human roster)**: GIVEN a shipped build and a `human_t2` with speed 300, THEN every tier of the human and of the (valid) beast sends (110, 1, 1.0) and one log line names `human_t2` and U2; GIVEN a human roster with two tier 2 kinds, THEN U6 is named for the human race in either build.
- **AC19 [Logic] (U3 margin warning)**: GIVEN `level_drop_margin` 1 and the baseline rosters, THEN every kind validates, the shipped rosters are unchanged, and exactly one warning names margin 1 and strength 2; GIVEN margin 0, THEN the same, naming margin 0; GIVEN margin 5, THEN no warning.
- **AC17 [Logic] (F2 lower edges)**: GIVEN a tier 1 kind with strength 1, THEN speed 90 validates (power 0.905) and 89 is rejected naming U1 (0.8995); GIVEN a tier 2 kind with strength 1, THEN 140 validates (1.128) and 139 is rejected (1.124), and 207 validates (1.372) and 208 is rejected (1.3751).
- **AC12 [Integration: Troop Marching & Clashes] (rule 8)**: GIVEN a strength 2 summon and an enemy strength 1 soldier meeting on a rope, THEN the soldier falls and the summon marches on with `hp` 1; on arrival it removes 1 troop.
- **AC13 [Integration: Troop Marching & Clashes] (rule 3, relay)**: GIVEN a `human_t1` pawn with `hp` 1 launched from a level 1 keep and relayed by a full allied keep (60 troops, so level 3), THEN it leaves as `human_t1` with speed 110, strength 1 and `hp` 1, not as `human_t3`; GIVEN a `human_t2` pawn relayed by the same keep, THEN it leaves at 172 px/s.
- **AC14 [Integration: Campaign Level Data] (rule 11)**: GIVEN a level whose player is human and whose rival is beast, THEN `speed_min` is 92 (`beast_t3`) and R3 is checked with it; GIVEN both human, THEN 110.
- **AC15 [Integration: Rival AI] (rule 9)**: GIVEN four strength 2 player pawns heading for a rival keep, THEN its `threat` is 8.
- **AC16 [UI] (Visual/Audio)**: retained screenshots in `production/qa/evidence/` show the three tiers of the human and of the beast side by side at phone size, in both owner colourings; 4 of 5 testers name each figure's tier from a greyscale copy.

**Coverage check.** Rules 1–4, 8, 9 and 11 have criteria (AC1–AC3, AC12–AC15); rule 13 (loader order and fallbacks) is AC6, AC7, AC11 and AC18; U3's margin warning is AC19; rules 5–7 are covered through F1, F2 and the rosters (AC4, AC5, AC9, AC17); rule 10 (cards) is provisional and is tested in Unit Cards & Upgrades; rule 12 (the roster frozen for a match) has no criterion yet, with the other gaps the first review listed (review log). F1 and F2 each have a typical and a boundary case, upper and lower edges included; U1–U6 each have one; cross-system: AC3, AC12–AC15.

## Open Questions

| # | Question | Owner | Resolve by |
|---|----------|-------|------------|
| 1 | `speed_exponent` 0.5 and the tier targets 1.00 / 1.25 / 2.00 are reasoned, not playtested. Is a rider worth a quarter more than a soldier, and a summon two? | game-designer | First UAT-2 playtest; `/balance-check` |
| 2 | A tier 3 rope carries 3.33 troops per second. Re-run Troop Generation's F4 capture pace (59 s at strength 1) with tiered units, and check that a level 3 keep is not decisive too early | systems-designer | Before the UAT-2 build |
| 3 | Pawns must stay 16 px wide or less across the lane (art bible §3). Does `size` scale width, or height only, and how wide is the base sprite? | art-director | Art bible §5; `/asset-spec` |
| 4 | Do riders passing through soldiers on one rope read well, or should a rope's pawns keep their order? | game-designer, ux-designer | First UAT-2 playtest |
| 5 | Stats for the elf, the spirit and the dragon. (How many races ship in the UAT build: answered 2026-11-25 by Factions rule 2, the human and the beast) | Factions | After the UAT build |
| 6 | How much power card upgrades may add on top of U1, and whether upgrades may break the tier order | Unit Cards & Upgrades | That GDD |
| 7 | Does the rival's race need different `think` and `aggro` tuning (a beast rival rushes harder at the same numbers)? Factions' default is no change (its Open Question 4) | Rival AI, Factions | First UAT-2 playtest |
