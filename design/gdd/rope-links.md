# Rope Links

> **Status**: In Review (revised 2026-11-22, pending re-review)
> **Author**: user + Claude
> **Last Updated**: 2026-11-22
> **Last Verified**: 2026-11-22
> **Creative Director Review (CD-GDD-ALIGN)**: skipped — Lean mode
> **Implements Pillar**: 1. One verb, standing choices (`design/gdd/game-concept.md` § Pillars)

## Summary

Rope Links is the player's one verb: a rope from one of their keeps to any other keep sends a free pawn every 0.6 s until it is cut, with no length limit, up to the keep's level in ropes (1–3), and never both ways between allies. A full keep passes arriving allied pawns on down its own ropes (up to 6 relays a pawn), so chains become pipelines; cutting a rope stops new pawns but lets those in flight finish. It exists so the match is a set of standing choices the player keeps adjusting rather than one-shot sends.

> **Quick reference** — Layer: `Core` · Priority: `MVP` · Key deps: `Keep Levels, Touch & Mouse Input (hard); Troop Generation (soft); Troop Marching & Clashes (runtime callback)`

## Overview

Rope Links is the player's one verb. A rope is a standing supply line from one of the player's
keeps to any other keep on the map: once tied it sends a pawn down the line every 0.6 seconds,
for free, until it is cut. Ropes to an enemy or neutral keep are attacks; ropes to an allied keep
are reinforcement; and a keep that is already full passes the pawns it receives straight on down
its own ropes, so a chain of keeps becomes a pipeline to the front. There is no length limit, a
keep may hold as many ropes as its level allows (one, two, three), and two allied keeps may never
rope each other both ways, so every rope points somewhere useful.

The system owns the rope: whether a tie is legal and why not, when each pawn leaves, where the
rope lies on the table (two enemy ropes between the same keeps run side by side), what cuts it
(a swipe, a level drop, a capture) and what happens to pawns already on it (they finish their
march). It does not own the gesture that ties it (Touch & Mouse Input), the keep's rope capacity
(Keep Levels), the pawn once it is on the rope (Troop Marching & Clashes) or the drawing (Level
HUD). The rival ties and cuts through the same rules; it has no rope the player could not have.
Without this system the match has no decisions: troops would grow and nothing would move.

## Detailed Design

### Core Rules

`game-designer`, `systems-designer`, `ai-programmer` and `art-director` not consulted — Lean mode. Review manually before production.

