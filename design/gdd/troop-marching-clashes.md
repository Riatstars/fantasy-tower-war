# Troop Marching & Clashes

> **Status**: Designed (pending /design-review)
> **Author**: user + Claude
> **Last Updated**: 2026-11-22
> **Last Verified**: 2026-11-22
> **Creative Director Review (CD-GDD-ALIGN)**: skipped — Lean mode
> **Implements Pillar**: 2. A tug-of-war you read at a glance (`design/gdd/game-concept.md` § Pillars)

## Summary

Troop Marching & Clashes is what happens to a pawn after a rope launches it: it walks the straight line to its target at 110 px/s, dies together with any opposing pawn it meets coming the other way between the same two keeps, and on arrival adds one troop to an allied keep, removes one from an enemy or neutral keep, or takes a keep that has no troop left to lose (a keep with T troops falls to pawn T+1). It hands allied pawns that reach a full keep back to Rope Links for relay (at most 6 times per pawn), reports every capture, and defines the `UnitStats` contract (speed, strength, size) that Unit Roster fills in later.

> **Quick reference** — Layer: `Core` · Priority: `MVP` · Key deps: `Rope Links, Troop Generation (hard); Keep Levels (soft at MVP, hard from Alpha); Unit Roster & Stats (contract, Alpha)`

## Overview

Troop Marching & Clashes is everything between a rope sending a pawn and a keep changing. The
pawn walks the straight line from its origin keep to its target keep. If an opposing pawn is
walking the other way between the same two keeps, the two meet and both fall, which turns two
keeps roping each other into a visible front line. A pawn that gets through acts once on
arrival: it joins an allied keep, wears down an enemy or neutral keep, or takes a keep with
nothing left to lose. The player never touches a pawn; ropes decide where pawns go and this
system makes the result readable and exact.

It owns the pawn from launch to its end (movement, clashes, arrival order, capture, `UnitStats`),
not launches or relay choice (Rope Links), the troop count (Troop Generation), levels (Keep
Levels), the result (Level State & Match Flow) or drawing (Level HUD, Feedback & Juice).

**What the player should feel.** Command at a glance: "my line is pushing theirs back". Where
two streams meet, the position of the scuffle shows who is winning without a number. The big
beat is the capture: the count ticks to zero, one more pawn walks in, the keep flips with a
banner pop. It serves Challenge and Sensation (MDA) and is the match's Competence feedback
(Self-Determination Theory): it is where the player sees why a rope worked.

## Detailed Design

### Core Rules

`game-designer` drafted the rules and `systems-designer` the formulas; merged. `ai-programmer`, `gameplay-programmer` and `art-director` not consulted — Lean mode. Review manually before production.

1. **A pawn exists from launch to its end.** Rope Links launches it (`pawn_launched(origin, target, owner, lane)`, at every send and relay); from then on it belongs to this system whatever happens to its rope or origin. It carries `seq` (launch sequence number), `owner`, `origin`, `target`, `lane`, a copy of its unit's stats, `hp` (remaining strength), `marches` and `relays`.
2. **The owner is fixed at launch.** Friend or enemy of the target is decided only on arrival, against the target's owner at that moment.
3. **The unit is chosen at launch**: `unit_for(owner, origin.level)` from Unit Roster & Stats (MVP: always the baseline unit). Stats are copied at launch; later changes to the keep or the data do not alter a pawn in flight. A relayed pawn keeps its unit, `hp` and `relays` (default, pending OQ 3).
4. **Marching.** Each step every pawn in flight gains one march of `speed × step_dt` along the straight line between the keep centres (F1). The lane only shifts where it is drawn (F2). Pawns never stop, turn back, retarget or block each other; a faster pawn passes a slower one.
5. **A cut rope does not recall its pawns** (Rope Links' Core Rule 8, the player's rule). They march on and act at the target.
6. **Clashes** (the player's rule). Two pawns clash when they have different owners, march between the same two keeps in opposite directions, and have met: `d_p + d_q ≥ L` (the prototype's test). Lanes are ignored.
7. **A clash costs both sides equally**: each loses `min(hp_p, hp_q)`; a pawn at 0 falls on that step (default, pending OQ 1). At strength 1 both fall, as in the prototype. A survivor marches on and may clash again on the same step.
8. **Clash order is fixed** (F4): lead pawn against lead pawn per keep pair and pair of opposing owners. The result never depends on storage order.
9. **Nothing else clashes**: not pawns marching the same direction, not pawns on different keep pairs whose paths cross, not pawns of one owner.
10. **Arrival.** A pawn arrives on the step `marches = arrive_marches`, after that step's clashes (a fallen pawn does not arrive), and acts once (F5, F6):
    - **Allied keep with room**: the keep gains `min(hp, room)`; strength that does not fit is discarded.
    - **Allied keep, full** (`troops ≥ troop_cap`): no change; `ally_arrived_full(keep, pawn)` is raised for Rope Links to relay or lose it, unless rule 13 loses it first.
    - **Enemy or neutral keep, `hp ≤ troops`**: the keep loses `hp` and keeps its owner, even at exactly 0.
    - **Enemy or neutral keep, `hp > troops`**: captured (rule 12). At strength 1: a pawn arriving at 0 troops.
