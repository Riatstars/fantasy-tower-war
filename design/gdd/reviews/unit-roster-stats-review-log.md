# Review Log: Unit Roster & Stats

## Review — 2026-11-22 — Verdict: NEEDS REVISION
Review mode: lean · Workflow: standard
Scope signal: M
Specialists: none (lean mode; independent reviewer subagent with no view of the authoring session)
Blocking items: 4 | Recommended: 9
Summary: First review. Citations of other GDDs are accurate and U1, U3 and U5 are mutually consistent, but rule 5 carries a stale rider speed (154 vs 172), F2's band speed ranges are wrong at three edges, rule 6 overstates race parity, and the loader's validation order and fallbacks are undefined, which makes three criteria non-deterministic. Not verified: the tail of Campaign Level Data rule 8; Level HUD read by search only.
Prior verdict resolved: First review
Findings:
- [BLOCKING] Core Rules (rule 5): human rider speed 154 contradicts 172 in the roster, F1, AC3 and Game Feel
- [BLOCKING] Formulas (F2): the speeds each band allows are wrong at three edges (89, 139, 208 fall outside U1); legal ranges are 90–133 and 140–207
- [BLOCKING] Core Rules (rule 6): "every race has the same power at a given tier" is false against the ±10% band and the beast roster
- [BLOCKING] States / Edge Cases / Acceptance Criteria: validation order undefined (a value can break two rules; AC6, AC7, AC11 expect one); U5 re-check after a replacement and development behaviour on U5, U6 or band-table failure unstated; States table and edge case disagree on kind vs roster replacement
- [RECOMMENDED] Formulas (U2, U4): the speed floor and size cap hold only at baseline (keep_hit_radius 48 needs 55.9 px/s; pawn_min_spacing 23 breaks M3)
- [RECOMMENDED] Core Rules (rule 11): M3 also needs size_max; say whether speed_min is taken before or after fallback and card upgrades
- [RECOMMENDED] Core Rules (rule 4): id of human_t1 unclear (baseline_pawn or human_t1)
- [RECOMMENDED] Formulas (feedback loop): a level 1 counter-rope no longer cancels a level 3 rope; Troop Marching F7 and Rival AI w_counter affected
- [RECOMMENDED] Visual/Audio: art bible §3 conflicts (16 px width cap at sizes 1.15 and 1.3; summon length vs spacing at the speed floor; "the only rider"; owner marks are in §3)
- [RECOMMENDED] Game Feel: a summon with hp 1 looks the same as one with hp 2 (Pillar 2)
- [RECOMMENDED] Acceptance Criteria: missing criteria (no-race owner, missing roster, U5/U6 fallback, band-table reset, capture changing race, rule 12 freeze, U4 and U5 pass edges)
- [RECOMMENDED] Formulas: U5's ±5% and the U2–U4 bounds are not named data values; add a Tuning Knobs table
- [RECOMMENDED] Dependencies: Rope Links and Troop Generation omitted although their values are used
Reviewed-Content-Hash: design/gdd/unit-roster-stats.md 84c09943ecc3a9d7d8ea1af0661ae6d184eaabaf
Reviewed-Content-Hash: design/registry/entities.yaml a19fcda1e054a6f0e4795277b39ec26b0e43f77d
Reviewed-Content-Hash: .claude/skills/design-review/SKILL.md c1afa55116b1c2f752e01f9d6deb637beae8e7a9
Reviewed-Content-Hash: design/gdd/troop-marching-clashes.md 65c480aa9794cc82d3b527a66b2678b440c761da
Reviewed-Content-Hash: design/gdd/keep-levels.md 80e0caaefc76ea3a44a0f0fa158d7d7075a381b7
Reviewed-Content-Hash: design/gdd/campaign-level-data.md fcfd5fe6c825941bed921e5841d726da93dcfd01
Reviewed-Content-Hash: design/gdd/rival-ai.md 22d0ec71e940050715d785dcc7d8789d1556c8c0
Reviewed-Content-Hash: design/gdd/troop-generation.md 858089c744612ddd1c5f87a0c9fe13b058263f5f
Reviewed-Content-Hash: design/gdd/rope-links.md 5321180615344685ece5173c975bb8ab91380212
Reviewed-Content-Hash: design/gdd/game-concept.md 5f59d626512352792d034532184266656d283cde
Reviewed-Content-Hash: design/art/art-bible.md 4f1539e1dd7e942c345b39861830a39fe77ba283

