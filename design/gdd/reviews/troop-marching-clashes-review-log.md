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

## Review — 2026-11-22 — Verdict: APPROVED
Review mode: lean · Workflow: standard
Scope signal: L
Specialists: game-designer (independent subagent review)
Blocking items: 0 | Recommended: 10
Summary: All 3 prior blockers are fixed (no_rope loss has an owner and state, M2/M3 are level checks, pawns_in_flight counts Marching only). F1–F9 hand-check, the phase 0–7 step order has no contradictions, and there are no registry conflicts. AC-M32's recount gives step 3,493 (58.2 s) against the doc's 3,541 (59.0 s), both inside the 55–63 s band.
Prior verdict resolved: Yes
Not run: gdd-structure-check.sh (subagent had no Bash tool; sections checked by heading read)
Findings:
- [RECOMMENDED] Acceptance Criteria: AC-M32 pin the simulation (owner, first-send step, timer meaning, beat reset) or check the script in; recount 3,493 vs 3,541
- [RECOMMENDED] Acceptance Criteria: AC-M12 does not say when the ropes are tied
- [RECOMMENDED] Acceptance Criteria: AC-M43 and AC-M45 not independently testable (prior item)
- [RECOMMENDED] Detailed Rules: rule 1 launch signature omits a relay's unit, hp and relays; the no_rope handshake is never described
- [RECOMMENDED] Formulas: F9 uses an unqualified pawns_in_flight; say total across owners
- [RECOMMENDED] Dependencies: add Touch & Mouse Input upstream (prior item)
- [RECOMMENDED] Registry: register capture_troops and pawns_in_flight_max (prior item)
- [RECOMMENDED] Acceptance Criteria: AC-M29 is a hand estimate; simulate before it gates
- [RECOMMENDED] Formulas: F9 B_send "up to ~1,035" has no derivation
- [RECOMMENDED] Detailed Rules: confirm rule 11's own-side-first outcome at a full keep is intended
Reviewed-Content-Hash: design/gdd/troop-marching-clashes.md a07a7f4075c2cd1f812e6e1c181dda20600171a3
Reviewed-Content-Hash: design/registry/entities.yaml 41f062f6645bf0d3c1230986fbfcdda9b7ded370
Reviewed-Content-Hash: .claude/skills/design-review/SKILL.md 4dcc8b81162613c757144532f1b72708ab3ba27f
Reviewed-Content-Hash: design/gdd/game-concept.md 5f59d626512352792d034532184266656d283cde
Reviewed-Content-Hash: design/gdd/troop-generation.md d6b7a6dcaa86139d694f9ec483d0d3d2e4c04d5e
Reviewed-Content-Hash: design/gdd/keep-levels.md 3ca233dfd0a4a7dae40864251feb45ad8d925fd5
Reviewed-Content-Hash: design/gdd/rope-links.md 7b5d310afb0be438c29a5e751b897a9e25afbf6a

## Review — 2026-11-22 — Verdict: APPROVED
Review mode: lean · Workflow: standard
Scope signal: S
Specialists: none. Scope: re-check of two edits since the APPROVED entry above, not a full review: the Status header (In Review -> Approved) and F9's B_send range.
Blocking items: 0 | Recommended: 0 (the 10 recommendations above stand, less the F9 one fixed here)
Summary: F9's `B_send` "up to ~1,035" (45 × 23) was stale, as flagged in the Rope Links re-review and this doc's own recommendation 9. This GDD's F8 gives 21 per rope at baseline (ceil(1,258 / 66) + 1), so the bound is 15 keeps × 3 ropes × 21 = 945, matching Rope Links F5. No other use of the figure; the F9 formulas and the ring examples (83, 319) are unchanged.
Prior verdict resolved: Yes
Findings:
- none
Reviewed-Content-Hash: design/gdd/troop-marching-clashes.md 65c480aa9794cc82d3b527a66b2678b440c761da
Reviewed-Content-Hash: design/gdd/rope-links.md 5321180615344685ece5173c975bb8ab91380212

