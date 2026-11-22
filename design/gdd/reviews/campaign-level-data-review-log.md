# Review Log: Campaign Level Data

## Review — 2026-11-22 — Verdict: NEEDS REVISION
Review mode: lean · Workflow: standard
Scope signal: M
Specialists: none (lean mode; independent reviewer subagent per GDD, batch review of all 13 UAT-1 GDDs)
Blocking items: 6 | Recommended: 7 (logged; full report lists more)
Summary: Structurally complete with accurate registry constants, but rival keeps at 15–18 troops start at level 2 (contradicting F3, AC2, AC17), the 1,470 px cases are impossible under B2 (max ~1,258 px), required fields are undefined, the shipped-build failure policy conflicts with Touch and Rope Links, and dropped levels/empty regions leave campaign state undefined.
Prior verdict resolved: First review
Findings:
- [BLOCKING] Formulas F3 / AC2 / AC17: rival keeps at 15, 16, 18 troops start at level 2, not level 1
- [BLOCKING] Formulas F1 / B2 / AC5 / AC6: 1,470 px diagonal illegal under B2 (max ~1,258 px); R3 unreachable at baseline
- [BLOCKING] Detailed Design: no required/optional field table (missing field = parse failure undefined)
- [BLOCKING] Edge Cases: shipped-build clamp vs reject policy conflicts with Touch AC28 and Rope Links
- [BLOCKING] Edge Cases / B3: dropped duplicate or orphan level leaves region unwinnable; orders 1..N not in B3
- [BLOCKING] Formulas F4: empty / fog-only regions 2–5 undefined
- [RECOMMENDED] Formulas: float boundary comparison and rounding rule
- [RECOMMENDED] Bounds B5/B6: unquantified and without ACs
- [RECOMMENDED] Acceptance Criteria: AC20/AC18/AC9 rewrites
- [RECOMMENDED] Game Feel: 2–3 minute target has no playtest AC
- [RECOMMENDED] States: when validation runs (app start vs per request)
- [RECOMMENDED] Bounds: keep-count cap (one-glance limit); Tuning Knobs
- [RECOMMENDED] Dependencies: stale statuses, Hard/Soft labels, HUD title format, rival.seed vs rival_seed
Reviewed-Content-Hash: design/gdd/campaign-level-data.md 7567d1fa919a440208355e083ec8ce685b34a552
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
Reviewed-Content-Hash: design/gdd/rival-ai.md e0e287ad97d596b9b8d052cda2223f92ac34b7b2
Reviewed-Content-Hash: design/gdd/world-map-regions.md e1b4c51ac0ba108f25b3fcb5d35e6bddbae0aada
Reviewed-Content-Hash: design/gdd/level-hud.md c0946163f4a8610ac9cedcba8d8ad342997ba759
Reviewed-Content-Hash: design/gdd/menus-screens.md 2ff1faab335ff570b4796954f02788d5649c17f0

## Review — 2026-11-22 — Verdict: NEEDS REVISION
Review mode: lean · Workflow: standard
Scope signal: M
Specialists: none (lean mode; independent reviewer subagent per GDD, batch re-review of all 13 UAT-1 GDDs after the cross-doc cluster fixes)
Blocking items: 5 | Recommended: 8 (logged; full report lists more)
Summary: The 1,258 px ceiling, reject-vs-clamp policy and seed contract are consistent with Touch, Rope Links, Troop Marching and Rival AI. Rival keeps at 15-18 troops still start at level 2, the duplicate/orphan drop and empty-region next() remain open, M2 is named in rule 8 but not the loader, and required fields are undefined.
Prior verdict resolved: Partly
Findings:
- [BLOCKING] F3 / Content / AC2 / AC17: rival keeps at 15, 16, 18 start at level 2 (prior)
- [BLOCKING] Edge Cases / B3 / AC10: dropped duplicate or orphan leaves an order gap; orders 1..N missing (prior)
- [BLOCKING] F4: empty or fog-only next region undefined (prior)
- [BLOCKING] Rule 8 vs loader check list / ACs: M2 named but not checked or reported; state M2 equals R3
- [BLOCKING] Rule 2 / Parsing: required fields and their types undefined (prior, partly)
- [RECOMMENDED] Runtime radius raise re-checks only I2, not B2/B6
- [RECOMMENDED] Title separator em dash vs middle dot
- [RECOMMENDED] B5/B6 lack ACs; prev() undefined; float comparison tolerance; stale statuses; Game Feel AC; AC9/AC10/AC15/AC19/AC20 rewrites
Revisions applied 2026-11-22 (user-approved, cross-document round 2): M2 = R3 and M3 checked per level, named in rule 8 and the Validating state (blocker resolved); global-tuning list extended (Troop Marching M1, M4-M7, Keep Levels K1-K4, Troop Generation I1-I3, Rival AI knobs); F4 note that Menus hides Next level across regions. Rival keeps at level 2, drop policy, empty next region and required fields still open. Status stays Needs Revision pending the per-document blockers.
Reviewed-Content-Hash: design/gdd/campaign-level-data.md 696e3c5a30618c724a9e8ae08d1de9296edd3f96
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
Reviewed-Content-Hash: design/gdd/rival-ai.md 8f0066ad441e1b50a073383b5333d6785646140e
Reviewed-Content-Hash: design/gdd/world-map-regions.md e1b4c51ac0ba108f25b3fcb5d35e6bddbae0aada
Reviewed-Content-Hash: design/gdd/level-hud.md c0946163f4a8610ac9cedcba8d8ad342997ba759
Reviewed-Content-Hash: design/gdd/menus-screens.md c20ff536a7a8e07072c2e2602fecb9c1318a740e
