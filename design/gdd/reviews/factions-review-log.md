# Review Log: Factions

## Review — 2026-11-25 — Verdict: NEEDS REVISION
Review mode: lean · Workflow: standard
Scope signal: M
Specialists: none (lean mode)
Blocking items: 3 | Recommended: 8
Summary: First review. Every registry value and every worked number in F1, F2, the boundary findings and the criteria is correct, and the contracts with Unit Roster & Stats, Keep Levels, Troop Generation, Rival AI and Faction Collection & Unlocks agree. Blocking: the shipped-build repair for an unknown `unlock` value is undefined; Level HUD and Level State & Match Flow are missing from the bidirectional bookkeeping; four cross-document edits (Campaign Level Data's `rival_race` first) are still unapplied in the owning session's documents.
Prior verdict resolved: First review
Findings:
- [BLOCKING] Core Rules (rule 13b): an unknown `unlock` value has no usable shipped repair (losing the trait does not say whether the race is `starter` or `diamonds`); no edge case, no criterion
- [BLOCKING] Dependencies / Cross-References: the bidirectional check says Level HUD's edit is listed, but the edit list has none and level-hud.md never names a race; Level State & Match Flow builds the match (rule 9, AC15) and is in neither table
- [BLOCKING] Cross-References (edits 1, 2, 4, 9; other session's documents): campaign-level-data.md has no `rival_race` and its F3 and AC2 use baseline thresholds, so rule 8 and AC12, AC13, AC17 cannot be built; Keep Levels rule 10, Rope Links rule 14 and the registry entries also pending
- [RECOMMENDED] Formulas (T2, T3): the budget does not bound `d2`; level 2 at 6 troops and level 3 at 45 passes T1–T3 (22.5 s sooner for 2.5 s later); bound `d2` or make the F1 offset ranges hard limits
- [RECOMMENDED] Dependencies: stale statuses (Faction Collection & Unlocks and Unit Cards & Upgrades now have GDDs; Keep Levels and Rope Links are Approved in the index; header says In Design)
- [RECOMMENDED] States and Transitions: "Never returns to Locked" conflicts with Faction Collection & Unlocks' `delete_progress()`
- [RECOMMENDED] Core Rules (rule 13a): the source of the fallback human record when the data has none is unstated (rule 1 says never in code)
- [RECOMMENDED] Acceptance Criteria: no criterion for more than `races_max` races or for duplicate ids
- [RECOMMENDED] Acceptance Criteria (AC13): "reports the level-data error" does not say whether a development build stops
- [RECOMMENDED] Open Questions (6): answered by Currencies & Economy (beast 50 diamonds = one region); rule 11 should name Currencies & Economy as the price's owner
- [RECOMMENDED] Open Questions (5): no UAT-2 level has a beast rival, so AC17's beast case and "meet a race before you own it" have no shipped content
Reviewed-Content-Hash: design/gdd/factions.md a5ca37a5e4a07956ef1a724fb6c35b948e7a1f1e
Reviewed-Content-Hash: design/registry/entities.yaml 6995a374ebc48017e906c831e9fbfbf773eb9534
Reviewed-Content-Hash: .claude/skills/design-review/SKILL.md c1afa55116b1c2f752e01f9d6deb637beae8e7a9
Reviewed-Content-Hash: design/gdd/keep-levels.md ca5627285552fe1f9e7fff5d335e1633d53ce701
Reviewed-Content-Hash: design/gdd/troop-generation.md 72af1dc0428b02c63f64581a5493a96f5511376d
Reviewed-Content-Hash: design/gdd/unit-roster-stats.md 9f591b1a0f16083b201b06f96abacdf1c0a0a431
Reviewed-Content-Hash: design/gdd/campaign-level-data.md ec5408f1966c365ddc0248bbe7d7eb494068469f
Reviewed-Content-Hash: design/gdd/troop-marching-clashes.md 5125df2b81d39e9050271641516dc9c08a870de5
Reviewed-Content-Hash: design/gdd/rope-links.md fa596f387a0250b8699df3fa0f01d9fe84ca225f
Reviewed-Content-Hash: design/gdd/rival-ai.md a268b219681f1dd819a58406efd766d011efc2c8
Reviewed-Content-Hash: design/gdd/level-hud.md 07b2b18e2300946651f18b7a064a391e4d689ab7
Reviewed-Content-Hash: design/gdd/level-state-match-flow.md 9c2c805ed11f371f574f3f5a31113d76455417b6
Reviewed-Content-Hash: design/gdd/faction-collection-unlocks.md 6f55dc65520a5a844bcbb933bc2fb343029ecb9e
Reviewed-Content-Hash: design/gdd/currencies-economy.md d603aefc3883faf4d5681f74af80fb9023cd6ec7
Reviewed-Content-Hash: design/gdd/game-concept.md 936cf985fc96e306679c0fef7894f898eb4f728c

## Review — 2026-11-26 — Verdict: APPROVED
Review mode: lean · Workflow: standard
Scope signal: M
Specialists: none (lean mode)
Blocking items: 0 | Recommended: 5
Summary: Re-review after revision. All three prior blockers are resolved: the unknown-`unlock` repair is defined (rule 13, edge case, AC20), Level State & Match Flow and Level HUD are in the tables and the edit list, and the cross-document edits to Campaign Level Data, Keep Levels, Rope Links and the registry are applied. Every registry value and every worked number in F1, F2, T1–T3 and the criteria recomputes correctly. What remains is bookkeeping: Level HUD still does not name Factions, and the edit-list note and the status column are out of date.
Prior verdict resolved: Yes
Findings:
- [RECOMMENDED] Cross-References (edit 11): level-hud.md still does not name Factions or a race; the dependency is one-way until that session applies the edit
- [RECOMMENDED] Cross-References / Dependencies (l.233, l.186): the notes say edits 1, 2, 4, 9 and 10 are unapplied and that Campaign Level Data and Level State & Match Flow do not name Factions; all are applied, only edit 11 is open
- [RECOMMENDED] Dependencies: status column stale against the index (Troop Marching, Campaign Level Data, Faction Collection & Unlocks, Currencies & Economy, Unit Cards & Upgrades are Approved; Unit Roster & Stats and Level HUD are In Review)
- [RECOMMENDED] Acceptance Criteria (AC19): mixes screenshots of an undesigned screen with a logic test of the trait description; split the description-from-data half into its own Logic criterion
- [RECOMMENDED] Open Questions (5) / Game Feel: no UAT-2 level has a beast rival, so "meet a race before you own it" and AC17's beast case have no shipped content (carried from the first review)
Reviewed-Content-Hash: design/gdd/factions.md d028764ab3da2568fe469b7dcaaed798ac901cf6
Reviewed-Content-Hash: design/registry/entities.yaml 2c845466a100cc35467ae5156055493f9a9b634f
Reviewed-Content-Hash: .claude/skills/design-review/SKILL.md c1afa55116b1c2f752e01f9d6deb637beae8e7a9
Reviewed-Content-Hash: design/gdd/keep-levels.md a2d108347a1e51c7cc69b47bdbcdaa66f653f428
Reviewed-Content-Hash: design/gdd/troop-generation.md 72af1dc0428b02c63f64581a5493a96f5511376d
Reviewed-Content-Hash: design/gdd/unit-roster-stats.md 535aac955ca81c77e78e36ae99d5f89a9ba7d3fd
Reviewed-Content-Hash: design/gdd/campaign-level-data.md 4c2d423eb2fba16a27f05ccedd4972f27f76c570
Reviewed-Content-Hash: design/gdd/troop-marching-clashes.md 0c3e54851a4da9ed59b5bb51815cde2a7a074b41
Reviewed-Content-Hash: design/gdd/rope-links.md 4d5f475dd6a00d149e9ce7cc4383c8749fe07999
Reviewed-Content-Hash: design/gdd/rival-ai.md a268b219681f1dd819a58406efd766d011efc2c8
Reviewed-Content-Hash: design/gdd/level-hud.md 7d3709bc5a363e63ad5e751725769650928594bd
Reviewed-Content-Hash: design/gdd/level-state-match-flow.md ddff5db2a4a6a372b09ea5763d6ac22d992e43b2
Reviewed-Content-Hash: design/gdd/faction-collection-unlocks.md 8653ccb3eac03d4196fe61d7d04a5ed1b1fd5d9e
Reviewed-Content-Hash: design/gdd/currencies-economy.md e38470508fd57de5718c1e944e0e37698a761e2c
Reviewed-Content-Hash: design/gdd/unit-cards-upgrades.md f9ba7e081e9b782b976748b1bb35a1eacf3acdcb
Reviewed-Content-Hash: design/gdd/game-concept.md 936cf985fc96e306679c0fef7894f898eb4f728c
