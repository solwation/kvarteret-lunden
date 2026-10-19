// Reviewed architectural subset of solwation/lunden-3d-apartment src/config.js.
// Source: c079371f6782225e29e9dac51518c509ed8c37e6.
// Measurements marked guess/assumption are visualization estimates, not verified standard fittings.

export const VERTICAL = {
  // y 0 = the finished floor of L1007's Entréplan (våning 1), which is also the street / courtyard level here
  // (SITE.terrain); everything is relative to it. No absolute height (RH2000) is known.
  datum: { y: 0, what: 'FFL L1007 Entréplan (våning 1)', source: 'assumption' },
  levels: [
    // Entréplan = våning 1. bofakta: "Takhöjd ca 3,0 m. Lokalt lägre över tvätt." `slab` = the zone from its finished
    // ceiling to Övre plan's finished floor (assumption)
    { name: 'Entréplan', storey: 1, rh: 3.0, rhSource: 'drawing', slab: 0.25, slabSource: 'assumption' },
    // Övre plan = våning 2. bofakta: "Takhöjd ca 2,8 m. Lokalt ca 2,4 m vid sovrummens fönster." `slab` = our roof
    // zone up to våning 3's finished floor = the upper unit's floor and the loftgång deck (assumption)
    { name: 'Övre plan', storey: 2, rh: 2.8, rhSource: 'drawing', slab: 0.35, slabSource: 'assumption' },
  ],
  // Hus L våning 3–4 (L1201–L1209): floor-to-floor per storey; no RH or section for them here (assumption)
  upper: { storeys: 2, floorToFloor: 3.0, source: 'assumption' },
  // the flat roof over våning 4: its build-up over våning 4's structure top + the sheet-metal capping (assumption)
  roof: { buildUp: 0.3, capping: 0.05, source: 'assumption' },
};

export const LEVELS = [];

for (let i = 0, y = VERTICAL.datum.y; i < VERTICAL.levels.length; i++) {
  const v = VERTICAL.levels[i];
  LEVELS.push({ name: v.name, storey: v.storey, floor: y, ceiling: v.rh, top: y + v.rh + v.slab });
  y += v.rh + v.slab;
}

export const UNIT_TOP = LEVELS[LEVELS.length - 1].top;

export const storeyFloor = (n) => (n <= LEVELS.length ? LEVELS[n - 1].floor
  : UNIT_TOP + (n - LEVELS.length - 1) * VERTICAL.upper.floorToFloor);

export const SOFFITS = [
  // bofakta: "RH: 2,5m" over Tvätt + Badrum
  { level: 0, x0: 0.2, x1: 2.06, z0: 3.05, z1: 7.6, height: 2.5, extent: 'rooms' },
  // bofakta: "RH: 2,4m" in Sovrum 3 + Sovrum 1, boxed-in ceiling (inklädnad) ~1.5 m deep
  // from the north façade — the access balcony (loftgång) for the units above runs here. The RH 2.4 is local, at
  // the windows ("Lokalt ca 2,4 m vid sovrummens fönster"), not the room height of the whole bedroom; the 1.5 m
  // depth is a guess.
  { level: 1, x0: 0.2, x1: 5.55, z0: 0.46, z1: 0.46 + 1.5, height: 2.4, extent: 'guess' },
  // bofakta: "RH: 2,5m" in WC/dusch
  { level: 1, x0: 0.2, x1: 1.42, z0: 5.05, z1: 7.6, height: 2.5, extent: 'rooms' },
];

export const OPTIONS = { allrumDoor: true };

export const EXTRA_WALLS = [
  { level: 1, option: 'allrumDoor', x0: 1.54, x1: 1.77, z0: 7.6, z1: 7.8 },
];

export const SLIDE_FLIP = [];

export const ROOM_RENAMES = [{ level: 1, from: 'Allrum', to: 'Sovrum 4', option: 'allrumDoor' }];

export const EXTRA_ROOMS = [
  { level: 1, name: 'WC/dusch', x: 0.8, z: 6.4 },
  { level: 0, name: 'Hall', x: 2.75, z: 6.2 }, // the passage by the stair (no label in the plan)
];

export const ROOM_DIVIDERS = [
  { level: 0, x0: 2.06, x1: 2.15, z0: 1.76, z1: 3.05 },
  { level: 0, x0: 2.15, x1: 3.45, z0: 4.86, z1: 4.9 },
  { level: 0, x0: 2.15, x1: 3.25, z0: 7.6, z1: 7.8 },
];

export const ENTRY_DOOR = { color: 0x314d3c, roughness: .58, thickness: .04,
  glass: { width: .36, height: .12, top: .12, frame: .015, thickness: .008,
    frameColor: 0x566b5c, frameRoughness: .4, frameMetalness: .25, color: 0xb5cbd0, opacity: .48, roughness: .22 } };

export const DOOR_HEIGHT = 2.1;

export const DOOR_TRIM = { gap: 0.003, width: 0.07, thickness: 0.012, slideThickness: 0.008 };

export const DOOR_FITTINGS = { height: 1, backset: .065, roseRadius: .026, roseDepth: .008,
  neck: .038, lever: .115, radius: .009, bend: .018, segments: 12,
  lockDrop: .075, lockRadius: .021, lockDepth: .014, turnHeight: .012, turnWidth: .031,
  turnDepth: .008, slotHeight: .026, slotWidth: .003, cylinderHeight: .052, cylinderWidth: .034,
  strikeHeight: .24, strikeWidth: .038, strikeDepth: .003 };

export const EXT_DOOR_HEAD = 2.6;

export const WINDOW_TOP_HUNG_MAX = 40;

export const WINDOWS = [
  { level: 0, facade: 'north', x: 3.85, sill: 0.8, head: 2.6, transom: 0.45, blind: 'light' }, // Kök/matplats
  // #429 (the user's choice): the Verona sofa's westernmost back stands 6 cm out from the façade under the sash, so the
  // sash opens only `max`° (its bottom then ~1 cm short of the back's top rail at z 12.76, patiotest checks it)
  { level: 0, facade: 'south', x: 3.85, sill: 0.6, head: 2.6, transom: 0.45, split: 0.35, opens: 'a', max: 4, blind: 'light' }, // Vardagsrum
  { level: 1, facade: 'north', x: 1.80, sill: 0.9, head: 2.25, transom: 0, blind: 'dark' },   // Sovrum 3
  { level: 1, facade: 'north', x: 3.85, sill: 0.7, head: 2.25, transom: 0, blind: 'dark' },   // Sovrum 1
  { level: 1, facade: 'south', x: 1.45, sill: 0.7, head: 2.4, transom: 0.4, blind: 'dark' },  // Allrum = Sovrum 4 (Sovrum 4)
  // Sovrum 2 (#353, architecture review Issue 10): the user's word (#107) is that it is SMALLER than Sovrum 4's; the
  // original L1007 sheet already draws it so — its opening ~1.41 m (x 3.142…4.552, data/plan.json) against Sovrum 4's
  // ~1.61 m — so the drawing governs (the user, #353): the PDF opening and the sheet's BH 0.7. The width is read off the
  // drawing, not a verified product size; head 2.25 and no transom stay *guesses* (no source gives the head).
  { level: 1, facade: 'south', x: 3.85, sill: 0.7, head: 2.25, transom: 0, blind: 'dark' }, // Sovrum 2
];

// Radiators under the windows (original #1071). SOURCED: Peab heats with water-borne radiators on district heating (info brochure
// 2024-09-11, informationsbroschyr text line 697; fragor-och-svar.txt:150–153), and the floor plans' legend says
// "R RADIATOR PLACERAS UNDER FÖNSTER OM INTE ANNAT ANGES"; Peab's L1004 render (docs/peab/l1004-vardagsrum-render.jpg)
// shows a white panel radiator. Every size below is a *guess* (no radiator schedule in Peab's material): a white compact
// single-panel radiator with convector (type 11-ish), centred under the window board. `bottom` = its underside over the
// floor (cleaning gap), `under` = the clearance from the window board's underside to its top grille, `step` = product
// heights/widths come in 0.1 m steps (the height is rounded down and kept within `min`…`max`), `width` = its share of the
// window opening (rounded to `step`), `gap` = wall to back panel (the brackets), `depth` = back panel to front face,
// `panel` = a panel's thickness. `valve`: a thermostat valve on the east end near the top (a body `len` out of the end,
// radius `r`, `drop` under the top; a head of radius `head` × `headLen`); `pipe` = two white pipes (radius `r`, centre
// `spacing` along x, the first `inset` in from the end) from its underside down into the floor, each with a `rosette`.
// Skipped where the window board is too low for `min` (glass to the floor / a door), over a cabinet or over a floor
// opening. It sticks out under 9 cm from the wall: inside the player's own wall clearance (PLAYER.radius), so no collision.
export const RADIATOR = {
  bottom: 0.15, under: 0.12, step: 0.1, min: 0.3, max: 0.9, width: 0.8,
  gap: 0.015, depth: 0.05, panel: 0.014,
  valve: { len: 0.045, r: 0.011, drop: 0.045, head: 0.024, headLen: 0.075 },
  pipe: { r: 0.0075, spacing: 0.05, inset: 0.035, rosette: 0.022 },
};

