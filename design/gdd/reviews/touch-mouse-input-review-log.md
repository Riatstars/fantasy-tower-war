# Review Log: Touch & Mouse Input

## Review — 2026-11-22 — Verdict: NEEDS REVISION
Review mode: lean · Workflow: standard
Scope signal: L
Specialists: none (lean mode; independent reviewer session, Opus)
Blocking items: 2 | Recommended: 6
Summary: A strong input spec with two interface-level blockers. The hit-test provider listed only the player's keeps (so no tie to an enemy could resolve) and its owner disagreed with Rope Links; and Core Rule 3 contradicted F2 on a tap near the player's rope inside a rival or neutral keep's area.
Prior verdict resolved: First review
Findings:
- [BLOCKING] Interactions / Core Rule 8: provider lists only the player's keeps; owner "the Level screen" vs Rope Links
- [BLOCKING] Core Rule 3 vs F2: press priority inside a non-player keep's area near the player's rope
- [RECOMMENDED] Core Rule 9: cancellation causes miss "origin captured"
- [RECOMMENDED] States and Transitions: touch press on a rope that then moves has no transition
- [RECOMMENDED] Core Rule 12: keys P and M have no event or consumer
- [RECOMMENDED] Dependencies / Cross-References: stale "no GDD yet" and consistency items
- [RECOMMENDED] Core Rule 12: keyboard target cycling has no order
- [RECOMMENDED] Core Rule 5 vs UI: one-time vs once-per-session hint
Revisions applied 2026-11-22 (user-approved): Rope Links is the hit-test provider with every keep and its owner flag; the player's rope wins over a rival or neutral keep's area (own keeps keep priority) in Rule 3, F2, edge case and AC17; rule 9 cancels when the provider stops flagging the origin as the player's; rope press then move becomes a swipe; P and M emit pause_pressed and mute_toggled; target cycling in ascending id; hint once per session; stale items updated; 0.09 mm/px; AC33 tagged Device; F6 short-range note. Status set to In Review pending re-review.
Reviewed-Content-Hash: design/gdd/touch-mouse-input.md 4203499bad17d93a7efa8a191d3dbfaf55545e74
Reviewed-Content-Hash: design/registry/entities.yaml 44d26d5a860ebcb7026da6a5ed63411383f134e2
Reviewed-Content-Hash: .claude/skills/design-review/SKILL.md 4dcc8b81162613c757144532f1b72708ab3ba27f
Reviewed-Content-Hash: design/gdd/troop-generation.md 6bf7dec626b85c6e5fe8ecebc6a4b050d3ce9bc3
Reviewed-Content-Hash: design/gdd/screen-flow-scene-manager.md 31f6b9f1371007926448f359f895ad0b85f989d9
Reviewed-Content-Hash: design/gdd/save-progress.md 4ef1eafb7b0fb29715768faaffc41ecaabccb7af
Reviewed-Content-Hash: design/gdd/keep-levels.md 78df4bad822fd3f9cbdb4eb60d9c5debcdb0d056
Reviewed-Content-Hash: design/gdd/rope-links.md f6816232d25eee1e737641dd0b6294ade7a6c912
Reviewed-Content-Hash: design/gdd/systems-index.md a57dea8a6c59ab9c163c83673a824f8f37f9dcca
Reviewed-Content-Hash: design/gdd/game-concept.md 9638f7a1f3394f38352472bfc9b57753fccbb83f
Reviewed-Content-Hash: design/game-brief.md 302532346c1d5c9a7fd1778bbd12b7fe277630c2

