# Review Log: Save & Progress

## Review — 2026-11-22 — Verdict: NEEDS REVISION
Review mode: lean · Workflow: standard
Scope signal: M
Specialists: none (lean mode; independent reviewer session, Opus)
Blocking items: 1 | Recommended: 8
Summary: The write model contradicted itself: synchronous per call in Rule 6 and AC2, batched per frame in one edge case and AC15, and asynchronous in another edge case and AC16. Plays could be double-counted on a win, quits could not be counted, and the one-time messages had no place in Screen Flow's model.
Prior verdict resolved: First review
Findings:
- [BLOCKING] Core Rule 6 / Edge Cases / AC2, AC15, AC16: write model is synchronous, batched and asynchronous at once
- [RECOMMENDED] Interactions: plays double-counted on a win
- [RECOMMENDED] OQ3: quits cannot be counted as written
- [RECOMMENDED] UI Requirements: one-time messages have no place in Screen Flow
- [RECOMMENDED] Core Rule 11: Delete progress confirmation and Settings entry points
- [RECOMMENDED] Edge Cases: Delete progress from Pause leaves an odd profile
- [RECOMMENDED] Edge Cases: newer-version save silently loses a session
- [RECOMMENDED] AC1: first-run flag polarity undefined
- [RECOMMENDED] Core Rule 10: unknown region ids not covered
Revisions applied 2026-11-22 (user-approved): merge in memory plus one synchronous flush() at end of frame, Level State flushes before the result overlay (Rule 6, States, edge cases, AC2, AC8, AC15, AC16, AC20); a win counts the play, record_level_played on a loss only, quits record nothing (OQ3 closed, AC25 added); messages raised as events and shown by Screen Flow's message box (Rule 14); Delete progress only from Title or World Map, then to the Title; newer-version message says progress this session will not be saved and every write is refused; first_run_done false when fresh; unknown region ids kept; .corrupt files capped at 3; size warning in data; Screen Flow listed downstream. Status set to In Review pending re-review.
Reviewed-Content-Hash: design/gdd/save-progress.md 4ef1eafb7b0fb29715768faaffc41ecaabccb7af
Reviewed-Content-Hash: design/registry/entities.yaml 44d26d5a860ebcb7026da6a5ed63411383f134e2
Reviewed-Content-Hash: .claude/skills/design-review/SKILL.md 4dcc8b81162613c757144532f1b72708ab3ba27f
Reviewed-Content-Hash: design/gdd/troop-generation.md 6bf7dec626b85c6e5fe8ecebc6a4b050d3ce9bc3
Reviewed-Content-Hash: design/gdd/screen-flow-scene-manager.md 31f6b9f1371007926448f359f895ad0b85f989d9
Reviewed-Content-Hash: design/gdd/touch-mouse-input.md 4203499bad17d93a7efa8a191d3dbfaf55545e74
Reviewed-Content-Hash: design/gdd/keep-levels.md 78df4bad822fd3f9cbdb4eb60d9c5debcdb0d056
Reviewed-Content-Hash: design/gdd/rope-links.md f6816232d25eee1e737641dd0b6294ade7a6c912
Reviewed-Content-Hash: design/gdd/systems-index.md a57dea8a6c59ab9c163c83673a824f8f37f9dcca
Reviewed-Content-Hash: design/gdd/game-concept.md 9638f7a1f3394f38352472bfc9b57753fccbb83f
Reviewed-Content-Hash: design/game-brief.md 302532346c1d5c9a7fd1778bbd12b7fe277630c2

