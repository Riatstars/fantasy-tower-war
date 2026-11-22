# Review Log: Keep Levels

## Review — 2026-11-22 — Verdict: NEEDS REVISION
Review mode: lean · Workflow: standard
Scope signal: M
Specialists: none (lean mode; independent reviewer session, Opus)
Blocking items: 2 | Recommended: 6
Summary: F2 contradicted the States table and Rule 3 for a level 3 keep at 10–14 troops (it gave level 1, not 2), and the registry copied the wrong formula. AC17's shipped clamp (margin 19) still breached K2.
Prior verdict resolved: First review
Findings:
- [BLOCKING] Formulas F2: effective level wrong for prev 3 at 10–14 troops; AC4 missed it
- [BLOCKING] Acceptance Criteria AC17: clamp to 19 still breaches K2 (correct: 14)
- [RECOMMENDED] Core Rule 7: capture signal muddled (level_dropped 1→1); AC12 unreachable state
- [RECOMMENDED] Game Feel / OQ1: grace-window numbers disagree and ignore generation
- [RECOMMENDED] Dependencies / Cross-References: stale items and "no GDD yet" statements
- [RECOMMENDED] UI Requirements: refusal text uses L for both level and limit
- [RECOMMENDED] Visual: who shows slot dots inconsistent across GDDs
- [RECOMMENDED] Formulas F3: max_ropes_table range 0–5 vs Rope Links' 3
Revisions applied 2026-11-22 (user-approved): F2 steps down one band at a time (AC4 gains prev 3 at 12 → 2); AC17 and the boundary note clamp to 14 under K2 and K3; capture resets on keep_captured with no level_dropped (rule 7, rule 9, States, Interactions, F4, AC12); grace window 10 arrivals at level 2 and 18 at level 3; Troop Marching reads the level from Alpha only; slot dots on player and rival keeps, none on neutrals; refusal text "only N ropes"; max_ropes_table 1–3; stale items removed; registry F2 fix listed in Consistency to fix. Status set to In Review pending re-review.
Reviewed-Content-Hash: design/gdd/keep-levels.md 78df4bad822fd3f9cbdb4eb60d9c5debcdb0d056
Reviewed-Content-Hash: design/registry/entities.yaml 44d26d5a860ebcb7026da6a5ed63411383f134e2
Reviewed-Content-Hash: .claude/skills/design-review/SKILL.md 4dcc8b81162613c757144532f1b72708ab3ba27f
Reviewed-Content-Hash: design/gdd/troop-generation.md 6bf7dec626b85c6e5fe8ecebc6a4b050d3ce9bc3
Reviewed-Content-Hash: design/gdd/screen-flow-scene-manager.md 31f6b9f1371007926448f359f895ad0b85f989d9
Reviewed-Content-Hash: design/gdd/touch-mouse-input.md 4203499bad17d93a7efa8a191d3dbfaf55545e74
Reviewed-Content-Hash: design/gdd/save-progress.md 4ef1eafb7b0fb29715768faaffc41ecaabccb7af
Reviewed-Content-Hash: design/gdd/rope-links.md f6816232d25eee1e737641dd0b6294ade7a6c912
Reviewed-Content-Hash: design/gdd/systems-index.md a57dea8a6c59ab9c163c83673a824f8f37f9dcca
Reviewed-Content-Hash: design/gdd/game-concept.md 9638f7a1f3394f38352472bfc9b57753fccbb83f
Reviewed-Content-Hash: design/game-brief.md 302532346c1d5c9a7fd1778bbd12b7fe277630c2

