# Review Log: Troop Marching & Clashes

## Review — 2026-11-22 — Verdict: NEEDS REVISION
Review mode: lean · Workflow: standard
Scope signal: L
Specialists: none (lean mode; independent reviewer subagent per GDD, batch review of all 13 UAT-1 GDDs)
Blocking items: 3 | Recommended: 8 (logged; full report lists more)
Summary: A strong, precise spec whose F1/F4/F9 hand calculations check out with no registry conflicts. Blockers: F8/M2 baseline should be 24 not 23 (and the 1,470 px basis is itself illegal under Campaign B2), seq order for same-step launches is undefined, and the pawn lifecycle has no Lost state or no_rope reason.
Prior verdict resolved: First review
Findings:
- [BLOCKING] Formulas F8 / M2: baseline ceil(1470/66)+1 = 24, not 23 (and 1,470 px is illegal under Campaign B2; ~1,258 px gives 21)
- [BLOCKING] Core Rule 11 / F4: seq order for same-step launches undefined; AC-M23/M38 not reproducible
- [BLOCKING] States / Rule 15: no Lost state; pawn_lost lacks a no_rope reason for allied pawn at full keep
- [RECOMMENDED] Dependencies: Consistency-to-fix list stale; status line stale
- [RECOMMENDED] Dependencies: Unit Roster tier 'Alpha' vs MVP/UAT-2
- [RECOMMENDED] Acceptance Criteria: AC-M16 unreachable fixture; AC-M12 precondition missing
- [RECOMMENDED] Formulas F7: example mixes rope stream and generation rate
- [RECOMMENDED] Pillar 2: ring pawn counts up to ~319 need a draw cap; Rule 19 god-power hooks vs Pillar 1
- [RECOMMENDED] Dependencies: Touch & Mouse Input missing upstream; register capture_troops, pawns_in_flight_max
- [RECOMMENDED] Formulas M1: floor speed 30 can never pass M3
- [RECOMMENDED] Acceptance Criteria: AC-M29/M32/M43/M44/M45 need measurable rewrites
Reviewed-Content-Hash: design/gdd/troop-marching-clashes.md 87568f6fda3fd88a5ebb4037f76a1452d059af2f
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
Reviewed-Content-Hash: design/gdd/level-state-match-flow.md 0afcc7e7fd677decb4695e9ce54e31cc2b507482
Reviewed-Content-Hash: design/gdd/rival-ai.md e0e287ad97d596b9b8d052cda2223f92ac34b7b2
Reviewed-Content-Hash: design/gdd/campaign-level-data.md 7567d1fa919a440208355e083ec8ce685b34a552
Reviewed-Content-Hash: design/gdd/world-map-regions.md e1b4c51ac0ba108f25b3fcb5d35e6bddbae0aada
Reviewed-Content-Hash: design/gdd/level-hud.md c0946163f4a8610ac9cedcba8d8ad342997ba759
Reviewed-Content-Hash: design/gdd/menus-screens.md 2ff1faab335ff570b4796954f02788d5649c17f0

## Review — 2026-11-22 — Verdict: NEEDS REVISION
Review mode: lean · Workflow: standard
Scope signal: L
Specialists: none (lean mode; independent reviewer subagent per GDD, batch re-review of all 13 UAT-1 GDDs after the cross-doc cluster fixes)
Blocking items: 3 | Recommended: 9 (logged; full report lists more)
Summary: F8/M2 (21) and seq order are resolved and the arithmetic holds. Remaining: the no-rope relay loss has no state, reason or owner; M3 was misclassified today as clamped global tuning though it reads the per-level speed_min; and Level State counts fading pawns as in flight while this GDD does not.
Prior verdict resolved: Partly
Findings:
- [BLOCKING] States / Rule 15: no-rope relay loss has no Lost state, no_rope reason or owner (prior, partly)
- [BLOCKING] Invariants M3 / Edge Case: M3 reads per-level speed_min but is listed as clamped global tuning; no clamp target
- [BLOCKING] States vs Level State F2 variables: fading pawns in pawns_in_flight
- [RECOMMENDED] Consistency-to-fix and status column stale
- [RECOMMENDED] Per-step table: player input placement; Rival AI 'ties take effect this step'
- [RECOMMENDED] Rule 13 / F9: whether pawns_in_flight includes the arriving pawn
- [RECOMMENDED] F7 example mixes streams
- [RECOMMENDED] Register capture_troops, pawns_in_flight_max; add Touch upstream; Unit Roster tier
- [RECOMMENDED] AC-M12/M18/M29/M43/M44/M45 rewrites; AC-M16 injected
Revisions applied 2026-11-22 (user-approved, cross-document round 2): pawn_lost reason no_rope, removed on the same step (rule 15, States, edge case; blocker resolved); pawns_in_flight counts Marching only (blocker resolved with Level State); M3 a Rejected level check, M2 = R3 (blocker resolved); phase 0 player input and phase 2 cut timing; AC-M32 55-63 s and OQ (d) about 59 s. Status stays Needs Revision pending the per-document blockers.
Reviewed-Content-Hash: design/gdd/troop-marching-clashes.md 04ae0014fd6dd5849c0bfe1429a938a42ff32a0b
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
Reviewed-Content-Hash: design/gdd/level-state-match-flow.md 8da5b7c5570dba901a2a6e35f3df86e916ff7356
Reviewed-Content-Hash: design/gdd/rival-ai.md 8f0066ad441e1b50a073383b5333d6785646140e
Reviewed-Content-Hash: design/gdd/campaign-level-data.md 696e3c5a30618c724a9e8ae08d1de9296edd3f96
Reviewed-Content-Hash: design/gdd/world-map-regions.md e1b4c51ac0ba108f25b3fcb5d35e6bddbae0aada
Reviewed-Content-Hash: design/gdd/level-hud.md c0946163f4a8610ac9cedcba8d8ad342997ba759
Reviewed-Content-Hash: design/gdd/menus-screens.md c20ff536a7a8e07072c2e2602fecb9c1318a740e
