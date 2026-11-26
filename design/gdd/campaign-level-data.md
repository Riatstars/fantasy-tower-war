# Campaign Level Data

> **Status**: Approved (polish pass re-reviewed 2026-11-25, lean /design-review; see its review log)
> **Author**: user + Claude
> **Last Updated**: 2026-11-25 (army-layer hooks added after approval: `rival_race`, the `stars` block, F3 by owner race, rule 13; re-check pending)
> **Last Verified**: 2026-11-22
> **Creative Director Review (CD-GDD-ALIGN)**: skipped — Lean mode
> **Implements Pillar**: 3. Paint the map, grow the army (`design/gdd/game-concept.md` § Pillars); its levels are tuned for Pillar 2 (2–3 minutes, one glance)

## Summary

Campaign Level Data is the campaign's content: regions, their levels, and for each level the keeps (position, owner, starting troops), the rival's `think`, `aggro` and seed, whether it waits for the player's first rope, and what comes next. It owns the loader that checks every level against the invariants other systems impose (L1, I2, R3, bounds) before a match is built, so bad data fails loudly rather than breaking a match. UAT-1 ships one playable region, the Green Vale, holding the five prototype maps, plus four fog-only region records (r2–r5) with no levels yet.

> **Quick reference** — Layer: `Feature` · Priority: `MVP` (UAT-1) · Key deps: `Keep Levels, Rival AI, Level State & Match Flow, Touch & Mouse Input (I2), Rope Links (R3)`

## Overview

Campaign Level Data is the content of the campaign: the regions, the levels in each, and for every level the keeps on the table (where they stand, who owns them, how many troops they start with), the rival's two difficulty numbers and seed, whether the level waits for the player's first rope, and which level comes next. It is data, not behaviour: it defines the record that Level State builds a match from, that Rival AI reads its `think` and `aggro` from, and that World Map & Regions draws as nodes. It also owns the loader that checks every level against the invariants other systems impose before a match is built, so a bad layout fails loudly in development and refuses to load in a shipped build rather than breaking a match. In UAT-1 it ships one playable region, the Green Vale, holding the five maps the prototype was played on, re-checked against those invariants, plus four fog-only region records (r2–r5) with no levels yet. The player meets this system as the levels themselves: how the board is laid out decides whether a level is a gentle race for neutrals or a knife fight over the middle keep. Without it there is nothing to play.

## Detailed Design

### Core Rules

1. **Shape.** The campaign is a list of **regions**; each region has an ordered set of **levels**, possibly empty (a region with no levels is legal, never unlocks and stays fogged: World Map & Regions F2, decided 2026-11-22); each level is one **level record**. A **region record** holds `id`, `name`, `order` (its 1-based place in the campaign), and two fields World Map & Regions defines (added 2026-11-22): `fog_shape` (the art id of its silhouette under fog) and `banner_anchor` (a map-pixel point where conquest banners gather). It may also hold `rival_race` (optional: a race id string; default `human`), the race the rival plays on this region's levels (Factions, decided 2026-11-25). **Campaign order** is region `order`, then level `order`. Each level's `region_id` and `order` are the one source of truth for membership and sequence (decided 2026-11-22): a region record does not list its levels, and the loader builds each region's level list from the levels that name it. A region that no level names is empty. Ids are short stable strings (`gv` for the Green Vale, `gv-01` … `gv-05` for its levels), never renumbered and never reused once shipped: Save & Progress keeps results by id and tolerates ids it no longer knows (its rule 10), so renaming an id orphans every player's result for it.
2. **The level record** is the contract Level State (its rule 1) and Rival AI (its rule 2) consume. Every field is required unless marked optional or reserved; a missing required field, or a value of the wrong type, is a parse failure and the level is Rejected. Types: `id`, `region_id` and `name` are strings; `order` an int ≥ 1; `wait_for_first_rope` a bool; `think` and `aggro` numbers; `seed` an int; keep `id` and `troops` ints, `owner` one of the three words; keep `x`, `y` and `node` `x`, `y` whole logical pixels (ints), as in the prototype; `decor` points numbers; `rival_race` a string; `stars.time` a number. The fields:
   - `id`, `region_id`, `name`, `order` (1-based within the region);
   - `wait_for_first_rope` (bool);
   - `rival`: `think` (s), `aggro` (0–1), `seed` (int);
   - `keeps[]`: `id` (0-based, ascending, unique within the level), `x`, `y` (logical table pixels), `owner` (`player` | `rival` | `neutral`), `troops` (int);
   - `node`: `x`, `y` on the world map image (720 × 1,280 map pixels), where World Map & Regions draws this level's node (added 2026-11-22 from that GDD);
   - `decor` (optional): `river`, a polyline of table points, drawn and nothing else;
   - `rival_race` (optional): a race id that replaces the region's for this level; absent means the region's. An id that names no loaded race is a level-data error in development, naming the region or level and the id; a shipped build plays `human` and logs it (Factions, decided 2026-11-25);
   - `stars` (optional; Stars & Rewards, decided 2026-11-25): `{ time }`, the level's star time in seconds, in whole tenths, above 0. With no block the level has no time goal. A bad value rejects the block, not the level, and is logged. A UAT-1 build has no block, and every win is `win_stars`.
