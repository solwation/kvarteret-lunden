# Sex passiva fiskformer, public #274

Mört, abborre, braxen, gädda, öring och ål får egna huvud-, kropps-, fen- och
stjärtprofiler i publicens befintliga instansbatch. Avgränsad neutral livekälla:
original `8743e7d07e6a2e6b743710f27bd06d6027bd287d`, `fishsurface.js` och relevanta
formdata. Publik baslinje är `75270c1bdb2f1ab96f3d720ea9a8a2f8ad682222`.
Alla sex liveytors attribut och index matchar den valda källan byte för byte före
publicens normalisering och packning; se [källjämförelsen](source-geometry.json).

Den egna fabriken specialiserar bara liveformen. Den egna materialpatchen väljer
art och billig stjärtflex inom befintlig batching. Inga GLB, laddare, fångad/hållen/
kokt fisk, ghost, haj, spelinteraktioner, ljud, personliga resurser, pärm, lagring,
Cloudflare eller tjänster överförs. Befintlig attribution och Three.js MIT-licens
bevaras; ingen ny extern modell, textur eller licens tillkommer.

## Öppnade resultatbilder

Före och efter använder samma kameror, ljus, instansmatriser, artmått och färger.
Artgalleriet visar övre raden mört, abborre, braxen och undre raden gädda, öring,
ål. Alla visas med längd 1 för att jämföra profiler, med befintliga relativa
höjd-/breddmått. Det är en uttrycklig sexartsdiagnostik, inte en ändrad population.

| Vy | Före | Efter |
| --- | --- | --- |
| Sex arter, sida | [Bild](before/six-side.png) | [Bild](after/six-side.png) |
| Sex arter, framifrån | [Bild](before/six-front.png) | [Bild](after/six-front.png) |
| Sex arter, snett | [Bild](before/six-quarter.png) | [Bild](after/six-quarter.png) |
| Verklig publik normalvy | [Bild](before/actual-normal.png) | [Bild](after/actual-normal.png) |
| Samma å, närmare kamera | [Bild](before/actual-detail.png) | [Bild](after/actual-detail.png) |
| Naturlig uppstigning | [Bild](before/actual-rise.png) | [Bild](after/actual-rise.png) |

Bilderna är öppnade och granskade lokalt. Root har dessutom granskat artformerna
och den verkliga normal-/vatten-/uppstigningsvyn och låst formen. Fiskarna är små
i normal skala; det opaka vattnet skymmer avsiktligt den nedsänkta kroppen.

## Låst budget och uppmätta resurser

Budgeten godkändes före formändring: högst 30 555 B för unionen av samtliga unika
kvarhållna geometribuffertar och instansdata, högst 866 trianglar per fylld fisk,
befintliga två batcher/material och inga nya texturer, ljus eller assets.

| Mått | Före | Efter |
| --- | ---: | ---: |
| Trianglar per fisk | 433 | 411 |
| Hörn per fisk | 249 | 273 |
| Fiskgeometri inklusive samtliga artmål | 11 562 B | 18 027 B |
| Fiskens instansdata inklusive art/fas | 1 368 B | 1 512 B |
| Ringarnas geometri och instansdata | 7 440 B | 7 440 B |
| Hela unika buffertunionen | 20 370 B | 26 979 B |
| Fiskpass + ringpass | 1 + 1 | 1 + 1 |
| Material / texturer / modellassets | 2 / 0 / 0 | 2 / 0 / 0 |

Ökningen är 6 609 B, 32,44 %, under det godkända taket. Detta är råa kvarhållna
backing buffers, inte GPU-totalminne eller överförd filstorlek. Inga per-frameytor
byggs. Fem fulla temporära artgeometrier avvecklas efter packningen; basens
Float32-normal tas bort. Ingen sexarters Float32-geometricache blir kvar.
[Före](before/resources.json) och [efter](resources.json) listar varje vy, typ,
storlek och hash.

Publicens befintliga transparenta `DoubleSide`-material behåller
`forceSinglePass=true`: en fiskpass före och efter. Originalets två transparenta
fiskpass importeras inte och ingen passbesparing påstås. Full kapacitet 18 fiskar
motsvarar 7 794 respektive 7 398 fisktrianglar; den verkliga lokala scenen fyller
bara två fiskar och två ringar, totalt två draws och 994 respektive 950 trianglar.

## Packning, shader och normaler

En basposition, basens okt-normal och fem Uint16-artmål delar samma topologi.
Varje mål packar XYZ och normal i fyra komponenter. Den verkligt länkade shadern
använder 14 aktiva attributplatser; uppmätt `MAX_VERTEX_ATTRIBS` är 16, högsta
använda plats 15. Alla sex artgrenar har faktiskt kompilerats och renderats i
samma batch utan shader-, konsol- eller sidfel; se [artprovet](forms.json).

Geometrin normaliseras en gång till centrerad enhetslåda och får därefter de gamla
instansmåtten. Största positionskvantiseringsfel är 0,000007630 normaliserade
enheter. Största normala vinkelfel är 0,015405 radianer. Artens kollapsade,
frånvarande fenytor har ändliga reservnormaler och undantas vinkeljämförelsen.
Flexens derivata justerar normalen; instansens ojämna skala använder
inverse-transpose. [Formkontrollen](shape.json) verifierar ändliga deformerade
positioner, normaler och projektioner för alla arter, fyra faser och två
instansskalor, sammanlagt 13 104 hörnfall, samt alla 18 verkliga instansmatriser.

