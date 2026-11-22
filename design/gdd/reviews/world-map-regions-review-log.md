# Review Log: World Map & Regions

## Review — 2026-11-22 — Verdict: NEEDS REVISION
Review mode: lean · Workflow: standard
Scope signal: M
Specialists: none (lean mode; independent reviewer subagent per GDD, batch review of all 13 UAT-1 GDDs)
Blocking items: 6 | Recommended: 10 (logged; full report lists more)
Summary: Structurally complete with clean registry values and a sound derive-never-store design, but the conquest/fog-clear sequencing contradicts F1/F2, multi-region catch-up is inconsistent, Rule 2 relies on a Save change signal that does not exist, and AC10 and AC13 are factually wrong.
Prior verdict resolved: First review
Findings:
- [BLOCKING] States / Core Rules / AC8: Clearing trigger never true under F1/F2 (next region already Open)
- [BLOCKING] Core Rules / AC9: multi-region catch-up clears undefined
- [BLOCKING] Core Rule 2: relies on a Save change signal that does not exist; delete-during-sequence edge case invalid
- [BLOCKING] States / Edge Cases: Settings during a sequence contradictory
- [BLOCKING] Acceptance Criteria AC10: prev(gv-04) is Crossroads, not The Ford
- [BLOCKING] Acceptance Criteria AC13 / Rule 10: node time contradicts Rule 12 banner-only
- [RECOMMENDED] Core Rule 8: locked hint names a nameless node
- [RECOMMENDED] Cross-doc: Save AC21 'centred on map position' conflicts (no scroll)
- [RECOMMENDED] Core Rule 9: set_map_position caller unclear
- [RECOMMENDED] Formulas F2/F3: open(R) redundant; cross-region ordering
- [RECOMMENDED] Formulas F4: out-of-range celebration_time behaviour
- [RECOMMENDED] Dependencies: node input ownership (Touch vs Menus); add to touch-mouse-input.md
- [RECOMMENDED] Core Rules: diamond-on-conquest trigger owner
- [RECOMMENDED] Acceptance Criteria: AC15/AC16 rewrites
- [RECOMMENDED] Open Questions OQ5: node budget at minimum hit size
- [RECOMMENDED] Dependencies: stale Menus & Screens status
Reviewed-Content-Hash: design/gdd/world-map-regions.md e1b4c51ac0ba108f25b3fcb5d35e6bddbae0aada
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
Reviewed-Content-Hash: design/gdd/level-hud.md c0946163f4a8610ac9cedcba8d8ad342997ba759
Reviewed-Content-Hash: design/gdd/menus-screens.md 2ff1faab335ff570b4796954f02788d5649c17f0

## Review — 2026-11-22 — Verdict: NEEDS REVISION
Review mode: lean · Workflow: standard
Scope signal: M
Specialists: none (lean mode; target unchanged since its last review, cross-document facts re-verified by an independent subagent against the 8 edited GDDs and the registry)
Blocking items: 6 | Recommended: 1 (logged; full report lists more)
Summary: Unchanged; agrees with today's star and plays decisions. All six prior blockers stand, and the new message-box rule extends the Settings-during-sequence gap: a held message now shows over the map just as the conquest sequence starts.
Prior verdict resolved: No (document not revised)
Findings:
- [BLOCKING] States / Rules / AC8: Clearing trigger never true under F1/F2 (prior)
- [BLOCKING] Rules / AC9: multi-region catch-up undefined (prior)
- [BLOCKING] Rule 2: relies on a Save change signal that does not exist (prior)
- [BLOCKING] States / Edge Cases: Settings or a held message box during a sequence (prior, extended)
- [BLOCKING] AC10: prev(gv-04) is gv-03, not The Ford (prior)
- [BLOCKING] AC13 / Rule 10: node showing time contradicts banner-only Rule 12 (prior)
- [RECOMMENDED] Dependencies: Menus & Screens row stale
Reviewed-Content-Hash: design/gdd/world-map-regions.md e1b4c51ac0ba108f25b3fcb5d35e6bddbae0aada
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
Reviewed-Content-Hash: design/gdd/level-hud.md c0946163f4a8610ac9cedcba8d8ad342997ba759
Reviewed-Content-Hash: design/gdd/menus-screens.md c20ff536a7a8e07072c2e2602fecb9c1318a740e

## Revision — 2026-11-22 — after its review and the cross-GDD review (session my-game-tower-war-7a)
Status after revision: In Review (pending re-review in a fresh session)
Addressed:
- [BLOCKING] Clearing trigger: `region_after(R)` (next region with levels); clear plays after R's sequence when it exists; that region is drawn fogged until its clear (rule 7, States table, AC8)
- [BLOCKING] Multi-region catch-up: one pending region at a time in campaign order, sequence then clear then Deriving; a tap skips only the sequence playing (rule 7, Edge Cases, AC9)
- [BLOCKING] Save change signal: rule 2 re-derives on open and after the map's own records only; Delete progress goes to the Title (Edge Cases, AC14); AC20
- [BLOCKING] Settings / held message box during a sequence: player decision (2026-11-22) — a sequence starts only when no overlay or box is open; Settings button (Vertical Slice) hidden while Celebrating or Clearing (rule 6, Edge Cases, States table); AC19
- [BLOCKING] AC10: hint reads "Beat Crossroads first" (prev(gv-04) = gv-03)
- [BLOCKING] AC13 / rule 10: map shows no time; best time is on the Win overlay; AC13 checks Save's stored best time
- [CROSS-REVIEW G-B3] linear unlocking makes "last level beaten" and F2 "all beaten" agree; F2 decides on edited files (rule 4)
- [CROSS-REVIEW SB10 part / S1-W6] `first_of_campaign` is calculated, not a data field; `is_unlocked` is a pure query usable without the map screen
Not addressed (recommended): Dependencies Menus & Screens row; regions 2–5 region records (Campaign Level Data, other session)
