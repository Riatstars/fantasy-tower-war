# Review Log: Level State & Match Flow

## Review — 2026-11-22 — Verdict: NEEDS REVISION
Review mode: lean · Workflow: standard
Scope signal: M
Specialists: none (lean mode; independent reviewer subagent per GDD, batch review of all 13 UAT-1 GDDs)
Blocking items: 5 | Recommended: 7 (logged; full report lists more)
Summary: A thorough GDD with formulas that hold at the boundaries and mostly testable ACs. Blockers: the result record lacks Screen Flow's 'keeps captured' field, F4 contradicts AC16 at end_delay 0, float rounding breaks determinism, clock_started is unspecified for non-waiting levels, and the Ending delay counter is under-defined.
Prior verdict resolved: First review
Findings:
- [BLOCKING] Core Rules / Interactions: result record has 4 fields; Screen Flow requires keeps captured
- [BLOCKING] Formulas F4 vs AC16: request step D vs D+1 at end_delay 0
- [BLOCKING] Rule 11 / AC22: float hazards (ceil(0.1*60)=7; half-rounding) break determinism
- [BLOCKING] Core Rule 2 / AC5: clock_started not specified for non-waiting levels (Rival AI waits on it)
- [BLOCKING] States: Ending delay counter mechanism and pause_allowed in Closed undefined
- [RECOMMENDED] Dependencies: stale 'Not yet designed' statuses and bidirectional paragraph; registry match_time range, wait_for_first_rope, F4
- [RECOMMENDED] Interactions: no single canonical event list (vs Level HUD)
- [RECOMMENDED] States: Closed 'Restart (from Pause)' unreachable
- [RECOMMENDED] Core Rules: load failure on Retry/Next 'previous screen' ambiguous
- [RECOMMENDED] Formulas F1/F2: win/loss pawn asymmetry needs rationale
- [RECOMMENDED] Acceptance Criteria: AC27 not measurable; AC10/AC25 wording; edge cases lack ACs
- [RECOMMENDED] Visual (cross-doc): Win overlay one star vs Menus empty star row
Reviewed-Content-Hash: design/gdd/level-state-match-flow.md 0afcc7e7fd677decb4695e9ce54e31cc2b507482
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
Reviewed-Content-Hash: design/gdd/rival-ai.md e0e287ad97d596b9b8d052cda2223f92ac34b7b2
Reviewed-Content-Hash: design/gdd/campaign-level-data.md 7567d1fa919a440208355e083ec8ce685b34a552
Reviewed-Content-Hash: design/gdd/world-map-regions.md e1b4c51ac0ba108f25b3fcb5d35e6bddbae0aada
Reviewed-Content-Hash: design/gdd/level-hud.md c0946163f4a8610ac9cedcba8d8ad342997ba759
Reviewed-Content-Hash: design/gdd/menus-screens.md 2ff1faab335ff570b4796954f02788d5649c17f0

## Review — 2026-11-22 — Verdict: NEEDS REVISION
Review mode: lean · Workflow: standard
Scope signal: M
Specialists: none (lean mode; independent reviewer subagent per GDD, batch re-review of all 13 UAT-1 GDDs after the cross-doc cluster fixes)
Blocking items: 3 | Recommended: 10 (logged; full report lists more)
Summary: The result record now matches Screen Flow and Menus, and the Ending counter is defined. Three prior blockers stand: clock_started is never raised on levels that do not wait (Rival AI would never start), F4 vs AC16 at end_delay 0, and float rounding.
Prior verdict resolved: Partly
Findings:
- [BLOCKING] Core Rule 2 / AC5, AC25: clock_started not raised on non-waiting levels; Rival AI never leaves Waiting (prior)
- [BLOCKING] F4 vs AC16: D+0 vs D+1 at end_delay 0; output range (prior)
- [BLOCKING] F3 / F4 / Rule 11 / AC22: rounding mode and float hazards (prior)
- [RECOMMENDED] Rule 1: Rival AI reseed at build not listed
- [RECOMMENDED] A held message after a non-waiting Retry: match must not run under it
- [RECOMMENDED] Dependencies and AC intro stale
- [RECOMMENDED] No canonical event list (match_ending); HUD Closed state
- [RECOMMENDED] Closed -> Restart unreachable; load-failure destination
- [RECOMMENDED] Registry entries claimed but missing (end_delay_steps, wait_for_first_rope)
- [RECOMMENDED] AC2/AC10/AC23/AC24/AC27/AC17 rewrites
Revisions applied 2026-11-22 (user-approved, cross-document round 2): clock_started at step 0 on every level (rule 2, AC5; blocker resolved); Armed stops match steps only, Input and the hit-test provider keep running; pawns_in_flight excludes Fallen pawns (F2); Rival AI reseed in rule 1; unlock at the result overlay. F4 vs AC16 and rounding still open. Status stays Needs Revision pending the per-document blockers.
Reviewed-Content-Hash: design/gdd/level-state-match-flow.md 8da5b7c5570dba901a2a6e35f3df86e916ff7356
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
Reviewed-Content-Hash: design/gdd/rival-ai.md 8f0066ad441e1b50a073383b5333d6785646140e
Reviewed-Content-Hash: design/gdd/campaign-level-data.md 696e3c5a30618c724a9e8ae08d1de9296edd3f96
Reviewed-Content-Hash: design/gdd/world-map-regions.md e1b4c51ac0ba108f25b3fcb5d35e6bddbae0aada
Reviewed-Content-Hash: design/gdd/level-hud.md c0946163f4a8610ac9cedcba8d8ad342997ba759
Reviewed-Content-Hash: design/gdd/menus-screens.md c20ff536a7a8e07072c2e2602fecb9c1318a740e

