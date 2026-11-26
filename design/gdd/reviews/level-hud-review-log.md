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

## Review — 2026-11-22 — Verdict: APPROVED
Review mode: lean · Workflow: standard
Scope signal: L
Specialists: none (lean mode; session my-game-tower-war-39, third pass)
Blocking items: 0 | Recommended: 7
Summary: All four prior blockers are resolved (slots refusal moved to a Running level, F1 rounding rule, F3 digit width follows the font, cursor hint with a source event and AC22). Registered values and derived step counts match and the HUD agrees with Screen Flow, Level State, Rope Links and Touch & Mouse Input. Remaining items are an art-bible mismatch and cross-document wording.
Prior verdict resolved: Yes
Findings:
- [RECOMMENDED] F3 / registry plaque_min_height_px: the HUD uses a 30 px plaque, art bible §3 says 28 px; reconcile
- [RECOMMENDED] Art bible §7 (UI/HUD Visual Direction) is still "[To be designed]"; plaque_font_px and digit_aspect depend on the chosen font
- [RECOMMENDED] Troop Generation Visual/Audio describes a steady "full" mark; HUD rule 5 and the art bible give a periodic glint, never steady
- [RECOMMENDED] Level State UI Requirements (line 194) still calls the clock "optional to show"; sent to 7a
- [RECOMMENDED] Pixel sizes and offsets named in rules and edge cases have no range table
- [RECOMMENDED] Edge Cases: the beat pop is dropped on a capture step; state the exception once (Troop Generation says beat effects are not suppressed by combat)
- [RECOMMENDED] AC1 allows ±1 px although F1 now fixes the rounding (AC21 is exact)
Reviewed-Content-Hash: design/gdd/level-hud.md 7cfd316d24c5f36fa273a5aa2d0e3535b4019c93
Reviewed-Content-Hash: design/registry/entities.yaml 167b97a34b6523bffa93706905c8f17c8bb70997
Reviewed-Content-Hash: .claude/skills/design-review/SKILL.md 4dcc8b81162613c757144532f1b72708ab3ba27f
Reviewed-Content-Hash: design/gdd/troop-generation.md d6b7a6dcaa86139d694f9ec483d0d3d2e4c04d5e
Reviewed-Content-Hash: design/gdd/keep-levels.md 3ca233dfd0a4a7dae40864251feb45ad8d925fd5
Reviewed-Content-Hash: design/gdd/rope-links.md 7b5d310afb0be438c29a5e751b897a9e25afbf6a
Reviewed-Content-Hash: design/gdd/troop-marching-clashes.md a07a7f4075c2cd1f812e6e1c181dda20600171a3
Reviewed-Content-Hash: design/gdd/touch-mouse-input.md ae3160009d7bceb2d0857fcdaf7236602ed146c8
Reviewed-Content-Hash: design/gdd/level-state-match-flow.md 278b4a5562e3058864875073434324c5881885aa
Reviewed-Content-Hash: design/gdd/campaign-level-data.md 9ae28ab7df06f5a9268a3971f228afb17f33cace
Reviewed-Content-Hash: design/gdd/screen-flow-scene-manager.md 1f1b7a1eb5fa8a8cad69fa819d6f37b1ab382118
Reviewed-Content-Hash: design/gdd/menus-screens.md 05010ff2c1d492878daf78bee5d902fdaf396835
Reviewed-Content-Hash: design/art/art-bible.md 4f1539e1dd7e942c345b39861830a39fe77ba283

