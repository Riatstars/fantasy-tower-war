# Touch & Mouse Input

> **Status**: In Review (revised 2026-11-22, pending re-review)
> **Author**: user + Claude
> **Last Updated**: 2026-11-22
> **Last Verified**: 2026-11-22
> **Creative Director Review (CD-GDD-ALIGN)**: skipped — Lean mode
> **Implements Pillar**: 1. One verb, standing choices (`design/gdd/game-concept.md` § Pillars)

## Summary

Touch & Mouse Input turns a finger or mouse into the game's gestures: drag from one of the player's keeps to another to tie a rope, and tap or swipe across a rope to cut it (left button ties and right button cuts on a computer). When the player aims at a far keep and a nearer one lies on the same line, it picks the nearer. It exists so a thumb on a phone and a cursor on a desktop behave as one game, and so Rope Links and the menus never read raw touches.

> **Quick reference** — Layer: `Foundation` · Priority: `MVP` · Key deps: `None`

## Overview

Touch & Mouse Input turns what the player's fingers or mouse do into the game's own gestures. A
pointer press, move and release on the Level playfield becomes one of a small set of intentions:
*drag* from one of the player's keeps to another to tie a rope, or *cut* across or on a rope. Taps
on buttons and level nodes are taken by the engine's UI controls (rule 11), not by Input. The same gestures work with a finger on a phone and with a mouse on a
computer, where the left button ties and taps and the right button cuts. It also keeps a
keyboard fallback so the game can be played and automatically tested without a pointer.

The system works out *what the player meant* and which on-screen thing it was aimed at; it does not
decide what happens next. Rope Links decides whether a rope may be tied, Menus & Screens decides what
a button does, and Screen Flow decides where the app goes. It also honours Screen Flow's input lock
during screen changes and routes gestures only to the screen that is current. Without it, every
screen would read raw touches and the mouse differently, and a thumb on a phone and a cursor on a
desktop would behave like two different games.

## Detailed Design

### Core Rules

`game-designer`, `ux-designer` and `gameplay-programmer` not consulted — Lean mode. Review manually before production.

1. **One pointer at a time.** The pointer is a finger or the mouse. The first press becomes the active pointer; any other press while it is down is ignored, and the pointer ends on release or cancel. On a mouse only the left and right buttons count; other buttons are ignored.
2. **Logical coordinates.** Every gesture is reported in the table's logical coordinates (720 by 1280, portrait, scaled to the screen). Consumers never see raw pixels or screen sizes.
3. **What a press lands on, in priority order**, inside a Level: a UI control, then one of the player's own keeps (F1), then one of the player's cuttable ropes (F2, even inside a rival or neutral keep's area, so the far end of an attack rope can be tapped; the player's decision, 2026-11-22), then a rival or neutral keep, then empty space. A press that lands on a UI control belongs to that control and never starts a world gesture.
4. **Touch gestures** in a Level:
   - *Tie*: a press on one of the player's keeps, then a move of at least `drag_threshold` (F4), starts a drag. Releasing over a keep (F1) reports `tie_released(from keep, to keep)`, where `to keep` is the target resolved by F6 (the nearer keep on the same line, if any). Releasing over no keep, or over the origin keep, reports `tie_released(from keep, none)`: no tie, and the preview ends.
   - *Cut by tap*: a press on a rope (F2, touch radius) released without having moved `drag_threshold` reports `cut_tapped(rope)`.
   - *Cut by swipe*: a press on empty space, or on a keep that is not the player's, followed by movement starts a swipe (rule 7).
   - A press on a keep that is not the player's, released without moving, does nothing.
