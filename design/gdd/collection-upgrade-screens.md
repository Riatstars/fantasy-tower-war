# Collection & Upgrade Screens

> **Status**: Designed (2026-11-26, pending /design-review in a fresh session)
> **Author**: user + Claude
> **Last Updated**: 2026-11-26
> **Last Verified**: 2026-11-26
> **Creative Director Review (CD-GDD-ALIGN)**: skipped — Lean mode
> **Implements Pillar**: 3. Paint the map, grow the army (`design/gdd/game-concept.md` § Pillars)

## Summary

Collection & Upgrade Screens is the one screen where the player sees and grows their army between levels. It shows every race as a card (locked, owned or leading), the selected race's three unit cards with their levels, and the gold and diamond counters; from it the player unlocks a race, chooses the race to lead and upgrades unit cards. It owns the layout, the text and the moments, and no data: every number and every result comes from Faction Collection & Unlocks, Unit Cards & Upgrades and Currencies & Economy.

> **Quick reference** — Layer: `Presentation` · Priority: `MVP` (UAT-2) · Key deps: `Faction Collection & Unlocks, Unit Cards & Upgrades, Currencies & Economy`

## Overview

Collection & Upgrade Screens is a single screen, the Collection, opened from a button on the World Map (decided 2026-11-26: one screen, not two). A row of race cards runs across the top; below it sit the selected race's trait and action, and its three unit cards. The player does three things here: unlocks a locked race with diamonds, after a confirmation and with a splash-art reveal; chooses which owned race to lead, with one tap; and upgrades a unit card with gold, with one tap and no confirmation. Underneath, the screen is a reader: it asks three systems what to show, passes the player's taps to them as calls, and redraws when they raise an event. It keeps no copy of a balance, a level or an owned race, and it saves nothing. It also answers one question for the World Map: whether the Collection button should carry a mark because a race has become affordable. This is where Pillar 3 is paid out: gold shows as card levels and diamonds as an unlocked race. Without this screen the army layer would have rules and prices and no way for the player to use them.

## Detailed Design

### Core Rules

`game-designer`, `ux-designer`, `ui-programmer`, `art-director` and `technical-artist` not consulted — Lean mode. Review manually before production.

1. **Scope.** This GDD draws one screen, the Collection: the race cards, the selected race's panel, the unit cards, the two currency counters and the unlock reveal. It uses Screen Flow's confirmation box for an unlock; Menus & Screens draws that box. It owns no data and no saved state. Prices and balances are Currencies & Economy's; which races are owned and which is led are Faction Collection & Unlocks'; card levels and veteran rates are Unit Cards & Upgrades'; names, crests and trait text are Factions'; unit stats are Unit Roster & Stats'.
2. **Entry and exit.** The Collection is reached only from the World Map's Collection button, and Back returns to the World Map. Back is the screen's visible Back control, the phone's Back button or Esc on a computer (Screen Flow rule 6). It cannot be reached from a Level or from any overlay. Screen Flow owns the transitions; this GDD asks for them (Cross-References).
3. **Four regions, top to bottom**: the top bar (Back, the title "Collection", the gold counter, the diamond counter); the race row; the race panel; the unit cards. Sizes are data (F4).
4. **The race row** has one race card per entry of `collection()` (Faction Collection & Unlocks rule 14), in that order. A race card shows the race's crest and name and one of three looks: Locked (a padlock and the price), Owned, or Active (the leading marker). The row shows `races_visible` cards (3 at baseline, F4); with more races it scrolls sideways, and the selected card is always scrolled into view.
5. **Selection.** Exactly one race is selected at any time. When the screen opens it is the active race (`active_race()`). A tap on a race card selects that race; any race can be selected, a Locked one included. Selecting changes nothing that is saved, costs nothing and is forgotten when the screen closes.
6. **The race panel** shows the selected race's name, its trait's name and its trait description, built from the data values and never typed as fixed text (Factions UI Requirements). It has one action slot, filled from the race's state and `can_unlock(race)`:

   | Race state | `can_unlock` | The slot shows |
   |---|---|---|
   | Locked | `ok` | The diamond icon and the price; the **Unlock** button, enabled |
   | Locked | `short` | The diamond icon and the price; **Unlock** disabled; "N more" with N from `unlock_shortfall` |
   | Locked | `no_price` | No price and no button; the line "Not available yet" |
   | Owned | `owned` | The **Lead** button (primary) |
   | Active | `owned` | The leading marker and the line "Leading"; no button |