11. **Arrival order: the keep's own side first** (the user's decision). Arrivals are processed keep by keep in ascending keep id. At each keep, pawns of the keep's owner at the start of the arrival phase resolve first, then all others, each group in ascending `seq`. Each pawn is resolved against the keep as the previous one left it: after a capture, later arrivals at that keep in the same step meet the new owner (the grouping is not redone). Troop Generation's beat has already resolved.
12. **Capture.** Owner becomes the pawn's owner; `troops` becomes `capture_troops` (1); surplus strength is discarded (the user's decision). `keep_captured(keep, old_owner, new_owner)` is raised, and within the same step Troop Generation resets the timer, Keep Levels resets the level to 1 and Rope Links cuts the keep's outgoing ropes (reason `capture`); ropes into it stay. A captured keep is never neutral again.
13. **Relay limit** (the user's decision; amends Rope Links' Core Rule 10). An allied pawn arriving at a full keep with `relays ≥ relay_hops_max` (6) is lost (`pawn_lost`, reason `hops`). As a safety net, one arriving while the table holds `pawns_in_flight_max` pawns is lost (reason `backstop`) and logged as a defect. Rope sends are never refused by this system.
14. **The only changes this system makes to a keep** are those of rules 10 and 12. It never changes a level, rope or timer directly and never launches a pawn.
15. **Reads for other systems.** Queries: `pawns_in_flight(owner)`, `marching_strength(owner)` (sum of `hp`), `incoming(keep, owner)` (sum of `hp` heading for the keep), `pawns()` (position, lane, owner, unit). Events: `pawn_clashed(position, pawn_a, pawn_b, loss)`, `keep_reinforced(keep, amount)`, `keep_hit(keep, amount, attacker)`, `keep_captured(keep, old_owner, new_owner)`, `ally_arrived_full(keep, pawn)`, `pawn_lost(keep, pawn, reason: hops | backstop)`.
16. **The `UnitStats` contract.** One record per unit kind; this system reads nothing else about a unit.

    | Field | Type | Default (baseline pawn) | Hard range | Meaning |
    |---|---|---|---|---|
    | `id` | StringName | `baseline_pawn` | non-empty, unique | Unit type key |
    | `speed` | float, px/s | 110 (`pawn_speed`) | 30–400 | March speed |
    | `strength` | int | 1 | 1–`troop_cap` | Troops the pawn is worth in a clash and on arrival; whole, so no rounding rule |
    | `size` | float | 1.0 | 0.5–2.0 | Drawing scale and footprint (M3); no combat effect (default, pending OQ 2) |

    Defaults give the prototype pawn. Unit Roster, Unit Cards & Upgrades and Factions change values, never rules, for later launches; new fields may be added, these keep their meaning.
17. **Time and determinism.** Fixed steps only (a paused game moves no pawn), in the phase order under Formulas. No randomness.
18. **Both sides, one rule.** The rival's pawns follow rules 1–17. A neutral keep is an enemy to both sides and launches nothing.
19. **Data.** Every value under Tuning knobs is a data-file value. God & Goddess Powers (Alpha) act on pawns only through hooks added here (none at MVP).

**Departures from the prototype** (`prototypes/tower-war/index.html`): arrival order (rule 11, was launch order); lead-against-lead clashes (was all pairs; same result at one speed); lanes frozen at launch (were per frame); relay limit (rule 13; rings grew without limit); no random hit dust; `UnitStats`.

### States and Transitions

| State | Meaning | In rules and queries? | Leaves when |
|-------|---------|-----------------------|-------------|
| Marching | Launched; walking the line | Yes | `hp` 0 in a clash → Fallen; arrives → Arrived |
| Fallen | Lost a clash; drawn fading for `pawn_fade_time` | No | Time elapses → Gone |
| Arrived | Resolved on that step (outcomes: rule 10; events: rule 15) | No | Same step → Gone |

A relay is a new launch by Rope Links carrying the pawn's unit, `hp` and `relays + 1`, with a new `seq`, origin, target and lane.

### Interactions with Other Systems

| System | Direction | Data | Interface owner |
|--------|-----------|------|-----------------|
| Rope Links | in/out | In: `pawn_launched`. Out: `ally_arrived_full` (origin, unit, `hp`, `relays`), `keep_captured`, `pawn_speed` for its F5 and R3 | Rope Links launches and picks the relay rope; this system moves, fights, delivers, limits relays |
| Troop Generation | out | Changes `troops` by rules 10 and 12; reads `troops`, `troop_cap`, `owner`; `keep_captured` resets its timer | Troop Generation owns the count |
| Keep Levels | out/in | Out: `keep_captured` (level reset). In (Alpha): origin `level` at launch | Keep Levels |
| Level State & Match Flow | out | `keep_captured`; `pawns_in_flight(owner)` for the loss rule | Level State (and pawns after a result, OQ 8) |
| Rival AI | out | `incoming`, `pawns_in_flight`, `marching_strength`; capture and hit events | This system (read-only) |
| Level HUD | out | `pawns()`; `marching_strength(owner)` for the strength bar | Level HUD draws |
| Feedback & Juice, Tutorial & Onboarding | out | Clash, hit, reinforce and capture events; the player's first capture | This system raises |
| Unit Roster & Stats, Factions, Unit Cards & Upgrades (Alpha) | in | `UnitStats` records, `unit_for`, inside M1–M7 | Contract here, values there |
| Campaign Level Data | out | Must check M2 per level; "T troops falls to pawn T+1"; travel time (F1) | Campaign Level Data checks |

God & Goddess Powers (Alpha) reach pawns only through hooks added here (rule 19). Pawns cannot be touched (Touch & Mouse Input).