## Review — 2026-11-22 — Verdict: NEEDS REVISION
Review mode: lean · Workflow: standard
Scope signal: M
Specialists: none (lean mode; independent reviewer subagent per GDD, batch review of all 13 UAT-1 GDDs)
Blocking items: 3 | Recommended: 8 (logged; full report lists more)
Summary: The prior write-model contradiction is fixed and all 8 recommended items are addressed. New: plays counts losses, which breaks Menus' 'First clear!' label; a failed flush retries every frame; Delete progress would destroy a newer-version file that every write is supposed to protect.
Prior verdict resolved: Yes (prior blocking items resolved)
Findings:
- [BLOCKING] Core Rule 3 / AC25: plays counts losses, breaking best_time_label 'First clear!'; never-beaten best time/stars undefined (0.0 s is legal)
- [BLOCKING] Core Rule 6 vs Edge Cases/AC8: failed flush retries every frame
- [BLOCKING] Core Rules 9/11: Delete progress destroys newer-version file in a read-only session
- [RECOMMENDED] Core Rules 8/10: load vs Campaign id registration order unspecified
- [RECOMMENDED] Detailed Design: settings file write policy and damage handling missing
- [RECOMMENDED] API: record_region_conquered means 'celebrated'; naming
- [RECOMMENDED] Edge Cases: migration write-back failure uncovered
- [RECOMMENDED] Edge Cases: write-failure message never shown without backgrounding
- [RECOMMENDED] AC25: Restart records nothing not stated
- [RECOMMENDED] AC3: independent best stars/time tested one direction only
- [RECOMMENDED] Core Rules: numbering out of order; record_region_conquered idempotence
Reviewed-Content-Hash: design/gdd/save-progress.md 3b92d24ced6af243a993988b6efce966e26168eb
Reviewed-Content-Hash: design/registry/entities.yaml b7664dbf04df5012d7e1f5b7b57847ac142c8b18
Reviewed-Content-Hash: .claude/skills/design-review/SKILL.md 4dcc8b81162613c757144532f1b72708ab3ba27f
Reviewed-Content-Hash: design/gdd/game-concept.md b9ec7dd07d6d43c3e9abb1208bac711ad23ae758
Reviewed-Content-Hash: design/gdd/systems-index.md 54c5d0974e9b80218fa4082ceb37e11bdc86e243
Reviewed-Content-Hash: design/game-brief.md 7d90b94906b28807d72b86ade5f754d9a7c62b75
Reviewed-Content-Hash: design/gdd/troop-generation.md d2ba2132b296666c69bd0b6d907fd2cefcb86807
Reviewed-Content-Hash: design/gdd/screen-flow-scene-manager.md 9975a503dc7d44abe22ef17ff94d0493e64a9c3b
Reviewed-Content-Hash: design/gdd/touch-mouse-input.md de1ed35ff80383c98c2c10d44ca5e85879e374cd
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
Scope signal: M
Specialists: none (lean mode; target unchanged since its last review, cross-document facts re-verified by an independent subagent against the 8 edited GDDs and the registry)
Blocking items: 5 | Recommended: 2 (logged; full report lists more)
Summary: Plays counting losses is now harmless (Menus F1 no longer reads it), but the other GDDs now assume a failed flush on the deciding step raises the write-failure message, which this GDD never says. Never-beaten best time, per-frame retry and Delete in a read-only session remain; AC21's map centring cannot pass.
Prior verdict resolved: Partly (plays half of blocker 1 resolved by the Clear! decision)
Findings:
- [BLOCKING] Edge Cases / UI: when the write-failure message is raised contradicts Level State rule 6, Screen Flow rule 1/AC23 and Menus (escalated)
- [BLOCKING] Core Rules 3/5 / AC25: best time and stars of a level with only losses undefined; first win must replace the default (prior, reworded)
- [BLOCKING] Core Rule 6 vs Edge Cases/AC8: failed flush retries every frame (prior)
- [BLOCKING] Core Rules 9/11: Delete progress destroys a newer-version file in a read-only session (prior)
- [BLOCKING] AC21: 'map centred on stored position' contradicts World Map rules 1 and 9 (escalated)
- [RECOMMENDED] Interactions: Menus now reads the stored best time; row says only 'draws message boxes'
- [RECOMMENDED] State the purpose of plays (no UAT-1 consumer but World Map AC13)
Reviewed-Content-Hash: design/gdd/save-progress.md 3b92d24ced6af243a993988b6efce966e26168eb
Reviewed-Content-Hash: design/registry/entities.yaml 7c078a61a2fe209d71cee39822db4cfe17d257ff
Reviewed-Content-Hash: .claude/skills/design-review/SKILL.md 4dcc8b81162613c757144532f1b72708ab3ba27f
Reviewed-Content-Hash: design/gdd/game-concept.md b9ec7dd07d6d43c3e9abb1208bac711ad23ae758
Reviewed-Content-Hash: design/gdd/systems-index.md 51f7eff69a32aa0925544e25a07136f03d38cbdc
Reviewed-Content-Hash: design/game-brief.md 7d90b94906b28807d72b86ade5f754d9a7c62b75
Reviewed-Content-Hash: design/gdd/keep-levels.md 433e135e0ec091348cab95776797287a08b45452
Reviewed-Content-Hash: design/gdd/troop-generation.md d2ba2132b296666c69bd0b6d907fd2cefcb86807
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
- [BLOCKING] Write-failure message timing: Rule 14 raises "could not be saved" at once on the first failed flush of a streak; Screen Flow holds it until no overlay is open (agrees with Level State rule 6, Screen Flow rule 1/AC23, Menus); Edge Cases and UI Requirements rewritten; AC27
- [BLOCKING] Never-beaten best time/stars: stars 0 and time none until the first win; a loss never touches them; first win always sets the time (Rules 3, 5); validation clears time/stars on unbeaten levels (Rule 10); read-only getter `best_time(level_id)` for Menus F1 (Rule 6); AC26
- [BLOCKING] Per-frame retry: end-of-frame flush runs only when a change was reported since the last attempt; retries by next change, explicit flush() or app-to-background (Rule 6, Dirty state row, Edge Cases); AC27
- [BLOCKING] Delete in a read-only session: player decision (2026-11-22) — offered with a newer-version confirmation text; on Yes the session stops being read-only (Rule 11, UI Requirements); AC28
- [BLOCKING] AC21: map position is a highlight (World Map rule 9), not a camera centre; Rule 3 wording aligned
- [RECOMMENDED] Interactions/Dependencies: Menus reads `best_time`; army systems labelled UAT-2
Not addressed (recommended): state the purpose of `plays`
- Follow-up (same day): UAT-1 background retry had no event source; player decision — Save & Progress reads the engine's app-background notification itself in UAT-1 (Interactions, Dependencies, Cross-References, AC22); Mobile Platform Integration takes it over from the Vertical Slice

