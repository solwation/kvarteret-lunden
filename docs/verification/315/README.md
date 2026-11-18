# Public #315: vind i träd, buskar och vass

Publik bas `7911f30`, granskad originalkälla `314c2d93e6474c37a4d7fa2a99369c1b3385a33d` (verifiering `b1a229b`,
[original #2101](https://github.com/solwation/lunden-3d-apartment/issues/2101)). Egna publikbilder från en egen körning i den
riktiga publika appen (`tools/sitewind315browser.cjs`, 1200×800, SwiftShader, `?keepgeo&nocats`). Inga originalbilder återanvänds.
[Browserdata med kameror, draws, trianglar, texturer, program och rörelsemått](browser.json).

`src/sitewind.js` flyttar trädkronornas och buskarnas lövklumpar (båda LOD-nivåerna), gårdens perenner och vassen/strandtuvorna
vid ån i vertexshadern; färg- och skuggdjupsmaterial får samma GLSL och samma uniforms, så skuggan följer kronan. Publiken har
inget väder: styrkan är fast `SITE_WIND.calm` (0,12, originalets klarväderbris). `&wind=styrka[,sekunder]` låser styrka och klocka.
Styrka 0 ger exakt den gamla geometrin (shaderns egen tidiga retur), så "still" är före-bilden från samma kamera.

## Kontroller

1. `node --test tools/sitewindtest.mjs` 7/7 (styrkeordning, deterministisk och klampad förskjutning, identisk sväng-GLSL och samma
   uniform-objekt i färg och skuggdjup för båda LOD-nivåerna och gårdsparet, unika programnycklar, `vertexCompileSlack`-revisionen,
   LOD-kontraktet med vidgade cullingsfärer, noll rörelse vid styrka 0). Också gröna: `lodtest` 7/7, `tightfrustumtest` 12/12,
   `siteinstancebatchtest` 7/7, `barksurfacetest`, `benchwoodtest`, `asphaltsurfacetest`. `npm test` och `npm run build` gröna.
   (`leafrgbtest` 2/3 fallerar redan på basen `7911f30`: dess fryst helfilsjämförelse mot `553aa04` för `foliage.js`/`config.js`.)
2. Browser: en sida, tre vyer valda ur den faktiska geometrin (kamerapunkt med fri sikt), still (0) / fast bris (0,12) / blåsigt
   (1) vid vindtiderna 0,8 s och 2,3 s, efter en uppvärmningsbild per vy. Inga sid- eller shaderfel, noll externa anrop.

| Vy | Bakgrundsbrus (still 0,8 vs 2,3 s) | Bris mellan tiderna | Blåsigt mellan tiderna | Still vs blåsigt |
|---|---|---|---|---|
| Parkträd | 0,004 / 0,02 % px | 1,21 / 2,9 % | 4,42 / 11,8 % | 3,25 / 8,0 % |
| Vass vid ån | 0,81 / 1,7 % | 2,89 / 7,2 % | 7,28 / 18,1 % | 6,91 / 17,3 % |
| Gårdens perenner | 0 / 0 % | 0,33 / 0,6 % | 1,31 / 2,9 % | 1,11 / 2,5 % |

(Medel av absolut RGB-skillnad / andel pixlar som ändras mer än 24.) Brisen syns svagt, blåsigt tydligt. Vassvyns brus är åns
egna ljuskrusningar (fläckarna på vattnet i rörelsekartan), inte vinden. Rörelsekartorna visar kronor, buskar och vass i rött;
stammar, stigar, fasader och himmel står stilla.

## Bilder

- `park-trees-still.jpg`, `park-trees-calm-a.jpg`, `park-trees-windy-a.jpg`, `park-trees-motion-still-vs-windy.jpg`: parkträd och
  buskar vid ån.
- `river-reeds-still.jpg`, `river-reeds-windy-a.jpg`, `river-reeds-motion-still-vs-windy.jpg`: vass i åkanten.
- `courtyard-shrubs-still.jpg`, `courtyard-shrubs-windy-a.jpg`, `courtyard-shrubs-motion-still-vs-windy.jpg`: gårdens perenner
  (och gårdsträdens kronor).

## Kostnad

Draws, trianglar, texturer och program är identiska för still, bris och blåsigt vid samma kamera (park 39 draws / 460 154
trianglar, vass 39 / 448 158, gård 84 / 594 947; 68–69 texturer, 58 program). Inga nya texturer, meshar, ljus eller pass. Per
bildruta sätter CPU:n tre uniforms. På GPU:n kör varje lob-/vassvertex ungefär fyra sinus, en mat3-invers och en klamp (ingen
fladdersinus på telefon). Tre nya programvarianter i scenen (lob nära/fjärran delar en, gårdens vindlöv, vassböjning) plus
skuggdjupsvarianter. Ett 4-byte `siteWindBend`-attribut per vass-/tuvvertex. Culling-sfärer och de täta frustum-/
instansbatchboxarna vidgas med `maxDisplacement` 0,35 m.

## Gränser

Stammar, klätterväxter, södra skogsranden, klippta häckar och övriga lövklungor rör sig inte (samma omfång som originalet).
Ingen vinddata finns; alla värden är visuella *gissningar*. Inte testat på fysisk Iris 640 eller telefon.