export const SITE = {
  // Terrain (#79). Kv. Lunden stands on a garage box: the courtyard ("den upphöjda gården", info brochure
  // p. 16) lies on the garage deck at our Entréplan / patio level (y 0; the lower row houses have their
  // patios "mot den gemensamma gården", and their entrances "direkt från gatan", so Sankt Lars väg north
  // of Hus L is at y 0 too; #256: its east leg and Karpvägen slope down southwards, `east` / `west`). Around the box the ground lies one storey lower: Å-husen A and B have a
  // "Våning -1 (sutteräng)" (overview plans p. 24) and the green between A and B lies "utanför den
  // upphöjda gården och ner mot å-rummet". `park` = that level. `box` = the garage box (plan rects);
  // its edges (#254) are measured on the suterräng plan (våning −1) and the level lines on våning 1
  // (docs/peab/kalibrerad/). South of Hus L the roads outside the box go down to the park level over `slope` m
  // (guess). The garage entrance ("INFART GARAGE", våning −1; "NEDFART TILL GARAGE UNDER KVARTERET", situation
  // plan) is in the box's west wall south of Hus C, reached from Karpvägen over a short asphalt drive.
  terrain: {
    // #346 (docs/peab/arkitekturgranskning-2026-10-04.md, issue 03): every terrain height here is RELATIVE, in metres to
    // `ref`: the courtyard on the garage box = our Entréplan's finished floor = model y 0 (LEVELS[0].floor). Peab's material
    // gives no plushöjd (RH 2000) for it, so `ref.plus` stays null — no height in the model is a surveyed level.
    // `documented` = the plans' only level differences (overview plans S2 / våning 1), each a LOCAL condition at its own
    // place, never summed into one site-wide fall: the courtyard ~3 m above the park / å-rum (`park`, taken by the box's
    // retaining walls), the east ramp ~0.9 m (`ramp.drop`), the east stair ~1.4 m (`stairs[0].drop`), the NW stair by
    // Hus C ~1 m (`west.profile` at the stair). Everything between (slopes, break points, wall heights) is a guess until
    // a grading plan or section turns up (tools/terraintest.html checks the joins, not the terrain's truth).
    ref: { y: 0, plus: null }, documented: { park: 3, ramp: 0.9, eastStair: 1.4, nwStair: 1.0 },
    // `slope` (guess): only east of Sankt Lars väg, outside the plot, does the ground ease down to the park level over
    // that many metres south of Hus L's back; round the courtyard the 3 m is a vertical retaining wall (no slope crosses it)
    park: -3, north: 12.7, slope: 8,
    // the box (#254): the west part from Hus C's west façade (the garage's outer wall towards Karpvägen) to Hus B's
    // west façade and south to the level line at z 52.5 (the yard south of Hus C: second pergola, sandbox,
    // odlingslådor); the middle part up to the level line "NIVÅSKILLNAD CA 3M" from Hus B's NE corner to Hus A's
    // west façade (z 33.3); the east part up to Hus A's north face. The green between A and B is outside it.
    // #255: the east part ends at x 11.6; beyond it a strip x 11.6…13.5 inside a wall along Sankt Lars väg holds the
    // ramp ("RAMP NIVÅSKILLNAD CA 0,9M", våning 1: from Hus L's east gable at z 11.5 to a landing at z 24.5…27.25 that
    // opens onto the walk along Hus A). #256: the landing is the box's last part; the `ramp` falls `drop` m from it (z1)
    // northwards to the street level by the gable (z0), where the east leg lies 0.9 m below the courtyard.
    box: [{ x0: -70.5, x1: -41.7, z0: 12.1, z1: 52.5 }, { x0: -41.7, x1: -9.76, z0: 12.1, z1: 33.3 }, { x0: -9.76, x1: 11.6, z0: 12.1, z1: 28.8 },
      { x0: 11.6, x1: 13.5, z0: 24.5, z1: 27.25 }],
    // #1151: windows in the box's park-facing retaining walls, where våning −1 (upstream docs/peab/kalibrerad/vaning-m1-300dpi.png,
    // p46) draws window symbols in the garage's outer wall: `edges` = [box edge z (south faces, looking +z), [[x0, x1] …]],
    // read at 23.61 px/m with the entrance hall's inner faces (x −69.95 / −41.61, z 51.8) as anchors (±0.1 m). The south
    // wall of INFART GARAGE between Hus C and the C/B stair has four 1.82 m windows plus a 0.97 m one between the stair and
    // Hus B; the big hall's wall between Hus B and Hus A (the level line z 33.3) three. Only the horizontal placement and
    // count are sourced: `sill` / `head` (metres over the park level outside) are *guess* (the plans give no heights,
    // under the garage's ceiling −0.35); frames / panes reuse the Å-husen's listed windows (NEIGHBOR_OPENINGS.site).
    boxWindows: { sill: 1.1, head: 2.2, edges: [
      [52.5, [[-66.35, -64.53], [-61.35, -59.53], [-56.31, -54.49], [-52.84, -50.97], [-43.05, -42.08]]],
      [33.3, [[-20.61, -18.79], [-17.39, -15.57], [-14.17, -12.35]]]] },
    ramp: { x0: 11.6, x1: 13.5, z0: 11.5, z1: 24.5, drop: 0.9 },
    garageDoor: { x: -70.5, z0: 41, z1: 47, h: 2.6, drive: -77.22 }, // `drive`: the asphalt reaches west to Karpvägen
    // East of the courtyard (#255) Sankt Lars väg lies only ~1 m below it, not a storey: from x0 (Hus A's east façade) to
    // x1 (the road's far edge) the ground follows `profile` ([z, y] pairs, linear); east of the road it blends into the
    // park level over `blend` m (north of Hus L's back: back to the street level).
    // (#261: x1 = the far pavement's edge, the long brick building's west face)
    // #256 (the user: the street towards HepCat Store slopes): the east leg is level with the entrances up to z −10 (HepCat's
    // north end, guess), 0.9 m down by Hus L's east gable (the ramp's foot, våning 1), 1.4 m at the foot of the stair, park
    // level further south (guess). The strip along the gable (x `gable`…) falls from the entrance path (z 0) to the ramp's
    // foot; from `level` (the front yard's east edge) to `walk` (our pavement's inner edge) a grass bank meets the road.
    east: { x0: 9.42, x1: 31.3, blend: 2.5, gable: 11.6, level: 13.5, walk: 18.4, profile: [[-10, 0], [11.6, -0.9], [30.0, -1.4], [44, -3]] },
    // #256: Karpvägen also slopes south (våning 1: "NIVÅSKILLNAD CA 1M" at a "TRAPPA" by Hus C's NW corner). West of `x`
    // (Hus C's west façade line) the ground follows `profile` (fitted to where the stair's risers end on the plan, then
    // down to the park level where the garage drive starts, z 40.5 = garageDoor.z0 − 0.5, so the drive in front of the
    // door is level with the garage floor (#346; the slope in between: guess). The `stair`: `risers` lines from x0 (its foot) to x1 (the top),
    // running from where the sloping verge meets each step south to z1; from z1 to Hus C a retaining wall.
    west: { x: -70.5, profile: [[-2.8, 0], [11.25, -1.0], [40.5, -3]], stair: { x0: -70.5, x1: -68.69, z1: 10.6, risers: 7 } },
    // stairs from the courtyard (y 0) going south, `z` = the box edge they leave; `drop` m in `steps` (default: down to
    // the park level, ~0.17 m each, a `landing` halfway); `walk` = paving from the foot. #255: "TRAPPA NIVÅSKILLNAD CA
    // 1,4M" (våning 1: 9 risers x 11.6…13.5, z 27.25…30) from the landing at the walk along Hus A down to the walk east
    // to Sankt Lars väg (z 30…31.8). #254: "TRAPPA" between Hus C and Hus B (from the level line at z 52.5 down to
    // z ≈ 59). #1204 (downstream #46): x −47.4…−44.4, the full flight width drawn on våning −1 and våning 1 (both ≈ 3.0 m,
    // ±0.15 m graphical reading; was 1.5 m); risers, landing and handrail height stay as before (not dimensioned, *guess*).
    stairs: [{ x0: 11.6, x1: 13.5, z: 27.25, step: 0.3, drop: 1.4, steps: 9, walk: { x0: 11.6, x1: 19.7, z0: 29.95, z1: 31.8 } }, // the walk meets the pavement along Sankt Lars väg (SITE.roads)
      { x0: -47.4, x1: -44.4, z: 52.5, step: 0.3, landing: 1.0 }],
  },
  // façade texture of the other blocks: one window per 3 × 3 m. `storey` = one generic floor-to-floor height for Hus A, B
  // and C (assumption, #344): plan brochure S2 gives only their storey counts (A suterräng + 1–4, B suterräng + 1–3,
  // C 1–5 = `storeys` from `base` in `blocks`), not equal or known heights; it sets their eaves, window rows and loggias
  bay: 3.0, storey: 3.0,
  // the Å-husen's shape (#145, #258), measured on the calibrated overview plans (upstream architectural reference):
  // each corner is a loggia over the full height, `corners` per block = [length along x, depth along z] in m (A and B: the
  // north ones 3.4 × 2.0, the south ones 5.9 × 2.05 with the middle 7.5 m standing out; Hus C is turned: its NE one opens
  // east, 2.0 × 4.15). White slabs and rendered inner walls ("håligheter … vitputsade", info brochure), a brick pier at
  // the outer corner and one `midAt` m along a front longer than `mid` (the plans draw it), a slatted railing in the façade
  // line. `recesses` per block: { face n|e|s|w, a0, a1 (plan coordinate along the face), depth, from/to (storeys, counted
  // from `base`; none = all), door (the storey with the entrance door) } — white-rendered entrance recesses (A/B north,
  // A west / B east at the park level, Hus C east with loggias above). `plants` = share of the loggias with a plant.
  // #266 (upstream architectural reference, upstream architectural reference): on every storey the longer
  // inner wall has a glazed `door` from the flat in the inner corner (`gap` from the other inner wall) and a `window`
  // `from` m from the façade line, up to `max` wide and `gap` short of the door (NW 1.0 m, SW 2.2 m on the plans); the
  // other inner wall is solid. A loggia whose floor is at the ground (the flats' uteplatser, våning 1 on the courtyard)
  // has a brick `parapet` (h, t: guess) with a light coping instead of the railing, with an `open`ing next to the
  // flat's wall on the longer front (våning 1: the band stops ~0.85 m short, x −7.2…−6.4 for Hus A NW). The upper
  // storeys keep the light slatted metal railing (thin lines on våning 2–4, Peab's aerial render). `entrance`: the
  // recess's glazed door (w) with a sidelight (side), a canopy over the mouth (out, at, t), a house letter beside it.
  loggia: { pier: 0.5, rail: 1.05, plants: 0.35, mid: 4.5, midAt: 3.5,
    door: { w: 0.9, h: 2.3, gap: 0.08 }, window: { from: 0.9, max: 2.2, gap: 0.5, sill: 0.8, head: 2.3 },
    parapet: { h: 1.05, t: 0.2, open: 0.85, coping: 0.04 },
    entrance: { w: 1.1, side: 0.55, h: 2.35, canopy: { out: 0.7, at: 2.85, t: 0.14 }, sign: 0.42 } },
  // their roof: a low hip roof with the ridge along the long side (N–S), roofing felt ("papp", Peab's Q&A). #348: each
  // house's own shape = these defaults with the block's `hip` over them (`roofSpec` in surroundings.js), its eaves at its
  // own wall top (base + storeys × storey: A over våning 4, B over våning 3, C over våning 5). Roof plans: Hus B's on the
  // våning 4 sheet, Hus A's on våning 5 (page 26 of the plan brochure, same calibration as docs/peab/kalibrerad/): both draw
  // the eave line 0.13–0.21 m outside the façade (`overhang` 0.18) and the hips at 45° in plan meeting a N–S ridge
  // (= the same pitch on all four sides, as modelled), with a roof box near the north end of the ridge (`box`: plan
  // rectangle, read off; its height `h` over the roof is a guess — Peab's aerial render shows a light box there). There is
  // no roof plan for Hus C (våning 5 is its top storey and no sheet shows its roof): it keeps the defaults and no box,
  // though the render shows one. `rise` (ridge over the eave line) and `edge` (the metal edge's top over the wall top) are
  // guesses from the aerial render: no section or elevation gives the pitch or heights. The vent hoods are illustrative.
  hipRoof: { rise: 1.5, overhang: 0.18, edge: 0.32 },
  // #345: the Å-husen's façade openings per house and face (n|e|s|w = the outer façade line between the corner
  // loggias), read off the calibrated overview plans (upstream architectural reference; våning 5 for Hus C
  // from page 26 of the plan brochure, same calibration) where the plans draw a window or door in the outer wall:
  // [a0, a1 (plan x on n/s, z on e/w), from, to (storeys counted from the block's `base`), kind ('door'; else a window)].
  // The loggias' and entrance recesses' own openings are not here (#258, #266); the park-level doors under the
  // courtyard deck are not inferred as outdoor doors; #729 verifies the A/B park entries separately. Only the horizontal placement and the count are sourced: the plans give
  // no heights or frame division, so `openingSize` (sill / head over the storey floor) and the window's mullion and
  // transom are the old grid tile's guess. A face missing here falls back to the old 3 × 3 m window grid
  // (`bay`, `storey`); fallback faces of Hus A/B/C now: none.
  openingSize: { sill: 0.8, head: 2.3, door: 2.3 },
  facades: {
    'Hus A': {
      n: [[-5.04, -3.2, 1, 4], [-2.02, -0.62, 1, 4], [2.94, 4.76, 1, 4], [0.3, 1.74, 2, 4]], // våning 1: the entrance recess
      e: [[31.84, 33.5, 1, 4], [35.82, 37.44, 1, 4], [39.08, 40.74, 1, 4], [42.38, 43.78, 1, 4], [44.98, 46.36, 1, 4], [48.02, 49.84, 1, 4]],
      s: [[-2.62, -0.8, 0, 4], [0.52, 2.34, 0, 4]],
      w: [[33.96, 34.76, 0, 0, 'door'], [35.82, 37.44, 0, 4], [39.08, 40.74, 0, 4], [44.98, 46.36, 0, 4], [48.02, 49.84, 0, 4],
        [31.84, 33.5, 1, 4], [42.38, 43.78, 1, 4]],
    },
    'Hus B': {
      n: [[-37.22, -35.4, 1, 3], [-31.72, -30.28, 1, 3], [-28.96, -27.14, 1, 3], [-34.0, -32.6, 2, 3]],
      e: [[36.24, 36.76, 0, 0], [37.06, 37.86, 0, 0, 'door'], [40.32, 41.96, 0, 3], [43.62, 45.22, 0, 3], [49.46, 50.9, 0, 3],
        [52.64, 54.46, 0, 3], [36.38, 37.98, 1, 3], [46.88, 48.28, 1, 3]],
      s: [[-34.6, -32.78, 0, 3], [-31.46, -29.64, 0, 3]],
      w: [[36.38, 37.98, 1, 3], [40.32, 41.96, 1, 3], [43.62, 45.22, 1, 3], [46.88, 48.28, 1, 3], [49.46, 50.9, 1, 3], [52.64, 54.46, 1, 3]], // våning −1: against the garage
    },
    'Hus C': {
      n: [[-63.82, -62.22, 0, 4], [-60.72, -58.94, 0, 4], [-57.34, -55.52, 0, 4]],
      e: [[18.11, 20.31, 0, 4], [25.53, 26.97, 0, 4], [28.97, 30.79, 0, 4]],
      s: [[-63.02, -61.4, 0, 4], [-59.76, -58.14, 0, 4]],
      w: [[18.58, 20.4, 0, 4], [21.98, 23.58, 0, 4], [25.4, 27.06, 0, 4], [28.88, 30.32, 0, 4]],
    },
  },
  old: { bay: 2.6, storey: 3.6, roofPitch: 0.6 }, // the old S:t Lars buildings (style: 'old'): rise = pitch × half depth
  // the school straight across Sankt Lars väg (#126, upstream architectural reference): two high
  // storeys of brick with white quoins, trim and plinth, arched windows below, square ones above, a dark metal
  // roof with chimneys. One façade texture tile = a bay × the whole height (`storey`); `rows` = window-light
  // centres and sizes. A greenhouse in its yard and a 2.3 m brick wall with a black coping along the pavement.
  school: { bay: 3.0, storey: 8.6, roofPitch: 0.32, rows: [{ y: 2.05, s: [0.95, 1.6, 1] }, { y: 5.95, s: [0.95, 1.35, 1] }],
    // #564 photo interpretation, not measured: see docs/validation/issue-564/README.md.
    mapped: { roofRise: 1.05, roofSlope: .24, roofGrid: 1.2, seam: .6,
      white: 0xeeeae1, joint: 0xc3bbb0, glass: 0x405660,
      // Edge indices of unchanged OSM 88457612. Two windows on visible outer fronts;
      // centre/rear/connecting-wing counts obscured by trees are guesses.
      bays: [4,0,2,5,2,0,4,0,4,0,4,0,2,5,2,0,4,0,4,0],
      fronts: [4,8,12], width: 1.5, sill: [1.05,5.25], head: [3.45,7.5],
      archRise: .20, frame: .12, mullion: .045, quoin: .65, jointStep: .43,
      plinth: .72, belt: [4.3,.22], cornice: [[-.45,.32,.12],[-.23,.14,.23],[-.08,.16,.34]],
      dentil: { step: .48, width: .16, height: .22, depth: .20 },
      chimneys: [[-34,-62],[-12,-62],[11,-62]], chimney: [.65,1.45,.65], cap: [.82,.12,.82],
      brick: { mortar: '#96877b', base: [125,64,46], variation: 26 },
      metal: ['#53585b','#333a3e','#697074'] },
    wall: { x0: -26, x1: 30, z: -32.15, h: 2.3, t: 0.3 }, greenhouse: { x0: 13, x1: 21, z0: -36.8, z1: -33.6, h: 2.2, ridge: 1.0 },
    chimneys: [-14, -3, 8, 17] },
  // HepCat Store and the long brick building behind it, east of our row across Sankt Lars väg (#127, the user's photos
  // upstream architectural reference, upstream architectural reference): a storey and a
  // half of brick with white pilasters and a white rendered middle part with its own gable, a dark standing-seam
  // metal roof; behind it a long low brick building with dormers and yellow-framed windows. `rows` = window lights.
  hepcat: { bay: 3.2, storey: 4.2, rows: [{ y: 1.7, s: [1.1, 1.0, 1] }] },
  hepcatWhite: { bay: 4.0, storey: 6.0, rows: [{ y: 1.7, s: [1.1, 1.0, 1] }, { y: 4.4, s: [0.6, 0.8, 1] }] },
  longhouse: { bay: 2.6, storey: 3.8, rows: [{ y: 1.6, s: [0.9, 1.2, 1] }], dormers: 5 },
  blocks: [
    // Kv. Lunden, Å-husen (overview plans): storeys counted from `base`; red brick, low hip roof
    { name: 'Hus A', x0: -9.76, x1: 9.42, z0: 28.8, z1: 52.86, base: -3, storeys: 5, roof: 'hip', // våning -1…4; north face on the box edge (#246)
      hip: { box: { x0: -1.64, x1: 1.28, z0: 33.49, z1: 37.39, h: 1.0 } }, // roof plan on the våning 5 sheet (#348)
      corners: { nw: [3.4, 2.0], ne: [3.4, 2.0], se: [5.9, 2.05], sw: [5.9, 2.05] },
      recesses: [{ face: 'n', a0: 0.23, a1: 2.22, depth: 2.1, from: 1, to: 1, door: 1, walkIn: true }, // the main entrance from the courtyard (våning 1); a real door into the stair core (#637, CORE_A)
        { face: 'w', a0: 41.4, a1: 43.4, depth: 0.75, from: 0, to: 0, door: 0, walkIn: true, basement: { door: [42.25, 43.30], side: [41.46, 42.25], height: 2.1, floorEdge: -9.05 } }] },    // #729, upstream #1258: p46 exterior leaf range + sidelight; setback 0.75 and finish/height remain *guess* (formerly decorative, #647)
    { name: 'Hus B', x0: -41.74, x1: -22.6, z0: 33.3, z1: 57.35, base: -3, storeys: 4, roof: 'hip', // våning -1…3
      hip: { box: { x0: -33.59, x1: -30.67, z0: 38.01, z1: 41.91, h: 1.0 } }, // roof plan on the våning 4 sheet (#348)
      corners: { nw: [3.4, 2.0], ne: [3.4, 2.0], se: [5.9, 2.05], sw: [5.9, 2.05] },
      recesses: [{ face: 'n', a0: -34.58, a1: -32.5, depth: 2.1, from: 1, to: 1, door: 1, walkIn: true }, // mirrored: west of the middle; a real door into the stair core (#638, CORE_B)
        { face: 'e', a0: 46.1, a1: 48.1, depth: 1.0, from: 0, to: 0, door: 0, walkIn: true, basement: { door: [46.8, 47.85], side: [46.10, 46.80], height: 2.1, floorEdge: -23.6 } }] },
    { name: 'Hus C', x0: -70.6, x1: -51.4, z0: 12.6, z1: 36.68, base: 0, storeys: 5, roof: 'hip', hip: {}, // våning 1…5; no roof plan: the defaults (#348)
      corners: { nw: [5.5, 2.1], ne: [2.0, 4.15], se: [5.4, 2.0], sw: [6.1, 2.0] },
      recesses: [{ face: 'e', a0: 21.5, a1: 24.8, depth: 2.0, door: 0, walkIn: true }] },  // the entrance, loggias above it; a real door into the stair core (#639, CORE_C)
    // outside the plot (#47): the old S:t Lars hospital buildings, as on Peab's drone photo and aerial
    // render (docs/peab/): red brick with white trim, steep dark hip roofs, high storeys and tall
    // white windows. Storey counts and heights are read off those pictures — guesses, not surveyed.
    // #261: outlines from the situation plan (the user's photos agree: HepCat right by the road, the long building
    // further south behind an open gap); the long building's east side and the annex's depth are off the sheet (guess)
    { name: 'HepCat Store', x0: 28.2, x1: 36.4, z0: -10.8, z1: 10.0, base: 0, storeys: 1, roof: 'gable', style: 'hepcat', chimneys: [-5, 4] }, // #127
    { name: 'HepCat Store, the white middle', x0: 27.9, x1: 36.4, z0: -2.6, z1: 1.8, base: 0, storeys: 1, roof: 'gable', style: 'hepcatWhite' },
    // #535: school/longhouse placeholders moved to source-based SITE.east; the photo-based wall remains.
    { name: 'Villa', x0: -63, x1: -47.3, z0: 67.7, z1: 84.1, base: -3, storeys: 3, roof: 'hip', style: 'old' }, // brick house, hip roof
  ],
  // The street details (#128, src/street.js; the user's photos in docs/foton/): granite curbs along Sankt Lars väg,
  // patched asphalt, slender street lamps with a curved arm (lit at night: emissive heads + ground pools, #434), a zebra crossing,
  // a temporary yellow traffic light and warning signs for the building site, a cobbled corner and fallen leaves
  // in the autumn months. Positions are our picks.
  street: {
    // curbs run along both edges of every road with a `path` and round the fillets, except across another road (#257)
    patches: [[-31, -27.6, 4.5, 1.6], [-6, -25.4, 2.2, 1.0], [4.5, -28.3, 7, 1.2], [15, -26, 1.2, 1.2], [26, -12, 1.4, 3.5], [-55, -28.5, 3, 1.4]],
    // street lamps in rows along a road (`road` = its name): from / to = the plan points nearest the first and last,
    // `off` m from the road's edge on `side` (1 = right of the path's direction, −1 = left), the arm over the road
    lamps: { h: 6.2, arm: 1.3, rows: [
      { road: 'Sankt Lars väg', from: [-66, -27], to: [24.1, 8], step: 24, side: 1, off: 2.0 }, // our pavement, round the corner
      { road: 'Karpvägen', from: [-75.8, -12], to: [-78.5, 44], step: 26, side: -1, off: 0.8 },  // along Hus C (#257)
    ],
    // #434: the pool of light on the ground under each head (an additive decal, street.js): `along` / `across` the road
    // m (radii, guess), warm `color` at `peak` opacity; lit above `on` night (1 − daylight), out below `off`, `fade` s
    pool: { along: 8, across: 6.5, color: 0xffc887, peak: 0.55, on: 0.35, off: 0.3, fade: 1.5 } },
    crossing: { x0: 9.5, x1: 12.5, z0: -30, z1: -24 },
    trafficLight: { x: 8.6, z: -23.5 }, warnings: [[13.2, -23.0], [10.6, -23.2]],
    cobbles: { x0: 17.2, x1: 19.5, z0: -17.5, z1: -12.5 }, // inside the corner, by the end of our car park
    leaves: { n: 1400, months: [9, 10, 11], areas: [[-60, 12, -24, -18], [-30, 10, -32.1, -30.05], [19, 21, -12, 12]] },
    // signs (#129, the user's photos): the bus stop on the far pavement, the red "Flyttad" sign on ours by the curb,
    // a no-parking sign at the car park, HepCat's A-board on its pavement. [x, z, facing yaw°]
    busStop: [2.5, -31.3, 0], moved: [6.5, -23.75, 0], noParking: [-13.6, -16.9, 0], aBoard: [28.4, -12.2, -60], // by HepCat's north corner (#261, photo)
  },
  // Street name signs (#583, src/streetsigns.js; sources and selection: docs/validation/issue-583/README.md). One post at every
  // junction of two differently named streets in the model plus the two clear bends by the block (Sankt Lars väg round the
  // NE corner, Karpvägen into the park); campus service roads and our drive get none. Each `blades` entry lies along a leg
  // of the junction: `dir` = that leg's unit direction [dx, dz] from the junction (roads.js / SITE.*.paths), `nums` = the
  // house numbers that lie that way, drawn with an arrow. Names: OSM 2026-10-08 (docs/references/surrounding-views/).
  // Numbers, never invented: Karpvägen 2–10 = Brf S:t Lars Park's Hus 1–3 (#575); Sankt Lars väg 41–70 = every
  // addr:housenumber the OSM snapshot has on Sankt Lars väg, all south of Höje å (none is mapped by the block, so the near
  // stretch shows the name only; which fork south of the river carries which number is not clear from OSM → names only
  // there); Sävsländegatan 2–20, Nattsländegatan 2–20, Hattsnäckegränden 2–12 = their complete OSM address sets.
  // Källby ängaväg / Alvägen have no mapped numbers. Post positions: at the corner nearest the walkable area (near) or
  // between two legs ~4 m off the junction (far), clear of the asphalt. Look and sizes are visual *guesses* after the
  // usual Swedish blue gatunamnsskylt (white text, white border); no collision (like street.js's signs).
  streetSigns: {
    post: { h: 3.0, r: 0.035, sink: 0.3, color: 0x8e9296 },  // galvanised pole, its foot sunk into the ground (*guess*)
    blade: { w: 1.4, h: 0.28, d: 0.025, gap: 0.05, top: 2.95 }, // blades stacked down from `top` (m over the ground, *guess*)
    colors: { bg: '#1d4f9c', fg: '#ffffff' },                   // blue sign, white text and border (*guess*)
    font: 'bold %px "Arial Narrow", "Helvetica Neue", Arial, sans-serif', // stands in for Tratex; long names are squeezed (*guess*)
    atlas: { w: 1024, h: 1024, cols: 2 },                     // one shared canvas for every blade face (≤ LOW_MEMORY's 1024)
    signs: [
      // near the block
      { at: [-71.2, -21.2], blades: [{ name: 'Karpvägen', nums: '2–10', dir: [0, 1] }, { name: 'Sankt Lars väg', dir: [1, 0] }] }, // Sankt Lars väg × Karpvägen, off the old walker's turn (#114)
      { at: [17.9, -18.6], blades: [{ name: 'Sankt Lars väg', dir: [-1, 0] }, { name: 'Sankt Lars väg', nums: '41–70', dir: [0, 1] }] }, // the bend at the NE corner, on the inner pavement clear of the campus road's mouth
      { at: [-82.2, 68.6], blades: [{ name: 'Karpvägen', nums: '2–10', dir: [-0.976, 0.217] }, { name: 'Karpvägen', dir: [0.293, -0.956] }] }, // Karpvägen's bend into the park
      // the backdrop (OSM junction nodes)
      { at: [-122.19, -35.02], blades: [{ name: 'Källby ängaväg', dir: [-0.82, 0.58] }, { name: 'Sankt Lars väg', dir: [0.83, 0.56] }] },
      { at: [-137.55, -35.2], blades: [{ name: 'Alvägen', dir: [-0.56, -0.83] }, { name: 'Källby ängaväg', dir: [0.85, -0.52] }] },
      { at: [-202.13, 28.2], blades: [{ name: 'Karpvägen', nums: '2–10', dir: [0.36, 0.93] }, { name: 'Källby ängaväg', dir: [0.9, -0.44] }] },
      { at: [23.36, 212.12], blades: [{ name: 'Sankt Lars väg', dir: [-0.51, 0.86] }, { name: 'Sankt Lars väg', dir: [0.13, -0.99] }] }, // the fork south of the river
      { at: [51.14, 218.42], blades: [{ name: 'Sankt Lars väg', dir: [0.25, 0.97] }, { name: 'Sankt Lars väg', dir: [0.9, -0.43] }] },
      { at: [132.92, 219.85], blades: [{ name: 'Sävsländegatan', nums: '2–20', dir: [0.6, 0.8] }, { name: 'Hattsnäckegränden', nums: '2–12', dir: [0.81, -0.58] },
        { name: 'Nattsländegatan', nums: '2–20', dir: [-0.4, -0.92] }] },
      { at: [223.57, 211.17], blades: [{ name: 'Hattsnäckegränden', nums: '2–12', dir: [-0.28, -0.96] }, { name: 'Sävsländegatan', dir: [0.97, -0.25] }] },
      { at: [247.98, 204.21], blades: [{ name: 'Sävsländegatan', nums: '2–20', dir: [0.16, 0.99] }, { name: 'Nattsländegatan', nums: '2–20', dir: [-0.61, -0.79] }] },
    ],
  },
  // Life on the street (#113, src/streetlife.js). #260, the situation plan (upstream architectural reference):
  // "P-platser för S:t Lars området" between the hedge (z −16.3) and a low green strip along Hus L (z −3.5…−2.9, open at
  // the portik); one row of stalls nose to the hedge (the plan's ticks, z −16.3…−11.3), none from the drive (in front of
  // the portik — the plan's photo covers that stretch: guess) to the east end; the aisle in front of the entrances. Parked
  // car colours are ours. #529: no bicycles along Hus L's entrances. NW of Hus L, north of Hus C, the plan's
  // "Cykelvänligt kvarter" yard: a lawn with a tree and two smaller ones, a paved bike place with two rows of racks, a
  // narrow lawn east of it; light paving round it (west of x −66 is left for the stair down to Karpvägen, #256).
  life: {
    lot: { x0: -70.5, x1: -13, z0: -16.3, depth: 5, stall: 2.5 }, fill: 0.65,
    carColors: [0xf0f0ec, 0x23272c, 0x8d9399, 0x1f6f78, 0x7b1e22, 0x2d4e7a, 0xc9c3b8, 0x0f1012],
    // the low green strip along the entrances: a concrete edge, grass and clipped entrance hedge (clear passages by every front doorway)
    strip: { z0: -3.5, z1: -2.9, h: 0.1, parts: [[-46, -10.6], [-8.5, 5.8]],
      // #496 correction: clipped entrance hedge IN this existing bed; parking shrubs stay original.
      // Assumed 58 cm total height above ground, 44 cm depth and 35 cm clear margin either side of each doorway.
      hedge: { height: .5, depth: .44, rounding: .045, color: 0x48733c, roughness: .92, bump: .009,
        texturePeriod: .32, textureLeaves: 1700, snowDepth: .035, entranceMargin: .35,
        cell: .11, dent: .03, footScale: .9 } },
    yard: { x0: -66, x1: -46.33, z0: -3.5, z1: 9.6 },                              // the bike yard's paving
    lawns: [[-65, -59.1, 1.2, 8.5], [-53, -50.1, 1.2, 8.5]],                         // x0, x1, z0, z1
    bikePlace: { x0: -59.1, x1: -53, z0: 1.2, z1: 8.5 },                              // lighter paving
    // racks along z at x, the bikes along x pointing `dir` (front wheel in the rack), `n` from z0 at `gap` m
    racks: [{ x: -58.7, z0: 1.6, n: 9, gap: 0.75, dir: -1 }, { x: -53.4, z0: 1.6, n: 9, gap: 0.75, dir: 1 }],
    // #436: low concrete edges where the car park's asphalt (`road`) meets grass (not along the paving, the drive's or the
    // street's granite curbs, the stair), and round the bike yard's lawns: `w` wide, `h` over the ground (≤ 5 cm: no step),
    // light grey concrete — sizes are guesses; visual only (no collision, the ground's height is unchanged)
    edges: { road: 'Gården framför Hus L', w: 0.1, h: 0.05, step: 1.0, color: 0xc9c5bc },
    trees: [[-62.5, 3.4, 0.75], [-63.3, 6.0, 0.4], [-61.4, 7.6, 0.45], [15.2, -19.6, 0.45]], // [x, z, size]; the last in the planting strip
    // by the road past the hedge's east end (#435: it stood on the car park's asphalt in front of Hus L's east end)
  },
  // asphalt (y follows the ground: the street level north of Hus L and on the garage box, park level around it).
  // src/roads.js: a rectangle, a centre line (`path`: [x, z, r] — the corner at that point rounded to radius r; `w` = the
  // width at each point; `walks` = pavements along it, `w` m wide on `side` 1 = right of the direction, −1 = left) or
  // `fillets` (asphalt in a square corner between two road edges, a quarter circle of radius r; sx, sz point away from
  // the asphalt). #257, the situation plan: Sankt Lars väg runs along Hus L (z −30…−24, right already) and turns south
  // in a wide curve round the plot's NE corner (the plan's curve is wider still, but it would run over our car park);
  // Karpvägen comes up along Hus C (x −79…−73.5 at z 25–30, −81.6…−75.7 at z 45), bends west into the park south of
  // the sheet, and meets Sankt Lars väg in a sweeping curve on its west side (the plan's NW corner is under a photo:
  // guess) and a small rounding on the east.
  roads: [
    // (#261: the east leg as on the plan: x ≈ 20.9…27.3 by HepCat, 22…29 by the long building)
    // Upstream #1351: omit the redundant 1.58 m right-angle map-to-local-street jog; 8 m easing radius is a visual guess.
    { name: 'Sankt Lars väg', path: [[-256.22, -291.48], [-243.52, -289.9], [-237.28, -289.55], [-225.08, -288.32], [-208.34, -287.08], [-195.0, -284.95], [-177.57, -282.79], [-154.54, -277.33], [-151.97, -274.75], [-149.99, -272.15], [-148.38, -269.65], [-147.13, -266.84], [-145.1, -260.27], [-140.56, -241.82], [-135.7, -219.86], [-129.65, -185.87], [-128.8, -178.12], [-127.48, -165.95], [-127.2, -161.66], [-126.9, -141.65], [-127.42, -108.38], [-127.67, -69.23], [-127.53, -61.63], [-126.67, -51.73], [-125.36, -46.47], [-124.14, -42.86], [-122.25, -40.5], [-119.72, -38.26], [-116.31, -36.46], [-110.65, -33.5], [-105.83, -31.41], [-98.07, -29.8], [-82.28, -27, 8], [24.3, -27, 13], [24.1, 0, 30], [25.5, 26, 30], [25.5, 70], [23.9, 100], [23.3, 145.8], [26.53, 188.72]], w: [6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6.4, 7, 7, 7, 7, 7],
      walks: [{ side: 1, w: 2.5 }, { side: -1, w: 2 }] }, // our pavement; the far one along the school's wall (#126)
    { name: 'Karpvägen', path: [[-75.8, -27], [-75.8, 22, 30], [-79.9, 51, 20], [-84.5, 66, 8], [-105.74,70.72], [-125.37,63.39], [-191.7,40.27], [-196.1,38.73], [-200.83,37.12], [-202.86,35.86], [-204.59,33.56], [-206.22,30.1], [-207.84,25.96]], w: 5.8 },
    { name: 'Karpvägen, hörnen', fillets: [{ x: -78.7, z: -24, sx: -1, sz: 1, r: 9 }, { x: -72.9, z: -24, sx: 1, sz: 1, r: 3 }] },
    { name: 'Gården framför Hus L', x0: -70.5, x1: 13.5, z0: -16.3, z1: -3.5 }, // the car park up to the green strip (#260)
    // the car park's drive (#356): asphalt from Sankt Lars väg over our pavement and the planting strip through the gap in
    // the hedge (SITE.shrubs gaps, x −13…−7.5) into the car park, with rounded mouth corners (the situation plan's photo
    // covers it: guess, like the gap itself, #260)
    { name: 'Infarten', path: [[-10.25, -24.5], [-10.25, -16.1]], w: 5.5 },
    { name: 'Infarten, hörnen', fillets: [{ x: -13, z: -24, sx: -1, sz: 1, r: 2 }, { x: -7.5, z: -24, sx: 1, sz: 1, r: 2 }] },
  ],
  // #729: simple connected park paving, traced approximately from the light strips in the situation plan.
  // Straight strips typically 1.5 m wide; terminal rectangles/route/widths are *guess*, all on existing park ground (-3); no surveyed levels.
  basementPaving: [
    { x0: -47.4, x1: -44.4, z0: 58.6, z1: 59.0 }, // the existing C/B stair's foot (#1204: its full width)
    { x0: -47.4, x1: -16.7, z0: 59.0, z1: 60.5 }, // around B south, clear of its façade/patios
    { x0: -16.7, x1: -15.2, z0: 42.0, z1: 60.5 }, // the green between A/B
    { x0: -22.6, x1: -16.7, z0: 46.45, z1: 47.95 }, // branch to B east
    { x0: -15.2, x1: -11.4, z0: 43.3, z1: 44.8 }, // A dogleg south of the sourced tree at (-14.8,42.2)
    { x0: -11.4, x1: -9.76, z0: 42.0, z1: 44.8 }, // short final approach to A west
    { x0: -27.4, x1: -25.9, z0: 60.5, z1: 66.0 }, // #1341: joins the gravel path from the river park (OSM 123898762, which the park's clip cuts off at z 64) to the walk round B south: it began in the open grass 3.5 m short of it (*guess* position, the path's own end)
  ],
  paving: [
    { x0: -46.33, x1: 13.5, z0: -3.5, z1: 0 },  // path along Hus L's entrances (under the green strip too, #260)
  ],                                         // the pavements: roads' `walks`; the courtyard's own walks: COURTYARD
  // #535: visible terrain extent covers the sourced campus; independent of OUTDOOR walking bounds.
  backgroundGround: {x0:-350,x1:340,z0:-340,z1:260},
  // #532: geographic registration uses FOJAB/DAY.planNorth (58°) and the HepCat OSM footprint centre
  // (way 130578353) matched to the existing Peab-based model centre. Horizontal accuracy ~3–5 m, not surveying.
  geo: {anchor:{lon:13.181015825,lat:55.684965075,x:32.3,z:-.4},source:'OSM 2026-10-08, way 130578353'},
  // Bridge ways 23873379 / 44447984 (same-date OSM snapshot); deck GC length 40 m from Hjalmarssons.
  // All heights, widths, pier dimensions, rail/truss section sizes and colours below are visual ASSUMPTIONS.
  bridges: {road:{ends:[[23.9,100],[23.3,145.8]],width:7.2,slab:.45,pier:.75,foot:1.8},
    gc:{ends:[[18.1,101],[17.8,146.5]],length:40,width:3,slab:.18,truss:1.45,panels:10,steel:.10},
    deckY:-3,waterY:-6.2,bedY:-6.8,shoreY:-5.5,shoreSpan:7.5,valleySpan:8.5,pierMargin:.2,rail:1.1,post:.07,railStep:1.9,approach:8},
  // #532 foundation: sourced horizontal river centreline near the two bridges; #533 owns detailed banks/paths/vegetation.
  // Width and uniform depth remain assumptions; do not describe these as measured water levels or surveyed banks.
  // `bankScale` (guess, from original #1233) shortens every bank span below so the slope to the water is steeper; not surveyed.
  river: {width:8,bank:10,bankScale:.55,
    // #533 widths/bank spans are visual estimates from the aerial/2016 photos, not surveyed dimensions.
    widths:[6,6,7,8,8,9,9,8,8,8,7,7,6,6,6,7,7,6,6],
    banks:[13,14,15,12,11,12,13,11,10,10,12,14,13,7,3,3,13,12,10],
    terrainSubdivisions:3, terrainRefineRadius:28, path:[[204.64,74.37],[190.76,79.13],[131.38,74.61],[127.15,83.64],[124.35,101.96],
    [116.11,114.02],[105.35,119.29],[74.99,119.53],[44.31,119.8],[1.16,125.14],[-15.1,129.89],[-67.45,166.11],
    [-89.43,183.37],[-101.32,198.71],[-110.41,205.34],[-181.7,207.36],[-220.92,225.61],[-235.63,235.51],[-248.18,251.46]],
    source:'OSM river way 137217705, local section registered to the existing model; 2026-10-08'},
  // #533: main park paths are OSM 2026-10-08; canopy patches/glade traced approximately on the registered aerial.
  // Counts, species mix, widths, heights, branch detail and the small western timber bridge are visual ASSUMPTIONS.
  // Nearby Peab trees and OUTDOOR remain unchanged. No claim of an individual-tree survey.
  // #1235: every path carries `surface` (asphalt|gravel) from its OSM `surface` tag (asphalt/paved -> asphalt; unpaved/ground/dirt/untagged -> gravel).
  // OSM has no highway=cycleway along the river in the modelled area (the mapped cycleways lie north of Lunden and far south), so the asphalt
  // paths (path + surface=asphalt, shared foot/cycle use) are the cycle route. Surface colours and the widths of the added ways are *guess*.
  // #1301: the bus stop "Lund Sankt Lars" (A) at the fork south of the river, where the asphalt cycle route to Circle K (OSM 61112061,
  // SITE.riverPark.paths) meets Sankt Lars väg. Source OSM 2026-10-18 (api.openstreetmap.org, docs/references/surrounding-views/bus-stop-sankt-lars-2026-10-18.json):
  // platform way 189432570 (bench, bin, shelter, lit, tactile_paving; Skånetrafiken), shelter node 2000527685, stop_position 2000527662, the bus bay
  // roads 189432572 / 95035967. The platform way is its road-side kerb line; the platform lies on the far side (width, heights, colours: *guess*).
  // Generic Swedish-style bus shelter and green/yellow stop sign without any operator logo; every dimension is a visual *guess*. Plan coordinates via SITE.geo.
  busStop: {
    source: 'OSM way 189432570 + node 2000527685 (2026-10-18)',
    kerb: [[33.39, 190.95], [35.59, 192.31], [51.45, 202.12]], // the platform way: the road-side edge, platform to its left (−normal)
    width: 3.6, lift: 0.04, kerbH: 0.1, kerbW: 0.18, // platform width (m), surface lift over the ground, kerb stone height / width (*guess*)
    tactile: { w: 0.6, color: 0xd8c25a, from: 0.25, len: 6 }, // tactile paving strip along the kerb (OSM tactile_paving=yes), pale yellow, 6 m centred on the node 2000527695 (*guess*)
    colors: { paving: 0x8d8b86, kerb: 0xbdb9b0, steel: 0x3b4046, wood: 0x9a6b3f, glass: 0xaecbd0, bin: 0x2f5d3a },
    shelter: { at: [36.89, 189.99], len: 3.4, depth: 1.5, h: 2.5, roof: 0.1, glassY: [0.15, 2.3], post: 0.08, bench: { len: 2.0, depth: 0.42, h: 0.46 } }, // node 2000527685 = the shelter's centre; sizes *guess*
    sign: { s: 11, t: 0.55, h: 2.6, panel: [0.5, 0.7], colors: { bg: '#0b5d3b', fg: '#ffffff', accent: '#f2c400' }, name: 'Sankt Lars' }, // stop sign s m along the kerb from its first point, t m in from it (the bus's stopping point, *guess*)
    bin: { s: 5.2, t: 2.8, r: 0.17, h: 0.8 }, // OSM bin=yes (position *guess*)
    cycleSign: { at: [60.5, 199.9], yaw: -90, h: 2.4, panel: [0.6, 0.21], color: '#1d5fb4', text: 'Circle K' }, // direction sign beside the cycle route (OSM 61112061, 2.4 m asphalt) 9 m east of the platform end; faces west (yaw: normal = (sin, cos)); *guess*
  },
  riverPark: {
    surfaces: {asphalt:{color:0x5f6164},gravel:{color:0xb5ac90}},
    paths: [
      {"source":"27185148","surface":"asphalt","path":[[-200.07,180.53],[-200.37,184.39],[-201.95,187.43],[-208.76,194.32],[-215.41,200.85],[-227.39,211.23],[-237.82,219.32],[-248.16,229.58],[-255.99,242.35],[-265.44,257.65],[-270.74,265.48],[-272.82,267.58]],"w":2.4},
      {"source":"44447962","surface":"asphalt","path":[[44.88,203.85],[37.91,203.57],[28.48,203.89],[21.24,203.65]],"w":2.4},
      {"source":"44447963","surface":"gravel","path":[[103.93,63.38],[101.0,69.87],[95.97,75.69],[89.35,79.83],[59.89,90.49],[51.41,95.47],[36.22,106.44],[29.23,110.87],[6.57,111.81],[-3.04,112.12],[-19.69,116.64],[-41.72,125.32],[-58.01,134.01],[-76.42,143.99],[-87.02,150.59],[-100.48,158.69],[-112.31,163.72],[-143.19,174.31]],"w":1.8},
      {"source":"44447964","surface":"asphalt","path":[[21.24,203.65],[19.97,211.53],[16.84,219.12],[13.53,223.29],[10.63,226.42],[2.42,232.88]],"w":2.4},
      {"source":"44447973","surface":"gravel","path":[[-143.19,174.31],[-164.82,132.16],[-179.29,118.02],[-197.07,110.89],[-210.7,111.1],[-222.98,112.95],[-235.57,116.6],[-244.18,117.27]],"w":1.8},
      {"source":"51890086","surface":"asphalt","path":[[-131.05,199.16],[-143.19,174.31]],"w":2.4},
      {"source":"123898761","surface":"gravel","path":[[-38.41,84.43],[-43.7,86.47],[-60.68,87.01],[-70.18,84.72]],"w":1.8},
      {"source":"123898762","surface":"gravel","path":[[-41.72,125.32],[-40.18,109.62],[-39.76,91.6],[-38.41,84.43],[-34.53,80.61],[-31.15,75.44],[-28.7,67.46],[-26.65,63.98]],"w":1.8},
      {"source":"123898768","surface":"asphalt","path":[[-200.07,180.53],[-191.63,180.56],[-165.47,178.9],[-143.19,174.31]],"w":2.4},
      {"source":"130537426","surface":"gravel","path":[[-70.18,84.72],[-69.95,91.15],[-72.1,126.02],[-76.42,143.99]],"w":1.8},
      {"source":"185706718","surface":"gravel","path":[[2.42,232.88],[-19.44,235.65],[-37.76,238.95],[-52.03,241.04],[-64.21,239.79],[-81.58,235.31],[-95.84,232.68],[-106.42,229.2],[-111.74,227.09]],"w":1.8},
      {"source":"1228396153","surface":"asphalt","path":[[92.56,207.89],[83.04,205.95],[76.03,204.19],[58.01,201.56],[51.45,202.12],[44.88,203.85]],"w":2.4},
      {"source":"1432565773","surface":"asphalt","path":[[-111.74,227.09],[-116.2,219.98],[-121.76,214.85],[-124.08,212.06]],"w":2.4},
      {"source":"1432565775","surface":"asphalt","path":[[21.24,203.65],[19.52,177.95],[17.8,146.49]],"w":2.4},
      {"source":"44447981","surface":"asphalt","path":[[18.22,80.29],[18.05,100.96]],"w":3},
      // #1235: remaining mapped asphalt/paved (shared walking+cycling) and unpaved paths of the river park, OSM way coordinates; widths are guesses.
      {"source":"61112061","surface":"asphalt","path":[[540.61,192.9],[530.74,191.76],[526.36,191.07],[524.71,190.8],[521.43,189.0],[519.92,188.06],[518.66,184.69],[520.02,165.18],[517.0,125.47],[513.53,111.39],[505.05,82.87],[492.31,51.73],[489.97,47.96],[486.88,43.91],[483.28,41.81],[479.89,40.96],[475.36,40.79],[465.24,44.85],[456.09,48.6],[440.8,55.23],[417.75,66.1],[375.54,84.82],[345.04,98.55],[303.67,116.66],[279.76,127.45],[264.15,132.96],[247.57,138.78],[234.38,141.11],[214.89,146.1],[197.53,150.66],[183.63,155.17],[162.53,160.06],[143.76,166.49],[129.95,170.84],[119.47,173.94],[112.87,177.46],[107.67,182.72],[97.39,197.8],[93.47,205.4],[92.56,207.89]],"w":2.4},
      {"source":"95035891","surface":"asphalt","path":[[-180.81,367.04],[-185.31,356.11],[-187.52,349.84],[-187.8,344.03],[-186.99,336.47],[-185.6,330.73],[-182.84,325.12],[-176.85,319.08],[-137.33,290.79],[-135.2,289.34],[-131.87,286.33],[-125.24,279.92],[-121.48,274.69],[-117.58,268.07],[-114.01,258.81],[-111.83,248.67],[-110.01,236.37],[-111.74,227.09]],"w":2.4},
      {"source":"148276374","surface":"asphalt","path":[[92.56,207.89],[103.53,210.79],[109.35,212.09],[114.28,217.79],[118.7,223.57],[156.3,277.38],[164.46,289.13],[170.93,298.19],[170.45,303.9]],"w":2.4},
      {"source":"237019752","surface":"asphalt","path":[[-6.65,240.02],[-19.42,248.89],[-44.62,267.09],[-55.63,275.27],[-67.28,285.78],[-72.05,291.41]],"w":2.4},
      {"source":"1432565774","surface":"asphalt","path":[[2.42,232.88],[-6.65,240.02]],"w":2.4},
      {"source":"130448444","surface":"asphalt","path":[[-227.39,211.23],[-239.49,198.6],[-247.13,192.86],[-254.92,189.89],[-258.99,189.43]],"w":2.4},
      {"source":"159284497","surface":"asphalt","path":[[-292.69,45.08],[-293.03,50.25],[-292.31,55.08],[-288.79,58.92],[-285.33,60.75],[-279.68,63.3],[-273.38,68.22],[-269.62,73.71],[-264.15,83.08],[-252.89,102.35],[-244.18,117.27],[-237.8,128.53],[-223.45,149.8],[-200.07,180.53]],"w":2.4},
      {"source":"44447975","surface":"gravel","path":[[-67.28,285.78],[-74.14,288.35],[-77.74,286.17],[-82.45,282.01],[-87.81,273.05],[-99.24,249.59],[-111.74,227.09]],"w":1.8},
      {"source":"1320452139","surface":"gravel","path":[[109.35,212.09],[114.79,213.27],[117.37,212.86],[121.04,211.21],[122.86,208.89]],"w":1.8},
      {"source":"909507376","surface":"gravel","path":[[-273.09,97.16],[-264.15,83.08]],"w":1.8},
      {"source":"909507377","surface":"gravel","path":[[-320.93,123.26],[-313.22,116.44],[-301.24,108.32],[-283.51,101.35],[-273.09,97.16],[-257.74,100.06],[-252.89,102.35]],"w":1.8},
      {"source":"185706716","surface":"gravel","path":[[-59.87,262.16],[-57.18,263.63],[-55.03,265.37]],"w":1.8},
      {"source":"185706717","surface":"gravel","path":[[-44.62,267.09],[-48.82,267.2],[-50.64,267.34],[-53.0,267.91],[-53.64,268.53],[-54.19,269.83],[-54.6,271.62],[-55.63,275.27]],"w":1.8},
    ],
    patches: [
      {"name":"western-bank","polygon":[[-250,238],[-232,216],[-180,194],[-140,196],[-139,214],[-190,222],[-232,248]],"n":18},
      {"name":"north-bank","polygon":[[-125,185],[-104,164],[-78,143],[-52,127],[-15,121],[-1,130],[-26,149],[-69,170],[-107,199]],"n":20},
      {"name":"south-bank","polygon":[[-106,221],[-101,191],[-69,180],[-27,155],[5,138],[4,165],[-52,196],[-85,230]],"n":17},
      {"name":"bridge-east-bank","polygon":[[35,106],[74,105],[112,107],[120,121],[83,140],[39,144]],"n":14},
      {"name":"eastern-bend","polygon":[[121,61],[166,58],[202,61],[211,83],[183,95],[139,96],[139,114],[126,116],[115,93]],"n":15},
      {"name":"park-edge","polygon":[[-129,80],[-110,82],[-83,106],[-92,135],[-106,137],[-130,112]],"n":6},
    ],
    glades: [
      {"name":"central-lawn","polygon":[[-93,89],[-76,83],[-46,86],[-46,111],[-65,121],[-86,124]]},
    ],
    treeScale: [1.35,2.35],
    treeSpacing: 6,
    treeDensity: 1.45, // guess (original #1233): multiplies each patch's `n`
    shrubScale: [0.8,1.9],
    shrubCount: 190,
    shoreCount: 380,
    shoreHeight: [0.25,0.7],
    shoreOffset: [0.5,2.2],
    pathClearance: 0.6,
    bridgeClearance: 1.5,
    branchCount: 3,
    woodBridge: {"source":"51890085","ends":[[-131.05,199.16],[-124.08,212.06]],"width":2.2,"deckY":-3,"slab":0.22,"rail":1.1,"postStep":2,"railSize":0.08,"postSize":0.1,"abutment":0.35},
    shoreRadius: [0.16,0.46],
    shoreLeaves: 5,
    shrubAspect: [1,0.65,0.8],
    twigWidth: 0.2,
    branchReach: 2,
    branchRise: 1,
    branchWidth: 0.55,
  },
  // #534 west: exact OSM footprint points registered by SITE.geo; levelsSource distinguishes tagged floors.
  // Heights, colours, windows and roof details are visual assumptions. Access paving/tree locations are approximate aerial traces.
  west: {
    buildings: [
      {"source":"88457595","polygon":[[-158.68,-1.64],[-133.86,21.34],[-132.7,20.1],[-125.0,27.23],[-126.15,28.48],[-101.59,51.23],[-93.17,42.14],[-114.82,22.09],[-112.14,19.2],[-125.86,6.5],[-128.67,9.53],[-150.39,-10.6],[-158.68,-1.64]],"name":"\u00d6stra l\u00e4ngan vid Karpv\u00e4gen","levels":3,"levelsSource":"visual assumption"},
      {"source":"342815181","polygon":[[-130.47,90.14],[-121.66,80.77],[-113.22,88.71],[-102.44,98.85],[-111.26,108.21],[-130.47,90.14]],"name":"Karpv\u00e4gen 10","levels":4,"levelsSource":"OSM","karp":{"hus":1,"stairs":[0.5]}},
      {"source":"342815182","polygon":[[-153.7,124.37],[-192.7,87.66],[-183.95,78.35],[-173.43,88.24],[-155.62,105.01],[-144.94,115.06],[-153.7,124.37]],"name":"Karpv\u00e4gen 6\u20138","levels":4,"levelsSource":"OSM","karp":{"hus":2,"stairs":[0.3,0.7]}},
      {"source":"342815183","polygon":[[-231.56,32.51],[-224.31,39.32],[-222.72,40.83],[-207.76,54.91],[-197.32,64.74],[-206.06,74.02],[-231.46,50.11],[-236.1,55.04],[-244.93,46.73],[-231.56,32.51]],"name":"Karpv\u00e4gen 2\u20134","levels":4,"levelsSource":"Brf facts","karp":{"hus":3,"stairs":[0.3,0.7]}},
      {"source":"476125237","polygon":[[-149.41,68.89],[-152.38,66.19],[-147.9,61.25],[-144.93,63.95],[-149.41,68.89]],"name":"Komplementbyggnad 476125237","levels":1,"levelsSource":"visual assumption"},
      {"source":"476125238","polygon":[[-133.68,88.04],[-138.18,83.93],[-128.48,73.32],[-123.98,77.43],[-133.68,88.04]],"name":"Komplementbyggnad 476125238","levels":1,"levelsSource":"visual assumption"},
      {"source":"476125239","polygon":[[-143.85,79.7],[-148.03,75.77],[-136.81,63.83],[-132.62,67.77],[-143.85,79.7]],"name":"Komplementbyggnad 476125239","levels":1,"levelsSource":"visual assumption"},
    ],
    paths: [
      {"source":"44447979","path":[[-106.67,73.46],[-105.74,70.72],[-114.61,59.62],[-123.24,44.7],[-126.11,38.14],[-129.39,33.03],[-136.69,26.15],[-169.74,-4.22]],"w":1.8},
      {"source":"342815184","path":[[-157.59,80.9],[-161.1,77.79]],"w":1.8},
      {"source":"342815185","path":[[-155.54,96.56],[-147.16,87.38]],"w":1.8},
      {"source":"342815186","path":[[-151.23,100.52],[-155.62,105.01]],"w":1.8},
      {"source":"342815187","path":[[-169.24,83.98],[-173.43,88.24]],"w":1.8},
      {"source":"342815188","path":[[-109.52,80.55],[-123.94,75.7],[-131.02,69.62]],"w":1.8},
      {"source":"342815190","path":[[-164.4,88.42],[-157.59,80.9],[-140.42,61.94]],"w":1.8},
      {"source":"342815193","path":[[-204.7,51.42],[-169.24,83.98],[-164.4,88.42],[-155.54,96.56],[-151.23,100.52],[-139.68,111.12],[-144.4,114.7]],"w":1.8}, // #1346: the last point is a *guess*: the walk along the façade ended in open grass at the gable, so it now turns in to the SE gable corner of Karpvägen 6–8
      {"source":"342815195","path":[[-196.65,42.17],[-192.69,43.58],[-140.42,61.94],[-127.94,66.21],[-106.67,73.46],[-109.52,80.55],[-113.22,88.71]],"w":1.8},
    ],
    access: [
      {"source":"333642399","path":[[-105.74,70.72],[-94.36,79.13],[-87.63,84.85],[-82.37,86.66],[-77.43,86.81],[-70.18,84.72],[-67.08,80.8],[-64.88,72.28],[-64.54,67.71],[-65.92,63.05],[-79.26,48.81]],"w":3.5},
      {"source":"342815192","path":[[-147.16,87.38],[-131.02,69.62],[-127.94,66.21],[-125.37,63.39]],"w":3.5},
      {"source":"342815194","path":[[-191.7,40.27],[-192.69,43.58],[-193.8,47.27],[-193.23,49.03],[-191.44,50.93],[-161.1,77.79]],"w":3.5},
      {"source":"aerial approximate parking trace 1","pixels":[[539,226],[554,228],[555,272],[536,274]],"polygon":[[-218.85,44.5],[-212.51,36.83],[-187.61,51.61],[-193.12,62.9]]},
      {"source":"aerial approximate parking trace 2","pixels":[[532,294],[552,291],[541,350],[520,356]],"polygon":[[-183.36,72.11],[-178.06,59.9],[-148.98,86.61],[-152.96,100.41]]},
      {"source":"aerial approximate parking trace 3","pixels":[[566,388],[583,386],[596,440],[579,443]],"polygon":[[-119.07,85.9],[-114.26,75.72],[-79.61,87.3],[-83.86,97.82]]},
    ],
    trees: [[-100,13,1.5],[-101,27,1.6],[-91,40,1.4],[-107,57,1.65],[-143,43,1.8],[-162,25,1.8],[-157,56,1.6],[-191,67,1.7],[-202,94,1.9],[-221,95,1.8],[-219,123,1.9],[-193,140,1.6]],
    storey: 3,
    roofRise: 1.5,
    annexRise: 0.5,
    window: [1.25,1.55],
    sill: 0.85,
    bay: 3.5,
    frame: 0.08,
    facade: 13747890,
    roof: 5660765,
    plinth: 9999754,
    glass: 3230037,
    pathLift: 0.025,
    // #575 Karpvägen 2–10 (Brf S:t Lars Park; docs/validation/issue-575/README.md). Sourced: four storeys, red brick, flat felt roofs
    // (Brf "Mäklarinfo": tre fyravåningshus, tegel/puts, papptak); the Brf colour photo (date unknown): three brick storeys with a dark
    // metal coping, a recessed light-rendered fourth storey with dark sheet-metal end volumes, white-framed windows, vertical strips of
    // windows with pale infill panels; the planned project render (not the as-built) and the situationsplan: all balconies stacked on the
    // park (south-west) side, Hus 1 = Karpvägen 10, Hus 2 = 6–8, Hus 3 = 2–4, parking/entrances on the Karpvägen (north-east) side.
    // `stairs` = stair-strip positions along the entrance side (fraction of that façade's length). EVERY dimension and count below is a
    // visual *guess* read from those images, not a measurement.
    karp: {
      park: [-0.69, 0.72],      // unit direction of the park side (SW, situationsplan); façades facing it within ~45° get the balconies
      brickLevels: 3,           // brick storeys under the recessed top storey (photo)
      plinth: 0.35,             // light concrete plinth above the highest ground (*guess*)
      parapet: 0.45,            // brick parapet above the top-storey floor, capped with dark metal (*guess*)
      coping: 0.22,             // dark coping band height (*guess*)
      setback: 1.6,             // recess of the light top storey behind the brick face (*guess*)
      topHeight: 2.9,           // top storey from the parapet to the roof edge (*guess*)
      fascia: 0.32,             // dark roof-edge band of the top storey (*guess*)
      endBox: { length: 4.6, width: 6, rise: 0.25, window: [2.4, 1.7] }, // dark metal end volumes at both ends of the long axis, flush with
                                // the gable at its park-side corner (photo/render; size *guess*, corner read from both images)
      bay: 3.6,                 // window rhythm on the brick façades (*guess*)
      gableStrip: 15,           // gables shorter than this get one central strip of windows and pale panels (photo; *guess*)
      topBay: 4.4,              // window rhythm in the top storey (*guess*)
      window: [1.1, 1.5], sill: 0.85, frame: 0.07, mullion: 0.06, // white-framed windows (*guess*)
      strip: { width: 1.35, window: 1.45, door: [1.5, 2.3] }, // stair / gable strips: glazing per storey, pale panels between (*guess*)
      balcony: { spacing: 10.5, width: 4.4, depth: 1.6, slab: 0.2, rail: 1.05, glass: [2.6, 2.2], groundLift: 0.45 }, // stacked park-side
                                // balconies (render; count per façade = length / spacing, all sizes *guess*)
      roofBox: [2.4, 1.3, 1.2], // white roof housings (render; size *guess*)
      brick: { mortar: '#c4beb5', base: [172, 96, 82], variation: 24 }, // the photo's salmon-red brick, light mortar (colours read from the photo)
      colors: { render: 0xeeeeea, metal: 0x3b3f43, coping: 0x2f3236, frame: 0xf2f1ec, panel: 0xdfe9e3, plinth: 0xb4b1aa,
        slab: 0xf3f2ee, rail: 0xd9e4e5, roofBox: 0xe6e6e2, roof: 0x34373a, canopy: 0x3b3f43 },
    },
  },
  // #535: east-campus source polygons replace old illustrative school/longhouse blocks; HepCat is preserved.
  // Named campus polygons identify buildings; names are orientation only. All floor counts/heights/roof details remain assumptions.
  // #536 existing south-bank OSM footprints/landuse. All untagged heights, colors and roof details are visual assumptions.
  south: {
    buildings: [
      {"source":"88457551","polygon":[[246.3,350.37],[250.7,348.97],[251.42,351.23],[255.49,349.95],[258.92,360.68],[244.6,365.21],[241.15,354.37],[246.99,352.53],[246.3,350.37]],"levels":2,"levelsSource":"visual assumption","name":"Sankt Lars väg 64","roof":"gable","roofSource":"visual assumption","rise":1.6,"facade":13024420},
      {"source":"88457554","polygon":[[42.86,466.69],[57.77,455.6],[62.18,461.53],[47.28,472.62],[42.86,466.69]],"levels":2,"levelsSource":"visual assumption","name":"Sankt Lars 88457554","roof":"gable","roofSource":"visual assumption","rise":1.6,"facade":13024420},
      {"source":"88457556","polygon":[[58.51,430.48],[70.09,422.28],[96.08,459.0],[84.5,467.19],[58.51,430.48]],"levels":2,"levelsSource":"visual assumption","name":"Sankt Lars 88457556","roof":"gable","roofSource":"visual assumption","rise":1.6,"facade":13024420},
      {"source":"88457559","polygon":[[234.92,258.9],[245.88,255.63],[251.7,275.09],[240.73,278.36],[234.92,258.9]],"levels":2,"levelsSource":"visual assumption","name":"Sankt Lars väg 57","roof":"gable","roofSource":"visual assumption","rise":1.6,"facade":13024420},
      {"source":"88457560","polygon":[[118.04,465.66],[137.2,452.9],[142.35,460.63],[123.18,473.4],[118.04,465.66]],"levels":2,"levelsSource":"visual assumption","name":"Sankt Lars väg 70","roof":"gable","roofSource":"visual assumption","rise":1.6,"facade":13024420},
      {"source":"88457562","polygon":[[185.44,274.55],[195.36,271.59],[197.94,280.25],[200.81,289.86],[190.89,292.82],[185.44,274.55]],"levels":2,"levelsSource":"visual assumption","name":"Sankt Lars väg 56","roof":"gable","roofSource":"visual assumption","rise":1.6,"facade":13024420},
      {"source":"88457566","polygon":[[111.46,406.49],[117.55,402.01],[133.74,424.05],[127.64,428.53],[111.46,406.49]],"levels":2,"levelsSource":"visual assumption","name":"Sankt Lars 88457566","roof":"gable","roofSource":"visual assumption","rise":1.6,"facade":13024420},
      {"source":"88457571","polygon":[[262.53,288.02],[272.98,285.76],[276.81,303.31],[266.36,305.56],[262.53,288.02]],"levels":2,"levelsSource":"visual assumption","name":"Sankt Lars väg 61","roof":"gable","roofSource":"visual assumption","rise":1.6,"facade":13024420},
      {"source":"88457572","polygon":[[226.18,298.1],[236.68,295.43],[241.32,313.64],[230.81,316.31],[226.18,298.1]],"levels":2,"levelsSource":"visual assumption","name":"Sankt Lars väg 59","roof":"gable","roofSource":"visual assumption","rise":1.6,"facade":13024420},
      {"source":"88457576","polygon":[[-98.02,346.44],[-97.38,345.85],[-96.37,345.29],[-94.69,345.44],[-93.82,345.69],[-93.23,346.06],[-92.74,346.62],[-92.59,347.58],[-92.6,348.32],[-93.07,349.11],[-93.83,349.73],[-95.01,350.59],[-91.28,355.72],[-67.29,338.35],[-71.71,332.25],[-64.03,326.7],[-58.6,334.18],[-56.78,332.86],[-52.39,338.9],[-54.13,340.17],[-50.55,345.11],[-58.22,350.66],[-60.62,347.34],[-84.81,364.84],[-83.13,367.16],[-90.81,372.72],[-109.63,346.8],[-101.84,341.17],[-98.02,346.44]],"levels":4,"levelsSource":"OSM","name":"Sankt Lars väg 42","roof":"hipped","roofSource":"OSM","rise":3.5,"facade":11831152},
      {"source":"88457578","polygon":[[278.2,343.1],[292.41,339.37],[295.54,351.2],[281.33,354.94],[278.2,343.1]],"levels":2,"levelsSource":"visual assumption","name":"Sankt Lars väg 63","roof":"gable","roofSource":"visual assumption","rise":1.6,"facade":13024420},
      {"source":"88457584","polygon":[[12.07,369.86],[21.23,362.94],[32.84,378.31],[23.68,385.23],[12.07,369.86]],"levels":2,"levelsSource":"visual assumption","name":"Sankt Lars väg 48","roof":"gable","roofSource":"visual assumption","rise":1.6,"facade":13024420},
      {"source":"88457587","polygon":[[205.63,337.29],[222.82,333.55],[225.52,345.96],[208.34,349.7],[205.63,337.29]],"levels":2,"levelsSource":"visual assumption","name":"Sankt Lars väg 60","roof":"gable","roofSource":"visual assumption","rise":1.6,"facade":13024420},
      {"source":"88457589","polygon":[[28.79,402.26],[46.42,389.56],[54.38,400.62],[36.76,413.32],[28.79,402.26]],"levels":2,"levelsSource":"visual assumption","name":"Sankt Lars väg 49","roof":"gable","roofSource":"visual assumption","rise":1.6,"facade":13024420},
      {"source":"88457590","polygon":[[-87.34,419.56],[-84.2,417.35],[-69.96,437.49],[-92.37,453.28],[-106.59,433.16],[-103.71,431.13],[-114.73,415.54],[-117.2,417.27],[-132.8,395.19],[-111.3,380.05],[-95.69,402.14],[-98.33,404.01],[-87.34,419.56]],"levels":4,"levelsSource":"visual assumption","name":"Sankt Lars väg 43","roof":"hipped","roofSource":"visual assumption","rise":3.5,"facade":11831152},
      {"source":"88457592","polygon":[[35.41,256.31],[31.65,251.19],[39.08,245.74],[51.17,262.19],[53.52,260.47],[57.38,265.72],[55.01,267.45],[58.06,271.58],[50.63,277.03],[48.09,273.57],[23.78,291.39],[25.51,293.74],[17.69,299.47],[14.2,294.72],[11.95,296.37],[9.08,292.46],[11.35,290.79],[5.23,282.47],[13.06,276.73],[17.96,283.4],[42.25,265.61],[38.54,260.56],[37.29,261.17],[36.39,261.61],[35.22,261.82],[34.05,261.54],[33.32,260.84],[32.96,259.95],[33.07,258.99],[33.68,257.9],[34.57,257.02],[35.41,256.31]],"levels":4,"levelsSource":"OSM","name":"Sankt Lars väg 45","roof":"hipped","roofSource":"OSM","rise":3.5,"facade":11831152},
      {"source":"88457593","polygon":[[208.53,360.78],[212.96,359.49],[213.59,361.67],[217.96,360.4],[221.12,371.21],[206.18,375.54],[203.07,364.86],[209.21,363.08],[208.53,360.78]],"levels":2,"levelsSource":"visual assumption","name":"Sankt Lars väg 66","roof":"gable","roofSource":"visual assumption","rise":1.6,"facade":13024420},
      {"source":"88457594","polygon":[[87.21,358.27],[75.96,366.38],[76.77,367.5],[68.67,373.33],[64.89,368.09],[60.12,371.52],[56.13,366.01],[61.16,362.39],[48.07,344.29],[56.29,338.36],[59.57,342.88],[83.23,325.83],[80.71,322.34],[89.4,316.09],[101.55,332.9],[100.27,333.82],[107.98,344.48],[99.0,350.95],[98.54,350.32],[96.0,352.16],[99.32,356.76],[90.64,363.01],[87.21,358.27]],"levels":4,"levelsSource":"visual assumption","name":"Sankt Lars väg 47","roof":"hipped","roofSource":"visual assumption","rise":3.5,"facade":11831152},
      {"source":"88457596","polygon":[[187.66,310.34],[197.42,307.41],[199.86,315.52],[202.82,325.36],[193.06,328.29],[187.66,310.34]],"levels":2,"levelsSource":"visual assumption","name":"Sankt Lars väg 58","roof":"gable","roofSource":"visual assumption","rise":1.6,"facade":13024420},
      {"source":"88457598","polygon":[[76.91,253.56],[86.43,247.22],[87.29,248.5],[96.55,262.35],[105.03,256.69],[120.21,279.38],[111.81,284.99],[119.48,296.44],[109.8,302.89],[99.81,287.95],[103.0,285.82],[90.76,267.53],[87.64,269.6],[76.91,253.56]],"levels":4,"levelsSource":"visual assumption","name":"Sankt Lars väg 46","roof":"hipped","roofSource":"visual assumption","rise":3.5,"facade":11831152},
      {"source":"88457599","polygon":[[-227.64,427.37],[-198.18,406.55],[-190.36,417.62],[-195.13,420.99],[-173.39,451.74],[-193.91,466.24],[-215.65,435.48],[-219.81,438.44],[-227.64,427.37]],"levels":4,"levelsSource":"visual assumption","name":"Sankt Lars väg 54","roof":"hipped","roofSource":"visual assumption","rise":3.5,"facade":11831152},
      {"source":"88457604","polygon":[[247.54,325.75],[263.03,322.38],[265.6,334.15],[250.11,337.53],[247.54,325.75]],"levels":2,"levelsSource":"visual assumption","name":"Sankt Lars väg 62","roof":"gable","roofSource":"visual assumption","rise":1.6,"facade":13024420},
      {"source":"88457611","polygon":[[228.64,333.03],[240.93,329.75],[241.96,333.6],[229.67,336.88],[228.64,333.03]],"levels":2,"levelsSource":"visual assumption","name":"Sankt Lars 88457611","roof":"gable","roofSource":"visual assumption","rise":1.6,"facade":13024420},
      {"source":"145221569","polygon":[[-58.26,284.51],[-35.42,267.93],[-21.1,287.58],[-27.44,292.18],[-23.83,297.14],[-34.34,304.75],[-37.93,299.81],[-43.95,304.18],[-58.26,284.51]],"levels":3,"levelsSource":"photo (*guess*: 3-storey pavilions, 2-storey middle/risalit)","name":"Sankt Lars väg 41","roof":"flat","roofSource":"photo (*guess*)","rise":0.2,"facade":11831152,"template":"stlars41"},
      {"source":"145221620","polygon":[[100.85,468.36],[108.9,463.0],[115.05,472.23],[107.01,477.6],[100.85,468.36]],"levels":2,"levelsSource":"visual assumption","name":"Sankt Lars 145221620","roof":"gable","roofSource":"visual assumption","rise":1.6,"facade":13024420},
      {"source":"145221625","polygon":[[256.34,373.65],[262.74,371.95],[265.88,383.8],[259.48,385.5],[256.34,373.65]],"levels":2,"levelsSource":"visual assumption","name":"Sankt Lars 145221625","roof":"gable","roofSource":"visual assumption","rise":1.6,"facade":13024420},
      {"source":"145221627","polygon":[[275.98,319.81],[281.59,318.31],[284.75,330.23],[279.13,331.71],[275.98,319.81]],"levels":2,"levelsSource":"visual assumption","name":"Sankt Lars 145221627","roof":"gable","roofSource":"visual assumption","rise":1.6,"facade":13024420},
      {"source":"333642383","polygon":[[212.15,225.99],[219.7,223.98],[222.56,234.74],[215.0,236.75],[212.15,225.99]],"levels":2,"levelsSource":"visual assumption","name":"Sävsländegatan 14","roof":"gable","roofSource":"visual assumption","rise":1.6,"facade":13024420},
      {"source":"333642384","polygon":[[217.02,182.16],[211.7,175.63],[220.03,168.83],[225.36,175.36],[217.02,182.16]],"levels":2,"levelsSource":"visual assumption","name":"Nattsländegatan 16","roof":"gable","roofSource":"visual assumption","rise":1.6,"facade":13024420},
      {"source":"333642385","polygon":[[149.37,243.37],[156.92,241.36],[159.78,252.12],[152.22,254.14],[149.37,243.37]],"levels":2,"levelsSource":"visual assumption","name":"Sävsländegatan 2","roof":"gable","roofSource":"visual assumption","rise":1.6,"facade":13024420},
      {"source":"333642386","polygon":[[180.53,213.2],[172.7,215.46],[169.88,205.73],[177.71,203.46],[180.53,213.2]],"levels":2,"levelsSource":"visual assumption","name":"Hattsnäckegränden 8","roof":"gable","roofSource":"visual assumption","rise":1.6,"facade":13024420},
      {"source":"333642387","polygon":[[125.03,194.33],[130.86,189.95],[137.1,198.3],[131.28,202.66],[125.03,194.33]],"levels":2,"levelsSource":"visual assumption","name":"Nattsländegatan 2","roof":"gable","roofSource":"visual assumption","rise":1.6,"facade":13024420},
      {"source":"333642389","polygon":[[169.12,238.41],[176.68,236.4],[179.55,247.17],[171.99,249.18],[169.12,238.41]],"levels":2,"levelsSource":"visual assumption","name":"Sävsländegatan 6","roof":"gable","roofSource":"visual assumption","rise":1.6,"facade":13024420},
      {"source":"333642390","polygon":[[202.73,207.42],[194.68,209.86],[191.75,200.24],[199.81,197.8],[202.73,207.42]],"levels":2,"levelsSource":"visual assumption","name":"Hattsnäckegränden 12","roof":"gable","roofSource":"visual assumption","rise":1.6,"facade":13024420},
      {"source":"333642391","polygon":[[148.61,182.57],[155.82,180.45],[158.97,191.19],[151.78,193.32],[148.61,182.57]],"levels":2,"levelsSource":"visual assumption","name":"Nattsländegatan 6","roof":"gable","roofSource":"visual assumption","rise":1.6,"facade":13024420},
      {"source":"333642392","polygon":[[235.4,218.83],[242.96,216.82],[245.81,227.59],[238.26,229.6],[235.4,218.83]],"levels":2,"levelsSource":"visual assumption","name":"Sävsländegatan 18","roof":"gable","roofSource":"visual assumption","rise":1.6,"facade":13024420},
      {"source":"333642393","polygon":[[189.49,179.7],[182.97,181.6],[180.33,172.58],[186.86,170.68],[189.49,179.7]],"levels":2,"levelsSource":"visual assumption","name":"Nattsländegatan 12","roof":"gable","roofSource":"visual assumption","rise":1.6,"facade":13024420},
      {"source":"333642395","polygon":[[233.93,202.98],[229.02,197.14],[237.09,190.37],[241.99,196.2],[233.93,202.98]],"levels":2,"levelsSource":"visual assumption","name":"Nattsländegatan 20","roof":"gable","roofSource":"visual assumption","rise":1.6,"facade":13024420},
      {"source":"333642396","polygon":[[190.06,232.27],[197.62,230.26],[200.48,241.02],[192.92,243.03],[190.06,232.27]],"levels":2,"levelsSource":"visual assumption","name":"Sävsländegatan 10","roof":"gable","roofSource":"visual assumption","rise":1.6,"facade":13024420},
      {"source":"333642397","polygon":[[157.39,217.75],[151.0,222.51],[144.53,213.84],[150.93,209.08],[157.39,217.75]],"levels":2,"levelsSource":"visual assumption","name":"Hattsnäckegränden 4","roof":"gable","roofSource":"visual assumption","rise":1.6,"facade":13024420},
      {"source":"367079610","polygon":[[182.97,181.6],[176.43,183.51],[173.8,174.48],[180.33,172.58],[182.97,181.6]],"levels":2,"levelsSource":"visual assumption","name":"Nattsländegatan 10","roof":"gable","roofSource":"visual assumption","rise":1.6,"facade":13024420},
      {"source":"367079611","polygon":[[211.7,175.63],[206.38,169.1],[214.71,162.3],[220.03,168.83],[211.7,175.63]],"levels":2,"levelsSource":"visual assumption","name":"Nattsländegatan 14","roof":"gable","roofSource":"visual assumption","rise":1.6,"facade":13024420},
      {"source":"367079612","polygon":[[229.02,197.14],[224.12,191.3],[232.2,184.53],[237.09,190.37],[229.02,197.14]],"levels":2,"levelsSource":"visual assumption","name":"Nattsländegatan 18","roof":"gable","roofSource":"visual assumption","rise":1.6,"facade":13024420},
      {"source":"367079613","polygon":[[130.86,189.95],[136.68,185.59],[142.93,193.93],[137.1,198.3],[130.86,189.95]],"levels":2,"levelsSource":"visual assumption","name":"Nattsländegatan 4","roof":"gable","roofSource":"visual assumption","rise":1.6,"facade":13024420},
      {"source":"367079616","polygon":[[155.82,180.45],[163.01,178.32],[166.18,189.07],[158.97,191.19],[155.82,180.45]],"levels":2,"levelsSource":"visual assumption","name":"Nattsländegatan 8","roof":"gable","roofSource":"visual assumption","rise":1.6,"facade":13024420},
      {"source":"403628164","polygon":[[194.68,209.86],[186.64,212.31],[183.71,202.7],[191.75,200.24],[194.68,209.86]],"levels":2,"levelsSource":"visual assumption","name":"Hattsnäckegränden 10","roof":"gable","roofSource":"visual assumption","rise":1.6,"facade":13024420},
      {"source":"403628166","polygon":[[197.62,230.26],[205.18,228.25],[208.03,239.02],[200.48,241.02],[197.62,230.26]],"levels":2,"levelsSource":"visual assumption","name":"Sävsländegatan 12","roof":"gable","roofSource":"visual assumption","rise":1.6,"facade":13024420},
      {"source":"403628168","polygon":[[219.7,223.98],[227.26,221.97],[230.13,232.74],[222.56,234.74],[219.7,223.98]],"levels":2,"levelsSource":"visual assumption","name":"Sävsländegatan 16","roof":"gable","roofSource":"visual assumption","rise":1.6,"facade":13024420},
      {"source":"403628170","polygon":[[151.0,222.51],[144.6,227.28],[138.14,218.61],[144.53,213.84],[151.0,222.51]],"levels":2,"levelsSource":"visual assumption","name":"Hattsnäckegränden 2","roof":"gable","roofSource":"visual assumption","rise":1.6,"facade":13024420},
      {"source":"403628172","polygon":[[242.96,216.82],[250.52,214.82],[253.38,225.59],[245.81,227.59],[242.96,216.82]],"levels":2,"levelsSource":"visual assumption","name":"Sävsländegatan 20","roof":"gable","roofSource":"visual assumption","rise":1.6,"facade":13024420},
      {"source":"403628174","polygon":[[156.92,241.36],[164.48,239.36],[167.34,250.12],[159.78,252.12],[156.92,241.36]],"levels":2,"levelsSource":"visual assumption","name":"Sävsländegatan 4","roof":"gable","roofSource":"visual assumption","rise":1.6,"facade":13024420},
      {"source":"403628176","polygon":[[172.7,215.46],[164.88,217.73],[162.06,208.0],[169.88,205.73],[172.7,215.46]],"levels":2,"levelsSource":"visual assumption","name":"Hattsnäckegränden 6","roof":"gable","roofSource":"visual assumption","rise":1.6,"facade":13024420},
      {"source":"403628178","polygon":[[176.68,236.4],[184.25,234.4],[187.1,245.16],[179.55,247.17],[176.68,236.4]],"levels":2,"levelsSource":"visual assumption","name":"Sävsländegatan 8","roof":"gable","roofSource":"visual assumption","rise":1.6,"facade":13024420},
      {"source":"relation/1309428","polygon":[[-6.89,413.53],[-4.15,417.38],[-2.9,416.49],[3.63,425.64],[-30.89,450.23],[-37.82,440.5],[-36.41,439.49],[-38.52,436.52],[-44.47,440.77],[-53.21,428.5],[-55.18,429.91],[-59.0,424.56],[-57.17,423.24],[-60.14,419.09],[-51.86,413.17],[-49.79,416.07],[-25.18,398.49],[-27.01,395.92],[-19.01,390.19],[-16.08,394.29],[-14.04,392.83],[-10.38,397.96],[-12.51,399.48],[-3.96,411.45],[-6.89,413.53]],"holes":[[[-19.36,406.49],[-43.73,423.89],[-33.66,437.99],[-6.7,418.74],[-9.05,415.45],[-11.65,417.29],[-19.36,406.49]]],"levels":4,"levelsSource":"visual assumption","name":"Sankt Lars 44","roof":"hipped","roofSource":"visual assumption","rise":3.5,"facade":11831152},
    ],
    forests: [
      {"source":"165719103","polygon":[[-24.51,244.86],[-26.44,242.01],[-47.35,240.49],[-67.09,249.61],[-82.67,251.43],[-89.86,244.46],[-119.94,238.45],[-138.37,248.8],[-144.05,273.73],[-139.86,297.39],[-126.95,303.81],[-117.3,308.18],[-138.6,320.46],[-146.24,328.06],[-169.07,323.69],[-180.14,327.51],[-186.33,341.38],[-201.83,358.93],[-205.24,368.35],[-197.26,372.1],[-24.51,244.86]],"n":40},
      {"source":"165719106","polygon":[[-132.43,494.36],[-137.45,503.77],[-162.94,519.35],[-182.77,522.14],[-205.84,524.05],[-215.26,527.49],[-141.35,635.99],[39.0,511.3],[29.79,507.91],[-11.26,533.9],[-31.53,547.2],[-126.76,605.27],[-140.21,605.33],[-156.32,594.68],[-169.83,576.61],[-173.9,557.44],[-165.9,544.64],[-157.8,537.74],[-125.78,520.12],[-105.66,503.8],[-85.28,489.4],[-61.28,481.35],[-47.56,490.21],[-45.0,486.92],[-38.7,478.83],[-39.44,465.53],[-51.21,454.96],[-66.01,449.21],[-96.95,468.4],[-111.85,475.42],[-132.43,494.36]],"n":30},
    ],
    fields: [
      {"source":"91913055","polygon":[[280.76,518.29],[295.47,522.72],[403.87,429.29],[493.05,344.52],[498.52,336.7],[505.43,325.23],[508.3,314.41],[509.24,301.09],[508.12,271.34],[517.04,199.9],[512.82,145.66],[506.63,108.61],[491.9,69.86],[484.62,47.98],[475.48,45.31],[446.45,57.01],[322.89,110.33],[261.11,136.12],[240.16,141.69],[217.63,149.14],[254.5,200.75],[268.88,234.4],[327.54,372.46],[209.73,404.43],[280.76,518.29]],"color":9016921},
      {"source":"165719101","polygon":[[-157.8,537.74],[-125.78,520.12],[-105.66,503.8],[-85.28,489.4],[-61.28,481.35],[-47.56,490.21],[-24.69,520.84],[-19.4,532.9],[-31.53,547.2],[-126.76,605.27],[-140.21,605.33],[-156.32,594.68],[-169.83,576.61],[-173.9,557.44],[-165.9,544.64],[-157.8,537.74]],"color":9083762},
      {"source":"237019759","polygon":[[-125.6,213.43],[-121.69,216.75],[-116.22,223.52],[-112.59,229.85],[-111.67,235.71],[-112.42,241.42],[-113.94,248.93],[-115.77,258.36],[-119.21,266.97],[-123.51,274.69],[-132.67,284.83],[-137.41,288.75],[-145.78,283.52],[-156.55,275.38],[-165.13,271.61],[-170.08,272.74],[-174.73,275.66],[-182.39,281.45],[-197.97,293.4],[-207.88,302.2],[-212.67,308.73],[-219.42,313.33],[-226.19,315.97],[-238.71,320.5],[-247.63,323.2],[-265.62,330.83],[-274.25,316.98],[-275.61,310.13],[-258.76,282.05],[-230.7,250.38],[-189.9,219.8],[-173.79,213.37],[-158.58,211.16],[-140.66,212.13],[-125.6,213.43]],"color":8362575},
    ],
    paths: [
      {"source":"30633546","surface":"asphalt","path":[[27.71,213.61],[24.37,219.25],[16.9,227.36],[8.31,233.97],[3.68,236.83],[-2.35,240.57],[-21.89,254.04],[-39.24,267.33],[-72.05,291.41],[-134.7,334.97],[-180.81,367.04],[-190.9,374.57],[-194.2,377.03]],"w":6},
      {"source":"36918924","surface":"asphalt","path":[[45.85,215.95],[48.33,225.53],[61.04,242.66],[76.61,264.96],[84.9,276.19],[100.69,298.56],[105.48,305.28],[109.17,309.03],[113.03,312.18],[118.18,314.55],[128.99,318.64],[147.12,323.27],[157.53,327.25],[162.42,329.97],[167.1,334.61]],"w":6},
      {"source":"45211117","surface":"asphalt","path":[[205.42,403.66],[237.21,454.42],[242.66,463.23],[255.26,485.83],[270.83,513.68],[289.03,545.56]],"w":6},
      {"source":"189432530","surface":"asphalt","path":[[26.53,188.72],[27.8,193.47],[28.48,203.89],[28.32,208.78],[27.71,213.61],[36.38,215.15],[45.85,215.95]],"w":6},
      {"source":"189432586","surface":"asphalt","path":[[45.85,215.95],[51.03,213.49],[56.01,210.85],[60.06,208.7],[62.73,207.66],[66.07,207.19],[69.35,207.41],[72.56,208.06],[79.44,209.89],[114.28,217.79]],"w":4.5},
      {"source":"333642408","surface":"asphalt","path":[[251.76,202.57],[252.43,206.62],[247.63,209.18],[220.8,216.0],[145.9,237.02],[138.98,234.6],[127.27,218.98],[120.07,218.27]],"w":4.5},
      {"source":"333642411","surface":"asphalt","path":[[220.8,216.0],[218.37,207.59],[203.54,189.33],[146.58,205.15],[127.27,218.98]],"w":4.5},
      {"source":"333642412","surface":"asphalt","path":[[114.28,217.79],[120.07,218.27]],"w":4.5},
      {"source":"343241050","surface":"asphalt","path":[[127.27,218.98],[122.86,208.89],[116.87,201.25],[115.61,198.43],[115.49,196.53],[116.15,194.81],[117.61,192.83],[137.0,179.36],[192.34,162.88],[212.71,157.02],[218.25,158.77],[251.76,202.57]],"w":4.5},
      {"source":"1147690112","surface":"asphalt","path":[[167.1,334.61],[173.12,342.21],[184.14,363.66],[194.62,384.62],[205.42,403.66]],"w":6},
    ],
    access: [
      // #71 (original #1301): the bus bay at Sankt Lars väg; the long ways below are split differently in this dataset, so the bay's short pieces are added
      {"source":"36918923","surface":"asphalt","path":[[45.85,215.95],[46.16,211.77],[46.1,209.57],[45.43,205.77],[44.88,203.85]],"w":4.5},
      {"source":"95035967","surface":"asphalt","path":[[44.88,203.85],[34.91,195.45]],"w":4.5}, // the bus bay's approach (psv-only one-way)
      {"source":"189432572","surface":"asphalt","path":[[34.91,195.45],[30.49,192.5],[26.53,188.72]],"w":4.5},
      {"source":"850235114","surface":"asphalt","path":[[-18.84,390.31],[-14.53,391.82],[-8.69,392.21],[-3.21,391.03],[2.69,388.29],[6.38,385.0],[9.37,380.08],[10.22,374.87],[9.14,370.07],[7.4,367.6],[3.61,366.19],[-3.7,367.24],[-8.72,370.38],[-14.56,377.29],[-17.67,383.67],[-18.84,390.31]],"w":4.5},
      {"source":"850235115","surface":"asphalt","path":[[-2.35,240.57],[-2.95,249.25],[-7.8,261.27],[-18.29,275.92],[-24.96,285.91],[-27.76,290.76],[-30.34,300.93],[-31.42,316.03],[-30.64,328.67],[-29.07,337.59],[-24.97,351.97],[-18.84,390.31],[-18.57,396.48],[-18.06,400.17]],"w":4.5},
      {"source":"36918923","surface":"asphalt","path":[[147.12,323.27],[142.34,342.28],[139.11,353.48],[134.42,367.87],[127.35,389.58],[121.23,407.9],[117.81,417.86],[114.73,426.31],[111.45,434.62],[108.6,441.51],[103.54,451.94],[98.05,463.31],[93.73,472.06],[90.0,479.25],[84.7,489.17],[79.52,498.44],[72.58,510.14]],"w":5.0},
      {"source":"189432572","surface":"asphalt","path":[[84.9,276.19],[75.95,279.79],[67.12,284.14],[58.11,288.75],[50.29,292.83],[40.93,298.06],[34.25,302.26],[26.96,307.72],[22.02,312.39],[15.35,319.46],[10.74,324.91],[5.74,332.19],[2.66,337.28],[0.37,342.06],[-2.95,350.56],[-5.67,361.35],[-8.72,370.38]],"w":4.5},
      {"source":"30633544","surface":"asphalt","path":[[8.31,233.97],[11.66,236.42],[14.9,240.59],[16.89,245.24],[18.3,251.27],[18.35,257.65],[16.81,265.41],[13.88,272.76],[9.98,279.91],[5.23,286.99],[-0.99,294.01],[-5.06,298.71],[-9.66,303.4],[-15.39,308.77],[-21.84,313.79],[-28.32,317.91]],"w":4.0},
      {"source":"30633545","surface":"asphalt","path":[[3.68,236.83],[5.43,243.68],[6.01,249.77],[5.56,256.03],[3.91,262.59],[1.0,269.21],[-2.99,275.69],[-8.04,281.82],[-14.07,287.41],[-21.05,292.65],[-28.84,297.23]],"w":4.0},
      {"source":"145221590","surface":"asphalt","path":[[62.73,207.66],[64.08,203.4],[65.17,199.14],[65.71,194.88],[65.65,190.62],[64.83,186.37],[63.47,182.16],[61.4,178.01],[58.74,173.95],[55.38,170.02],[51.52,166.25],[47.05,162.66],[42.17,159.29],[36.78,156.16],[31.06,153.31],[25.04,150.77],[18.91,148.55]],"w":3.5},
      {"source":"145221588","surface":"asphalt","path":[[72.56,208.06],[74.77,204.09],[76.43,200.03],[77.51,195.9],[77.96,191.73],[77.78,187.53],[76.99,183.33],[75.58,179.16],[73.57,175.05],[70.98,171.02],[67.84,167.1],[64.19,163.32],[60.05,159.7],[55.44,156.27],[50.41,153.05],[45.0,150.06],[39.26,147.33],[33.22,144.89],[26.92,142.75],[20.4,140.94],[13.7,139.47],[6.86,138.38],[-0.07,137.69],[-7.04,137.4],[-14.01,137.54]],"w":3.5},
    ],
    parking: [
      {"source":"145221619","surface":"asphalt","capacity":28,"polygon":[[3.01,438.48],[32.22,416.71],[27.02,409.73],[-2.19,431.5],[3.01,438.48]]},
      {"source":"850235113","surface":"asphalt","capacity":18,"polygon":[[-21.43,391.24],[-8.69,380.05],[-13.36,374.74],[-26.1,385.93],[-21.43,391.24]]},
      {"source":"145221624","surface":"asphalt","capacity":12,"polygon":[[15.54,449.62],[27.79,440.48],[24.08,435.5],[11.83,444.64],[15.54,449.62]]},
      {"source":"145221626","surface":"asphalt","capacity":16,"polygon":[[119.86,419.05],[128.8,421.94],[133.56,407.2],[124.62,404.31],[119.86,419.05]]},
      {"source":"145221628","surface":"asphalt","capacity":14,"polygon":[[127.35,395.74],[136.29,398.63],[140.1,386.87],[131.16,383.98],[127.35,395.74]]},
      {"source":"145221629","surface":"asphalt","capacity":22,"polygon":[[138.86,360.38],[147.8,363.27],[153.51,345.64],[144.57,342.75],[138.86,360.38]]},
      {"source":"1379042014","surface":"asphalt","capacity":8,"polygon":[[24.47,192.36],[27.8,193.47],[28.48,203.89],[23.51,203.89],[24.47,192.36]]},
      {"source":"1379042106","surface":"asphalt","capacity":12,"polygon":[[21.82,217.4],[26.8,217.4],[23.82,222.4],[18.84,222.4],[21.82,217.4]]},
      {"source":"1379042188","surface":"asphalt","capacity":6,"polygon":[[13.88,229.4],[18.86,229.4],[16.88,233.4],[11.9,233.4],[13.88,229.4]]},
      {"source":"1379042235","surface":"asphalt","capacity":8,"polygon":[[6.29,235.8],[11.27,235.8],[8.29,239.8],[3.31,239.8],[6.29,235.8]]},
      {"source":"1379043164","surface":"asphalt","capacity":14,"polygon":[[-5.33,243.2],[-0.35,243.2],[-12.31,251.2],[-17.29,251.2],[-5.33,243.2]]},
      {"source":"1379043165","surface":"asphalt","capacity":16,"polygon":[[-24.87,256.3],[-19.89,256.3],[-34.83,266.3],[-39.81,266.3],[-24.87,256.3]]},
    ],
    storey: 3,
    window: [
      1.1,
      1.7,
    ],
    bay: 3.5,
    sill: 1,
    treeHeight: [
      8,
      14,
    ],
    treeRadius: [
      3,
      5,
    ],
    ground: {"x0":-1000,"x1":1000,"z1":1000},
    view: {"fogNear":45,"fogFar":650,"cameraFar":1000},
    roofColor: 5396570,
  },

  // #530 actual northern footprints; untagged height/roof/window/parking/tree details are visual assumptions.
  north: {
    buildings: [
      {"source":"88457603","polygon":[[-219.17,-78.69],[-229.29,-71.35],[-231.82,-74.79],[-218.49,-84.33],[-217.03,-82.97],[-211.54,-86.95],[-194.95,-71.63],[-192.19,-74.62],[-175.03,-58.77],[-177.92,-55.65],[-156.76,-36.1],[-164.31,-27.92],[-188.84,-50.58],[-188.06,-51.43],[-198.07,-60.68],[-198.8,-59.88],[-219.17,-78.69]],"name":"Hunnerupshemmet / 85","levels":3,"levelsSource":"visual assumption","storey":3.3,"roofRise":1.5,"modern":true,"facade":13158845},
      {"source":"130578354","polygon":[[-216.76,-111.89],[-190.19,-148.42],[-142.0,-144.04],[-142.48,-138.37],[-145.27,-137.73],[-145.25,-133.12],[-147.54,-133.02],[-147.92,-128.31],[-178.44,-130.69],[-177.54,-135.41],[-180.42,-135.17],[-182.79,-132.73],[-180.82,-130.74],[-199.49,-104.67],[-202.27,-106.75],[-204.21,-104.73],[-207.36,-107.04],[-208.88,-105.43],[-216.76,-111.89]],"name":"Norra vinklade byggnaden","levels":3,"levelsSource":"visual assumption","storey":3.3,"roofRise":0,"modern":true,"roof":"flat","facade":13158845},
      {"source":"88457569","polygon":[[-79.24,-183.84],[-79.24,-187.9],[-67.04,-187.91],[-67.04,-187.51],[-44.11,-187.53],[-44.12,-187.48],[-32.59,-187.49],[-32.54,-170.24],[-47.62,-170.22],[-47.62,-173.03],[-66.27,-173.02],[-66.26,-171.06],[-79.44,-171.05],[-79.46,-178.99],[-82.01,-178.98],[-82.02,-183.83],[-79.24,-183.84]],"name":"Norra tegelpaviljongen","levels":2,"levelsSource":"visual assumption","storey":3.3,"roofRise":3.5,"modern":false},
    ],
    paths: [
      {"source":"145221574","path":[[-218.5,-275.76],[-209.58,-274.06],[-199.71,-272.82],[-196.73,-272.57],[-183.32,-271.16],[-181.36,-270.83],[-169.51,-269.43],[-163.37,-268.78],[-158.97,-266.88],[-155.86,-264.28],[-154.06,-262.32],[-152.5,-260.3],[-151.59,-258.32],[-150.78,-256.54],[-149.7,-249.52],[-147.49,-239.4],[-144.04,-218.39],[-141.07,-202.84],[-138.03,-186.26],[-136.06,-177.03],[-134.64,-167.06],[-134.42,-161.84],[-134.19,-156.36],[-134.94,-142.23]],"w":2},
      {"source":"145221606","path":[[-232.79,-296.36],[-226.39,-297.2],[-211.43,-295.2],[-206.47,-295.52],[-194.34,-294.19],[-189.77,-293.9],[-170.21,-289.86],[-163.93,-289.71],[-160.78,-291.35],[-157.49,-292.88],[-153.82,-292.63],[-146.12,-291.56],[-143.07,-290.91],[-140.51,-288.4],[-139.43,-285.67],[-137.6,-279.17],[-135.12,-266.13],[-134.36,-263.1],[-132.81,-256.2],[-130.42,-243.44],[-123.11,-211.56],[-118.45,-185.03],[-117.56,-178.82]],"w":2},
      {"source":"159287727","path":[[-117.56,-178.82],[-117.46,-161.61],[-116.25,-142.47],[-116.26,-141.56],[-116.41,-134.1],[-114.37,-97.63],[-113.97,-85.75],[-109.6,-74.81],[-103.88,-65.7],[-94.85,-57.64],[-84.21,-49.06],[-71.1,-38.72],[-63.88,-36.37],[-47.2,-33.16],[-40.63,-32.74],[-28.31,-32.92],[-18.17,-32.82],[9.1,-32.56],[8.07,-29.4],[7.34,-26.01],[5.73,-16.66]],"w":2},
      {"source":"159287752","path":[[-117.56,-178.82],[-112.54,-178.68],[-106.78,-177.47],[-102.02,-175.07],[-96.33,-173.27],[-89.56,-171.62],[-83.62,-170.1],[-78.85,-167.43],[-74.67,-161.09]],"w":2},
      {"source":"850235116","path":[[-142.2,-142.95],[-138.79,-142.8],[-134.94,-142.23],[-126.9,-141.65],[-116.26,-141.56]],"w":2}, // #1348: the first point is a *guess*: OSM starts this stub 3.6 m short of Hus 130578354's east face (x ≈ -142.2), so it now reaches the wall
      {"source":"850235118","path":[[-136.06,-177.03],[-128.8,-178.12],[-117.56,-178.82]],"w":2},
      {"source":"1228396154","path":[[-134.94,-142.23],[-136.7,-112.47],[-135.91,-93.07],[-136.34,-82.39],[-135.95,-55.32],[-136.18,-42.22],[-135.59,-39.25],[-135.03,-36.44],[-133.25,-32.55],[-127.52,-25.21],[-124.78,-23.59],[-118.18,-21.03],[-109.65,-19.77],[-98.61,-19.27],[-88.35,-19.7],[-82.44,-19.74],[-71.38,-19.76],[-74.4,-19.77]],"w":2},
    ],
    access: [
      {"source":"130442838","path":[[-328.08,-124.07],[-323.0,-120.18],[-308.47,-106.87],[-294.15,-95.19],[-287.95,-90.27],[-281.28,-87.3],[-268.18,-86.87],[-252.75,-90.02],[-246.43,-91.23],[-220.28,-96.79],[-217.74,-97.13],[-208.55,-96.74],[-202.11,-94.5],[-196.04,-90.41],[-191.55,-86.32],[-162.88,-57.88],[-149.43,-44.61],[-143.88,-36.74],[-142.39,-34.33],[-138.88,-29.12]],"w":5.5},
      {"source":"1228396156","path":[[-122.25,-40.5],[-126.71,-37.33],[-133.25,-32.55],[-138.88,-29.12],[-141.83,-27.33],[-142.59,-26.76],[-153.52,-18.64],[-161.23,-12.33],[-169.74,-4.22],[-178.3,3.76],[-191.96,15.4],[-201.0,22.65],[-207.84,25.96],[-212.87,26.79],[-218.82,26.96],[-225.59,26.18],[-239.76,22.92],[-245.38,23.13],[-249.76,24.21],[-254.67,25.98],[-260.95,29.66],[-277.71,41.57],[-284.23,43.98],[-292.69,45.08]],"w":5.5},
      {"source":"44447972","path":[[-245.38,23.13],[-247.4,16.96],[-248.84,15.17],[-256.9,9.48],[-272.91,-2.94],[-280.02,-7.87],[-283.25,-11.44],[-285.64,-16.72],[-285.35,-23.11],[-280.55,-32.49],[-269.86,-41.43],[-261.11,-49.49],[-257.73,-55.57],[-255.56,-66.31],[-254.74,-79.37],[-252.75,-90.02]],"w":4},
      {"source":"44447980","path":[[-142.59,-26.76],[-133.02,-11.63],[-124.68,-0.37],[-117.93,4.55],[-111.92,6.21],[-105.69,11.63],[-107.8,15.8],[-111.3,18.6]],"w":4}, // #1347: the last two points are a *guess*: OSM ends the way in open grass 10 m short of Östra långan (88457595), so it now curves in to that building's east corner (-112.14,19.2); w 4 matches the other service ways of `north.access` (60420594 …), only the footpaths in `paths` are 2
      {"source":"60420594","path":[[-127.2,-161.66],[-117.46,-161.61],[-74.67,-161.09]],"w":4},
      {"source":"159287720","path":[[-74.67,-161.09],[-43.26,-160.79],[16.87,-158.49]],"w":4},
      {"source":"850235117","path":[[-127.2,-161.66],[-134.42,-161.84],[-145.2,-161.29],[-149.02,-161.36],[-165.15,-161.75]],"w":4},
      {"source":"aerial interpretation","pixels":[[768,60],[802,64],[748,282],[716,281]],"polygon":[[-197.95,-91.21],[-192.05,-98.57],[-148.98,-54.11],[-153.89,-46.77]]},
      {"source":"aerial interpretation","pixels":[[1026,18],[1051,8],[1110,103],[1085,121]],"polygon":[[-170.08,-157.66],[-168.77,-164.96],[-137.94,-164.88],[-137.39,-156.4]]},
    ],
    trees: [
    ],
    treeScale: [
      1.2,
      1.7,
    ],
    treeRows: [
      {"name":"Kallby-avenue","from":[-234,12],"to":[-145,-44],"step":13},
      {"name":"Alvagen-avenue","from":[-276,-97],"to":[-215,-106],"step":12},
      {"name":"north-street","from":[-118,-54],"to":[-115,-163],"step":14},
    ],
    treePatches: [
      {"name":"Hunnerup-park","polygon":[[-265,-55],[-245,-83],[-219,-38],[-238,-13]],"n":14},
      {"name":"north-campus","polygon":[[-135,-182],[-105,-199],[-93,-180],[-102,-172]],"n":8},
    ],
    storey: 3.3,
    roofRise: 1.5,
    annexRise: 0.5,
    window: [
      1.1,
      1.8,
    ],
    sill: 0.9,
    bay: 3,
    frame: 0.07,
    facade: 16777215,
    plinth: 8750455,
    glass: 3490893,
    roof: 5593950,
    pathLift: 0.025,
  },

  east: {
    buildings: [
      {"source":"88457546","polygon":[[39.82,-133.52],[50.71,-133.78],[50.79,-130.68],[64.45,-131.0],[64.9,-113.43],[50.44,-113.08],[50.33,-117.48],[45.1,-117.36],[45.18,-114.52],[26.82,-114.08],[26.39,-131.02],[39.88,-131.33],[39.82,-133.52]],"name":"Sankt Thomas skola / byggnad 1 (Klockhuset)","levels":2,"levelsSource":"Commons 2014 photo and Hemsö: two tall storeys","storey":4.6,"frameColor":15657439,
        "campus":{"style":"klockhuset","chimneys":[[33,-122.5],[58,-122.5],[45.5,-129]],
          "centre":{"x":[39.6,51.6],"face":-112.6,"normal":1,"depth":5,"render":4.75,"pilasters":true,"pediment":2.1,"roofBack":2.2,
            "window":{"sill":4.9,"height":3.9,"width":2.6},
            "tower":{"z":-116.6,"base":1.4,"width":3.6,"stage":4.0,"clock":.8,"clockFace":15328456,"clockRim":2829099,"lantern":2.3,"lanternHeight":2.7,"opening":2829099,"dome":1.7,"spire":2.4,"gilt":13280832}}}},
      {"source":"88457547","polygon":[[138.12,-129.52],[138.19,-137.81],[133.49,-137.87],[133.57,-147.48],[137.9,-147.43],[137.94,-151.12],[149.85,-150.99],[149.82,-147.73],[154.48,-147.67],[154.39,-138.06],[150.15,-138.11],[150.07,-129.28],[166.05,-129.1],[165.94,-116.99],[149.39,-117.17],[148.9,-63.59],[161.35,-63.45],[161.24,-52.48],[136.64,-52.75],[136.71,-59.94],[136.28,-59.94],[136.91,-129.54],[138.12,-129.52]],"name":"H\u00f6jebroskolan / byggnad 9","levels":1,"levelsSource":"Commons 2014 photo of the south block and long wing: one storey","storey":4.7,"frameColor":15657439,
        "campus":{"style":"ward","chimneys":[[143,-75],[143,-95],[143,-115],[149,-57.5],[144,-142]]}},
      {"source":"88457552","polygon":[[105.08,-126.68],[116.15,-126.46],[116.21,-129.88],[126.08,-129.69],[126.0,-126.27],[127.31,-126.24],[127.14,-117.41],[125.83,-117.44],[125.71,-111.53],[115.85,-111.72],[115.97,-117.63],[104.89,-117.86],[104.79,-112.25],[91.54,-112.51],[91.65,-118.12],[80.5,-118.34],[80.35,-111.1],[70.85,-111.29],[71.23,-130.27],[80.74,-130.08],[80.68,-127.17],[91.83,-126.95],[91.87,-129.08],[105.11,-128.82],[105.08,-126.68]],"name":"F\u00f6rskolan Freinet / byggnad 7","levels":2,"levelsSource":"Commons 2014 photo (Freinetskolan sign) and Hemsö By7: two storeys","storey":4.3,"frameColor":15657439,
        "campus":{"style":"stenhammar","sections":[{"name":"west pavilion","box":[70.5,-130.6,80.6,-110.8],"raise":1.2},{"name":"centre","box":[91.7,-129.4,104.95,-112],"raise":1.2},{"name":"east pavilion","box":[115.95,-130.2,127.6,-111.2],"raise":1.2}],
          "chimneys":[[75.8,-120.7],[98.3,-120.6],[121.5,-120.6],[86,-122.6],[110.5,-122.2]]}},
      {"source":"88457558","polygon":[[273.63,-69.61],[292.05,-79.29],[296.27,-71.27],[277.85,-61.58],[273.63,-69.61]],"name":"Komplementbyggnad 88457558","levels":1,"levelsSource":"visual assumption","storey":3.6,"roofRise":2,"frameColor":15657439},
      {"source":"88457565","polygon":[[228.12,-65.56],[261.7,-65.44],[261.68,-53.62],[260.67,-53.63],[260.66,-49.35],[252.87,-49.38],[252.88,-54.29],[228.1,-54.38],[228.12,-65.56]],"name":"F\u00f6rskolan Kastanjen","levels":1,"levelsSource":"visual assumption","storey":3.6,"roofRise":2,"frameColor":15657439},
      {"source":"88457581","polygon":[[89.73,17.57],[89.78,-8.74],[115.39,-8.64],[115.38,-1.76],[115.37,4.0],[115.34,19.86],[107.99,19.84],[107.98,25.63],[94.57,25.58],[94.58,17.58],[89.73,17.57]],"name":"Kunskapsskolan / byggnad 19","levels":1,"levelsSource":"Commons 2014 photo: three-storey block behind a two-storey front, one-storey annex","storey":3.9,"frameColor":15657439,
        "campus":{"style":"laundry","sections":[{"name":"two-storey front","box":[89.5,-9,96.5,17.7],"levels":2,"roof":{"rise":.8,"slope":.25}},{"name":"three-storey block","box":[96.5,-9,115.6,19.9],"levels":3}],"chimneys":[[108.5,4.5]]}},
      {"source":"88457600","polygon":[[79.7,63.91],[79.48,54.45],[85.17,54.33],[84.82,39.49],[89.99,39.38],[90.56,63.68],[79.7,63.91]],"name":"Komplementbyggnad 88457600","levels":1,"levelsSource":"visual assumption","storey":3.6,"roofRise":2,"frameColor":15657439},
      {"source":"88457601","polygon":[[147.34,-3.67],[125.29,-3.73],[124.91,-1.56],[115.38,-1.76],[115.37,4.0],[125.33,4.25],[126.01,24.18],[148.79,24.33],[147.34,-3.67]],"name":"\u00d6stra paviljongen vid Kunskapsskolan / byggnad 19","levels":2,"levelsSource":"guess: lower eastern part of byggnad 19 (Hemsö map), not photographed","storey":3.9,"frameColor":15657439,
        "campus":{"style":"laundry","chimneys":[[137,10]]}},
      {"source":"88457606","polygon":[[105.93,-66.55],[116.99,-66.33],[117.06,-69.76],[126.92,-69.55],[126.86,-66.13],[128.15,-66.1],[127.98,-57.28],[126.68,-57.3],[126.56,-51.39],[116.7,-51.6],[116.82,-57.49],[105.74,-57.72],[105.64,-52.11],[92.39,-52.39],[92.49,-57.98],[81.35,-58.21],[81.21,-50.96],[71.71,-51.16],[72.07,-70.14],[81.58,-69.94],[81.53,-67.04],[92.67,-66.81],[92.72,-68.95],[105.96,-68.68],[105.93,-66.55]],"name":"F\u00f6rskolan Framtiden / byggnad 8","levels":2,"levelsSource":"Commons 2014 photo and Hemsö By8: two storeys","storey":4.3,"frameColor":15657439,
        "campus":{"style":"stenhammar","sections":[{"name":"west pavilion","box":[71,-70.6,81.4,-50.5],"raise":1.2},{"name":"centre","box":[92.55,-69.4,105.85,-51.7],"raise":1.2},{"name":"east pavilion","box":[116.9,-70.2,128.6,-50.9],"raise":1.2}],
          "centre":{"x":[92.72,105.96],"face":-68.82,"normal":-1,"depth":0,"pedDepth":1.6,"pediment":1.9,"roofBack":2.5},
          "chimneys":[[76.6,-61.2],[122.6,-61],[99.3,-61.5],[87,-62.6],[111.5,-62.2]]}},
      {"source":"88457612","polygon":[[-5.23,-65.15],[6.26,-65.2],[6.22,-71.29],[15.76,-71.33],[15.89,-52.58],[6.38,-52.54],[6.35,-56.62],[-5.13,-56.57],[-5.11,-53.63],[-18.01,-53.57],[-18.04,-56.52],[-29.02,-56.47],[-29.0,-53.72],[-38.79,-53.67],[-38.89,-70.68],[-29.02,-70.73],[-28.98,-65.05],[-18.13,-65.1],[-18.17,-70.15],[-5.26,-70.22],[-5.23,-65.15]],"name":"NTI / skolan \u00f6ver gatan","levels":2,"levelsSource":"visual assumption","storey":4.3,"roofRise":3,"frameColor":15657439,"classic":true},
      {"source":"130578352","polygon":[[125.46,40.62],[119.55,40.67],[119.67,53.05],[125.59,53.0],[125.46,40.62]],"name":"Komplementbyggnad 130578352","levels":1,"levelsSource":"visual assumption","storey":3.6,"roofRise":2,"frameColor":15657439},
      {"source":"130678797","polygon":[[-41.57,-134.49],[-31.06,-134.87],[-30.95,-131.92],[-21.25,-132.27],[-21.36,-135.15],[-5.68,-135.72],[-5.58,-133.09],[4.47,-133.45],[4.35,-136.54],[15.03,-136.93],[15.85,-115.25],[4.21,-114.83],[3.94,-121.73],[-3.76,-121.45],[-3.63,-117.88],[-19.49,-117.3],[-19.68,-122.28],[-31.94,-121.83],[-31.75,-116.71],[-40.87,-116.38],[-41.57,-134.49]],"name":"\u00d6stra borgg\u00e5rden, byggnad 2","levels":2,"levelsSource":"Commons 2014 photo: two storeys","storey":4.3,"frameColor":15657439,
        "campus":{"style":"stenhammar","sections":[{"name":"west pavilion","box":[-42,-135.2,-31.3,-115.9],"raise":1.2},{"name":"centre","box":[-21.3,-136,-5.62,-117],"raise":1.2},{"name":"east pavilion","box":[4.2,-137.3,16.3,-114.6],"raise":1.2}],
          "chimneys":[[-36.3,-125.3],[-13.5,-126.5],[10,-125.9],[-26.4,-127],[-0.6,-127.5]]}},
      {"source":"130681301","polygon":[[72.93,40.79],[46.47,40.46],[46.68,19.41],[28.4,19.19],[28.0,58.28],[72.74,58.83],[72.93,40.79]],"name":"Consensum / l\u00e5nga tegelbyggnaden","levels":1,"levelsSource":"visual assumption","storey":3.8,"roofRise":2,"frameColor":13675862},
      {"source":"145221568","polygon":[[43.51,2.27],[43.59,-7.33],[50.43,-7.26],[50.34,2.34],[43.51,2.27]],"name":"Komplementbyggnad 145221568","levels":1,"levelsSource":"visual assumption","storey":3.6,"roofRise":2,"frameColor":15657439},
      {"source":"88457613","polygon":[[-64.12,-68.25],[-63.81,-121.44],[-67.62,-121.47],[-67.63,-120.2],[-77.62,-120.28],[-77.54,-133.09],[-67.3,-133.01],[-67.32,-130.44],[-64.01,-130.41],[-64.01,-132.44],[-63.91,-149.78],[-59.73,-149.75],[-59.7,-153.85],[-51.38,-153.78],[-51.4,-150.45],[-46.25,-150.41],[-46.3,-141.13],[-50.67,-141.15],[-50.68,-139.83],[-57.96,-139.88],[-58.01,-132.56],[-50.03,-132.49],[-50.46,-56.41],[-74.94,-56.6],[-74.87,-68.33],[-64.12,-68.25]],"name":"Montessorigrundskolan / byggnad 4","levels":1,"levelsSource":"Commons 2014 photo: one-storey wards; two-storey block from Hemsö By4 photo (position guess)","storey":4.7,"frameColor":15657439,
        "campus":{"style":"ward","sections":[{"name":"two-storey block","box":[-64.3,-133.2,-49.8,-120.1],"levels":2}],"chimneys":[[-57.2,-72],[-57.2,-92],[-57.2,-112],[-57,-126.6],[-55.5,-146]]}},
      {"source":"relation/1309427","polygon":[[24.22,-78.12],[61.31,-77.75],[61.01,-40.76],[23.92,-41.13],[24.22,-78.12]],"holes":[[[36.21,-66.93],[51.38,-66.63],[51.09,-49.91],[35.92,-50.2],[36.21,-66.93]]],"name":"Realgymnasiet / byggnad 88","levels":2,"levelsSource":"current photo (ednia.se) and Hemsö By88: two storeys","storey":3.5,"frameColor":15657439,
        "campus":{"style":"anshelm"}},
    ],
    paths: [
      {"source":"61112064","surface":"gravel","path":[[248.57,20.99],[262.52,11.51],[269.96,5.6],[274.94,1.24],[280.52,-4.93],[285.42,-10.66],[290.56,-17.79],[296.05,-26.85],[306.75,-46.47],[314.76,-59.29],[322.42,-72.87],[325.33,-81.47],[325.52,-89.03],[322.12,-100.48],[319.97,-106.14],[318.65,-110.25],[317.22,-116.09],[315.66,-121.19],[315.06,-124.8],[313.34,-131.43]],"w":2},
      {"source":"61112065","surface":"gravel","path":[[248.57,20.99],[239.56,21.12],[235.14,22.82],[228.02,25.33],[202.15,34.86],[193.02,34.82]],"w":2},
    ],
    access: [
      {"source":"30633554","surface":"asphalt","path":[[64.6,-23.58],[66.93,-86.35],[66.75,-136.67],[66.68,-157.77]],"w":4.5},
      {"source":"33646346","surface":"asphalt","path":[[17.4,-21.81],[25.5,-22.71],[42.02,-22.6],[64.6,-23.58]],"w":4.5},
      {"source":"44447961","surface":"asphalt","path":[[130.35,-23.46],[130.2,-33.79],[130.09,-49.96],[129.42,-89.2],[128.56,-151.91],[128.42,-159.55]],"w":4.5},
      {"source":"44447965","surface":"asphalt","path":[[197.71,-58.66],[222.18,-60.24],[228.75,-69.41],[266.49,-70.78],[266.5,-36.36],[278.76,-31.43],[286.82,-29.24],[296.05,-26.85],[314.79,-29.99],[328.24,-32.14]],"w":4.5},
      {"source":"44447967","surface":"asphalt","path":[[52.88,64.43],[73.18,67.8],[103.93,63.38]],"w":4.5},
      {"source":"60420592","surface":"asphalt","path":[[16.87,-158.49],[44.01,-157.94]],"w":4.5},
      {"source":"60420593","surface":"asphalt","path":[[64.6,-23.58],[104.66,-22.41],[120.84,-23.07],[130.35,-23.46],[143.67,-21.3],[165.49,-25.18],[181.13,-33.32],[188.29,-38.62],[191.25,-43.72],[197.71,-58.66],[197.28,-137.02],[197.48,-146.01],[195.99,-159.04]],"w":4.5},
      {"source":"60420597","surface":"asphalt","path":[[44.01,-157.94],[66.68,-157.77],[128.42,-159.55],[195.99,-159.04]],"w":4.5},
      {"source":"130731429","surface":"asphalt","path":[[197.71,-58.66],[210.05,-70.57],[217.75,-84.81],[222.28,-99.05],[225.38,-109.87],[225.64,-121.57],[224.99,-130.7],[229.24,-135.59],[236.26,-136.82],[244.55,-135.95],[250.31,-132.0],[251.65,-126.35],[251.25,-119.51],[246.62,-113.21],[235.66,-110.93],[229.21,-111.4],[225.38,-109.87]],"w":4.5},
      {"source":"145221600","surface":"asphalt","path":[[62.44,9.9],[77.08,10.13],[77.56,-14.55]],"w":4.5},
      {"source":"145221608","surface":"asphalt","path":[[42.02,-22.6],[41.59,9.63],[62.44,9.9],[62.84,-12.92],[64.6,-23.58]],"w":4.5},
      {"source":"159284495","surface":"asphalt","path":[[103.93,63.38],[111.66,62.1],[124.13,56.78],[132.13,55.42],[151.46,51.2],[175.16,45.0],[190.09,38.61],[193.02,34.82]],"w":4.5},
      {"source":"159284525","surface":"asphalt","path":[[193.02,34.82],[195.65,30.96],[197.66,13.19],[197.5,-9.96],[194.66,-29.07],[188.29,-38.62]],"w":4.5},
      {"source":"145221623","name":"Parkering vid Sankt Thomas/Klockhuset","surface":"asphalt","capacity":35,"capacitySource":"guess","polygon":[[38.68,15.41],[40.14,-19.07],[85.54,-17.08],[84.09,17.41]]},
      {"source":"44447969","name":"Östra campusparkeringen","surface":"asphalt","capacity":20,"capacitySource":"guess","polygon":[[196.06,-37.72],[189.82,-21.9],[192.2,7.75],[206.2,7.66],[204.71,-19.6]]},
      {"source":"145221566","surface":"paved","polygon":[[24.46,-113.16],[39.88,-113.47],[39.92,-111.45],[44.97,-111.35],[44.93,-113.37],[64.9,-113.43],[64.84,-110.82],[71.23,-110.69],[70.85,-128.27],[64.45,-128.4],[64.39,-131.0],[50.79,-130.68],[50.71,-133.78],[39.82,-133.52],[39.88,-131.33],[26.39,-131.02],[26.33,-128.42],[24.46,-128.42],[24.46,-113.16]]},
      {"source":"145221567","surface":"asphalt","polygon":[[68.21,-88.35],[128.32,-87.15],[128.15,-66.1],[105.93,-66.55],[105.74,-57.72],[92.49,-57.98],[92.39,-52.39],[71.71,-52.8],[71.23,-70.14],[68.21,-70.2],[68.21,-88.35]]},
      {"source":"145221572","surface":"paved","polygon":[[76.99,-48.5],[86.3,-48.31],[86.13,-39.9],[76.82,-40.09],[76.99,-48.5]]},
      {"source":"145221740","surface":"asphalt","polygon":[[130.35,-23.46],[147.34,-3.67],[126.01,24.18],[107.98,25.63],[89.73,17.57],[89.78,-8.74],[115.39,-8.64],[130.35,-23.46]]},
      {"source":"94054863","surface":"paved","polygon":[[24.22,-78.12],[61.31,-77.75],[61.01,-40.76],[23.92,-41.13],[24.22,-78.12]]},
      {"source":"145221570","surface":"asphalt","polygon":[[-18.01,-53.57],[15.89,-52.58],[15.76,-71.33],[-38.89,-70.68],[-38.79,-53.67],[-18.01,-53.57]]},
    ],
    trees: [
      [56.94,-193.99,"564870146"],
      [33.45,-178.24,"564870159"],
      [33.48,-190.92,"564870160"],
      [33.52,-204.74,"564870163"],
      [57.09,-179.06,"564870229"],
    ],
    treeScale: [1.2,1.8],
    // Approximate aerial-interpreted avenue strips and park clusters; not individually mapped trees.
    treeRows: [{"name":"west-campus-avenue","from":[58,-151],"to":[60,-30],"step":13},{"name":"central-crossing","from":[74,-19],"to":[181,-19],"step":14},{"name":"eastern-park-avenue","from":[207,-151],"to":[209,-57],"step":14},{"name":"northern-courtyard","from":[73,-166],"to":[182,-166],"step":15}],
    treePatches: [{"name":"east-park","polygon":[[177,-148],[192,-144],[190,-75],[174,-69]],"n":10},{"name":"east-meadow-edge","polygon":[[206,-22],[219,-60],[242,-46],[227,-5]],"n":12},{"name":"far-park","polygon":[[269,-153],[302,-147],[299,-96],[274,-100]],"n":8}],
    // Mapped tree positions; dimensions/age/species are assumptions. Slight size variation, no random relocation.
    // #576–#581 (src/campusfacades.js): photo-based facades of the old hospital buildings, from the Commons photos
    // (Peter Sondhauss, March 2014) and Hemsö's historical photos in docs/references/east-campus/. Proportions are read
    // from the photos against storey and window heights; every metre here is a *guess*, not a measurement.
    // `storeys` = floor heights from the plinth, `windows` per floor (sill/head from the floor, `arch` = rise of a
    // segmental head, `crown` key/cornice), `bay` = window spacing, `margin` = clear wall at each end of a stretch.
    facadeStyles: {
      // Byggnad 4 and 9 (#576): one-storey wards of the 1870s, today white render over the plinth (apron), white piers
      // between the brick window bays and a white frieze under the eaves; dark metal hip roofs with brick chimneys.
      ward: { storeys: [4.7, 4.0], bay: 2.9, margin: 1.7, wall: 0xffffff, trim: 0xeeeae1, joint: 0xc3bbb0, glass: 0x405660,
        windows: [{ sill: 1.25, head: 3.55, width: 1.25, arch: .22, crown: 'key' }, { sill: .95, head: 3.0, width: 1.15, crown: 'cornice' }],
        plinth: .85, plinthColor: 0xd9d4ca, apron: 1.2, piers: { width: .72, depth: .06, edge: .4 }, frieze: .85,
        cornice: [[-.28, .26, .12], [-.12, .14, .26], [.0, .12, .36]], frame: .12, mullion: .045,
        roof: { rise: 2.6, slope: .55, grid: 2 }, chimney: [.62, 1.5, .62] },
      // Byggnad 2, 7 and 8 (#577, #578): Stenhammar's two-storey wards like the school (#564, byggnad 3): red brick, white
      // rusticated quoins, plinth and floor band, a white cornice with dentils, segmental ground-floor windows with keystones
      // and straight upper ones under cornice crowns. End pavilions and centre stand taller than the linking wings
      // (`sections` with `raise`); low dark metal hips with brick chimneys.
      stenhammar: { storeys: [4.3, 4.3], bay: 2.75, margin: 2.45, wall: 0xffffff, trim: 0xeeeae1, joint: 0xc3bbb0, glass: 0x405660,
        windows: [{ sill: 1.05, head: 3.45, width: 1.35, arch: .2, crown: 'key' }, { sill: .95, head: 3.2, width: 1.35, crown: 'cornice' }],
        plinth: .8, bands: [{ h: .22 }], cornice: [[-.45, .32, .12], [-.23, .14, .23], [-.08, .16, .34]],
        dentil: { step: .55, width: .16, height: .22, depth: .09 }, quoin: .65, jointStep: .43, frame: .12, mullion: .045,
        roof: { rise: 1.1, slope: .26, grid: 2 }, chimney: [.65, 1.45, .65] },
      // Byggnad 88 (#580, Klas Anshelm 1959-60): two storeys of red brick with projecting brick piers between broad
      // white-framed windows (centre post, low transom), a deep white eave soffit, and four sawtooth roofs that rise from
      // the outer eaves to glazed faces towards the inner court (`inward`), so that from outside it reads as a low hip.
      anshelm: { storeys: [3.5, 3.4], bay: 3.15, margin: 1.0, wall: 0xffffff, trim: 0xf1efe9, glass: 0x405660,
        windows: [{ sill: .8, head: 2.6, width: 2.1, bars: false, rails: [.22] }, { sill: .75, head: 2.55, width: 2.1, bars: false, rails: [.22] }],
        plinth: .4, plinthColor: 0xa9a59d, cornice: [], soffit: { depth: .6, color: 0xf1efe9 }, frame: .08, mullion: .05,
        piers: { width: .5, depth: .16, edge: .25, brick: true, color: 0xffffff },
        roof: { rise: 2.4, slope: .25, grid: 2, inward: true } },
      // Byggnad 19 (#581, Axel Kumlien 1910-11, the laundry): plain red brick without the white render of the older
      // wards: segmental windows under brick arches with white frames, a centre post and transom, a dark string course
      // at each floor, a corbelled brick eave and dark standing-seam hips; the top floor has paired windows.
      laundry: { storeys: [3.9, 3.7, 3.4], bay: 3.3, margin: 1.5, wall: 0xffffff, trim: 0x93503a, glass: 0x405660,
        frameColor: 0xf1efe9, sillColor: 0xe6e2da,
        windows: [{ sill: .9, head: 3.0, width: 1.3, arch: .24, header: .2, headerColor: 0x7e3c2b, bars: false, rails: [.7] },
          { sill: .9, head: 2.8, width: 1.2, arch: .24, header: .2, headerColor: 0x7e3c2b, bars: false, rails: [.7] },
          { sill: .75, head: 2.35, width: 1.0, arch: .22, header: .18, headerColor: 0x7e3c2b, bars: false, rails: [.68], pair: 1.45 }],
        plinth: .55, plinthColor: 0x6f4537, bands: [{ dy: -.05, h: .1, depth: .1, color: 0x2e2a28 }],
        cornice: [[-.3, .22, .1], [-.12, .16, .2]], frame: .07, mullion: .05,
        roof: { rise: 3.2, slope: .55, grid: 2 }, chimney: [.9, 2.2, .9] },
      // Byggnad 1 / Klockhuset (#579, Stenhammar 1877-79): a white-rendered ground floor, brick upper floor between white
      // pilasters, dentil cornice and low hip; on the courtyard axis a projecting centre with pediment, a great round-arched
      // window and a clock tower (four dials, open arched lantern, dark bell roof, gilded spire), after the 2014 photo.
      klockhuset: { storeys: [4.6, 4.5], bay: 3.0, margin: 1.6, wall: 0xffffff, trim: 0xf0ede6, joint: 0xd2ccc2, glass: 0x405660,
        windows: [{ sill: 1.2, head: 3.5, width: 1.25, arch: .18 }, { sill: 1.0, head: 3.3, width: 1.25, crown: 'cornice' }],
        plinth: .7, apron: 4.75, piers: { width: .7, depth: .06, edge: .35 }, bands: [{ h: .26 }],
        cornice: [[-.4, .3, .12], [-.2, .14, .24], [-.06, .16, .36]], dentil: { step: .5, width: .16, height: .22, depth: .09 },
        quoin: .7, frame: .12, mullion: .045, roof: { rise: 2.2, slope: .3, grid: 2 }, chimney: [.65, 1.4, .65] },
    },

    storey: 3.6,
    roofRise: 3,
    annexRise: 1,
    window: [1,1.9],
    sill: 0.95,
    bay: 2.8,
    frame: 0.07,
    facade: 16777215,
    roof: 4541521,
    plinth: 7758680,
    glass: 3230037,
    pathLift: 0.025,
  },
  // big old limes / chestnuts along the far pavement and in the school yard (#130, the user's photos): [x, z, size]
  bigTrees: [[-36, -34.5, 1.4], [-17, -35.2, 1.6], [-4, -34.8, 1.75], [9, -35.4, 1.45], [27.5, -34.2, 1.6], [33.5, -16, 1.35], [-58, -33.5, 1.5]],
  // a row of ornamental shrubs along our pavement (#130): the situation plan's hedge between the planting strip and the car
  // park (#260), with the drive into it in front of the portik (guess: the plan's photo covers it)
  shrubs: { x0: -70.5, x1: 11, z: -16.3, step: 0.85, gaps: [[-13, -7.5]] },
  // the narrow planting between Karpvägen and the plot line / Hus C's garage wall (#257, the situation plan: two trees)
  vergeTrees: [[-73.4, 37.5], [-74.4, 50]],
  birchShare: 0.3, // of the trees in the areas (not the young street maples): birches (#115)
  treeAreas: [
    // the courtyard's and the green's trees stand where the situation plan draws them: COURTYARD.trees
    { x0: -88.8, x1: 17.37, z0: -20, z1: -19, n: 11, young: true, skip: [[-14, -6.5]] }, // street trees along Sankt Lars väg: young maples by the site (#130); none in the drive (#260)
    { x0: 16.9, x1: 18.4, z0: -12, z1: 54.05, n: 7 },          // … and along its east leg (west of the cycle path, #255)
  ],
};

