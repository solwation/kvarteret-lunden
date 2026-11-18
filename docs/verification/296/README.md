# Egna publika betongplattor — #296

Selektiv publicerad originalkälla: **b3905e33b2f986f8db11217bc357badadd364b4f**,
[original #2074](https://github.com/solwation/lunden-3d-apartment/issues/2074).
Publik förebas: **1bcd30b6d34e11524838d16c1c7dc094725f5c6d**.
`selection.json` binder originalets neutrala urval och bevarade publika underlag;
`browser.json` innehåller exakt SHA256 för alla levererade produkt-/fixtur-/testfiler.
Originalets bilder och övriga World-/konfigurationsändringar används inte.

## Egna granskade bilder

Tre **nya publika** ark, före vänster / efter höger, alla öppnade och granskade:

- [Uteplats](patio-paired.jpg): riktig World-plate nära och från gånghöjd.
- [Terrass/portik](terrace-portik-paired.jpg): riktig L1208-terrass överst och emitterat portikgolv underst.
- [Vinter](snow-paired.jpg): slät snötäckt uteplats överst och skyddat portikgolv i januari underst.

Native 1100×720-celler på 2200×1476 med 36 px rubrikrad, **ingen omskalning**.
Befintliga färgprickar behålls som färg, medan fogkanterna får låg ljusreaktion och
fogarna förblir matta. Plattstorlek, förband, färger och silhuetter är kvar.
Snöytan förblir slät; portiken behåller plattläggningen på vintern. Det är bump utan
verklig förskjutning/parallax. Originalbilder återanvänds inte.

## Tre kontrollgrupper

1. `node --test tools/pavingsurfacetest.mjs`: **3/3 pass** (`node.txt`). Samma halvförband,
   meterrepeat/kanter, färgoberoende strukturella kanaler, delad linjär karta och
   faktisk exposed/sheltered snö-/cacheåterställning. Exakt selektionskontroll bevarar
   alla tidigare konfigurationsbytes utanför eget block; World/exterior skiljer endast
   i två import/materialanrop. `patio.js`, `seasons.js`, planer och surroundings är orörda.
2. `npm test`: pass, **154 moduler**, importgraf, två planer, publika nät-/innehållsgränser
   och appidentitet. `npm run build`: pass, **aa04d96b2ee2f9c5a0eaac24**.
   Loggar: `npm-test.txt`, `build.txt`. Inga nya beroenden eller externa resurser.
3. **En egen browserkörning, första försöket grönt**, sju matchade provvyer per fas.
   Riktiga publika World.M.patio/plate och buildExterior, samma publika plan, material,
   kameror och kontrollerade två ljus. Chromium/SwiftShader, MSAA, DPR1, NeutralToneMapping.
   Noll sid-/shader-/konsolfel och externa anrop. Inga Storage-metodanrop; fulla local/
   session-innehållet och originalnamnssentinellerna lunden.drawing, lunden.cloud.queue
   och lunden.session förblir identiska. WebSocket är förbjuden i fixturen.

Portikens faktiska emitterade golvmesh inspekteras **isolerat från början** så att annan
arkitektur inte skymmer den. Övriga vyer använder den byggda exteriören med dekor dold
lika före/efter. Ingen illustrativ ersättningsyta byggs. Wrapperns topp: **555 MiB** av
4 GiB. Ingen bred äldre browser-/helvärlds-/fysisk-enhetskontroll eller bildomtag kördes.

## Bevarad publik geometri och budget

Alla geometriattribut/index är ändliga och bytehashidentiska, liksom alla begränsningslådor:
**9 353 992 byte** totalt för byggd komponentgeometri. Både World-/portikfärgkartornas
pixlar, dimensioner 384×384 och meterrepeat är exakt lika före/efter.

| Publik vy | Ritanrop före/efter | Trianglar före/efter |
| --- | ---: | ---: |
| Uteplats nära | 10 / 10 | 15 078 / 15 078 |
| Uteplats gånghöjd | 23 / 23 | 50 950 / 50 950 |
| L1208-takterrass | 28 / 28 | 54 110 / 54 110 |
| Snötäckt uteplats | 23 / 23 | 50 950 / 50 950 |
| Återställd sommar | 23 / 23 | 50 950 / 50 950 |
| Isolerat portikgolv sommar | 1 / 1 | 68 / 68 |
| Isolerat portikgolv vinter | 1 / 1 | 68 / 68 |

Matchade geometriantal är också lika (33 först, 39 efter att terrassvyn laddats upp).
En ytterligare textur laddas upp; samma skalärkarta används av både World och portik.
Ingen ny geometri, draw, pass, lampa eller återkommande uppladdning införs i produkten.
Standard-shader får bump-samplingar (tre höjdvärden) och roughness-sampling med UV-data;
fragmentarbetet ökar. Oförändrade drawantal är inget FPS-/GPU-tidslöfte.

## Textur, skala och snö

En gemensam **384×384 RGBA8 DataTexture**, linjär, R strukturell höjd / G absolut
roughness. 6×6 befintliga 40 cm-plattor per 2,4 m-repeat, samma halvförband och Canvas-
registrering, trilineära mippar och anisotropi8. **589 824 basbytes / 786 424 nominella
fullmipbytes** (cirka 0,75 MiB), plus **589 824-byte CPU-array**, föraroverhead oräknad.
Mips summeras från faktiska dimensioner till 1×1.

PAVING_SURFACE är konstnärliga antaganden: 1,5 mm bump, 2 mm nominell bevel med minst
1,25 texlar vid befintliga 160 px/m (7,8125 mm filterfotavtryck), roughness 0,93 på
platta och 0,99 på fog. Befintlig nominell 8 mm-fog avrundas fortfarande till en pixel,
precis som färggeneratorn tidigare. Färgbrus blir aldrig relief; inga nya platsmätningar.

Befintlig registerSnow äger exponerad färg/map. Enbart nya exponerade materialet tar
bort auxiliary maps i snö och återgår till gamla roughness 0,95. Sommaren återställer
exakt samma färg-/skalärkartobjekt. Skyddad portik saknar snöhook, och hela dess
materialdata är identiska mellan juni/januari. Delade seasons.js är oförändrad.

## Omfattning och reproduktion

Selektiv import: endast neutral helper, dess tre Node-test, eget konstantblock och
publika materialanrop. Publicens egen patio-färgkod, paletter, planer och arkitektur
behålls. Ingen originalhistoria, personlig inredning/bild/namn, gameplay, originalets
lagring/tjänst eller Cloudflare införs. A/B/C:s separata mark-/accessbyggare får inte
Hus L:s plattkarta. Alla geometrifunktioner, gångytor, dörrar och mätverktyg är kvar.

Playwright lägger bara till fixture-export av befintliga M/plate. Före-fasen routar
World/exterior från exakt publik förebas; efter-fasen använder checkouten. Detta är
verkliga produktionskomponenter med kontrollerat ljus, ingen full World/Navigation,
appbelysning, vintervädermodell eller fysisk telefonkontroll.

```sh
npm test
npm run build
node --test tools/pavingsurfacetest.mjs
# Servera repositoryroten på 8201 med vanliga npm-beroenden installerade.
PLAYWRIGHT_MODULE=/path/to/playwright /path/to/browsertest.sh node tools/pavingsurface296browser.cjs http://127.0.0.1:8201 docs/verification/296
```

Endast tre parade bilder sparas. Public har ingen separat appändringslogg; README
beskriver resultatet. Dirigenten publicerar kod/bilder, bäddar in revisionsbundna
HTTP-åtkomliga bilder före stängning, verifierar Pages-körningen och avslutar ärendet.

## Integrationsbindning

Testad helper/exterior/patio/seasons är byteidentiska med d01d6cc9. World får bara pavingimport/material ovanpå föregående accepterat skärmväggsmaterial; config enbart eget PAVING_SURFACE. Alla föregående README/upstream/configbytes bevarade och dokumenterade tillägg unika. Källbunden grön komponent/npmverifiering återanvänds utan omtag efter oberoende additioner.
