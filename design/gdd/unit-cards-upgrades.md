# Unit Cards & Upgrades

> **Status**: Designed (pending /design-review in a fresh session)
> **Author**: the player + Claude Code (/design-system)
> **Last Updated**: 2026-11-26 (revision after two lean reviews, sessions 4d and c7: statuses, `is_owned`, F2 for strength 3, baseline fallback, AC31 rewritten, AC33 to AC35 added)
> **Last Verified**: 2026-11-25
> **Implements Pillar**: 3. Paint the map, grow the army (`design/gdd/game-concept.md` § Pillars)
> **Creative Director Review (CD-GDD-ALIGN)**: skipped — Lean mode

## Summary

Unit Cards & Upgrades lets the player spend gold between matches to raise a card for each unit of a race they own, from level 1 to 5. A higher card level makes veterans of that unit more frequent: every Nth pawn launched is worth one troop more and carries a visible mark. It exists so the gold a win pays becomes a stronger army the player can see on the table, never only a number.

> **Quick reference** — Layer: `Feature` · Priority: `MVP (UAT-2)` · Key deps: `Unit Roster & Stats, Currencies & Economy, Save & Progress, Troop Marching & Clashes, Faction Collection & Unlocks`

## Overview

Unit Cards & Upgrades is where gold turns into a stronger army. Every unit kind of a race the player owns has a card: three per race (soldier, rider, summon), six in the UAT build (human and beast). A card has five levels. The player raises a card one level at a time with gold, between matches, and the purchase is final. A card's level does one thing in a match: it makes veterans of that unit more frequent. A veteran is a pawn worth one troop more than its kind, in a clash and on arrival, drawn with a gold trim; a rope launches one every Nth pawn, and N shrinks as the card's level rises. At level 1 a card gives no veterans, so a player who buys nothing plays exactly the UAT-1 match. As data, the system is a small saved block (one level per card) and a table of veteran intervals; the cost of each level is Currencies & Economy's. Without it gold would be a number that buys nothing, and Pillar 3 ("gold shows as card levels") would have nowhere to show: here the reward of a win becomes something the player sees marching on their own ropes in the next match.

## Detailed Design

### Core Rules

`game-designer`, `systems-designer` and `economy-designer` not consulted — Lean mode. Review manually before production.

