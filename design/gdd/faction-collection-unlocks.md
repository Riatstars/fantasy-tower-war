# Faction Collection & Unlocks

> **Status**: Designed (pending review)
> **Author**: the player + Claude (design-system, lean)
> **Last Updated**: 2026-11-25
> **Last Verified**: 2026-11-25
> **Creative Director Review (CD-GDD-ALIGN)**: skipped — Lean mode
> **Implements Pillar**: 3. Paint the map, grow the army (`design/gdd/game-concept.md` § Pillars)

## Summary

Faction Collection & Unlocks keeps the player's collection of races: which they own, which one they lead, and the purchase that turns a locked race into theirs. A rare race is unlocked once, for good, by paying its price in diamonds; leading an owned race is free and can change between any two levels. It is what makes the diamonds from a conquered region show up as something in the army.

> **Quick reference** — Layer: `Feature` · Priority: `MVP (UAT-2)` · Key deps: `Factions, Currencies & Economy, Save & Progress` · Engine feasibility: not checked (no `scripting` reference under `docs/engine-reference/godot/modules/`)

## Overview

Faction Collection & Unlocks keeps the player's collection of races: which ones they own, which one they lead, and how a locked race is bought. Every race Factions defines is in the collection from the first launch, so a locked race is something the player can see and want before they can use it. A `starter` race is owned at once. A `diamonds` race is unlocked by paying its price in diamonds, once and for good; the price is the only condition (decided 2026-11-25). The player leads one owned race at a time and changes it freely between levels; unlocking a race does not change which one they lead (decided 2026-11-25). Underneath, the system is a small saved record (the races paid for and the race led) and four answers other systems rely on: is this race owned, which race is active, can this race be unlocked now, and the result of an unlock. It asks Currencies & Economy for the price and the spend, and Factions for the list of races. The player meets it on the Collection screen, as a card that changes from locked to theirs. Without it diamonds would have nothing to buy, and the beast would only ever be an opponent (Pillar 3: diamonds show as unlocked races).

## Detailed Design

### Core Rules

`game-designer`, `systems-designer` and `economy-designer` not consulted — Lean mode. Review manually before production.

