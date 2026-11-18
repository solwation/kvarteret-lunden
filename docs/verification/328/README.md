# #328 – ekorrarna klättrar i trädens stammar och grenar (port av original #2132)

Källa: original `8a89f610` (#2132). Urval och ej tillämpliga delar: [docs/upstream.md](../../upstream.md#ekorrarna-klättrar-i-trädens-stammar-och-grenar-328).

## Kontroller

- `node --test tools/squirrelclimbtest.mjs`: 6/6. Originalets funktionstester på `treeform.js`-former och den publika hjärnan: ramen
  följer skelettet (minst fyra huvudgrenar, ute på den ritade grenen inom 2 cm); klättervägen ligger på den ritade stammens triangelyta
  (85 % inom 3 cm, värst 6,5 cm i en grenklyka), spiralerar `turns` varv och slutar på grenens sida; träd länkas som språng bara när två
  grenpunkter ligger inom 2,6 m; 30 min simulering med tre ekorrar: upp med nosen upp, ned med huvudet först, varje grenhopp ≤ 2,6 m och
  landar på en gren, inga gamla kronsprång mellan ramträd, av marken när den väl klättrar (`{"up":2398,"down":2479,"limb":5940,"hop":190,
  "crown":44,"headUp":1077,"headFirst":945,"off85":0.012,"offWorst":0.060}`); deterministiskt. Publikens egna: `climbFrameOf` från
  `treeForms`-poster, den riktiga `Squirrels`-värden får ram och sitter på en gren, utan `forms` den gamla kronytan, kroppens mittpunkt
  ligger exakt på hjärnans barkpunkt även upprätt på stammen, och ekorrmodulerna har fortfarande inga interaktions-/lagrings-/nätord.
  Originalets WIRE-test är ej tillämpligt (ingen synk).
- `tools/squirrellifetest.mjs` 8/8, `tools/squirrelambienttest.mjs` 2/2, `tools/treeformtest.mjs` 6/6, `npm test`, `npm run build`: gröna.
- Egen browser (`BEFORE_DIR=<före-src> node tools/squirrelclimb328browser.mjs before|after docs/verification/328 http://127.0.0.1:8348`)
  i den riktiga publika appen med `?month=7&wind=0.75,0&nocats`: en ekorre på sitt starträd i åparken drivs genom hjärnans egen klättring
  (samma anrop i båda faserna), övriga frysta. Noll externa anrop, inga websockets, inga sid- eller shaderfel, lagringen oförändrad (bara
  den orelaterade provnyckeln). Före = `squirrels`, `squirrelbrain`, `squirrelhabitat`, `config` och `main` från `2c053c2`. Rådata och
  poser per bild: `browser-before.json`, `browser-after.json`.

## Bilder

- `before-climb.jpg` / `after-climb.jpg`: 25/50/75 % av klättringen upp och sittande i kronan. Före går ekorren rakt upp 0,3 m från
  stammens axel, dvs. inne i den tjockare stammen (mittbilden visar bara stammen) och sitter sedan inne i lövkronan; efter ligger den an
  mot barken med nosen uppåt, vänder i spiralen runt stammen, och sitter ute på en huvudgren synlig vid kronans kant.
- `before-down.jpg` / `after-down.jpg`: 25/50/75 % av vägen ned. Före är ekorren dold i lövverket/stammen i två av tre bilder; efter går
  den in längs grenen och ned med huvudet först på barken.

## Kostnad

Inga nya draws, material, texturer eller geometrier (en draw per ekorre som förut; den breda vyn 47/47 calls och samma trianglar;
78/82 program och 81/82 texturer efter/före kommer av att sekvensens olika vyer kompilerar olika program; ekorrarna
lägger inte till något material). 247 av 259 ekorrträd får en ram (de övriga:
södra lunden utan `treeForms`, eller en fotring runt den ritade stammen som inte är torr mark). I node: ramarna för 247 träd ≈ 30 ms och länkningen (`bestHop`) ≈ 22 ms en gång vid start, ≈ 6 kB JSON
per ram; hjärnans uppdatering ≈ 0,8 µs per ekorre och bild. Språnglänkarna går från 340 (allt inom 11 m) till 132 (grenpunkter inom
2,6 m); ett träd utan grannar i räckhåll nås över marken som förut. `src/squirrelclimb.js` 13,8 kB.

## Begränsningar

- Inga riktiga telefoner, ingen FPS-mätning. Telefonens stamlayout (`lowMemory`) används för ramen men är bara node-testad indirekt
  via samma funktioner.
- Kronans svaj ute på grenen följer `siteWindOffset`s kronvikt; själva grenarna i trädgeometrin svajar inte (som i originalet).
- Södra lundens träd (`southTreeFeet`) har ingen form i `treeForms` och klättras som förut.
- Bilderna är tagna i ett enda träd med slumpad gren; före/efter har samma kamera-regel men inte exakt samma gren eller vinkel.