export const GRASS = {
  textureSize: 256, tile: 1.6, seed: 688, blades: 2300, bladeLength: [2, 7],
  summer: 0x718b50, autumn: 0x94845b, autumnMix: 0.55,
  detailRange: [190, 244], detailNoise: 24, strawTint: 0.94, bladeTint: 0.91, strokeWidth: 0.7,
  patchScale: 0.45, patchStrength: 0.10, patchWarmth: 0.035, patchFrequencies: [0.73, 0.87, 0.31],
};

export const COURTYARD = {
  // #259: re-measured on the calibrated situation plan (upstream architectural reference; x = (px − 1805) ×
  // 0.06489 + 11.58, z = (py − 1117) × 0.06489, from Hus L's outline) — walks by their light paving, lawns vs gravel by colour
  // stone-paved walks
  paths: [
    { x0: -44.6, x1: 11.6, z0: 17.8, z1: 19.2 },     // along the row-house patios
    { x0: -44.6, x1: -9.76, z0: 29.7, z1: 31.3 },    // the south walk along Hus B's north side to Hus A's west façade
    { x0: -19.4, x1: -12.8, z0: 31.3, z1: 33.3 },    // … widening into a little square at the edge between Hus B and A
    { x0: -13.2, x1: 11.6, z0: 25.4, z1: 26.8 },     // along Hus A's north side to the stair on the east edge
    { x0: 0.2, x1: 2.2, z0: 26.8, z1: 28.8 },        // to Hus A's entrance
    { x0: 11.6, x1: 13.4, z0: 11.5, z1: 27.25 },     // the ramp along Sankt Lars väg and its landing at the stair (#255; sloped, #256)
    { x0: -15.8, x1: -14.1, z0: 12.7, z1: 19.0 },    // from the portik to the pergola
    { x0: -47.2, x1: -44.6, z0: 7.72, z1: 52.5 },    // between Hus C and the Borggården, to the stair south (#254)
    { x0: -51.4, x1: -47.2, z0: 21.7, z1: 24.6 },    // across to Hus C's entrance (its east façade)
    { x0: -66.2, x1: -47.2, z0: 40.8, z1: 41.8 }, { x0: -66.2, x1: -47.2, z0: 48.7, z1: 49.8 }, { x0: -66.2, x1: -64.6, z0: 40.8, z1: 49.8 }, // round the yard south of Hus C
  ],
  // gravel (stenmjöl): the playground west of the pergola and the strip with the boule court; between them a lawn strip
  // with three trees. Everything else on the box is lawn (the terrain's grass): round the tree squares, east of the pergola,
  // in front of Hus A and Hus B
  gravel: [{ x0: -30.4, x1: -19.9, z0: 19.2, z1: 29.7 }, { x0: -38.0, x1: -32.6, z0: 19.2, z1: 29.7 }],
  // the Borggården's pergola with a dining table (red-brown on the plan) and a second one south of Hus C
  pergolas: [{ x0: -19.3, x1: -13.2, z0: 19.6, z1: 29.4 }, { x0: -63.2, x1: -57.7, z0: 42.1, z1: 48.5 }],
  grill: { x: -20.85, z: 20.27 },               // grillplats beside the pergola (spot: guess); it can be lit (GRILL)
  sandboxes: [{ x0: -25.6, x1: -22.2, z0: 23.9, z1: 27.4 }, { x0: -53.9, x1: -49.6, z0: 44.1, z1: 48.5 }], // lekplats
  boule: { x0: -36.4, x1: -33.2, z0: 20.0, z1: 28.8 }, // boulebana: not marked on the plan; the gravel strip with benches facing it (guess)
  // `rot` = the way the seat faces (0 north, −90 east, 90 west). Where the plan draws them: two by the boule court facing
  // east, one by the sandbox facing it, two on the square by the south walk and two in front of Hus A with their backs to
  // the house (#207), one by the second sandbox. #453: the two in front of Hus A moved along the façade off its north loggias'
  // parapet openings (the plan's places stood right in front of them), between each loggia and the entrance (guess)
  benches: [{ x: -37.3, z: 22.2, rot: -90 }, { x: -37.3, z: 25.4, rot: -90 }, { x: -21.4, z: 26.4, rot: 90 }, { x: -18.0, z: 32.4, rot: 0 },
    { x: -14.4, z: 32.4, rot: 0 }, { x: -3.4, z: 28.1, rot: 0 }, { x: 4.1, z: 28.1, rot: 0 }, { x: -55.5, z: 46.2, rot: -90 }],
  // #438: sitting on every bench and putting things on every table. `bench`: the spots along a free bench (m from its
  // middle; it is 1.6 long); `pitch`: m between the spots along a pergola bench (the table is 0.7 of the pergola long);
  // `grillTable`: the grill's side table west of the kettle (dx from its middle, size, top height: guess)
  sit: { bench: [-0.5, 0, 0.5], pitch: 0.7 },
  // #682: a park bench after the common wooden-slat / black steel kind (every size *guess*, from product photos): `slats`
  // seat slats `slatW` × `slatT` m with `gap` between them, `back` back slats `backW` wide leaning `tilt`° back from
  // upright; the two steel end frames (`frame` m from the middle, a `bar` × `barT` m profile) carry armrests `arm` m up
  bench: { slats: 5, slatW: 0.07, slatT: 0.035, gap: 0.01, back: 3, backW: 0.085, tilt: 15, frame: 0.72, bar: 0.05, barT: 0.014, arm: 0.65 },
  grillTable: { dx: -0.62, w: 0.5, d: 0.45, h: 0.8 },
  beds: [{ x0: -68.9, x1: -67.1, z0: 41.4, z1: 42.6 }, { x0: -68.9, x1: -67.1, z0: 43.5, z1: 44.8 }, { x0: -68.9, x1: -67.1, z0: 45.7, z1: 46.9 },
    { x0: -68.9, x1: -67.1, z0: 47.9, z1: 49.1 }], // odlingslådor
  // shrubs and perennials on the green between Hus A and B (park level; the plan shows lawn on the box)
  plantings: [{ x0: -22.2, x1: -10.2, z0: 34, z1: 56, n: 16 }],
  // #112 (after Peab's courtyard renders; places are guesses): low path bollards that light up at dusk along the
  // patio walk, the south walk and the walk along Hus A, a red wooden playhouse by the sandbox, a bike rack with bikes
  // by the portik walk
  bollards: { h: 0.8, r: 0.07, rows: [{ x0: -42.47, x1: 9.65, z: 17.85, step: 6 }, { x0: -43.5, x1: -21.5, z: 29.75, step: 7 },
    { x0: -12, x1: 10, z: 26.85, step: 6 }] },
  playhouse: { x0: -29.9, x1: -27.8, z0: 23.8, z1: 25.7, h: 1.3, ridge: 1.9, color: 0x9c2f24, trim: 0xf2efe7 },
  // #681 (Peab's brochure p. 16 only promises "en lekplats för barnen"; the situation plan shows the gravel playground, so
  // the equipment, places and sizes are all *guess*): a wooden A-frame swing (beam `len` m along x at height `h`, legs
  // splayed `spread` m to either side, two rubber seats) in the playground's free north-west corner and a little slide
  // (platform `h` m up, a `len` m chute in `color` running east) along its south edge
  swing: { x: -27.9, z: 21.0, len: 2.4, h: 2.1, spread: 0.7 },
  slide: { x: -27.3, z: 28.6, h: 1.0, len: 2.0, color: 0xd9452b },
  bikeRack: { x: -12.16, z0: 13.4, n: 5, gap: 0.7, colors: [0x2f5d8c, 0xc23b32, 0x2e2e30, 0x5e8f4a, 0xe8e4da] },
  trees: [ // tree squares and single trees as drawn (#259)
    [-43.2, 20.5], [-39.6, 20.5], [-43.2, 24.1], [-39.6, 24.1], [-42.4, 27.9], [-39.7, 28.1], // the west lawn
    [-31.4, 21.0], [-31.4, 22.9], [-31.4, 27.8], [-11.4, 21.2], [-11.4, 23.9],                 // lawn strips by the playground / pergola
    [-7.1, 20.3], [-4.0, 20.3], [-7.1, 23.5], [-4.0, 23.5], [4.5, 20.3], [7.8, 20.3], [4.5, 23.5], [7.8, 23.5], // the east squares
    [-18.5, 35.5], [-14.8, 35.5], [-18.5, 38.9], [-14.8, 38.9], [-18.5, 42.2], [-14.8, 42.2], [-18.5, 45.6], [-14.8, 45.6], // the green
    [-18.5, 50.3], [-14.8, 50.3], [-18.5, 53.4], [-14.8, 53.4], [-21.0, 44.4], [-12.0, 45.8],                                // between A and B
    [-49.3, 13.1], [-48.6, 18.2], [-49.2, 27.9], [-49.3, 33.4], [-43.3, 37.6], [-43.3, 44.4],  // by the walk along Hus C
    [-67.9, 38.5], [-63.9, 38.4], [-58.4, 39.2], [-50.3, 39.4], [-48.9, 38.1],                 // south of Hus C
  ],
};

