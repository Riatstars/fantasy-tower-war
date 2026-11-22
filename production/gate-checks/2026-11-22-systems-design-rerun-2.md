# Gate Check: Concept → Systems Design (third run)

**Date**: 2026-11-22
**Checked by**: gate-check skill
**Tier**: `workflow: standard`, `review_mode: lean`, `qa.level: standard`, `team.size: individual`
**Follows**: `2026-11-22-systems-design.md` (CONCERNS), `2026-11-22-systems-design-rerun.md` (CONCERNS)

### Required Artifacts: 1/1 present
- [x] `design/gdd/game-concept.md`: all 8 sections have content

### Recommended: 3/3 present
- [x] Pillars, Visual Identity Anchor in the concept, `prototypes/tower-war/REPORT.md` (PROCEED)

### Quality Checks: 3/3 passing
- [x] Concept reviewed: APPROVED (lean), `design/gdd/reviews/game-concept-review-log.md:30`; the directors confirmed the receipt hashes match the file
- [x] Core loop described
- [x] Target audience identified (provisional, in the concept at line 23)

### Director Panel Assessment (2 of 4, `workflow: standard`)

Technical Director: READY
- Engine pin matches the install; 2D Compatibility renderer; the risky 4.5–4.7 features are 3D or post-processing and do not apply
- Performance budgets written down; phone targets AC31 and AC-M43 unconfirmed, to be measured before Pre-Production
- The level 1 first-rope rule adds no engine risk
- iOS/Android export and the on-phone pawn test planned for early Technical Setup

Producer: CONCERNS
- Nothing blocks entry; of the six earlier concerns, audience and task list resolved, review and Alpha wording mostly resolved, race count and UAT date open
- Race count due before Unit Roster & Stats (design order 9); fallback: 2 races first, cut to 3 if balance stalls (`systems-index.md:234`)
- No UAT date; scope could not be judged against a timeline
- The approved concept and its log were uncommitted
- The first-rope clock conflicts with Troop Generation rule 5 ("Generation is unconditional"); the brief omitted the generation freeze
- `task-list.md:35` unticked although the review is done

Creative Director and Art Director not consulted (panel width set by `workflow: standard`). Raise `modes.rigor` to `full` (or set `modes.workflow: full`) for the full panel.

### Blockers
None.

### Changes made after the panel ran (2026-11-22, at the user's request)
- UAT target date set by the user: **30 November 2026**; recorded in `design/game-brief.md` (Build order) and `production/task-list.md`
- Rule 5 exception written into `design/gdd/troop-generation.md` (rule 5): on level 1 nothing generates until the first rope; Level State & Match Flow owns the clock
- `design/game-brief.md:63` now states the generation freeze
- Task list line 35 ticked; new task item: Level State & Match Flow GDD must carry the rule 5 exception
- These edits changed `troop-generation.md` and `design/game-brief.md` after the review receipt was stamped: both read CHANGED against the concept's review log. The concept file itself is unchanged and its APPROVED verdict stands; the sibling edits only add wording that the concept already states

### Concerns (open)
1. Approved concept, its review log and today's edits are not committed
2. UAT race count undecided; decide before Unit Roster & Stats (order 9), or hand it to that GDD with the 2-race fallback
3. **New: the 30 November date is 8 days away.** Systems Design alone is estimated at 45–55 sessions (13 GDDs to write, 7 reviews pending, `/review-all-gdds`), before Technical Setup, code and UAT. The date and the 20-system scope do not fit together as recorded; one has to move (`/cut`, `/scope-check`). Added to the task list
4. About 25 "Alpha" army labels remain in the sibling GDDs; tracked at `task-list.md` for each GDD's re-review
5. Level State & Match Flow GDD (next, order 8) must record the rule 5 exception from its side

Resolved since the last run: audience in the concept; task-list housekeeping; generation-freeze wording in the brief; rule 5 exception in Troop Generation; UAT date recorded.

### Recommendations
- Commit the concept, review log and edits before the next GDD
- Resolve concern 3 first: it changes what the remaining design work should be
- Decide the race count while settling the scope
- Then `/design-system level-state-match-flow`

### Verdict: CONCERNS
Stage stays at **Concept**: the user gave the date and the rule 5 fix but did not accept the risks or ask to advance (2026-11-22).

Chain-of-Verification: 5 questions checked (2 by tool action: `troop-generation.md` rule 5 wording; `task-list.md` line 35) — both confirmed the Producer; verdict unchanged.

### Addendum (2026-11-22, after the report)
The user chose Option A: UAT split into **UAT-1** (13 core systems, target 30 November 2026) and **UAT-2** (7 army-layer systems, date open). Recorded in `game-concept.md` § Decisions, `game-brief.md`, `systems-index.md` and `task-list.md`. Concern 3 is now a recorded schedule risk, not an unresolved mismatch: the rough estimate for UAT-1 is about 20 December 2026, so 30 November stays a high-risk date; re-check after about 5 more GDDs. Concern 2 (race count) is no longer due before Unit Roster & Stats for UAT-1; it moves with the army layer to UAT-2. The concept file changed (Decisions section), so its review receipt reads CHANGED; the APPROVED verdict covered the concept as reviewed, and this edit records a player decision only. Verdict and stage unchanged: CONCERNS, stage Concept.

**Later the same day: the user removed the deadline** ("assume there is no deadline"). The 30 November target and the schedule-risk concern 3 no longer apply; the UAT-1 / UAT-2 split stays. The files above were updated to say "no deadline".
