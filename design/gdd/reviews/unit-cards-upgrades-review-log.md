# Review Log: Unit Cards & Upgrades

## Review — 2026-11-26 — Verdict: NEEDS REVISION
Review mode: lean · Workflow: standard
Scope signal: L
Specialists: none (lean mode)
Blocking items: 1 | Recommended: 5
Summary: A strong document: the veteran rule is deterministic and precise, the launch contract matches Troop Marching and Level HUD, and the registry values all match. The one blocker is a rounding slip in the power table that makes AC26 fail against a correct implementation. Findings were sent to the owning session (73, formerly bb); nothing was revised here.
Prior verdict resolved: First review
Findings:
- [BLOCKING] Formulas F3, C4 / AC26: a beast soldier at level 5 has upgraded_power 1.31, not 1.32 (beast_t1 unit_power is 1.0954, shown rounded as 1.10 in Unit Roster).
- [RECOMMENDED] Dependencies, Cross-References: stale statuses (Faction Collection & Unlocks is Approved; others In Review or Approved); edit 3 contradicts edit 1; the bidirectional check misses Level HUD.
- [RECOMMENDED] Detailed Design rule 3, Interactions: name the call is_owned(race).
- [RECOMMENDED] Formulas F2 / rule 11: card_power_gain should be 0 for a kind with base strength 3.
- [RECOMMENDED] Acceptance Criteria AC31: "still distinguishable" in greyscale is not measurable.
- [RECOMMENDED] Acceptance Criteria coverage: no criterion for a kept level on a locked race's card, or for a lowered card_level_max.
Receipt note: the target document is not stamped. Session 73 revised it (blocker fixed: 1.31) before this entry was written, and the reviewed version was never committed, so its hash is not available. The next check reads the target as NEW and reviews it in full.
Reviewed-Content-Hash: design/registry/entities.yaml 2c845466a100cc35467ae5156055493f9a9b634f
Reviewed-Content-Hash: .claude/skills/design-review/SKILL.md c1afa55116b1c2f752e01f9d6deb637beae8e7a9
Reviewed-Content-Hash: design/gdd/unit-roster-stats.md 535aac955ca81c77e78e36ae99d5f89a9ba7d3fd
Reviewed-Content-Hash: design/gdd/troop-marching-clashes.md 0c3e54851a4da9ed59b5bb51815cde2a7a074b41
Reviewed-Content-Hash: design/gdd/currencies-economy.md e38470508fd57de5718c1e944e0e37698a761e2c
Reviewed-Content-Hash: design/gdd/faction-collection-unlocks.md 8653ccb3eac03d4196fe61d7d04a5ed1b1fd5d9e
Reviewed-Content-Hash: design/gdd/level-hud.md 15a4a13fbf4c272efea720d68e2a5687bf37a71c
Reviewed-Content-Hash: design/gdd/rope-links.md 4d5f475dd6a00d149e9ce7cc4383c8749fe07999
Reviewed-Content-Hash: design/gdd/save-progress.md fb39f39f63d1004f1eeaa697f4784bb686bc1afb
Reviewed-Content-Hash: design/gdd/factions.md d028764ab3da2568fe469b7dcaaed798ac901cf6
Reviewed-Content-Hash: design/gdd/stars-rewards.md 06a5508c1b64e7f454d02e5f8330a8837889e930
Reviewed-Content-Hash: design/gdd/game-concept.md 936cf985fc96e306679c0fef7894f898eb4f728c

## Review — 2026-11-26 — Verdict: APPROVED
Review mode: lean · Workflow: standard
Scope signal: L
Specialists: none (lean mode)
Blocking items: 0 | Recommended: 7
Summary: Full re-review of the revised document. The prior blocker (1.31) and all five prior recommended items are fixed; every number in F1 to F3, the cost section and the criteria was recomputed and holds, and no registry value conflicts. The seven recommended items are wording and cross-document clean-up, not design changes. The header Status line was set to Approved after the review (user-approved); the receipt below stamps the file with that one-line change.
Prior verdict resolved: Yes
Findings:
- [RECOMMENDED] Detailed Design rule 12, Dependencies, AC17: the match-build hook is unnamed; Level State & Match Flow is not a declared dependency and does not name this GDD.
- [RECOMMENDED] Formulas, On a breach: the shipped fallback for a C4 breach does not say which kind is silenced, and silencing one kind can breach C4 again (beast soldier 1.31 against a silenced rider 1.25); no criterion.
- [RECOMMENDED] Formulas cost section, Cross-References edit 4, coverage check: four asks are listed, three are claimed checked by Currencies E3; E3 covers two, E2 the third, the fourth has no invariant.
- [RECOMMENDED] Dependencies, line 157: Currencies & Economy and Factions are Approved in the systems index, shown here as In Review / In Design.
- [RECOMMENDED] Registry: the card_power_gain expression lacks F2's strength 3 clause (request to the registry's session).
- [RECOMMENDED] Acceptance Criteria AC35: no device is named and [Performance] is not a defined tag.
- [RECOMMENDED] Cross-References: edits 5 (Stars & Rewards) and 8 (Rival AI) unsent; Currencies & Economy lines 212, 270, 329 and 332 still describe this GDD as in design and cards as stopping at U2 to U4.
Reviewed-Content-Hash: design/gdd/unit-cards-upgrades.md f9ba7e081e9b782b976748b1bb35a1eacf3acdcb
Reviewed-Content-Hash: design/registry/entities.yaml 2c845466a100cc35467ae5156055493f9a9b634f
Reviewed-Content-Hash: .claude/skills/design-review/SKILL.md c1afa55116b1c2f752e01f9d6deb637beae8e7a9
Reviewed-Content-Hash: design/gdd/unit-roster-stats.md 535aac955ca81c77e78e36ae99d5f89a9ba7d3fd
Reviewed-Content-Hash: design/gdd/troop-marching-clashes.md 0c3e54851a4da9ed59b5bb51815cde2a7a074b41
Reviewed-Content-Hash: design/gdd/currencies-economy.md e38470508fd57de5718c1e944e0e37698a761e2c
Reviewed-Content-Hash: design/gdd/faction-collection-unlocks.md 8653ccb3eac03d4196fe61d7d04a5ed1b1fd5d9e
Reviewed-Content-Hash: design/gdd/level-hud.md 51146090950bd16aa088d7e4e23ac14c8cf76b34
Reviewed-Content-Hash: design/gdd/rope-links.md 4d5f475dd6a00d149e9ce7cc4383c8749fe07999
Reviewed-Content-Hash: design/gdd/save-progress.md fb39f39f63d1004f1eeaa697f4784bb686bc1afb
Reviewed-Content-Hash: design/gdd/factions.md d028764ab3da2568fe469b7dcaaed798ac901cf6
Reviewed-Content-Hash: design/gdd/stars-rewards.md 06a5508c1b64e7f454d02e5f8330a8837889e930
Reviewed-Content-Hash: design/gdd/rival-ai.md a268b219681f1dd819a58406efd766d011efc2c8
Reviewed-Content-Hash: design/gdd/level-state-match-flow.md ddff5db2a4a6a372b09ea5763d6ac22d992e43b2
Reviewed-Content-Hash: design/gdd/troop-generation.md 72af1dc0428b02c63f64581a5493a96f5511376d
Reviewed-Content-Hash: design/gdd/game-concept.md 936cf985fc96e306679c0fef7894f898eb4f728c
