# Förbättringar från originalet

## Princip

`lunden-3d-apartment` är källan till gemensamma förbättringar. `kvarteret-lunden` behåller en ren historik och ett mindre innehåll. Originalets ändringar ska föras över löpande efter granskning, inte genom en blind merge eller en automatisk kopiering av hela projektet.

En GitHub-fork skulle inte heller uppdatera sig själv. Fördelen med denna struktur är att vi kan återanvända relevanta förbättringar utan att publicera originalets personliga historik här.

## Första importen

1. Välj och dokumentera ett exakt commit-SHA i originalet.
2. Importera endast granskad kod och resurser för området, byggnaderna, fast inredning och visningens styrning. Kontrollera även transienta beroenden och innehåll i fasta skåp.
3. Dokumentera ursprungliga filvägar och nödvändiga anpassningar. Behåll tillämpliga licenser och källhänvisningar.
4. Kontrollera i webbläsare att visningen fungerar utan originalets data, spelmoment och Cloudflare. Granska även publiceringspaketet.
5. Registrera importerad version och verifiering i denna fil.

Första granskade importen utgår från `c079371f6782225e29e9dac51518c509ed8c37e6` i originalet. Världsbyggaren, fast inredning, navigation, garage/trapphus och hjälpfunktioner har anpassats. `data/plan.json` är det geometriska underlaget. Inga personliga bild-, ljud- eller fontresurser har importerats.

`src/world.js` bygger arkitekturen; `src/interior.js` och `src/standardinterior.js` bygger enbart fast inredning. `src/navigation.js` är anpassad från originalets förflyttning. `src/config.js` är ett beskuret arkitektururval. `src/patio.js` innehåller enbart markmaterial. Garage och trapphus har separata `architectural-settings.js`, `architectural-edges.js` och `fixed-racks.js` för fasta byggdelar.

Nästa import ska granskas mot dessa anpassningar. Ersätt inte nedströmsfilerna med originalets fullständiga versioner.

## Löpande uppdateringar

```sh
git remote add upstream https://github.com/solwation/lunden-3d-apartment.git
# Behövs bara en gång per lokal klon.
git fetch upstream main
git log --oneline <senast-granskade-original-SHA>..upstream/main
git show <original-SHA> -- <relevanta-filer>
```

- Bedöm förbättringar av geometri, fasader, trappor, dörrar, fast inredning, rendering, prestanda, navigation och mobilstöd för överföring.
- För över enbart relevanta delar. Anpassa blandade commits; kopiera inte automatiskt `main.js`, `config.js`, `interior.js` eller hela resurskataloger.
- Ta aldrig med Cloudflare-konfiguration, Workers, WebSocket-tjänster, originalets delade data, personliga resurser eller spelinslag. Granska nya beroenden och nätverksanrop.
- Verifiera berörda funktioner i webbläsare och att originalets lokala lagring inte används eller ändras. Två GitHub Pages-projekt under samma värd delar origin.
- Ange originalets commit-SHA i importens commitmeddelande och uppdatera registret nedan. Skilj mellan senast granskad commit och faktiskt importerade ändringar.

Automatisk publicering till GitHub Pages är aktiverad vid varje push till detta repos `main`, efter godkända tester och bygge. Automatisk import från originalet är inte konfigurerad. Om uppdateringarna blir frekventa kan gemensam arkitektur och navigation brytas ut till en delad komponent, med en separat ändring och verifiering i båda projekten.

## Register

