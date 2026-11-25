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

## Review — 2026-11-22 — Verdict: NEEDS REVISION
Review mode: lean · Workflow: standard
Scope signal: M
Specialists: none (lean mode; independent subagent review)
Blocking items: 1 | Recommended: 10
Summary: The max_ropes range disagrees with itself: F3 and the registry say 1–3 per level, OQ 6 says the table allows up to 5, and K4 sets no upper bound for the loader to check. Rules, formulas and dependencies otherwise hold; most recommendations sharpen boundary wording and untestable ACs.
Prior verdict resolved: Yes (prior was APPROVED; of its 2 recommendations the stale Campaign Level Data text is fixed, the K1–K4 timing one is partly addressed)
Not run: gdd-structure-check.sh (subagent had no Bash tool; sections checked by heading grep and a full read)
Findings:
- [BLOCKING] Formulas / Open Questions: F3 and the registry cap max_ropes_table at 1–3, OQ 6 says up to 5; K4 has no upper bound, shipped clamp or AC
- [RECOMMENDED] Detailed Design: rules 6 and 9 disagree on whether level_dropped is raised on every level change or only when ropes must be cut
- [RECOMMENDED] Edge Cases: say whether the end-of-step recompute runs on a keep captured this step (lv2_at at its minimum of 2)
- [RECOMMENDED] Formulas: lv3_at range 5–120 allows values Troop Generation I1 forbids; the K1 clamp can breach I1
- [RECOMMENDED] Formulas: F4 output range "0 to 3" is unreachable; the maximum cut is 2
- [RECOMMENDED] Game Feel: "a single enemy pawn never costs a rope" is false at the drop boundary
- [RECOMMENDED] Dependencies: add Troop Marching & Clashes upstream (keep_captured), plus the missing downstream rows
- [RECOMMENDED] UI Requirements: the refusal text "Grow it" is shown at level 3, where growing is impossible
- [RECOMMENDED] Acceptance Criteria: AC21, AC22, AC23 not independently testable; AC14 omits the prior level
- [RECOMMENDED] Edge Cases: say whether K1–K4 are checked once at app start or when Factions modifiers are applied (prior item, partly open)
- [RECOMMENDED] Tuning Knobs / Player Fantasy: add both (advisory at standard)
Reviewed-Content-Hash: design/gdd/keep-levels.md 3ca233dfd0a4a7dae40864251feb45ad8d925fd5
Reviewed-Content-Hash: design/registry/entities.yaml 41f062f6645bf0d3c1230986fbfcdda9b7ded370
Reviewed-Content-Hash: .claude/skills/design-review/SKILL.md 4dcc8b81162613c757144532f1b72708ab3ba27f
Reviewed-Content-Hash: design/gdd/game-concept.md 5f59d626512352792d034532184266656d283cde
Reviewed-Content-Hash: design/gdd/rope-links.md 7b5d310afb0be438c29a5e751b897a9e25afbf6a
Reviewed-Content-Hash: design/gdd/troop-generation.md d6b7a6dcaa86139d694f9ec483d0d3d2e4c04d5e
Reviewed-Content-Hash: design/gdd/troop-marching-clashes.md a07a7f4075c2cd1f812e6e1c181dda20600171a3

