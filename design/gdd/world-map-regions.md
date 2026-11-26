# World Map & Regions

> **Status**: Approved (2026-11-22, lean /design-review; see its review log)
> **Author**: user + Claude
> **Last Updated**: 2026-11-22
> **Last Verified**: 2026-11-22
> **Creative Director Review (CD-GDD-ALIGN)**: skipped — Lean mode
> **Implements Pillar**: 3. Paint the map, grow the army (`design/gdd/game-concept.md` § Pillars)

## Summary

World Map & Regions is the campaign screen: one fixed storybook map of the whole world in portrait, with each region an area and each level a node. It derives from Save & Progress's results which nodes are locked, unlocked or beaten and which regions are open, fogged or conquered; it plays the region-conquered sequence once and clears the next region's fog; and it hands a tapped node to Screen Flow as "open this level". It exists so progress is seen as paint on a map, not as a number.

> **Quick reference** — Layer: `Feature` · Priority: `MVP` (UAT-1) · Key deps: `Campaign Level Data, Save & Progress, Screen Flow & Scene Manager`

## Overview

World Map & Regions is where the player is between levels. It shows the whole campaign as one fixed map that fits a phone in portrait: regions are painted areas, levels are nodes placed on them, and regions the player has not reached lie under flat cool fog. Every time the map opens it reads the player's results from Save & Progress and derives the state of every node (locked, unlocked, beaten) and every region (fogged, open, conquered); nothing about unlocking is stored, so the map can never disagree with the results. When a region has just been conquered it plays the conquest sequence once, with the region's splash art and banners sweeping across it, records that the sequence has been shown, and then clears the fog from the next region. Tapping an unlocked node asks Screen Flow to open that level; tapping a locked one gives a short hint. The last node the player looked at is remembered so the map opens where they left it. In UAT-1 the map holds one lit region, the Green Vale, and four fogged shapes, so a tester feels the pull of the next region even before it exists. Without this system a win would be a number and the campaign a list.

## Detailed Design

### Core Rules

1. **One fixed map** (decided 2026-11-22). The whole campaign is one portrait image in map pixels (720 × 1,280 logical, the same frame as the table); it never scrolls or zooms. Each region is an area of the image with a `fog_shape` (its silhouette under fog) and a `banner_anchor`; each level is a node at a `node` position. These are data fields this GDD adds to Campaign Level Data's region and level records (its Open Question 2); their values are content.
2. **Node states are derived, never stored.** On every open, and again after each record this screen makes itself (rule 6), each level is classified from Save & Progress's results and Campaign Level Data's `next()` (F1). Save never calls back (its Interactions direction rule), and nothing else changes results while the map is showing: a match result is recorded before the map opens, and Delete progress sends the app to the Title (Save rule 11).
   - **Beaten**: the level's result has `beaten` true;
   - **Unlocked**: not beaten, and either it is the first level of the first region or `prev(level)` is beaten (`prev` is the inverse of `next`);
   - **Locked**: otherwise.
   A beaten level is always playable (replay), so Beaten implies tappable even if, through an edited file, its `prev` is not beaten.