## Review — 2026-11-22 — Verdict: NEEDS REVISION
Review mode: lean · Workflow: standard
Scope signal: L
Specialists: none (lean mode; independent reviewer subagent per GDD, batch review of all 13 UAT-1 GDDs)
Blocking items: 2 | Recommended: 9 (logged; full report lists more)
Summary: Both prior blockers are resolved (Rope Links is hit-test provider; rope-over-keep priority consistent). New: unmoved right-click on an own keep is undefined and own-rope tap-cut has a 78 px dead zone per end; the I2 shipped-build fallback contradicts Campaign Level Data.
Prior verdict resolved: Yes (prior blocking items resolved)
Findings:
- [BLOCKING] Core Rules 3–5 / F2: right press on own keep undefined; own-rope tap-cut dead zone inside keep areas
- [BLOCKING] Edge Cases / AC28 / I1: load-time radius clamp contradicts Campaign Level Data reject policy; radius floor 48 vs 30
- [RECOMMENDED] Core Rule 12 / AC24: keyboard X cut semantics undefined
- [RECOMMENDED] Core Rule 7: swipe first segment start point unstated
- [RECOMMENDED] States table: swipe transitions lack touch/right-button condition
- [RECOMMENDED] Interactions: preview legality has no owner (HUD vs Rope Links)
- [RECOMMENDED] Acceptance Criteria: P and M keys have no AC
- [RECOMMENDED] Dependencies: direction with Menus & Screens disagrees
- [RECOMMENDED] Acceptance Criteria: AC34 not testable; AC32 sample too small; AC1/AC4 bundled
- [RECOMMENDED] Formulas F6: segment vs line ambiguous
- [RECOMMENDED] Tuning Knobs (advisory): no consolidated table
Reviewed-Content-Hash: design/gdd/touch-mouse-input.md de1ed35ff80383c98c2c10d44ca5e85879e374cd
Reviewed-Content-Hash: design/registry/entities.yaml b7664dbf04df5012d7e1f5b7b57847ac142c8b18
Reviewed-Content-Hash: .claude/skills/design-review/SKILL.md 4dcc8b81162613c757144532f1b72708ab3ba27f
Reviewed-Content-Hash: design/gdd/game-concept.md b9ec7dd07d6d43c3e9abb1208bac711ad23ae758
Reviewed-Content-Hash: design/gdd/systems-index.md 54c5d0974e9b80218fa4082ceb37e11bdc86e243
Reviewed-Content-Hash: design/game-brief.md 7d90b94906b28807d72b86ade5f754d9a7c62b75
Reviewed-Content-Hash: design/gdd/troop-generation.md d2ba2132b296666c69bd0b6d907fd2cefcb86807
Reviewed-Content-Hash: design/gdd/screen-flow-scene-manager.md 9975a503dc7d44abe22ef17ff94d0493e64a9c3b
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
Scope signal: L
Specialists: none (lean mode; independent reviewer subagent per GDD, batch re-review of all 13 UAT-1 GDDs after the cross-doc cluster fixes)
Blocking items: 2 | Recommended: 9 (logged; full report lists more)
Summary: Both prior blockers are resolved (right press on own keep; bad-data policy and radius floor 48 agree with Campaign). Two interface contradictions remain: preview legality owner (HUD expects Input, Rope Links claims it) and whether Input emits UI taps.
Prior verdict resolved: Yes (prior blocking items resolved)
Findings:
- [BLOCKING] Rule 6 / Interactions: preview legality owner contradicts Level HUD line 63 and Rope Links line 70
- [BLOCKING] Overview / States vs Rule 11 / Menus line 59: whether Input emits UI tap events
- [RECOMMENDED] States table: swipe transition lacks touch/right-button condition
- [RECOMMENDED] Rule 7: first swipe segment starts at the press point
- [RECOMMENDED] Rule 12: Tab/arrow order, X cut set and event undefined; no AC for P and M
- [RECOMMENDED] Rule 5: right-mouse cut hint has no owner or event
- [RECOMMENDED] Timing: event queueing vs the 1/60 s step
- [RECOMMENDED] keep_hit_lift ignored by Campaign B2 and HUD H1; tuning bounds without invariants
- [RECOMMENDED] Dependencies stale; AC32/AC34/AC1/AC4/AC24 rewrites
Revisions applied 2026-11-22 (user-approved, cross-document round 2): Rope Links owns preview legality and the HUD reads tie_legal (blocker resolved); Input emits no UI taps, Overview and Pressed state fixed (blocker resolved); drag feedback and the hit-test provider run every frame incl. Armed; hint_shown("cursor") event (rule 5, AC18); unlock at the result overlay; Back from the engine in UAT-1. Status stays Needs Revision pending the per-document blockers.
Reviewed-Content-Hash: design/gdd/touch-mouse-input.md d453343269b2416d6cbd716a7007db31148516c7
Reviewed-Content-Hash: design/registry/entities.yaml 7c078a61a2fe209d71cee39822db4cfe17d257ff
Reviewed-Content-Hash: .claude/skills/design-review/SKILL.md 4dcc8b81162613c757144532f1b72708ab3ba27f
Reviewed-Content-Hash: design/gdd/game-concept.md b9ec7dd07d6d43c3e9abb1208bac711ad23ae758
Reviewed-Content-Hash: design/gdd/systems-index.md 51f7eff69a32aa0925544e25a07136f03d38cbdc
Reviewed-Content-Hash: design/game-brief.md 7d90b94906b28807d72b86ade5f754d9a7c62b75
Reviewed-Content-Hash: design/gdd/keep-levels.md 433e135e0ec091348cab95776797287a08b45452
Reviewed-Content-Hash: design/gdd/troop-generation.md d2ba2132b296666c69bd0b6d907fd2cefcb86807
Reviewed-Content-Hash: design/gdd/save-progress.md 3b92d24ced6af243a993988b6efce966e26168eb
Reviewed-Content-Hash: design/gdd/screen-flow-scene-manager.md c8b26b4e46cf9a8ba069ffc75f27449a55b95cfb
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
Blocking items: 3 | Recommended: 7
Summary: Both prior blockers are fixed and the 48 px hit-radius floor checks out (about 9 mm). Still blocking: Input now calls Rope Links' blocking_keep but declares no upstream dependency; the Pressed row lets a left press start a cut swipe against rule 5; one keep_hit_radius serves both the accessibility touch setting and Rope Links' line rule, so a player setting changes the rival's legal moves.
Prior verdict resolved: Yes
Not run: gdd-structure-check.sh (subagent had no Bash tool). Touch-to-mouse emulation default is NOT SOURCED from docs/engine-reference/godot/
Findings:
- [BLOCKING] Dependencies: Rule 14 and F6 call Rope Links' blocking_keep, but the Direction rule and "Depends on: None" say no upstream; AC12/13/13b mis-tagged [Logic]
- [BLOCKING] States: the Pressed row sends left presses on a rope or empty space to Swiping and a cut tap, against rule 5; left-drag from a rival keep undefined
- [BLOCKING] Formulas: keep_hit_radius is both the accessibility touch radius and Rope Links' F6 line limit for every owner
- [RECOMMENDED] Detailed Rules: "step" is never defined; per-frame and per-step publication mixed (first tie happens in Armed)
- [RECOMMENDED] Formulas: chained F6 redirects can land well off the aimed line (8.9° in AC13b)
- [RECOMMENDED] Detailed Rules: rule 6 preview target when the hit is the origin
- [RECOMMENDED] Detailed Rules: the keyboard path redirects with no preview
- [RECOMMENDED] Detailed Rules: the cursor hint's "once per session" is undefined
- [RECOMMENDED] Edge Cases: touch-to-mouse emulation can duplicate input (engine default not sourced)
- [RECOMMENDED] Tuning Knobs: no consolidated table; keep_hit_radius upper bound 120 fails I2 on 4 of 5 maps
Reviewed-Content-Hash: design/gdd/touch-mouse-input.md ae3160009d7bceb2d0857fcdaf7236602ed146c8
Reviewed-Content-Hash: design/registry/entities.yaml 41f062f6645bf0d3c1230986fbfcdda9b7ded370
Reviewed-Content-Hash: .claude/skills/design-review/SKILL.md 4dcc8b81162613c757144532f1b72708ab3ba27f
Reviewed-Content-Hash: design/gdd/game-concept.md 5f59d626512352792d034532184266656d283cde
Reviewed-Content-Hash: design/gdd/rope-links.md 7b5d310afb0be438c29a5e751b897a9e25afbf6a
Reviewed-Content-Hash: design/gdd/level-hud.md 7cfd316d24c5f36fa273a5aa2d0e3535b4019c93
Reviewed-Content-Hash: design/gdd/level-state-match-flow.md 278b4a5562e3058864875073434324c5881885aa