export const HUS_L = {
  before: 2, after: 1, west: 4,     // units east of the core: 2 west of us, 1 east; 4 west of the core
  // #252 (våningsöversikterna, 1:500 with the scale bar): the units share their party walls, `pitch` m between the
  // wall centres (`wall` = half a party wall: ours are 0.2 m in plan.json); the end units are `gableExtra` wider
  // (thicker gables); the core is `w` between the wall centres either side, the portik x from its west wall centre.
  // Hus L 53.3 m gable to gable (exterior.js husLLayout).
  pitch: 5.55, wall: 0.1, gableExtra: 0.38,
  core: {
    w: 8.175, portik: [3.4, 5.1], portikHeight: 3.0,
    // L1101 street openings on våning 2 (#457, DRAWING overview plan p. 48; sill/head ASSUMPTION)
    l1101: [{ x0: 3.67, x1: 4.98, sill: 0.8, head: 2.4 }, { x0: 6.51, x1: 7.31, sill: 0.8, head: 2.4 }],
  }, // stair core
  upperStoreys: VERTICAL.upper.storeys,        // våning 3–4 (plan brochure S2: Hus L = våning 1–4)
  storeyHeight: VERTICAL.upper.floorToFloor,   // våning 3–4 floor-to-floor (assumption, #344), not våning 1–2's
  // walkway over our north bedrooms: z 0 → the upper flats' north outer face (#354). READ on Peab's drawings, not
  // measured on site: the upper flats' entrance floor is 11.13 m deep on bofakta (L1201–L1209, L1205; 1:100, 600 dpi) vs
  // L1007's 12.70 with the courtyard faces flush (#337) → 1.57; the overview plans (docs/peab/kalibrerad/, 1:500, the
  // 0–25 m bar, 0.042356 m/px) agree: våning 3's / 4's north face 1.59 / 1.57 m south of våning 1–2's (1.96 before)
  loftgangDepth: 1.57,
  railHeight: 1.1,
  render: 0xf2efe7,       // white render, våning 3–4
  // the loftgång's details (#111, after Peab's renders; sizes are guesses): a light sheet-metal fascia on the deck edge,
  // a round handrail on the balusters, the upper units' white front doors set back in a recess, a wall lantern
  // beside each door that lights up at dusk (no lights: colour only, like the pergola's bulbs)
  loft: { fascia: 0xd5d8d4, handrailR: 0.022, door: 0xf4f4f1, recess: 0.14, lamp: { dx: 0.25, y: 2.1, w: 0.12, h: 0.22 } },
  pilaster: 0.4,          // brick pilaster width at each unit boundary (render, street side)
  // #433: an outdoor wall light by every street-side front door of våning 1 (L1001–L1008, ours too; the units are not
  // mirrored, so the latch is on each door's east side — plan.json's front-door hinge is at its west jamb): a dark box
  // with a frosted glass front, `dx` m east of the door opening to its centre, centre `y` m up, `w` × `h` × `d` (all
  // guesses). Lit after dusk like the street lamps (`on` / `off` night, `fade` s): the glass glows, an additive `wash`
  // (an upright ellipse w × h, centre `y`) on the brick round it and a `pool` (radii rx along the façade, rz out, its
  // centre `z` in front of the façade, kept short of it) on the ground; no lights (src/groundglow.js)
  doorLamp: { dx: 0.28, y: 1.9, w: 0.12, h: 0.22, d: 0.1, color: 0xffd29a, on: 0.35, off: 0.3, fade: 1.5,
    wash: { w: 2.4, h: 2.6, y: 1.75, peak: 0.26 }, pool: { rx: 2.6, rz: 1.25, z: -1.3, peak: 0.45 } },
  // #1078: Peab's "utvändig belysningsarmatur med integrerat eluttag vid uteplats, balkong eller terrass" (information
  // brochure:698–700) by every courtyard-side patio door (L1001–L1008, ours too) and roof-terrace door (L1201–L1209).
  // Model, side, height and sizes are all *guesses* (no drawing or product named): doorLamp's dark box with a frosted
  // front, centre `y` m over the door's floor, `dx` m east of the door opening (into the gap before the next window; the
  // west side if that would leave the unit's strip), `w` × `h` × `d`; under it a `socket` housing (w × h × d, its top
  // `gap` m under the lamp) with a light hinged cover. Lit with doorLamp (its on / off / fade, colour and peaks): the
  // glass joins the lanterns' glow, its `wash` and `pool` (radii rx along the façade, rz out, centre `z` out from the
  // wall; both halved to fit a terrace's depth) join the door lights' two additive meshes (src/exterior.js patioLamps).
  patioLamp: { dx: 0.28, y: 1.95, w: 0.12, h: 0.2, d: 0.1, socket: { w: 0.09, h: 0.1, d: 0.06, gap: 0.03 },
    wash: { w: 2.0, h: 2.3, y: 1.8 }, pool: { rx: 2.2, rz: 1.4, z: 1.45 } },
  // #451: the portik's floor is paved like the courtyard walks (patio.js pavingTexture, no snow under the roof) and it
  // has round, flat opal ceiling lamps (guess: `r` m, at `z` along the passage, clear of the stairwell door's z 8.5…9.4),
  // lit with the front-door lights (doorLamp's on / off / fade): the discs glow, a pool on the paving and a wash on both
  // brick walls (and the ceiling) per lamp join doorLamp's two additive meshes (no lights)
  portikLamp: { z: [2.0, 6.35, 10.7], r: 0.17, lit: 0xfff1dc, off: 0xd9d8d3,
    wash: { w: 2.0, h: 2.2, y: 1.9 }, pool: { ra: 1.7, rb: 0.95 } },
  // #337, the courtyard side of våning 3–4 (bofakta L1202–L1208 / L1205, 1:100 with the 0–5 m bar; x = metres from the
  // unit's west outer face, sill/head over that storey's floor): våning 3 is brick, flush with ours; våning 4 stands
  // `setback` behind it (its courtyard wall 9.21 m from the north wall vs våning 3's 11.11 m) with a roof terrace in
  // front (10–12 m² = ~2.0 m deep to the railing), skärmväggar h 1.8 between the units (bofakta). Heads 2.3 m,
  // `parapet`, `rail` (over the deck), `deck` and the core's `rise` are assumptions; the set-back wall is white render
  // (the illustration upstream architectural reference, not measured)
  // #350, the terraces per flat (exterior.js `husLTerraces`: a polygon + its flat id each; tools/terracetest.html checks
  // the areas). Heights over våning 4's structural floor y3: the deck's finished top `deck`, the parapet `parapet`; the
  // railing's top is `rail` over the FINISHED DECK (not parapet + rail). parapet, deck and rail are assumptions; the
  // terrace door's threshold sits on the deck. `screen` 1.8 = "Skärmvägg h= 1,8 m" drawn on each terrace's bofakta sheet
  // (L1201–L1209, L1205), on the boundaries between two terraces only (not at the gables, not at L1205's loft).
  // `areas` (m², the plan brochure pp. 34–37 / 44 and bofakta; S2): the std group 11, L1201 and L1209 12 (wider: the
  // gable), L1204 10 (its east end is the loft's wall, `core.loft.west`), L1205 10. On the sheets each terrace reaches
  // 1.99 m from the set-back wall to its drawn outer line (here: `setback` 1.9 to the parapet's outer face, the walls'
  // measured faces 11.13 − 9.25 m) and runs between the screens' centre lines / the gable / the loft's wall — so the
  // model's areas come out 0–6 % under the brochure's rounded figures; the outlines' exact edges are not dimensioned
  court: {
    setback: 1.9, parapet: 0.3, rail: 1.1, deck: 0.06, screen: 1.8,
    areas: { std: 11, L1201: 12, L1204: 10, L1205: 10, L1209: 12 },
    lower: [{ x0: 0.86, x1: 2.04, sill: 0.8, head: 2.3 }, { x0: 3.05, x1: 4.63, sill: 0.6, head: 2.3 }], // våning 3 (BH 0.8 / 0.6)
    upper: [{ x0: 0.66, x1: 1.64, sill: 1.2, head: 2.3 }, { x0: 3.05, x1: 4.03, sill: 0, head: 2.3 }],  // våning 4: window BH 1.2, terrace door
    // L1205 over the core (x from the core's west outer face): its west part, "Loft ovan hisstopp", is the brick section
    // breaking the terrace row (info brochure p. 16, upstream architectural reference: the principle only, no measures); the
    // terrace east of it. Våning 3 there: L1205's 6.55 m wide lower floor at the core's east end (BH 0.8 / 0.6, x from its
    // west face). #349: the loft's five measures, each on its own (bofakta-l1205.pdf 1:100, read at 600 dpi):
    core: {
      loft: {
        w: 3.0,      // SOURCED: the loft's east wall's outer face 3.00 m from the upper floor's west outer face
        west: 0.26,  // SOURCED (#350, bofakta-l1204.pdf): the loft's west wall bounds L1204's terrace 0.44 m thick, its
                     // face 0.26 m west of the core's west outer face (L1205's own sheet only draws the 0.2 m party wall)
        face: 0,     // SOURCED: m behind våning 3's courtyard face — 0 = flush (its wall's face 11.12 m from the north
                     // face, våning 3's 11.13 m)
        back: 1.5,   // GUESS: m of the raised part north of the set-back line. Not drawn: the plan only shows the loft
                     // room's north wall 1.18 m north of it (RH 1.56 m there), which says nothing of the roof above
        rise: 0.9,   // GUESS: its roof over the main roof. No section or façade; not derived from the loft's RH or BH
        win: { x0: 0.62, x1: 2.0, sill: 0.15, head: 2.3 }, // x0/x1 and BH 0.15 SOURCED; the head is a GUESS
      },
      upper: [{ x0: 3.29, x1: 4.26, sill: 1.2, head: 2.3 }, { x0: 5.67, x1: 6.65, sill: 0, head: 2.3 }],
      lowerW: 6.55, lower: [{ x0: 1.68, x1: 2.85, sill: 0.8, head: 2.3 }, { x0: 3.86, x1: 5.44, sill: 0.6, head: 2.3 }] },
    lit: 0.45, // share of the upper units' courtyard windows lit at night (window light, not measured)
  },
  // #347, the street (loftgång) side of the upper units L1201–L1209: their own openings, not L1007's. Measured on the
  // bofakta sheets (docs/peab/bostader/, 1:100, "1 cm = 1 meter (A4)"; 600 dpi, 236.2 px/m): x = metres from the flat's
  // west outer face as drawn (L1201: from its east outer face − 5.75, its gable is thicker; the same as `std` then),
  // `floor` = the FLAT's own floor (0 = its entrance floor on building storey `storey`, 1 = its upper floor on the
  // next storey) — not the building's storey number. `sill` = the sheet's BH. Heads are not on the sheets: `head` and
  // `doorHead` are guesses (as `court`'s 2.3). Types per flat: `types` (default `std`).
  street: {
    storey: 3, head: 2.3, doorHead: 2.3,
    std: [ // L1202/03/06/07/08 (bofakta-l1202-…-l1208.pdf), also L1201 (bofakta-l1201.pdf, same from its east face) and L1204
      { floor: 0, door: true, x0: 0.87, x1: 1.74 }, { floor: 0, x0: 3.07, x1: 4.64, sill: 0.7 },  // entrance, kitchen
      { floor: 1, x0: 0.81, x1: 2.38, sill: 0.7 }, { floor: 1, x0: 3.35, x1: 4.53, sill: 0.7 }], // Sovrum 1, Sovrum 2
    L1209: [ // bofakta-l1209.pdf: the entrance floor's door and window sit 0.23 m further east than std's
      { floor: 0, door: true, x0: 1.10, x1: 1.98 }, { floor: 0, x0: 3.30, x1: 4.87, sill: 0.7 },
      { floor: 1, x0: 0.81, x1: 2.38, sill: 0.7 }, { floor: 1, x0: 3.35, x1: 4.53, sill: 0.7 }], // the second one a "ljudruta"
    // L1205 over the core (bofakta-l1205.pdf): its entrance floor is a 5.75 m wide north part at the core's east end
    // (x from the core's EAST outer face − 5.75, as drawn), entered from the stair core through its west wall (not seen
    // from the street); the rest of våning 3 there is the stair core (render, no openings: no drawing). Its upper floor
    // spans the core (x from the core's west outer face, like `court.core.upper`)
    L1205: [{ floor: 0, x0: 1.03, x1: 2.20, sill: 0.8, east: true }, { floor: 0, x0: 2.96, x1: 4.54, sill: 0.7, east: true },
      { floor: 1, x0: 1.02, x1: 2.20, sill: 0.7 }, { floor: 1, x0: 3.44, x1: 5.01, sill: 0.7 }, { floor: 1, x0: 5.98, x1: 7.15, sill: 0.7 }],
  },
  // spiral stairs in brick drums at both ends (våning 1/3 plans): centre, radius
  // (#42: the east one, L1008's escape stair, stands right against the house, per the user; #172: so does
  // the west one, against the west gable — `gable: 'west'` = its x is worked out in exterior.js, gable − r)
  // `door` / `gap`: the plan angle (deg from +x towards +z) and width (deg) of the drum's open doorway above the
  // loftgång / the east landing (#444; as the drum walls' opening in roofs.js' walk data, exterior.js)
  towers: [{ gable: 'west', z: 1.5, r: 1.6, door: -25, gap: 55 }, { x: 10.0, z: -2.0, r: 1.6, door: 90, gap: 96 }], // centres per våning 1 (#252)
  // the spiral stair inside each drum (#444, visual only, not walkable): *guess* — there is no stair drawing. A steel
  // column, wedge treads `turn`° each (~`rise` m, evened out to the loftgång's floor) round it up to a top landing
  // (`landing`° of the circle round `door`, a `slab` thick) with a guard on its open edge, a handrail `wall` m in
  // from the drum along its wall, a floor at the bottom. Painted like the loftgång railing. `overlap` < 0: open gaps
  // between the treads, so the turn below shows through and it reads as a stair from above.
  spiral: { column: 0.075, rise: 0.185, turn: 30, tread: 0.05, overlap: -6, wall: 0.04, landing: 110, slab: 0.2,
    handrail: { h: 0.9, r: 0.022 } },
  // L1008 (the east end unit, our neighbour on the left seen from the street) is not a copy of ours
  // (#42, plan p. 43): no window beside the front door (its kitchen window is on the gable), and
  // upstairs no window where the escape stair stands. Façade openings whose centre x (unit
  // coordinates) lies in these ranges are left out on its north façade.
  endUnitNorthHidden: [[3.0, 4.7]],
  // #351, every gable opening tagged with its gable, the BUILDING storey (1–4) and the flat (its type): z = plan z (m from
  // the north face of våning 1–2), sill = the sheet's BH over that storey's floor. Read on the bofakta sheets (1:100,
  // 600 dpi, docs/peab/bostader/): L1008 bofakta-l1008.pdf, L1001 bofakta-l1001.pdf, L1209 bofakta-l1209.pdf (its z from
  // its courtyard face, flush with våning 1–3's at D: the sheet's 11.12 m deep entrance floor — it lands right over
  // L1008's). L1201 (bofakta-l1201.pdf) and L1008 / L1001 / L1201 / L1209's upper floors have NO gable openings. Heads
  // are not on the sheets: guesses. No flat in Hus L is mirrored (all four end sheets: the entrance at the west end of
  // the street side, the stair at the east, like L1007), so `gable` is simply the side the flat ends on.
  gableWindows: [
    { gable: 'east', storey: 1, flat: 'L1008', z0: 2.71, z1: 4.47, sill: 0.7, head: 2.6 },  // Kök/matplats
    { gable: 'east', storey: 1, flat: 'L1008', z0: 8.27, z1: 10.03, sill: 0.7, head: 2.6 }, // Vardagsrum
    { gable: 'east', storey: 2, flat: 'L1008', z0: 2.71, z1: 4.47, sill: 0.6, head: 2.25 }, // Sovrum 1 ("Ljudruta")
    { gable: 'west', storey: 1, flat: 'L1001', z0: 8.03, z1: 9.79, sill: 0.8, head: 2.6 },  // Vardagsrum
    { gable: 'east', storey: 3, flat: 'L1209', z0: 2.69, z1: 4.45, sill: 0.7, head: 2.3 },  // Kök/matplats
    { gable: 'east', storey: 3, flat: 'L1209', z0: 8.24, z1: 10.0, sill: 0.7, head: 2.3 },  // Vardagsrum
  ],
  // solar panel fields on the roof (situation plan): x ranges × rows of z ranges
  solar: { x: [[-39.96, -25.77], [-24.13, -6.37], [-4.83, 9.56]], z: [[3.5, 4.5], [5.4, 6.4], [7.4, 8.4], [9.4, 10.4]],
    // Peab's renders show the panels tilted slightly up towards the sun. Tilt about the panel's long (x) axis,
    // the north (-z) edge raised so the face looks south; all three values are assumptions (*guess*): no source measures them.
    tilt: 10,          // degrees above horizontal (*guess*)
    thickness: 0.05,   // panel slab thickness, m (*guess*; was a 0.07 flat box)
    lift: 0.04,        // lowest edge (south) above the roof capping, m (*guess*: mounting rail)
  },
};

