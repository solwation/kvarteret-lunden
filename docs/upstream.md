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

- Senast granskade originalversion: `1e6b988` (för #20; mobilstyrningen `82fde3f` för #31; övriga områden enligt respektive avsnitt).
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