## Formulas

`systems-designer` authored. Numbers are hand-computed from the formulas; AC-M32 was checked by the orchestrator's step simulation; AC-M29 is still a hand estimate.

### Per-step order (fixed step, `step_dt` = 1/60 s)

| # | Phase | Owner |
|---|---|---|
| 1 | Generation beats | Troop Generation |
| 1b | Rival decision pass, when its think timer fires (cuts, then ties; added 2026-11-22) | Rival AI |
| 2 | Rope timers, sends, then cuts requested this step; a launched pawn has `marches` 0 | Rope Links |
| 3 | **March**: every pawn in flight, including those launched in phase 2, gains one march (F1) | this GDD |
| 4 | **Clashes** (F4); a clash beats an arrival on the same step | this GDD |
| 5 | **Arrivals** (rule 11): keep by keep in ascending keep id; own side first, then the rest, each in ascending `seq`; each fully resolved (troops, capture and its same-step consequences, relay request) before the next. A relayed pawn has `marches` 0 and first marches next step | this GDD |
| 6 | Level recompute, `level_dropped` cuts | Keep Levels, Rope Links |
| 7 | Win and loss test | Level State & Match Flow |

`seq` is one match-wide counter raised at every launch and relay. Lead pawn: largest `d`, ties by lower `seq`. Keep pairs are processed in ascending (lower id, higher id).