7. **Unlocking.** A tap on an enabled Unlock asks Screen Flow for its confirmation box with Faction Collection & Unlocks' text ("Unlock the [race name] for [price] diamonds? This cannot be undone."). No is the default and matches Back; No or Back closes the box and nothing else happens. Yes calls `unlock(race)` exactly once. On ok the reveal plays (rule 8). On any refusal the box closes, nothing changes, and the panel is redrawn from `can_unlock`, whose answer now shows why (a short balance reads "N more"). A refusal never opens an error box.
8. **The reveal.** When `race_unlocked(race)` is raised while the Collection is the current screen, the race's splash art fills the screen for `reveal_time` (2.0 s) and then gives the screen back. Any tap, or Back, ends it at once; Back during a reveal ends the reveal and does not leave the screen. While it plays no other control acts. Afterwards the race is still selected, its card is Owned and Lead is the primary action. The unlock is saved before the reveal starts, so closing the app during it loses nothing. The reveal never changes the active race (decided 2026-11-26: reveal, then stay; Faction Collection & Unlocks rule 8).
9. **Leading.** A tap on Lead calls `set_active(race)`: one tap, no confirmation, no cost. On `active_race_changed` the leading marker moves to the new race's card in the same frame and the old one becomes Owned.
10. **The unit cards** are the selected race's three cards in tier order: soldier, rider, summon. Each shows the unit's figure, its name, its tier, its speed as a bar (F1), its strength as icons (F2), its level as `card_level_max` pips (5), the veteran mark as it appears on the table, the veteran lines (rule 11) and one action slot:

   | Card state (Unit Cards & Upgrades) | Gold | The slot shows |
   |---|---|---|
   | Locked | any | No button; the line "Unlock the [race name] to upgrade" |
   | Upgradable | `can_afford` yes | The **Upgrade** button, enabled, with the gold icon and the next level's cost |
   | Upgradable | `can_afford` no | Upgrade greyed, the cost still shown, and "N more" with N from F5 |
   | Maxed | any | "Max"; no cost and no button |

