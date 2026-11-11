# Generic mallard appearance (#266)

Selective original source: `2482f29e1e624e9948b6055e4efdc1a0328569e0`
(original #1909). Only generic visible refinements are adapted into the existing
public procedural `duckModel`: smaller eyes, tapered low tail, folded wings with
blue speculum, short leg connectors and the male white collar/brown chest. Female
mottling and eye stripe remain. No GLB, skeleton, runtime animation migration,
feeding, personal content, audio, interaction, score or service is imported.

The consumer remains public `Ducks`, two cached sex geometries and one vertex-colour
material. Four visible birds remain four draws. Triangles rise from 2560 to **3712**
(male960/female896, two of each; +1152), below the scoped4000 cap. The obsolete
identical-sex-topology assertion is replaced by that honest cap and existing exact
bill parity. near65/draw100, AI, habitat, kiss contacts and all other code/config
are unchanged. No global frame rate or phone performance improvement is claimed.

Verification:

- Existing duck tests: 3/3 pass — both sexes' exact bill equality, public-only
  dependencies, seeded mates/grouping/terrain and real bill contact/return/cancellation.
- `npm test`:139 modules/import graph, architectural plans, same-origin network and
  identity/icon contracts pass. `npm run build`:pass, build638e3cad03acf19964975e85.
- `tools/duckappearance-check.mjs`: whole front/side/oblique views of actual
  `duckModel`, plus real built public scene with actual `Ducks` and natural pair
  positions. Four birds/3712tri/two geometries/one material; zero page errors or
  external requests, original local/session sentinels unchanged. The component
  camera was adjusted to rotate each bird separately (avoid overlap), then only
  those three views were recaptured. No repeated full scene run.

All four result PNGs were opened and visually reviewed. Models remain stylised
low-poly mallards, now with the requested visible details. Actual scene includes
both sexes beside the river bank. Isolated whole views clarify the full silhouette.
No physical phone or global navigation claim. Logs and browser.json are retained.
Actual Pages run/version acceptance is recorded on the issue after Refs publication.
