# Review Log: Rival AI

## Review — 2026-11-22 — Verdict: NEEDS REVISION
Review mode: lean · Workflow: standard
Scope signal: M
Specialists: none (lean mode; independent reviewer subagent per GDD, batch review of all 13 UAT-1 GDDs)
Blocking items: 6 | Recommended: 8 (logged; full report lists more)
Summary: Structurally complete with correct worked arithmetic, but the headline stall breaker cannot attack player keeps of 56+ troops (two full sides never fight) and needs ~180 s to reach full strength. Also: cut/retie churn, a self-contradictory F5 sentence, unspecified RNG draw order, and a seed contract that contradicts Campaign Level Data.
Prior verdict resolved: First review
Findings:
- [BLOCKING] Core Rule 8 / F3: stall breaker cannot attack keeps >= 56 troops or within 4 of rival; standoffs possible (contradicts Level State OQ1)
- [BLOCKING] Formulas F4: stall breaker reaches full strength only at ~180 s; inert inside 2–3 min levels
- [BLOCKING] Formulas F5: cut_outgrown and counter case cut and re-tie every think interval
- [BLOCKING] Formulas F5 prose: relieve_ratio 0 sentence contradicts itself
- [BLOCKING] Determinism / AC2 / AC21: candidate iteration and rng() draw order, first interval draw time unspecified
- [BLOCKING] Dependencies: rival_seed fallback and per-attempt seed contradict Campaign Level Data B4/Rule 6; AC22 vs AC21 citation
- [RECOMMENDED] Formulas F1: safe interval floor stated as 1 s and 2 s; warning on wrong quantity
- [RECOMMENDED] Formulas F1: floor is 5 steps not 4; rounding rule unstated
- [RECOMMENDED] Formulas F5: cut_relieved at threat 0 never fires (< vs <=)
- [RECOMMENDED] Core Rule 5: rope_min_age > vs >=; boundary AC missing
- [RECOMMENDED] Formulas F2: enemy_of unused
- [RECOMMENDED] Game Feel: 'only nearly empty keeps get hit' holds only under ~10 troops
- [RECOMMENDED] Formulas: counter case ignores aggro; state intent
- [RECOMMENDED] Dependencies / registry: stale text; think_interval and target_score ranges wrong
Reviewed-Content-Hash: design/gdd/rival-ai.md e0e287ad97d596b9b8d052cda2223f92ac34b7b2
Reviewed-Content-Hash: design/registry/entities.yaml b7664dbf04df5012d7e1f5b7b57847ac142c8b18
Reviewed-Content-Hash: .claude/skills/design-review/SKILL.md 4dcc8b81162613c757144532f1b72708ab3ba27f
Reviewed-Content-Hash: design/gdd/game-concept.md b9ec7dd07d6d43c3e9abb1208bac711ad23ae758
Reviewed-Content-Hash: design/gdd/systems-index.md 54c5d0974e9b80218fa4082ceb37e11bdc86e243
Reviewed-Content-Hash: design/game-brief.md 7d90b94906b28807d72b86ade5f754d9a7c62b75
Reviewed-Content-Hash: design/gdd/troop-generation.md d2ba2132b296666c69bd0b6d907fd2cefcb86807
Reviewed-Content-Hash: design/gdd/screen-flow-scene-manager.md 9975a503dc7d44abe22ef17ff94d0493e64a9c3b
Reviewed-Content-Hash: design/gdd/touch-mouse-input.md de1ed35ff80383c98c2c10d44ca5e85879e374cd
Reviewed-Content-Hash: design/gdd/save-progress.md 3b92d24ced6af243a993988b6efce966e26168eb
Reviewed-Content-Hash: design/gdd/keep-levels.md 433e135e0ec091348cab95776797287a08b45452
Reviewed-Content-Hash: design/gdd/rope-links.md b1365d0079062d78e6df7717049529eed24684ce
Reviewed-Content-Hash: design/gdd/troop-marching-clashes.md 87568f6fda3fd88a5ebb4037f76a1452d059af2f
Reviewed-Content-Hash: design/gdd/level-state-match-flow.md 0afcc7e7fd677decb4695e9ce54e31cc2b507482
Reviewed-Content-Hash: design/gdd/campaign-level-data.md 7567d1fa919a440208355e083ec8ce685b34a552
Reviewed-Content-Hash: design/gdd/world-map-regions.md e1b4c51ac0ba108f25b3fcb5d35e6bddbae0aada
Reviewed-Content-Hash: design/gdd/level-hud.md c0946163f4a8610ac9cedcba8d8ad342997ba759
Reviewed-Content-Hash: design/gdd/menus-screens.md 2ff1faab335ff570b4796954f02788d5649c17f0