5. **Mouse gestures** in a Level: the **left** button ties exactly as touch does and taps UI controls; it never cuts. The **right** button cuts: a right press on a rope (F2, mouse radius) released without moving reports `cut_tapped(rope)`, and a right press anywhere (including on a keep) followed by movement starts a swipe. A left press on empty space or on a rope does nothing; the first such press in a session raises `hint_shown("cursor")`, once per session, and Level HUD shows the hint "Right mouse cuts a rope" (its F2; event named 2026-11-22).
6. **Drag feedback.** While a drag is active Input publishes, every rendered frame and in every match state including Armed (Input is not a match system and keeps running when match steps stop; decided 2026-11-22), the pointer position, the origin keep and the resolved target (F1 then F6) or none, so the preview always shows the rope that a release would tie. It does not judge legality: Rope Links owns it, and Level HUD reads the preview's legality from Rope Links' `tie_legal(origin, target)` and draws the preview from this data and that answer.
7. **Swipe.** While a swipe is active each step takes the segment from the previous pointer position to the current one and tests it against every cuttable rope (F3). Each rope crossed is reported once as `cut_swiped(rope, t)` with `t` the crossing point along the rope (0 to 1), and cannot be reported again in the same swipe. A trail of recent pointer positions is published for drawing.
8. **The hit-test provider is Rope Links** (its rule 9; the player's decision, 2026-11-22): every frame, in every match state including Armed, it lists every keep with its owner flag and the player's cuttable ropes (Extending and Active, lane-adjusted). Input never tests the rival's ropes; it reads ownership only from the provider's flags.
9. **A drag or swipe is cancelled** (`gesture_cancelled`, nothing else) when Input is locked, the operating system cancels the pointer, or a drag's origin keep is no longer flagged as the player's in the provider on a step (it was captured). Screen Flow locks Input on every screen or overlay change and when the app goes to the background (it opens Pause), so those cases cancel gestures through the lock; Input itself never listens for them.
10. **Input lock** (Screen Flow Rule 4): `lock()` discards every pointer and key event and cancels any gesture in progress; `unlock()` resumes. A pointer that is already down when `unlock()` runs is ignored until it is released, so a finger held through a transition cannot act on the next screen. Gestures go only to the screen Screen Flow names as current.
11. **UI controls** (buttons, level nodes, overlay buttons) are handled by Menus & Screens through the engine's standard UI controls and must work with touch and with the mouse separately from keyboard focus. Input's gestures are for the Level playfield, plus the global keys in rule 12.
12. **Keyboard fallback** (desktop and automated tests; it never replaces touch on a phone): Tab, Left and Right select one of the player's keeps; Up and Down cycle the target through every other keep in ascending id; Space or Enter ties the selected pair (after F6, like a release); X cuts the selected keep's ropes; P emits `pause_pressed` (Screen Flow opens Pause); M emits `mute_toggled` (Audio, from Vertical Slice); Esc is Back: Input emits `back_pressed` and Screen Flow listens for it. The keyboard produces the same `tie_released` and cut events as the pointer, so Rope Links sees one kind of event.
13. **Back is not a gesture.** The phone's Back button and the iOS back swipe go straight to Screen Flow (in UAT-1 from the engine's own back-request notification, which Screen Flow reads; from the Vertical Slice through Mobile Platform Integration). Only Esc on a computer is produced here, as the event `back_pressed`.
14. **Target resolution (F6).** When a tie is released or previewed over a keep, and another keep lies nearer to the origin within `align_tolerance` degrees of the same direction and within `keep_hit_radius` of the straight line, the nearer keep becomes the target. It applies to every owner. If the nearer keep cannot be tied, Rope Links refuses the tie; it never moves on to the farther keep.
15. Input identifies events by their type and never by `device == 0` (Godot 4.7 changed device ids for mouse and keyboard).

### States and Transitions

