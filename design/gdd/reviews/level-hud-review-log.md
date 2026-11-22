# Review Log: Level HUD

## Review — 2026-11-22 — Verdict: NEEDS REVISION
Review mode: lean · Workflow: standard
Scope signal: M
Specialists: none (lean mode; independent reviewer subagent per GDD, batch review of all 13 UAT-1 GDDs)
Blocking items: 4 | Recommended: 9 (logged; full report lists more)
Summary: Complete and carefully cross-referenced with timing values matching the registry. Blockers: AC3 specifies an impossible state, F1 has no rounding rule and its example is off by a pixel, F3 and AC5 contradict, and the cursor-hint path has no source event, duration or AC.
Prior verdict resolved: First review
Findings:
- [BLOCKING] Acceptance Criteria AC3 / F2 example: slots refusal on an Armed level is impossible
- [BLOCKING] Formulas F1: rounding / remainder / 1 px minimum unspecified; example off by 1 px
- [BLOCKING] Formulas F3 vs AC5: fixed digit_width_px 11 cannot fit plaque_font_px 30
- [BLOCKING] Formulas F2 / Interactions: cursor hint has no source event, duration or AC
- [RECOMMENDED] Core Rules 3–4: plaque and dot vertical extent vs H1
- [RECOMMENDED] Formulas F1: strength units (pawn hp = troops) unstated
- [RECOMMENDED] Visual: glint_time undefined
- [RECOMMENDED] Core Rule 12: four texts plus silent self, not five
- [RECOMMENDED] Core Rule 5 / AC7: two-level rise
- [RECOMMENDED] Edge Cases: capture burst vs beat-never-suppressed
- [RECOMMENDED] Invariant H1 / AC9: band shrink floor
- [RECOMMENDED] Core Rule 1: stray clause
- [RECOMMENDED] Dependencies: stale reverse links in Level State and Campaign; register constants
Reviewed-Content-Hash: design/gdd/level-hud.md c0946163f4a8610ac9cedcba8d8ad342997ba759
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
Reviewed-Content-Hash: design/gdd/campaign-level-data.md 7567d1fa919a440208355e083ec8ce685b34a552
Reviewed-Content-Hash: design/gdd/world-map-regions.md e1b4c51ac0ba108f25b3fcb5d35e6bddbae0aada
Reviewed-Content-Hash: design/gdd/menus-screens.md 2ff1faab335ff570b4796954f02788d5649c17f0

## Review — 2026-11-22 — Verdict: NEEDS REVISION
Review mode: lean · Workflow: standard
Scope signal: M
Specialists: none (lean mode; target unchanged since its last review, cross-document facts re-verified by an independent subagent against the 8 edited GDDs and the registry)
Blocking items: 4 | Recommended: 3 (logged; full report lists more)
Summary: Unchanged; agrees with Screen Flow, Level State and Menus on pause_allowed, Ending and time on overlays only. All four prior blockers stand.
Prior verdict resolved: No (document not revised)
Findings:
- [BLOCKING] AC3 / F2: slots refusal on an Armed level impossible (prior)
- [BLOCKING] F1: no rounding or 1 px minimum rule; example off by 1 px (prior)
- [BLOCKING] F3 vs AC5: digit_width_px 11 cannot fit plaque_font_px 30 (prior)
- [BLOCKING] F2 / Interactions: cursor hint has no source event, duration or AC (prior)
- [RECOMMENDED] Bidirectional-check text stale (Screen Flow Pause button added)
- [RECOMMENDED] Level State HUD row omits pause_allowed
- [RECOMMENDED] H1 fails on every Green Vale level at keep_hit_radius 120; plaque fit at radius 48
Reviewed-Content-Hash: design/gdd/level-hud.md c0946163f4a8610ac9cedcba8d8ad342997ba759
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
Reviewed-Content-Hash: design/gdd/campaign-level-data.md 696e3c5a30618c724a9e8ae08d1de9296edd3f96
Reviewed-Content-Hash: design/gdd/world-map-regions.md e1b4c51ac0ba108f25b3fcb5d35e6bddbae0aada
Reviewed-Content-Hash: design/gdd/menus-screens.md c20ff536a7a8e07072c2e2602fecb9c1318a740e

## Revision — 2026-11-22 — after its review and the cross-GDD review (session my-game-tower-war-7a)
Status after revision: In Review (pending re-review in a fresh session)
Addressed:
- [BLOCKING] AC3 / F2: slots refusal moved to a Running level; Armed case tests a `self` refusal keeping the Armed hint
- [BLOCKING] F1 rounding: round half up, 1 px minimum for a non-zero side, neutral takes the remainder, total 0 → 167/166/167; examples corrected; AC21
- [BLOCKING] F3 vs AC5: digit width follows font size (`digit_aspect` 0.48), plaque height max(30, font + 7); AC5 at font 30 → 58 × 37 px
- [BLOCKING] Cursor hint: source event `hint_shown("cursor")` from Touch & Mouse Input (agreed with the other session), shown for `strip_time`; AC22
- [CROSS-REVIEW X2] strings: player decision (2026-11-22) — UAT-1 strings data file, Localization after UAT (rule 15, Interactions, Dependencies, Edge Cases, UI Requirements)
- [CROSS-REVIEW X9, HUD side] drag feedback drawn on the next rendered frame, Armed included (rule 8, AC12); preview legality read from Rope Links `tie_legal`, not Input (agreed with the other session)
- [CROSS-REVIEW G-C2] Rope Links has four refusal texts (`self` silent)
Not addressed (recommended): stale bidirectional-check text; Level State HUD row omits pause_allowed (Level State, other session); H1 at keep_hit_radius 120 and plaque fit at radius 48

## Revision — 2026-11-22 (cross-GDD review round 2)
Revisions applied 2026-11-22 (user-approved, cross-GDD review round 2): strip timer counts unpaused rendered time, not match steps, so Armed messages expire (blocker B1; AC22 and new AC4b); strength bar counts keep troops only (H4; F1, AC1, AC2, registry); blocked refusal silent; one strings-ownership rule in rule 15 (B3); plaque height floor named (B15); H1 cites Campaign Level Data B6 and plaque overlap goes to the UX spec (B10); Dependencies add tie_legal and statuses (B8, B17). Status In Review, pending re-review.

## Revision — 2026-11-22 (cross-GDD review round 3)
Revisions applied 2026-11-22 (user-approved, cross-GDD review round 3): AC22 Armed clause no longer relies on an unreachable not_yours refusal (R3B4); plaque_width and plaque_min_height_px registered (B21). Status In Review, pending re-review.
