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

## Review — 2026-11-22 — Verdict: NEEDS REVISION
Review mode: lean · Workflow: standard
Scope signal: M
Specialists: none (lean mode; independent subagent review)
Blocking items: 3 | Recommended: 10
Summary: Every Green Vale value matches prototypes/tower-war/config.js and the registry, and 3 of the 5 prior blockers are fixed. Still blocking: AC16's known-id set omits the shipped regions r2–r5; region and level order and membership have no single source of truth; required fields, types and region-record validation are undefined.
Prior verdict resolved: No (3 of 5 fixed: rival keeps at level 2, M2, empty next region; drop policy and required fields still open)
Not run: gdd-structure-check.sh and the one-shot registry grep (subagent had no Bash tool; values compared by reading)
Findings:
- [BLOCKING] Acceptance Criteria: AC16 expects known ids {gv, gv-01…gv-05}, but rules 9 and 12 and AC13 also register r2–r5
- [BLOCKING] Detailed Rules / Edge Cases: no campaign order for regions; level order and membership stored twice with no precedence; B3 lacks the "orders 1…N" rule the edge cases cite; "first duplicate" undefined; gap after a drop has no outcome
- [BLOCKING] Detailed Rules: only rival.seed is marked required; other fields' required status and x/y/node types unstated; region records have no validation
- [RECOMMENDED] Formulas: B6 adds a second runtime adjustment, contradicting rule 8's "the one runtime adjustment"
- [RECOMMENDED] Acceptance Criteria: M3, B5 and B6 have no ACs; the coverage claim overstates
- [RECOMMENDED] Detailed Rules: the M2 = R3 equivalence uses a literal 40 instead of pawns_per_rope_max
- [RECOMMENDED] Edge Cases: the runtime radius raise re-checks I2 only, not B2 or B6
- [RECOMMENDED] Overview: "UAT-1 ships one region" should be "one playable region"
- [RECOMMENDED] Detailed Rules: rule 7's "(World Map's rule to state)" is a hand-wave; say whether an empty region can be complete
- [RECOMMENDED] Acceptance Criteria: AC9 and AC5 also trip B6 warnings
- [RECOMMENDED] Game Feel: the 2–3 min target has no playtest AC; reconcile the 90 s–4 min band with Pillar 2
- [RECOMMENDED] Cross-doc: the prototype's ai_grace 60 s is carried by neither this GDD nor Rival AI
- [RECOMMENDED] Formulas: B3 does not say whether level and region ids share one namespace
Reviewed-Content-Hash: design/gdd/campaign-level-data.md 9ae28ab7df06f5a9268a3971f228afb17f33cace
Reviewed-Content-Hash: design/registry/entities.yaml 41f062f6645bf0d3c1230986fbfcdda9b7ded370
Reviewed-Content-Hash: .claude/skills/design-review/SKILL.md 4dcc8b81162613c757144532f1b72708ab3ba27f
Reviewed-Content-Hash: design/gdd/game-concept.md 5f59d626512352792d034532184266656d283cde
Reviewed-Content-Hash: prototypes/tower-war/config.js 3568e00bd4b74dba537024bce9fab97661938481
Reviewed-Content-Hash: design/gdd/rival-ai.md e013143701f575fa80d064d702740f73018c8c20
Reviewed-Content-Hash: design/gdd/troop-generation.md d6b7a6dcaa86139d694f9ec483d0d3d2e4c04d5e

