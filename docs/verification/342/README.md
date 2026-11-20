# Höje å speglar himlen, krusningar följer strömmen — public #342

Granskad accepterad originalkälla `7e6b16b63e14bb419dfa80de3f2473c6105cbecd`
([original #2186](https://github.com/solwation/lunden-3d-apartment/issues/2186)). Publik baseline: `a08a6f3`.

Överfört och anpassat: Fresnelvägd himmelsreflektion i indirekt spegelljus (ingen env-map, ingen pass, av underifrån),
mörkare/grönare reflektion mot stränderna, och närkrusningar i flodens egen ram (`riverFlow`/`riverShore`) som flyter
nedströms ca 0,4 m/s. Värdena (`RIVER_SURFACE.sky/bank/flow`) är *guess*. Publiken saknar dygnscykel och
`wetground`-uniformer, så himlen är publikens egen fasta: horisont = scenens bakgrund/dimma `0xcbd9dd`, zenit =
`LIGHTING.sky.hemi.sky`; krusningsklockan är en liten modulägd uniform som `stepRiverFlow(dt)` stegar i huvudloopen.
Bara närvattnets bridge-strip får flödet; fjärrvattenplanen får reflektionen men förblir stationära. Publikens FrontSide behålls.

Enhetstest `tools/riversurface2186test.mjs` (6) + `riversurface303test.mjs` (3) passerar. Browser: `tools/riversurface342browser.cjs`
mot #303-fixturen med verkliga `buildRiverBridges`. Före/efter är oförändrat 8/6/6 draws, 161701/154189/154189 trianglar,
3 texturer, 6 program, inga fel. Bilder: `before/before-*.jpg`, `after-*.jpg`, `after-*-later.jpg` (klockan +2,5 s).