**Worked example (arrival order).** Rival keep K has 0 troops. Arriving in one step: player pawns `seq` 3, 4, 6 and a rival pawn `seq` 9. The rival pawn goes first (K's own side): 1 troop. `seq` 3 hits: 0. `seq` 4 captures: K is the player's with 1 troop. `seq` 6 now meets its own side: 2 troops. In the prototype's launch order K would have been captured by `seq` 3.

### F1. March distance and travel time

The march formula is defined as:

`d = marches × speed × step_dt`; `arrive_marches = max(1, ceil(L / (speed × step_dt) − ε))`; the pawn arrives when `marches = arrive_marches`.

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| marches | int | 0–`arrive_marches` | calculated | March phases since launch or relay |
| speed | float, px/s | 30–400 (baseline 110) | data file (`UnitStats.speed`) | Copied at launch |
| step_dt | float, s | 1/60 | constant | The fixed step |
| L | float, px | 156–1,470 | calculated | Centre-to-centre distance; minimum is twice `keep_hit_radius`, maximum the table diagonal. The lane does not change it |
| ε | float | 0.000001 | constant | Guards the ceiling against float noise |

**Output Range:** 86 to 802 marches at baseline (1.43 s to 13.37 s); 24 to 2,940 over the hard ranges. Fixed at launch, so no float drift; M1 and `max(1, …)` remove the zero cases.
**Example:** L 300: 300 / 1.8333 = 163.6 → 164 marches = 2.73 s; launched on step 600, it arrives on step 763.

### F2. Pawn position

The pawn_position formula is defined as:

`pos = origin_pos + (target_pos − origin_pos) × min(1, d / L) + lane`

`lane` is the Vector2 offset from Rope Links F4 (length 0 or `rope_lane`, 8 px), frozen at launch; other variables as F1.

**Output Range:** a point on the offset segment; the clamp absorbs the last march's overshoot (up to 1.83 px at baseline).
**Example:** origin (360, 1060), target (360, 760), lane (8, 0), d 150.33: (368, 909.67).

### F3. Spacing between sent pawns

The pawn_spacing formula is defined as:

`spacing = speed × send_interval` (`send_interval` 0.3–2 s, baseline 0.6, data file, owned by Rope Links)

**Output Range:** 66 px at baseline; 9 to 800 px over the hard ranges (M3 rejects overlap). Relayed pawns and mixed speeds do not keep the spacing.
**Example:** a 300 px rope shows 4 or 5 sent pawns.

### F4. Clash resolution

A matchup is owner X's pawns marching A→B against a different owner Y's marching B→A. The clash_resolution formula is defined as, for the lead pawns `p`, `q`, repeated while it holds:

`if d_p + d_q ≥ L: loss = min(hp_p, hp_q); hp_p −= loss; hp_q −= loss`; pawns at `hp` 0 are removed and `pawn_clashed` is raised at the midpoint of their F2 positions.

**Variables:** `d_p`, `d_q` (float, px, 0–L plus one march, F1); `L` (as F1); `hp` (int, 1–`strength`, calculated); `loss` (int, ≥ 1, calculated).

**Output Range:** each clash removes at least one pawn and `2 × loss` strength, equal from each side; the loop ends within the pawn count. Testing the sum means pawns cannot step past each other at any speed. `strength` 0 would never end (M4).
**Example:** L 300, both launched on the same step: the test first holds at 82 marches (81 gives 297.0), each at 150.33 px, 1.37 s; both die.

### F5. Arrival at an enemy or neutral keep

The enemy_arrival formula is defined as:

`if hp ≤ troops: troops_after = troops − hp`; `else: owner_after = pawn.owner, troops_after = capture_troops` (surplus discarded)

**Variables:** `hp` (int, 1–`strength`); `troops` (int, 0–`troop_cap`, Troop Generation); `capture_troops` (int, 1–`lv2_at` − 1, baseline 1, data file).

**Output Range:** 0 to `troops − 1` without capture, `capture_troops` with; never negative. `pawns_to_capture = floor(troops / strength) + 1` (Troop Generation F4's `troops + 1`).
**Example:** neutral keep, 3 troops: 2, 1, 0, still neutral; the 4th pawn captures it, `troops` 1.

### F6. Arrival at an allied keep

The allied_arrival formula is defined as:

`room = max(0, troop_cap − troops)`; `if room > 0: troops_after = troops + min(hp, room)` (remainder discarded); `if room = 0: troops unchanged, F9 decides`

**Output Range:** `troops + 1` to `troop_cap`. A keep above the cap (Troop Generation's cap-offset case) has `room` 0 and counts as full.
**Example:** keep at 59 → 60; keep at 60 → unchanged, `ally_arrived_full`.

### F7. Front pressure (balance check, expected value)

The front_pressure formula is defined as:

`Φ(A→B) = Σ over streams A→B of strength × pawns per second`; `net_arrival(A→B) = max(0, Φ(A→B) − Φ(B→A))`

One rope's stream is `strength / send_interval` (1.67 at baseline); each relayed stream adds its own rate.

**Output Range:** 0 upward. Two facing ropes: net 0. Only the directly opposing rope cancels; a second attacker from another keep is not slowed.
**Example:** B is level 3 (1.2/s) and ropes back at A. A alone: 0 reaches B. A plus one relayed stream: 1.67 reaches B, so B loses 0.47/s.

### F8. Sent pawns on one rope

The sent_on_rope formula is defined as:

`sent_on_rope ≤ ceil(L / (speed_min × send_interval)) + 1`

Rope Links F5 with `speed_min` (slowest unit the level can launch) for `pawn_speed`. It bounds sent pawns only; a rope fed by `k` relayed streams carries up to `(1 + k)×`.
**Example:** diagonal at baseline: 23.

### F9. Relay limit and total pawns in flight

The relay_limit formula is defined as, for an allied pawn at a full keep:

`if relays ≥ relay_hops_max: lost (hops)`; `else if pawns_in_flight ≥ pawns_in_flight_max: lost (backstop), logged`; `else: ally_arrived_full; on relay, relays += 1`

`pawns_total ≤ min(B_send × (1 + relay_hops_max), pawns_in_flight_max + B_send)`, `B_send = Σ F8 over the level's ropes`; ring steady state `≈ n_ropes × (1 + relay_hops_max) × travel_time / send_interval`.

**Variables:** `relays` (int, 0–`relay_hops_max`); `relay_hops_max` (int, 1–20, baseline 6, data file); `pawns_in_flight_max` (int, 200–2,000, baseline 600, data file); `B_send` (int, up to ~1,035).

**Output Range:** without it a 3-keep full ring gains 5 pawns per second for ever. With it a pawn lives at most 7 legs; a chain needs 7 full keeps in a row before rear pawns are lost.
**Example:** 3-keep ring of 260 px ropes: 3 × 7 × 2.367 / 0.6 ≈ 83 pawns; 5-keep ring of 600 px ropes ≈ 319.

**Step cost:** linear in pawns (group by keep pair, direction, owner; order by `d`); no all-pairs loop. Budget in AC-M43.

### Invariants (checked when the data is loaded; the loader reports a breach)

- **M1.** `30 ≤ speed ≤ 400` (no division by zero; shortest rope takes ≥ 0.39 s).
- **M2.** Per level: `ceil(longest_rope / (speed_min × send_interval)) + 1 ≤ pawns_per_rope_max` (40). Baseline 23; needs `speed_min` ≥ 62.8 on the diagonal.
- **M3.** `speed_min × send_interval ≥ pawn_min_spacing × size_max`. Baseline 66 ≥ 20.
- **M4.** `strength` whole, `1 ≤ strength ≤ troop_cap`; with Troop Generation I3, one rope still wears any keep down.
- **M5.** `relay_hops_max ≥ 1`; `pawns_in_flight_max ≥ 200`.
- **M6.** `1 ≤ capture_troops < lv2_at` (0 gives endless flipping; `lv2_at` gives a drop and rise back to back).
- **M7.** `0.5 ≤ size ≤ 2.0`.

**Boundary findings:** `speed` 400 crosses the shortest rope in 0.40 s; `strength` 5 can drop a level in one arrival (note for Unit Roster); `relay_hops_max` 20 on a 5-keep 600 px ring ≈ 957 pawns, so the backstop acts.

### Feedback loop

A counter-rope cancels one stream point for point (F7), damping free sending's snowball; a second stream (more keeps held) breaks it, as intended. A captured keep holds 1 troop and can flip back after 2 pawns (OQ 4). Strength (Alpha) multiplies pressure; Unit Roster must price it.

### Tuning knobs

All are data-file values; the file layout is an ADR.

| Knob | Category | Default | Safe range | Hard range | Too low / too high |
|---|---|---|---|---|---|
| `UnitStats.speed` (`pawn_speed`) | Feel | 110 px/s | 70–200 | 30–400 (M1) | Map feels dead, M2 refuses long ropes / no time to react |
| `UnitStats.strength` | Curve | 1 | 1–3 | 1–`troop_cap` (M4) | — / one pawn swings a level |
| `UnitStats.size` | Feel | 1.0 | 0.8–1.5 | 0.5–2.0 (M7) | Unreadable / overlap |
| `capture_troops` | Curve | 1 | 1–3 | 1–`lv2_at` − 1 (M6) | — / hard to retake |
| `relay_hops_max` | Gate | 6 | 4–10 | 1–20 (M5) | Chains lose pawns early / rings near the backstop |
| `pawns_in_flight_max` | Gate | 600 (to confirm on the phone) | 400–1,000 | 200–2,000 (M5) | Legitimate relays lost / frame time |
| `pawn_min_spacing` | Feel | 20 px (provisional) | 16–32 | 8–66 | Overlap passes M3 / refuses normal pairs |
| `pawn_fade_time` | Feel | 0.9 s | art pass | > 0 | Clash not read / clutter |
| `march_tick_interval` | Feel | 0.45 s | audio pass | > 0 | Buzz / empty |
| `arrival_flash_time` | Feel | 0.6 s | art pass | ≥ 0 | Hits unseen / constant flashing |

Constants: `step_dt`, `ε`. Owned elsewhere, not duplicated: `send_interval`, `rope_lane`, `pawns_per_rope_max` (Rope Links); `troop_cap`, `gen_interval` (Troop Generation); `lv2_at`, `lv3_at`, `level_drop_margin` (Keep Levels); `keep_hit_radius` (Touch & Mouse Input).

## Edge Cases

- **If the origin is captured, or the target changes owner, while pawns march**: rule 2 (owner fixed at launch, judged on arrival).
- **If unit data changes mid-match**: rule 3; pawns in flight keep their stats, so a power that slows marching pawns needs a new hook (rule 19).
- **If two allied keeps rope each other both ways** (Rope Links' capture-born case): their pawns pass through each other.
- **If three or more pawns meet on one step**: leads are tested in turn; at strength 1 two fall and the third marches on.
- **If a pawn is due to arrive and the target launches a pawn back on that step**: they clash at the gate and both fall; the keep is untouched (prototype behaviour, OQ 5).
- **If an opposite rope is tied while pawns march**: earlier pawns stay on the centre line and still clash (OQ 6).
- **If pawns of both sides arrive at one keep on one step**: rule 11. A keep at 0 troops receiving one allied and one enemy pawn ends at 0 and is not captured, whatever their `seq`.
- **If the player's and the rival's pawns arrive on one step at a neutral keep with 0 troops**: neither is its side; the lower `seq` captures, the other hits, leaving it the first's with 0 troops.
- **If a keep is captured while the old owner's reinforcements still march to it**: they now hit it; the second recaptures (1 troop after capture). Intended tug-of-war; each flip cuts the keep's ropes again.
- **If an allied pawn arrives at a full keep with no Active rope**: `ally_arrived_full` is raised; Rope Links loses it.
- **If a pawn at the relay limit arrives at a keep with room**: it is absorbed; the limit matters only at a full keep.
- **If the player's last keep falls with pawns still marching**: no loss yet (`pawns_in_flight` > 0); a later capture keeps the player in.
- **If hits take a keep below its drop point, or a capture and a threshold coincide**: this system only changes `troops`; Keep Levels recomputes once at end of step; capture wins.
- **If equal streams face each other**: a stand-off by design (F7, Feedback loop; OQ 4). Roping back defends but spends a slot.
- **If data breaches M1–M7, or `unit_for` returns nothing**: development builds stop naming the invariant and value; shipped builds clamp (or use the baseline unit) and log. A level breaching M2 does not load.

**Owned by other GDDs:** unit kinds per race and level (Unit Roster & Stats); guardian pawns (Guardian Castles).

## Dependencies

Rope Links, Troop Generation and Keep Levels have GDDs and are checked; the rest are provisional.

### Depends on (upstream)

| System | Kind | What this system needs | Status |
|--------|------|------------------------|--------|
| Rope Links | Hard | `pawn_launched` at every send and relay | Checked against its Core Rules 6–8, 10, F3, F5; fixes 1, 2, 5, 7, 8 below |
| Troop Generation | Hard | `troops`, `troop_cap`, `owner`; beat before arrivals; its Core Rules 6, 7 | Checked; fixes 3, 4, 9 below |
| Keep Levels | Soft (hard from Alpha) | Reset on capture; origin `level` at launch from Alpha | Checked against its Core Rules 4, 7; fixes 2, 6 below |
| Unit Roster & Stats (Alpha) | Soft | `UnitStats` values, `unit_for` | Provisional |

### Depended on by (downstream)

What each takes is in the Interactions table. **Hard:** Rope Links, Troop Generation, Level State & Match Flow, Rival AI, Level HUD, and from Alpha Unit Roster & Stats, Factions, Unit Cards & Upgrades (the contract and M1–M4, M7). **Soft:** Keep Levels, Feedback & Juice, Tutorial & Onboarding, God & Goddess Powers, Campaign Level Data.

### Consistency to fix

Proposed edits, none applied.

1. **Relay limit (decided).** `rope-links.md:49` rule 10: "none is lost" → "lost at the next full allied keep after `relay_hops_max` (6) relays (Troop Marching rule 13)". `:153`–`:161` (F5), `:168` (R3): "bounds sent pawns; relays ride on top, bounded by Troop Marching F9". `:213`: count sent pawns only. `:339` (AC22): "each pawn is relayed at most 6 times; the ring's count settles (AC-M29)". `:180`, `:367` follow.
2. **Capture report.** `keep-levels.md:45` raises `level_dropped` on capture to cut all ropes; `rope-links.md:46` reads `level_dropped` as "newest until it fits" and capture as its own cause (`:73`). Edit: Rope Links cuts all on `keep_captured`; Keep Levels resets on it and raises no `level_dropped` for a capture.
3. **Capture pace (decided: keep the faster pace).** `troop-generation.md:153` (F4 example, ≈ 88 s) and `:286` (AC15, 80–95 s) ignore the level drops of `keep-levels.md:41`, `:105`. Step simulation: last send at 49.2 s, capture ≈ 52 s on a 300 px rope (two ropes: 15.6 s to last send). Edit both to the level-drop-aware figure.
4. **Arrival order (decided).** `troop-generation.md:319` (its OQ 5) is answered by rule 11; close it.
5. **"Full" is at or above the cap.** `rope-links.md:49`, `troop-generation.md:69` say "equals"; `troop-generation.md:178` allows above. Edit both to "at or above".
6. **Level read.** `keep-levels.md:199` "does not read the level" against `:79` (level picks the unit). Edit: "not at MVP; at launch from Alpha".
7. **One speed.** `rope-links.md:159` against `systems-index.md:36`. Edit: F5 and R3 use the level's slowest unit speed.
8. **Relay carries the pawn.** `rope-links.md:49` "a fresh launch (origin, target, owner, lane)". Edit: it also carries unit, `hp` and `relays`.
9. **Who applies an arrival.** `rope-links.md:199` (Troop Generation) against `troop-generation.md:78` (Troop Marching). Edit Rope Links' wording.
10. **Strength wording.** `troop-generation.md:50-52`, `keep-levels.md:45` say 1; edit only when units differ.
11. **Relay counter.** Prototype (`index.html:240-241`) differs from `rope-links.md:123`; no edit, build to the GDD.
12. **`systems-index.md`**: row 7 gains Unit Roster & Stats (contract); rows 10, 12, 19 gain this system.

**Registry candidates (not applied):** `pawn_speed`, `capture_troops`, `relay_hops_max`, `pawns_in_flight_max`; F1, F4–F6; `UnitStats`; `referenced_by` on registered values used. No registry conflict.

## Visual/Audio Requirements

`art-director` not consulted — Lean mode. No art bible yet; the look follows the brief.

| Moment | Visual | Audio |
|--------|--------|-------|
| Marching | Small pixel figure in owner colours, facing its target, bobbing out of phase, depth-sorted with keeps, on its lane | One soft thud per `march_tick_interval` for the table |
| Clash | Both drop with a dust puff and steel sparks (art bible: gold means a gain), fading over `pawn_fade_time` | Short dull thud, pooled per step |
| Hit | Keep flashes `arrival_flash_time`; count drops the same frame | None (would spam) |
| Reinforce | Same flash in the owner's colour | None |
| Capture | Banner pop, flag and gold burst, floating "Taken!" / "Lost!" / "Seized" | Two-note sting, higher for the player |
| Relay limit loss | No effect; the pawn does not reappear | None |

Alpha unit kinds differ by silhouette, not only `size`. Every figure is drawn; no emoji.

📌 **Asset Spec** — after the art bible is approved, run `/asset-spec system:troop-marching-clashes`.

## Game Feel

- **The stream is the read-out**: direction, rate and, at the scuffle, who is ahead.
- **The count never lies**: it changes on the arrival step, no tween.
- **Capture is the pay-off**: run-up, then flip, banner and sting on one step.
- **Committed, not twitchy**: no recall; travel time (1.4–13.4 s) is a rope's weight. A stand-off reads as "I need another rope here".
- **Calm at scale**: small effects, pooled sounds. References: Mushroom Wars, Galcon, Tentacle Wars.

## UI Requirements

- No interface on a pawn (no selection, bar or tooltip).
- Strength bar: keeps' `troops` plus `marching_strength(owner)`.
- Capture words float about 1.6 s in the captor's colour.
- No second number on the plaque for incoming pawns.
- No loss shown while the player still has pawns in flight.
- Alpha: a pawn worth more than one troop must read from the figure alone.

> **UX Flag — Troop Marching & Clashes**: run `/ux-design` for the strength bar, capture words and pawn readability before writing epics; stories cite `design/ux/[screen].md`.

## Cross-References

| Owned by | What this GDD uses | Used in |
|----------|--------------------|---------|
| Rope Links | `pawn_launched`; Core Rules 7, 8, 10; F3–F5; `rope_lane`, `send_interval`, `pawns_per_rope_max` | Rules 1, 5, 10, 12, 13; F2, F3, F8, F9; M2 |
| Troop Generation | `troops`, `troop_cap`, `owner`; Core Rules 6, 7; F4; I3 | Rules 10–12, 14; F5–F7; M4 |
| Keep Levels | Core Rules 4, 7; F2; `lv2_at`, `level_drop_margin` | Rules 3, 12; M6; AC-M32 |
| Touch & Mouse Input | `keep_hit_radius`, I2 | F1 |
| Others | Level State (win, loss, pause), Unit Roster (`unit_for`), Campaign Level Data (longest rope), HUD/Juice/Audio (drawing) | Rules 3, 15, 16; M2; OQ 8 |

## Acceptance Criteria

Baseline data: `pawn_speed` 110, `strength` 1, `capture_troops` 1, `relay_hops_max` 6, `pawns_in_flight_max` 600, `send_interval` 0.6 s, `rope_lane` 8, `troop_cap` 60, `lv2_at` 15, `lv3_at` 35, `level_drop_margin` 5, `gen_interval` 2.5 s, step 1/60 s. "Step N" counts from the launch step (step 0, on which the pawn also marches). Tags as in Rope Links. `qa-lead` lens not yet applied.

**Marching**
- **AC-M1 [Logic] (F1)**: a pawn on a 300 px rope launched on step 0 arrives in step 163; on 330 px on its 180th march; ropes of 156 and 1,470 px give 86 and 802 marches.
- **AC-M2 [Logic] (F1)**: a pawn relayed in step 163 onto a 300 px rope has 0 marches at the end of that step and arrives in step 327.
- **AC-M3 [Logic] (F2)**: origin (360, 1060), target (360, 760), lane (8, 0), 82 marches → (368, 909.67) within 0.01 px.
- **AC-M4 [Logic] (F2)**: a pawn launched on a lone rope stays on the centre line when the opposite rope is tied; later pawns are 8 px right.
- **AC-M5 [Logic] (F3)**: one 300 px rope sending for 30 s: sent pawns 66 px apart (within one march), at most 6 in flight.
- **AC-M6 [Integration: Rope Links] (rule 5)**: a rope cut with 3 pawns in flight still yields 3 arrivals at the steps F1 gives.
- **AC-M7 [Logic] (rule 3)**: when a unit's `speed` changes to 200, a pawn in flight on 300 px still arrives on its 164th march; the next one on its 90th.

**Clashes**
- **AC-M8 [Logic] (F4)**: enemy keeps 300 px apart, one pawn each way on step 0 → both removed in step 81, one `pawn_clashed` with `loss` 1 at (360, 910) within 0.5 px, no troop change.
- **AC-M9 [Logic] (F4)**: with B's pawn launched on step 18 → clash in step 90 at 166.83 px and 133.83 px from the origins.
- **AC-M10 [Logic] (F4, gate)**: A's pawn due at B in step 163 and B launching toward A in step 163 → both removed, B's troops unchanged.
- **AC-M11 [Logic] (rule 9)**: no clash between pawns on crossing ropes of different keep pairs, enemy pawns marching the same direction, or same-owner pawns marching opposite ways; all arrive.
- **AC-M12 [Logic] (F7)**: two enemy keeps roped at each other for 60 s → no pawn arrives; clashes equal pawns launched per side minus those in flight.
- **AC-M13 [Logic] (F4; OQ 1)**: a `strength` 3 pawn against three `strength` 1 pawns 36 steps apart → three clashes, it is removed at the third; against two it arrives with `hp` 1.
- **AC-M14 [Logic] (rules 8, 11)**: clashes and arrivals give the same result with pawns stored in reverse order; `pawn_clashed` events come in ascending keep-pair order.

**Arrivals and capture**
- **AC-M15 [Logic] (F5)**: neutral keep with 3 troops, 4 player pawns → 2, 1, 0 still neutral, then the player's with 1.
- **AC-M16 [Integration: Troop Generation, Keep Levels, Rope Links] (rule 12)**: a rival level 3 keep at 0 troops, timer 1.2 s, 2 ropes, hit by a player pawn → in that step: player's, `troops` 1, timer 0, level 1, both ropes cut with reason `capture`, one `keep_captured`.
- **AC-M17 [Logic] (F5)**: an owned keep at 1 troop hit by one enemy pawn ends at 0 with the same owner.
- **AC-M18 [Logic] (F5, discard)**: `strength` 3 pawns at an enemy keep with 5 → 2; 3 → 0, not captured; 2 → captured, 1; 0 → captured, 1.
- **AC-M19 [Logic] (F6)**: allied keep at 59: the first pawn makes it 60 (`keep_reinforced(keep, 1)`); the second leaves 60 and raises one `ally_arrived_full` with the pawn's origin. A `strength` 3 pawn at 58 → 60.
- **AC-M20 [Logic] (F6)**: a keep holding 60 with `troop_cap` lowered to 50 → troops stay 60, `ally_arrived_full`.
- **AC-M21 [Logic] (rule 11)**: rival keep at 0 troops with a player pawn (`seq` 5) and a rival pawn (`seq` 7) arriving in one step → rival's, 0 troops, no capture; the same with the `seq` values swapped.
- **AC-M22 [Logic] (rule 11)**: the worked example (rival keep at 0; player `seq` 3, 4, 6; rival `seq` 9) → player's with 2 troops, one `keep_captured`.
- **AC-M23 [Logic] (rule 11)**: neutral keep at 0 with player `seq` 5 and rival `seq` 7 → player's with 0 troops; swapped → rival's with 0.
- **AC-M24 [Integration: Troop Generation]**: an owned level 1 keep at 0 troops whose beat fires in the step an enemy pawn arrives ends at 0 with the same owner.
- **AC-M25 [Logic] (rule 2)**: a player pawn heading for rival keep B adds 1 if the player took B first; one heading for allied C removes 1 if the rival took C first.
- **AC-M26 [Logic] (rule 2)**: 3 player pawns from A stay in flight and the player's after the rival captures A.
- **AC-M27 [Logic] (rules 2, 12)**: after the player captures K, two rival pawns already marching to K leave it at 0 (`keep_hit`) and then recapture it with 1 troop.
- **AC-M28 [Logic] (rules 14, 15)**: over a 120 s scripted match every troop change outside a beat matches exactly one `keep_reinforced`, `keep_hit` or `keep_captured`; a pawn that falls on its arrival step raises no arrival event.

**Relay, pace and bounds**
- **AC-M29 [Integration: Rope Links] (F9; hand estimate — needs simulation before it blocks)**: three full allied keeps 260 px apart in a ring → `pawns_in_flight` between 75 and 95 at 120 s and 240 s, never above 95.
- **AC-M30 [Logic] (rule 13)**: a pawn with `relays` 6 at a full allied keep with an Active rope is removed with `pawn_lost` (hops), no `ally_arrived_full`, troops unchanged; with `relays` 5 it is relayed with `relays` 6 and the same `hp`.
- **AC-M31 [Logic] (rule 13)**: at `pawns_in_flight_max`, an allied pawn at a full keep is lost (backstop) with one log line; rope sends are not refused.
- **AC-M32 [Integration: Troop Generation, Keep Levels, Rope Links] (F5 with generation; step simulation, scratchpad sim)**: a level 3 keep with 40 troops and timer 0, attacked by one enemy rope of 300 px tied at t = 0, is captured between 48 s and 56 s.
- **AC-M33 [Logic] (F8)**: on the longest rope of each prototype layout, with no relays, sent pawns never exceed `ceil(L / 66) + 1`.
- **AC-M34 [Integration: Unit Roster & Stats] (rule 3; Alpha, OQ 3)**: a launched pawn carries `unit_for`'s stats and keeps them and its `hp` through a relay from a keep of another level.

**Queries, data, device**
- **AC-M35 [Logic] (rule 15)**: 4 player pawns (`hp` 1, 1, 2, 3) heading for K, 2 rival pawns elsewhere → `incoming(K, player)` 7, `marching_strength(player)` 7, `pawns_in_flight` 4 and 2; a fallen pawn leaves all three on that step and `pawns()` after `pawn_fade_time`.
- **AC-M36 [Integration: Level State & Match Flow]**: a player with no keep and 1 pawn heading for a neutral keep at 0 troops is not lost; on arrival the player owns it.
- **AC-M37 [Logic] (rule 17)**: during a 10 s pause no `marches` changes and no event is raised; arrivals keep F1's step counts.
- **AC-M38 [Logic] (rule 17)**: two runs of the same level, data and scripted input for 120 s have equal pawn lists (`seq`, owner, origin, target, `marches`, `hp`) and keeps at every step.
- **AC-M39 [Logic] (M1, M4–M7)**: `speed` 0, `strength` 0 or 61, `size` 3, `capture_troops` 0 or 15, `relay_hops_max` 0, `pawns_in_flight_max` 100 → a development build stops naming the invariant and value; a shipped build clamps (30, 1, 60, 2.0, 1, 14, 1, 200) and logs.
- **AC-M40 [Integration: Campaign Level Data] (M2)**: longest pair 1,470 px with `speed` 50 → M2 reported (50 against 40), level not loaded; `speed` 70 loads (36).
- **AC-M41 [Logic] (M3)**: `speed` 30 with `send_interval` 0.6 and `pawn_min_spacing` 20 → M3 reported (18 px).
- **AC-M42 [Logic] (rule 16)**: a unit record with only `id` gives `speed` 110, `strength` 1, `size` 1.0, and AC-M1, M8, M15 pass unchanged.
- **AC-M43 [Device]**: 600 pawns on 30 ropes on the target phone: phases 3–5 under 0.5 ms per step at 60 fps (target to confirm).
- **AC-M44 [Visual]**: retained screenshots in `production/qa/evidence/` show both lanes with a clash, a capture with banner and word, and a relayed pawn.
- **AC-M45 [Playtest]**: a new player can say which side is ahead from where clashes happen.

## Open Questions

**Resolved (user, 2026-11-22):** (a) relay rings are bounded by a hop limit of 6 with the 600 backstop (rule 13); (b) same-step arrivals resolve the keep's own side first (rule 11), overriding the launch-order default and the prototype; (c) strength a pawn cannot spend is discarded (rules 10, 12); (d) the faster capture pace stands (AC-M32, about 52 s for the reference case).

| # | Question | Recommended | Owner | Resolve by |
|---|----------|-------------|-------|------------|
| 1 | Clash between units of different strength: attrition, always 1:1, or stronger wins outright? | Attrition (written default); no MVP effect | user | Before Unit Roster & Stats |
| 2 | What does `size` do: drawing and footprint only, a second troop value, or dropped? | Drawing and footprint only | user, art-director | Before Unit Roster & Stats |
| 3 | Does a relayed pawn keep its unit kind or become the relaying keep's kind? | Keeps its kind | user | Unit Roster & Stats GDD |
| 4 | Do stand-offs last too long, and do contested keeps flicker at `capture_troops` 1? | Leave both; watch in playtest (AC-M45) | game-designer, Rival AI | First Godot playable |
| 5 | Keep the clash at the gate, or give a pawn near its target a free arrival? | Keep (prototype; it makes roping back a real defence) | user | After the first playable |
| 6 | Pawns launched before an opposite rope stay on the centre line | Keep lanes frozen (Rope Links) | ux-designer, art-director | First Godot playable |
| 7 | Arrive at the keep's centre or its wall? | Centre until keep art exists | art-director | Art pass |
| 8 | Closed (2026-11-22): pawns in flight **freeze** in place at the deciding step and stay drawn behind the result overlay; discarded with the match (Level State & Match Flow, Core Rule 4) | Freeze | — | — |
| 9 | Unmeasured: backstop 600, 0.5 ms budget, 20 px spacing; AC-M29 hand estimate | Measure and simulate | gameplay-programmer | First phone build |
