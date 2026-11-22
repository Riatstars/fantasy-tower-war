# Game Concept: Tower War

> Written from `design/game-brief.md` (the brief is the source of truth for the wording;
> items marked *(provisional)* are defaults that have not been confirmed by the player).
> Date: 2026-11-21, updated 2026-11-22 (scope decisions, pillars). Stage: Concept.

## 1. Overview

Tower War is a mobile real-time conquest game with a fantasy campaign. The player links their
barracks and castles with glowing rune ropes; troops march down the ropes to take neutral and
rival keeps. A keep grows from barracks to stone keep to castle as it holds more troops, and each
level it grows lets it hold more ropes. Each level is one territory on a fantasy world map.
Between levels the player grows an army: races (human, beast, elf, spirit, dragon) whose unit
cards are upgraded with the gold that levels reward, and rare races unlocked with diamonds earned
by conquering regions. After the UAT build, each region will end at a guardian's castle and
unlock a god or goddess power.

## 2. Player Fantasy

Painting a living fantasy map in your colours, one region at a time: a few tense, quick levels
of tug-of-war, then the world map fills with your banners and your army grows with it.

## Pillars

1. **One verb, standing choices.** Ropes are the only action in a match; every decision is where
   to tie and when to cut. *Test: a feature that adds a second verb during a match must fold into
   the rope, or it waits.*
2. **A tug-of-war you read at a glance.** A level lasts 2–3 minutes and the whole board reads on a
   phone in one look. *Test: when a rule, effect or number makes the table harder to read in one
   glance, cut it or move it off the table.*
3. **Paint the map, grow the army.** Progress always shows: regions turn your colour, races join
   you, cards level up. *Test: every reward must appear on the world map or in the collection,
   never only as a number.*

## Visual Identity Anchor

**On the table, ownership reads before charm; off the table, charm is the reward.** Chibi pixel
art on the table, anime splash art on the frame (world map, menus, rewards). Principles: colour
belongs to whoever owns it; silhouette first, face second; splash art is the payoff. Full
statement and design tests: `design/art/art-bible.md` §1.

## 3. Detailed Rules

- **Keeps:** each keep has a troop count and a level 1–3 (barracks, keep, castle). Level comes
  from troop count; level sets how many outgoing ropes the keep can hold.
- **Generation:** owned keeps add troops on a periodic tick. Neutral keeps hold a garrison and do
  not generate.
- **Ropes:** the player drags from their keep to another keep to tie a rope. Troops march along it
  without emptying the sender. Swiping across a rope (touch) or right-click / right-drag (computer)
  cuts it. Ropes have no length limit.
- **Combat at a target:** arriving troops reduce an enemy or neutral garrison; at zero the keep
  flips to the attacker. Arriving allied troops reinforce; a full keep (60 troops) relays them
  down its own ropes instead.
- **Clashes:** opposing marches on the same pair of keeps meet mid-rope and both die.
- **Restrictions:** two allied keeps cannot rope each other in both directions.
- **Rival:** one AI rival per level expands, attacks weak keeps and defends. It starts slower
  on the first level (no attacks for the first 60 s).
- **Level win:** own every keep in the level. **Level loss:** own no keeps and no troops are marching.
- **World map:** levels are nodes on a fog-covered map. A win gives stars and gold and unlocks the
  next node. Conquering a region's last level opens the next region and gives a fixed diamond
  reward *(amounts provisional)*.
- **Army:** each race has unit cards (the soldiers, riders and summons a keep sends at each
  level). Gold upgrades cards; diamonds unlock rare races. The race and its cards decide the
  units a player's keeps produce in a match (Unit Roster & Stats, Factions).
- **Powers:** one god or goddess power per region, cast once per level, chosen before the level
  *(provisional, after the UAT build)*.

## 4. Formulas

Tuning values live in `prototypes/tower-war/config.js` (the one-shot's file of record). Key values
at the prototype's current state:

- Generation tick: every 2.5 s. Troops per tick by level: 1 / 2 / 3 → 0.4 / 0.8 / 1.2 troops/s.
- Level thresholds: level 2 at 15 troops, level 3 at 35 troops. Troop cap per keep: 60.
- Pawn send interval: 0.6 s per rope (≈1.67 pawns/s per rope). Pawn speed: 110 px/s.
- Rope range: unlimited (range value 2000 px, longer than the map diagonal).

## 5. Edge Cases

- A full keep with no outgoing rope loses arriving allied troops (no place to relay them).
- Two allied keeps cannot rope each other in both directions, so troops never ping-pong between
  them; a full keep with no other outgoing rope loses arriving allied troops.
- A keep that drops a level loses its newest rope.
- Ropes between two keeps of different owners may be tied both ways; their marches clash.
- When a keep is captured, its own outgoing ropes are cut. Ropes from other keeps that still
  point at it keep sending, now as attacks on its new owner.

## 6. Dependencies

- Level and map progress saved on the device (no account, no cloud save for now).
- Monetisation (in-app purchase, ads) comes after the UAT build and depends on the store build and
  store accounts.
- Anime pixel art follows the art bible (`design/art/art-bible.md`, sections 1–4).

## 7. Tuning Knobs

`gen_interval`, `gen_l1` / `gen_l2` / `gen_l3`, `troop_cap`, `lv2_at`, `lv3_at`, `send_interval`,
`pawn_speed`, `link_range`, `keep_radius`, `keep_hit_lift`, `cut_click_radius`, `ai_think_scale`,
`ai_grace`, `ai_min_send`, `player_start`, and the per-level rival numbers in `MAPS`.

## 8. Acceptance Criteria

- A new player taps the first node and wins the first level within a few minutes.
- Ropes can be tied and cut with the documented controls on touch and on computer.
- Allied keeps never rope each other both ways.
- A full keep never loses arriving allied troops while it has an outgoing rope, except a pawn
  past the relay limit (6 relays, Troop Marching & Clashes).
- The rival does not overwhelm a first-time player on the first region.
- Level and world-map progress survives closing and reopening the app on the same device.

## Decisions (the player, 2026-11-22)

- **First release:** an offline build for UAT testing, not a store release.
- **UAT build scope (20 systems):** the 13 core systems (match, world map, save, HUD, menus) plus
  the army layer: Currencies & Economy, Stars & Rewards, Unit Roster & Stats, Factions, Unit Cards
  & Upgrades, Faction Collection & Unlocks, Collection & Upgrade Screens.
- **After UAT:** Settings, Audio, Feedback & Juice, Tutorial & Onboarding, Mobile Platform
  Integration, God & Goddess Powers, Guardian Castles, Accessibility; then the store build with
  in-app purchases and ads.
- **Diamonds:** a fixed reward for conquering each region (no purchases in the UAT build).
- **Art:** chibi pixel style in game, anime splash art in menus (art bible §1).

## Open questions

- How many diamonds per region, and what a rare race costs: Currencies & Economy.
- Does the rival pick a race, or does each region have one? Factions.
- Are all five races in the UAT build, or a subset? Factions / Faction Collection & Unlocks.
