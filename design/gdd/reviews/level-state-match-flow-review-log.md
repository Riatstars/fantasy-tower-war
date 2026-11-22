# Review Log: Level State & Match Flow

## Review — 2026-11-22 — Verdict: NEEDS REVISION
Review mode: lean · Workflow: standard
Scope signal: M
Specialists: none (lean mode; independent reviewer subagent per GDD, batch review of all 13 UAT-1 GDDs)
Blocking items: 5 | Recommended: 7 (logged; full report lists more)
Summary: A thorough GDD with formulas that hold at the boundaries and mostly testable ACs. Blockers: the result record lacks Screen Flow's 'keeps captured' field, F4 contradicts AC16 at end_delay 0, float rounding breaks determinism, clock_started is unspecified for non-waiting levels, and the Ending delay counter is under-defined.
Prior verdict resolved: First review
Findings:
- [BLOCKING] Core Rules / Interactions: result record has 4 fields; Screen Flow requires keeps captured
- [BLOCKING] Formulas F4 vs AC16: request step D vs D+1 at end_delay 0
- [BLOCKING] Rule 11 / AC22: float hazards (ceil(0.1*60)=7; half-rounding) break determinism
- [BLOCKING] Core Rule 2 / AC5: clock_started not specified for non-waiting levels (Rival AI waits on it)
- [BLOCKING] States: Ending delay counter mechanism and pause_allowed in Closed undefined
- [RECOMMENDED] Dependencies: stale 'Not yet designed' statuses and bidirectional paragraph; registry match_time range, wait_for_first_rope, F4
- [RECOMMENDED] Interactions: no single canonical event list (vs Level HUD)
- [RECOMMENDED] States: Closed 'Restart (from Pause)' unreachable
- [RECOMMENDED] Core Rules: load failure on Retry/Next 'previous screen' ambiguous
- [RECOMMENDED] Formulas F1/F2: win/loss pawn asymmetry needs rationale
- [RECOMMENDED] Acceptance Criteria: AC27 not measurable; AC10/AC25 wording; edge cases lack ACs
- [RECOMMENDED] Visual (cross-doc): Win overlay one star vs Menus empty star row
Reviewed-Content-Hash: design/gdd/level-state-match-flow.md 0afcc7e7fd677decb4695e9ce54e31cc2b507482
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
Reviewed-Content-Hash: design/gdd/rival-ai.md e0e287ad97d596b9b8d052cda2223f92ac34b7b2
Reviewed-Content-Hash: design/gdd/campaign-level-data.md 7567d1fa919a440208355e083ec8ce685b34a552
Reviewed-Content-Hash: design/gdd/world-map-regions.md e1b4c51ac0ba108f25b3fcb5d35e6bddbae0aada
Reviewed-Content-Hash: design/gdd/level-hud.md c0946163f4a8610ac9cedcba8d8ad342997ba759
Reviewed-Content-Hash: design/gdd/menus-screens.md 2ff1faab335ff570b4796954f02788d5649c17f0

## Review — 2026-11-22 — Verdict: NEEDS REVISION
Review mode: lean · Workflow: standard
Scope signal: M
Specialists: none (lean mode; independent reviewer subagent per GDD, batch re-review of all 13 UAT-1 GDDs after the cross-doc cluster fixes)
Blocking items: 3 | Recommended: 10 (logged; full report lists more)
Summary: The result record now matches Screen Flow and Menus, and the Ending counter is defined. Three prior blockers stand: clock_started is never raised on levels that do not wait (Rival AI would never start), F4 vs AC16 at end_delay 0, and float rounding.
Prior verdict resolved: Partly
Findings:
- [BLOCKING] Core Rule 2 / AC5, AC25: clock_started not raised on non-waiting levels; Rival AI never leaves Waiting (prior)
- [BLOCKING] F4 vs AC16: D+0 vs D+1 at end_delay 0; output range (prior)
- [BLOCKING] F3 / F4 / Rule 11 / AC22: rounding mode and float hazards (prior)
- [RECOMMENDED] Rule 1: Rival AI reseed at build not listed
- [RECOMMENDED] A held message after a non-waiting Retry: match must not run under it
- [RECOMMENDED] Dependencies and AC intro stale
- [RECOMMENDED] No canonical event list (match_ending); HUD Closed state
- [RECOMMENDED] Closed -> Restart unreachable; load-failure destination
- [RECOMMENDED] Registry entries claimed but missing (end_delay_steps, wait_for_first_rope)
- [RECOMMENDED] AC2/AC10/AC23/AC24/AC27/AC17 rewrites
Revisions applied 2026-11-22 (user-approved, cross-document round 2): clock_started at step 0 on every level (rule 2, AC5; blocker resolved); Armed stops match steps only, Input and the hit-test provider keep running; pawns_in_flight excludes Fallen pawns (F2); Rival AI reseed in rule 1; unlock at the result overlay. F4 vs AC16 and rounding still open. Status stays Needs Revision pending the per-document blockers.
Reviewed-Content-Hash: design/gdd/level-state-match-flow.md 8da5b7c5570dba901a2a6e35f3df86e916ff7356
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
Reviewed-Content-Hash: design/gdd/rival-ai.md 8f0066ad441e1b50a073383b5333d6785646140e
Reviewed-Content-Hash: design/gdd/campaign-level-data.md 696e3c5a30618c724a9e8ae08d1de9296edd3f96
Reviewed-Content-Hash: design/gdd/world-map-regions.md e1b4c51ac0ba108f25b3fcb5d35e6bddbae0aada
Reviewed-Content-Hash: design/gdd/level-hud.md c0946163f4a8610ac9cedcba8d8ad342997ba759
Reviewed-Content-Hash: design/gdd/menus-screens.md c20ff536a7a8e07072c2e2602fecb9c1318a740e
