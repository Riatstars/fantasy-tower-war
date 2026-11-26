# Review Log: Currencies & Economy

## Review — 2026-11-26 — Verdict: NEEDS REVISION
Review mode: lean · Workflow: standard
Scope signal: L
Specialists: none (lean mode)
Blocking items: 2 | Recommended: 8
Summary: The design is sound and every table, pace-check row and range end recomputes correctly; all values agree with the registry. Two acceptance-criteria defects block: the E1 fixture in AC17/AC17b also breaches E3 while rule 11 fixes no check order or logging rule, and AC7 and AC12 use fixtures the loader itself rejects. The rest is stale statuses, one pending request from Faction Collection & Unlocks (C1) and unapplied edits in other documents.
Prior verdict resolved: First review
Findings:
- [BLOCKING] Acceptance Criteria (AC17, AC17b) / Core Rules (rule 11): `replay_percent` 11 breaches E1 and E3 together; no check order or logging rule is fixed, so "one log line names the invariant" cannot be decided.
- [BLOCKING] Acceptance Criteria (AC7, AC12): fixture `balance_cap` 1,000 is below its minimum 9,999 (E3); fixture `region_star_gold` 5 breaks E2; the loader rejects both.
- [RECOMMENDED] Dependencies / Interactions / Cross-References / header: stale statuses and "provisional" labels (Faction Collection & Unlocks and Unit Cards & Upgrades have GDDs; Stars & Rewards Approved; Factions In Review; header In Design).
- [RECOMMENDED] Invariants: Faction Collection & Unlocks asks this GDD to adopt its C1 (cheapest diamonds race costs no more than the first region pays); undecided.
- [RECOMMENDED] Invariants (E3): no check that `card_cost` covers levels 2 to `card_level_max`, or that `region_star_gold` has at least one entry.
- [RECOMMENDED] Dependencies (bidirectional): `unit-roster-stats.md` does not mention this system; Consistency edits 1 (Save), 6 (concept) and 7 (World Map) are not applied.
- [RECOMMENDED] Consistency to fix (item 8) / Loops: references to a Unit Roster refund edge case and "card stats stop at U2–U4" predate the veteran design.
- [RECOMMENDED] Pace check: 12,625 gold beyond one-time income for fifteen cards is 420+ replay wins; say whether intended or defer to `/balance-check`.
- [RECOMMENDED] Edge Cases (replay farming): two levers for the same playtest result (`replay_percent` here, `win_gold` 0 on fully-starred levels in Stars & Rewards OQ3); name one owner.
- [RECOMMENDED] Acceptance Criteria (AC20): "process is stopped before the end of the frame" is hard to automate; reword as "the flush is not run, then the profile is reloaded".
Reviewed-Content-Hash: design/gdd/currencies-economy.md 8406bbe58b4371b9f366870f30e12785e82ee02b
Reviewed-Content-Hash: design/registry/entities.yaml 2c845466a100cc35467ae5156055493f9a9b634f
Reviewed-Content-Hash: .claude/skills/design-review/SKILL.md c1afa55116b1c2f752e01f9d6deb637beae8e7a9
Reviewed-Content-Hash: design/gdd/stars-rewards.md 06a5508c1b64e7f454d02e5f8330a8837889e930
Reviewed-Content-Hash: design/gdd/unit-cards-upgrades.md 2fcff94265d8ea70fe625707e3e9c49b953ba51d
Reviewed-Content-Hash: design/gdd/faction-collection-unlocks.md 8653ccb3eac03d4196fe61d7d04a5ed1b1fd5d9e
Reviewed-Content-Hash: design/gdd/factions.md d028764ab3da2568fe469b7dcaaed798ac901cf6
Reviewed-Content-Hash: design/gdd/save-progress.md fb39f39f63d1004f1eeaa697f4784bb686bc1afb
Reviewed-Content-Hash: design/gdd/unit-roster-stats.md 535aac955ca81c77e78e36ae99d5f89a9ba7d3fd
Reviewed-Content-Hash: design/gdd/world-map-regions.md 79d004a7067254037a4eda0d63a994b3bfaa2087
Reviewed-Content-Hash: design/gdd/campaign-level-data.md 4c2d423eb2fba16a27f05ccedd4972f27f76c570
Reviewed-Content-Hash: design/gdd/game-concept.md 936cf985fc96e306679c0fef7894f898eb4f728c