## Revision — 2026-11-22 (after the first review, user-approved)
Status after revision: In Review (pending re-review by a fresh reviewer)
Addressed:
- [BLOCKING] Rule 5: human rider speed is 172 (was a stale 154)
- [BLOCKING] F2: band speed ranges corrected to 90–133, 140–207, 90–133 and 55–59; AC17 tests the lower edges
- [BLOCKING] Rule 6: races sit within the tier band; U5 keeps totals level
- [BLOCKING] Loader order: new rule 13 (table, human roster, then per race U6, per kind U2-U3-U4-U1, U5 after replacements; development lists every breach, shipped repairs and logs); States table, edge cases, AC6, AC7 and AC11 aligned
Not addressed (recommended): all nine items of the review above

## Review — 2026-11-22 — Verdict: NEEDS REVISION
Review mode: lean · Workflow: standard
Scope signal: M
Specialists: none (lean mode)
Blocking items: 4 | Recommended: 12
Summary: Second review. The first review's 4 blockers are fixed and every number in F1, F2, the rosters, U5 and the ACs recomputes correctly. Four new blockers in the loader/invariant contract: U3 tied strength to level_drop_margin, which Keep Levels allows at 0–20 and Factions may override; rule 13 left the dev-build U5 sum undefined (AC11's beast would also break U5); the human roster skipped U6; the longest-rope figure was stale against the registry. The 9 recommended items from the first review are still open.
Prior verdict resolved: Yes (all 4 prior blockers fixed)
Findings:
- [BLOCKING] Formulas (U3): strength ≤ level_drop_margin rejects every kind at margin 0 and every summon at margin 1 (legal Keep Levels values); whose margin applies under a Factions override is unstated
- [BLOCKING] Core Rules (rule 13): what U5 sums in a development build for a race with a failed kind is undefined; AC11's dev case depends on it
- [BLOCKING] Core Rules (rule 13): the human roster is never checked for U6; the missing-roster case is not placed in the order; human-roster failure wiping valid races is unexplained
- [BLOCKING] Core Rules (rule 11), Formulas (U2): "53.8 px/s on the longest legal rope" is stale; the registry's longest legal rope at baseline is 1,226 px (52.4), 1,258 is the safe upper bound
- [RECOMMENDED] The 9 items of the first review (U2/U4 baseline-only; rule 11 size_max and speed_min timing; human_t1 id; counter-rope damping; art bible §3 conflicts; summon hp readability; missing ACs; Tuning Knobs table; Rope Links and Troop Generation dependencies)
- [RECOMMENDED] Formulas (U2): Troop Marching's safe speed range 70–200 vs U2 55–220; the strength 3 summon is legal only at 55–59
- [RECOMMENDED] Formulas (F1): output range 0.71–4.24 holds only at speed_exponent 0.5 (0.50–6.0 over 0.3–1.0)
- [RECOMMENDED] Core Rules (rule 13): which band table the per-kind U1 checks use after the table fails in a development build (fixed in the revision below)
Receipt notes: the GDD is not stamped because it was revised after this review (below), so the next check runs a full review. troop-marching-clashes.md and campaign-level-data.md are stamped with their start-of-review hashes because session 7a's polish changeset changed them during this review; the next check will show them CHANGED.
Reviewed-Content-Hash: design/registry/entities.yaml 6995a374ebc48017e906c831e9fbfbf773eb9534
Reviewed-Content-Hash: .claude/skills/design-review/SKILL.md c1afa55116b1c2f752e01f9d6deb637beae8e7a9
Reviewed-Content-Hash: design/gdd/troop-marching-clashes.md 65c480aa9794cc82d3b527a66b2678b440c761da
Reviewed-Content-Hash: design/gdd/keep-levels.md 3a8db99c2a0e4beeb45f463e1eccaa83894817e3
Reviewed-Content-Hash: design/gdd/campaign-level-data.md fcfd5fe6c825941bed921e5841d726da93dcfd01
Reviewed-Content-Hash: design/gdd/rival-ai.md 22d0ec71e940050715d785dcc7d8789d1556c8c0
Reviewed-Content-Hash: design/gdd/troop-generation.md 858089c744612ddd1c5f87a0c9fe13b058263f5f
Reviewed-Content-Hash: design/gdd/level-hud.md ff427061e138356facdf2352b9db24c9b52ad674
Reviewed-Content-Hash: design/gdd/game-concept.md 5f59d626512352792d034532184266656d283cde
Reviewed-Content-Hash: design/art/art-bible.md 4f1539e1dd7e942c345b39861830a39fe77ba283