## Review — 2026-11-26 — Verdict: NEEDS REVISION
Review mode: lean · Workflow: standard
Scope signal: L
Specialists: none (lean mode)
Blocking items: 2 | Recommended: 5
Summary: Re-review after the 2026-11-25 veteran-mark edit. The UAT-1 design is intact: every registry value, F1/F3 example, H1 band and step count recomputes correctly. The army-layer update was only partly applied: the veteran mark had no criterion, and nothing said the HUD draws pawns by unit kind and keeps by race, which Unit Roster & Stats and Factions rely on. Both fixed the same day (user-approved); re-review pending.
Prior verdict resolved: Yes (2026-11-22 approval; its recommended items: Level State clock wording and Troop Generation glint now resolved in those documents)
Findings:
- [BLOCKING] Acceptance Criteria (rule 7): the veteran mark has no criterion; coverage check claimed every rule covered. Fixed: AC23, AC18 extended
- [BLOCKING] Core Rules (rules 7, 14) / Interactions / Dependencies: no rule picks the pawn figure by kind id and size or the keep sprite by the owner's race; Unit Roster & Stats and Factions rows missing (Factions edit 11). Fixed: rules 7 and 14, two rows each, AC24
- [RECOMMENDED] Header / Dependencies: stale statuses (header Approved 2026-11-22; nine dependencies In Review or pending). Fixed
- [RECOMMENDED] Visual/Audio: veteran mark missing from the event table and the asset-spec line. Fixed
- [RECOMMENDED] Acceptance Criteria (AC1): ±1 px tolerance though F1 fixes rounding (carried over). Fixed
- [RECOMMENDED] F3 / art bible §3: 30 px plaque vs the art bible's 28 px; art bible §7 still "[To be designed]" (carried over)
- [RECOMMENDED] Core Rules (rule 15): pixel sizes and offsets have baselines but no safe-range table (carried over)
Reviewed-Content-Hash: design/gdd/level-hud.md 15a4a13fbf4c272efea720d68e2a5687bf37a71c
Reviewed-Content-Hash: design/registry/entities.yaml 2c845466a100cc35467ae5156055493f9a9b634f
Reviewed-Content-Hash: .claude/skills/design-review/SKILL.md c1afa55116b1c2f752e01f9d6deb637beae8e7a9
Reviewed-Content-Hash: design/gdd/unit-cards-upgrades.md f9ba7e081e9b782b976748b1bb35a1eacf3acdcb
Reviewed-Content-Hash: design/gdd/unit-roster-stats.md 535aac955ca81c77e78e36ae99d5f89a9ba7d3fd
Reviewed-Content-Hash: design/gdd/factions.md d028764ab3da2568fe469b7dcaaed798ac901cf6
Reviewed-Content-Hash: design/gdd/troop-marching-clashes.md 0c3e54851a4da9ed59b5bb51815cde2a7a074b41
Reviewed-Content-Hash: design/gdd/keep-levels.md a2d108347a1e51c7cc69b47bdbcdaa66f653f428
Reviewed-Content-Hash: design/gdd/troop-generation.md 72af1dc0428b02c63f64581a5493a96f5511376d
Reviewed-Content-Hash: design/gdd/level-state-match-flow.md ddff5db2a4a6a372b09ea5763d6ac22d992e43b2
Reviewed-Content-Hash: design/art/art-bible.md 4f1539e1dd7e942c345b39861830a39fe77ba283

## Review — 2026-11-26 — Verdict: APPROVED
Review mode: lean · Workflow: standard
Scope signal: L
Specialists: none (lean mode)
Blocking items: 0 | Recommended: 6
Summary: Re-review, run in full, after the same-day army-layer revision. Both prior blockers are resolved: AC23 and AC18 cover the veteran mark, and rules 7 and 14 with AC24 say how pawns are drawn by kind and keeps by race, with Unit Roster & Stats and Factions rows added. Every F1, F3 and H1 number and every step count recomputes correctly, and no value conflicts with the registry. What remains is small cross-document wording and two carried items.
Prior verdict resolved: Yes (both blockers fixed)
Findings:
- [RECOMMENDED] Interactions (Troop Marching row): troop-marching-clashes.md rule 15 lists pawns() as position, lane, owner, unit and omits the veteran mark this GDD reads from it (its rule 3 does say the pawn carries the mark)
- [RECOMMENDED] Core Rules (rule 7): cites Unit Roster & Stats rule 1 for "three kinds per race"; that is its rule 2
- [RECOMMENDED] Core Rules (rule 7): which kind id pawns() reports for a kind Unit Roster's loader replaced is undefined, so the figure drawn for a repaired kind is unknown (open in Unit Roster & Stats too)
- [RECOMMENDED] Header / Dependencies: Unit Roster & Stats is now Approved; header still In Review, Last Verified 2026-11-22
- [RECOMMENDED] F3 / art bible §3: 30 px plaque vs the art bible's 28 px; art bible §7 still "[To be designed]" (carried over)
- [RECOMMENDED] Core Rules (rule 15): pixel sizes and offsets have baselines but no safe-range table (carried over)
Receipt notes: the review read troop-marching-clashes.md (rules 3, 15) and campaign-level-data.md (B6, AC9b) by search, and the Level HUD rows of unit-roster-stats.md, factions.md and unit-cards-upgrades.md; the other dependencies were checked through the registry and are not stamped.
Reviewed-Content-Hash: design/gdd/level-hud.md 1c6f6cc13ac9267275c72a1023e52378aaee50ca
Reviewed-Content-Hash: design/registry/entities.yaml 2c845466a100cc35467ae5156055493f9a9b634f
Reviewed-Content-Hash: .claude/skills/design-review/SKILL.md c1afa55116b1c2f752e01f9d6deb637beae8e7a9
Reviewed-Content-Hash: design/gdd/unit-cards-upgrades.md f9ba7e081e9b782b976748b1bb35a1eacf3acdcb
Reviewed-Content-Hash: design/gdd/unit-roster-stats.md 535aac955ca81c77e78e36ae99d5f89a9ba7d3fd
Reviewed-Content-Hash: design/gdd/factions.md d028764ab3da2568fe469b7dcaaed798ac901cf6
Reviewed-Content-Hash: design/gdd/troop-marching-clashes.md 0c3e54851a4da9ed59b5bb51815cde2a7a074b41
Reviewed-Content-Hash: design/gdd/campaign-level-data.md 4c2d423eb2fba16a27f05ccedd4972f27f76c570

