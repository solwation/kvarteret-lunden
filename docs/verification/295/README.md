# Mjuka näckrosformer — #295

Selektiv överföring från originalets publicerade `75a21fdbe599186d738ab414b88e4b4c2c8cd4f0`
(original #2073), granskat i [upstreamanteckningen](../../upstream.md).
Publik jämförelsebas: `49af0d2c85eb75f7a45987481c3527c1b93981d9`.
`browser.json` binder den gröna körningen till produkt- och fixture-SHA-256;
`inputs.json` redovisar dessutom oförändrade placerings-/å-/appunderlag och testkod.

## Resultat och bilder

Befintliga runda blad har låg kupning och fina radiala nerver. Kronbladen har nu
välvd längdaxel, mjukt uppvikta kanter och breda överlappande ytor i samma två ringar.
Den gula mitten, bladens urskärning, färger, radier och placeringar behålls.
Art, antal och form är visuella antaganden, inte en ny art- eller platsmätning.

Alla tre egna kontaktark är öppnade och granskade. **Före vänster, efter höger**:

- [Närbild](near.jpg): samma verkliga blomma och angränsande blad.
- [Vid vattenytan](waterlevel.jpg): bladrandens låga profil och välvda kronblad.
- [Ovanifrån](above.jpg): samma urskärning, diskreta nerver och överlappande kronblad.

Native fångst 1120 × 800, DPR 1; varje halva återges 700 × 500 med samma proportion 1,4.
Inga råa före-bilder sparas. Samma kamera, vattenplan och två fixture-ljus före/efter.

## Tre kontrollgrupper

1. `npm test` och `npm run build` godkända; loggar i `npm-test.txt` och `build.txt`.
   Den befintliga publikgranskningen kontrollerar personligt innehåll, tillåtna
   lagringsnycklar, nät-/tjänstgränser, importgraf och statiskt bygge.
2. `node --test tools/lilysurface295-check.mjs src/riverflora.test.mjs`: **7/7**.
   Fyra befintliga layout-/årstidsfall plus tre nya fall för ändlig geometri,
   enhetsnormaler, icke degenererade trianglar, radie/urskärning, låg bladrand,
   kronbladens kurvning/överlappning/höjdhölje, vattenkontakt, två materialbatcher
   och inga instansomskrivningar vid stillastående.
3. Egen `tools/lilysurface295browser.cjs`, Chromium/SwiftShader, MSAA,
   NeutralToneMapping, riktig publik `RiverLilies`. Endast produktens
   `src/riverfloraview.js` routas till den exakta basrevisionen under före-fasen;
   all placering, konfiguration och fixture är identisk. Den nya formkonstanten
   används inte av basen. Alla **92 blad och 28 blommor** har identiska stationer,
   positioner och fullständiga instansmatriser före/efter (samma placeringshash).
   Den valda vyn fyller **20 blad och sex blommor**. Kapacitet 20/9 behålls.

   Centrum ligger kvar 12 mm över vattenlinjen. Publicens likformiga radieskalning
   ger högst **4,995 mm** extra bladrand på de verkliga placeringarna, utan stjälkar.
   Samma delade MeshLambert-material och två batcher; juli två ritanrop, maj ett,
   januari/dolt/långt från ån noll. Stillastående ändrar inte instansbuffertversionen.
   Inga sid-/konsol-/shaderfel, externa anrop eller lokala/session-lagringsnycklar.

Första scopedkörningen stoppades av en favicon-404 i den separata HTML-fixturen.
En explicit inline-favicon lades till och samma avgränsade kontroll kördes grön.
Produktkoden ändrades inte för omtagningen; ingen bred äldre browserkontroll kördes.

## Geometri och kostnad

| Gemensam geometri | Trianglar före → efter | Råa attributbyte före → efter |
| --- | --- | --- |
| Blad (utan stjälk) | 14 → 132 | 1 512 → 14 256 |
| Blomma med befintlig mitt | 50 → 204 | 5 400 → 22 032 |
| Summa | 64 → 336 | 6 912 → 36 288 |

Gemensam CPU-geometri ökar **29 376 B** (cirka 28,7 KiB), oberoende av antal instanser.
Position/normal/vertexfärg behålls; ingen UV/textur läggs till. Synliga GPU-uppladdningar
ökar med motsvarande okomprimerade attributbyte, drivrutinsomkostnad oräknad.
Instansmatriser/kapaciteter är oförändrade. Alla tre frysta vyer skickar **582 → 3 866**
trianglar och **3 → 3** ritanrop inklusive fixture-vattnets enda anrop; själva
näckrosorna är **2 → 2**, texturer **0 → 0**. Inga nya ljus, skuggor, shadergrenar,
pass eller återkommande uppladdningar införs i produkten. Detta är en avgränsad
kostnad för mer formdetalj, inte en prestandaförbättring eller FPS-mätning.

## Anpassning och begränsningar

Hela den publika `RiverLilies`-klassen är byteidentisk med jämförelsebasen. Den egna
vattenlinjeplaceringen, 8 m fylltröskeln, säsongs-/synlighetsvillkoren och appanropet
behålls. Originalets stjälkar, stenar/bottenväxter, djupskalning, simning, spel,
Cloudflare, lagring och övriga tjänster följer inte med. Inga nya beroenden eller
resurser laddas ned. Befintliga färger och växtstorlekar behålls.

Browsern bygger den faktiska publika komponenten och dess riktiga åunderlag, men
visar en enkel vattenyta med två fasta ljus. Bilderna är avsiktligt närbilder av
komponenten; hela världen, strandterrängen och appens navigationsrutt ingår inte.
Detta är inte en ny fullvärlds- eller fysisk-enhetsverifiering. Oförändrade produkt-
placeringar och underlag återanvänder tidigare verifierade regler från #282;
originalets evidens ersätter ingen publik kontroll här.

## Återkörning

```sh
python3 -m http.server 8191
npm test
npm run build
node --test tools/lilysurface295-check.mjs src/riverflora.test.mjs
node tools/lilysurface295browser.cjs http://localhost:8191 docs/verification/295
```

Browserkörningen använder lokala Three.js 0.170.0 och Playwright. `CHROME_PATH` och
`PLAYWRIGHT_MODULE` kan sättas vid behov. Orkesterns verifiering kördes genom den
gemensamma resursbegränsade wrappern. Integrationsägaren publicerar och bäddar in
revisionsbundna bilder, kontrollerar Pages-körningen och avslutar ärendet.

## Integration

Fångad arbetarkälla b8ac5aa. Alla tidigare main-konfigurationsbytes behölls plus namngivet295-tillägg. Upstream får egen295-sektion och den uttryckliga14-trianglarsrättningen i äldre282-text; README ändrar bara näckrosmeningen. Produktens riverfloraview och fixturer matchar exakt fångad källa; hela RiverLilies-klassen oförändrad. Full config-/byggfingeravtryck i evidensen är historiska efter orelaterade292–294-materialblock. Källbunden browser återanvänds; integrerat npm test/build körs före publicering.
