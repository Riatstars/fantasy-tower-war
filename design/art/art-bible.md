# Art Bible: Tower War

> **Status**: Draft
> **Owned By**: art-director
> **Last Updated**: 2026-11-22
> **Art Director Sign-Off (AD-ART-BIBLE)**: SKIPPED 2026-11-22 — lean mode

`/art-bible` writes these nine sections in this order and replaces each
section's `[To be designed]` line as that section is approved. A section still
holding its placeholder is incomplete; a later run fills only those.

## 1. Visual Identity Statement

**On the table, ownership reads before charm; off the table, charm is the reward.**

Tower War draws in two registers. The *table* (the battlefield inside a level) is chibi pixel art, read at a glance on a phone. The *frame* (world map, menus, region wins, guardians, gods) is anime splash art. Fire Emblem on the Game Boy Advance taught this split: small map sprites, big portraits. When a choice is unclear, name the register, then apply its half of the rule.

There are no formal pillars yet (no `game-pillars.md`); each principle is anchored in the brief's pitch and its "who it's for / what they feel" line.

### Principle 1: Colour belongs to whoever owns it
*Serves: "the pull of painting a fantasy map in your colours."*

At rest, only owner colours (royal blue and gold, crimson and black, monster green) are saturated or glow: banners, roof trim, rune ropes, pawns. Terrain and props stay matte and mid-value, so a keep's owner reads from across the table, and the world map fills with exactly those colours. Events (a rise, a capture, a clash) may flash accent gold, briefly.
**Test:** when a colour or glow is ambiguous, this principle says give it to an owner or mute it.

### Principle 2: Silhouette first, face second
*Serves: "a quick, punchy conquest in a couple of minutes."*

With up to 15 keeps and hundreds of pawns in view, nobody reads a face. Chibi proportions carry the cuteness; the outline carries the meaning. Barracks, keep and castle differ in height and width; soldier, knight and monster differ in shape. At table size the anime face shrinks to two bright eyes.
**Test:** when detail on a table sprite is ambiguous, this principle says cut the detail and enlarge the shape.

### Principle 3: Splash art is the payoff
*Serves: "conquer a fantasy world region by region" (pitch) and "the world map fills with your banners" (Player Fantasy).*

Big anime illustration marks what the player earns: a region conquered, a guardian revealed, a god's power cast, the world map itself. Each chibi is its splash self in miniature, keeping its colour blocks and one signature shape (plume, horn, crown), so both registers are one world. A god's portrait crosses onto the table only as a short, framed overlay.
**Test:** when a moment's register is ambiguous, this principle says use splash art only if it rewards or frames conquest, never while the player must read the table.

## 2. Mood & Atmosphere

Mood follows Section 1's two registers. The **frame** (world map, menus, overlays, splash art) changes its light from state to state. The **table** is never relit during a level. Each level is painted once in its region's light: key light from the upper left, shadows falling down-right, no real-time lights (Compatibility renderer). Inside a level, the mood comes from what stands on the table. The more owner colour and motion on screen, the higher the energy (Principle 1).

One rule covers every state: **gains brighten, losses dim.** A rise, a capture and a win add light. A cut rope, a falling keep and a defeat take it away. The screen's brightness alone tells the player how things are going.