1. **The collection is every loaded race.** It is the list Factions gives with `races()`, in `order`. For the player each race is in one of three states: Locked, Owned or Active (Factions, States and Transitions, defines what they mean; this GDD keeps them and moves a race between them).
2. **What is stored.** One named block in the progress file, `collection`, with two values: `unlocked`, the set of race ids the player has paid for, and `active`, one race id. `unlocked` only ever grows (Save & Progress rule 5). `active` is a choice, not progress: like the map position, the last value set is the one kept.
3. **Owning a race.** `is_owned(race)` is yes when the race is loaded and either its `unlock` is `starter` or its id is in `unlocked`. A `starter` race is never written to `unlocked`; it is owned because of its record. `human` is therefore owned from the first launch (Factions rule 3).
4. **The price is the only condition** (decided 2026-11-25). A locked race can be unlocked as soon as the player holds its price, in any order, whatever regions are conquered. The price is `race_unlock_cost(race_id)`, read from Currencies & Economy (its rule 11); this GDD states no price.
5. **`can_unlock(race)`** changes nothing and answers with one reason, tested in this order: `unknown` (no loaded race has this id), `owned` (already owned, a `starter` race included), `no_price` (Currencies & Economy gives no price of 1 or more for it), `short` (`can_afford(diamonds, cost)` is no), else `ok`. Screens use it for the state of the unlock button.
6. **`unlock(race)`** runs the test of rule 5. On any reason but `ok` nothing changes and the reason is returned. On `ok` it calls `spend_currency(diamonds, cost)`; if that returns ok it adds the id to `unlocked` in the same frame, reports the change to Save & Progress and raises `race_unlocked(race)`. If the spend is refused, nothing is added and the refusal is returned. The spend and the unlock reach the device in one write (Currencies & Economy rule 9; Save & Progress rule 6): the player never pays for a race they do not get, and never gets a race they did not pay for.
7. **An unlock is asked for twice.** A purchase is final (Currencies & Economy rule 10), so `unlock` is called only after the player has confirmed it in Screen Flow's confirmation box. The screen owns the box and its text; this GDD requires the step.
8. **Unlocking does not change the active race** (decided 2026-11-25). The new race becomes Owned; the player makes it Active with a tap on its card (Factions rule 10).
9. **`set_active(race)`** makes an owned race the active one. If the race is not owned or not loaded, nothing changes and the call returns refused. If it is already active, nothing changes and the call returns ok with no event. Otherwise `active` is set, the change is reported to Save & Progress and `active_race_changed(race)` is raised. It costs nothing and has no limit or cooldown. It is offered on the Collection screen only, which cannot be reached from a match; a change made while a match runs applies from the next match build (Factions rule 9).
10. **`active_race()` always returns a race the player owns.** It returns the stored `active` when that race is loaded and owned, and `human` otherwise. Exactly one race is Active at any time.
11. **Checking the block on load** (Factions rule 14 leaves the saved record to this GDD). An id in `unlocked` that names no loaded race is kept in the file and ignored, so a race removed by an update comes back owned if it returns (the policy of Save & Progress rule 10 for unknown level ids). An id of a `starter` race in `unlocked` is kept and has no effect. An `active` that is not loaded or not owned is replaced by `human`, logged, and saved with the next write. None of these is treated as damage.
12. **Ownership is never taken back.** A race the player paid for stays owned if its price later changes, if its record becomes `starter`, or if it is hidden and returns. No price difference is refunded or charged (Currencies & Economy rule 10).
13. **A race with no price cannot be unlocked.** If Currencies & Economy gives no price of 1 or more for a `diamonds` race, `can_unlock` answers `no_price`, the card stays locked and it is logged once per launch. Currencies & Economy's invariant E5 exists to prevent this; this rule says what the player sees if it happens anyway.
14. **The collection view.** `collection()` returns, for each loaded race in `order`: its id, its state, and for a Locked race its price and the answer of `can_unlock`. It is the one read the Collection screen needs; names, crests and trait text come from Factions.
15. **The rival is not bound by the collection.** The rival plays its region's race whether or not the player owns it (Factions rule 12), so the player may meet a race before unlocking it.
16. **Old saves.** This GDD adds one migration step (Save & Progress rule 9) that creates `collection` with `unlocked` empty and `active` `human`. It reads no other block and grants nothing, so its place among the UAT-2 steps does not matter.
17. **Delete progress and read-only sessions.** `delete_progress()` gives a fresh profile: `unlocked` empty, `active` `human`. In a session where Save & Progress refuses to write (its rule 9) unlocks and choices work in memory and are not kept, like the diamonds spent on them.
18. **Not this system's.** What a race is and does belongs to Factions; the price and the wallet to Currencies & Economy; the layout, the confirmation box and every animation to Collection & Upgrade Screens; card levels to Unit Cards & Upgrades. This system answers who the player owns, who they lead, and whether an unlock went through.

### States and Transitions

One state per race, for the player. Factions defines the meanings; this table is the transitions.

| From | To | Trigger | Guard | Effect |
|---|---|---|---|---|
| (first launch) | Active | A fresh profile | The race is `human` | `active` = `human` |
| (first launch) | Owned | A fresh profile | Any other `starter` race | None stored (rule 3) |
| (first launch) | Locked | A fresh profile | A `diamonds` race | None stored |
| Locked | Owned | `unlock(race)` | `can_unlock` is `ok` and the spend returns ok | Id added to `unlocked`; `race_unlocked` |
| Owned | Active | `set_active(race)` | The race is owned and not already active | `active` set; `active_race_changed`; the race that was Active becomes Owned |
| Active | Owned | `set_active` of another race, or the load check of rule 11 | Another owned race takes its place (`human` in rule 11) | As above |
| Owned or Active | Locked | `delete_progress()` only | A `diamonds` race | Block reset (rule 17) |

There is no direct Locked → Active transition (rule 8) and no other way back to Locked (rule 12). A race that is not loaded has no state and is not listed.

### Interactions with Other Systems

**Direction rule.** This system calls Factions, Currencies & Economy and Save & Progress. Screens and Unit Cards & Upgrades call it or listen to its two events; it never calls a screen.

