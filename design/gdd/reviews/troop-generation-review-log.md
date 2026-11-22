# Review Log: Troop Generation

## Review — 2026-11-22 — Verdict: NEEDS REVISION
Review mode: lean · Workflow: standard
Scope signal: M
Specialists: none (lean mode; independent reviewer session, Opus)
Blocking items: 1 | Recommended: 6
Summary: F4 and AC15 held the keep's level constant, but Keep Levels drops it below 30 and 10 troops, so a level 3 keep falls to one rope in about 49 s (step simulation), not 80–95 s; AC15 could never pass. Rope Links was missing from Interactions and Dependencies, and the float-seconds timer made the exact-step criteria fragile.
Prior verdict resolved: First review
Findings:
- [BLOCKING] Formulas F4 / AC15: capture time ignores level drops (49 s simulated vs 80–95 s)
- [RECOMMENDED] Interactions / Dependencies: Rope Links listed as "none"
- [RECOMMENDED] Core Rule 1: timer in float seconds vs exact-step ACs
- [RECOMMENDED] Invariants I3: checked twice with different clamps (here and Rope Links R1)
- [RECOMMENDED] Dependencies / Cross-References: stale "no GDD yet" and consistency items
- [RECOMMENDED] Edge Cases: no single per-step order across systems
- [RECOMMENDED] Acceptance Criteria AC25: not pass/fail
Revisions applied 2026-11-22 (user-approved; capture pace ~52 s kept by the user): F4 sums over level bands (≈ 55 s expected, simulation reference ≈ 52 s); AC15 48–56 s, same case as Troop Marching AC-M32; Rope Links added both ways; timer in whole steps (gen_interval_steps) and AC23 in steps; I3 checked once, clamp lowers send_interval; Full means at or above the cap; per-step order points to Troop Marching § Formulas; OQ5 closed (keep's own side first); AC25 pass/fail; Summary, data-key mapping, rival slot dots, stale items fixed. Status set to In Review pending re-review.
Reviewed-Content-Hash: design/gdd/troop-generation.md 6bf7dec626b85c6e5fe8ecebc6a4b050d3ce9bc3
Reviewed-Content-Hash: design/registry/entities.yaml 44d26d5a860ebcb7026da6a5ed63411383f134e2
Reviewed-Content-Hash: .claude/skills/design-review/SKILL.md 4dcc8b81162613c757144532f1b72708ab3ba27f
Reviewed-Content-Hash: design/gdd/screen-flow-scene-manager.md 31f6b9f1371007926448f359f895ad0b85f989d9
Reviewed-Content-Hash: design/gdd/touch-mouse-input.md 4203499bad17d93a7efa8a191d3dbfaf55545e74
Reviewed-Content-Hash: design/gdd/save-progress.md 4ef1eafb7b0fb29715768faaffc41ecaabccb7af
Reviewed-Content-Hash: design/gdd/keep-levels.md 78df4bad822fd3f9cbdb4eb60d9c5debcdb0d056
Reviewed-Content-Hash: design/gdd/rope-links.md f6816232d25eee1e737641dd0b6294ade7a6c912
Reviewed-Content-Hash: design/gdd/systems-index.md a57dea8a6c59ab9c163c83673a824f8f37f9dcca
Reviewed-Content-Hash: design/gdd/game-concept.md 9638f7a1f3394f38352472bfc9b57753fccbb83f
Reviewed-Content-Hash: design/game-brief.md 302532346c1d5c9a7fd1778bbd12b7fe277630c2

## Review — 2026-11-22 — Verdict: NEEDS REVISION
Review mode: lean · Workflow: standard
Scope signal: M
Specialists: none (lean mode; independent reviewer subagent per GDD, batch review of all 13 UAT-1 GDDs)
Blocking items: 2 | Recommended: 8 (logged; full report lists more)
Summary: Prior blocker (F4/AC15 ignored level drops) is fixed and F1–F4 re-derive correctly; registry values all agree. New: F1/Rule 3's min() clamp destroys troops above a lowered cap, contradicting Edge Cases and AC22, and Rule 5's level-1 wait has no AC.
Prior verdict resolved: Yes (prior blocking items resolved)
Findings:
- [BLOCKING] Formulas F1 / Core Rule 3: min(troop_cap, troops+gen) destroys troops above a lowered cap; contradicts Edge Case and AC22
- [BLOCKING] Acceptance Criteria: Rule 5 level-1 wait_for_first_rope exception has no AC
- [RECOMMENDED] Dependencies: stale 'only 3 GDDs exist' text and Consistency-to-fix item
- [RECOMMENDED] Open Questions: OQ3 past its resolve-by; OQ6 duplicates a decided note
- [RECOMMENDED] Visual: floating '+N' and 'full' mark conflict with Level HUD beat pop and glint
- [RECOMMENDED] Acceptance Criteria: 'keep reached cap' event has no AC
- [RECOMMENDED] Formulas: I3/F2/AC18 use unrounded interval; quantised step values not stated
- [RECOMMENDED] Edge Cases: interval-shrink case gives wrong reason (burst of beats)
- [RECOMMENDED] Formulas F4: n range 1–3 is wrong; F3 ceil ignores band overshoot
- [RECOMMENDED] Acceptance Criteria: AC5/8/9/20 in seconds, should be steps; register F1/F3/F4/capture_troops
Reviewed-Content-Hash: design/gdd/troop-generation.md d2ba2132b296666c69bd0b6d907fd2cefcb86807
Reviewed-Content-Hash: design/registry/entities.yaml b7664dbf04df5012d7e1f5b7b57847ac142c8b18
Reviewed-Content-Hash: .claude/skills/design-review/SKILL.md 4dcc8b81162613c757144532f1b72708ab3ba27f
Reviewed-Content-Hash: design/gdd/game-concept.md b9ec7dd07d6d43c3e9abb1208bac711ad23ae758
Reviewed-Content-Hash: design/gdd/systems-index.md 54c5d0974e9b80218fa4082ceb37e11bdc86e243
Reviewed-Content-Hash: design/game-brief.md 7d90b94906b28807d72b86ade5f754d9a7c62b75
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
Reviewed-Content-Hash: design/gdd/level-hud.md c0946163f4a8610ac9cedcba8d8ad342997ba759
Reviewed-Content-Hash: design/gdd/menus-screens.md 2ff1faab335ff570b4796954f02788d5649c17f0

## Review — 2026-11-22 — Verdict: NEEDS REVISION
Review mode: lean · Workflow: standard
Scope signal: S
Specialists: none (lean mode; target unchanged since its last review, cross-document facts re-verified by an independent subagent against the 8 edited GDDs and the registry)
Blocking items: 2 | Recommended: 1 (logged; full report lists more)
Summary: Unchanged; no new cross-doc conflict (I3 vs Rope Links R1 clamp agrees). Both prior blockers stand.
Prior verdict resolved: No (document not revised)
Findings:
- [BLOCKING] Formulas F1 / Core Rule 3: min(troop_cap, ...) destroys troops above a lowered cap, contradicting the never-destroyed edge case and AC22 (prior)
- [BLOCKING] Acceptance Criteria: Rule 5 wait_for_first_rope exception has no AC here (prior)
- [RECOMMENDED] Dependencies: Campaign Level Data still Provisional; Consistency-to-fix stale; I1-I3 not named in the bad-data policy
Reviewed-Content-Hash: design/gdd/troop-generation.md d2ba2132b296666c69bd0b6d907fd2cefcb86807
Reviewed-Content-Hash: design/registry/entities.yaml 7c078a61a2fe209d71cee39822db4cfe17d257ff
Reviewed-Content-Hash: .claude/skills/design-review/SKILL.md 4dcc8b81162613c757144532f1b72708ab3ba27f
Reviewed-Content-Hash: design/gdd/game-concept.md b9ec7dd07d6d43c3e9abb1208bac711ad23ae758
Reviewed-Content-Hash: design/gdd/systems-index.md 51f7eff69a32aa0925544e25a07136f03d38cbdc
Reviewed-Content-Hash: design/game-brief.md 7d90b94906b28807d72b86ade5f754d9a7c62b75
Reviewed-Content-Hash: design/gdd/keep-levels.md 433e135e0ec091348cab95776797287a08b45452
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

## Revision — 2026-11-22 — after the second review and the cross-GDD review (session my-game-tower-war-7a)
Status after revision: In Review (pending re-review in a fresh session)
Addressed:
- [BLOCKING] F1 / Core Rule 3: beat now leaves a count at or above `troop_cap` unchanged (`troops ≥ troop_cap ? troops : min(...)`); Rule 1 range and F1 output range state it; agrees with the lowered-cap edge case and AC22
- [BLOCKING] Rule 5 exception AC: Rule 5 names `wait_for_first_rope` (gv-01 only) and clock step 0; new AC26 (no generation while Armed, timer 1 after step 0, first beat on clock step 149)
- [CROSS-REVIEW X1] Capture pace: player decision (2026-11-22) keeps `level_drop_margin` 5; F4 example restated (last send 56.3 s, capture step 3,541 = 59.0 s); AC15 window 55–63 s; two-rope figure flagged for re-run. Troop Marching AC-M32 / OQ (d) to match, applied by the other session
- [CROSS-REVIEW C1] Factions labelled UAT-2, not Alpha (quick reference, rule 10, Interactions, Dependencies)
Not addressed (recommended): Dependencies Campaign Level Data still "Provisional"; Consistency-to-fix note; I1–I3 named in the bad-data policy

## Revision — 2026-11-22 (cross-GDD review round 2)
Revisions applied 2026-11-22 (user-approved, cross-GDD review round 2): I3 restated: an unfed keep cannot out-grow one enemy rope, an allied feed can (H5; Summary, I3, loop note); Rival AI reads troop_cap (Interactions, Dependencies); strength bar line updated for keep troops only (H4). Status In Review, pending re-review.

## Revision — 2026-11-22 (cross-GDD review round 3)
Revisions applied 2026-11-22 (user-approved, cross-GDD review round 3): Dependencies and Interactions refreshed (R3A3: statuses, Rival AI reads level from Keep Levels, checked-against lines, index note); Open Questions 3 and 4 retiered to UAT-2 (R3A3, R3A8). Status In Review, pending re-review.

## Review — 2026-11-22 — Verdict: APPROVED
Review mode: lean · Workflow: standard
Scope signal: M
Specialists: none (lean mode; session my-game-tower-war-39, third pass)
Blocking items: 0 | Recommended: 8
Summary: Both prior blockers are resolved (F1 now leaves a count at or above the cap unchanged, agreeing with the lowered-cap edge case and AC22; AC26 covers the first-rope exception). All registered values match and every worked number recomputes; Keep Levels, Rope Links, Troop Marching, Level State, Rival AI, Level HUD and Campaign Level Data all name Troop Generation. Only wording and staleness items remain.
Prior verdict resolved: Yes
Findings:
- [RECOMMENDED] Rules 6, 7 and AC8: "removes 1 / adds 1 / troops becomes 1" are hardcoded; Troop Marching defines them by strength and `capture_troops` (baseline 1)
- [RECOMMENDED] F4: the two-rope example still carries a stale 15.6 s figure marked "re-run before tuning"
- [RECOMMENDED] Visual/Audio: says there is no art bible; design/art/art-bible.md exists
- [RECOMMENDED] Edge Cases: a lowered `gen_interval` can fire a beat on each following step until the timer falls below the new interval; state it or cap it
- [RECOMMENDED] AC5: state the concrete result (58) instead of "55 plus its level's gen_amount"
- [RECOMMENDED] Open Questions: OQ6 (ring of full allied keeps) is decided by Troop Marching rule 13; close it
- [RECOMMENDED] Dependencies: "Consistency to fix" now lists only checked items; rename
- [RECOMMENDED] Dependencies: refresh the Campaign Level Data status when it is approved
Reviewed-Content-Hash: design/gdd/troop-generation.md d6b7a6dcaa86139d694f9ec483d0d3d2e4c04d5e
Reviewed-Content-Hash: design/registry/entities.yaml 167b97a34b6523bffa93706905c8f17c8bb70997
Reviewed-Content-Hash: .claude/skills/design-review/SKILL.md 4dcc8b81162613c757144532f1b72708ab3ba27f
Reviewed-Content-Hash: design/gdd/keep-levels.md 3ca233dfd0a4a7dae40864251feb45ad8d925fd5
Reviewed-Content-Hash: design/gdd/rope-links.md 7b5d310afb0be438c29a5e751b897a9e25afbf6a
Reviewed-Content-Hash: design/gdd/troop-marching-clashes.md a07a7f4075c2cd1f812e6e1c181dda20600171a3
Reviewed-Content-Hash: design/gdd/level-state-match-flow.md 278b4a5562e3058864875073434324c5881885aa
Reviewed-Content-Hash: design/gdd/rival-ai.md af05107644367237afaf937104b63bc600160cb1
Reviewed-Content-Hash: design/gdd/level-hud.md 7cfd316d24c5f36fa273a5aa2d0e3535b4019c93
Reviewed-Content-Hash: design/gdd/campaign-level-data.md 9ae28ab7df06f5a9268a3971f228afb17f33cace
