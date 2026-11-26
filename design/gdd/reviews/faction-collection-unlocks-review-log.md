# Review Log: Faction Collection & Unlocks

## Review — 2026-11-25 — Verdict: NEEDS REVISION
Review mode: lean · Workflow: standard
Scope signal: M
Specialists: none (lean mode)
Blocking items: 3 | Recommended: 6
Summary: The core design (ownership, the purchase, one-write safety, the load checks) is sound and precise. The three blockers sat in the Formulas checks and one load rule, mostly because Currencies & Economy was finished after this GDD was drafted. All three blockers and all six recommended items were revised in the same session (user-approved); the revised document awaits a re-review.
Prior verdict resolved: First review
Findings:
- [BLOCKING] Formulas F2: diamonds_total summed every loaded region, so the UAT build's four regions with no levels counted (250, not 50). Fixed: uses Currencies & Economy's diamonds_available; region_diamonds range 1 to 1,000.
- [BLOCKING] Formulas, Invariants / AC19: C2 duplicated Currencies & Economy's E5 with a conflicting shipped-build outcome ("still charges 51" against E5's repair). Fixed: C2 removed, E5 cited, C1 kept log-only, AC19 rewritten on stubbed lookups.
- [BLOCKING] Detailed Design rule 11 / AC10, AC11: the repaired active race was "saved with the next write", so a returning race could load Active against AC11. Fixed: the replacement is reported as a change and written that frame.
- [RECOMMENDED] Dependencies, Open Questions: Currencies & Economy status and amounts were stale (placeholder 50, question 1). Fixed.
- [RECOMMENDED] Dependencies, Open Questions: Unit Cards & Upgrades rule 3 already limits upgrades to owned races (Hard, question 3). Fixed.
- [RECOMMENDED] Cross-References: menus-screens.md rule 6 (the unlock text line) was missing from the edits list. Fixed.
- [RECOMMENDED] Formulas, Invariants: C1 has no owner for its repair; session 7a asked to adopt it in Currencies & Economy. Listed as edit 2.
- [RECOMMENDED] Acceptance Criteria: AC21 mixed screenshots and a behaviour test. Fixed: split into AC21 and AC22.
- [RECOMMENDED] Dependencies: Factions status was "Designed, not reviewed"; the index says In Review. Fixed.
Receipt note: the target hash below is the committed version that was reviewed (HEAD 04c92fb), not the revised file, so the next check reads the revised document as CHANGED and it is reviewed in full.
Reviewed-Content-Hash: design/gdd/faction-collection-unlocks.md cb4580850be50925d7c5930e3164b8f09adf3feb
Reviewed-Content-Hash: design/registry/entities.yaml 2c845466a100cc35467ae5156055493f9a9b634f
Reviewed-Content-Hash: .claude/skills/design-review/SKILL.md c1afa55116b1c2f752e01f9d6deb637beae8e7a9
Reviewed-Content-Hash: design/gdd/currencies-economy.md 8406bbe58b4371b9f366870f30e12785e82ee02b
Reviewed-Content-Hash: design/gdd/factions.md d028764ab3da2568fe469b7dcaaed798ac901cf6
Reviewed-Content-Hash: design/gdd/save-progress.md fb39f39f63d1004f1eeaa697f4784bb686bc1afb
Reviewed-Content-Hash: design/gdd/unit-cards-upgrades.md 799ce20212d97d81e979687c487582b6b2714ae8
Reviewed-Content-Hash: design/gdd/world-map-regions.md 79d004a7067254037a4eda0d63a994b3bfaa2087
Reviewed-Content-Hash: design/gdd/game-concept.md 936cf985fc96e306679c0fef7894f898eb4f728c
