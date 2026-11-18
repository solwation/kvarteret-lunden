# Flackare södra broanslutning, #301

Egen publicbas: `2636f11d4374e332df3c6f81d545b13d41e122e9`.
Granskad publicerad originalkälla: `bc00a3e5b30fbacec71ec8ea76142ba9b16391eb`
([original #2079](https://github.com/solwation/lunden-3d-apartment/issues/2079)).
Bara den neutrala `southbank.js`-hjälparen och deklarationen `SOUTH_BRIDGE_APPROACH` överförs;
hjälparen är byteidentisk med källan. Publicens egen configkommentar hänvisar till #301.
Ingen originalbild, personlig resurs, spel-/simningskod, tjänst, full config eller historik importeras.

## Profil och avgränsning

Den tidigare antagna anslutningen z147..152 lyfte vägen från −3 till −0,34 på fem meter.
En lokal Hermite-profil z147..203,9 börjar vid oflyttat brodatum med noll tangent och möter
befintligt vägkrön0,54 med dess utgående tangent. Central halvbredd8m omfattar väg/GC/gångmarginaler;
mjuk sidofade slutar vid18m. Ursprungligt tvärfall återkommer gradvis mot södra anslutningen.
Alla nya profilhöjder, längder och bredder är **guess**, inte ny inmätning. Den befintliga stigningen
mot södra platån behålls; den korta branta väggen tas bort. Råa11väg-/50tvärsektionskontroller
från LM är oförändrade (markdata med ungefär3–5m horisontell registrering, inte mätt brodeck).

Publicens `surroundings.js`, `riverbridge.js`, `roads.js`, `walksupport.js`, `navigation.js` är helt
byteoförändrade. Dess egna botten-/pelarmått, vattenbarriär, roadGround-grid/refined,
connectPavement/trimApproach och gångstöd används som tidigare. Building-pad-listan, broregister,
pelare samt deck/undersida/vatten/underpassfrågor jämförs lika i egen före/efterbyggare.
Bankerna vid±20m och analytisk mark utanför korridoren är exakt kvar. Befintlig terrängkantinterpolation
har en cellhalo: ritad mark kontrolleras oförändrad bortom z143..208 /24m halvbredd.
Terrängens81486positioner behåller antal, XZ och index. A/B/C/L ligger norr om korridoren;
ingen motsvarande husgeometri påverkas.

## Tre kontrollgrupper

1. `node --test tools/southbridge301test.mjs tools/southbanktest.mjs tools/riverbridgeviewtest.mjs tools/walksupport-test.mjs`
   — **12/12pass**. Höjd/tangentkontinuitet, låg längslutning, lokalitet, råkällor, plateau,
   bro/underpass/vatten och verkliga gångstödsplan. Alla configbytes utanför namngivet block och
   avsedd kommentar bevaras. Gamla assertions om ett3m högt krön direkt efter bron ersätts med den
   avsedda flacka profilen och exakt oförändrade fjärrbanker.
2. **npm test** (156moduler/innehåll/importgraf/nätpolicy), **npm run build** och lagrings-/nätisolering.
   Browsern injicerar sju syntetiska originalnamnrymds-sentineller i en tom separat kontext.
   Noll getItem/setItem/removeItem/clear-anrop efter injektion; alla sju värden oförändrade.
   Noll externa anrop, JS-/shaderfel. Inget riktigt användarprofilkonto öppnas.
3. **En egen faktisk public buildSurroundings-browser** med produktionsgräs, samtliga publika
   roadGround-/trimApproach-/WalkSupport-konsumenter och tre matchade1120×800-vyer. Inget ersatt
   vägmesh, ingen träddöljning. Verklig `Navigation` går väg/GC båda håll vid gång/sprint med50mssteg;
   fyra rutter når samtliga mål, maximalt fot-/gångstödsfel0,014015m (före upp till0,327661m).
   Oflyttade brodeck ger fortsatt null separat walkingSupport och walkingGroundY=deck.

Kameror, profiler, stödgränser och fulla råvärden finns i [browser.json](browser.json).
Gångstödets core{x13..36,z143..192} och outer{x11,61..38,z142..194} är lika; antalet fångade
supporttrianglar6317→5948 följer de befintliga adaptivt uppdelade vägytorna. Ingen gångstödsregel ändras.
Browsern kontrollerar den riktiga byggaren och neutrala navigationen, inte hela appens UI eller fysisk enhet.

```sh
python3 -m http.server 8209
PLAYWRIGHT_MODULE=/path/to/playwright node tools/southbridge301browser.cjs http://localhost:8209 docs/verification/301
```

Körningen använde orkesterns minneswrapper,942MiB topp under4GiB. Egen server/browser stoppades.
Inga extra kamerarundor eller breda äldre browserkontroller gjordes.

## Exakt komponentbudget

| Hela surroundings-fixturen | Före | Efter | Skillnad |
| --- | ---: | ---: | ---: |
| Unika geometrier |123|123|0|
| Unika meshtrianglar, även dold queryterräng |722173|721806|−367|
| Separata nätlinjesegment |76|76|0|
| Attribut-/indexbyte, alla geometrier |66392622|66357270|−35352|
| Rapportvy calls / ritade trianglar |43 /572780|43 /572413|0 /−367|
| Sidovy calls / ritade trianglar |47 /601752|47 /601385|0 /−367|
| Övergång calls / ritade trianglar |41 /565372|41 /565005|0 /−367|
| Ritade texturer, varje vy |10|10|0|

Befintlig adaptiv triangulering förenklas: väg−40, broanslutningar−177, parkasfalt−140,
south-land−10trianglar. Geometrin för bridge concrete/steel/water är byteoförändrad.
Inga nya batcher, material, kartor, ljus, pass eller per-frameuppladdningar. Detta är komponentens
budget; inga globala FPS-/mobilstabilitetslöften.

Efter capture korrigerades enbart den lokala budgeträknaren: fotbollsnätets152linjevertices var
inräknade som50⅔trianglar. Råinventory och oförändrad `footballmodel.js` visar76linjesegment.
Tabellen/JSON:s meshtrianglar drar bort dessa, och fixturens framtida räknare använder `isMesh`.
`captureSource` behåller de faktiskt körda hashvärdena; `source` anger slutliga filer.
Produktkod, kameror, renderade triangeltal och bildbytes ändrades inte vid aritmetikrättningen.

## Egna bilder

Tre2240×835kontaktark, där varje1120×800-panel behåller sin nativeaspekt utan beskärning.
Alla tre öppnades och granskades; endast kontaktark behålls.

- [Rapportlik vy från GC-bron](report.jpg): tidigare vägvägg och ny lång anslutning.
- [Sida](side.jpg): oflyttad bro och sammanhängande mark/väg/trottoar.
- [Nära övergång](transition.jpg): den branta väggen försvinner över väg och gångmarginaler.

## Källbindning

Granskad originalhjälpare SHA256: `784b92d13a248359abc391889e411d431b7b9e41a4ce31b5e10c053cc063ddae`.
Granskad originalconfig SHA256: `50e1f2f30aa1b1342a4aec4a9dbfc848b4d6a3050a18fb9af7ad0fe708d5e573`.
Endast ovan nämnda deklaration hämtas ur config; inga övriga originalvärden överförs.

| Slutlig publickälla | SHA256 |
| --- | --- |
| `src/southbank.js` | `784b92d13a248359abc391889e411d431b7b9e41a4ce31b5e10c053cc063ddae` |
| `src/config.js` | `e5222c9be2a685502d442de31196d8167c54375f856b98a8d11df1249bb97108` |
| `src/surroundings.js` | `381d174ac61a3f3129ec06d207a642ce5f5e552ed8fdb5db39aaa700997b2e46` |
| `src/riverbridge.js` | `0dd911cc28da9268e69cd68f9055072931705a16f9ce50c91cd3ed44b00f5474` |
| `src/roads.js` | `ef47ca91e59985be9e68753a721955426c221de92fa5387f98fa5a6c29849e65` |
| `src/walksupport.js` | `74c09265dfc6556700bb589e4f9117effde031a259d937a7ae6497443ef0b1ae` |
| `src/navigation.js` | `c2f9b55b6dc2f75518250228f62c1afa5decfdcc99ac3b82a9bfb2b7668efa40` |
| `tools/southbridge301.html` | `30a6690984460833250d7529a9b563e37ad7547781634e802bf9dbccb3ce6d02` |
| `tools/southbridge301browser.cjs` | `9614c78f2717888a4693c7e7a4146357405fa7fb77b99f3b2d29e6d80c7490d7` |
| `tools/southbridge301test.mjs` | `cef5023908d0c6ffcd78d8922ccfca0625025d0c7e89bc558cfbeb829284e145` |

Attribution/licenser behålls enligt projektets befintliga källredovisning.
README är publicens ändringsnotis; ingen originaländringslogg importeras.

## Integration review

Root inspected report/transition pairs and reviewed all three worker-inspected images and green groups. Product helper/fixtures/tests match a3899215 exactly. Config changes only the named approach block and historical comment; all prior config bytes and upstream/README content are retained. Independent #300 pavement at z19–58 remains; the graded corridor begins z147. Original source-bound component totals above exclude that unrelated new strip. No duplicate browser/broad tests needed.

## Publicering

Kod/bilder `f8d1b798f082c41f193da7067b96c85eb6fdd395`; faktiska run-ID [44278805692] success på exakt revision. Alla bilder HTTP200 och inbäddade före stängning: https://github.com/solwation/kvarteret-lunden/issues/301#issuecomment-6974868709. Slutkvittot ändrar inte appkällan; dess separata Pages-run följs av dirigenten.