1. **A rope is directed**: from an origin keep to a target keep, owned by the origin's owner at tie time. Only an owned keep can be an origin; neutral keeps never tie. The target may be any other keep: allied, neutral or rival.
2. **A tie is legal when all of these hold** (checked in this order, and the first failure is the reason reported): the origin belongs to the side tying; the target is not the origin; no keep lies in the way (rule 3, F6); no rope already runs origin→target; if the target is allied, no rope runs target→origin (the both-ways ban, the player's rule; "runs" means Extending or Active: a Fading rope never blocks a tie, so a cut rope can be re-tied at once in either direction, decided 2026-11-22); the origin holds fewer ropes than `max_ropes[level]` (Keep Levels). Distance is never checked (the player's rule: no length limit).
3. **A keep in the way blocks a tie** (moved here from Touch & Mouse Input's F6, decided 2026-11-22, so the player and the rival obey one rule). `blocking_keep(origin, target)` (F6) is the keep nearest the origin that lies on the way to the target; while one exists the tie is refused with `blocked`. Touch & Mouse Input resolves a drag through F6 to the nearest keep that nothing blocks before it reports the release (its F6), so a player's tie is never refused with `blocked` and the preview already shows the keep the rope will reach. The rival scores only targets with `tie_legal` = `ok` (Rival AI rule 6), so it never ties past a keep either. If the resolved keep fails rule 2, the tie is refused with that reason; Rope Links never substitutes a farther keep.
4. **Tying.** A legal tie creates the rope at once, raises `rope_tied(rope)`, and the rope spends `rope_extend_time` (0.2 s) extending from origin to target before it can send. The first pawn leaves `first_send_delay` (0.3 s) after extension; after that one pawn leaves every `send_interval` (0.6 s) while the rope is active.
5. **Sending is free and unconditional.** A pawn leaving never reduces the origin's troops (Troop Generation's Core Rule 5), and the rope sends whatever the origin's troop count, even 0, for as long as the origin stays owned by the rope's owner. The troop count is the keep's defence, not its ammunition.
6. **The pawn is handed to Troop Marching & Clashes** at launch with its origin, target, owner and lane (a relay also passes its unit, `hp` and relay count); Rope Links does not move it, fight it or deliver it.
7. **Cutting.** A rope is cut by the player (Input's `cut_tapped` or `cut_swiped`), by the rival (its own cut call), by Keep Levels (`level_dropped`: the origin's newest ropes are cut until its count fits the new level), or by capture of the origin (every outgoing rope of the captured keep is cut on Troop Marching & Clashes' `keep_captured`; `level_dropped` never cuts for a capture). Ropes **into** a captured keep are not cut: they keep sending, now as attacks on the new owner or as reinforcement if the captor was their owner.
8. **A cut rope frees its slot at once and stops sending after this step's sends.** A cut requested by the player (phase 0 of the per-step order) or the rival (phase 1b) raises `rope_cut(rope, reason)` and turns an Active rope **Cutting** at once: it holds no slot, so a tie later in the same step or the same rival pass can use it, and for every check it counts as Fading (F1: not a rope for `duplicate`, `reverse`, the lane or `ropes_held`; not cuttable; no relays). A pawn due on that step still leaves in phase 2 (the last pawn leaves, the player's decision, 2026-11-22), and then the rope turns Fading. A cut Extending rope sends nothing, so it turns Fading at once. A capture or level-drop cut (phases 5–6) comes after the step's sends anyway and goes straight to Fading. A Fading rope fades for `rope_fade_time` (0.9 s) as a sagging line. Pawns already on it finish their march to the target and act there (the player's rule); the lane they were given is frozen for them.
9. **The player cuts only the player's ropes**, and the rival only its own. Rope Links is Touch & Mouse Input's hit-test provider (the player's decision): every frame, in every match state including Armed (the provider is not a match step), it gives every keep with its owner flag (tie targets and Input's F6 range over all keeps) and the player's Extending and Active ropes as the cuttable set, lane-adjusted, an Extending rope only over the part drawn so far. Cutting and Fading ropes are not in the set.
10. **Relay at a full keep.** When an allied pawn arrives at a keep whose `troops` is at or above `troop_cap`, Troop Marching & Clashes reports it (`ally_arrived_full`) and Rope Links relays it: the pawn is launched again from that keep down one of its Extending or Active outgoing ropes, chosen round-robin (F3). A relay costs nothing and carries the pawn's unit, `hp` and relay count. If the keep has no such rope, the pawn is lost (the player's rule). Loops of full keeps are allowed; a pawn circulates until it has been relayed `relay_hops_max` (6) times and is then lost at the next full allied keep (Troop Marching & Clashes rule 13; the player's decision, 2026-11-22).
11. **Lanes.** Two ropes between the same two keeps in opposite directions (only possible between enemies, by rule 2) are each offset `rope_lane` (8 px) to their own right, so both are visible and their pawns clash in the open (Troop Marching). A lone rope lies on the straight line.
12. **The rival uses the same calls** (`tie`, `cut`) and gets the same refusals; Rival AI decides what to try, Rope Links decides what is allowed.
13. **Events** for the HUD, effects and the tutorial: `rope_tied`, `rope_cut(reason: player | rival | level_drop | capture)`, `tie_refused(origin, target, reason)`, `pawn_launched`, `pawn_relayed`.
14. **Data.** `send_interval`, `rope_extend_time`, `first_send_delay`, `rope_fade_time`, `rope_lane`, `pawns_per_rope_max` and `align_tolerance` (F6) are data-file values. From UAT-2, Factions may change `send_interval` per race inside Troop Generation's invariant I3; in Alpha, God & Goddess Powers may add temporary rope effects through their own GDD.

### States and Transitions

| State | Meaning | Sends? | Holds a slot? | Cuttable? | Leaves when |
|-------|---------|--------|---------------|-----------|-------------|
| Extending | Just tied; the line grows from origin to target over `rope_extend_time` | No (but relays, rule 10) | Yes | Yes (by the player's swipe; it is in the cuttable set) | Time elapses → Active; cut → Fading |
| Active | The rope's send timer runs; a pawn leaves every `send_interval` | Yes | Yes | Yes | Cut by the player or the rival → Cutting (rule 8); capture or level-drop cut → Fading |
| Cutting | Cut requested this step; waits for this step's sends (rule 8) | Only the pawn already due this step, in phase 2 | No | No | After phase 2 of the same step → Fading |
| Fading | Cut; sags and fades over `rope_fade_time` | No | No | No | Time elapses → Gone |
| Gone | Removed | | | | |

A tie that is refused creates no rope and no state; it raises `tie_refused`. Pawns are not rope states: once launched they belong to Troop Marching & Clashes, whatever happens to the rope.

### Interactions with Other Systems

| System | Direction | Data | Interface owner |
|--------|-----------|------|-----------------|
| Touch & Mouse Input | in/out | In: `tie_released(from, to)` (to already resolved by Input's F6, which repeats this GDD's F6), `cut_tapped(rope)`, `cut_swiped(rope, t)`. Out: the hit-test provider (every keep with its owner flag; the player's Extending and Active ropes as lane-adjusted segments) and `blocking_keep` (F6) for target resolution. Input does not judge legality (decided 2026-11-22) | Input defines the events; Rope Links defines legality and the blocking rule and supplies the provider |
| Keep Levels | in | `max_ropes[level]` for rule 2; `level_dropped(keep, old, new)` → cut newest ropes beyond the new limit | Keep Levels defines the limit and "newest falls"; Rope Links executes |
| Troop Generation | in/out | In: `troops` and `troop_cap`, to know when a keep is full (rule 10). Out: nothing that changes `troops` (sending is free). `send_interval` is this GDD's, and Troop Generation's invariant I3 bounds it | Rope Links owns `send_interval`; Troop Generation owns the count |
| Troop Marching & Clashes | out/in | Out: `pawn_launched(origin, target, owner, lane)` at every send and relay (a relay also passes unit, `hp`, relays). In: `ally_arrived_full(keep, pawn)` with the pawn's origin, so rule 10 can relay it; `keep_captured`, so rule 7 cuts the keep's outgoing ropes | Rope Links launches; Troop Marching moves, fights and delivers |
| Rival AI | in/out | In: `tie(origin, target)` and `cut(rope)` calls, answered with the same refusals as the player's, `blocked` included (F6); out: the rope list for reading the board, each rope with origin, target, owner, state and age (`tied_step`), which Rival AI's `cut_relieved` reads (its F5, `rope_min_age`) | Rope Links |
| Level HUD | out | Each rope's state, end points and lane, for drawing the rune rope, its extension, its sag and the pins; `tie_refused` for the message strip; whether a previewed tie is legal and why not (`tie_legal`), which the HUD reads directly for the preview's red cross (decided 2026-11-22) | Rope Links raises; Level HUD draws |
| Feedback & Juice | out | `rope_tied`, `rope_cut`, `pawn_relayed` for the snap sound, sparks and the relay flicker | Rope Links raises |
| Tutorial & Onboarding | out | `rope_tied` and `rope_cut` with reason player, to tell that the first tie and the first cut happened | Rope Links raises |
| Campaign Level Data | none | Keep positions come through the keeps themselves; Rope Links never reads level files | Campaign Level Data |
| Factions (UAT-2), God & Goddess Powers (Alpha) | in | `send_interval` override per race (inside I3); temporary rope effects | Their GDDs |

## Formulas

`systems-designer` lens applied by the author (Lean mode: Section D is a high-risk section). Boundaries worked below.

### F1. Tie legality

The tie_legal formula is defined as:

`tie_legal(o, t) = first failing check of [o.owner = side, t ≠ o, blocking_keep(o, t) = none, ¬rope(o→t), ¬(t.owner = o.owner ∧ rope(t→o)), ropes_held(o) < max_ropes(o.level)]`, giving `ok` or one of `not_yours`, `self`, `blocked`, `duplicate`, `reverse`, `slots`. `rope(x→y)` is true only for an Extending or Active rope; Cutting and Fading ropes are ignored (rules 2, 8), so a pair cut this step may be tied again in the same step.

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| o, t | keep | | calculated | Origin and resolved target |
| side | owner | player or rival | calculated | Who is tying |
| blocking_keep(o, t) | keep or none | | calculated (F6) | The nearest keep in the way |
| ropes_held(o) | int | 0–3 | calculated | Extending or Active ropes from o (not Cutting or Fading) |
| max_ropes(level) | int | 1–3 | calculated (Keep Levels F3) | Slots at o's level |

**Output Range:** `ok` or one reason. No distance term (unlimited length).
**Example:** a level 2 player keep holding 2 ropes, tie to a neutral: `slots`. The same keep holding 1 rope, tie to an allied keep that already ropes it: `reverse`. Tie to a rival keep that ropes it: `ok` (enemy ropes may cross). The rival asking for A→C with B in the way (F6 example): `blocked`.

### F2. Send schedule

The send_schedule formula is defined as:

`t_k = t_tie + rope_extend_time + first_send_delay + (k − 1) × send_interval` for the k-th pawn (k ≥ 1), while the rope is Active; and `R_send = 1 / send_interval`.

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| send_interval | float, s | 0.3–2 (baseline 0.6) | data file | Time between pawns on one rope |
| rope_extend_time | float, s | 0–1 (baseline 0.2) | data file | How long the rope takes to reach the target |
| first_send_delay | float, s | 0–2 (baseline 0.3) | data file | Pause after extension before the first pawn |
| t_tie | float, s | match time | calculated | When the tie was made |

**Output Range:** first pawn 0.5 s after the tie at baseline, then 1.67 pawns per second. Time is counted in game steps, so a paused game sends nothing.
**Example:** tied at 10.0 s: pawns at 10.5, 11.1, 11.7, 12.3 s.

### F3. Relay choice

The relay_choice formula is defined as:

`candidates = relay_ropes(k) \ {r : r.target = pawn.from}`; if empty, `candidates = relay_ropes(k)`; if still empty, the pawn is lost; else `rope = candidates[relay_count(k) mod |candidates|]` and `relay_count(k)` rises by 1.

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| relay_ropes(k) | list | 0–3 ropes | calculated | Keep k's Extending and Active ropes, in ascending `rope_id` |
| pawn.from | keep | | calculated (Troop Marching) | The arriving pawn's current `origin`: the keep at the start of the rope it is on (for a relayed pawn, the keep that relayed it, not its first origin) |
| relay_count(k) | int | ≥ 0 | calculated | Per-keep counter, reset at match start |

**Output Range:** one rope, or lost. With two ropes the relay alternates; with one it always takes it, even back toward the sender if that is the only rope.
**Example:** full keep K with ropes to A and B, a pawn arrives from A: candidates {B}; next pawn from A: {B} again (A is excluded, so B every time); a pawn from C: {A, B}, alternating. The exclusion matters only for a pawn still finishing a cut rope's march (A→K cut, then K→A tied): it is not sent straight back.

**Order within a step** (decided 2026-11-22, shared with Troop Marching & Clashes and Rival AI). Every rope takes a `rope_id` from the monotonic tie counter when it is tied (the counter level drops already use). Each rope also records `tied_step`, the step whose phase 0 (player) or phase 1b (rival) created it (step 0 for ties made while Armed); its age is `age(r) = (step − tied_step) / 60` s (decided 2026-11-22, for Rival AI F5). `relay_ropes(k)` is listed in ascending `rope_id`, so with ropes K→A tied before K→B the candidates are [A, B]. In phase 2 of the per-step order, rope timers advance and due sends launch in ascending `rope_id`, so pawns launched on one step take `seq` in that order; relays launch in phase 5 in the order arrivals resolve (Troop Marching & Clashes rule 11) and take `seq` then.

### F4. Lane offset

The lane_offset formula is defined as:

`offset(o→t) = rope_lane × right_normal(t − o)` when an Extending or Active rope t→o also exists; `0` otherwise. A Fading opposite rope does not count: pawns launched after it was cut use the centre line, while pawns already launched keep their frozen lane (rule 8). `right_normal(v) = (−v.y, v.x) / |v|` in y-down screen coordinates (the unit vector on v's right-hand side).

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| rope_lane | float, px | 0–20 (baseline 8) | data file | Half the gap between two opposite ropes |

**Output Range:** 0 or 8 px at baseline; the two ropes end up 16 px apart. Both end points of the rope move by the same offset, so the rope stays parallel to the straight line.
**Example:** o (360, 1060) → t (360, 760): direction up; right of "up" is +x; the rope is drawn from (368, 1060) to (368, 760); the opposite rope from (352, 760) to (352, 1060).

### F5. Pawns sent per rope (performance bound)

The pawns_per_rope formula is defined as:

`pawns_per_rope ≤ ceil(rope_length / (speed_min × send_interval)) + 1`

It bounds pawns sent by the rope's own timer. Relayed pawns ride on top; the total in flight is bounded by Troop Marching & Clashes F9 (relay limit and backstop).

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| rope_length | float, px | up to 1,258 at baseline (the diagonal of Campaign Level Data's B2 box for keep centres) | calculated | Distance origin→target |
| speed_min | float, px/s | baseline 110 (`pawn_speed`) | data file (Troop Marching & Clashes F8) | Slowest unit speed the level can launch; one value at MVP |

**Output Range:** at baseline 21 pawns on the longest possible rope, 5 on a typical 260 px rope. With 15 keeps × 3 ropes the worst case is about 945 sent pawns; a real level is far below it.
**Example:** 1,258 / (110 × 0.6) = 19.1 → 20, + 1 = 21 pawns.

### F6. Blocking keep (a keep in the way)

The blocking_keep formula is defined as:

`blocking_keep(o, t) = the keep k nearest to o among all keeps other than o and t with |angle_diff(bearing(o, k), bearing(o, t))| ≤ align_tolerance and dist_to_line(k, o→t) ≤ keep_hit_radius and dist(o, k) < dist(o, t)`; `none` if no keep qualifies. Equal distances go to the lower id.

`bearing(o, k)` is the direction in degrees from o to k; `angle_diff` is the smallest difference between two bearings (wrapping at ±180°). It applies to keeps of every owner. It was Touch & Mouse Input's F6 until 2026-11-22 and moved here so that one rule judges the player's and the rival's ties (rule 3); Input's F6 now repeats it to resolve a drag.

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| o, t | keep | | calculated | Origin and the asked-for target |
| align_tolerance | float, degrees | 0–15 (baseline 5, from the player's own rule) | data file (this GDD; moved from Touch & Mouse Input) | How far off the same direction still counts |
| keep_hit_radius | float, px | 48–120 (baseline 78) | data file (Touch & Mouse Input F1): the fixed data value, never the touch radius `keep_touch_radius` | The most a keep may sit off the straight line o→t and still be in the way |

**Output Range:** one keep or none. A blocker is always strictly nearer to o than t, so repeating F6 on the blocker ends after at most (keeps − 2) repeats. A keep within 5° lies at most 0.087 × its distance off the line, so below about 895 px from the origin the angle test alone decides; the 78 px limit acts only on longer ropes.
**Example:** o = A (360, 1060), B (360, 760), t = C (360, 520): both bearings are −90° and B is 300 px from A against C's 540 px, so `blocking_keep(A, C)` = B and `tie(A, C)` is `blocked`; `blocking_keep(A, B)` = none. With C′ (400, 520), 4.2° off B's bearing: still B. With C″ (440, 520), 8.4° > 5°: none, and A→C″ is not blocked.

### Invariants (checked when the data is loaded; the loader reports a breach)

- **R1.** `send_interval < gen_interval / gen_l3` (Troop Generation's I3 from this side): one rope always out-sends a level 3 keep. Baseline 0.6 < 0.833.
- **R2.** `rope_lane ≤ keep_hit_radius / 4`, so an offset rope still starts inside its keep's touch area and a cut tap near a keep is still a keep press (Input's Core Rule 3). Baseline 8 ≤ 19.5.
- **R3.** `pawns_per_rope` (F5) at the longest rope in the level ≤ `pawns_per_rope_max` (40), so a fast `send_interval` cannot flood a level: `send_interval ≥ longest_rope / (speed_min × 39)`. Baseline needs ≥ 0.293 s on the longest legal rope (1,258 px, Campaign Level Data F1); 0.6 passes, and so does the 0.3 minimum. R3 depends on a level, so Campaign Level Data checks it per level and Rejects a breach.
- **R4.** `rope_extend_time + first_send_delay ≤ send_interval × 2`, so a new rope is felt within two send beats. Baseline 0.5 ≤ 1.2.

**Boundary findings (inputs that break the system without the invariants):**
- `send_interval` 0.3 (its minimum): 3.3 pawns/s per rope, 40 pawns on the longest legal rope (1,258 px), exactly `pawns_per_rope_max`, so R3 still passes at baseline (needs ≥ 0.293); R3 catches 0.3 only with a slower unit or a smaller `keep_hit_radius` (Campaign Level Data F1), and the level then fails to load rather than stutter.
- `send_interval` 2 (its maximum): 0.5 pawns/s, below a level 3 keep's 1.2/s; R1 catches it (the match could never end).
- `rope_lane` 20 with `keep_hit_radius` 48: the rope starts 20 px off-centre; R2 (≤ 12) catches it.
- `rope_extend_time` 1 and `first_send_delay` 2: 3 s before a rope does anything; R4 (≤ 1.2) catches it.
- `send_interval` 0.6 with `gen_interval` lowered to 1.5 (Factions): `gen_interval / gen_l3` = 0.5, and 0.6 is no longer below it; R1 fails for that race, as Troop Generation's I3 would.

### Feedback loop

Free sending makes ropes cost nothing but attention, so the loop "more ropes → more targets taken → more keeps → more ropes" is damped only by `max_ropes` (three per keep), by the both-ways ban (no idle reinforcement pairs) and by the player's ability to manage many fronts. Relay adds a chain effect: a full rear keep feeds its front keep, which feeds the attack rope, so a well-laid chain multiplies the pawns on one rope without any extra generation; a loop of full keeps gains pawns from every rope and absorbs none, so without a limit it grows for ever; the relay limit (rule 10, 6 relays a pawn) makes its count settle (about 83 pawns for 3 keeps 260 px apart, Troop Marching & Clashes F9), so it is harmless but useless, which is the intended reading.

## Edge Cases

`systems-designer` not consulted — Lean mode. Review manually before production.

**Tying**
- **If the target is captured by the other side while the rope is Extending or Active**: the rope stays; its meaning flips (reinforcement becomes attack, or attack becomes reinforcement). Nothing is cut. The player sees the rope's end pin change colour with the keep.
- **Two allied keeps can never rope each other both ways**: rule 2 refuses it at tie time, and the only way two keeps become allied, a capture, cuts the captured keep's outgoing ropes (rule 7). The ban is therefore absolute.
- **If a tie is attempted to a keep that is Extending-roped already** (origin→target exists but has not reached the target): `duplicate`.
- **If Input's F6 resolves a drag to a nearer keep that fails rule 2**: refused with that reason; no tie to the farther keep (Input's Core Rule 14 agrees).
- **If the rival asks for a tie past a keep in the way**: refused with `blocked` (F6). It cannot happen through the rival's scoring, which keeps only `tie_legal` = `ok` targets; the blocking keep is a candidate of its own.
- **If the accessibility setting raises the touch radius** (Touch & Mouse Input F1b): F6 is unaffected. It uses the data file's `keep_hit_radius`, never `keep_touch_radius`, so which ties are legal never depends on a player's settings, and the player and the rival meet the same blockers.
- **If the rival and the player tie opposite ropes on the same frame**: both succeed (enemy pairs are allowed) and both get lanes (F4).
- **If several ties arrive while Armed** (Level State rule 2): the first accepted one is checked on arrival, and it and every tie received after it before step 0 are applied in step 0's phase 0 in the order received; each later tie is judged by `tie_legal` against the ropes created before it in that phase. So a level 1 keep's second tie is refused with `slots`, a repeat of the first with `duplicate`, and B→A between allies after A→B with `reverse`. No tie is judged against a board that lacks an accepted tie.
- **If the keyboard fallback ties**: same path as a release, same refusals.

**Sending and relay**
- **If the origin has 0 troops**: it still sends (rule 5). A keep at 0 troops is about to be captured, which cuts the rope.
- **If an allied pawn arrives at a full keep whose only Extending or Active rope leads back to the pawn's own origin**: F3's fallback takes that rope; the pawn marches back.
- **If a pawn arrives at a full keep that has only Extending ropes**: it is relayed onto one (F3) and walks behind the extending line (the player's decision, 2026-11-22), so no pawn is lost in the first 0.2 s after a tie.
- **If a relayed pawn's new rope is cut before it reaches the target**: it finishes its march like any pawn on a cut rope.
- **If the keep stops being full between the arrival and the relay** (same step): the arrival is resolved first by Troop Marching & Clashes (its F6: absorb if below the cap); relay happens only for a pawn it reports as `ally_arrived_full`.
- **If several allied pawns arrive at a full keep on one step**: each is relayed in arrival order, each advancing `relay_count`.
- **If `send_interval` is changed mid-match** (tuning or a power): each rope keeps its timer; if the timer already exceeds the new interval, one pawn leaves on the next step and the timer loses the interval. At most one pawn per rope per step.

**Cutting**
- **If a swipe crosses the same rope twice**: Input reports it once; cutting a Fading rope is a no-op.
- **If a level drop must cut 2 ropes and two were tied on the same step**: "newest" is by tie order within the step (later call first); Rope Links keeps a monotonic tie counter, not a timestamp.
- **If a rope is cut on a step on which it is due to send**: the launch still happens in phase 2 and the rope turns Fading after it (rule 8; the full per-step order is in Troop Marching & Clashes § Formulas). The slot was already free at the cut, so a tie in the same step or the same rival pass can use it; the next step sends nothing.
- **If the origin is captured and re-captured by its old owner within the fade time**: the old ropes are Fading and never revive; the keep starts at level 1 with no ropes.
- **If the player cuts a rope the rival owns** (a forged or stale `cut`): ignored; the cuttable set never contains it.

**Data and limits**
- **If the loader finds a breach of R1, R2 or R4** (global tuning, checked once at app start): development builds stop with an error naming the rule and the values; shipped builds clamp (`send_interval` to just under the R1 limit, `rope_lane` down to the R2 limit, `first_send_delay` down to fit R4) and log it (the one bad-data policy, Campaign Level Data rule 8, decided 2026-11-22).
- **If a level breaches R3**: it is a level check, so Campaign Level Data's loader Rejects the level and never clamps `send_interval`: development builds stop; shipped builds do not load it and Screen Flow shows its load-failure box.
- **If sent pawns on a rope exceed `pawns_per_rope_max`** (a defect; R3 should prevent it; relayed pawns are not counted): the rope skips sends until it is below the bound and logs it, rather than dropping pawns.

**Open, owned by other GDDs** (not decided here):
- What a pawn does on arrival (absorb, damage, capture, clash on the way): decided in Troop Marching & Clashes.
- Whether a god power may tie a rope from a neutral keep or lengthen fade: God & Goddess Powers.

## Dependencies

Every system here that has a GDD (Keep Levels, Touch & Mouse Input, Troop Generation, Troop Marching & Clashes, Level State & Match Flow, Rival AI, Level HUD, Campaign Level Data) was checked in the 2026-11-22 cross-GDD review. Feedback & Juice, Tutorial & Onboarding, Factions and God & Goddess Powers have no GDD yet, so their contracts are provisional.

### Depends on (upstream)

| System | Kind | What this system needs | Status |
|--------|------|------------------------|--------|
| Keep Levels | Hard | `max_ropes[level]`; `level_dropped` to know what to cut (capture cuts come from Troop Marching) | Checked: its Core Rules 5–7, F3, F4 and AC9–AC12 match rules 2, 7 and F1 |
| Touch & Mouse Input | Hard | `tie_released` with the target its F6 resolved, `cut_tapped`, `cut_swiped`; it expects the hit-test provider and `blocking_keep` (F6) in return | Checked: its Core Rules 4, 7, 8, 14, F6, Interactions and AC14 match rules 3, 9, F1 and F6 |
| Level State & Match Flow | Hard | Initialisation at build (no ropes, `relay_count` 0); the match state. Rope timers run only while the match is Running: not while Armed (before the first rope on a level that waits) and not after the deciding step. On an Armed level the first tie accepted on arrival (`tie_legal`) starts the level clock; it and every tie received after it before step 0 are applied in step 0's phase 0 in order, each later one judged there against the ropes created before it (its Core Rule 2; Edge Cases, ties while Armed) | Checked 2026-11-22: its Core Rule 2 matches rules 4 and 9 |
| Troop Generation | Soft (data read) | `troops` and `troop_cap` to detect a full keep | Checked: its Core Rule 6, Interactions and edge case "at the cap … Rope Links relays it" match rule 10 |
| Troop Marching & Clashes | Hard (runtime) | `ally_arrived_full(keep, pawn)` with the pawn's origin, unit, `hp` and relays; `keep_captured`; `pawn_speed` / `speed_min`; the relay limit | Checked: its rules 1, 10–13, F6, F8, F9 match rules 6, 7, 10, F5 and R3. Not a design cycle: Rope Links launches, Marching delivers and reports |

### Depended on by (downstream)

| System | Kind | What it takes from this system |
|--------|------|-------------------------------|
| Troop Marching & Clashes | Hard | `pawn_launched(origin, target, owner, lane)`; the lane for clash geometry |
| Rival AI | Hard | `tie`, `cut` and their refusals; the rope list to read the board, with each rope's age |
| Level HUD | Hard | Rope states, end points, lanes; `tie_refused` messages; `tie_legal` for the preview's red cross |
| Feedback & Juice | Soft | `rope_tied`, `rope_cut`, `pawn_relayed` |
| Tutorial & Onboarding | Soft | First tie and first cut |
| Touch & Mouse Input | Hard | The hit-test provider (every keep with its owner; the player's cuttable ropes) and `blocking_keep` (F6) |
| God & Goddess Powers (Alpha) | Soft | Rope effects through this GDD's data and events |
| Campaign Level Data | Soft (a rule it must check) | Invariant R3 per level (longest rope against `send_interval` and `pawn_speed`) |

### Consistency to fix

None open. The three edits listed here earlier (Touch & Mouse Input's hit-test provider wording, `game-concept.md`'s relay-limit exception and the registry entries) were applied on 2026-11-22.

## Visual/Audio Requirements

`art-director` not consulted — Lean mode. Review manually before production. No art bible yet; the look follows the brief: glowing rune ropes between keeps that snap and fade when cut.

**Visual**
- **The rope** is a taut line of pixel runes in the owner's colour (royal blue and gold for the player, crimson and black for the rival), pinned at both keeps with a small rune pin. The runes drift slowly from origin to target so the direction reads without an arrow.
- **Extending**: the line draws itself from origin to target over 0.2 s, the far pin lighting when it lands.
- **Active**: a faint pulse travels the rope on each send, timed with the pawn leaving, so the 0.6 s rhythm is visible.
- **Cut**: the rope parts at the cut point (the swipe's `t`, or the middle for other reasons), both halves sag and fade over 0.9 s, with a brief rune scatter at the break. A level-drop cut and a capture cut use the same snap, so the player learns one sign.
- **Relay**: the arriving pawn flickers once at the full keep and continues down the chosen rope, so the pipeline is readable.
- **Refusal**: the preview shows a red cross on the target and the message strip shows the reason (UI Requirements). No rope is drawn.
- **Lanes**: two opposite enemy ropes run 16 px apart; the player's rope is always on its own right.
- Every element is drawn; no emoji.

**Audio**
- Tie: a short rune chime (the prototype's rope snap-in). Cut: a snip and a low twang. Relay: no sound of its own (it would spam). Refusal: a soft "no" tone. The rival's ties and cuts are quieter. Feedback & Juice and Audio own the mix.

📌 **Asset Spec** — Visual/Audio requirements are defined. After the art bible is approved, run `/asset-spec system:rope-links` to produce per-asset descriptions (rune rope tiles per owner, pins, break scatter) and generation prompts.

## Game Feel

- **A tie answers at once.** The rope appears on the release step and reaches the target in 0.2 s; the first pawn leaves half a second after the tie. The player never waits to see whether the tie "took".
- **A cut is decisive but not a take-back.** The rope snaps on the step of the swipe, so the player feels the control; pawns already out finish their march, so cutting late still costs something. Cutting early is the skill.
- **Free sending removes hesitation.** Because a rope costs the sender nothing, the player's question is only "where", never "whether"; the pressure comes from the three-rope limit and the both-ways ban, which make every slot a choice.
- **Chains feel clever.** Watching a rear keep fill and start passing pawns forward is the game's "I built a machine" moment; the relay flicker is there to make it legible.
- **Reference feel**: Tentacle Wars' standing links and Galcon's instant sends, on a phone.

## UI Requirements

- **Refusal messages** in the Level HUD's bottom strip, one per reason (this GDD owns each key and draft wording; the text is in the strings data file, Level HUD rule 15): `slots` → "Level L keep: only 1 rope. Grow it or cut one." when N is 1, "Level L keep: only N ropes. Grow it or cut one." when N is 2 or more (N = `max_ropes[L]`; two strings, singular and plural, in the strings data file, decided 2026-11-22); `reverse` → "That keep already ropes this one."; `duplicate` → "Already roped."; `not_yours` → "Only your keeps can tie ropes."; `self` → no message (the drag simply ends); `blocked` → no message (Input redirects the player's drag to the nearer keep first, so only the rival can receive it). Each shows for about 2.4 s.
- **Slot dots** under each owned keep (Keep Levels and Troop Generation already place them): filled per Active or Extending rope.
- **Preview**: the drag preview snaps to the resolved target and shows a red cross when F1 would refuse (Level HUD rule 8, from `tie_legal`).
- **Controls on the Title** list "drag to tie, swipe or tap a rope to cut" (Input owns the key and draft wording; strings data file).
- **Rival ropes** are visible but not interactive. The rival's keeps show slot dots like the player's (as Keep Levels and Troop Generation state), so the player can read the rival's spare capacity (the player's decision, 2026-11-22).

> **UX Flag — Rope Links**: This system has UI requirements. In Pre-Production, run `/ux-design` for the message strip, the preview states and the slot dots before writing epics. Stories that reference UI should cite `design/ux/[screen].md`, not this GDD directly.

## Cross-References

Every referenced GDD that exists was checked in the 2026-11-22 cross-GDD review; Factions and God & Goddess Powers have no GDD yet, so their entries are provisional.

| This GDD uses | Owned by | Item |
|---------------|----------|------|
| `max_ropes[level]`, `level_dropped`, "newest falls", refusal text for `slots` | Keep Levels | Rules 2, 7; F1; UI Requirements |
| `tie_released` with the target its F6 resolved (by repeating this GDD's F6), `cut_tapped`, `cut_swiped(rope, t)`, hit-test provider, "never a farther keep" | Touch & Mouse Input | Rules 3, 7, 9; F6; Interactions |
| Initialisation, the match state (Armed, Running, Ending), the clock start on the first accepted tie | Level State & Match Flow | Rules 4, 9; its Core Rule 2 |
| `tie` and `cut` calls; scoring only targets with `tie_legal` = `ok` | Rival AI | Rules 3, 12; F1, F6 |
| Sending is free (its Core Rule 5); relay at `troop_cap` (its Rule 6 and edge case); invariant I3 on `send_interval`; `gen_interval`, `gen_l3` | Troop Generation | Rules 5, 10; R1 |
| `pawn_speed` (110 px/s), `speed_min` (F8); `ally_arrived_full`, `keep_captured`; the relay limit (its rule 13, F9); clash geometry on lanes | Troop Marching & Clashes | F5, R3; rules 6, 7, 10 |
| Longest rope per level for R3 | Campaign Level Data | R3 |
| Rope and pin drawing, message strip, the preview's red cross from `tie_legal` | Level HUD | Visual/Audio, UI Requirements; Interactions |
| `send_interval` per race; rope effects | Factions, God & Goddess Powers | Rule 14 |
| `keep_hit_radius` (78) | Touch & Mouse Input | R2, F6 |

## Acceptance Criteria

Baseline data unless stated: `send_interval` 0.6 s, `rope_extend_time` 0.2 s, `first_send_delay` 0.3 s, `rope_fade_time` 0.9 s, `rope_lane` 8 px, `troop_cap` 60, `max_ropes` 1/2/3, `pawn_speed` 110 px/s, step 1/60 s. Tags: **[Logic]** automated unit test with keeps and events injected; **[Integration]** automated test with the named system; **[Visual]** screenshot or playtest; **[Device]** on the target phone. `qa-lead` lens applied by the author (Lean mode: Section H is a high-risk section).

**Legality (Rules 1–3, 12; F1)**

- **AC1 [Logic] (rule 1)**: GIVEN a neutral keep N, WHEN the player or the rival asks to tie N→X, THEN the tie is refused with `not_yours` and no rope exists.
- **AC2 [Logic] (F1 order; injected state, cannot arise in play)**: GIVEN a player keep A (level 1, 1 rope held to B) and allied keep B that already ropes A, WHEN the player ties A→B, THEN the refusal reason is `duplicate` (checked before `reverse` and `slots`).
- **AC3 [Logic] (rule 2, reverse)**: GIVEN allied keeps A and B with rope B→A, WHEN the player ties A→B, THEN `reverse` and no rope; GIVEN B is the rival's with rope B→A, THEN A→B succeeds and both ropes exist.
- **AC4 [Integration: Keep Levels] (rule 2, slots)**: GIVEN a level 2 keep holding 2 ropes, WHEN a third tie is attempted, THEN `slots` with the message "Level 2 keep: only 2 ropes. Grow it or cut one."; WHEN the keep rises to level 3, THEN the tie succeeds.
- **AC5 [Logic] (rule 2, no distance)**: GIVEN keeps at opposite corners of the B2 box (1,258 px apart at baseline, the longest legal rope), WHEN tied, THEN the tie succeeds.
- **AC6 [Integration: Touch & Mouse Input] (rule 3)**: GIVEN B is already roped from A and C lies beyond B on the same line, WHEN the drag from A is released on C and Input resolves B, THEN the tie is refused with `duplicate` and no rope to C is made.
- **AC6b [Logic] (rule 3, F6)**: GIVEN rival keep A (360, 1060), B (360, 760) and C (360, 520), WHEN the rival calls `tie(A, C)`, THEN it is refused with `blocked` and no rope exists; `tie(A, B)` succeeds; with C″ (440, 520) in place of C, `tie(A, C″)` succeeds.
- **AC6c [Logic] (F6 boundaries)**: GIVEN `align_tolerance` 0, THEN only a keep exactly on the line o→t blocks (C′ (400, 520) is not blocked by B); GIVEN a keep exactly as far from o as t, THEN it never blocks t; GIVEN two blockers equally near o, THEN the lower id is returned.
- **AC7 [Integration: Rival AI] (rule 12)**: GIVEN the rival asks for an illegal tie, THEN it gets the same reason code as the player would, and the board is unchanged.

**Sending (Rules 4–6; F2)**

- **AC8 [Logic] (F2)**: GIVEN a rope tied at t = 10.0 s, THEN pawns are launched at 10.5, 11.1, 11.7 and 12.3 s (within one step), each with the rope's origin, target, owner and lane.
- **AC9 [Integration: Troop Generation] (rule 5)**: GIVEN a keep with 20 troops and one rope, WHEN 5 pawns are launched and no beat fires, THEN the keep still has 20 troops.
- **AC10 [Logic] (rule 5)**: GIVEN an owned keep with 0 troops and an Active rope, THEN pawns keep launching every 0.6 s until the keep is captured.
- **AC11 [Logic] (rule 4)**: GIVEN a rope in Extending state, THEN no pawn launches before 0.2 s + 0.3 s have elapsed.

**Cutting (Rules 7–9)**

- **AC12 [Integration: Touch & Mouse Input] (rule 7)**: GIVEN an Active player rope, WHEN `cut_swiped(rope, 0.5)` arrives, THEN on that step the rope is Fading, `rope_cut(rope, player)` is raised once, it holds no slot, and no pawn launches afterwards.
- **AC13 [Logic] (rule 8)**: GIVEN a rope with 3 pawns in flight, WHEN it is cut, THEN the 3 pawns still reach the target and act there (verified with Troop Marching's arrival count).
- **AC14 [Integration: Keep Levels] (rule 7)**: GIVEN a level 3 keep with ropes tied in order r1, r2, r3, WHEN `level_dropped(keep, 3, 2)` arrives, THEN only r3 is cut with reason `level_drop`; WHEN `level_dropped(keep, 2, 1)` follows, THEN r2 is cut and r1 remains.
- **AC15 [Integration: Troop Marching & Clashes] (rule 7)**: GIVEN keep K with 2 outgoing ropes and 1 incoming rope from enemy keep E, WHEN K is captured by E's side, THEN K's 2 outgoing ropes are cut with reason `capture`, and the incoming rope E→K stays Active (now reinforcing K).
- **AC16 [Logic] (rule 9)**: GIVEN rival ropes on the board, THEN the hit-test provider given to Input lists none of them but lists every keep with its owner, and a `cut` call naming a rival rope is ignored.
- **AC17 [Logic] (rule 8)**: GIVEN a rope cut at t = 20.0 s, THEN it is Gone at 20.9 s and absent from the HUD data after that.

**Relay (Rule 10; F3)**

- **AC18 [Integration: Troop Generation] (rule 10)**: GIVEN a full keep K (60 troops) with Active ropes to A and B (K→A tied first, so the lower `rope_id`), WHEN an allied pawn from C arrives, THEN K still has 60 troops, one `pawn_relayed` is raised, and a pawn is launched from K to A; the next such pawn goes to B.
- **AC19 [Logic] (F3)**: GIVEN the same K, WHEN pawns arrive from A, THEN each is launched to B (never back to A while B is Active).
- **AC20 [Logic] (F3 fallback)**: GIVEN full keep K whose only Active rope leads to A, WHEN a pawn from A arrives, THEN it is relayed back to A.
- **AC21 [Logic] (rule 10)**: GIVEN full keep K with no Active rope, WHEN an allied pawn arrives, THEN it is lost (no launch, no troop change) and a log line names the keep.
- **AC22 [Integration: Troop Marching & Clashes] (rule 10, loop)**: GIVEN three full allied keeps 260 px apart roped in a ring K1→K2→K3→K1, WHEN they run for 240 s, THEN no pawn is relayed more than 6 times (the next full keep loses it, `pawn_lost` reason `hops`) and the ring's pawn count settles (Troop Marching AC-M29) instead of growing.
- **AC23 [Logic] (rule 10, Extending)**: GIVEN full keep K with only an Extending rope, WHEN an allied pawn arrives, THEN it is relayed onto that rope and K's troops are unchanged.

**Lanes (Rule 11; F4)**

- **AC24 [Logic] (F4)**: GIVEN ropes A→B and B→A between enemies at (360, 1060) and (360, 760), THEN A→B is reported from (368, 1060) to (368, 760) and B→A from (352, 760) to (352, 1060); GIVEN only A→B, THEN it lies on x = 360.

**Data and invariants (R1–R4)**

- **AC25 [Logic] (R1)**: GIVEN `send_interval` 2.0 with `gen_interval` 2.5 and `gen_l3` 3, WHEN data loads in a development build, THEN it stops with an error naming R1 and the values; a shipped build lowers `send_interval` to just under 0.833 and logs it.
- **AC26 [Logic] (R2)**: GIVEN `rope_lane` 20 with `keep_hit_radius` 48, THEN R2 is reported; a shipped build clamps `rope_lane` to 12.
- **AC27 [Integration: Campaign Level Data] (R3)**: GIVEN a level whose longest keep pair is 1,258 px, `send_interval` 0.3 and `speed_min` 100, THEN the level loader reports R3 (needs ≥ 0.323) and the level does not load in either build, with `send_interval` unchanged; at `speed_min` 110 it loads (needs 0.293).
- **AC28 [Logic] (R4)**: GIVEN `rope_extend_time` 1.0 and `first_send_delay` 2.0, THEN R4 is reported; a shipped build lowers `first_send_delay` to 0.2.

**Cross-system, visual, feel and device**

- **AC29 [Integration: Level HUD] [Visual]**: Retained screenshots in `production/qa/evidence/` show a rope in each state (Extending, Active with a pulse, Fading with sag), a refused preview with the red cross and each refusal message, and two opposite enemy ropes 16 px apart.
- **AC30 [Visual / playtest]**: GIVEN a new player in level 1, WHEN they tie their first rope, THEN pawns are visibly marching within 1 s; playtest question: did the rope feel like it "took" immediately?
- **AC31 [Device]**: On the target phone, a level with 15 keeps, 30 Active ropes and 300 pawns in flight runs at 60 fps with Rope Links' own step cost under 0.2 ms (target to confirm).
- **AC32 [Logic] (F5)**: GIVEN the longest rope in each Green Vale layout (810–932 px), THEN `pawns_per_rope` (sent pawns) is at most 16 (932 / 66 = 14.1 → 15, + 1) and R3 passes for all five; GIVEN a 1,258 px rope, THEN 21.
- **AC32b [Logic] (order within a step)**: GIVEN keep K with ropes r5 (`rope_id` 5) and r2 (`rope_id` 2) both due to send on one step, THEN r2's pawn takes the lower `seq`; GIVEN a full K with `relay_ropes` r2 → A and r5 → B and a pawn relayed into K by keep C (its first origin D), THEN `pawn.from` is C and the relay takes r2 (`relay_count` 0); two identical runs give identical `seq` and relay choices.
- **AC32c [Logic] (rules 2, 8; Fading)**: GIVEN K→A Active between allied keeps, WHEN the player cuts it and ties K→A on the next step, THEN the tie succeeds (no `duplicate`); GIVEN instead A→K tied on the next step, THEN it succeeds (no `reverse`) and its lane offset is 0.
- **AC32d [Logic] (rule 8; cut timing)**: GIVEN K→A Active and due to send on step S, WHEN the player cuts it on step S, THEN it is Cutting from the cut, `ropes_held(K)` drops on S before phase 2, exactly one pawn launches from it on S, it is Fading at the end of S, and no pawn launches from it on S + 1; GIVEN K→A Cutting on step S, WHEN a later tie in S's phase 0 asks for K→A again, THEN it is accepted (not `duplicate`) and the new rope is Extending while the old one sends its last pawn; GIVEN a rival pass on step S that cuts k→P and ties k→Q with k at its slot limit, THEN both happen in that pass.
- **AC32e [Logic] (ties while Armed)**: GIVEN an Armed match with player keeps A (level 1), B and C, WHEN one frame accepts A→X and later frames before step 0 deliver A→Y, A→X, C→B and B→C, THEN after step 0's phase 0 the ropes are A→X and C→B only, and `tie_refused` is raised with `slots` (A→Y), `duplicate` (A→X) and `reverse` (B→C), in that order.
- **AC32f [Logic] (rope age)**: GIVEN a rope tied in step 100's phase 0, THEN its age on step 220 is 2.0 s; GIVEN a tie accepted while Armed, THEN its `tied_step` is 0.

**Coverage check:** every core rule (1–14) has at least one criterion; F1–F5 and R1–R4 each have one; boundaries at `send_interval` limits (AC25, AC27), rope end states (AC11, AC17), zero troops (AC10), empty relay set (AC21), Extending relay (AC23). Cross-system: AC4, AC6, AC7, AC9, AC12, AC14, AC15, AC18, AC27, AC29.

## Open Questions

| # | Question | Owner | Resolve by |
|---|----------|-------|------------|
| 1 | A keep at 0 troops still sends (rule 5, a direct consequence of free sending). Does a "ghost" stream from an almost-captured keep feel wrong in play? If so, the smallest change is "sends only while troops ≥ 1" | game-designer | First Godot playable |
| 2 | With the relay limit a ring of full keeps settles (≈ 83 pawns for 3 keeps, ≈ 319 for 5 keeps at 600 px). Confirm on a phone that a long ring stays within AC31's budget, and decide whether the HUD should hint "nothing is attacking" | gameplay-programmer, ux-designer | First phone playtest |
| 3 | Should the player be able to cut a rope by tapping its origin pin as well (a 'cut all from this keep' gesture)? The keyboard already has X for it | ux-designer | Vertical Slice |
| 4 | Rune rope look per race (human runes, beast sinew, elf vines, spirit light, dragon chains?) | art-director | Art bible |
| 5 | Closed (2026-11-22): both-ways allied ropes cannot arise (Edge Cases, "Two allied keeps can never rope each other both ways") | — | — |
| 6 | `rope_fade_time` 0.9 s and the sag are prototype values; retune with the art pass | art-director | Vertical Slice |
| 7 | Whether a god power may tie from a neutral keep or extend `max_ropes` beyond 3 for a time | God & Goddess Powers | Alpha |