## Review — 2026-11-22 — Verdict: NEEDS REVISION
Review mode: lean · Workflow: standard
Scope signal: M
Specialists: none (lean mode; independent subagent re-review). A separate lean review by session my-game-tower-war-39 on the same bytes gave APPROVED (0 blocking, 6 recommended); it did not flag the Edge Cases line below.
Blocking items: 1 | Recommended: 9
Summary: All three prior blockers are resolved (provider dependency, left press never swipes, radius split), and F6, AC12, AC13b and AC28 recompute. One line was missed by the fix: the Edge Case for a press on a non-player keep still starts a swipe for any pointer, contradicting rule 5, the Pressed row and AC18c.
Prior verdict resolved: Yes (all three; the second left one Edge Cases line behind, the blocker below)
Ran: gdd-structure-check.sh (6/6 required present). review-receipts.sh check: target and registry CHANGED, so a full review ran.
Not run: Phase 3b specialists (lean). NOT SOURCEABLE (not covered by docs/engine-reference/godot/): touch-to-mouse emulation and multi-touch on 4.7; pointer capture outside the window; the OS cancelling a pointer as an engine event; the engine's back-request notification.
Findings:
- [BLOCKING] Edge Cases (l.215): "If it moves, a swipe starts" for a press on a non-player keep, any pointer; a left press must be ignored (rule 5)
- [RECOMMENDED] States: a left drag goes to Idle ("no pointer down") while the button is held; hint timing (threshold vs release) unclear
- [RECOMMENDED] Dependencies: Rope Links row Direction still "out"; the Input–Rope Links provider interface has no owner (ADR?); systems-index row 3 Depends On "—"; touch_radius_setting listed only downstream
- [RECOMMENDED] Cross-doc: Level HUD rule 2 / H1 and Campaign B2 / B6 / F2 call keep_hit_radius the "touch circle"; keep_touch_radius registry entry omits level-hud.md
- [RECOMMENDED] Detailed Rules: rule 6 preview when the pointer is over the origin
- [RECOMMENDED] Detailed Rules: "step" undefined (per frame vs per step)
- [RECOMMENDED] Detailed Rules: the cursor hint's "once per session" undefined
- [RECOMMENDED] Detailed Rules: the keyboard redirect has no preview
- [RECOMMENDED] Formulas: keep_hit_radius range 48–120 vs the Green Vale I2 ceiling of 90
- [RECOMMENDED] Edge Cases: the engine claims above are unsourced
Reviewed-Content-Hash: design/gdd/touch-mouse-input.md a2c3be40cf617e0be62c6fd2470cd7f08539f06e
Reviewed-Content-Hash: design/registry/entities.yaml 66d85eeae3216b38ef327139f1e3a34bd6b95d2e
Reviewed-Content-Hash: .claude/skills/design-review/SKILL.md 4dcc8b81162613c757144532f1b72708ab3ba27f
Reviewed-Content-Hash: design/gdd/game-concept.md 5f59d626512352792d034532184266656d283cde
Reviewed-Content-Hash: design/gdd/rope-links.md 2809263e1cbc6e0c7e0df2b65a63821831714ab3
Reviewed-Content-Hash: design/gdd/campaign-level-data.md 222f45a25408ce350f951e1d96756882331277b6
Reviewed-Content-Hash: design/gdd/level-hud.md 7cfd316d24c5f36fa273a5aa2d0e3535b4019c93
Reviewed-Content-Hash: design/gdd/level-state-match-flow.md adac1973d70d40a0cd666255a063366e7da640fb
Reviewed-Content-Hash: design/gdd/screen-flow-scene-manager.md f6461833858f23a9738cc3b41bd941f2290f8a06
Reviewed-Content-Hash: docs/engine-reference/godot/modules/input.md 3406b1b813858898696e510ea0accfcc7df98af8
Reviewed-Content-Hash: docs/engine-reference/godot/breaking-changes.md c01fad937ab444eeb872a94549355eeb4f4ee216
Reviewed-Content-Hash: docs/engine-reference/godot/modules/ui.md 30ad166ab8c4e92c15aa37ed3464483b92b7845b