## Review — 2026-11-22 — Verdict: NEEDS REVISION
Review mode: lean · Workflow: standard
Scope signal: M
Specialists: none (lean mode; independent subagent review)
Blocking items: 3 | Recommended: 9
Summary: The result record is consistent and clock_started is fixed. Still blocking: match-time rounding has no half rule and uses floats; F4 gives step D at end_delay 0 while the prose and AC16 say D+1; and Armed tie acceptance is a frame event in rule 2 but a step in F3 and AC3/AC24/AC25.
Prior verdict resolved: No (1 of 3 fixed: clock_started; rounding and F4 still open)
Not run: gdd-structure-check.sh (subagent had no Bash tool); bidirectional dependency claims not re-checked in the sibling GDDs
Findings:
- [BLOCKING] Formulas: F3 rounding has no half rule and uses floats (1 step count in 6 lands on x.x5); use integer tenths
- [BLOCKING] Formulas: F4 gives step D at end_delay 0; only prose says D+1; Output Range and Boundary check describe the unpatched formula
- [BLOCKING] Detailed Rules: rule 2 makes Armed tie acceptance a frame event, but F3, AC3, AC24, AC25 treat it as a step; AC25 fails in the Pause edge case
- [RECOMMENDED] Detailed Rules: synchronous flush() on the deciding step risks a hitch on the minimum phone
- [RECOMMENDED] UI Requirements: stale clock and state list contradict the Interactions row (no clock in play, Closed state)
- [RECOMMENDED] Interactions: no canonical event list; match_ending has no step
- [RECOMMENDED] Registry: end_delay_steps and wait_for_first_rope said to be registered but are not
- [RECOMMENDED] Formulas: F3 minimum "0.0 s" vs clock_steps ≥ 1; Pause edge case wording
- [RECOMMENDED] States: "Armed, Running, Closed → Restart (from Pause)" row; Pause is not reachable in Closed
- [RECOMMENDED] Acceptance Criteria: AC27's 1.6 s screenshot may catch the overlay mid-entrance
- [RECOMMENDED] Tuning Knobs: add a table (advisory at standard)
- [RECOMMENDED] Formulas: F2 bound uses centre-to-centre L_max; say it is conservative, reconcile with longest_rope
Reviewed-Content-Hash: design/gdd/level-state-match-flow.md 278b4a5562e3058864875073434324c5881885aa
Reviewed-Content-Hash: design/registry/entities.yaml 41f062f6645bf0d3c1230986fbfcdda9b7ded370
Reviewed-Content-Hash: .claude/skills/design-review/SKILL.md 4dcc8b81162613c757144532f1b72708ab3ba27f
Reviewed-Content-Hash: design/gdd/game-concept.md 5f59d626512352792d034532184266656d283cde
Reviewed-Content-Hash: design/gdd/troop-marching-clashes.md a07a7f4075c2cd1f812e6e1c181dda20600171a3