export const SEASON = {
  snowMonths: [12, 1, 2],
  // month → [hue, sat, light, leaves]   (spring light yellow-green, summer deep green, autumn mixed)
  trees: {
    1: [0.08, 0.2, 0.22, 0], 2: [0.08, 0.2, 0.22, 0], 3: [0.22, 0.45, 0.42, 0.45], 4: [0.24, 0.55, 0.45, 0.85],
    5: [0.25, 0.55, 0.38, 1], 6: [0.28, 0.5, 0.3, 1], 7: [0.29, 0.5, 0.27, 1], 8: [0.27, 0.45, 0.28, 1],
    9: [0.2, 0.5, 0.32, 1], 10: [0.09, 0.65, 0.38, 0.95], 11: [0.06, 0.45, 0.3, 0.45], 12: [0.08, 0.2, 0.22, 0],
  },
  blossomMonths: [4, 5], // some trees flower white/pink
  snow: { ground: 0xeef3f7, roof: 0xf4f7fa, hedge: 0xdfe8ec, paving: 0xe6ebee },
};

export const FOLIAGE = {
  atlas: 512, atlasPhone: 256,
  cards: { tree: [20, 18], shrub: [14, 10], far: [8, 5] }, coreDetail: { tree: 0, shrub: 0, far: 0 }, coreHoles: 220,
  core: 0.42, lump: 0.18, coreJitter: 0.45, coreShade: 0.95, shell: [0.45, 0.85], size: 0.72, tilt: 0.6, jitter: 0.35,
  ao: 0.45, bright: 1.22, leafLight: [0.62, 1.0], coreGround: 0.45, alphaTest: 0.4,
  trunk: { base: 0.2, top: 0.1, sides: 5, branches: 3, forks: 2, from: 0.5, reach: 0.95, rise: 0.3, color: 0x8a735f, birchColor: 0xf2efe8 },
  bark: 64,
  // upstream #1083: a crown standing near an Å-hus (SITE.blocks) is narrowed so its leaf cards stay `wallClearance` m outside
  // the façade instead of poking through the brick and windows (a pruned crown; *guess*, by eye — no measurement)
  wallClearance: 0.2,
  // #56 (upstream #1246): the site's tree batches (trunks, birches, crowns) are split into square cells of this side (m, *guess*: ~5 cells
  // across the site, so a view drops the cells behind it while a cell stays big enough to keep draw calls modest), each its
  // own InstancedMesh with its own bounding sphere, so frustum culling skips whole groups of trees instead of drawing all ~1500
  // crowns and ~1200 trunks from every spot.
  cell: 130,
};

export const FENCE_HEIGHT = 1.8;

export const CABINET_FIXES = [
  { level: 0, label: 'EL', z1: 0.465 + 0.4 },
];

export const CABINET_HEIGHT = {
  EL: 2.1, G: 2.1, L: 2.1, 'U/M': 2.1, K: 2.1, F: 2.1,
  TT: 0.85, TM: 0.85, DM: 0.9,
  A: 2.1, LH: 1.9, // L1201 (#573): the ventilation unit's cupboard, linen shelving (heights *guess*)
};

export const WARDROBE = {
  carcass: 0.02, plinth: 0.08, panel: 0.02, firstTrack: 0.015, trackSpacing: 0.025,
  overlap: 0.04, edgeGap: 0.002, sealWidth: 0.008, sealGap: 0.001, railLip: 0.012,
};

export const BASE_CABINET = 0.9;

export const TOILET = {
width: 0.355,
depth: 0.65,
seatHeight: 0.42,
tankHeight: 0.84,
tankDepth: 0.17,
bowl: {
    profile: [[0.015, 1.03, 0], [-0.012, 0.99, 0], [-0.04, 0.93, -0.005], [-0.08, 0.8, -0.015], [-0.12, 0.62, -0.03],
      [-0.15, 0.49, -0.045], [-0.19, 0.35, -0.06], [-0.23, 0.23, -0.07], [-0.26, 0.12, -0.075], [-0.275, 0, -0.075]],
    waterDy: -0.115, water: 0x3fa7d6,
  }
};

export const SHELF_HEIGHT = 2.0;

export const KLK = {
level: 1,
x0: 3.90,
x1: 5.55,
z0: 4.28,
z1: 5.48,
side: 1,
shelf: { y: 1.95, d: 0.30, t: 0.022 },
rail: { y: 1.78, out: 0.28, z0: 4.32, z1: 5.22, r: 0.0125 },
standards: { side: [4.45, 5.10], back: [4.02, 4.98], y0: 0.95, y1: 2.25, w: 0.026, d: 0.014 }
};

export const CLEANING = {
shelf: { x0: 3.87, x1: 4.63, z: 5.704, d: 0.30, t: 0.02, ys: [0.72, 1.12, 1.52, 1.92], standards: [3.95, 4.50], solid: [4.10, 0.2] },
rail: { x: 5.551, z0: 5.80, z1: 6.32, y: 1.30 }
};

