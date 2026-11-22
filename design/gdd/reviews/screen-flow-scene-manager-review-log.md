# Review Log: Screen Flow & Scene Manager

## Review — 2026-11-22 — Verdict: NEEDS REVISION
Review mode: lean · Workflow: standard
Scope signal: M
Specialists: none (lean mode; independent reviewer session, Opus)
Blocking items: 1 | Recommended: 6
Summary: The display model had no place for message or error boxes, yet this GDD's own load-failure box and Save & Progress' one-time messages need one; with a closed transitions table and Rule 2, a corrupt save would stop a development build. Settings from Pause, the Delete-progress confirmation and a quit notice to Level State were also missing from the model.
Prior verdict resolved: First review
Findings:
- [BLOCKING] Core Rule 1 / transitions table: no message or error box overlay; needed before the Title and on any screen
- [RECOMMENDED] Core Rule 1: Settings opened from Pause contradicts the model; entry points disagree in four places
- [RECOMMENDED] Transitions table: Delete progress confirmation not in the model
- [RECOMMENDED] Interactions: Level State never told a match was quit
- [RECOMMENDED] Interactions: Touch listed output-only; back_pressed and P key need triggers
- [RECOMMENDED] Dependencies / Cross-References: stale statements
- [RECOMMENDED] Core Rule 9: tap anywhere vs Start button
Revisions applied 2026-11-22 (user-approved): message box overlay over any screen, launch messages over the Title, load failure returns with a message box (Rules 1, 9, 11, 12; table); Settings is an overlay from Title, World Map or Pause (OQ3 closed); Delete-progress confirmation from Settings only when not opened from Pause, Yes goes to the Title; match_quit sent to Level State, quits record nothing; back_pressed and pause_pressed as inputs; Start button; AC1 seeded walk, AC17 dev stop, AC23 and AC24 added; stale items fixed. Status set to In Review pending re-review.
Reviewed-Content-Hash: design/gdd/screen-flow-scene-manager.md 31f6b9f1371007926448f359f895ad0b85f989d9
Reviewed-Content-Hash: design/registry/entities.yaml 44d26d5a860ebcb7026da6a5ed63411383f134e2
Reviewed-Content-Hash: .claude/skills/design-review/SKILL.md 4dcc8b81162613c757144532f1b72708ab3ba27f
Reviewed-Content-Hash: design/gdd/troop-generation.md 6bf7dec626b85c6e5fe8ecebc6a4b050d3ce9bc3
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
Blocking items: 1 | Recommended: 8 (logged; full report lists more)
Summary: All 7 prior items are addressed, including the message-box model. The new message-box overlay has no defined ordering against Level State's Ending state and the result overlay, and three GDDs disagree on it.
Prior verdict resolved: Yes (prior blocking items resolved)
Findings:
- [BLOCKING] Core Rules 1/5 / table: message box raised during Ending has undefined order vs result overlay; Level State, Screen Flow and Menus disagree
- [RECOMMENDED] Dependencies: 'never calls another system' contradicts commands sent in Interactions
- [RECOMMENDED] Transition table: Delete progress Yes does not name the Save reset call; AC24 stops short
- [RECOMMENDED] Core Rules: pause_allowed guard missing from Rule 6 and table; Back in Ending untested
- [RECOMMENDED] Core Rules: message raised during a transition undefined
- [RECOMMENDED] Core Rules 10/11: failed Next level 'previous screen' ambiguous
- [RECOMMENDED] Acceptance Criteria: AC8/AC21 coverage gaps; numbering out of order
- [RECOMMENDED] Acceptance Criteria AC22: unmeasured target, no device/threshold
- [RECOMMENDED] Edge Cases: system-dialog requirement on Mobile Platform not tracked; OQ4 closed in text but open in table
Reviewed-Content-Hash: design/gdd/screen-flow-scene-manager.md 9975a503dc7d44abe22ef17ff94d0493e64a9c3b
Reviewed-Content-Hash: design/registry/entities.yaml b7664dbf04df5012d7e1f5b7b57847ac142c8b18
Reviewed-Content-Hash: .claude/skills/design-review/SKILL.md 4dcc8b81162613c757144532f1b72708ab3ba27f
Reviewed-Content-Hash: design/gdd/game-concept.md b9ec7dd07d6d43c3e9abb1208bac711ad23ae758
Reviewed-Content-Hash: design/gdd/systems-index.md 54c5d0974e9b80218fa4082ceb37e11bdc86e243
Reviewed-Content-Hash: design/game-brief.md 7d90b94906b28807d72b86ade5f754d9a7c62b75
Reviewed-Content-Hash: design/gdd/troop-generation.md d2ba2132b296666c69bd0b6d907fd2cefcb86807
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
Scope signal: M
Specialists: none (lean mode; independent reviewer subagent per GDD, batch re-review of all 13 UAT-1 GDDs after the cross-doc cluster fixes)
Blocking items: 1 | Recommended: 9 (logged; full report lists more)
Summary: The prior blocker (message box vs Ending and the result overlay) is resolved and agrees across four GDDs. New: the input lock taken in Ending has no unlock point here, and Touch/Level State unlock only at the next match build, so Back and Esc are dead on the result overlay.
Prior verdict resolved: Yes (prior blocking item resolved)
Findings:
- [BLOCKING] Interactions / Rules 4, 6 / AC8: unlock() after the Ending lock undefined; Touch and Level State say next match build, killing Back/Esc on Win/Lose
- [RECOMMENDED] Rule 6 / table: pause_allowed guard missing; no AC for Back and background in Ending
- [RECOMMENDED] Edge Cases / AC14: 'result overlay wins' stale (overlay comes after end_delay)
- [RECOMMENDED] Dependencies: 'never calls another system' vs commands sent
- [RECOMMENDED] Delete progress Yes: reset caller unnamed; AC24 stops short
- [RECOMMENDED] Rule 11: dev stop vs shipped load-failure box not distinguished
- [RECOMMENDED] Tier labels Alpha vs systems-index MVP (UAT-2)
- [RECOMMENDED] OQ4 and Consistency-to-fix stale; AC numbering
- [RECOMMENDED] AC22/AC21/AC13/AC23 measurable rewrites
Revisions applied 2026-11-22 (user-approved, cross-document round 2): unlock() when the result overlay opens (blocker resolved); pause_allowed guard on Back, Pause, P and background (Rule 6, 7, table); P in Pause resumes; Next level only within the region (Rule 10); in UAT-1 Screen Flow reads the engine's back and pause notifications (Mobile Platform Integration Soft from Vertical Slice); no Settings on the map during a sequence; stale same-step edge case rewritten; AC25 added. Status stays Needs Revision pending the per-document blockers.
Reviewed-Content-Hash: design/gdd/screen-flow-scene-manager.md c8b26b4e46cf9a8ba069ffc75f27449a55b95cfb
Reviewed-Content-Hash: design/registry/entities.yaml 7c078a61a2fe209d71cee39822db4cfe17d257ff
Reviewed-Content-Hash: .claude/skills/design-review/SKILL.md 4dcc8b81162613c757144532f1b72708ab3ba27f
Reviewed-Content-Hash: design/gdd/game-concept.md b9ec7dd07d6d43c3e9abb1208bac711ad23ae758
Reviewed-Content-Hash: design/gdd/systems-index.md 51f7eff69a32aa0925544e25a07136f03d38cbdc
Reviewed-Content-Hash: design/game-brief.md 7d90b94906b28807d72b86ade5f754d9a7c62b75
Reviewed-Content-Hash: design/gdd/keep-levels.md 433e135e0ec091348cab95776797287a08b45452
Reviewed-Content-Hash: design/gdd/troop-generation.md d2ba2132b296666c69bd0b6d907fd2cefcb86807
Reviewed-Content-Hash: design/gdd/save-progress.md 3b92d24ced6af243a993988b6efce966e26168eb
Reviewed-Content-Hash: design/gdd/touch-mouse-input.md d453343269b2416d6cbd716a7007db31148516c7
Reviewed-Content-Hash: design/gdd/rope-links.md c06a1b8927af3ccfef88c465d044bf401ea36e4a
Reviewed-Content-Hash: design/gdd/troop-marching-clashes.md 04ae0014fd6dd5849c0bfe1429a938a42ff32a0b
Reviewed-Content-Hash: design/gdd/level-state-match-flow.md 8da5b7c5570dba901a2a6e35f3df86e916ff7356
Reviewed-Content-Hash: design/gdd/rival-ai.md 8f0066ad441e1b50a073383b5333d6785646140e
Reviewed-Content-Hash: design/gdd/campaign-level-data.md 696e3c5a30618c724a9e8ae08d1de9296edd3f96
Reviewed-Content-Hash: design/gdd/world-map-regions.md e1b4c51ac0ba108f25b3fcb5d35e6bddbae0aada
Reviewed-Content-Hash: design/gdd/level-hud.md c0946163f4a8610ac9cedcba8d8ad342997ba759
Reviewed-Content-Hash: design/gdd/menus-screens.md c20ff536a7a8e07072c2e2602fecb9c1318a740e
