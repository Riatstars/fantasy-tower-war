# Gate Check: Systems Design → Technical Setup

**Date**: 2026-11-22
**Checked by**: gate-check skill (review mode lean, `workflow: standard`, `qa.level: standard`, `team.size: individual`)
**Scope**: all 20 MVP systems as `design/gdd/systems-index.md` defines them (UAT-1's 13 plus UAT-2's 7), the user's choice

## Required Artifacts: 2/3 present

- [x] `design/gdd/systems-index.md`: 29 systems, MVP tier of 20 defined
- [ ] All MVP-tier GDDs exist and pass `/design-review`: 13/20 exist. Missing (Not Started, no GDD): Currencies & Economy, Stars & Rewards, Unit Roster & Stats, Factions, Unit Cards & Upgrades, Faction Collection & Unlocks, Collection & Upgrade Screens
- [x] Cross-GDD review report (recommended at `standard`): `design/gdd/gdd-cross-review-2026-11-22.md`, Focus: full, Verdict: CONCERNS (0 blocking open)

## Quality Checks

- [x] The 13 UAT-1 GDDs have the 5 standard sections plus Formulas (`gdd-structure-check.sh`). Player Fantasy (all 13) and Tuning Knobs (12) absent: advisory at `standard`
- [x] UAT-1 approval: 13/13 Approved in the index (re-read after session 7a set rows 3 and 10 to Approved on 2026-11-22, once its re-checks of the same-day fixes passed; the director panel saw 11/13)
- [x] `/review-all-gdds` verdict not FAIL (CONCERNS; covers the 13 UAT-1 GDDs only)
- [ ] Dependencies bidirectionally consistent: not checkable for the links UAT-1 GDDs make to systems with no GDD (Keep Levels → Factions; Troop Marching `UnitStats` → Unit Roster; Rival AI → Factions)
- [x] MVP priority tier defined
- [x] No stale GDD references among the 13: the Level HUD H1 / Campaign Level Data B6 touch-circle mismatch (keep_hit_lift) was fixed on 2026-11-22 with the user's approval; the user accepted the resulting 97 / 87 / 77 px top bands on gv-03 / gv-04 / gv-05
- [x] `docs/consistency-failures.md`: one entry (Input F6), resolved

## Director Panel Assessment

Technical Director: NOT READY
  The 7 missing GDDs feed Technical Setup's first ADRs: the save schema (currencies, card levels, unlocked factions) and the data-file shape (Unit Roster fills Troop Marching's `UnitStats`; Factions modifies Troop Generation and Keep Levels). Open questions (does the rival pick a race; how many races ship) shape Rival AI and level data. UAT-1 alone is sound to architect from (sections, clean registry, resolved cycles, engine pinned to 4.7.2).

Producer: NOT READY
  7 required GDDs absent; the dependency map cannot be checked both ways for the links into them. Concerns: 2 GDDs still In Review; nothing committed since 61f3f07 while two sessions edited GDDs, logs, index and registry in parallel; the cross-review needs another pass once all 20 exist. No deadline; the 7 GDDs are about 14–22 design sessions (low confidence, no velocity history).

Panel: 2 of 4 (`workflow: standard`). Creative and Art perspectives were not consulted; set `modes.rigor` (or `modes.workflow`) to `full` for the complete panel.

## Blockers

1. **7 UAT-2 MVP GDDs do not exist.** Design them in the index's order, starting with `/design-system` for Unit Roster & Stats.
2. **Dependency map not checkable both ways** for the UAT-1 links into those systems, until their GDDs exist.

## Recommendations

- Commit the 2026-11-22 work (13 GDDs, review logs, index, registry) to a known-good point, coordinating with session 7a.
- After the 7 GDDs exist and pass `/design-review`, run `/review-all-gdds` on all 20, then re-run this gate.
- Alternative (the user's call, declined on 2026-11-22): re-scope the gate to UAT-1 with provisional save and data-format ADRs.

## Verdict: FAIL

Chain-of-Verification: 5 questions checked (2 by tool: the index rows for the 7 UAT-2 systems, and the cross-review verdict line); verdict unchanged.

Stage unchanged: `project.stage` stays Systems Design; `production/stage.txt` not written.