| State | Meaning | Leaves when |
|-------|---------|-------------|
| Idle | No pointer down | A press → Pressed (when unlocked and no other pointer is active) |
| Pressed | Pointer down, has not moved `drag_threshold`; remembers what it landed on | Moves ≥ `drag_threshold` on an own keep → Dragging; on a rope, empty space or a non-own keep (or a right press) → Swiping; released → Idle, reporting a cut tap if it landed on a rope (a press on a UI control never reaches Input: the engine's UI control takes it, rule 11); lock → Locked |
| Dragging | A tie is being drawn from an origin keep | Release over a keep → Idle (`tie_released` with a target); release elsewhere or on the origin → Idle (`tie_released` with none); lock, the operating system cancelling the pointer, or the origin no longer the player's (rule 9) → Idle (`gesture_cancelled`) |
| Swiping | A cut swipe is in progress | Release → Idle; lock or the operating system cancelling the pointer → Idle (`gesture_cancelled`) |
| Locked | Input is locked by Screen Flow | `unlock()` → Idle, except that a pointer still down is ignored until released |

A second pointer pressing while the state is not Idle or Locked is ignored and causes no transition.

### Interactions with Other Systems

**Direction rule.** Input never calls another system. Rope Links registers the Level's hit-test provider (what is under a point) and Input emits events that systems listen to. That keeps it a foundation with no upstream dependency.

| System | Direction | Data | Interface owner |
|--------|-----------|------|-----------------|
| Screen Flow & Scene Manager | both | In: `lock()`, `unlock()` and the name of the current screen. Out: the events `back_pressed` (Esc) and `pause_pressed` (P), which Screen Flow listens for | Input provides the lock and the routing; Screen Flow decides when to use them |
| Rope Links | out | `tie_released(from, to)`, `cut_tapped(rope)`, `cut_swiped(rope, t)`, the drag feedback and the swipe trail. In: the hit-test provider (every keep's centre point with its owner flag; the player's cuttable ropes as lane-adjusted segments), and preview legality (`tie_legal`), which Level HUD reads directly | Input defines the events; Rope Links supplies the provider and decides what each event means and whether it is legal |
| Menus & Screens | none | Menu buttons use the engine's UI controls; Input does not route them | Menus & Screens |
| Level HUD | out | The drag feedback and the swipe trail, for drawing the rope preview and the swipe line; `hint_shown("cursor")` (rule 5). Preview legality comes from Rope Links, not Input | Level HUD draws |
| Tutorial & Onboarding | out | The same gesture events, so the first-minute hint can tell that the first drag or cut was done | Tutorial & Onboarding |
| Mobile Platform Integration | none | No direct link. App to background reaches Input as a lock from Screen Flow; a pointer cancelled by the operating system comes from the engine | Screen Flow and the engine |
| Accessibility (Alpha) | in | Larger touch radii, and possibly a tap-then-tap way to tie for players who cannot drag | Accessibility, within the invariants in Formulas |

## Formulas

Distances are in the table's logical pixels (720 by 1280). Values come from the prototype unless marked *new*.

### F1. Keep hit test

The keep_hit formula is defined as:

`on_keep(p, k) = dist(p, (k.x, k.y − keep_hit_lift)) ≤ keep_hit_radius`; if several keeps match, the one with the nearest centre wins.

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| p | point (x, y) | 0–720 by 0–1280 | calculated | Pointer position |
| k.x, k.y | float | on the table | data file (level layout) | Keep's base position |
| keep_hit_radius | float, px | 48–120 (baseline 78) | data file (`keep_radius`) | Radius of the touch area |
| keep_hit_lift | float, px | 0–`keep_hit_radius` (baseline 35) | data file (`keep_hit_lift`) | How far above the base the area is centred, so it covers the keep's body |

**Output Range:** a keep, or none. Invariants I1–I3 keep it usable.
**Example:** keep base (360, 1060): centre (360, 1025). A press at (360, 960) is 65 px away: hit. A press at (360, 930) is 95 px away: miss.

### F2. Rope tap hit

The rope_hit formula is defined as:

`on_rope(p, r) = dist_to_segment(p, r.a, r.b) ≤ tap_radius`, with `tap_radius` = `cut_tap_radius_touch` for a finger and `cut_click_radius_mouse` for the mouse; if several ropes match, the nearest wins. Only the player's own ropes are tested. A press inside one of the player's own keeps' area (F1) is a keep press, not a rope press; inside a rival or neutral keep's area the rope wins (Core Rule 3). No end exclusion is needed.

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| r.a, r.b | point | on the table | calculated (Rope Links) | Rope's end points, lane-adjusted |
| cut_tap_radius_touch | float, px | 10–80 (baseline 40, *new*) | data file | Tap reach for a finger |
| cut_click_radius_mouse | float, px | 4–40 (baseline 14) | data file (`cut_click_radius`) | Click reach for the mouse |

**Output Range:** a rope, or none.
**Example:** rope from (360, 1030) to (360, 730). A touch tap at (385, 880) is 25 px from it: hit (25 ≤ 40). A mouse right-click at the same point: miss (25 > 14). The prototype's mouse radius of 14 px is about 1.3 mm on a 65 mm wide phone, too small for a finger, which is why touch has its own radius.
*Difference from the prototype:* it also required the nearest point to lie between 10% and 90% of the rope's length. That left a dead strip near each end of a long rope; keep priority makes it unnecessary.

### F3. Swipe cut

The swipe_cut formula is defined as:

`cut(r, t)` when the segment from the previous pointer position P0 to the current one P1 crosses the rope segment A→B; `t` is the crossing point along A→B (0 at A, 1 at B). Parallel or zero-length segments cross nothing.

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| P0, P1 | point | on the table | calculated | Pointer positions on consecutive steps |
| A, B | point | on the table | calculated (Rope Links) | The player's rope end points |
| t | float | 0–1 | calculated | Crossing parameter along the rope |

**Output Range:** zero or more crossings per step, each rope at most once per swipe. Because the whole segment between samples is tested, a fast swipe cannot skip a rope.
**Example:** swipe (300, 880) to (420, 880) across a vertical rope from (360, 1030) to (360, 730): crossing at t = (1030 − 880) / (1030 − 730) = 0.5.

### F4. Drag threshold

The drag_start formula is defined as:

`started = dist(p_now, p_press) ≥ drag_threshold`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| p_press, p_now | point | on the table | calculated | Where the pointer went down, and where it is now |
| drag_threshold | float, px | 4–40 (baseline 14, *new*) | data file | Movement needed before a press becomes a drag or a swipe |

**Output Range:** true or false. Below the threshold a release is a tap.
**Example:** press at (200, 900); at (205, 905) the movement is 7.1 px: still a press; at (210, 910) it is 14.1 px: a drag or swipe starts. The baseline of 14 is a starting guess (a deliberate tap jitters about a millimetre or two, about 11–22 px at roughly 0.09 mm per logical px) and must be tuned on a phone.

### F5. Minimum keep spacing

The keep_spacing formula is defined as:

`dist(k_i, k_j) ≥ 2 × keep_hit_radius` for every pair of keeps in a level.

**Output Range:** the smallest spacing must be at least 156 px at baseline. Measured on the five prototype maps: 262, 206, 226, 220 and 180 px (the last on *The Last Keep*), so all pass, with 24 px to spare on the tightest.
**Example:** *The Last Keep*: keeps at (360, 560) and (360, 380) are 180 px apart; 2 × 78 = 156 ≤ 180.

### F6. Target keep resolution (the nearer keep on the same line)

The target_resolution formula is defined as:

`target = nearest-to-origin keep k among all keeps other than the origin with |angle_diff(bearing(origin, k), bearing(origin, hit))| ≤ align_tolerance and dist_to_line(k, origin→hit) ≤ keep_hit_radius and dist(origin, k) ≤ dist(origin, hit)`; if no keep other than `hit` qualifies, `target = hit`.

`bearing(origin, k)` is the direction in degrees from the origin keep `origin` to keep `k`; `angle_diff` is the smallest difference between two bearings (wrapping at ±180°). `hit` is the keep found under the pointer by F1 (or the keyboard's selected target). If two keeps are equally near, the lower id wins. The rule applies to every owner (the player's, neutral and the rival's) and to the keyboard path. Rope Links then judges the target; if it is not legal, the tie is refused and does not move on to a farther keep.

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| origin | keep | | calculated | The keep the drag started from |
| hit | keep | | calculated (F1) | The keep under the pointer on release, or on the preview |
| align_tolerance | float, degrees | 0–15 (baseline 5, from the player's own rule) | data file | How far off the same direction still counts |
| keep_hit_radius | float, px | 48–120 (baseline 78) | data file (F1) | Also the most a nearer keep may sit off the straight line origin→hit and still count as "in the way" (decided 2026-11-22) |

**Output Range:** one keep. The result is never farther from the origin than `hit`, and never more than `keep_hit_radius` off the straight line to it, so on a large map only a keep that really blocks the rope is chosen. A keep within 5° lies at most 0.087 × its distance off the line, so below about 895 px from the origin the angle test alone decides; the 78 px limit acts only on longer ropes.
**Example:** origin A (360, 1060), B (360, 760), C (360, 520). Releasing on C: bearings are both −90°, so B (300 px) is nearer than C (540 px): the target is B. With C′ (400, 520): bearing −85.8° against B's −90°, a difference of 4.2° ≤ 5: still B. With C″ (440, 520): −81.6°, a difference of 8.4° > 5: the target stays C″.

### Invariants (checked when the data is loaded; the loader reports a breach)

- **I1.** `48 ≤ keep_hit_radius`, so the area is at least about 9 mm across on a phone (96 logical px at roughly 0.09 mm per px).
- **I2.** `2 × keep_hit_radius ≤` the smallest keep spacing of each level (F5). Campaign Level Data must respect it when it places keeps.
- **I3.** `keep_hit_lift ≤ keep_hit_radius`, so the area still contains the keep's base.
- **I4.** `4 ≤ drag_threshold ≤ 40`, so a tap can be told from a drag and a drag still starts quickly.

### Feedback loop

None. The formulas are stateless tests on the current pointer position and the current layout; nothing accumulates.

## Edge Cases

`systems-designer` not consulted — Lean mode. Review manually before production.

**Pointers and buttons**
- **If a second finger touches while the first is down**: it is ignored. If the first finger lifts while the second is still down, the gesture ends there (a release at the first finger's last position); the second finger stays ignored until it is lifted and pressed again.
- **If a pointer is already down when Input unlocks** (a finger held through a transition): it is ignored until released (Core Rule 10).
- **If a mouse button is pressed while the other is already down**: ignored. The first button pressed is the active one.
- **If the middle button, the wheel or any other button is used**: ignored.
- **If the pointer leaves the window or the screen while down**: the pointer is captured, so moves and the release still arrive. A release outside the table counts as a release over no keep: `tie_released(origin, none)`, no tie.
- **If the operating system cancels the pointer** (a system gesture, a notification pull-down, a palm): the gesture ends with `gesture_cancelled` and nothing else happens.

**Presses and priority**
- **If a press lands on a UI control and a keep at once** (for example a pause button over the table): the control wins, and no world gesture starts.
- **If a press lands on a keep that is not the player's and is released without moving**: nothing happens. If it moves, a swipe starts.
- **If the right mouse button is pressed on one of the player's own keeps**: no drag starts; the right button only cuts, so it starts a swipe if it moves.
- **If a left mouse press lands on empty space or on a rope**: nothing happens (the "Right mouse cuts a rope" hint shows, once per session). The left button never cuts.

**Drag and ties**
- **If a drag is released on the origin keep**: no tie; `tie_released(origin, none)` ends the preview.
- **If a drag is released between two keeps' areas**: it is a release over no keep. The areas cannot overlap (F5), so there is never a tie between two keeps for one point.
- **If the keep a drag started from is captured by the rival, or the level ends, while the drag is down**: the drag is cancelled with `gesture_cancelled` (rule 9: the provider no longer flags the origin as the player's; the level end locks Input).
- **If the nearer keep chosen by F6 cannot be tied** (already roped, no free rope slot, an ally already roped to the origin): Rope Links refuses the tie with its message. The tie does not move to the farther keep.
- **If several keeps lie within `align_tolerance` of the same line**: the one nearest the origin is chosen; equal distances go to the lower id.
- **If `align_tolerance` is 0**: only exactly collinear keeps are redirected, which in practice switches the rule off.

**Cutting**
- **If a swipe crosses two ropes within one step**: both are reported, in order of nearest crossing to the previous pointer position.
- **If a swipe crosses the same rope twice**: it is reported once, at the first crossing, since a cut rope is gone.
- **If a swipe has zero length or runs parallel to a rope**: it crosses nothing (F3), with no division by zero.
- **If a tap is within reach of several of the player's ropes**: the nearest wins; ties go to the lower rope id.
- **If a cut tap or swipe lands on a rope that is not the player's**: nothing is cut, since Input is only given the player's ropes (Core Rule 8).
- **If a tap lands inside a keep's area and also within reach of one of the player's ropes**: inside one of the player's keeps it is a keep press; inside a rival or neutral keep it cuts the rope (Core Rule 3).

**Timing**
- **If the pointer produces more than one sample in a game step**: only the last position of the step is used, and motion between steps is treated as a straight line (F3 tests that whole line).
- **If Input is locked while a gesture is in progress**: the gesture is cancelled at once (Core Rule 10).
- **If a key is held and the operating system repeats it**: the repeats are ignored; one press counts once.
- **If the keyboard's selected keep is captured by the rival**: the selection moves to the next of the player's keeps, or to nothing if there are none, and Space does nothing.

**Data**
- **If the loader finds a breach of I1, I3 or I4** (global tuning, checked once at app start): development builds stop with an error naming the rule and the values; shipped builds clamp to the nearest valid value and log it. This follows the one bad-data policy (Campaign Level Data rule 8, decided 2026-11-22): global tuning clamps, level data is Rejected.
- **If a level breaches I2 at the baseline radius** (keeps closer than twice the data file's `keep_hit_radius`): it is level data, so Campaign Level Data's loader Rejects it (its F2 and rule 8): development builds stop with an error naming the two keeps; shipped builds do not load the level and Screen Flow shows its load-failure box (Screen Flow Core Rule 11). Nothing is clamped.
- **If the accessibility setting raises `keep_hit_radius` at runtime and a level then breaches I2**: in every build that level plays with `keep_hit_radius` lowered to half its smallest spacing, and the reduction is logged. The level passed I2 at the baseline radius, so the lowered radius is always at least the baseline 78, above I1's floor 48. This is the only per-level radius change.

**Open, owned by other GDDs** (not decided here):
- Whether a tie to the F6-chosen keep is legal (slots, duplicates, ally reverse): Rope Links.
- Whether palm rejection or accidental-touch handling is needed beyond the operating system's: Accessibility and the first mobile playtest.

## Dependencies

Screen Flow & Scene Manager and Rope Links have GDDs and are checked against this one; every other contract here is provisional until its GDD is written.

**Direction rule.** Input never calls another system. Rope Links registers the hit-test provider, and Input emits events that systems listen to. Screen Flow calls `lock()` and `unlock()` on Input and listens for `back_pressed` and `pause_pressed`. Input listens for nothing from Mobile Platform Integration (see Interactions), so there is no cycle.

### Depends on (upstream)

None. Every keep (with its owner flag) and the player's cuttable ropes arrive through the hit-test provider that Rope Links registers, not through a call from Input.

### Depended on by (downstream)

| System | Kind | What it takes from this system |
|--------|------|-------------------------------|
| Rope Links | Hard | `tie_released(from, to)` (with the F6 target), `cut_tapped`, `cut_swiped`, the drag feedback and the swipe trail |
| Screen Flow & Scene Manager | Soft | `lock()`, `unlock()` and the current-screen routing; the `back_pressed` and `pause_pressed` events. Contract written in Screen Flow's GDD. Screen Flow also calls `lock()` for Level State & Match Flow during a match's Ending state (deciding step to result overlay) and `unlock()` when the result overlay opens (revised 2026-11-22), so Back, Esc and P work on the overlay |
| Level HUD | Soft | The drag feedback and swipe trail for drawing the rope preview and the swipe line |
| Tutorial & Onboarding | Soft | Gesture events, to tell when the first drag or cut was done |
| Campaign Level Data | Soft (a rule it must obey) | Invariant I2: keep spacing of at least twice `keep_hit_radius` |
| Accessibility (Alpha) | Soft | The touch radii and `drag_threshold` as settings, within I1–I4 |

### Consistency to fix

- Campaign Level Data's GDD must list the keep-spacing rule (I2) in its own rules. **Done (2026-11-22):** its F2 enforces I2 at load and Rejects a breaching level (never clamps), so this GDD's per-level radius fallback runs only when `keep_hit_radius` is raised at runtime (an accessibility setting) after the data was validated.

## Visual/Audio Requirements

`art-director` not consulted — Lean mode. Review manually before production. A short note only, since Input draws nothing itself; Level HUD and Rope Links draw from the data it publishes.

**Visual**
- While a drag is active the preview rope follows the finger or cursor and snaps to the resolved target (F6), with a white ring around that target keep (art bible: Info White for the player's own touch). When F6 has redirected to a nearer keep, the ring sits on that keep so the player sees the redirect before releasing.
- A tie that Rope Links judges illegal shows the preview in a muted style with a red cross on the target, as in the prototype.
- A swipe leaves a thin, bright trail that fades out within a fraction of a second.
- On a computer the cursor does not change; the hint "Right mouse cuts a rope" appears in the bottom strip once per session.

**Audio**
- A short tie sound when a tie is made and a short snip when a rope is cut. Both are triggered by Rope Links and Feedback & Juice from the events, not by Input.

## Game Feel

Input is how the player feels the game, so its feel targets matter more than for most Core systems.

- **Latency**: the preview rope reaches the pointer position of the current step on that same step (one step, 1/60 s). No smoothing or easing lags behind the finger.
- **Tie and cut are immediate**: a tie appears on the step of the release; a rope snaps on the step the swipe crosses it. Nothing waits for a confirmation.
- **Forgiveness**: the large keep area, the finger-sized rope reach and the drag threshold exist so that a thumb on a phone almost never misses a keep or cuts the wrong rope. F6 is part of this: the player aims roughly at a far keep and the game picks the one in the way.
- **Predictability**: what the preview shows is what a release does. F6 therefore applies to the preview as well as the release, and the ring shows the real target.
- **Haptics (optional)**: a very short vibration on a tie and on a cut, where the phone supports it, off if the player turns vibration off (Open Question 4).
- **Reference feel**: the quick, forgiving drag-to-send of Galcon and Mushroom Wars on a phone.

## UI Requirements

- **Touch targets**: every keep's area is at least about 9 mm across on a phone (I1). Menu buttons, level nodes and overlay buttons are handled by Menus & Screens and follow the same minimum; the accessibility GDD sets the final size.
- **Drag preview and target ring**: drawn by Level HUD from Input's drag feedback (Visual/Audio).
- **Swipe trail**: drawn by Level HUD from Input's trail (Visual/Audio).
- **Cursor hint** on a computer: "Right mouse cuts a rope", shown once per session in the bottom strip when a left click lands on a rope or on empty space.
- **Controls shown on screen**: the Title lists the controls for the current device (touch: drag to tie, swipe or tap a rope to cut; computer: left-drag to tie, right-click or right-drag to cut). Menus & Screens draws the list (its rule 2); this GDD owns the wording and which variant applies (added 2026-11-22).

> **UX Flag — Touch & Mouse Input**: This system has UI requirements. In Pre-Production, run `/ux-design` to create a UX spec for the Level HUD's drag preview, target ring and swipe trail, and for the controls list on the Title, before writing epics. Stories that reference UI should cite `design/ux/[screen].md`, not this GDD directly.

## Cross-References

Screen Flow's and Rope Links' GDDs exist and are checked against this one; every other referenced GDD is still to be written and its entry is provisional.

| This GDD uses | Owned by | Item |
|---------------|----------|------|
| `lock()`, `unlock()`, current-screen routing | Screen Flow & Scene Manager | Its Core Rule 4 and Interactions; this GDD's Rules 9 and 10 fulfil it |
| `back_pressed` | Screen Flow & Scene Manager | Its Core Rule 6 (Esc on a computer is Back) |
| Whether a tie is legal; every keep with its owner and the player's cuttable ropes | Rope Links | Hit-test provider (its rule 9); the legality of the F6 target |
| Rope lane offset | Rope Links | Rope end points used by F2 and F3 |
| Keep positions and spacing | Campaign Level Data | Invariant I2 (F5) |
| Preview, ring and trail drawing | Level HUD | Visual/Audio and UI Requirements |
| Gesture events | Tutorial & Onboarding | First-minute hints |
| Touch radii and `drag_threshold` as settings | Accessibility | Larger values, within I1–I4 |
| UI controls and touch focus | Menus & Screens | Rule 11; AC30 |
| Engine behaviour | `docs/engine-reference/godot/modules/input.md` | 4.6 dual focus; 4.7 device ids (Rule 15) |

## Acceptance Criteria

Baseline data unless a criterion says otherwise: `keep_hit_radius` 78, `keep_hit_lift` 35, `cut_tap_radius_touch` 40, `cut_click_radius_mouse` 14, `drag_threshold` 14, `align_tolerance` 5. Tags: **[Logic]** automated unit test; **[Integration]** automated test with the named system; **[Device]** measured on the target phone; **[Visual]** screenshot or playtest. Unit tests feed synthetic pointer and key events and a fixed layout through the hit-test provider.

**Pointers (Rules 1, 2, 9, 10, 15)**

- **AC1 [Logic] (Rule 1)**: GIVEN finger A is down, WHEN finger B presses, THEN B is ignored; WHEN A lifts while B is still down, THEN A's gesture ends at its last position and B starts nothing until it is lifted and pressed again.
- **AC2 [Logic] (Rule 1)**: GIVEN the left mouse button is down, WHEN the right button is pressed, THEN it is ignored; the middle button and the wheel are always ignored.
- **AC3 [Logic] (Rule 2)**: GIVEN the same relative gesture on a 720 by 1280 and a 1080 by 1920 window, THEN consumers receive the same logical coordinates within 1 px.
- **AC4 [Logic] (Rules 9, 10)**: GIVEN a drag in progress, WHEN `lock()` is called, THEN one `gesture_cancelled` is emitted and no tie; WHEN `unlock()` is called with the finger still down, THEN no gesture starts until it is lifted and pressed again.
- **AC5 [Logic] (Rule 9)**: GIVEN a drag in progress, WHEN the operating system cancels the pointer, THEN one `gesture_cancelled` is emitted and no tie.
- **AC6 [Logic] (Rule 15)**: GIVEN keyboard events whose device id is not 0, THEN they are recognised by event type and work.

**Priority and ties (Rules 3, 4, 6, 14; F1, F6)**

- **AC7 [Logic] (Rule 3)**: GIVEN a UI control overlapping a keep's area, WHEN a press lands on the overlap, THEN the control receives it and no drag starts.
- **AC8 [Logic] (Rule 4, F1)**: GIVEN the player's keep A and keep B, WHEN a finger presses on A, moves at least 14 px and is released over B, THEN exactly one `tie_released(A, B)` is emitted.
- **AC9 [Logic] (Rule 4)**: GIVEN a drag from A, WHEN released over empty space or over A, THEN `tie_released(A, none)` is emitted and no tie is made.
- **AC10 [Logic] (F1 boundary)**: GIVEN a keep with base (360, 1060), THEN a press 78.0 px from its area centre (360, 1025) hits it and 78.5 px misses; a press at the base (360, 1060) hits it.
- **AC11 [Logic] (Rule 6)**: GIVEN a drag from A held over keep C, THEN the published hover target each step is the F6-resolved keep, so the preview always shows the rope a release would tie.
- **AC12 [Logic] (F6)**: GIVEN A (360, 1060), B (360, 760), C (360, 520), WHEN a drag from A is released on C, THEN the tie goes to B. With C′ (400, 520) it still goes to B (4.2° ≤ 5°). With C″ (440, 520) it goes to C″ (8.4° > 5°). With `align_tolerance` 0 it goes to C′.
- **AC13 [Logic] (F6)**: GIVEN two keeps B1 and B2 equally near the origin on the line to C, THEN the lower id is chosen. GIVEN the redirected keep belongs to the rival, THEN the target is still that keep.
- **AC14 [Integration: Rope Links] (F6, Rule 14)**: GIVEN B is already roped from A, WHEN a drag from A is released on C beyond B, THEN Rope Links refuses the tie to B with its message and no rope is made to C.

**Cutting (Rules 4, 5, 7, 8; F2, F3, F4)**

- **AC15 [Logic] (F2)**: GIVEN the player's rope from (360, 1030) to (360, 730), WHEN a finger taps at (385, 880) and lifts without moving 14 px, THEN one `cut_tapped(rope)` is emitted; a mouse right-click at the same point emits none (25 px > 14), and one at (370, 880) emits it (10 ≤ 14).
- **AC16 [Logic] (F2 boundary)**: GIVEN the same rope, THEN a touch tap 40.0 px from it cuts and 40.5 px does not; a mouse click 14.0 px cuts and 14.5 px does not.
- **AC17 [Logic] (Rule 3, F2)**: GIVEN a tap within reach of the player's rope, THEN inside one of the player's keeps' areas it is a keep press and nothing is cut; inside a rival or neutral keep's area it emits `cut_tapped(rope)`.
- **AC18 [Logic] (Rule 5)**: GIVEN a left-button click on the rope, THEN no gesture event is emitted and `hint_shown("cursor")` is raised exactly once; a second left click on a rope in the same session raises nothing.
- **AC19 [Logic] (F3)**: GIVEN a swipe from (300, 880) to (420, 880) across that rope, THEN one `cut_swiped(rope, t)` is emitted with t = 0.5 within 0.01; sweeping back across the same rope in the same swipe emits nothing.
- **AC20 [Logic] (F3, Rule 8)**: GIVEN a swipe crossing two of the player's ropes in one step, THEN both are reported, nearest crossing first; a rope of the rival's is never reported.
- **AC21 [Logic] (F3)**: GIVEN a swipe of zero length, or one parallel to a rope, THEN nothing is cut and no error occurs.
- **AC22 [Logic] (F4 boundary)**: GIVEN a press at (200, 900), THEN moving to 13.9 px away leaves a tap and 14.0 px starts a drag or swipe.
- **AC23 [Logic] (Rule 5)**: GIVEN the right mouse button pressed on the player's own keep and moved 14 px, THEN a swipe starts and no drag.

**Keyboard and Back (Rules 12, 13)**

- **AC24 [Logic] (Rule 12)**: GIVEN the keyboard fallback, WHEN Tab selects a keep, Down selects a target and Space is pressed, THEN the same `tie_released` event as a pointer release is emitted (after F6); X emits cuts for the selected keep's ropes.
- **AC25 [Integration: Screen Flow] (Rule 13)**: GIVEN a Level with no overlay, WHEN Esc is pressed, THEN Input emits `back_pressed` and Screen Flow opens Pause.

**Edge cases and data**

- **AC26 [Logic] (Rule 9)**: GIVEN a drag from keep A, WHEN the provider stops flagging A as the player's (captured) or the level ends, THEN `gesture_cancelled` is emitted.
- **AC27 [Logic] (I1, I3, I4)**: GIVEN `keep_hit_radius` 30, THEN a development build stops with an error naming I1 and the value (a shipped build clamps to 48 and logs); GIVEN `keep_hit_lift` 80 with radius 78, I3; GIVEN `drag_threshold` 0 or 50, I4.
- **AC28 [Logic] (I2)**: GIVEN two keeps 150 px apart at the baseline radius 78, THEN a development build stops with an error naming both keeps and a shipped build Rejects the level (Screen Flow's load-failure box), with no radius change. GIVEN a level whose smallest spacing is 180 px and the accessibility setting raising `keep_hit_radius` to 100, THEN the level loads in either build with `keep_hit_radius` 90 for that level and one log line; the next level with spacing ≥ 200 px uses 100.
- **AC29 [Logic] (F5)**: GIVEN the five prototype layouts, THEN the validator reports spacings of 262, 206, 226, 220 and 180 px and passes all of them.

**Feel, UI and device**

- **AC30 [Integration: Menus & Screens]**: GIVEN keyboard focus is on one button, WHEN a different button is tapped with a finger or clicked with the mouse, THEN the tapped button acts (Godot 4.6 separates touch focus from keyboard focus).
- **AC31 [Device]**: On the mid-range Android target, testers aim 20 taps each at a keep and 20 at a rope. At least 95% of keep taps hit the intended keep and at least 90% of rope taps cut the intended rope (targets to confirm; tune `cut_tap_radius_touch` and `drag_threshold` from the result).
- **AC32 [Device]**: Of 20 deliberate rope taps per tester, at most 5% turn into a swipe by finger jitter at the baseline `drag_threshold`; if more, raise it within I4.
- **AC33 [Device]**: Input processing for one step with 15 keeps and 30 cuttable ropes costs under 0.1 ms on the target phone (target to confirm).

- **AC34 [Logic] (Rule 7)**: GIVEN a swipe in progress, THEN each step the published trail holds the recent pointer positions in order, oldest first, and it is emptied when the swipe ends. (How many positions, and how fast it fades, is Open Question 6.)

**Coverage check:** every core rule (1–15) has at least one criterion, as do formulas F1–F6 and invariants I1–I4. Boundary values are tested at the radius limits (AC10, AC16), the drag threshold (AC22), zero-length swipes (AC21) and invariant limits (AC27, AC28). Cross-system criteria: AC14 (Rope Links), AC25 (Screen Flow), AC30 (Menus & Screens).

## Open Questions

| # | Question | Owner | Resolve by |
|---|----------|-------|------------|
| 1 | ~~F6 tests the angle only; add a maximum sideways distance?~~ Resolved 2026-11-22: a nearer keep must also lie within `keep_hit_radius` (78 px) of the straight line origin→hit. Written into F6 and Core Rule 14 | game-designer | Done |
| 2 | Should the preview look different when F6 has redirected (for example a short label "nearer keep")? | ux-designer | Vertical Slice |
| 3 | A tap-then-tap way to tie for players who cannot drag | Accessibility | Alpha |
| 4 | Haptic feedback on tie and cut: wanted, and is it a setting? | ux-designer, Settings | Vertical Slice |
| 5 | `drag_threshold` 14 px and `cut_tap_radius_touch` 40 px are starting guesses and the "about 0.09 mm per px" figure assumes the table spans a 65 mm wide phone; none is measured | gameplay-programmer | First phone playtest (Mobile Platform Integration) |
| 6 | How many positions the swipe trail holds and how fast it fades (AC34) | art-director, ux-designer | Vertical Slice art pass |
| 7 | Does a tap on the player's own keep do anything (an info card, or selecting a keep for a god's power)? Today it does nothing | God & Goddess Powers | Alpha |
| 8 | The engine reference says nothing about multi-touch or `emulate_mouse_from_touch` on 4.7. One-pointer-only is chosen so it is safe, but how Godot reports a second finger must be checked on a device | technical-director | Technical Setup, before the first phone build |
| 9 | Is palm rejection beyond the operating system's needed? | Accessibility | After the first mobile playtest |