11. **The veteran lines** are built from `veteran_every` at the card's level and at the next one, never typed as fixed text. A value of 0 reads "No veterans yet"; any other value N reads "A veteran every Nth". The second line reads "Next level: every Nth". A Maxed card has no second line. A Locked card shows both lines for level 1 and level 2, so the player sees what the race would give.
12. **Upgrading.** One tap on an enabled Upgrade issues exactly one `upgrade_card(card_id)` (decided 2026-11-26; this closes Unit Cards & Upgrades' Open Question 5). There is no confirmation and no hold-to-repeat. After a tap that Upgrade button ignores further taps for `upgrade_lock_time` (0.3 s), so a double tap buys one level, not two. On ok the new pip fills and the flare plays in the frame of the tap; on a refusal nothing plays and the card is redrawn from its state.
13. **The counters.** Gold and diamonds each show as an icon and a number, in Currencies & Economy's format (the full balance with a thousands separator, six digits at most). They are read from `balance(currency)` when the screen opens and updated only from `currency_changed`.
14. **Redraw on events.** `currency_changed`, `card_upgraded`, `race_unlocked` and `active_race_changed` each redraw what they affect in the frame they arrive: counters, button states, "N more" lines, pips, card looks. The screen holds no copy of a balance, a level or an owned set between frames.
15. **The map mark.** `collection_badge()` answers yes or no (F3): yes when at least one race answers `can_unlock` = `ok` and has not been seen in that state. "Seen" is a list of race ids kept in memory only: it is empty at each app start and is never saved (so a mark returns after a restart until the Collection is opened once). Opening the Collection adds every race that is `ok` at that moment. The World Map draws the mark on its Collection button and asks again whenever the map is shown and when its conquest sequence ends (the moment diamonds arrive). Card upgrades never light the mark (decided 2026-11-26: a race unlock only).
16. **Text.** Every string comes from the strings data file with room for 30% expansion (Menus & Screens rule 10). This GDD owns these keys and their draft wording: the title "Collection"; "Lead"; "Leading"; "Unlock"; "Upgrade"; "Max"; "N more"; "Not available yet"; "Unlock the [race name] to upgrade"; "No veterans yet"; "A veteran every Nth"; "Next level: every Nth"; and the three tier names (soldier, rider, summon). Unit names are keyed by kind id (`human_t1` and so on); race and trait names are Factions'; the confirmation text is Faction Collection & Unlocks'. The writer owns the final wording.
17. **Layout and input.** Everything lays out inside the 720 × 1,280 portrait frame and the display's safe area (Menus & Screens rule 11). Every button and every race card is at least the touch minimum, 96 px across (Touch & Mouse Input I1). Unlock, Lead and Upgrade are primary buttons when enabled; Back is secondary (Menus & Screens rule 9). When the content is taller than the safe area, everything below the race row scrolls up and down; the top bar and the race row stay in place (F4). The controls are the engine's UI controls; Touch & Mouse Input does not route them. Nothing on this screen depends on hover.
18. **Data.** Timings and sizes are data (`collection.tres`, F4 and the timings table); strings are the strings file's. Nothing is hardcoded.

### States and Transitions

The screen has only presentation states; Screen Flow's table is the authority for moving between screens.

| State | Meaning | Enter when | Leave when |
|---|---|---|---|
| Opening | Behind the transition cover; reads `collection()`, the cards and both balances; marks affordable races as seen (rule 15) | Screen Flow moves from the World Map | The cover has faded → Browsing |
| Browsing | Interactive: select, Lead, Upgrade, Unlock, Back | Opening ends; a confirmation closes on No or a refusal; a reveal ends | Unlock tapped → Confirming; Back → Closing |
| Confirming | Screen Flow's confirmation box is open over the screen | An enabled Unlock is tapped | No or Back → Browsing; Yes and `unlock` ok → Revealing; Yes and a refusal → Browsing |
| Revealing | The splash-art reveal plays; only "end the reveal" acts | `race_unlocked` arrives while this screen is current | `reveal_time` passes, or any tap or Back → Browsing |
| Closing | The cover fades in; input is ignored (Screen Flow rule 4) | Back in Browsing | The World Map is current |

### Interactions with Other Systems

| System | Direction | Data | Interface owner |
|---|---|---|---|
| Faction Collection & Unlocks | in/out | In: `collection()`, `can_unlock`, `unlock_shortfall`, `active_race()`, `race_unlocked`, `active_race_changed`. Out: `unlock(race)` after Yes, `set_active(race)` | That GDD owns the calls and results; this GDD owns the layout, the confirmation step and the reveal |
| Unit Cards & Upgrades | in/out | In: each card's kind, race, tier, level, state, `veteran_every` at its level and the next; `card_upgraded`. Out: `upgrade_card(card_id)` | That GDD owns the numbers; this GDD the layout and the one-call-per-tap rule |
| Currencies & Economy | in | `balance(currency)`, `currency_changed`, `card_upgrade_cost`, `race_unlock_cost`, `can_afford`; the counter format | Currencies & Economy |
| Factions | in | Each race's name, crest, trait name and trait description | Factions |
| Unit Roster & Stats | in | Each kind's `id`, tier, `speed` and `strength`; bounds U2 and U3 for F1 and F2 | Unit Roster & Stats |
| Screen Flow & Scene Manager | out/in | Out: asks for World Map → Collection, Collection → World Map, and the confirmation box (Unlock). In: Back, `lock()` / `unlock()` during transitions | Screen Flow |
| Menus & Screens | in | The confirmation box, button styles, `press_time`, the text rules | Menus & Screens |
| World Map & Regions | out | `collection_badge()` for the mark on its Collection button | World Map draws the button and the mark; this GDD answers the question |
| Touch & Mouse Input | in | The touch minimum (I1) | Touch & Mouse Input |

**Direction rule.** This screen reads the three army systems and calls `unlock`, `set_active` and `upgrade_card` on them. No system calls this screen except the World Map, which reads `collection_badge()`.

## Formulas

`systems-designer` lens applied by the author (Lean mode: Section D is a high-risk section). Every variable was worked at its minimum, its maximum and at 0; the findings are under Boundary findings. This screen defines no cost, reward or rate: every price is Currencies & Economy's and every veteran rate is Unit Cards & Upgrades'.

### F1. Speed bar

The speed_bar formula is defined as:

`speed_bar = clamp(speed / speed_bar_max, 0, 1)`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| speed | float, px/s | 55–220 (Unit Roster & Stats U2) | data file (`UnitStats.speed`) | The kind's march speed |
| speed_bar_max | float, px/s | 110–400 (baseline 220) | data file | The speed that fills the bar; the top of U2 at baseline |

**Output Range:** 0.25 to 1.0 for a legal kind at baseline; clamped to 0–1 for any input.
**Example:** the human rider, speed 172: 172 / 220 = 0.78. The soldier (110) is 0.50, the beast soldier (132) 0.60 and the beast summon (92) 0.42, so each shipped difference shows.

### F2. Strength icons

The strength_icons formula is defined as:

`strength_icons = clamp(strength, 1, strength_icons_max)`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| strength | int | 1–3 (Unit Roster & Stats U3) | data file (`UnitStats.strength`) | Troops the pawn is worth |
| strength_icons_max | int | 3–5 (baseline 3) | data file | The number of icon places drawn; the top of U3 at baseline |

**Output Range:** 1 to 3 filled icons out of `strength_icons_max` places.
**Example:** the human summon, strength 2: two of three icons filled. The card shows the kind's base strength; a veteran's extra strength is told by the veteran lines, not by a third icon.

### F3. Collection badge

The collection_badge formula is defined as:

`collection_badge = (affordable_unseen ≥ 1)`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| affordable_unseen | int | 0–`races_max` − 1 (0–4) | calculated | The number of races for which `can_unlock(race)` is `ok` and whose id is not in the seen list (rule 15) |

**Output Range:** yes or no.
**Example:** a balance of 50 diamonds, the beast Locked at 50, the Collection not opened since launch: `can_unlock(beast)` is `ok` and the beast is unseen, so 1 ≥ 1: yes. After the Collection is opened once: 0, no. At 30 diamonds: `short`, 0, no.

### F4. Layout fit

The content_height formula is defined as:

`content_height = top_bar_h + race_row_h + race_panel_h + 3 × unit_card_h + 5 × gap`

and the races_visible formula is defined as:

`races_visible = floor((frame_w − 2 × margin + gap) / (race_card_w + gap))`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| top_bar_h | int, px | 96–120 (baseline 96) | data file | Back, title and both counters |
| race_row_h | int, px | 160–260 (baseline 216) | data file | The row of race cards |
| race_panel_h | int, px | 160–260 (baseline 200) | data file | Name, trait and the action slot |
| unit_card_h | int, px | 180–260 (baseline 212) | data file | One unit card |
| gap | int, px | 8–24 (baseline 12) | data file | Space between regions and between cards |
| margin | int, px | 16–40 (baseline 24) | data file | Side margin |
| race_card_w | int, px | 160–320 (baseline 200) | data file | One race card |
| frame_w | int, px | 720 | constant (the portrait frame, Menus & Screens rule 11) | Frame width |

**Output Range:** `content_height` 1,208 px at baseline, 996 to 1,540 over the ranges; the lower part scrolls when `content_height` is more than the safe area's height (1,280 minus the device's top and bottom insets). `races_visible` 3 at baseline, 1 to 4 over the ranges.
**Example:** 96 + 216 + 200 + 3 × 212 + 5 × 12 = 1,208. On a display with 100 px of insets the safe height is 1,180, so the race panel and the unit cards scroll by 28 px. Race row: floor((720 − 48 + 12) / (200 + 12)) = floor(3.23) = 3.