## Revision — 2026-11-22 (cross-GDD review round 2)
Revisions applied 2026-11-22 (user-approved, cross-GDD review round 2): UAT-1 newer-version message carries Delete progress (B11; rule 11, UI, AC5 tier tag, AC28); Stars & Rewards labelled UAT-2 (B12); stale provisional lines updated (B17); rules renumbered in order (B18). Status In Review, pending re-review.

## Revision — 2026-11-22 (cross-GDD review round 3)
Revisions applied 2026-11-22 (user-approved, cross-GDD review round 3): delete_progress() named as the call Screen Flow (UAT-1) or Settings (Vertical Slice) makes on Yes (R3B2; rule 11, direction rule); a refused write in a read-only session returns success and never raises could not be saved (R3-W3; rule 9, AC12); message-box wording (R3B3); same-frame merge example made realistic (R3B7; Edge, AC15); soft id-validation dependency stated in the direction rule (R3B9). Status In Review, pending re-review.

## Revision — 2026-11-22 (cross-GDD review round 4)
Revisions applied 2026-11-22 (user-approved, cross-GDD review round 4): Screen Flow row is both ways, naming its delete_progress() call (R4B1); on Yes the Title stays with the fresh profile (R4S1). Status In Review, pending re-review.

## Review — 2026-11-22 — Verdict: APPROVED
Review mode: lean · Workflow: standard
Scope signal: M
Specialists: none (lean mode; session my-game-tower-war-39, third pass)
Blocking items: 0 | Recommended: 7
Summary: All five prior blockers are resolved and agree with Level State rule 6, Screen Flow rules 1 and 12 with its AC23 and AC26, World Map rule 9 and Menus F1. The record, flush and overlay order, the failure paths and the read-only Delete flow each have a test. Remaining items are a missing state-table row, a merge clarification and bookkeeping; one (Settings file rules) needs a design decision.
Prior verdict resolved: Yes
Findings:
- [RECOMMENDED] States and Transitions: no read-only state; a reported change would sit in Dirty forever in a newer-version session; the newer-version-backup case is also unspecified
- [RECOMMENDED] Rule 5: say stars keep the maximum and time keeps the minimum independently; add a criterion
- [RECOMMENDED] Rule 2 / Edge Cases: the Settings file has no read, damage or version rules of its own (needs a design decision)
- [RECOMMENDED] AC5: mixes a UAT-1 unit-testable part and a Vertical Slice Settings part; split the tags
- [RECOMMENDED] Dependencies: "Depends on (upstream): None" sits above a table listing Campaign Level Data as Soft
- [RECOMMENDED] Dependencies: "Consistency to fix" is stale (Level State and Menus are already in the index)
- [RECOMMENDED] Rule 3: state the purpose of `plays`
Reviewed-Content-Hash: design/gdd/save-progress.md 4fae9c32ae275a32e5f32897582a798247ffe4ac
Reviewed-Content-Hash: design/registry/entities.yaml 167b97a34b6523bffa93706905c8f17c8bb70997
Reviewed-Content-Hash: .claude/skills/design-review/SKILL.md 4dcc8b81162613c757144532f1b72708ab3ba27f
Reviewed-Content-Hash: design/gdd/screen-flow-scene-manager.md 1f1b7a1eb5fa8a8cad69fa819d6f37b1ab382118
Reviewed-Content-Hash: design/gdd/level-state-match-flow.md 278b4a5562e3058864875073434324c5881885aa
Reviewed-Content-Hash: design/gdd/world-map-regions.md 2195ae16b3c46c9b0b8a432d9c329c29c266f297
Reviewed-Content-Hash: design/gdd/menus-screens.md 05010ff2c1d492878daf78bee5d902fdaf396835
Reviewed-Content-Hash: design/gdd/campaign-level-data.md 9ae28ab7df06f5a9268a3971f228afb17f33cace
Reviewed-Content-Hash: design/gdd/game-concept.md 5f59d626512352792d034532184266656d283cde
Reviewed-Content-Hash: docs/engine-reference/godot/breaking-changes.md 9b8d8f98f4813a2374bc8e43598bc9b6e2191a3a
