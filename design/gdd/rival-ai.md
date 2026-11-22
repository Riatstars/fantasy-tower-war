# Rival AI

> **Status**: Designed (pending /design-review in a fresh session)
> **Author**: user + Claude
> **Last Updated**: 2026-11-22
> **Last Verified**: 2026-11-22
> **Creative Director Review (CD-GDD-ALIGN)**: skipped — Lean mode
> **Implements Pillar**: 2. A tug-of-war you read at a glance (`design/gdd/game-concept.md` § Pillars)

## Summary

Rival AI is the single opponent in every level. Every few seconds it scores every legal rope from each of its keeps and ties the best one (defend a threatened keep, rope back at a keep roping it, take a beatable neutral, or hit a weak player keep), and cuts ropes that have stopped paying. It uses only the player's verbs and the player's information, gets harder through two per-level numbers (`think`, `aggro`), and turns aggressive when nothing has changed hands for a while so no level ends in a standoff.

> **Quick reference** — Layer: `Feature` · Priority: `MVP` (UAT-1) · Key deps: `Rope Links, Troop Marching & Clashes, Keep Levels, Level State & Match Flow, Campaign Level Data (data)`

## Overview

Rival AI is the one opponent in every level. It plays the same game as the player with the same two verbs: every few seconds it looks at the board and ties or cuts ropes from its own keeps, using Rope Links' `tie` and `cut` calls and taking the same refusals. It has no information the player lacks and no rope the player could not have. Its job is to expand into neutral keeps, defend keeps that are under attack, rope back at keeps that rope it so the marches clash, and attack the player's thinnest keep when it is strong enough to win there. How fast it thinks and how readily it attacks are two numbers per level (`think`, `aggro`) that Campaign Level Data sets, so the campaign gets harder by changing data, not rules. A stall breaker raises its aggression when nothing has changed hands for a while, so no level ends in a standoff. On a level that waits for the player's first rope it does nothing until Level State says the clock has started, and it stops at the deciding step. The player meets this system as the red ropes that answer theirs: the pressure that makes a level a tug-of-war rather than a race against nobody. Without it the game has no opponent.

## Detailed Design

### Core Rules