## Review — 2026-11-25 — Verdict: NEEDS REVISION
Review mode: lean · Workflow: standard
Scope signal: L
Specialists: none (lean mode; independent subagent re-review of the 2026-11-22 polish pass, run on Fable)
Blocking items: 1 | Recommended: 7
Summary: The polish pass introduced no contradiction (relay payload, synchronous ally_arrived_full, rule 11, F9 945, registry entries, OQ 9-12), but AC-M40 uses a 1,258 px pair that Campaign Level Data B2 now rejects.
Prior verdict resolved: Yes
Ran: gdd-structure-check.sh (6/6 required present); review-receipts.sh check with the skill's Phase 1 arguments (target, registry and SKILL.md CHANGED, so a full review). Not run: Phase 3b specialists (lean).
Not stamped: systems-index.md and session my-game-tower-war-39's GDDs (troop-generation, rival-ai, save-progress, level-hud, world-map-regions, menus-screens), which changed during or after the review window and whose reviewed bytes cannot be rebuilt.
Findings:
- [BLOCKING] Acceptance Criteria (AC-M40): the 1,258 px fixture cannot load under B2; use 1,226 px (42 vs 40 at speed 50, 31 at 70)
- [RECOMMENDED] Acceptance Criteria: no AC here covers pawn_lost(no_rope)
- [RECOMMENDED] Formulas (F1 and l.140/212/232/359): 1,258 called the longest legal rope; relabel as the pre-lift safe bound or switch to 1,226
- [RECOMMENDED] Detailed Rules (rule 15): ally_arrived_full is still listed under Events though it is now a synchronous call
- [RECOMMENDED] Formulas (F9 / rule 13): whether the arriving pawn counts toward the backstop
- [RECOMMENDED] Dependencies: Unit Roster wording stale (it exists); Touch & Mouse Input not bidirectional; index row 7
- [RECOMMENDED] Cross-doc: Level State F2 says pawns act at the target's edge; this doc says centre
- [RECOMMENDED] Cross-doc: Keep Levels quotes keep_captured with two arguments
Reviewed-Content-Hash: design/gdd/troop-marching-clashes.md 8e0a1867f5c6f0121e28ced14984bc6bde17ff92
Reviewed-Content-Hash: design/registry/entities.yaml 6995a374ebc48017e906c831e9fbfbf773eb9534
Reviewed-Content-Hash: .claude/skills/design-review/SKILL.md c1afa55116b1c2f752e01f9d6deb637beae8e7a9
Reviewed-Content-Hash: design/gdd/game-concept.md 5f59d626512352792d034532184266656d283cde
Reviewed-Content-Hash: design/gdd/rope-links.md ac2e00c8c6b268c42d53274342a1a4d5ada7eb4e
Reviewed-Content-Hash: design/gdd/level-state-match-flow.md 398454ab6391644c93c526fc3b3ef7242f23b0ab
Reviewed-Content-Hash: design/gdd/campaign-level-data.md 90268b88ad2ebcc2877deb4aa76f784c8f895ee3
Reviewed-Content-Hash: design/gdd/touch-mouse-input.md 64272df98ceadbfac50f5a3f4b3ecd7e0ca91c10
Reviewed-Content-Hash: design/gdd/keep-levels.md 4f09eb966d57b3b1b38e27b6a74c880e6965c817

## Review — 2026-11-25 — Verdict: APPROVED
Review mode: lean · Workflow: standard
Scope signal: S
Specialists: none. Scope: re-check of the blocker fix and the Status header since the entry above, not a full review; every other byte is as reviewed there.
Blocking items: 0 | Recommended: 0 (the recommendations above stand)
Summary: AC-M40 uses a 1,226 px pair (42 vs 40 at speed 50, 31 at 70); the L row, F1 range, F8 example and M2 relabel 1,258 as the pre-lift safe bound with 1,226 figures (669 marches, 11.15 s, 20 pawns, speed_min 52.4); AC-M1 gives 669 marches at 1,226 px. User decision 2026-11-25. The Status header now reads Approved (polish pass re-reviewed 2026-11-25).
Prior verdict resolved: Yes
Findings:
- none
Reviewed-Content-Hash: design/gdd/troop-marching-clashes.md 5125df2b81d39e9050271641516dc9c08a870de5
