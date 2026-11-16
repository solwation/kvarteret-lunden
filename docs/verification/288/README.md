# Besöksbara lägenheter enklare på håll — #288

Verifierat 2026-11-16 mot publik baslinje `e9b4e7f`, med granskad import från originalets `f61ad598d0e6d22eee8c16fa837ebe183edcf8df` (#1965) och gallringsanropet i `302a3c79e15a0337d18ff351d2b75e9975984724` (#574). Endast relevanta kodblock har förts över; inga historikobjekt, personliga resurser, tjänster eller originalets lagringsnycklar.

## Utfört och källbundet

- `npm test`: godkänd revision av 149 moduler, importgraf, planritningar, innehåll/lagring och same-origin-gräns. [Logg](npm-test.txt).
- `npm run build`: godkänd, version `836234a60cdff4a8bb6d942b` (slutkälla; bildfasens före avgränsningsstädning var `62cd625de57f8fe28390ba95`). [Logg](npm-build.txt).
- `tools/visitlod-check.mjs http://127.0.0.1:8828 docs/verification/288` via värdens `tools/browsertest.sh`: 28/28 godkända kontroller i riktig app. [Logg](browser.txt), [rådata och SHA-256 för visitunit/main/world/config/lod](result.json). Inga sid-/GLSL-fel eller externa anrop i den accepterade körningen.

Ett första fixturförsök stoppades före alla vyprov: `page.addStyleTag` blockerades korrekt av sidans CSP. Fixturen använder nu vanliga DOM-style-egenskaper för att dölja välkomstkortet. CSP och produktkod ändrades inte. [Ursprungligt preflight-resultat](preflight-csp.json) är bevarat; det är ingen produktregression eller godkänd bildkälla.

Den accepterade körningen laddade dator och sedan `?lowmem` i samma Chromium med SwiftShader, 960×600, fixerad julidag. Det senare är den verkliga lowMemory-kodgrenen och dess 9–12 m-policy på en dator, **ingen fysisk telefon eller mobilprestandamätning**. Kontexten stängdes mellan profilerna. Wrappern tog sitt browserlås; systemd-minnestak saknas i denna miljö enligt dess logg.

## Metod och kontrakt

Appens faktiska frame exponeras enbart genom en in-memory-diagnostikroute och pumpas med 1/60 s. Den vanliga huvudloopens nya `u.cull(camera.position, away)` körs. Kontrolläget återställer de ursprungliga top-level-synligheterna, döljer nya mellannät/stand-in och hoppar över gallringsanropet: samma scen/kamera som före den saknade #574-kopplingen. Produktgeometri och källfiler ändras inte av provet. Båda lägenheterna finns i mätningen; totalvinsten innehåller även gallringen av den andra lägenheten.

L1004 ger 37 sammanslagna materialnät + 4 pass-objekt; L1201 ger 34 + 4. Bland synliga L1004-anrop minskar normalt 195 till 69 i mellannivån och 25 för skalet. Inom 5 m behålls delarna. L1004:s nära/mellanbyte jämfördes vid 5,5 m i exakt samma scen: 0 av 576 000 pixlar skilde mer än 8/255 i båda profilerna. Detta gäller just den granskade gatufrontsvyn, inte alla möjliga inomhusvinklar.

Den riktiga dörrens och det riktiga fönstrets toggle/update-animering går från mid till all efter första rörelsesteget (t=0,06 respektive 0,0533), når t=1, och återgår till mid efter stängning t=0. Fulla delar behålls medan de är öppna inom 12 m. Vid 14 m är datorn mid och lowMemory shell. Detta provar deras faktiska komponent-/Navigation-animering, inte en ny tangentbords-/touchinmatningssvit.

De befintliga destinationsfunktionerna placerar besökaren inne i L1004 respektive L1201 och lämnar den besökta lägenheten i all. Garagedestinationen ger below=true och båda none. away-villkoret är `(navigation.inFootprint() && !navigation.aloft) || navigation.below`; det döljer inte lägenheten man besöker. Materialshaderdelegering, speglad triangelvändning och djupfade följer den granskade källan. Public har ingen smådetaljgallrare eller VisitLights/lampwash; dessa beroenden importeras inte och befintliga linjer/geometrier behålls även med lowMemory.

## Uppmätta anrop och trianglar

Samma kamera framför L1004:s norra fasad, avstånd från lägenhetens footprint. Hela appens färgpass, ingen fysisk FPS-/GPU-tidsbudget. Sammanslagningens grövre frustum-bounds kan lämna fler trianglar inlämnade även när antalet anrop minskar (t.ex. dator 7 m); trianglar är inte genomgående lägre. Mitt i zonen är insidan fortfarande inlämnad men dess pixlar tonas bort. Fjärrnivån behåller väggar, golv, tak och stängda fönster.

| Policy | Avstånd m | Efter | Anrop före → efter | Trianglar före → efter | L1004-anrop före → efter |
| --- | ---: | --- | ---: | ---: | ---: |
| desktop | 4 | all | 389 → 382 | 793,377 → 792,597 | 194 → 194 |
| desktop | 7 | mid | 430 → 298 | 803,251 → 823,335 | 195 → 69 |
| desktop | 11.5 | mid | 552 → 340 | 834,973 → 835,813 | 195 → 69 |
| desktop | 18 | mid | 690 → 464 | 890,835 → 890,835 | 195 → 69 |
| desktop | 26 | mid | 896 → 629 | 906,075 → 863,915 | 195 → 69 |
| desktop | 35 | shell | 900 → 589 | 907,445 → 808,763 | 195 → 25 |
| phone | 4 | all | 377 → 362 | 794,533 → 791,507 | 194 → 194 |
| phone | 7 | mid | 417 → 249 | 813,933 → 792,141 | 195 → 69 |
| phone | 10.5 | mid | 525 → 278 | 842,005 → 801,177 | 195 → 69 |
| phone | 15 | shell | 577 → 270 | 866,507 → 767,945 | 195 → 25 |

35 m låg bakom nästa husvägg och är därför endast en bevarad mätpunkt, **inte godkänd fjärrbild**. Den enda felaktiga kameran korrigeras till strax bortom 28 m; övriga gröna vyer och kontroller körs inte om. Korrigeringsresultatet och dess bilder har samma produktkällhashar. `--far-only` klarade 5/5 kontroller med 896 → 585 anrop vid 28,1 m: [rådata](far-correction.json), [logg](far-correction.txt), [före](https://github.com/solwation/kvarteret-lunden/blob/38ad014344e35fb196cf2c7f71dd322889a97226/docs/verification/288/desktop-28.1m-before.png?raw=true), [godkänd fjärrbild](desktop-28.1m-after.png). Endast denna kamera togs om; de accepterade 28 kontrollerna kördes inte om.

## Direkt granskade bilder

Dator: [nära 4 m](desktop-4m-after.png), [före 7 m](https://github.com/solwation/kvarteret-lunden/blob/38ad014344e35fb196cf2c7f71dd322889a97226/docs/verification/288/desktop-7m-before.png?raw=true), [efter 7 m](desktop-7m-after.png), [11,5 m](desktop-11.5m-after.png), [före 18 m](https://github.com/solwation/kvarteret-lunden/blob/38ad014344e35fb196cf2c7f71dd322889a97226/docs/verification/288/desktop-18m-before.png?raw=true), [efter 18 m](desktop-18m-after.png), [mitt i fade 26 m](desktop-26m-after.png). Den granskade men underkända 35 m-kameran visade grannhusets vägg i förgrunden och har uteslutits från leveransbilderna; originalbilden är arkiverad privat hos sessionen.

lowMemory på dator: [nära 4 m](phone-4m-after.png), [före 7 m](https://github.com/solwation/kvarteret-lunden/blob/38ad014344e35fb196cf2c7f71dd322889a97226/docs/verification/288/phone-7m-before.png?raw=true), [efter 7 m](phone-7m-after.png), [fade 10,5 m](phone-10.5m-after.png), [fjärrskal 15 m](phone-15m-after.png). Etiketterna phone i filnamnen betyder avståndspolicyn, inte en fysisk enhet.

Näroptiken behåller köksskåp, fönster och dörrar; mittbilderna visar Bayer-mönstret genom fönstren, lowMemory-fjärrvyn bara skalet. Ingen utökad natt-, all-lägenhetsvinkel-, fysisk enhets- eller prestandasvit har körts. Den publika appen har inget VisitLights-nattläge. `?nolod` behåller kodens tidigare två nivåer; separat ny världsladdning för den flaggan ingår inte i denna avgränsade kontroll.

## Slutlig importavgränsning

Vid sista diffgranskningen återställdes publicens ursprungliga opersonliga kommentarer och originalets oanvända `opaqueRects`-parameter/egenskapskopiering togs bort. Inga publika bygganrop skickar parametern och ingen publik kod läser egenskapen. LOD-, geometri-, material-, gallrings- och interaktionskod är byteidentisk med bildfasen. [Exakt hashmappning mellan bildfas och slutkälla](final-source.json). npm test och bygge kördes om för slutkällan; gröna bild-/beteendekontroller behålls enligt verifieringspolicyn.