| System | Direction | Data | Interface owner |
|---|---|---|---|
| Factions | in/out | In: `races()`, each race's id, `order` and `unlock`. Out: `is_owned(race)`, `active_race()` | Factions owns the records and the meaning of the states; this GDD owns the owned set, the active race and both answers |
| Currencies & Economy | in | `race_unlock_cost(race_id)`, `can_afford(diamonds, cost)`, `spend_currency(diamonds, cost)` | Currencies & Economy owns the price and the spend; this GDD owns the purchase and what it gives |
| Save & Progress | both | Out: the `collection` block on every unlock and every change of active race; one migration step. In: the block on load | Save & Progress owns the file and the flush; this GDD owns the block's shape and its check |
| Collection & Upgrade Screens (no GDD yet, provisional) | out/in | Out: `collection()`, `can_unlock`, `race_unlocked`, `active_race_changed`. In: `unlock(race)` after a confirmed choice, `set_active(race)` | That GDD owns the layout and the confirmation; this GDD owns the calls and their results |
| Screen Flow & Scene Manager | (through the screen) | Its confirmation box, with an unlock text | Screen Flow owns the box; the screen asks for it |
| Unit Cards & Upgrades (no GDD yet, provisional) | out | `is_owned(race)`, if that GDD limits upgrades to owned races | Unit Cards & Upgrades decides; this GDD only answers |
| Stars & Rewards | none direct | It pays the diamonds this system spends, through the wallet | Currencies & Economy sits between them |

## Formulas

`systems-designer` lens (with the costs checks) applied by the author (Lean mode: Section D is a high-risk section). This system owns no price. Its formulas are one value the screen shows and two checks on the numbers Currencies & Economy owns. Approved by the player, 2026-11-25.

### F1. Unlock shortfall

The unlock_shortfall formula is defined as:

`unlock_shortfall = max(0, race_unlock_cost − balance)`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| race_unlock_cost | int, diamonds | ≥ 1 | data file (Currencies & Economy) | The price of the locked race |
| balance | int, diamonds | 0–999,999 | calculated (Currencies & Economy F1, for `diamonds`) | What the player holds |

**Output Range:** 0 to `race_unlock_cost`. It is 0 exactly when `can_afford(diamonds, race_unlock_cost)` is yes, so it never disagrees with `can_unlock`. It is defined only for a Locked race with a price; a race with no price shows no number (rule 13).
**Example:** price 50 and balance 30 → 20 ("20 more"); balance 50 → 0; balance 80 → 0.

### F2. Collection reach

The collection_reach formula is defined as:

`collection_reach = diamonds_total − collection_cost`, where `diamonds_total` is the sum of `region_diamonds` over every loaded region and `collection_cost` is the sum of `race_unlock_cost` over every loaded `diamonds` race

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| region_diamonds | int, diamonds | ≥ 0; placeholder 50 | data file (Currencies & Economy) | Diamonds paid once for conquering a region |
| race_unlock_cost | int, diamonds | ≥ 1 | data file (Currencies & Economy) | The price of each `diamonds` race |
| regions | int | 1 in the UAT build | data file (Campaign Level Data) | The loaded regions the first sum runs over |
| diamonds races | int | 0 to `races_max` − 1 (4); 1 in the UAT build | data file (Factions) | The loaded races the second sum runs over |

**Output Range:** any whole number. A value of 0 or more is the diamonds left when every race is owned and every region conquered; a negative value is the number of diamonds the campaign cannot supply. It is a design check made once at app start, not a value shown in play.
**Example:** the UAT build with the placeholder: one region paying 50 and a beast price of 50 → 50 − 50 = 0. A beast price of 40 → 10 left over. A beast price of 60 → −10, and the beast could never be owned.

### Invariants (checked at app start, after Currencies & Economy's loader)

