# Review Log: Troop Generation

## Review — 2026-11-22 — Verdict: NEEDS REVISION
Review mode: lean · Workflow: standard
Scope signal: M
Specialists: none (lean mode; independent reviewer session, Opus)
Blocking items: 1 | Recommended: 6
Summary: F4 and AC15 held the keep's level constant, but Keep Levels drops it below 30 and 10 troops, so a level 3 keep falls to one rope in about 49 s (step simulation), not 80–95 s; AC15 could never pass. Rope Links was missing from Interactions and Dependencies, and the float-seconds timer made the exact-step criteria fragile.
Prior verdict resolved: First review
Findings:
- [BLOCKING] Formulas F4 / AC15: capture time ignores level drops (49 s simulated vs 80–95 s)
- [RECOMMENDED] Interactions / Dependencies: Rope Links listed as "none"
- [RECOMMENDED] Core Rule 1: timer in float seconds vs exact-step ACs
- [RECOMMENDED] Invariants I3: checked twice with different clamps (here and Rope Links R1)
- [RECOMMENDED] Dependencies / Cross-References: stale "no GDD yet" and consistency items
- [RECOMMENDED] Edge Cases: no single per-step order across systems
- [RECOMMENDED] Acceptance Criteria AC25: not pass/fail
Revisions applied 2026-11-22 (user-approved; capture pace ~52 s kept by the user): F4 sums over level bands (≈ 55 s expected, simulation reference ≈ 52 s); AC15 48–56 s, same case as Troop Marching AC-M32; Rope Links added both ways; timer in whole steps (gen_interval_steps) and AC23 in steps; I3 checked once, clamp lowers send_interval; Full means at or above the cap; per-step order points to Troop Marching § Formulas; OQ5 closed (keep's own side first); AC25 pass/fail; Summary, data-key mapping, rival slot dots, stale items fixed. Status set to In Review pending re-review.
Reviewed-Content-Hash: design/gdd/troop-generation.md 6bf7dec626b85c6e5fe8ecebc6a4b050d3ce9bc3
Reviewed-Content-Hash: design/registry/entities.yaml 44d26d5a860ebcb7026da6a5ed63411383f134e2
Reviewed-Content-Hash: .claude/skills/design-review/SKILL.md 4dcc8b81162613c757144532f1b72708ab3ba27f
Reviewed-Content-Hash: design/gdd/screen-flow-scene-manager.md 31f6b9f1371007926448f359f895ad0b85f989d9
Reviewed-Content-Hash: design/gdd/touch-mouse-input.md 4203499bad17d93a7efa8a191d3dbfaf55545e74
Reviewed-Content-Hash: design/gdd/save-progress.md 4ef1eafb7b0fb29715768faaffc41ecaabccb7af
Reviewed-Content-Hash: design/gdd/keep-levels.md 78df4bad822fd3f9cbdb4eb60d9c5debcdb0d056
Reviewed-Content-Hash: design/gdd/rope-links.md f6816232d25eee1e737641dd0b6294ade7a6c912
Reviewed-Content-Hash: design/gdd/systems-index.md a57dea8a6c59ab9c163c83673a824f8f37f9dcca
Reviewed-Content-Hash: design/gdd/game-concept.md 9638f7a1f3394f38352472bfc9b57753fccbb83f
Reviewed-Content-Hash: design/game-brief.md 302532346c1d5c9a7fd1778bbd12b7fe277630c2
