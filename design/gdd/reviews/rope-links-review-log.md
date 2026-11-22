# Review Log: Rope Links

## Review — 2026-11-22 — Verdict: NEEDS REVISION
Review mode: lean · Workflow: standard
Scope signal: L
Specialists: none (lean mode; independent reviewer session, Opus)
Blocking items: 2 | Recommended: 8
Summary: The rope rules are clear and test-friendly, but free sending plus loss-free relay had no sink, so a ring of full allied keeps grew pawns without limit and broke F5, R3, AC22 and AC32. The hit-test provider listed only the player's keeps, so a rope could not be tied to an enemy, and its owner disagreed with Touch & Mouse Input.
Prior verdict resolved: First review
Findings:
- [BLOCKING] Core Rules / F5: relay breaks the per-rope pawn bound; a ring of full keeps grows ~5 pawns/s for ever
- [BLOCKING] Core Rules / Interactions: hit-test provider lists only the player's keeps; owner conflicts with touch-mouse-input.md
- [RECOMMENDED] Edge Cases: the both-ways allied state cannot arise (edge cases, OQ5, AC2, F3 exclusion)
- [RECOMMENDED] Core Rules: capture cutting had two signals (keep_captured and level_dropped)
- [RECOMMENDED] Formulas: F5 example and AC32 off by one (23 vs 24); R3 inequality dropped ceil and +1
- [RECOMMENDED] States: Extending ropes cuttable in the table but not in rule 9
- [RECOMMENDED] Edge Cases: Extending-rope relay loss contradicts game-concept.md:79
- [RECOMMENDED] Dependencies: stale Consistency-to-fix items
- [RECOMMENDED] UI Requirements: rival slot dots conflict with keep-levels.md and troop-generation.md
- [RECOMMENDED] Edge Cases: no shared per-step order
Revisions applied 2026-11-22 (user-approved): relay limit of 6 hops (Troop Marching rule 13) in rule 10, F5, R3, Feedback loop, AC22, OQ2; F5/AC32 corrected to 24 and R3 to ≥ 0.343 s; Rope Links named the hit-test provider with every keep; capture cuts only on keep_captured; impossible both-ways state removed (OQ5 closed, AC2 marked injected); Extending ropes cuttable and relay; rival slot dots shown; Troop Marching & Clashes contract checked. Status set to In Review pending re-review.
Reviewed-Content-Hash: design/gdd/rope-links.md f6816232d25eee1e737641dd0b6294ade7a6c912
Reviewed-Content-Hash: design/registry/entities.yaml 44d26d5a860ebcb7026da6a5ed63411383f134e2
Reviewed-Content-Hash: .claude/skills/design-review/SKILL.md 4dcc8b81162613c757144532f1b72708ab3ba27f
Reviewed-Content-Hash: design/gdd/troop-generation.md 6bf7dec626b85c6e5fe8ecebc6a4b050d3ce9bc3
Reviewed-Content-Hash: design/gdd/screen-flow-scene-manager.md 31f6b9f1371007926448f359f895ad0b85f989d9
Reviewed-Content-Hash: design/gdd/touch-mouse-input.md 4203499bad17d93a7efa8a191d3dbfaf55545e74
Reviewed-Content-Hash: design/gdd/save-progress.md 4ef1eafb7b0fb29715768faaffc41ecaabccb7af
Reviewed-Content-Hash: design/gdd/keep-levels.md 78df4bad822fd3f9cbdb4eb60d9c5debcdb0d056
Reviewed-Content-Hash: design/gdd/systems-index.md a57dea8a6c59ab9c163c83673a824f8f37f9dcca
Reviewed-Content-Hash: design/gdd/game-concept.md 9638f7a1f3394f38352472bfc9b57753fccbb83f
Reviewed-Content-Hash: design/game-brief.md 302532346c1d5c9a7fd1778bbd12b7fe277630c2