1. **One card per unit kind.** Every kind in Unit Roster & Stats' data (`<race>_t1` to `<race>_t3`) has exactly one card, and the card's id is the kind's id. The UAT build has six: `human_t1`–`human_t3` and `beast_t1`–`beast_t3`. A race added later brings its three cards with it; nothing here lists cards by hand.
2. **A card has a level, 1 to `card_level_max` (5)** (the player's decision, 2026-11-25). Every card starts at level 1. A level never goes down (Currencies & Economy rule 10: no refunds, no selling).
3. **Only the cards of owned races can be upgraded.** Whether a race is owned is Faction Collection & Unlocks' answer, `is_owned(race)` (its rule 3; the human is always owned, Factions rule 3). A card of a race the player does not own is Locked: it shows, it cannot be bought and it has no effect.
4. **Upgrading is one call, `upgrade_card(card_id)`**, and it raises the card exactly one level. It checks, in this order, and stops at the first failure: the card exists (`unknown`); its race is owned (`locked`); its level is below `card_level_max` (`max`); then it reads `cost = card_upgrade_cost(card_id, level + 1)` and calls `spend_currency(gold, cost)` (Currencies & Economy rules 7 and 11), whose refusal is passed on (`short`, or `invalid`); a cost lookup that returns none is refused `invalid` without a spend. Only on ok does the level rise by one, in the same frame; the new level is reported to Save & Progress; and `card_upgraded(card_id, level)` is raised. A refused call changes nothing and spends nothing.
5. **The spend and the level are saved together** (Currencies & Economy rule 9). Both changes are reported in the same frame and Save & Progress writes once at the end of it, so a level is never saved without its payment or a payment without its level.
6. **What a level does: veterans** (the player's decision, 2026-11-25). A veteran is a pawn launched with `veteran_bonus` (1) more strength than its kind. It is worth that much more in a clash and on arrival (Troop Marching rules 7 and 10), and it keeps its kind's speed and size. Nothing else about a unit changes with its card's level: not its speed, not its size, not how often a rope sends.
7. **How often: every Nth launch of that kind** (the player's decision, 2026-11-25: one count per kind, across all ropes). For each side that has card levels, the match keeps one counter per unit kind, starting at 0 when the match is built. Each launch of that kind adds 1; when the counter reaches `veteran_every[tier][level]` (F1's table, read with the card's level), that pawn is a veteran and the counter returns to 0. At card level 1 the table holds "never" and no veteran is ever launched.
8. **The count follows launch order.** Troop Marching launches in ascending `rope_id` within a step, so the Nth pawn is the same pawn on every run with the same inputs. There is no randomness (Troop Marching rule 17).
9. **Only a launch counts.** A pawn relayed through a full keep is the same pawn: it keeps being a veteran or not, and it does not advance the counter. Cutting or re-tying a rope does not touch the counter.
10. **One call at launch, `veteran_for_launch(owner, kind_id)`.** Troop Marching calls it once per launch, after `unit_for` (Unit Roster rule 3). It advances that owner's counter for the kind and answers yes or no. On yes Troop Marching launches the pawn with strength `kind.strength + veteran_bonus` and marks it a veteran, so the Level HUD can draw the trim. For an owner with no card levels the answer is always no and nothing is counted.
11. **Strength stays inside Unit Roster's bound.** A veteran's strength may not pass U3's maximum (3). For a kind whose base strength is already 3, the bonus is refused: its launches are never veterans, its card can still be bought, and the loader logs one warning naming the kind at app start. No shipped kind is affected (the strongest is 2).
12. **Card levels are read at match build and frozen** for the match, like the roster (Unit Roster rule 12). An upgrade bought between matches takes effect in the next match built. Cards are bought on the Collection & Upgrade Screens, which are not reachable during a match (Screen Flow), so `upgrade_card` has no path from inside one; if it is called anyway, the saved level rises and the running match keeps its frozen levels.
13. **The player's cards only, in the UAT build** (the player's decision, 2026-11-25). The rival has no card levels: every rival launch answers no in rule 10, whatever race it plays. Giving the rival a card level per region or per level is a hook for later regions (Open Questions).
14. **The active race decides which cards matter in a match.** The player's keeps send the kinds of the active race (Factions), so only that race's three cards are read at match build. Levels bought on another owned race's cards wait until that race is active.
15. **Saved block.** Card levels are one named block, `cards`: a map from card id to level, holding only cards above level 1 (Save & Progress rule 3). This GDD adds one migration step that creates the block empty. On load a level above `card_level_max` is lowered to it, a level below 1 or not whole is dropped (the card is level 1), each logged and neither treated as damage; an entry for a card id the data no longer has is kept and ignored (Save & Progress rule 10). When two results merge, the higher level stays (Save & Progress rule 5).
16. **Delete progress and read-only sessions.** `delete_progress()` returns every card to level 1. In a session where Save & Progress refuses to write (its rule 9), upgrades work in memory and are not kept, like the wallet (Currencies & Economy rule 14).
17. **Data.** `card_level_max`, `veteran_bonus` and the `veteran_every` table are data-file values, checked at app start (invariants C1–C4 under Formulas). The cost of every level is `card_upgrade_cost`, owned by Currencies & Economy; this GDD states no price.

### States and Transitions

A card has a state for the screens; it is derived each time from the owned set, the card's level and the wallet, and only the level is stored.

| State | Meaning | Enter when | Leave when |
|---|---|---|---|
| Locked | The card's race is not owned; it cannot be bought and has no effect (level 1 on a normal save) | The race is not in the owned set | The race is unlocked → Upgradable |
| Upgradable | Level 1 to `card_level_max` − 1; the next level can be bought if the gold is there (`can_afford` decides whether the button reads affordable or short; that is not a stored state) | The race is owned and the level is below the maximum | `upgrade_card` returns ok at the last level → Maxed |
| Maxed | Level `card_level_max`; no further purchase | The level reaches the maximum | Never (only Delete progress resets it) |

In a match the veteran counter of each kind is a whole number from 0 to `veteran_every` − 1. It is created at 0 when the match is built and discarded with the match; it is never saved.

### Interactions with Other Systems

**Direction rule.** This system calls Currencies & Economy and Save & Progress and reads Unit Roster's kinds and the owned set. Troop Marching and the screens call it; it never calls a screen.

| System | Direction | Data | Interface owner |
|--------|-----------|------|-----------------|
| Unit Roster & Stats | in | The list of kinds (one card each), each kind's tier and base `strength`; the bound U3 a veteran's strength must respect | Unit Roster owns the kinds and the bounds; this GDD owns what a card adds |
| Troop Marching & Clashes | out | `veteran_for_launch(owner, kind_id)` at each launch; on yes the pawn's strength is the kind's + `veteran_bonus` and it carries a veteran mark | Troop Marching owns the launch and the pawn; this GDD owns the count and the answer |
| Currencies & Economy | out | Reads `card_upgrade_cost(card_id, to_level)`; calls `can_afford` and `spend_currency(gold, cost)` | Currencies & Economy owns the cost and the spend; this GDD owns card levels and what they give |
| Save & Progress | both | Out: the `cards` block, reported on every upgrade and written by Save's flush; one migration step. In: the block on load | Save & Progress owns the file, the merge and the flush; this GDD owns the block's shape and its validation |
| Faction Collection & Unlocks | in | `is_owned(race)`: whether a race is owned (rule 3) | That GDD owns the owned set and answers; this GDD owns the limit |
| Factions | in | The player's active race at match build (rule 14); the races that exist | Factions |
| Level HUD | out | The veteran mark on a pawn, to draw the trim | Level HUD draws; this GDD says which pawn |
| Collection & Upgrade Screens (no GDD yet, provisional) | out | Each card's level, state, next cost and `veteran_every` at its level and the next; `upgrade_card`; `card_upgraded` | That GDD owns the layout; this GDD owns the numbers |
| Rival AI | none in UAT | The rival launches no veterans (rule 13). Its `threat` and `incoming` read a pawn's strength, so they already count a player's veteran at its real worth | Rival AI |

## Formulas

`systems-designer` lens applied by the author (Lean mode: Section D is a high-risk section). Every variable was worked at its minimum, its maximum and at 0; the findings are under Boundary findings. Every number here is a starting value for the first UAT-2 playtest, approved by the player on 2026-11-25. This GDD defines no cost: every price is Currencies & Economy's `card_upgrade_cost`.

### F1. Veteran launch

The veteran_launch formula is defined as, for one launch of a kind by an owner that has card levels:

`count = count + 1`; `veteran_launch = (veteran_every > 0) and (count = veteran_every)`; when it is true, `count = 0`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| count | int | 0 to `veteran_every` − 1 between launches | calculated (per owner and kind, 0 at match build) | Launches of this kind since its last veteran |
| veteran_every | int | 0 (never), or 2–60 | data file (`veteran_every[tier][level]`, the table below) | A veteran is every this-many launches of the kind; read with the card's level frozen at match build (rule 12) |
| tier | int | 1–3 | calculated (Unit Roster & Stats, the kind's tier) | Which row of the table |
| level | int | 1–`card_level_max` (5) | calculated (the card's level, this GDD) | Which column of the table |

**`veteran_every` (baseline data):**

| Tier | Level 1 | Level 2 | Level 3 | Level 4 | Level 5 |
|---|---|---|---|---|---|
| 1 soldier | 0 (never) | 12 | 9 | 7 | 5 |
| 2 rider | 0 (never) | 10 | 8 | 6 | 4 |
| 3 summon | 0 (never) | 8 | 6 | 4 | 3 |

**Output Range:** true or false. With `veteran_every` 0 it is always false and `count` is not kept. With `veteran_every` N it is true on exactly every Nth launch of the kind, the first time on the Nth.
**Why the rows differ:** a veteran adds the same one troop whatever the tier, and the cost rises with the tier (the player's decision), so with one shared row the cheapest card would give the most per gold at every level. Higher tiers therefore get veterans more often.
**Example:** the soldier card at level 2 (`veteran_every` 12): the player's 12th, 24th and 36th soldier launches of the match are veterans. With one rope, pawn k leaves at 0.2 + 0.3 + (k − 1) × 0.6 s after the tie (Rope Links F2), so the first veteran leaves 7.1 s in.

### F2. Card power gain

The card_power_gain formula is defined as:

`card_power_gain = veteran_bonus / (veteran_every × strength)`, and 0 when `veteran_every` is 0 or when `strength + veteran_bonus` would pass Unit Roster's U3 maximum (3), since such a kind launches no veterans (rule 11)

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| veteran_bonus | int | 1 (fixed in the UAT build; C2) | data file | Strength a veteran has above its kind |
| veteran_every | int | 0, or 2–60 | data file (F1's table) | As F1 |
| strength | int | 1–3 (Unit Roster U3) | data file (`UnitStats.strength`) | The kind's base strength |

**Output Range:** 0 to `card_power_cap` (0.25; invariant C3). It is the share by which the average strength of the kind's launches rises: over a long run, each launch is worth `strength + veteran_bonus / veteran_every` troops.
**Baseline gains by level 2 / 3 / 4 / 5:** soldier (strength 1) 0.083 / 0.111 / 0.143 / 0.200; rider (strength 1) 0.100 / 0.125 / 0.167 / 0.250; summon (strength 2) 0.063 / 0.083 / 0.125 / 0.167. In troops per launch the maxed cards add 0.20, 0.25 and 0.33.
**Example:** the rider card at level 5: 1 / (4 × 1) = 0.25, so a rope of riders delivers 1.25 troops per launch instead of 1, or 2.08 troops per second instead of 1.67 at `send_interval` 0.6.

### F3. Upgraded power

The upgraded_power formula is defined as:

`upgraded_power = unit_power × (1 + card_power_gain)`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| unit_power | float | 0.90–2.20 for a legal kind | calculated (Unit Roster & Stats F1) | The kind's base power |
| card_power_gain | float | 0–0.25 | calculated (F2) | The share its card adds at a level |

**Output Range:** 0.90 to 2.75 (2.20 × 1.25). It is used only by the loader's tier-order check (C4); nothing in a match reads it.
**Example:** baseline rosters with all three cards of a race at the same level:

| Race | Level 1 | Level 2 | Level 3 | Level 4 | Level 5 |
|---|---|---|---|---|---|
| human (t1 / t2 / t3) | 1.00 / 1.25 / 2.00 | 1.08 / 1.38 / 2.13 | 1.11 / 1.41 / 2.17 | 1.14 / 1.46 / 2.25 | 1.20 / 1.56 / 2.33 |
| beast (t1 / t2 / t3) | 1.10 / 1.25 / 1.83 | 1.19 / 1.38 / 1.94 | 1.22 / 1.41 / 1.98 | 1.25 / 1.46 / 2.06 | 1.31 / 1.56 / 2.13 |

### Invariants (checked at app start; the loader reports a breach)

- **C1.** `card_level_max` is whole and `2 ≤ card_level_max ≤ 10`; the `veteran_every` table has one row per tier (3) and one column per level.
- **C2.** `veteran_bonus` is 1. With Unit Roster's U3 (strength at most 3) a larger bonus has no legal room on a strength 2 kind, and Troop Marching's M4 needs a whole number.
- **C3.** In every row, level 1 holds 0; every later level holds a whole number from 2 to 60; a row never rises from one level to the next (a higher level is never rarer); and for every kind of every race, `card_power_gain` at every level is at most `card_power_cap` (0.25). This cap is the answer to Unit Roster & Stats' Open Question 6: cards may add up to a quarter of a kind's power on top of U1.
- **C4.** For every race and every level L, with all three of its cards at L: `upgraded_power` of tier 1 < tier 2 < tier 3. The tier order holds at equal card levels only (the player's decision, 2026-11-25); cards at different levels may cross it, by at most the cap (the largest case at baseline: a level 5 beast soldier at 1.31 against a level 1 beast rider at 1.25).

**On a breach:** a development build stops with one error naming the rule, the tier, the level and the values. A shipped build replaces the whole `veteran_every` table, `veteran_bonus` and `card_level_max` with the baseline in this GDD and logs it; saved card levels are kept. C3 and C4 also depend on the rosters, so the baseline can fail too (for example a future strength 1 summon, whose level 5 entry of 3 would pass the 0.25 cap). If it does, the shipped build logs each remaining breach (race, kind, rule, values), launches no veterans for every kind that still fails (`veteran_every` 0 at every level for that kind), and continues; it never stops, as Currencies & Economy rule 11 does for its own table. The baseline values ship as a read-only copy in the data files, never typed into code.

### What this GDD asks of the cost table

The costs are Currencies & Economy's (`card_upgrade_cost(card_id, to_level)`, `to_level` 2 to `card_level_max`). For the levels to pace as the player chose, that table should satisfy, and that GDD should check:

- every cost is a whole number of 1 or more, and for one card the cost never falls from one level to the next;
- at the same `to_level`, a higher tier never costs less than a lower one (the player's decision: cost rises with the tier);
- the first purchase (a tier 1 card to level 2) is affordable after one or two wins;
- the twelve purchases of one race cost more than the one-time `star_gold` of the first region, so replays' `win_gold` matters.

**Checked against Currencies & Economy F5 (2026-11-25, that GDD In Design):** soldier 100 / 200 / 400 / 800, rider 125 / 250 / 500 / 1,000, summon 150 / 300 / 600 / 1,200 for `to_level` 2 to 5. All four points hold: the first purchase is 100 against 110 gold from a one-star first win; one race costs 5,625 against 1,500 one-time `star_gold` in the Green Vale. **Gold per gain:** a maxed soldier card costs 1,500 for 0.20 troops per launch and a maxed rider 1,875 for 0.25 (both 7,500 gold per troop per launch); a maxed summon costs 2,250 for 0.33 (6,750). At level 2 the three cost 1,200, 1,250 and 1,200 per troop per launch. So no card is the better buy per launch; which is the better buy in play depends on how many launches each tier makes in a match, which only a playtest can measure (Open Questions). The lookup returns none outside `to_level` 2 to `card_level_max` or for an unknown card; rule 4 never reaches it in those cases, and a none is treated as no purchase, never as a cost of 0.

### Boundary findings

- **`veteran_every` 0** would divide by zero in F2; both formulas treat 0 as "never" before any division, and C3 allows 0 at level 1 only.
- **`veteran_every` 1** makes every pawn a veteran, a gain of 1.0 on a soldier; C3's cap excludes it. The smallest legal value is 4 for a strength 1 kind and 2 for strength 2 or 3.
- **A kind with base strength 3** cannot take the bonus (rule 11): its launches are never veterans and its card's levels buy nothing. No shipped kind has strength 3; a roster that adds one should either stay at strength 2 or accept a card with no effect (Open Questions).
- **A very large `veteran_every`** (60) gives one veteran every 36 s on one rope: legal, but the level would be invisible in a 2 to 3 minute match. The baseline's largest is 12.
- **A veteran summon has strength 3**, which is inside U3 and below `level_drop_margin` (5), so Unit Roster's margin warning stays silent.
- **Captures come faster.** A rope of level 5 soldiers delivers 2.0 troops per second, not 1.67. Troop Generation's I3 (one rope out-sends any keep) holds more easily; its F4 capture pace (59 s) and Stars & Rewards' time goals assume no veterans, so both should be re-run with maxed cards (Open Questions).
- **Gold has a last purchase.** `win_gold` never runs out and there are 24 purchases in the UAT build (12 per race). After the last one gold has no use until God & Goddess Powers; the balance is bounded by Currencies & Economy's `balance_cap`.

### Feedback loops

1. Gold buys card levels, veterans win levels faster and cleaner, which earns more stars and more gold. Intended (Pillar 3). It is damped by the cap (a card adds at most a quarter of a kind's power), by the five levels, and by the fixed total of `star_gold`.
2. Inside a match, veterans take keeps sooner, more keeps launch more pawns, and more launches make more veterans. This is the loop Keep Levels and Unit Roster already describe, made up to 25% steeper for the player. The rival's counter-ropes still cancel a veteran point for point in a clash.

## Edge Cases

`systems-designer` not consulted — Lean mode. Review manually before production.

**Buying**

- **If the card is at `card_level_max`**: `upgrade_card` returns refused `max`; no cost is read and nothing is spent.
- **If the player holds exactly the cost**: the purchase succeeds and the balance is 0.
- **If the player holds less than the cost**: refused `short` (from `spend_currency`); the level and the wallet are unchanged.
- **If the card's race is not owned**: refused `locked`, before any cost is read.
- **If the card id is not a kind in the data**: refused `unknown` and logged.
- **If `upgrade_card` is called twice in one frame for one card** (a double tap): the calls run one after the other. The second sees the new level and the next, higher cost; it succeeds only if the gold is still there. One tap can never be charged twice for one level. Whether one tap may issue more than one call (and so buy two levels) is the Collection & Upgrade Screens' rule, with the confirmation question (Open Question 5).
- **If the cost lookup returns none** (the data's `card_level_max` was raised without adding costs in Currencies & Economy): refused `invalid`, logged, nothing spent. A none is never read as a cost of 0.
- **If the session is read-only** (Save & Progress rule 9): the purchase works in memory and is gone when the app closes, like the wallet's totals.

**Saved levels**

- **If a saved level is above `card_level_max`** (the maximum was lowered in an update): it is lowered to the maximum on load and logged. The gold already paid is not returned (Currencies & Economy rule 10).
- **If `card_level_max` is raised in an update**: Maxed cards become Upgradable again; nothing else changes.
- **If the `cards` block holds a level for a card whose race is not owned** (a merged or hand-edited save): the level is kept. The card shows Locked and has no effect until the race is owned, then shows at its kept level.
- **If the block holds a card id the data no longer has**: the entry is kept in the file and ignored (rule 15).
- **If a race is unlocked**: its three cards become Upgradable at once, at their saved levels (level 1 on a normal save).

**In a match**

- **If a send produces no pawn** (for example the rope is cut on the step its send was due and the pawn is not sent): `veteran_for_launch` is not called and the counter does not move. Only a pawn that actually leaves is counted.
- **If a keep changes level** (rise or drop): its next launches are another kind and advance that kind's counter. The first kind's counter keeps its value for the rest of the match and carries on if any keep launches that kind again.
- **If a keep is captured or lost**: the counters are per owner and per kind, not per keep; nothing is reset.
- **If a veteran clashes with a weaker pawn**: each loses the smaller strength (Troop Marching rule 7), so the veteran survives with what is left and marches on. It keeps its veteran mark.
- **If a veteran arrives at a full keep of its own side and is relayed**: it stays a veteran and is not counted again (rule 9).
- **If a veteran captures a keep**: the keep is set to `capture_troops` and any strength left over is discarded (Troop Marching rule 12), as for any pawn.
- **If the match is restarted or retried**: a new match is built; every counter starts at 0 and the card levels are read again.
- **If the game is paused**: nothing launches, so no counter moves.
- **If both sides play the same race**: the counters are kept per owner. In the UAT build the rival has none (rule 13).
- **If the player changes the active race between matches**: the next match reads that race's three cards; the other race's levels are untouched.
- **If the player times ties so a veteran leaves on a chosen rope** (launches in one step go in ascending `rope_id`): allowed. It moves a veteran from one rope to another and never makes an extra one; the total over the match is the same.
- **If a kind has base strength 3**: its launches are never veterans (rule 11) and one warning is logged at app start.

## Dependencies

Every system here has a GDD except Collection & Upgrade Screens, so that contract is provisional. Statuses are the systems index's on 2026-11-26.

| System | Hard / Soft | Direction | What crosses | Status |
|---|---|---|---|---|
| Unit Roster & Stats | Hard | in | The kinds (one card each), their tier and base `strength`; bound U3; F1 `unit_power` for C4 | In Review |
| Currencies & Economy | Hard | out | `card_upgrade_cost`, `can_afford`, `spend_currency(gold, cost)` | In Review |
| Save & Progress | Hard | both | The `cards` block and its migration step | Approved |
| Troop Marching & Clashes | Hard | out | `veteran_for_launch` at launch; the veteran's strength and mark | Approved (its rule 3 has the launch call) |
| Faction Collection & Unlocks | Hard | in | `is_owned(race)` | Approved |
| Factions | Soft | in | The player's active race; the races that exist | In Review |
| Level HUD | Soft | out | The veteran mark, for the trim | In Review (its rule 7 draws the mark) |
| Collection & Upgrade Screens | Hard (dependent) | out | Card levels, states, costs, `veteran_every`, `upgrade_card`, `card_upgraded` | Not yet designed |
| Stars & Rewards | Soft | none | It grants the gold spent here, through Currencies & Economy; its time goals should be re-run with veterans | Approved |
| Rival AI | Soft | none | No veterans for the rival in the UAT build; its `threat` and `incoming` read a veteran's real strength; a later hook | Approved |

**Bidirectional check.** Unit Roster & Stats names this GDD (rule 10, Interactions, Dependencies, Open Question 6). Currencies & Economy names it (rules 9 and 11, Interactions). Save & Progress names it (Interactions, Dependencies). Troop Marching names it (rule 16's note, Interactions, Dependencies). Factions names it (Dependencies). Faction Collection & Unlocks names it (Interactions: `is_owned`). Level HUD names it (rule 7, Interactions, Dependencies). Stars & Rewards names it in Dependencies, but still as "Not designed" (edit 5). Rival AI does not name it (edit 8). The edits other GDDs need are listed under Cross-References; each is sent to the session that owns the file, not applied here.

## Visual/Audio Requirements

`art-director` not consulted — Lean mode. Review manually before production.

- **The veteran pawn** is the one new thing on the table. It must be told from a plain pawn of its kind by shape, not by colour alone (art bible Principle 2): a small addition to the silhouette, for example a back pennant or a taller crest, that reads at pawn size (about 24 px) and in greyscale. The addition is drawn in the owner's trim colour (Heraldic Gold for the player, always touching blue). It never glows: pawns are in the art bible's "Never" glow tier.
- **It is not Accent Gold.** Accent Gold means "a gain just happened" and belongs to no owner; a veteran is a standing property of a pawn, so it uses the owner's trim.
- **Same size, same speed.** A veteran has its kind's `size`; it is not a bigger sprite. A stream with veterans still reads as one stream (Pillar 2).
- **The card** (Collection & Upgrade Screens owns the layout, the art bible the frame): the unit's splash figure, its name, its level as five pips, and the veteran mark shown the way it appears on the table, so the player learns the mark where they buy it.
- **Upgrade moment**: a short Accent Gold flare on the card and the new pip filling, in the frame's "steady, crafted" register (no bounce). A sound for it belongs to the Audio GDD; none is specified here.
- **Asset list**: one veteran variant per kind (six in the UAT build), sharing its kind's animation; one veteran mark icon for cards.

> **Asset Spec** — Visual/Audio requirements are defined. After the art bible is approved, run `/asset-spec system:unit-cards-upgrades` to produce per-asset visual descriptions, dimensions and generation prompts from this section.

## Game Feel

- **You see what you bought.** The first match after an upgrade should show it within seconds: at card level 2 the first veteran soldier leaves 7.1 s after the first rope. Playtest question for UAT-2: after buying one upgrade, can testers point at a veteran on the table without being told?
- **A purchase is instant and final.** The level pip fills on the frame of the tap, the gold counter drops on the same frame (`currency_changed`), and there is no confirmation box: a purchase costs gold the player chose to spend, and nothing is lost by it. (A confirmation would protect against a mistap; that is the UX spec's call.)
- **Never a punishment.** A short balance greys the button and shows the cost; it never shows an error. A Locked card shows the unit, so the player wants the race.
- **Not a second verb.** Nothing here adds an action to a match (Pillar 1): veterans come out of the same ropes, on their own.

## UI Requirements

This system has no screen of its own. It supplies:

- **To the Collection & Upgrade Screens**: for each card its kind, race, tier, level, state (Locked, Upgradable, Maxed), the next level's cost and whether it is affordable, and "a veteran every Nth" at the current and the next level, built from the data values and never typed as fixed text. The button calls `upgrade_card`; the screen redraws on `card_upgraded` and `currency_changed`.
- **To the Level HUD**: the veteran mark on a pawn. No number is drawn on a pawn; the plaque shows what an arrival did (Unit Roster UI Requirements).
- **Nothing on the Win overlay.** Gold gained is Stars & Rewards' line; this system adds no text there.

> **UX Flag — Unit Cards & Upgrades**: this system has UI requirements. In Pre-Production, run `/ux-design` for the Collection & Upgrade Screens before writing epics. Stories that touch the UI should cite `design/ux/[screen].md`, not this GDD directly.

## Cross-References

| This document | References | Rule, value or contract |
|---|---|---|
| Rules 1, 11; F2, F3; C3, C4 | Unit Roster & Stats rules 2, 3, 10, 12; F1; U1, U3; Open Question 6 | Kinds and tiers; `unit_power`; strength at most 3; cards add on top of U1, capped here at 0.25 |
| Rules 6–10; edge cases | Troop Marching & Clashes rules 7, 10, 12, 16, 17; M4 | Clash and arrival by strength; the `UnitStats` record; no randomness; launch order |
| Rules 4, 5, 17; cost section | Currencies & Economy rules 7, 9, 10, 11, 14; F5 | `spend_currency`, one write per purchase, no refunds, `card_upgrade_cost` |
| Rules 15, 16 | Save & Progress rules 3, 5, 6, 9, 10 | Named block, merge keeps the higher value, one flush, read-only sessions, validation |
| Rules 3, 14 | Factions rules 1–3; Faction Collection & Unlocks rule 3 | Races, the starter race, the active race, the owned set (`is_owned`) |
| F1 example | Rope Links F2 | Launch times on one rope |
| Boundary findings | Troop Generation I3, F4; Stars & Rewards time goals; Keep Levels `level_drop_margin` | Capture pace with veterans; margin warning |

**Edits other GDDs need** (each is sent to the session that owns the file; none is applied here):

1. `troop-marching-clashes.md`: add the launch call (`veteran_for_launch`, strength + `veteran_bonus`, the veteran mark, a relay is not a launch) and name this GDD in Interactions and Dependencies. **Applied 2026-11-25** by session 7a, user-approved (rule 3, Interactions, Dependencies); that GDD has a re-check pending.
2. `unit-roster-stats.md`: rule 10 says cards "add to a kind's stats inside U2–U4". Reword: a card makes veterans (strength + 1, inside U3); speed and size are not changed; the cap is 0.25 of `unit_power` (C3). Close Open Question 6 with C3 and C4. Its edge case "a card upgrade would push a stat past U2, U3 or U4" becomes rule 11 here (a strength 3 kind launches no veterans). **Applied 2026-11-25** by session 39, user-approved (rules 6 and 10, Interactions, edge case, Open Question 6 closed); that GDD is back to In Review.
3. `level-hud.md`: draw the veteran mark on a marked pawn; name this GDD in Interactions. **Applied 2026-11-25** by session 39, user-approved (rule 7, `pawns()` fields, Interactions and Dependencies); it relies on edit 1 (Troop Marching passing the mark), applied the same day.
4. `currencies-economy.md`: its Interactions row for this GDD is no longer provisional; the three checks under "What this GDD asks of the cost table". **Applied 2026-11-25** by session 7a: the row is no longer provisional and the checks are its invariant E3 (F5's costs hold them).
5. `stars-rewards.md`: re-run the time goals with maxed cards, or note that goals assume no veterans; its Dependencies row for this GDD still says Not designed. **Open:** not sent (session 01, which wrote that GDD, had closed on 2026-11-26).
6. `systems-index.md` row 23: Status and Design Doc; add Troop Marching & Clashes and Faction Collection & Unlocks to its dependencies. **Applied 2026-11-25** by session 7a (Designed, pending review).
7. `design/registry/entities.yaml`: register `card_level_max` (5), `veteran_bonus` (1), `card_power_cap` (0.25), the `veteran_every` table and the formulas `veteran_launch`, `card_power_gain` and `upgraded_power`. **Applied 2026-11-25** by session 7a; the values match this GDD and `registry.sh validate` is clean.
8. `rival-ai.md`: add an Interactions row for this GDD: its `threat` and `incoming` read a pawn's strength, so they count a player's veteran at its real worth; the rival launches no veterans in the UAT build (this GDD's rule 13). **Open**, not yet sent (added 2026-11-26 after review).

## Acceptance Criteria

`qa-lead` lens applied by the author (Lean mode: Section H is a high-risk section). Baseline data unless a criterion says otherwise: `card_level_max` 5, `veteran_bonus` 1, the `veteran_every` table of F1, the rosters of Unit Roster & Stats, the costs of Currencies & Economy F5, `send_interval` 0.6 s. Tags: **[Logic]** automated unit test in `tests/unit/unit_cards/`; **[Integration: X]** automated test in `tests/integration/` with system X; **[UI]** retained screenshot in `production/qa/evidence/`; **[Playtest]** a recorded playtest. In unit tests the wallet, the owned set and Save are stubs.

**Cards and buying**

- **AC1 [Logic] (rules 1, 2)**: GIVEN the baseline rosters (human, beast), WHEN the cards are listed, THEN there are exactly six, with ids `human_t1`, `human_t2`, `human_t3`, `beast_t1`, `beast_t2`, `beast_t3`, each at level 1 on a fresh profile. GIVEN a third race is added to the roster data, THEN there are nine with no other change.
- **AC2 [Integration: Currencies & Economy] (rules 4, 5)**: GIVEN `human_t1` at level 1 and 150 gold, WHEN `upgrade_card(human_t1)` is called, THEN it returns ok, the card is level 2, the balance is 50, `card_upgraded(human_t1, 2)` is raised once, and Save receives the card level and the wallet change in the same frame, before one flush.
- **AC3 [Logic] (rule 4, boundary)**: GIVEN `human_t1` at level 1 and exactly 100 gold, WHEN it is upgraded, THEN ok and the balance is 0. GIVEN 99 gold, THEN refused `short`, the level is 1 and the balance is 99.
- **AC4 [Logic] (rules 2, 4)**: GIVEN `human_t3` at level 5 and 99,999 gold, WHEN it is upgraded, THEN refused `max`, no cost is read, and the balance is unchanged.
- **AC5 [Logic] (rule 3)**: GIVEN the beast is not owned and the player has 5,000 gold, WHEN `upgrade_card(beast_t1)` is called, THEN refused `locked` and nothing is spent. GIVEN the beast is then owned, THEN the same call returns ok.
- **AC6 [Logic] (rule 4, order of checks)**: GIVEN an id `elf_t1` not in the data, THEN refused `unknown` and logged. GIVEN a not-owned card at level 5 (a hand-made state), THEN the reason is `locked`, not `max`.
- **AC7 [Logic] (edge: double tap)**: GIVEN `human_t1` at level 1 and 250 gold, WHEN `upgrade_card(human_t1)` is called twice in one frame, THEN the first returns ok (level 2, balance 150) and the second is refused `short` (level 3 costs 200); the level is 2 and the balance 150.
- **AC8 [Logic] (edge: missing cost)**: GIVEN `card_level_max` 6 in this system's data and no cost for `to_level` 6, WHEN a level 5 card is upgraded, THEN refused `invalid`, logged, and nothing is spent.

**Veterans**

- **AC9 [Logic] (rules 6, 7, F1)**: GIVEN the player's soldier card at level 2 (`veteran_every` 12) and a new match, WHEN `veteran_for_launch(player, human_t1)` is called 36 times, THEN it answers yes on calls 12, 24 and 36 and no on the other 33.
- **AC10 [Logic] (rule 7, F1 boundary)**: GIVEN a card at level 1, WHEN the call is made 1,000 times, THEN it never answers yes. GIVEN the summon card at level 5 (`veteran_every` 3), THEN calls 3, 6 and 9 answer yes.
- **AC11 [Logic] (rules 7, 9)**: GIVEN the soldier card at level 5 (every 5th) and the rider card at level 2 (every 10th), WHEN launches alternate soldier, rider, soldier, rider for 20 launches, THEN the soldier's 5th and 10th launches (launches 9 and 19 overall) and the rider's 10th (launch 20) are veterans: each kind has its own count.
- **AC12 [Integration: Troop Marching & Clashes] (rules 6, 10)**: GIVEN the soldier card at level 5 and one player rope into an enemy keep holding 10 troops with no generation, WHEN the rope's first five pawns arrive, THEN the keep holds 4 troops (four pawns of strength 1 and one veteran of strength 2), and the fifth pawn carried the veteran mark.
- **AC13 [Integration: Troop Marching & Clashes] (rule 8)**: GIVEN the same level, seed and inputs with the player's cards at level 3, WHEN the match is run twice, THEN the list of veteran pawns (by `seq`) is identical in both runs.
- **AC14 [Integration: Troop Marching & Clashes] (rule 9)**: GIVEN a veteran that arrives at a full keep of its own side with one outgoing rope, WHEN it is relayed, THEN it still has strength 2 and its mark, and the kind's counter is the same before and after the relay.
- **AC15 [Integration: Troop Marching & Clashes] (edge: clash)**: GIVEN a veteran soldier (strength 2) meeting one rival soldier (strength 1) on the same keep pair, WHEN they clash, THEN the rival pawn falls and the veteran marches on with strength 1 and its mark.
- **AC16 [Logic] (rule 11)**: GIVEN a test kind with base strength 3 and its card at level 5, WHEN it is launched 20 times, THEN no launch is a veteran, and one warning naming the kind was logged at app start.
- **AC17 [Integration: Level State & Match Flow] (rule 12)**: GIVEN a match built with the soldier card at level 1, WHEN the saved level is raised to 2 while the match runs, THEN no veteran is launched in that match; WHEN the level is restarted, THEN the 12th soldier launch is a veteran.
- **AC18 [Integration: Rival AI] (rule 13)**: GIVEN the player's cards all at level 5 and a rival of the same race, WHEN a match runs for 60 s, THEN no rival pawn has a veteran mark or a strength above its kind's.
- **AC19 [Integration: Factions] (rule 14)**: GIVEN `human_t1` at level 5, `beast_t1` at level 1 and the beast active, WHEN a match runs, THEN no player launch is a veteran; WHEN the human is made active and a new match runs, THEN every 5th soldier launch is.
- **AC20 [Logic] (edge: no launch)**: GIVEN a kind's counter at 4 of 5 and a step on which a due send produces no pawn (the call is not made), THEN the counter stays 4, and the next pawn that does launch is a veteran.

**Saving**

- **AC21 [Integration: Save & Progress] (rule 15)**: GIVEN `human_t1` at level 3 and `human_t2` at level 2, WHEN the app is closed and reopened, THEN both levels are as left and every other card is level 1; the `cards` block holds exactly those two entries.
- **AC22 [Logic] (rule 15, validation)**: GIVEN a saved block with `human_t1` 9, `human_t2` 0, `human_t3` 2.5 and `orc_t1` 3, WHEN it loads, THEN `human_t1` is 5, `human_t2` and `human_t3` are level 1, the `orc_t1` entry is kept and ignored (it writes no log line), three log lines are written and the file is not treated as damaged.
- **AC23 [Integration: Save & Progress] (rule 15, migration and merge)**: GIVEN a UAT-1 save with no `cards` block, WHEN it loads, THEN the block is created empty and every card is level 1. GIVEN two results for one card, levels 2 and 4, WHEN they merge, THEN the level is 4.
- **AC24 [Integration: Save & Progress, Currencies & Economy] (rule 16)**: GIVEN cards above level 1, WHEN `delete_progress()` is confirmed, THEN every card is level 1 and the balance is 0. GIVEN a read-only session, WHEN a card is upgraded, THEN the level rises in that session and is level 1 again after a restart.

**Formulas and data**

- **AC25 [Logic] (F2)**: GIVEN baseline data, WHEN `card_power_gain` is computed for the rider at levels 1 to 5, THEN it returns 0, 0.100, 0.125, 0.167 and 0.250 (to three places); for the summon at level 5 it returns 0.167.
- **AC26 [Logic] (F3, C4)**: GIVEN baseline data, WHEN `upgraded_power` is computed with all three beast cards at level 5, THEN it returns 1.31, 1.56 and 2.13 (to two places), rising with the tier.
- **AC27 [Logic] (C3)**: GIVEN a table whose rider row holds 3 at level 5 (gain 0.333), WHEN it loads in a development build, THEN loading stops with an error naming C3, tier 2, level 5 and both values; in a shipped build the baseline table is used, a log line is written and saved card levels are unchanged. The same for a row that rises (level 3 holds 10 after level 2 holds 8) and for a level 1 entry that is not 0.
- **AC28 [Logic] (C1, C2, C4)**: GIVEN `card_level_max` 1, or `veteran_bonus` 2, or a table in which a race's tier 1 `upgraded_power` is not below its tier 2 at the same level, WHEN it loads in a development build, THEN loading stops naming C1, C2 or C4.
- **AC29 [Logic] (rule 17)**: GIVEN the soldier's level 2 entry changed from 12 to 6 in the data file, WHEN a match runs, THEN the 6th soldier launch is a veteran, with no code change.

**Screens and feel**

- **AC30 [UI] (States, UI Requirements)**: retained screenshots of the Collection & Upgrade Screens show a Locked card, an Upgradable card with an affordable cost, the same card with a short balance (greyed, cost shown, no error), and a Maxed card with five pips. GIVEN the soldier's level 2 entry is 6 in data, THEN the card reads "a veteran every 6th" with no other change.
- **AC31 [UI] (Visual/Audio)**: a retained screenshot of a match with the soldier card at level 5 shows a veteran on a rope beside plain soldiers, with its silhouette mark visible at pawn size (about 24 px). GIVEN a greyscale copy of that screenshot and testers not told which pawn is the veteran, THEN at least 4 of 5 pick the veteran; the art lead signs off on the mark.
- **AC32 [Playtest] (Game Feel)**: GIVEN testers who bought one upgrade and were not told what it does on the table, THEN at least 4 of 5 point at a veteran within their next match.

**Edge cases and performance**

- **AC33 [Logic] (rule 3, edge: kept level on a locked race)**: GIVEN a saved `beast_t1` at level 3 and the beast not owned, THEN the card shows Locked and `upgrade_card(beast_t1)` is refused `locked`; WHEN the beast is unlocked, THEN the card is Upgradable at level 3 and its next cost is `card_upgrade_cost(beast_t1, 4)`; WHEN the beast is then made active and a match is built, THEN the soldier card is read at level 3 (`veteran_every` 9).
- **AC34 [Logic] (rule 15, edge: maximum lowered)**: GIVEN `card_level_max` 4 in data and a saved `human_t1` at level 5 with 300 gold, WHEN it loads, THEN `human_t1` is level 4 and Maxed, one log line names the card and both levels, and the balance is still 300.
- **AC35 [Performance] (rule 10)**: on the mid-range Android target, 1,000 calls of `veteran_for_launch` take under 10 ms in total (under 0.01 ms each).

**Coverage check.** Rules 1–17 each have a criterion (1, 2: AC1; 3: AC5; 4, 5: AC2–AC8; 6–10: AC9–AC15; 11: AC16; 12: AC17; 13: AC18; 14: AC19; 15: AC21–AC23; 16: AC24; 17: AC29). F1 is AC9–AC11, F2 is AC25, F3 is AC26, C1–C4 are AC27 and AC28. Boundaries: level 1 and the maximum (AC4, AC10), the exact cost (AC3), strength 3 (AC16). Edge cases: a kept level on a locked race (AC33), a lowered `card_level_max` (AC34); performance AC35. Gaps: the four asks of the cost table are tested in Currencies & Economy (its E3), not here; the shipped fallback when the baseline table itself fails C3 or C4 has no criterion, because no shipped roster triggers it.

## Open Questions

| # | Question | Owner | Resolve by |
|---|----------|-------|------------|
| 1 | Does the rival get card levels in later regions, and where is the level stored (a region field, a level field, or Rival AI data)? In the UAT build it has none (rule 13) | Rival AI, Campaign Level Data | After UAT, when a second region ships |
| 2 | Which card is the better buy in play? Per launch the three cost the same per troop gained; the soldier is launched most. Measure launches per tier in real matches, then adjust `veteran_every` or Currencies' `tier_cost_percent` | economy-designer | First UAT-2 playtest |
| 3 | Capture pace with maxed cards: re-run Troop Generation's F4 example (59 s) and Stars & Rewards' time goals with veterans every 5th, 4th and 3rd | systems-designer | Before the UAT-2 balance pass |
| 4 | Gold has no use after the 24th purchase until God & Goddess Powers. Is a longer sink needed in the UAT build? | Currencies & Economy | First UAT-2 playtest |
| 5 | Should a purchase ask for confirmation, and may one tap issue more than one `upgrade_card` call? This GDD says no confirmation (final, but never a loss of something the player did not choose to spend) and leaves the one-call-per-tap rule to the screen | ux-designer | `/ux-design` for the Collection & Upgrade Screens |
| 6 | The veteran's silhouette mark (pennant, crest or other) and whether it differs per race | art-director | `/asset-spec` |
| 7 | A race with a strength 3 summon gets nothing from that card (rule 11). Forbid strength 3 for carded kinds, or give such a kind a different upgrade? | Unit Roster & Stats, Factions | When a third race is designed |
| 8 | Add a Tuning Knobs section (advisory at standard): `veteran_every` per tier and level, `card_power_cap`, `card_level_max`, with safe ranges | game-designer | Before epics |