| State | Emotional target | Painted light | Descriptors | Energy | What carries the mood |
|---|---|---|---|---|---|
| **World Map** | Pride in the blue already painted; pull toward the next node | Warm late morning, medium contrast; fog cool and flat | storybook, sunlit, expansive, inviting | Low–mid | Blue banners on conquered nodes; parchment fog rolling back from the lit region; the next node's accent-gold pulse |
| **Level, early** | Quick confidence in an open race | The region's light, low contrast | open, calm, bright | Mid, rising | Mostly matte terrain, still green garrisons, one blue rope drawing itself out |
| **Level, contested** | Focus and tension, never panic | The same light, unchanged | taut, busy, rhythmic, legible | High | Blue and crimson ropes face to face on 16 px lanes; steel sparks where the streams meet; a blue keep flickering crimson as rival pawns land |
| **Victory** (Win overlay, region conquered) | Triumph and generosity | Warm amber dim over the frozen table; the region splash in golden-hour light | radiant, warm, generous, festive | Peak, then settling | Stars filling one by one in accent gold; the region-conquered splash; a banner planted on the map |
| **Defeat** (Lose overlay) | "Regroup and go again", never shame | Cool slate dim, low contrast, no accent gold | hushed, cool, brief, forgiving | Low | A furled blue banner on a weathered card; Retry, in blue and gold, is the brightest thing on it |
| **Pause, menus, Title** | Safe and in control, at the war table | Menus: lamplit wood, low contrast. Title: a bright splash | cosy, steady, crafted | Lowest (Title mid) | Dark wood and parchment; the Title's heroes-and-gods splash |
| **Guardian castle level** | Awe, then resolve: the region's final exam | The region repainted late in the day: low sun, long shadows, contrast rising toward the guardian | ominous, monumental, climactic | Highest | The largest silhouette on any table, with its long painted shadow and two steady glowing eyes; a reveal splash before play |

Early and contested play share one light on purpose: the table feels tense only when the rival really is on it. Defeat stays cool and quick because a loss costs only a retry, and Keep Levels already keeps losing moments from feeling like a lecture. If the revive offer stays in, it uses the same calm button style and never flashing gold, so gold stays a reward and not a sales pitch.

### Glow budget

Up to 45 ropes and hundreds of pawns share one screen, so glow is rationed by tier (starting targets):