## Review — 2026-11-26 — Verdict: APPROVED
Review mode: lean · Workflow: standard
Scope signal: L
Specialists: none (lean mode; independent second pass, run in full in another session the same day)
Blocking items: 0 | Recommended: 10
Summary: Both blockers of the earlier 2026-11-26 review are resolved (AC23, AC18, rules 7 and 14, the three army-layer rows, AC24). Every registry value, the F1, F3 and H1 numbers and the step counts in AC8, AC11 and AC13 recompute correctly, and the documents changed since their last stamp (Rope Links' Cutting state, Touch & Mouse Input, Campaign Level Data, Screen Flow) still match. What remains is cross-document wording and four points to settle before the UX spec: the clock that drives HUD effects, what `size` means for drawing, the neutral colour, and the star goals' in-match readout. The header was set to Approved after this review (the stamped hash is the file with that header).
Prior verdict resolved: Yes (both blockers fixed; agrees with the other same-day approval)
Findings:
- [RECOMMENDED] Interactions (Troop Marching row): troop-marching-clashes.md rule 15 lists pawns() without the veteran mark its rule 3 and this GDD rely on
- [RECOMMENDED] Core Rules (rules 5, 7, 13): only the strip timer has a stated clock; AC8 puts the glint in match steps, and if the pop, float text and capture burst are step-driven the winning capture's burst freezes through Ending
- [RECOMMENDED] Core Rules (rule 7): "drawn at the kind's size" does not say runtime scale or authored sprite size; scales of 0.9 to 1.3 conflict with the pixel-art, no-sub-pixel constraint (Unit Roster Open Question 3)
- [RECOMMENDED] Core Rules (rules 3, 10) / Visual/Audio: neutral plaque edge and bar segment are grey; the art bible makes neutral keeps Monster Green and defines no neutral grey for UI
- [RECOMMENDED] Open Questions: Stars & Rewards edit 7 not applied; its Open Question 1 (no in-match readout for the time goal) names Level HUD as an owner
- [RECOMMENDED] F1: no tie-break when the neutral segment is forced to 1 px and both sides are equal (300 / 1 / 300); same gap in the registry expression
- [RECOMMENDED] Cross-References: no rows for Unit Roster & Stats, Unit Cards & Upgrades or Factions
- [RECOMMENDED] Dependencies / other documents: Unit Roster & Stats row still In Review (index: Approved); Unit Roster line 171 says the HUD does not name it; Unit Cards lists the HUD as In Review
- [RECOMMENDED] F3 / art bible §3: 30 px plaque vs the art bible's 28 px; art bible §7 still "[To be designed]" (carried over)
- [RECOMMENDED] Core Rules (rule 15): pixel sizes and offsets have baselines but no safe-range table (carried over)
Reviewed-Content-Hash: design/gdd/level-hud.md 3dab75f45bb02b94181989b121b60885218cd977
Reviewed-Content-Hash: design/registry/entities.yaml 2c845466a100cc35467ae5156055493f9a9b634f
Reviewed-Content-Hash: .claude/skills/design-review/SKILL.md c1afa55116b1c2f752e01f9d6deb637beae8e7a9
Reviewed-Content-Hash: design/gdd/troop-marching-clashes.md 0c3e54851a4da9ed59b5bb51815cde2a7a074b41
Reviewed-Content-Hash: design/gdd/unit-roster-stats.md 535aac955ca81c77e78e36ae99d5f89a9ba7d3fd
Reviewed-Content-Hash: design/gdd/factions.md d028764ab3da2568fe469b7dcaaed798ac901cf6
Reviewed-Content-Hash: design/gdd/unit-cards-upgrades.md f9ba7e081e9b782b976748b1bb35a1eacf3acdcb
Reviewed-Content-Hash: design/gdd/rope-links.md 4d5f475dd6a00d149e9ce7cc4383c8749fe07999
Reviewed-Content-Hash: design/gdd/touch-mouse-input.md d3ae4904d175082fab9829e7ed90014c2ff6b226
Reviewed-Content-Hash: design/gdd/campaign-level-data.md 4c2d423eb2fba16a27f05ccedd4972f27f76c570
Reviewed-Content-Hash: design/gdd/screen-flow-scene-manager.md c0ad48dc9c713b2ebcbd10d9007be5c38a67ed6d
Reviewed-Content-Hash: design/gdd/level-state-match-flow.md ddff5db2a4a6a372b09ea5763d6ac22d992e43b2
Reviewed-Content-Hash: design/gdd/keep-levels.md a2d108347a1e51c7cc69b47bdbcdaa66f653f428
Reviewed-Content-Hash: design/gdd/troop-generation.md 72af1dc0428b02c63f64581a5493a96f5511376d
Reviewed-Content-Hash: design/gdd/stars-rewards.md 06a5508c1b64e7f454d02e5f8330a8837889e930
Reviewed-Content-Hash: design/gdd/menus-screens.md 30785c884d3ce0887874e26e7f2fb98cda61df24
Reviewed-Content-Hash: design/gdd/systems-index.md c1538ea6f13c15eb059833d6e70295ae1886e837
Reviewed-Content-Hash: design/art/art-bible.md 4f1539e1dd7e942c345b39861830a39fe77ba283