3. **The current node** is the unlocked, unbeaten level with the lowest campaign order (F3). It is the "next to play" and is drawn pulsing. With every level beaten there is none.
4. **Region states are derived too** (F2): **Open** when its first level is unlocked or beaten; **Conquered** when every level in it is beaten; **Fogged** otherwise. Fogged regions show only their `fog_shape` under flat cool fog, with no nodes and no name (decided 2026-11-22). Open regions show every node, locked ones dim and nameless, so the player sees how far the region goes. Because unlocking is linear, beating a region's last level implies every level in it is beaten, so Screen Flow's last-level routing (its rule 10) and Campaign Level Data rule 7 agree with F2; F2 decides when they differ (an edited file).
5. **Unlocking a level unlocks nothing else**: the next node lights when the map next derives states. The only "event" on the map is a region changing state (rules 6 and 7); a node simply reads differently than last time.
6. **The conquest sequence plays once per region** (decided 2026-11-22). Save's stored "conquered regions" set means *celebration shown*, not conquest: conquest is F2. When the map opens or re-derives (rule 2) and a region is Conquered but not in Save's set, the map plays the sequence (Visual/Audio) and then that region's fog clear if there is one (rule 7), and only then calls `record_region_conquered(region)` and `flush()` (Save rule 6). Recording after the clear means a failed write's "could not be saved" message (Save rule 14, raised at once) can never appear between a sequence and its fog clear (cross-GDD review P4-W3); with several pending regions it appears before the next region's sequence, which then waits for it (below). If the app is killed before the record, the sequence plays again next time: a repeat is the safe failure, a lost celebration is not. **A sequence starts only when no overlay or message box is open over the map** (the player's decision, 2026-11-22): while one is open (for example a Save message held by Screen Flow rule 1), the map waits in Deriving and starts the sequence on the frame it closes. Once Settings exists (Vertical Slice; UAT-1 has no Settings button on the map), its map button is hidden while Celebrating or Clearing, so no overlay can open over a sequence.
7. **Fog clears once per region**, right after the sequence for the region before it. `region_after(R)` is the next region in campaign order that has at least one level (none if there is none). Right after R's sequence, if `region_after(R)` exists, its fog lifts over `fog_clear_time` and its nodes appear. Clearing needs no stored flag. F2 already reads `region_after(R)` as Open once R's last level is beaten (Campaign Level Data's `next()` crosses regions), so the trigger is "R's sequence just ended and `region_after(R)` exists", not "the next region is Fogged". **Until its clear has played in this visit, a region whose predecessor is still pending celebration is drawn fogged, with no nodes**, even though F2 reads it Open; at any other time an Open region is drawn clear. **Catch-up:** several conquered-but-uncelebrated regions (an imported or restored file) are handled one at a time in campaign order: R's sequence, then R's fog clear if `region_after(R)` exists, then Deriving, then the next pending region. A tap skips only the sequence that is playing.
8. **Tapping.** A tap on an Unlocked or Beaten node asks Screen Flow to open that level (payload: the level id) and calls `set_map_position(level)`. A tap on a Locked node shakes it and shows a one-line hint, "Beat [prev name] first" (text from the UAT-1 strings data file, `[prev name]` filled from Campaign Level Data), for `hint_time`; nothing else happens. A tap on fog does nothing. Taps during a sequence skip to its end (rule 11).
9. **Map position** is the last node tapped or returned from. On open, that node is highlighted (an outline, distinct from the current node's pulse) if it still exists and is tappable; otherwise the current node is. On a return from a level, the highlight comes from Screen Flow's return payload (the level the player came from) at once; `set_map_position` is also called with that level's id, but only once the map reaches Idle (after any pending sequences and clears), so the map makes no write while a sequence plays and no "could not be saved" message can be raised over one (decided 2026-11-22, cross-GDD review R3-W2; Screen Flow relies on this). With no scrolling there is no camera to restore; the position is a highlight only.
10. **Replay is allowed** on any Beaten node; Save merges a better result and counts the play (its rule 5). The node stays Beaten and, in UAT-1, shows no time and no stars (rule 12): best stars are drawn from UAT-2, and the best time is shown on the Win overlay (Menus & Screens F1), not on the map.
11. **Sequences are skippable and never block.** A tap during the conquest sequence or a fog clear jumps to its final frame; the record in rule 6 is made when the sequence and its fog clear (if any) have ended, whether reached or skipped. Input to nodes is ignored until the last sequence of the visit has ended or been skipped.
12. **Stars** (UAT-2). Nodes carry the stored best stars (0–3) and draw them once Stars & Rewards exists. In UAT-1 a Beaten node shows the banner only; `win_stars` 1 is stored but not drawn as a star, so the first appearance of stars is a real reward, not a retro-fit.
13. **UAT-1 content.** The Green Vale is region 1 with five nodes; regions 2–5 are Campaign Level Data region records (`order` 2–5) with `fog_shape` and `banner_anchor` and no level naming them (decided 2026-11-22, cross-GDD review B23), so they are Fogged and stay fogged after gv-05 is conquered: the conquest sequence plays, `next` is none, and no fog clears. **More to come** (decided 2026-11-22, cross-GDD review H6; closes Open Question 1): the first region with no levels that follows a Conquered region is drawn with a "More to come" mark over its fog (art, with its text from the UAT-1 strings data file), so after the Green Vale the map says region 2 is coming rather than ending in plain fog; regions further on stay plain fog. The mark is untappable.
14. **Data.** Node positions, fog shapes, banner anchors, `celebration_time`, `fog_clear_time`, `hint_time`, the "More to come" mark, and the pulse and highlight styles are data or art, never hardcoded; the hint and mark texts are in the UAT-1 strings data file.

### States and Transitions

The screen's states while it is the current screen (Screen Flow owns entering and leaving it).

| State | Meaning | Node input | Enter when | Leave when |
|---|---|---|---|---|
| Deriving | Results read; node and region states computed (F1–F3); pending sequences listed in campaign order | Ignored | Screen Flow shows the map; or a sequence, clear or record of this screen ends | Done → Celebrating if a region is pending and no overlay or message box is open (waits while one is open); else Idle |
| Celebrating | The conquest sequence for the first pending region R plays (`celebration_time`) | Tap skips to the end | A pending region and no overlay open | Ends or skipped → Clearing if `region_after(R)` exists; else record R and flush (rule 6), then Deriving (to pick up the next pending region or go Idle) |
| Clearing | `region_after(R)`'s fog lifts (`fog_clear_time`); until then it is drawn fogged | Tap skips to the end | R's celebration ended and `region_after(R)` exists | Ends or skipped → record R and flush (rule 6), then Deriving |
| Idle | Interactive: nodes tappable, hints, highlight and pulse | Full | No pending sequence | A node tap → Screen Flow transition (map leaves); Settings opens over it (Screen Flow) |

| From | Trigger | To |
|---|---|---|
| Idle | Tap Unlocked or Beaten node | Screen Flow: Level (the map is left; `set_map_position` called first) |
| Idle | Tap Locked node | Idle (shake and hint; no state change) |
| Idle | Settings button (Vertical Slice; hidden in Celebrating and Clearing) | Settings overlay over the map (Screen Flow); the map state is kept |
| Any | Screen Flow leaves the map | Gone; nothing is kept except through Save |

Deriving is instantaneous within a frame (a few dozen records). Back on the map is ignored (Screen Flow rule 6).

### Interactions with Other Systems

| System | Direction | What flows | Owner of the interface |
|---|---|---|---|
| Save & Progress | both | In: per-level results (`beaten`, stars, time), the conquered (celebrated) region set, the stored map position. Out: `record_region_conquered(region)` then `flush()`; `set_map_position(level)` | Save owns the stored shape; this GDD owns the unlock rule (Save rule 4, AC21) |
| Campaign Level Data | in | Regions and levels in order, names, `next()` and its inverse `prev()`; the `node`, `fog_shape` and `banner_anchor` fields this GDD defines | Campaign Level Data carries the fields; this GDD defines them |
| Screen Flow & Scene Manager | both | In: the map is shown (from Title, from a Win or Lose overlay, from Quit), with "where the player came from" (a level id or none). Out: "open this level" (level id). Settings opens over the map | Screen Flow (its rules 3, 7, 10; transitions table) |
| Level State & Match Flow | none direct | Level State records results; this GDD reads them through Save. Screen Flow's rule 10 sends a win on a region's last level back to this map, which plays the sequence | Level State rule 7 |
| Menus & Screens | out | The Win overlay's *Next level* button needs "is `next(level)` unlocked" (F1 on the result just recorded): this GDD exposes `is_unlocked(level_id)` for it. It is a pure query over Save's results and Campaign Level Data (F1), so it answers whether or not the map screen exists | Menus & Screens asks; this GDD answers |
| Stars & Rewards (UAT-2) | in | Stars per node from the stored results; the diamond reward on conquest is granted by Stars & Rewards when `record_region_conquered` fires | Stars & Rewards |
| Guardian Castles (Alpha) | in | A region's last node may be drawn as the guardian's castle (data) | Guardian Castles |
| God & Goddess Powers (Alpha) | in | A power unlocked on conquest is shown in the sequence (data) | God & Goddess Powers |
| Faction Collection (UAT-2) | out | Screen Flow adds a Collection button on the map (its note on Alpha transitions) | Screen Flow, Collection screens |
| Audio, Feedback & Juice (after UAT) | out | Events: `region_conquered_shown`, `fog_cleared`, `node_tapped`, `node_locked_tapped` | Those systems |

## Formulas

Three derivations and the sequence timings. Every input comes from Save & Progress results or Campaign Level Data; nothing here is stored.

### F1. Level state

The level_state formula is defined as:

```
beaten(L)   = result(L).beaten
unlocked(L) = beaten(L) ∨ first_of_campaign(L) ∨ beaten(prev(L))
state(L)    = Beaten if beaten(L); Unlocked if unlocked(L); else Locked
```

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| result(L).beaten | bool | — | calculated (Save & Progress) | Whether the level has ever been won |
| prev(L) | level or none | — | calculated (inverse of Campaign Level Data `next()`) | The level before L in campaign order |
| first_of_campaign(L) | bool | — | calculated (Campaign Level Data order; no stored field) | L is order 1 of the first region in campaign order |

**Output Range:** one of three states per level. With no results, exactly one level is Unlocked (`gv-01`) and the rest Locked. Beaten implies tappable, so the set of tappable nodes only grows.
**Example:** results {gv-01, gv-02 beaten}: gv-01 Beaten, gv-02 Beaten, gv-03 Unlocked, gv-04 and gv-05 Locked.

### F2. Region state

The region_state formula is defined as:

```
open(R)      = unlocked(first(R)) ∨ beaten(first(R))
conquered(R) = ∀ L ∈ R : beaten(L)         (R has at least one level)
state(R)     = Conquered if conquered(R); Open if open(R); else Fogged
celebrate(R) = conquered(R) ∧ R ∉ celebrated_set
```

**Variables:** `first(R)` (the order-1 level, data file); `celebrated_set` (Save's stored conquered-region set).
**Output Range:** a region with no levels (UAT-1's regions 2–5) is never Open and never Conquered: `conquered` is defined only for a region with at least one level, so an empty region is Fogged. `celebrate(R)` is true at most until the record is made.
**Example:** all five Green Vale levels beaten, `celebrated_set` empty: `gv` is Conquered and `celebrate(gv)` is true; after the record, false.

### F3. Current node and highlight

The current_node formula is defined as:

`current = the Unlocked level with the lowest campaign order, else none`; `highlight = stored_position if state(stored_position) ∈ {Unlocked, Beaten}, else current`

**Variables:** `stored_position` (Save's map position, a level id or none).
**Output Range:** `current` is one level or none (all beaten); `highlight` is one level or none (all beaten and no valid stored position). The two can coincide; the pulse and the outline then stack on one node.
**Example:** results {gv-01 beaten}, stored position gv-01: current gv-02 (pulse), highlight gv-01 (outline).

### F4. Sequence timings

The sequence_timings are defined as data values, in seconds, converted to frames at the display rate:

| Value | Type | Range | Source | Description |
|---|---|---|---|---|
| celebration_time | float, s | 1.5–6 (baseline 3.0) | data file | Length of the conquest sequence when not skipped |
| fog_clear_time | float, s | 0.5–3 (baseline 1.5) | data file | Fog lifting from the next region |
| hint_time | float, s | 1–4 (baseline 2.0) | data file | The locked-node hint stays this long |

**Output Range:** a conquest with a following region costs at most 4.5 s at baseline, and 0 if tapped through. `celebration_time` 0 would make the record fire on the frame the map opens with no visible moment, so the range floor is 1.5 s; the splash is the payoff (art bible Principle 3).
**Example:** conquering the Green Vale in UAT-1: 3.0 s of sequence, then no fog clear (`next` is none).

### Boundary check

Worked at the extremes (lens: systems-designer): no results → one Unlocked node, nothing Open but region 1; every result beaten → no current node, every region Conquered, and the celebrated set catches up one region per visit sequence; an empty region is Fogged by definition, so F2 cannot divide or quantify over nothing; a result for a level whose `prev` is unbeaten (an edited file) is Beaten and tappable (rule 2), never a dead node. No formula here has a numeric range that can degenerate; the timings have floors. No feedback loop: the map reads and draws.

## Edge Cases

- **If the app is killed during the conquest sequence or its fog clear, before `record_region_conquered`**: the set is unchanged, so the sequence plays again on the next visit. A repeat is accepted; a conquest that is never celebrated is not (rule 6).
- **If `flush()` fails after the record**: the celebrated set is Dirty in memory (Save AC8); Save raises "could not be saved" at once, and since the record is made after the region's fog clear, the message box shows over the map with nothing playing; any further pending region's sequence waits for it to close (rule 6). Save writes the set with the next change. A second kill before then repeats the sequence once more.- **If several regions are Conquered and uncelebrated at once** (a restored backup, an imported file): they are handled one at a time in campaign order (rule 7): sequence, then its fog clear if `region_after(R)` exists, then Deriving; one tap skips one sequence. A region waiting for its clear stays drawn fogged until the clear plays.
- **If progress is deleted** (Save rule 11, from Settings over the map, once Settings exists): the app goes to the Title. When the map next opens, every node relocks except `gv-01`, every region but the first fogs, the celebrated set is empty, and nothing plays: no region is Conquered.
- **If the stored map position names a level that no longer exists or is Locked**: the highlight falls to the current node (F3); Save keeps the orphan id untouched (its rule 10).
- **If a result exists for a level whose `prev` is not beaten** (an edited file, or content reordered by an update): the level is Beaten and tappable; its `prev` stays Unlocked or Locked by its own result. Nothing is "repaired".
- **If a region has no levels** (regions 2–5 in UAT-1): no Campaign Level Data level names it; Fogged, untappable, never celebrated. The art shows its `fog_shape`, plus the "More to come" mark if it is the first such region after a Conquered one (rule 13).
- **If `next(level)` crosses into a region with no levels**: `next` is none (Campaign Level Data F4 treats an empty region as absent); after gv-05 no fog clears and the Win overlay offers World Map only (Screen Flow rule 10).
- **If the player taps a node on the same frame a sequence starts**: the sequence wins; node input is ignored until sequences end (rule 11).
- **If the player taps a Locked node repeatedly**: the hint restarts its `hint_time` each tap; the shake does not stack.
- **If the player returns from a Lose overlay**: the map opens with that level highlighted (Screen Flow passes where the player came from); no sequence can be pending from a loss.
- **If the player returns from a Quit**: the same; `set_map_position` is called with the quit level, so the map opens there.
- **If an overlay would open during a sequence**: it cannot. The Settings button is hidden while Celebrating or Clearing (rule 6), and UAT-1 has no Settings button on the map at all. A message box already held when the map opens (Screen Flow rule 1) shows first; the sequence starts on the frame it closes.
- **If the display is not 9:16**: the map image is letterboxed or pillarboxed as the table is (Touch & Mouse Input's table scaling); node hit areas scale with it. No scrolling is introduced.
- **If a node's `node` position lies in another region's area** (an authoring error): a development warning at campaign load from Campaign Level Data's loader (B5, added to its bounds by this GDD); not an invariant, because the map still works.

## Dependencies

| System | Nature | Direction | What this GDD needs or gives | GDD status |
|---|---|---|---|---|
| Save & Progress | Hard | both | Results and the celebrated set in; `record_region_conquered`, `flush()`, `set_map_position` out | In Review |
| Campaign Level Data | Hard | in | Regions, levels, order, names, `next()`; the `node`, `fog_shape`, `banner_anchor` fields it carries for this GDD; region records for regions 2–5 in UAT-1 that no level names | In Review |
| Screen Flow & Scene Manager | Hard | both | Shown from Title, overlays and Quit with "where from"; "open this level" out; Settings over the map | In Review |
| Touch & Mouse Input | Soft | in | Taps on nodes and fog, through Screen Flow's routing; the frame scaling | In Review |
| **Depended on by** | | | | |
| Menus & Screens | Soft | out | `is_unlocked(level_id)` for the Win overlay's *Next level* button | In Review |
| Stars & Rewards (UAT-2) | Hard | both | Stars per node; the conquest record is its trigger for the diamond reward | Not yet designed |
| Guardian Castles, God & Goddess Powers (Alpha) | Soft | in | Node art and sequence content | Not yet designed |
| Faction Collection & Unlocks, Collection screens (UAT-2) | Soft | out | A Collection button on the map (Screen Flow transition) | Not yet designed |

**Bidirectional check.** Save & Progress names World Map & Regions (Interactions, Dependencies, AC21). Screen Flow names it (Interactions, rule 10). Campaign Level Data names it (Interactions, Open Question 2) and must gain the three fields this GDD defines. Level State names it (rule 7, Interactions). `systems-index.md` lists its dependencies correctly; add Menus & Screens and Stars & Rewards as dependents when their rows are written.

## Visual/Audio Requirements

Optional for a Progression system, but this one is a screen and the campaign's payoff, so it is stated. The register is the **frame** (art bible §1): anime splash art, not chibi. Art bible §2's World Map row sets the mood: pride in the blue already painted, pull toward the next node; warm late-morning light; fog cool and flat, medium contrast.
- **Regions** are painted areas of one image; a conquered region carries the player's royal blue and gold (banners at the `banner_anchor`, blue roof trim on its nodes), an open region the region's own light, a fogged region its `fog_shape` in flat cool fog with no detail (Principle 1: colour belongs to whoever owns it).
- **Nodes**: Locked dim and nameless; Unlocked lit with its name; Beaten with a blue banner (stars from UAT-2); the current node pulses; the highlighted node has an outline. Node silhouettes follow §3's UI shape grammar and must read at phone size; the UX spec sets sizes.
- **The conquest sequence** is the splash moment (Principle 3): the region's splash illustration in golden-hour light (§2 Victory row), banners sweeping across the region, the region name; `celebration_time` long. One tap skips it.
- **Fog clear**: fog lifts from the next region over `fog_clear_time` and its nodes appear dim, the first one lighting last.
- **Audio** (after UAT-1): a conquest sting, a soft fog-lift swell, a node tap tick, a muted "no" for a locked tap; the map's own music bed. Audio GDD owns them.
- Events raised for Feedback & Juice and Audio: `region_conquered_shown`, `fog_cleared`, `node_tapped`, `node_locked_tapped`.

`art-director` not consulted — Lean mode; the map's art direction is in the art bible's World Map rows and will need its own section when the art bible reaches regions. 📌 **Asset Spec** — after the art bible is approved, run `/asset-spec system:world-map-regions` for the map image, the Green Vale splash, fog shapes and node states.

## Game Feel

- **The map is a reward, not a menu.** Every return from a win should show something changed: a new banner, a lit node, a pulse that moved. The derive-on-open rule guarantees it; the UX spec should make the change readable within a second of the map appearing.
- **"One more region."** The brief's question for the map is whether it makes you want one more region. In UAT-1 that is tested with four fogged shapes and one conquest sequence; the playtest question is whether testers ask what is under the fog (Acceptance Criteria AC16).
- **Never in the way.** Sequences skip on one tap; the hint on a locked node lasts `hint_time` and never blocks a tap elsewhere; the map opens on the node the player last touched. Returning from a loss must feel like "again", not "where was I".

## UI Requirements

The World Map screen: one fixed portrait image; region areas; nodes in three states plus pulse and outline; a locked-node hint line; the conquest sequence and fog clear as full-screen moments; a Settings button (Vertical Slice) in a corner Screen Flow reserves; from UAT-2 a Collection button and stars on nodes. Node hit areas must meet the accessibility minimum the UX spec sets and never overlap. The map exposes `is_unlocked(level_id)` to Menus & Screens for the Win overlay's *Next level* button.

> **📌 UX Flag — World Map & Regions**: this system has UI requirements. In Phase 4 (Pre-Production), run `/ux-design world-map` to create its UX spec before writing epics. Stories that reference the map screen should cite `design/ux/world-map.md`, not this GDD directly. Note this in the systems index for this system.

## Cross-References

| This GDD relies on | In | What it relies on |
|---|---|---|
| Save & Progress | Rules 3, 4, 5, 6, 10, 11; AC21 | Stored results and sets; unlocks derived not stored; merge on replay; orphan ids kept; delete progress |
| Campaign Level Data | Rules 1, 2, 7; F4; Open Question 2 | Ids, order, names, `next()`; the node and fog fields |
| Screen Flow & Scene Manager | Rules 3, 5, 6, 7, 10, 11; transitions table | Payloads, overlays freezing the screen, Back ignored, win after a region's last level returns here, load failure |
| Level State & Match Flow | Rule 7 | Unlocks and conquest are this GDD's |
| game-concept.md | § World map, Pillars 3, Decisions | Fog, nodes, region conquest, UAT-1 content |
| design/art/art-bible.md | §1 Principles 1 and 3, §2 World Map and Victory rows, §3 UI shape grammar | The map's register and mood |

**Edits other documents need as a result of this GDD** (1–5 applied 2026-11-22):
1. `campaign-level-data.md`: add `node {x, y}` per level and `fog_shape`, `banner_anchor` per region to the record (rule 2); add bound B5 (a node lies inside its region's area, a development warning); close Open Question 2.
2. `screen-flow-scene-manager.md`: close its open question "whether *Next level* may skip the World Map after the last level of a region": no, the win returns to the map for the conquest sequence (its rule 10 stands).
3. `save-progress.md`: note that the stored conquered-region set means "celebration shown" and that conquest itself is derived here.
4. `systems-index.md`: row 11 → Designed with the GDD link; UX flag; progress tracker.
5. `design/registry/entities.yaml`: register `level_state` and `region_state` (formulas; Save and Menus & Screens cite them) and `celebration_time`, `fog_clear_time`, `hint_time` (constants).

## Acceptance Criteria

Baseline data: the Green Vale (gv-01 … gv-05) as the only region with levels; regions r2–r5 as fog shapes; `celebration_time` 3.0 s, `fog_clear_time` 1.5 s, `hint_time` 2.0 s. Tags: **[Logic]** automated test in `tests/unit/` against an in-memory results set; **[Integration: X]** in `tests/integration/`; **[UI]** retained screenshot in `production/qa/evidence/`; **[Playtest]** observed in UAT with the question recorded. `qa-lead` lens applied: every rule and formula has a criterion; boundaries are AC2, AC5, AC9.

- **AC1 [Logic] (F1)**: GIVEN no results, THEN gv-01 is Unlocked and gv-02 … gv-05 are Locked; GIVEN gv-01 and gv-02 beaten, THEN both are Beaten, gv-03 is Unlocked, gv-04 and gv-05 Locked.
- **AC2 [Logic] (F1 boundary, rule 2)**: GIVEN a result with gv-03 beaten and gv-02 not, THEN gv-03 is Beaten and tappable and gv-02 is Unlocked (gv-01 beaten) or Locked (not), by its own result.
- **AC3 [Logic] (F3)**: GIVEN gv-01 beaten and stored position gv-01, THEN current is gv-02 and highlight is gv-01; GIVEN stored position gv-04 (Locked), THEN highlight is gv-02.
- **AC4 [Logic] (F2)**: GIVEN four Green Vale levels beaten, THEN `gv` is Open and not Conquered; GIVEN all five, THEN Conquered; GIVEN r2 with no levels, THEN r2 is Fogged in both cases.
- **AC5 [Logic] (F2 boundary, rule 6)**: GIVEN all five beaten and the celebrated set empty, THEN `celebrate(gv)` is true; GIVEN the set contains gv, THEN false.
- **AC6 [Integration: Save & Progress] (rule 6)**: GIVEN the map opens with `celebrate(gv)` true, WHEN the sequence ends (or is skipped) and no fog clear follows (UAT-1: r2 has no levels), THEN `record_region_conquered(gv)` and `flush()` are called once, in that order, and the file holds gv in its conquered set; GIVEN r2 has levels, THEN the record is made only after r2's fog clear has ended (or been skipped).
- **AC7 [Integration: Save & Progress] (rule 6, kill)**: GIVEN the app is killed 1 s into the sequence, WHEN it restarts and the map opens, THEN the sequence plays again and the record is made at its end (after its fog clear, if any).
- **AC8 [Logic] (rule 7)**: GIVEN a second region r2 with levels and gv's last level just beaten (so F2 reads r2 Open), WHEN the map opens, THEN r2 is drawn fogged with no nodes while gv's sequence plays, a fog clear for r2 of `fog_clear_time` follows, and after it r2's first node shows Unlocked; GIVEN r2 has no levels (UAT-1), THEN no fog clear plays and r2 stays Fogged.
- **AC9 [Logic] (rule 7 boundary)**: GIVEN gv and r2 both Conquered and uncelebrated and r3 with levels, THEN the visit plays gv's sequence, r2's fog clear, r2's sequence and r3's fog clear in that order, with Deriving between them; gv is recorded after r2's clear and r2 after r3's clear; r2 and r3 are drawn fogged until their own clears; one tap skips only the sequence playing.
- **AC10 [Integration: Screen Flow] (rule 8)**: GIVEN Idle, WHEN gv-02 (Unlocked) is tapped, THEN `set_map_position(gv-02)` is called and Screen Flow receives "open this level" with gv-02; WHEN gv-04 (Locked) is tapped, THEN no transition, the node shakes and the hint "Beat Crossroads first" (`prev(gv-04)` = gv-03, Campaign Level Data names) shows for 2.0 s.
- **AC11 [Logic] (rule 11)**: GIVEN the sequence is 0.5 s in, WHEN the screen is tapped, THEN the sequence is at its final frame on the next frame and, with no fog clear to follow, the record is made; GIVEN a node is tapped during the sequence, THEN no transition happens.
- **AC12 [Integration: Save & Progress] (rule 9)**: GIVEN the player quits gv-03, THEN the map opens with gv-03 highlighted; GIVEN the stored position names gv-09 (unknown), THEN the highlight is the current node and Save's file still holds gv-09; GIVEN the player returns from winning gv-05 with gv pending celebration, THEN `set_map_position(gv-05)` is not called until the sequence has ended and the map is Idle, and Save receives no change while the sequence plays; GIVEN the player took *Next level* from gv-04 and then won gv-05, THEN gv-05 (the return payload), not gv-04, is highlighted from the first frame.
- **AC13 [Integration: Save & Progress] (rule 10)**: GIVEN gv-01 Beaten with time 95.0, WHEN it is replayed and won in 80.0, THEN the node stays Beaten and shows no time (rule 10), Save's `best_time(gv-01)` is 80.0 and its plays for gv-01 is 2.
- **AC14 [Integration: Save & Progress] (Edge: delete)**: GIVEN all five beaten and celebrated, WHEN progress is deleted from Settings over the map (Vertical Slice), THEN the app goes to the Title, and when the map next opens gv-01 is Unlocked, gv-02 … gv-05 Locked, gv is Open and no sequence plays.
- **AC15 [UI] (rules 1, 4, 12, 13)**: retained screenshots in `production/qa/evidence/` of the map on the minimum phone in portrait: fresh (gv-01 lit, four Locked dim nodes, r2–r5 fogged shapes), mid-region (two banners, a pulse, an outline), and after the conquest (five banners, the splash's final frame, r2–r5 still fogged, the "More to come" mark on r2 only). No stars drawn in UAT-1.
- **AC16 [Playtest] (Game Feel)**: after conquering the Green Vale, each UAT-1 tester is asked "what do you think is under the fog?"; 4 of 5 giving any answer other than "nothing / I didn't notice" passes. Each tester is also asked "Would you play region 2?" (the brief's "one more region" kill test, which UAT-1 cannot observe directly because region 2 has no levels); the answers are recorded for the go / no-go on UAT-2, and three or more "no" answers are reported as a kill-condition signal.
- **AC17 [Logic] (Interactions, Menus & Screens)**: GIVEN gv-02 just beaten, THEN `is_unlocked(gv-03)` is true and `is_unlocked(gv-04)` is false; GIVEN gv-05 just beaten, THEN `is_unlocked(next(gv-05))` is false because `next` is none.
- **AC18 [Logic] (rule 14)**: GIVEN `celebration_time` changed to 2.0 in the data file, THEN the unskipped sequence lasts 2.0 s with no code change.
- **AC19 [Integration: Screen Flow, Save & Progress] (rule 6, overlays)**: GIVEN `celebrate(gv)` true and a held "could not be saved" message box when the map opens, THEN the box shows first, no sequence plays under it, and the sequence starts on the frame the box closes; GIVEN Celebrating or Clearing (with Settings present, Vertical Slice), THEN the map's Settings button is not drawn and cannot be tapped.
- **AC20 [Logic] (rule 2)**: GIVEN the map is Idle, WHEN 600 frames pass with no tap, THEN no node or region state changes and Save is not called (there is no change signal to react to).
- **AC21 [Integration: Save & Progress, Screen Flow] (rule 6, failed record)**: GIVEN `celebrate(gv)` true, r2 with levels, and Save's next write set to fail, WHEN the sequence and r2's fog clear play, THEN no message box appears during either; after the clear, `record_region_conquered(gv)` and `flush()` are called, the flush fails, and "could not be saved" shows over the map with nothing playing.
- **AC22 [Logic] (rule 13, More to come)**: GIVEN UAT-1 data (r2–r5 with no levels) and gv not Conquered, THEN no region shows the mark; GIVEN gv Conquered, THEN r2 shows the "More to come" mark and r3–r5 do not; GIVEN the mark is tapped, THEN nothing happens.

**Coverage check.** Rules 1–14 each have a criterion (rule 1's fixed-map and rule 5's "nothing else unlocks" are AC15 and AC1); F1–F4 each have a typical and a boundary case; cross-system: AC6, AC7, AC10, AC12–AC14, AC17, AC19 (overlays during a sequence), AC21 (a failed record write); rule 2's no-signal derivation is AC20; rule 13's mark is AC22.

## Open Questions

| # | Question | Owner | Resolve by |
|---|----------|-------|------------|
| 1 | Closed (2026-11-22, cross-GDD review H6): the first level-less region after a Conquered one carries a "More to come" mark (rule 13); AC16 adds "Would you play region 2?" | — | — |
| 2 | Node sizes, hit areas, the pulse and outline styles, and the hint's placement | ux-designer (`/ux-design world-map`) | Pre-Production |
| 3 | The Green Vale splash illustration and the five region palettes and fog shapes | art-director (art bible regions section; `/asset-spec`) | Before the UAT-1 build |
| 4 | Closed (2026-11-22): the best time is shown on the Win overlay (Menus & Screens F1), not on the map; Beaten nodes stay banner-only in UAT-1 | — | — |
| 5 | Whether five regions on one fixed image stay readable as region counts grow (the brief says 5 × 10 provisional); a scrolling map would be a rule change here and in Screen Flow | game-designer, technical-director | Before region 3 |
| 6 | The diamond reward on conquest and where it is shown in the sequence | Stars & Rewards, Currencies & Economy | UAT-2 |
