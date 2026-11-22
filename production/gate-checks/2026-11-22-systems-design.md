# Gate Check: Concept → Systems Design

**Date**: 2026-11-22
**Checked by**: gate-check skill
**Tier**: `workflow: standard`, `review_mode: lean`, `qa.level: standard`, `team.size: individual`

### Required Artifacts: 1/1 present
- [x] `design/gdd/game-concept.md` — exists, 4.9 KB, all 8 sections have content

### Recommended (CONCERNS if absent at `standard`): 0/3
- [ ] Game pillars — none (no `design/gdd/game-pillars.md`, no pillars section; all 7 GDDs say "Implements Pillar: none")
- [ ] Visual Identity Anchor in `game-concept.md` — absent there; the one-line rule and 3 principles exist in `design/art/art-bible.md` §1
- [ ] Concept prototype `REPORT.md` with PROCEED — absent; the prototype was played over two iteration rounds ("After play" lines in `design/game-brief.md`, `prototypes/tower-war/`), but no verdict against the kill condition is recorded

### Quality Checks: 2/3 passing
- [ ] Game concept reviewed — **no** (user, 2026-11-22); no `/design-review` log in `design/gdd/reviews/`
- [x] Core loop described — `game-concept.md` §1, §3; `design/game-brief.md` § Core loop
- [x] Target audience identified — `design/game-brief.md:107`, still *(provisional)*; not stated in the concept

### Director Panel Assessment (2 of 4, `workflow: standard`)

Technical Director: CONCERNS
- Feasible on Godot 4.7 Compatibility + Physics 2D; editor 4.7.2 installed (`project.yaml` engine.path; `VERSION.md` change uncommitted)
- `systems-index.md` § High-Risk Systems still says "Godot is not yet installed"; the real risk is unproven iOS/Android export (`commands.build` TODO)
- Pawn performance unproven in Godot (prototype ran on web, `prototypes/tower-war/evidence/check-run.yaml`); AC-M43 budget unmeasured — does not block GDD writing
- Concept not reviewed and stale (Open questions lines 85–91 spliced answers; §6 says art bible not written; no races/cards/diamonds)

Producer: CONCERNS
- Scope grew without a baseline: `systems-index.md` adds a 6-system collection layer (#15, 21–24, 27) absent from brief and concept; 28 systems vs the brief's 7
- Monetisation stated four ways (concept: later; index: none; brief build order step 4: included; task-list A: drop)
- 28 systems unrealistic for one person; the 13 MVP systems are realistic; 6 MVP GDDs remain
- Tracking drift: task-list E7 unchecked, index progress tracker 6/13 (7 written); six GDDs await re-review
- Recommendation: one decision "UAT build = MVP tier" aligned across brief, concept and index; defer the collection layer and task-list section C questions 1–4

Creative Director and Art Director not consulted (panel width set by `workflow: standard`). Raise `modes.rigor` to `full` (or set `modes.workflow: full`) for the full panel.

### Blockers
None.

### Concerns
1. Concept not reviewed and out of date (Open questions answers spliced mid-sentence at lines 85–91; §6 line 66 "art bible not yet written"; races, cards, diamonds missing) → finish the edits, then `/design-review design/gdd/game-concept.md`
2. Scope and monetisation inconsistent across brief, concept, systems index and task list → one player decision ("UAT build = MVP tier")
3. No game pillars
4. Visual Identity Anchor not in the concept (exists in art bible §1) → one-line pointer
5. No prototype `REPORT.md` / recorded PROCEED verdict
6. Housekeeping: stale High-Risk table and progress tracker in `systems-index.md`; task-list E7; uncommitted Godot setup files (`project.yaml`, `project.godot`, `docs/engine-reference/godot/VERSION.md`, `.gdignore` files); `.godot/` likely needs a `.gitignore` entry

### Recommendations
- Settle scope first (concern 2), then update the concept (concern 1) and review it; add a pillars section and the Visual Identity pointer in the same pass (concerns 3, 4)
- Write a short `prototypes/tower-war/REPORT.md` with the play verdict (concern 5)
- Re-run `/gate-check systems-design`

### Verdict: CONCERNS
Required artifact present; no blockers. Stage stays at **Concept** (no risks accepted).

Chain-of-Verification: 5 questions checked (2 by file checks: concept section contents; the stale art-bible line) — verdict unchanged.
