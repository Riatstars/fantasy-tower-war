# Review Log: Touch & Mouse Input

## Review — 2026-11-22 — Verdict: NEEDS REVISION
Review mode: lean · Workflow: standard
Scope signal: L
Specialists: none (lean mode; independent reviewer session, Opus)
Blocking items: 2 | Recommended: 6
Summary: A strong input spec with two interface-level blockers. The hit-test provider listed only the player's keeps (so no tie to an enemy could resolve) and its owner disagreed with Rope Links; and Core Rule 3 contradicted F2 on a tap near the player's rope inside a rival or neutral keep's area.
Prior verdict resolved: First review
Findings:
- [BLOCKING] Interactions / Core Rule 8: provider lists only the player's keeps; owner "the Level screen" vs Rope Links
- [BLOCKING] Core Rule 3 vs F2: press priority inside a non-player keep's area near the player's rope
- [RECOMMENDED] Core Rule 9: cancellation causes miss "origin captured"
- [RECOMMENDED] States and Transitions: touch press on a rope that then moves has no transition
- [RECOMMENDED] Core Rule 12: keys P and M have no event or consumer
- [RECOMMENDED] Dependencies / Cross-References: stale "no GDD yet" and consistency items
- [RECOMMENDED] Core Rule 12: keyboard target cycling has no order
- [RECOMMENDED] Core Rule 5 vs UI: one-time vs once-per-session hint
Revisions applied 2026-11-22 (user-approved): Rope Links is the hit-test provider with every keep and its owner flag; the player's rope wins over a rival or neutral keep's area (own keeps keep priority) in Rule 3, F2, edge case and AC17; rule 9 cancels when the provider stops flagging the origin as the player's; rope press then move becomes a swipe; P and M emit pause_pressed and mute_toggled; target cycling in ascending id; hint once per session; stale items updated; 0.09 mm/px; AC33 tagged Device; F6 short-range note. Status set to In Review pending re-review.
Reviewed-Content-Hash: design/gdd/touch-mouse-input.md 4203499bad17d93a7efa8a191d3dbfaf55545e74
Reviewed-Content-Hash: design/registry/entities.yaml 44d26d5a860ebcb7026da6a5ed63411383f134e2
Reviewed-Content-Hash: .claude/skills/design-review/SKILL.md 4dcc8b81162613c757144532f1b72708ab3ba27f
Reviewed-Content-Hash: design/gdd/troop-generation.md 6bf7dec626b85c6e5fe8ecebc6a4b050d3ce9bc3
Reviewed-Content-Hash: design/gdd/screen-flow-scene-manager.md 31f6b9f1371007926448f359f895ad0b85f989d9
Reviewed-Content-Hash: design/gdd/save-progress.md 4ef1eafb7b0fb29715768faaffc41ecaabccb7af
Reviewed-Content-Hash: design/gdd/keep-levels.md 78df4bad822fd3f9cbdb4eb60d9c5debcdb0d056
Reviewed-Content-Hash: design/gdd/rope-links.md f6816232d25eee1e737641dd0b6294ade7a6c912
Reviewed-Content-Hash: design/gdd/systems-index.md a57dea8a6c59ab9c163c83673a824f8f37f9dcca
Reviewed-Content-Hash: design/gdd/game-concept.md 9638f7a1f3394f38352472bfc9b57753fccbb83f
Reviewed-Content-Hash: design/game-brief.md 302532346c1d5c9a7fd1778bbd12b7fe277630c2

