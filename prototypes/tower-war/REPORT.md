<!-- PROTOTYPE - NOT FOR PRODUCTION -->
# Concept Prototype Report: Tower War

> **Date**: 2026-11-22 (prototype built and played 2026-11-21 to 2026-11-22; report written afterwards from the play notes)
> **Prototype Path**: HTML
> **Concept File**: design/gdd/game-concept.md (from design/game-brief.md)

---

## Hypothesis

If the player ties and reroutes rope links between keeps that grow from level 1 to 3, a 2–3 minute map plays as a tug-of-war rather than busywork, evidenced by the player wanting to tune and replay it rather than drop it after two tuning rounds (the brief's kill condition).

---

## Riskiest Assumption Tested

That standing ropes (persistent supply lines, cut and retie) are a fun verb on their own, without per-send decisions. It held: after two tuning rounds the player chose to continue (verdict below). Pacing was the weak point before tuning: the rival felt overwhelming and generation outpaced attacks.

---

## Approach

A one-shot browser game in `prototypes/tower-war/` (`index.html`, tuning values in `config.js`): 5 maps, player, rival and neutral keeps, generation, levels 1–3, rope tie and cut, capture, win and lose, one rule-based AI rival. Tuned over two iteration rounds driven by the player's play notes (`evidence/changes.tsv`, screenshots in `evidence/`).

**Path chosen:** HTML
**Reason for path:** the question was about the loop (is rope management a tug-of-war?), which a browser build answers fastest; no engine was installed at the time.

**Shortcuts taken (intentional):**
- Placeholder diorama art (stone keeps, pawn figures), not the anime pixel art of the brief
- No world map, save, races or cards; maps are a fixed ladder
- Tuning values hardcoded in `config.js`; rival behaviour in a few parameters (`ai_think_scale`, `ai_grace`, `ai_min_send`)
- Browser input only (mouse and touch emulation), not tested on a phone

---

## Result

From the player's play notes (`design/game-brief.md`, "After play" lines) and the change log:

- **Round 1** — sending should not drain the sender (a keep loses troops only when attacked); the rival played too fast and felt overwhelming; two keeps roping each other should have their marches clash and kill each other mid-rope. All three were changed (free sending, rival thinks 1.8× slower with a 60 s grace on map 1, side-by-side lanes with mid-rope clashes).
- **Round 2** — on a computer, left mouse ties and right mouse cuts, with a bigger keep click area (52 → 78 px); matches could stall, so ropes became unlimited in length and a full keep (60 troops) relays arriving allies down its ropes instead of losing them; two allied keeps may not rope each other both ways; generation was too fast (enemy pawns arrived but could not wear a keep down), so the beat slowed from 1.0 s to 2.5 s.
- After round 2 the player moved on to the full design (world map, races, cards) rather than another tuning round.

---

## Metrics

| Metric | Value |
|--------|-------|
| Path used | HTML |
| Iterations to playable | N/A (HTML path); 2 tuning rounds after the first build |
| Prototype duration | about 2 days, 2026-11-21 to 2026-11-22 (not timed) |
| Playtesters | 1 internal (the player) / 0 external |
| Feel assessment | Before round 1 the rival overwhelmed the player; before round 2 generation outpaced attacks so captures stalled. Both tuned; rope tie/cut on mouse needed separate buttons |
| Hypothesis verdict | CONFIRMED (the player, 2026-11-22) |

---

## Recommendation: PROCEED

The player played two rounds, asked for specific changes each time (pacing, clashes, controls, stall breakers) and then chose to continue into the full design rather than stop or rethink the loop, so the kill condition ("busywork after two tuning rounds") did not fire. The evidence is one internal tester on a browser build, so feel and performance still need confirming in Godot on a phone.

---

## If Proceeding

- **Core tuning values discovered:** generation beat 2.5 s with 1 / 2 / 3 troops by level; levels at 15 and 35 troops; cap 60; one pawn every 0.6 s per rope; pawn speed 110 px/s; keep hit radius 78 px; rival thinks 1.8× slower with a 60 s grace on map 1.
- **Assumptions confirmed:** ropes as standing supply lines are the one verb; levels as rope capacity read clearly; neutral garrisons give the opening race.
- **Assumptions disproved:** sending should not cost the sender troops; a short rope range stalls matches; losing pawns at a full keep feels wrong.
- **Emergent mechanics:** mid-rope clashes as a visible front line; relay chains through full keeps (later found to need a limit in rings, Troop Marching & Clashes rule 13); the ban on two-way ropes between allies.

> Note: the HTML path was used. Confirm feel (touch on a phone) and pawn performance in Godot before Production.

**Next steps:**
1. `/design-review design/gdd/game-concept.md`
2. `/gate-check systems-design`
3. Continue the remaining GDDs in `design/gdd/systems-index.md` design order

---

## If Pivoting

Not applicable (PROCEED).

---

## If Killing

Not applicable (PROCEED).

---

## Lessons Learned

- **What assumptions were broken by actually building this?**
  That sending costs the sender troops (it made defence and attack the same resource and felt bad), and that a rope range is needed (it caused stalled matches).
- **What surprised us that didn't show up in the brainstorm?**
  Pacing dominated the feel: the rival's speed and the generation rate mattered more than any rule. Full keeps needed somewhere to send arrivals.
- **What would we test differently next time?**
  Time each match and log captures per minute, test on a phone from the first round, and run a second tester.

---

> *Prototype code location: `prototypes/tower-war/` (a one-shot).*
> *No production code may import from it. The Godot game is built from the GDDs; the one-shot grows only through `/prototype`'s grow step, never by editing it into production.*