## Verklig konsument och isolering

En faktisk publik källapp laddades med normalt importmap och befintlig terräng,
å och opakt vatten. Klockan låstes till `2026-10-31T23:54:00.000Z`, fiskepok
−360 och befintligt seed 1754. Den frysta gamla producenten och den nya jämförs
med exakt samma tillstånd, instansmatriser/-färger och fulla kamera-, vy- och
projektionsmatriser. Populationen är fortfarande 18; ål saknas naturligt i detta
seed och visas i stället i sexartsdiagnostiken.

Avsedda aktuella fiskinstanser isolerades tillfälligt i samma batch och alla
instansdata återställdes efter kontrollen. Verkliga avsedda fiskpixlar är
237 → 218 i normalvyn, 1 222 → 1 108 närmare och 392 → 562 vid naturlig
uppstigning. Normal-/närvyn har två fiskar och två ringar, uppstigningen två
fiskar och en ring. Det är pixelnärvaro, inte ett påstående om större fiskar eller
pixelantal som kvalitetsmått. Samtliga fyllda fiskars shaderdeformerade positioner,
normaler och kameraprojektioner är ändliga. Hidden och bortom 45 m ger noll draws
och tomma batcher. [Konsumentprovet](actual-public.json) har noll externa anrop,
WebSocket-försök och operationer mot originalets lagring; egna sentineler består.

Den gamla konfigurationsfilens hela byteprefix, `riverfishswim`, `main`, å- och
omgivningsproducenter är oförändrade. Därmed består också huvudappens befintliga
`noriverfish`-villkor; det verifierades i källan utan en andra hel appladdning.
Inga artstorlekar, rörelse-/ring-/vattenberäkningar eller seed byts för bilderna.
[Källidentitet](source-identity.json) och [appens uppmätta källhashar](app-source.json)
binder bevisen till levererade modell-, shader-, konfigurations- och fixturkällor.

## Kontroller och begränsad varm mätning

Alla slutliga CLI-processer avslutades med faktisk status 0, inte bara JSON med
noll fel; se [status](cli-status.json) och respektive logg.

- `npm test`: 142 moduler, [logg](npm-test.txt).
- `npm run build`: fingerprint `6ad9f651374d3900a24b9962`, [logg](build.txt).
- `node tools/riverfish-check.mjs`: 6 282 deterministiska rörelse-/vatten-/
  botten-/pirfall och 827 ringar, [resultat](component.json).
- `node tools/riverfish-shape-check.mjs`: alla sex former, packning och normaler,
  [resultat](shape.json).
- Baslinje, sexartsform, faktisk app och begränsat varmt prov kördes med delat
  browserlås: [baslinje](baseline-cli.txt), [arter](forms-cli.txt),
  [app](app-cli.txt), [varm körning](warm-cli.txt).

Det varma provet använder den faktiska isolerade RiverFish-komponenten i
Chromium/SwiftShader på 640 × 480, åtta uppvärmningar och 30 lika noll-dtprov med
rendering och `gl.finish`. Varje uppdatering behandlar samma 18 fiskar; samma två
fiskar och två ringar fylls i den lokala vyn, med identiska tillstånd/matriser/färger.

| Millisekunder, median / p95 | Före | Efter |
| --- | ---: | ---: |
| Uppdatering | 0,10 / 0,20 | 0,10 / 0,50 |
| Render och finish | 0,10 / 0,30 | 0,10 / 0,20 |

[Råa varmdata](warm.json) visar också antal och samtliga prover. Tidstegen är
grova och mätningen liten; inga snabbhetsvinster, native-/telefon-FPS eller
helvärldsprestanda påstås.

Efter bilderna flyttades den oförändrade sexartsrenderaren från
`tools/riverfish274.html` till den befintliga `tools/riverfishappearance.html`,
med endast ett kompatibilitetsalias. Formverktygets URL anpassades; ingen ny
bildmatris kördes för ruttbytet. Det äldre appearanceverktygets avsiktliga
433-triangelantagande ändrades till 411, utan en bred historisk CLI-kedja.
Produktens samtliga uppmätta källhashar är oförändrade. Root äger efterföljande
rebase, faktisk Pages-kontroll, SHA-bundna bildlänkar i issuekommentaren och
gallring av egna förebilder.

## Slutlig integration

Återbaserad på levererade #272/#273, `172d48643a2eac914713e188fa31a64f77ffa734`. Root kontrollerade att samtliga worker-produkt-/verktygs-/bild- och råresultatfiler är exakta efter rebase, att appens uppmätta källhashar stämmer och att tidigare config samt nya instruktionsingångar/shared-träd består. Modell-, konsument- och timingresultat återbrukas eftersom deras källor/indata/kvalitet är oförändrade. Den oberoende läsande käll-/buffert-/shadergranskningen är grön. [Integrationsidentitet](integration.json), `integrated-test.log` och `integrated-build.log` redovisar slutlig snabbkontroll. Enbart upstreamformuleringen förtydligades till att två befintliga material består; inga nya tillkommer.