| Tier | What | Limit |
|---|---|---|
| **Steady, low** | Rune ropes in owner colour; the level 3 summoning circle (one pulse every 2 s or slower); a guardian's eyes (the one neutral that glows, because it strikes back) | Rope halo at most 2 px on either side of a 4 px core, which leaves 8 px of plain terrain between two opposite ropes |
| **Rhythmic pulse** | The send pulse along a rope (every 0.6 s); the cap glint on a full plaque (a short sweep every 2.5 s, never steady) | At most 25% brighter than the rope at rest |
| **Small flare** | Tie (far pin, owner colour); arrival flash (in the arriving pawn's owner colour); relay flicker (white); clash sparks (steel) | 0.25 s or less, inside the keep's footprint, no halo |
| **Big flare** | Rise and capture only, in accent gold | 0.6 s or less; at most 3 at full size at once, any more play at half size |
| **Never** | Pawns, terrain, props, lava, other neutral keeps, plaques | — |

Losses never flare. A cut rope's runes fade from owner colour to grey, and a falling keep gives off a puff of matte dust. Neutral keeps stay saturated but unlit, which matches their stillness in Troop Generation and puts them a step below the two active sides. Glow is drawn into the pixels or added with shared additive sprites, never with engine bloom. Technical-artist confirms that 45 ropes fit within 300 draw calls.

## 3. Shape Language

Shape carries what colour cannot (Principle 2). Each layer of the table has a shape the others never use: keeps are vertical, ropes are the only long straight lines, pawns are small repeated figures, and terrain is soft and horizontal.

### Table silhouettes

Figures are chibi, 2 to 2.5 heads tall, and top-heavy, so the helmet and eyes sit at the top of the outline. Every keep and figure has a one-art-pixel Ink outline (Section 4). Terrain and props have no outline, which is the table's strongest way of separating figures from ground. At table scale the face is two bright eyes. Mouths, noses, hands and any detail inside the outline are cut. What survives is the outline, one signature shape, the owner's colour blocks and the owner mark.

Heights are in logical pixels on the 720 × 1280 table. They assume one art pixel equals 2 logical pixels (Section 8 confirms this). At that scale a 24 px soldier is 12 art pixels tall, about the size of a Fire Emblem map sprite on the Game Boy Advance. All values are starting targets for the first art pass.

| Figure | Height | Width | One distinguishing trait |
|---|---|---|---|
| L1 barracks | 64 | 88 | Low and wide: one pitched roof, one banner pole |
| L2 stone keep | 96 | 112 | A square tower with battlements, the stable stepping down beside it |
| L3 castle | 124 | 140 | Two towers with spires; the only keep with a ring (the summoning circle) at its foot |
| Guardian castle | about 180 | about 180 | Built into its guardian's signature shape (dragon wings, golem shoulders, serpent coil); the only lopsided keep |
| Foot soldier | 24 | 14 | Upright, with a spear tip above the helm |
| Mounted knight | 32 | 30 long, 16 across | A horse's long body under a plume; the only rider |
| Beast or summon | 22–30 | 30 long, 16 across | No rider: pricked ears (wolf) or wings raised in a V (griffin) |
| Monster garrison | 28–36 | up to 40 | Bottom-heavy: a slime's dome, a goblin's ears, an orc's hunch and tusks |

Each keep level adds about 30 px of height and 25 px of width, so a keep's rope capacity reads from its shape alone (Keep Levels). A keep sprite plus its 28 px plaque fits inside the 156 px touch circle; only the guardian castle is bigger. A neutral keep is the same building in green, with one garrison figure at its gate. Pawns stay 16 px wide or less across the lane, so two opposite streams 16 px apart still read as two streams. At 66 px spacing each pawn keeps clear ground around it. If unit kinds are worth different troop values, size follows value.

### Owner marks as shape

Every owner shares the same building shapes (Keep Levels). Each owner adds its own family of shapes, so ownership still reads with colour removed (Section 4):

| | Player | Rival | Neutral |
|---|---|---|---|
| Family | Rounds | Points | Blobs |
| Emblem (8–10 px) | Sun disc with rays | Crescent | Pair of fangs |
| Banner cut | Swallowtail | Single-point pennon | Ragged hide on a bone pole |
| Pawn helm | Round, with a gold crest | Spiked, black | Neutrals do not march (a guardian's strike-back uses monster figures) |
| Rope runes | Round beads on a solid line | Barbed chevrons on a dashed line | No ropes |

Rounds read heroic and friendly, points read as a threat, and blobs read wild and a little comic. That splits the brief's "bright, heroic, a little cute" across the three owners.

### Environment geometry

Terrain is horizontal, soft and natural in shape, and never outlined, so the keeps' upright shapes stand out against it. Long, thin straight lines belong to ropes alone. Roads, rivers, fences and cliff edges wind, stay wider than 24 px and keep soft edges. Props inside the play area stay shorter than a pawn. Tall props (trees, rock spires) stay in the margins and never sit inside a touch circle. Each keep stands on a matte ground pad about the size of its touch circle. Keeps, ropes and pawns always draw above terrain and props.

### UI shape grammar

There are two UI shape styles, one per register. **Frame UI** (menus, overlays, map, transition cover) echoes the world: dark wood frames, parchment panels with rolled edges, rune dividers. **Table HUD** (strength bar, message strip, plaques) uses the same materials stripped down: flat tags with clipped corners and no ornament. Only UI uses clipped corners, so a tag never reads as a figure. Slot dots are drawn as small diamond rune sockets, lit or empty, so a free slot reads as a rope waiting to be tied. The refusal cross is the only X shape in the game.

### Hero and supporting shapes

Keeps lead: they are the tallest upright shapes, outlined, with owner colour on banner and roof trim. Ropes come next. Because they are continuous lines, the eye follows them from keep to keep. Pawns support: they move together, so they read as one stream rather than as individuals. Terrain and props fall back: no outline, low contrast, drawn beneath everything.

### Splash register

A splash figure is its chibi grown to 5–6 heads tall (starting target), and it keeps three things:
- the same colour blocks in the same places;
- the same signature shape (plume, horn, crown, wing), exaggerated;
- the eyes, which grow from two bright pixels into full anime eyes.

Splash art keeps the same upper-left light and is built on a strong diagonal, with the signature shape breaking the frame edge. A splash keep keeps its table tower count, so a level 3 castle is clearly the same castle.

## 4. Color System

Saturation means ownership (Principle 1). Owner colours are the only saturated colours on the table. Terrain stays in a matte, mid-value band. Each colour means one thing.

### Primary palette

| Colour | Shadow · Base · Light | Role and meaning |
|---|---|---|
| **Royal Blue** | `#18307A` · `#2B59D9` · `#6E9BFF` | The player: banners, roof trim, tabards, rope core |
| **Heraldic Gold** | `#8C5A14` · `#C98F1E` · `#E6B43C` | The player's trim: emblem, banner border, helm crest, rope beads. Always touches blue |
| **Crimson** | `#6E0E22` · `#C2183B` · `#E8506A` | The rival: banners, tabards, rope runes, "Lost!" |
| **Rival Black** | `#1E1824` · `#2E2636` · `#4A4058` | The rival's second colour: helms, banner halves, rope core |
| **Monster Green** | `#3F7A1C` · `#7CCB2B` · `#B8EC5C` | Unclaimed land: neutral keeps and garrisons; bone `#E9DDBF` for the fang emblem |
| **Accent Gold** | `#FFE45C`, core `#FFF8D6` | A gain just happened: rise, capture, stars, cap glint, the next map node. Belongs to no owner |
| **Terrain band** | Value 40–70% (shadows down to 30%), saturation 35% or less | The ground: matte, unoutlined, never glowing |

**Two golds, kept apart three ways** (the player's decision, 2026-11-22). With one shared gold, every rival rise would flash the player's colour, which breaks Principle 1.
- *Value:* Heraldic Gold tops out at `#E6B43C`, well below Accent Gold. At base, their relative luminance is about 0.32 against 0.78.
- *Company:* Heraldic Gold always touches blue. Accent Gold is never part of an owned sprite.
- *Time:* Heraldic Gold never moves. Accent Gold always moves, in flares of 0.6 s or less.

Because gold means a gain, clash sparks are steel, not gold, and the drag target ring is white.

### Semantic usage

- **Blue** (with Heraldic Gold): yours, and only yours.
- **Crimson and black**: the rival, and danger to you. An arrival flash takes the arriving pawn's owner colour, so a blue keep flickering crimson means the rival is landing.
- **Green**: wild, unclaimed land.
- **Accent Gold**: a gain.
- **Info White** `#F7F3E8`: information and the player's own touch: numbers, eyes, flare cores, relay flicker, swipe trail, drag target ring.
- **Steel** `#A9B0B8`: effects that belong to no owner: clash sparks, and the two halves of a snapped rope as they fade.
- **Ink** `#1A1216`: the outline of every keep and figure, and the HUD tags.
- **UI Red** `#E8552B`: "no". Used for the refusal cross only, never on a figure.

### Region temperature

| Region | Painted light | Ground: shadow · base · lit | Avoids | Rule |
|---|---|---|---|---|
| **Green Vale** | Warm morning | `#5D7F6A` · `#78A07E` · `#92B08A`; straw and paths `#B09A76` | Monster Green | Grass is a cool sage (hue about 128°, saturation 25%), far from the lime garrisons (about 90°, 80%). Warmth comes from straw, paths and painted sun, not from saturated grass |
| **Forest** | Dappled noon | Floor `#6E6650`; canopy `#44645A` | Monster Green | Brown floor and cool teal canopy, never yellow-green; the canopy stays in the margins |
| **Snow** | Clear, cold noon | `#9D97AD` · `#C8C6CE` · `#D4D0CB` | Royal Blue | The cold comes from low saturation and grey-violet shadows, never blue. The one region above mid-value (capped at 85%); Ink outlines and the dark HUD tags keep figures readable against it |
| **Lava** | Smoky dusk | `#4E4543` · `#6A5F5C` · `#857A74`; cracks `#A8764C` | Crimson, Rival Black | Lava is dull amber (hue about 27°, 40° from crimson), never red, never glowing, and covers at most 15% of the ground. It is the band's one saturation exception (up to 55%). It sits close to Heraldic Gold, which stays readable because it always touches blue. Basalt is mid-grey, never black, so rival black stays the darkest mass |

A fifth region follows the same caps. If it has water, the water is grey-teal, never royal blue.

### UI palette

The frame UI is warm and low in saturation:

| UI colour | Hex | Use |
|---|---|---|
| **Dark Wood** | `#4A3226` | Frames, buttons |
| **Deep Wood** | `#2E1F18` | Transition cover, Pause dim |
| **Light Wood** | `#7A5640` | Bevels, pressed states |
| **Parchment** | `#E6D6B0` | Panels |
| **Parchment Shade** | `#C4AE84` | Panels |
| **Ink Brown** | `#3B2A20` | Text on parchment |

The UI differs from the table in one way: warmth belongs to the frame, saturation belongs to owners.
- **Table HUD:** tags are Ink at about 85% opacity with Info White numbers, readable on all four regions including snow. Owner colour appears only as data: the plaque edge, slot runes and strength-bar segments.
- **Buttons:** primary buttons are Royal Blue edged in Heraldic Gold, because moving forward is the player's own move.
- **Crimson:** never used for UI frames or buttons, only for rival data.
- **Refusal cross:** UI Red, about 25° warmer than crimson, drawn as a white-edged X in a parchment ring over a greyed preview rope.
- **Overlay dims:** Pause is Deep Wood at about 55%. Win is warm amber `#3A2408` at about 45%, so the conquered table shows through. Lose is cool slate `#18202E` at about 60%.

### Colourblind safety

Royal Blue and Crimson are almost equally bright (relative luminance about 0.13 each). So every owner also carries a light-versus-dark trim and its family of shapes (Section 3):

| Pair at risk | Fails under | Backup cue |
|---|---|---|
| Crimson vs Monster Green | Protan, deutan | Green is nearly four times brighter; crescent vs fangs; pennon vs ragged hide; neutrals have no ropes, no slot runes and no "+N" |
| Royal Blue vs Crimson | Greyscale, dim screens | Light gold trim vs dark black trim; sun vs crescent; round beads on a solid line vs barbed chevrons on a dashed line; round vs spiked helm; the player's rope always on its own right; sun and crescent caps at the two ends of the strength bar |
| Royal Blue vs Monster Green | Tritan | Gold trim vs bone; sun vs fangs; ropes and slot runes only on owned keeps |
| Heraldic Gold vs Monster Green | Deutan | Heraldic Gold only ever touches blue |
| UI Red vs Crimson | Protan, deutan | The X shape, its white edge and parchment ring; the greyed preview; the message strip |
| Accent Gold vs Info White | Tritan | Both are brief, and every gain also has a shape (banner pop, floating text, a new slot rune) |

**Test:** in a greyscale screenshot, the owner of every keep, rope and pawn must be identifiable from its emblem, banner cut, helm and rope pattern alone. In the first art pass, check every region through greyscale, protan, deutan and tritan simulation.

## 5. Character Design Direction

[To be designed] — the player character's visual archetype, how players tell
enemies, NPCs and allies apart at a glance, expression and pose style, and how
much detail survives at game camera distance (LOD philosophy).

## 6. Environment Design Language

[To be designed] — architectural style and its tie to the world's culture,
texture philosophy (painted, PBR or stylised, and why), prop density rules per
area type, and environmental storytelling guidelines.

## 7. UI/HUD Visual Direction

[To be designed] — diegetic versus screen-space HUD, typography (personality,
weight, size hierarchy, minimum readable size), iconography style, UI animation
feel, and any art-direction versus readability conflict and how it was decided.

## 8. Asset Standards

[To be designed] — file formats, naming convention, texture resolution tiers,
LOD levels, export settings, and the engine's hard limits (poly budgets per
asset category, texture memory, material slots). Where an art preference and a
technical limit disagree, record both and the trade-off chosen.

## 9. Reference Direction

[To be designed] — 3–5 references (games, films, art styles or artists). For
each: the specific element to take from it, and what to avoid so the result
does not read as a copy.
