# Egen publik tegelverifiering — #293

Granskad originalkod: **7b5f0f1740c02d7f7731e34a067563b4b88239e9**, original #2071.
Publik förebas: **49af0d2c85eb75f7a45987481c3527c1b93981d9**.
`selection.json` innehåller originalets källhashar och exakt urvalskontroll;
`browser.json` binder resultaten till publicens produkt- och fixturhashar.
Ingen originalbild används; bildrättningen c0145dc är inte produktkälla.

Fyra **egna nya publika bildpar**: `facade.jpg`, `entrance.jpg`, `grazing.jpg`,
`distant.jpg`. Före överst, efter underst. Varje bild är 1200×800 i oförändrad
3:2-proportion, ritad utan skalning på 1200×1676 med två 38 px etiketter.
Alla fyra öppnades och granskades. Nära väggen syns låg relief längs fogarnas kanter
samt diskret lerstruktur; förband, färger, fönster/dörrar och silhuetter behålls.
Fjärrvyn är fortsatt lugn. Bump flyttar inga riktiga hörn och ger ingen parallax.

## Tre avgränsade kontroller

1. `npm test`: pass, 151 moduler och befintliga publika import-/nät-/innehållskontrakt.
2. `npm run build`: pass, statiskt bygge `323b0b3d8f2f4e7073b3c91c`.
3. `tools/bricksurface293browser.cjs` via värdens wrapper: pass, Chromium/SwiftShader,
   DPR1, MSAA, NeutralToneMapping. Fyra före/efter-vyer med samma kamera/ljus och
   faktisk publik `buildExterior`. Noll sid-/shader-/konsolfel, noll externa anrop.
   `lunden.drawing`, `lunden.cloud.queue` och `lunden.session` behåller exakt sina
   lokala/session-sentineller; inga andra lagringsnycklar tillkommer i fixturen.

Första browserförsöket fann en saknad favicon i fixturen, sedan jämförelserna passerat.
En data-favicon lades till och samma smala kontroll passerade; produktkoden ändrades
inte och ingen bredare kontroll lades till. `checks.txt` återger checkutfallen.
Browserkörningens topp var 1418 MiB av 4 GiB; detta är inte GPU-minne eller FPS-data.

## Oförändrad publik geometri och budget

Hela publicens tidigare konfiguration är byteidentisk efter att det enda nya
BRICK_SURFACE-blocket räknats bort. Exterior-filen är exakt oförändrad bortsett från
de två importerna och materialfabriken; färgcanvas och alla geometrifunktioner är kvar.
Modulen är exakt originalet förutom ärendekommentaren. A/B/C:s `surroundings.js`, egna
fasad-/öppningsatlaser och loggiamaterial är oförändrade (hash i selection.json).

Alla meshpositioner, UV och index samt öppningsmetadata har identiska före/efter-hashar.
Samtliga 153 glaspanelers mittpunkter träffar glas först vid raytest, ligger inom sin
öppning och representerar båda långfasadernas fyra våningar. Tegelbatch: 1468 trianglar.

| Publik vy | Ritanrop före/efter | Ritade trianglar före/efter |
| --- | ---: | ---: |
| Fasad | 24 / 24 | 21460 / 21460 |
| Entré | 31 / 31 | 57798 / 57798 |
| Släpljus | 26 / 26 | 52438 / 52438 |
| Fjärr | 43 / 43 | 68222 / 68222 |

53 geometrier / 7 shaderprogram i varje vy före och efter; texturer 5 → 6.
Inga nya draw, pass, lampor, geometrier, öppningar eller kollisionsytor.
Standard-shadern får bump-samplingar (tre höjdvärden) och en roughness-sampling med
tillhörande UV-data. Shaderarbetet är alltså större även med oförändrat drawantal.

## Textur och meterskala

Befintlig 512×512 färgcanvas är bevarad, sRGB, 4×8 halvförband på 1,04×0,60 meter:
0,26 m per tegel och 0,075 m per skift inklusive fog. Den nya delade kartan följer
samma UV, förskjutna rader och repeat; integerperiodisk lerstruktur filtreras med
mipmaps och anisotropi8. Inga nya fogmaskor eller per-fasadkartor.

En enda cachad **512×512 RGBA8** DataTexture är gemensam bump-/roughness-karta,
linjär utan färgrymdsomvandling: R höjd **56–205**, G roughness **223–247**.
BumpScale 0,0045 ger cirka 2,52 mm antagen fogdjupsskillnad och cirka 0,11 mm
lerkornsamplitud; detta är visuell shading, inte verklig förskjutning.
Tillkommande CPU-bytearray **1048576 bytes**; RGBA8-basen lika stor och full nominell
mipkedja **1398100 bytes** (cirka 1,33 MiB), summerad från faktisk dimension till 1×1.
Föraroverhead och annan eventuell GPU-allokering ingår inte i byteberäkningen.

## Reproduktion och begränsningar

```sh
npm test
npm run build
# Starta egen lokal server i repot på 8189, med vanliga npm-beroenden installerade.
PLAYWRIGHT_MODULE=/path/to/playwright /path/to/browsertest.sh node tools/bricksurface293browser.cjs http://127.0.0.1:8189 docs/verification/293
```

Fixturen använder publicens faktiska produktionsbyggare, plan, fönsterinställningar
och lokala Three-importer. Före-fasen routar endast `src/exterior.js` från den exakta
publika förebasen; efter-fasen använder checkoutens modul. Det är en komponentkontroll,
inte hela World/start/navigeringsflödet eller mobil hårdvaruprestanda. A/B/C inventeras
och bevaras, men byggs inte separat i denna fixtur. Inga personliga resurser, originalets
historia/konfiguration i övrigt, gameplay, tjänster eller Cloudflare ingår.

Endast granskade parade bilder sparas. Dirigenten publicerar, bäddar in SHA-pinnade
bilder före stängning och följer faktisk Pages-körning. Ingen appändringslogg finns
här; README beskriver det synliga resultatet.

## Integration

Samtliga tidigare main config-/README-bytes bevarades med enbart namngivna293-tillägg. Tegelkonsument/neutralmodul/fixtur är byteidentiska med fångad arbetarkälla1fd5c60. Fulla config-/byggfingeravtryck där är historiska efter orelaterad292integration; källbunden browser återanvänds. Integrerat npm test/build körs före publicering.
