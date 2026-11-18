# Solpanelernas celler och glas, #304

Egen publicbas: `014f5c680bdb17595ff329dc7425cef193b3d21a`.
Granskad accepterad publicerad originalkälla: `4c82da2a0cdd5fe2392a3c5eb8c3da6237952e38`
([original #2083](https://github.com/solwation/lunden-3d-apartment/issues/2083)).
Urval: byteidentisk neutral `src/solarsurface.js`, exakt deklaration `SOLAR_SURFACE` med egen
publik ärendekommentar, samt tre ställen i publicens egen exterior: import, UV-anrop före lutning,
och materialanrop i befintlig panelbatch. Inga andra originalconfigvärden, bilder, personliga
resurser, spel-/tjänstekod eller historik importeras. Licenser/attribution behålls enligt projektet.

## Resultat och antaganden

Två delade atlaser ger mörka cellmellanrum, tunna ledarbanor och lugn glasroughness på endast
ursprunglig+Yovansida före panelens befintliga lutning. Publicens blå bas `COLORS.solar=0x1d2735`
och metalness0,5 behålls. Alla sido-/bottenfaces samplar en reserverad slät punkt med exakt
färgmultiplikator1 och Float32roughness0,3. Helt täckta topprampixlar använder samma släta finish.
Ingen ny spegelmiljö, transparens, normal-/bumpkarta eller displacement. Cellerna är läsbara nära
och mycket diskreta i den mörka helvyn; bilderna påstår ingen stor effekt på avstånd.

`SOLAR_SURFACE` är en konstnärlig **guess**, inte verifierad panel-/tillverkarmodell: ungefär1,68m
repetition med10×6celler,6mm mellanrum,3mm ledare, tre ledare per cell och15mm ram.
Hela repetitioner passas till varje redan modellerad lång remsa; detaljmåtten är alltså
ungefärliga visuella skalor. Publicens faktiska mått/placering/färger och övriga configbytes behålls.

L har3x-fält×4rader,12lutande boxar. A/B/C:s roofSpec ger pappvalmtak, takboxar och ventilationshuvar
utan denna solarkonsument. Nordic Wellness har egna låga blåboxar i sin delade glasbatch; åtta
villatak har mörka vertexfärgade takquads. Dessa är andra konsumenter och deras filer är bytekvar;
nykartan appliceras bara på L. `data/plan.json`, egna fasad-/öppnings-/takgångsrecept och
publik Navigation lämnas orörda. Inga personlighets-/avatar-/spelfunktioner tillkommer.

## Tre kontrollgrupper

1. `node --test tools/solarsurfacetest.mjs` — **3/3pass**. Deterministiska kartor, cell/gap/ledar-
   kontrast, slät region, cache/färgrymd/filter;12tri per box och alla12faktiska boxars position-/normal-/
   indexbytes samt UVallokering bevaras. Exakt källrekonstruktion till publicbasen utanför de tre
   avsedda exteriorraderna och det namngivna configblocket. Övriga takbyggare/roof-walk-filer bytekvar.
2. **npm test** (157moduler, innehåll/importgraf/nätpolicy) och **npm run build** passerar.
   Browsern injicerar sju syntetiska sentineller för originalets lagringsnamnrymd i en helt separat
   tom kontext: noll getItem/setItem/removeItem/clear-anrop därefter, alla sju värden oförändrade.
   Noll externa anrop, JS-/shaderfel; ingen riktig användarprofil öppnas.
3. **En egen faktisk public buildExterior-browser**, native1200×800 närvy och redan centrerad
   hel takvy, lika kamera/ljus före/efter. Före fasen byter bara publicbasens exterior.js.
   Alla emittedposition-/normal-/index-/icke-panelUVhashar, shadowflags, takgångsytor/väggar och
   kollisionssegment lika. Endast panelbatchens befintliga UV byter innehåll. Kartversioner är1
   efter båda vyerna: inga per-frameuppladdningar. Båda2400×838bildark öppnade och granskade;
   ingen kamerarättning, extra bildrunda eller bred äldre browserkörning.

```sh
python3 -m http.server 8214
PLAYWRIGHT_MODULE=/path/to/playwright node tools/solarsurface304browser.cjs http://localhost:8214 docs/verification/304
```

Körningen använde orkesterns minneswrapper:520MiB topp under4GiB. Egen server/browser stoppades.
Detta verifierar den faktiska komponenten och oförändrad takgångsmetadata; ingen ny full-app
rooftop-navigation, FPS, fysisk mobil eller uppmätt panelmodell påstås.

## Exakt resursbudget

| Resurs | Före | Efter | Skillnad |
| --- | ---: | ---: | ---: |
| Panelbatch / boxar |1 /12|1 /12|0|
| Paneltrianglar |144|144|0|
| Panelposition-/normalbyte |5184 /5184|5184 /5184|0|
| PanelUVbyte |3456|3456|0, nytt innehåll|
| Panelgeometribyte totalt |13824|13824|0|
| Exterior-komponentens mesh / trianglar |46 /91183|46 /91183|0|
| Exterior-attribut-/indexbyte |9353852|9353852|0|
| Närvy calls / ritade trianglar |13 /32397|13 /32397|0|
| Hel takvy calls / ritade trianglar |45 /85539|45 /85539|0|
| När-/helvy uppladdade texturer |5 /7|7 /9|+2vardera|
| När-/helvy standardprogram |8 /9|9 /10|+1variant|

Ny256²sRGB RGBA8färg:262144CPU/basbyte,349524nominella GPUbyte med full mipkedja.
Ny128²linjär RGBA8roughness:65536CPU/basbyte,87380nominella GPUbyte med mippar.
Totalt327680CPU/basbyte och436904nominella GPUbyte inklusive mippar; drivrutin/programlager
oräknade. Befintlig UVallokering återanvänds. Inga nya draw, geometrier, pass, ljus eller
per-frameuppladdningar. Extra standardmapsampling tillför fragmentarbete, inget FPS-löfte.

## Egna bilder

Två2400×838ark med38pxetikettrad och native1200×800paneler, utan beskärning eller omskalning.
Endast parade ark behålls, inga råa förebilder.

- [Nära solpanelerna](near.jpg): cellmellanrum och tunna ledare med mörk blå palett.
- [Hela publika taket](roof.jpg): samma tolv remsor, lutning, lyft och huskontur; detaljen diskret på håll.

## Källbindning

Granskade originalfiler (endast urvalet ovan överförs):

| Originalkälla | SHA256 |
| --- | --- |
| `src/solarsurface.js` | `8de38cd89bb0ba047628be7c40add1415f02879bc8234d7ccb7f885efaeb66c1` |
| `src/config.js` | `68387279fdaa6a0ed63bbbf983df4f91d3670a580a24674f6eb905f14e137fd0` |
| `src/exterior.js` | `2f30685b40ca94c3bce43f0d40b202ae7fd7678bcb3806968c2de22770ab713c` |

Egen testad publik källa:

| Publickälla | SHA256 |
| --- | --- |
| `src/exterior.js` | `feb70e3bada0edaa40f65a316fa9576607f4257c89120e7e1f5ab7096b193f4a` |
| `src/solarsurface.js` | `8de38cd89bb0ba047628be7c40add1415f02879bc8234d7ccb7f885efaeb66c1` |
| `src/config.js` | `166cf5f59e2a5b7b1daab8b7488e2bd7bb82ffdf067fa881022b51a788dfb56e` |
| `data/plan.json` | `5b76f14efff6287619f3ee4fd52aa3a4eb002599cad9d8bf29c92e1db030724b` |
| `src/corehouse.js` | `9b871af8f778a8f585b0fb7383d3e5c27af3f6653d7eb95138da282da4cb3c46` |
| `src/surroundings.js` | `2221cfce03931b4793d7c46ecc27753b3ed0b396b3ede717c42e0e8004fafaef` |
| `src/nordicgym.js` | `daa87d7a2479fa5365ac0d9fa0de45d6a92486e3d6ae01f5bab66b67ec4b31e6` |
| `src/southbackdrop.js` | `b1cc45154fcfd69c87bcfc2844f030b145e7d4c176710a3eb7d6f535e102341a` |
| `tools/solarsurfacetest.mjs` | `0691198c30029e117de7d162b7e81643ede88689dc3dc0b83ef1253857da24a7` |
| `tools/solarsurface304.html` | `29f1ad6fc857f6b7490f714315ffd906a6ff288b89ff6ff78707a118149ccd1f` |
| `tools/solarsurface304browser.cjs` | `8d6b7aa123fbaea4385a0baf1dbe445c5be061f1696b3d671f20e043a48a41a6` |

[Fulla egna geometri-/material-/kameravärden och lagringsbevis](browser.json).
README är publicens ändringsnotis; ingen originaländringslogg överförs.

Dirigenten har granskat båda egna slutliga bildark och selektiv diff. Testad helper, exterior och fixture är byteidentiska; publicens accepterade barkblock och alla äldre README-/upstreambytes bevaras. Källbundet grönt underlag återanvänds utan ny browser- eller bred testkörning.

## Publicering

Kod/bilder `fc18424b2931954a0427bf8eae51eacc1f61b0dd`; faktiska run-ID [44283123094] success på exakt revision. Alla bilder HTTP200 och inbäddade före stängning: https://github.com/solwation/kvarteret-lunden/issues/304#issuecomment-6975488075. Slutkvittot ändrar inte appkällan; dess separata Pages-run följs av dirigenten.