- **C1.** If at least one `diamonds` race is loaded, the lowest `race_unlock_cost` among them is no more than the `region_diamonds` of the region with `order` 1. Conquering the first region always buys a race (the player's decision, 2026-11-25: the beast is the reward for conquering Green Vale).
- **C2.** `collection_reach ≥ 0`. Diamonds have one source and no conversion (Currencies & Economy rules 3 and 4), so a negative value means a race the player sees and can never own.

A development build reports a breach as one error naming the check and the values. A shipped build logs it and changes nothing: this system does not own the prices and never alters them.

### Boundary findings

- **A price of 0 or less** is not a price: `can_unlock` answers `no_price` (rule 13). A race meant to be free is a `starter` race.
- **No `diamonds` race loaded**: C1 does not apply, C2 passes, and every diamond is left over with nothing to buy.
- **No region pays diamonds**: `diamonds_total` is 0, and any `diamonds` race fails C1 and C2.
- **A price above `balance_cap`** (999,999) could never be afforded; C2 fails first for any realistic campaign.
- **The UAT build**: with one region and one `diamonds` race, C1 and C2 are the same test, beast price ≤ Green Vale's diamonds. Any price below the reward leaves diamonds that buy nothing in the UAT build.
- **Recommendation to Currencies & Economy** (its number, not this GDD's): set the beast's price equal to Green Vale's `region_diamonds`, so one region reads as one race and the counter ends at 0.

### Feedback loop

None. Owning or leading a race earns no diamonds, so an unlock never speeds the next one. A stronger race may win stars sooner, which pays gold; that loop is Stars & Rewards' and Unit Cards & Upgrades'.

## Edge Cases

`systems-designer` not consulted — Lean mode. Review manually before production.

- **If `unlock` is called twice for the same race in one frame** (a double tap): the first call spends and unlocks; the second answers `owned` and spends nothing.
- **If the balance equals the price exactly**: the unlock succeeds and the balance is 0.
- **If `can_unlock` was `ok` but the spend is refused**: nothing is added to `unlocked`, the refusal is returned and logged. A race is never owned without a spend that returned ok.
- **If `unlock` is called for a `starter` race or a race already owned**: `owned`; nothing changes.
- **If `unlock` or `set_active` is called with an id no loaded race has**: `unknown` (or refused for `set_active`), logged; nothing changes.
- **If `set_active` is called for a Locked race**: refused; the active race is unchanged.
- **If the app closes while the confirmation box is open**: nothing was bought; the box is not restored.
- **If the write after an unlock fails**: the spend and the unlock stay in memory together and are written by the next flush (Save & Progress rule 7). If the app closes first, both are lost together: the player has their diamonds and a locked race, never one without the other.
- **If the price in the data changes between two launches**: the price charged is the one read inside `unlock` at that moment. A race already owned is not charged or refunded (rule 12).
- **If a race the player paid for is missing from the data** (removed, or Factions' shipped fallback has replaced the list with the human alone): it is not listed, its id stays in `unlocked`, and if it was active the active race becomes `human` (rule 11). If it returns it is Owned again, not Active, and nothing is charged.
- **If a `diamonds` race becomes `starter` in an update**: every player owns it. A player who paid keeps it and gets no refund (rule 12).
- **If a `starter` race other than `human` becomes `diamonds` in an update**: a player who never paid finds it Locked, and if it was active the active race becomes `human`. This breaks "never returns to Locked", so it is a content rule: a shipped `starter` race is never changed to `diamonds`.
- **If a `diamonds` race has no price**: it stays Locked with no price shown, `can_unlock` answers `no_price`, and one log line per launch names the race (rule 13).
- **If C1 or C2 fails in a shipped build**: it is logged and play continues. The player sees a locked race whose price they cannot yet, or cannot ever, reach.
- **If every race is owned**: no card offers an unlock. Diamonds earned later are kept and shown, with nothing to buy until a new race or a new sink ships (Open Questions).
- **If a UAT-1 save is loaded**: the migration creates an empty collection (rule 16). Stars & Rewards' own step pays the diamonds of any region already conquered (its rule 10), so a tester who had conquered Green Vale can unlock the beast on the first visit to the Collection screen.
- **If the session is read-only** (a save from a newer version): unlocks and choices work in memory and are gone at the next launch, together with the diamonds they spent.
- **If Delete progress is confirmed**: the wallet and the collection are emptied together; the beast is Locked again and `human` is active.
- **If the active race is changed while a match is running** (a development tool): the match keeps its race; the next match build, a retry included, uses the new one (Factions rule 9).
- **If the player changes race before every level**: intended; switching is free (Factions, Edge Cases).

## Dependencies

Factions, Save & Progress, Campaign Level Data and Screen Flow & Scene Manager have complete GDDs. Currencies & Economy is in design in another session (Overview and Detailed Design written, no amounts yet), so its contract is provisional. Collection & Upgrade Screens and Unit Cards & Upgrades have no GDD content yet. Statuses are the systems index's on 2026-11-25.

| System | Nature | Direction | What this GDD needs or gives | GDD status |
|---|---|---|---|---|
| Factions | Hard | in/out | In: `races()` with each `unlock` and `order`; the meaning of Locked, Owned, Active. Out: `is_owned(race)`, `active_race()` | Designed, not reviewed |
| Currencies & Economy | Hard | in | `race_unlock_cost(race_id)`, `can_afford`, `spend_currency(diamonds, cost)`, `balance(diamonds)`, `region_diamonds(region_id)` for F2; no price given for a race must be tellable from a price | **In design: provisional** |
| Save & Progress | Hard | both | The `collection` block, one migration step, the flush at the end of the frame | Approved |
| Campaign Level Data | Soft | in | The loaded regions and which has `order` 1, for C1 and F2 | Approved |
| **Depended on by** | | | | |
| Collection & Upgrade Screens | Hard | out/in | `collection()`, `can_unlock`, `unlock`, `set_active`, both events, `unlock_shortfall` | Not designed |
| Screen Flow & Scene Manager | Soft | (through the screen) | Its confirmation box with an unlock text | Approved |
| Unit Cards & Upgrades | Soft | out | `is_owned(race)`, if upgrades are limited to owned races | Not designed (skeleton only) |
| Factions | Hard | out | Listed above: it reads `is_owned` and `active_race` at match build | Designed, not reviewed |

**Bidirectional check.** Factions names this GDD (rule 11, States, Interactions, Dependencies, AC13, AC19). Currencies & Economy names it (rules 2, 9, 11, 15, Interactions). Save & Progress names it (rule 3, Interactions, Dependencies). Stars & Rewards names it as a spender (Dependencies). Campaign Level Data and Screen Flow & Scene Manager do not name it yet; the edits they need are under Cross-References. The systems index lists Factions, Currencies & Economy and Save & Progress as this system's dependencies; Campaign Level Data (soft) should be added.

## Visual/Audio Requirements

`art-director` not consulted — Lean mode (the system draws nothing itself). Review manually before production. From art bible §1 (splash art is the payoff).

- **This system draws and plays nothing.** It raises `race_unlocked` and `active_race_changed`; Collection & Upgrade Screens shows them.
- **A locked race is shown, not hidden.** Its card has the crest and name (Factions, Visual/Audio) in a locked treatment that still reads as that race, so the player knows what they are saving for.
- **The unlock is a payoff moment.** Art bible §1 makes splash art the reward off the table: the unlock should reveal the race's splash art, not only swap a padlock for a tick. The art itself is specified with the Collection screen.
- **Audio** (after UAT, Audio GDD): one sting for an unlock, a lighter one for choosing a race to lead.

📌 **Asset Spec** — no asset of its own. The locked and owned card treatments and the unlock reveal belong to `/asset-spec system:collection-upgrade-screens`; crests to `system:factions`.

## Game Feel

- **The price is a goal the player can count.** A locked card always says how many diamonds are missing (F1), so each conquered region visibly closes the gap.
- **One region, one race.** With the recommended price, conquering Green Vale pays exactly the beast: the reward on the map and the unlock in the collection read as one event in two places (Pillar 3).
- **A deliberate purchase.** The confirmation makes the unlock a decision; after Yes the card changes at once, in the same frame as the counter.
- **Leading is a separate, free choice.** Nothing changes in the army until the player taps the new race, and they can change back at any time.
- **Playtest questions for UAT-2** (not acceptance criteria): after conquering Green Vale, do testers find the Collection screen without being told? Do they unlock the beast, and then lead it in a replay?

## UI Requirements

Collection & Upgrade Screens owns the layout. This GDD requires the following on it.

- **One card per race**, in `order`, in one of three looks: Locked, Owned, Active (from `collection()`).
- **A Locked card** shows the price and an unlock button whose state follows `can_unlock`: `ok` → enabled; `short` → disabled, with "N more" from `unlock_shortfall`; `no_price` → no price and no button.
- **The confirmation** is Screen Flow's confirmation box with the text "Unlock the [race name] for [price] diamonds? This cannot be undone." Yes calls `unlock`; No is the default, matches Back and changes nothing.
- **An Owned card** has a Lead action (one tap, `set_active`); the Active card shows the active marker and no action.
- **The diamond counter** on the screen follows `currency_changed` (Currencies & Economy) and drops in the same frame the card becomes Owned.
- **Nothing in a match and nothing on a level's start panel** comes from this system.

> **📌 UX Flag — Faction Collection & Unlocks**: this system has UI requirements. Run `/ux-design` for the Collection screen before writing epics; stories that touch the UI should cite `design/ux/[screen].md`, not this GDD.

## Cross-References

| This GDD relies on | In | What it relies on |
|---|---|---|
| Factions | Rules 1, 3, 9–12, 14; States and Transitions | The race records and `races()`; the three states; one active race; the rival's race is independent of ownership |
| Currencies & Economy | Rules 3, 4, 7, 9, 10, 11; F1 (balance); E5 | `race_unlock_cost`, `can_afford`, `spend_currency`; one write for a purchase; no refunds; diamonds have one source |
| Save & Progress | Rules 3, 5, 6, 7, 9, 10, 11 | Named blocks; progress only grows; flush at the end of the frame; migration steps; unknown ids kept; Delete progress |
| Stars & Rewards | Rules 7 and 10 | Diamonds paid once per region, and to an old save in its migration step |
| Campaign Level Data | The region records and their `order` | Which region is first; how many regions pay diamonds |
| Screen Flow & Scene Manager | UI Requirements (confirmation box) | One confirmation box, Yes and No, No as the default |
| design/art/art-bible.md | §1 | Splash art is the payoff |
| game-concept.md | Pillar 3; § Army | Diamonds show as unlocked races |

**Edits other documents need as a result of this GDD** (none applied; each is another session's document or waits for the player's approval):

1. `factions.md` (session 39): rule 11, the Interactions row and the Dependencies row for this GDD are no longer provisional; the edge case "the saved active race is not owned" is settled by rule 11 here (replaced by `human` and saved with the next write).
2. `currencies-economy.md` (session 7a): the rows for this GDD are no longer provisional; add the two requirements C1 and C2 on `race_unlock_cost` and `region_diamonds`, and the recommendation that the beast's price equals Green Vale's `region_diamonds`; `race_unlock_cost` must let a caller tell "no price" from a price.
3. `save-progress.md`: name the `collection` block (`unlocked`, `active`) and its migration step among the UAT-2 blocks.
4. `screen-flow-scene-manager.md`: the confirmation box is also used for an unlock, with the text in UI Requirements.
5. `campaign-level-data.md` (session 7a): name this GDD as a reader of the region list and its `order` (soft).
6. `design/registry/entities.yaml` (session 7a): register the formulas `unlock_shortfall` and `collection_reach`; add this GDD to `referenced_by` of `race_unlock_cost`, `region_diamonds`, `balance_cap` and `races_max` once those are registered.
7. `systems-index.md`: row 24 → Designed, with the GDD link; add Campaign Level Data (soft) to its dependencies.

## Acceptance Criteria

Test data unless a criterion says otherwise: the two shipped races (`human` `starter`, `beast` `diamonds`), one region (Green Vale, `order` 1) with `region_diamonds` 50, and a beast price of 50. These are fixture values set by the tests, so no criterion depends on the amounts Currencies & Economy finally ships. Tags: **[Logic]** automated test in `tests/unit/`; **[Integration: X]** in `tests/integration/`; **[UI]** retained screenshot in `production/qa/evidence/`. `qa-lead` lens applied by the author (Lean mode: Section H is a high-risk section).

- **AC1 [Logic] (rules 1–3, 14)**: GIVEN a fresh profile, THEN `collection()` returns `human` Active and `beast` Locked with price 50, in that order; `is_owned(human)` is yes, `is_owned(beast)` is no, `active_race()` is `human`, and the stored `unlocked` is empty.
- **AC2 [Logic] (rule 5, order of reasons)**: GIVEN a fresh profile, THEN `can_unlock` answers `unknown` for `orc`, `owned` for `human`, `no_price` for `beast` when no price is given, `short` for `beast` at a balance of 49 and `ok` at a balance of 50; after all five calls the balance and the stored block are unchanged.
- **AC3 [Integration: Currencies & Economy] (rules 6, 8)**: GIVEN a balance of 50 diamonds, WHEN `unlock(beast)` is called, THEN it returns ok, the balance is 0, `is_owned(beast)` is yes, `race_unlocked(beast)` is raised once, `currency_changed(diamonds, 0, −50)` is raised once, and `active_race()` is still `human`.
- **AC4 [Logic] (rule 6, refused)**: GIVEN a balance of 49, WHEN `unlock(beast)` is called, THEN it returns `short`, the balance is 49, `beast` is Locked and no event is raised.
- **AC5 [Logic] (double call)**: GIVEN a balance of 100, WHEN `unlock(beast)` is called twice in one frame, THEN the first returns ok and the second `owned`, the balance is 50 and `race_unlocked` is raised once.
- **AC6 [Logic] (rule 6, spend refused)**: GIVEN a stub wallet whose `can_afford` answers yes and whose `spend_currency` returns refused, WHEN `unlock(beast)` is called, THEN the refusal is returned, `is_owned(beast)` is no and no event is raised.
- **AC7 [Integration: Save & Progress] (rule 6, one write)**: GIVEN a balance of 50, WHEN `unlock(beast)` is called and the frame ends, THEN exactly one write happens and the file holds both `diamonds_spent` 50 and `beast` in `unlocked`; WHEN the app is restarted, THEN the beast is Owned and the balance is 0. GIVEN the same unlock with a write that fails, WHEN the app is restarted from the earlier file, THEN the balance is 50 and the beast is Locked.
- **AC8 [Logic] (rules 9, 10, 14)**: GIVEN the beast Locked, WHEN `set_active(beast)` is called, THEN it returns refused, `active_race()` is `human` and no event is raised. GIVEN the beast Owned, WHEN `set_active(beast)` is called, THEN `active_race()` is `beast`, `active_race_changed(beast)` is raised once and `collection()` shows `beast` Active and `human` Owned; WHEN it is called again, THEN it returns ok, no event is raised and no change is reported to Save & Progress.
- **AC9 [Integration: Factions] (rules 9, 10)**: GIVEN `active_race()` is `beast`, WHEN a match is built, THEN `race_of(player)` is `beast`; WHEN `set_active(human)` is called while that match runs, THEN `race_of(player)` is still `beast` until the match ends, and `human` in the next match built.
- **AC10 [Logic] (rule 11)**: GIVEN a save whose `active` is `beast` and whose `unlocked` is empty, WHEN it loads, THEN `active_race()` is `human`, one log line says so, and the next write stores `human`. GIVEN a save whose `unlocked` holds `beast` and `orc` (not loaded), THEN `beast` is Owned, `collection()` lists no `orc`, and after a write the file still holds `orc`.
- **AC11 [Logic] (rules 11, 12, a race missing from the data)**: GIVEN a save with `beast` in `unlocked` and `active` `beast`, WHEN it loads with race data that has only `human`, THEN `collection()` lists `human` alone and `active_race()` is `human`; WHEN it loads again with the beast back in the data, THEN `beast` is Owned and not Active, and the balance is unchanged.
- **AC12 [Logic] (rule 12, data changes)**: GIVEN a save with `beast` in `unlocked`, WHEN the beast's price in the data is changed to 80, THEN the beast is Owned and the balance is unchanged; WHEN the beast's record is changed to `starter`, THEN it is Owned and the balance is unchanged.
- **AC13 [Logic] (rule 13)**: GIVEN no price for `beast`, WHEN `can_unlock(beast)` is called three times in one launch, THEN each answers `no_price`, the card data has no price and exactly one log line names `beast`.
- **AC14 [Logic] (rule 4, any order)**: GIVEN test data with two `diamonds` races, `beast` (`order` 2, price 50) and `elf` (`order` 3, price 50), and a balance of 50, WHEN `unlock(elf)` is called first, THEN it returns ok and `beast` is still Locked.
- **AC15 [Logic] (rule 16, migration)**: GIVEN a progress file from before this block with three levels beaten, WHEN it loads, THEN the file has a `collection` block with `unlocked` empty and `active` `human`, and every other block is unchanged.
- **AC16 [Integration: Stars & Rewards, Currencies & Economy] (rule 16, old save)**: GIVEN a UAT-1 save with Green Vale conquered, WHEN it loads in a UAT-2 build, THEN the balance is 50 diamonds and `can_unlock(beast)` answers `ok`.
- **AC17 [Logic] (rule 17)**: GIVEN the beast Owned and Active, WHEN `delete_progress()` runs, THEN the beast is Locked, `active_race()` is `human` and the balance is 0. GIVEN a read-only session with a balance of 50, WHEN `unlock(beast)` is called, THEN it returns ok and the beast is Owned in that session, no file is written, and after a restart the beast is not owned in the fresh in-memory profile.
- **AC18 [Logic] (F1)**: GIVEN a price of 50, THEN `unlock_shortfall` is 50 at a balance of 0, 20 at 30, 0 at 50 and 0 at 80.
- **AC19 [Logic] (F2, C1, C2)**: GIVEN one region paying 50 and a beast price of 50, THEN `collection_reach` is 0 and both checks pass. GIVEN a beast price of 51, THEN `collection_reach` is −1, a development build reports one error naming C1 and C2 with the values 51 and 50, and a shipped build logs both, still charges 51 and keeps running. GIVEN two regions paying 50 each and two `diamonds` races priced 30 and 80, THEN C1 passes and C2 fails with `collection_reach` −10. GIVEN no `diamonds` race, THEN both checks pass.
- **AC20 [Integration: Factions] (rule 15)**: GIVEN the beast Locked and a region whose `rival_race` is `beast`, WHEN a match is built, THEN `race_of(rival)` is `beast`.
- **AC21 [UI] (rule 7, UI Requirements)**: retained screenshots in `production/qa/evidence/` show the Collection screen with (a) the beast card Locked at a balance of 30, reading "20 more" with the button disabled; (b) Locked at a balance of 50 with the button enabled; (c) the confirmation box naming the race and the price; (d) after Yes, the beast card Owned and the diamond counter at 0; (e) after Lead, the beast card Active and the human card Owned. GIVEN the confirmation box, WHEN No or Back is chosen, THEN the balance and the card are unchanged.

**Coverage check.** Rules 1–3 and 14: AC1. Rule 4: AC14. Rule 5: AC2. Rule 6: AC3–AC7. Rule 7: AC21. Rule 8: AC3. Rules 9 and 10: AC8, AC9. Rule 11: AC10, AC11. Rule 12: AC11, AC12. Rule 13: AC13. Rule 15: AC20. Rule 16: AC15, AC16. Rule 17: AC17. F1: AC18 (typical 30, boundaries 0, 50 and above). F2 with C1 and C2: AC19 (boundary 50 and 51). Cross-system: AC3, AC7, AC9, AC16, AC20. Not covered by a criterion: rule 18 (a statement of scope); the edge case of a `starter` race changed to `diamonds` (a content rule); that the checks run after Currencies & Economy's loader; the app closing while the confirmation is open. Feel statements are playtest questions in Game Feel, not criteria.

## Open Questions

| # | Question | Owner | Resolve by |
|---|----------|-------|------------|
| 1 | The beast's price and Green Vale's `region_diamonds` are not set. This GDD requires price ≤ reward (C1) and recommends they are equal | Currencies & Economy (session 7a) | Its Formulas section, before the UAT-2 build |
| 2 | What do diamonds buy once every race is owned? In the UAT build any diamond above the beast's price buys nothing | economy-designer | With the first post-UAT sink or the third race |
| 3 | May the player upgrade the cards of a race they do not own? This GDD only supplies `is_owned` | Unit Cards & Upgrades (session bb) | That GDD's Detailed Design |
| 4 | How does the player learn that a race has become affordable (a mark on the Collection entry after the conquest sequence)? | ux-designer; Collection & Upgrade Screens, World Map & Regions | `/ux-design` for the Collection screen |
| 5 | Should the unlock moment offer "Lead now?" as a shortcut? The rule stays that an unlock alone changes nothing (rule 8) | ux-designer | `/ux-design` for the Collection screen |
| 6 | With three or more `diamonds` races, should prices rise with `order`, and should C1 and C2 become stricter (one race per region)? | economy-designer | When the third race is added |
| 7 | The schema version number of this GDD's migration step, and whether C1 and C2 run in this system's loader or in Currencies & Economy's | technical-director | Architecture (`/create-architecture`) |
