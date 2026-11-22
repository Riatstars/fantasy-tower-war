# Review Log: Game Concept (Tower War)

## Review — 2026-11-22 — Verdict: NEEDS REVISION
Review mode: lean · Workflow: standard
Scope signal: XL
Specialists: none (lean)
Blocking items: 3 | Recommended: 4
Summary: Coherent, well-scoped concept; every numeric value matches the registry and the 20-system UAT scope matches the systems index. Defects are staleness (prototype-era wording, config.js as source of record, a dead `link_range` knob) and two untestable acceptance criteria, not design flaws.
Prior verdict resolved: First review
Findings:
- [BLOCKING] Acceptance Criteria: line 103 "within a few minutes" and line 108 "does not overwhelm a first-time player" are not testable
- [BLOCKING] Detailed Rules / Edge Cases: "both die" (clash), "at zero the keep flips" (capture) and the relay rule omit what Troop Marching rules 7, 11, 13 now say; full-keep edge case stated twice
- [BLOCKING] Formulas / Tuning Knobs: config.js named as file of record; `link_range` contradicts Rope Links `tie_legal` (no distance check); knob names differ from the registry
- [RECOMMENDED] Pillars vs Detailed Rules: Pillar 1 (ropes are the only verb) conflicts with god/goddess powers cast once per level
- [RECOMMENDED] Cross-doc: keep-levels.md and troop-generation.md still call Factions and Unit Roster "Alpha"; the concept decision and systems index make them MVP
- [RECOMMENDED] Dependencies: names no systems; Unit Roster & Stats and Factions have no GDD yet
- [RECOMMENDED] Detailed Rules: level rule omits the drop hysteresis (`level_drop_margin`)

Reviewed-Content-Hash: design/gdd/game-concept.md 877fa2cbde69e1bcf8d36f8ebe313a58d9abb373
Reviewed-Content-Hash: design/registry/entities.yaml 0746e7f99143e9fb132ff9db63e05782d0a53328
Reviewed-Content-Hash: .claude/skills/design-review/SKILL.md 4dcc8b81162613c757144532f1b72708ab3ba27f
Reviewed-Content-Hash: design/gdd/troop-marching-clashes.md 0105516db23e758a5010f59ee90e85dc449fd096
Reviewed-Content-Hash: design/gdd/rope-links.md c50cccdbcf7d769949065952f9d3dc42beb69190
Reviewed-Content-Hash: design/gdd/keep-levels.md f4b0a3cf67ee657cf5b71ff7b88d27df0ae768e4
Reviewed-Content-Hash: design/gdd/troop-generation.md 2e8afe19033e868b452f1590a04b5f2a02802a31
Reviewed-Content-Hash: design/gdd/systems-index.md c12ac4ef37e5fed01379158c58453e8febba7f9d
Reviewed-Content-Hash: design/game-brief.md 39a37e738731fecf707b2ac81ad3c5042f596e77
Reviewed-Content-Hash: design/art/art-bible.md 4f1539e1dd7e942c345b39861830a39fe77ba283

## Review — 2026-11-22 — Verdict: APPROVED
Review mode: lean · Workflow: standard
Scope signal: XL
Specialists: none (lean)
Blocking items: 0 | Recommended: 4 (all applied before this entry was stamped) + 3 nice-to-have (applied)
Summary: All 3 blockers from the first review are resolved: testable ACs, rules aligned to Troop Marching rules 7 and 11-13, and the registry as the owner of values. Every numeric value and knob name matches the registry. The remaining items were wording plus one design call (the level 1 clock starts at the player's first rope, so nothing generates and the rival waits until then), decided by the player and written into the concept.
Prior verdict resolved: Yes (NEEDS REVISION, 3 blockers, same date)
Findings:
- [RECOMMENDED] Detailed Rules / Acceptance Criteria: rival waiting for the first rope left generation running; now the level clock starts at the first rope (applied)
- [RECOMMENDED] Dependencies: sentence named only Unit Roster and Factions as lacking a GDD; now says most cited systems have none and points to the index (applied)
- [RECOMMENDED] Overview: five races stated as given while the UAT count is open; now "up to five" (applied)
- [RECOMMENDED] Acceptance Criteria: "documented controls" now cites touch-mouse-input.md (applied)
- [NICE] Formulas example, Pillar 3 test wording, ai_grace note (applied)
- Open, tracked elsewhere: sibling GDDs still label Factions and Unit Roster "Alpha" (task-list.md, fixed in each GDD's re-review); UAT race count (Factions GDD)

Reviewed-Content-Hash: design/gdd/game-concept.md 45249a5f03af46593ee3ca30b24413e4b50b5587
Reviewed-Content-Hash: design/registry/entities.yaml 0746e7f99143e9fb132ff9db63e05782d0a53328
Reviewed-Content-Hash: .claude/skills/design-review/SKILL.md 4dcc8b81162613c757144532f1b72708ab3ba27f
Reviewed-Content-Hash: design/gdd/troop-marching-clashes.md dac811204df7104a87080e9a5491f89ccc9f7107
Reviewed-Content-Hash: design/gdd/rope-links.md 8dffb8c8f331f48d72106840c6cac16cf987e1da
Reviewed-Content-Hash: design/gdd/keep-levels.md 4c5b18c3ebbfb9ace96372a87c938bc5a45992f4
Reviewed-Content-Hash: design/gdd/troop-generation.md f4e5f20cfed69fa23d8529d0b08e3aa79c0fc6de
Reviewed-Content-Hash: design/gdd/touch-mouse-input.md 7fdcaa2e0af15d168a8414cf97194a78e6729ff7
Reviewed-Content-Hash: design/gdd/systems-index.md c12ac4ef37e5fed01379158c58453e8febba7f9d
Reviewed-Content-Hash: design/game-brief.md cbfab6eae62e1d26b8f2133c9460e608d31a1a99
Reviewed-Content-Hash: design/art/art-bible.md 4f1539e1dd7e942c345b39861830a39fe77ba283
