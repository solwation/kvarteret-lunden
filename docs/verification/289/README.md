# Mätbara lägenhetsytor i mellannivån — #289

Selektiv överföring från originalets `3f7c3d0b1983bec2cde7fd44855c1c0af19744ba` ([#1999](https://github.com/solwation/lunden-3d-apartment/issues/1999)), publik baslinje `890b3a280623531925a56fa0d277429b1b4b29d1`. Produktionsändringen är enbart raycast-villkoret i VisitUnit.buildMid: native Mesh.raycast behålls på sammanslagna solida ytor; LineSegments förblir render-only. Inga geometri-, material-, detaljavstånd-, navigations-, dörr-, lagrings- eller tjänsteändringar. Originalets Measure-klass, övriga filer och historik importeras inte.

## Egna publika kontroller

- `npm test`: godkänt, 149 moduler, importgraf/planer och innehålls-/lagrings-/same-origin-gränser. [Logg](npm-test.txt).
- `npm run build`: godkänt, version `528760cfd5e983e1d06fbbbf`. [Logg](npm-build.txt).
- `tools/visitmeasure289-check.mjs http://127.0.0.1:8829 docs/verification/289` genom värdens browserwrapper: **7/7 godkända**. [Logg](browser.txt), [rådata/källhashar](result.json). Inga sid-/GLSL-fel eller externa anrop.

Körningen använder publik VisitUnit och **ordagrant hämtade funktionstexter ur aktuell publik main.js**: visible, surfaceVisible, clearMeasurement, measureAt och setMeasure. Drivrutinen tar två avgränsade textblock mellan fasta funktionsankare och tillför dem oförändrade till en lokal provmodul. Både hela main.js, blockens gemensamma SHA-256, VisitUnit/lod och provkällorna är hashbundna i resultatet. Detta verifierar publicens verkliga synlighetsfilter och skapande av mätpunkter/avståndstext; det använder inte originalets Measure.

Det är en avgränsad komponent med uttryckligen syntetisk fast inredning, bakvägg och en närmare arkitekturlinje. Stora World/ordinarie startsekvensen och native tangent-/touchinmatning laddas inte. Befintlig renderloop/navigering ändras inte av produktionsfixen. Chromium/SwiftShader, 900×576 viewport, 900×500 scenbild, DPR1; ingen fysisk telefon eller helvärldsprestanda påstås. Server8829 och egen browser avslutade; wrapperlås släppt. Wrappern uppgav att systemd-minnestak saknas i miljön.

## Resultat

Samma mätstrålar väljs från14 m framför lägenhetens footprint. Gamla blanket-no-op-metoden aktiveras enbart i minnet som kontroll och återställs sedan till den fixerade native-metoden. Ursprunglig fast inredning är dold i båda fallen, så dess geometri kan inte rädda felet.

Före: publicens riktiga measureAt skapar punkter på bakväggens z=4,9 med x≈±0,6097 och visar **1,22 m**. Efter: punkterna ligger på den synliga sammanslagna framsidans z=1,5, x=±0,5 och visar **1 m**, enligt publicens befintliga svenska formattering. Nära/full vid4 m mäter originalets framsida; mid vid14 m mäter fortfarande rätt när det dolda originalet flyttas närmare; shell vid30 m mäter bakväggen; away ger inga punkter. Linjer är fortsatt utan native raycast och väljs aldrig som solida ytor. En explicit provblads-state växlar mid→all→mid med öppet/stängt läge vid8 m och behåller befintliga fullnivågränsen; detta är ingen ny animation-/inputsvit.

Båda bilderna har exakt **7 ritanrop / 306 trianglar**, inklusive golv, två publika markörsfärer och linjen. Ingen GPU-/FPS-vinst påstås; raycast-rättningen ändrar inga inlämnade ytor. Det är en egen publik mätning, inte originalets andra markörgeometri eller återanvänt browserresultat.

## Direkt granskade bilder

[Före: mätpunkter bakom synlig inredning](before/mid.png), [efter: punkter på framsidan](after-mid.png). Båda granskades direkt. Den separata sidokameran gör punkternas fel/rätta placering tydlig; den väljer inte mätstrålarna. Rubriken anger komponentavgränsningen. Originalets före-/efterbilder kopieras inte.

## Delad implementation och offentlig avgränsning

L1004 (delad plan) och L1201 (egen plan/höjd) byggs av samma buildVisitFlat/VisitUnit och får samma Mesh/LineSegments-villkor. Felet är ingen plan-/placeringsgren. Detta är en granskning av den gemensamma källvägen med ett representativt komponentprov, ingen ny fullvärldsrundtur i båda lägenheterna. A/B/C/L:s Core/CoreHouse-trapphus använder inte VisitUnit och berörs inte. Personliga resurser, originalets lagring, spel och tjänster tillförs inte. README, upstreamregistret och verifieringsämnet uppdateras; public har ingen separat besökarändringslogg.