export const OUTDOOR = { x0: -78.5, x1: 27.5, z0: -14, z1: 64 };

// Upstream #1236, downstream #60: the visitor may walk well beyond the block, down to Höje å (over the two bridges), among the
// school buildings to the clock tower and out to the mapped edge of the surroundings. `WALK` is the outer edge of that area
// (world.js: the perimeter wall, also at every height for the roofs); OUTDOOR stays the home block. Bounds are a choice (*guess*).
// `cell` m: bucket edge for the far collision (src/farwalk.js). `wade` m: how far from the water's edge the shallow bank already
// stops the visitor (the bed is at SITE.bridges.bedY). `rescue` m: where a visitor who still ends up in the river is put back,
// from the water's edge (*guess*). `maxSlope` rise/run: steeper ground holds the visitor back (the banks stay under it).
// `trunk`: half-width of a tree trunk's collision diamond by kind (*guess*, the drawn trunks are thinner than a body).
// #1278 (original; #67 here): the east campus' OSM parking polygons (SITE.east.access entries with a `capacity`) get marked stalls and an edge strip,
// laid out by src/parkinglayout.js along the OSM service ways that run inside a polygon, on both sides, square to the aisle. Every number is a *guess*
// (a typical Swedish car park: stalls 2.5 x 5.0 m); the stall count is whatever fits, not the polygon's guessed `capacity`. No parked cars downstream.
export const PARKING_LOT = {
  bayW: 2.5, bayD: 5.0,    // m: a stall along the aisle x across it (*guess*)
  edgeClear: 0.3,          // m: stalls keep this far inside the polygon's edge and out of any other road (*guess*)
  lineW: 0.1, lineColor: 0xeeeeea,  // marked stall lines (*guess*)
  kerbW: 0.3, kerbColor: 0xb0aba2,  // flat concrete edge strip along the polygon, left out across road mouths and at buildings (*guess*)
  mesh: 100,               // m: longest triangle edge of the asphalt before it is cut along the terrain mesh's own grid lines and diagonals (#1309, sitebackdrop.js cutAtTerrain), which is what makes it follow the sloping ground behind HepCat (z -19 to 17 falls 1.7 m) without gaps; the cuts keep the triangle count low (was 3.0 m sampled only at corners)
  lift: { asphalt: 0.02, kerb: 0.035, line: 0.045 }, // m over the terrain: under the roads' own 0.025 so the aisles stay on top, lines/edge over both
};
// #68 (original #1294): every mapped building inside WALK has a walkable roof (src/buildingroofs.js), made from the backdrop's own records: the drawn roof's
// height where the builder gives it (`roofY`), else flat at the eave + `flatLift` (*guess*). `wallStep` m: spacing of the samples that set a wall's
// height along a gable end (*guess*); `wallLift` m: the wall's top over the roof line; `depth` m: the walls reach this far under y 0.
export const BUILDING_ROOFS = { flatLift: 0.05, wallStep: 4, wallLift: 0.05, depth: 10 };
// #1305: the terrain outside the built block follows data/elevation.json's bare-earth grid (src/elevation.js). The weight is 0 inside
// `protect` (a rectangle round Hus A/B/C/L, the courtyard, the garage box and Karpvägen / Sankt Lars väg's designed profiles: today's
// levels, y 0 = courtyard), rises smoothly to 1 over `ramp` m, drops to 0 again within `river` [clear, ramp] m of Höje å (#1285's
// valley depth is kept: the DSM mixes water and bank in a 30 m cell) and over `edge` m towards the mesh's x edges and its south edge
// (the flat -3.01 planes beyond). All *guess* tunables; roads, paths, tree feet and the backdrop buildings sample the terrain themselves.
/** #1311: where the terrain mesh gets coarser (triangle budget, perfcount big hall): columns outside x colWest..colEast are 12 m instead of 4 m (the river
 * corridor reaches x ~204 + its refine radius 28, so the east stays fine to colEast), rows further than rowNear north of `terrainNorth` are 10 m instead of 5 m. *guess* */
export const TERRAIN_FAR = { colWest: -150, colEast: 235, rowNear: 60 };
export const ELEVATION = { protect: { x0: -86, x1: 46, z0: -36, z1: 72 }, ramp: 30, river: [32, 30], edge: 30,
  pad: 10, padRamp: 8, padMin: 0.4 }; // #1306: far buildings stand on a level pad (the ground's mean under them) that grades back over `pad` m, unless the ground under the footprint varies by less than `padMin` m (*guess*)
export const WALK = { x0: -260, x1: 320, z0: -200, z1: 250, cell: 40, wade: 2, rescue: 3, maxSlope: 1.2,
  trunk: { big: 0.45, tree: 0.3, birch: 0.2, young: 0.15 } };

export const GARAGE = {
  floor: -3,          // = SITE.terrain.park: the drive is level with the door (#346)
  parkDoorMaterial: { color: 0x7d858b, roughness: .7 }, // *guess*: existing steel colour, daylight-lit park leaves (#729)
  // A/B exterior glazing requested; rail/pane sizes and tint are visual guesses (#43).
  parkDoorGlass: { stile: .12, rail: .08, bottom: .16, thickness: .012, color: 0x9fb4bf, opacity: .35, roughness: .05, metalness: .3 },
  floorLift: .003, // existing visible floor offset, *guess*: shared by the park thresholds (#729)
  doorClearance: .25, // #523: assumed extra side clearance at actual basement doorways
  doorHead: 2.1, // ASSUMPTION: existing basement lintel height; shared with the A/B brick openings.
  // #977: Basement & garage door details and hardware (steel doors and storage cages).
  // Dimensions and offsets are visual assumptions (*guess*) based on Swedish standard commercial/basement
  // steel doors (Daloc / Robust) and wire mesh storage partitions (Troax).
  doorDetails: {
    frameWidth: 0.045,       // *guess*: steel frame casing width lining doorway opening
    frameCasingProud: 0.012, // *guess*: frame architrave casing proud of wall face
    thresholdHeight: 0.018,  // *guess*: low steel threshold height at floor
    leafThickness: 0.05,     // steel door leaf thickness (Daloc S30/S33)
    handleHeight: 1.05,      // standard Swedish door handle height
    handleBackset: 0.08,     // distance from strike edge to handle center
    escutcheon: [0.055, 0.22, 0.006], // [width, height, projection] satin steel backplate
    cylinder: [0.03, 0.012],         // [diameter, projection] lock cylinder / thumb turn housing
    lever: [0.125, 0.018, 0.018],    // [length, height, depth] L-shaped lever handle
    leverNeck: 0.035,                 // projection of handle neck from plate
    hinges: { count: 3, height: 0.09, positions: [0.25, 1.05, 1.85] },
    colors: {
      leaf: 0x7d858b,
      frame: 0x54585c,
      plate: 0xc8ccd0,
      lever: 0xdde0e4,
      cylinder: 0x36393c,
      hinge: 0x5a5f64,
    },
    cage: {
      haspPlate: [0.05, 0.14, 0.008],
      haspLoop: [0.02, 0.035, 0.035],
      pullHandle: [0.016, 0.13, 0.045],
      hinges: { count: 2, height: 0.08, positions: [0.35, 1.75] },
    },
  },
  ceiling: -0.35,     // ASSUMPTION: the deck + the courtyard's soil over it; 2.65 m clear (the door is 2.6)
  // DRAWING: each walkable rectangle → [room name, sensor area]. The entrance hall south of Hus C's rooms (INFART GARAGE),
  // open north-east into the big hall (BILPARKERING / CYKELPARKERING) under the courtyard, which runs east between Hus
  // L's basement and Hus B / Hus A to x 8.9 (past L1007); Hus L's basement: its north rooms (CYKEL, EL, the stair + lift
  // core, CYKEL, LGHFÖRRÅD) and its south band (CYKEL, the two corridors with bike racks); the MILJÖRUM under Hus C.
  rects: [
    { id: 'doorway', x0: -70.5, x1: -69.95, z0: 41, z1: 47, room: 'Garage', area: 'entrance' }, // terrain.garageDoor's opening through the 0.55 m wall
    // (the east wall: the plan's inner face is x −41.61, the model's Hus B west façade −41.7 (SITE.blocks): kept just inside it)
    { id: 'entrance', x0: -69.95, x1: -41.8, z0: 34.52, z1: 51.8, room: 'Garage', area: 'entrance' },
    { id: 'hallW', x0: -51.4, x1: -9.38, z0: 12.62, z1: 33.16, room: 'Garage', area: 'hallW' },
    { id: 'link', x0: -51.4, x1: -41.8, z0: 33.16, z1: 34.52, room: 'Garage', area: 'hallW' }, // the turn: the entrance hall opens into the big hall
    { id: 'hallE', x0: -9.38, x1: 8.92, z0: 12.62, z1: 28.76, room: 'Garage', area: 'hallE' },
    { id: 'miljo', x0: -69.95, x1: -62.75, z0: 28.55, z1: 34.01, room: 'Miljörum', area: 'entrance' },
    { id: 'miljoDoor', x0: -64.95, x1: -64.05, z0: 34.01, z1: 34.52, room: 'Miljörum', area: 'entrance', door: { kind: 'steel', hinge: 'x0', open: -1, name: 'dörren till miljörummet' } },
    { id: 'bandW', x0: -35.6, x1: -19.25, z0: 7.79, z1: 12.11, room: 'Cykelförråd', area: 'basementW' },
    { id: 'bikeN', x0: -35.6, x1: -19.25, z0: 2.67, z1: 7.5, room: 'Cykelförråd', area: 'basementW' },
    { id: 'bikeNW', x0: -35.6, x1: -24.8, z0: 0.47, z1: 2.67, room: 'Cykelförråd', area: 'basementW' },
    { id: 'bikeGap', x0: -33.6, x1: -32.4, z0: 7.5, z1: 7.79, room: 'Cykelförråd', area: 'basementW' },
    { id: 'el', x0: -24.46, x1: -19.25, z0: 0.47, z1: 2.33, room: 'Elrum', area: 'basementW' },
    { id: 'elDoor', x0: -24.0, x1: -23.1, z0: 2.33, z1: 2.67, room: 'Elrum', area: 'basementW', door: { kind: 'steel', hinge: 'x0', open: 1, name: 'dörren till elrummet' } },
    { id: 'core', x0: -18.95, x1: -16.62, z0: 4.42, z1: 9.58, room: 'Hisshall', area: 'basementW' }, // the stair + lift core (#456: its cross wall north, the lift wall south): its walls, stair and lift are core.js's (#415, CORE)
    { id: 'coreW', x0: -19.25, x1: -18.95, z0: 7.95, z1: 8.85, room: 'Hisshall', area: 'basementW' },
    { id: 'coreE', x0: -16.62, x1: -16.33, z0: 7.95, z1: 8.85, room: 'Hisshall', area: 'basementW' },
    { id: 'bandE', x0: -16.33, x1: 11.12, z0: 7.79, z1: 12.11, room: 'Cykelförråd', area: 'basementE' },
    { id: 'bikeNE', x0: -16.33, x1: -11.08, z0: 0.47, z1: 7.5, room: 'Cykelförråd', area: 'basementE' },
    { id: 'bikeNEDoor', x0: -15.45, x1: -14.55, z0: 7.5, z1: 7.79, room: 'Cykelförråd', area: 'basementE', door: {kind:'steel',hinge:'x0',open:-1,name:'dörren till östra cykelrummet'} },
    { id: 'forrad', x0: -10.78, x1: 11.12, z0: 0.47, z1: 7.5, room: 'Hyrförråd', area: 'basementE' }, // LGHFÖRRÅD: "15 extra lägenhetsförråd"
    { id: 'forradDoor', x0: -0.98, x1: -0.08, z0: 7.5, z1: 7.79, room: 'Hyrförråd', area: 'basementE', door: {kind:'steel',hinge:'x0',open:1,name:'dörren till hyrförråden'} },
    { id: 'garageDoorL', x0: -15.45, x1: -14.55, z0: 12.11, z1: 12.62, room: 'Garage', area: 'hallW', door: { kind: 'steel', hinge: 'x0', open: 1, name: 'dörren till källaren' } }, // from the basement out into the garage
    // Unlabelled utility cells have no inferred function; the drawing shows no UC access.
    {id:'roomCN',x0:-62.3,x1:-60.55,z0:13.05,z1:15.1,room:'Källarrum C',area:'entrance'},
    {id:'roomCNDoor',x0:-62.1,x1:-61.1,z0:15.1,z1:15.5,room:'Källarrum C',area:'entrance',door:{kind:'steel',hinge:'x0',open:-1,name:'dörren till nordligaste källarrummet C'}},
    {id:'roomCAnnexS',x0:-64.5,x1:-62.8,z0:17.25,z1:18.75,room:'Källarrum C',area:'entrance'},
    {id:'roomCAnnexSDoor',x0:-62.8,x1:-62.3,z0:17.5,z1:18.5,room:'Källarrum C',area:'entrance',door:{kind:'steel',hinge:'x0',open:-1,name:'dörren till källarrummets sidocell C'}},
    // #638: Hus B's stair core (CORE_B, src/corehouse.js) is the `core` rect: its band (hall + stair + lift) is drawn / walled there; the
    // thin rects are the openings in the hall's west wall (x −33.38 … −33.08) towards the passages (as Hus A's coreA*; re-read on vaning-m1)
    // #729 DRAWING: B's east corridor on p46, towards its exterior park door (±0.15 m).
    // The core-wall bridge is restricted to the flat landing north of stair.top; its 0.9 m clear width is *guess*.
    {id:'coreBPark',x0:-31.16,x1:-30.86,z0:46.1,z1:47.0,room:'Trapphus B',area:'hallW'},
    {id:'passageBEast',x0:-30.86,x1:-23.6,z0:46.1,z1:47.9,room:'Trapphus B',area:'hallW'},
    {id:'parkBRecess',x0:-23.52,x1:-22.6,z0:46.1,z1:48.1,room:'Trapphus B',area:'hallW',outside:'e'},
    {id:'parkBSide',x0:-23.6,x1:-23.52,z0:46.10,z1:46.80,room:'Trapphus B',area:'hallW'},
    {id:'parkBDoor',x0:-23.6,x1:-23.52,z0:46.8,z1:47.85,room:'Trapphus B',area:'hallW',door:{kind:'steel',hinge:'x0',open:1,line:-23.6,park:true,name:'källardörren till hus B'}},
    {id:'coreB',x0:-33.08,x1:-31.16,z0:41.74,z1:50,room:'Trapphus B',area:'hallW',core:true},
    {id:'coreBWest',x0:-33.6,x1:-33.08,z0:41.8,z1:43.4,room:'Trapphus B',area:'hallW'},
    {id:'coreBSouth',x0:-33.6,x1:-33.08,z0:44.9,z1:45.9,room:'Trapphus B',area:'hallW'},
    // #729 DRAWING: west corridor's wider end around the actual p46 leaf z42.25..43.30.
    // Existing recess setback, finish/head and outward swing are *guess*, not construction details.
    {id:'passageAWestEnd',x0:-9.05,x1:-6.8,z0:42.75,z1:44.1,room:'Trapphus A',area:'hallE'},
    {id:'passageAWestWing',x0:-6.8,x1:-1.37,z0:42.75,z1:43.4,room:'Trapphus A',area:'hallE'},
    {id:'parkARecess',x0:-9.76,x1:-9.12,z0:41.4,z1:43.4,room:'Trapphus A',area:'hallE',outside:'w'},
    {id:'parkASide',x0:-9.12,x1:-9.05,z0:41.46,z1:42.25,room:'Trapphus A',area:'hallE'},
    {id:'parkADoor',x0:-9.12,x1:-9.05,z0:42.25,z1:43.30,room:'Trapphus A',area:'hallE',door:{kind:'steel',hinge:'x0',open:-1,line:-9.01,park:true,name:'källardörren till hus A'}},
    {id:'passageAWest',x0:-9.05,x1:-1.37,z0:41.4,z1:42.75,room:'Trapphus A',area:'hallE'},
    // #637: Hus A's stair core (CORE_A, src/corehouse.js) is the `core` rect: its band (hall + stair) is drawn / walled there; the
    // thin rects are its openings on this storey (west towards the passage, east onto the lobby), as Hus L's coreW / coreE
    {id:'coreA',x0:-1.05,x1:.8,z0:37.3,z1:45.5,room:'Trapphus A',area:'hallE',core:true},
    {id:'coreAWest',x0:-1.37,x1:-1.05,z0:41.4,z1:42.75,room:'Trapphus A',area:'hallE'},
    {id:'coreAEast',x0:.8,x1:1.13,z0:37.3,z1:40.1,room:'Trapphus A',area:'hallE'},
    // #523: room interior faces and openings read from p46 (graphic accuracy about 0.15 m); see validation.
    {id: 'bikeFarNW',x0: -41.45,x1: -35.9,z0: 0.47,z1: 7.5,room: 'Cykelförråd',area: 'basementW'},
    {id: 'bikeFarNWDoor',x0: -40.72,x1: -39.65,z0: 7.5,z1: 7.79,room: 'Cykelförråd',area: 'basementW',door: {kind: 'steel',hinge: 'x0',open: 1,name: 'dörren till västra cykelrummet'}},
    {id: 'bandFarW',x0: -41.45,x1: -35.6,z0: 7.79,z1: 12.11,room: 'Källarpassage',area: 'basementW'},
    {id: 'bikeStorageGap',x0: -11.08,x1: -10.78,z0: 3.2,z1: 4.8,room: 'Hyrförråd',area: 'basementE'},
    {id: 'hallCNiche',x0: -53.4,x1: -51.4,z0: 21.3,z1: 25,room: 'Garage',area: 'hallW'},
    // #639: Hus C's stair core (CORE_C, src/corehouse.js): the corridor (m1: inner faces x −62.32 … −60.42) is split into the part north of
    // the hall, the `core` rect (the hall + stair + lift lobby, z 20.12 … 30.54) and the dead end south of the stair's wall
    {id: 'passageCN',x0: -62.34,x1: -60.44,z0: 15.5,z1: 20.12,room: 'Trapphus C',area: 'entrance'},
    {id: 'coreC',x0: -62.34,x1: -60.44,z0: 20.12,z1: 30.54,room: 'Trapphus C',area: 'entrance',core: true},
    {id: 'coreCSouth',x0: -62.34,x1: -60.44,z0: 30.54,z1: 30.88,room: 'Trapphus C',area: 'entrance'}, // #654: the opening in the stair's south wall on −1 (CORE_C.lane)
    {id: 'passageCS',x0: -62.34,x1: -60.44,z0: 30.88,z1: 34.01,room: 'Trapphus C',area: 'entrance'},
    {id: 'entryC',x0: -62.1,x1: -61.1,z0: 34.01,z1: 34.52,room: 'Trapphus C',area: 'entrance',door: {kind: 'steel',hinge: 'x0',open: 1,name: 'dörren till trapphus C'}},
    {id: 'passageCE',x0: -60.44,x1: -53.9,z0: 23.44,z1: 24.6,room: 'Trapphus C',area: 'entrance'},
    {id: 'entryCE',x0: -53.9,x1: -53.4,z0: 23.4,z1: 24.4,room: 'Trapphus C',area: 'entrance',door: {kind: 'steel',hinge: 'x0',open: -1,name: 'dörren till hisshallen C'}},
    {id: 'storeCNW',x0: -69.9,x1: -64.8,z0: 17.25,z1: 24.3,room: 'Förråd C',area: 'entrance'},
    {id: 'storeCNWWing',x0: -64.8,x1: -62.8,z0: 19.05,z1: 22.95,room: 'Förråd C',area: 'entrance'},
    {id: 'storeCNWDoor',x0: -62.8,x1: -62.3,z0: 20.05,z1: 21.05,room: 'Förråd C',area: 'entrance',door: {kind: 'steel',hinge: 'x0',open: -1,name: 'dörren till förråd C väst'}},
    {id: 'roomCW',x0: -69.9,x1: -62.8,z0: 24.65,z1: 28.25,room: 'Källarrum C',area: 'entrance'},
    {id: 'roomCWDoor',x0: -62.8,x1: -62.3,z0: 24.9,z1: 25.9,room: 'Källarrum C',area: 'entrance',door: {kind: 'steel',hinge: 'x0',open: -1,name: 'dörren till källarrummet C'}},
    {id: 'roomCWJoin',x0: -67.85,x1: -66.85,z0: 24.3,z1: 24.65,room: 'Källarrum C',area: 'entrance',door: {kind: 'steel',hinge: 'x0',open: 1,name: 'dörren mellan källarrummen C'}},
    {id: 'storeCNETop',x0: -60.2,x1: -51.95,z0: 13.05,z1: 16.95,room: 'Förråd C',area: 'entrance'},
    {id: 'storeCNEAlcove',x0: -60.2,x1: -58.55,z0: 16.95,z1: 19,room: 'Förråd C',area: 'entrance'},
    {id: 'storeCNE',x0: -58.55,x1: -51.95,z0: 17.25,z1: 21.1,room: 'Förråd C',area: 'entrance'},
    {id: 'storeCNEWing',x0: -60.2,x1: -57.65,z0: 19.35,z1: 23,room: 'Förråd C',area: 'entrance'},
    {id: 'storeCNEJoin',x0: -56.6,x1: -55.15,z0: 16.95,z1: 17.25,room: 'Förråd C',area: 'entrance'},
    {id: 'storeCNETopDoor',x0: -60.55,x1: -60.2,z0: 15.6,z1: 16.6,room: 'Förråd C',area: 'entrance',door: {kind: 'steel',hinge: 'x0',open: 1,name: 'dörren till förråd C norr'}},
    {id: 'storeCNEDoor',x0: -60.55,x1: -60.2,z0: 20.05,z1: 21.05,room: 'Förråd C',area: 'entrance',door: {kind: 'steel',hinge: 'x0',open: 1,name: 'dörren till förråd C öst'}},
    {id: 'elC',x0: -57.35,x1: -53.55,z0: 21.4,z1: 23,room: 'Elrum C',area: 'entrance'},
    {id: 'elCDoor',x0: -56.1,x1: -55.1,z0: 23,z1: 23.3,room: 'Elrum C',area: 'entrance',door: {kind: 'steel',hinge: 'x0',open: -1,name: 'dörren till elrum C'}},
    {id: 'storeCSE',x0: -60.2,x1: -51.95,z0: 25,z1: 34.01,room: 'Förråd C',area: 'entrance'},
    {id: 'storeCSEDoor',x0: -54.7,x1: -53.7,z0: 24.6,z1: 25,room: 'Förråd C',area: 'entrance',door: {kind: 'steel',hinge: 'x0',open: 1,name: 'dörren till förråd C söder'}},
    {id: 'storeCSEOutsideDoor',x0: -56.7,x1: -55.7,z0: 34.01,z1: 34.52,room: 'Förråd C',area: 'entrance',door: {kind: 'steel',hinge: 'x0',open: 1,name: 'dörren från garaget till förråd C'}},
    {id: 'utilityC',x0: -69.9,x1: -64.8,z0: 13.05,z1: 16.95,room: 'Undercentral C',area: 'entrance'},
    {id: 'utilityCAnnex',x0: -64.5,x1: -62.8,z0: 13.05,z1: 16.95,room: 'Källarrum C',area: 'entrance'},
    {id: 'utilityCDoor',x0: -62.8,x1: -62.3,z0: 15.6,z1: 16.6,room: 'Källarrum C',area: 'entrance',door: {kind: 'steel',hinge: 'x0',open: -1,name: 'dörren till norra källarrummet C'}},
    {id: 'entryB',x0: -34.5,x1: -33.45,z0: 33.16,z1: 33.7,room: 'Trapphus B',area: 'hallW',door: {kind: 'steel',hinge: 'x0',open: 1,name: 'dörren till trapphus B'}},
    {id: 'passageBN',x0: -34.8,x1: -32.4,z0: 33.7,z1: 38.45,room: 'Trapphus B',area: 'hallW'},
    {id: 'passageBMid',x0: -34.8,x1: -33.6,z0: 38.45,z1: 43.45,room: 'Trapphus B',area: 'hallW'},
    {id: 'passageBS',x0: -35.35,x1: -33.6,z0: 43.8,z1: 45.8,room: 'Trapphus B',area: 'hallW'},
    {id: 'passageBJoin',x0: -34.6,x1: -33.6,z0: 43.45,z1: 43.8,room: 'Trapphus B',area: 'hallW',door: {kind: 'steel',hinge: 'x0',open: 1,name: 'dörren till södra hisshallen B'}},
    {id: 'passageBEnd',x0: -35,x1: -33.6,z0: 45.8,z1: 47.55,room: 'Trapphus B',area: 'hallW'},
    {id: 'storeBNW',x0: -41.08,x1: -35.1,z0: 33.7,z1: 40.5,room: 'Förråd B',area: 'hallW'},
    {id: 'storeBNWWing',x0: -37.6,x1: -35.1,z0: 40.5,z1: 43.45,room: 'Förråd B',area: 'hallW'},
    {id: 'storeBNWDoor',x0: -35.1,x1: -34.8,z0: 37.05,z1: 38.05,room: 'Förråd B',area: 'hallW',door: {kind: 'steel',hinge: 'x0',open: -1,name: 'dörren till förråd B väst'}},
    {id: 'storeBNE',x0: -31.9,x1: -26.3,z0: 33.7,z1: 36.05,room: 'Förråd B',area: 'hallW'},
    {id: 'storeBNEWing',x0: -31.9,x1: -28.35,z0: 36.05,z1: 38.45,room: 'Förråd B',area: 'hallW'},
    {id: 'storeBNEDoor',x0: -32.4,x1: -31.9,z0: 35.35,z1: 36.35,room: 'Förråd B',area: 'hallW',door: {kind: 'steel',hinge: 'x0',open: 1,name: 'dörren till förråd B öst'}},
    {id: 'elB',x0: -41.08,x1: -37.9,z0: 40.8,z1: 42.6,room: 'Elrum B',area: 'hallW'},
    {id: 'elBDoor',x0: -37.9,x1: -37.6,z0: 41.25,z1: 42.25,room: 'Elrum B',area: 'hallW',door: {kind: 'steel',hinge: 'x0',open: -1,name: 'dörren till elrum B'}},
    {id: 'storeBSW',x0: -41.08,x1: -35.75,z0: 43.8,z1: 47.55,room: 'Förråd B',area: 'hallW'},
    {id: 'storeBSWWing',x0: -41.08,x1: -37.85,z0: 47.55,z1: 50.3,room: 'Förråd B',area: 'hallW'},
    {id: 'storeBSWDoor',x0: -35.75,x1: -35.35,z0: 44.55,z1: 45.55,room: 'Förråd B',area: 'hallW',door: {kind: 'steel',hinge: 'x0',open: -1,name: 'dörren till förråd B söder'}},
    {id: 'entryA',x0: 1.3,x1: 2.35,z0: 28.76,z1: 29.3,room: 'Trapphus A',area: 'hallE',door: {kind: 'steel',hinge: 'x0',open: 1,name: 'dörren till trapphus A'}},
    {id: 'passageAN',x0: 0.02,x1: 2.5,z0: 29.3,z1: 34,room: 'Trapphus A',area: 'hallE'}, // #637: re-read on vaning-m1 — the corridor ends at the lift shaft's north wall (z 34)
    {id: 'passageAMid',x0: 1.13,x1: 2.5,z0: 34,z1: 37.3,room: 'Trapphus A',area: 'hallE'}, // … beside the shaft (its east wall x 0.8 … 1.13)
    {id: 'passageAS',x0: 1.13,x1: 2.5,z0: 37.3,z1: 41,room: 'Trapphus A',area: 'hallE'}, // … and in front of the lift's lobby / the förråd's door; the band's opening east is coreAEast
    {id: 'storeANW',x0: -9.05,x1: -0.25,z0: 29.3,z1: 33.15,room: 'Förråd A',area: 'hallE'},
    {id: 'storeANWWing',x0: -3.55,x1: -1.4,z0: 33.15,z1: 35.35,room: 'Förråd A',area: 'hallE'},
    {id: 'storeANWInner',x0: -1.4,x1: -0.25,z0: 33.15,z1: 34.2,room: 'Förråd A',area: 'hallE'},
    {id: 'storeANWDoor',x0: -0.25,x1: 0.05,z0: 31.95,z1: 32.95,room: 'Förråd A',area: 'hallE',door: {kind: 'steel',hinge: 'x0',open: -1,name: 'dörren till förråd A väst'}},
    {id: 'storeANE',x0: 2.85,x1: 8.9,z0: 29.3,z1: 35.65,room: 'Förråd A',area: 'hallE'},
    {id: 'storeANEWing',x0: 2.85,x1: 5.35,z0: 35.65,z1: 38.4,room: 'Förråd A',area: 'hallE'},
    {id: 'storeANEDoor',x0: 2.5,x1: 2.85,z0: 32.9,z1: 33.9,room: 'Förråd A',area: 'hallE',door: {kind: 'steel',hinge: 'x0',open: 1,name: 'dörren till förråd A öst'}},
    {id: 'elA',x0: 5.7,x1: 8.9,z0: 35.95,z1: 37.8,room: 'Elrum A',area: 'hallE'},
    {id: 'elADoor',x0: 5.35,x1: 5.7,z0: 36.3,z1: 37.3,room: 'Elrum A',area: 'hallE',door: {kind: 'steel',hinge: 'x0',open: 1,name: 'dörren till elrum A'}},
    {id: 'storeASE',x0: 2.9,x1: 8.9,z0: 38.8,z1: 43.2,room: 'Förråd A',area: 'hallE'},
    {id: 'storeASEWing',x0: 5.15,x1: 8.9,z0: 43.2,z1: 45.65,room: 'Förråd A',area: 'hallE'},
    {id: 'storeASEDoor',x0: 2.5,x1: 2.9,z0: 39.6,z1: 40.6,room: 'Förråd A',area: 'hallE',door: {kind: 'steel',hinge: 'x0',open: 1,name: 'dörren till förråd A söder'}},
  ],
  // DRAWING: free-standing / partial walls inside the rectangles [x0, x1, z0, z1]: the förråd room's partitions and the
  // bike rooms' half walls (z 3.2 … 4.8 open between them); the core's lift shaft south of the lobby
  partials: [[-30.35, -30.05, 0.47, 3.2], [-30.35, -30.05, 4.8, 7.5], [-24.8, -24.46, 2.67, 3.2], [-24.8, -24.46, 4.8, 7.5],
    [-5.53, -5.23, 0.47, 3.2], [-5.53, -5.23, 4.8, 7.5], [0.02, 0.32, 0.47, 3.2], [0.02, 0.32, 4.8, 7.5], [5.57, 5.87, 0.47, 3.2], [5.57, 5.87, 4.8, 7.5],
    [-38.45,-38.15,8.9,12.11],[-35.9,-35.6,8.9,12.11],[-30.35,-30.05,9.4,12.11],[-24.8,-24.46,9.4,12.11],
    [-11.08, -10.78, 9.4, 12.11], [-5.53, -5.23, 9.4, 12.11], [0.02, 0.32, 9.4, 12.11], [5.57, 5.87, 9.4, 12.11]],
  // DRAWING: the columns (0.42 m squares, centres) — the big hall's grid (7.9 m) and the entrance hall's; the entrance
  // hall's line at x −58.2 is a row of short walls on the plan, drawn as columns here
  columns: { size: 0.42, grid: { xs: [-41.55, -33.67, -25.75, -17.85, -9.95, -2.05, 5.85], zs: [16.94, 24.44] },
    south: { xs: [-41.55, -33.67, -25.75, -17.85], z: 30.44 }, entrance: { xs: [-64.15, -58.22, -51.7], zs: [36.2, 40.26, 47.56] } },
  // ASSUMPTION (the plan draws no stalls): rows nose to a wall, `w` wide (the big hall: 3 per 7.9 m bay), `d` deep;
  // [x0, x1, z0, z1, nose 'n' | 's'] per row, cut into stalls of ~w; `skip` = stalls left free (the basement door);
  // numbered 1… in this order. `ours` (L1007): straight under our patio (x 0 … 5.75), the user's wish — a charging post
  // and "L1007" on the wall. `pool`: the car pool's two stalls ("bilpool med 2 bilar och laddplatser", plan p. 46),
  // `cars`: the share of the other stalls taken.
  stalls: {
    rows: [[-49.44, 8.92, 12.62, 17.62, 'n', 2.63], [-41.55, -9.95, 28.16, 33.16, 's', 2.63],
      [-69.95, -51.9, 34.52, 39.9, 'n', 2.9], [-69.95, -42.6, 47.8, 51.8, 's', 2.9]],
    skip: [[-17.85, -12.59]], ours: [0.58, 3.21], pool: [[-49.44, -44.18]], cars: 0.55, seed: 23,
  },
  // #523: racks only in the dedicated CYKEL rooms shown on p46; no inferred racks in car-parking areas.
  // Rack depth/spacing/bike occupancy are visual assumptions; the existing room-side rows follow the drawing
  // along their walls (the plan draws racks there): [x0, x1, z, facing ±1 (towards +z / −z)]
  // #704: a rack's bikes and stalls are drawn in full (bikeGeometry(1), ~1 400 triangles a bike) within `bikeLodNear` m of the camera,
  // beyond it as the coarse set (bikeGeometry(0), ~480): the racks' ~110 k triangles in the big hall's view were over budget. *guess*
  bikeLodNear: 10,
  rideableBikeRows: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  bikes: [[-41.15,-36.2,.95,1], [-29.75,-25.1,11.6,-1], [-10.6, -5.8, 11.6, -1],
    [-5.0, -0.2, 11.6, -1], [0.55, 5.3, 11.6, -1], [6.1, 10.8, 11.6, -1],  [-29.8, -25.1, 0.95, 1],[-29.8,-27.9,7,-1],[-26.6,-25.1,7,-1], [-24.2, -19.6, 7.0, -1],
    [-16.0, -11.4, 0.95, 1]],
  // DRAWING: the 15 extra rental förråd (LGHFÖRRÅD) in Hus L's north-east room, four bays between its partitions with a passage
  // through them (z 3.2 … 4.8); ASSUMPTION: two wire-mesh cages per bay each side of it, but one where the room's door
  // comes in, a door `door` m wide in each cage's front, opening into the passage up to `max` rad. `ours` (L1007).
  storage: { bays: [[-10.78, -5.53], [-5.23, 0.02], [0.32, 5.57], [5.87, 11.12]], north: [0.47, 3.2], south: [4.8, 7.5], skipSouth: 1,
    door: 0.9, max: 1.5, speed: 3, ours: 7, seed: 41,
    // #523: illustrative cage subdivisions in ordinary storage rooms, NOT a surveyed count or allocation.
    // x0,x1,z0,z1,front,count,room id,building; room boundaries above follow p46. Legacy L rental cages stay first.
    ordinary: [
      [-69.6,-65.1,17.6,19.5,'s',2,'storeCNW','C'],[-59.9,-52.3,13.4,15.2,'s',3,'storeCNETop','C'],
      [-58.2,-52.3,19.1,20.7,'n',2,'storeCNE','C'],[-59.9,-55.4,25.3,27.4,'s',2,'storeCSE','C'],
      [-40.8,-36,34,36.1,'s',2,'storeBNW','B'],[-31.6,-26.6,34,35.7,'s',2,'storeBNE','B'],
      [-40.8,-37.4,44.1,45.7,'s',2,'storeBSW','B'],[-8.8,-.55,29.6,31.4,'s',3,'storeANW','A'],
      [3.2,8.6,29.6,31.4,'s',2,'storeANE','A'],[5.45,8.6,43.7,45.35,'n',2,'storeASEWing','A'],
    ] },
    // #523: C/B/A storage and lobby doors above replace the old unsupported wall-mounted dummy doors.
  fakeDoors: [],
  // #358: a sectional (overhead) door in `sections` panels rising on tracks and running in under the ceiling in `seconds`
  // s; it shuts by itself `auto` s after it opened unless someone / our car is in the opening (it opens again if one
  // comes in while it shuts). A button on a post outside south of the drive (`post`) and on the wall inside (`inside`);
  // an amber warning light blinks while it moves. All ours (ASSUMPTION).
  door: { sections: 5, seconds: 9, auto: 25, passable: 0.8, post: [-71.4, 47.9], inside: [-69.92, 48.4] },
  // fluorescent tubes (ASSUMPTION): a grid over every room (`spacing` m); a motion sensor per area (`area` above) puts
  // them on while the visitor is in it or within `sensor` m of it and `hold` s after; `flicker` s of starting up.
  // `dim`: the daylight left down here (DayCycle.under); each area lends one spot a pool light (lights.extra).
  // `carLight`: the ambient light added while the visitor is down here with the tubes on (#440: the cars and our Renault
  // are lit materials; the baked shell is not), × how far in (DayCycle.lit)
  lights: { hold: 90, flicker: 0.7, amb: 0.22, r: 2.6, dim: 0.92, intensity: 2.2, range: 10, sensor: 8, spacing: 5.2, carLight: 4 },
  // #452 (src/escape.js), all ASSUMPTION (placement, sizes; our own drawings, no real company's): the ways out are the garage
  // door (rect 'doorway') and the stairwell (rect 'core', up to the portik). A distance field over the rectangles (minus
  // partials, columns, förråd cages) gives each spot its way to the nearest. `hang`: green "Nödutgång" signs `w` × w/2
  // m under the ceiling (centre `y` over the floor), double-sided, square across the way (its first `look` m): per face
  // an arrow ahead / left / right or a U-turn, as the way goes for that face's reader — [x, z], or [x, z, face] = one face
  // only; `wall`: flat over a doorway [x, z, face, y] ('ahead'); always lit. `plans`: framed A3 utrymningsplaner (`size` m) on a wall [x, z, face, y over the floor],
  // drawn from the rectangles and turned the way the reader faces, "Du är här" at the plan; an extinguisher beside each.
  escape: {
    w: 0.44, y: 2.25, look: 5,
    hang: [[-64.3, 44], [-53.1, 44], [-47.4, 42], [-68.6, 44, 'e'], [-46.2, 20.8], [-35.7, 20.8], [-25.1, 20.8], [-41, 27], [-30.4, 27], [-20, 27],
      [-15, 18.6], [-4.8, 20.8], [4.35, 20.8], [-30.1, 9.95], [-24.7, 9.95], [-13, 8.6], [-8, 8.6], [-2.6, 8.6], [2.9, 8.6], [-28.7, 4.0], [-22, 4.0],
      [-15, 6.9, 'n'], [-5.4, 4.0], [5.7, 4.0],[-39,5],[-61.45,23.8],[-61.45,30],[-34,37],[-33.8,44.5],[1.3,33],[1.8,39.5]],
    wall: [[-19.25, 8.4, 'w', 2.35], [-16.33, 8.4, 'e', 2.35], [-16.1, 12.62, 's', 2.35], [-0.53, 7.5, 'n', 2.35]],
    plans: [[-16.98, 9.95, 'n', 1.45], [-13.4, 12.62, 's', 1.5]], size: [0.42, 0.297],
  },
};

