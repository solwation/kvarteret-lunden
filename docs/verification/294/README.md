# Små korn i publik asfalt — #294

Integrerad publik produktkälla: `e00cbbccac4728f29d7348faa90c35a2577532f4` (fångad arbetarkälla `db8d9f0c20e7a9794a760d7b47500c8d4a1fc9ee`), jämförd med publik bas
`49af0d2c85eb75f7a45987481c3527c1b93981d9`.
Selektiv originalkälla: `a6bc5b371e52e8bf4d8cba500bcd2790ab9a8858` (#2072),
publicerat originalpaket `f825773e60e33a7d8af2ba914336d61707ec0a5b`.
`source.json` binder exakta källfiler, relevanta befintliga beroenden, kontrollfiler,
byggfingeravtryck och egna bildhashar/dimensioner. Helper och materialtest är byteidentiska
med granskad originalkälla; publicens egna seasons/vertexcompile uppfyller API:erna orörda.

## Egna granskade bilder

Före till vänster, efter till höger. Varje vy är 1100×720 utan omskalning:

- [Asfalt](aggregate-paired.png), 2200×2196: närbild (25 cm höjd), gånghöjd (1,6 m)
  och avstånd (7 m). Små korn syns nära och tonar ned på håll, bred tonvariation är svag.
- [Säsong](season-paired.png), 2200×1476: vinter följt av återställd sommar.
  Vinter-PNG har **exakt samma SHA256 före/efter**. Sommaren återfår samma cachekartor.

Bilderna kommer från publicens faktiska `surroundingsParts` fram till dess befintliga
0.15-yield: verklig emitterad terräng, lokala vägar/trottoarer och marknära byggdelar.
Publicens `buildStreet().object` ger befintliga gatuföremål. Ingen full World, fjärrfond,
brobyggnad eller vegetation laddas; gräsets material är kontrollerat neutralt i fixturen.
Samma kameror, en riktad lampa plus hemisphere, NeutralToneMapping, DPR1, MSAA och
Chromium/SwiftShader används. Detta är produktionskomponent, inte full Navigation-/
walkingSupport-körning, fysisk telefon, faktisk världsbelysning eller hårdvaruprestanda.
Stillbilder bevisar inte frånvaro av rörelseflimmer på varje GPU; mipfilter/anisotropi och
den dämpade avståndsbilden begränsar risken. Inga originalbilder eller privata resurser används.

## Tre kontrollgrupper

1. `npm test` / `npm run build`: gröna. 151 moduler, publika innehålls-/lagrings-/tjänste-
   gränser, importgraf, planer, same-origin/CSP och appidentitet kontrolleras. Byggning
   `a0706efab43a43fe7ffce1c7`. Inga nya beroenden eller externa hämtningar.
2. `node --test tools/asphaltsurfacetest.mjs`: **3/3 pass** för determinism, cache, metric
   UV-fas och verklig `registerSnow`/sommaråterställning. Bump/roughness tas bort bara för
   nya materialet; bred ton ligger under `USE_MAP` och försvinner också under snö.
   `node tools/roadendstest.mjs`: **ALL PASS**, befintliga publika lokala WALK-/vägkontrakt,
   336 skarvprov och noll glipor. Ingen väg-/höjd-/markerings-/navigation-/snökod ändrades.
3. En egen browser, **5 matchade vyer per fas**, första körningen grön. Inga sid-/shader-/
   konsolfel, inga externa requests eller Storage-metodanrop. Alla befintliga local/session-
   värden och sentineller identiska före/efter laddning. Komponentisolering kompletterar
   statisk publik gränskontroll; detta är inte ett nytt full-app-nätprov.

   Den verkliga publika vägmeshens **4 775 trianglar** består (originalets andra vägmesh
   hade 4 777; dess layout kopierades inte). Position/normal/index har exakt samma bytehash.
   Position/normal vardera 171 900 byte; UV förblir 114 600 byte men får metriska X/Z-värden.
   `walkingRoad`-referensen till befintlig walkingSupport och all väggeometri är kvar.

   | Vy | Calls före/efter | Trianglar före/efter |
   | --- | ---: | ---: |
   | Närbild | 17 / 17 | 151 225 / 151 225 |
   | Gånghöjd | 15 / 15 | 151 221 / 151 221 |
   | Avstånd | 15 / 15 | 151 221 / 151 221 |
   | Vinter | 15 / 15 | 151 221 / 151 221 |
   | Återställd sommar | 15 / 15 | 151 221 / 151 221 |

Vinter har null för färg/bump/roughness, färg `0xd9dfe4` och roughness 0,7. Sommarens
materialstatistik inklusive samtliga kart-ID:n är identisk med ursprungligt sommarläge.
Grundfärgen tas fortsatt från publicens `COLORS.asphalt`. Kornstorlek cirka 7 mm, bump 0,45 mm,
roughness 0,69–0,88 och ±3,5% tonvariation är visuella antaganden för vanlig asfalt, inte
uppmätta skador, lagningar eller verklig slitning. Bro-/fjärrvägar och trottoarmaterial ändras inte.

Två extra delade 512² RGBA-kartor: **2 097 152 basbyte / 2 796 200 byte med alla mipnivåer**.
Färg är sRGB, höjd(R)/roughness(G) delar en linjär karta. Cache behålls under snö, endast
materialbindningarna tas bort. Ingen ny geometri, draw, lampa, pass eller uppladdning per
bildruta; färg-/bump-/roughnesssampling och två fragmentsinustermer ökar arbetet.
Oförändrade drawantal innebär inget FPS-/GPU-tidslöfte. Wrapperns topp: 681 MiB.
Bara de egna paired-arken sparas, inga råa förebilder. Alla rutor behåller originalaspekt.

## Återskapa och leverans

Servera repositoryroten på 8190 med npm-beroendena installerade. Kör browserkontrollen
via värdens wrapper med dess Playwright-/Chromium-val:

```sh
npm test
npm run build
node --test tools/asphaltsurfacetest.mjs
node tools/roadendstest.mjs
node tools/asphaltsurface294-check.cjs http://localhost:8190 docs/verification/294
```

README är publicens ändringsnotis, ingen separat besökarchangelog införs.
`docs/upstream.md` beskriver selektiv import och licensgräns. Dirigenten äger integration,
publicering, SHA-pinnad bildkommentar, faktisk Pages-verifiering och stängning.
Ingen arbetarpush har gjorts.

## Integration

Alla tidigare main config-/README-/upstreambytes bevarades plus namngivna294-tillägg. Asfaltkonsument/hjälpare/fixtur/beroenden matchar exakt browserkällan; full config-/byggfingeravtryck där är historiska efter292/293. npm test153moduler och integrerat bygge824accf8ea510f58c1a37e46 gröna. Källbunden browser återanvänds efter orelaterade materialintegrationer.

## Publicering

Kod/bilder `9dfe1bd07545a5b1d78422326a4651d16b9ff79a`; faktiska run-ID [44266562510] success på exakt revision. Alla bilder HTTP200 och inbäddade före stängning: https://github.com/solwation/kvarteret-lunden/issues/294#issuecomment-6973146502. Slutkvittot ändrar inte appkällan; dess separata Pages-run följs av dirigenten.