1. **One mind, the player's verbs.** All the rival's keeps are run by one decision pass. It acts only through Rope Links' `tie(origin, target)` and `cut(rope)` and receives the same refusals as the player (`not_yours`, `self`, `duplicate`, `reverse`, `slots`); it never bypasses `tie_legal`, never cuts a rope it does not own, and never touches a pawn or a troop count. It reads the board through the same facts the HUD draws: every keep's `owner`, `troops` and `level` (Troop Generation, Keep Levels), the rope list (Rope Links) and `incoming(keep, owner)` (Troop Marching & Clashes rule 15). It has no hidden information.
2. **Per-level data.** Campaign Level Data gives each level `think` (seconds between decisions, 1.4–3.0 at the prototype's values) and `aggro` (0–1, how readily it attacks the player; level 1 uses 0.3, the prototype's value, decided 2026-11-22). Global knobs are `ai_think_scale` (1.8, multiplies every `think`), `ai_min_send` (6), the stall breaker's `stall_time` and `stall_boost`, and the scoring weights in Formulas. Difficulty across the campaign is data, never a rule change.
3. **Seeded randomness** (decided 2026-11-22). The rival owns one random stream seeded from the level record's `rival.seed` alone (an integer and a required field, Campaign Level Data B4) and reseeded every time a match is built (Level State rule 1), so a Restart, Retry or later attempt starts the same stream: the seed is fixed per level (Campaign Level Data rule 6). It is used for exactly two things: the think-interval jitter (F1) and the scoring noise (F3). Nothing else in the match uses it. The same level, seed and player actions on the same steps give the same rival (Level State rule 11 and its AC22; this GDD's AC21). **Draw order** (decided 2026-11-22): the first draw is the first think interval (F1), made at `clock_started`. In a decision pass, cuts draw nothing; ties visit the rival's keeps in rule 6's order (strongest first, ties by lower keep id) and, for each keep, its candidates in ascending keep id, with one `rng()` draw per scored candidate (a skipped keep or an unscored target draws nothing); the next think interval is drawn last, at the end of the pass.
4. **When it thinks.** A think timer counts game steps (never the wall clock, never while paused). It starts when Level State raises `clock_started` and first fires one full interval later, so the player always has the first move. Each time it fires, one decision pass runs and the timer is reset to F1. The pass runs inside the step, between generation beats and rope sends (phase 1 and phase 2 of Troop Marching's per-step order), so it sees this step's troop counts. Its cuts free their slots at once, but a rope cut on a step still sends a pawn due on that step (Rope Links rule 8, decided 2026-11-22); its new ropes start Extending and send nothing on this step.
5. **A decision pass, part 1: cuts.** For every rope the rival holds, in rope-creation order:
   - a rope to one of its own keeps t is cut when t is no longer under threat (`threat(t) < t.troops × relieve_ratio`, 0.5) and the rope is older than `rope_min_age` (2 s): reinforcement that is no longer needed frees the slot;
   - a rope to a player keep t is cut when t has grown past the origin by `cut_margin` (12 troops): the attack has become a feed for the player's relay (Rope Links rule 10). *(The prototype cut such a rope half the time; this GDD cuts it every time, so the check is deterministic without the random stream.)*
   The prototype's third cut, "a nearly empty keep under heavy threat cuts all its ropes", is dropped: sending is free (Troop Generation rule 5), so the ropes of a doomed keep cost it nothing and are cut on capture anyway.
6. **A decision pass, part 2: ties.** For every rival keep k with a free slot (`ropes_held(k) < max_ropes[k.level]`), strongest first (highest `troops`, ties by lower keep id): skip k if `k.troops < ai_min_send` and `threat(k) = 0` (a small keep in no danger keeps building); otherwise score every keep t with `tie_legal(k, t) = ok` by F3 and tie k→t for the best score above 0. One new rope per keep per pass, so the rival's board changes one rope at a time per keep and the player can read it.
7. **What F3 rewards, in order.** Reinforcing an own keep that is about to fall (threat within `defend_margin` of its troops) comes first; roping back at a player keep that ropes k second, so the marches clash in the open (Troop Marching rule 7); taking a neutral the rival can beat third; attacking a player keep last, and only when `k.troops × aggro_eff > t.troops + attack_margin` (4). Distance counts against every target at `dist_scale` (25 px per point). The noise (0–`noise_max`, 6) breaks near-ties and keeps the rival from always doing the same thing.
8. **The stall breaker** (decided 2026-11-22). A stall counter counts steps since the last `keep_captured` by either side (it starts at `clock_started`). While it is below `stall_time` (45 s), `aggro_eff = aggro`. Each further `stall_time` without a capture adds `stall_boost` (0.2) to `aggro_eff`, capped at 1 (F4). Any capture resets the counter and `aggro_eff` to `aggro`. The player sees the rival turn on them when the board has sat still, which is the one thing that reliably ends a standoff; no draw rule and no match timer exist (Level State edge cases).
9. **It never attacks before the clock starts and never acts after the match ends.** Before `clock_started` (Level State's Armed state) the timer does not run. At `match_ending` the timer stops and no further pass runs; ropes it holds stay as they are and freeze with the board (Level State rule 4).
10. **Both sides, one rule.** Its pawns, keeps, levels and ropes obey every rule the player's do: capture cuts its outgoing ropes, a level drop cuts its newest rope, a full keep relays, the relay limit applies. The rival is given nothing by this GDD except decisions.
11. **UAT-1 scope.** It plays the baseline unit (`unit_for` returns it for every keep). From UAT-2, Factions assigns the rival a race per level or region (`game-concept.md` open question) and Unit Roster's `strength` changes what `threat` and `troops` mean; F2 and F3 are written in strength so they carry over.
12. **Data.** Every value named in this section and in Formulas is a data-file value: the per-level `think`, `aggro`, `rival.seed` in the level record; the rest in the rival's tuning file. None is hardcoded.

### States and Transitions

| State | Meaning | Think timer | Enter when | Leave when |
|---|---|---|---|---|
| Waiting | The match is built; the clock has not started (Level State Armed, or Loading) | Stopped at one full interval | Match built | `clock_started` → Active |
| Active | Playing: the timer counts, passes run when it fires | Running (not while paused) | `clock_started` | `match_ending` → Stopped; the match discarded → gone |
| Stopped | The outcome is decided; no further pass | Stopped | `match_ending` | The match is discarded (Retry, Next level, World Map) |

Inside Active, the stall breaker is a counter, not a state: `aggro_eff` is read from it at each pass (F4). A decision pass is instantaneous within one step and has no state of its own: it cannot be interrupted, and Pause between steps simply delays the next fire.

### Interactions with Other Systems

| System | Direction | What flows | Owner of the interface |
|---|---|---|---|
| Rope Links | out/in | Out: `tie(origin, target)`, `cut(rope)`. In: the refusal reason, the rope list (origin, target, owner, age), `ropes_held(k)` | Rope Links (rules 7, 9, 12) |
| Troop Marching & Clashes | in | `incoming(keep, owner)` for `threat`; `keep_captured` resets the stall counter; the per-step order gains a rival-decision phase between its phases 1 and 2 | Troop Marching owns the queries and the order |
| Troop Generation | in | `owner`, `troops` of every keep | Troop Generation |
| Keep Levels | in | `level` of every keep and `max_ropes[level]`, for free slots | Keep Levels |
| Level State & Match Flow | in | `clock_started` (start the timer), `match_ending` (stop); the pause state through Level State (no step, no count) | Level State |
| Campaign Level Data | in | Per level: `think`, `aggro`, `rival.seed`, and which keeps the rival starts with | Campaign Level Data fills the record this GDD and Level State define |
| Level HUD | out | Nothing beyond what the board already shows; the rival has no HUD of its own. A debug overlay (scores per target, `aggro_eff`, the stall counter) is for development builds only | Level HUD / tools |
| Unit Roster & Stats, Factions (UAT-2) | in | `unit_for(rival, level)`; the rival's race per level or region | Their GDDs |
| Guardian Castles (Alpha) | in/out | A guardian's level may override `think` and `aggro` or add behaviours through this GDD's data, not new rules | Guardian Castles |
| Tutorial & Onboarding (after UAT) | in | May ask for `aggro` 0 and a long `think` on a tutorial level: both are data | Tutorial |

## Formulas

All distances are in table pixels on the 720 × 1,280 logical table; time is in game steps (1/60 s) and shown in seconds. `rng()` is the rival's seeded stream (rule 3), uniform in [0, 1).

### F1. Think interval

The think_interval formula is defined as:

`think_steps = round(60 × think × ai_think_scale × (1 − jitter + 2 × jitter × rng()))`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| think | float, s | 0.5–10 (baseline 3.0 on level 1, 1.4 on the fifth) | data file (level record) | Base seconds between passes for this level |
| ai_think_scale | float | 0.3–4 (baseline 1.8) | data file | Global multiplier; higher is a slower rival |
| jitter | float | 0–0.5 (baseline 0.2) | data file | Half-width of the interval's spread |
| rng() | float | [0, 1) | calculated (seeded) | The rival's stream |

**Output Range:** at baseline level 1: 3.0 × 1.8 = 5.4 s, jittered 4.32–6.48 s (259–389 steps). Level 5: 1.4 × 1.8 = 2.52 s, 2.02–3.02 s. At the minimum of every knob (0.5 × 0.3 × 0.5) the interval is 0.075 s, 4–5 steps: the rival re-decides almost every frame, legal but unreadable; the safe floor is about 1 s. Never 0: `round` of a positive value with `think ≥ 0.5` and `ai_think_scale ≥ 0.3` is at least 4 steps, and `jitter ≤ 0.5` keeps the factor positive.
**Example:** level 1, `rng()` = 0.25: factor 0.8 + 0.4 × 0.25 = 0.9; 60 × 3.0 × 1.8 × 0.9 = 291.6 → 292 steps, 4.87 s.

### F2. Threat to a keep

The threat formula is defined as:

`threat(k) = incoming(k, enemy_of(k.owner))`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| incoming(k, o) | int, strength | 0–`pawns_in_flight_max` × max strength | calculated (Troop Marching rule 15) | Sum of `hp` of o's pawns heading for k |
| enemy_of(owner) | enum | player ↔ rival | calculated | For a rival keep, the player; for a player keep the rival is asking about, the rival itself; for a neutral, both sides summed |

**Output Range:** 0 upwards; at UAT-1 strength 1 it is a pawn count. The prototype counted pawns; this formula counts strength, so it is unchanged in UAT-1 and correct from UAT-2.
**Example:** 4 player pawns (hp 1, 1, 2, 3) heading for rival keep K: `threat(K)` = 7 (Troop Marching AC-M35 uses the same numbers).

### F3. Target score

The target_score formula is defined as, for an origin k and a candidate t with `tie_legal(k, t) = ok`, `d = dist(k, t) / dist_scale`:

```
score(k, t) =
  own keep,     threat(t) > 0 and threat(t) ≥ t.troops − defend_margin :  w_defend − d
  player keep,  rope(t → k) exists                                       :  w_counter − d
  neutral                                                                :  w_neutral − neutral_per_troop × t.troops − d + (k.troops > t.troops ? neutral_bonus : neutral_penalty)
  player keep,  k.troops × aggro_eff > t.troops + attack_margin          :  w_attack − attack_per_troop × t.troops − d + attack_aggro × aggro_eff
  otherwise                                                              :  no score (not a candidate)
plus noise_max × rng() on every scored candidate; tie k → argmax if that max > 0
```

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| dist(k, t) | float, px | 1–1,258 | calculated | Centre distance on the table (the maximum is the longest legal rope at baseline, Campaign Level Data F1) |
| dist_scale | float, px | 10–100 (baseline 25) | data file | Pixels per point of distance penalty |
| w_defend | float | 0–200 (80) | data file | Base score for reinforcing a threatened own keep |
| defend_margin | int, strength | 0–20 (2) | data file | How close the threat must be to the garrison to count as "about to fall" |
| w_counter | float | 0–200 (46) | data file | Roping back at a keep that ropes k |
| w_neutral | float | 0–200 (52) | data file | Base for a neutral |
| neutral_per_troop | float | 0–10 (2) | data file | Penalty per neutral troop |
| neutral_bonus / neutral_penalty | float | −50–50 (+10 / −15) | data file | Whether k out-garrisons the neutral |
| w_attack | float | 0–200 (40) | data file | Base for attacking a player keep |
| attack_per_troop | float | 0–10 (1.5) | data file | Penalty per defending troop |
| attack_margin | int, strength | 0–30 (4) | data file | Required surplus of `k.troops × aggro_eff` over the target |
| attack_aggro | float | 0–100 (22) | data file | Reward scaled by aggression |
| aggro_eff | float | 0–1 | calculated (F4) | Effective aggression |
| noise_max | float | 0–30 (6) | data file | Upper bound of the seeded noise |

**Output Range:** the best case is a threatened own keep next door: about 80 + 6 = 86. The furthest legal target (1,258 px at baseline, d ≈ 50.3) costs 50.3 points, so a far neutral with 12 troops scores 52 − 24 − 50.3 + 10 = −12.3 and, with noise at most 6, is never tied, while defending a far own keep still scores 29.7: the rival defends across the map but expands locally, which reads well. Attacks from a 0-troop keep are impossible (`0 × aggro_eff > t.troops + 4` is false). At `aggro_eff` 0 (a tutorial level) the rival never attacks a player keep except by roping back. At `aggro_eff` 1 against a player keep of 10 from a keep of 15: 15 > 14, score 40 − 15 − d + 22 = 47 − d, which beats a neutral of the same distance with 12 troops (52 − 24 + 10 = 38): a maxed-out rival prefers the fight.
**Example:** level 1, k has 12 troops. Candidates: own keep A, 300 px, threat 5 against 6 troops → 80 − 12 = 68; neutral N, 250 px, 6 troops → 52 − 12 − 10 + 10 = 40; player keep P, 500 px, 8 troops, ropes k → 46 − 20 = 26; player keep Q, 500 px, 8 troops, no rope: 12 × 0.3 = 3.6 > 12 is false → not a candidate. With noise the order stays A, N, P; the rival reinforces A.

### F4. Effective aggression (the stall breaker)

The aggro_eff formula is defined as:

`aggro_eff = min(1, aggro + stall_boost × floor(stall_steps / (60 × stall_time)))`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| aggro | float | 0–1 (level 1: 0.3; level 5: 1.0) | data file (level record) | The level's base aggression |
| stall_steps | int | ≥ 0 | calculated | Steps since the last `keep_captured` by either side, or since `clock_started` |
| stall_time | float, s | 15–180 (45) | data file | One stall period |
| stall_boost | float | 0–1 (0.2) | data file | Added per full period |

**Output Range:** `aggro` to 1. At baseline level 1 the rival reaches 0.5 after 45 s without a capture, 0.7 after 90 s, 0.9 after 135 s and 1.0 from 180 s; a 2–3 minute level that stalls completely has a fully aggressive rival by its end. `stall_boost` 0 switches the breaker off. Any capture resets `stall_steps` to 0, so a level where keeps keep changing hands never escalates.
**Example:** `aggro` 0.3, no capture for 100 s: floor(6,000 / 2,700) = 2 → 0.3 + 0.4 = 0.7.

### F5. Cut tests

The cut_tests are defined as, for a rope r from k to t that the rival holds:

`cut_relieved = (t.owner = rival) ∧ (threat(t) < relieve_ratio × t.troops) ∧ (age(r) ≥ rope_min_age)`
`cut_outgrown = (t.owner = player) ∧ (t.troops > k.troops + cut_margin)`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| relieve_ratio | float | 0–1 (0.5) | data file | Threat below this share of the garrison means the keep is safe |
| rope_min_age | float, s | 0–10 (2) | data file | A reinforcement rope is kept at least this long |
| cut_margin | int, strength | 0–60 (12) | data file | A player keep this far above the origin is no longer worth attacking |

**Output Range:** booleans. At `relieve_ratio` 0 a reinforcement rope is cut only when the threat is gone entirely (threat < 0 never holds, so it is never cut: set it above 0 or the rule is inert); at 1 it is cut as soon as the threat falls below the garrison. `cut_margin` 60 can never hold (`troop_cap` is 60 and k has at least 0), so the rule is inert at the top of its range.
**Example:** rope to own keep A (6 troops), threat now 2, age 3 s: 2 < 3 and 3 ≥ 2 → cut. Rope to player keep P (25 troops) from k (10): 25 > 22 → cut.

### Boundary check and loops

Every variable was worked at its minimum, maximum and 0 (lens: systems-designer). Findings, all stated in the ranges above: F1 cannot reach 0 steps but is unreadable below about 1 s; F3 divides only by `dist_scale` (≥ 10 px) and F4 only by `60 × stall_time` (≥ 900 steps), both kept above zero by the app-start clamp (Edge Cases); F3 has no unbounded term (`dist` is bounded by the table); a 0-troop origin cannot attack; `aggro_eff` 0 disables attacks but not counter-ropes; `relieve_ratio` 0 and `cut_margin` 60 make their cut inert, so their safe ranges exclude those ends. **Feedback loop:** the stall breaker is a positive loop by design (a stall raises aggression, which produces captures, which reset it), damped by the reset; it cannot run away because `aggro_eff` is capped at 1. **Interacting knobs:** `dist_scale` scales against every `w_*` weight (halving it doubles every distance penalty); `attack_margin` and `aggro` together decide whether the attack case can ever fire on a level (at `aggro` 0.3 a rival keep needs more than 3.3 × the target's troops plus 13, so on level 1 attacks are rare and only against nearly empty player keeps, as the brief wants).

## Edge Cases

- **If a cut in part 1 frees a slot**: part 2 of the same pass may use it. Cuts always run before ties so a pass can reroute a rope in one think. A Fading rope no longer blocks a tie (Rope Links rule 2), so two guards stop churn (decided 2026-11-22): part 2 never ties a rope k→t that part 1 of the same pass cut, and F3's counter case does not score a player keep t that `cut_outgrown` would cut (`t.troops > k.troops + cut_margin`), so an outgrown attack is not re-tied on a later pass either.
- **If two rival keeps pick the same target in one pass**: both ropes are tied (two origins to one target is legal). The second keep scores the target with the same `threat` and `troops` as the first; the rival does not pre-count its own new rope's pawns.
- **If every scored candidate is ≤ 0**: no rope is tied from that keep this pass. A full keep (60 troops) with no outgoing rope then loses arriving relays (Rope Links rule 10); this is accepted, since a keep with only far or hopeless targets should not throw troops at them.
- **If two candidates score exactly equal after noise**: the lower keep id wins. Equality is possible only when `noise_max` is 0.
- **If the rival owns no keep**: passes find no origin and do nothing; the timer keeps firing harmlessly until `match_ending`. Its pawns in flight still land (Troop Marching rule 2) and may recapture a keep, after which the next pass has an origin again.
- **If a level record gives the rival no keep at all**: the rival is Waiting for the whole match and never acts; the level is a race against neutrals. Level State's invariant L1 only requires one non-player keep, so such a level is legal (a tutorial could use it).
- **If the player cuts the rope that the rival was countering**: the counter case (F3, `rope(t → k)`) no longer applies to the rival's existing rope, which is now a plain attack; F5's `cut_outgrown` decides its fate at the next pass. Nothing is cut at once.
- **If `tie` is refused** (`slots` because a level fell on an earlier step, `duplicate`, `reverse`): the refusal is taken as the answer; the keep tries nothing else this pass. Rope Links' refusals are the single authority (its rule 12, AC7).
- **If the think timer fires on a paused step**: it cannot; no step runs while paused, and the timer counts steps. On resume it continues where it stopped, so a 30 s pause delays the next pass by exactly 0 game steps.
- **If `think_steps` is small enough for more than one pass per step**: impossible; F1's floor is 4 steps. At most one pass runs per step.
- **If `clock_started` and `match_ending` arrive on the same step**: impossible (Level State's test runs only while Running, which the first makes true at the end of the step at the earliest). If a win is decided on the very step the clock starts, `match_ending` wins and the rival never acts.
- **If no capture ever happens and `aggro` is already 1**: `aggro_eff` stays 1; the stall counter grows without effect. The breaker changes nothing it cannot change.
- **If a capture happens on the same step as a pass**: the capture is in phase 5 and the pass in phase 1b, so the pass saw the old owner; the stall counter resets on the event in phase 5. The next pass sees both.
- **If the rival's origin keep is captured between the pass that tied a rope and the rope's extension finishing**: Rope Links cuts the captured keep's outgoing ropes (rule 7); the rival's record of the rope goes with it. The rival holds no state about ropes beyond the list Rope Links gives it.
- **If `rival.seed` is missing from the level record**: the record fails to parse and Campaign Level Data Rejects the level (its B4); there is no fallback seed, so no two builds can disagree on one. Every attempt at a level uses the same seed (Open Question 2, closed).
- **If a knob in the rival's tuning file is outside its range** (`ai_think_scale` 0.3–4, `jitter` 0–0.5, `dist_scale` 10–100, `stall_time` 15–180, `stall_boost` 0–1, and `ai_min_send`, the F3 weights, `noise_max`, `relieve_ratio`, `rope_min_age`, `cut_margin` each to its range in Formulas): development builds stop with an error naming the knob and value; shipped builds clamp it to the nearest end of its range at app start and log it (the one bad-data policy, Campaign Level Data rule 8, decided 2026-11-22). The per-level `think` and `aggro` are level data, Rejected by Campaign Level Data's B4.
- **If a knob is in range but outside its safe range** (`relieve_ratio` 0, `cut_margin` 60, `think` under 1 s): development builds log a warning naming the knob at match build; nothing is clamped, because the behaviour is legal, only poor.

## Dependencies

| System | Nature | Direction | What this GDD needs or gives | GDD status |
|---|---|---|---|---|
| Rope Links | Hard | out/in | `tie`, `cut`, the refusal reasons, the rope list with ages, `ropes_held(k)` | In Review |
| Troop Marching & Clashes | Hard | in | `incoming(keep, owner)` (F2); `keep_captured` (stall reset); a rival-decision phase between its per-step phases 1 and 2 | Designed |
| Level State & Match Flow | Hard | in | `clock_started`, `match_ending`; the pause state (no steps) | Designed |
| Troop Generation | Hard | in | `owner`, `troops` of every keep | In Review |
| Keep Levels | Hard | in | `level` of every keep; `max_ropes[level]` for free slots | In Review |
| Campaign Level Data | Soft (data contract) | in | Per level: `think`, `aggro`, `rival.seed` (required, fixed per level), the rival's starting keeps. Defined here and in Level State; filled there | Designed |
| **Depended on by** | | | | |
| Campaign Level Data | Hard | out | The three per-level fields above and their ranges | Not yet designed |
| Guardian Castles (Alpha) | Soft | out | Overrides of `think`, `aggro` through data | Not yet designed |
| Tutorial & Onboarding (after UAT) | Soft | out | `aggro` 0 and a long `think` on tutorial levels | Not yet designed |
| Unit Roster & Stats, Factions (UAT-2) | Soft | in | `unit_for(rival, level)`; the rival's race | Not yet designed |

**Bidirectional check.** Rope Links (its Interactions and Dependencies), Troop Marching & Clashes (Interactions) and Troop Generation (Interactions, Dependencies) already name Rival AI. Level State & Match Flow names it (Interactions, Dependencies). **Keep Levels does not**: it needs a line (the rival reads `level` and `max_ropes`). `systems-index.md` lists this system's dependencies as Rope Links, Troop Marching, Keep Levels and Level State; it should add Troop Generation and Campaign Level Data (soft). Its note that Unit Roster must precede Rival AI "because the rival must play a race" no longer applies in UAT-1 (rule 11).

## Visual/Audio Requirements

The rival draws nothing and plays nothing of its own: its ropes, pawns and keeps are Rope Links', Troop Marching's and Keep Levels' art in the rival's colours (crimson and black, art bible §1: colour belongs to whoever owns it), and its ties and cuts use the same sounds at a lower level (Rope Links, Visual/Audio). Two requirements belong here:
- **Every rival decision must be visible as it lands.** A new rival rope extends over `rope_extend_time` (0.2 s) like the player's; a cut snaps the same way. Nothing the rival does is instantaneous or hidden, so the player can always answer what they saw (Pillar 2).
- **A development-only debug overlay** draws each candidate's F3 score beside its keep, the current `aggro_eff` and the stall counter, toggled by a debug key. It never ships in the UAT build. This is a tools item, not an art item.

`art-director` not consulted — Lean mode; the rival has no visual surface of its own to direct. No asset spec follows from this section.

## Game Feel

- **Readable, not reactive.** One new rope per keep per pass, and a pass only every `think × ai_think_scale` seconds (5.4 s on level 1, 2.5 s on level 5 at baseline). The player should be able to see every rival move land and respond to it before the next; a rival that re-decides every second reads as noise. Safe floor for the effective interval: about 2 s.
- **The player moves first.** The timer's first fire is one full interval after `clock_started`, and on level 1 the clock itself waits for the player's first rope. No level opens with the rival already on the move.
- **Fair, and seen to be fair.** The rival has the player's verbs, the player's refusals and the player's information. Nothing it does should make a tester ask "how did it do that?". The one thing that looks like a change of mood, the stall breaker, is tuned so it takes 45 s of nothing happening before the rival turns on the player.
- **Pressure, not punishment.** On level 1 (`aggro` 0.3) an attack needs a rival keep more than three times the target's garrison plus 13; in practice only a nearly empty player keep gets hit, which teaches "defend your thin keep" without ending the match. Playtest question for UAT-1: did the first-time testers feel pushed, or steamrolled? (Concept AC: 5 of 5 win level 1 first try within 3 minutes.)

## UI Requirements

None for the player: the rival has no HUD element, no portrait and no message in UAT-1. The board is its only expression. The development debug overlay (Visual/Audio) is a tools requirement, not a UI spec. If Menus & Screens or Level HUD later want a rival name or crest per level, it is level data, not this system's.

## Cross-References

| This GDD relies on | In | What it relies on |
|---|---|---|
| Rope Links | Core Rules 7, 9, 10, 12; F1 (`tie_legal`); AC7 | The rival's `tie` and `cut` calls, the refusal reasons, one cut authority, the relay rule a full keep without ropes suffers |
| Troop Marching & Clashes | Rule 7 (clashes), rule 15 (`incoming`), per-step order, AC-M35 | `threat` is `incoming`; counter-ropes produce clashes; a decision phase is inserted between phases 1 and 2 |
| Troop Generation | Rule 5 and its exception; `owner`, `troops` | Sending is free (so a doomed keep's ropes are not cut); the level 1 wait |
| Keep Levels | `max_ropes[level]`, rule 8 | Free slots; starting levels |
| Level State & Match Flow | Core Rules 2, 4, 9, 11; Interactions | `clock_started`, `match_ending`, determinism, the frozen board |
| game-concept.md | § Rival, § Pillars, Acceptance Criteria | Level 1 wait; "expands, attacks weak keeps and defends"; the 5-of-5 first-try criterion |
| prototypes/tower-war/index.html | `aiThink` (lines 260–292), `config.js` MAPS | The baseline scoring and knob values this GDD refines |

**Edits other documents need as a result of this GDD** (1–5 applied 2026-11-22):
1. `troop-marching-clashes.md`: add a row to the per-step order between phases 1 and 2: "1b — Rival decision pass (when its timer fires) — Rival AI".
2. `keep-levels.md`: add Rival AI to its Dependencies (reads `level` and `max_ropes`).
3. `systems-index.md`: add Troop Generation and Campaign Level Data (soft) to this system's Depends On; strike the "Unit Roster before Rival AI" ordering note for UAT-1.
4. `level-state-match-flow.md`: Open Question 1 (stalemate) is answered here (F4); close it.
5. `design/registry/entities.yaml`: register F1–F4 and `ai_think_scale`, `ai_min_send`, `stall_time`, `stall_boost`.

## Acceptance Criteria

Baseline data unless a criterion says otherwise: step 1/60 s; `think` 3.0 and `aggro` 0.3 (level 1); `ai_think_scale` 1.8; `jitter` 0.2; `ai_min_send` 6; `dist_scale` 25; weights as in F3; `stall_time` 45 s; `stall_boost` 0.2; `relieve_ratio` 0.5; `rope_min_age` 2 s; `cut_margin` 12; a fixed `rival.seed`. Tags: **[Logic]** automated test in `tests/unit/`; **[Integration: X]** automated test in `tests/integration/` with X; **[Playtest]** observed in UAT with the question recorded. Criteria that name Campaign Level Data are *provisional* until its GDD exists. `qa-lead` lens applied: every core rule and formula has a criterion, boundaries are AC3, AC9, AC13, AC16.

- **AC1 [Logic] (rule 4)**: GIVEN `clock_started` on step S and `rng()` fixed at 0.25, THEN no decision pass runs before step S + 292, and one runs on step S + 292.
- **AC2 [Logic] (rule 4, F1)**: GIVEN a seed, THEN the sequence of think intervals over 10 passes is identical on two runs, each interval between 259 and 389 steps.
- **AC3 [Logic] (F1 boundary)**: GIVEN `think` 0.5, `ai_think_scale` 0.3, `jitter` 0.5, THEN every interval is at least 4 steps and at most one pass runs on any step.
- **AC4 [Logic] (rule 9)**: GIVEN a match in Level State's Armed state for 600 steps, THEN the rival issues no `tie` or `cut`; GIVEN `match_ending`, THEN no pass runs afterwards and the rival's ropes are unchanged.
- **AC5 [Logic] (rule 4, pause)**: GIVEN the timer at 100 steps to go, WHEN the game is paused for 30 s and resumed, THEN the pass fires exactly 100 steps after resume.
- **AC6 [Logic] (rule 6, F3 defend)**: GIVEN rival keeps k (12 troops, a free slot) and A (6 troops, 300 px from k) with `incoming(A, player)` 5, and neutral N (6 troops, 250 px), WHEN a pass runs, THEN k ties to A.
- **AC7 [Logic] (rule 6, F3 neutral)**: GIVEN the same board but `incoming(A, player)` 0, THEN k ties to N.
- **AC8 [Logic] (rule 7, F3 counter)**: GIVEN player keep P (8 troops, 500 px) with a rope P → k and no threatened own keep or neutral in range, THEN k ties to P.
- **AC9 [Logic] (F3 attack boundary)**: GIVEN k with 12 troops, `aggro` 0.3, and player keep Q (8 troops, no rope to k), THEN Q is not a candidate (3.6 > 12 is false); GIVEN `aggro` 1.0 and Q with 7 troops, THEN Q is a candidate scored 40 − 10.5 − d + 22.
- **AC10 [Logic] (rule 6, `ai_min_send`)**: GIVEN k with 5 troops, a free slot, `incoming(k, player)` 0 and a neutral at 100 px with 1 troop, WHEN a pass runs, THEN k ties nothing; GIVEN `incoming(k, player)` 1, THEN k ties.
- **AC11 [Logic] (rule 6, one rope per keep)**: GIVEN k at level 3 with 0 ropes and three positive-scoring neutrals, WHEN one pass runs, THEN k has exactly 1 rope.
- **AC12 [Logic] (rule 6, order)**: GIVEN rival keeps k1 (20 troops) and k2 (10 troops), each with one free slot, and one neutral worth tying, WHEN a pass runs, THEN k1's tie is issued before k2's.
- **AC13 [Logic] (F3 distance boundary)**: GIVEN k (more than 12 troops) and a neutral with 12 troops 1,258 px away and nothing else, THEN no rope is tied (score −12.3 + noise ≤ −6.3 < 0); GIVEN instead a threatened own keep 1,258 px away, THEN the rope is tied (29.7 + noise > 0).
- **AC14 [Logic] (rule 5, F5 relieved)**: GIVEN a rival rope k → A aged 3 s with A at 6 troops and `incoming(A, player)` 2, WHEN a pass runs, THEN the rope is cut; GIVEN the rope aged 1 s, THEN it is kept.
- **AC15 [Logic] (rule 5, F5 outgrown)**: GIVEN a rival rope k (10 troops) → P (25 troops, player), THEN it is cut; GIVEN P at 22, THEN it is kept.
- **AC16 [Logic] (F4 boundaries)**: GIVEN `aggro` 0.3 and no capture for 100 s since `clock_started`, THEN `aggro_eff` is 0.7; GIVEN 200 s, THEN 1.0; GIVEN a capture at 99 s, THEN at 100 s `aggro_eff` is 0.3; GIVEN `stall_boost` 0, THEN `aggro_eff` is 0.3 at any time.
- **AC17 [Logic] (rule 5 then 6)**: GIVEN k at level 1 holding one rope that F5 says to cut, and a positive-scoring target, WHEN one pass runs, THEN the old rope is cut and a new one tied in that same pass.
- **AC17b [Logic] (no churn)**: GIVEN rival rope k (10 troops) → P (player, 25 troops) while P also ropes k, WHEN a pass runs, THEN k→P is cut and not re-tied in that pass; WHEN the next pass runs with P still at 25, THEN no rope k→P is tied (the counter case does not score P while `cut_outgrown` holds); WHEN P drops to 22, THEN the counter case may tie k→P again.
- **AC18 [Integration: Rope Links] (rule 1)**: GIVEN the rival asks to tie from a neutral keep or to cut the player's rope, THEN the refusal is `not_yours` / the cut is ignored, and the board is unchanged (Rope Links AC7).
- **AC19 [Integration: Troop Marching & Clashes] (rule 4)**: GIVEN a pass fires on step S in which generation beats add troops to k, THEN the pass scores with k's post-beat `troops`, and a rope it ties on S sends its first pawn by Rope Links' F3 from S.
- **AC20 [Integration: Troop Marching & Clashes] (rule 8)**: GIVEN `keep_captured` on step S, THEN `stall_steps` is 0 at the end of S.
- **AC21 [Integration: Level State & Match Flow] (rule 3)**: GIVEN the same level record, seed and scripted player actions, WHEN the match runs twice, THEN every rival `tie` and `cut` happens on the same step with the same arguments.
- **AC21b [Logic] (rule 3, draw order)**: GIVEN a recording stream and a pass with rival keeps k1 (20 troops) and k2 (10 troops), each with two scored candidates (ids 3 and 7), THEN `rng()` is drawn in the order: k1→3, k1→7, k2→3, k2→7, then the next think interval, and the first draw of the match was made at `clock_started`; GIVEN a Retry of the same level, THEN the first think interval equals the first attempt's; GIVEN a level record with no `rival.seed`, THEN Campaign Level Data Rejects it and no match is built.
- **AC22 [Integration: Campaign Level Data, provisional] (rule 2)**: GIVEN a level record with `think` 1.4 and `aggro` 1.0, THEN the effective interval is 2.52 s ± 20 % and attacks are scored as F3's `aggro_eff` 1.0 case; no code change is needed between levels.
- **AC23 [Playtest] (Game Feel)**: in UAT-1, 5 of 5 first-time testers win level 1 on their first attempt within 3 minutes (concept AC), and each is asked afterwards whether the rival felt "fair", "pushy" or "unfair"; three or more "unfair" answers fail this criterion.

**Coverage check.** Rules 1–10 and 12 each have a criterion (rule 11, UAT-1 unit, is a scope statement verified by Unit Roster's absence); F1–F5 each have a typical and a boundary case; cross-system: AC18–AC22. Nothing untestable was left in: "fair" is measured by AC23's question.

## Open Questions

| # | Question | Owner | Resolve by |
|---|----------|-------|------------|
| 1 | The scoring weights (F3) are the prototype's; the prototype was played by one person. Re-tune after UAT-1 with `/balance-check` and the AC23 answers | game-designer | After UAT-1 |
| 2 | Closed (2026-11-22): `rival.seed` is a fixed constant per level, so every attempt meets the same rival given the same player actions (Campaign Level Data rule 6) | — | — |
| 3 | Does the rival pick a race, or does each region have one? (`game-concept.md` open question) | Factions | UAT-2 |
| 4 | Should the stall breaker also lower `ai_min_send` so idle small keeps join in, or is aggression alone enough? Decide from UAT-1 stall observations | game-designer | After UAT-1 |
| 5 | Multiple rival colours fighting each other (brief, "change it after play"): this GDD's one-mind rule would need a per-owner instance | game-designer | After UAT |
| 6 | Whether a guardian castle needs behaviours beyond `think` / `aggro` overrides (for example, never relieving a defence rope) | Guardian Castles | Alpha |
