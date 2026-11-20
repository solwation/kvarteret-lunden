# Public #347: dagsljus i trapphusen

Publik bas `23483c5` (före = basens `config.js`, `core.js`, `corehouse.js`, `main.js`; ingen `stairdaylight.js`), granskad originalkälla
`1da6a3c94adf3115a0b5845bd87c9106f73db987` ([original #2183](https://github.com/solwation/lunden-3d-apartment/issues/2183)).
Egen körning av den riktiga publika appen (`tools/stairdaylight347browser.cjs`, Chromium/SwiftShader, fast klocka, native 960×600, JPEG);
rådata i [browser.json](browser.json). Vyerna är originalets #2183-vyer (samma planmeter), kameran inne i varje trapphuskärna mot dess egna glas.

| Bild (efter / före) | Vy (x, z, gir°, lutning°, fot-y) | Visar |
|---|---|---|
| `L-after.jpg` / `before/L-before.jpg` | Hus L −17,5, 5,2, 0, 4, 0 — uppför trappan mot trapphusfönstret | Vilplanets tak och golv ljusnar mot fönstret, taket mörknar bort från det; målningskorn på väggarna. Före: jämnt lampljus. |
| `A-after.jpg` / `before/A-before.jpg` | Hus A 1,3, 36,6, 0, 2, 0 — från trapphallen norrut mot entréglaset | Dunklare hall i förgrunden, ljusare golv och väggar vid entréglaset. |
| `B-after.jpg` / `before/B-before.jpg` | Hus B −33,9, 42,6, 0, 2, 0 — längs entrékorridoren mot dörren och sidoljuset | Samma gradient längs korridoren. |
| `C-after.jpg` / `before/C-before.jpg` | Hus C −60,9, 24,0, −90, 2, 0 — österut genom lobbyn mot entréglaset | Samma gradient mot entrén. |

Pixelstatistik (medelluminans 0–255 / andel helt utfrätta pixlar, alla kanaler ≥ 250 / medelmättnad), före → efter:

| Vy | före | efter |
|---|---|---|
| L | 211,0 / 0 / 0,039 | 198,4 / 0 / 0,038 |
| A | 219,6 / 0 / 0,030 | 186,4 / 0 / 0,032 |
| B | 218,1 / 0 / 0,029 | 183,6 / 0 / 0,031 |
| C | 212,5 / 0 / 0,028 | 177,2 / 0 / 0,030 |

Inga utfrätta pixlar före eller efter (originalets 1,1 % var dess QR-kort i bildhudet, som publiken saknar). Vyerna blir mörkare i medel
eftersom lampljuset dämpas djupt i kärnan dagtid (`ambient` 0,68) och lyfts bara nära glaset; A/B/C-vyerna ser mest vägg långt från glaset.

Kostnad (renderer.info efter en bildruta, före → efter): L 125 calls / 514 906 trianglar / 75 program → identiskt, texturer 72 → 73;
A 528 / 699 934 / 76 → identiskt, 76 → 77; B 482 / 719 120 / 76 → identiskt, 78 → 79; C 621 / 902 710 / 83 → identiskt, 87 → 88.
Den patchade väggshadern (ett program för alla fyra hus, `customProgramCacheKey`) ersätter det enkla vertexfärgsprogrammet i vyerna.
Telefonprofilen (`&lowmem`): ingen `dayK`, inget patchat material och exakt samma calls/trianglar/texturer/geometrier/program som basen i alla fyra vyer.
`dayK` (min / medel / max, inga NaN) i de sju väggnäten (L + inner-/yttersidor för A/B/C): 0,10/0,39/1,21 i Hus L, övriga 0,01/0,02–0,08/0,10–0,98.
Inga sidfel, inga externa anrop.

Hus kontrollerade: A, B och C (`src/corehouse.js`, en gemensam implementation) och L (`src/core.js`); varje kärnas egna rutor är dess
dagsljuskällor. Peab-geometri, avsiktligt glas, passager, glasmaterial och dörrar är orörda.

Anpassning: publiken saknar dygnscykel och väder (fast klart dagsljus, `LIGHTING.sky`), så `uDay = dayBlend(STAIR_DAYLIGHT.fixed)` = 1
sätts en gång i `main.js` (där fönsterljusen sätts till kl. 12/natt 0) i stället för varje bildruta; `dayBlend` behålls som ren
funktion och testas. Ingen kvalitetsnivå finns, så detaljtexturen är på utom på telefon (där patchen aldrig görs). Ingen nattbild:
publiken har ingen natt för trapphusen. `?nostairday` stänger av båda termerna.

Begränsningar (som originalet): effekten är avsiktligt mild; väggar skymmer inte dagsljuset, dörrbladen får inget och trappnosarna
har inget eget slitage. Alla värden i `STAIR_DAYLIGHT` är *guess*.