## Review — 2026-11-22 — Verdict: APPROVED
Review mode: lean · Workflow: standard
Scope signal: M
Specialists: none (lean mode; independent subagent re-review). A separate lean review by session my-game-tower-war-39 on the same bytes also gave APPROVED (0 blocking, 6 recommended).
Blocking items: 0 | Recommended: 10
Summary: All three prior blockers are resolved: F3 rounds halves up in integer tenths (AC12–AC14, AC22b and the registry agree); F4 requests the overlay at D + max(1, end_delay_steps); Armed ties are frame events with step 0 next, consistent with Rope Links and Troop Marching. The top recommendation is a sibling defect: Menus & Screens' tenths digit is undefined and a float reading mis-shows 7,640 of 20,000 times.
Prior verdict resolved: Yes
Ran: gdd-structure-check.sh (6/6 required present). review-receipts.sh check: target, registry and 12 siblings CHANGED, so a full review ran.
Not run: Phase 3b specialists (lean). Count-grep only: the Level State rows in keep-levels.md, campaign-level-data.md, touch-mouse-input.md and menus-screens.md.
Findings:
- [RECOMMENDED] Cross-doc (Menus & Screens F3): the tenths digit is undefined; floor((t mod 60)×10) gives 60.3 s as "1:00.2" (verified); carry time_tenths or define round(t×10) mod 10
- [RECOMMENDED] Formulas / AC12: the F3 example, AC12 and Troop Generation rule 5 still say the first rope "is accepted on step 0"
- [RECOMMENDED] Edge Cases: Pause while Armed says "resuming returns to Armed" though the States table is already Running; name the window
- [RECOMMENDED] Registry: wait_for_first_rope and end_delay_steps claimed registered but are not; match_time and max_ropes referenced_by incomplete
- [RECOMMENDED] Interactions: no canonical event list; match_ending has no step (Rival AI l.201 also contradicts)
- [RECOMMENDED] States: Restart from Closed is unreachable (no Pause in Closed)
- [RECOMMENDED] Detailed Rules: synchronous flush() on the deciding step risks a hitch
- [RECOMMENDED] Acceptance Criteria: AC27's 1.6 s screenshot catches the overlay mid-fade
- [RECOMMENDED] Tuning Knobs: add a table (advisory)
- [RECOMMENDED] Formulas: F2 should say its distance bound is conservative
Reviewed-Content-Hash: design/gdd/level-state-match-flow.md adac1973d70d40a0cd666255a063366e7da640fb
Reviewed-Content-Hash: design/registry/entities.yaml 66d85eeae3216b38ef327139f1e3a34bd6b95d2e
Reviewed-Content-Hash: .claude/skills/design-review/SKILL.md 4dcc8b81162613c757144532f1b72708ab3ba27f
Reviewed-Content-Hash: design/gdd/game-concept.md 5f59d626512352792d034532184266656d283cde
Reviewed-Content-Hash: design/gdd/menus-screens.md 05010ff2c1d492878daf78bee5d902fdaf396835
Reviewed-Content-Hash: design/gdd/save-progress.md 4fae9c32ae275a32e5f32897582a798247ffe4ac
Reviewed-Content-Hash: design/gdd/rope-links.md 2809263e1cbc6e0c7e0df2b65a63821831714ab3
Reviewed-Content-Hash: design/gdd/troop-marching-clashes.md 04e30da7c4624d59c6218de5ae1fe1c6f698aac6
Reviewed-Content-Hash: design/gdd/level-hud.md 7cfd316d24c5f36fa273a5aa2d0e3535b4019c93
Reviewed-Content-Hash: design/gdd/troop-generation.md d6b7a6dcaa86139d694f9ec483d0d3d2e4c04d5e
Reviewed-Content-Hash: design/gdd/screen-flow-scene-manager.md f6461833858f23a9738cc3b41bd941f2290f8a06
Reviewed-Content-Hash: design/gdd/rival-ai.md af05107644367237afaf937104b63bc600160cb1
Reviewed-Content-Hash: design/gdd/keep-levels.md 10dd42f92d3902779121446a7d6c3be7f86446f4
Reviewed-Content-Hash: design/gdd/campaign-level-data.md 222f45a25408ce350f951e1d96756882331277b6
Reviewed-Content-Hash: design/gdd/touch-mouse-input.md a2c3be40cf617e0be62c6fd2470cd7f08539f06e

## Review — 2026-11-22 — Verdict: APPROVED
Review mode: lean · Workflow: standard
Scope signal: S
Specialists: none. Scope: header-only re-check, not a full review. The one edit since the entry above is line 3, the Status header ("In Review (revised 2026-11-22, pending re-review)" -> "Approved (2026-11-22, lean /design-review; see its review log)"), made to match the systems index.
Blocking items: 0 | Recommended: 0 (the recommendations above stand)
Summary: Verified mechanically: restoring the old header line gives exactly the content hash stamped in the entry above (adac1973), so no other byte changed. The verdict above carries over unchanged.
Prior verdict resolved: Yes
Findings:
- none
Reviewed-Content-Hash: design/gdd/level-state-match-flow.md da30099e47fc033299869e60eb71640610839c15

