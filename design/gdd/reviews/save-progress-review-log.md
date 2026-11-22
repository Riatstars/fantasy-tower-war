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