export const PORTIK = {
  west: -16.12, east: -11.37, north: .55, south: 11.77,
  room: { west: -13.3, east: -11.37, north: 7.85, south: 11.6, wallWest: -13.8, wallNorth: 7.35 },
  door: { x: -13.55, z0: 9.5, z1: 10.55, height: DOOR_HEIGHT, color: 0x6d5a45 },
};

export const CORE = {
  x0: -18.95, x1: -16.62, split: -17.95,         // the band's inner faces; the flights' open (east) side
  foot: 7.61, tread: 0.25, treads: [16, 17, 16], // every flight's bottom step (its south end); per flight −1→1, 1→2, 2→3
  north: [4.42, 0.51, 0.51, 2.02],               // the stairwell's street-end inner face on våning −1, 1, 2, 3
  loftFace: 1.59,                                // våning 3's street face (HUS_L.loftgangDepth ≈): the loftgång wall 1.59 … 2.02
  south: [7.61, 9.58],                           // the landing: the flights' foot … the lift wall's north face
  shaft: { x0: -16.92, z1: [3.36, 3.36, 3.62] }, // the street-end east corner's shaft on våning 1, 2, 3
  // the ways in: the portik's screen (the door's z, its fixed sidelight `side`, the wall's `opening`), the loftgång door
  // (x; its sidelight `side`); the flats' doors in the east wall [storey, z0, z1] (we cannot open them)
  portikDoor: { z: [8.45, 9.48], side: [7.66, 8.4], opening: [7.61, 9.53] },
  loftDoor: { x: [-18.11, -17.07], side: [-18.58, -18.16] },
  flatDoors: [[2, 6.73, 7.74, 'L1101'], [3, 6.29, 7.3, 'L1205']],
  // the flats' door parts (#626, core.js buildFlatDoors; metres, depth `proud` = from the wall face, all *guess*: no
  // door drawing from Peab): leaf 2.1 m, a 7 cm wide architrave 2.2 cm proud, a name plate as ours (NAME_PLATE size, 0.95 m up)
  // and a 15 cm number sign beside the door; the plate and the sign carry the flat's number only
  flatDoorParts: { height: 2.1, leaf: 0.012, proud: 0.022, frame: 0.07, plate: [0.14, 0.035, 0.95], sign: 0.15,
    leafColor: 0x7a6248, panelColor: 0x8d7456, frameColor: 0xf0eee8, steel: 0xb8bcbf, brass: 0xc9a650, dark: 0x1b1c1d },
  // street-façade window on våning 1 and 2 (#457, DRAWING overview plans pp. 47–48): x ≈ −18.55 … −17.15;
  // sill and head heights are an ASSUMPTION
  window: { x: [-18.55, -17.15], sill: 0.8, head: 2.4 },
  // rescue: m/s the car creeps down to the stop below in a power cut (#612, battery rescue drive; *guess*)
  lift: { x0: -18.95, x1: -17.44, z0: 9.78, z1: 12.28, door: [-18.84, -17.94], speed: 1.0, accel: 0.6, doorTime: 1.4, wait: 6, rescue: 0.25,
    floors: ['−1', '1', '2', '3'] }, // the stops' names, bottom first (våning −1 = the garage's basement, 1–3 the storeys; #640)
  light: { hold: 60 },
};

const HOUSE_FLAT_DOORS = { cell: { depth: 1.3, height: 2.5 }, scale: 0.5 };

const A_BLOCK = SITE.blocks.find((b) => b.name === 'Hus A'), A_Z = A_BLOCK.z0 + A_BLOCK.recesses.find((r) => r.face === 'n' && r.door != null).depth;

export const CORE_A = {
  house: 'Hus A',
  stops: [-3, 0, 3, 6, 9],                 // våning −1, 1, 2, 3, 4 = SITE.blocks 'Hus A' base + n × SITE.storey (*guess*: equal storeys)
  labels: ['−1', '1', '2', '3', '4'],
  slab: 0.25, ceilingTop: 2.7,             // *guess*: the slab thickness; the top storey's clear height
  band: { x0: -1.05, x1: 0.80, z0: 37.3, z1: 45.5 },
  // #644: winders. `top` = the hall's edge, `run` = z of the stringer's south end (the winders' pivot), `risers` per storey in one run
  // (16 of 0.1875 m: the plans show the straight treads ≈ 0.25 m deep, `straight` of them in each flight, the rest winders round the
  // pivot: 7 = a rectangle each beside the stringer + 5 fan-shaped over the south end, the plan draws ~8 rays: the counts are a *guess*)
  stair: { top: 42.84, run: 44.6, well: [-0.19, -0.09], risers: 16, straight: 4, tread: 0.25, guard: 1.1 },
  car: { x0: -0.40, x1: 0.80, z0: 34.5, z1: 37.0 },   // the shaft north of the hall: the car; a counterweight strip west of it is walled off. `front` = the car's door face (the wall is 0.3 thick south of it)
  lift: { side: 's', front: 37.0, wall: 37.3, door: [-0.25, 0.65], speed: 1.0, accel: 0.6, doorTime: 1.4, wait: 6, rescue: 0.25 },
  flatDoors: HOUSE_FLAT_DOORS,
  hallLights: 1,                            // one lamp per storey over the hall (B / C: one every ~3.4 m)
  walls: [
    // the hall's west wall: on −1 the opening towards the west passage (garage rect 'coreAWest', 2.1 m high *guess*), the flats' doors on 1–4
    { ax: 'x', t: [-1.05, -1.05], a: [37.3, 45.5], s: [0, 4], thin: true, holes: [
      { a: [41.4, 42.75], h: 2.1, s: [0, 0] },
      { a: [37.35, 38.2], h: 2.1, s: [1, 4], leaf: true, hinge: 'n', flats: [null, 'A1004', 'A1102', 'A1202', 'A1302'] },
      { a: [40.28, 41.1], h: 2.1, s: [1, 4], leaf: true, hinge: 's', flats: [null, 'A1003', 'A1101', 'A1201', 'A1301'] }] },
    // … the east wall: on −1 the opening onto the lobby / the förråd corridor (garage rect 'coreAEast'), on 1 into the lobby in front of the lift (2.3 m), the flats' doors
    { ax: 'x', t: [0.80, 0.80], a: [37.3, 45.5], s: [0, 4], thin: true, holes: [
      { a: [37.3, 40.1], h: 2.1, s: [0, 0] }, { a: [37.3, 38.9], h: 2.3, s: [1, 1] },
      { a: [37.35, 38.2], h: 2.1, s: [2, 4], leaf: true, hinge: 's', flats: [null, null, 'A1103', 'A1203', 'A1303'] },
      { a: [40.28, 41.1], h: 2.1, s: [1, 4], leaf: true, hinge: 's', flats: [null, 'A1002', 'A1104', 'A1204', 'A1304'] }] },
    { ax: 'z', t: [45.5, 45.5], a: [-1.05, 0.80], s: [0, 4], thin: true },                                              // the stair's south wall
    { ax: 'z', t: [37.0, 37.3], a: [-1.05, 0.80], s: [0, 4], holes: [{ a: [-0.25, 0.65], h: 2.1 }] },                   // the lift's front wall (0.3 thick): a doorway at every stop
    { ax: 'x', t: [-0.40, -0.40], a: [34.5, 37.0], s: [0, 4], thin: true }, { ax: 'x', t: [0.80, 0.80], a: [34.5, 37.0], s: [0, 4], thin: true },   // the shaft's walls
    { ax: 'z', t: [34.5, 34.5], a: [-0.40, 0.80], s: [0, 4], thin: true },
    { ax: 'z', t: [41.45, 41.45], a: [-1.05, 0.80], s: [1, 4], thin: true, holes: [{ a: [-0.90, -0.05], h: 2.1, leaf: true, plain: true, hinge: 'w', into: true }] }, // the cross wall
    // våning 1's lobby (the basement's is the garage's rects): the west wall, the shaft's north and east faces, the east wall, the lift lobby's south wall and the shaft's corner
    { ax: 'x', t: [0.22, 0.22], a: [A_Z, 34.0], s: [1, 1], thin: true }, { ax: 'z', t: [34.0, 34.0], a: [0.22, 1.13], s: [1, 1], thin: true },
    { ax: 'x', t: [1.13, 1.13], a: [34.0, 37.3], s: [1, 1], thin: true }, { ax: 'x', t: [2.50, 2.50], a: [A_Z, 38.9], s: [1, 1], thin: true },
    { ax: 'z', t: [38.9, 38.9], a: [0.80, 2.50], s: [1, 1], thin: true }, { ax: 'z', t: [37.3, 37.3], a: [0.80, 1.13], s: [1, 1], thin: true },
    // the entrance wall: the door's opening (x 1.37 … 2.22) and the fixed sidelight west of it (x 0.28 … 1.32, its frame's post up to the door: 1.37), the solid rest
    { ax: 'z', t: [A_Z - 0.06, A_Z + 0.06], a: [0.22, 2.50], s: [1, 1], holes: [{ a: [1.37, 2.22], h: 2.2 }, { a: [0.28, 1.37], h: 2.2, glass: true }] },
  ],
  // the lobby (våning 1): north part, the strip beside the shaft, the lift lobby
  floors: [{ r: [0.22, 2.50, A_Z - 0.06, 34.0], s: 1 }, { r: [1.13, 2.50, 34.0, 37.3], s: 1 }, { r: [0.80, 2.50, 37.3, 38.9], s: 1 }],
  cap: [-0.40, 0.80, 34.2, 37.3],           // the shaft's top
  // the entrance door in the recess's back wall (the door's size: the plan's swing is 0.7 m; 0.85 m used: hinged east, opening out into the recess)
  entrance: { face: 'n', line: A_Z, door: [1.37, 2.22], side: [0.28, 1.32], height: 2.2, hinge: 'hi', name: 'porten till trapphus A' },
  numbers: { x: -1.05, z: 39.2, dir: 1 },   // the floor number plates on the hall's west wall by the lift (facing east)
  lights: [[1.35, 32.4], [1.8, 35.6], [1.6, 38.2]], // the lobby's lamps [x, z]
};

export const CORE_B = {
  house: 'Hus B',
  stops: [-3, 0, 3, 6],                 // våning −1, 1, 2, 3 = SITE.blocks 'Hus B' base + n × SITE.storey (*guess*: equal storeys)
  labels: ['−1', '1', '2', '3'],
  slab: 0.25, ceilingTop: 2.7,          // *guess*: the slab thickness; the top storey's clear height
  band: { x0: -33.08, x1: -31.16, z0: 41.74, z1: 50.0 },
  stair: { top: 47.0, run: 49.05, well: [-32.17, -32.07], risers: 16, straight: 4, tread: 0.28, guard: 1.1 }, // as CORE_A's (#644): `run` = the stringer's south end, the winders' pivot
  car: { x0: -33.0, x1: -31.24, z0: 39.02, z1: 41.44 },                              // the car (*guess*: the plan draws the shaft 1.9 × 2.4)
  lift: { side: 's', front: 41.44, wall: 41.74, door: [-32.35, -31.3], speed: 1.0, accel: 0.6, doorTime: 1.4, wait: 6, rescue: 0.25 },
  flatDoors: HOUSE_FLAT_DOORS,
  walls: [
    // the west wall of the hall and the shaft (x −33.38 … −33.08), with the flats' doors, the openings on −1 and into the lobby on 1
    { ax: 'x', t: [-33.38, -33.08], a: [38.34, 50.4], s: [0, 3], holes: [
      { a: [41.8, 43.4], h: 2.1, s: [0, 0] }, { a: [44.9, 45.9], h: 2.1, s: [0, 0] },   // −1: to the passages
      { a: [41.74, 42.62], h: 2.1, s: [1, 1] },                                         // 1: into the lobby
      { a: [42.15, 43.05], h: 2.1, s: [2, 3], leaf: true, hinge: 'n', flats: [null, null, 'B1102', 'B1202'] },
      { a: [44.75, 45.65], h: 2.1, s: [1, 3], leaf: true, hinge: 's', flats: [null, 'B1003', 'B1101', 'B1201'] }] },
    { ax: 'x', t: [-31.16, -30.86], a: [38.34, 50.4], s: [0, 3], holes: [
      { a: [46.1, 47.0], h: 2.1, s: [0, 0] }, // #729: park corridor, flat basement landing; width *guess* within p46 hall
      { a: [42.15, 43.05], h: 2.1, s: [1, 3], leaf: true, hinge: 'n', flats: [null, 'B1001', 'B1103', 'B1203'] },
      { a: [44.75, 45.65], h: 2.1, s: [1, 3], leaf: true, hinge: 's', flats: [null, 'B1002', 'B1104', 'B1204'] }] },
    { ax: 'z', t: [38.34, 39.02], a: [-33.08, -31.16], s: [0, 3] },                       // the shaft's north wall
    { ax: 'z', t: [41.44, 41.74], a: [-33.08, -31.16], s: [0, 3], holes: [{ a: [-32.35, -31.3], h: 2.1 }] }, // its front wall: a doorway at every stop
    { ax: 'z', t: [50.0, 50.4], a: [-33.38, -30.86], s: [0, 3] },                         // the stair's south wall
    // våning 1's lobby: west wall (a flat's door), the entrance wall (the door's opening), east wall north of the shaft, south wall
    { ax: 'x', t: [-35.08, -34.78], a: [35.4, 43.9], s: [1, 1], holes: [{ a: [42.45, 43.35], h: 2.1, leaf: true, hinge: 's', flats: [null, 'B1004'] }] },
    // #727: like Hus A's (mirrored): the door (x −34.50 … −33.60, hinged at its west end) + the fixed sidelight east of it (−33.60 … −32.56), solid piers each side
    { ax: 'z', t: [35.34, 35.46], a: [-34.78, -32.50], s: [1, 1], holes: [{ a: [-34.50, -33.60], h: 2.2 }, { a: [-33.60, -32.56], h: 2.2, glass: true }] },
    { ax: 'x', t: [-32.50, -32.50], a: [35.4, 38.34], s: [1, 1], thin: true },     // #727: the lobby's east wall north of the shaft (A's x 2.50, mirrored)
    { ax: 'z', t: [43.56, 43.9], a: [-35.08, -33.38], s: [1, 1] },
  ],
  floors: [{ r: [-34.78, -33.08, 35.4, 43.56], s: 1 }, { r: [-33.08, -32.50, 35.4, 38.34], s: 1 }],
  cap: [-33.38, -30.86, 38.34, 41.74],          // the shaft's top (over the walls round the car)
  entrance: { face: 'n', line: 35.4, door: [-34.50, -33.60], side: [-33.60, -32.56], height: 2.2, hinge: 'lo', name: 'porten till trapphus B' }, // #727: the plan: ONE door (swing 0.93 m, hinged west) + a fixed glazed sidelight, as Hus A's mirrored (x' = −32.28 − x); `cut` = the whole recess
  numbers: { x: -31.16, z: 44.0, dir: -1 },     // the floor number plates on the east wall (facing west)
  lights: [[-33.6, 36.9], [-34.1, 40.3], [-34.0, 42.8]], // the lobby's lamps [x, z] (the first over the wider part, #727)
};

export const CORE_C = {
  house: 'Hus C',
  stops: [-3, 0, 3, 6, 9, 12],            // våning −1, 1 … 5 = SITE.blocks 'Hus C' base 0 + n × SITE.storey; −1 = GARAGE.floor (*guess*: equal storeys)
  labels: ['−1', '1', '2', '3', '4', '5'],
  slab: 0.25, ceilingTop: 2.7,
  band: { x0: -62.34, x1: -60.44, z0: 20.12, z1: 30.54 },
  stair: { top: 27.75, run: 29.7, well: [-61.44, -61.34], risers: 16, straight: 4, tread: 0.28, guard: 1.1 },
  car: { x0: -64.98, x1: -62.90, z0: 23.45, z1: 24.8 },
  lift: { side: 'e', front: -62.9, wall: -62.34, door: [23.7, 24.75], speed: 1.0, accel: 0.6, doorTime: 1.4, wait: 6, rescue: 0.25 },
  flatDoors: HOUSE_FLAT_DOORS,
  walls: [
    { ax: 'x', t: [-62.64, -62.34], a: [19.82, 22.9], s: [0, 5], holes: [{ a: [20.2, 21.0], h: 2.1, s: [1, 5], leaf: true, hinge: 'n', flats: [null, 'C1003', 'C1102', 'C1202', 'C1302', 'C1402'] }] },  // the hall's west wall north of the lift
    { ax: 'x', t: [-62.9, -62.34], a: [22.9, 25.3], s: [0, 5], holes: [{ a: [23.7, 24.75], h: 2.1 }] },                            // the lift's front wall: a doorway at every stop
    { ax: 'z', t: [22.9, 23.45], a: [-65.32, -62.9], s: [0, 5] }, { ax: 'z', t: [24.8, 25.3], a: [-65.32, -62.9], s: [0, 5] },   // the shaft's north and south walls
    { ax: 'x', t: [-65.32, -64.98], a: [22.9, 25.3], s: [0, 5] },                                                                    // … and west wall
    { ax: 'x', t: [-62.64, -62.34], a: [25.3, 30.88], s: [0, 5], holes: [{ a: [25.5, 26.4], h: 2.1, s: [1, 5], leaf: true, hinge: 's', flats: [null, 'C1002', 'C1101', 'C1201', 'C1301', 'C1401'] }] },  // west wall south of the lift
    { ax: 'x', t: [-60.44, -60.14], a: [19.82, 30.88], s: [0, 5], holes: [
      { a: [23.44, 24.6], h: 2.1, s: [0, 0] }, { a: [23.44, 24.92], h: 2.1, s: [1, 1] },                                     // −1: to the steel door, 1: into the lobby
      { a: [20.2, 21.0], h: 2.1, s: [1, 1], leaf: true, hinge: 'n', flats: [null, 'C1004'] },
      // #656: on våning 2–5 the north-east flat's door is at z 22.05 … 22.9 (vaning-2 … upstream architectural reference; våning 5: no calibrated sheet, the same as 4, *guess*), hinged at its south end
      { a: [22.05, 22.9], h: 2.1, s: [2, 5], leaf: true, hinge: 's', flats: [null, null, 'C1103', 'C1203', 'C1303', 'C1403'] },
      { a: [25.5, 26.4], h: 2.1, s: [1, 5], leaf: true, hinge: 's', flats: [null, 'C1001', 'C1105', 'C1205', 'C1305', 'C1405'] }] },
    { ax: 'z', t: [19.82, 20.12], a: [-62.64, -60.14], s: [0, 5], holes: [{ a: [-62.34, -60.44], h: 2.1, s: [0, 0] },       // north wall (−1: the corridor goes on)
      // #656: the fifth flat's door (C1005 / C1104 …) in the hall's north end, x −61.62 … −60.77 on våning 1–4 (the plans: hinged at its west end, swinging north into the flat); våning 5 *guess*
      { a: [-61.62, -60.77], h: 2.1, s: [1, 5], leaf: true, hinge: 'w', into: true, flats: [null, 'C1005', 'C1104', 'C1204', 'C1304', 'C1404'] }] },
    { ax: 'z', t: [30.54, 30.88], a: [-62.64, -60.14], s: [0, 5], holes: [{ a: [-62.34, -60.44], h: 2.4, s: [0, 0] }] },       // the stair's south wall (−1: the way through to the steel door, #654)
    // våning 1's lobby
    { ax: 'z', t: [23.0, 23.44], a: [-60.14, -57.54], s: [1, 1] },
    { ax: 'x', t: [-57.84, -57.54], a: [21.2, 23.44], s: [1, 1] },
    { ax: 'z', t: [21.2, 21.5], a: [-57.84, -53.34], s: [1, 1] },
    { ax: 'z', t: [24.92, 25.26], a: [-60.14, -53.34], s: [1, 1] },
    { ax: 'x', t: [-53.46, -53.34], a: [21.5, 24.92], s: [1, 1], holes: [{ a: [23.15, 24.05], h: 2.2 }, { a: [22.3, 23.15], h: 2.2, glass: true }] },
  ],
  floors: [{ r: [-60.44, -57.54, 23.44, 24.92], s: 1 }, { r: [-57.54, -53.34, 21.5, 24.92], s: 1 }],
  cap: [-65.32, -62.34, 22.9, 25.3],
  // #654: on −1 the stair is ONE straight flight in the east half (x −61.34 … −60.44) from the hall's south end (`foot`, the south wall's inner face) north to
  // the hole it climbs through in våning 1's floor (its north edge z = foot − (risers − 1) × tread = 26.79), so the west half stays a free lane
  // from the steel door `entryC` through the south wall's opening up to the hall and the corridor north. *guess*: the plan (vaning-m1) draws a lower flight
  // z 26.6 … 28 + a cupboard z 28.4 … 29.6 and a dashed gate at z ≈ 30.5, not enough to read a flight from; every number here is ours (a 0.25 m tread: steeper than the upper winders').
  lane: { foot: 30.54, tread: 0.25 },
  pit: [-62.34, -60.44, 26.79, 30.54],        // the stair well's footprint (+ the −1 flight's hole in våning 1's floor): a hole in the terrain mesh (the courtyard-level grass inside Hus C's footprint, y 0, would cover the flights below våning 1)
  entrance: { face: 'e', line: -53.4, door: [23.15, 24.05], side: [22.3, 23.1], height: 2.2, hinge: 'hi', cut: [22.3, 24.05], name: 'porten till trapphus C' },
  numbers: { x: -60.44, z: 21.52, dir: -1 },     // #656: clear of the north-east door (z 22.05 … 22.9 on våning 2–5) and its sign (north of it)
  lights: [[-59.0, 24.2], [-55.5, 23.2]],
};

export const INTERACTION_OUTLINE = { brightness: 1.12 };

export const LAUNDRY = {
drum: { radius: .16, depth: .30, shell: .012, centerY: .42, slots: 3 },
panel: { w: .26, h: .065, lift: .36, offset: .008, pickDepth: .02 }
};

export const CAMPUS_LOD = { curve: 3, roofGrid: 2, maxTris: 36000 };

// Touch stick feel (upstream 211e0e9, original #1088; *guess* values tuned by eye): deflection r = distance / knob travel.
// Below `deadZone` nothing moves (a resting thumb never drifts); up to `full` the output rises along t^`curve`
// (fine walking near the centre), beyond it is 1 (full walking speed at the rim).
// Floating stick (#32, upstream touch.js at 1af9b39/211e0e9): a touch on the stick side (`zone` × the view width from
// the left edge, or from the right when the own layout is mirrored; the original's 0.45) places the base under the thumb;
// `follow`: a thumb dragged past the rim pulls the base along behind it (original #1088).
// Drag-to-look (upstream 211e0e9, original #1088): `sens` look units per CSS px (the previous fixed 1.3 in main.js, with
// look() turning .0026 rad per unit); `smooth` s is the time constant over which each finger movement is eased into the
// view per frame, evening out uneven touch-event timing (0 = raw, original 30 ms, *guess*). The total turn is unchanged.
export const TOUCH = { stick: { deadZone: 0.1, full: 0.9, curve: 1.5, follow: true, zone: 0.45 }, look: { sens: 1.3, smooth: 0.03 } };

export const PLAYER = {
eye: 1.62,
radius: 0.22,
walk: 1.6,
run: 3.2,
sprintStick: 0.95,
turnSpeed: 1.9,
crouchEye: 0.95,
crouchSpeed: 0.5,
mouseSens: 0.0013,
stepUp: 0.45,
headroom: 1.85,
hurdle: 0.22
};

export const ROOFS = { aloft: 2.0 };

export const STAIR = {
  aX0: 3.50,                 // bottom step (Entréplan plan)
  aZ: [6.72, 7.54],
  center: [4.645, 6.654],    // winder pivot (Övre plan plan)
  winderX1: 5.49,
  winderZ: [5.77, 7.54],
  bX1: 3.86,                 // top step (Övre plan stair outline) = hole.x0: the last riser is the slab edge
  bZ: [5.77, 6.60],
  treads: { a: 4, w: 8, b: 3 }, // guess (no stair drawing)
  treadSlab: 0.25,           // thickness of each tread under flight B and the winders (guess; flight A is solid)
  // Upstairs slab opening = stair outline on Övre plan.
  hole: { x0: 3.86, x1: 5.49, z0: 5.77, z1: 7.54 },
  railHeight: 1.1, // bofakta: H 1,1 m
  newel: 0.08,     // newel post at the railing's corner and ends, square (guess, Peab 3D plan shows heavier posts)
  // Handrails along the flights (#419, stairs.js `handrailRuns` / `buildHandrails`; no handrail detail for L1007 exists,
  // so every number is a *guess*; Peab's render of L1209's stair, upstream architectural reference, shows a
  // slim plain rail following the pitch). White like the railing (COLORS.rail, the light render), one merged mesh with
  // the railing's material. `outer` = one continuous rail on the wall side: the living-room wall along flight A, the
  // east party wall round the winders, the north wall along flight B (the wall faces from plan.json; `from` / `to` =
  // where the bottom / top wall ends: the living-room doorway, the upstairs hall's corner — the 0.3 m extensions are
  // cut short there). The railing's top round the opening is 1.3 m+ over flight B's nosings and none stands by flight A,
  // so the inner side gets one per flight too (the issue's rule): `innerA` on the Klk wall, `innerB` on the balusters
  // between the newels. In a dwelling one side would do (BBR 8:232); the second side is our choice.
  handrail: {
    h: 0.9,      // over the nosings, vertically (usual Swedish practice, guess)
    r: 0.02,     // Ø 4 cm round rail (guess)
    gap: 0.05,   // clear gap rail → wall (guess)
    ext: 0.3,    // horizontal extension past the bottom / top nosing (guess), less where the wall ends
    smooth: 0.15, // ± m the pitch line is eased over (the winders' outer goings differ from the flights')
    bend: 0.06,  // ± m the plan corners and the returns to the wall are rounded over
    bracket: { every: 1.0, drop: 0.06, r: 0.006, rose: 0.028, roseT: 0.008 }, // brackets ~1 m apart (guess)
    outer: { south: 7.604, east: 5.551, north: 5.704, from: 3.252, to: 3.802 },
    innerA: { face: 6.704, from: 3.352, to: 4.671 },
  },
};

export const COLORS = {
  sky: 0xcfe0ec,   // horizon (fog); the sky above is a gradient, see surroundings.js
  wall: 0xf1f1ee,   // Väggfärg NCS S 0500-N (material choice)
  ceiling: 0xfbfbf9,
  floor: 0xc9a77c,
  tile: 0xd6d9da,
  cabinet: 0xe8ebec,
  counter: 0x5b5f62,
  appliance: 0xf7f7f7,
  porcelain: 0xffffff,
  frame: 0xf5f5f5,
  glass: 0xa9cce3,
  door: 0xf1f1ee,   // Innerdörr Stable GW / skjutdörrar NCS S 0500-N
  rail: 0xf4f4f1,   // stair railing: white balusters + handrail (Peab 3D plan of L1002–L1007)
  riser: 0xf4f4f1,  // stair risers and stringers, white (the treads use the floor's Ek Chalk parquet, #54)
  grass: 0x7fa65c,
  patio: 0xbdb7ab,
  hedge: 0x46703a,
  fence: 0xa7b6aa, // grey-green screen wall (skärmvägg), Peab render
  brick: 0x8a3b2a,
  mortar: 0xcfc6b8,
  balcony: 0x8fa396, // pinnaräcke grågrön (brochure)
  asphalt: 0x5d5f61,
  paving: 0xb9b4aa,
  water: 0x47657a,
  solar: 0x1d2735,
};

export const FINISH = {
  // Parkettgolv Ek Chalk: white-stained oak. Colour from the swatch (avg 177/159/145, lifted
  // a little for the indoor lighting); 1-stav planks 18 × 200 cm (typical size — guess).
  parquet: { base: [204, 186, 170], width: 0.18, length: 2.0 },
  hallTile: { w: 0.6, h: 0.3, color: 0x7a7c7d },  // Granitkeramik City Amsterdam 30×60, rak
  wetTile: { w: 0.15, h: 0.15, color: 0x737577 }, // Granitkeramik City Amsterdam 15×15
  wallTile: { w: 0.4, h: 0.2, color: 0xf4f4f2 },  // Kakel vit matt 20×40, rak liggande
  splash: { w: 0.2, h: 0.1, color: 0xf6f6f4, grout: 0xc9cdcc, roughness: 0.82 }, // Stänkskydd vit matt 10×20,
  // halvt förband liggande, Kakelfog Sopro ljusgrå 16; roughness: a matt glaze (0.6 gave glare spots, #271)
  grout: 0xb9bbbb,
  kitchenFront: 0x8d9886, // Kökslucka Form Tall (grey-green shaker)
  counter: 0xc2c1bb,      // Laminatbänkskiva Delaware stone (kitchen + Tvätt)
  handle: 0x1a1b1c,       // Handtag Solo svart cc 128 / Köksblandare ARM184 mattsvart
  steel: 0xc3c7ca,        // Kyl & frys rostfri, ventilationsgaller, diskho Intra
  black: 0x141516,        // Ugn EOK8P2B0 Pure Black, mikro KMFE264TEX, häll EH60KB6BF
  laundryFront: 0xf2f3f1, // Lucka Arkitekt plus Frost (Tvätt)
  vanity: 0x4d4f51,       // Kommod Core Grip 60 / Core XS Grip 50, Carbon Grey
  chrome: 0xd7dadc,       // Rt2 blandare, takdusch Tvm 7200, duschset Rt 105, Alnön beslag
};

export const SKIRTING = { h: 0.07, t: 0.012 };

export const TILED_ROOMS = [
  { level: 0, name: 'Hall', x0: 0.2, x1: 2.1, z0: 0.3, z1: 3.1, floor: 'hallTile' },
  { level: 0, name: 'Tvätt', x0: 0.2, x1: 2.06, z0: 3.1, z1: 4.88, floor: 'wetTile' },
  { level: 0, name: 'Badrum', x0: 0.2, x1: 2.06, z0: 4.88, z1: 7.6, floor: 'wetTile', wallTile: 2.5 },
  { level: 1, name: 'WC/dusch', x0: 0.2, x1: 1.48, z0: 5.13, z1: 7.6, floor: 'wetTile', wallTile: 2.5 },
];