## Review — 2026-11-25 — Verdict: APPROVED
Review mode: lean · Workflow: standard
Scope signal: M
Specialists: none (lean mode; independent subagent re-review of the 2026-11-22 polish pass, run on Fable)
Blocking items: 0 | Recommended: 10
Summary: Every polish change agrees with Rival AI, Rope Links, Touch & Mouse Input, Screen Flow, Menus & Screens and the registry; all formula and AC arithmetic re-works.
Prior verdict resolved: Yes
Ran: gdd-structure-check.sh (6/6 required present); review-receipts.sh check with the skill's Phase 1 arguments (target, registry and SKILL.md CHANGED, so a full review). Not run: Phase 3b specialists (lean).
Not stamped: systems-index.md and session my-game-tower-war-39's GDDs (troop-generation, rival-ai, save-progress, level-hud, world-map-regions, menus-screens), which changed during or after the review window and whose reviewed bytes cannot be rebuilt.
Findings:
- [RECOMMENDED] Detailed Rules: the order of match_ending / match_won vs the synchronous record and flush on the deciding step is unstated
- [RECOMMENDED] Acceptance Criteria: no criterion for Retry or Next level (AC19 covers Restart)
- [RECOMMENDED] Interactions: the event table says 'no others' but the Level HUD row has state and pause_allowed raised
- [RECOMMENDED] Acceptance Criteria (AC10): the 1,258 px fixture cannot be a legal level (true maximum 1,226)
- [RECOMMENDED] Cross-doc: troop-generation.md AC26 still says 'accepted on clock step 0'
- [RECOMMENDED] Cross-doc: screen-flow l.130 'resuming returns to Armed' lacks the qualifier
- [RECOMMENDED] Detailed Rules (rule 6): Save's 50 ms is a 'target to confirm' in its AC22
- [RECOMMENDED] Dependencies: status column stale; Feedback & Juice and Audio missing
- [RECOMMENDED] States: Closed -> World Map has no trigger telling Level State to discard
- [RECOMMENDED] Detailed Rules (rule 4): Ending ties 'refused' vs Rope Links 'ignored'
Reviewed-Content-Hash: design/gdd/level-state-match-flow.md 398454ab6391644c93c526fc3b3ef7242f23b0ab
Reviewed-Content-Hash: design/registry/entities.yaml 6995a374ebc48017e906c831e9fbfbf773eb9534
Reviewed-Content-Hash: .claude/skills/design-review/SKILL.md c1afa55116b1c2f752e01f9d6deb637beae8e7a9
Reviewed-Content-Hash: design/gdd/game-concept.md 5f59d626512352792d034532184266656d283cde
Reviewed-Content-Hash: design/gdd/screen-flow-scene-manager.md 9a6c80861bda73e068a5ec3105d8683900d5bba1
Reviewed-Content-Hash: design/gdd/rope-links.md ac2e00c8c6b268c42d53274342a1a4d5ada7eb4e
Reviewed-Content-Hash: design/gdd/troop-marching-clashes.md 8e0a1867f5c6f0121e28ced14984bc6bde17ff92
Reviewed-Content-Hash: design/gdd/campaign-level-data.md 90268b88ad2ebcc2877deb4aa76f784c8f895ee3
Reviewed-Content-Hash: design/gdd/touch-mouse-input.md 64272df98ceadbfac50f5a3f4b3ecd7e0ca91c10
Reviewed-Content-Hash: design/gdd/keep-levels.md 4f09eb966d57b3b1b38e27b6a74c880e6965c817

## Review — 2026-11-25 — Verdict: APPROVED
Review mode: lean · Workflow: standard
Scope signal: S
Specialists: none. Scope: re-check of one fixture edit and the Status header since the entry above, not a full review; every other byte is as reviewed there.
Blocking items: 0 | Recommended: 0 (the recommendations above stand, less the AC10 one fixed here)
Summary: AC10's fixture moves from 1,258 to 1,226 px (lost no later than step 670), following the Rope Links / Troop Marching 1,258 relabel (user decision 2026-11-25); this was one of the recommendations above. The Status header now reads Approved (polish pass re-reviewed 2026-11-25).
Prior verdict resolved: Yes
Findings:
- none
Reviewed-Content-Hash: design/gdd/level-state-match-flow.md 9c2c805ed11f371f574f3f5a31113d76455417b6
