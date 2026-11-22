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