3. **The table** is 720 × 1,280 logical pixels, portrait (Touch & Mouse Input owns the table and its scaling to the screen). Every position in a record is in those units. Keep order (`id`) matters: Troop Marching resolves arrivals keep by keep in ascending id (its rule 11) and Rival AI breaks ties by lower id, so authors keep ids stable within a level too.
4. **Starting troops are per keep**, including the player's and the rival's. The prototype's single `player_start` (10) and per-map `rival` number are written into each keep's `troops`; the baseline keeps those values. A keep's starting level follows from its troops by Keep Levels F1 (`rise_level`), with no history (its rule 8): a neutral with 16 troops starts at level 2.
5. **The first-rope wait** (decided 2026-11-22; closes Level State Open Question 2): `wait_for_first_rope` is true on the first level of the game (`gv-01`) and false everywhere else. It is a field, not a rule, so a tutorial level may set it later. The prototype's `ai_grace` (60 s before the rival may attack on map 1) is not carried: `game-concept.md` replaces it with this first-rope rule.
6. **The rival's seed is fixed per level** (decided 2026-11-22; closes Rival AI Open Question 2): `rival.seed` is a constant in the record, so every attempt at a level meets the same rival given the same player actions. A level with no rival keep still carries a `rival` block (unused).
7. **Sequence.** `next(level)` is the loaded level with the next higher `order` in the same region, else the lowest-order loaded level of the next region in campaign order (rule 1) that has loaded levels (an empty region is skipped), else none. Only loaded levels count: a level a shipped build drops at campaign load (Rejected, rule 8, or dropped by B3 or B7) is not in the sequence, so `next()` skips it to the next playable level and the skip is logged; an order gap is skipped the same way (decided 2026-11-22). World Map & Regions derives which nodes are unlocked from Save & Progress results and this sequence; this GDD never stores progress. A region is complete (World Map & Regions' Conquered, its rule 4 and F2) when every loaded level in it is beaten; a region with no loaded levels is never complete.
8. **The loader validates every record before Level State builds a match**, against invariants other systems impose (Formulas: L1, I2, R3, B1–B4, B7, B8, and Troop Marching's M2 and M3). M2 is the same inequality as R3 (`ceil(L / (v × s)) + 1 ≤ pawns_per_rope_max` holds exactly when `s ≥ L / ((pawns_per_rope_max − 1) × v)`, 40 and 39 at baseline), so the loader checks it once and a breach names both R3 and M2; M3 (`speed_min × send_interval ≥ pawn_min_spacing × size_max`) is checked per level with them. Every check runs at campaign load (app start): B3 and B7 once over the whole campaign, and the per-level checks (L1, I2, R3 with M2, M3, B1, B2, B4–B6, B8) for every level. Each build request validates its level again; a shipped build gets the same answer, and this is what lets a development build hot-reload a file. A development build stops with an error naming the level id, the rule and the offending values. A shipped build drops a level that fails at campaign load from the campaign and logs it, so it has no node and `next()` skips it (rule 7, decided 2026-11-22); Screen Flow's load-failure rule (its rule 11) covers a level that still fails when its match is built (an unreadable file), and the case where nothing playable survives campaign load. A level that fails validation is never built, so no match can start from bad data. **Policy for bad data** (decided 2026-11-22; one rule for every GDD): a level record, and every check that compares a level with tuning (L1, I2, R3, B1–B4, B7, B8, Troop Marching M2 and M3), is Rejected in a shipped build, never clamped. Global tuning constants that do not depend on a level (Touch & Mouse Input I1, I3, I4; Rope Links R1, R2, R4; Troop Marching M1, M4–M7; Keep Levels K1–K4; Troop Generation I1–I3; the knobs in Rival AI's tuning file) are checked once at app start by their owners and, in a shipped build, clamped to the nearest valid value and logged, so the game still runs. There are two runtime adjustments, and neither changes level data: Touch & Mouse Input's touch radius `keep_touch_radius` (its F1b), which never changes `keep_hit_radius` or any check here (Edge Cases), and B6's HUD band shrink in a shipped build (Level HUD H1).
9. **Registration.** At app start the loader registers with Save & Progress the set of known level ids and region ids (Save rule 10, its "lookup it registers"), and offers World Map the region and level sequence. It never reads or writes the progress file.
10. **Decor has no effect on play.** The river polyline is drawn by the Level scene behind the keeps; ropes and pawns cross it freely, as in the prototype. Anything that affects play is a keep.
11. **Content ships as data files**, one per level plus one per region, in the format the architecture decides (an ADR); the GDD fixes the fields and ranges, not the syntax. Development builds reload a level file on change without a restart (tools item).
12. **UAT-1 content: one playable region.** The Green Vale, `gv`, `order` 1, holds the five prototype maps in their played order (Content below). Regions 2–5 ship as region records with an `id` (`r2` … `r5`), a placeholder `name`, `order` 2–5, their `fog_shape` and `banner_anchor`, and no level naming them (decided 2026-11-22), so World Map & Regions draws their fog from data (its rule 13). Their ids are permanent once shipped (rule 1): UAT-2 adds levels that name these regions rather than replacing the records. The difficulty ramp across them is data: `think` 3.0 → 1.4, `aggro` 0.3 → 1.0, rival keeps 1 → 3 with 10 → 18 troops, keeps 7 → 11. UAT-2 and later add regions by adding files; no rule here changes.
13. **No level needs a rare race** (Factions, decided 2026-11-25). Every level is authored and tested to be winnable with the `human` race; none may require a `diamonds` race.

### Content: Region 1, the Green Vale (`gv`)

Measured on the prototype's layouts (`prototypes/tower-war/config.js` MAPS); table 720 × 1,280; `keep_hit_radius` 78; `pawn_speed` 110; `pawns_per_rope_max` 40. Player keep 10 troops on every level.

| Order | Id | Name | Keeps (P / R / N) | Rival troops each | Neutral troops (sum) | Neutrals starting level 2 | `think` | `aggro` | Wait | Tightest pair | Longest pair | R3 needs `send_interval` ≥ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | gv-01 | First Field | 7 (1 / 1 / 5) | 10 | 36 | none | 3.0 | 0.3 | yes | 262 px | 810 px | 0.189 s |
| 2 | gv-02 | The Ford | 8 (1 / 1 / 6) | 15 | 68 | 2 (the two 16s) | 2.4 | 0.6 | no | 206 px | 932 px | 0.217 s |
| 3 | gv-03 | Crossroads | 9 (1 / 2 / 6) | 14 | 73 | 1 (the 25) | 2.0 | 0.75 | no | 226 px | 919 px | 0.214 s |
| 4 | gv-04 | Twin Hills | 10 (1 / 2 / 7) | 16 | 86 | 1 (the 20) | 1.7 | 0.85 | no | 220 px | 914 px | 0.213 s |
| 5 | gv-05 | The Last Keep | 11 (1 / 3 / 7) | 18 | 94 | 3 (16, 16, 24) | 1.4 | 1.0 | no | 180 px | 920 px | 0.214 s |

Rival keeps of 15 troops or more also start at level 2 (F3): gv-02's, gv-04's and gv-05's. Every level passes I2 (≥ 156 px), R3 (0.6 ≥ 0.217) and L1. The keep coordinates are the prototype's and are reproduced in the data files, not here; the river polylines on gv-02, gv-04 and gv-05 are decor. `rival.seed` values are assigned when the files are written (any fixed integers). The level names are placeholders until the writer passes over the Green Vale.

### States and Transitions

This system has no runtime behaviour of its own; a record passes through the loader once at campaign load (app start) and again on every build request (rule 8).

| State | Meaning | Enter when | Leave when |
|---|---|---|---|
| On disk | The data file as authored | Shipped or saved by the author | Campaign load, or a start, Retry, Next level or Restart request naming its id → Parsing |
| Parsing | Read and typed; unknown fields ignored, missing required fields are a failure | Campaign load or a request | Parsed → Validating; a parse failure → Rejected |
| Validating | Per level: L1, I2, R3 (with M2), M3, B1, B2, B4–B6, B8; over the whole campaign, at campaign load only: B3, B7 (rule 8) | Parsed | All pass → Valid; any fails → Rejected |
| Valid | Handed to Level State, which builds the match | Checks pass | Level State's Loading state takes over |
| Rejected | Not built; the error is logged with level id, rule and values | A failure | Development: the build stops. Shipped, at campaign load: dropped from the campaign, no node, skipped by `next()` (rule 7). Shipped, on a request: Screen Flow's load failure |

A record is re-parsed and re-validated on every request (a Retry included): validation is cheap (a few dozen pairwise distances) and it is what lets a development build hot-reload a level file.

### Interactions with Other Systems

| System | Direction | What flows | Owner of the interface |
|---|---|---|---|
| Level State & Match Flow | out | The validated level record (its rule 1): keeps, `wait_for_first_rope`, the rival block; the L1 guarantee | Level State defines the record it needs; this GDD fills and validates it |
| Rival AI | out | `rival.think`, `rival.aggro`, `rival.seed`, the rival's starting keeps (its rule 2) | Rival AI defines the fields and ranges |
| Keep Levels | out | Starting `troops` per keep, from which it derives the starting level (its rule 8, F1) | Keep Levels |
| Touch & Mouse Input | in (a rule) | Invariant I2: every keep pair at least `2 × keep_hit_radius` apart (its F5) | Touch & Mouse Input owns the rule; this GDD enforces it at load |
| Rope Links | in (a rule) | Invariant R3: `send_interval ≥ longest_rope / (speed_min × (pawns_per_rope_max − 1))` per level (its F5, R3) | Rope Links owns the rule; this GDD enforces it at load |
| Troop Generation | in (a bound) | `troop_cap` bounds starting troops (B1) | Troop Generation |
| Save & Progress | out | The set of known level ids and region ids, registered at app start (its rule 10) | Save & Progress validates; this GDD supplies |
| World Map & Regions | out | Regions, levels, their order and names (loaded levels only: one dropped at campaign load has no node, rule 7); `next(level)`; the level record's `node` (rule 2) and the region record's `fog_shape` and `banner_anchor` (rule 1), fields World Map & Regions defines | World Map draws and derives unlocks |
| Screen Flow & Scene Manager | out | A load failure when a level's match cannot be built (an unreadable file), and "nothing playable" when nothing survives campaign load (Edge Cases), for its load-failure rule (its rule 11); a level Rejected at campaign load never reaches it (rule 7) | Screen Flow |
| Stars & Rewards (UAT-2) | out | The `stars` block per level, `{ time }` (rule 2) | Stars & Rewards defines it; this GDD stores and checks it |
| Factions (UAT-2) | in/out | In: the loaded race ids, to check `rival_race`. Out: `rival_race` per region and per level (rules 1, 2) | Factions owns the races; this GDD owns the field |
| Currencies & Economy (UAT-2) | out | Level and region ids, each level's region, region `order` and the level counts, for its reward lookups | Currencies & Economy owns the amounts |
| Tutorial & Onboarding (after UAT) | out | May add tutorial levels or set `wait_for_first_rope` and `aggro` 0 on them: all data | Tutorial |
| Guardian Castles (Alpha) | out | A region's last level may carry a guardian block (data) | Guardian Castles |
| Level HUD, Menus & Screens | out | Level `name` and `order` for the HUD title and the result overlays | Those GDDs |

## Formulas

This system defines no gameplay rate or curve of its own; its formulas are the measurements the loader makes and the invariants it enforces. The difficulty ramp (rule 12) is authored data, listed in Content, not a formula.

### F1. Longest rope and invariant R3

The longest_rope formula is defined as:

`longest_rope(level) = max over keep pairs (i < j) of dist(k_i, k_j)`, and R3 holds when `send_interval ≥ longest_rope / (speed_min × (pawns_per_rope_max − 1))`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| dist(k_i, k_j) | float, px | 156–1,226 | calculated | Centre distance of a keep pair on the 720 × 1,280 table, at baseline `keep_hit_radius` r 78 and `keep_hit_lift` 35: the minimum is I2's 2r, the maximum the diagonal of the box B2 leaves for keep centres, √((720 − 2r)² + (1,280 − 2r − keep_hit_lift)²) |
| send_interval | float, s | 0.3–2 (0.6) | data file (Rope Links) | Seconds between pawns on one rope |
| speed_min | float, px/s | ≥ 1 (110 at UAT-1: `pawn_speed`) | data file (Troop Marching F8) | The slowest unit the level can launch |
| pawns_per_rope_max | int | 10–100 (40) | data file (Rope Links) | Most sent pawns one rope may carry |

**Output Range:** `longest_rope` 810–932 px on the Green Vale. The ceiling for any level is the diagonal of the box B2 leaves for keep centres, √((720 − 2r)² + (1,280 − 2r − keep_hit_lift)²) with r = `keep_hit_radius`: 1,226 px at baseline (a 564 × 1,089 px box), 1,308 px at Touch & Mouse Input's I1 floor r 48. (The full table diagonal, 1,470 px, cannot occur: a keep on a corner breaks B2.) Rope Links, Level State and the registry quote 1,258 px, the ceiling before B2's lift (2026-11-22); it stays a safe upper bound, so their checks and numbers hold. R3's bound at baseline: 0.189–0.217 s on the Green Vale, 0.286 s at 1,226 px; `send_interval` 0.6 passes every possible level at `speed_min` 110, and so does the `send_interval` minimum 0.3, so R3 cannot fail on UAT-1 data at the baseline radius. From UAT-2 a slow unit lowers `speed_min` and raises the bound: at `speed_min` 50 the 1,226 px rope needs 0.629 s, which 0.6 fails, so a slow race on a big map is caught at load (Rope Links AC27 gives 0.645 s on the conservative 1,258 px); `speed_min` 55 needs 0.572 s and passes.
**Example:** gv-02: the player keep (180, 1080) and the rival keep (540, 220) are 932 px apart; 932 / (110 × 39) = 0.217 ≤ 0.6, passes.

### F2. Tightest spacing and invariant I2

The min_spacing formula is defined as:

`min_spacing(level) = min over keep pairs (i < j) of dist(k_i, k_j)`, and I2 holds when `min_spacing ≥ 2 × keep_hit_radius`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| keep_hit_radius | float, px | 48–120 (78) | data file (Touch & Mouse Input) | The keep's rule radius; the baseline touch circle, centred `keep_hit_lift` above the keep (Touch & Mouse Input F1) |

**Output Range:** the bound is 156 px at baseline. Green Vale: 262, 206, 226, 220 and 180 px, all pass; gv-05 has 24 px to spare. At `keep_hit_radius` 90 the bound is 180 and gv-05 passes exactly; at 91 it fails, so raising the radius in the data file is a content check, not a free knob; the accessibility setting never changes `keep_hit_radius`, only Touch & Mouse Input's `keep_touch_radius` (Edge Cases).
**Example:** gv-05: keeps 9 (360, 560) and 10 (360, 380) are 180 px apart; 2 × 78 = 156 ≤ 180.

### F3. Starting level

The start_level formula is defined as:

`start_level(keep) = rise_level(keep.troops)` (Keep Levels F1: 3 if ≥ `lv3_at`, 2 if ≥ `lv2_at`, else 1), with the thresholds of the keep's owner (Factions `effective_thresholds`, added 2026-11-25): the player's active race for a player keep, the level's `rival_race` for a rival keep, the baseline for a neutral

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| keep.troops | int | 0–`troop_cap` (60) | data file (this GDD) | Starting troops |
| lv2_at, lv3_at | int | 15, 35 at baseline and for `human`; 12, 40 for `beast` | data file (Keep Levels; race offsets from Factions) | The level thresholds of the keep's owner |

**Output Range:** 1–3. Green Vale: every player keep starts at level 1 (10 troops). Rival keeps of 15 or more start at level 2: gv-02's one (15), gv-04's two (16) and gv-05's three (18); gv-01's (10) and gv-03's two (14) start at level 1. Seven neutrals start at level 2 (16, 16, 25, 20, 16, 16, 24); none at level 3. The Green Vale's `rival_race` is `human` (decided 2026-11-25), so these counts are unchanged. Under a `beast` rival a rival keep starting with 12 to 14 troops starts at level 2. A player keep starts with 10 troops, level 1 under either race.
**Balance note** (decided 2026-11-22: intended). A level 2 rival keep holds 2 rope slots from step 0, so the rival opens with more slots than the player's 1: gv-02 2, gv-03 2 (two level 1 keeps), gv-04 4 and gv-05 6 at step 0. gv-03's two 14-troop keeps reach 15 on the first beat (2.5 s), before the rival's first pass, so the rival's slots at its first pass are 1 / 2 / 4 / 4 / 6 across gv-01 … gv-05. It is part of the Green Vale ramp with `think` and `aggro`; the player catches up by taking the level 2 neutrals. Playtest question for UAT-1: does gv-05's 6-slot opening read as a hard final level or as unfair? A neutral at level 2 or 3 holds more rope slots once captured, which is the reward for taking the big ones; it is authored by giving it ≥ 15 or ≥ 35 troops, never by a level field.
**Example:** gv-03's centre neutral, 25 troops: 25 ≥ 15 and < 35 → level 2.

### F4. Sequence

The next formula is defined as:

`next(level) = the loaded level with the next higher order in level.region, else the lowest-order loaded level of the next region after level.region (in campaign order) that has at least one loaded level, else none`

**Variables:** `order` (int, 1–N, data file), regions in campaign order (data file).
**Output Range:** one level or none. Green Vale: gv-01 → gv-02 → … → gv-05 → none in UAT-1 (regions r2–r5 have no levels yet and are skipped; their levels are UAT-2 content). A dropped level, or a gap in the orders, is skipped: with gv-03 Rejected, `next(gv-02)` is gv-04 (rule 7).
**Example:** `next(gv-03)` = gv-04.
**Use by Menus & Screens:** `next()` crosses into the next region, but the Win overlay offers *Next level* only when `next(level)` is in the same region (Menus & Screens F2, decided 2026-11-22), so a region's last level always returns to the World Map, which plays the conquest sequence.

### Bounds B1–B8 (checked with L1, I2 and R3 at load)

- **B1.** `0 ≤ keep.troops ≤ troop_cap` (60) for every keep. A player keep at 0 is legal (it is captured by the first enemy pawn) but is a development warning.
- **B2.** `keep_hit_radius ≤ x ≤ 720 − keep_hit_radius` and `keep_hit_radius + keep_hit_lift ≤ y ≤ 1,280 − keep_hit_radius`: at the top the touch circle, centred `keep_hit_lift` above the keep (Touch & Mouse Input F1), lies on the table; at the bottom the circle of `keep_hit_radius` around the keep's base, which holds its plaque and slot dots (Level HUD rules 3–4), lies on it (decided 2026-11-22: both circles). At baseline (r 78, lift 35): x 78–642, y 113–1,202. Green Vale extremes: x 130–590, y 190–1,110, all inside. The box for keep centres is 564 × 1,089 px, so `longest_rope`'s ceiling is 1,226 px (F1).
- **B3.** Keep ids are 0 … N−1 with no gaps; level ids and region ids are unique across the campaign and share one namespace (a level may not take a region's id); every `region_id` names a region; level `order` within each region is 1 … N with no gaps or repeats, and region `order` is 1 … M likewise. A gap is a development error only: a shipped build skips it (Edge Cases).
- **B4.** `0.5 ≤ rival.think ≤ 10`, `0 ≤ rival.aggro ≤ 1`, `rival.seed` an integer and required: a record without it is a parse failure and is Rejected, since Rival AI has no fallback seed (Rival AI F1, F4 ranges; its rule 3).
- **B5** (development warning, not a rejection; added 2026-11-22 from World Map & Regions). Every level's `node` lies within the 720 × 1,280 map image and inside its own region's area, and no two nodes are closer than the UX spec's minimum hit distance. The map still works if this fails, so it warns.
- **B6 = Level HUD invariant H1** (development warning; added 2026-11-22). No keep's touch circle (centred `keep_hit_lift` above the keep) lies under the HUD's top band, and no keep's base circle (its plaque and slot dots) under the bottom strip: `min(keep.y) ≥ hud_top_px + keep_hit_radius + keep_hit_lift` (213 at baseline) and `max(keep.y) ≤ 1,280 − hud_bottom_px − keep_hit_radius` (1,142). Green Vale: max y 1,110 passes on every level; min y warns on gv-03 (210), gv-04 (200) and gv-05 (190) (decided 2026-11-22: the top bound measures the real touch circle, lift included). A shipped build shrinks the breached band on that level, the top band to `min(keep.y) − keep_hit_radius − keep_hit_lift` (97, 87 and 77 px on gv-03/04/05) or the bottom strip to `1,280 − max(keep.y) − keep_hit_radius`, and never moves a keep.
- **B7** (region records; added 2026-11-22). `id`, `name`, `order` (int ≥ 1), `fog_shape` (string art id) and `banner_anchor` (int x, y) are required, and `banner_anchor` lies within the 720 × 1,280 map image. A development build stops naming the region and the field; a shipped build drops that region and every level naming it, logs it, and continues (as for B3).
- **B8** (keeps per level; added 2026-11-22). A level has at most `keeps_max` keeps (15, data file). Rope Links F5 (15 keeps × 3 ropes, about 945 sent pawns), Troop Marching F9 and the performance criteria (Rope Links AC31) assume it. A level with more is Rejected naming B8 and the count. Green Vale: 7–11 keeps, pass.
- **L1** (Level State): at least one keep with `owner = player` and at least one with `owner ≠ player`.

### Boundary check

Worked at the extremes (lens: systems-designer): a two-keep level (one player, one rival, at opposite corners of the B2 box, 1,226 px apart) passes L1, B2 and I2 and is the hardest R3 case; a one-keep level fails L1; a level with every neutral at 60 troops is legal and starts every neutral at level 3; `send_interval` at its minimum 0.3 fails R3 only above 1,287 px at `speed_min` 110, which no level reaches at the baseline radius (1,226 px) but one can at `keep_hit_radius` 55 or less with the baseline lift (1,308 px at r 48 needs 0.305 s); no Green Vale level is affected. No formula here divides by a data value except F1's `speed_min × (pawns_per_rope_max − 1)`, which Rope Links' own range (`pawns_per_rope_max ≥ 10`) and Troop Marching's (`speed ≥ 1`) keep above zero. No feedback loop: this system reads data and judges it.

## Edge Cases

- **If a level fails any invariant in a development build**: the build stops at load with one error naming the level id, the rule (L1, I2, R3, M2, M3, B1–B4, B7, B8; B5 and B6 as warnings) and the values (for I2 and R3 the two keep ids and the distance). Several failures are all reported before stopping, so an author fixes a level in one pass.
- **If a level fails in a shipped build**: it is Rejected, not clamped. If it fails at campaign load, it is dropped from the campaign and logged: it has no node and `next()` skips it to the next playable level (rule 7), so one bad level cannot block the rest of its region (decided 2026-11-22). If it fails when its match is built (an unreadable file), Screen Flow returns to the World Map with its load-failure message and nothing is recorded (its rule 11). Clamping a layout would silently ship a different level from the one tested. *(Touch & Mouse Input's touch radius is not a clamp of level data: it changes only `keep_touch_radius`, never `keep_hit_radius`, which every check here uses; see the runtime-raise edge case below. Global tuning constants are clamped at app start instead, rule 8.)*
- **If a record has a field the loader does not know**: ignored and logged once (a newer authoring tool, or a UAT-2 field like `stars` read by a UAT-1 build). A missing required field is a parse failure.
- **If two levels or two regions share an id, a level takes a region's id, two levels in a region or two regions share an `order`, or a level names a region that does not exist** (B3): the campaign fails to load at app start in development; a shipped build keeps the first and drops the second (first means the lower file path in sorted order, across level and region files alike; file enumeration order is never relied on; a dropped region takes every level naming it with it), drops the orphan level, logs each, and continues, so one bad file cannot take down the campaign. Every dropped level is skipped by `next()` (rule 7), and an order gap a drop leaves is skipped too (the gap case below).
- **If a level has no rival keep**: legal (L1 needs only one non-player keep). Rival AI is Waiting all match (its edge case); the level is a race against neutrals. The `rival` block is still required and B4 still applies.
- **If a level has no neutral keep**: legal; a pure duel. The rival's F3 then scores only own keeps and player keeps.
- **If the player keep starts at 0 troops** (B1 allows it): a development warning, because the first rival pawn captures it; legal for a tutorial that wants to teach defence in the first seconds.
- **If a keep's `troops` exceeds `troop_cap`** (B1): rejected, not clamped: a 100-troop guardian is a Keep Levels / Guardian Castles question, not a typo to forgive.
- **If `wait_for_first_rope` is true on a level with no player keep**: L1 already rejects it; the flag is never reached.
- **If an id is removed in a content update**: Save & Progress keeps the orphaned result untouched and ignored (its rule 10); the registered id set simply no longer contains it. Never reuse the id for a different level.
- **If a level order has a gap** (orders 1, 2, 4), authored or left by a dropped level: a development build reports B3 and stops. A shipped build keeps every level and logs the gap; `next()` follows the orders that are present (rule 7), so it goes from order 2 to order 4 (decided 2026-11-22). A gap in region order is handled the same way: campaign order skips the missing number and no region is dropped.
- **If nothing playable survives campaign load** (for example `gv` fails B7 in UAT-1, which drops every level naming it): a development build stops; a shipped build loads no campaign, logs it, and Screen Flow shows its load-failure message instead of opening the World Map (its rule 11, the nothing-playable case; decided 2026-11-22), so the player never sees an empty map.
- **If the accessibility setting raises the touch radius at runtime**: nothing here changes. `keep_hit_radius`, which I2, B2, B6 and `longest_rope` use, stays the data value; Touch & Mouse Input lowers its own `keep_touch_radius` per level where the setting would overlap touch areas (its F1b). A level is never Rejected for it.
- **If a river polyline crosses a keep**: nothing happens; decor has no collision (rule 10). Authors keep rivers clear of keeps for readability, which is an art-pass check, not an invariant.
- **If no later region has levels** (UAT-1: r2–r5 are empty): `next(gv-05)` is none; the Win overlay offers World Map only (Screen Flow rule 10) and World Map shows the region conquered.

## Dependencies

| System | Nature | Direction | What this GDD needs or gives | GDD status |
|---|---|---|---|---|
| Keep Levels | Hard | in/out | In: F1 `rise_level`, `lv2_at`, `lv3_at` (F3). Out: starting `troops` per keep | In Review |
| Touch & Mouse Input | Hard (a rule) | in | Invariant I2 and `keep_hit_radius`; the 720 × 1,280 table | In Review |
| Rope Links | Hard (a rule) | in | Invariant R3, `send_interval`, `pawns_per_rope_max` | In Review |
| Troop Marching & Clashes | Soft | in | `speed_min` (`pawn_speed` at UAT-1) for R3; keep id order matters to its arrival rule | In Review |
| Troop Generation | Soft (a bound) | in | `troop_cap` for B1 | In Review |
| Level State & Match Flow | Hard | out | The validated record; L1 | In Review |
| Rival AI | Hard | out | `rival.think`, `rival.aggro`, `rival.seed`; B4 ranges | In Review |
| Save & Progress | Hard | out | Known level and region ids, registered at app start | In Review |
| Screen Flow & Scene Manager | Soft | out | Load failure for its rule 11 | In Review |
| **Depended on by** | | | | |
| World Map & Regions | Hard | out | Regions (with `fog_shape` and `banner_anchor`, empty ones included), levels, order, names, `next`; each level record's `node` | In Review |
| Level HUD, Menus & Screens | Soft | out | Level `name`, `order` | In Review |
| Stars & Rewards (UAT-2) | Soft | out | The `stars` block, `{ time }` | Designed 2026-11-25, pending review |
| Factions (UAT-2) | Soft | in/out | `rival_race` per region and level; the loaded race ids | In Review (2026-11-25) |
| Currencies & Economy (UAT-2) | Soft | out | Ids, region `order`, level counts | Designed 2026-11-25, pending review |
| Tutorial & Onboarding (after UAT) | Soft | out | Tutorial levels as data | Not yet designed |
| Guardian Castles (Alpha) | Soft | out | A guardian block on a region's last level | Not yet designed |

**Bidirectional check** (re-checked 2026-11-22, cross-GDD review). Every system above that has a GDD names Campaign Level Data: Keep Levels, Touch & Mouse Input, Rope Links, Troop Marching & Clashes (its Dependencies, soft), Troop Generation (`troop_cap` for B1), Level State & Match Flow, Rival AI, Save & Progress, World Map & Regions, Level HUD and Menus & Screens. Screen Flow names a load failure generically (its rule 11), which is enough. `systems-index.md` row 10 lists this system's dependencies, Save & Progress and Troop Marching & Clashes included.

## Visual/Audio Requirements

Optional for a Progression system; stated briefly. The record carries no art: keeps, ropes and pawns are drawn by their own systems in the owner's colour, and the table background and the river are the Level scene's (art bible §1: ownership reads before charm). Two requirements follow from the data: **a level must read in one glance on a phone in portrait** (Pillar 2), which caps keeps at about 11 per level (gv-05) until a bigger table is designed, and **a region needs a palette and a name** for the World Map, which World Map & Regions and the art bible's regions section decide. No asset spec follows from this GDD. `art-director` not consulted — Lean mode.

## Game Feel

Optional for a Progression system; one target. **A level should last 2–3 minutes and end decisively** (Pillar 2; concept AC for level 1: 5 of 5 first-time testers win within 3 minutes). The ramp in Content was tuned to that over two prototype rounds (`prototypes/tower-war/REPORT.md`); the Godot build re-measures it in UAT-1 with Level State's `time` per win. A level that averages over 4 minutes or under 90 seconds across testers is re-authored, not re-tuned through global knobs, so one level never bends the rules for the rest.

## UI Requirements

None of its own. It supplies the Level HUD with the level `name` and `order` ("Green Vale 3 · Crossroads", Level HUD rule 9), the Win and Lose overlays with the same, and World Map & Regions with the region and level list. A development-only level inspector (list levels, show validation results, reload a file) is a tools item for Technical Setup, not a player UI. No UX flag: this system contributes text to screens other GDDs own.

## Cross-References

| This GDD relies on | In | What it relies on |
|---|---|---|
| Level State & Match Flow | Core Rule 1, L1, Open Question 2 | The record fields it builds from; the one-player-one-other invariant; which levels wait |
| Rival AI | Core Rules 2, 3; F1, F4 ranges; Open Question 2 | `think`, `aggro`, `seed` and their bounds (B4); fixed seed per level |
| Keep Levels | Rule 8, F1 | Starting level from starting troops |
| Touch & Mouse Input | F5, I2, its edge case | Spacing bound and the shipped-build fallback |
| Rope Links | F5, R3, AC27 | Longest-rope bound |
| Troop Marching & Clashes | Rule 11, F8 (`speed_min`) | Keep id order; the slowest unit |
| Save & Progress | Rule 10, Dependencies | Known-id registration |
| Screen Flow & Scene Manager | Rule 11 | Load failure handling |
| game-concept.md | § World map, § Decisions (UAT-1 / UAT-2) | One region in UAT-1; regions open in sequence |
| prototypes/tower-war/config.js | MAPS | The five layouts and their rival numbers |

**Edits other documents need as a result of this GDD** (1–5 applied 2026-11-22):
1. `level-state-match-flow.md`: close Open Question 2 (only `gv-01` waits).
2. `rival-ai.md`: close Open Question 2 (seed fixed per level).
3. `touch-mouse-input.md`: its Cross-References line 263 asked this GDD to list I2; satisfied (F2). Add that the loader rejects, so the per-level radius fallback runs only for a runtime radius change.
4. `systems-index.md`: row 10 → Designed with the GDD link; add Save & Progress and Troop Marching & Clashes (soft) to Depends On; progress tracker.
5. `design/registry/entities.yaml`: register `longest_rope` and `min_spacing` (formulas); add this GDD to `referenced_by` of `keep_hit_radius`, `send_interval`, `pawns_per_rope_max`, `lv2_at`, `lv3_at`, `troop_cap`, `pawn_speed`.

## Acceptance Criteria

Baseline data: `keep_hit_radius` 78, `send_interval` 0.6, `pawn_speed` 110 (= `speed_min` at UAT-1), `pawns_per_rope_max` 40, `troop_cap` 60, `lv2_at` 15, `lv3_at` 35. Tags: **[Logic]** automated test in `tests/unit/` against an in-memory record; **[Integration: X]** in `tests/integration/`; **[Content]** a check run over the shipped data files in CI; **[Visual]** retained screenshot in `production/qa/evidence/`. `qa-lead` lens applied: every rule, formula and bound has a criterion; boundaries are AC4, AC6, AC8, AC13.

- **AC1 [Content] (rule 12, Content)**: GIVEN the shipped Green Vale files, THEN there are exactly 5 levels with ids gv-01 … gv-05, orders 1–5, keep counts 7, 8, 9, 10, 11, and every level passes L1, I2, R3, B1–B4 and B8, and every region record passes B7.
- **AC2 [Content] (rule 4, F3)**: GIVEN the shipped files, THEN the player keep of every level has 10 troops; the keeps with `start_level` 2 are exactly gv-02's rival keep (15) and its two 16-troop neutrals, gv-03's 25, gv-04's two rival keeps (16) and its 20, and gv-05's three rival keeps (18) and its 16, 16 and 24; no keep has `start_level` 3.
- **AC3 [Content] (rules 5, 6)**: GIVEN the shipped files, THEN `wait_for_first_rope` is true on gv-01 only, and every level's `rival.seed` is an integer that does not change between two loads.
- **AC4 [Logic] (F2, I2 boundary)**: GIVEN a record with two keeps 156 px apart, THEN it validates; GIVEN 155 px, THEN it is Rejected naming I2, the two keep ids and 155.
- **AC5 [Logic] (F1, R3)**: GIVEN a record whose longest pair is 1,226 px (opposite corners of the B2 box at baseline, (78, 113) and (642, 1,202)) and `send_interval` 0.3, THEN it validates at `speed_min` 110 (needs 0.286); GIVEN `speed_min` 100, THEN Rejected naming R3 and 0.314; GIVEN `send_interval` 0.6, THEN it validates (Rope Links AC27). Both corner keeps also breach B6, so each case raises B6 warnings for both bands; they do not reject.
- **AC6 [Logic] (F1 boundary, `speed_min`)**: GIVEN the same 1,226 px record, `send_interval` 0.6 and `speed_min` 50, THEN Rejected naming R3 and 0.629; GIVEN `speed_min` 55, THEN it validates (needs 0.572).
- **AC7 [Logic] (L1)**: GIVEN a record with no player keep, THEN Rejected naming L1; GIVEN one where every keep is the player's, THEN Rejected naming L1; GIVEN one player keep and one neutral, THEN it validates.
- **AC8 [Logic] (B1 boundary)**: GIVEN a keep with 60 troops, THEN it validates; GIVEN 61, THEN Rejected naming B1; GIVEN a player keep with 0, THEN it validates with one warning.
- **AC9 [Logic] (B2)**: GIVEN a keep at x 77, THEN Rejected naming B2; GIVEN x 78 and y 1,202, THEN it validates (with a B6 bottom-strip warning); GIVEN y 1,203, THEN Rejected naming B2; GIVEN y 112, THEN Rejected naming B2; GIVEN y 113, THEN it validates (with a B6 top-band warning).
- **AC9b [Logic] (B6)**: GIVEN gv-05 (min y 190, max y 1,110), THEN it validates with one B6 warning naming the top band, and a shipped build draws a 77 px top band on that level; GIVEN a level with min y 213 and max y 1,142, THEN no B6 warning; GIVEN a keep at y 1,143, THEN a B6 warning naming the bottom strip, which a shipped build shrinks to 59 px.
- **AC10 [Logic] (B3)**: GIVEN keep ids 0, 1, 3, THEN Rejected naming B3; GIVEN two levels with id gv-02, THEN the campaign load reports B3 and, in a shipped build, keeps the one with the lower file path and drops the other; GIVEN gv levels with orders 1, 2, 4, THEN B3 is reported and a shipped build keeps all three, logs the gap, and `next()` of order 2 is order 4; GIVEN a level with id r2, THEN B3 is reported (one namespace); GIVEN two regions with `order` 2, THEN B3 is reported and a shipped build keeps the one with the lower file path; GIVEN region orders 1, 2, 4, THEN a shipped build keeps all three regions and campaign order runs 1, 2, 4.
- **AC11 [Logic] (B4)**: GIVEN `rival.think` 0.4 or `rival.aggro` 1.1, THEN Rejected naming B4; GIVEN 0.5 and 1.0, THEN it validates.
- **AC11b [Logic] (B8)**: GIVEN a level with 15 keeps, THEN it validates; GIVEN 16, THEN Rejected naming B8 and 16.
- **AC12 [Logic] (rule 8, several failures)**: GIVEN a record breaching I2 and B1 at once, THEN the development error lists both before stopping.
- **AC13 [Logic] (F4 boundary)**: GIVEN the Green Vale alone, THEN `next(gv-03)` is gv-04 and `next(gv-05)` is none; GIVEN a second region after it, THEN `next(gv-05)` is that region's order-1 level; GIVEN regions r2–r5 that no level names (the UAT-1 files), THEN `next(gv-05)` is none and the campaign loads with five region records.
- **AC14 [Logic] (rule 3, parsing)**: GIVEN a record with an extra field `weather`, THEN it validates and one log line names the ignored field; GIVEN a record missing `keeps`, THEN it is a parse failure, not a validation failure.
- **AC14b [Logic] (rules 1, 2: `rival_race`; added 2026-11-25)**: GIVEN a region with `rival_race` `beast` and a level that sets none, THEN the level's rival race is `beast`; GIVEN the level sets `human`, THEN it is `human`; GIVEN neither sets one, THEN it is `human`; GIVEN `rival_race` `orc` (no such race), THEN a development build reports a level-data error naming the region or level and `orc`, and a shipped build plays `human` and logs it.
- **AC14c [Logic] (F3 with races; added 2026-11-25)**: GIVEN a rival keep with 13 troops, THEN it starts at level 1 under a `human` rival and at level 2 under a `beast` rival; GIVEN a neutral keep with 13 troops in the same level, THEN it starts at level 1.
- **AC14d [Logic] (rule 2: `stars`; added 2026-11-25)**: GIVEN `stars: { time: 45.0 }`, THEN the level loads with a star time of 45.0; GIVEN `time` 0, −1 or 45.05, THEN the level loads with no time goal and one log line names the block; GIVEN no `stars` block, THEN the level loads with no time goal and nothing is logged.
- **AC14b [Logic] (rule 2, types)**: GIVEN a keep with `x` 130.5, or `order` "2" as a string, THEN it is a parse failure and the level is Rejected; GIVEN a record without `decor`, THEN it validates.
- **AC14c [Logic] (B7)**: GIVEN a region record missing `fog_shape`, or with `banner_anchor` (800, 100), THEN a development build stops naming the region and the field, and a shipped build drops the region and every level naming it with one log line each.
- **AC14d [Logic] (B7, nothing playable)**: GIVEN a shipped build whose only region with levels, `gv`, fails B7, THEN no campaign loads, one log line names `gv`, and opening the World Map shows Screen Flow's load-failure message instead.
- **AC15 [Integration: Level State & Match Flow, World Map & Regions] (rules 7, 8)**: GIVEN a shipped build whose gv-03 file breaches I2, THEN at campaign load gv-03 is dropped with one log line, World Map draws no gv-03 node, `next(gv-02)` is gv-04, and `gv` is Conquered when the other four are beaten; GIVEN a level whose file cannot be read when its match is built, THEN no match is built, Screen Flow shows its load-failure message over the World Map and Save & Progress records nothing.
- **AC16 [Integration: Save & Progress] (rule 9)**: GIVEN app start with the Green Vale, THEN Save & Progress's known-id set is {gv, r2, r3, r4, r5, gv-01 … gv-05}, and a progress file naming gv-07 loads with that entry kept and ignored (Save AC13).
- **AC17 [Integration: Rival AI, Keep Levels] (rules 2, 4)**: GIVEN gv-05 is built, THEN Rival AI reads `think` 1.4 and `aggro` 1.0, and keeps 1, 2 and 3 (the rival's, 18 troops) and 7, 8 and 9 (neutrals 16, 16, 24) start at level 2 with the rest at level 1, so at step 0 the rival has 6 free rope slots and the player 1.
- **AC18 [Integration: Level State] (rule 5)**: GIVEN gv-01 is built, THEN Level State is Armed; GIVEN gv-02, THEN it is Running at once.
- **AC19 [Logic] (rule 11, hot reload, development only)**: GIVEN a development build with gv-02 loaded, WHEN its file's `rival.think` changes on disk and the level is restarted, THEN the new value is in effect with no rebuild.
- **AC20 [Visual] (Content, Pillar 2)**: retained screenshots of all five Green Vale levels at match start on the minimum phone in portrait, each showing every keep with its troop plaque readable and no two keeps overlapping.

**Coverage check.** Rules 1–12 each have a criterion (rule 7 is AC13, rule 10 has none because decor has no behaviour to test; its absence of effect is implied by every gameplay test running with rivers present); F1–F4 and L1, B1–B4 each have a typical and a boundary case; B7 and the rule 2 types are AC14b and AC14c, the nothing-playable case AC14d; B6 is AC9b and B8 AC11b; B5 has none until its UX spec (Open Question 8) and M3 none yet; cross-system: AC15–AC18.

## Open Questions

| # | Question | Owner | Resolve by |
|---|----------|-------|------------|
| 1 | Level and region names are prototype placeholders ("First Field", "The Ford"); the Green Vale needs a writer's pass and a region palette | writer, art-director | Before UAT-1 build |
| 2 | Closed (2026-11-22): `node {x, y}` per level and `fog_shape`, `banner_anchor` per region, defined by World Map & Regions rule 1 and carried here (rules 1, 2; bound B5) | — | — |
| 3 | The data file format (JSON, Godot `.tres`, or a custom resource) and the editor tooling for authoring layouts | technical-director | Technical Setup (ADR) |
| 4 | Whether UAT-2 regions reuse the 720 × 1,280 table or some levels get a scrolling table; this GDD assumes one fixed table | game-designer, technical-director | Before region 2 |
| 5 | ~~Per-level star time thresholds (the reserved `stars` block)~~ Answered 2026-11-25 (Stars & Rewards): one star time per level, `stars.time` (rule 2) | Stars & Rewards | Closed |
| 6 | Whether the five Green Vale levels need re-tuning after the Godot build changes feel (Game Feel: 2–3 minutes per level) | game-designer | After UAT-1 |
| 7 | Deferred (2026-11-22 polish pass): a playtest criterion for the Game Feel target, with a tester count and a pass rule, measured from Level State's `time` per win. Also reconcile the re-author band (under 90 s or over 4 min) with Pillar 2's 2–3 minutes | game-designer, qa-lead | UAT-1 playtest plan |
| 8 | Deferred (2026-11-22 polish pass): B5's minimum node distance needs the World Map UX spec (`/ux-design world-map`); until then B5 checks only the map bounds and region areas | ux-designer | World Map UX spec |