## Review — 2026-11-22 — Verdict: APPROVED
Review mode: lean · Workflow: standard
Scope signal: M
Specialists: none (lean mode; independent subagent re-review). A separate lean review by session my-game-tower-war-39 on the same bytes also gave APPROVED (0 blocking, 7 recommended).
Blocking items: 0 | Recommended: 9
Summary: The prior blocker is resolved: K4 caps max_ropes_table at 3 with a shipped clamp and AC18b. F3, OQ 6, the registry [1, 3] and Rope Links all agree. Nothing new blocks; one new recommendation (K4's floor has no clamp or AC) joins eight carried items.
Prior verdict resolved: Yes
Ran: gdd-structure-check.sh (6/6 required present; Player Fantasy, Tuning Knobs absent, advisory). review-receipts.sh check: target and registry CHANGED, so a full review ran.
Not run: Phase 3b specialists (lean). Grep only: level-hud.md, troop-generation.md, design/game-brief.md.
Findings:
- [RECOMMENDED] Detailed Rules: rule 6 reads as raising level_dropped only when ropes must be cut; rule 9, the States table, AC3 and Level HUD's crumble need it on every drop
- [RECOMMENDED] Game Feel: "a single enemy pawn never costs a rope" is false at exactly 10 troops on a level 2 keep
- [RECOMMENDED] Formulas: F4 output range "0 to 3" is unreachable; the maximum cut is 2
- [RECOMMENDED] Formulas: K4's max_ropes_table[1] ≥ 1 floor has no shipped clamp and no AC, though the coverage line claims one
- [RECOMMENDED] Formulas: lv3_at / lv2_at ranges allow values Troop Generation I1 forbids
- [RECOMMENDED] Dependencies: Troop Marching & Clashes (keep_captured) missing upstream
- [RECOMMENDED] Edge Cases: arrivals after a capture in the same step
- [RECOMMENDED] UI Requirements: "Grow it" refusal text shown at level 3
- [RECOMMENDED] Acceptance Criteria: AC21, AC22, AC23 not testable; AC14 omits the prior level
Reviewed-Content-Hash: design/gdd/keep-levels.md 10dd42f92d3902779121446a7d6c3be7f86446f4
Reviewed-Content-Hash: design/registry/entities.yaml 66d85eeae3216b38ef327139f1e3a34bd6b95d2e
Reviewed-Content-Hash: .claude/skills/design-review/SKILL.md 4dcc8b81162613c757144532f1b72708ab3ba27f
Reviewed-Content-Hash: design/gdd/game-concept.md 5f59d626512352792d034532184266656d283cde
Reviewed-Content-Hash: design/game-brief.md 7d90b94906b28807d72b86ade5f754d9a7c62b75
Reviewed-Content-Hash: design/gdd/rope-links.md 2809263e1cbc6e0c7e0df2b65a63821831714ab3
Reviewed-Content-Hash: design/gdd/troop-marching-clashes.md 04e30da7c4624d59c6218de5ae1fe1c6f698aac6
Reviewed-Content-Hash: design/gdd/campaign-level-data.md 222f45a25408ce350f951e1d96756882331277b6
Reviewed-Content-Hash: design/gdd/level-hud.md 7cfd316d24c5f36fa273a5aa2d0e3535b4019c93
Reviewed-Content-Hash: design/gdd/troop-generation.md d6b7a6dcaa86139d694f9ec483d0d3d2e4c04d5e

## Review — 2026-11-22 — Verdict: APPROVED
Review mode: lean · Workflow: standard
Scope signal: S
Specialists: none. Scope: header-only re-check, not a full review. The one edit since the entry above is line 3, the Status header ("In Review (revised 2026-11-22, pending re-review)" -> "Approved (2026-11-22, lean /design-review; see its review log)"), made to match the systems index.
Blocking items: 0 | Recommended: 0 (the recommendations above stand)
Summary: Verified mechanically: restoring the old header line gives exactly the content hash stamped in the entry above (10dd42f9), so no other byte changed. The verdict above carries over unchanged.
Prior verdict resolved: Yes
Findings:
- none
Reviewed-Content-Hash: design/gdd/keep-levels.md 80e0caaefc76ea3a44a0f0fa158d7d7075a381b7

## Review — 2026-11-25 — Verdict: APPROVED
Review mode: lean · Workflow: standard
Scope signal: M
Specialists: none (lean mode; independent subagent re-review of the 2026-11-22 polish pass, run on Fable)
Blocking items: 0 | Recommended: 8
Summary: Every polish change is consistent inside the doc and against Rope Links (strings, AC32i), Troop Marching, Troop Generation (I1), Level HUD and the registry; AC15's clamp now gives 26 and the level-3 string matches Rope Links exactly.
Prior verdict resolved: Yes
Ran: gdd-structure-check.sh (6/6 required present); review-receipts.sh check with the skill's Phase 1 arguments (target, registry and SKILL.md CHANGED, so a full review). Not run: Phase 3b specialists (lean).
Not stamped: systems-index.md and session my-game-tower-war-39's GDDs (troop-generation, rival-ai, save-progress, level-hud, world-map-regions, menus-screens), which changed during or after the review window and whose reviewed bytes cannot be rebuilt.
Findings:
- [RECOMMENDED] Edge Cases (clamp order): lv2_at <= 1 and lv2_at >= troop_cap are not repaired, so 'never starts with a breached invariant' is false there (shipped builds only)
- [RECOMMENDED] Formulas (F2 prev): same-side arrivals after a capture can give level 2 on the capture step, against the 'capture wins' edge case and OQ 9
- [RECOMMENDED] Cross-doc: troop-generation.md F3 still gives lv2_at 2-60 / lv3_at 5-120 (now 2-59 / 5-60; better troop_cap - 1 / troop_cap)
- [RECOMMENDED] Dependencies: the upstream keep_captured row should have three arguments (keep, old_owner, new_owner)
- [RECOMMENDED] Dependencies: Level HUD rows list level_rose only; the Quick reference and index row 5 omit Troop Marching
- [RECOMMENDED] Dependencies: unit-roster-stats.md now exists, so 'no GDD yet' is stale
- [RECOMMENDED] UI Requirements: the Castle string hard-codes 3 while K4 allows a smaller max_ropes_table[3]
- [RECOMMENDED] Acceptance Criteria: AC17 breaches K2 first; AC8's crumble is not checkable in a Logic test
Reviewed-Content-Hash: design/gdd/keep-levels.md 4f09eb966d57b3b1b38e27b6a74c880e6965c817
Reviewed-Content-Hash: design/registry/entities.yaml 6995a374ebc48017e906c831e9fbfbf773eb9534
Reviewed-Content-Hash: .claude/skills/design-review/SKILL.md c1afa55116b1c2f752e01f9d6deb637beae8e7a9
Reviewed-Content-Hash: design/gdd/game-concept.md 5f59d626512352792d034532184266656d283cde
Reviewed-Content-Hash: design/gdd/rope-links.md ac2e00c8c6b268c42d53274342a1a4d5ada7eb4e
Reviewed-Content-Hash: design/gdd/troop-marching-clashes.md 8e0a1867f5c6f0121e28ced14984bc6bde17ff92
Reviewed-Content-Hash: design/gdd/campaign-level-data.md 90268b88ad2ebcc2877deb4aa76f784c8f895ee3
Reviewed-Content-Hash: design/gdd/level-state-match-flow.md 398454ab6391644c93c526fc3b3ef7242f23b0ab

## Review — 2026-11-25 — Verdict: APPROVED
Review mode: lean · Workflow: standard
Scope signal: S
Specialists: none. Scope: re-check of the Status header (In Review -> Approved) since the entry above, not a full review; every other byte is as reviewed there.
Blocking items: 0 | Recommended: 0 (the recommendations above stand)
Summary: The Status header now reads Approved (polish pass re-reviewed 2026-11-25).
Prior verdict resolved: Yes
Findings:
- none
Reviewed-Content-Hash: design/gdd/keep-levels.md ca5627285552fe1f9e7fff5d335e1633d53ce701
