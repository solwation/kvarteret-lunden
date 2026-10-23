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

## Lägsta prioritet för portningar, #109

Granskad källa: original `9a2dac315d328ca47dedbebe521bf5415ce0ffa4`
([originalärende #1422](https://github.com/solwation/lunden-3d-apartment/issues/1422)).
Enbart användarens arbetsflödesregel i `CLAUDE.md` och `.claude/commands/orkester.md`
har anpassats. Överföringar hit, även buggfixar och deras implementations-, test- och
stödärenden, ska alltid ha `priority: low` om användaren inte uttryckligen anger annat.
Originalets prioritet höjer inte portningen. Regeln tillämpas vid skapande och köval,
med bevarat ägarskap, beroenden och föräldratak. Självständigt publicarbete som inte
är en portning behåller vanlig prioritering. Befintliga öppna portningar har granskats
och sänkts; ingen appkod, resurs, lagring, spelmekanik eller tjänst har importerats.
Verifiering: granskad dokumentdiff, `git diff --check`, `npm test` och `npm run build`.

## Sammanhängande asfalt vid hållplatsen, #110

Importerad från `1c03dca9a42567a8cbcb1f749535e789175fb7fb` (original #1417): `busStopApron` i `src/busstopgeo.js`, dess selektiva koppling i `src/southbackdrop.js` och tre tester i `tools/busstopgeotest.mjs`. Gräsbandet mellan hållplatsens kerb och de tre bussvägarna (`95035967`, `189432572`, `36918923`) fylls med asfalt; utbredningen mellan kartlagda element är ett visuellt antagande. Plattform, kerb och kollision är oförändrade. Originalets paddock-, spel- och dokumentändringar har inte importerats.

Verifiering: `npm test`, `npm run build`, `tools/browser-check.mjs` och Chromium-bilder (dator och mobil) mot hållplatsen.

## Register

- Senast granskade originalversion: `397ce2652aca30e7a2787dbb48a3b227741ae98e` (enbart hållplatsens plattform/taktila ytpartition #113); tidigare `a0c66ef68ee78dcae68f5c3dd0aeb1a5d7bd59bc` + `9eb4ccfadfdf0ffd26ae7a20dfc1e3e50c22d1b8` (enbart bank/GC-anslutning och generisk triangelkrok #99); tidigare `1c03dca9a42567a8cbcb1f749535e789175fb7fb` (enbart hållplatsasfalt #110); tidigare `9a2dac315d328ca47dedbebe521bf5415ce0ffa4` (enbart prioriteringsregeln #109); tidigare `03d4c5201004540769c51cf62b7272f0a2c3caaf` + `662f1030389006d785a633352f5856f06e11fd21` (enbart GLO/markstöd #105); tidigare `15f9b00569e194bfcc4382fa66955b974dbcc134` (enbart neutral vägbelysning#96); tidigare `90d1632c17fa66ceb0e29e99c65c145fac2fa0aa` (enbart neutral täckgeometri/säsong#103); tidigare `bcd8c24655cf87244df9b8d405db678c8e94b6c2` (enbart placering av vindskydd/vattenho#102); tidigare `e6f5ce4e20b319e864e42be487820ffb09319171` (enbart parkbelysning#95); tidigare `ba5db2f9ad167ee69c68a5be85b209e5c6c5a648` (enbart de rena prestandadelarna för#94); tidigare `24e72f89` + `8cd6788` (för #92); tidigare `f2330dde`, `53c46cd8`, `350c5196`, `0a934ac2` (för #81); tidigare `937ac17e` (för #80); tidigare `d884dbb9` + `b61bf377` (för #79); tidigare `90a1f669` + `2fa7e79c` (för #76); tidigare `778e174b` (för #69); tidigare `bfa0bc75` (för #68); tidigare `fd6c9f74` + `f76c7cc9` (för #67); tidigare `af78fcf2` (för #64); tidigare `dd9927ef` (för #65); tidigare `49e897d` (för #60); tidigare `e749b076` (för #59); tidigare `df3ad2c` (för #58); tidigare `1e6b988` (för #20; mobilstyrningen `82fde3f` för #31; övriga områden enligt respektive avsnitt).
- Importerade ändringar: första rensade arkitekturimporten; se filkartan ovan. Verifiering beskrivs i README och docs/verification.md.


## Skolmuren och växthuset är solida från marken, #146

Importerad från `bfc4ed380078c411b7a78eaabe9a8be1e6bf0c39` (original #1542): `farSegments()` i `src/farwalk.js` får skolmurens (`SITE.school.wall`, x −26…30, z −32,15, tjocklek 0,3 m) och växthusets (`SITE.school.greenhouse`) rektanglar, eftersom `surroundings.js` ritar dem utanför `WALK`-väggen och bara takpromenaden kände dem. Ingen ny geometri eller renderkostnad. `tools/farwalk-check.mjs` ersätter originalets `farwalktest`: vägen till Klockhuset går nu runt murens östra ände (x 31) och två nya kontroller visar att muren stoppar mitt på sträckan och vid östra änden. Ändringslogg ingår inte (projektet har ingen).

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

Avgränsad överföring från `211e0e9` (originalets #1088): `steer()` i `src/main.js` ger ingen rörelse inom 10 % av knoppens väg (en vilande tumme driver inte), därefter `t^1,5` upp till 90 % och full fart därifrån; riktningen behålls och kantens glöd följer utfallet. Värdena ligger i `TOUCH.stick` i `src/config.js` (*guess*). Originalets följ-läge förutsätter en flytande spak och är inte tillämpligt på den fasta spaken här; spaksprint finns inte i visningen. Originalets utjämnade titta-dragning fördes över separat i #28 (nedan).

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


## Handlingsknapparna vid högra tummen, #29

Överförd från `38d2196` (original #1089): enbart tumbågens placering, anpassad till publicsidans två knappar i `style.css` för `body.touch`. `#action` (Öppna/Stäng) är ett högerförankrat piller i nedre högra hörnet under den vilande tummen, 16 px (12 px vid låg höjd) från kanten och säkra området. `#measure` (Mät avstånd) sitter på bågen rakt ovanför pillrets rundade högra ände och mätstatusen ovanför den, med minst 8 px mellanrum. Hjälpknappen och platsmenyn ligger kvar uppe; datorvyn är oförändrad. Originalets hopp-, huk-, stå-, jetpack-, spindelnäts- och övriga spelknappar, valrutor och `touchlayouttest` är inte tillämpliga och har inte förts över.

Verifiering: `npm test`, `npm run build`, `tools/browser-check.mjs` (som nu kontrollerar hörnbandet, bågläget och ≥8 px avstånd mellan pillret, mätknappen, mätstatusen, styrspaken, hjälpknappen och platsmenyn på 390×844 och 844×390 med touch) och `tools/click-browser-check.mjs` i Chromium samt granskade skärmbilder i stående och liggande läge och oförändrad datorvy.


## Utjämnad titta-dragning på mobil, #28

Avgränsad överföring från `211e0e9` (originalets #1088), delen ”eased drag-to-look”: titta-dragningen (`$('viewer')` pointermove i `src/main.js`) samlas i stället för att vrida vyn direkt i eventet, och `easeLook` matar in den mjukt i `frame()` med tidskonstanten `TOUCH.look.smooth` (30 ms som i originalet, *guess*). Känsligheten ligger i `TOUCH.look.sens` (`src/config.js`), samma 1,3 som tidigare fasta värde, så den totala vridningen för en dragning är oförändrad. Väntande rörelse nollställs när visningen inte är aktiv eller hjälpen är öppen. Mus och pointer lock på dator är oförändrade. Originalets spaksprint och flytande spak/följ-läge är inte tillämpliga på den fasta spaken här; ändringslogg och test har inte förts över.

Verifiering: `npm test`, `npm run build` och `tools/browser-check.mjs` med ny kontroll i mobil 390×844 via CDP-touch (120 × 30 px dragning: ingen vridning i eventet, första bildrutan ≈ 43 %, totalt exakt −0,4056/−0,1014 rad som förut), samt en körning med animationsloopen igång i 844×390 (150 px → 0,507 rad, som förut) och dator där musens vridning fortfarande sker direkt (100 px → −0,26 rad).


## Egna touchknappar, #30

Anpassad från `1af9b39` (original #1090/#1082): `src/touchlayout.js` (normalisering, lagring, mätning mot säkra området och redigeraren), redigerarens stil i `style.css` och enbart gränserna som `TOUCH_LAYOUT` i `src/config.js`. Bara publicsidans tre reglage ingår: styrspaken `#joystick`, `#action` och `#measure`; mätstatusen följer Mät avstånds förflyttning. Ingången är knappen Anpassa touchknappar i hjälpdialogen, som bara visas på pekskärmar. Standardlayouten är tumbågen från #29 och skriver inga inlinestilar. Layouten sparas per enhet under den egna nyckeln `kvarteret-lunden.touch-layout` (originalets `lunden.touchLayout` läses aldrig) och gäller under besöket om lagringen är blockerad. Den fasta spaken skalas med `scale`; `steer` i `src/main.js` flyttar knoppen i spakens egna enheter så att den följer kanten. En pågående redigering räknas som upptagen för automatisk uppdatering. Originalets spelknappar, flytande spak, pausmeny och `touchcustomtest.cjs` har inte förts över; `tools/verify.mjs` tillåter `localStorage` enbart i `touchlayout.js` med den nyckeln.

Verifiering: `npm test`, `npm run build`, `tools/browser-check.mjs`, `tools/click-browser-check.mjs` och nya `tools/touchcustom-check.mjs` i Chromium med CDP-touch på 390×844/844×390: flytt, storlek med reglage och nyp, opacitet, spegling, Spara, ✕ Avbryt, Esc, Återställ standard, kvar efter omladdning, omplacering vid rotation inom säkra området, skalad spak som går, blockerad lagring, ingen ingång på dator och orörd originalnyckel. Skärmbilder granskade.


## Gå och svänga samtidigt, och originalets spak, #31

Anpassad från originalets `src/touch.js` och `src/hudicons.css` vid `82fde3f` (spakens utseende från #1087, `e3d2873`; flerfingerstyrningen med separata `stickId`/`lookId`). Tittdragningen på `#viewer` i `src/main.js` avvisade alla icke-primära pekare, så ett tittfinger som landade medan tummen redan höll spaken ignorerades. Nu följs ett beröringsfinger per id även som andra pekare (mus och penna håller sig till den primära), mätningens tryck följs per id, och avbrott nollställer bara sin egen pekare. Spaken tas inte över av ett andra finger och nollställs bara när dess eget finger släpper.

Spaken har originalets lugna glasfamilj i `style.css`: mörk genomskinlig bas med vit kant, fyra diskreta pilar, ljus knopp med inre ring och vit kantglöd åt det håll man drar (tidigare grön). Storleken är originalets 2 × väg + 12 px med vägen `clamp(48px, 15vmin, 84px)` och knoppen 0,9 × vägen; `steer` låter knoppen nå kanten som i originalet. Spaken ligger fast i nedre vänstra hörnet, 20 px från kanten och säkra området, där originalets vilande spak visas. Originalets flytande spak/följ-läge, sprint, vilo-hint och spelknappar är inte tillämpliga och har inte förts över. Egen layout (#30), tumbågen (#29) och den utjämnade tittdragningen (#28) är oförändrade.

Verifiering: `npm test`, `npm run build`, `tools/browser-check.mjs` (ny tvåfingerkontroll i båda ordningarna), `tools/click-browser-check.mjs`, `tools/touchcustom-check.mjs`, `tools/places-browser-check.mjs`, `tools/place-picker-check.mjs` och `tools/icons-browser-check.mjs` i Chromium, samt skärmbilder av båda apparnas spak i vila och framåtdragen vid 844×390 med touch.



## Trapphålets bjälklag ut till väggarna, #33 (och dubbletten #34)

Överförd från `8f1562f86e91dfa543405361bd05a160fd0d34b8` (original #1119), enbart `src/world.js`. Övre planets trappkontur `STAIR.hole` ligger ~6 cm innanför trapphålets väggytor, så bjälklaget, övre planets golvplatta och nedre planets takplatta lämnade en kant runt hålet i bjälklagsnivå. `slabOpening(hole, floors)` vidgar öppningen till väggytan på varje sida där en vägg täcker hela kanten på båda planen (för L1007: x1 5,49 → 5,551, z0 5,77 → 5,704, z1 7,54 → 7,604; x0 oförändrat). Bara bjälklaget i `buildStructure`, golv-/takplattorna i `buildLevel` och deras AO använder den; trappa, räcke, kollisioner och lamputplacering behåller `STAIR.hole`. Den generiska `buildStructure` för besöksbara L1004 (samma ritning) får samma öppning; L1201 har eget hål som redan möter väggarna och är oförändrat. Inga mått i lägenheterna ändras. Originalets changelog-post har inte förts över.

Verifiering: `npm test`, `npm run build`, `tools/browser-check.mjs` och skärmbilder före/efter i Chromium av trapphålet i L1007 (uppifrån och nedifrån) samt i L1004 och L1201, med oförändrat antal ljus och skuggkastare.

## Ingen golvlist över trapphålet, #36

Överförd från `744d16ab5aa63bc76a268efec51c69c21221695f` (original #1135), enbart `src/interior.js`, `src/standardinterior.js` och `src/world.js`; originalets changelog-post har inte förts över. `skirting()` lade den 7 cm höga golvlisten längs varje väggyta med fritt golv framför, men planen känner inte till trapphålet. Väggarna som fortsätter ner i trapphuset fick därför en svävande list i övre planets golvnivå, som fångade solen och bröt ljuset på väggen vid bjälklaget. `skirting` tar nu nivåns golvöppning (`opening` i `buildLevel`, för övre planet: `slabOpening` från #33 för L1007/L1004 och L1201:s eget hål) och kapar varje lista exakt vid den; `buildInterior`/`buildStandardInterior` får öppningen som sista parameter. Golvlisten utanför öppningen är oförändrad. Kontrollerat: L1007 (öst-, nord- och sydväggen), L1004 (samma ritning) och L1201 (gaveln, norrväggen och den indragna väggen); hus A/B/C/L:s trapphuskärnor har ingen golvlist. Konturlinjerna i bjälklagsnivå (original #1164) ingår inte.

Verifiering: `npm test`, `npm run build`, `tools/browser-check.mjs` mot `dist/`, och skärmbilder före/efter i Chrome (`--use-angle=gl`) av trapphålets väggar vid bjälklaget uppifrån och nerifrån i L1007, L1004 och L1201.

## Flytande spak under vänster tumme, #32

Anpassad från originalets `src/touch.js` och `src/touchlayout.js` vid `1af9b39` (egen layout utan spakposition, original #1090) och `211e0e9` (följ-läget `TOUCH.stick.follow`, original #1088), jämförd mot aktuell `origin/main`. En pekning på spaksidan av vyn (vänstra 45 %, `TOUCH.stick.zone`, eller högra vid spegling) under hjälpknappen och platsmenyn placerar `#joystick`:s bas under tummen (`grabStick` i `src/main.js`, klassen `floating` i `style.css`), begränsad till säkra området. Med `follow` glider basen efter en tumme som dras förbi kanten. När tummen lyfts återgår spaken till sin vilande plats i hörnet, som visar var man ska trycka. Tittfingret, tumbågens knappar och tvåfingerstyrningen från #31 är oförändrade; under mätning mäter ett kort tryck på spaksidan fortfarande. I egen layout (`src/touchlayout.js`) har spaken bara storlek, opacitet och spegling; en sparad spakposition från före #32 ignoreras. Originalets sprint, spelknappar och övriga spelinslag ingår inte.

Verifiering: `npm test`, `npm run build`, `tools/browser-check.mjs` (nya kontroller via CDP-touch i 390×844 och 844×390: basen under tummen på tre ställen inklusive hörnet där den begränsas, gång framåt/höger/bakåt, återgång vid lyft, följ-läget och att högersidan tittar utan spak; dödzon, responskurva och tvåfingerkontrollerna går nu från en flytande bas), `tools/touchcustom-check.mjs` (spaken flyttas inte i redigeraren, speglad skalad spak flyter på högersidan, gammal sparad spakposition ignoreras) och `tools/click-browser-check.mjs` i Chromium, samt skärmbilder bredvid originalet i 844×390.


## Möblerade grannuteplatser, #35

Importerad från `2190e170962e15b9019fbca8c2926d76fa1ef190` (original #1120, som bygger på #888/#605): `src/patiodecor.js` (stilarna, den seedade utdelningen, speglingen, förskjutningen och grinden), `PATIO_DECOR` i `src/config.js` och anropet i slutet av `buildExterior` (`src/exterior.js`). De generiska modellerna (`Parts`, `DECOR_BUILD`, `rng`, `fitCrown`, `CROWNS`) kommer från originalets `src/terracedecor.js` och de enkla palm-, banan- och agaveformerna från `planter` i dess `src/patio.js`; här samlade i `src/outdoordecor.js` utan takterrassernas byggare, ljusslingor, lyktor och räckeslådor. Växtvinden (`plantwind.js`) är inte importerad: visningen saknar väder och öppningsbara fönster som driver den, så bladen står stilla. Bladens nyansvariation `hue` ligger i `PATIO_DECOR` i stället för originalets `TERRACE_DECOR`.

Grannarna L1001–L1006 och L1008 får var sin stil (bistro, matgrupp, lounge, solstolar, grill, odling, grönska) med seedade färger. Allt är generiska vertexfärgade modeller i två sammanslagna meshar, utan kollision eller klickmål; grinden döljer dem från gatan bakom Hus L och längre bort än 140 m. L1007:s uteplats lämnas tom, liksom den omöblerade lägenheten; originalets egna möbler (Åborg, Verona, Randers, dynbox) eller personliga föremål har inte förts över. Alla placeringar och färger är antaganden. Originalets ändringslogg har inte importerats.

Verifiering: `npm test`, `npm run build`, `tools/browser-check.mjs` mot källkod och `dist/` utan fel eller externa anrop samt nya `tools/patio-decor-check.mjs` (anpassad från originalets `tools/patiodecortest.html`): sju möblerade uteplatser med sju olika stilar, deterministiska layouter, fri dörr, passage och häck, kronor innanför skärmväggarna, stolar mot bordet, 2 meshar och cirka 17 300 trianglar, grinden från gatan, gården, ovanifrån och långt bort. Skärmbilder i Chromium ovanifrån och från gården framför varje uteplats granskade; +2 ritanrop där uteplatserna syns.


## Steg och Försök igen vid startfel, #37

Avgränsad överföring från `87abb571` (original #1132), med stegnamnen från `d9d9abb` (#1130); stoppvarningen `397d1cd` (#1131) har inte förts över. Ett beroendefritt inline-skydd i `index.html` laddar `src/main.js` med `import()` och exponerar `window.kvarteretStartup` (steg, `finish`, `fail`). `main.js` namnger stegen ”Startar 3D-grafiken” (före `WebGLRenderer`), ”Hämtar planritningen”, ”Bygger huset” och ”Bygger trapphus och garage”; före det gäller ”Hämtar programfilerna”. Orsaksklasserna `import`, `network`, `webgl` och `scene` och felmeddelandena följer originalets `causeOf`. Kortet visar ”Fel i steget ”…”: …” ovanför startknappen, som blir Försök igen (`location.reload()`). CSP:n tillåter skyddet via dess hash; `tools/build.mjs` räknar om hashen för den byggda sökvägen och `npm test` kontrollerar att varje inline-skript finns i CSP:n. Originalets kraschlogg, `sessionStorage`-post, laddningsruta med stegrad, 120-sekundersgräns och Cloudflare har inte förts över.

Verifiering: `npm test`, `npm run build`, `tools/startup-error-check.mjs` mot `dist/` och källkoden (dator och 390×844) samt `tools/browser-check.mjs`.

## Grafiken tillbaka efter krasch på mobil, #38

Anpassad från `903818ff5d3dcb3c95954e0beceeaccc69a0ba67` (original #1128) och originalets tidigare `reloadOnContextRestore` i `src/lowmemory.js`/`src/main.js` (#628), granskat vid `903818f`. På telefon (`lowMemory`) släpps ytornas normaler/uv och de engångsritade canvastexturerna efter uppladdningen, så en återställd WebGL-kontext skulle ladda upp tomma buffertar: väggarna blir svarta eller genomskinliga kanter och skyltarna tomma. `reloadOnContextRestore` i `src/lowmemory.js` laddar därför om sidan efter `webglcontextrestored`; `saveResume` i `src/updates.js` sparar plats och vy i den befintliga engångsåtertagningen (`kvarteret-lunden.update-resume`). Spärren `claimContextReload` (`kvarteret-lunden.gl-reload-at`, 60 s) hindrar loopar; när den spärrar visas rutan `#gl-lost` (”Grafiken tappades efter en krasch.” med **Ladda om**) i appens mörkgröna notisstil. Datorn påverkas inte. Originalets felrapportering, sessionsdiagnostik, spelvärld och ändringslogg har inte importerats; geometrikopiorna frigörs som förut.

Verifiering: `npm test` (lagringskontrollen godtar enbart de två egna nycklarna), `npm run build`, `tools/browser-check.mjs`, `tools/update-check.mjs` och en Chromium-körning mot `dist/` med telefonprofil (390×844, touch, iPhone-UA): `WEBGL_lose_context` lose + restore i L1007 → automatisk omladdning till samma plats och blickriktning med normalt ritade väggar; en andra förlust inom 60 s → ingen omladdning, trasig scen bakom rutan, tryck på Ladda om → normal scen på samma plats. Inga sidfel eller externa anrop.

## Laddningssteg, livstecken, stoppmeddelande och uppdelat bygge, #39

Överförd från original #1123 (delar #1130–#1133), utöver det som redan kom med #37 (felkortet från `87abb5719c5c2462c85075e05b0d053e3e8b7652`):

- `d9d9abbdc5cf2453fafb73891fbb9ee73e477fbe` (#1130): inline-skyddet i `index.html` (`window.kvarteretStartup`) får stegloggen `steps`, `last`/`beat` (performance.now), `fraction` och `progress()`. Välkomstkortet visar under `#load-status` stegraden `#load-step` (puls, stegnamn, sekunder) och förloppsstapeln `#load-progress`; pulsen och sekunderna drivs av `requestAnimationFrame` och fryser när huvudtråden hänger sig. Ny `src/loadingstep.js` (`loadingStep`, `loadingYield`) med `STARTUP.stepYield` (50 ms, *guess*). De mellanliggande `#load-status`-texterna ersätts av stegraden.
- `397d1cdee37b679b1a7607aa5a30c58bc2558cf4` (#1131): när ett steg varat `stallMs` (40 s, `STARTUP.stallSeconds`, *guess*) visas ”Det här tar ovanligt lång tid.” med en egen Försök igen (`location.reload()`) medan laddningen fortsätter; tid i dold flik räknas inte. Felkortet och en klar start döljer stegraden och meddelandet. Originalets 120-sekundersgräns finns inte här.
- `673b78d00d0505f5e8fa434070b86b5f101aeafb` / `21048b6ef81fbdadb633b918ec32d1f9a9a610ce` (#1133): `buildWorldSliced` (generatorn `worldParts` i `src/world.js`), `surroundingsParts`, `southBackdropParts` och `leafAtlasParts` (CPU-ritad canvas med `willReadFrequently`) yieldar mellan delarna; startup målar en bildruta däremellan. `buildWorld`/`buildSurroundings`/`buildSouthBackdrop`/`leafAtlas` finns kvar som synkrona omslag. I headless Chromium (SwiftShader) sjönk det längsta blocket under ”Bygger huset” från ~9,2 s till ~2,5 s. Originalets `longtasks`-mätning, kraschlogg och molnrapportering har inte förts över.

CSP-hashen för det ändrade inline-skriptet är uppdaterad i `index.html` (bygget räknar om den).

Verifiering: `npm test`, `npm run build`, `tools/startup-error-check.mjs` (utökad: stegordning, rörlig stapel inne i husbygget, livstecken som rör sig och fryser under en verklig 3 s blockering, stoppmeddelandet med fungerande Försök igen) mot källkoden och `dist/` på dator och 390×844, samt `tools/browser-check.mjs`. Skärmbilder granskade.

## Buckliga häckar med mörkare fot, #41

Granskad överföring från `71473503e88bd0183abb306032637d76976ab150`
(originalets #1143). `src/hedgeform.js`, `src/patiohedge.js` och
`src/boxwood.js` är exakt dessa källfiler. I `src/config.js` har bara `HEDGE`
och häckarnas `cell`/`dent` samt entrébyggarens `footScale` förts över.
Brus ger små bucklor, en smalare/mörkare fot och tonvariation. En shader visar
stamskymtar i lövatlasens mörka luckor, bara när kartan används. Mått, brus och
färger är visuella antaganden; höjd och kollisionsrektanglar är oförändrade.
Inga nya resurser, beroenden, ljus, nätanrop, lagringsnycklar eller tjänster.

Den faktiska offentliga scenens åtta uteplatshäckar i Hus L, inklusive L1004
och L1007, förblir en sammanslagen mesh: 2 400 → 12 448 trianglar utan fler
ritanrop. Hus A/B/C:s prydnadsbuskar använder andra byggare och ändras inte;
L1201 har takterrass utan denna häck. Entréhäckens `boxwood`-byggare finns
sedan tidigare men anropas inte av den mindre offentliga scenen. Originalets
StreetLife har därför inte importerats. Visningen är också fast dagsljus och
saknar automatiska årstider/väder; inga sådana funktioner läggs till här.

`CHROME_PATH=… node tools/hedge-check.mjs BASE OUT` bygger den riktiga
källappens World och tar nära/långväga uteplatsbilder. Befintlig `applySeason`
anropas diagnostiskt för sommar, vinter/snö och återgång (ingen ny väderkontroll
för besökaren). Den faktiska `boxwood`-byggaren kontrolleras separat i en liten
scen: öppning, fotavtryck, ändliga koordinater och en sommarbatch/två vinterbatcher
med befintligt snötäcke. Entrébilderna är komponentbevis, inte en entréhäck i
den publicerade områdesvisningen. Ursprunglig lagring och endast samma origin
kontrolleras. Det faktiska paketerade `dist/` laddas dessutom och kontrolleras
nära/på avstånd. Slutkörningen klarade 24/24, utan browser-/shaderfel eller
externa anrop; `npm test` och `npm run build` godkända. Chromium/SwiftShader
är inte fysisk Surface-/mobilprestanda.

## Streck i skuggningen ovanför dörrarna, #40

Överförd från `24d00b7d187f89daa5242e55accbf74bf4b667a0` (original #1129): `buildWallAO` i `src/ao.js`, som före ändringen var identisk med originalets `24d00b7^`. Dörrsmygarna fick väggskuggans takband ända upp till taket, inne i överstycket, och överläggets polygon offset drog fram det genom överstyckets yta som smala mörka streck ovanför dörrarna på övervåningen. Där ett överstycke går över ett litet väggblock (mellan Sovrum 2 och Allrum) lades bandet dessutom två gånger. Delvägghöga bitar (överstycken, fönsterfyllningar) blockerar nu bara över sin egen höjd, ytan delas i höjdband där en sådan bit börjar eller slutar, och en delbits yta hoppas över där den ligger an mot en hel vägg. Originalets `tools/wallaotest.cjs`, dokumentation och ändringslogg har inte förts över (testkitet saknas här).

Verifiering: `npm test`, `npm run build` och google-chrome `--use-angle=gl` på riktig GPU (Iris Plus 640) mot källkoden. Före/efter-bilder från övervåningens hall mot Sovrum 2/Allrum i L1007 och L1004 (originalets `?at=3.5,5.3,175,22,3.25`): strecken ovanför dörrarna är borta. En portning av originalets kontroll i `tools/wallaotest.cjs` (kördes ad hoc, inte incheckad) gav per plan i L1007/L1004/L1201 före 20/22/20/20/4/9 trianglar inne i en solid och 0/2/0/2/0/0 dubbla, efter 0/0/0/0/0/1 respektive 0. Ingen triangel vänd in i väggen, ritanrop oförändrade (194), inga sidfel. Den kvarvarande triangeln i L1201:s övre plan spåras i #45.

## Fönster mot parken i garagets stödmur, #42

Avgränsad överföring från `cc2212110e19a3f2a8a3d7f3fba5b163207c5aa7` (original #1151): `SITE.terrain.boxWindows` och tillägget `boxWindowOpenings` i `src/surroundings.js`. Den befintliga fönsterbyggaren delas till `siteWindowTrim` så att stödmuren återanvänder samma vita foder, spröjs, tätningar och opaka reflekterande glas som hus A/B/C. Inga andra originalfiler, resurser, spel- eller tjänstefunktioner förs över.

Fem fönster ligger på den södra muren mellan C och B (z 52,5), tre mellan B och A (z 33,3). Hus L har ingen motsvarande parkvänd stödmursrad; dess fönster är oförändrade, liksom hus A/B/C:s befintliga fasadfönster. Antal och horisontella lägen följer källans avläsning av våning −1, sida 46 (cirka ±0,1 m). Bröstning 1,1 m och överkant 2,2 m över marken utanför är **antaganden**, eftersom planen saknar fönsterhöjder. Detta är utvändiga opaka fasaddetaljer: befintlig garagevägg, terräng, invändig vägg, kollision och ljusmodell behålls.

Verifiering: `npm test`, `npm run build` samt `tools/park-windows-check.mjs` mot den riktiga källappen före/efter. Kontrollen räknar tre glasrutor per fönster i produktionsgeometrin, stråltestar alla åtta fönster från parken och motsvarande väggar från garaget, kontrollerar opakt glas och sparar kollisionssegment för jämförelse. Skärmbilder av båda mursträckorna utifrån och inifrån sparas. Föreläget laddar tidigare `6b3af42:src/surroundings.js`; efterläget använder ändrade produktionsmodulen.

Slutkontroll även mot publiceringsbyggets riktiga bundle efter rebase på `6d9a353`: åtta fönster med sex glastrianglar vardera, glas först från parksidan, ogenomskinlig vägg först från garageinsidan och 131 identiska kollisionssegment före/efter. Fem granskade vyer täcker fyra västra fönster, det smalare vid trappan, de tre mellan B och A samt båda invändiga mursträckorna. `npm test` granskade 67 moduler; bygget och Chromium/SwiftShader-kontrollen passerade utan browserundantag. Ingen fysisk mobil- eller GPU-prestanda påstås.


## Glas i Hus A/B:s parkdörrar, #43

Avgränsad överföring från `d14123544924eed61869e31634ca3a32bf09d696`
(original #1152): endast `leafGeo` för parkbladen, gemensam genomskinlig
`parkGlass`-instansbatch och dess matrisuppdatering i `src/garage.js`, samt
`GARAGE.parkDoorGlass` i `src/config.js`. Övriga delar av originalets stora
Garage/config har inte importerats. Befintliga karmar/beslag, dörrmått,
gångjärn, utåtgående rörelse, pickmål, nivågrindar och kollisionssegment
behålls. Glasets ton och profiler är visuella antaganden, inte inmätta
konstruktionsdetaljer. Inga nya ljus, texturer, beroenden eller nät-/lagringsanrop.

Endast de två parkbladen i A/B berörs. De 30 interna stålbladen behåller sin
solida geometri (252 trianglar per instans); C:s källarkoppling är intern och
L saknar motsvarande parkdörr och har redan glas i portikporten.

Även kommentarerna om "steel finish" vid A:s parkdörr ändras som i källan, eftersom bladet inte längre är helt i stål.

Verifiering: `npm test` (67 moduler), `npm run build`, `tools/browser-check.mjs` mot `dist/` och `tools/parkdoor-glass-check.mjs` före/efter. Föreläget (oförändrad `garage.js`) har opakt blad i öppningen; efter importen träffar en stråle genom bladmitten glaset men ingen metall, glasets instansmatris är identisk med bladets stängt/öppet, dörrvinkeln når 1,55 rad, kollisionssegmentet följer bladet från oförändrat gångjärn och pickmål/nivågrindar och originalets lagringsmarkörer är orörda. Glaset kostar ett ritanrop och 24 trianglar för båda dörrarna; de 30 interna stålbladen har kvar 252 trianglar. Kontrollen körs även mot publiceringsbyggets riktiga World för A och B, utifrån/inifrån, öppen/stängd, utan shaderfel, browserundantag eller externa anrop. Skärmbilderna togs med google-chrome `--use-angle=gl` på riktig GPU (Iris Plus 640, `ANGLE=gl`) och granskades: glas med synlig garagekorridor respektive park genom bladet, och det öppnade bladet visar ram, glas och handtag. Ingen fysisk mobil eller uppmätt prestanda påstås.
 
 
+## Hela källarhörn där loggior ligger under marken, #44
+
+Överföring från uppströms `67abfa1ce29a8a631c19551c6c5a0ec7b9499849`
+(original #1153): I Å-husens källarplan (våning −1 i Hus A och B) ligger
+hörnloggior under marknivån (`y < g - 1.2`). Där ska ytterhörnen vara hela
+tegelväggar i stället för indragna balkonghål med räcken/innerväggar under marken.
+
+Ändringar i `src/surroundings.js`:
+• `outline(b, st)` genererar hela rätvinkliga hörn `[0, 0]` för våningar där
+hörnloggian är nedgrävd (`buriedLoggia`).
+• `aHouse(b)` inkluderar `buriedLoggia` i sin extruderingsnyckel så att källarvåningens
+hela hörn extruderas separat från ovanliggande våningars loggiahål.
+• `loggias(blocks)` startar pelare och vitputsade innerväggar från första våningen
+ovan mark (`y0 = b.base + st0 * S.storey`), så att inga onödiga pelare eller
+innerväggar skapas under marknivå.
+
+Verifiering: `npm test` (67 moduler), `npm run build`, samt automatiserad kontroll
+i `tools/loggiabasement-check.mjs`. Kontrollen verifierar att inga vitputsade innerväggar
+genereras under markytan i källarhörnen och sparar en granskad skärmbild av Hus A:s nordöstra hörn.

## Full bredd på parktrappan mellan Hus C och Hus B, #46

Överföring från uppströms `81992225dcbd0c9ca12e2c108dde6b16de6d1b41`
(original #1204): Våning −1 och våning 1 ritar TRAPPA mellan Hus C och Hus B,
från nivålinjen vid z 52,5 ner till parken, som x −47,4…−44,4 (≈ 3,0 m, grafisk
avläsning ±0,15 m). Modellen hade 1,5 m (x1 −45,9).

Ändringar endast i `src/config.js`: trappan i `SITE.terrain.stairs` får x1 −44,4
med källkommentar, och trappfotens platta i `SITE.basementPaving` blir
`{ x0: -47.4, x1: -44.4, z0: 58.6, z1: 59.0 }`. Steghöjd, vilplan och räcken
är oförändrade *guess* (inte måttsatta). Räckesöppningen i gårdsboxens kant,
kollisionsavbrottet och de gångbara trappstegen följer automatiskt av
trappans x-intervall i `src/surroundings.js`. Originalets changelog-rad
överförs inte. Hus A:s östra trappa och Hus C:s NV-trappa stämmer redan med
våning 1; Hus L saknar parktrappa.

Verifiering: `npm test`, `npm run build`, `tools/browser-check.mjs` mot `dist/`,
`tools/park-windows-check.mjs` och nya `tools/parkstair-check.mjs`. Den senare
går i den riktiga World ner och upp på västra (x −46,9) och östra (x −44,7)
halvan: båda når parknivån −3 resp. gården 0 på 5,25 s utan sidoförskjutning
eller fall (största fall per bildruta 0,028 m). Med `--before` (källkonfigurationen
före ändringen) fastnar östra halvan vid trappkanten. Skärmbilder från parken
norrut mot trappan och från gården söderut ner mot parken granskades: trappan,
fotplattan och räckesöppningen är lika breda och gångvägen på gården möter
hela trappan.
## Ingen loggiaplatta vid hela källarhörn, #47

Överföring från uppströms `ea65674d00a44cb743702e208e8f816e5daf9ee7` (original #1203):
i `loggias()` i `src/surroundings.js` läggs ingen platta (`slabs.push(BoxGeometry(lx, 0.22, lz)…)`) vid eller under det solida begravda hörnets topp (`st > st0` i stället för `st > 0`). Plattans sidor låg i plan med hörnets tegel och z-fightade till en vit list vid Hus A:s nordöstra källarhörn vid östra utetrappan (och motsvarande hörn i Hus B). Originalets changelogpost hör till originalet; det finns ingen changelog här.

Verifiering: `npm test`, `npm run build`, skärmdump före/efter med google-chrome `--use-angle=gl` (riktig GPU) vid Hus A:s NE-hörn: före syns en bred vit list i tegelväggen, efter bara en tunn kvarvarande ljus linje, som originalets #1212 jobbar på (ej landat vid importen, därför ej med här). Pages och live kontrollerade efter push.


## Skuggrutor för områdesvida trädbatcher på mobil, #48 — granskad, inte tillämplig

Granskad mot `d0e1e44f16378d93b8faf90f1bfe4ef3db299501` och dokumentationen `9f3ef9cc571f1642de16f0567843e8e2ba43ec4e` (original #1195): på `lowMemory` slutar instansade skuggkastare bredare än 40 m att kasta skugga och får 32 m-rutor som bara syns under `renderer.shadowMap.render`, så att originalets ±14 m skuggbox gallrar bort de avlägsna rutorna. Här finns ingen skuggkarta: `src/main.js` aktiverar aldrig `renderer.shadowMap`, och ingen ljuskälla har `castShadow` (jfr #16 och #20). Trädens `castShadow`-flaggor saknar därför verkan och det finns inget skuggpass att avlasta. `src/shadowtiles.js`, `SHADOW_TILES` och `&noshadowtiles` har inte förts över; att lägga till dem skulle bara ge död kod. Originalets parkerade bilar finns inte här.

Verifiering i Chromium (iPhone 14 Pro-profil, `?lowmem`, och dator 1000×700) mot byggd `dist/`: `shadowMap.enabled` falskt, 0 skuggkastande ljus, en påtvingad rendering ritar 455 (mobil) respektive 505 (dator) anrop med 0 anrop till ett renderingsmål, dvs. 0 skuggpass-trianglar både före och efter. Fyra instansade batcher är bredare än 40 m (träd 973/1 195 instanser över ~695 m, 193 över 59 m, 8 över 132 m); de skulle bli aktuella först om en skuggande sol införs, och då ska #1195 föras över tillsammans med den. `npm test`, `npm run build` och `tools/browser-check.mjs` gröna.
## Ingen tunn sockelplatta på hela källarhörn, #49

Överföring från uppströms `37b3768db19b7ebf6cf374d438b317317a8dd658` (original #1212, uppföljning till #47): plattan ”över sockeln” (0,06 m, `else if (kind === 'ground' …)`) i `loggias()` i `src/surroundings.js` byggs bara när `st0 === 0`. På ett solitt begravt hörn (`st0 > 0`) stod dess sidor i plan med teglet och gav en tunn ljus linje vid Hus A:s nordöstra källarhörn. Originalets changelogpost hör till originalet; det finns ingen changelog här.

Verifiering: `npm test`, `npm run build`, skärmdump före/efter med google-chrome `--use-angle=gl` (`tools/loggiabasement-check.mjs`) vid Hus A:s NE-hörn: före syns en tunn ljus diagonal linje i tegelväggen, efter är den borta. Pages och live kontrollerade efter push.

## Överljus över grannentréer, #51

Importerad från `82423761f6a10d84bdde6bfd05a70422aeeb8b16` (original #1230): överljuset ovanför hus L:s grannentréer på markplan följer dörrens ytterkarmar i stället för bara öppningen. En rads ändring i `src/exterior.js`, ingen ny geometri. Verifiering: `npm test`, `npm run build` och Chromium-vy av norrfasaden (överljuset lika brett som dörren).


## Brantare å-slänt och tätare växtlighet, #52

Importerad från `622b0268` (original #1233, del 1): `SITE.river.bankScale` (0,55, *guess*) i `src/config.js` multiplicerar varje strandspann i `riverAt` (`src/riverbridge.js`), så marken faller mot vattnet på ungefär 6-8 m i stället för 11-15 m. `SITE.riverPark.treeDensity` (1,45), `treeSpacing` 6, `shrubCount` 190 och `shoreCount` 380 (alla *guess*) ger tätare skog, buskar och strandtuvor; `parkTreeSpots` i `src/riverpark.js` skalar varje fläcks `n` med `treeDensity`. Inga nya meshar eller material. Originalets ändringslogg, miljödokument och `riverparktest.html` är inte importerade (provet finns inte här). Originalets övriga delar av #1233 (cykelväg, gångytor) ingår inte.

Verifiering: `npm test`, `npm run build` och Chromium-bilder före/efter av åstranden och bron. Ritanrop oförändrade (40/96/37), trianglar +ca 30 000 per vy (cirka +10 %), inga sidfel.

## Å-parkens stigar: asfalt och grus, #53

Importerad från `c7d1796f` (original #1235, del 2 av #1233): 13 fler OSM-kartlagda stigar i `SITE.riverPark.paths` (`src/config.js`), ett `surface`-fält per stig (`asphalt` för asfalt/belagd, annars `gravel`, från OSM-taggen) och `SITE.riverPark.surfaces` med färgerna (*guess*, liksom bredderna för de tillagda stigarna). `buildRiverPark` i `src/riverpark.js` bygger två sammanslagna meshar, asfalt 3 mm över grus mot z-fighting, med `renderedTerrainY`; remsor utanför terrängen eller på vägar hoppas över. OSM har ingen `highway=cycleway` längs ån i området, så asfaltsstigarna är den delade gång-/cykelvägen. Originalets ändringslogg, miljödokument och `riverparktest.html` är inte importerade. Större gångyta (#1236) ingår inte.

Verifiering: `npm test`, `npm run build` och Chromium-bilder före/efter. Ritanrop +1 (t.ex. 73 till 74 i översiktsvyn), trianglar +718 (stigmeshen 1646 till 2364), inga sidfel.

## AO-hörn och kantlinjer i trapphuset, #54

Importerad från `446a7afc` (original #1228): `CORNER_TRIM` (1 mm) och ändringen i `quad()` i `src/ao.js`, så väggarnas AO-överlägg stannar 1 mm före innerhörnet och hörnet inte mörknas två gånger. Dessutom från `bd4c4f16` (original #1247, enbart `src/architectureedges.js`): kantlinjernas djupförskjutning är 1 mm plus 0,4 % av avståndet, så en hörnlinje sedd snett på några meters håll inte bryts upp i prickar. Originalets changelogposter är inte importerade (ingen changelog här).

Verifiering: `npm test` och `npm run build` gröna; Chromium (SwiftShader) före/efter från trappans topp i L1007 (kamera 3,3 / 4,85 / 6,2 mot öster och nedåt): hörnlinjen är hel. Hårlinjen utan AO syns inte längre dubbelmörk. Ingen sidfel.

## Källarentréer A och B med glasat sidoljus, #57

Importerad från `bf96c9ec` (original #1258): källarentréerna på plan −1 från parken till Hus A och Hus B har nu ett glasat sidoljus bredvid dörrbladet, med samma mörkgrå profilfärg (`0x3b4247`) på karm och dörrblad som entréerna i markplan.
- `src/config.js`: `side`-intervall på källarnischerna i Hus A (`[41.46, 42.25]`) och Hus B (`[46.10, 46.80]`), samt rektanglarna `parkASide` och `parkBSide` i `GARAGE.rects`.
- `src/surroundings.js`: `walkIn()` beräknar nischväggens öppning (`cut`) över både dörr och sidoljus.
- `src/garage.js`: karmprofiler för sidoljuset i `parkFrameBoxes`, kollisionssegment, mörkgrå profilkulör på glasade dörrblad/karmar samt `parkSideGlass`-mesh med parkdörrglasets material.

Originalets ändringslogg (post 981) hör till originalet och ingår inte här. Inga personliga resurser eller nätverksanrop.

Verifikation: `npm test` och `npm run build` gröna, samt visuell verifikation.


## Vinklade solpaneler på Hus L, #58

Överförd från `df3ad2c` (original #1232): `tiltedPanelGeo()` och `solarRise()` i `src/exterior.js` (panelerna är 10° uppvinklade mot söder, nordkanten höjd; stegöveryta på panelens högsta kant) samt enbart `HUS_L.solar.tilt/thickness/lift` i `src/config.js`, alla tre *guess*. Originalets `tools/rooftest.html`, dokumentation och ändringslogg finns inte här och har inte förts över.

Verifiering: `npm test`, `npm run build` och Chromium (headless, SwiftShader): panelerna syns uppvinklade på Hus L:s tak; gång över en panelrad på x = 3 går upp på 13,01 m (takets nivå 12,75 m + 0,26 m, inom `stepUp` 0,45 m); inga sidfel. Antalet meshar är oförändrat (ett box per panel i samma sammanslagna mesh).
 
## Karterade innergårdar, parkeringar och vägar i skolområdet och söder om ån, #59

Importerad från `e749b076` (original #1262): karterade innergårdar, parkeringar, kantstenar, parkeringsrutor och servicevägar i skolområdet och söder om Höje å från OpenStreetMap.
- `src/config.js`:
  - `SITE.east.access`: tillagda skolgårdar och parkeringar (OSM-vägar 145221623, 44447969, 145221566, 145221567, 145221572, 145221740, 94054863, 145221570) med markmaterial (asfalt/grus/plattor).
  - `SITE.south.access`: 8 karterade servicevägar söder om ån (OSM-vägar 850235114, 850235115, 36918923, 189432572, 30633544, 30633545, 145221590, 145221588).
  - `SITE.south.parking`: karterade parkeringsytor (145221619, 850235113, 145221624, 145221626, 145221628, 145221629) och 6 vinkelräta gatuparkeringsfickor längs Sankt Lars väg (1379042014, 1379042106, 1379042188, 1379042235, 1379043164, 1379043165).
- `src/sitebackdrop.js`:
  - Sluten/öppen ringhantering i `shape()` via `ring()`.
  - `onEastAccess()` hanterar både polygoner och linjestigar.
  - Per-objekt markmaterial (`asphalt` -> `0x5f6164`, `gravel` -> `0xb5ac90`, `paved` -> `0xa7a397`) sammanslaget med vertexfärger i befintlig mesh `east-access`.
- `src/southbackdrop.js`:
  - Sluten ringhantering i `shape()` via `ring()`.
  - `onParking()` och `onAccess` uppdaterade; träd exkluderar parkeringsytor.
  - Parkeringsrutor med vita skiljelinjer (`0xeeeeea`) och betongkantsten (`0xb0aba2`) via `lineQuad()`.
  - Sammanslaget i befintlig mesh `south-land` med vertexfärger; inga nya draw calls eller texturer.

Originalets ändringslogg, provfiler och personliga filer ingår inte här. Inga nya nätverksanrop eller spelmoment.

Verifikation: `npm test` och `npm run build` gröna.



## Längre promenad ner till ån och till klocktornet, #60

Anpassad från `5a3d3cd`, `e30ec5e` och `49e897d` (original #1236). `WALK` i `src/config.js` (x −260…320, z −200…250, *guess*) ersätter `OUTDOOR` som ytterkant i `src/world.js` (ytterväggen, även på taken); `OUTDOOR` är kvar som kvarterets område. Nya `src/farwalk.js` ger kollision för de kartlagda bakgrundsbyggnaderna (inklusive Klockhusets framskjutande mitt och innergårdshål), de två broarnas och träbrons räcken samt trädstammar utanför kvarteret (romb, `WALK.trunk`, *guess*), ån som hinder (`WALK.wade`) och branthetsgränsen `WALK.maxSlope`; en besökare som hamnar i ån eller inne i en byggnad/innergård flyttas till stranden/ut på gatan (`WALK.rescue`). Anpassningen ligger i `src/navigation.js` (`segments()`, glidning mot vatten/branter och `rescue()`), eftersom publicsidan saknar originalets `player.js`. Originalets tre HUD-meddelanden (ur ån, ut på gatan, ytterkanten) och ändringslogg är inte importerade; publicsidan har ingen motsvarande yta. Inga nya meshar, material eller nätverksanrop, så renderbudgeten är oförändrad. Hus A/B/C:s entréer berörs inte (enbart `SITE.blocks` med `style` får fjärrkollision: HepCat Store och Villan).

Verifiering: `npm test`, `npm run build`, `tools/farwalk-check.mjs` (ersätter originalets `farwalktest`; ned till ån, bägge broarna, räcke, HepCat, skolområdet till Klockhusets fasad, mellan skolbyggnaderna, tillbaka, de fyra ytterkanterna, räddning ur ån), `tools/browser-check.mjs` och `tools/places-browser-check.mjs` samt skärmbilder av ån och klocktornet i Chromium.

## Solpanelernas lutning, #63

Importerad från `fa837a45140355baee60b9f70b4da9061838847f` (original #1277): `tiltedPanelGeo` i `src/exterior.js` roterade fel håll (norra kanten sänktes, ytan vände mot norr, panelerna dök ner i taket). Nu `rotateX(+a)`: norra kanten höjs, ytnormalen pekar mot söder och lägsta kanten är den södra vid `HUS_L.solar.lift`. Funktionen exporteras för kontroll. Verifiering: geometrikontroll (alla hörn ovanför takkanten, söderlutning), `npm test`, `npm run build` och webbläsarkontroll.

## Oavbruten hörn-AO i trapphus mellan våningsplan, #66

Importerad från `3136c423` (original #1273): `buildWallAO` i `src/ao.js`, dess anrop i `src/world.js` och `tools/stairwallaotest.mjs`. Tidigare avbröts de vertikala innerhörnskuggorna över trapphål (`floorHole`/`ceilHole`), eftersom hörnen endast genererades i mittenbandet mellan golv- och takhöjdsavskärningarna (`fTop`/`cBot`), och bjälklaget mellan våningarna saknade hörnskugga. Nu sträcker sig hörnkolumnerna genom hela hålet med `FAR` golv/tak-avstånd (ingen felaktig golv- eller takskugga i luften), och plan 1 sträcker sig ner till `slabBottom` (2,5 m) så att hörnskuggan möter plan 0 sömlöst.

Verifiering: `tools/stairwallaotest.mjs` (verifierar kontinuerlig hörn-AO från plan 0 genom bjälklaget upp till plan 1:s innertak), `npm test` och `npm run build`.


## Mindre flimmer på avstånd, #65

Överförd från `dd9927ef` (original #1276), avgränsad. Importerat: `DECAL_OFFSET` (polygonOffset, faktor −1, enheter −2) på fönsterglaset i `src/neighborglass.js` (gemensamt för grannhus, campusfasader, skolan och Kärp-fasaden), `src/sitebackdrop.js` och `src/southbackdrop.js`, samt ett dynamiskt nära plan, `updateCameraNear()` i `src/main.js` med `VIEW_NEAR` i `src/config.js`. Glaset låg 1–7 cm framför fasaden utan förskjutning, medan ett 24-bitars djupsteg är ca 9 cm på 300 m (nära 0,06 m, bortre 700 m).

Anpassning: nära planet är 0,06 m inomhus, i trapphus, garage, besökta lägenheter och uppe på tak, och 0,12 m på öppen mark, men begränsat så att nära planets hörn ligger innanför kroppsradien 0,22 m (`BODY.radius` i `navigation.js`), så ingen vägg klipps även på bred skärm. Djupsteget på 300 m går från 8,9 cm till 4,5 cm. Inte importerat: höjdberoende nära plan och jetpack (ingen flygning här), `&near=`-parametern, originalets Playwright-test (ersatt av `tools/depthprecision-check.mjs`, ett rent nodprov), ändringslogg och dokumentation. Västra fasadens fönsterkarmar (1,5 cm, `facade`-batchen) är liksom i originalet inte förskjutna.

Verifiering: `npm test`, `npm run build`, `node tools/depthprecision-check.mjs` och Chromium (SwiftShader) före/efter av gata, innergård, L1007, garage och flygvy: inga sidfel, oförändrade ritanrop. SwiftShader har flytande djup och z-fightar aldrig, så själva flimret kan inte visas där; ingen GPU-bekräftelse.

## Takytor och takkollision för omgivande byggnader, #64

Importerad från `af78fcf2` (original #1274): `addSurroundingRoofWalk` i `src/surroundings.js` registrerar takytor och fasadväggar i `userData.walk` för alla omgivande byggnader i `SITE.blocks` (Villan, HepCat Store etc.) samt skolans växthus och skolmuren. `buildingRescue` i `src/farwalk.js` inkluderar även omgivande kvartersblock med stil.

Verifiering: `npm test`, `npm run build` och webbläsarkontroll i Chromium.


## Parkering bakom HepCat, #67

Importerad från `fd6c9f74` + konflikträttelsen `f76c7cc9` (original #1278): `src/parkinglayout.js` (ren layout av p-rutor längs servicevägar), `PARKING_LOT` i `src/config.js`, terrängföljande asfalt, rutlinjer och kantstråk i `src/sitebackdrop.js` (ingår i befintlig `access`-mesh, inga nya ritanrop). Polygonerna `145221623` (Sankt Thomas/Klockhuset) och `44447969` (Östra campusparkeringen) ersätter de tidigare små platshållarpolygonerna med originalets OSM-underlag från #1262 (`capacity` är en *gissning*). Alla mått är gissningar. Asfalten delas upp i högst 1,0 m långa trianglar (originalet 3,0 m) så att den följer terrängens rutnät; några smala gröna streck återstår vid en terrängkant.

Inte importerat: parkerade bilar (`eastlot.js`, kollision i `farwalk.js`), eftersom bilmodellen (`streetlife.js`) saknas nedströms; då behövs inga bilkollisioner. Inga personliga resurser, spelinslag eller nätverksanrop. Övriga #1262-ändringar av gårdar och vägar är inte importerade här.

Verifiering: `npm test`, bygg och Chromium-bilder (dagsljus) före/efter av båda parkeringarna utan sidfel.


## Gångbara tak för alla kartlagda byggnader, #68

Importerad från `bfa0bc75` (original #1294): `src/buildingroofs.js`, polygonytor med hål och 20 m-rutnät för uppslag samt `Roofs.walls(y0, y1, x, z)` i `src/roofs.js`, `roofY(x, z)` på varje bakgrundsbyggnads post (`sitebackdrop.js`, `southbackdrop.js`, `campusfacades.js`, `schoolfacade.js`, `karpfacade.js`), `BUILDING_ROOFS` i `src/config.js` (*gissning*) och anropet i `surroundings.js`. Nedströms skickar `src/navigation.js` besökarens position till `Roofs.walls` (originalet: `player.js`). Endast kollision: inga meshar, inga ritanrop. Originalets `tools/roofaudittest.html` bygger på spelarmodulen och jetpacken och är inte importerad; `tools/roofaudit-check.mjs` är den nedströms motsvarigheten (54 tak: man landar på varje tak, ringväggarna serveras). Inga poäng- eller första-besök-räkningar, ingen jetpack. Takväggarna är bara 5 cm över taklinjen: de stoppar en kropp som överlappar takets sida, medan den som står på taket kliver över dem (som i originalet).

Verifiering: `npm test`, bygg, `tools/roofaudit-check.mjs` (54 av 54), Chromium-bilder före/efter av landning på Klockhusets, ett västligt kvarters och Östra paviljongens tak.

## Gröna glipor genom asfalten, #70

Egen rättning (ingen uppströmsändring): asfalten bakom HepCat samplar marken i 1,0 m-trianglar och kunde hamna någon centimeter under terrängmeshens veck (mätt: upp till 1 cm under markytan längs z 14, x 49 och x 74). Backdropens `access`-material (`src/sitebackdrop.js`) har nu samma djupförskjutning som övriga dekaler (`DECAL_OFFSET`), alla lyft behåller sin inbördes ordning, inga nya draw calls.

Verifiering: Chromium-bilder i dagsljus före/efter från flera vinklar (grön strimma före, borta efter), `npm test`, bygg, inga sidfel.

## Busshållplats Sankt Lars och cykelväg mot Circle K, #71

Importerad från `5790fc4d` (original #1301): `src/busstop.js` (plattform, kantsten, taktil list, glasväderskydd, bänk, papperskorg, hållplatsskylt utan logotyp och riktningsskylten "Circle K", fyra sammanslagna meshar), `src/busstopgeo.js` (ren geometri), `SITE.busStop` i `src/config.js` (OSM-plattform 189432570, skärmtak-nod 2000527685; alla mått *gissningar*), skärmtakets tre glassegment som kollision (`farwalk.js`), träd och buskar hålls borta från plattformen (`clear` i `riverpark.js`), cykelvägen mot Circle K (OSM 61112061) ritas nu ända till `backgroundGround.x1 - 10` (tidigare klipptes den vid x 220), `tools/busstopgeotest.mjs` och OSM-underlaget `docs/references/surrounding-views/bus-stop-sankt-lars-2026-10-18.json`.

Anpassning: nedströms är vägarna 36918923 och 189432572 uppdelade annorlunda än i originalet (långa vägar längre söderut), så bussfickans korta delar (36918923-stumpen, tillfarten 95035967 och 189432572 vid korsningen) lades till i `SITE.south.access`; testet kräver därför "minst fyra" vägar och att 95035967 finns. Originalets ändringslogg, `perfcount`-läget och dokumentationsrader ingår inte (ingen ändringslogg/perfcount nedströms). Inga personliga resurser, spelinslag eller nätverksanrop.

Verifiering: `node --test tools/busstopgeotest.mjs`, `npm test`, bygg och Chromium-bilder i dagsljus före/efter av hållplatsen och cykelvägen.


## Höjdrutnät och terräng, #69

Importerad från originalet: `73a4aeb5` (`data/elevation.json`, `tools/elevation_grid.py`, `tools/elevationcompare.cjs`, `tools/elevationtable.py`), `6d4870fb` (`src/elevation.js`, genererade `src/elevationgrid.js` via `tools/elevation_js.py`, `ELEVATION` i `config.js`, `terrainY`-blandningen och nordliga terrängrader i `surroundings.js`, adaptiv `pathStrip` i `roads.js`, nordplattan i `world.js`, hårdbelagda ytor i `sitebackdrop.js`), `4e54125d` (`TERRAIN_FAR`, glesare terräng långt från kvarteret) samt `75da731b` + `778e174b` (byggnadsplattor `makeBuildingPads`, fält och parkeringar i `southbackdrop.js` skurna längs terrängen).

Källa och licens: Copernicus DEM GLO-30, "Contains modified Copernicus data"; texten finns i `THIRD_PARTY_LICENSES.txt`. Rutnätet är 10 m och rent ytmodell-baserat (marknivå uppskattad ur ytmodellen), registreringsnoggrannhet ca 3-5 m. L1007:s kvartersnivå (y 0 = innergården), garagelådan, Karpvägens/Sankt Lars vägs egna profiler och ådalen behålls (`ELEVATION.protect`/`river`); utanför följer marken rutnätet. Tunables är *guess*.

Anpassningar: originalets gångområde, jetpack och egna backdrop-delar (`paddock.js`) finns inte här; fält/parkeringar med hål behåller de gamla hörnhöjderna. Inte överfört: `156bfd34` och `c313adf9` (parkeringens asfalt skuren längs terrängmeshens egna rutnät, `cutAtTerrain`) - parkeringen bakom HepCat har redan egen lösning från #67/#70 (1 m trianglar och djupförskjutning, samma teknik som originalet senare tog över); #1309/#1310 kan bli ett uppföljande ärende om gröna glipor syns. Originalets prestandamätning (`perfcount`) finns inte i denna repo.

## Parkering och beläggning skärs längs terrängmeshen, #73

Importerad från originalet: `156bfd34` (#1309, `cutAtTerrain`/`clipHalf`), `c313adf9` (#1310, hårdbelagda ytor, kantstrimma och linjer skärs längs terrängens rutnät; delar helt under byggnader släpps) i `src/sitebackdrop.js` (filen är densamma som originalets `778e174b`), `terrainGrid`/`renderedTerrainY.grid()` i `src/surroundings.js` och `PARKING_LOT.mesh` i `config.js`. Brolinjen från #1271 ingår inte. #70:s djupförskjutning på `access`-materialet behålls (originalet har den också).

Mätning före: asfalten bakom HepCat var 8 192 trianglar (1 m); synliga gröna glipor i asfalten och sågtandade kanter på skolgårdens hårdbeläggning i dagsljus (vyer mot parkeringens östkant och Kunskapsskolans nordöstra hörn). Efter: ingen glipa i samma vyer, kantstrimman sammanhängande, ca 11 000 färre trianglar i parkeringsvyn (385 742 -> 374 020), oförändrat antal anrop. Verifiering: `npm test`, bygg, Chromium-bilder före/efter, inga sidfel.

## Gröna hål i gångvägarna, #74

Importerad från originalet: `2aad0296` (#1313): `pathStrip` i `src/roads.js` skär lutande kvadrer långt från kvarteret längs terrängmeshens rutnät och diagonaler (`terrainCuts`, `cutAtTerrain` flyttad hit från `sitebackdrop.js`, knäck inom 1 cm släpps), och `farGround.grid()` i `src/southbackdrop.js` ger de södra gångvägarna samma rutnät. Originalets ändringslogg och `perfcount` finns inte nedströms.

Verifiering: `npm test`, bygg, Chromium-bilder i dagsljus före/efter vid Sävsländegatan (grönt hål före, borta efter; svaga hårfina skarvar kvarstår). Originalets perfcount-topp var 988 466 trianglar (budget 1 000 000).

## Gröna hårlinjer i gångvägarna, #75

Importerad från originalet: `8801ca3b` (#1314): i `pathStrip` (`src/roads.js`) överlappar varje skuren bit sina grannar med 1,5 cm över skärlinjerna (kanterna flyttas utåt och höjden samplas om), så de hårfina springorna där grannen skärs annorlunda täcks. Inga extra trianglar.

Verifiering: `npm test`, bygg, Chromium-bilder i dagsljus före/efter vid Sävsländegatan.


## Hästhage med två ponnyer, #76

Importerad från originalet: `2fa7e79c` (#1280, hagen) och `90a1f669` (#1295, stättan vid grinden). Den kartlagda njurformade ängen söder om träfotgängarbron (OSM-fältet `237019759`, `SITE.south.fields`) är en inhägnad hage: stolpe-och-regel-staket med stängd grind, vattenho och tresidigt vindskydd i ett enda hörnfärgat nät (`src/paddock.js` `fenceGeometry`), ett slitet spår längs staketet i södra bakgrundens landnät (`paddockLandParts`, anropas från `src/southbackdrop.js`) och två ponnyer som ett instansierat nät med animation i vertexskuggaren (en ritanrop, 540 trianglar per ponny). Planen (`src/paddockgeo.js`) delas av kollision (`src/farwalk.js`: `fenceSegments`, `stileWalls`, `stileSurface`/`stileBase`), `src/navigation.js` (stättans ytor i `groundAt`) och djuren. `PADDOCK` i `src/config.js` (allt *gissning*) och hagens markfärg (`8362575` i fältlistan). Ponnyerna betar, står och vandrar lugnt mellan platser fria från träd, ån och staketet, och går fram mot staketet när ögat är inom 40 m; inget simuleras eller ritas längre bort än 280 m.

Medvetet inte importerat: all interaktion (originalets klappning från #1293 med pick-lådor, `targets()`, `pet()`, ljudet `nicker`), ponnyernas namn (personliga), `noDetail`/`warmDraw`-krokar och originalets `audio.js`-beroende. Ponnyerna är enbart miljö: nätet har ingen raycast och inget i `main.js` frågar efter dem. `?nopaddock` stänger av hagen. Betningen (#1315) överfördes i #78 och skydd i regn/snö (#1316) i #79, se nedan.

Verifiering: `npm test`, bygg, `node --test tools/paddockgeotest.mjs` och `CHROME_PATH=… node tools/paddock-check.mjs http://localhost:8238 /tmp/paddock` (ett staketnät och ett ponnynät, trianglar inom budget, ponnyerna håller sig inom staketet i 10 simulerade minuter, ritas/simuleras inte långt bort, strålar går igenom, grinden och staketet stoppar en riktig gång, stättan går att gå över), samt bilder från grinden, ovanifrån och vid stättan.

### Hästarna betar (original #1315, `94ba9c42`; här #78)

Importerad från originalet: `94ba9c42`. Hagens gräs är ett enda instansierat nät (`paddock-grass`, en ritanrop, ca 5 000 tuvor à 6 trianglar) vars höjd vertexskuggaren läser ur en grov grässmask (R8-textur, 1,5 m-celler; `Paddock.initGrass`, `eatAt`, `grassAt`, `uploadGrass`, `grassGeometry`, `grassMaterial`, `PADDOCK.grass` i `src/config.js`). Maskens startmönster slumpas per session (inget sparas); en betande ponny (huvudet nere) äter gräset framför mulen, gräset växer långsamt tillbaka, och ponnyerna föredrar långt gräs (`longPlace`, ändringar i `decide`/`stepPony`). Gräset döljs i snömånader (`registerSeasonal`) och när hagen är utom synhåll. Anpassningar: inga `noDetail`/`warmDraw`-krokar (finns inte här), ingen klappning/poäng/ljud. `tools/grazetest.cjs` ersatt av grästesterna i `tools/paddock-check.mjs` (en ritanrop, patchig mask, mulen betar, regrowth, snö döljer, ponnyerna betar och går under 10 simulerade minuter).


## Gångvägen under bron, #77

Importerad från originalet: `0fc23831` (#1317): i `buildRiverPark` (`src/riverpark.js`) klipps en gångvägsremsa inte längre bort när alla hörn ligger på en väg i plan om något hörn ligger under en brodäcksyta (`deckAt`). Sankt Lars väg korsar bron, så grusgången vid z 111 under vägbron fick tidigare ett glapp.

Verifiering: `npm test`, bygg, Chromium-bilder underifrån före/efter (glapp under bron före, sammanhängande grusgång efter; grusnätet 2032 -> 2040 trianglar).

### Skuggträd, skydd i regn och borta vid snö (original #1316, `d884dbb9`, `b61bf377`; här #79)

Importerad från originalet: `d884dbb9` (tre stora skuggträd), `b61bf377` (skydd i regn, borta vid snö; ändringsloggen `b0eb4cc4` ingår inte, projektet har ingen). `PADDOCK.trees` (`[x, z, skala]`, *guess*, samma lägen som originalet: minst 10 m innanför staketet, över 25 m från grinden, 35 m eller mer från ån) läggs i `src/surroundings.js` som kind `'big'` i de delade stam- och kronbatcharna: inga nya ritanrop, stammarna stoppar gång via `treeFeet`. Nya `src/paddockshelter.js` (`shelterSpots`, `RainWatch` med hysteres, `snowCovered`), `PADDOCK.rain` i `config.js` och `initShelter`/`shelterTick`/`shelterDecide` i `src/paddock.js`: i regn går ponnyerna (var och en med sannolikhet `chance`, minst en) under skjulet eller ett träd och står kvar tills det varit torrt i 20 s; i snömånaderna (`registerSeasonal`) går en synlig ponny först till skjulet och är sedan borta (skala 0, inte ritad, inte simulerad), osynlig hage ändras direkt, och de kommer tillbaka när snön är borta.

Anpassningar: projektet har **inget väder och ingen aktiv årstidsklocka** (`applySeason` anropades inte). Regninmatningen är därför tredje argumentet till `Paddock.update(dt, hidden, rain)` och drivs i appen bara av felsökningsparametern `?paddockrain=0..1`; ny felsökningsparameter `?month=1..12` anropar `applySeason` (vit mark, kala träd, ponnyerna borta i månad 12, 1, 2). Utan parametrar ändras inget för besökaren. Ingen klappning/poäng/ljud (originalets `targets()` och pick-filtret ingår inte).

Verifiering: `npm test`, bygg, `node --test tools/paddockgeotest.mjs` (träden och skyddsplatserna) och `tools/paddock-check.mjs` (nya kontroller: träden i `treeFeet`, stammen stoppar en gång, torrt väder, regn, slut på regn, snö med promenad till skjulet, tillbaka, osynlig hage), samt bilder av träden, en ponny under skjulet i regn och den tomma vinterhagen.

### Hästskjulet på jämn mark (original #1335/#1336, `937ac17e`; här #80)

Importerad från originalet: `937ac17e`. Skjulet står inte längre på en fast skyddspunkt (marken föll ca 0,7 m under fotavtrycket, så ena sidan hängde över sluttningen). `shelterSite` (`src/paddockshelter.js`, ren funktion) söker i ett 1,5 m rutnät inom 45 m från grinden efter punkten närmast den gamla platsen vars fotavtryck (`footprintGround`, 5x5 prover över skjulet + `PADDOCK.shelter.pad`) varierar högst `maxRelief` (0,2 m), ligger minst `edge` (8 m) innanför staketet med alla hörn inne, fritt från stammar och å, 9 m från tråget och med öppna sidan mot grinden. `fenceGeometry` lägger golvet vid högsta marken och drar stolpar och syllar ner till lägsta marken (+ `sink`). Alla värden är gissningar (*guess*) i `PADDOCK.shelter`. Skyddspunkterna (#79) och betesmaskens zon (#78) läser `spots.shelter` och följer det nya läget automatiskt.

Verifiering: `npm test`, bygg, `node --test tools/paddockgeotest.mjs` (syntetisk slänt och verklig terräng: gamla platsen förkastas, ny plats ryms) och `tools/paddock-check.mjs` (nya kontroller: jämn mark, innanför staketet, i sikte från grinden, jämnt under tråget).

### Gångvägar och vägar utan glapp och överlapp (original #1341, `f2330dde`, `53c46cd8`, `350c5196`, `0a934ac2`; här #81)

Importerad från originalet: `f2330dde` (`pathStrip` fick argumentet `trim` och `roads.js` `onVehicle`/`isVehicleWay`: fotstigar i parken och i väst/öst/nord-bakgrunderna klipps vid körbanans kant i stället för att ligga över asfalten; vägasfalt och trottoarer läggs på den renderade terrängen, `roadGround` i `surroundings.js`, mot gröna hål; en gruspassage vid Hus B ansluts, ny rektangel i `SITE.basementPaving` på (-27,63), *guess*; `tools/pathaudit.mjs`), `53c46cd8` (Karpvägen 6-8, 342815193 sluter vid gaveln, *guess*), `350c5196` (servicevägen 44447980 böjer in mot Östra långan, *guess*), `0a934ac2` (850235116 når Hus 130578354 och pathaudit räknar hopsatta ändar som anslutning, inte överlapp). Alla patchar gällde direkt: väg- och stigdata i väst/nord/park är identiska här.

Hus B-anslutningen är ren platsgeometri (en markbeläggningsrektangel), inget privat, och togs med. Sydbakgrunden har annan data här än i originalet, så `pathaudit` rapporterar två fynd som originalet inte har, båda lämnade utan ändring. (1) Den då felidentifierade lokala GC-kurvan145221588 (w3,5) vid(-14;137,5) slutar nära ån. Det belägger en modellerad strandanslutning, inte OSM-vägens ändpunkt; identiteten rättas i #133 nedan. (2) Dubblett 850235114/850235115 vid z ca 384-390: ligger söder om den ritade marken (z > 260) och `WALK` (z 250), varken synlig eller nåbar; ej tillämpligt. Övrigt i spelbart område: inga dead-end/gap/on-road.

Verifiering: `npm test`, bygg, `node tools/pathaudit.mjs` (inga dead-end/gap/on-road i det spelbara området, 20 `on-road (trimmed)` som klipps vid ritning), Chromium-bilder före/efter från markhöjd och uppifrån.


## Exakta gångbaneanslutningar, #82

Granskade källor: `8a7c0b6579454ab8b5c9a47f21e029f81d456823` och `8d06df34f9d2cacd7f00b698145b8fad2b2da0af` (original #1351). Importerat: `roads.js` och nya `polygoncut.js`, enbart anropsändringarna i `sitebackdrop.js`, `riverpark.js` och `surroundings.js`, samt Sankt Lars vägs avgränsade kartkoppling i `config.js`. Ingen hel config/world/import av personligt innehåll. Källfilerna för vägklippningen var identiska efter #81; omgivningarnas separata anpassningar har bevarats.

Gångbanornas färdiga trianglar klipps mot den ritade körbanans trianglar, fillet-ytor och rektanglar. Nya vägkantspunkter får markens renderade höjd. Även trottoarens överlapp med sin egen körbana i skarpa böjar tas bort. En redundant 1,58 m rätvinklig kartkoppling väster om Karpvägens mynning ersätts av en mjuk anslutning med 8 m radie (*guess*); bredderna följer sina kontrollpunkter. Befintliga undantag för gångvägen under broarna och befintliga materialbatcher bevaras.

Verifierat: `npm test`, `npm run build`, tre Node-prov för polygondifferens och sex Chromium/WebGL-kontroller i `tools/roadjunctiontest.html` (Three.js från projektets lokala beroende). 0 av 10567 kontrollerade ritade gångbane-/trottoartrianglars mittpunkter överlappar körbanemesharna; sned anslutning når båda exakta vägkanter, markplanet och bro-undantaget bevaras. Den byggda riktiga visningen kontrollerades med en 16 m promenad söderut över korsningen, oförändrade markörer i originalets lagring, inga sidfel och inga externa anrop. Skärmbilder uppifrån, från marken och över området granskades. Första privata gångprovet gick bara 10,67 m och nådde inte sin slutgräns; efter längre provgång passerade kontrollen utan produktändring. Ingen fysisk telefonprestanda påstås.


## Synliga ponnyer i vinterskjulet, #87

Granskad och överförd källa: `2d6994126e5c930015c390b258ead1a98ebfba50` (original #1352). Endast `restInShed`, årstidsövergångarna, vinterskyddets vägval och undantaget från hagens större avståndsputt i `src/paddock.js`, samt förklarande kommentarer i `config.js`/`paddockshelter.js`, har importerats. Befintliga två miljöponnyer, betning, regnskydd och avståndsculling bevaras. Vinterponnyerna står synliga på sina två platser under befintligt tak, går dit när hagen är i bild, placeras direkt när den är dold och går ut igen på sommaren. Ingen klappning, pick-targets, personnamn, poäng, hjärtan, ljud, originalets lagring eller Cloudflare har importerats. Projektets månad förblir en explicit felsökningsparameter (`?month=1`), utan ny väderklocka. Det ersätter #79:s tidigare dolda vinterponnyer.

Verifiering: `npm test`, `npm run build`, Node-geometri 8/8 och den verkliga visningens `tools/paddock-check.mjs` passerar (vinterpromenad utan försvinnande, största positionssteg0,489m, normala instansskalor, sommar, dold hage och återkomst; tidigare regn-, gräs-, staket- och stättakontroller bevarade). En separat kallstart av den byggda riktiga visningen med `?month=1` visar båda exakt på sina platser med skala1, ett ritanrop för ponnyerna, dolt gräs vid snö, inga sidfel eller externa anrop och oförändrade originalmarkörer i localStorage/sessionStorage. Både käll- och byggbilder av det bebodda vinterskjulet granskades. Första syntaxkontrollen upptäckte ett dubblerat lokalt testnamn; det rättades innan det verkliga webbläsarprovet kördes. Ingen fysisk telefonprestanda påstås.

## Lilla träbron vid hästhagen på jordramper, #86

Importerad från originalet: `8c15727c` (original #1337/#1338). Brons däck (`deckY` −3, OSM 51890085, `SITE.riverPark.woodBridge`) vilar inte längre på två lodräta brofästlådor som gjorde att man inte kunde gå upp; i stället slutar det på två jordramper med fall 0,125 per meter (`ramp.slope`, långt under `WALK.maxSlope`), sluttande sidor 0,6 (`flank`) och en brant framsida mot ån. `parkFillAt(x, z)` i `src/riverpark.js` är fyllnadshöjden, `groundY` (`src/surroundings.js`) ger `max(terräng, fyllnad)` (så gång, träd och hagen följer), gruset ligger i `park-paths`-batchen (+3 cm) och gräsbanken i `site-terrain`-meshen (`parkRampFill`): inga nya ritanrop. Träd, buskar och strandtuvor hålls utanför rampen (`parkFillFootprint`). `finish` exporteras från `src/roads.js`. Rampernas riktningar (`ramp.dirs`) är mot nästa punkter på parkstigarna 51890086 (NV) och 1432565773 (SÖ). Alla rampvärden är *guess*.

Anpassningar: denna repos hagstaket löper ca 2,8 m bredvid sydöstra rampen (originalets gjorde det inte), så `reach` är 2,5 m i stället för 3,6 m; staketet ligger då helt utanför rampens fotavtryck (kontrollerat mot `fenceSegments()`). Inget cykelläge, ingen ändringslogg och inga `riverparktest`/`farwalktest`-sidor finns här; kontrollerna ligger i `tools/farwalk-check.mjs` (hållen W-promenad över bron i båda riktningar, släta ramper). Kontrollerade, ej påverkade: vägbron och gång-/cykelbron över Höje å (deras fästen följer dalsluttningen).

Verifiering: `npm test`, bygg, `node tools/farwalk-check.mjs` (båda håll över bron, marken längs rampernas mittlinje utan steg och under 80 % av `WALK.maxSlope`), Chromium-bilder före/efter från sidan, båda ändar och uppifrån.

## Tätare gräs i hagen med 72 h återväxt, #84

Importerad från originalet: `bc35c6c2` (original #1342). Hagens gräs är en låg, tät "ruggig matta" i stället för få stora tuvor: varje tuva är två korsade fyrkanter (4 trianglar) och de fina stråna (`PADDOCK.grass.blades` per rad, tre rader) skärs ut i fragmentskuggaren (`grassGeometry`/`grassMaterial` i `src/paddock.js`). Fortfarande ett instansierat nät och ett ritanrop. Trianglar före/efter: 5 013 tuvor à 6 = 30 078 trianglar, nu 8 503 tuvor à 4 = 34 012 trianglar (budgeten i `paddock-check.mjs`, under 50 000, är oförändrad). Återväxten är 1/(72·3600) per verklig sekund, så en helt betad hage är lång igen efter 72 timmar, också när besökaren är långt borta (`growGrass` körs före avståndsputten i `Paddock.update`). Grässmasken sparas (högst var 20:e sekund och vid `pagehide`) med tidsstämpel i `localStorage`-nyckeln `kvarteret-lunden.paddockGrass` och hinns ikapp vid nästa besök (`loadGrass`/`saveGrass`); slumpade startfläckar används bara när ingen giltig sparad mask finns. Lagring som saknas eller kastar ger bara en ny slumpad hage (try/catch). Alla värden är gissningar (*guess*) i `PADDOCK.grass`.

Anpassningar: eget nyckelnamn (rör aldrig originalets nycklar), ingen ändringslogg, `tools/grazetest.cjs` finns inte här utan kontrollerna ligger i `tools/paddock-check.mjs` (72 h med simulerad klocka, ikapphämtning av sparad mask efter 36 h, blockerad `localStorage`). Gräset döljs fortsatt vid snö och långt avstånd.

Verifiering: `npm test`, bygg, `node --test tools/paddockgeotest.mjs`, flera körningar av `tools/paddock-check.mjs` samt Chromium-bilder före/efter från markhöjd, nära hästarna och ovanifrån.


## Finare höjdreferenser för Höje å, #85

Granskad källa: `9040a306ce59c4fe220385affb30972f58316e6d` (original #1349). Importerat enbart `tools/riverheight-api.mjs` (kommentaren anger detta ärende), `docs/references/elevation-hoje-a/point-api-2026-10-19.json` och `archive-metadata-2026-10-19.json`. Båda JSON-filerna är byteidentiska med originalets öppna referensleverans. Verktyget använder den publika visningens befintliga `SITE.river.path`/`geo.anchor`. Publicsidan saknar `sitegeo.js` och `DAY`; endast den granskade inversa kartomvandlingen från originalets `sitegeo.js` och dess 58° registreringsriktning har därför lagts lokalt i Node-verktyget, utanför den byggda appen. Inga privata resurser eller tjänster tillkommer. Runtimeprofilen överförs separat i #90 från original #1350.

Källa: Lantmäteriet Markhöjdmodell via [kart-api](https://kart-api.se/en/guides/elevation-sweden/), CC BY 4.0, RH 2000 enligt leverantören. Punkt-API:t uppger en 1 m källgrid; detta är en tredjepartsexport och inte en hämtad original-GeoTIFF eller egen kontroll av mättidpunkt. Referensen innehåller 60 giltiga svar utan NODATA: alla 19 mittlinjeankare, fem tvärprofiler över ±24 m och ett markprov vid modellens origo. Kommunarkivets URL, SHA256 och storlek är bevarade i metadata; binärfilen på 114617592 byte importeras inte. Dess zoom15/256 px motsvarar ungefär 2,693 m per exportpixel och höjdsteg 0,1 m, trots filnamnets 1 m.

Den ungefärliga modellregistreringen är fortsatt 3–5 m. En finare källgrid gör inte läget inmätt; en mittlinjepunkt kan hamna på strandkanten. Markmodell vid vatten är inte bathymetri eller aktuellt vattenstånd. Markprovet 14,36 m RH 2000 vid origo är inte ett verifierat lägenhetsgolvdatum; `SITE.terrain.ref.plus` förblir null. Tvärprofilernas provavstånd är valda för analys och är inte inmätta åbredder.

Kör separat från appen: `node tools/riverheight-api.mjs OUTPUT.json`. Utan cache hämtar det högst 100 avgränsade, sekventiella API-svar (60 med nuvarande kartlinje), med 20 s timeout och paus mellan anropen. Inga konton, nycklar eller credentials behövs. Varje färdigt svar sparas för återupptagning; avbrutna exporter är uttryckligen ofullständiga. En kopia av den incheckade exporten kan återläsas helt offline utan nya anrop. Verktygets `issue:1349` är ursprungligt källärende. Inga höjdanrop sker i den publika visningen, och denna import ändrar ingen terräng, bro, gångbana eller vattennivå.

Verifierat: 60/60 punkter återlästa med `globalThis.fetch` avstängd, 0 NODATA och identisk punktmängd/koordinatvalidering. Första återläsningen visade att originalets `sitegeo.js` saknas här; den ovan beskrivna lokala verktygsanpassningen löste det utan appberoende. JSON-filerna är byteidentiska med källan (SHA256 `6e1a9d10e16dd48cee089e5fdc654d702ebe1b5cb0efb121ddfc08fc1185b89c` respektive `9659a09370657a7430f4d581f8cfbf4dfad2a467cac7c291acac72345c7ee16a`). `npm test` och bygge passerar; den levererade appgrafen är oförändrad med 79 moduler, samma buildversion `ebf4feb98a73bd953163bbcb` före/efter importen. Varken referensfiler, verktyg eller höjd-API finns i `dist/`. Ingen ny scenbild behövs för denna referensimport; runtime och dess visuella verifiering ligger i #90.


## Relativ fallprofil för Höje å, #90

Granskad källa: `4ea227616423b21139f9fefa57915910e60c6d42` (original #1350), med referenserna redan importerade i #85. Överfört de rena miljöändringarna i `riverbridge.js` och `riverpark.js`, enbart `SITE.river.fall` i config, tolkningsrapporten, `tools/riverfall.mjs` och anpassade profil-/gångtester. Jämförelsen före import visade endast bevarade kommentaranpassningar i de två miljömodulerna. Originalets Player, main, plask/ljud, jetpack, cykelspel, personligt innehåll och Cloudflare har inte importerats.

Medianen av 171 parvisa lutningar från de 19 mittlinjepunkterna är −0,0009170995546035121 m/m, omkring 0,482 m fall över 525,646 m. [Tolkningsrapporten](references/elevation-hoje-a/fall-interpretation-2026-10-19.json) innehåller källhash, råvärden/trend, residualer och begränsningar; den reproduceras offline med `node tools/riverfall.mjs`. Lantmäteriet via kart-api, CC BY 4.0. Detta är tolkad relativ marktrend, inte uppmätt vattenyta, flöde eller undervattensbotten. Befintliga uppskattade nivåer förankras vid vägbrons centrum; djupet 0,6 m och strandmarginalen 0,7 m behålls som antaganden. Inget absolut lägenhetsgolvdatum antas.

`riverAt.along`, `riverFallAt`, `waterYAt` och `shoreYAt` ger samma längdprofil till vatten, botten/strand/ådalsplan och vegetation. Ådalens yttre profil övergår mjukt till befintlig terräng inom 32 m. Jordrampens nedre framkant följer lokal strand; gångbar ramptopp och brodäck behålls. Native-jämförelser visar identisk fast brogeometri och stigkontroller/bredder mot källbasen 387f802e. Den publika `waterBlocked`/`waterRescue` använder en geografisk gångspärr och återkomst på faktisk mark, utan konstant vattenhöjdsjämförelse. Den befintliga policyn och navigationen bevaras och följer de graderade marknivåerna.

Verifierat: `npm test` (79 moduler) och bygge, Native-profilprov 5/5 och byteidentisk offline-reproduktion av rapporten; `tools/farwalk-check.mjs` 23 PASS/CLI0, inklusive båda småbroriktningarna och tre lokala vattenåterkomster. I den byggda riktiga visningen följer faktiska vattenmeshtrianglar de lokala nivåerna vid tre ankare (största avvikelse under 0,3 mm), total nivåskillnad 0,48207 m; en faktisk 32 m promenad går under båda broarna och tre verkliga Navigation.rescue-återkomster är torra. Inga sidfel eller externa anrop och oförändrade originalmarkörer i localStorage/sessionStorage. Före- och byggbilder vid vägunderfarten, träbrons ramp, västra stranden och översikt granskade. Den första privata promenaden var för kort vid befintlig gånghastighet; provtiden förlängdes, utan produktändring.

Det tidigare geografiska återkomstfelet vid ankare 14 (punkten cirka 7,8 cm innanför gångspärren) rättades i #91: `waterRescue` stegar nu ut längs åns normal tills punkten ligger minst 0,15 m utanför gångspärren (bredd/2 + `WALK.wade`) för närmaste åsegment, och profilprovet har inget undantag längre.


## Vinterskjul i hagen, #92

Importerad från `24e72f89` och `8cd6788` (original #1345): `src/shelterwinter.js` (halm på marken inne i skjulet, girlang längs frontbalken och 16 varma lampor i två sammanfogade nät, 3 362 trianglar), enbart `PADDOCK.shelter.winter` i `src/config.js` och två små krokar i `src/paddock.js` (bygg efter skjulet, synlig bara i snömånaderna och inom hagens ritavstånd, samma culling som ponnyerna). Inga extra ljuskällor, texturer, skuggor eller kollision; skjulets placering och ponnyernas vinterplats är oförändrade. Originalets heldagscykel/nattläge, tester (`shelterwintertest.cjs`), ändringslogg och dokumentation har inte importerats; den här visningen har ingen dygnscykel, så natt kan inte testas.

Verifiering: `npm test`, `npm run build`, Chromium (`?month=1` och `?month=7`): vinter 2 nät/+2 ritanrop, sommar dolt, dolt på långt avstånd; bilder nära/långt bort; ny kontroll i `tools/paddock-check.mjs`.


## Statiska dörrskyltars telefonminne, #93

Granskad källa: original `2ab388fca76e6a223406127f361e961ccecb0926` (#1359). Enbart användningen av befintliga `freeCanvasAfterUpload` för den gemensamma statiska atlasen i `core.buildFlatDoors` har förts över. Samma byggare används av hus A/B/C/L. Ingen import av originalets main, config, spegelstyrning, personliga data, spel eller tjänster.

Den publika visningen saknar originalets512px-uploadtak och adaptiva spegelmål. Den verkliga telefonprofilen här visar maxTextureSize8192 och initial CPU-canvas60512192byte (57,7MiB), avsevärt mindre än originalets. Ett nytt512px-tak skulle därför sänka publik skyltkvalitet. Originalets tidiga nedskalning och spegeländring överförs inte; full GPU-upplösning bevaras och befintliga dynamiska hissdisplayer kan ritas om.

De fyra faktiska atlaserna är1024×384(L),1024×776(A),1024×584(B),1024×1352(C): totalt12681216byte CPU-källbitmap. Komponentprovet laddar upp varje verklig atlas och jämför referens- och kandidatpixlar i WebGL: största skillnad0 för alla fyra, med oförändrade dimensioner på GPU. Telefonens fyra CPU-bitmappar blir totalt16byte efter första uppladdningen, datorns behåller12681216byte. Denna möjliga besparing på12,09MiB uppstår först när alla atlaser har visats/laddats upp; dolda oanvända atlaser behåller full upplösning.

Den faktiska källvisningens rutt område→trapphus→L1007→L1004→L1201→hage visade bara uppladdad L-atlas: före59015184byte CPU-canvas, efter57442324 (1,5MiB mindre). Ingen minskning vid start innan atlasen syns. Matchande GPU-texturallokering vid L1201 är34306116byte både före/efter; datorns CPU-canvas67609628byte är oförändrad. Enstaka automatiska bildrutor i den långsamma SwiftShader-rutten samplas asynkront och används inte som exakt ritanrops- eller FPS-jämförelse. Komponentprovet isolerar bild- och atlasbeteendet.

Verifiering: `tools/staticcanvas-check.cjs`10/10PASS, CLI0, före/efterbilder öppnade; dynamiska labels kan ändras efter upload. Den verkliga mobilvisningen testades med native WEBGL_lose_context: exakt en omladdning, samma position[2.8,0,1.4], aktiv visning återupptagen; andra återställningen inom60s visar den befintliga manuella omladdningsrutan utan loop. Inga JavaScriptfel eller externa anrop; originalets lagringsmarkörer oförändrade. Den byggda visningen (`ec2ad3ea8453d4a91d096337`) har samma telefonbesparing och atlaspolicy, utan JavaScriptfel/externa anrop och med ursprungliga lagringsmarkörer kvar; byggbilder öppnade. `npm test` granskar80moduler och bygget passerar. Detta är Chromium-emulering, ingen fysisk iPhone- eller kraschfrihetsgaranti.


## Flodsökning och kollisionsnärhet, #94

Granskad källa: `ba5db2f9ad167ee69c68a5be85b209e5c6c5a648` (original#1358), jämförd med publik baslinje `0afb8bd05853e4bda079717d3d527a238bf82a3d`. Den publika appen hade samma upprepade `riverAt`-skanning efter fallprofilen#90. Scanningen bygger nu inte nya mellanposter för varje närmare segment; efteråt beräknas den vinnande posten och senaste identiska punkt återanvänder sitt svar. De granskade anroparna läser posterna utan att ändra dem; flodkoordinaterna är statiska. Alla numeriska resultat och första vinnaren vid lika avstånd bevaras.

Originalets Player, cykel, isFree, spel och Cloudflare kopieras inte. Den publika Navigation har en motsvarande kostnad i `pushOut`: avlägsna segment avvisas med samma konservativa radieomslutande rektangelprincip. För närliggande segment körs originalets exakta avstånd och förflyttning. Fasta/rörliga segment itereras i samma ordning utan att kopieras till en stor kombinerad lista för varje delsteg, även i trappans extra väggpass. Inga kollisionsmått eller modeller ändras.

Differentialprov:20 000 flodposter inklusive ankare/mittpunkter/upprepade punkter och 20 000 exakta kollisionsbeslut/slutpositioner passerar (131 verkliga kontakter). Antalet Math.hypot i kollisionsmängden minskar15 587→715. Sju uppvärmda par på denna Node-värd gav medianer:

| Kontroll | Före | Efter |
| --- | ---: | ---: |
|20 000 olika flodpunkter |34,47ms |24,74ms |
|Samma punkt tre gånger per flodpunkt |101,71ms |25,36ms |
|20 000 kollisionsfall |1,28ms |0,75ms |

Det är avgränsade CPU-mätningar, ingen fysisk mobil-FPS. Fulla Chromium-gångprovet passerar24/24 både före/efter, med byteidentisk textutdata inklusive samtliga slutpositioner, underfarter, broar, vattenåterkomst, kanter och skolområdet. Total process22,35→19,92s inklusive webbläsarstart, värld och bilder; detta är inte en isolerad bildrutetid.

`npm test` (80moduler), bygge och den byggda appens `browser-check.mjs` passerar. Dator/mobil, gång/dörrar/mätning och faktisk touchinmatning fungerar, inga JavaScriptfel eller externa anrop, originalets lagringsmarkörer kvar. Före/efterbilder vid å/underfart och byggbilder hemma/på mobil har öppnats. Byggversion `600987ebc190ba95670396cb`; ingen ny resurs, tjänst, lagring, personlig kod eller spelkod.


## Fasta lampor vid parkstråken, #95

Granskad källa: `e6f5ce4e20b319e864e42be487820ffb09319171` (original#1363). Överfört enbart den rena placeringsmodulen `src/pathlamps.js`, `PATH_LIGHTS` i config, de avgränsade street.js-instans-/skenändringarna och callbacks till `renderedTerrainY`/`treeFeet` i surroundings.js. De tre befintliga lampbatcherna delas. Originalets Player, main, dygnscykel, tidskontroller, personligt innehåll, spel och Cloudflare har inte importerats. Configblocket är oförändrat. Den publika placeringsmodulen har dessutom en riktad anpassning: befintliga parkFillFootprint håller stolparna utanför träbrons hela jordramp, efter att en verklig marktriangelkontroll hittade en2,215m begravd fot i första importen (originaluppföljning#1378). Inga nya mått behövs; samma befintliga frigång används. beroendena använder publicsidans befintliga flod- och haggeometri. Dess bredare hagstaket skyddas genom det lokala outline-värdet.

Elva redan kartlagda OSM-stråk ger 40 stolpar före trädinput efter rampundantaget (källversionen gav41). Placering,4,6m höjd,18m mellanrum och övriga avstånd är antaganden. Algoritmen provar andra sidan när korsning, byggnad, träd, vatten, bro eller hage upptar första sidan; alla gångstråk hålls fria. Stolpar och ljusfläckarnas hörn följer verklig terräng, gamla väglampor behåller exakt sina matriser och ljusmesh-prefix. Inga nya ljuskällor/materialbatcher eller texturer.

Publicsidan förblir i dagsljus: stolparna syns som fasta miljöobjekt med släckta huvuden/markljus. Befintlig generisk street.update(night) bevaras utan nytt användarnattläge. Node3/3 och WebGL-komponent8/8 passerar: samma22dag/24natt-ritanrop som baslinjen när batcherna redan är synliga, +8000dag/+22400natt-trianglar, markavvikelse under1µm i lutande komponent och byteidentiska gamla väglampor. Nattkontrollen tvingar komponentens befintliga update, inte appens dygnscykel. `npm test` granskar81moduler och bygget passerar (`23b4575086f004bdddba7c09`).

Den byggda riktiga visningen kontrollerades i Chromium vid1000×700 och390×844. Alla40 nya stolpfötter stämmer med faktiskt ritade site-terrain-trianglar (max0,000000371m); en1,20m promenad längs parkstråket har ändliga positioner. Släckta huvuden och dolt markljus i appens dagsljus, inga JavaScriptfel/externa anrop och originalets lagringsmarkörer kvar i båda profilerna. Park-/hagebilder för dator/mobil och komponentbilder öppnade. Ingen fysisk telefonprestanda påstås.


## Föräldratak för delärendens prioritet, #101

Granskad källa: original `d6455555394e870aab1b464513d3816475f7871b`
([originalärende #1394](https://github.com/solwation/lunden-3d-apartment/issues/1394)).
Enbart den neutrala workflowregeln i `CLAUDE.md` och `.claude/commands/orkester.md` har anpassats.
Delärenden ärver normalt förälderns prioritet, får ligga lägre och får aldrig överstiga någon förälder i kedjan,
även när de är buggar. Agenter rättar för höga barnprioriteter vid skapande, ändrat föräldraskap/omprioritering
och före köval. Redan lägre prioritet och aktivt ägarskap bevaras.

Backloggranskningen omfattade båda repornas hela öppna köer, GitHubs föräldrafält samt titlar, body och
kommentarer. Tio öppna delärenden med dokumenterat föräldraskap hittades; inget låg över sitt föräldratak.
Överföringslänkar, beroenden och överlappande önskemål behandlas inte automatiskt som föräldraskap.
Ingen appkod, resurs, lagring, personlig information, spelkod eller tjänsteintegration har importerats.
Verifiering: `git diff --check`, `npm test` och `npm run build`; ändringen påverkar enbart arbetsinstruktioner.


## Vindskydd närmare staketet, #102

Granskad källa: `bcd8c24655cf87244df9b8d405db678c8e94b6c2` (original#1395).
Selektiv import av den rena `relocateShelter`-funktionen och dess geometriimport i
`src/paddockshelter.js`, `PADDOCK.shelter.cornerClear/move` i config samt det lilla
placeringsblocket i `src/paddock.js`. Inga hela originalfiler har ersatt publika filer.
Två riktade nativeprov har anpassats till denna visnings markfunktioner. Ingen terräng,
modellstorlek, stödbyggare, vinterdekor, väderregel eller offentlig navigationspolicy ändras.
Personliga interaktioner, namn, hjärtan, poäng, ljud, bilder och tjänster har inte importerats.

Förskjutningen11,5m österut/1m norrut och rotationen−30° om skjulets mitt är antaganden.
Skjul och ho behåller inbördes avstånd och orientering. Befintligt0,2m-relieftak,
8m-centrummarginal och 2,5m-hörnmarginal bevaras. Hela hon ska ha1,5m passage till
staketet och ligga inom befintlig0,3m-relieftolerans. Förslaget används bara när den
faktiska marken och befintlig träd-/åfrigång godkänner båda; annars behålls gamla platsen.

Den riktiga publika solverns föreframe är skjul(-137,603305;229,098505; yaw1,869295)
och ho(-125;230; yaw3,927339). Efter: skjul(-126,103305;228,098505; yaw1,345696)
och ho(-115,639270;235,180875; yaw3,403740). Närmaste staketavstånd minskar
15,442756→9,365019m; publicsidans faktiska relief är0,098983→0,142796m.
Grind och stätta är oförändrade. Nuvarande publicmark accepterar alltså förslaget
utan den separata höjdimporten#98; gemensamma filer innebär inget hårt beroende.

Verifierat: `npm test` granskar81moduler, `npm run build` passerar och nativeprovet
är10/10. Hela `tools/paddock-check.mjs` passerar, inklusive regn/torrfördröjning,
synliga fullstora vinterponnyer utan försvinnande, sommar, culling/återkomst, fysisk
staket-/grindstopp och hållen W över stättan (1,12m). Befintliga budgetar behålls:
staket8330tri<12000, ponny540tri<700, vinterdekor3362tri<3500 i två nät och
8509grästuvor/34036tri<50000 med ett gräsritanrop. Före/efterbilder från grind,
front och ovanifrån har öppnats och granskats av dirigenten. Grindvyn är36ritanrop/
230154tri både före/efter; front-/ovanifrånvyer följer det flyttade objektet och får
andra bildfält, så de är inte ett isolerat prestandamått. Inga JavaScriptfel/externa
anrop; originalets lagringsmarkörer kvar. Första privata bildförsöket fick timeout
vid startklickets navigationsväntan; loopen pausades efter verklig World-init före
omtaget som passerade. Chromium-emulering, ingen fysisk telefonmätning.

Den färdiga byggnaden `472a42eed594b78b53319fb2` har också kontrollerats i riktig
Chromium: samma nya placeringsram, två fullstora modeller på rätt vinterplatser,
3362dekortrianglar/två nät, inga interaktionsmedlemmar, inga JavaScriptfel eller
externa anrop och oförändrade markörer i originalets lagring. Byggbilden öppnad.


## Vintertäcken till miljöponnyerna, #103

Granskad källa: `90d1632c17fa66ceb0e29e99c65c145fac2fa0aa` (original#1397).
Importerat enbart den nya neutrala modulen `src/ponyblanket.js`, det avgränsade
`PADDOCK.blanket`-blocket och en import/ctorkrok i publicsidans `src/paddock.js`.
Befintlig publik ponnymodell, mark, skjulram och navigations-/väderbeteenden bevaras.
Originalets personliga ponnyer, klappning, hjärtan, poäng, ljud och matning har inte
importerats; inga bilder, nya resurser, lagringsnycklar eller tjänster tillkommer.

Täcket är en enkel öppen drapering över den befintliga stela bålen,70trianglar per
täcke i ett enda tvåinstansnät. Blå/burgundyfärg, sex tvärsnitt,2,5cm frigång och
70cm fållhöjd i modellens befintliga1,32m-lokalram är antaganden. Det är inget
klädsystem eller tygsimulering. Huvud, hals, ben och svans är fria att animeras.
Nätet delar kroppens faktiska `instanceMatrix`-buffer och är dess barn med samma
bounds; flytt/rotation/skala behöver ingen duplicerad uppdateringslogik. Samma
snömånader styr synlighet, och parent-/distans-/frustumculling bevaras. Inga nya
ljuskällor, texturer, skuggkastare eller raycast. Ingen höjdimport#98 behövs för
att följa den redan byggda kroppen.

Anpassning: källhänvisning i kommentarer, neutralt nativeprov och ett eget publikt
`tools/ponyblanket-check.mjs`. Originalets klapp-/poäng-/matningsprov har inte
kopierats. Den publika browserkontrollen använder verkliga vinterbeslut/gång från
giltiga befintliga waypoints, granskar båda färgerna från fria vinklar och i stallet,
sommar/culling/återkomst samt saknade personliga interaktions-/matningsmedlemmar.
Originalets separata vinterstartbudgetavvikelse#1404 överförs inte som en tillåten
budgetavvikelse här; den publika visningen mäts för sig med oförändrade gränser.

Verifierat: native3/3, `npm test` granskar82moduler och bygget passerar
(`017b54c83c8396d5c9a5df37`). Riktigt publikt browserprov6/6ALLPASS/CLI0:
fryst vintervy47→48anrop och 258622→258762trianglar, alltså exakt+1/+140.
Sommaren, dold parent och långt avstånd ger0täckanrop; återkomst ger1 med samma
buffer/material. Faktisk vintergång0,68m/benamplitud0,492; inga personliga
interaktions-/matningsmedlemmar, inga JavaScriptfel/externa anrop och originalets
lagringsmarkörer kvar. Båda sidofärgerna, bebott vinterstall och sommarbild är
öppnade och granskade av dirigenten. Chromium-emulering, ingen fysisk telefon-FPS.

Den färdiga publika byggnaden har dessutom kontrollerats på390×844touchprofil:
båda vinterponnyerna står i rätt stall med faktisk instansskala0,99999997 och
exakt delad täckmatris. Täcke av/på ger31→32anrop/203522→203662tri, fortsatt
exakt+1/+140. Inga personliga interaktions-/matningsmedlemmar, JavaScriptfel,
externa anrop eller ändrade originalmarkörer; byggd mobilbild öppnad.


## Lampor längs fler kartlagda vägar, #96

Granskad källa: `15f9b00569e194bfcc4382fa66955b974dbcc134` (original#1371).
Selektivt överfört `src/roadlamps.js`, enbart `ROAD_LIGHTS` i config och de små
instans-/poolkrokarna i `street.js`. Publicsidans #95, inklusive brojordrampens
placeringsskydd och callback till faktiskt ritad terräng, är bevarad. Inga hela
blandade källfiler, main, personliga resurser, spel, dygnscykel eller tjänster
importeras. Ingen terrängändring eller konkret höjdimport#98 krävs.

Kartlagda vägmittlinjer ger antagna kompletterande stolpplatser i fem regioner:
lokalvägarna Sankt Lars väg/Karpvägen samt väster/norr/öster/söder. Höjd6,2m,
32m steg,0,65m kantavstånd, frigångar och skenets form är visuella antaganden,
inte inmätta armaturer eller byggfakta. Algoritmen undviker kör-/gångbanor,
hållplats, byggnader, träd, vatten, brodäck, hagstaket och parkeringspolygoner
och provar motsatt sida. Den befintliga publika jordrampen innehåller inga
vägstolpkandidater; inget nytt terräng- eller rampingrepp har behövts.

Stolpar, huvuden och ljusfläckar delar de tre befintliga batcherna. Tidigare väg-
och parkstolpars matriser och ljusfläckarnas vertexprefix är byteidentiska.
Visningen är fortsatt dagsljus med släckta huvuden/dolda markfläckar; bara den
befintliga komponentens generiska nattstyrning testas, inget nytt nattläge.

Publik importanpassning: två nya kandidater söder om terrängnätet skulle med
källans klampade terrängcallback sväva0,47044m respektive0,13605m över befintlig
`south-land`. Endast nya väginstanser och deras poolhörn använder därför
`roadLampGround`: utanför `SITE.backgroundGround.z1` samplas samma befintliga
parkplan (`SITE.terrain.park - .01`, exakt−3,01m) som southbackdrop. Inga gamla
instanser/prefix eller markmeshar ändras. Gränsen följer config även vid framtida
höjdimport. Det första markprovet och de båda felkandidaterna är bevarade i
`browser-before-ground-adaptation.log`; den första loggen använde också ett
felaktigt lånat originaltak och enbart huvudterrängen. Public har inget generellt
dokumenterat370-anropstak; relevanta kontroller är oförändrade batcher,
komponentens22dag/24natt-anrop och <50000extra natttrianglar från källkravet.

Verifiering: native8/8, komponent8/8, npm83moduler och byggPASS. Full publik
World11/11 per desktop/mobilprofil, inga JS-fel/externa anrop och orörd
originallagring.130nya/179totala stolpar i befintliga22barn, fördelat21/3/22/28/56
på lokal/väst/nord/öst/syd. Gamla matriser/poolprefix byteidentiska. Samtliga130
fötter följer ritad mark inom2,45µm;520pool-extremahörn inom3,48µm. Komponentens
anrop22dag/24natt är oförändrade, +26000dag/+41600natt-trianglar. Se fulla
kamerdeltan och bevarade misslyckade försök i `docs/verification.md`.

Byggd faktisk mobilvisning390×844 PASS med179instanser/130nya, samma22barn,
fast dagsljus, alla34sydfötter på−3,01m, inga JS-fel/externa anrop och orörd
originallagring. Fri östbild visar vägkantens stolpe/fot.0nya batcher; yttervyer
kan få+2anrop från den befintliga batchens utvidgade bounds.

## Täta sidokanter vid träbrons jordramper, #107

Selektiv överföring från originalcommit `b76f6ee1e38932e12d121b5fd3b532f13f1b1a82`
(original #1389), ovanpå denna repos befintliga ramp #86 (original #1337/#1338).
`parkRampFill` i `src/riverpark.js` lägger bara till de exponerade, utåtvända
sidoytorna. Deras överkant följer den gamla rampen exakt och nederkanten följer
`renderedTerrainY`, som avläser de faktiskt emitterade terrängtrianglarna.
Skärningar vid rampknäck, terrängrutornas linjer, åkorridorens finrutor och
triangeldiagonaler håller nederkanten tät även där terrängen byter plan. De nya
sidornas texturkoordinater använder meter längs kanten och verklig höjd i stället
för horisontell planprojektion. `surroundings.js` lämnar rutnätets befintliga
`terrainSubdivisions` till rampen och slår ihop den i samma `site-terrain`.

Publicsidans egna rampmått, `−0,01 m` gräslyft, höjddata och terrängstöd är
bevarade. Samtidiga #105 ändrar sydligare terrängstöd men är ingen
funktionsförutsättning för detta broarbete; dess nya block måste bevaras vid
rebase. Hus A/B/C/L delar inte denna specifika rampgeometri. Brodäck, gångmark,
lampornas stöd, åfåra och fri vattenpassage under bron ändras inte. Inga
personliga resurser, spelinslag, ändringsloggar eller Cloudflare-delar har
importerats; marknivåerna är fortfarande visuella antaganden.

Verifiering: `npm test` (83 moduler), `npm run build`, `tools/browser-check.mjs`
mot `dist/` på dator och mobil (gång/dörrar/lagring/nätverk),
`tools/bridge-ramp-check.mjs` mot källservern (oförändrade toppositioner och
normaler, 8/8 verkliga sidorayträffar, största nederkantssöm 0,0000071 m,
vattenmesh kvar under bron), `tools/farwalk-check.mjs` (båda gångriktningarna)
och `node --test tools/pathlampstest.mjs` (3/3). Fem parade Chromiumvyer från
båda landfästena och under bron togs med kamera på faktisk gångmark +1,62 m:
öppna kanter täcks, utan sidfel eller externa anrop. Terrängmeshen har 71 474→
71 690 trianglar och +22 032 bufferbyte med fortsatt en mesh, ett material och
samma ritanrop per parad vy. Inga budgetgränser höjs.

## Tomma vinterkronor, #104

Selektiv överföring från originalcommit `b1568524d899704da443d18d1e8eae81490c6a72`
(original #1404). Public-baslinjen är `c4bae878:src/seasons.js`; originalets
före-hash används inte i detta repos rena historik. I `applySeason` döljs enbart
de redan registrerade lövkronorna när deras befintliga lövfaktor är noll, och de
visas igen vid positiv faktor. Registreringen omfattar 18 trädceller, en sydlig
kronbatch och gårdens klängväxt. Instansmatriser, färger, buffertar, geometri,
objekt och säsongens övriga material räknas som förut. Ingen terräng, modellform,
budget, personlig resurs, spelmekanik eller tjänsteintegration har importerats.

Det anpassade nativeprovet jämför alla månader mot den faktiska frysta
public-modulen, inklusive redan beräknade bounds, raycast och vårens/sommarens
återkomst. World-provet börjar också i verklig vinter. Three.js beräknar bounds
för klängväxten och den sydliga batchen först när de faktiskt syns; de är därför
`null` på den nya vinterstarten och beräknas vid första vår-/sommarrenderingen.
Det är renderarens befintliga lata beräkning, ingen ändring av bounds i
`applySeason`. Trädcellerna har förberäknade bounds och är exakt lika. I tre
matchade vyer är ritdeltat exakt antalet tidigare ritade säsongsbatcher; mars och
juli är identiska med baslinjen. Se [verifieringen](verification.md#tomma-vinterkronor-104).

## Södra GLO-platåns ritade mark, #105 (del av #98)

Selektivt importerad från `03d4c5201004540769c51cf62b7272f0a2c3caaf`:
`data/elevation.json` och genererad `src/elevationgrid.js` (46→67 rader,59 kolumner).
Alla befintliga46 rader i både ytmodell `h` och bearbetad mark `g` är exakt bevarade.
Från `662f1030389006d785a633352f5856f06e11fd21` är endast mark-/plattformstrukturen,
den utökade ritgränsen och nödvändig projektion av befintlig beläggning tillämpade i
små block i config/elevation/surroundings/southbackdrop/main. Ingen hel main/config-import.

Terrängen ritas till z460 med8m rader efter gamla260; tidigare nordliga rader kvarstår.
Byggnadsplattformarna följer den nya marken. Den gamla46-raders samplern, dess kantklamp
vid z250 och dess plattformsmedelvärden används separat norr om övergången225..240;
utan separat klamp kan utökade grannvärden indirekt ändra gamla plattformar.
Hage, träd och markskuggor använder samma dynamiska ritgräns. Navigation/farwalk behöver
ingen ändring eftersom de redan läser groundY; befintliga gånggränser, broprofiler och
stätta bevaras. Hårdytornas befintliga konturer är oförändrade; asfalt/linjer skärs längs
samma marktrianglar för att undvika sjunkna mittpunkter och falska uppstickande kanter.
Detta ändrar inte parkeringsplanen eller levererar #100.

Källa: Copernicus DEM GLO-30, bearbetad ytmodell, attribution "Contains modified
Copernicus data" enligt THIRD_PARTY_LICENSES.txt. Exportens befintliga refAbsM14.75
bevaras som relativ modellreferens, inte inmätt lägenhetsgolv. Horisontell registrering
är cirka3–5m; interpolation, mark under vegetation och plattformar är antaganden.
Den separata LM-exportens77 punkter och dess14.36RH2000-origin importeras först i #106;
de är inte ådjup. Ingen ny höjd-API-användning, originalets lagring, personligt innehåll,
spel eller Cloudflare har införts. Public#96:s roadlamps/street-block är bevarade.

Verifiering och verkliga före/efterbilder: se docs/verification.md, #105. Föräldern #98
förblir öppen för LM-förfiningen #106 och den avskilda parkeringsdelen #100.

Den riktiga ovanifrånbilden avslöjade dessutom att de gamla långa spårkvadrerna
bara samplade hörn och fältet använde6m-trianglar oberoende av terrängveck.
Bortom gamla z260 sjönk43 spårmittpunkter upp till0,143190m och1215 fältmittpunkter
upp till0,128943m under den nya ritade marken. Dessa värden dokumenterades före sessionskraschen; de gamla temporära råfilerna finns inte kvar. Därför klipps exakt samma hagespår
(lift70mm) och hagefält (lift48mm) mot terrängens diagonaler. Övriga fält behåller
sina gamla trianglar norr om225; bara trianglar som berör den södra övergången
projiceras där. Inga andra nordliga fält förfinas och ingen batch tillkommer.
Äldre globala maxfel0,748277m/0,189239m fanns redan i före-världen och behålls i
den tidigare dokumentationen; de ska inte beskrivas som helt nytillkomna sydfel. Originalets nuvarande
hörn-/fältalgoritm är likadan, men dess egen mark har inte separat körts i denna import.
Hus A/B/C/L:s data och byggblock är oförändrade; bevarad nordmark och npm:s
arkitektur-/planprov täcker den tillämpliga kontrollen av motsvarande hus.

En första grov-grid-kandidat var otillräcklig: åkorridorens terräng har lokala
undertrianglar som inte ingår i den äldre grid()-beskrivningen. Faktiska mittpunkter
avslöjade kvarvarande10,13/30,29cm sydinträngning (historiskt registrerad exit1). Den slutliga
lokala surfaceGrid()-kroken beskriver befintliga utsända cellunderindelningar;
cutAtTerrain använder dem bara när just detta detaljgrid uttryckligen skickas in.
Hagespår/berörda fält använder det. Befintliga road-/parkerings-/nordkonsumenter
fortsätter med sitt gamla grid, och själva markens trianglar ändras inte av denna krok.

Parkeringslinjer och kantens ursprungliga24mm-lyft bevaras, även där de döljs av asfaltens52mm-lyft. Den felaktiga kapacitetsindelningen görs inte synlig inför separat #100.


## Konservativ takocklusion för pergolalampor, #108

Importerad från `f3fb127a97120dd4bb42da0c4e756179b034d5ff` (original #1387): `CeilingBatchGate` i nya `src/ceilingbatchgate.js` och kopplingen `courtyard-pergola-bulbs` i `src/courtyard.js`. Originalets `occlusion.js`/`PERF` finns inte här, så enbart helbox-testet och dess 5 mm marginal ingår lokalt; växtvind-hanteringen utelämnades (inga vindattribut på lamporna). Originalets `terracedecor.js`, privata terrassmodeller och dokumentation har inte importerats. Inga budgetar, geometrier eller avståndsgränser ändras; skuggor och per-kamera-återställning bevaras. Komponentprov använder strålar med layer0|7; publicappens visuella mätning/interaktion använder layer0, vilket granskas separat i #115.

Historisk provbegränsning i #108: lampbatchen (272 instanser) spänner cirka 50 × 29 m; dåvarande prov rapporterade oförändrade ritanrop. Detta bevisar inte att gaten aldrig döljer batchen: testet projicerar boxens hörn från kameran, så världsboxens bredd behöver inte rymmas i takrektangeln. #115:s verkliga före-prov visar layer7 i både källar- och hallvyn redan för hela batchen. Provet `tools/ceilingbatchtest.mjs` bevisar dolt läge, öppningar, kantvyer och återställning med ett batch som ryms under en rektangel; A/B/C/L-hålen granskas via den gemensamma `GARAGE.rects`.

Verifiering: `npm test`, `npm run build`, `node --test tools/ceilingbatchtest.mjs` (5/5) och `tools/ceilingbatch-check.mjs` (dator + mobil, Chromium, inga fel).

## Fönster på södra lågbyggnader, #111

Importerad från `b64720138a65f210a6f923044d7f1458931e462f` (original #1418): `src/southwindows.js`, `SITE.south.lowRiseWindows` i `config.js` och anslutningen i `southbackdrop.js` (480 rutor/960 trianglar efter befintlig glasgeometri). 39 adresserade huvudbyggnader får enkla fönster längs långsidorna; sju osäkert klassade byggnader, gavlar och specialfasaden förblir blanka. Alla fasaddetaljer är visuella antaganden. Originalets bussasfalt, spelprov och ändringslogg har inte importerats.

Begränsning: enhetstestet `tools/southwindowstest.mjs` kontrollerar inte OSM-adresser, eftersom originalets OSM-snapshot inte finns här.

Verifiering: `npm test`, bygg, `node --test tools/southwindowstest.mjs` (3/3) och Chromium-bilder nära/ovanifrån på dator och mobil (844×390) utan sidfel.

## Golv på A/B:s norra uteplatser, #112

Importerad från `b58d0d7ef57223688de376249aa7442816b55ad0` (original #1428): `raisedLoggiaFloors` i `groundY` och golvplanet vid solida hörn i `src/surroundings.js`. Originalets README, ändringslogg och miljödokument har inte importerats. Södra A/B, Hus C och L berörs inte (samma `kind === 'ground'`-villkor, oförändrad data).

Verifiering: `tools/loggiafloor-check.mjs` (Chromium, dator + mobil) visar `groundY` = 0 i alla fyra A/B-nordloggior (före fixen −3) utan sidfel. Begränsning: skärmdumparna visar inte golvet tydligt; golvet styrs av geometri/`groundY`, ej granskat i riktig `Player`-körning.

## Lokala LM-markpunkter och ankrade apronplan, #106 (del av #98)

Selektiv granskning av original `03d4c5201004540769c51cf62b7272f0a2c3caaf` och
`662f1030389006d785a633352f5856f06e11fd21`: enbart `SOUTH_PLATEAU`,
`southPointGround` och den ankrade plattformsförfiningen i `surroundings.js`, samt
byteidentisk `docs/references/elevation-hoje-a/point-api-south-road-2026-10-19.json`
från den senare committen. Ingen hel config/main eller originalhistorik kopierades.
77 arkiverade kart-api-svar anger Lantmäteriet Markhöjdmodell, RH2000, CC BY4.0;
attribution och begränsningar bevaras även i THIRD_PARTY_LICENSES.txt. Tio torra
markpunkter söder om225m används, relativa till exportens14,36m-origin. GLO-exportens
refAbsM14,75 och gamla46-radersklamp är oförändrade; datumen blandas inte i exporten.

Radius35m, fade225..240m, ankarsökning3m och plan apron4m är antaganden.
Sankt Lars väg41/45 får lokalt förankrade plattformar. Höjderna modifierar den kompletta
befintliga markmodellen inklusive dess åblandning. De är inte inmätt bostadsgolv,
aktuellt vattenstånd eller bathymetri; registreringen är ungefär3–5m.
Publicsidans gånggränser, broar, nordens50 232 Float32-positioner, hage och dess
eget stöd behålls. Ingen rutnäts-/parkeringsplanändring ingår; #100 och #99 är separata,
och föräldern#98 förblir öppen. Byggnadsbaserna använder fortfarande faktiskt ritad mark,
medan deras plana markunderlag använder den gemensamma mjuka höjdmodellen.

Nativeprov för export, referenser, lokal fade, skilda samplers och apronkanter samt
riktig dator/mobil-World dokumenteras i docs/verification.md. Inga privata resurser,
spel, Cloudflare, lagringsnycklar, API-anrop under körning eller nya beroenden införs.

## Södra vägbanken och gångcykelbrons anslutningar, #99

Källa: original `a0c66ef68ee78dcae68f5c3dd0aeb1a5d7bd59bc` (original#1382).
Selektiv import av den neutrala `src/southbank.js`, enbart `SOUTH_BANK` i config,
markkoppling i surroundings och approachGround-callbacken i riverbridge. Inga hela
config/main, privata filer, historik, personliga resurser, spel eller Cloudflare-delar.
Elva vägmittlinjepunkter och fem separata tvärsektioner (50sidpunkter) matchar exakt
den redan importerade77-punktsexportens markhöjder minus14,36RH2000. Den har kvar
sin Lantmäteriet/CC BY4.0-attribution. Punkterna mäter mark och inte brobanan;
befintlig däckhöjd−3m är uttryckligen ett antagande, inte en LM-mätning.

Krönets plana halvbredd4m, flanktoning15m, broanslutning147..152m, smalare
förlängning till platån och fade262..286m är interpolationsantaganden. Horisontell
registrering cirka3–5m. Samma höjdfunktion används av gång och terräng, medan
den ritade triangelytan behåller sitt befintliga approximativa rutnät. GC-asfaltens
anslutningar använder samma max(gångmark, ritad mark) som övrig publik väg.
Betong, stål, vatten, brodäckens datum och träbron är oförändrade.

Publik anpassning: källans yttre bank-overlay efter plattformssteget skulle sänka
delar av41:s redan ankrade norra husfot upp till0,211755m. Banken appliceras därför
före den befintliga plattformsutjämningen, på både legacy- och nya råsamplern;
plattformarnas nivåer och konstruktion ändras inte. Kartlagda grenens förlängning
berör41:s apron efter262m; där behålls byggnadsplanet1,83m framför den antagna
bankförlängningen. Alla källans fullt applicerade vägmittlinjekontroller och tio
LM-platåreferenser bevaras exakt, liksom #106:s fotkanter och 2m-apronprober.
Det är en redovisad geometrisk modellanpassning, ingen ny inmätning.

Banken ändrar avsiktligt delar av147..286m, inklusive bankmark norr om225m.
Det äldre hela nordhashkravet från105/106 gäller därför den historiska världen;
bytebevarande verifieras nu utanför bankens källbundna stöd och de berörda
terrängcellernas kantinterpolation. Ingen parkeringskontur eller kapacitetsplan
ändras, och inga gånggränser eller globala budgetar höjs. #100 återstår; #98 hålls öppet.
Se docs/verification.md för prov, bilder, faktisk gång och kostnadsjämförelser.

Den höjda banken kräver också befintliga fintrianglar för beläggningen. Endast
vägceller som berör bankens längd och konservativa sidostöd använder samma redan
emitterade `surfaceGrid`-underindelning via `roadGround.grid`. Ett likvärdigt
rendered-height-callback för southBackdropParts lämnar samma lokala grid till den
då felidentifierade publika GC-asfaltvägen145221590. Hörnprov ensamma missade att marken stack3,94mm
över dess inre yta vid(31,297;154,664); faktisk pixelray gav rätt objektursprung.
Lokal fin-grid-klippning ensam lämnade13,89mm inträngning i GC-stråket. Därför
importeras även enbart den generiska7-raders `terrain: 'triangles'`-kroken från
original `9eb4ccfadfdf0ffd26ae7a20dfc1e3e50c22d1b8` (original#1432), selektivt i roads.js.
Bara de då felidentifierade publika GC-anslutningarna145221590/145221588 väljer den (lokala modellidentiteter från #133),
med hela det befintliga surfaceGrid som exakt klippunderlag för dessa två stråk.
Övriga stråk behåller det lokala bank-grid-valet. Inga
nya1432/116-vägar, terrängunderindelningar eller ändrade konturer importeras. Befintliga vita trottoarhack är separata#124 och ingår inte.

## Hållplatsens plattform på ritad terräng, #113

Selektivt importerad från original `397ce2652aca30e7a2787dbb48a3b227741ae98e`
(original#1429): endast `busStopStripGeometry`, dess import av befintlig `cutAtTerrain`
och de två tidigare strip-anropen i `src/busstop.js`. Nativeprovet för riktig vinklad
referensterräng, fotavtryck/lyft och fallback kommer från samma granskade källa.
Originalets main/config, privata resurser, gameplay, Cloudflare och changelog ingår inte.

Samma två rektanglar delas mot callbackens `surfaceGrid`, inklusive faktiska finceller.
`grid` används bara som fallback när `surfaceGrid` saknas; fristående callers utan
grid behåller den gamla1m-uppdelningen. Publicsidans riktiga World lämnar redan
`renderedTerrainY`, så ingen omgivnings-/mark-/navigationsändring behövs. Gränser,
3,6m-bredd,4cm-plattform/4,4cm-taktilyta, kerb, väderskydd/fast möblering, glas,
skyltar och kollision bevaras. #110:s markasfalt och #99:s bank/GC-ytor är byteoförändrade.

Den publika basen är `b81cc49a85dbf8b1f1c11994bc7497befd22fa83`. Egen faktisk
World visade6,593cm markintrång före ändringen; originalets6,093cm har inte återanvänts
som publik mätning. Native9/9 och faktiska dator/mobilprov beskrivs i docs/verification.md.
Käll-/måttosäkerheten är oförändrad; detta är yttessellering av befintlig modell,
ingen ny inmätning, parkering, grundnivå eller annan källa för offentliga väg-ID:n.

## Loggiaöppningarnas kollisionsintervall (#114)

Selektiv import från `14530bfe11fe8958068ed36f992feffd26c368ea` i originalet
(#1430): den rena hjälparen `src/segmentopenings.js`, dess nativeintervalltest och
kollisionsanropet i `src/surroundings.js`. Hjälparen subtraherar unionen av
kollineära öppningsintervall med exakt befintliga ändpunkter och segmentriktning.
Anropet kommer efter befintlig entré-/vestibulhantering. Endast A/B/C:s tolv
`groundWaysIn`-loggior berörs; hus L har kvar sin separata väg.

Publik bas: `ec420445b79f85076667b5aa6527cc373fecf5fd`. Ingen visuell geometri,
glas, bröstning, vägg, öppningsbredd eller mark-/golvhöjd importeras. #112:s
fyra norra A/B-golv används precis som levererade; ingen testgolvpatch eller
syntetisk support har lagts till. `tools/loggia-walk-check.mjs` är en publik
verifieringsanpassning som använder visningens riktiga `Navigation`, inte
originalets spelare. Källans måttantaganden ändras inte.

## Två kompletta pergolalampgrupper (#115)

Selektiv källa `426f9922f1dbf5e129af568af9cd2e09df352e57` (original #1438),
publik bas `13e3efe60b4cb6ff2798a4688a136199864e275c`: endast `bulbRanges`
och två kompletta grupper i `src/courtyard.js`. Samma sfärgeometri och samma
material delas;152+120instanser behåller samtliga272matriser i exakt tidigare
sammanlagd ordning. Ingen privat terrass, möblering, vindkod, spelkontroll eller
budget importeras. Befintlig #108-gate och dess5mm-marginal används oförändrade.

Takrektanglarna är exakt Garages gemensamma A/B/C/L-filter: `id!=='core'`,
`!core`, `!outside`, vid `GARAGE.ceiling`. Öppna trappkärnor och utvändiga
recesser fylls inte. En enda faktisk tät rektangel måste täcka alla åtta
projicerade boxhörn; flera olika rektanglar får inte kombineras. Båda lampgrupper
behåller sina fullständiga bounds inklusive sfärradie och sista tvärradens0,12m
z-förskjutning. Bounds är inte klippta eller artificiellt krympta.

`tools/ceilingbatch-check.mjs` granskar nu båda grupper i riktig publik World,
inte bara sista objektet med samma namn. Publicappen startar lamporna i dagläge;
dess befintliga `world.windowLights.update` kontrolleras också med natt och
strömavbrott, utan att lägga till något nytt dygns-/strömsystem. Fysiska0|7-
komponentstrålar skiljs från publicappens visuella layer0-strålar för mått och
interaktion; deras riktiga UI-väg provas separat. Ingen ray-policy ändras.

## Hela arkitektoniska terrassräcken (#118)

Selektiv källa `41447a8f7f3397f3e2553e6794fe578aef7a71bf` (original #1454),
publik bas `2b2b6b51753c3fb40ef1f2f2a0829bbd71100be4`: endast `src/exterior.js`
befintliga fasta `balc`-räcken. Gränser fångas i samma ursprungliga byggordning
per hel källterrass och de två hela gavlarna. Datorn får separata meshar med
ett delat ursprungligt material; `lowMemory`-telefoner använder exakt samma
`[balc]`-sammanslagning som tidigare. Inga nya portar/gates, avstånd, kvaliteter,
privata terrassdekorationer, möbler, vinddata eller spelberoenden importerades.

Vanliga Three-frustumsfärer gäller för varje kamera, inklusive skuggkameror.
Publicappen aktiverar inte skuggkartor; komponentprovet använder en vanlig
ortografisk kamera för att granska samma frustumregel och påstår ingen visuell
skuggjämförelse. A/B/C:s loggior byggs separat av `railPanel`/loggiabyggaren
i `src/surroundings.js`, med egna blockhörn, baser och våningar. Den koden och
dess faktiska geometri berörs inte; Hus L:s mått har inte kopierats dit.

`tools/terrace-rails-check.mjs` jämför riktiga före/efterbuffertar, fullständiga
telefonarrayer, material/bounds och positiva fysiska strålar. Testresponsen
exponerar enbart befintlig publik frame/klocka med fast steg och håller hagens
gräsdomänfrö konstant, enligt #115; ingen determinism tillkommer i produkten.
`tools/browser-check.mjs` får en valfri `MOBILE_UA` för att även prova den
ordinarie byggda appens verkliga Android/lowMemory-gren utan modulpatchar.

## Hela uteplatshäckar på dator (#119)

Selektiv källa `117851d7c2ed1cfefcef5dfbc52223d158b1e1d8` (original #1458),
publik bas `47eeb85f0d88290638bd0c6fc8b92f29ff34b8f9`. Endast submissionen
av `hedges` i `src/exterior.js` ändras: åtta redan genererade hela källgeometrier
var för sig på datorn, ursprunglig `[hedges]`-sammanslagning på `lowMemory`-
telefoner. Samma `patioHedgeGeometry`, material, shader och befintliga mått används.
#118:s räckesgrupper och deras geometri behålls. Inga personliga dekorationer,
nya cullers/gates, avstånd, kvalitetsregler, vindpolicy eller spelberoenden importeras.

Publicens egna åtta källor kommer från planens `site.hedge` och befintliga
`husLLayout`-förskjutningar. Den fysiska kollisionsrektangeln i `world.js` och
exteriors grannsegment är oförändrade. `surroundings.loggias` bygger A/B/C:s
separata plantor med egna blockhörn/baser: cylinder med radier 0,17/0,13 m och
höjd 0,38 m samt 0,34 m ikosaeder. Dessa plantor, `boxwood`-entréhäckar och
courtyard-planteringar har inte ersatts med Hus L:s häckmått eller submission.

`tools/patio-hedges-check.mjs` jämför samtliga faktiska position/normal/UV/color/
hedgeLow-arrayer med de åtta kanoniska publika källorna, per källa på dator och
ordnad sammanlagd telefonbuffert. Materialets befintliga shaderpatch/cachekey,
texturer och custom-depth/distance-status kontrolleras. Publicappen har inga
aktiva skuggkartor; normala perspektiv-/ortografiska frustumprov ersätter inga
påstådda visuella skuggpar. Riktig Navigation provar samma rektangulära kontakt
vid egen och grannes häck i båda riktningarna. Testresponsens fasta Date/steg
samt enbart hagens gräsdomänfrö följer #115/#118; produkten ändras inte för provet.

## Sammanhängande södra trottoaranslutningar (#124)

Egen publik rättning mot bas `d0ff7993234463f8de660a65fd9819c2a37dead6`,
ingen ny källimport. Den redan granskade `cutAtTerrain` från
`9eb4ccfadfdf0ffd26ae7a20dfc1e3e50c22d1b8` (#99) får ett lokalt
quad-predikat. Bara Sankt Lars vägs trottoarer mellan vägbrons södra ände
z=145,8 och vägens befintliga slut z=188,72 använder dessa triangelsnitt.
Det gör inte `max(groundY, renderedTerrainY)` analytiskt linjär mellan noder.

Parkens asfalt och GC-brons anslutningsstråk överlappade samma trottoaryta
med olika markapproximationer; ibland skilde ytorna mindre än 0,1 mm.
Den faktiskt emitterade trottoaren äger nu sin planprojektion. Befintlig
`polygonCutter` skär bort dess fotavtryck från parkasfalt, befintliga södra asfaltstråk och GC-anslutningar.
Både den lokala trottoaren och klippta anslutningar behåller befintliga delade
snittnoder på båda sidor om varje kant. En centerfan används bara när fler än
tre randnoder behövs; vanliga trianglar förblir en triangel. Centerhöjden är
medelvärdet av graderade randhöjder, inte ett nytt icke-linjärt markprov.
Klipprester avvisas med en precisionshärledd area-till-spännviddskontroll mot
Float32-koordinaternas faktiska upplösning; det är inte ett exakt test av
polygonens minsta bredd eller en ny kvalitetsinställning.

Ny kant ansluts till trottoarens faktiska trianglar. Övergången använder
skillnaden mellan trottoarkanten och respektive byggares befintliga gemensamma
stödsampler vid kanten: parkens renderedTerrainY +0,03 m, södra stråkens
renderedTerrainY +0,025 m och GC-anslutningens roadGround +0,025 m.
Den skillnaden förs över till samplern vid aktuell punkt och blandas med
den ursprungliga emitterade ytan över stråkets egen halva bredd. Ingen
triangelvis extrapolerad stödfunktion används. Vid kanten fås exakt
emitterad trottoarhöjd, utanför räckvidden ursprunglig geometri. Detta är ett visuellt
anläggningsantagande (*guess*), inte en ny uppmätt markhöjd. Inga källpunkter,
planbredder, bankhöjder eller Navigation-samplare ändras. Brodäck, betong,
stål, vatten och träbro behålls; byggarnas separata anslutningar är enda
brogeometrin som skärs. Vid stödets geometriskt härledda begränsningsruta delas berörda trianglar
före gradering; exteriören behåller sina ursprungliga affina plan, även när
underindelningen ändras. Busskurens kanoniska apron-fotavtryck tas före denna
renderingsanpassning. Klippta polygoners delade vertexarrayer muteras inte;
kollinearitet prövas både före och efter Float32-avrundning.

Rättningen är beroende av publicens egna väglägen och mark-/bankanpassning.
Principen kan vara relevant uppströms, men dessa koordinater får inte
blindkopieras tillbaka; särskilt de publika vägidentifierarna granskas
separat i #133. Inga privata system, terrassdekorationer, parkeringsändringar
eller nya cullers/material/texturer tillkommer.

## Lokalt gångstöd från emitterade ytor (#135)

Egen publik rättning mot `4b22570ef661996b9ffac850609a4998b871a8d7`,
ingen källimport. Geometribyggarnas `groundY`/`renderedTerrainY`, råa LM-data,
bankkontroller, aproner och samtliga renderingsbuffertar lämnas oförändrade.
Problemet var att Navigation gick på analytisk mark medan park, GC,
trottoar och asfalt ritades med olika faktiskt triangulerade stöd.

`WalkSupport` läser en gång de emitterade Float32-positionerna för terräng,
fordonsväg, trottoar, parkasfalt, GC/broasfalt och enbart södra batchens
asfaltfärg. Bara uppåtvända ytor ingår; inga väggar, vatten, ljusdekaler,
träd eller andra scenobjekt kan bli gångstöd. Högsta faktiska planträff
väljs i kärnan x=13..36, z=143..192, samma granskningsruta som omsluter
#124:s delade kanter och graderade anslutningar. Detta är en avgränsning
för felet, inte nya uppmätta markdata. Binärsökta bucketgränser hämtas från
befintliga emitterade terrängceller och deras verkliga delningar, inte
väggarnas mycket grövre 40 m-rutor. Inga scen-raycasts körs per gångsteg.

En ring till nästa befintliga terränggridlinje, x=11,61..38 och z=142..194,
blandar höjdskillnaden kontinuerligt tillbaka till den gamla markfunktionen.
Inom kärnan gäller faktiskt topmost-stöd; i ringen är stödet en uttrycklig
övergång, utanför gäller exakt tidigare Navigation-mark. Därmed ändras inte
hela områdets eller norra delens gång-/lutningskontrakt. Äldre analytiska
approximationer utanför kärnan påstås inte generellt lösta.

Navigation och farwalk använder samma lokala query för fotstöd, lutning,
räddning och aloft-bedömning. I kärnan prövas det valda verkliga planets
lutning mot befintliga `WALK.maxSlope=1.2`; ringen använder fortfarande
0,3 m-sampling av den gemensamma blandade funktionen. Det skiljer ramp
från befintliga diskreta kanter: park-/GC-lagren har cirka 20/34 cm steg.
Samma befintliga `BODY.stepUp=0.45` avgör om ett steg kan nås. Högre lokalt
stöd spärrar/slidar horisontellt innan `groundAt` annars skulle sakna en
nåbar golvyta. Ingen ny tröskel eller ändrad nedåtgravitation införs.

Vanlig arkitektur behåller golv-, trapp-, core-, garage- och takprecedens.
Väg-/GC-däck och marken under dem samt träbron behåller sina uttryckliga
befintliga höjdkontrakt; indexet ersätter inte dessa med översta broytan.
Låg mark utan däck använder fortfarande den gemensamma lokala funktionen,
även under −3,5 m; äldre globalt lågmarkbeteende utanför regionen ändras inte.
Det befintliga cirka 2,25 cm datumavståndet till broasfaltens ovansida kan
därför finnas kvar. Ingen parkerings-, geografi-, material-, culling-,
skugg-, privat- eller tjänsteändring ingår.

## Hela östcampusbidrag i desktopgrupper (#120)

Granskad källa: `35a75c93cefb1fc52ec8aa3fe8ce50fde418f432` (original #1461),
mot publik bas `0be15abfa6fa0cdd142e1397eff961749446b9ce`. Överfört endast
`lowMemory`-import, två avslutningsmarkörer efter hela campusbidragen
`88457552` och `88457606`, samt submission av `east-modern` i tre fasta
intervall på datorn. Källans redan befintliga parkeringsimport och övrig
kod är inte nya beroenden. Inga konfigurations-/byggnads-/markdata importeras.

Den publika byggaren har nio campusbyggare och skolans klassiska byggare i källordning: första
intervallet innehåller 1/9/7, nästa 19/19:s östra del/8, sista NTI-skolan (`88457612`)/2/4/88.
Grupperna innehåller endast respektive byggnads kompletta befintliga
`modern`-bidrag; dess tegel, glas och tak behåller sina gemensamma separata
materialbatcher. Inga fasadceller eller geometriska klipp skapas. Exakta
former, färger, höjder och övriga campusbyggnader bevaras.

Varje intervall använder samma materialobjekt och ordinarie Three-frustum
per kamera, även oberoende skuggkameror. Ingen ny culler, gate, avståndsregel,
maskmutation eller kvalitetsnivå införs. Publikappens skuggkartor är fortsatt
avstängda. Riktiga lowMemory-telefoner går genom den ursprungliga enda
mastergruppen, med samma ordnade buffertar och bounds. Ingen privat dekor,
spel-, väder-/vindstyrning eller Cloudflare överförs.

## Publikt fullgruppskontrakt för mobilcampus (#136)

Nedströms egen budgeträttelse, ingen ny geometriimport. Historisk källa är
`fb629ce99b6ff9ec78d5f2eb22ad902e8fb8c2b2` (original #589): 33676 trianglar
i hela östgruppen och ett uttryckligen gissat tak 36000. Publicimporten
`8c54ef1f0c0dbee3d7930fa8e2ac3e24fc51bfb8` behöll taket. Den publika
terrängprecisionsutvecklingen, särskilt #74 (`4b6648a`), och fungerande klocka
förklarar dagens 38519. Accepterad ökning 4843 läggs till det historiska taket:
40843 behåller den ursprungliga absoluta marginalen 2324. Detta är en
asset-regressionskontroll för hela gruppen inklusive access/instanser, inte
validerad fysisk telefonprestanda. Inga framtida automatiska höjningar, inga
LOD-/geometriändringar och ingen import av original #1468:s separata
desktopbudget. Full mätledger och reproduktion finns i verifieringen.

## Riskbaserad verifiering i orkestern (#137)

Neutral arbetsflödespolicy från `0f0891d04a989ad2e0af0cb5865b2464f7914f3c`
(original #1478), anpassad till publicens egna dokument och releasekontroller.
2–3 riskbaserade kontroller, giltigt källbundet återbruk, dirigentgranskning utan
rutinmässiga omkörningar, stopp vid grön plan och kostnadsomprövning kring 10 minuter.
Dokument kräver inga scen-/triangel-/browserprov. Verkliga hårda kontrakt och
publicens avskiljning bevaras; inga privata instruktioner, app-/budget-/geometriändringar
eller nya tjänster överförs. Se verifieringspolicyn och orkesterkommandot.

## Hela terrängceller i desktopgrupper (#121)

Selektiv överföring från `625979e78b413c59e58fb4870b406b44bc68f4e4`
(original #1462): rena `terrainCellGroups`, dess nativeprov, cellintervall i
terrängbyggaren och `TERRAIN_FAR.renderSplit={x:0,z:60}`. Kompletta befintliga
celler inklusive flodens underdelningar fördelas mellan två desktopmeshar.
Position/normal/UV delas som samma attributobjekt och samma material; inga celler
klipps eller höjder ändras. Den befintliga namngivna mastern blir osynlig men
behåller full geometri och positiva rays; rendergruppernas rays är avstängda för
att undvika dubbla träffar. Public #135 läser fortfarande exakt samma master vid
sin gångstödsuppbyggnad. Telefonens ursprungliga enda mesh är oförändrad.
Ingen privat kod, nya avståndsregler, kvalitet eller originalbudget importeras.

Publik integrationsanpassning: originalets generiska master-ray räckte inte för
publicens mät-/skymningsfilter som kräver `object.visible`. Endast terrängens
renderbackade querymaster markeras uttryckligen; en gemensam synlighetspredikat i
`main.js` behåller dess mätning och skymning utan att acceptera andra dolda meshar.
Detta ändrar inte originalets kod eller publicens geometri.

## Markglöd följer befintlig dimma (#122)

Selektiv överföring från `a59dea6d18194ac282382fef1623cf8d3393ea33`
(original #1466): endast `fadeGlowWithFog(material)` i `groundglow.js` och
omslaget runt gatulampornas befintliga poolmaterial i `street.js`. Föregående
shaderhook bevaras; efter Three:s dimfragment multipliceras additiv alfa med
`1-fogFactor`. Inga pooler, lampbatcher, andra glödmaterial, fogvärden eller
dag/nattregler ändras. Inga privata funktioner eller originalbudgetar importeras.

## Konservativ mobilfrustum och plana entrérutor (#123)

Selektivt från `43f6701ccd576f73edda46663f394a08b4d90fea`: `tightfrustum.js`,
`vertexcompile.js`, exakt registrering av foliage-materialets befintliga
fragmentpatch och installation endast vid `lowMemory`. Publicens enda nya tal
är källans 1 cm Float32-marginal (`PHONE_FRUSTUM.pad`), ingen LOD-/avståndsregel.
Okända shaders/deformationer/callbacks avvisas, även #122:s glödmaterial.
Källans privata entréadapterundantag ersätts med konservativt veto för alla
LOD-förfäder, så publicens `CeilingBatchGate` behåller sitt maskägarskap.
Inga PERF-/Detail-/lampwash-/shadowtile-/privata moduler importeras.

Från `38be175ccfddd97bc3179ac3ff0d6dee4e50c32f`: endast
`CoreHouse`-glasets `forceSinglePass:geo.glass.length===1`. Public A/B/C har
varsin plan ruta; L:s separata icke-koplanära `Core`-batch ändras inte.
Geometri, querymaster/rays, gångstöd, kvalitet och budgetar bevaras.

## Två verkliga gatufickor (#125)

Selektivt kartunderlag från `03d4c5201004540769c51cf62b7272f0a2c3caaf`:
`SITE.south`-konturerna 1379042014/1379043165 och servicevägen 30633545.
[Frysta officiella OSM-svar](references/parking-125/README.md) belägger båda
fickornas `capacity=6`, `orientation=perpendicular`, `parking=street_side`;
vägen har endast `highway=service`. Den tidigare felplacerade vägkurvan bevaras
som `public-legacy-service-curve`, utan falsk OSM-identitet. Den gamla skogsluckan
bevaras separat så att flytten inte omplacerar övriga träd.

Publicspecifik `roadsideparking.js` ger hela fickan och dess korta vägkontakt ett
höjdplan, med övergång utanför ytan över fickans egen djupbredd. Endast berörda
befintliga terrängtrianglar skärs; samma Float32-trianglar används för markfrågor
och lokala ytskikt. #121:s kompletta cellintervall räknas om utan nya globala
rutnätsaxlar. Sex 2,5×5 m-rutor följer geometriskt tillgänglig bredd, utan intern
körgång eller kapacitetsstyrd linjespridning. Höjdplan, tvärfall noll, vägbredd
4,5 m, asfalt och linjelyft är uttryckliga gissningar; inga inmätta höjder påstås.
Övriga parkeringsobjekt och originalets privata parkeringsbyggare importeras inte.

## Husnära gatufickor och överlappande övergångar (#126)

Ytterligare två neutrala konturer ur `03d4c5201004540769c51cf62b7272f0a2c3caaf`:
1379042106/1379043164. [Officiella frysta OSM-svar](references/parking-126/README.md)
belägger råkapacitet 8/3 och vinkelrät gatuficka; befintlig korrekt 30633545 och
#125:s vägrådata återanvänds. Kapaciteten styr inte linjeavståndet: geometrin rymmer
åtta 2,5×5 m-rutor respektive tre hela 2,5×4,7 m-rutor. Det grundare måttet är en
uttrycklig bilstorleksgissning, inte en källbelagd femmeterskontur.

Publichjälparen skär alla aktiva lokala gränser och använder ett sammanhängande
viktfält: `r=w/(1-w)`, bakgrundsvikt 1, full yta äger sitt plan. Befintlig #125
byggs först; nya ytor arbetar mot dess faktiska Float32-trianglar och skyddar dess
hela fickor. Nya övergångar avtar även vid närliggande byggnadsfot, så husens faktiska
bärande nivå bevaras. Berörda hus har vanliga medelhöjdspad, inte #106:s LM-förankrade
fyrametersaproner. För 3164 används en uttrycklig annexanknytning:
planet går genom den faktiska närmaste huskantens två nivåer och vägkontaktens
medelnivå, med antaget tvärfall i stället för en smal höjdgrav vid väggen.
Ingen källkontur skär ett hus; inga höjdkällor, globala rutnätsaxlar,
övriga parkeringsobjekt eller gånggränser ändras.

## Konkav parkering och verklig serviceinfart (#127)

Konturer 1379042188/1379042235 från `03d4c5201004540769c51cf62b7272f0a2c3caaf`
har jämförts med [officiella frysta OSM-svar](references/parking-127/README.md).
Båda saknar råkapacitet. 2188 har endast amenity=parking; 2235 anger också
perpendicular/street_side. Verkliga servicevägar 335403605/335403606 ansluter
via gemensam nod och befintliga 36918924/1147690112. Bredd 4,5 m och asfalt är
uttryckliga gissningar; paved på 606 belägger inte asfalt specifikt. Ingen gångväg
omklassas till bilväg.

2188 behåller alla sex konkava hörn. Befintlig ShapeUtils-triangulering klipper
asfalt/målning; inget konvext hölje fyller indraget. En antagen rad med sju hela
2,5×5 m-rutor ligger vid den intakta långkanten; minst sex meter fri korridor
lämnas kring den verkliga serviceinfarten. 2235 får tre hela 2,5×5 m-rutor längs
sin cirka 8,69 m-kant, inte fyra kapacitetsstyrda remsor. Layouten är en tolkning,
inte en inmätt parkeringsplan eller normbedömning.

Graderingen har nu uttryckliga steg: #125:s emitterade mark, #126:s skyddade
plan/annexanknytning, sedan dessa två ytor. Varje steg behåller tidigare hela
fickor och faktiska byggnadsfötter; inga globala rutnätsaxlar eller källhöjder
ändras. Ingen privat parkeringsbyggare eller ny generell geometriarkitektur införs.

## Dubbelradig parkering norr om hus 45 (#128)

145221619 från `03d4c5201004540769c51cf62b7272f0a2c3caaf` matchar
[officiell fryst kontur](references/parking-128/README.md), cirka 57×16,9 m.
Råtaggen är endast amenity=parking; originalets 30 var gissning. Geometrin rymmer
10 hela 2,5×5 m-rutor i två rader med sex meters körgång, efter att de tre befintliga
modellkurvornas tvärpassager reserverats. Ingen ny lång apron eller infart hittas på.

De tre modellkurvorna ansluter vid befintliga 30633546-noder. Två felaktiga
identiteter blir `public-legacy-parking-crossing` och
`public-legacy-west-parking-crossing`; #125:s redan ärliga lokalkurva behålls.
De verkliga OSM-objekten 30633544/850235115 visas i råarkivet men deras avlägsna
geometri importeras inte här. Samtliga modellkurvors XY bevaras. Kurvornas sexmeters fria korridorer och
asfalttolkning/layout är gissningar, inte en källbelagd detaljerad körplan.

Lokalt steg 3 bygger på redan emitterade #125–127-ytor. Ett plan går genom
LM-referensen 10/248/1,26, faktisk tidigare mark vid infartens möte med konturen
samt hus 45:s ankarnivå vid närmaste bakhörn. Bankens hela befintliga ±4 m-krön
samt konservativa fyrametersapronhöljen runt hus 41/45 skyddas. Plan/övergångar
är uttryckliga civilmodellantaganden; råhöjder, hus och globala rutnätsaxlar ändras
inte. Den större lokala patchen kräver ett faceindex på befintliga terrängcellaxlar
för höjd-/klippfrågor; ordnade geometriytor bevaras, inga nya budgetar eller LOD-nivåer införs.

## Konkav parkering vid hus 46 (#129, 2026-10-21)

Kontur/infarter granskade mot `03d4c5201004540769c51cf62b7272f0a2c3caaf` och
[officiella rådata](references/parking-129/README.md). Originalets #1440
`3d9618f9ec9716a630e51ccf402988c57beef542` och hjälpare
`02e3fa8d86540e6b7406f3b0415c0cbb3aadbef5` granskades; deras inre kantfade
och annan fyrhörnig layout importerades inte. Publicens befintliga lokala
terränggradering återanvänds: tre hela 2,5×5 m-rutor, 0,10 m indrag, ett plan
för just den användbara raden och 4 m yttre övergång inom den exakta fjortonhörningen.
Hela källkonturen har asfalt; övrig yta är sammanhängande omarkerad kör-/övergångsyta,
inte ett påstått gemensamt civilplan. Husets delade kant och samtliga källhörn
behåller tidigare nivåer. Plan/indrag/beläggning/antal/4,5 m vägbredd är *guess*.

Verkliga servicevägar 850235114/115 förbinder den befintliga 36918924-noden
(61,04;242,66) med gården, utan omklassad gångväg. Den tidigare felidentifierade
850235114-slingan behåller exakt sin geometri under `public-legacy-distant-parking-loop`.
Alla befintliga vägarnas svepta bredder granskades först: ingen annan skär den nya
parkeringskonturen. Den gamla felplacerade parkeringsytan ligger utanför skogens
sådomäner; ingen extra clearing behövs. Inga råhöjder, hus, bankar, gånggränser
eller tidigare parkeringsplan ändras. [Verifiering](verification.md#konkav-parkering-vid-hus-46-129).

## Nattsländegatan och hus 47 (#130, 2026-10-21)

Exakta konturer 145221624/626 från kandidat
`03d4c5201004540769c51cf62b7272f0a2c3caaf` jämförda med
[officiella OSM-svar och åtkomstkarta](references/parking-130/README.md).
`02e3fa8d86540e6b7406f3b0415c0cbb3aadbef5` (#1442) är tidigare granskad:
publicens befintliga hela civilplan/yttre övergång återanvänds, inte dess
kapacitetsstyrda femton klippta rutor eller privata config.

624 får två rader med tre hela 2,5×5 m-rutor och fri 6 m mittgång. 626 får en
enda rad med tre hela rutor i änden där den verkliga körgången lämnar tillräckligt
djup. Inget försök görs att maximera de gissade 15/20. Hela respektive källkontur
har ett gemensamt civilplan från tidigare källsamplade vägkontakter, 0,261/0,407 %
modellutning. Antal, beläggning, 4,5 m vägbredd, rader och gradering är *guess*.

Den primära åtkomstkartan kräver verkliga 145221607 samt 145221604/581 och endast
95036048:s nodsammanhängande nordliga kedja fram till befintliga 167,1;334,61.
Dessa tillförs med exakt käll-XY och lokal terrängtriangelklippning; ingen hel
vägslinga eller gångvägsomklassning importeras. Billig kontroll av samtliga nya
svepta vägbredder visar ingen överlappning med hus. Befintliga husfötter och
tidigare parkeringsplan skyddas av samma graderingsmotor. Båda ytorna ligger
utanför WALK:s z-gräns; inga påhittade gångprov eller utvidgade gånggränser.
[Verifiering](verification.md#nattsländegatan-och-hus-47-130).

## Rätta service-ID:n och bevarade lokala GC-kurvor (#133, 2026-10-21)

`03d4c5201004540769c51cf62b7272f0a2c3caaf` och originalets frysta
OSM-snapshot (SHA256 `4c1734d408d4c23896c3ba672cf4e8ccb71537d2a06f23c00a8347192d22619d`)
belägger två korta servicevägar: 145221590 (−85,75;315,14)→(−76,77;327,58),
145221588 (27,71;396,53)→(9,95;373,66). Publicen får endast dessa exakta
projektionspunkter och råtypen `highway=service`; asfalt/4,5 m är *guess*.
[Källutdrag, attribution och gemensamma noder](references/roads-133/README.md).

De tidigare stora kurvorna behålls i samma ordning med identiska punkter, bredd
3,5 m och material under `public-local-gc-connection-east/west`. De är lokala
modellerade GC-anslutningar, inte dessa OSM-servicevägar. #99/#124:s exakta
terrängklippning följer nu deras explicita `terrain:'triangles'`-flagga i stället
för en felaktig OSM-ID-lista. Den vanliga geometriska lampföljden ser de nya
servicevägarna utan specialadapter; inga privata system eller nya höjder följer med.

Granskade ID-användningar finns bara i config och den gamla klipplistan; övriga
verktyg har inga hårdkodade ID-beroenden. Inga andra servicevägar/parkeringar
eller de väntande #116/#134 genomförs här. [Verifiering](verification.md#rätta-servicevägar-och-bevarade-gc-kurvor-133).

## Norra serviceinfarten (#116, 2026-10-21)

Selektivt granskad `9eb4ccfadfdf0ffd26ae7a20dfc1e3e50c22d1b8` (#1432): endast
kompletta 145221573/582/583/596 tillförs. [Fryst primärutdrag/ODbL](references/roads-116/README.md)
bevarar exakt underlag ur SHA256
`4c1734d408d4c23896c3ba672cf4e8ccb71537d2a06f23c00a8347192d22619d`.
Befintlig `terrain:'triangles'` och surfaceGrid återanvänds utan ny helper/terräng.
573 delar punkter med korrekt 590, grenarna och 30633546 `(3,68;236,83)`.

Asfalt/4,5 m är källans uttryckliga gissningar. Endast582 anpassas till 4,4 m
i publicen: 4,5 m skulle överlappa 0,033595 m² av en befintlig hel bilruta i #128.
Käll-XY, bilrutor och parkeringsplan lämnas oförändrade. Alla faktiskt emitterade
nya vägbredder är fria från huskroppar (med gårdshål) och alla redan levererade
hela bilrutor. Ordinarie lampfunktion återanvänds; tomträdsfixturen visar 4 nya
573-stolpar och 2 borttagna gamla stolpar där nya körvägar kräver frigång. Detta
är funktionens villkorade modellresultat, inte ett uppmätt World-/mobilbudgettal.

Gamla GC-kurvor, mark-/LM-källor, höjdsamplare och appstyrning ändras inte.
#117/#131 och andra väg-/parkeringsärenden genomförs separat.
[Verifiering](verification.md#norra-serviceinfarten-116).

## Södra tvärvägen och smala servicelänken (#117, 2026-10-21)

Selektivt granskad `80c78366de5d041c073f10872873195920453ff2` (#1433): endast
145221576 och 199056948, komplett primärgeometri och en minimal `isVehicleWay`-utökning.
[Fryst underlag/ODbL](references/roads-117/README.md) bevarar fyra respektive tre
punkter ur OSM-snapshot SHA256
`4c1734d408d4c23896c3ba672cf4e8ccb71537d2a06f23c00a8347192d22619d`.
Delade noder binder befintliga 36918924/145221573 och nya tvärvägen.

Asfalt och 4,5/3 m är uttryckliga gissningar. En explicit råtyp service behåller
fordonssemantik även vid 3 m, medan den gamla breddregeln gäller oförändrat för
otypade vägar. Ingen 199056947 eller annan gångväg importeras/omklassas.
Befintligt `terrain:'triangles'` återanvänds; inga höjder, markdata, äldre vägar,
parkeringsrutor eller gårdshål ändras. Hela de emitterade nya vägbredderna är
fria från huskroppar och alla tidigare hela bilrutor.

Lampmodulen ändras inte: 3 m-länken kvalificerar inte enligt dess vanliga breddfilter.
`roadLampSpots([],[])` ger villkorat fem nya 576-stolpar och inga borttagna; detta
är inte ett faktiskt träd-/World-/mobilbudgettal. [Verifiering](verification.md#södra-tvärvägen-117).

## Parkering väster om hus 41–43 (#131, 2026-10-21)

Exakt sexhörnig kontur 145221628 från granskad
`03d4c5201004540769c51cf62b7272f0a2c3caaf`, jämförd med
[fryst officiellt OSM-svar/ODbL](references/parking-131/README.md).
Den tidigare gissningen 45 är inget layoutmål: tre hela 2,5×5 m-rutor centreras
vid längdposition 66 på den långa källkanten 0→1, med 0,10 m indrag. Befintlig
#129-radkärna används oförändrat: ett lokalt 5,066 % plan, 4 m yttre övergång
och pinnad källgräns. Hela konkava konturen har asfalt; omarkerad rest är
fri kör-/övergångsyta, inte ett påstått gemensamt civilplan. Allt detta är *guess*.

Först provad mittplacering hade 25 % antaget tvärfall och förkastades före browser.
Några få billiga lägen längs samma kant gav ett användbart läge; ingen
kapacitetsmaximering eller ny graderingshjälpare. Samtliga nu emitterade vägbredder
är fria från de tre hela rutorna. Infarten 573/590 och grenarna 583/596, levererade
i #116/#133, behålls. Inga nya vägar behöver tillföras.

Graderingens hela 4 m räckvidd ligger utanför konservativa 4 m-apronomslag för
hus 41/42/43; hus 41 har dessutom explicit befintlig apronguard. LM/GLO-källor,
husfötter, övriga parkeringsplan och bank/broar ändras inte. Gamla felplacerade
ytan låg utanför skogens sådomäner; ingen legacy-clearing behövs.
[Verifiering](verification.md#parkering-väster-om-husen-131).

## Inre serviceslingan (#134, 2026-10-21)

Selektivt granskad `4b8105adcd63f14b889aa4f99f4f3605966c95c1` (#1435): endast
kompletta 145221614/585/592/599 med exakta delade punkter.
[Fryst primärutdrag/ODbL](references/roads-134/README.md) bevarar 7/2/2/3 punkter
ur OSM-snapshot SHA256
`4c1734d408d4c23896c3ba672cf4e8ccb71537d2a06f23c00a8347192d22619d`.
Asfalt/4,5 m är *guess*. Befintlig terrängtriangelklippning återanvänds utan
nya hjälpare eller ändring av höjdkällor, tidigare vägar eller parkeringsplan.

Komponenten delar rätt noder internt och med 145221588, men ännu ingen källnod
med övrigt importerat nät. Den saknade nästa konsekutiva 95036048-länken är
34,825904 m: 1586522906 `(97,32;385,52)`→1586522929 `(68,88;405,62)`, även 614:s
ändnod. Den levereras separat i #138; ingen hel ytterring, 612 eller gångväg
importeras för bekvämlighet. Befintliga lokala modellkurvors korsningar är inte
bevis för en redan levererad OSM-nodanslutning. #132 väntar även på denna länk.

Alla faktiskt emitterade nya vägbredder är fria från huskroppar med gårdshål
och samtliga tidigare hela bilrutor. Vanlig lampfunktion används: tomträdsfixturen
ger sex tillkomna och en borttagen 588-stolpe, inte ett faktiskt World-budgettal.
En äldre global count-fixture för #116 ersätts med klassning/clearance mot aktuell
parkering; dess historiska fyra hade redan blivit två före #134 när #131
levererades. Före/efterloggar bevarar detta utan en ny antagen lampbudget.
[Verifiering](verification.md#inre-serviceslingan-134).

## Anslutning till inre serviceslingan (#138)

Publik stödändring för #100 → #98, endast nästa konsekutiva nod på redan delvis
importerade 95036048. [Fryst officiell access-map v6](references/parking-130/access-map.json)
och [källor/ODbL](references/parking-130/README.md) från #130 återanvänds utan ny APIhämtning.
Det gamla prefixets tre noder är oförändrade. Fjärde noden 1586522929
`(68,88;405,62)` följer 1586522906 `(97,32;385,52)`, en sträcka på 34,825904 m,
och delas med ändnoden på 145221614. Därmed ansluts #134:s komponent inklusive
145221588 till befintliga 95036048 och dess norra nät.

Raw v6 anger `highway=service`, inte bredd eller ytskikt. Befintliga 4,5 m/asfalt
förblir uttryckliga *guess*. Samma terrängtriangelklippning och vanlig lampfunktion
används; tomträdsfixturen ger en tillkommen kandidat, ingen borttagen, inget
World-budgettal. Ingen hel ytterring, 612, gångväg eller parkering tillförs.
[Verifiering](verification.md#anslutning-till-inre-serviceslingan-138).

## Parkering söder om hus 44 (#132)

Exakt åttahörning 145221629 från granskade
`03d4c5201004540769c51cf62b7272f0a2c3caaf`, kontrollerad mot
[fryst officiell way v1/ODbL](references/parking-132/README.md).
Raw innehåller endast `amenity=parking`, inte kapacitet, material eller höjder.
Den tidigare felplacerade förenklade konturen ersätts; gamla 22 och kandidatens 40
är inte källbelagda mål. Tre hela 2,5×5 m-rutor är en uttrycklig layoutgissning.

Befintlig `concave-row`/`gradeRow` används vid kant 0→1, `rowAlong=14`, inset 0,1 m.
Första billiga användbara läget valdes, ingen maximering. Tre faktiska befintliga
terränghöjder ger en antagen radkärna med 3,791 % lutning; befintlig begränsad 4 m
övergång och pinnad källgräns behålls. Hela källkonturen får asfalt, men resten är
omarkerad passage/övergång, inte ett påstått gemensamt helplan. Samtliga servicevägar
614/588/585/592/599 och ärlig äldre modellloop lämnas fria. Infarten är nu ansluten
via #134/#138. Ingen ny väg, motor, mobilregel eller gånggräns tillförs.
Radkärnans hela 4 m räckvidd ligger utanför alla byggnaders 4 m apronhöljen;
tidigare civilplan skyddas av befintlig stagekedja. Gammal felplacerad kontur låg
utanför skogarnas seedområden, så inget falskt skogshål behöver bevaras.
[Verifiering](verification.md#parkering-söder-om-hus-44-132).


## Färre färgritningar runt uteplatserna, #139

Importerad och anpassad från originalets `5c6fffd837ae449f47bc8cc874d9d8e5e10a94af` (#1459):
`src/siteinstancebatch.js` samlar kompletta befintliga träd-/lampinstanser som träffar
kamerans frustum i färre färgbatcher. Originalens geometrireferenser, aktuella
instansmatriser/färger, fysiska rays och skuggflaggor bevaras; de nya färgkopiorna saknar
raycast och skuggkastning. Bara ortogonala, likformigt skalade positiva källramar och
kända statiska vertexprogram kvalificerar. Ändrade instansantal, positionsversioner,
material, färgbuffer och transforms kontrolleras vid ritning; övriga fall behåller
originalritningen. Nästlade kameror/renderingsmål och uppvärmning använder originalen.

Den redan importerade `tightfrustum.js` används också på dator, med samma befintliga
`PHONE_FRUSTUM.pad` och fragmentregister i `vertexcompile.js`/`foliage.js`. Den ursprungliga
`phoneFrustum`-diagnostikreferensen behålls. Telefonens instansritning och frustum ändras inte.

Avgränsningar: originalets privata `DetailCuller`/aktiva occluders, `occlusion.js`, parkerade
bilars LOD och privata bok/interiörändring har inte importerats. Inga nya tjänster, resurser,
lagringsnycklar eller spelinslag. A/B/C/L:s separata arkitektur, glas och dörrar ändras inte.
Nuvarande publika app aktiverar ingen skuggkarta; inga uppmätta skuggvinster påstås.

Verifiering mot byggd `dist/`, Chromium1280×800 med faktisk World och samma vyer:
uteplatshörn867anrop/829066tri →845/759110, områdesvy810/847052 →784/773030.
Båda avkodade bildpar är pixelidentiska, utan browserfel eller externa anrop. Native19fall
(`siteinstancebatchtest.mjs`, befintliga `tightfrustumtest.mjs`), `npm test` och `npm run build`
passerar. En tidig kandidat tappade diagnostikreferensen före appstart; den stoppades före
publicering och den färdiga byggda omkörningen är grön. Det är en ritanropsmätning, inte FPS
på fysisk enhet. Råunderlag bevaras i `/home/olw/.local/state/lunden-issue1459-20261022/public-release/`.

## Begränsad callback-diagnostik (#140)

Granskad originalrevision `5c3cd042477cd5c2352d3b1f5eb8411b535623aa` (#1507).
Endast `src/frameintervals.js` och dess rena ring/statistiktester överförs.
Beroendet är en minimal `PERF.intervals`-konfiguration; privata HitchLog,
kamera-/spel-/spar-/mediedata och Cloudflare importeras inte. Publik main anpassas
med callback-start och två CPU-faser update/render, eget bygg-id/GPU/viewport,
introduktion/hjälppaus och nativ visibility. Inga kvalitetsnivåer eller simulerings-
regler från originalet införs. Alla A/B/C/L:s geometrier behålls exakt.

`node --test tools/frameintervalstest.mjs` passerar 2/2; `npm test` auditerar
94moduler och samma-origin-nätpolicy; `npm run build` passerar.
[Publikt protokoll och mätgränser](frame-intervals.md).
Browser-/Pages-resultat och commit länkas i #140. Detta är en verktygsleverans,
inte en bekräftad orsak eller lösning av originalets rapporterade frysningar.

## Gemensam orkester och Issueflow (#141, 2026-10-23)

Granskad originalrevision `fa05fed0a339be3fa5e6c75136828ba7c88b5851` (original #1520), med lokal anpassning av
`.claude/commands/orkester.md`, `AGENTS.md`, `CLAUDE.md`, README och verifieringslänkar.
Den gemensamma kärnan importeras separat från `solwation/dirigenten-och-orkestern`
**v0.1.0**, `67507ef71c4979d8340e03e84072719651ada7df`, som squashad subtree i `.orchestra/shared`.
Ingen historik eller appkod från originalet överförs.

Kort plan, nyttig parallellism, sammanhängande leveranser och riktad verifiering
ersätter dubblerade orkesterinstruktioner. `.orchestra/project.md` behåller publicens
egna test/build/Pages-krav, båda köerna, prioritets-/ägarskapsregler och innehållsgränser.
Labels/status följer github-dashboard/public/ISSUEFLOW.md; ingen Cloudflare-tjänst,
personlig resurs, spelmekanik eller lagringsändring ingår. Originalets intake nämns
enbart som arbetsflödeskrok i separat originalcheckout, aldrig som publik integration.

Verifiering: dokumentdiff/länkar/regelmotsägelser, identisk gemensam release och ett
isolerat subtree-installations-/uppdateringsprov. `npm test` och `npm run build` samt
Pages-resultat dokumenteras i #141. Ingen appändring kräver nytt webbläsarprov.


## Resurshushållning i orkestern, #142

Granskad originaladoption: `5fdb35cfaec67bb410ad0aa917960138acc7c434`
(original #1521). Den generiska kärnan importeras direkt som granskad subtree från
`solwation/dirigenten-och-orkestern` v0.1.1,
`3ab2b3a59a8deb5d8734c258af4016a8c03b6caf`; originalets apphistorik importeras inte.
Projektpolicyn länkar till konkreta regler för minsta tillräckliga kapacitet,
resonemang, kontext och motiverad eskalering. Modellval sker när verktyget stöder det;
resurshushållning gäller även med låst modell. Acceptans och publiceringskrav behålls.
Ingen appkod, personlig resurs, lagring, spelmekanik eller tjänsteintegration ingår.
Verifiering: exakt kärnrelease, dokumentdiff/länkar/motsägelser, `git diff --check`,
`npm test` (94 moduler) och `npm run build`. Pages-resultatet länkas i #142.


## Upptäckt av orkesteruppdateringar, #143

Granskad originalkälla: `635bd3f9f292b17f4e63bf737c6411c91976c2e3`
(original #1522). Endast den lokala underhållssektionen i `.orchestra/project.md`
och README-förklaringen anpassas. Generisk procedur kommer från
`solwation/dirigenten-och-orkestern`, `cbddafa3193870c7f0693064ae303cc4d6657ff0`.
Installerad kärna/pin v0.1.1 behålls: start-/återupptagningskontrollen upptäcker
stabila releaser och versionstaggar och föreslår relevanta buggfixar. Övriga
uppgraderingar är valfria; importer är fortsatt granskade och uttryckliga.
Ingen appkod, personlig resurs, lagring, spelmekanik eller tjänsteintegration ingår.
Verifiering: diff/länkar/motsägelser och oförändrad kärna/pin, `git diff --check`,
`npm test` och `npm run build`. Pages-resultatet länkas i #143.


## Orkester v0.1.2 med fas-hooks, #144

Granskad originalkälla: `69cc95125` (original #1523). Den generiska kärnan importeras
som granskad subtree från `solwation/dirigenten-och-orkestern` v0.1.2,
`ce0d93613be74c0bf653377629500b404fb8b966`. `## Repository hooks` i
`.orchestra/project.md` blir fas-hooks (planering–uppföljning) med kvarterets egna
regler: publika gränser, uppströmsgranskning, `npm test`/`npm run build` även för
dokument och faktisk Pages-körning före stängning. Rapportintaget är fortsatt en
köintags-hook som bara körs i en separat originalcheckout. Originalets resultatbilder,
changelog och rapporttjänst ingår inte.
Ingen appkod, personlig resurs, lagring, spelmekanik eller tjänsteintegration ingår.
Verifiering: identisk kärna, diff/länkar/motsägelser, `git diff --check`, `npm test`
och `npm run build`. Pages-resultatet länkas i #144.
