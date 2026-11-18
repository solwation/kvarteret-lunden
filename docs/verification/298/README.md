# Åbroarnas diskreta betongyta — #298

Selektiv källa: publicerade originalrevisionen
`bcbfbf27db9bd5785c36ec9845c915103f8ef5b9` (original #2076).
Publik jämförelsebas: `1bcd30b`. [Urval och anpassning](../../upstream.md).
`upstream-source.json` innehåller de granskade originalfilernas SHA-256;
`browser.json` binder egen grön körning till aktuella produkt-/underlags-/fixturehashar.
Hjälparen `bridgeconcrete.js` är byteidentisk med den publicerade källan och exakt
`BRIDGE_CONCRETE` har överförts. Publicens byggare ändras endast på tre ställen:
helperimport, projektion av betong-UV i boxhjälparen och betongmaterialet.

## Resultat och egna bilder

En delad linjär RGBA-karta ger låg porstruktur och en mycket svag matthetsvariation.
Vit materialkulör och befintlig vertexfärg behålls. Materialet beskriver konstnärliga
antaganden, inte uppmätt brobetong. Inga nya sprickor, fogar, missfärgningar,
displacement, ljus, pass eller uppdateringsloopar införs.

Alla tre egna kontaktark är öppnade och granskade, **före vänster, efter höger**:

- [Närpelare](pillar.jpg): verkligt solbelyst pelarhörn, cirka 42 cm till målpunkten.
- [Gånghöjd](walking.jpg): den befintliga östra gångbanan, kantbalk och räcken.
- [Helbroar](full.jpg): båda broarna med brofästen, pelare och vattenbatch.

Varje halva är en komplett nativebild 1120×800, DPR 1, utan nedskalning, i ett
2240×835-ark med 35 px textband. Bildproportionen 1,4 bevaras. Originalets bilder
återanvänds inte; inga råa före-bilder behålls. Samma kameror, MSAA, NeutralToneMapping
och två fixture-ljus används före/efter. Inline-favicon finns från början.

Ytskillnaden är avsiktligt **mycket subtil** i denna ljussättning. Närbilden visar den
låga materialresponsen; gång-/helbilder är främst stöd för att arkitekturen bevaras.
Ingen dramatisk bildskillnad eller tydligare fjärrdetalj påstås. En egen scopedkörning
gjordes; ingen extra kameraförfining eller bred äldre browserkontroll behövdes.

## Tre kontrollgrupper

1. `tools/bridgeconcrete298test.mjs`: tre nya fall för deterministiska ändliga kartdata,
   låg por-/matthetsnivå, en delad linjär cachetextur, metriska per-faceUV, oförändrade
   positions-/normal-/indexdata och båda brovarianternas däck/frihöjd/pelarqueries.
   Två granitkantstensboxar, exakt 72 vertex, har konstant UV i kartans flata swatch:
   noll bumpvariation och G255 × bevarad materialroughness0,95. Kulören behålls.
2. Befintliga `tools/riverfalltest.mjs` och `tools/riverbridgeviewtest.mjs`: vattenfall,
   publicens egna barriär/återhämtning och gång i båda riktningar under broarna med
   ståhöjd, samt befintliga brons/åns miljökontrakt. **13/13** kombinerade fall pass,
   logg i `node-tests.txt`. Den gamla fullbuffertfingerprinten omfattar även UV och
   får därför en avsiktlig betong-UV-uppdatering. Därutöver är `npm test` och
   `npm run build` gröna; egna loggar finns här. Publicens vanliga test kontrollerar
   bland annat importgraf, innehålls-/lagrings-/tjänstgränser och statisk nätpolicy.
3. `tools/bridgeconcrete298browser.cjs`: egen Chromium/SwiftShader-körning av den
   riktiga publika `buildRiverBridges`. Före-fasen routar endast `riverbridge.js`
   till exakt publik bas; alla andra inputs och nya konstanter är samma (basen
   använder inte det nya blocket). Alla position-, normal-, färg- och indexdata,
   attributantal/skuggflaggor, båda broregister, sex pelarboxar och däck-/undersides-/
   vattenqueries matchar före/efter. Endast betong-UV ändras. Texturversion stannar
   på1 genom rendering: ingen per-frameuppladdning. Noll sid-/konsol-/shaderfel,
   externa anrop eller lokala/session-lagringsnycklar i komponentkörningen.

## Båda varianter och offentlig avgränsning

Road och GC behåller egna mått, brofästen, tak/frihöjd och vattennivå. Den befintliga
vägbrons sex pelare/fötter får relief; samma gäller båda broarnas betongdäck/kanter
samt brofästen. Granitmasken skiljer de två kantstensboxarna från betongen i samma
materialbatch. A/B/C/L har ingen konsument av detta broytmaterial och ingår inte.

Publicens grundare botten/pelarform, egna vattenbarriär och båda callback-parametrarna
`approachGround`/`trimApproach` är bevarade; originalets poolmått och simning importeras
inte. Inget personligt innehåll, gameplay, originaltjänst, Cloudflare, resurs eller
lagringskoppling till originalet. Ingen annan originalkonfiguration eller historik
förs över. Broarnas tidigare frånvaro av snöregistrering behålls.

## Exakt resurskostnad

| Batch | Trianglar före = efter | Råa geometribyte före = efter |
| --- | --- | --- |
| Betong | 288 | 38 016 |
| Stål | 7 224 | 953 568 |
| Asfalt med komponentens anslutningar | 204 | 19 584 |
| Vatten | 1 122 | 107 712 |
| Totalt | **8 838** | **1 118 880** |

Alla tre frysta vyer har **4→4 anrop**, **8 838→8 838 trianglar** och **0→1 texturer**.
Ingen geometri, attribut eller buffert tillkommer. En delad128×128 RGBA8-karta ger
**65 536 kvarhållna CPU-byte** och **87 380 nominella GPU-byte** för hela mipkedjan,
drivrutinsomkostnad oräknad. Samma karta används för bump och roughness; basroughness
0,95 behålls. Standardmaterialets extra texturläsningar kostar fragmentarbete;
ingen FPS-förbättring eller fysisk GPU-minnesmätning påstås. Ingen per-framegenerering.

## Komponentgräns och återkörning

Fixturen bygger riktiga publika broar och använder produktionsformeln
`max(groundY, renderedTerrainY)` för approachGround. Den använder byggarens default
identity för trimApproach. Surroundings-byggarens stora pavementjoin-/klippunderlag,
terräng, stränder, byggnader och navigationsrutt ingår inte. Det är en komponentkontroll,
inte en ny fullvärlds-, Pages-livebeteende- eller fysisk-enhetsmätning. Den oförändrade
callbacklogiken och dess anrop bevaras genom att övrig buildertext är byteidentisk.

```sh
python3 -m http.server 8202
npm test
npm run build
node --test tools/bridgeconcrete298test.mjs tools/riverfalltest.mjs tools/riverbridgeviewtest.mjs
node tools/bridgeconcrete298browser.cjs http://localhost:8202 docs/verification/298
```

Lokala Three.js0.170.0 och Playwright används; `CHROME_PATH`/`PLAYWRIGHT_MODULE`
kan sättas vid behov. Egen browser kördes genom orkesterns resursbegränsade wrapper.
Integrationsägaren publicerar, kontrollerar riktiga Pages-körningen och bäddar in
HTTP-åtkomliga revisionsbundna bilder före stängningspush.

## Integrationsbindning

Testad bridgehelper/builder/snapshot är byteidentiska med a65e0243. Gemensam config får enbart BRIDGE_CONCRETE ovanpå tidigare screen/pavingadditioner; alla äldre bytes och README/upstreamtexter bevaras. Källbundna gröna komponent/npmresultat återanvänds utan omtag efter oberoende tillägg.