### F5. Card shortfall

The card_shortfall formula is defined as:

`card_shortfall = max(0, card_upgrade_cost − balance)`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| card_upgrade_cost | int, gold | 100–1,200 at baseline | calculated (Currencies & Economy F5, the next level's cost) | What the next level costs |
| balance | int, gold | 0–999,999 (`balance_cap`) | calculated (Currencies & Economy, `balance(gold)`) | The gold the player holds |

**Output Range:** 0 to 1,200 at baseline. It is drawn only when it is above 0 (the "N more" line); at 0 the button is enabled instead.
**Example:** a rider's level 2 costs 125 (100 × 125%); with 80 gold the line reads "45 more". For a race the same line uses Faction Collection & Unlocks' `unlock_shortfall`; this GDD does not restate it.

### Timings (data)

| Name | Baseline | Range | What it sets |
|---|---|---|---|
| `reveal_time` | 2.0 s | 1.0–4.0 | How long the unlock reveal stays if not ended by a tap |
| `upgrade_flare_time` | 0.3 s | 0.15–0.6 | The Accent Gold flare on an upgraded card (inside the art bible's 0.6 s limit for a big flare) |
| `upgrade_lock_time` | 0.3 s | 0.15–0.6 | How long an Upgrade button ignores taps after one (rule 12) |

Button press feedback is Menus & Screens' `press_time` (0.08 s); the screen change uses Screen Flow's `cover_fade` (0.15 s each way) and the confirmation its `overlay_fade` (0.2 s).

### Boundary findings

- `speed_bar_max` 0 would divide by zero. Its range starts at 110, and the loader replaces a value below 1 with 220 and logs it.
- A speed above `speed_bar_max` gives a full bar, not an overflow (the clamp). At `speed_bar_max` 110 every shipped kind but the beast summon reads full, so the knob is only useful at or above the top of U2.
- `strength` 0 or below would draw no icon; the clamp draws one. Unit Roster & Stats' U3 excludes it.
- `content_height` above the safe height is normal on a device with insets above 72 px: the lower part scrolls and nothing is cut off. At the smallest sizes the whole screen fits with room to spare.
- `races_visible` 2 at `race_card_w` 320 still shows both UAT races; a third race would scroll. It falls to 1 only with the widest card, the widest margin (40) and the smallest gap (8) together; the row then scrolls from the second race on and still works.
- `upgrade_lock_time` 0 lets a double tap buy two levels; the range starts at 0.15 s.
- `card_shortfall` is never negative (the `max`). At a balance of 0 it equals the cost.

## Edge Cases

`systems-designer` not consulted — Lean mode. Review manually before production.

- **If `collection()` returns one race** (only the human): the row shows one card, selected and Active; there is nothing to unlock and the screen still opens.
- **If `active_race()` is not in `collection()` when the screen opens** (a damaged state Faction Collection & Unlocks rule 10 prevents): the first race in the row is selected and it is logged.
- **If the selected race is unlocked or made active**: it stays selected; only its look and its action slot change.
- **If the player taps the card of the race that is already selected**: nothing happens.
- **If the player taps Unlock and the balance changes before Yes** (a development tool; nothing else can spend during the box): `unlock` runs its own test and returns `short`; the box closes, the panel reads "N more" and no reveal plays.
- **If `unlock` returns ok but `race_unlocked` has not arrived when the box closes**: the screen waits for the event; the reveal starts from the event, never from the call's return.
- **If `race_unlocked` arrives while the Collection is not the current screen** (a development tool, or a future second place to unlock): no reveal plays then or later; the card is simply Owned the next time the screen opens.
- **If the app goes to the background during a reveal**: the reveal is over when the app returns and the screen is in Browsing. The unlock was already saved (rule 8).
- **If a message box is raised while the screen is open** (a failed write, Save & Progress): Screen Flow shows it over the screen and it waits behind an open confirmation (Screen Flow rule 1). During a reveal it shows when the reveal ends.
- **If `can_unlock` answers `no_price`**: the card is Locked with no price and no button and reads "Not available yet"; the race's unit cards are Locked (rule 6).
- **If `can_unlock` answers `unknown`** for a race in the row (the list and the answer disagree): the action slot is empty and it is logged; development builds stop with an error naming the race.
- **If Upgrade is tapped twice within `upgrade_lock_time`**: the second tap is ignored; one level is bought. A tap after the lock is a new purchase at the next level's cost.
- **If `upgrade_card` is refused** (`short` because a development tool changed the balance, `max`, `locked`, `invalid`): nothing plays, no gold is spent, and the card is redrawn from its state. No error box opens.
- **If an upgrade leaves too little gold for another card's next level**: that card's button greys and gains its "N more" line in the same frame (rule 14).
- **If a card reaches `card_level_max`**: the slot reads "Max", the cost and the second veteran line disappear, and all five pips are filled.
- **If a kind's base strength is 3**: its launches are never veterans (Unit Cards & Upgrades rule 11), so both veteran lines read "No veterans for this unit" and the Upgrade button stays as its state says. No shipped kind is affected; whether such a card should be buyable at all is that GDD's question (Open Questions).
- **If a balance has seven digits or more** (not reachable: `balance_cap` is 999,999): the counter shows 999,999.
- **If a name or a trait description is too long for its box** (another language, larger text): it wraps to a second line, then shrinks to no less than the UX spec's minimum size; it is never cut off without a mark.
- **If the race row holds more races than `races_visible`**: the row scrolls sideways; on opening it is scrolled so the selected (active) card is in view.
- **If two races become affordable at once**: one mark shows (F3 is yes or no); opening the Collection marks both as seen.
- **If a race is affordable, the Collection is opened, and the player leaves without unlocking**: the mark stays off until the app is restarted (rule 15), even if more diamonds arrive.
- **If Delete progress runs** (from Settings or the newer-version message): the Collection is not the current screen then; the seen list is emptied with the profile, and the next opening reads the fresh state.
- **If the screen is asked for while a Level is current**: Screen Flow refuses it (not in its table); nothing here runs.

## Dependencies

All three systems this screen depends on have Approved GDDs (systems index, 2026-11-26). `design/ux/` has no spec yet; the UX spec for this screen is written after this GDD (UI Requirements).

| System | Nature | Direction | What this GDD needs or gives | GDD status |
|---|---|---|---|---|
| Faction Collection & Unlocks | Hard | in/out | `collection()`, `can_unlock`, `unlock_shortfall`, `active_race()`, `unlock`, `set_active`, `race_unlocked`, `active_race_changed` | Approved |
| Unit Cards & Upgrades | Hard | in/out | Card kind, race, tier, level, state, `veteran_every`; `upgrade_card`; `card_upgraded` | Approved |
| Currencies & Economy | Hard | in | `balance`, `currency_changed`, `card_upgrade_cost`, `race_unlock_cost`, `can_afford`; the counter format | Approved |
| Screen Flow & Scene Manager | Hard | out/in | The two transitions and the confirmation box; Back; the input lock | Approved |
| Menus & Screens | Hard | in | The confirmation box as drawn; button styles; `press_time`; the text and layout rules | Approved |
| Factions | Soft | in | Race name, crest, trait name and description | Approved |
| Unit Roster & Stats | Soft | in | Each kind's id, tier, `speed`, `strength`; U2 and U3 | Approved |
| Touch & Mouse Input | Soft | in | The touch minimum (I1) | Approved |
| **Depended on by** | | | | |
| World Map & Regions | Soft | out | `collection_badge()` for the mark on its Collection button | Approved |

**Bidirectional check.** Faction Collection & Unlocks (rules 14 and 18, Interactions, Dependencies, UI Requirements), Unit Cards & Upgrades (rule 12, Interactions, Dependencies, UI Requirements), Currencies & Economy (Interactions, Dependencies, UI Requirements), Factions (Interactions, Dependencies, UI Requirements), Unit Roster & Stats (Dependencies, UI Requirements) and Screen Flow (rule 1, Interactions, Dependencies) name this GDD. Menus & Screens names "the UAT-2 Collection screens" in its scope rule and World Map & Regions names "Collection screens" for its button; neither knows about `collection_badge()` or the unlock use of the confirmation box. Touch & Mouse Input does not name this GDD. The edits are listed under Cross-References.

## Visual/Audio Requirements

`art-director` not consulted — Lean mode. Review manually before production. From art bible §1 (two registers, splash art is the payoff), §2 (menus: "cosy, steady, crafted") and §4 (colours).

- **Register.** The Collection is frame UI: dark wood frames and parchment panels in lamplit, low-contrast light. It is one of the places splash art belongs (Principle 3).
- **Race card looks.** Locked: the crest and name on a dimmed card with a padlock and the price; the art is visible, so the player can want the race. Owned: full colour. Active: full colour with the leading marker, a banner in the player's blue and Heraldic Gold. The three looks differ by shape (padlock, banner), never by colour alone.
- **Unit cards.** The unit's figure, the five pips and the veteran mark as Unit Cards & Upgrades describes them. A Locked unit card is dimmed with its figure still readable. Filled and empty pips differ by shape as well as colour.
- **The reveal.** The race's splash art, full screen, in the Victory register (warm, golden-hour light), with the race's name. It is the payoff for the diamonds, so it is never a small pop-up.
- **The upgrade moment.** A short Accent Gold flare on the card (`upgrade_flare_time`) and the new pip filling, steady and crafted, with no bounce (Unit Cards & Upgrades Visual/Audio). Accent Gold appears nowhere else on the screen at rest.
- **Buttons and colour.** Primary and secondary styles are Menus & Screens' (rule 9). Crimson is never used here: a short balance is greyed, not red.
- **Currency icons.** Gold and diamonds differ by shape (a coin, a cut gem), never by colour alone (Currencies & Economy UI Requirements).
- **Audio**: none specified here. A sting for the reveal and for choosing a race, and a sound for an upgrade, belong to the Audio GDD (Vertical Slice).

📌 **Asset Spec** — Visual/Audio requirements are defined. After the art bible is approved, run `/asset-spec system:collection-upgrade-screens` for the race card frame in its three looks, the unit card frame, the pips, the padlock, the leading marker, the two currency icons and one unlock splash per `diamonds` race (the beast in the UAT build). Crests are `system:factions`; unit figures and veteran marks are `system:unit-roster-stats` and `system:unit-cards-upgrades`.

## Game Feel

- **A purchase lands on the tap.** The pip fills, the flare starts and the gold counter drops in the frame of the tap; nothing waits for an animation to finish.
- **Diamonds are an event, gold is a habit.** An unlock asks once and then celebrates with full-screen art; an upgrade is one tap and a small flare. The difference in weight is intended.
- **Never a punishment.** A short balance greys a button and says how much is missing. Nothing on this screen is red, shakes or opens an error box.
- **Locked is an advert, not a wall.** A locked race can be selected and read: its trait, its three units and what their cards would do.
- **Leading is free and light.** One tap, the banner moves, no question asked; changing back is the same tap.
- **Playtest questions for UAT-2** (not acceptance criteria): after conquering Green Vale, do testers notice the mark on the Collection button and open it without being told? After the reveal, do they find Lead on their own? Do they understand "a veteran every Nth" from the card alone?

## UI Requirements

This GDD is the rule set for the screen; the UX spec fixes the exact layout inside it.

- One screen with four regions (rule 3), a visible Back control, and both counters in the top bar.
- Every control at least the touch minimum (96 px); the three unit cards reachable without leaving the screen.
- States shown by shape as well as colour (Visual/Audio); every text from the strings file with 30% room.
- The World Map shows a mark on its Collection button when `collection_badge()` is yes. Whether the map also shows the two counters is the World Map UX spec's question (Currencies & Economy Open Question 8).

> **📌 UX Flag — Collection & Upgrade Screens**: this system is a screen. In Pre-Production, run `/ux-design` for the Collection screen before writing epics; that spec also closes the UX flags of Faction Collection & Unlocks, Unit Cards & Upgrades, Currencies & Economy, Factions and Unit Roster & Stats. Stories that touch the UI should cite `design/ux/collection.md`, not this GDD.

## Cross-References

| This GDD relies on | In | What it relies on |
|---|---|---|
| Faction Collection & Unlocks | Rules 5–9, 14, 18; UI Requirements; Open Questions 4 and 5 | The calls, the three race states, the confirmation text; both open questions are closed here (rules 15 and 8) |
| Unit Cards & Upgrades | Rules 2–4, 11, 12; States; UI Requirements; Open Question 5 | Card states, one level per call, `veteran_every`; the open question is closed here (rule 12) |
| Currencies & Economy | Rules 7, 10; F5, F6; UI Requirements | Costs, `can_afford`, the counter format, "a diamond purchase asks once, a gold upgrade does not" |
| Factions | Rule 10; UI Requirements | Race name, crest, trait text built from data; one race led at a time |
| Unit Roster & Stats | Rule 2; U2, U3; UI Requirements | Three kinds per race; speed and strength shown as a bar and icons, not raw px/s |
| Screen Flow & Scene Manager | Rules 1, 4, 6; the transitions table | Screens and overlays, the input lock, Back, the confirmation box |
| Menus & Screens | Rules 6, 9, 10, 11 | The confirmation box, button styles, text and layout rules |
| Touch & Mouse Input | I1 | The 96 px touch minimum |
| design/art/art-bible.md | §1, §2, §4 | Frame register, splash art as the payoff, the 0.6 s flare limit, colour roles |
| game-concept.md | Pillar 3 | Every reward shows on the map or in the collection |

**Edits other documents need as a result of this GDD** (all eight applied 2026-11-26, user-approved, in the session that wrote this GDD):
1. `screen-flow-scene-manager.md`: rule 1 and the note under the transitions table say the collection screens "join in Alpha"; they are MVP (UAT-2) and one screen. Add the rows World Map → Collection (Collection button), Collection → World Map (Back), Collection → Confirmation (Unlock), Confirmation (Unlock) → Collection (Yes, No, Back).
2. `menus-screens.md`: rule 6 lists the confirmation text per cause; add the unlock line (also asked by Faction Collection & Unlocks, its edit 8).
3. `world-map-regions.md`: its Collection button draws a mark when `collection_badge()` is yes, read each time the map is shown and when the conquest sequence ends; name this GDD in Interactions and Dependencies.
4. `faction-collection-unlocks.md`: this GDD is no longer provisional; close Open Questions 4 (rule 15 here) and 5 (rule 8 here).
5. `unit-cards-upgrades.md`: this GDD is no longer provisional; close Open Question 5 (rule 12 here: one call per tap, no confirmation, a 0.3 s lock).
6. `currencies-economy.md`, `factions.md`, `unit-roster-stats.md`: this GDD is designed; their rows for it are no longer provisional.
7. `design/registry/entities.yaml`: register `speed_bar`, `strength_icons`, `collection_badge`, `content_height`, `races_visible` and `card_shortfall` (formulas) and `reveal_time`, `upgrade_flare_time`, `upgrade_lock_time`, `speed_bar_max` (constants); add this GDD to `referenced_by` of `press_time`, `cover_fade`, `overlay_fade`, `balance`, `balance_cap`, `card_upgrade_cost`, `race_unlock_cost`, `card_level_max` and `veteran_every`.
8. `systems-index.md`: row 27 is designed, with the GDD link; add Screen Flow & Scene Manager and Menus & Screens to its dependencies.

## Acceptance Criteria

Baseline data unless a criterion says otherwise: the human and the beast, the beast priced at 50 diamonds, `card_cost` 100 / 200 / 400 / 800, `tier_cost_percent` 100 / 125 / 150, the `veteran_every` table of Unit Cards & Upgrades, `reveal_time` 2.0, `upgrade_lock_time` 0.3, `speed_bar_max` 220. Tags: **[Logic]** automated test in `tests/unit/`; **[Integration: X]** in `tests/integration/`; **[UI]** retained screenshot in `production/qa/evidence/`. `qa-lead` lens applied by the author (Lean mode: Section H is a high-risk section).

- **AC1 [Integration: Screen Flow] (rule 2)**: GIVEN the World Map is current, WHEN the Collection button is tapped, THEN the Collection becomes the current screen; WHEN Back (the visible control, the phone's Back or Esc) is used in Browsing, THEN the World Map is current again. GIVEN a Level is current, WHEN the Collection is requested, THEN the request is refused and the Level stays.
- **AC2 [Logic] (rules 4, 5)**: GIVEN the human Active and the beast Locked, WHEN the screen opens, THEN the row holds two race cards in the order human, beast, and the human is selected; GIVEN the beast is Active, THEN the beast is selected.
- **AC3 [Logic] (rule 5)**: GIVEN the human selected, WHEN the beast's card is tapped, THEN the panel and the three unit cards show the beast's, and `active_race()` is still human and nothing was reported to Save & Progress.
- **AC4 [Logic] (rule 6)**: GIVEN the beast selected and Locked, THEN at 50 diamonds the slot shows the price 50 and an enabled Unlock; at 30 diamonds Unlock is disabled and the line reads "20 more"; with no price in data there is no price, no button and the line "Not available yet". GIVEN the beast Owned, THEN the slot shows Lead; GIVEN it Active, THEN "Leading" and no button.
- **AC5 [Integration: Faction Collection & Unlocks, Screen Flow] (rule 7)**: GIVEN 50 diamonds and the beast selected, WHEN Unlock is tapped, THEN the confirmation box opens with "Unlock the Beast for 50 diamonds? This cannot be undone." and `unlock` has not been called; WHEN No or Back is chosen, THEN `unlock` is never called and the balance is 50; WHEN Yes is chosen, THEN `unlock(beast)` is called exactly once.
- **AC6 [Integration: Faction Collection & Unlocks] (rule 7, refusal)**: GIVEN the confirmation open and `unlock` set to return `short`, WHEN Yes is chosen, THEN the box closes, no reveal plays, no error box opens and the panel reads "N more".
- **AC7 [Logic] (rule 8)**: GIVEN `race_unlocked(beast)` arrives while the Collection is current, THEN the screen is in Revealing; WHEN 2.0 s pass with no input, THEN it is in Browsing with the beast selected, Owned, and Lead shown; GIVEN a reveal 0.5 s old, WHEN the screen is tapped, THEN it is in Browsing at once; WHEN Back is used during a reveal, THEN the reveal ends and the Collection is still the current screen. In every case `active_race()` is unchanged.
- **AC8 [Logic] (rule 8, edge case)**: GIVEN `race_unlocked(beast)` arrives while the World Map is current, THEN no reveal plays, and the next opening of the Collection shows the beast Owned with no reveal.
- **AC9 [Integration: Faction Collection & Unlocks] (rule 9)**: GIVEN the beast Owned and selected and the human Active, WHEN Lead is tapped, THEN `set_active(beast)` is called once with no confirmation box, and in the frame `active_race_changed` arrives the beast's card is Active and the human's is Owned.
- **AC10 [Logic] (rule 10)**: GIVEN the human selected with card levels 1, 3 and 5 and 1,000 gold, THEN three cards show in the order soldier, rider, summon with 1, 3 and 5 filled pips of 5; the soldier's slot is Upgrade at 100, the rider's Upgrade at 500 (400 × 125%), the summon's "Max" with no cost. GIVEN 80 gold, THEN the soldier's Upgrade is greyed, shows 100 and reads "20 more". GIVEN the beast Locked and selected, THEN its three cards show no button and the line "Unlock the Beast to upgrade".
- **AC11 [Logic] (rule 11)**: GIVEN the human soldier's card at level 1, THEN its lines read "No veterans yet" and "Next level: every 12th"; at level 2, "A veteran every 12th" and "Next level: every 9th"; at level 5, "A veteran every 5th" and no second line. GIVEN the soldier's level 2 entry is changed to 6 in data, THEN the level 2 line reads "every 6th" with no other change.
- **AC12 [Integration: Unit Cards & Upgrades] (rule 12)**: GIVEN the human soldier at level 1 and 1,000 gold, WHEN Upgrade is tapped once, THEN `upgrade_card(human_t1)` is called exactly once and no confirmation box opens; WHEN it is tapped twice 0.1 s apart, THEN it is called once and the level is 2; WHEN it is tapped twice 0.4 s apart, THEN it is called twice and the level is 3.
- **AC13 [Integration: Currencies & Economy] (rules 13, 14)**: GIVEN 300 gold, the soldier at level 1 (next 100) and the rider at level 2 (next 250), WHEN the soldier is upgraded, THEN in the frame `currency_changed` arrives the gold counter reads 200, the soldier shows 2 pips and a cost of 200, and the rider's Upgrade is greyed and reads "50 more".
- **AC14 [Logic] (rule 13, format)**: GIVEN a gold balance of 15,500, THEN the counter reads "15,500"; GIVEN 0, "0"; GIVEN 999,999, "999,999".
- **AC15 [Logic] (F3, rule 15)**: GIVEN an app start, 50 diamonds and the beast Locked, THEN `collection_badge()` is yes; WHEN the Collection is opened and closed without unlocking, THEN it is no, and it stays no when 50 more diamonds arrive; GIVEN the app is restarted in that state, THEN it is yes again. GIVEN 30 diamonds, THEN no. GIVEN 5,000 gold and every card Upgradable, with no race affordable, THEN no.
- **AC16 [Logic] (F1)**: GIVEN `speed_bar_max` 220, THEN speed 172 gives 0.78 (within 0.01), 110 gives 0.50, 55 gives 0.25, 220 gives 1.0 and 300 gives 1.0; GIVEN `speed_bar_max` 0 in data, THEN 220 is used and one line is logged.
- **AC17 [Logic] (F2)**: GIVEN strengths 1, 2 and 3, THEN 1, 2 and 3 of 3 icons are filled; GIVEN 0, THEN 1; GIVEN 4, THEN 3.
- **AC18 [Logic] (F4)**: GIVEN the baseline sizes, THEN `content_height` is 1,208 and `races_visible` is 3; GIVEN a safe height of 1,280, THEN nothing scrolls; GIVEN a safe height of 1,180, THEN the part below the race row scrolls by 28 px and the top bar and race row do not move. GIVEN five races, THEN three cards show and the row scrolls sideways to the other two.
- **AC19 [Logic] (F5)**: GIVEN a cost of 125 and a balance of 80, THEN `card_shortfall` is 45; GIVEN a balance of 125 or 500, THEN 0 and no "N more" line is drawn; GIVEN a balance of 0, THEN 125.
- **AC20 [Logic] (rule 14)**: GIVEN the screen open, WHEN a balance, a card level or the owned set is changed through its owner and the event is raised, THEN the screen shows the new value in that frame; WHEN the same change is made with the event suppressed (a test double), THEN the screen still shows the old value, proving it reads from the events and keeps no copy that it updates itself.
- **AC21 [Logic] (rule 17)**: GIVEN the baseline data, THEN every button and every race card on the screen has a hit area at least 96 px in both directions.
- **AC22 [UI] (rules 3, 4, 6, 10; Visual/Audio)**: retained screenshots in `production/qa/evidence/` show the Collection at 720 × 1,280 with (a) the human selected and Active, cards at mixed levels, one affordable and one short; (b) the beast selected and Locked at 30 diamonds ("20 more"), its unit cards Locked; (c) the beast Locked at 50 diamonds with Unlock enabled; (d) the confirmation box; (e) the reveal; (f) the beast Owned with Lead; (g) the beast Active; (h) a Maxed card. In a greyscale copy of (a) and (b), 4 of 5 testers name each race card's state and each unit card's level.
- **AC23 [UI] (rule 15)**: retained screenshots show the World Map's Collection button with and without the mark.
- **AC24 [UI] (rule 12, Visual/Audio)**: a retained capture of an upgrade shows the pip filled and the gold counter lowered in the first frame after the tap, and the flare over by 0.3 s.

**Coverage check.** Rules 2, 4–15 and 17 have criteria (AC1–AC15, AC20, AC21); rule 3 and the looks are AC22; rules 1, 16 and 18 are scope and data statements, checked by review (no string or size in code) rather than by a test. F1–F5 each have a typical and a boundary case (AC15–AC19). Cross-system: AC1, AC5, AC6, AC9, AC12, AC13. Not covered yet: the long-text edge case (it needs the UX spec's minimum size) and the message box over the screen (Screen Flow's own criteria cover the queue).

## Open Questions

| # | Question | Owner | Resolve by |
|---|----------|-------|------------|
| 1 | The seen list for the map mark is kept in memory only, so the mark returns after every restart until the Collection is opened. Is that a welcome reminder or a nag? Saving it would need a field in Save & Progress | ux-designer, Save & Progress | First UAT-2 playtest |
| 2 | Exact layout inside the four regions, the minimum text size and how long text shrinks | ux-designer | `/ux-design` for the Collection screen |
| 3 | Does the World Map show the gold and diamond counters, or only this screen? (Currencies & Economy Open Question 8) | World Map UX spec | `/ux-design world-map` |
| 4 | A card for a kind with base strength 3 can be bought and gives nothing (Unit Cards & Upgrades rule 11). No shipped kind has it; should such a card read Max, or not be sold? | Unit Cards & Upgrades | Before a strength 3 kind ships |
| 5 | Does the reveal need its own splash per race, or one shared frame with the race's crest, for the UAT build? | art-director | `/asset-spec system:collection-upgrade-screens` |
| 6 | Sounds for the reveal, for Lead and for an upgrade | Audio GDD | Vertical Slice |
| 7 | With five races the row scrolls sideways. Is a scroll cue enough, or should the row become two lines? | ux-designer | When a third race is added |