## Review — 2026-11-22 — Verdict: NEEDS REVISION
Review mode: lean · Workflow: standard
Scope signal: L
Specialists: none (lean mode; independent reviewer subagent per GDD, batch review of all 13 UAT-1 GDDs)
Blocking items: 2 | Recommended: 9 (logged; full report lists more)
Summary: Both prior blockers are resolved (Rope Links is hit-test provider; rope-over-keep priority consistent). New: unmoved right-click on an own keep is undefined and own-rope tap-cut has a 78 px dead zone per end; the I2 shipped-build fallback contradicts Campaign Level Data.
Prior verdict resolved: Yes (prior blocking items resolved)
Findings:
- [BLOCKING] Core Rules 3–5 / F2: right press on own keep undefined; own-rope tap-cut dead zone inside keep areas
- [BLOCKING] Edge Cases / AC28 / I1: load-time radius clamp contradicts Campaign Level Data reject policy; radius floor 48 vs 30
- [RECOMMENDED] Core Rule 12 / AC24: keyboard X cut semantics undefined
- [RECOMMENDED] Core Rule 7: swipe first segment start point unstated
- [RECOMMENDED] States table: swipe transitions lack touch/right-button condition
- [RECOMMENDED] Interactions: preview legality has no owner (HUD vs Rope Links)
- [RECOMMENDED] Acceptance Criteria: P and M keys have no AC
- [RECOMMENDED] Dependencies: direction with Menus & Screens disagrees
- [RECOMMENDED] Acceptance Criteria: AC34 not testable; AC32 sample too small; AC1/AC4 bundled
- [RECOMMENDED] Formulas F6: segment vs line ambiguous
- [RECOMMENDED] Tuning Knobs (advisory): no consolidated table
Reviewed-Content-Hash: design/gdd/touch-mouse-input.md de1ed35ff80383c98c2c10d44ca5e85879e374cd
Reviewed-Content-Hash: design/registry/entities.yaml b7664dbf04df5012d7e1f5b7b57847ac142c8b18
Reviewed-Content-Hash: .claude/skills/design-review/SKILL.md 4dcc8b81162613c757144532f1b72708ab3ba27f
Reviewed-Content-Hash: design/gdd/game-concept.md b9ec7dd07d6d43c3e9abb1208bac711ad23ae758
Reviewed-Content-Hash: design/gdd/systems-index.md 54c5d0974e9b80218fa4082ceb37e11bdc86e243
Reviewed-Content-Hash: design/game-brief.md 7d90b94906b28807d72b86ade5f754d9a7c62b75
Reviewed-Content-Hash: design/gdd/troop-generation.md d2ba2132b296666c69bd0b6d907fd2cefcb86807
Reviewed-Content-Hash: design/gdd/screen-flow-scene-manager.md 9975a503dc7d44abe22ef17ff94d0493e64a9c3b
Reviewed-Content-Hash: design/gdd/save-progress.md 3b92d24ced6af243a993988b6efce966e26168eb
Reviewed-Content-Hash: design/gdd/keep-levels.md 433e135e0ec091348cab95776797287a08b45452
Reviewed-Content-Hash: design/gdd/rope-links.md b1365d0079062d78e6df7717049529eed24684ce
Reviewed-Content-Hash: design/gdd/troop-marching-clashes.md 87568f6fda3fd88a5ebb4037f76a1452d059af2f
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
Blocking items: 2 | Recommended: 9 (logged; full report lists more)
Summary: Both prior blockers are resolved (right press on own keep; bad-data policy and radius floor 48 agree with Campaign). Two interface contradictions remain: preview legality owner (HUD expects Input, Rope Links claims it) and whether Input emits UI taps.
Prior verdict resolved: Yes (prior blocking items resolved)
Findings:
- [BLOCKING] Rule 6 / Interactions: preview legality owner contradicts Level HUD line 63 and Rope Links line 70
- [BLOCKING] Overview / States vs Rule 11 / Menus line 59: whether Input emits UI tap events
- [RECOMMENDED] States table: swipe transition lacks touch/right-button condition
- [RECOMMENDED] Rule 7: first swipe segment starts at the press point
- [RECOMMENDED] Rule 12: Tab/arrow order, X cut set and event undefined; no AC for P and M
- [RECOMMENDED] Rule 5: right-mouse cut hint has no owner or event
- [RECOMMENDED] Timing: event queueing vs the 1/60 s step
- [RECOMMENDED] keep_hit_lift ignored by Campaign B2 and HUD H1; tuning bounds without invariants
- [RECOMMENDED] Dependencies stale; AC32/AC34/AC1/AC4/AC24 rewrites
Revisions applied 2026-11-22 (user-approved, cross-document round 2): Rope Links owns preview legality and the HUD reads tie_legal (blocker resolved); Input emits no UI taps, Overview and Pressed state fixed (blocker resolved); drag feedback and the hit-test provider run every frame incl. Armed; hint_shown("cursor") event (rule 5, AC18); unlock at the result overlay; Back from the engine in UAT-1. Status stays Needs Revision pending the per-document blockers.
Reviewed-Content-Hash: design/gdd/touch-mouse-input.md d453343269b2416d6cbd716a7007db31148516c7
Reviewed-Content-Hash: design/registry/entities.yaml 7c078a61a2fe209d71cee39822db4cfe17d257ff
Reviewed-Content-Hash: .claude/skills/design-review/SKILL.md 4dcc8b81162613c757144532f1b72708ab3ba27f
Reviewed-Content-Hash: design/gdd/game-concept.md b9ec7dd07d6d43c3e9abb1208bac711ad23ae758
Reviewed-Content-Hash: design/gdd/systems-index.md 51f7eff69a32aa0925544e25a07136f03d38cbdc
Reviewed-Content-Hash: design/game-brief.md 7d90b94906b28807d72b86ade5f754d9a7c62b75
Reviewed-Content-Hash: design/gdd/keep-levels.md 433e135e0ec091348cab95776797287a08b45452
Reviewed-Content-Hash: design/gdd/troop-generation.md d2ba2132b296666c69bd0b6d907fd2cefcb86807
Reviewed-Content-Hash: design/gdd/save-progress.md 3b92d24ced6af243a993988b6efce966e26168eb
Reviewed-Content-Hash: design/gdd/screen-flow-scene-manager.md c8b26b4e46cf9a8ba069ffc75f27449a55b95cfb
Reviewed-Content-Hash: design/gdd/rope-links.md c06a1b8927af3ccfef88c465d044bf401ea36e4a
Reviewed-Content-Hash: design/gdd/troop-marching-clashes.md 04ae0014fd6dd5849c0bfe1429a938a42ff32a0b
Reviewed-Content-Hash: design/gdd/level-state-match-flow.md 8da5b7c5570dba901a2a6e35f3df86e916ff7356
Reviewed-Content-Hash: design/gdd/rival-ai.md 8f0066ad441e1b50a073383b5333d6785646140e
Reviewed-Content-Hash: design/gdd/campaign-level-data.md 696e3c5a30618c724a9e8ae08d1de9296edd3f96
Reviewed-Content-Hash: design/gdd/world-map-regions.md e1b4c51ac0ba108f25b3fcb5d35e6bddbae0aada
Reviewed-Content-Hash: design/gdd/level-hud.md c0946163f4a8610ac9cedcba8d8ad342997ba759
Reviewed-Content-Hash: design/gdd/menus-screens.md c20ff536a7a8e07072c2e2602fecb9c1318a740e
