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
