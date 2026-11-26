# Currencies & Economy

> **Status**: In Design
> **Author**: the player + Claude (design-system, lean)
> **Last Updated**: 2026-11-25
> **Last Verified**: 2026-11-25
> **Implements Pillar**: 3, Paint the map, grow the army

## Summary

Currencies & Economy is the game's wallet and price list: gold, earned from stars and wins and spent on unit card upgrades, and diamonds, earned by conquering regions and spent on unlocking races. It sets the pace at which the player's army grows, about one card upgrade per level won and one new race per region, with nothing sold for money in the UAT build. It exists so that every win and every conquest becomes something the player chooses and then sees in their collection.

> **Quick reference** — Layer: `Core` · Priority: `MVP (UAT-2)` · Key deps: `Save & Progress, Campaign Level Data (soft), Factions (soft)`

## Overview

Currencies & Economy defines the two things the player earns between matches and what they are worth. Gold comes from winning levels and pays for unit card upgrades; diamonds come from conquering regions and unlock rare races. The system owns the wallet (how much of each the player holds, how an amount is added or spent, and how the totals are saved) and the table of amounts and prices that sets the pace: what a win pays, what a region pays, what an upgrade or a race costs. Other systems decide when a reward is due (Stars & Rewards) and what a purchase gives (Unit Cards & Upgrades, Faction Collection & Unlocks); they ask this system to add or take the amount. The player never operates this system directly: they see a count rise after a win and fall when a card levels up or a race joins, and the thing bought is what shows the progress (Pillar 3: a reward never shows only as a number). In the UAT build nothing is bought with money, no ad pays out, and neither currency converts into the other. Without this system a win would unlock the next node and nothing else, and the army layer would have nothing to grow with and no pace to grow at.

## Detailed Design

### Core Rules

`economy-designer`, `systems-designer` and `game-designer` not consulted — Lean mode. Review manually before production.

