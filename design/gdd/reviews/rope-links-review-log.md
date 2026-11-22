# Review Log: Rope Links

## Review — 2026-11-22 — Verdict: NEEDS REVISION
Review mode: lean · Workflow: standard
Scope signal: L
Specialists: none (lean mode; independent reviewer session, Opus)
Blocking items: 2 | Recommended: 8
Summary: The rope rules are clear and test-friendly, but free sending plus loss-free relay had no sink, so a ring of full allied keeps grew pawns without limit and broke F5, R3, AC22 and AC32. The hit-test provider listed only the player's keeps, so a rope could not be tied to an enemy, and its owner disagreed with Touch & Mouse Input.
Prior verdict resolved: First review
Findings:
- [BLOCKING] Core Rules / F5: relay breaks the per-rope pawn bound; a ring of full keeps grows ~5 pawns/s for ever
- [BLOCKING] Core Rules / Interactions: hit-test provider lists only the player's keeps; owner conflicts with touch-mouse-input.md
- [RECOMMENDED] Edge Cases: the both-ways allied state cannot arise (edge cases, OQ5, AC2, F3 exclusion)
- [RECOMMENDED] Core Rules: capture cutting had two signals (keep_captured and level_dropped)
- [RECOMMENDED] Formulas: F5 example and AC32 off by one (23 vs 24); R3 inequality dropped ceil and +1
- [RECOMMENDED] States: Extending ropes cuttable in the table but not in rule 9
- [RECOMMENDED] Edge Cases: Extending-rope relay loss contradicts game-concept.md:79
- [RECOMMENDED] Dependencies: stale Consistency-to-fix items
- [RECOMMENDED] UI Requirements: rival slot dots conflict with keep-levels.md and troop-generation.md
- [RECOMMENDED] Edge Cases: no shared per-step order
Revisions applied 2026-11-22 (user-approved): relay limit of 6 hops (Troop Marching rule 13) in rule 10, F5, R3, Feedback loop, AC22, OQ2; F5/AC32 corrected to 24 and R3 to ≥ 0.343 s; Rope Links named the hit-test provider with every keep; capture cuts only on keep_captured; impossible both-ways state removed (OQ5 closed, AC2 marked injected); Extending ropes cuttable and relay; rival slot dots shown; Troop Marching & Clashes contract checked. Status set to In Review pending re-review.
Reviewed-Content-Hash: design/gdd/rope-links.md f6816232d25eee1e737641dd0b6294ade7a6c912
Reviewed-Content-Hash: design/registry/entities.yaml 44d26d5a860ebcb7026da6a5ed63411383f134e2
Reviewed-Content-Hash: .claude/skills/design-review/SKILL.md 4dcc8b81162613c757144532f1b72708ab3ba27f
Reviewed-Content-Hash: design/gdd/troop-generation.md 6bf7dec626b85c6e5fe8ecebc6a4b050d3ce9bc3
Reviewed-Content-Hash: design/gdd/screen-flow-scene-manager.md 31f6b9f1371007926448f359f895ad0b85f989d9
Reviewed-Content-Hash: design/gdd/touch-mouse-input.md 4203499bad17d93a7efa8a191d3dbfaf55545e74
Reviewed-Content-Hash: design/gdd/save-progress.md 4ef1eafb7b0fb29715768faaffc41ecaabccb7af
Reviewed-Content-Hash: design/gdd/keep-levels.md 78df4bad822fd3f9cbdb4eb60d9c5debcdb0d056
Reviewed-Content-Hash: design/gdd/systems-index.md a57dea8a6c59ab9c163c83673a824f8f37f9dcca
Reviewed-Content-Hash: design/gdd/game-concept.md 9638f7a1f3394f38352472bfc9b57753fccbb83f
Reviewed-Content-Hash: design/game-brief.md 302532346c1d5c9a7fd1778bbd12b7fe277630c2