## Review — 2026-11-22 — Verdict: APPROVED
Review mode: lean · Workflow: standard
Scope signal: S
Specialists: none. Scope: re-check of the one fix since the entry above (Edge Cases l.215), not a full review; the rest of the file is byte-identical to the version reviewed above.
Blocking items: 0 | Recommended: 0 (the 9 above stand)
Summary: Edge Cases l.215 now says a touch or right-button press that moves starts a swipe and a left press is ignored with no hint. That matches rule 5, the Pressed row, AC18b, AC18c and AC23; rule 4's swipe bullet sits under Touch gestures, so it is correct as written.
Prior verdict resolved: Yes
Findings:
- none
Reviewed-Content-Hash: design/gdd/touch-mouse-input.md cd6196f979f7d74712ae74b5c369ad7220db6f53

## Review — 2026-11-22 — Verdict: APPROVED
Review mode: lean · Workflow: standard
Scope signal: S
Specialists: none. Scope: header-only re-check, not a full review. The one edit since the entry above is line 3, the Status header ("In Review (revised 2026-11-22, pending re-review)" -> "Approved (2026-11-22, lean /design-review; see its review log)"), made to match the systems index.
Blocking items: 0 | Recommended: 0 (the recommendations above stand)
Summary: Verified mechanically: restoring the old header line gives exactly the content hash stamped in the entry above (cd6196f9), so no other byte changed. The verdict above carries over unchanged.
Prior verdict resolved: Yes
Findings:
- none
Reviewed-Content-Hash: design/gdd/touch-mouse-input.md bd5db29bef56375486bdfa1125e5c4c5e5ab2e94