1. **Two currencies.** `gold` and `diamonds`. Each is a whole number and is never negative. Stars are not a currency: they are a record and are never spent (Stars & Rewards).
2. **What each buys in the UAT build.** Gold buys unit card upgrades and nothing else. Diamonds unlock `diamonds` races (Factions rule 1) and nothing else. God power upgrades are a second gold sink after UAT; the split is decided then (systems index, 2026-11-22).
3. **Where each comes from in the UAT build.** Gold: `star_gold` once for each goal of each level the first time it is held, and `win_gold` for every win, the first and every replay (the player's decision, 2026-11-25; Stars & Rewards rule 6). Diamonds: `region_diamonds` once per region, when it is first recorded as conquered (the player's decision, 2026-11-22). A loss or a quit pays nothing. There is no other source: no purchase, no ad, no daily gift.
4. **No conversion.** Gold never becomes diamonds and diamonds never become gold. Each currency paces one kind of progress: gold paces card levels by levels won, diamonds pace races by regions conquered. Replay gold is the one source with no limit, so a conversion would let replays buy races.
5. **The wallet is four totals** (the player's decision, 2026-11-25): `gold_earned`, `gold_spent`, `diamonds_earned`, `diamonds_spent`. Each only ever rises, so Save & Progress rule 5 (progress only grows) holds as written. What the player holds is `balance(currency)` = earned − spent (F1); the balance is never stored.
6. **Adding.** `add_currency(currency, amount)` adds `amount` to that currency's earned total and returns ok. `amount` must be a whole number of 1 or more and `currency` must be `gold` or `diamonds`; otherwise nothing changes, the call is logged and returns refused. Only the systems in rule 3 call it.
7. **Spending.** `spend_currency(currency, amount)` is all or nothing. If `amount` is a whole number of 1 or more and `balance(currency)` ≥ `amount`, it adds `amount` to the spent total and returns ok. Otherwise nothing changes and it returns refused with a reason: `short` (the balance is too low) or `invalid` (a bad amount or currency, logged). There is no partial spend and no debt. `can_afford(currency, amount)` answers the same test and changes nothing.
8. **Balance cap.** A balance never passes `balance_cap` (999,999). An add that would pass it adds only the part that fits; the rest is lost and logged, and the call still returns ok. The cap exists so the counter has a fixed width (six digits) and the totals stay far inside whole-number range; the campaign's whole gold income must stay below it (invariant E4).
9. **A purchase is one write.** The buyer (Unit Cards & Upgrades, Faction Collection & Unlocks) calls `spend_currency` and, on ok, applies what was bought in the same frame. Save & Progress writes once at the end of that frame (its rule 6), so the spend and the thing bought are saved together or not at all. A buyer never applies a purchase before the spend returns ok, and never spends for something it then refuses.
10. **No refunds, no selling.** A purchase is final. Nothing bought can be sold back, and no card level or race is ever taken away to return its price. Delete progress is the only reset (rule 14).
11. **Amounts and prices are data, owned here.** One economy data file holds `star_gold`, `win_gold`, `region_diamonds`, `card_upgrade_cost` and `race_unlock_cost`. Other systems read them by name through lookups: `star_gold(level_id)`, `win_gold(level_id)`, `region_diamonds(region_id)`, `card_upgrade_cost(card, to_level)` and `race_unlock_cost(race_id)`. No other GDD and no code states one of these numbers. The loader checks the invariants in Formulas (E1–E5) when the game starts: a value that fails is an error in development; in a shipped build it is replaced by the default in this GDD and logged.
12. **Saved block.** The wallet is one named block, `wallet`, holding the four totals (Save & Progress rule 3). This GDD adds one migration step that creates the block with four zeros; it runs before Stars & Rewards' step, which pays an old save its star gold and region diamonds into the block (Stars & Rewards rule 10). On load each total must be a whole number of 0 or more; a spent total above its earned total is lowered to the earned total (balance 0), and an earned total that would put the balance above `balance_cap` is lowered to spent + `balance_cap`. Both are logged and neither is treated as damage (Save & Progress rule 10).
13. **Change event.** After every add or spend that returns ok, the wallet raises `currency_changed(currency, balance, delta)`, with `delta` positive for an add and negative for a spend. Screens listen to it; the wallet draws nothing and plays nothing.
14. **Delete progress and read-only sessions.** `delete_progress()` gives a fresh profile, so all four totals are 0. In a session where Save & Progress refuses to write (a save from a newer version, its rule 9) the wallet works in memory and nothing is kept.
15. **Not this system's.** When a reward is due, which goals a win met and how a gain is shown belong to Stars & Rewards and the screens. What a card level gives and what owning a race means belong to Unit Cards & Upgrades and Faction Collection & Unlocks. This system answers two questions only: how much, and can the player pay.
16. **After the UAT build.** Purchases with money, rewarded ads and god power upgrades each add a source or a sink. Each one amends rules 2 and 3 in this GDD before it ships; none may break rule 4 without the player's decision.

### States and Transitions

None. The wallet is four numbers with no modes; every call is answered from the totals as they stand. Whether a buy button looks affordable or short is derived each time from `can_afford` and is never a stored state.

### Interactions with Other Systems

**Direction rule.** The wallet calls Save & Progress and nothing else. Every other system calls the wallet or listens to `currency_changed`; the wallet never calls a buyer or a screen.

| System | Direction | Data | Interface owner |
|--------|-----------|------|-----------------|
| Save & Progress | both | Out: the `wallet` block (four totals), reported on every change and written by Save's flush; one migration step. In: the block on load | Save & Progress owns the file, the merge and the flush; this GDD owns the block's shape and its validation |
| Stars & Rewards | in | Reads `star_gold(level_id)`, `win_gold(level_id)`, `region_diamonds(region_id)`. Calls `add_currency(gold, …)` inside `score_win` and `add_currency(diamonds, …)` on a region's first conquest record; its migration step calls `add_currency` for an old save | Stars & Rewards decides when and how often; this GDD owns the amounts and the wallet |
| Unit Cards & Upgrades | in | Reads `card_upgrade_cost(card, to_level)`; calls `can_afford` and `spend_currency(gold, cost)` | This GDD owns the cost and the spend; Unit Cards & Upgrades owns card levels and what they give |
| Faction Collection & Unlocks (no GDD yet, provisional) | in | Reads `race_unlock_cost(race_id)`; calls `can_afford` and `spend_currency(diamonds, cost)` | This GDD owns the price and the spend; Faction Collection & Unlocks owns the purchase flow and the owned set |
| Factions | in (data) | The race records: which races are `diamonds` races and their `order`, used to check that every such race has a price (E5) | Factions owns the records; this GDD owns the price |
| Unit Roster & Stats | in (data) | Each unit kind's id and tier, for a card's cost (F5) | Unit Roster & Stats owns the kinds; this GDD owns the cost |
| Campaign Level Data | in (data) | Level ids and region ids for the lookups; the count of levels and regions for the income totals (F3, F4) | Campaign Level Data owns the ids; this GDD owns the amounts |
| Collection & Upgrade Screens (no GDD yet, provisional) | out | `balance(currency)`, `currency_changed`, the cost lookups, `can_afford` for button states | That GDD owns the layout; this GDD owns the numbers |
| World Map & Regions, Menus & Screens | out | `balance(currency)` and `currency_changed` for any counter they show; the gains shown on the Win overlay and in the conquest sequence come from Stars & Rewards | The screens own what they draw |
| God & Goddess Powers (after UAT) | in | A second gold sink through `spend_currency` | Decided when that GDD is written |

## Formulas

`systems-designer` lens applied, with its cost checks (Lean mode, Section D). All amounts are whole numbers and all arithmetic is whole-number arithmetic. Every value marked *data file* lives in the economy data file (rule 11); its Range column is the safe range.

### F1. Balance

The balance formula is defined as:

`balance(currency) = earned(currency) − spent(currency)`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| earned | int | 0 to spent + `balance_cap` | calculated (saved total) | Everything `add_currency` has added to this currency |
| spent | int | 0 to earned | calculated (saved total) | Everything `spend_currency` has taken from this currency |
| balance_cap | int | 9,999–999,999; default 999,999 | data file | The highest balance a currency may reach (rule 8) |

**Output Range:** 0 to `balance_cap`. It cannot be negative: a spend is refused unless `balance ≥ amount` (rule 7), and a loaded file with spent above earned is corrected to balance 0 (rule 12). It cannot pass the cap: an add is cut to `balance_cap − balance` (rule 8).
**Example:** gold earned 1,050, gold spent 900 → balance 150. A spend of 200 is refused as `short`; a spend of 100 leaves 50.

### F2. Gold for a star and for a win

The star_gold and win_gold formulas are defined as:

`star_gold(level_id) = region_star_gold[order of the level's region]`

`win_gold(level_id) = floor(star_gold(level_id) × replay_percent / 100)`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| region_star_gold | int, one per region `order` | 0–2,000 each, never lower than the region before; default 100, 150, 200, 250, 300 for orders 1–5 | data file | Gold for each goal first held on a level of that region (the player's decision, 2026-11-25: rising by region) |
| replay_percent | int | 0–10; default 10 | data file | The share of a star's gold that every win pays, in percent |

**Output Range:** `star_gold` 0 to 2,000; `win_gold` 0 to 200. Defaults: `star_gold` 100 / 150 / 200 / 250 / 300 and `win_gold` 10 / 15 / 20 / 25 / 30 in regions 1 to 5. With `replay_percent` 0 there is no replay gold; with `star_gold` under 10, `win_gold` floors to 0. A region whose `order` has no entry uses the last entry in the table, logged.
**Why it rises:** card costs double per level (F5), so a flat income would slow upgrades to about one per three levels late in the campaign. A later level also pays more than an earlier one on replay, so the best level to replay is the furthest one the player can win.
**Example:** gv-03 is in the Green Vale (`order` 1): `star_gold` = 100, `win_gold` = floor(100 × 10 / 100) = 10. A level of region 3: 200 and 20.

### F3. Gold income

The level_gold_max formula is defined as:

`level_gold_max(level_id) = 3 × star_gold(level_id) + win_gold(level_id)`

`region_gold_max(region_id) = sum of level_gold_max over the region's loaded levels`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| star_gold | int | 0–2,000 | calculated (F2) | Gold per goal first held |
| win_gold | int | 0–200 | calculated (F2) | Gold per win |
| loaded levels | list | 0–N per region | data file (Campaign Level Data) | The levels a region ships with |

**Output Range:** `level_gold_max` is the most a level pays once: a first win that meets all three goals (Stars & Rewards' `win_payout` at its maximum). 0 to 6,200; Green Vale 310. After that the level pays `win_gold` per win, without limit. This is a design check, not runtime code.
**Example:** Green Vale, 5 levels: 5 × 310 = 1,550 (1,500 star gold, paid once, and 50 from the five first wins).

**Campaign totals** (regions 2–5 have no levels yet; 5 levels each is assumed and provisional):

| Region `order` | `star_gold` | `level_gold_max` | `region_gold_max` | Running total |
|---|---|---|---|---|
| 1 (Green Vale) | 100 | 310 | 1,550 | 1,550 |
| 2 | 150 | 465 | 2,325 | 3,875 |
| 3 | 200 | 620 | 3,100 | 6,975 |
| 4 | 250 | 775 | 3,875 | 10,850 |
| 5 | 300 | 930 | 4,650 | 15,500 |

### F4. Diamond income

The diamonds_available formula is defined as:

`diamonds_available = region_diamonds × regions_with_levels`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| region_diamonds | int | 1–1,000; default 50 | data file | Diamonds for a region's first conquest; one value for every region (the player's decision, 2026-11-22: a fixed reward). `region_diamonds(region_id)` returns it |
| regions_with_levels | int | 0–5 | calculated (Campaign Level Data) | The number of regions with at least one loaded level; only such a region can be conquered (World Map & Regions F2) |

**Output Range:** 0 to 5,000. UAT build with the Green Vale only: 50. All five regions: 250. A design check, not runtime code.
**Example:** two regions with levels → 2 × 50 = 100.

### F5. Card upgrade cost

The card_upgrade_cost formula is defined as:

`card_upgrade_cost(card, to_level) = floor(card_cost[to_level] × tier_cost_percent[tier of card] / 100)`

`card_total_cost(card) = sum of card_upgrade_cost(card, 2 … card_level_max)`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| card_cost | int, one per `to_level` | 1–100,000 each, never lower than the level before; default 100, 200, 400, 800 for levels 2–5 | data file | Gold to raise a tier 1 card to `to_level` (the player's decision, 2026-11-25: about one upgrade per level won). The defaults double from 100 |
| tier_cost_percent | int, one per tier | 50–300 each, never lower than the tier before; default 100, 125, 150 for tiers 1–3 | data file | How much a card of that tier costs against the table, in percent (the player's decisions, 2026-11-25: cost rises with tier; rider +25%, summon +50%) |
| to_level | int | 2–`card_level_max` | calculated (Unit Cards & Upgrades) | The level the card would reach; a card starts at level 1 |
| card_level_max | int | 5 | data file (Unit Cards & Upgrades, in design) | The highest card level (the player's decision in that GDD, 2026-11-25) |
| card | id | a unit kind, such as `human_t1` | data file (Unit Roster & Stats) | The card's id is its unit kind's id; the kind's tier (1–3) picks the percent |

**Output Range:** 100 to 1,200 with the defaults; at the ends of the ranges 0 (a cost of 1 at 50%) to 300,000. A cost that works out below 1 is an error (E3): a free upgrade is not a purchase. A `to_level` below 2 or above `card_level_max`, one with no entry in the table, or a card that is not a loaded unit kind has no price: the lookup returns none and the buyer offers no purchase.

| Card tier | To level 2 | 3 | 4 | 5 | `card_total_cost` |
|---|---|---|---|---|---|
| 1, soldier | 100 | 200 | 400 | 800 | 1,500 |
| 2, rider | 125 | 250 | 500 | 1,000 | 1,875 |
| 3, summon | 150 | 300 | 600 | 1,200 | 2,250 |

**Example:** the human rider card (`human_t2`) at level 2 going to level 3: floor(200 × 125 / 100) = 250. One race's three cards to the top: 1,500 + 1,875 + 2,250 = 5,625 gold; the six UAT cards: 11,250; fifteen cards at five races: 28,125.

### F6. Race unlock cost

The race_unlock_cost formula is defined as:

`race_unlock_cost(race_id) = race_cost[race_id]`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| race_cost | int, one per `diamonds` race | 1–1,000 each; default `beast` 50 | data file | Diamonds to unlock that race (the player's decision, 2026-11-25: the beast costs one region) |
| race_id | id | a `diamonds` race | data file (Factions) | A `starter` race has no price |

**Output Range:** 1 to 1,000. A `starter` race, or an id that is not a loaded race, has no price: the lookup returns none. The elf, the spirit and the dragon get a price when they are added as data (Factions rule 2); E5 must hold when they are.
**Example:** `race_unlock_cost(beast)` = 50. Conquering the Green Vale pays 50, so the beast can be unlocked in a UAT build with one playable region (this answers Factions Open Question 6).

### Invariants

The loader checks these at game start (rule 11).

- **E1, the farm guard.** `win_gold(level) ≤ star_gold(level) / 10` for every level, so 30 replay wins pay no more than one level's three stars (Stars & Rewards F4, `replay_ratio ≥ 30`). It holds by construction while `replay_percent ≤ 10`.
- **E2, the first upgrade.** `star_gold(first level) + win_gold(first level) ≥` the cheapest `card_upgrade_cost` (a tier 1 card to level 2): a first win with only the win goal buys one upgrade. Defaults: 110 ≥ 100.
- **E3, whole and ordered.** Every amount and price is a whole number inside its range; every `card_upgrade_cost` is 1 or more; `region_star_gold`, `card_cost` and `tier_cost_percent` never fall from one entry to the next.
- **E4, under the cap.** The sum of `region_gold_max` over the campaign is at most `balance_cap / 2`, `diamonds_available ≤ balance_cap`, and no single cost is above `balance_cap`. Defaults: 15,500 ≤ 499,999.
- **E5, every race can be earned.** Every loaded `diamonds` race has a `race_cost`, and the sum of those costs is at most `diamonds_available`. Nothing is sold for money in the UAT build, so a race the campaign cannot pay for would stay locked for ever. Defaults: 50 ≤ 50.

### Pace check: the Green Vale

Five levels, human cards only (three cards), default values. Every upgrade bought is the cheapest one open.

| Result on every level | Gold earned | Bought | Left | Upgrades |
|---|---|---|---|---|
| Win goal only (1 star) | 5 × 110 = 550 | three cards to level 2 (100 + 125 + 150 = 375) | 175 | 3 |
| Two goals (2 stars) | 5 × 210 = 1,050 | three cards to level 2 (375), soldier and rider to level 3 (200 + 250) | 225 | 5 |
| All goals (3 stars) | 5 × 310 = 1,550 | three cards to level 3 (375 + 750), soldier to level 4 (400) | 25 | 7 |

Three to seven upgrades in five levels: about one per level won, the target, and a little under it for a player who only just wins. The conquest pays 50 diamonds, which unlocks the beast; its three cards then open at 100, 125 and 150.

**Later regions** (provisional, 5 levels each): through region 4 the campaign has paid 10,850 gold at most, against 11,250 to take the six UAT cards to the top; the full campaign pays 15,500 against 28,125 for fifteen cards. A player cannot max every card from star gold alone, which keeps the choice of what to upgrade alive to the end; replay gold and the sinks added after UAT cover the rest.

### Loops and choices

- **The growth loop is intended.** Stronger cards win levels faster and cleaner, which earns the time and no-keep-lost stars, which pay more gold. Three things damp it: each goal pays once per level, so star gold is finite; a card's cost grows eightfold from its first upgrade to its last while a star's gold only triples from region 1 to region 5; and card stats stop at Unit Roster & Stats' bounds (U2–U4).
- **Replay farming is bounded, not removed.** `win_gold` is the one unlimited source. At about 2 minutes a win, E1 makes an hour of replays worth one level's three stars.
- **The cheapest upgrade is usually the best buy.** Doubling costs push the player to raise cards evenly, and the soldier card is both the cheapest and the one most keeps send. Whether that makes the choice too easy depends on what a card level gives each tier, which is Unit Cards & Upgrades' to balance; `tier_cost_percent` is the price lever if the soldier card dominates (Open Question 2).
- **Every source has a sink and every sink a source.** Gold: stars and wins in, card upgrades out. Diamonds: regions in, races out. With one region and one rare race the diamond economy is a single purchase in the UAT build; it becomes a choice of order when more races ship.

## Edge Cases

`systems-designer` not consulted — Lean mode. Review manually before production.

**Calls**
- **If `add_currency` or `spend_currency` gets an amount of 0, a negative amount, a fraction or an unknown currency**: nothing changes, the call is logged and returns refused (`invalid` for a spend); no `currency_changed` is raised.
- **If a spend asks for more than the balance**: refused as `short`; nothing changes and no event is raised. The buyer shows why (UI Requirements).
- **If a spend asks for exactly the balance**: ok; the balance is 0.
- **If two purchases are asked in the same frame** (a double tap): each `spend_currency` is answered in order from the totals as they then stand. The second is refused as `short` when the first left too little. When the balance covers both, both are spent; whether the second purchase is still valid (the card is now at its top level, the race is now owned) is the buyer's check before it spends (rule 9).
- **If an add would pass `balance_cap`**: only the part that fits is added, the rest is lost and logged, and `currency_changed` carries the amount really added. When nothing fits (the balance is at the cap) the call returns ok and no event is raised. At default values the cap cannot be reached by star gold (15,500 at most) and replay gold would need over 30,000 wins.

**Saving**
- **If the app closes after a spend and before the frame's flush**: neither the spend nor the purchase was written. On the next launch the currency is back and the purchase is not there (rule 9).
- **If the flush fails** (storage full): the wallet and the purchase stay in memory and Save & Progress retries both in one later write (its rule 7); they are never written apart.
- **If the backup file is loaded instead of the live file**: totals and purchases come from the same older file, so they agree with each other. The player loses the last changes of both together.
- **If a loaded file has a spent total above its earned total**: the spent total is lowered to the earned total, so the balance is 0, and it is logged. Nothing bought is taken away.
- **If a loaded file has a total that is negative or not a whole number**: a negative total becomes 0 and a fraction is rounded down; logged, then the check above applies.
- **If the file is at the current version but has no `wallet` block**: the block is created with four zeros and logged. Nothing is paid again: the goals already held and the regions already conquered stay paid in Stars & Rewards' eyes, so the player keeps what was bought and starts from a balance of 0.
- **If an old save is migrated**: this GDD's step creates the block with zeros; Stars & Rewards' step then pays star gold and region diamonds for what the save already holds (its rule 10). If the steps ran in the other order the grants would have no block to land in, so the order is fixed by the schema version numbers.
- **If progress is deleted**: all four totals are 0 in the fresh profile. No event is raised; a counter reads `balance` when its screen opens.
- **If the session is read-only** (a save from a newer version): adds and spends work in memory for the session and are gone at the next launch, like every other change (Save & Progress rule 9).
- **If the player edits the save file by hand**: they get the totals they typed, inside the load checks above. This is accepted for an offline build that sells nothing; it is reviewed before the store build (Open Question 4).

**Data and updates**
- **If a price rises or falls in an update**: nothing already bought is charged again or refunded. The saved totals stand and the new price applies to the next purchase.
- **If `region_star_gold` or `region_diamonds` changes in an update**: nothing already paid is topped up or taken back. Goals first held after the update pay the new amount.
- **If a value in the economy data file fails E1–E5**: an error in development; in a shipped build the default in this GDD replaces the failing value and it is logged (rule 11).
- **If a region's `order` has no entry in `region_star_gold`**: the last entry is used and it is logged (F2).
- **If a `diamonds` race has no `race_cost`**: an error in development (E5). In a shipped build `race_unlock_cost` returns none, the race cannot be bought and stays locked, and it is logged.
- **If the lookup is asked for a level, region, race or card level that is not loaded**: it returns none. A caller treats none as "no reward" or "no purchase" and never as 0.

**Play**
- **If a win pays gold and a conquest pays diamonds from the same level**: they are two adds at two moments (the win is scored in the match; the conquest is recorded after the map's conquest sequence), each written by its own flush. If the app closes between them, the map shows the sequence on the next open and the diamonds are paid then (World Map & Regions rule 6).
- **If every card is at its top level**: gold still arrives and has nothing to buy until a new race or a later sink exists. The counter stays visible.
- **If every `diamonds` race is owned**: any diamonds left stay in the wallet. In the UAT build the beast costs exactly what the one region pays, so the balance is 0.
- **Degenerate strategy, replay farming**: a level can be replayed for `win_gold` without limit. It is accepted and bounded by E1 (30 replay wins for one level's three stars); the furthest level won pays the most, so farming also practises the hardest level. If playtests show farming replacing progress, `replay_percent` goes down (0 turns replay gold off).

## Dependencies

### Depends on (upstream)

| System | Hard / Soft | Direction | What this system needs | Status |
|--------|-------------|-----------|------------------------|--------|
| Save & Progress | Hard | both | Storage for the `wallet` block, the merge, the end-of-frame flush, one migration step, Delete progress | Approved; it already expects this block (its rules 3 and 9) |
| Campaign Level Data | Soft (data) | in | Level and region ids, each level's region and the region's `order`; the counts behind F3 and F4 | Approved. Without it the lookups return none |
| Factions | Soft (data) | in | Which loaded races are `diamonds` races (E5) | In Design (session 39) |
| Unit Roster & Stats | Soft (data) | in | Each unit kind's id and tier, which pick a card's `tier_cost_percent` (F5) | Approved |

### Depended on by (downstream)

| System | Hard / Soft | Direction | What it needs from this system | Status |
|--------|-------------|-----------|--------------------------------|--------|
| Stars & Rewards | Hard | in | `add_currency`; `star_gold`, `win_gold`, `region_diamonds`; E1 | In Design (session 01); amounts sent 2026-11-25 |
| Unit Cards & Upgrades | Hard | in | `card_upgrade_cost`, `can_afford`, `spend_currency(gold, …)` | In design (session bb). Decided there 2026-11-25: 5 card levels, cost by level and tier, card id = unit kind id; the rest is **provisional** |
| Faction Collection & Unlocks | Hard | in | `race_unlock_cost`, `can_afford`, `spend_currency(diamonds, …)` | Not started: **provisional** |
| Collection & Upgrade Screens | Hard | out | `balance`, `currency_changed`, the cost lookups | Not started (session 39): **provisional** |
| World Map & Regions, Menus & Screens | Soft | out | `balance` and `currency_changed` for a counter, if they show one | Approved; no counter in UAT-1 |
| God & Goddess Powers | Soft | in | A gold sink | After UAT |

### Consistency to fix

Edits other documents need. None is applied by this GDD; each goes to the session that owns the file.

1. `save-progress.md`, rule 6 and the Stars & Rewards rows (Interactions, Depended on by): `add_currency` is the wallet's call (this GDD, rule 6), not a call Save & Progress receives. Save receives the `wallet` block. Its "Currencies & Economy … own named block and a schema migration step" rows stay as they are.
2. `factions.md`, rule 11: the race's price is this GDD's (`race_unlock_cost`); the purchase and the owned set stay Faction Collection & Unlocks'. Its Open Question 6 is answered: yes, the beast costs 50 and the Green Vale pays 50.
3. `stars-rewards.md`: the amounts are no longer placeholders (Green Vale 100 / 10, `region_diamonds` 50; `star_gold` rises by region); its `add_currency` row belongs under Currencies & Economy; its Open Question 2 is answered.
4. `campaign-level-data.md`, Interactions: add a row for this system (out: ids, the level's region, region `order`, level counts).
5. `systems-index.md`: row 15 also depends on Campaign Level Data (soft) and Factions (soft); the Currencies & Economy risk row and the two closed diamond questions can cite this GDD.
6. `game-concept.md`: "amounts provisional" (§3 World map) and the first open question (diamonds per region, the price of a rare race) are answered: 50 and 50.
7. `world-map-regions.md`, Open Question 6: the diamond reward is `region_diamonds` (50); where it is shown stays Stars & Rewards'.
8. `unit-roster-stats.md`, the edge case on a card upgrade past U2–U4: there is no refund (rule 10); the upgrade is refused before any gold is spent.

## Visual/Audio Requirements

`art-director` and `audio-director` not consulted — Lean mode. Review manually before production.

The wallet draws nothing and plays nothing; it raises `currency_changed` and the screens answer. What they must respect:

- **A gain uses Accent Gold; a spend does not.** Accent Gold means "a gain just happened" (art bible §4). A rising gold or diamond count may flare in it, briefly. A spend is not a gain: the count falls plainly and the flare goes to the thing bought (the card that levelled up, the race that joined), which is where Pillar 3 says progress shows.
- **The coin and the gem are icons, not owner colours.** At rest the gold coin must not read as the player's Heraldic Gold trim (which always touches blue) or as an Accent Gold flare (which always moves). The diamond gem must not be royal blue (the player's colour), crimson or monster green, and must not look like a slot dot, which is already drawn as a small diamond rune socket. Both icon designs are the art director's (Open Question 6).
- **Never a sales look.** No pulsing price, no glow on a buy button, no banner over the counter: "gold stays a reward and not a sales pitch" (art bible §2).
- **Audio** arrives with the Audio GDD (after UAT). It will need three cues: a gain, a purchase, and a soft refusal that is not a buzzer.

## Game Feel

- **A gain is watched.** The count rises to its new value in view of the player instead of jumping, so the reward is seen arriving. The screen that shows it owns the timing.
- **A purchase is instant and certain.** The spend and its result happen on the frame of the tap: the count falls, the thing bought changes, and nothing waits on a spinner. A purchase never half-happens (rule 9).
- **Short is known before the tap.** A price the player cannot pay looks unaffordable before they touch it. Tapping it says how much is missing, and never opens a shop: nothing is for sale.
- **Nothing is ever taken back.** No tax, no decay, no loss on defeat, no refund to regret. A balance only falls when the player chooses to spend it.

## UI Requirements

The layouts are Collection & Upgrade Screens' and the Win overlay's; this GDD fixes what they show about currency.

- **Where a counter shows.** Both balances show wherever a currency can be spent (the collection and upgrade screens). A gain shows where it is earned: the gold line on the Win overlay and the diamonds in the conquest sequence, both filled by Stars & Rewards. No currency shows on the table during a match (Pillar 2).
- **A counter is an icon and a number.** The number is the full balance with a thousands separator (15,500, not 15.5K), six digits at most (`balance_cap`). The icon's shape tells the currency; colour alone never does.
- **A price is always shown before a purchase**, as the currency icon and the cost from the lookup, on the control that buys. An unaffordable price has its own look, from `can_afford`.
- **A refused purchase says why**: the amount missing (cost − balance), in words from the strings file. A refusal is not an error box.
- **A diamond purchase asks once.** A purchase is final (rule 10) and diamonds are rare, so unlocking a race confirms before it spends. A gold upgrade is small and frequent and does not confirm. Both are provisional until the buyers' GDDs are written.
- **Counters follow the event.** A visible counter updates from `currency_changed`; it never keeps its own copy of the balance.

> **📌 UX Flag — Currencies & Economy**: this system has UI requirements. Run `/ux-design` for the collection and upgrade screens before writing epics; stories that touch the UI should cite `design/ux/[screen].md`, not this GDD.

## Cross-References

| This Document References | Target GDD | Specific Element | Nature |
|--------------------------|-----------|------------------|--------|
| Storage, merge, flush, migration, validation, Delete progress | `save-progress.md` | Rules 3, 5, 6, 7, 9, 10, 11 | Storage contract |
| When gold and diamonds are paid; the goals; the old-save re-score | `stars-rewards.md` | Rules 6, 7, 10; F3 `win_payout`; F4 `replay_ratio` | Caller of `add_currency`; reader of the amounts |
| Which races are bought with diamonds | `factions.md` | Rules 1, 2, 11; Open Question 6 | Data read; price owned here |
| Level and region ids, region `order`, level counts | `campaign-level-data.md` | Rules 1, 12; the Green Vale content table | Data read |
| A region with no levels cannot be conquered; the conquest record | `world-map-regions.md` | F2; rule 6; Open Question 6 | Rule this GDD relies on |
| Card upgrades stop at the stat bounds | `unit-roster-stats.md` | Rule 10; U2–U4 | Limit on the gold sink |
| Rewards never show only as a number; a level lasts 2–3 minutes | `game-concept.md` | Pillars 2 and 3; Decisions (diamonds) | Design constraint |
| The two golds; no sales look | `design/art/art-bible.md` | §2 Defeat note; §4 Accent Gold and Heraldic Gold | Visual constraint |
| Card levels and what they give | `unit-cards-upgrades.md` (in design, session bb) | `card_level_max`; the buyer of F5 | Provisional |
| The race purchase and the owned set | Faction Collection & Unlocks (no GDD yet) | The buyer of F6 | Provisional |

## Acceptance Criteria

`qa-lead` lens applied (Lean mode, Section H). "Default data" is the economy data file with the values in Formulas; criteria that need other values use a fixture file, not numbers typed into the test. [Logic] criteria are automated unit tests; [Integration] criteria run with Save & Progress (and Stars & Rewards where named); [Config] is a check of the shipped data file.

**The wallet**
- **AC1 [Logic] (rules 1, 5; F1)**: GIVEN a fresh profile, THEN `gold_earned`, `gold_spent`, `diamonds_earned` and `diamonds_spent` are 0 and both balances are 0.
- **AC2 [Logic] (rules 6, 13)**: GIVEN a fresh profile, WHEN `add_currency(gold, 110)` is called, THEN it returns ok, `gold_earned` is 110, the gold balance is 110, the diamond totals are unchanged, and exactly one `currency_changed(gold, 110, +110)` is raised.
- **AC3 [Logic] (rule 6)**: GIVEN a gold balance of 110, WHEN `add_currency` is called with an amount of 0, −5 or 2.5, or with the currency `silver`, THEN each call returns refused, no total changes, each is logged and no event is raised.
- **AC4 [Logic] (rule 7; F1)**: GIVEN gold earned 1,050 and spent 900, WHEN `spend_currency(gold, 200)` is called, THEN it returns refused with `short`, no total changes and no event is raised; WHEN `spend_currency(gold, 100)` is called, THEN it returns ok, `gold_spent` is 1,000, the balance is 50 and `currency_changed(gold, 50, −100)` is raised.
- **AC5 [Logic] (rule 7, boundary)**: GIVEN a gold balance of 100, THEN `can_afford(gold, 100)` is true and `can_afford(gold, 101)` is false, and neither call changes a total; WHEN `spend_currency(gold, 100)` is called, THEN it returns ok and the balance is 0; WHEN `spend_currency(gold, 1)` follows, THEN it returns refused with `short`.
- **AC6 [Logic] (rule 7)**: GIVEN any balance, WHEN `spend_currency` is called with an amount of 0, −1 or 1.5, or with an unknown currency, THEN it returns refused with `invalid`, no total changes and the call is logged.
- **AC7 [Logic] (rule 8; F1 cap)**: GIVEN a fixture `balance_cap` of 1,000 and a gold balance of 950, WHEN `add_currency(gold, 100)` is called, THEN it returns ok, the balance is 1,000, the event's delta is +50 and the lost 50 is logged; WHEN `add_currency(gold, 10)` follows, THEN it returns ok, the balance stays 1,000 and no event is raised.
- **AC8 [Logic] (rule 4)**: GIVEN gold balance 500 and diamond balance 0, WHEN `spend_currency(diamonds, 1)` is called, THEN it returns refused with `short` and the gold balance is still 500; and the wallet's public calls are exactly `add_currency`, `spend_currency`, `can_afford`, `balance` and the five lookups (no call takes one currency and gives the other).
- **AC9 [Logic] (rules 5, 10)**: GIVEN the fixed call list in the test fixture (valid and invalid adds and spends on both currencies), WHEN the calls run in order, THEN no saved total is ever lower after a call than before it, and no balance is ever negative or above `balance_cap`.
- **AC10 [Logic] (double tap)**: GIVEN a gold balance of 150, WHEN `spend_currency(gold, 100)` is called twice in one frame, THEN the first returns ok, the second returns refused with `short`, and the balance is 50.

**Amounts and prices**
- **AC11 [Logic] (rule 11; F2)**: GIVEN default data, THEN `star_gold` is 100 and `win_gold` is 10 for each of gv-01 to gv-05; and for a fixture level in a region of `order` 2, 3, 4 and 5 they are 150 / 15, 200 / 20, 250 / 25 and 300 / 30.
- **AC12 [Logic] (F2 boundaries)**: GIVEN `replay_percent` 0, THEN `win_gold` is 0 for every level; GIVEN `region_star_gold` of 5 for `order` 1 and `replay_percent` 10, THEN `win_gold(gv-01)` is 0; GIVEN a fixture region of `order` 6 and the five default entries, THEN its levels' `star_gold` is 300 and the missing entry is logged.
- **AC13 [Logic] (F3)**: GIVEN default data and the Green Vale's five levels, THEN `level_gold_max` is 310 for each and `region_gold_max(gv)` is 1,550.
- **AC14 [Logic] (F4, F6)**: GIVEN default data and only the Green Vale holding levels, THEN `region_diamonds(gv)` is 50, `diamonds_available` is 50, `race_unlock_cost(beast)` is 50, and `race_unlock_cost(human)` and `race_unlock_cost` of an unknown id return none.
- **AC15 [Logic] (F5)**: GIVEN default data and `card_level_max` 5, THEN `card_upgrade_cost` for `to_level` 2, 3, 4 and 5 is 100, 200, 400 and 800 for `human_t1` (sum 1,500), 125, 250, 500 and 1,000 for `human_t2` (sum 1,875) and 150, 300, 600 and 1,200 for `human_t3` (sum 2,250); the beast's three cards cost the same as the human card of their tier; and `to_level` 1, `to_level` 6 and an unknown card id return none.
- **AC16 [Config] (E1–E5)**: GIVEN the shipped economy data file and the shipped campaign and race data, WHEN the game starts, THEN E1 to E5 all hold and no economy check is logged.
- **AC17 [Logic] (E1–E5, each failing)**: GIVEN a fixture with `replay_percent` 11 (E1), or `card_cost[2]` 120 (E2: 110 < 120), or `card_cost` 100 then 90, or `tier_cost_percent` 100, 90, 150 (E3), or `balance_cap` 9,999 against a 15,500 campaign (E4), or `race_cost[beast]` 60 or absent with one region holding levels (E5), WHEN the loader runs in a development build, THEN it reports an error naming the invariant; WHEN it runs as a shipped build, THEN the failing value is replaced by this GDD's default (for an absent `race_cost`: the race has no price and cannot be bought) and the replacement is logged.
- **AC18 [Logic] (a price change)**: GIVEN a saved profile with gold earned 500 and spent 300, WHEN it is loaded with a fixture where `card_cost[3]` is 400 instead of 200, THEN the totals are unchanged, the balance is 200 and `card_upgrade_cost(human_t1, 3)` is 400.

**Saving**
- **AC19 [Integration] (rules 5, 12)**: GIVEN a fresh profile, WHEN 310 gold is added, 100 gold is spent and 50 diamonds are added, the frame ends and the app is relaunched, THEN the totals are 310 / 100 / 50 / 0 and the balances are 210 gold and 50 diamonds.
- **AC20 [Integration] (rule 9)**: GIVEN a gold balance of 100 and a stub buyer holding a card at level 1, WHEN the buyer spends 100 and sets the card to level 2 in one frame and the frame ends, THEN one file write holds both `gold_spent` 100 and the card at level 2; GIVEN the same start, WHEN the process is stopped after the spend and before the end of the frame and the app is relaunched, THEN the gold balance is 100 and the card is at level 1.
- **AC21 [Logic] (rule 12, load checks)**: GIVEN a file with `gold_earned` 100 and `gold_spent` 250, WHEN it loads, THEN `gold_spent` is 100, the balance is 0 and the change is logged; GIVEN `diamonds_earned` −5, THEN it loads as 0; GIVEN `gold_earned` 2,000,000 and `gold_spent` 0, THEN `gold_earned` loads as 999,999. None of the three is treated as a damaged file.
- **AC22 [Integration] (rule 12, migration)**: GIVEN a UAT-1 save with gv-01 beaten and no `wallet` block, WHEN it is loaded by a build with this GDD's migration step and Stars & Rewards' step stubbed out, THEN the file is written back with a `wallet` block of four zeros and every level result unchanged; and the step's version number is lower than the Stars & Rewards step's.
- **AC23 [Integration] (rule 14)**: GIVEN gold earned 500 and spent 200, WHEN `delete_progress()` is confirmed, THEN all four totals are 0 in memory and in the next file written; GIVEN a read-only session, WHEN `add_currency(gold, 100)` is called, THEN the balance is 100 in memory and the file on disk is unchanged after the frame ends.

**With the rest of the game**
- **AC24 [Integration] (rule 3; E2; Stars & Rewards)**: GIVEN a fresh profile and default data, WHEN gv-01 is won for the first time meeting only the win goal, THEN the gold balance is 110 and `can_afford(gold, card_upgrade_cost(human_t1, 2))` is true; WHEN gv-01 is won again with no new goal, THEN the balance rises by exactly 10; WHEN gv-01 is lost or quit, THEN no total changes.
- **AC25 [Integration] (rule 3; F4, F6; Stars & Rewards)**: GIVEN default data and every Green Vale level beaten, WHEN the region's conquest is recorded for the first time, THEN the diamond balance is 50 and `can_afford(diamonds, race_unlock_cost(beast))` is true; WHEN the app is relaunched and the map is opened again, THEN the diamond balance is still 50.
- **AC26 [Integration] (pace check)**: GIVEN default data and a scripted profile that wins gv-01 to gv-05 once each meeting two goals, THEN gold earned is 1,050; WHEN it buys level 2 on the three human cards and level 3 on `human_t1` and `human_t2`, THEN five spends return ok and the balance is 225; WHEN it then asks for level 3 on `human_t3` (300), THEN the spend returns refused with `short`.
- **AC27 [Review] (rule 2)**: In the code, `spend_currency(gold, …)` is called only by Unit Cards & Upgrades and `spend_currency(diamonds, …)` only by Faction Collection & Unlocks; `add_currency` is called only by Stars & Rewards. Checked at code review, not by a test.

**Coverage check.** Rules 1 and 3–14 and formulas F1–F6 with E1–E5 have criteria above; rule 2 is a review check (AC27); rules 15 and 16 state scope and have none. The edge cases on closing mid-purchase, load checks, a missing table entry, a price change and a double tap are AC20, AC21, AC12, AC18 and AC10. Two edge cases have no criterion here because another GDD owns the behaviour: the old-save re-score (Stars & Rewards) and the conquest paid on the next open (World Map & Regions). The criteria for what the screens show are the screens' GDDs' to write.

## Open Questions

| # | Question | Owner | Target |
|---|----------|-------|--------|
| 1 | How many levels regions 2–5 hold. The campaign totals in F3 assume 5 each | Campaign Level Data, level-designer | When UAT-2 content is planned; re-run `/balance-check` then |
| 2 | Whether "the cheapest upgrade is always best" makes the choice too easy: the soldier card is the cheapest and, if a card level adds the same to every tier, gains the most per pawn. `tier_cost_percent` (100 / 125 / 150) is the lever | Unit Cards & Upgrades (session bb), then `/balance-check` | That GDD's Formulas; F5 is re-checked then |
| 3 | The prices of the elf, the spirit and the dragon. E5 caps their sum at what the regions pay | This GDD, with Factions | When each race is added as data |
| 4 | Hand-edited save files give free currency. Accepted offline with nothing sold | security-engineer | Before the store build |
| 5 | Sources and sinks after UAT: purchases, rewarded ads, a revive paid in gems, god power upgrades and the gold split | This GDD (amended), economy-designer | Store build planning |
| 6 | The coin and gem icons: colours that are neither of the two golds at rest nor the player's blue, and a gem that is not a slot dot | art-director | Art bible §5 onward, then `/asset-spec` |
| 7 | Whether `replay_percent` 10 is the right trickle, or farming replaces progress | Playtest | UAT-2 |
| 8 | Whether the World Map shows the two counters, or only the collection screens do | World Map & Regions UX spec | `/ux-design world-map` |
