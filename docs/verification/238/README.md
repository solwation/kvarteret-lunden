# Public #238 – Fiskar och vattenringar

Granskad originalkälla: `578ecc09b02c7355e299fc58d0e0127b622ee85a`. Selektiv neutral import av riverfish/riverfishswim och visuellt configblock. Fast lokalt seed 1754, id 0–17, födelse 0 och lokal Date.now; inga tjänster, sparade data, haj, fiske/fångst eller klickmål. [Exakt avgränsning och anpassning](../../upstream.md#passiva-fiskar-och-vattenringar-i-höje-å-238).

## Tillräckliga kontroller

1. `node tools/riverfish-check.mjs`: 6 282 deterministiska fisklägen och 827 ringar mot verklig publik riverAt/waterYAt/riverGround, kanalgränser och bropelare. Åns hela 813,875 m långa ritade linje och sista fortsättningen använder lokal bredd/vatten/botten. Ny instans vid samma klocka ger exakt samma synliga state och fisk-/ringmatriser. Två instansmesh, ingen textur/skugga/extra belysning eller raycast; inne-/ritgräns och publik källisolering gröna. Rådata i `component.json`.
2. `npm test` och `npm run build`: gröna (110 JS-moduler, importsamling, två planritningar, personlig referens-/lagrings-/tjänstegräns, egen appidentitet och statisk byggning).
3. `node tools/riverfish-view-check.mjs http://localhost:8911 docs/verification/238` via gemensamt browserlås: verklig app vid ån, fisk och ringar synliga, exakt samma state efter omladdning vid fast Date.now 2026-10-31 23:54 UTC. Originalets lagringssentineler oförändrade, inga externa anrop eller sidfel trots ignorerade `cloud`/`sync`/`shark`-parametrar. Dator samt det redan planerade emulerade lowmem-telefonbenet slutfördes; inga fler profiler kördes. `result.json` innehåller exakta kameror, full state och råa mätvärden.

Första browserkontrollen upptäckte tre ritanrop: Three.js kör genomskinligt DoubleSide-material som separata bak-/framsidespass. Fiskens tunna ytsilhuett har därför explicit `forceSinglePass=true`, med fortsatt tvåsidig shader. Slutlig komponentkontroll, npm test/build och faktisk browser är gröna efter ändringen. `diagnostic-two-pass.txt` är misslyckad diagnostik från första materialvarianten, inte godkänd slutverifiering.

## Mätning

Referensen är samma scen/klocka/kamera med endast fisk/ringbatcherna dolda, sedan återställda. Två fiskinstanser och två ringinstanser är inom ritgränsen i dessa vyer; fisk 103 trianglar, ring 64. Fler instanser ryms i samma två batcher, högst 18 fiskar och 72 ringar. Avståndsgränsen är 45 meter i båda profilerna.

| Vy | Utan fisk/ringar: calls / tri | Med fisk/ringar: calls / tri | Skillnad |
|---|---:|---:|---:|
| Dator åvy | 29 / 417 046 | 31 / 417 380 | +2 / +334 |
| Dator närvy | 26 / 411 360 | 28 / 411 694 | +2 / +334 |
| Telefon åvy | 27 / 471 861 | 29 / 472 195 | +2 / +334 |
| Telefon närvy | 26 / 466 493 | 28 / 466 827 | +2 / +334 |

## Bilder och gränser

`desktop-river.png` visar den verkliga ån från stranden med fisk och ringar; `desktop-detail.png` visar fisksilhuetten och de två ringarna tydligt. `phone-river.png` visar samma plats i emulerad telefonvy. Bilderna är egna, sparade i publikappen och visuellt granskade; inga originalbilder har importerats. Telefonens allra närmaste vy beskär fisken och har därför inte valts som representativ bild, men dess råmätning är kvar.

Chromium 1248/SwiftShader, 1280×800 dator och 430×850 touch/lowmem, publikens fasta vanliga dagsljus och säsongsval juni. Ingen fysisk telefon eller hårdvaruprestanda påstås. Kamerorna placeras på stranden i verklig scen; ingen genomspelad promenad/fiskeminigame. Vattnet är ogenomskinligt, så originalets visuella approximation med tillplattad fisksilhuett precis över ytan behålls. Mark, vattengeometri, broar, navigation och huslayouter ändras inte; A/B/C/L-svep är inte tillämpligt.