## Review — 2026-11-22 — Verdict: NEEDS REVISION
Review mode: lean · Workflow: standard
Scope signal: L
Specialists: none (lean mode; independent reviewer subagent per GDD, batch review of all 13 UAT-1 GDDs)
Blocking items: 3 | Recommended: 8 (logged; full report lists more)
Summary: Both prior blockers are resolved (6-hop relay sink; Rope Links as hit-test provider) and registry values match. Remaining blockers are precision: relay choice order and pawn.from are undefined, AC19/20 describe an unreachable state, and 'a rope runs x→y' does not say whether Fading ropes count.
Prior verdict resolved: Yes (prior blocking items resolved)
Findings:
- [BLOCKING] Formulas F3: relay_ropes order and pawn.from for relayed pawns undefined (non-deterministic; AC18)
- [BLOCKING] Formulas F3 example / AC19 / AC20: both-ways Active state unreachable; mark injected or restate
- [BLOCKING] Core Rule 2 / F1 / F4: 'rope runs x→y' does not say whether Fading counts
- [RECOMMENDED] Dependencies: stale Consistency-to-fix section
- [RECOMMENDED] Dependencies / Interactions: Level State row, cycle note, systems-index entry missing
- [RECOMMENDED] Edge Cases: pawns_per_rope_max skip not implementable (no per-rope count interface)
- [RECOMMENDED] Edge Cases: ties/cuts/sends in Ending and Armed uncovered
- [RECOMMENDED] Acceptance Criteria: Extending-rope cut, rope_cut rival, events, rule 14 untested
- [RECOMMENDED] Edge Cases: R1/R3 clamp undefined when window is empty
- [RECOMMENDED] Acceptance Criteria AC32 cannot fail (and 1,470 px diagonal is illegal under Campaign B2)
- [RECOMMENDED] Core Rule 10: backstop pawn_lost not mentioned
Reviewed-Content-Hash: design/gdd/rope-links.md b1365d0079062d78e6df7717049529eed24684ce
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
Summary: Relay order and pawn.from are resolved and every recomputed number holds. Still open: whether a Fading rope counts as 'a rope runs x to y'; new: when ties and cuts take effect inside a step against that step's sends (conflicts with Troop Marching's phase table and Rival AI).
Prior verdict resolved: Partly
Findings:
- [BLOCKING] Core Rule 2 / F1 / F4 / States: Fading not defined for duplicate, reverse and the lane test (prior)
- [BLOCKING] Rule 8 vs Edge Case vs Troop Marching per-step order: cut and tie timing within a step (phase 1b rival cut vs phase 2 send, slot release, player input placement)
- [RECOMMENDED] AC19/AC20 setup for the both-ways state
- [RECOMMENDED] Edge Cases: ties, cuts and sends in Armed and Ending (prior)
- [RECOMMENDED] Rule 10: backstop pawn_lost not mentioned
- [RECOMMENDED] R1/R4 clamp undefined when no valid value; clamp order
- [RECOMMENDED] Rope age, ropes_held and per-rope sent count interfaces undefined
- [RECOMMENDED] Dependencies stale; Level State missing from Interactions
- [RECOMMENDED] AC22/AC25/AC30/AC31 measurable rewrites
Revisions applied 2026-11-22 (user-approved, cross-document round 2): Fading never blocks duplicate, reverse or the lane (rule 2, F1, F4; blocker resolved); a cut frees its slot at once and the last pawn still leaves, then Fading (rule 8, States, edge case; blocker resolved); hit-test provider every frame incl. Armed; HUD reads tie_legal; AC32c and AC32d added. Status stays Needs Revision pending the per-document blockers.
Reviewed-Content-Hash: design/gdd/rope-links.md c06a1b8927af3ccfef88c465d044bf401ea36e4a
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
Reviewed-Content-Hash: design/gdd/troop-marching-clashes.md 04ae0014fd6dd5849c0bfe1429a938a42ff32a0b
Reviewed-Content-Hash: design/gdd/level-state-match-flow.md 8da5b7c5570dba901a2a6e35f3df86e916ff7356
Reviewed-Content-Hash: design/gdd/rival-ai.md 8f0066ad441e1b50a073383b5333d6785646140e
Reviewed-Content-Hash: design/gdd/campaign-level-data.md 696e3c5a30618c724a9e8ae08d1de9296edd3f96
Reviewed-Content-Hash: design/gdd/world-map-regions.md e1b4c51ac0ba108f25b3fcb5d35e6bddbae0aada
Reviewed-Content-Hash: design/gdd/level-hud.md c0946163f4a8610ac9cedcba8d8ad342997ba759
Reviewed-Content-Hash: design/gdd/menus-screens.md c20ff536a7a8e07072c2e2602fecb9c1318a740e