## Revision — 2026-11-22 (after the second review, user-approved)
Status after revision: In Review (pending re-review)
Decided (user): U3 decoupled from the margin (warning only); dev-build U5 sums with the human stand-in; human-roster failure keeps the all-races default-pawn fallback, now with its reason
Addressed:
- [BLOCKING] U3: whole 1 ≤ strength ≤ 3; a margin (base or Factions override) below the largest strength logs one warning, never rejects; new edge case; AC19
- [BLOCKING] Rule 13(e): U5 sums with the human kind of the tier standing in for each failed kind, in either build; AC11 dev case names only U2
- [BLOCKING] Rule 13(b), (c): human roster checked for U6; a race id with no roster fails U6; human failure → default pawn for every race, reason stated; States row and edge case aligned; AC18
- [BLOCKING] Rule 11, U2: 53.8 px/s at the 1,258 px safe upper bound; 52.4 at the 1,226 px longest legal rope
- [RECOMMENDED] Rule 13(a): a failed band table is replaced by the baseline for every later check, in either build
Not addressed (recommended): the other 11 items above

## Review — 2026-11-25 — Verdict: NEEDS REVISION
Review mode: lean · Workflow: standard
Scope signal: M
Specialists: none (lean mode)
Blocking items: 1 | Recommended: 6
Summary: Third review. The second review's 4 blockers are fixed, every number in F1, F2, the rosters, U2, U4, U5, Game Feel and the criteria recomputes correctly, and no borrowed value conflicts with the registry or the owning GDDs. One blocker: AC13 asked for a full level 1 keep, which Keep Levels makes impossible at baseline (60 troops is level 3). Most earlier recommendations are still open.
Prior verdict resolved: Yes (all 4 prior blockers fixed)
Findings:
- [BLOCKING] Acceptance Criteria (AC13): "relayed by a full level 1 keep" cannot be set up; the case to test is a tier 1 or 2 pawn relayed by a full level 3 keep keeping its kind
- [RECOMMENDED] Acceptance Criteria (AC12): the target keep's troop count is missing from the GIVEN (at 0 troops the pawn captures)
- [RECOMMENDED] Core Rules (rule 13): in a development build with a failed human kind, which human total other races' U5 is measured against is unstated
- [RECOMMENDED] Core Rules (rule 13): whether a replaced kind keeps its own id or takes the human one (Level HUD picks the sprite by id)
- [RECOMMENDED] Cross-References: no edit listed for Level HUD (does not name this GDD); Keep Levels, Rival AI, Troop Generation and Troop Marching still call this GDD not yet designed
- [RECOMMENDED] Visual/Audio, Edge Cases: helm shapes and banner cuts are art bible §3, not §4; §3 "the only rider" at 16 px across against a 1.15 rider
- [RECOMMENDED] Still open from earlier reviews: U2/U4 baseline-only; speed_min timing; human_t1 id; counter-rope damping wording; summon hp readability; missing ACs (rule 12, no-race owner, missing roster, band-table reset); Tuning Knobs table; Rope Links and Troop Generation in Dependencies; F1 output range at other exponents
Reviewed-Content-Hash: design/gdd/unit-roster-stats.md c5187fda98010118cbce1a69bc8b8bfd7fe9b2c8
Reviewed-Content-Hash: design/registry/entities.yaml 6995a374ebc48017e906c831e9fbfbf773eb9534
Reviewed-Content-Hash: .claude/skills/design-review/SKILL.md c1afa55116b1c2f752e01f9d6deb637beae8e7a9
Reviewed-Content-Hash: design/gdd/troop-marching-clashes.md 8e0a1867f5c6f0121e28ced14984bc6bde17ff92
Reviewed-Content-Hash: design/gdd/keep-levels.md 4f09eb966d57b3b1b38e27b6a74c880e6965c817
Reviewed-Content-Hash: design/gdd/campaign-level-data.md 90268b88ad2ebcc2877deb4aa76f784c8f895ee3
Reviewed-Content-Hash: design/gdd/rival-ai.md 320de4b614d7f833e55565c0467fd2ed4b646b8c
Reviewed-Content-Hash: design/gdd/troop-generation.md 5cef0e5f4732081ae847fb42c1244e29a525c275
Reviewed-Content-Hash: design/gdd/rope-links.md ac2e00c8c6b268c42d53274342a1a4d5ada7eb4e
Reviewed-Content-Hash: design/gdd/level-hud.md ff427061e138356facdf2352b9db24c9b52ad674
Reviewed-Content-Hash: design/gdd/game-concept.md 5f59d626512352792d034532184266656d283cde
Reviewed-Content-Hash: design/art/art-bible.md 4f1539e1dd7e942c345b39861830a39fe77ba283