## Review — 2026-11-22 — Verdict: NEEDS REVISION
Review mode: lean · Workflow: standard
Scope signal: M
Specialists: none (lean mode; independent subagent re-review). A separate lean review by session my-game-tower-war-39 on the same bytes gave APPROVED (0 blocking, 7 recommended); it did not check the touch circle's lift.
Blocking items: 1 | Recommended: 12
Summary: All three prior blockers are resolved (AC16 ids, levels self-describe with order rules, required fields/types and B7). Every Content-table value recomputes from config.js and there are no registry conflicts. New blocker: B2 and B6 measure the "touch circle" around (x, y), but Touch & Mouse Input F1 centres it keep_hit_lift (35) higher, so B6's Green Vale pass is false on gv-03/04/05 and B2 is false at y 78.
Prior verdict resolved: Yes (all three)
Ran: gdd-structure-check.sh (6/6 required present). review-receipts.sh check: target and registry CHANGED, so a full review ran. Content table recomputed from config.js MAPS with a script.
Not run: Phase 3b specialists (lean). NOT ASSESSED: B5's minimum node distance (cites a UX spec; design/ux/ is empty).
Findings:
- [BLOCKING] Formulas (B2, B6): bounds ignore keep_hit_lift; measured at (x, y − 35), B6 fails by 3/13/23 px on gv-03/04/05 and B2 is false at y 78
- [RECOMMENDED] States / Edge Cases: B3 and B7 run per request in the Validating state but once at app start in the edge cases; the development error list omits M2 and M3
- [RECOMMENDED] Edge Cases: shipped outcomes undefined for two regions with the same order, a level id equal to a region id, levels of a region dropped by an order gap, and gv failing B7 (empty campaign)
- [RECOMMENDED] Detailed Rules: rule 8's "one runtime adjustment" ignores B6's band shrink
- [RECOMMENDED] Acceptance Criteria: M3, B5 and B6 have no ACs
- [RECOMMENDED] Detailed Rules: M2's equivalence uses a literal 40
- [RECOMMENDED] Overview: "ships one region" vs one playable region
- [RECOMMENDED] Detailed Rules: rule 7's hand-wave; cite World Map rule 4 / F2
- [RECOMMENDED] Acceptance Criteria: AC9 and AC5 trip B6 warnings without saying so
- [RECOMMENDED] Game Feel: no playtest AC for the 2–3 minute target
- [RECOMMENDED] Edge Cases: a level Rejected mid-region becomes a permanent dead end
- [RECOMMENDED] Formulas: no cap on keeps per level
- [RECOMMENDED] Cross-doc: the prototype's ai_grace 60 s is carried by no GDD
Reviewed-Content-Hash: design/gdd/campaign-level-data.md 222f45a25408ce350f951e1d96756882331277b6
Reviewed-Content-Hash: design/registry/entities.yaml 66d85eeae3216b38ef327139f1e3a34bd6b95d2e
Reviewed-Content-Hash: .claude/skills/design-review/SKILL.md 4dcc8b81162613c757144532f1b72708ab3ba27f
Reviewed-Content-Hash: design/gdd/game-concept.md 5f59d626512352792d034532184266656d283cde
Reviewed-Content-Hash: prototypes/tower-war/config.js 3568e00bd4b74dba537024bce9fab97661938481
Reviewed-Content-Hash: design/gdd/world-map-regions.md 47c67389c2c54bacb6ae78afa4b082ac1b845c38
Reviewed-Content-Hash: design/gdd/save-progress.md 4fae9c32ae275a32e5f32897582a798247ffe4ac
Reviewed-Content-Hash: design/gdd/touch-mouse-input.md a2c3be40cf617e0be62c6fd2470cd7f08539f06e
Reviewed-Content-Hash: design/gdd/rope-links.md 2809263e1cbc6e0c7e0df2b65a63821831714ab3
Reviewed-Content-Hash: design/gdd/rival-ai.md af05107644367237afaf937104b63bc600160cb1
Reviewed-Content-Hash: design/gdd/keep-levels.md 10dd42f92d3902779121446a7d6c3be7f86446f4
Reviewed-Content-Hash: design/gdd/level-hud.md 7cfd316d24c5f36fa273a5aa2d0e3535b4019c93
Reviewed-Content-Hash: design/gdd/level-state-match-flow.md adac1973d70d40a0cd666255a063366e7da640fb
Reviewed-Content-Hash: design/gdd/troop-marching-clashes.md 04e30da7c4624d59c6218de5ae1fe1c6f698aac6
Reviewed-Content-Hash: design/gdd/screen-flow-scene-manager.md f6461833858f23a9738cc3b41bd941f2290f8a06

## Review — 2026-11-22 — Verdict: APPROVED
Review mode: lean · Workflow: standard
Scope signal: S
Specialists: none. Scope: re-check of the four fix edits since the entry above (B2, B6, the F2 keep_hit_radius row, AC9), not a full review; the rest of the file is byte-identical to the version reviewed above.
Blocking items: 0 | Recommended: 0 (the 12 above stand)
Summary: B2 and B6 now measure the real touch circle, lift included (user decision 2026-11-22, option b): B2 y 113–1,237, B6 213 / 1,177; B6 warns on gv-03/04/05 and the shipped top band shrinks to 97/87/77 px. No stale bound numbers remain in the file; longest_rope's 1,258 px ceiling and AC5 still hold. Level HUD H1, its band-shrink edge case and AC9 were updated to match by their owner (session my-game-tower-war-39, its user's approval), who checked the y values against config.js; that user kept the band shrink (77–97 px top bands on gv-03/04/05), and moving the keeps (option c) was not taken.
Prior verdict resolved: Yes
Findings:
- none
Reviewed-Content-Hash: design/gdd/campaign-level-data.md f7fc5e0aae3d61502bb9d763cc4b5d99085d28c8