## Review — 2026-11-22 — Verdict: APPROVED
Review mode: lean · Workflow: standard
Scope signal: M
Specialists: none (lean mode; independent reviewer subagent per GDD, batch review of all 13 UAT-1 GDDs)
Blocking items: 0 | Recommended: 8 (logged; full report lists more)
Summary: Both prior blockers are fixed (F2 steps down one band at a time; AC17/K2/K3 clamp to 14), and formulas, boundary values and cross-GDD numbers check out. Remaining items are documentation staleness, a few variable ranges that disagree with invariants, and a Pillar 2 note that hysteresis hides the drop point.
Prior verdict resolved: Yes (prior blocking items resolved)
Findings:
- [RECOMMENDED] Dependencies: stale 'no GDD yet' text; Rival AI/Level State mis-filed upstream; stale Consistency-to-fix item
- [RECOMMENDED] Open Questions OQ6: 'up to 5 per level' vs F3 1–3; F1/F2 ranges vs K1–K3 and I1
- [RECOMMENDED] Edge Cases: clamp order for breached data unspecified
- [RECOMMENDED] Core Rules 6 vs 9: level_dropped fires only on rope excess vs on every level change (Level HUD crumble depends on it)
- [RECOMMENDED] Game Feel: 'single enemy pawn never costs a rope' false at boundary
- [RECOMMENDED] Core Rule 11 / Pillar 2: hysteresis drop point invisible; add at-risk cue or record trade-off
- [RECOMMENDED] Acceptance Criteria: capture reset not discriminated; margin change mid-match untested
- [RECOMMENDED] Visual: neutral never rises; HUD refresh after capture reset undefined
Reviewed-Content-Hash: design/gdd/keep-levels.md 433e135e0ec091348cab95776797287a08b45452
Reviewed-Content-Hash: design/registry/entities.yaml b7664dbf04df5012d7e1f5b7b57847ac142c8b18
Reviewed-Content-Hash: .claude/skills/design-review/SKILL.md 4dcc8b81162613c757144532f1b72708ab3ba27f
Reviewed-Content-Hash: design/gdd/game-concept.md b9ec7dd07d6d43c3e9abb1208bac711ad23ae758
Reviewed-Content-Hash: design/gdd/systems-index.md 54c5d0974e9b80218fa4082ceb37e11bdc86e243
Reviewed-Content-Hash: design/game-brief.md 7d90b94906b28807d72b86ade5f754d9a7c62b75
Reviewed-Content-Hash: design/gdd/troop-generation.md d2ba2132b296666c69bd0b6d907fd2cefcb86807
Reviewed-Content-Hash: design/gdd/screen-flow-scene-manager.md 9975a503dc7d44abe22ef17ff94d0493e64a9c3b
Reviewed-Content-Hash: design/gdd/touch-mouse-input.md de1ed35ff80383c98c2c10d44ca5e85879e374cd
Reviewed-Content-Hash: design/gdd/save-progress.md 3b92d24ced6af243a993988b6efce966e26168eb
Reviewed-Content-Hash: design/gdd/rope-links.md b1365d0079062d78e6df7717049529eed24684ce
Reviewed-Content-Hash: design/gdd/troop-marching-clashes.md 87568f6fda3fd88a5ebb4037f76a1452d059af2f
Reviewed-Content-Hash: design/gdd/level-state-match-flow.md 0afcc7e7fd677decb4695e9ce54e31cc2b507482
Reviewed-Content-Hash: design/gdd/rival-ai.md e0e287ad97d596b9b8d052cda2223f92ac34b7b2
Reviewed-Content-Hash: design/gdd/campaign-level-data.md 7567d1fa919a440208355e083ec8ce685b34a552
Reviewed-Content-Hash: design/gdd/world-map-regions.md e1b4c51ac0ba108f25b3fcb5d35e6bddbae0aada
Reviewed-Content-Hash: design/gdd/level-hud.md c0946163f4a8610ac9cedcba8d8ad342997ba759
Reviewed-Content-Hash: design/gdd/menus-screens.md 2ff1faab335ff570b4796954f02788d5649c17f0

## Review — 2026-11-22 — Verdict: APPROVED
Review mode: lean · Workflow: standard
Scope signal: S
Specialists: none (lean mode; target unchanged since its last review, cross-document facts re-verified by an independent subagent against the 8 edited GDDs and the registry)
Blocking items: 0 | Recommended: 2 (logged; full report lists more)
Summary: Unchanged and still approved: no conflict with the cross-doc decisions of 2026-11-22 (rope_id tie order, capture handling, bad-data policy).
Prior verdict resolved: Nothing open
Findings:
- [RECOMMENDED] Dependencies: Campaign Level Data 'Soft, Provisional' and 'no other GDD' text stale
- [RECOMMENDED] Edge Cases: name K1-K4 as global tuning clamped at app start under the bad-data policy
Reviewed-Content-Hash: design/gdd/keep-levels.md 433e135e0ec091348cab95776797287a08b45452
Reviewed-Content-Hash: design/registry/entities.yaml 7c078a61a2fe209d71cee39822db4cfe17d257ff
Reviewed-Content-Hash: .claude/skills/design-review/SKILL.md 4dcc8b81162613c757144532f1b72708ab3ba27f
Reviewed-Content-Hash: design/gdd/game-concept.md b9ec7dd07d6d43c3e9abb1208bac711ad23ae758
Reviewed-Content-Hash: design/gdd/systems-index.md 51f7eff69a32aa0925544e25a07136f03d38cbdc
Reviewed-Content-Hash: design/game-brief.md 7d90b94906b28807d72b86ade5f754d9a7c62b75
Reviewed-Content-Hash: design/gdd/troop-generation.md d2ba2132b296666c69bd0b6d907fd2cefcb86807
Reviewed-Content-Hash: design/gdd/save-progress.md 3b92d24ced6af243a993988b6efce966e26168eb
Reviewed-Content-Hash: design/gdd/screen-flow-scene-manager.md c8b26b4e46cf9a8ba069ffc75f27449a55b95cfb
Reviewed-Content-Hash: design/gdd/touch-mouse-input.md d453343269b2416d6cbd716a7007db31148516c7
Reviewed-Content-Hash: design/gdd/rope-links.md c06a1b8927af3ccfef88c465d044bf401ea36e4a
Reviewed-Content-Hash: design/gdd/troop-marching-clashes.md 04ae0014fd6dd5849c0bfe1429a938a42ff32a0b
Reviewed-Content-Hash: design/gdd/level-state-match-flow.md 8da5b7c5570dba901a2a6e35f3df86e916ff7356
Reviewed-Content-Hash: design/gdd/rival-ai.md 8f0066ad441e1b50a073383b5333d6785646140e
Reviewed-Content-Hash: design/gdd/campaign-level-data.md 696e3c5a30618c724a9e8ae08d1de9296edd3f96
Reviewed-Content-Hash: design/gdd/world-map-regions.md e1b4c51ac0ba108f25b3fcb5d35e6bddbae0aada
Reviewed-Content-Hash: design/gdd/level-hud.md c0946163f4a8610ac9cedcba8d8ad342997ba759
Reviewed-Content-Hash: design/gdd/menus-screens.md c20ff536a7a8e07072c2e2602fecb9c1318a740e