## Revision — 2026-11-25 (after the third review, user-approved)
Status after revision: In Review (pending re-review)
Addressed:
- [BLOCKING] AC13: a human_t1 pawn (and a human_t2 pawn) relayed by a full level 3 keep keeps its kind, speed and hp
Not addressed (recommended): the 6 items above

## Review — 2026-11-25 — Verdict: APPROVED
Review mode: lean · Workflow: standard
Scope signal: M
Specialists: none (lean mode)
Blocking items: 0 | Recommended: 8
Summary: Fourth review, run in full. The third review's blocker is fixed: AC13 now uses a full 60-troop keep, which is level 3 and relays. Every number in F1, F2, the rosters, U2, U4, U5, Game Feel and the criteria recomputes correctly, and no borrowed value conflicts with the registry or the owning GDDs (/consistency-check on this GDD the same day: PASS, 0 conflicts). Most earlier recommendations are still open.
Prior verdict resolved: Yes (the 1 prior blocker fixed)
Findings:
- [RECOMMENDED] Acceptance Criteria (AC13): say the relaying keep holds an outgoing rope; without one the pawn is lost (no_rope, Rope Links rule 10)
- [RECOMMENDED] Acceptance Criteria (AC12): the target keep's troop count is missing from the GIVEN (at 0 troops the summon captures)
- [RECOMMENDED] Formulas (F2): band_width 0–0.11 is the table's range; the shipped rosters validate only at about 0.096–0.11 (beast_t1 needs 0.0954; at 0 the human rider, 1.2504, fails and every race falls to the default pawn); band_width below 0 is not checked
- [RECOMMENDED] Dependencies: Troop Marching, Keep Levels and Campaign Level Data listed as Approved; the systems index had them In Review at review time
- [RECOMMENDED] Cross-References: "none applied yet" is stale (item 6, index row 21, is done); no edit listed for Level HUD
- [RECOMMENDED] Visual/Audio: art bible §3 gives the rider and the summon 16 px across, so size 1.15 and 1.3 give 18.4 and 20.8 px against the 16 px cap (Open Question 3, to close before /asset-spec); helm shapes and banner cuts are §3, not §4
- [RECOMMENDED] Core Rules (rule 13): which human total other races' U5 uses in a development build with a failed human kind; whether a replaced kind keeps its own id
- [RECOMMENDED] Still open from earlier reviews: U2/U4 baseline-only; U2 55–220 vs Troop Marching's safe 70–200; speed_min timing; human_t1 id; counter-rope damping wording; summon hp readability; missing ACs (rule 12, no-race owner, missing roster, band-table reset, capture changing race); Tuning Knobs table; Rope Links and Troop Generation in Dependencies; F1 output range at other exponents
Receipt notes: the GDD is stamped after one change made on approval, the header Status line (In Review → Approved); nothing else changed after the review. level-hud.md is stamped after the over_origin edit (rule 8, Touch & Mouse Input row, AC12) applied the same day at session 7a's request; the review read only its pawns() lines. Session 7a's commit c9f76be may have changed its GDDs after this review read them.
Reviewed-Content-Hash: design/gdd/unit-roster-stats.md 85f86e8d1e0c7560dbfdfa607d506e2a920b3316
Reviewed-Content-Hash: design/registry/entities.yaml 6995a374ebc48017e906c831e9fbfbf773eb9534
Reviewed-Content-Hash: .claude/skills/design-review/SKILL.md c1afa55116b1c2f752e01f9d6deb637beae8e7a9
Reviewed-Content-Hash: design/gdd/troop-marching-clashes.md 5125df2b81d39e9050271641516dc9c08a870de5
Reviewed-Content-Hash: design/gdd/keep-levels.md ca5627285552fe1f9e7fff5d335e1633d53ce701
Reviewed-Content-Hash: design/gdd/campaign-level-data.md ec5408f1966c365ddc0248bbe7d7eb494068469f
Reviewed-Content-Hash: design/gdd/rival-ai.md 320de4b614d7f833e55565c0467fd2ed4b646b8c
Reviewed-Content-Hash: design/gdd/troop-generation.md 5cef0e5f4732081ae847fb42c1244e29a525c275
Reviewed-Content-Hash: design/gdd/rope-links.md fa596f387a0250b8699df3fa0f01d9fe84ca225f
Reviewed-Content-Hash: design/gdd/level-hud.md 07b2b18e2300946651f18b7a064a391e4d689ab7
Reviewed-Content-Hash: design/gdd/game-concept.md 5f59d626512352792d034532184266656d283cde
Reviewed-Content-Hash: design/art/art-bible.md 4f1539e1dd7e942c345b39861830a39fe77ba283