## Review — 2026-11-22 — Verdict: APPROVED
Review mode: lean · Workflow: standard
Scope signal: S
Specialists: none. Scope: re-check of the bottom-edge fix since the entry above, not a full review. Prompted by an independent verification of the re-review by session my-game-tower-war-bb (two read-only checkers), which found that adding keep_hit_lift to both B2/B6 bounds loosened the bottom bound (y 1,237 / 1,177) so a keep's plaque and slot dots could leave the table or sit under the bottom strip.
Blocking items: 0 | Recommended: 0 (the 12 recommendations in the NEEDS REVISION entry above stand)
Summary: User decision 2026-11-22, "both circles": the top bound uses the lifted touch circle, the bottom bound the base circle (plaque at +36 px, slot dots at about +62 px, Level HUD rules 3–4). B2 is now 113 ≤ y ≤ 1,202 and B6 213 / 1,142, with a shipped shrink for either band. longest_rope's ceiling becomes 1,226 px (F1, dist row, worked extremes, AC5, AC6: 0.286 / 0.314 / 0.629 / 0.572 s); 1,258 px is kept as a safe upper bound in Rope Links, Level State and the registry, as F1 now states. Added AC9 y 1,203, AC9b (B6), rule 8 "two runtime adjustments", and the registry constant keep_hit_lift. Level HUD H1 (bottom bound 1,142, l.129/158/216, AC9) is sent to its owner, session my-game-tower-war-39. The Status header now reads Approved.
Prior verdict resolved: Yes
Findings:
- none
Reviewed-Content-Hash: design/gdd/campaign-level-data.md fcfd5fe6c825941bed921e5841d726da93dcfd01
Reviewed-Content-Hash: design/registry/entities.yaml f349f8571decf84eced82f5cbf4e70e179e0a719
Reviewed-Content-Hash: design/gdd/level-hud.md 446e95c4c1b7f7cfc29ac8195f13a1841593d0d6

## Review — 2026-11-25 — Verdict: APPROVED
Review mode: lean · Workflow: standard
Scope signal: M
Specialists: none (lean mode; independent subagent re-review of the 2026-11-22 polish pass, run on Fable)
Blocking items: 0 | Recommended: 7
Summary: The polish pass is consistent inside the doc and with Screen Flow (rule 11, AC29), Save, Touch, Rope Links, Troop Marching, Level HUD, the registry and config.js (every Content value recomputed).
Prior verdict resolved: Yes
Ran: gdd-structure-check.sh (6/6 required present); review-receipts.sh check with the skill's Phase 1 arguments (target, registry and SKILL.md CHANGED, so a full review). Not run: Phase 3b specialists (lean).
Not stamped: systems-index.md and session my-game-tower-war-39's GDDs (troop-generation, rival-ai, save-progress, level-hud, world-map-regions, menus-screens), which changed during or after the review window and whose reviewed bytes cannot be rebuilt.
Findings:
- [RECOMMENDED] Detailed Rules (rule 7 / F4): no defined first level once levels can be dropped; World Map's first_of_campaign / first(R) must mean the lowest-order loaded level (the pending World Map edit must cover it)
- [RECOMMENDED] Cross-doc: touch-mouse-input.md l.257 and level-state-match-flow.md l.145/167 still send I2/L1 breaches to Screen Flow's load-failure box
- [RECOMMENDED] Formulas (B3): mixes per-level (keep ids) and campaign-wide (orders) checks; 'a gap is a development error only' should say 'an order gap'
- [RECOMMENDED] Acceptance Criteria: AC10 lacks shipped outcomes for level id = region id and duplicate level order; AC5/AC6 name R3 only; the coverage line misstates M3
- [RECOMMENDED] Detailed Rules (rule 9): whether dropped ids are registered with Save
- [RECOMMENDED] Dependencies: no Troop Marching Interactions row; keeps_max referenced_by this GDD only
- [RECOMMENDED] Formulas (F2): keep_hit_radius range 48-120 vs its owner's 48-90
Reviewed-Content-Hash: design/gdd/campaign-level-data.md 90268b88ad2ebcc2877deb4aa76f784c8f895ee3
Reviewed-Content-Hash: design/registry/entities.yaml 6995a374ebc48017e906c831e9fbfbf773eb9534
Reviewed-Content-Hash: .claude/skills/design-review/SKILL.md c1afa55116b1c2f752e01f9d6deb637beae8e7a9
Reviewed-Content-Hash: design/gdd/game-concept.md 5f59d626512352792d034532184266656d283cde
Reviewed-Content-Hash: prototypes/tower-war/config.js 3568e00bd4b74dba537024bce9fab97661938481
Reviewed-Content-Hash: design/gdd/screen-flow-scene-manager.md 9a6c80861bda73e068a5ec3105d8683900d5bba1
Reviewed-Content-Hash: design/gdd/touch-mouse-input.md 64272df98ceadbfac50f5a3f4b3ecd7e0ca91c10
Reviewed-Content-Hash: design/gdd/rope-links.md ac2e00c8c6b268c42d53274342a1a4d5ada7eb4e
Reviewed-Content-Hash: design/gdd/troop-marching-clashes.md 8e0a1867f5c6f0121e28ced14984bc6bde17ff92

## Review — 2026-11-25 — Verdict: APPROVED
Review mode: lean · Workflow: standard
Scope signal: S
Specialists: none. Scope: re-check of the Status header (In Review -> Approved) since the entry above, not a full review; every other byte is as reviewed there.
Blocking items: 0 | Recommended: 0 (the recommendations above stand)
Summary: The Status header now reads Approved (polish pass re-reviewed 2026-11-25).
Prior verdict resolved: Yes
Findings:
- none
Reviewed-Content-Hash: design/gdd/campaign-level-data.md ec5408f1966c365ddc0248bbe7d7eb494068469f
