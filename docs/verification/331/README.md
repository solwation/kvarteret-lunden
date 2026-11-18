# #331 – bladkortens uttoning från kanten (port av original #2133)

Källa: original `48c80e0e` (#2133). Urval och ej tillämpliga delar: [docs/upstream.md](../../upstream.md#bladkortens-uttoning-från-kanten-331).

## Kontroller

- `node --test tools/leafgrazetest.mjs`: 4/4 (originalets funktionstester). Patchen finns en gång före alphaTest i det delade,
  LOD nära/fjärran- och vindbladmaterialet och i inget av deras skuggdjupmaterial; programnycklarna förblir tre (nära och
  fjärran delar program), materialet behåller nativ vertexkompilering, atlasfiltrering, alphaTest och dubbelsidighet.
  Uttoningen slutar senast vid mobilens LOD-start (30 m). Från 4 m runt en trädlob skärs 18,9 % av korttrianglarna bort;
  kärnan aldrig. Även `treeformtest` 6/6, `lodtest` 7/7, `sitewindtest` 7/7, `barksurfacetest` 3/3.
- `npm test`, `npm run build`: gröna.
- Egen browser `node tools/leafgraze331browser.cjs http://localhost:8351 docs/verification/331` i den riktiga publika appen
  (Chromium/SwiftShader, 960 × 600, `?nocats&wind=0,0` = stilla luft, fast klocka 15 juni). Före = `1870e5d`:s
  `foliage.js`/`config.js` serverade i stället för arbetsfilerna (skillnaden mot porten är bara uttoningen; de övriga
  ändringarna i `1870e5d` gäller ekorrar). Samma kamera i båda faserna. Noll externa anrop, inga sid- eller shaderfel,
  lagringsnycklarna oförändrade (`kvarteret-lunden.paddockGrass` och provnyckeln). Rådata: `browser.json`.
- Känt, inte orsakat här: `tools/leafrgbtest.mjs` test 3 (fryst helfilsjämförelse mot `553aa04`) faller redan före ändringen
  och hanteras i #329; filen är orörd här.

## Bilder (`before/<vy>.jpg` före, `<vy>.jpg` efter)

- `park.jpg`: parkvyn vid bron (som #327:s `bridge`). Svagt: de närmaste kronornas utdragna strimmor glesnar, konturerna står kvar (0,9 % pixlar ändrade).
- `under-south.jpg`, `under-west.jpg`, `under-north.jpg`: upp i brons parkträd från 3,2–4,5 m, tre riktningar. De utsmetade
  banden i kronans kanter försvinner, löven läses som löv (1,9–3,3 % pixlar ändrade).

## Kostnad

| Vy | calls före → efter | trianglar före → efter | program före → efter |
|---|---|---|---|
| park | 39 → 39 | 473 412 → 473 412 | 67 → 67 |
| under-south | 45 → 45 | 457 683 → 457 683 | 68 → 68 |
| under-west | 35 → 35 | 464 788 → 464 728 | 70 → 70 |
| under-north | 34 → 34 | 440 888 → 440 888 | 70 → 70 |

Inga nya draws, texturer (68–69), geometrier, uniforms eller arbete per bildruta. Under-west skiljer 60 trianglar genom
LOD-ompackning längs kamerans väg. På GPU:n gör varje bladfragment två derivator, en kryssprodukt och två smoothstep.

## Begränsningar

Kort sedda måttligt snett (|cos| över ca 0,3) ser fortfarande något utdragna ut (avsiktligt, så kronorna inte tunnas ut).
Kronor bortom 30 m, fjärr-LOD och södra skogen är oförändrade. Gårdens planteringar och klängväxten delar materialet och får
samma uttoning på nära håll men är inte fotograferade här. Mobilprofilen får samma fragmentsteg; inte mätt på en riktig telefon.
