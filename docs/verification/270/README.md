# #270 — neutral continuous mallard surfaces

Selective original source: `a963287ffaacad8fa405f91c086752255aefcb2d` (#1921). Public baseline: `11d67b945daccf36f90e27cd4420b19b2ec1903f` (already includes #266). Only the generic loft body, neck/head/bill, folded wings/tail, webbed feet and vertex-colour plumage are adapted to public `duckModel`. New visual assumptions and density controls live in `DUCK_SURFACE`.

The public factory has no skinning, joints, rig cache, animation clips, GLB or loader. Original collection/cache work (#1931), interactions, feeding/catching, sound, names/images, storage, Cloudflare and services/history are excluded. The public four anonymous birds/two seeded pairs, sizes, sex identity, passive brains, ground/water/walk/bob/waddle, local mate greeting and existing heart pool are unchanged. No new asset, texture, light, material or per-frame geometry allocation is added. Existing source attribution and Three.js MIT text are retained; no new third-party license applies.

## Locked local budget and measured costs

The initial claim's 1,312-triangle figure described the selected original recipe. It was not the measured public baseline. Root approved the local cap of four body draws, 5,248 body triangles and at most 87,765 bytes in the two-geometry raw-buffer union before implementation. This delivery uses 68,592 bytes.

| Actual body geometry | Before | After |
| --- | ---: | ---: |
| Male triangles / unique bytes | 960 / 34,920 | 1,312 / 34,296 |
| Female triangles / unique bytes | 896 / 32,592 | 1,312 / 34,296 |
| Four submitted bodies | 4 draws / 3,712 triangles | 4 draws / 5,248 triangles |
| Union of two shared sex geometries | 67,512 B | 68,592 B |
| Shared body material / model assets | 1 / 0 | 1 / 0 |

The explicit cost is **+1,536 submitted triangles** (+41.38%) and **+1,080 retained raw geometry bytes** (+1.60%), with unchanged body draws. Each new geometry has 734 used vertices, three Float32×3 attributes of 8,808 bytes each and a 7,872-byte Uint16 index. The old model retained more unshared sphere seam/pole vertices. Do not multiply shared buffers by four, call these GPU totals or infer a global memory/FPS win. The optional pre-existing heart effect separately retains 120 geometry bytes and a 64×64 canvas texture (16,384 RGBA bytes before implementation/mipmap copies); it is not new. [Absolute resource accounting](resource-cost.json).

All three exact old public Float32 bill anchors remain:

- front Z: `0.5541267991065979`
- centre Y: `0.5800000131130219`
- front half-height: `0.010815590620040894`

Both sexes' position/normal/colour/index buffers match the selected original neutral default recipe byte for byte. Only the original unused default-build skin bookkeeping and optional rig/export interface are removed. [Geometry hashes, finite/index/bounds and old bill parity](geometry-equality.json). [Unchanged public source hashes and frozen baseline proof](source-identity.json).

## Three scoped verification groups

1. Mandatory `npm test` passes: 140 modules, import graph, architectural plans and same-origin/identity/icon contracts. `npm run build` passes, fingerprint `aab2b5b45d4d8aa299f14475`. No install was run: the pre-existing public node_modules was a read-only-use symlink after identical package-lock SHA-256 verification; it was removed at handoff. [Test](npm-test.txt), [build](build.txt).
2. Focused model/behavior: existing `node --test tools/duckambienttest.mjs` passes 3/3. Only its deliberate old 4,000-triangle body cap changes to 5,248. All other import-boundary, seed/pair/grouping/return, terrain, bill/contact/cooldown and hidden/far cancellation assertions remain. Native geometry comparison verifies finite arrays, valid indices, complete bounds, both sex colours and exact baseline bill parity. `Ducks`, brain, habitat, kiss, hearts, main, old config and lock/license files are byte unchanged. Baseline has no `noducks` flag; no new flag or claim was added.
3. Actual public consumer: `tools/ducksurface270-check.mjs` runs whole front/side/quarter models plus one real source public scene. It compares frozen #266 geometry against the current geometry on the same real Ducks meshes at identical complete model/camera/view/projection matrices, same scale, lighting, viewport, quality and simulation state. Real opaque river and bank geometry provide occlusion. The natural first pair reaches contact at simulated 104 seconds; horizontal tip gap is 0, vertical gap 0.246 mm, within the unchanged 21.631 mm combined front height. Five existing hearts appear and the same pair resumes ordinary movement. Both sexes are shown swimming and later on land. Body on/off in the actual scene submits exactly 4 draws/3,712 versus 4 draws/5,248 triangles. All four model transforms, source attributes and every projected model vertex are finite; intended flock geometry changes actual pixels. Hidden hides bodies/effect, far hides and freezes their coordinates. Zero external requests, WebSocket attempts or accesses to original storage; original local/session sentinels remain exact. [Full matrices, contacts, pixels, gates and isolation](browser.json), [CLI](browser-cli.txt).

The initial `river-normal`/`land` framing placed a tree in front of one bird. Those views are rejected as representative despite positive group pixels, and their image files were removed. The unchanged natural contact and return frames provide unobscured representative normal water/land views; no birds or goals were moved for the images. The initial attempt to import the baseline into built dist lacked an import map; the final real consumer run uses the normal public source entry with its existing local import map and no CSP change. Build acceptance is separate; actual live Pages acceptance remains the integrator's release gate.

## Bounded warm interval

`tools/duckcost270-check.mjs` uses the actual public `Ducks` constructor/update in a minimal isolated 640×480 component with the same static state, four visible birds, one material, camera and light. It swaps only frozen/current geometries, warms eight frames, then measures 30 zero-dt update and render+`gl.finish` samples per phase. Exact before/after matrices match.

| Milliseconds | Before median / p95 | After median / p95 |
| --- | ---: | ---: |
| Actual Ducks.update(0,false) | 0.30 / 0.70 | 0.30 / 0.60 |
| Component render + finish | 0.10 / 0.20 | 0.10 / 0.20 |

These quantized native Chromium/SwiftShader samples establish a bounded matched local interval, not a measurable speedup, global startup/frame rate or physical-phone result. No broad World performance chain ran. [Raw samples and source hashes](warm-component.json).

## Opened and reviewed result images

The first neutral form was reviewed and locked by root before any detail iteration; no further art pass followed. Models remain stylised, with a materially more continuous body/neck/head, lower folded wings and readable webbed feet.

- [Whole front](after/whole-front.png), [side](after/whole-side.png), [quarter](after/whole-quarter.png); matching public before views are under `before/`.
- [Actual river/shore swimming](after/water.png), [natural normal-view bill contact](after/contact.png), [same pair back on land](after/return.png); matching before cameras/states are under `before/`.

All listed images were opened locally. Result images are our own public scene captures; no original photos/screenshots were copied. Required revision-pinned issue images, live HTTP acceptance and Pages release are owned by root. The owned server/browser jobs are stopped at handoff; see `cleanup.json`.

Root reviewed the complete model/config/test/fixture/evidence patch and opened whole/front/side plus actual water/contact/return. [Integration mapping](integration.json) proves exact executed duck sources, scoped central data and every worker evidence/tool file after the unrelated pony/cat/squirrel ports; all those ports and pre-existing config/docs are preserved. Actual current factory buffers were independently rehashed against every selected-original position/colour/normal/index hash and old bill anchors. Initial conflict reconstruction was corrected and its unpublished marker-bearing candidate rejected by bundling before any push; combined npm test/build now pass. Source/input/quality-bound green consumer/resource/CPU evidence is reused without a broad rerun or another art pass.
