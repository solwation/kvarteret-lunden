# Grunda kakelfogar — public #292

Publik integrerad produktkälla: `d83d348c54a188f986694f556279d7ca85056da5` (fångad arbetarkälla `7ed64b656e1a7f92ae5422118f9cb882a2f82576`), jämförd med publik bas
`f4afd632ae8eb9f4f8cc6c07164f00f4dc60e954`.
Selektiv originalkälla: `0fd6db633ed861c1f8cf3d1f1829630b3b5963df` (#2070).
`source.json` binder exakt källkod, planer, kontrollfiler, bildhashar och byggfingeravtryck.
Neutral helper och strukturellt Node-test är byteidentiska med den granskade källan.
Övriga filer är publicens egna; endast materialanropen och TILE_SURFACE läggs till.

## Egna granskade bilder

Före är till vänster, efter till höger; raderna visar stänkskydd, våtrumsvägg och golv:

- [L1007](l1007-paired.png): publicens befintliga fasta inredning och finish.
- [L1004 standard](l1004-paired.png): publicens standardmaterial och delade plan.
- [L1201 standard](l1201-paired.png): den egna publika planen och galley-/våtrumsfit.

Fogkanterna får en svag ljusreaktion, keramiken behåller sin kulör och färgfläckar blir
inte gropar. Ytan använder 0,8 mm bump, 1,2 mm mjuk plattkant (minst 0,75 texel) och
mattare fog med roughness 0,96. Detta är visuella antaganden, inte uppmätt profil.
Färggeneratorns enda kantkorrigering ritar den andra halvan av vertikalfogen även på
motsatta repeatkanten; just dessa färgtexlar är avsiktligt inte byteidentiska före/efter.
Plattmått, fogbredd, halvförband, palett, seed/marmorering och nominell keramikroughness består.

Bilderna är från faktiska `buildInterior` och `buildStandardInterior`, publicens eget
`data/plan.json` och `L1201_PLAN`/`L1201.kitchen`, i en avgränsad komponent med verkliga
planväggars bounding boxes. Kameror och ljus är identiska mellan faserna: en riktad lampa
plus hemisphere, NeutralToneMapping, 1100×720, DPR1, MSAA, Chromium/SwiftShader.
Komponenten bygger endast fast inredning; den är inte en full World-/Navigation-/mätvy,
lägenhetsinteraktion eller fysisk telefonkontroll. Världsbelysning och LOD provas inte här.
Ingen originalbild, personlig resurs eller originalplan förs över.

## Tre kontrollgrupper

1. `npm test` och `npm run build`: gröna. 150 moduler granskas, importgrafen bundlas,
   publika innehålls-/lagrings-/tjänstegränser samt CSP/appidentitet kontrolleras.
   Byggfingeravtryck `f37b97495a7675c449d2a029`. Inga nya beroenden eller externa resurser.
2. `node --test tools/tilesurfacetest.mjs`: **3/3 pass**. Fogarnas meterskala och
   halvförband inklusive repeatkanter, mjuk övergång, roughness, determinism och höjdens
   oberoende av färgbrus. Inga fogar ger plan höjd.
3. En egen browserkörning, **9 matchade vyer per fas**, inga sid-/shader-/konsolfel eller
   externa requests. Sju verkliga material har samma mapstorlek/repeat; bump och roughness
   delar en registrerad linjär karta. Palettkonfigurationen och alla byggarnas sammanfogade
   geometriattribut/index är bytehashidentiska, inklusive UV. Inga Storage-metodanrop;
   local/session-sentineller och hela befintliga lagringsinnehållet förblir identiska.
   Detta är komponentisolering plus statisk publik gränskontroll, inte ett nytt full-app-nätprov.

   | Byggare | Meshes före/efter | Trianglar före/efter | Geometribyte före/efter |
   | --- | ---: | ---: | ---: |
   | L1007 | 118 / 118 | 26 624 / 26 624 | 1 411 520 / 1 411 520 |
   | L1004 standard | 44 / 44 | 18 020 / 18 020 | 957 080 / 957 080 |
   | L1201 standard | 39 / 39 | 10 944 / 10 944 | 604 384 / 604 384 |

   Alla matchade renderantal är identiska, exempelvis stänkskydd L1007 28 calls/19 748 tri,
   L1004 21/16 664 och L1201 16/9 892. Fulla värden och hashresultat finns i `browser.json`.

Sju extra RGBA-kartor: **1 544 000 basbyte / 2 058 192 byte med alla mipnivåer**.
R = strukturell höjd, G = absolut roughness, delad bump/roughness per material. Samma
upplösning, repeat och anisotropi 4 som färgkartan. Ingen ny geometri, draw, lampa, pass
eller uppladdning per bildruta; native bump-/roughnesssampling ökar fragmentarbetet.
Oförändrade drawantal är inget FPS-/GPU-tidslöfte. Wrapperns topp: 587 MiB.
Råa förebilder sparas inte, bara de egna jämförelsearken. Första browserkörningen var grön.

## Återskapa

Servera repositoryroten på 8187 med ordinarie npm-beroenden installerade. Kör med värdens
browserwrapper och dess Playwright-/Chromium-val:

```sh
npm test
npm run build
node --test tools/tilesurfacetest.mjs
node tools/tilesurface292-check.cjs http://localhost:8187 docs/verification/292
```

README är ändringsnotis; publicen har ingen separat besökarchangelog. `docs/upstream.md`
registrerar selektiv import och licensgräns. Dirigenten äger publicering, SHA-pinnad
bildkommentar, faktisk Pages-verifiering och stängning; ingen arbetarpush har gjorts.

## Integration

Tidigare public291-kod och samtliga config-/README-bytes bevarades; endast namngivna292-tillägg infogades. Konsumenter/hjälpare/fixtur/planer är byteidentiska med browserkällan. Full config-/byggfingeravtryck i den fångade evidensen är historiska; integrerat bygge c11cd143b01f01a4c1176802 och npm test151moduler är gröna. Ingen omkörning av källbunden browser efter orelaterad parkettintegration.
