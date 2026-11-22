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
2. **A tie is legal when all of these hold** (checked in this order, and the first failure is the reason reported): the origin belongs to the side tying; the target is not the origin; no rope already runs origin→target; if the target is allied, no rope runs target→origin (the both-ways ban, the player's rule); the origin holds fewer ropes than `max_ropes[level]` (Keep Levels). Distance is never checked (the player's rule: no length limit).
3. **The target is the one Touch & Mouse Input resolved** (its F6: the nearer keep on the same line, when one blocks the way). If that keep fails rule 2, the tie is refused with the reason; Rope Links never substitutes a farther keep.
4. **Tying.** A legal tie creates the rope at once, raises `rope_tied(rope)`, and the rope spends `rope_extend_time` (0.2 s) extending from origin to target before it can send. The first pawn leaves `first_send_delay` (0.3 s) after extension; after that one pawn leaves every `send_interval` (0.6 s) while the rope is active.
5. **Sending is free and unconditional.** A pawn leaving never reduces the origin's troops (Troop Generation's Core Rule 5), and the rope sends whatever the origin's troop count, even 0, for as long as the origin stays owned by the rope's owner. The troop count is the keep's defence, not its ammunition.
6. **The pawn is handed to Troop Marching & Clashes** at launch with its origin, target, owner and lane (a relay also passes its unit, `hp` and relay count); Rope Links does not move it, fight it or deliver it.
7. **Cutting.** A rope is cut by the player (Input's `cut_tapped` or `cut_swiped`), by the rival (its own cut call), by Keep Levels (`level_dropped`: the origin's newest ropes are cut until its count fits the new level), or by capture of the origin (every outgoing rope of the captured keep is cut on Troop Marching & Clashes' `keep_captured`; `level_dropped` never cuts for a capture). Ropes **into** a captured keep are not cut: they keep sending, now as attacks on the new owner or as reinforcement if the captor was their owner.
8. **A cut rope stops sending at once**, raises `rope_cut(rope, reason)`, holds no slot any more, and fades for `rope_fade_time` (0.9 s) as a sagging line. Pawns already on it finish their march to the target and act there (the player's rule); the lane they were given is frozen for them.
9. **The player cuts only the player's ropes**, and the rival only its own. Rope Links is Touch & Mouse Input's hit-test provider (the player's decision): each step it gives every keep with its owner flag (tie targets and Input's F6 range over all keeps) and the player's Extending and Active ropes as the cuttable set, lane-adjusted, an Extending rope only over the part drawn so far. Fading ropes are not in the set.
10. **Relay at a full keep.** When an allied pawn arrives at a keep whose `troops` is at or above `troop_cap`, Troop Marching & Clashes reports it (`ally_arrived_full`) and Rope Links relays it: the pawn is launched again from that keep down one of its Extending or Active outgoing ropes, chosen round-robin (F3). A relay costs nothing and carries the pawn's unit, `hp` and relay count. If the keep has no such rope, the pawn is lost (the player's rule). Loops of full keeps are allowed; a pawn circulates until it has been relayed `relay_hops_max` (6) times and is then lost at the next full allied keep (Troop Marching & Clashes rule 13; the player's decision, 2026-11-22).
11. **Lanes.** Two ropes between the same two keeps in opposite directions (only possible between enemies, by rule 2) are each offset `rope_lane` (8 px) to their own right, so both are visible and their pawns clash in the open (Troop Marching). A lone rope lies on the straight line.
12. **The rival uses the same calls** (`tie`, `cut`) and gets the same refusals; Rival AI decides what to try, Rope Links decides what is allowed.
13. **Events** for the HUD, effects and the tutorial: `rope_tied`, `rope_cut(reason: player | rival | level_drop | capture)`, `tie_refused(origin, target, reason)`, `pawn_launched`, `pawn_relayed`.
14. **Data.** `send_interval`, `rope_extend_time`, `first_send_delay`, `rope_fade_time`, `rope_lane`, `pawns_per_rope_max` are data-file values. In Alpha, Factions may change `send_interval` per race inside Troop Generation's invariant I3; God & Goddess Powers may add temporary rope effects through their own GDD.

### States and Transitions

| State | Meaning | Sends? | Holds a slot? | Cuttable? | Leaves when |
|-------|---------|--------|---------------|-----------|-------------|
| Extending | Just tied; the line grows from origin to target over `rope_extend_time` | No (but relays, rule 10) | Yes | Yes (by the player's swipe; it is in the cuttable set) | Time elapses → Active; cut → Fading |
| Active | The rope's send timer runs; a pawn leaves every `send_interval` | Yes | Yes | Yes | Cut (any reason) → Fading; origin captured → Fading (reason capture) |
| Fading | Cut; sags and fades over `rope_fade_time` | No | No | No | Time elapses → Gone |
| Gone | Removed | | | | |

A tie that is refused creates no rope and no state; it raises `tie_refused`. Pawns are not rope states: once launched they belong to Troop Marching & Clashes, whatever happens to the rope.

### Interactions with Other Systems

| System | Direction | Data | Interface owner |
|--------|-----------|------|-----------------|
| Touch & Mouse Input | in/out | In: `tie_released(from, to)` (to already resolved by F6), `cut_tapped(rope)`, `cut_swiped(rope, t)`. Out: the hit-test provider (every keep with its owner flag; the player's Extending and Active ropes as lane-adjusted segments); whether a previewed tie is legal and why not, for the preview's red cross | Input defines the events; Rope Links defines legality and supplies the provider |
| Keep Levels | in | `max_ropes[level]` for rule 2; `level_dropped(keep, old, new)` → cut newest ropes beyond the new limit | Keep Levels defines the limit and "newest falls"; Rope Links executes |
| Troop Generation | in/out | In: `troops` and `troop_cap`, to know when a keep is full (rule 10). Out: nothing that changes `troops` (sending is free). `send_interval` is this GDD's, and Troop Generation's invariant I3 bounds it | Rope Links owns `send_interval`; Troop Generation owns the count |
| Troop Marching & Clashes | out/in | Out: `pawn_launched(origin, target, owner, lane)` at every send and relay (a relay also passes unit, `hp`, relays). In: `ally_arrived_full(keep, pawn)` with the pawn's origin, so rule 10 can relay it; `keep_captured`, so rule 7 cuts the keep's outgoing ropes | Rope Links launches; Troop Marching moves, fights and delivers |
| Rival AI | in | `tie(origin, target)` and `cut(rope)` calls, answered with the same refusals as the player's | Rope Links |
| Level HUD | out | Each rope's state, end points and lane, for drawing the rune rope, its extension, its sag and the pins; `tie_refused` for the message strip | Rope Links raises; Level HUD draws |
| Feedback & Juice | out | `rope_tied`, `rope_cut`, `pawn_relayed` for the snap sound, sparks and the relay flicker | Rope Links raises |
| Tutorial & Onboarding | out | `rope_tied` and `rope_cut` with reason player, to tell that the first tie and the first cut happened | Rope Links raises |
| Campaign Level Data | none | Keep positions come through the keeps themselves; Rope Links never reads level files | Campaign Level Data |
| Factions, God & Goddess Powers (Alpha) | in | `send_interval` override per race (inside I3); temporary rope effects | Their GDDs |

## Formulas

`systems-designer` lens applied by the author (Lean mode: Section D is a high-risk section). Boundaries worked below.

### F1. Tie legality

The tie_legal formula is defined as:

`tie_legal(o, t) = first failing check of [o.owner = side, t ≠ o, ¬rope(o→t), ¬(t.owner = o.owner ∧ rope(t→o)), ropes_held(o) < max_ropes(o.level)]`, giving `ok` or one of `not_yours`, `self`, `duplicate`, `reverse`, `slots`.

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| o, t | keep | | calculated | Origin and resolved target |
| side | owner | player or rival | calculated | Who is tying |
| ropes_held(o) | int | 0–3 | calculated | Active or extending ropes from o |
| max_ropes(level) | int | 1–3 | calculated (Keep Levels F3) | Slots at o's level |

**Output Range:** `ok` or one reason. No distance term (unlimited length).
**Example:** a level 2 player keep holding 2 ropes, tie to a neutral: `slots`. The same keep holding 1 rope, tie to an allied keep that already ropes it: `reverse`. Tie to a rival keep that ropes it: `ok` (enemy ropes may cross).

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
| relay_ropes(k) | list | 0–3 ropes | calculated | Keep k's Extending and Active ropes |
| pawn.from | keep | | calculated (Troop Marching) | Where the arriving pawn was launched from |
| relay_count(k) | int | ≥ 0 | calculated | Per-keep counter, reset at match start |

**Output Range:** one rope, or lost. With two ropes the relay alternates; with one it always takes it, even back toward the sender if that is the only rope.
**Example:** full keep K with ropes to A and B, a pawn arrives from A: candidates {B}; next pawn from A: {B} again (A is excluded, so B every time); a pawn from C: {A, B}, alternating. The exclusion matters only for a pawn still finishing a cut rope's march (A→K cut, then K→A tied): it is not sent straight back.

### F4. Lane offset

The lane_offset formula is defined as:

`offset(o→t) = rope_lane × right_normal(t − o)` when a rope t→o also exists; `0` otherwise. `right_normal(v) = (−v.y, v.x) / |v|` in y-down screen coordinates (the unit vector on v's right-hand side).

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
| rope_length | float, px | up to the table's diagonal, ~1,470 | calculated | Distance origin→target |
| speed_min | float, px/s | baseline 110 (`pawn_speed`) | data file (Troop Marching & Clashes F8) | Slowest unit speed the level can launch; one value at MVP |

**Output Range:** at baseline 24 pawns on the longest possible rope, 5 on a typical 260 px rope. With 15 keeps × 3 ropes the worst case is about 1,080 sent pawns; a real level is far below it.
**Example:** 1,470 / (110 × 0.6) = 22.3 → 23, + 1 = 24 pawns.

### Invariants (checked when the data is loaded; the loader reports a breach)

- **R1.** `send_interval < gen_interval / gen_l3` (Troop Generation's I3 from this side): one rope always out-sends a level 3 keep. Baseline 0.6 < 0.833.
- **R2.** `rope_lane ≤ keep_hit_radius / 4`, so an offset rope still starts inside its keep's touch area and a cut tap near a keep is still a keep press (Input's Core Rule 3). Baseline 8 ≤ 19.5.
- **R3.** `pawns_per_rope` (F5) at the longest rope in the level ≤ `pawns_per_rope_max` (40), so a fast `send_interval` cannot flood a level: `send_interval ≥ longest_rope / (speed_min × 39)`. Baseline needs ≥ 0.343 s on the diagonal; 0.6 passes. Campaign Level Data checks it per level.
- **R4.** `rope_extend_time + first_send_delay ≤ send_interval × 2`, so a new rope is felt within two send beats. Baseline 0.5 ≤ 1.2.

**Boundary findings (inputs that break the system without the invariants):**
- `send_interval` 0.3 (its minimum): 3.3 pawns/s per rope, 46 pawns on the diagonal; R3 catches it on a big map (needs ≥ 0.343) and the level fails to load rather than stutter.
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
- **If F6 redirects to a keep that fails rule 2**: refused with that reason; no tie to the farther keep (Input's Core Rule 14 agrees).
- **If the rival and the player tie opposite ropes on the same frame**: both succeed (enemy pairs are allowed) and both get lanes (F4).
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
- **If a rope is cut while a pawn is being launched on that step**: the launch of that step still happens (sending is decided before cuts within a step; the full per-step order is in Troop Marching & Clashes § Formulas); the next step sends nothing.
- **If the origin is captured and re-captured by its old owner within the fade time**: the old ropes are Fading and never revive; the keep starts at level 1 with no ropes.
- **If the player cuts a rope the rival owns** (a forged or stale `cut`): ignored; the cuttable set never contains it.

**Data and limits**
- **If the loader finds a breach of R1–R4**: development builds stop with an error naming the rule and the values; shipped builds clamp (`send_interval` to the nearest value inside R1 and R3, `rope_lane` down to the R2 limit, `first_send_delay` down to fit R4) and log it.
- **If a level's longest possible rope breaches R3 at baseline**: Campaign Level Data reports it at load (its invariant), and the level is not shipped that way.
- **If sent pawns on a rope exceed `pawns_per_rope_max`** (a defect; R3 should prevent it; relayed pawns are not counted): the rope skips sends until it is below the bound and logs it, rather than dropping pawns.

**Open, owned by other GDDs** (not decided here):
- What a pawn does on arrival (absorb, damage, capture, clash on the way): decided in Troop Marching & Clashes.
- Whether a god power may tie a rope from a neutral keep or lengthen fade: God & Goddess Powers.

## Dependencies

Keep Levels, Touch & Mouse Input, Troop Generation and Troop Marching & Clashes have GDDs and their contracts are checked below. Every other system here has no GDD yet; its contract is provisional.

### Depends on (upstream)

| System | Kind | What this system needs | Status |
|--------|------|------------------------|--------|
| Keep Levels | Hard | `max_ropes[level]`; `level_dropped` to know what to cut (capture cuts come from Troop Marching) | Checked: its Core Rules 5–7, F3, F4 and AC9–AC12 match rules 2, 7 and F1 |
| Touch & Mouse Input | Hard | `tie_released` with the F6 target, `cut_tapped`, `cut_swiped`; it expects the hit-test provider and the preview legality in return | Checked: its Core Rules 4, 7, 8, 14, Interactions and AC14 match rules 3, 9 and F1 |
| Level State & Match Flow | Hard | Initialisation at build (no ropes, `relay_count` 0); the match state. Rope timers run only while the match is Running: not while Armed (before the first rope on a level that waits) and not after the deciding step. `rope_tied` from the first accepted tie starts the level clock on an Armed level (its Core Rule 2) | Added 2026-11-22 from that GDD; not yet re-checked here |
| Troop Generation | Soft (data read) | `troops` and `troop_cap` to detect a full keep | Checked: its Core Rule 6, Interactions and edge case "at the cap … Rope Links relays it" match rule 10 |
| Troop Marching & Clashes | Hard (runtime) | `ally_arrived_full(keep, pawn)` with the pawn's origin, unit, `hp` and relays; `keep_captured`; `pawn_speed` / `speed_min`; the relay limit | Checked: its rules 1, 10–13, F6, F8, F9 match rules 6, 7, 10, F5 and R3. Not a design cycle: Rope Links launches, Marching delivers and reports |

### Depended on by (downstream)

| System | Kind | What it takes from this system |
|--------|------|-------------------------------|
| Troop Marching & Clashes | Hard | `pawn_launched(origin, target, owner, lane)`; the lane for clash geometry |
| Rival AI | Hard | `tie`, `cut` and their refusals; the rope list to read the board |
| Level HUD | Hard | Rope states, end points, lanes; `tie_refused` messages |
| Feedback & Juice | Soft | `rope_tied`, `rope_cut`, `pawn_relayed` |
| Tutorial & Onboarding | Soft | First tie and first cut |
| Touch & Mouse Input | Hard | The hit-test provider (every keep with its owner; the player's cuttable ropes) and preview legality |
| God & Goddess Powers (Alpha) | Soft | Rope effects through this GDD's data and events |
| Campaign Level Data | Soft (a rule it must check) | Invariant R3 per level (longest rope against `send_interval` and `pawn_speed`) |

### Consistency to fix

- `touch-mouse-input.md:49`, `:248` name "the Level screen" as the hit-test provider and `:77` lists only the player's keeps; both must read "Rope Links (rule 9), every keep with its owner" (the player's decision, 2026-11-22).
- `game-concept.md:79` "A full keep never loses arriving allied troops while it has an outgoing rope" must add "except a pawn past the relay limit (6 relays)".
- Registry: add rope-links.md to `referenced_by` for `gen_interval`, `gen_amount_level_3`, `generation_rate`; register `pawns_per_rope_max` (40).

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

- **Refusal messages** in the Level HUD's bottom strip, one per reason: `slots` → "Level L keep: only N ropes. Grow it or cut one." (N = `max_ropes[L]`); `reverse` → "That keep already ropes this one."; `duplicate` → "Already roped."; `not_yours` → "Only your keeps can tie ropes."; `self` → no message (the drag simply ends). Each shows for about 2.4 s.
- **Slot dots** under each owned keep (Keep Levels and Troop Generation already place them): filled per Active or Extending rope.
- **Preview**: the drag preview snaps to the resolved target and shows a red cross when F1 would refuse (Input's Visual/Audio section).
- **Controls on the Title** list "drag to tie, swipe or tap a rope to cut" (Input owns the wording).
- **Rival ropes** are visible but not interactive. The rival's keeps show slot dots like the player's (as Keep Levels and Troop Generation state), so the player can read the rival's spare capacity (the player's decision, 2026-11-22).

> **UX Flag — Rope Links**: This system has UI requirements. In Pre-Production, run `/ux-design` for the message strip, the preview states and the slot dots before writing epics. Stories that reference UI should cite `design/ux/[screen].md`, not this GDD directly.

## Cross-References

Keep Levels, Touch & Mouse Input, Troop Generation and Troop Marching & Clashes exist and are checked; the other referenced GDDs are still to be written and their entries are provisional.

| This GDD uses | Owned by | Item |
|---------------|----------|------|
| `max_ropes[level]`, `level_dropped`, "newest falls", refusal text for `slots` | Keep Levels | Rules 2, 7; F1; UI Requirements |
| `tie_released` with the F6 target, `cut_tapped`, `cut_swiped(rope, t)`, hit-test provider, preview legality, "never a farther keep" | Touch & Mouse Input | Rules 3, 7, 9; Interactions |
| Sending is free (its Core Rule 5); relay at `troop_cap` (its Rule 6 and edge case); invariant I3 on `send_interval`; `gen_interval`, `gen_l3` | Troop Generation | Rules 5, 10; R1 |
| `pawn_speed` (110 px/s), `speed_min` (F8); `ally_arrived_full`, `keep_captured`; the relay limit (its rule 13, F9); clash geometry on lanes | Troop Marching & Clashes | F5, R3; rules 6, 7, 10 |
| Longest rope per level for R3 | Campaign Level Data | R3 |
| Rope and pin drawing, message strip | Level HUD | Visual/Audio, UI Requirements |
| `send_interval` per race; rope effects | Factions, God & Goddess Powers | Rule 14 |
| `keep_hit_radius` (78) | Touch & Mouse Input | R2 |

## Acceptance Criteria

Baseline data unless stated: `send_interval` 0.6 s, `rope_extend_time` 0.2 s, `first_send_delay` 0.3 s, `rope_fade_time` 0.9 s, `rope_lane` 8 px, `troop_cap` 60, `max_ropes` 1/2/3, `pawn_speed` 110 px/s, step 1/60 s. Tags: **[Logic]** automated unit test with keeps and events injected; **[Integration]** automated test with the named system; **[Visual]** screenshot or playtest; **[Device]** on the target phone. `qa-lead` lens applied by the author (Lean mode: Section H is a high-risk section).

**Legality (Rules 1–3, 12; F1)**

- **AC1 [Logic] (rule 1)**: GIVEN a neutral keep N, WHEN the player or the rival asks to tie N→X, THEN the tie is refused with `not_yours` and no rope exists.
- **AC2 [Logic] (F1 order; injected state, cannot arise in play)**: GIVEN a player keep A (level 1, 1 rope held to B) and allied keep B that already ropes A, WHEN the player ties A→B, THEN the refusal reason is `duplicate` (checked before `reverse` and `slots`).
- **AC3 [Logic] (rule 2, reverse)**: GIVEN allied keeps A and B with rope B→A, WHEN the player ties A→B, THEN `reverse` and no rope; GIVEN B is the rival's with rope B→A, THEN A→B succeeds and both ropes exist.
- **AC4 [Integration: Keep Levels] (rule 2, slots)**: GIVEN a level 2 keep holding 2 ropes, WHEN a third tie is attempted, THEN `slots` with the message "Level 2 keep: only 2 ropes. Grow it or cut one."; WHEN the keep rises to level 3, THEN the tie succeeds.
- **AC5 [Logic] (rule 2, no distance)**: GIVEN keeps at opposite corners of the table (about 1,470 px apart), WHEN tied, THEN the tie succeeds.
- **AC6 [Integration: Touch & Mouse Input] (rule 3)**: GIVEN B is already roped from A and C lies beyond B on the same line, WHEN the drag from A is released on C and Input resolves B, THEN the tie is refused with `duplicate` and no rope to C is made.
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

- **AC18 [Integration: Troop Generation] (rule 10)**: GIVEN a full keep K (60 troops) with Active ropes to A and B, WHEN an allied pawn from C arrives, THEN K still has 60 troops, one `pawn_relayed` is raised, and a pawn is launched from K to A; the next such pawn goes to B.
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
- **AC27 [Integration: Campaign Level Data] (R3)**: GIVEN a level whose longest keep pair is 1,470 px and `send_interval` 0.3, THEN the level loader reports R3 (needs ≥ 0.343) and the level does not load.
- **AC28 [Logic] (R4)**: GIVEN `rope_extend_time` 1.0 and `first_send_delay` 2.0, THEN R4 is reported; a shipped build lowers `first_send_delay` to 0.2.

**Cross-system, visual, feel and device**

- **AC29 [Integration: Level HUD] [Visual]**: Retained screenshots in `production/qa/evidence/` show a rope in each state (Extending, Active with a pulse, Fading with sag), a refused preview with the red cross and each refusal message, and two opposite enemy ropes 16 px apart.
- **AC30 [Visual / playtest]**: GIVEN a new player in level 1, WHEN they tie their first rope, THEN pawns are visibly marching within 1 s; playtest question: did the rope feel like it "took" immediately?
- **AC31 [Device]**: On the target phone, a level with 15 keeps, 30 Active ropes and 300 pawns in flight runs at 60 fps with Rope Links' own step cost under 0.2 ms (target to confirm).
- **AC32 [Logic] (F5)**: GIVEN the longest rope in each prototype layout, THEN `pawns_per_rope` (sent pawns) is at most 24 and R3 passes for all five layouts.

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
