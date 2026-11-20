# #346 – målade väggar och takmaterial

Publik bas `23483c52f061f4bcd01dc99f337827c59a77eee8`, granskad originalkälla `2e3e2ec5b63a295d26565fe84695038475eecbc7` (#2205). Bara den neutrala målningsmodulen, `PAINT_SURFACE` och befintliga `world.js` `M.wall/ceiling` har importerats. `selection.json` binder urval och testade källhashar. Alla källans funktioner från `paintDetailAt` och framåt, inklusive kartgenerering, textur, shader och cache-/vertexregistrering, är byteidentiska. Den lokala debugkontrollen före dem är publikens egen.

Originalets kökskåpa/interior-materialdelning, main/Quality-controller, personliga resurser, ändringshistorik och bilder är inte importerade. Publikens main/interior/vertexcompile är oförändrade. Ingen geometri, färg, grundroughness, kollision, parkett, kakel eller skärmvägg ändras. Befintliga målade material delas också av L1004/L1201:s skal. Inga tjänster, nät- eller lagringsfunktioner följer med.

Parametrarna är konstnärliga antaganden: väggens höjd 0,24 mm och upprepning 80 mm, takets 0,45 mm och 150 mm, avståndsuttoning 1,5–4,5 m. En linjär packad 128×128 RGBA8-karta innehåller höjd i R och roughnessavvikelse runt 0,5 i G. Bara normal och roughness ändras i fragmentsteget. `rememberFragmentCompile` använder publikens befintliga API, vilket bevarar vertex-/skuggkontraktet. Ingen positionsdisplacement eller UV-/geometriredigering.

Publiken saknar automatisk Quality: den rena `paintDetailEnabled(search)` läser endast `?quality=0` eller `?nopaint` och stänger av denna detaljuniform. Det är ingen global kvalitetsmodell, inställning eller lagring. Andra nivåer och lowMemory behåller samma lilla gemensamma karta som originalet; kvalitet 0 hoppar över textursamplingen, men shadern/kartan och viss derivatberäkning finns kvar.

## Tre riktade kontroller

1. `node --test tools/paintsurfacetest.mjs`: **4/4**, portade deterministisk karta/cache/mip/fade, Standard-shader/clone/vertexkontrakt samt publikens kvalitet0/nopaint. `node.txt`.
2. `npm test`: **186 moduler**, importgraf, publik innehålls-/lagrings-/nätisolering och två planritningar. `npm run build`: **b1bdf0a291c290d7e35258b5**. Loggar sparade; syntax och diffkontroll rena.
3. Egen verklig publik app i Chromium/SwiftShader med fryst scen/kamera och fast publik dagsljus, **960×640 DPR1**. Samma material visas med bara `paintDetail` av/på. Både vägg- och takkonsumenterna finns, native vertexkontrakt är 0, karta/fade/debug stämmer; noll fel och externa anrop. Fem syntetiska originalnamnrymdssentineller är orörda och originallagring varken läst eller skriven. Appens vanliga egna paddock-/uppdateringsnycklar är kvar; därför påstås inte noll egna lagringsanrop. `browser.json`.

```sh
python3 -m http.server 8450 --bind 127.0.0.1
PLAYWRIGHT_MODULE=/path/to/playwright /path/to/original/tools/browsertest.sh \
  node tools/paintsurface346browser.cjs http://localhost:8450 docs/verification/346
# Separat uttryckligt diagnostiskt strykljus, samma riktiga publika tak/material:
PLAYWRIGHT_MODULE=/path/to/playwright /path/to/original/tools/browsertest.sh \
  node tools/paintgrazing346browser.cjs http://localhost:8450 docs/verification/346
```

## Egna bilder och fast dagsljus

Alla sparade bilder öppnades och granskades i ursprunglig proportion, med samma upplösning inom varje par. [av-kontrollen wall.png](https://github.com/solwation/kvarteret-lunden/blob/6f07b2592c115e1b53bb5b4f8cde8c03722eb1f3/docs/verification/346/before/wall.png) → `wall.png` visar mycket fin, återhållsam väggstruktur med bibehållen färg. Kameran är `[0.85,1.65,9.2]` mot `[0.1,1.8,8.4]` i L1007:s riktiga skal. Bildens genomsnittliga absoluta kanaländring är cirka 0,28 av 255; detta är diskret detalj, inte en ny väggkulör.

[av-kontrollen ceiling.png](https://github.com/solwation/kvarteret-lunden/blob/6f07b2592c115e1b53bb5b4f8cde8c03722eb1f3/docs/verification/346/before/ceiling.png) → `ceiling.png` är **pixelidentiska i den här verifierade fasta dagsljusvyn**. Publiken har inga uppåtriktade taklampor, så takets undersida belyses här i praktiken med jämnt indirekt ljus. Det är en faktisk synlighetsbegränsning. Produktionsljusen eller shaderstyrkan har inte ändrats för att få en skillnad.

[av-kontrollen ceiling-grazing.png](https://github.com/solwation/kvarteret-lunden/blob/6f07b2592c115e1b53bb5b4f8cde8c03722eb1f3/docs/verification/346/before/ceiling-grazing.png) → `ceiling-grazing.png` är en separat **diagnostisk** kontroll av samma riktiga takgeometri/material, kamera `[3.05,2.05,8.6]` mot `[3.2,2.65,10.35]`, med ett tillfälligt släpljus enbart i testet. Den grövre takstrukturen kan då ses. `grazing.json` anger ljuset och kostnaden; det motsvarar inte appens vanliga dagsljus och är ingen bild av en ny produktfunktion för belysning. Den första diagnostiska bildtagningen fångade en resize-race (480×320 före, 960×640 efter); den kasserades och samma begränsade par togs om med synkron renderstorlek. Inga produktionsbytes ändrades och ingen bred profilmatris kördes. `pixels.json` binder slutliga bildstorlekar och skillnader.

## Budget och gränser

Normal app, samma kameror och frysta scen inom varje av/på-par:

| Vy | Draws av/på | Trianglar av/på | Texturer | Program |
| --- | --- | --- | --- | --- |
| Vägg | 173 / 173 | 515544 / 515544 | 68 / 68 | 70 / 70 |
| Tak, fast dagsljus | 157 / 157 | 736597 / 736597 | 68 / 68 | 70 / 70 |

Uniform av/på ändrar alltså inga batchar/pass. En separat materialklon utan patch på samma riktiga geometri ger fortsatt 157 draws / 736597 trianglar. Efter att paint-only-resurserna släppts räknas 67 texturer och 68 program; återställd målningspatch ger 68/70. Den verkliga tillkommande kostnaden i denna scen är därför **en textur och två programvarianter**, inte noll. Shadern har ett närvillkorat sampleslag, derivator och normal-/roughnessberäkning. Bastexturen är **65536 byte**, nominalt **87380 byte** inklusive hela mipkedjan; driver-/objektoverhead ingår inte. En CPU-kopia av de packade texlarna behålls. Inga per-frameuppladdningar, nya ljus eller renderpass i produkten.

Det diagnostiska takparet redovisas separat; jämför inte scenbudgeten mellan olika appstarter eller olika ljussättningar. Testljuset ger egna shaderkombinationer, vilka inte ingår i produktkostnaden ovan. Samma draw-/triangel-/programantal gäller inom det diagnostiska paret. Ingen global FPS-, fysisk telefon- eller hårdvarugaranti påstås. Wrappen saknade systemd-scope på denna värd; någon hård browserminnesgräns verifierades inte.

Root-dirigenten äger integration/publicering/Pages-kontroll och bildpublicering. Server/browser stoppas före överlämning; ingen push eller stängning från arbetaren.

## Publicering

Integrerad med oförändrade verifierade källblock som
`6f07b2592c115e1b53bb5b4f8cde8c03722eb1f3`.
[Test, bygge och Pages44767964640](https://github.com/solwation/kvarteret-lunden/actions/runs/44767964640)
passerade. [Slutkommentar med inbäddade och tydligt märkta produkt-/diagnostikbilder](https://github.com/solwation/kvarteret-lunden/issues/346#issuecomment-7044105279)
publicerades före stängning; alla sex SHA-pinnade bilder gav HTTP200.
Dirigenten granskade samlad diff och alla sex nativebilder utan rutinmässiga omkörningar.
Av-bilderna är borttagna från main efter publiceringen och finns kvar på pinnade historiklänkar.
