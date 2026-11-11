# Neutral åfiskform (#267)

Publicbas: `c08dfab`. Granskad originalkälla:
`e76603a7f42c255b90020799ccfdd4258854d1ad` och neutral normalisering i
`e300a2bd5136a43434d7042771651a3f5b17284c` (original #1911).

Den minimala nya `src/riverfishmodel.js` använder bara Three.js. Den extraherar en
fast mörtloft med fenor, ögon, gälband och mörk munspets från det befintliga receptet,
med neutral gråton och centrerade **1×1×1**-mått. Publikens befintliga sex färger och
storleksförhållanden appliceras en gång i ordinarie instansmatris. Samma generiska
form används för alla varianter: ingen ny artspecifik anatomimodell eller verifierad
artförekomst påstås. Originalets fångad-fisk-/bestiarium-/fiske-/haj-/GLB-/animations-/
tjänste-/lagringsmoduler, personliga data, configträd, bilder och historik importeras inte.

`src/riverfish.js` byter endast geometriimport/fishGeometry. Lokal klocka, seed, 18 fiskar,
alla färger/mått, simning, ringar, 45 m-gräns och inomhusdöljning bevaras. Ingen ny textur,
ljuskälla, skugga, target/raycast, nätförfrågan eller sparad data.

## Tre avgränsade kontrollgrupper

1. `node tools/riverfish-shape-check.mjs`: exakta enhetsmått/centrum, ändliga enhetsnormaler,
   neutral gråton, samtliga sex slutmått och 18 verkliga instansmatriser med oförändrade
   djup-/uppstigningsfaktorer. [Resultat](shape.json).
   `node tools/riverfish-check.mjs`: 6 282 deterministiska fisklägen, 827 ringar mot verklig
   publik å/botten/vatten/bropelare; samma state/matriser efter återskapande, två batcher,
   icke-pickbara geometrier, inne-/avståndsgräns och källisolering. [Komponentresultat och
   fryst bank/klockindata för webbläsaren](component.json).
   En separat läsande jämförelse mot originalet visar exakt samma positioner/normaler
   och triangelmängd; maximal neutral färgdifferens 5,97e-8. [Härledning](source-comparison.json).
2. `tools/browsertest.sh node tools/riverfishappearance-check.mjs BASE OUT`:
   tre hela formbilder och **verklig byggd publik app** vid ån. Två batchers faktiska
   renderingsskillnad är exakt `antalFisk×433 + antalRing×64`, utan sidfel eller externa
   anrop trots ignorerade cloud/sync-parametrar. Originalets lokala/session-sentineler
   är oförändrade. [Råresultat](browser.json), [logg](browser-tests.txt).
   Den första detaljkameran följde en gammal ringposition och klippte fiskens huvud.
   Endast kameran och detaljbilden korrigerades mot aktuell shown-/instansmatrisposition,
   med helfigursmarginal; granskade helbilder och översikt återanvändes utan ny formrunda.
   [Avgränsad kameraomtagning](detail-retake.txt). Chromium/SwiftShader, ingen fysisk telefon.
3. `npm test` och `npm run build`: gröna, inklusive bundlad importgraf, personlig
   referens-/lagrings-/tjänstegräns och same-origin-policy. [Testlogg](npm-test.txt),
   [bygglogg](build.txt). Diff/länkar/källgranskning och färsk rebase före publicering.

## Budget och öppnade bilder

Fisk: **433 trianglar /249 hörn**, tidigare 103 /309; högst18 fiskar innebär 7 794
fisktrianglar (tidigare 1 854). Fler detaljer ökar trianglarna; ett indexerat recept
behåller samma enda fiskbatch och material. Ringar behåller 64 trianglar, högst 72
instanser, och sin enda batch. Som mest två ritanrop för fisk+ringar; ingen påstådd
FPS-/minnesvinst. En enda generisk form är avsiktlig, ingen optimering av beteenden.

Öppnade/granskade egna bilder: `whole-front.png`, `whole-side.png`, `whole-quarter.png`
visar samtliga sex befintliga färg-/storleksförhållanden med hela former och fritt
utrymme runt stjärt/nos/fenor. `actual-river.png` visar den verkliga publika ån med
ordinarie fisk/ringbatcher. `actual-detail.png` visar hela den faktiska fiskinstansen.
Ingen originalbild kopieras. Permanenta SHA-pinnade bildlänkar publiceras i #267 före
någon stängande push. Exakt Pagesbygge och verkligt berört beteende kontrolleras efter
Refs-publicering; lokal verifiering är inte påstått produktionsbevis.


## Faktisk Pagesleverans

Produktionsrevision **`74647c132e145dccc36bd4110487b93a7be48eec`**, exakt
[Pagesrun43035998233](https://github.com/solwation/kvarteret-lunden/actions/runs/43035998233)
**success**; [runrecord](pages-run.json). Verklig `version.json` visar samma
byggfingeravtryck som lokalt: **`22479ab72209111eede30c4b`** ([version](pages-version.json)).
Den riktiga publicerade appens å-/närvy har exakt två batchanrop och433 trianglar per
fisk plus64 per ring. Samma browser och app renderade en faktisk lokal uppstigningsframe:
id12, befintlig gäddavariant, `rise=0.9944006` vid `t=-344.85`, riktad mot aktuell
instansposition. Originalets lagringssentineler består; noll externa anrop och sidfel.
[Verkligt liveresultat](pages-live.json), [logg](pages-live.txt). Ingen ytterligare
form-/bildserie eller rutinmässig kontrollrunda kördes.

Alla fem bilder publicerades med Refs och granskades före stängning; deras permanenta
SHA-pinnade HTTPS-adresser gav200/exakta bytes och bäddades in i
[ärendekommentaren](https://github.com/solwation/kvarteret-lunden/issues/267#issuecomment-6798100053).
Dirigenten granskade både källscope och samtliga bilder, inklusive den enda korrigerade
detaljkameran. Endast denna dokumentation ändras i avslutningsrevisionen; appens källor,
byggfingeravtryck och giltiga källbundna kontroller består. Ingen originaländring eller
ytterligare publik överföring behövs. Egen server/browser avslutad; checkout behålls ren.
