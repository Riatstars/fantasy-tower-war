# Cross-GDD Review Report

Date: 2026-11-22
GDDs Reviewed: 13 of 13 present
Not read: none
Focus: full (consistency, design theory, cross-system scenarios)
Systems Covered: Troop Generation, Keep Levels, Rope Links, Troop Marching & Clashes, Rival AI, Level State & Match Flow, Campaign Level Data, Touch & Mouse Input, Level HUD, Screen Flow & Scene Manager, Menus & Screens, Save & Progress, World Map & Regions
Pillars: 1. One verb, many armies (ropes). 2. A tug-of-war you read at a glance. 3. Paint the map, grow the army. Anti-pillars are the pillar tests themselves (game-concept.md § Pillars).
Engine: Godot 4.7.2 (pinned 4.7)

## Method

The review ran in rounds. After each round both authoring sessions fixed what it found, the user made every design decision, and the next round re-checked a frozen snapshot.

| Round | Snapshot | Verdict | Blocking | Notes |
|---|---|---|---|---|
| 1 | commit 2381978 | FAIL | 11 (X1–X11) | All resolved by commit eb8df98, except X6 |
| 2 | eb8df98 + X6 option B | FAIL | 2 (B1 HUD timer vs Armed; Campaign Level Data F3 starting level) | About 30 warnings, H1–H7 |
| 3 | after round-2 fixes | FAIL | 2 (R3B1 World Map States table; R3B2 no delete caller) | 11 warnings |
| 4 | after round-3 fixes | CONCERNS | 0 | 4 warnings |
| 5 (final check) | after round-4 fixes | CONCERNS → resolved | 0 | 2 one-line warnings (W1, W2), fixed after the check |

Each round used parallel reviewers, which read the snapshot and edited nothing:
- Phase 2 (consistency), split into group A (the simulation core) and group B (input, presentation and meta);
- Phase 3 (design holism);
- Phase 4 (scenario walks).

Rounds 4 and 5 were verification and regression passes over the items from the round before. The phase reports are kept in the session scratchpad (`xreview2`–`xreview5`).

---

### Consistency Issues

#### Blocking
None open. All 15 blockers found across rounds 1–3 are resolved, with quoted evidence in the round reports.

#### Warnings
None open. Everything raised was fixed; the last two (W1 and W2) were fixed after the final check.

#### Info carried forward (not blocking architecture)
- The registry range `plaque_width` [38, 68] holds only at `digit_aspect` 0.48. Its comment says so.
- Menus & Screens never names `delete_progress()`. This is correct, since Screen Flow makes that call.
- Screen Flow rule 1:
  - R3-I6: a held message can show after step 0 of the next level.
  - R3-I10: Continue on a message box over a Level resumes the match directly.
- P4-I5: Godot's Android quit-on-back default is NOT SOURCEABLE from `docs/engine-reference/godot/`. Screen Flow reads the engine's back notification itself in UAT-1 (decision X10), so nothing depends on the default.

---

### Game Design Issues

#### Blocking
None. No anti-pillar violation was found in any round.

#### Warnings: accepted by the user and documented in the GDDs
- **Stall loophole** (R4H1, R4A3; Rival AI rule 8, Open Question 8). A player who gives up a keep after holding it at least 45 s and then retakes it, over and over, can hold the stall breaker low. The player gains nothing by it. To revisit after UAT-1.
- **Big rival keep slot lock** (R3H1; Rival AI Edge Cases, AC15). A rival keep of 48 or more troops can never be out-grown by 12 at `troop_cap` 60. The player pays one rope per locked rival rope.
- **Rival never feeds its own keeps to grow them** (H5; Rival AI rule 10, Open Question 7; Troop Generation I3). This is UAT-1's difficulty floor.
- **gv-05 attention load** (H7). About 5 active things at its peak. Measured by Rival AI AC23's readability question.
- **Best time is a record, not a reward** (H6; concept Pillar 3 note). The "More to come" mark and World Map AC16's "Would you play region 2?" stand in for the region-2 kill test.

#### Unmeasured
The concept AC (5 of 5 first-time testers win level 1 within 3 minutes) is feasible on paper and needs UAT-1 data.

---

### Cross-System Scenario Issues

Scenarios walked (rounds 2–4):
- S1: the deciding capture → result → Save → Win overlay → World Map conquest → fog clear → record → failed write.
- S2: same-step capture, level drop, cut, relay and rival pass.
- S3: level 1 opening, while Armed.
- S4: full stall under the hybrid rival rules.
- S5: a newer-version save → Delete progress; Back or background with a held message.

#### Blockers
None open. P4-B1 (round 2) is resolved.

#### Warnings
None open. P4-W1 to W4 and R3-W1 to W4 are resolved.

---

### Main design decisions made during the review (user, 2026-11-22)

- **Rival AI hybrid attack gate (X6, H1, H2, P4-W4).**
  - Outside a stall the rival plays the prototype's rule. `ai_min_send` and `cut_outgrown` are kept.
  - A stall gate `t.troops < (troop_cap + 1) × stall_share` reaches every player keep after 180 s without a resetting capture.
  - `cut_outgrown` is suspended while the stall gate holds, and never cuts a counter rope (R3A1).
  - A player keep that is both a counter and an attack target takes the higher score.
  - A re-capture within `stall_time` does not reset the breaker (R3H2).
  - The defend case requires threat ≥ `relieve_ratio` × troops, so there is no churn with relieved ropes (R3A5).
- **One blocking-keep rule** (H3): Rope Links `blocking_keep`, refusal `blocked`, shared by the player (Input redirects drags) and the rival.
- **Level HUD.**
  - The message timer counts unpaused rendered time, so messages shown while Armed expire (B1).
  - The strength bar counts keep troops only (H4).
  - One rule decides who owns each player-facing string (B3).
- **Level State.** While Armed, ties are checked on arrival. The first accepted tie starts step 0 and is applied as its phase 0; refused ties use up no step (A1).
- **Save & Progress.**
  - In UAT-1 the newer-version launch message carries Delete progress (B11).
  - Screen Flow calls `delete_progress()` through its one direction-rule exception (R3B2).
  - A refused write in a read-only session never raises "could not be saved" (R3-W3).
- **World Map.**
  - The conquest record is made after the region's fog clear, and the map-position write waits for Idle, so no write or message box happens during a sequence (P4-W3, R3-W2).
  - Regions 2–5 are Campaign Level Data records with no levels (B23).
  - "More to come" mark on fogged region 2 (H6).
- **Campaign Level Data.** Rival keeps with 15 or more troops start at keep level 2, as intended, with a balance note.

---

### GDDs Flagged for Revision

None for cross-document reasons. All 13 GDDs are **In Review** and still need a fresh-session `/design-review` each before they can be marked Approved. Keep Levels went from Approved back to In Review during round 2.

---

### Verdict: CONCERNS

No blocking issues remain, and no open consistency or scenario warnings. The warnings that remain are design trade-offs the user accepted, each documented in its GDD with an Open Question or playtest AC. The GDD set is consistent enough to begin architecture once the per-GDD `/design-review` re-reviews approve the 13 revised documents.