## Review — 2026-11-22 — Verdict: NEEDS REVISION
Review mode: lean · Workflow: standard
Scope signal: M
Specialists: none (lean mode; independent reviewer subagent per GDD, batch re-review of all 13 UAT-1 GDDs after the cross-doc cluster fixes)
Blocking items: 3 | Recommended: 11 (logged; full report lists more)
Summary: Draw order and the seed contract are resolved and consistent with Campaign Level Data. Still open: the stall breaker cannot attack player keeps of 56+ troops, and the counter case re-ties ropes cut_outgrown just cut; new: its global divisor knobs have no bad-data rule and the boundary check wrongly says F3 has no division.
Prior verdict resolved: Partly (2 resolved, 2 open, 2 downgraded to recommended by this reviewer)
Findings:
- [BLOCKING] Rule 8 / F3: stall breaker cannot attack keeps >= 56 troops; 'no standoff' false; Level State OQ1 closed on it (prior)
- [BLOCKING] F3 counter case + F5 cut_outgrown: cut and re-tie every think interval (prior)
- [BLOCKING] Boundary check / F3 / F4 vs bad-data policy: dist_scale, stall_time, ai_think_scale, jitter have no clamp or reject; 'F3 has no division' is false
- [RECOMMENDED] F4 ~180 s ramp (downgraded from blocking: decided tuning)
- [RECOMMENDED] F5 relieve_ratio 0 prose (downgraded from blocking)
- [RECOMMENDED] Rule 5 > vs >=; rope age interface; Rule 4 ties take effect on this step
- [RECOMMENDED] F1 floor 5 steps; safe floor 1 s vs 2 s
- [RECOMMENDED] Edge case 'no rival keep' vs States; F2 enemy_of unused
- [RECOMMENDED] Registry think_interval and target_score ranges stale
- [RECOMMENDED] Dependencies stale; Game Feel claim
- [RECOMMENDED] AC3/AC8/AC19/AC21b/AC22 rewrites
Revisions applied 2026-11-22 (user-approved, cross-document round 2): Rule 4 cut and tie timing; anti-churn guards: no re-tie of a rope cut in the same pass, counter case skips an outgrown target (blocker resolved; AC17b); tuning-file knobs clamp at app start and the false 'F3 has no division' line fixed (blocker resolved). Stall-breaker attack gate still open, pending a player decision. Status stays Needs Revision pending the per-document blockers.
Reviewed-Content-Hash: design/gdd/rival-ai.md 8f0066ad441e1b50a073383b5333d6785646140e
Reviewed-Content-Hash: design/registry/entities.yaml 7c078a61a2fe209d71cee39822db4cfe17d257ff
Reviewed-Content-Hash: .claude/skills/design-review/SKILL.md 4dcc8b81162613c757144532f1b72708ab3ba27f
Reviewed-Content-Hash: design/gdd/game-concept.md b9ec7dd07d6d43c3e9abb1208bac711ad23ae758
Reviewed-Content-Hash: design/gdd/systems-index.md 51f7eff69a32aa0925544e25a07136f03d38cbdc
Reviewed-Content-Hash: design/game-brief.md 7d90b94906b28807d72b86ade5f754d9a7c62b75
Reviewed-Content-Hash: design/gdd/keep-levels.md 433e135e0ec091348cab95776797287a08b45452
Reviewed-Content-Hash: design/gdd/troop-generation.md d2ba2132b296666c69bd0b6d907fd2cefcb86807
Reviewed-Content-Hash: design/gdd/save-progress.md 3b92d24ced6af243a993988b6efce966e26168eb
Reviewed-Content-Hash: design/gdd/screen-flow-scene-manager.md c8b26b4e46cf9a8ba069ffc75f27449a55b95cfb
Reviewed-Content-Hash: design/gdd/touch-mouse-input.md d453343269b2416d6cbd716a7007db31148516c7
Reviewed-Content-Hash: design/gdd/rope-links.md c06a1b8927af3ccfef88c465d044bf401ea36e4a
Reviewed-Content-Hash: design/gdd/troop-marching-clashes.md 04ae0014fd6dd5849c0bfe1429a938a42ff32a0b
Reviewed-Content-Hash: design/gdd/level-state-match-flow.md 8da5b7c5570dba901a2a6e35f3df86e916ff7356
Reviewed-Content-Hash: design/gdd/campaign-level-data.md 696e3c5a30618c724a9e8ae08d1de9296edd3f96
Reviewed-Content-Hash: design/gdd/world-map-regions.md e1b4c51ac0ba108f25b3fcb5d35e6bddbae0aada
Reviewed-Content-Hash: design/gdd/level-hud.md c0946163f4a8610ac9cedcba8d8ad342997ba759
Reviewed-Content-Hash: design/gdd/menus-screens.md c20ff536a7a8e07072c2e2602fecb9c1318a740e
