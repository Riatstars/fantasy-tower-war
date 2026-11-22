# Review Log: Menus & Screens

## Review — 2026-11-22 — Verdict: NEEDS REVISION
Review mode: lean · Workflow: standard
Scope signal: M
Specialists: none (lean mode; independent reviewer subagent per GDD, batch review of all 13 UAT-1 GDDs)
Blocking items: 3 | Recommended: 8 (logged; full report lists more)
Summary: Structurally complete with solid art-bible and Screen Flow alignment and no registry value conflicts. F1 mislabels every win that follows an earlier loss ('New best!' instead of 'First clear!') because Save counts losses in plays; ties also count as 'New best!', and the Win overlay star row contradicts Level State.
Prior verdict resolved: First review
Findings:
- [BLOCKING] Formulas F1 / AC1 / AC2: plays counts losses, so a win after a loss shows 'New best!' not 'First clear!'; needs pre-merge was_beaten / previous_best
- [BLOCKING] Formulas F1: tie t = best shows 'New best!'; untestable and misleading
- [BLOCKING] Core Rule 4 / AC6: empty star row contradicts Level State's one-star statement
- [RECOMMENDED] Formulas F3: float tenths formatting; t < 0 guard
- [RECOMMENDED] Core Rules: Pause key as Resume not in Screen Flow
- [RECOMMENDED] Core Rule 11: panel placement not implementable
- [RECOMMENDED] Core Rules: World Map primary when Next level absent
- [RECOMMENDED] UI: min_font_px 18 check vs accessibility and HUD
- [RECOMMENDED] Tuning Knobs: missing; register constants; cover colour vs art bible
- [RECOMMENDED] Dependencies: stale statuses in other GDDs and line 152
- [RECOMMENDED] Acceptance Criteria: AC13/AC14/AC15 rewrites; several rules lack ACs
Reviewed-Content-Hash: design/gdd/menus-screens.md 2ff1faab335ff570b4796954f02788d5649c17f0
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
Reviewed-Content-Hash: design/gdd/level-hud.md c0946163f4a8610ac9cedcba8d8ad342997ba759

## Review — 2026-11-22 — Verdict: NEEDS REVISION
Review mode: lean · Workflow: standard
Scope signal: M
Specialists: none (lean mode; independent reviewer subagent per GDD, batch re-review of all 13 UAT-1 GDDs after the cross-doc cluster fixes)
Blocking items: 2 | Recommended: 9 (logged; full report lists more)
Summary: All three prior blockers are resolved by the single Clear! form and the empty star slot, applied consistently. New: the Win overlay's best time has no stated read path, and the Pause key as Resume contradicts Screen Flow's table.
Prior verdict resolved: Yes (prior blocking items resolved)
Findings:
- [BLOCKING] Rule 12 vs F1 / Interactions: read path for the stored best undefined (never calls Save; not in the record)
- [BLOCKING] Rule 3: Pause key as Resume not in Screen Flow's table (escalated from recommended)
- [RECOMMENDED] Rule 7: load-failure text undefined
- [RECOMMENDED] World Map button primary when Next level absent
- [RECOMMENDED] F3 integer tenths; t < 0 guard
- [RECOMMENDED] Level HUD missing from Dependencies
- [RECOMMENDED] Stale statuses and line 150
- [RECOMMENDED] Coverage claim false (rules 5, 7, 8)
- [RECOMMENDED] Tuning Knobs: register panel_max_w, min_font_px; Hard vs Soft with Level State
- [RECOMMENDED] AC6/AC12/AC13/AC15 rewrites; best_time_label output_range [0,0] meaningless
Revisions applied 2026-11-22 (user-approved, cross-document round 2): Best time read through Save's best_time(level_id) (Rule 12, F1, Save row; blocker resolved); P in Pause now in Screen Flow's table (blocker resolved); F2 hides Next level on a region's last level (AC3, registry); strings data file, Localization after UAT (rule 10, edge case, dependencies). Status stays Needs Revision pending the per-document blockers.
Reviewed-Content-Hash: design/gdd/menus-screens.md c20ff536a7a8e07072c2e2602fecb9c1318a740e
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
Reviewed-Content-Hash: design/gdd/level-hud.md c0946163f4a8610ac9cedcba8d8ad342997ba759
