# Systems Index: Tower War

> **Status**: Draft
> **Created**: 2026-11-21
> **Last Updated**: 2026-11-22
> **Source Concept**: design/gdd/game-concept.md (and design/game-brief.md)

---

## Overview

Tower War is a mobile real-time conquest game. The player ties rope links between keeps; troops
march down the ropes to take neutral and rival keeps. A keep grows from level 1 to 3 as it holds
more troops, and its level sets how many ropes it can hold. Each match is one level on a fantasy
world map; levels are grouped into regions that end at a guardian's castle. The first release is
an offline **UAT build** of 20 systems (the MVP tier; the player's decision, 2026-11-22) in two
steps: **UAT-1**, the 13 core systems (match, campaign, save, HUD, menus), no deadline;
**UAT-2**, the 7 army-layer systems (races, cards, gold, stars, diamonds, collection), no deadline.
UAT-1 design order skips the army layer: Level State & Match Flow, Rival AI (baseline unit, no
race), Campaign Level Data, World Map & Regions, Level HUD, Menus & Screens. In-app purchases and
ads come with the store build
after UAT; online play and accounts stay out of scope.

The scope has four layers. The **match layer** (Troop Generation, Keep Levels, Rope Links, Troop
Marching & Clashes, Level State, Rival AI) is the tug-of-war loop and must be proven fun first.
The **campaign layer** (Campaign Level Data, World Map & Regions, Stars & Rewards, Save &
Progress, Guardian Castles) turns matches into a world to conquer region by region. The
**collection layer** (Factions, Unit Roster & Stats, Unit Cards & Upgrades, Faction Collection &
Unlocks, Currencies & Economy, God & Goddess Powers) lets the player pick a race (human, beast,
elf, spirit, dragon), each with its own units and playstyle, and spend gold on card upgrades and
diamonds on rare races. The **platform layer** (Mobile Platform Integration, Settings, Audio,
Accessibility) makes it ship as an app.

Brief paragraph per system (balanced density):

- **Troop Generation**: owned keeps add troops on a periodic tick by level, up to a cap of 60. The
  keep's state (owner, troops, tick) is the base every other system reads.
- **Keep Levels**: a keep's level 1–3 comes from its troop count and sets its maximum rope count.
- **Rope Links**: tie, cut, unlimited length, no two-way ropes between allies, full keeps relay
  arriving allied troops down their own ropes.
- **Troop Marching & Clashes**: troops march along ropes, reinforce allies, reduce enemy garrisons,
  capture at zero, and clash and die where opposing marches meet. It defines the `UnitStats`
  contract (speed, strength, size) that Unit Roster fills in.
- **Level State & Match Flow**: start, win (own every keep), lose (no keeps and no troops marching),
  restart.
- **Rival AI**: expands, attacks weak keeps, defends, scaled per level and region; must handle
  factions and powers once those exist.
- **Unit Roster & Stats / Factions**: each race has its own unit set and playstyle; units fill the
  `UnitStats` contract.
- **Unit Cards & Upgrades / Faction Collection & Unlocks / Currencies & Economy**: unit cards are
  upgraded with gold; rare races are unlocked with diamonds; gold also upgrades god and goddess
  powers.
- **World Map & Regions / Campaign Level Data / Stars & Rewards / Guardian Castles**: nodes on a
  fantasy map with fog, stars per level, a guardian's castle ending each region.
- **UI, audio, meta systems**: Level HUD, Menus & Screens, Collection & Upgrade Screens, Feedback &
  Juice, Audio, Tutorial & Onboarding, Accessibility, Settings, Save & Progress, Mobile Platform
  Integration.

---

## Systems Enumeration

| # | System Name | Category | Priority | Status | Design Doc | Depends On |
|---|-------------|----------|----------|--------|------------|------------|
| 1 | Troop Generation | Gameplay | MVP | In Review | design/gdd/troop-generation.md | Keep Levels (level input; cycle resolved by per-step order) |
| 2 | Screen Flow & Scene Manager (inferred) | Core | MVP | In Review | design/gdd/screen-flow-scene-manager.md | Touch & Mouse Input (soft) |
| 3 | Touch & Mouse Input | Core | MVP | In Review | design/gdd/touch-mouse-input.md | — |
| 4 | Save & Progress | Persistence | MVP | In Review | design/gdd/save-progress.md | Campaign Level Data (soft: id validation) |
| 5 | Keep Levels | Gameplay | MVP | In Review | design/gdd/keep-levels.md | Troop Generation, Campaign Level Data (soft), Factions (soft) |
| 6 | Rope Links | Gameplay | MVP | In Review | design/gdd/rope-links.md | Keep Levels, Touch & Mouse Input, Troop Generation (soft), Troop Marching & Clashes (runtime callback) |
| 7 | Troop Marching & Clashes | Gameplay | MVP | Designed | design/gdd/troop-marching-clashes.md | Rope Links, Keep Levels, Troop Generation |
| 8 | Level State & Match Flow | Core | MVP | Designed | design/gdd/level-state-match-flow.md | Troop Marching & Clashes, Troop Generation, Rope Links, Screen Flow & Scene Manager, Save & Progress, Keep Levels (soft), Campaign Level Data (soft: level record contract) |
| 9 | Rival AI | Gameplay | MVP | Designed | design/gdd/rival-ai.md | Rope Links, Troop Marching & Clashes, Troop Generation, Keep Levels, Level State & Match Flow, Campaign Level Data (soft: think, aggro, rival_seed per level) |
| 10 | Campaign Level Data | Progression | MVP | Designed | design/gdd/campaign-level-data.md | Keep Levels, Rival AI, Level State & Match Flow, Save & Progress (id registration), Touch & Mouse Input (invariant I2), Rope Links (invariant R3), Troop Marching & Clashes (soft: speed_min, keep id order) |
| 11 | World Map & Regions | Progression | MVP | Designed (UX spec needed: `/ux-design world-map`) | design/gdd/world-map-regions.md | Campaign Level Data, Save & Progress, Screen Flow & Scene Manager, Touch & Mouse Input (soft) |
| 12 | Level HUD | UI | MVP | Designed (UX spec needed: `/ux-design level-hud`, which also closes the HUD-element UX flags of Troop Generation, Keep Levels, Rope Links, Troop Marching and Touch & Mouse Input) | design/gdd/level-hud.md | Keep Levels, Rope Links, Troop Generation, Troop Marching & Clashes, Level State & Match Flow, Touch & Mouse Input, Screen Flow & Scene Manager, Campaign Level Data (soft: title text) |
| 13 | Menus & Screens | UI | MVP | Designed (UX spec needed: `/ux-design menus`) | design/gdd/menus-screens.md | Screen Flow & Scene Manager, Level State & Match Flow, Save & Progress, World Map & Regions (soft: is_unlocked), Campaign Level Data (soft: names), Touch & Mouse Input (soft: controls list) |
| 14 | Settings (inferred) | Persistence | Vertical Slice | Not Started | — | Save & Progress (settings file, Delete progress) |
| 15 | Currencies & Economy | Economy | MVP | Not Started | — | Save & Progress |
| 16 | Audio | Audio | Vertical Slice | Not Started | — | Settings |
| 17 | Stars & Rewards | Progression | MVP | Not Started | — | Level State & Match Flow, Currencies & Economy, World Map & Regions, Save & Progress |
| 18 | Feedback & Juice | UI | Vertical Slice | Not Started | — | Troop Marching & Clashes, Keep Levels, Rope Links, Audio |
| 19 | Tutorial & Onboarding | Meta | Vertical Slice | Not Started | — | Touch & Mouse Input, Rope Links, Level HUD, Campaign Level Data, Save & Progress (soft: first-run flag) |
| 20 | Mobile Platform Integration | Meta | Vertical Slice | Not Started | — | Screen Flow & Scene Manager, Save & Progress, Settings |
| 21 | Unit Roster & Stats | Gameplay | MVP | Not Started | — | Troop Marching & Clashes, Keep Levels |
| 22 | Factions | Gameplay | MVP | Not Started | — | Unit Roster & Stats, Troop Generation, Keep Levels |
| 23 | Unit Cards & Upgrades | Progression | MVP | Not Started | — | Unit Roster & Stats, Currencies & Economy, Save & Progress |
| 24 | Faction Collection & Unlocks | Progression | MVP | Not Started | — | Factions, Currencies & Economy, Save & Progress |
| 25 | God & Goddess Powers | Gameplay | Alpha | Not Started | — | Troop Marching & Clashes, Rope Links, Currencies & Economy, World Map & Regions |
| 26 | Guardian Castles | Gameplay | Alpha | Not Started | — | Rival AI, Campaign Level Data, World Map & Regions |
| 27 | Collection & Upgrade Screens (inferred) | UI | MVP | Not Started | — | Faction Collection & Unlocks, Unit Cards & Upgrades, Currencies & Economy |
| 28 | Accessibility (inferred) | Meta | Alpha | Not Started | — | Level HUD, Menus & Screens, Settings, Touch & Mouse Input (soft) |

Out of scope for the UAT build (see the brief's Out of scope): in-app purchases and ads (store
build after UAT), online versus, cloud save and accounts.

---

## Categories

| Category | Description | Systems in this game |
|----------|-------------|----------------------|
| **Core** | Foundation systems everything depends on | Screen Flow & Scene Manager, Touch & Mouse Input, Level State & Match Flow |
| **Gameplay** | The systems that make the game fun | Troop Generation, Keep Levels, Rope Links, Troop Marching & Clashes, Rival AI, Unit Roster & Stats, Factions, God & Goddess Powers, Guardian Castles |
| **Progression** | How the player grows over time | World Map & Regions, Campaign Level Data, Stars & Rewards, Unit Cards & Upgrades, Faction Collection & Unlocks |
| **Economy** | Resource creation and consumption | Currencies & Economy |
| **Persistence** | Save state and continuity | Save & Progress, Settings |
| **UI** | Player-facing information displays | Level HUD, Menus & Screens, Collection & Upgrade Screens, Feedback & Juice |
| **Audio** | Sound and music systems | Audio |
| **Meta** | Systems outside the core game loop | Tutorial & Onboarding, Mobile Platform Integration, Accessibility |

(The Narrative category does not apply: the game has no story delivery system.)

---

## Priority Tiers

| Tier | Definition | Target Milestone | Design Urgency |
|------|------------|------------------|----------------|
| **MVP** | The UAT build (decided 2026-11-22), in two steps: UAT-1 = the core loop plus the campaign, 13 systems; UAT-2 = the army layer, 7 systems; no deadline for either. Without these, you can't test "is this fun, and does the map and army pull you on?" | UAT build (offline) | Design FIRST |
| **Vertical Slice** | Required for one complete, polished area. Demonstrates the full experience. | Vertical slice / demo | Design SECOND |
| **Alpha** | All features present in rough form. Complete mechanical scope, placeholder content OK. | Alpha milestone | Design THIRD |
| **Full Vision** | Polish, edge cases, nice-to-haves, and content-complete features. | Beta / Release | Design as needed |

Tier counts: MVP 20 · Vertical Slice 5 · Alpha 3 · Full Vision 0 (re-tiered 2026-11-22: Currencies & Economy, Stars & Rewards, Unit Roster & Stats, Factions, Unit Cards & Upgrades, Faction Collection & Unlocks and Collection & Upgrade Screens moved into MVP for the UAT build). The Full Vision tier holds
content volume (5 regions × 10 levels, 5 races), not additional systems.

Review gates: TD-SYSTEM-BOUNDARY, PR-SCOPE and CD-SYSTEMS were skipped (review mode: lean).

---

## Dependency Map

### Foundation Layer (no dependencies)

1. Screen Flow & Scene Manager — every screen change goes through it
2. Touch & Mouse Input — the only way the player acts on the match
3. Settings — volume and options read by Audio and the platform layer
4. Save & Progress — stores what every progression system needs to remember
5. Troop Generation — keep state (owner, troop count, tick) is the base of every match system

### Core Layer (depends on foundation)

1. Keep Levels — depends on: Troop Generation
2. Rope Links — depends on: Keep Levels, Touch & Mouse Input
3. Troop Marching & Clashes — depends on: Rope Links, Keep Levels, Troop Generation
4. Level State & Match Flow — depends on: Troop Marching & Clashes, Screen Flow & Scene Manager
5. Audio — depends on: Settings
6. Currencies & Economy — depends on: Save & Progress

### Feature Layer (depends on core)

1. Rival AI — depends on: Rope Links, Troop Marching & Clashes, Keep Levels, Level State & Match Flow
2. Unit Roster & Stats — depends on: Troop Marching & Clashes (contract), Keep Levels
3. Factions — depends on: Unit Roster & Stats, Troop Generation, Keep Levels
4. Unit Cards & Upgrades — depends on: Unit Roster & Stats, Currencies & Economy, Save & Progress
5. Faction Collection & Unlocks — depends on: Factions, Currencies & Economy, Save & Progress
6. Campaign Level Data — depends on: Keep Levels, Rival AI, Level State & Match Flow
7. World Map & Regions — depends on: Campaign Level Data, Save & Progress, Screen Flow & Scene Manager
8. Stars & Rewards — depends on: Level State & Match Flow, Currencies & Economy, World Map & Regions
9. God & Goddess Powers — depends on: Troop Marching & Clashes, Rope Links, Currencies & Economy, World Map & Regions
10. Guardian Castles — depends on: Rival AI, Campaign Level Data, World Map & Regions

### Presentation Layer (depends on features)

1. Level HUD — depends on: Keep Levels, Rope Links, Level State & Match Flow (and God & Goddess Powers when added)
2. Menus & Screens — depends on: Screen Flow & Scene Manager, Level State & Match Flow
3. Collection & Upgrade Screens — depends on: Faction Collection & Unlocks, Unit Cards & Upgrades, Currencies & Economy
4. Feedback & Juice — depends on: Troop Marching & Clashes, Keep Levels, Rope Links, Audio
5. Tutorial & Onboarding — depends on: Touch & Mouse Input, Rope Links, Level HUD, Campaign Level Data

### Polish Layer (depends on everything)

1. Accessibility — depends on: Level HUD, Menus & Screens, Settings
2. Mobile Platform Integration — depends on: Screen Flow & Scene Manager, Save & Progress, Settings

Bottleneck systems (many others depend on them): Troop Generation, Keep Levels, Troop Marching &
Clashes, Currencies & Economy, Save & Progress.

Leaf systems (nothing depends on them; can be designed late): Accessibility, Mobile Platform
Integration, Tutorial & Onboarding, Collection & Upgrade Screens, Guardian Castles.

---

## Recommended Design Order

| Order | System | Priority | Layer | Agent(s) | Est. Effort |
|-------|--------|----------|-------|----------|-------------|
| 1 | Troop Generation | MVP | Foundation | game-designer, systems-designer | M |
| 2 | Screen Flow & Scene Manager | MVP | Foundation | ux-designer, ui-programmer | S |
| 3 | Touch & Mouse Input | MVP | Foundation | ux-designer, gameplay-programmer | M |
| 4 | Save & Progress | MVP | Foundation | gameplay-programmer | S |
| 5 | Keep Levels | MVP | Core | game-designer, systems-designer | M |
| 6 | Rope Links | MVP | Core | game-designer | M |
| 7 | Troop Marching & Clashes | MVP | Core | game-designer, systems-designer | L |
| 8 | Level State & Match Flow | MVP | Core | game-designer | S |
| 9 | Unit Roster & Stats | MVP | Feature | systems-designer | L |
| 10 | Factions | MVP | Feature | game-designer, systems-designer | L |
| 11 | Rival AI | MVP | Feature | ai-programmer, game-designer | L |
| 12 | Campaign Level Data | MVP | Feature | level-designer | M |
| 13 | Currencies & Economy | MVP | Core | economy-designer | M |
| 14 | World Map & Regions | MVP | Feature | level-designer, ux-designer | M |
| 15 | Stars & Rewards | MVP | Feature | economy-designer, game-designer | S |
| 16 | Unit Cards & Upgrades | MVP | Feature | economy-designer, systems-designer | M |
| 17 | Faction Collection & Unlocks | MVP | Feature | economy-designer | M |
| 18 | Level HUD | MVP | Presentation | ux-designer, ui-programmer | M |
| 19 | Menus & Screens | MVP | Presentation | ux-designer | S |
| 20 | Collection & Upgrade Screens | MVP | Presentation | ux-designer | M |
| 21 | Settings | Vertical Slice | Foundation | ux-designer | S |
| 22 | Audio | Vertical Slice | Core | audio-director, sound-designer | M |
| 23 | Feedback & Juice | Vertical Slice | Presentation | technical-artist, sound-designer | M |
| 24 | Tutorial & Onboarding | Vertical Slice | Presentation | ux-designer | S |
| 25 | Mobile Platform Integration | Vertical Slice | Polish | technical-director, release-manager | M |
| 26 | God & Goddess Powers | Alpha | Feature | game-designer, systems-designer | L |
| 27 | Guardian Castles | Alpha | Feature | level-designer, game-designer | M |
| 28 | Accessibility | Alpha | Polish | accessibility-specialist | M |

Effort: S = 1 session, M = 2–3 sessions, L = 4+ sessions. Unit Roster & Stats and Factions were
ordered before Rival AI (2026-11-22) because the rival must play a race; with the UAT-1 / UAT-2 split
(later the same day) Rival AI was designed first for UAT-1, playing the baseline unit with no race
(its Core Rule 11), and the race question moved to UAT-2. Troop Marching & Clashes (order 7)
defines the `UnitStats` contract that Unit Roster (order 9) fills in.

---

## Circular Dependencies

- **Troop Generation ↔ Keep Levels:** Keep Levels derives a keep's level from its troop count, and Troop Generation picks the troops gained per beat from that level. Resolution (decided 2026-11-22): per game step Keep Levels recomputes the level first, then Troop Generation uses it on its next beat, so neither calls the other mid-step. Troop Generation owns `gen_amount[level]`; Keep Levels owns the level thresholds. Both GDDs must state the order.
- **Troop Marching & Clashes ↔ Unit Roster & Stats:** marching needs per-unit stats (speed,
  strength, size) and the roster defines those stats. Resolution: the Troop Marching & Clashes GDD
  defines a `UnitStats` contract; Unit Roster fills in values for each unit. Marching is designed
  first (order 7), the roster next (order 9).

---

## High-Risk Systems

| System | Risk Type | Risk Description | Mitigation |
|--------|-----------|-----------------|------------|
| Factions + Unit Roster & Stats | Design / Scope | 5 races, each with its own units and playstyle, create a large balance matrix; Rival AI must handle each | Prototype 2 races first; cut to 3 if balance stalls |
| Troop Marching & Clashes | Technical | Hundreds of pawns and clashes on a phone at 60 fps | Prototype 300+ pawns in Godot on a real phone early |
| Rival AI | Design | Must work across races, powers and regions without feeling unfair | Rule-based AI with per-region parameters; playtest each region |
| Mobile Platform Integration | Technical | Godot 4.7.2 is installed, but the iOS and Android export templates and export preset are unproven (`commands.build` not set); the UAT build must still run on a phone | Install the export templates and make a first Android export early in Technical Setup |
| Currencies & Economy | Design | Diamonds come only from region conquest in the UAT build (decided 2026-11-22); rare races could still be unlocked too fast or too slowly | Set per-region amounts and race costs in the GDD; check the pace with `/balance-check` |

---

## Open Questions

- ~~How are diamonds earned without in-app purchases?~~ Decided 2026-11-22: a fixed reward per conquered region. Amounts are the Currencies & Economy GDD's.
- ~~How is gold split between unit card upgrades and god power upgrades?~~ In the UAT build gold upgrades cards only; god powers come after UAT, so the split is decided then.
- Does the rival pick a race? One rival race per region? (Factions)
- Are the 5 races (human, beast, elf, spirit, dragon) all in the UAT build, and what is the unlock
  order and cost of each? (Factions, Faction Collection & Unlocks)

---

## Progress Tracker

| Metric | Count |
|--------|-------|
| Total systems identified | 28 |
| Design docs started | 13 |
| Design docs reviewed | 6 (all Needs Revision, revised, now In Review); 7 Designed, pending review |
| Design docs approved | 0 (the game concept is approved, 2026-11-22) |
| MVP systems designed | 13/20 (UAT-1: 13/13, all designed 2026-11-22; UAT-2 army layer 0/7) |
| Vertical Slice systems designed | 0/5 |
| Alpha systems designed | 0/3 |

---

## Next Steps

- [ ] Review and approve this systems enumeration
- [ ] Design MVP-tier systems first (use `/design-system [system-name]`)
- [ ] Run `/design-review` on each completed GDD
- [ ] Run `/gate-check technical-setup` when all 20 MVP (UAT build) systems are designed
- [ ] Validate the highest-risk systems with `/vertical-slice` before committing to Production
