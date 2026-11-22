# Review Log: Keep Levels

## Review — 2026-11-22 — Verdict: NEEDS REVISION
Review mode: lean · Workflow: standard
Scope signal: M
Specialists: none (lean mode; independent reviewer session, Opus)
Blocking items: 2 | Recommended: 6
Summary: F2 contradicted the States table and Rule 3 for a level 3 keep at 10–14 troops (it gave level 1, not 2), and the registry copied the wrong formula. AC17's shipped clamp (margin 19) still breached K2.
Prior verdict resolved: First review
Findings:
- [BLOCKING] Formulas F2: effective level wrong for prev 3 at 10–14 troops; AC4 missed it
- [BLOCKING] Acceptance Criteria AC17: clamp to 19 still breaches K2 (correct: 14)
- [RECOMMENDED] Core Rule 7: capture signal muddled (level_dropped 1→1); AC12 unreachable state
- [RECOMMENDED] Game Feel / OQ1: grace-window numbers disagree and ignore generation
- [RECOMMENDED] Dependencies / Cross-References: stale items and "no GDD yet" statements
- [RECOMMENDED] UI Requirements: refusal text uses L for both level and limit
- [RECOMMENDED] Visual: who shows slot dots inconsistent across GDDs
- [RECOMMENDED] Formulas F3: max_ropes_table range 0–5 vs Rope Links' 3
Revisions applied 2026-11-22 (user-approved): F2 steps down one band at a time (AC4 gains prev 3 at 12 → 2); AC17 and the boundary note clamp to 14 under K2 and K3; capture resets on keep_captured with no level_dropped (rule 7, rule 9, States, Interactions, F4, AC12); grace window 10 arrivals at level 2 and 18 at level 3; Troop Marching reads the level from Alpha only; slot dots on player and rival keeps, none on neutrals; refusal text "only N ropes"; max_ropes_table 1–3; stale items removed; registry F2 fix listed in Consistency to fix. Status set to In Review pending re-review.
Reviewed-Content-Hash: design/gdd/keep-levels.md 78df4bad822fd3f9cbdb4eb60d9c5debcdb0d056
Reviewed-Content-Hash: design/registry/entities.yaml 44d26d5a860ebcb7026da6a5ed63411383f134e2
Reviewed-Content-Hash: .claude/skills/design-review/SKILL.md 4dcc8b81162613c757144532f1b72708ab3ba27f
Reviewed-Content-Hash: design/gdd/troop-generation.md 6bf7dec626b85c6e5fe8ecebc6a4b050d3ce9bc3
Reviewed-Content-Hash: design/gdd/screen-flow-scene-manager.md 31f6b9f1371007926448f359f895ad0b85f989d9
Reviewed-Content-Hash: design/gdd/touch-mouse-input.md 4203499bad17d93a7efa8a191d3dbfaf55545e74
Reviewed-Content-Hash: design/gdd/save-progress.md 4ef1eafb7b0fb29715768faaffc41ecaabccb7af
Reviewed-Content-Hash: design/gdd/rope-links.md f6816232d25eee1e737641dd0b6294ade7a6c912
Reviewed-Content-Hash: design/gdd/systems-index.md a57dea8a6c59ab9c163c83673a824f8f37f9dcca
Reviewed-Content-Hash: design/gdd/game-concept.md 9638f7a1f3394f38352472bfc9b57753fccbb83f
Reviewed-Content-Hash: design/game-brief.md 302532346c1d5c9a7fd1778bbd12b7fe277630c2