- Senast granskade originalversion: `1e6b988` (för #20; övriga områden enligt respektive avsnitt).
- Importerade ändringar: första rensade arkitekturimporten; se filkartan ovan. Verifiering beskrivs i README och docs/verification.md.


## Startåterhämtning, #1065

Importerad från `502404a25063b954349a858edf72a74eaa02d14e`: avgränsad hämtning av planritningen med högst två försök, 15 sekunder per försök och 250 ms mellanrum. Ett tillfälligt nätfel, timeout eller HTTP408/429/5xx får ett nytt försök utan att läsa ett cachat felsvar;404 och felaktig JSON avbryter direkt. `src/startup.js` innehåller endast den rena hämtningsfunktionen, med parametrar i `src/config.js`. Originalets felrapportering och sessionStorage-diagnostik har inte importerats.

Verifiering: `npm test`, bygg och hela Chromium-kontrollen för dator/mobil med en injicerad första plan503. Den verkliga scenen startar efter exakt två hämtningar, inga externa anrop sker och originalets sparade markörer är orörda.


## Fungerande klocktorn, #1067

Importerad från `ac413b321681ba7fcc2dfb24b2339cce5b64e693`: `towerclock.js`, de avgränsade ändringarna i `campusfacades.js`, `sitebackdrop.js` och `surroundings.js` samt enbart `TOWER_CLOCK`-parametrarna. Tidigare rensningar av omgivningarna är bevarade. Tornets plats, storlek och urtavlornas radie är oförändrade.

I originalet får alla fyra sidor samma simulerade tid som köksklockan. Här finns inga personliga klockor eller spelkontroller; tornet följer besökarens lokala klocka och uppdateras även före Börja. Inga nätverksanrop, molntjänster eller sparade klocktillstånd har tillkommit. Originalets mellanliggande kattändring är inte tillämplig på den opersonliga visningen.

Verifiering omfattar den riktiga visningens klocka vid start och vid ändrad lokal tid, samt dator-/mobilvyer, gång, dörrar, ursprunglig lagring och nätverkskontrollen. Originalets komponentprov i WebGL täcker alla fyra urtavlorna, båda detaljnivåerna och köksklockans tidskontroller.


## Golvbrunnar, #14

Importerad från `6ddb7ba` (original #1072): `floorDrain`, `showerDrainAt` och `laundryDrainAt` i `interior.js`, anropen i duscharna och framför tvättmaskinerna i `interior.js` och `standardinterior.js` samt enbart `FLOOR_DRAIN` i `config.js`. Alla mått är antaganden; golvet förblir plant i kollisionen. Originalets ändringslogg och dokumentation har inte importerats.

Verifiering: `npm test`, bygg och Chromium-bilder av duscharna i L1007 (Badrum, WC/dusch), Tvätt, L1004 och L1201 (båda planen). Ritanrop vid samma vyer ökade med 0–3.


## Radiatorer under fönstren, #15

Importerad från `5ced7a8` (original #1071): `addRadiator` och dess anrop i fönsterloopen i `src/world.js` samt enbart `RADIATOR` i `src/config.js`. Varje fönster får en vit kompakt panelradiator centrerad under fönsterbänken, med termostatventil och två rör ned i golvet, i L1007 och de besöksbara L1004/L1201. Peabs planförklaring anger radiator under fönster; alla mått är antaganden. Radiatorn utelämnas över skåp, över bjälklagsöppningar (L1201:s fönster över det öppna rummet) och där bröstningen är för låg. Den använder fönsterkarmarnas material, ger inga extra ritanrop och ingen kollision (den sticker ut 6,5 cm, inom besökarens väggavstånd).

Verifiering: `npm test`, `npm run build`, `tools/browser-check.mjs` samt skärmbilder i Chromium av L1007 (kök, vardagsrum, sovrum), L1004 och L1201 med oförändrat antal ritanrop per vy före/efter.


## Mjuka hörnskuggor på väggarna, #17

Importerad från `e80203f2` (original #1074): `buildWallAO` i `src/ao.js`, dess anrop i `buildLevel` (`src/world.js`) och enbart `AO.wall` i `src/config.js`. Väggarna får ett multiplicerande överlägg per plan med mjuka band mot golv och tak och i innerhörn; glas, dörröppningar och speglar mörkas inte och trapphålet får inget golvband. Inga nya beroenden, resurser eller nätverksanrop.

Verifiering: `npm test`, bygg och den riktiga visningen i Chrome (vardagsrum, hall, sovrum 1 med och utan överlägget), utan webbläsarfel.


## Fönster i smygar, #18

Importerad från `703e1b5` (original #1076): `reveal`, `mass` och `recessed` i `src/exterior.js`, karmplanet `HUS_L_REVEAL.frame` i `src/world.js` (samma 0,1 m som förut) och enbart `HUS_L_REVEAL` i `src/config.js`. Alla fönster i Hus L på gatu- och gårdssidan sitter indragna i smygar av fasadens eget skikt (tegel eller puts), med ett plåtbleck under. Grannarnas förenklade volymer lämnar smygfickorna öppna, och L1007, L1004 och L1201 får smygar in till sina egna karmar. Dörrar och gavelfönster är oförändrade. Alla mått är antaganden. Originalets ändringslogg har inte importerats.

Verifiering: `npm test`, bygg, `tools/browser-check.mjs` och skärmbilder i Chrome av gatan, gården, våning 3 och terrassen före och efter. Ritanropen är oförändrade, med cirka 6 300 fler trianglar.


## Utebelysning med eluttag, #19

Importerad från `d29a218` och `ce72fb1` (original #1078): `patioLamps` och dess anrop i `src/exterior.js`, `loggiaLamp` med lamp-meshar och uppdatering i `src/surroundings.js` (plus `door`-öppningens extra fält i `loggiaOpenings`) samt enbart `HUS_L.patioLamp` i `src/config.js`. Peabs byggbeskrivning anger utvändig belysningsarmatur med integrerat eluttag vid uteplats, balkong eller terrass; modell, höjd, sida och mått är antaganden. Lampor finns vid Hus L:s 8 altandörrar och 9 takterrassdörrar (enbart geometri i entrélampornas befintliga meshar) och vid hus A/B/C:s 52 loggiadörrar (tre meshar, inga ljus). Visningen är alltid dagsljus, så lamporna syns släckta; nattvägen är densamma som för entrélamporna. Originalets ändringslogg, test och strömavbrott har inte importerats.

Verifiering: `npm test`, `npm run build` och Chromium-bilder av Hus L:s altan och takterrass samt Hus A:s loggior i dagsljus och med påtvingad natt (31 väggsken i entrélampornas mesh = 8 + 6 + 17, 52 loggialampor, inga sidfel).


## Lampsken utanför glaset, #25

Importerad från `195cf9b` (original #1092): `washGeometry` i `src/groundglow.js` tar `holes` och skär bort väggens öppningar, och `src/exterior.js` skickar fasadens öppningar för entrélampornas och altan-/terrasslampornas väggsken samt sparar hörn per lampa i `userData.parts`. Skenet ligger därmed på teglet runt fönster och dörrar i stället för på glaset. Inga nya meshar, material eller ljus. Loggialamporna i hus A/B/C ändras inte (glaset står framför skenet). Originalets ändringslogg och test har inte importerats.

Verifiering: `npm test`, `npm run build` och Chromium-bilder av en granne på Hus L:s gårdssida och gatusida med påtvingad natt före/efter (skenet syntes före över altandörrens överruta och fönstrets vänstra ruta, efter ingen glöd på glaset); dagsljuset oförändrat (skenet släckt).


## Markskuggor under träd och vid husfötter, #20

Importerad från `65dc724` och `1e6b988` (original #1079): `src/groundao.js`, insamlingen av trädkronor och väggslingor i `src/surroundings.js` (`aoTrees`, `siteGroundAO`), Hus L-rektangeln från `src/world.js` och enbart `GROUND_AO` i `src/config.js`. Ett multiplicerande mesh ger mjuka skivor under 344 trädkronor och tunna band vid fasadfötterna på 89 väggslingor (A/B/C, Hus L, gamla S:t Lars-husen och bakgrundshusen). Originalet tonar bort skuggorna där solens skuggkarta täcker; här finns ingen skuggkastande sol, så `bindGroundAOShadow` anropas inte och skuggorna visas överallt. Alla värden är antaganden.

Verifiering: `npm test`, `npm run build` och Chromium-bilder (GPU) av området uppifrån, gatan och parken före/efter. +1 ritanrop per vy, ca 24 000 trianglar, inga sidfel eller externa anrop.


## Tydligare sol- och skuggsida, #16

Anpassad från `e77fe5e2` (original #1073). Originalet blandar i sin dygnscykel ett jämnt mulet ljus mot ett klart (mindre himmel/ambient/fyllnad, sol 3,0, exponering 1,5) och förlitar sig på en skuggande sol. Den här visningen har varken dygnscykel eller skuggkarta, så originalets värden och `DayCycle` har inte importerats. Enligt användarens beslut balanseras i stället de fasta ljusen om, utan skuggkarta: `LIGHTING.sky` i `src/config.js` (läses i `src/main.js`) har halverat flat ambient och lägre fyllnad, samt en starkare sol, skalade så att rummen behåller ungefär samma ljushet. Exponeringen är oförändrad, så sken och glödande material påverkas inte. Ljusens färger och riktningar är oförändrade.

Verifiering: `npm test`, `npm run build`, `tools/browser-check.mjs` och medelluminans (Y′, 0–255) i Chrome på riktig GPU i samma vyer före/efter: gata 139,0 → 140,5, innergård 112,9 → 117,8, L1007 vardagsrum 212,4 → 207,7 (−2,2 %), kök 192,6 → 194,8 och 199,7 → 202,1, L1004 223,3 → 218,3, L1201 232,6 → 229,2. Tegel på solsidan (gården, söder) mot skuggsidan (gatan, norr) gick från 1,07 till 1,29. En solvänd innervägg i vardagsrummet blev 1 % ljusare (237,0 → 239,6), så solen lyser inte märkbart igenom väggarna.


## Mobilspakens storlek och riktning, #21

Avgränsad överföring från `e3d2873` (originalets #1087): spaken skalar med skärmens kortsida (`clamp(96px, 30vmin, 168px)` i `style.css`), knoppens rörelse följer den renderade storleken (32 % av bredden, som tidigare 36 px vid 112 px) och kanten lyser svagt i visningens gröna färg åt det håll man drar. Originalets glasutseende, vilo-hint (spaken är redan alltid synlig här), knappkluster och sprintläge är inte tillämpliga och har inte förts över.

Verifiering: `npm test`, `npm run build`, `tools/browser-check.mjs` (mobil 390×844: spaken 117 px, framåt och avbrott) samt skärmdumpar med beröring i 844×390 (117 px) och 1180×820 (168 px).


## Gårdsträdens kronor utanför fasaderna, #22

Överförd från `8f251e7` (originalets #1083): `fitCrown` i `src/surroundings.js` smalnar av en trädkrona vars lövkort annars skulle nå närmare än `FOLIAGE.wallClearance` (0,2 m, *guess*) ett hus fotavtryck i `SITE.blocks` på samma höjd. Stammarnas placering och kronornas höjd är oförändrade. Originalets dokumentation, ändringslogg och testkörningar har inte förts över.

Verifiering: `npm test`, `npm run build` och Chrome på riktig GPU: lövkort inne i Hus A/B/C:s fotavtryck 10 kronor (upp till 1,56 m) → 0, inga sidfel; före/efter-bilder inifrån Hus B:s fönster mot de två träden.


## Mobilspakens dödzon och responskurva, #23

Avgränsad överföring från `211e0e9` (originalets #1088): `steer()` i `src/main.js` ger ingen rörelse inom 10 % av knoppens väg (en vilande tumme driver inte), därefter `t^1,5` upp till 90 % och full fart därifrån; riktningen behålls och kantens glöd följer utfallet. Värdena ligger i `TOUCH.stick` i `src/config.js` (*guess*). Originalets följ-läge förutsätter en flytande spak och är inte tillämpligt på den fasta spaken här; spaksprint finns inte i visningen, och originalets utjämnade titta-dragning ingick inte i denna överföring.

Verifiering: `npm test`, `npm run build` och `tools/browser-check.mjs` med ny kontroll i mobil 390×844 (2 px från mitten → 0, halv väg → 0,35, förbi kanten → 1).


## Hörnskuggor ovanför dörrar och fönster, #24

Överförd från `da02d90` (originalets #1084/#1085), uppföljning av #17: `buildWallAO` i `src/ao.js` vänder nu varje fyrhörning mot rummet oavsett väggstyckets polygonriktning. Tidigare ritades överstyckena över dörrar och fönster (rektanglar med motsatt riktning) och större delen av L1201:s väggar baksidesvända och syntes inte. Takets kontaktskugga (`buildAO` i `src/world.js`) räknar även dörröverstycken och fönster som väggar, så bandet bryts inte över öppningar. Originalets test och ändringslogg har inte förts över.

Verifiering: `npm test`, `npm run build` och Chrome på riktig GPU: alla väggskuggans trianglar i L1007, L1004 och L1201 vetter mot rummet (före 24/43/24/27/220/278 vända in i väggen, efter 0), före/efter-bilder av hallens dörr i L1007, entrédörren och L1004; ritanropen oförändrade (552/157/381), inga sidfel.


## Stuprör på Hus L, #26

Importerad från `ecd94dd` + `d3cd84b` (original #1077): `downpipes()` och dess anrop efter `patioLamps` i `src/exterior.js` samt enbart `HUS_L_DOWNPIPES` i `src/config.js`. Fyra rör på gatusidan under loftgångens fascia och tre på gårdssidan (terrassernas krön och L1205-loftet vid portiken), med klämmor, regnvattenhuvud och utkastare vid mark; alla mått och lägen är *guess* efter Peabs gårdsillustration. Originalets frihållning kring entréplanteringarna utgår eftersom planteringarna inte finns här.

Verifiering: `npm test`, `npm run build`, `tools/browser-check.mjs` utan fel eller externa anrop samt skärmbilder i Chromium från gatan och gården före/efter med oförändrat antal ritanrop (536/689/448).



## Ventilationsdon i taken, #27

Importerad från `23d5242` (original #1080): `ceilingVents`, `tint`, `ourCeilingThings` och anropen i `buildVisitFlat`/`buildWorld` (`src/world.js`) samt enbart `VENTS` i `src/config.js`. Vita runda FTX-don: tilluft i sovrum, allrum och vardagsrum, frånluft i badrum, WC/dusch, tvätt och kök, i L1007, L1004 och L1201. De placeras från rummets mitt bort från väggar (takets AO-band), skåp/köksfläkt, våtrummens spotlights och tvättens taklampa, trapphålet och sofittkanter. Originalets pendlar och brandvarnare finns inte här och är borttagna ur undvikandelistan. Ett vertexfärgat mesh per plan, ingen skugga, kollision eller klickyta. Alla mått och lägen är antaganden; originalets ändringslogg har inte importerats.

Verifiering: `npm test`, `npm run build`, `tools/browser-check.mjs` och Chromium-bilder före/efter av L1007 (vardagsrum, sovrum, badrum, kök), L1004 och L1201 utan z-fighting; ritanrop +2 per vy (ett per plan i bild).