## Review — 2026-11-26 — Verdict: APPROVED
Review mode: lean · Workflow: standard
Scope signal: L
Specialists: none (lean mode)
Blocking items: 0 | Recommended: 12
Summary: Both blockers from the first review are resolved: rule 11 now fixes the check order (E3, E1, E2, E4, E5), reports every breach and replaces the whole table, and the AC7 and AC12 fixtures pass the loader. Every table, pace-check row and range end recomputes correctly and all values agree with the registry. What remains is stale statuses, two pending requests from the buyers' GDDs (C1; the one-race cost ask), loose wording around loader-computed totals and unapplied edits in other documents.
Prior verdict resolved: Yes
Findings:
- [RECOMMENDED] Header / Interactions / Dependencies / Cross-References: stale statuses and "provisional" labels (Faction Collection & Unlocks, Unit Cards & Upgrades and Stars & Rewards are Approved; Factions In Review; header In Design).
- [RECOMMENDED] Invariants: Faction Collection & Unlocks' C1 (cheapest diamonds race costs no more than the first region pays) is still not adopted or declined.
- [RECOMMENDED] Invariants (E3): no check that `card_cost` covers levels 2 to `card_level_max` (up to 10 in Unit Cards & Upgrades), or that `region_star_gold` has at least one entry.
- [RECOMMENDED] Invariants: Unit Cards & Upgrades' ask that one race's twelve purchases cost more than the first region's one-time star gold is not checked (holds today: 5,625 against 1,500).
- [RECOMMENDED] Formulas (F3, F4): "a design check, not runtime code" contradicts the loader computing both for E4 and E5, AC13/AC14 testing them and AC8's exact list of public calls.
- [RECOMMENDED] Core Rules (rule 11): no rule for a check that cannot be evaluated (inputs failing E3's type test; E2's "first level" with no level loaded); "first level" is not defined.
- [RECOMMENDED] Acceptance Criteria (AC17b): the E5 breach is reported in the first pass and again after the baseline; the criterion does not state the count.
- [RECOMMENDED] Loops / Consistency to fix (item 8) / Cross-References: "card stats stop at U2–U4" and the Unit Roster refund edge case predate the veteran design.
- [RECOMMENDED] Dependencies (bidirectional): `unit-roster-stats.md` does not name this system; Consistency edits 1 (Save rule 6), 6 (concept) and 7 (World Map OQ6) are not applied; `stars-rewards.md` still says In Design; items 2, 3 and 4 are applied and can be struck.
- [RECOMMENDED] Pace check: 12,625 gold beyond one-time income for fifteen cards is about 420 replay wins; say whether intended or defer to `/balance-check`.
- [RECOMMENDED] Edge Cases (replay farming): two levers for the same playtest result (`replay_percent` here, `win_gold` 0 on fully-starred levels in Stars & Rewards OQ3); name one owner.
- [RECOMMENDED] Acceptance Criteria (AC20): "process is stopped before the end of the frame" is hard to automate; reword as "the flush is not run, then the profile is reloaded".
Reviewed-Content-Hash: design/gdd/currencies-economy.md e38470508fd57de5718c1e944e0e37698a761e2c
Reviewed-Content-Hash: design/registry/entities.yaml 2c845466a100cc35467ae5156055493f9a9b634f
Reviewed-Content-Hash: .claude/skills/design-review/SKILL.md c1afa55116b1c2f752e01f9d6deb637beae8e7a9
Reviewed-Content-Hash: design/gdd/stars-rewards.md 06a5508c1b64e7f454d02e5f8330a8837889e930
Reviewed-Content-Hash: design/gdd/unit-cards-upgrades.md 7e69e0797da98bf1beb5909e270b59d918bc6013
Reviewed-Content-Hash: design/gdd/faction-collection-unlocks.md 8653ccb3eac03d4196fe61d7d04a5ed1b1fd5d9e
Reviewed-Content-Hash: design/gdd/factions.md d028764ab3da2568fe469b7dcaaed798ac901cf6
Reviewed-Content-Hash: design/gdd/save-progress.md fb39f39f63d1004f1eeaa697f4784bb686bc1afb
Reviewed-Content-Hash: design/gdd/unit-roster-stats.md 535aac955ca81c77e78e36ae99d5f89a9ba7d3fd
Reviewed-Content-Hash: design/gdd/world-map-regions.md 79d004a7067254037a4eda0d63a994b3bfaa2087
Reviewed-Content-Hash: design/gdd/campaign-level-data.md 4c2d423eb2fba16a27f05ccedd4972f27f76c570
Reviewed-Content-Hash: design/gdd/game-concept.md 936cf985fc96e306679c0fef7894f898eb4f728c
Reviewed-Content-Hash: design/gdd/menus-screens.md 30785c884d3ce0887874e26e7f2fb98cda61df24