export const KITCHEN = {
  level: 0,
  room: 'Kök / matplats', // room name (room detection) for its light switch
  area: { x0: 3.4, x1: 5.6, z0: 0.4, z1: 5.5 },
  plinth: 0.1,
  baseTop: 0.9,          // top of base carcass; worktop 30 mm on top (bänkhöjd 0,93)
  worktop: 0.03,
  top: 2.25,             // top line of tall units and wall cabinets (guess)
  wallBottom: 1.45,      // underside of wall cabinets (guess, ~52 cm above the worktop)
  wallDepth: 0.35,
  // #319: the east run's corner wall cabinet door hinges at the corner (handle on its north edge, opens to the right);
  // the stop in degrees, before its face meets the return row's corner handle (~3 cm from the corner, 2.4 cm proud)
  cornerDoorMax: 42,
  hoodBottom: 1.6,       // underside of the hood (Spiskåpa Tango) under the hob cabinet
  hoodHeight: 0.08,
  // #1043 cosmetic dimensions (m, visual guesses, not manufacturer measurements).
  hoodDetail: { rim: 0.014, filterGap: 0.008, spotRadius: 0.014, spotInset: 0.065 },
  // the under-cabinet LED ("bänkbelysningen") and the hood's light (#221, #271): `pool` = the pool point light each
  // borrows, `out` m out from the wall (still under the wall cabinets / hood, so their fronts are not lit) and `y` m over
  // the worktop; weak, as it is close to the tiles (inverse square: 0.3 m away a strong one made blown-out spots); `wash` = the additive washes' opacity, `soft` = the metres at each end of a wash over which it fades out
  // (no hard edges where a run stops at the hood or a cabinet). Tuned on screenshots at 19:00 (the user's, #271)
  underLights: {
    // #285: one continuous strip `strip` m behind the cabinets' front edge; a weak pool light over the middle of each run
    // (two anchors: one light could not reach the sink), the even look from the washes; `spill` = how far the wash
    // reaches under the hood from a cabinet end, `endSoft` = the fade at the tall unit / freezer (tuned on screenshots, 20:00)
    bench: { pool: { intensity: 0.16, range: 2.5 }, out: 0.33, y: 0.45, wash: 0.45, strip: 0.05, spill: 0.12, endSoft: 0.06 },
    hood: { pool: { intensity: 0.25, range: 2.5 }, out: 0.3, y: 0.4, wash: 0.32 },
    soft: 0.18,
  },
  fridgeHeight: 1.86,    // Electrolux LRT7ME39X / LUS7ME28X: 186 cm
  grille: 0.06,          // ventilationsgaller rostfri (over fridge/freezer and microwave)
  sink: { w: 0.5, d: 0.4, depth: 0.19 }, // Diskho Intra Linea 5040, underlimmad; depth *guess* (typ. 18–20 cm, #122)
  hob: { w: 0.58, d: 0.52, t: 0.006, bevel: 0.0012, // Induktionshäll EH60KB6BF; bevel is a visual guess (#1043)
    // its four zones (#158) as [a, b, r] on the glass (a 0 = front edge … 1 = back, b 0 = north … 1 = south, r in
    // fractions of the width); the first is the big front one that glows. A typical 4-zone layout (guess).
    zones: [[0.33, 0.3, 0.2], [0.33, 0.75, 0.15], [0.74, 0.3, 0.15], [0.74, 0.74, 0.17]] },
};

export const KITCHEN_SOCKETS = { wall: 5.545, below: 0.08, plate: { w: 0.15, h: 0.08, t: 0.007 }, r: 0.02, pitch: 0.074,
  color: 0x1f2022, cupColor: 0x27282b, at: [{ id: 'coffee', z: 1.4 }, { id: 'hob', z: 2.86 }, { id: 'corner', z: 5.478 - 0.13 }],
  taken: { 'coffee-s': 'kaffebryggaren', 'corner-s': 'airfryern' } };

export const LAUNDRY_SINK = { w: 0.22, d: 0.36, depth: 0.15 };

export const LAUNDRY_CABINET = { depth: 0.35, y0: 1.49, y1: 2.2, units: 2, share: 2 / 3 };

export const VANITY_BASIN = { depth: 0.1 };

export const VISIT_UNITS = [
  { id: 'L1004', slot: 'L1004', plan: 'shared' }, // bofakta: 126 m², 5 rok, våning 1–2, uteplats 22 m²
  // #573: L1201, the west end flat of våning 3–4 (bofakta 2024-11-08: 99 m², 4 rok, 54 + 45 m², takterrass 12 m²), entered
  // from the loftgång. Its own sheet (src/l1201plan.js, the base plan with Allrum), placed at its slot's `ox` and the
  // upper flats' street face (`oz` = HUS_L.loftgangDepth).
  { id: 'L1201', slot: 'L1201', plan: 'L1201' },
];

export const L1201 = {
  levels: [{ name: 'Entréplan', rh: 2.5 }, { name: 'Övre plan', rh: 2.5 }],
  hole: { x0: 0.206, x1: 1.75, z0: 6.205, z1: 8.835 },
  stair: { x1: 1.75, x0: 0.266, z0: 6.205, z1: 8.091 },
  railing: { x: 1.75, z0: 7.15, z1: 8.835, h: 1.1 },
  // its handrails (#619): ours (STAIR.handrail, every size a *guess*) mapped onto its stair, at its own wall faces read off
  // l1201plan.js — `outer`: the wall between flight A and the void (south), the west gable round the winders (its upper
  // face, 6 mm in from the lower one), the wall north of flight B; `from` / `to` where the bottom / top wall ends (the
  // void wall's east end, the upper wall's east end); `innerA` on the Klk's south wall (its east / west end)
  handrail: { outer: { south: 8.091, east: 0.206, north: 6.205, from: 2.28, to: 2.095 }, innerA: { face: 7.21, from: 2.28, to: 1.107 } },
  // the sloping half wall along flight A and the winders (#624; plan wall `half: true` at z 8.091–8.195, x 0.2–2.28): Peab's
  // brochure (upstream architectural reference) shows it white, its top parallel to the stair and ending in a
  // vertical edge by the living room. `top` = its top over the treads' nosings (a railing height, *guess*: no section of it
  // in Peab's material); the wall stays solid for collision
  halfWall: { z0: 8.091, z1: 8.195, x0: 0.2, x1: 2.28, top: 1.0 },
  extDoorHead: 2.3,
  windows: [
    { level: 0, facade: 'north', x: 3.85, sill: 0.7, head: 2.3, transom: 0 },   // kitchen (HUS_L.street std: BH 0.7)
    { level: 0, facade: 'south', x: 1.455, sill: 0.8, head: 2.3, transom: 0 },  // living room (HUS_L.court.lower)
    { level: 0, facade: 'south', x: 3.845, sill: 0.6, head: 2.3, transom: 0 },
    { level: 1, facade: 'north', x: 1.61, sill: 0.7, head: 2.3, transom: 0 },   // Sovrum 1
    { level: 1, facade: 'north', x: 3.95, sill: 0.7, head: 2.3, transom: 0 },   // Sovrum 2
    { level: 1, facade: 'south', x: 1.16, sill: 1.2, head: 2.3, transom: 0 },   // over the void (HUS_L.court.upper)
  ],
  soffits: [{ level: 1, x0: 0.206, x1: 1.851, z0: 3.76, z1: 6.005, height: 2.2, extent: 'rooms' }], // the Klk "RH: 2,2m"
  kitchen: { level: 0, area: { x0: 2.8, x1: 5.4, z0: 2.9, z1: 6.15 }, layout: 'galley', tallDir: 'e', baseDir: 'w',
    tiled: [{ level: 0, name: 'Badrum', x0: 0.2, x1: 2.675, z0: 3.41, z1: 6.005, wallTile: 2.5 },
      { level: 1, name: 'WC/dusch', x0: 4.335, x1: 5.555, z0: 3.84, z1: 6.11, wallTile: 2.5 }] },
  dividers: [{ level: 0, x0: 1.108, x1: 2.36, z0: 1.575, z1: 1.695 }, { level: 0, x0: 3.445, x1: 4.766, z0: 6.11, z1: 6.205 }],
};

export const STANDARD = {
  parquet: { base: [204, 180, 146], width: 0.2, length: 2.2, staves: 3 }, // matt-lacquered oak, 3-stav (colour, board *guess*)
  sill: 0x9d968a,       // window boards: grey/brown limestone (colour *guess*)
  front: 0xf3f3f0,      // smooth white Marbodal fronts (white *guess*)
  appliance: 0xf6f6f4,  // white Electrolux appliances
  counter: 0xd9d8d3,    // worktop: light grey laminate (generic, *guess*)
  handle: 0xb9bcbf,     // brushed steel bar handles (generic, *guess*)
  splash: 0xf4f4f2,     // white splashback tiles 10 × 20 (generic, *guess*)
  wetFloor: { w: 0.1, h: 0.1, color: 0x9c9fa1 }, // grey floor tiles in the wet rooms (generic, *guess*)
  wetWall: { w: 0.2, h: 0.2, color: 0xf5f5f3 },  // white wall tiles (generic, *guess*)
  vanity: 0xf2f2ef,     // white vanity (generic, *guess*)
  // the shared plan's wet rooms (L1007's TILED_ROOMS rectangles, no hall klinker): floor tiles + wall tiles up to `wallTile`
  tiled: [
    { level: 0, name: 'Tvätt', x0: 0.2, x1: 2.06, z0: 3.1, z1: 4.88 },
    { level: 0, name: 'Badrum', x0: 0.2, x1: 2.06, z0: 4.88, z1: 7.6, wallTile: 2.5 },
    { level: 1, name: 'WC/dusch', x0: 0.2, x1: 1.48, z0: 5.13, z1: 7.6, wallTile: 2.5 },
  ],
  // kitchen: the plan's cabinet rectangles inside `area` (KITCHEN.area: the same sheet); wall cabinets over the long run
  // and a hood over the hob (not drawn on bofakta, a usual Peab kitchen: *guess*), bottom/top as L1007's KITCHEN
  wallCabinets: { depth: 0.35, bottom: 1.45, top: 2.25, hood: 1.6 },
  // shadows follow the visitor into a visited flat (main.js): the sun's shadow box is centred on it within `near` m
  near: 9,
  // draw calls (#574, visitunit.js `cull`): farther than `detail` m from its footprint only its walls, floors, ceilings and
  // window frames are drawn (no doors, fittings, glass); from inside our flat or under the ground none of it (our pick)
  detail: 12,
};

export const AO = {
  floor: { strength: 0.4, radius: 0.2 },
  ceiling: { strength: 0.3, radius: 0.3 },
  // #1074: on the walls themselves — a band above the floor, one below the ceiling and a column down
  // each inner corner (multiplied together). Visual values, tuned by eye; `cutoff` = how many radii
  // out the overlay geometry reaches (past it the darkening is under 1 %).
  wall: {
    floor: { strength: 0.3, radius: 0.12 },
    ceiling: { strength: 0.25, radius: 0.2 },
    corner: { strength: 0.3, radius: 0.16 },
    cutoff: 5,
  },
};

export const TAP_LEVER = { seconds: 0.24, angle: 38, pickRadius: 0.075, pickHeight: 0.6,
  side: { height: 0.07, offset: 0.037, length: 0.085, radius: 0.0042 },
  top: { length: 0.075, width: 0.016, thickness: 0.005, height: 0.014 },
  joint: { radius: 0.0135, length: 0.02, segments: 18 } };

export const LIGHTING = {
// Static daylight (#16, from original e77fe5e2 LIGHTING.sky, src/main.js). This view has no day cycle and no shadow map,
// so the sun lights every surface facing it, indoors too. Balanced instead of copied: less flat ambient/fill and a
// stronger sun, scaled so rooms keep about the same mean brightness. Sunlit vs shaded brick 1.07 -> 1.29 in the
// street/courtyard views; L1007 rooms within ~2 % and sun-facing inner walls +1 %. Was hemi 2.6, ambient 1.3, sun 2.6,
// fill 0.8. Tuned by mean luminance in Chrome; *guess*.
sky: {
    hemi: { sky: 0xf1f7ff, ground: 0xabb69a, intensity: 3.0 },
    ambient: { color: 0xfff5e7, intensity: 0.75 },
    sun: { color: 0xffefd8, intensity: 5.25, pos: [-20, 50, 25] },
    fill: { color: 0xe2edff, intensity: 0.5, pos: [10, 15, -20] },
},
pool: 4,
switchHeight: 1.05,
ceiling: { intensity: 2.4, range: 6, color: 0xffe2b8 },
spots: { intensity: 2.0, range: 4, color: 0xfff0dc },
pendant: { intensity: 2.2, range: 5, color: 0xffd9a8 },
floorLamp: { intensity: 1.6, range: 5, color: 0xffd59a },
mirror: { shade: 0.3, reflect: 0.85, glass: { emissive: 0x262626, roughness: 0.3 }, light: { intensity: 0.9, range: 3, color: 0xfff1de } },
auto: { on: 0.3, off: 0.4, fade: 1 },
poolFade: 0.4,
poolPick: { otherRoom: 3, hidden: 6, stick: 1.5, behind: 1.6, near: 1.5 },
wash: { rays: 192, facade: [0.465, 12.234] },
wetRooms: ['Badrum', 'WC/dusch'],
manual: [
    { level: 0, room: 'Hall', x: 1.95, z: 0.465, normal: [0, 1] },          // by the front door
    { level: 0, room: 'Kök / matplats', x: 2.15, z: 1.65, normal: [1, 0] },  // under the wall shelves
    { level: 0, room: 'Vardagsrum', x: 3.4, z: 7.8, normal: [0, 1] },
    { level: 1, room: 'Hall', x: 2.65, z: 5.13, normal: [0, 1] },           // between the bedroom doors
    { level: 1, room: 'Klk', x: 4.85, z: 4.28, normal: [0, 1] },
    { level: 0, room: 'Klk', x: 3.35, z: 5.55, normal: [-1, 0] },        // outside, by the door (it spans the whole Klk)
  ]
};

// Shared clipped hedge relief and colours; all visual assumptions, reviewed from upstream #1143.
export const HEDGE = {
  bumpScale: .32, fineScale: .11,   // dent noise wavelengths (broad lumps, small tufts)
  outward: .72,                     // noise level at the clipped face: dents go mostly inward (the outline stays in the footprint)
  footRise: .14, footPinch: .14,    // the bottom 14 % of the height pulls in by up to 14 % (bare stems under the foliage)
  footShade: .45, footDark: .5,     // the lower 45 % darkens towards half brightness at the ground
  dentShade: .8, topLight: 1.08, topWarm: 1.04, // dents darker, the sunny top a little fresher and warmer
  tone: .22, toneScale: 5, patch: .14, // slow per-hedge tone (≈ 5 m), smaller patches (0.5 m)
  stemRise: .4, stemDensity: 9, stemColor: 0x6b5236, // brown stems in leaf gaps in the lower 40 %, ~9 per m
};
export const PATIO = {
hedge: { height: 1.1, rounding: .065, footScale: .86, topNoise: .03, waveLength: .8,
    color: 0x78a64b, texturePeriod: .48, bump: .012, roughness: .95, segments: 2, cell: .14, dent: .07 },
paving: { slab: 0.4, joint: 0.008, color: [184, 181, 175], jointColor: '#6f6b65' }
};

export const NEIGHBOR_OPENINGS = {frame: .06, depth: .1, sash: .045, sashDepth: .04, sashOut: .03,
  // #569: ABC trim divisions follow the existing facade atlas; depths are illustrative.
  site: { frame: .05, sash: .025, gasket: .008, paneOut: .032, sashOut: .04,
    frameOut: .025, frameDepth: .045, division: .62, transom: .78, frameColor: 0xf0efeb },
  gasket: .006, gasketColor: 0x202626, gasketRoughness: .85, patioRail: .07, patioBottom: .1, floorTolerance: .12,
  reflectionSize: 128, glassColor: 0x65818b, roughness: .07, metalness: .45, clearcoatRoughness: .04,
  sky:'#87b5d3',horizon:'#e1e8e5',ground:'#657567',groundDark:'#303e37',silhouette:'#637e83',
  reflectionDay: 1.4, reflectionNight: .12, hinge: .012, hingeHeight: .085, hingeYs: [.25,1.05], hingeTop: .2, hingeZ: [-.04,-.025],
};

// #1076: Hus L's façade windows sit in brick (or render) reveals with a sheet-metal sill flashing, as on Peab's
// courtyard illustration (docs/peab/hus-l-gardsfasad-illustration.png, not dimensioned). `frame` = the window frame's
// centre behind the façade face: L1007's own frame position (world.js), kept so the blinds and window boards inside stay
// where they are; the neighbours' windows are set back to the same plane. `frameHalf` = half the frame's depth (world.js
// addWindowFrame, NEIGHBOR_OPENINGS.depth): the visible reveal is frame − frameHalf deep. `pocket` = how far the
// neighbours' simplified masses leave the reveal open (to the frame's back face), `margin` its clearance round the hole.
// `sill`: the flashing (plåt; the illustration shows light sills, not a rollskift) `out` beyond the façade, `drop` below and
// `rise` above the opening's bottom, `ear` past each jamb. `inset`: L1007's own reveals sit this far inside its wall faces
// (no coplanar flicker); `visitGap`: a visited upper flat's own sheet stops short of the courtyard façades (L1201: 11.099
// vs 11.129 m deep, src/l1201plan.js), its reveals reach that much further. Every size is a *guess*: Peab's material
// gives no reveal or flashing details.
export const HUS_L_REVEAL = { frame: 0.1, frameHalf: 0.05, pocket: 0.15, margin: 0.01, inset: 0.002, visitGap: 0.03,
  sill: { out: 0.045, drop: 0.035, rise: 0.012, ear: 0.02 } };

export const SHOWER_FITTINGS = {
  hoseSegments: 48, hoseRadius: 0.007, safetyColor: 0xbf2d24,
};

// Floor drains in the wet rooms (original #1072): a square stainless grate in a frame, flush-looking on the tiles. Peab's material
// gives no drain model or position, so every value is a *guess* (a usual Swedish 200 mm drain frame with a ~150 mm grate).
// `size` = frame outer edge, `grate` = grate/recess edge, `bars` = slots' bars across the grate, `h` = how far the frame
// stands above the floor tiles (visual only: the collision floor stays flat). Showers get theirs at `shower` (fractions of
// the plan's shower rectangle, 0.5 = centre); rooms with machines but no shower get one `laundryGap` m in front of the
// washer/dryer run, centred along it.
export const FLOOR_DRAIN = { size: 0.2, grate: 0.15, bars: 8, h: 0.005, shower: { u: 0.5, v: 0.5 }, laundryGap: 0.35 };

// Bounded startup data recovery, adapted from original issue #1065; safeguards, not device measurements.
// stepYield (#39, from the original's d9d9abb, *guess*): longest wait for a frame after a loading step, so a throttled tab
// is not held up. stallSeconds (#39, from 397d1cd, *guess*): one step lasting this long shows "Det här tar ovanligt lång
// tid" with Försök igen (literal stallMs in index.html); well above a normal phone "Bygger huset".
export const STARTUP = { dataTimeout: 5000, planTimeout: 15000, dataAttempts: 2, retryDelay: 250, stepYield: 50, stallSeconds: 40 };

// Clock readability proportions are visual assumptions; original tower dimensions remain unchanged.
export const TOWER_CLOCK = {
  textureSize: 256, segments: 32, dialOffset: .06, handOffset: .11, handSeparation: .005,
  hourLength: .56, minuteLength: .84, hourWidth: .18, minuteWidth: .12,
  tickRadius: .91, tickLength: .17, tickWidth: .045, numeralRadius: .54, numeralSize: .36,
};

// Distant ground shadows (#1079, src/groundao.js): the sun's shadow box only covers ±14 m round its target, so trees and
// façades further away get a baked soft darkening on the ground instead — a disc under each tree and a thin band along
// each wall foot, one multiply-blended mesh. All values are visual choices (*guess*, tuned by eye on screenshots).
// `tree`: darkening at a crown's centre (0 = none, 1 = black), `bare` its share left in winter (bare branches: × leaves),
// `spread` × the crown's radius for the disc's radius, `rings` / `segs` its polar grid; `wall`: darkening at the wall foot,
// `width` m of the band, `step` m between its vertices along a wall; `lift` m over the ground; `maxStep` m: triangles that
// would bridge a height jump (a retaining wall, the box edge) are dropped; `fade`: the shadow map's texture-space edge
// distance (0 = its centre, 1 = its rim) over which the baked shadows fade in, so nothing is darkened twice.
export const GROUND_AO = {
  tree: 0.65, bare: 0.3, spread: 1.15, rings: 3, segs: 12,
  wall: 0.5, width: 1.0, step: 3,
  lift: 0.03, maxStep: 0.45, fade: [0.72, 0.95],
};

// #1077: Hus L's downpipes (exterior.js downpipes). Peab's courtyard illustration (docs/peab/hus-l-gardsfasad-illustration.png,
// not dimensioned) shows dark pipes in the seams between the brick volumes and beside the core's raised part; nothing on the
// street side is drawn. Every number here is a *guess*: pipe radius `r`, axis `standoff` m out from the brick, `sides`;
// each pipe stands `offset` m from its seam (the strip boundary between two flats: `between`, 'core' for the stair core)
// on `side` (−1 west, +1 east; clear of the patio screen walls on the party lines); `loft`: `loftOffset` m beside the east
// wall of L1205's loft over the lift (#349), from its roof down. Street pipes drain the loftgång deck (from under its fascia), the
// courtyard ones the roof terraces (a rainwater head `head` under the parapet's coping); clips every `clip` m; at the
// ground a `shoe` (utkastare) bends `out` m away from the wall over its last `h` m. A pipe closer than `clear` m to a
// window, door, portik or wall light is left out (a console warning). They join the wall lights' dark housing mesh
// (no extra draw call); collision: a thin box round the foot only.
export const HUS_L_DOWNPIPES = {
  r: 0.05, standoff: 0.1, sides: 8, offset: 0.3, loftOffset: 0.12, clear: 0.12, clip: 1.8,
  head: { w: 0.24, h: 0.22, d: 0.2 }, shoe: { h: 0.3, out: 0.22 },
  street: [{ between: ['L1002', 'L1003'], side: -1 }, { between: ['L1004', 'core'], side: -1 }, { between: ['core', 'L1005'], side: -1 },
    { between: ['L1006', 'L1007'], side: -1 }],
  court: [{ between: ['L1002', 'L1003'], side: -1 }, { loft: true, side: 1 }, { between: ['L1006', 'L1007'], side: -1 }],
};

// FTX ceiling valves (#1080, src/world.js `ceilingVents`): Peab names a "lägenhetsaggregat typ FTX" with mechanical supply
// and extract air (the information brochure and the Q&A, see #1080) but no sheet shows the valves, so every value here is
// a *guess*: a white round disc valve (a usual Ø125 duct: a ~Ø160 collar on the ceiling, a disc hanging below it on a
// neck), supply air in the bedrooms and living rooms (`supply`, room-name prefixes), extract air in the wet rooms, laundry
// and kitchen (`exhaust`). One per room, placed automatically from the room's centre (where a ceiling lamp would hang):
// `offsets` m away, first towards the flat's middle (away from the façade), then along it, then diagonally, then towards the façade —
// the first spot that keeps `wall` m from every wall (clear of the ceiling's contact shadow, AO.ceiling), `cabinet` m from
// fitted cabinets (the kitchen hood, wall cabinets, wardrobes), `lamp[0]` m from the room centres and the wet rooms' spots / the laundry's globe (`lamp[1]` where no spot keeps that),
// `hole` m from the stair opening and does not straddle a soffit's edge (`soffit`). Sizes in metres.
export const VENTS = {
  supply: ['Sovrum', 'Vardagsrum', 'Allrum'],
  exhaust: ['Badrum', 'WC/dusch', 'Tvätt', 'Kök / matplats'],
  collar: { r: 0.08, h: 0.01 },                            // the ring against the ceiling (its top 2 mm under the ceiling plate)
  neck: 0.045,                                             // the neck's radius between the collar and the disc
  disc: { supply: { r: 0.068, h: 0.008, gap: 0.012 }, exhaust: { r: 0.055, h: 0.01, gap: 0.02 } }, // the disc: radius, thickness, gap under the collar
  cap: { r: 0.55, h: 0.004 },                              // the raised centre of the disc (fraction of its radius, thickness)
  color: 0xf8f8f6, roughness: 0.45,                       // white plastic, a touch whiter and glossier than the painted ceiling
  slot: 0x8d908f,                                          // the shadowed slot round the neck (vertex colour, no extra material)
  segments: 24,
  offsets: [0.8, 0.6, 1.0, 0.45, 1.2, 0.35],
  wall: 0.25, cabinet: 0.12, lamp: [0.4, 0.25], hole: 0.3, soffit: 0.05,
};

// Own touch layout (#30, from upstream 1af9b39 / original #1090; src/touchlayout.js; *guess* ranges chosen by eye):
// size factors for the buttons (0.8 keeps the 56 px action row at about 45 px) and the walking stick, opacity so a
// control never vanishes, the largest offset from its slot (× the screen's short side), and px kept clear of the
// safe edges and the top controls.
export const TOUCH_LAYOUT = { buttonScale: [0.8, 1.6], stickScale: [0.7, 1.5], opacity: [0.3, 1], maxOffset: 3, margin: 4 };

// #35 (from the original's PATIO_DECOR at 2190e17, original #888/#1120): generic furniture on the neighbours'
// ground-floor patios on Hus L's back (src/patiodecor.js, models in src/outdoordecor.js; decoration only). EVERY style,
// colour and position is a *guess* — no neighbour's patio is documented. The `styles` are dealt out over the patios in a
// seeded shuffle (`seed`; all different while there are enough); each layout picks its colours from `palette`, may be
// mirrored across the free zone and shifts up to `jitter` m. L1007 is skipped: the shown flat stays unfurnished.
// Local frame: u m east of the unit origin ox, v m south of the south façade D. The patio door (u 0.95–1.87, `door.depth`
// out) and the passage to the hedge opening (`passage` u 0–1.9) keep clear: furniture stands in `zone` (in front of the
// patio hedge at v ≈ 4.05). Chairs face their table, sofas have their backs to the façade. `hue`: the pot plants' leaf
// colour varies ± this much (the original's TERRACE_DECOR.hue). `far`: hidden beyond this many metres.
export const PATIO_DECOR = {
  skip: ['L1007'], far: 140, seed: 1120, jitter: 0.15, hue: 0.025,
  door: { x0: 0.95, x1: 1.87, depth: 1.1 },
  passage: { x0: 0.0, x1: 1.9 },
  zone: { u0: 2.1, u1: 5.55, v0: 0.2, v1: 3.75 },
  fence: { u0: 0.08, u1: 5.67 }, // the screen walls either side (plan.json site.fences) — plant crowns stay inside
  styles: ['bistro', 'matgrupp', 'lounge', 'solstolar', 'grill', 'odling', 'grönska'],
  palette: {
    frame: [0x2a2c2e, 0xf1efe9, 0x3c5a45, 0x2f5d9e, 0x9a9da0, 0xb04a32],
    wood: [0xa77b4f, 0x8a6a48, 0xc19a6b, 0x6e5440],
    cushion: [0xe2b33c, 0xc9472f, 0x5d7f4f, 0xe9e4d8, 0x2f5d9e, 0x9a9da0, 0xd98aa0],
    pot: [0xb5643c, 0x2e3133, 0x6b6f6a, 0xf3f0e8, 0x7a5a44],
    parasol: [[0xf6f4ee, 0x2f5d9e], [0xe9e4d8], [0xc9472f, 0xf6f4ee], [0x5d7f4f, 0xe9e4d8], [0xe2b33c, 0xf6f4ee], [0x2a2c2e]],
    rug: [[0xf2efe6, 0x2f5d9e], [0x4f6b43], [0x9a9da0, 0xe9e4d8], [0xc9472f, 0xf2efe6], [0xd8cdb5]],
    flowers: [[0xd8262f, 0xe8484f], [0xf5f2ee, 0xf2c522], [0xd98aa0, 0xf5f2ee], [0x8a5fb8, 0xb59ad8], [0xe08a2c, 0xf2c522]],
  },
};

// Camera near plane (src/main.js `updateCameraNear`, from the original's #1276, dd9927ef): the 24-bit depth buffer resolves about
// d²/(near·2²⁴) m at distance d, so with near 0.06 m coplanar layers (window panes 1–7 cm in front of a façade, roofs, ground
// overlays) shimmer at 300 m. Indoors (flat, stairwell, garage, roofs and aloft) the near plane stays `min` (the camera's
// construction value); on the open ground it is `outdoor` m, capped so the near plane's far corner stays inside the body radius
// (`BODY.radius` 0.22 m in src/navigation.js: the player stops that far from a wall, so no wall is ever cut). No flying here.
export const VIEW_NEAR = { min: 0.06, outdoor: 0.12, bodyRadius: 0.22 };

// Depth bias for window glass drawn a few cm in front of a façade (#1276, src/neighborglass.js, sitebackdrop.js, southbackdrop.js):
// polygonOffset counts depth-buffer steps, so unlike the 1–7 cm geometry inset it keeps winning at 300 m (one step ~10 cm). *guess*:
// 2 steps pull a pane ~20 cm at 400 m, less than any reveal or neighbour wall.
export const DECAL_OFFSET = { factor: -1, units: -2 };

// The pony paddock (original #1280/#1295, src/paddock.js, src/paddockgeo.js): the kidney-shaped meadow south of the timber footbridge (OSM landuse
// way `field` below, SITE.south.fields) is fenced in and holds two C ponies. Everything here is a *guess* (no survey): `inset` m from the mapped outline to the fence line; post-and-rail fence `post`/`rails`/`rail` sizes (m, rail
// heights above the ground), `postStep` m between posts; the closed `gate` (m wide, never walkable, collision like the rest of the
// fence) sits at the span nearest `gateNear` (the footpath along the north-east edge). C pony withers 1.27-1.37 m: `pony.withers`
// 1.32; `speed` walk m/s, `turn` rad/s, `graze`/`idle` [min, max] s per pose; ponies come to the fence when the eye is within
// `curious` m (never nearer than `keep` m to the fence line); `viewDist` m from the paddock centre beyond which the ponies are
// neither simulated nor drawn; `waypoint` m grid of places they walk between (flat, clear of trees, the river and the fence).
// `track` m wide worn ribbon inside the fence. Two anonymous ponies: one light grey, one bay with a star.
export const PADDOCK = {
  field: '237019759', inset: 1.2, postStep: 3, post: { w: 0.13, h: 1.3 }, rails: [0.55, 0.95, 1.25], rail: { w: 0.06, h: 0.12 },
  gate: { w: 3.2, near: [-116.2, 219.98] }, track: { w: 0.9, inset: 3.2, color: 0x80724c }, color: 0x7f9a4f,
  wood: [0x8a6a45, 0x7d5f3d, 0x94754d], waypoint: 5, treeClear: 2.6, riverClear: 7, maxSlope: 0.3, viewDist: 280, curious: 40, keep: 2.5,
  pony: { withers: 1.32, neck: [0, 1.12, 0.55], speed: 0.85, turn: 1.4, graze: [6, 16], idle: [3, 8], gap: 2.2,
    animals: [{ coat: 0xdddbd5, accent: 0x93918c, seed: 7 }, { coat: 0x7a4426, accent: 0x1b1410, seed: 19, star: true }], // grey/white with a lighter-grey mane, tail and legs; bay with black points and a white star
  },
  // Grazing (#1315, all *guess*): the paddock's long grass is ONE instanced mesh of crossed-blade tufts (a jittered grid every `spacing` m, `w` m wide,
  // `colors` base -> tip) whose height the vertex shader takes from a coarse `cell` m grass-length mask (0 grazed .. 1 long): `long` / `short` m tall. A grazing
  // pony's muzzle (`reach` m ahead of its body, only with the head down) eats a `bite` m radius at `rate` mask units/s; the grass regrows `regrow` units/s
  // (slow, so the pattern lasts for a session); the mask starts per session with `patches` grazed patches of radius `radius` m (min, max) at level `level`,
  // plus `around` m round the trough and the shelter (the ponies stand there most). Ponies prefer a long-grass place to graze (`tries` random places, best
  // mask) and walk on when the grass under them is shorter than `hungry`. `period` s between mask uploads.
  grass: { cell: 1.5, spacing: 1.3, w: 0.8, long: 0.5, short: 0.03, colors: [0x35601c, 0x8ba94a], reach: 1.15, bite: 1.3, rate: 0.6, regrow: 1 / 4000,
    patches: 10, radius: [4, 9], level: 0.05, around: 4, tries: 4, hungry: 0.35, period: 0.15, margin: 1.6 },
  trough: { w: 1.7, d: 0.5, h: 0.42 }, shelter: { w: 4.2, d: 2.6, h: 2.3,
    // Original #1335/#1336 (all *guess*): the shelter stands where the ground under its footprint (+ `pad` m round it) varies by at most `maxRelief` m (the old spot dropped 0.7 m, so one side hung in the air
    // over the slope), at least `edge` m inside the fence; the posts/sill reach down to the lowest ground there (`sink` m below it), the floor level is the highest ground.
    maxRelief: 0.2, pad: 0.8, edge: 8, sink: 0.15 },
  // Shade trees (original #1316, all *guess*): big trees in the meadow, [x, z, scale] like `SITE.bigTrees` (surroundings.js builds them as kind 'big': the shared crown/trunk batches,
  // so no extra draw calls; their trunks block through `treeFeet` like every other tree); at least 10 m inside the fence and 25 m from the gate (paddockgeotest checks).
  trees: [[-170, 247, 1.2], [-215, 270, 1.3], [-235, 293, 1.15]],
  // Weather (original #1316, src/paddockshelter.js; all *guess*): rain (0..1, fed to `Paddock.update`; this project has no weather of its own, so only `?paddockrain=` and tests drive it) of at least `on`
  // sends ponies to a sheltered spot, until it has been under `off` for `dry` s; each rain a pony goes with probability `chance` (at least one does, the others may stand out in it). A sheltered spot
  // is under the shelter's roof (two, at +-`shedX` m across it) or on a ring of `ring` x tree scale m round a tree (under the crown, clear of the trunk; `treeSpots` of them each). In the snow months
  // (SEASON.snowMonths: the ground is white) the ponies are not in the paddock: they walk to the shelter and are gone ("in the stable"), and come out of it again when the snow is gone.
  rain: { on: 0.12, off: 0.03, dry: 20, chance: 0.8, ring: 2.3, treeSpots: 4, shedX: 0.9 },
  // the stile beside the gate (#1295, *guess*): `w` m wide, `minSpan` m the fence span it needs, three risers of `rise` m (under PLAYER.stepUp 0.45, so the ordinary
  // stepping walks it) over two treads of `tread` m either side of a platform that is 2 × `platform` m long; `reach` m from the fence line to the walls' ends
  stile: { w: 1.0, minSpan: 1.9, rise: 0.38, tread: 0.3, platform: 0.25, reach: 0.95, post: 0.95 },
};
