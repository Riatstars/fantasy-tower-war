# Game Concept: Tower War

> Written from `design/game-brief.md` (the brief is the source of truth for the wording;
> items marked *(provisional)* are defaults that have not been confirmed by the player).
> Date: 2026-11-21. Stage: Concept.

## 1. Overview

Tower War is a mobile real-time conquest game with a fantasy campaign. The player links their
barracks and castles with glowing rune ropes; troops march down the ropes to take neutral and
rival keeps. A keep grows from barracks to stone keep to castle as it holds more troops, and each
level it grows lets it hold more ropes. Each level is one territory on a fantasy world map;
conquering a region's last level ends at a guardian's castle and unlocks a god or goddess power.

## 2. Player Fantasy

Painting a living fantasy map in your colours, one region at a time: a few tense, quick levels
of tug-of-war, then the world map fills with your banners.

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
  next node. Conquering a region's last level opens the next region *(provisional)*.
- **Powers:** one god or goddess power per region, cast once per level, chosen before the level
  *(provisional, later)*.

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
- Monetisation (in-app purchase, ads) depends on the app build and store accounts.
- Anime pixel art depends on an art bible, which is not yet written.

## 7. Tuning Knobs

`gen_interval`, `gen_l1` / `gen_l2` / `gen_l3`, `troop_cap`, `lv2_at`, `lv3_at`, `send_interval`,
`pawn_speed`, `link_range`, `keep_radius`, `keep_hit_lift`, `cut_click_radius`, `ai_think_scale`,
`ai_grace`, `ai_min_send`, `player_start`, and the per-level rival numbers in `MAPS`.

## 8. Acceptance Criteria

- A new player taps the first node and wins the first level within a few minutes.
- Ropes can be tied and cut with the documented controls on touch and on computer.
- Allied keeps never rope each other both ways.
- A full keep never loses arriving allied troops while it has an outgoing rope.
- The rival does not overwhelm a first-time player on the first region.
- Level and world-map progress survives closing and reopening the app on the same device.

## Open questions

- Scope: the brief now describes a campaign with a world map, guardians, powers, in-app purchases
  and ads. Which of these is in the first release, and which waits for later builds? (The brief's
  build order says: slice first, then art, then powers, then store build.)
- Store goal: is the first release meant to be sold (App Store, Google Play), or kept as a hobby
  build? This affects the goal setting and the rigor level.
- Art: the brief asks for anime pixel art in an RPG fantasy style. Which references are the
  target look (named references are for style only, never copied characters or art)?
