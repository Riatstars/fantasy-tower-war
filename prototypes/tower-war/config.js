// PROTOTYPE - NOT FOR PRODUCTION
// Question: Is building and rerouting links, as towers grow 1→3, a fun tug-of-war for a 2–3 minute map?
// Date: 2026-11-21
// Every tuning value lives here, each with value, min, max and step. The game reads them live
// through tune.<name> (index.html); the tweak panel, an add-on, writes them back here.
window.CONFIG = {
  seed: 1, // every gameplay random call reads rng(), seeded from this (or ?seed= in the address)
  volume: { value: 0.5, min: 0, max: 1, step: 0.05 },

  // ---- Troop generation (periodic) ----
  gen_interval: { value: 1.0, min: 0.3, max: 3, step: 0.1 },   // seconds between generation ticks
  gen_l1: { value: 1, min: 0, max: 5, step: 1 },                // troops added per tick at level 1
  gen_l2: { value: 2, min: 0, max: 6, step: 1 },                // troops added per tick at level 2
  gen_l3: { value: 3, min: 0, max: 8, step: 1 },                // troops added per tick at level 3
  troop_cap: { value: 60, min: 20, max: 200, step: 5 },         // a keep stops generating at this many troops

  // ---- Tower levels (max 3); level = max ropes a keep can hold ----
  lv2_at: { value: 15, min: 2, max: 60, step: 1 },              // troops needed for level 2
  lv3_at: { value: 35, min: 5, max: 120, step: 1 },             // troops needed for level 3

  // ---- Ropes and marching ----
  send_interval: { value: 0.6, min: 0.1, max: 2, step: 0.05 },  // seconds between pawns sent down one rope
  pawn_speed: { value: 110, min: 30, max: 400, step: 5 },       // px per second along a rope
  link_range: { value: 470, min: 150, max: 1400, step: 10 },    // longest rope, px (logical 720x1280)
  keep_radius: { value: 52, min: 30, max: 90, step: 1 },        // touch radius of a keep, px

  // ---- Rival AI (per-map numbers are in MAPS below) ----
  ai_min_send: { value: 6, min: 1, max: 30, step: 1 },          // rival keeps hold this many before sending
  ai_grace: { value: 40, min: 0, max: 120, step: 5 },           // seconds on map 1 before the rival may hit you

  // ---- Start ----
  player_start: { value: 10, min: 1, max: 60, step: 1 },        // troops in your first keep
};

// Map layouts: keeps as [x, y, owner, troops] on the 720x1280 table (owner 0 neutral, 1 you, 2 rival).
// think: seconds between rival decisions. aggro: 0..1, how readily the rival attacks your keeps.
// rival: starting troops of each rival keep (the player's keep uses player_start).
window.MAPS = [
  { name: 'First Field', think: 3.0, aggro: 0.3, rival: 10, river: null,
    keeps: [[360, 1060, 1], [360, 250, 2], [170, 880, 0, 6], [550, 880, 0, 6], [360, 660, 0, 12],
            [170, 440, 0, 6], [550, 440, 0, 6]] },
  { name: 'The Ford', think: 2.4, aggro: 0.6, rival: 15, river: [[0, 640], [200, 600], [380, 690], [560, 610], [720, 660]],
    keeps: [[180, 1080, 1], [540, 220, 2], [460, 960, 0, 8], [140, 800, 0, 10], [360, 760, 0, 16],
            [360, 520, 0, 16], [580, 480, 0, 10], [260, 340, 0, 8]] },
  { name: 'Crossroads', think: 2.0, aggro: 0.75, rival: 14, river: null,
    keeps: [[360, 1100, 1], [130, 210, 2], [590, 210, 2], [160, 920, 0, 8], [560, 920, 0, 8],
            [360, 650, 0, 25], [140, 600, 0, 10], [580, 600, 0, 10], [360, 380, 0, 12]] },
  { name: 'Twin Hills', think: 1.7, aggro: 0.85, rival: 16, river: [[0, 300], [240, 360], [480, 320], [720, 380]],
    keeps: [[360, 1090, 1], [150, 200, 2], [570, 200, 2], [150, 930, 0, 10], [570, 930, 0, 10],
            [250, 720, 0, 14], [470, 720, 0, 14], [360, 520, 0, 20], [140, 430, 0, 9], [580, 430, 0, 9]] },
  { name: 'The Last Keep', think: 1.4, aggro: 1.0, rival: 18, river: [[0, 820], [180, 760], [360, 830], [540, 770], [720, 820]],
    keeps: [[360, 1110, 1], [360, 190, 2], [140, 300, 2], [580, 300, 2], [180, 960, 0, 10],
            [540, 960, 0, 10], [360, 900, 0, 6], [180, 640, 0, 16], [540, 640, 0, 16], [360, 560, 0, 24],
            [360, 380, 0, 12]] },
];
