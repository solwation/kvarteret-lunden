# Verifiering av första arkitekturimporten

Källversion: `solwation/lunden-3d-apartment@c079371f6782225e29e9dac51518c509ed8c37e6`.

Denna import innehåller områdesgeometri, fast inredning, garderober utan innehåll, befintliga lägenhetsmodeller, trapphus/hissar och garage med tomma förråd. Privat möblering, gardiner, foton, teckningar, namn, fordon och spelfunktioner har tagits bort från den importerade koden. Varken personliga resurser eller originalets historik har kopierats.

## Kontroller

- `npm test`: granskar källfilerna för personliga namn, originalets tjänster och lagringsanrop; kontrollerar importkedjan och planunderlaget. Namnen lagras bara som SHA-256-hashar av normaliserade ord (även delord i identifierare fångas); fler ord kan läggas lokalt i den ej incheckade `tools/private-denylist.txt`, ett per rad.
- `npm run build`: paketerar en statisk visning med lokalt Three.js. Publiceringen behöver inga externa skript, Workers eller backend.
- `tools/browser-check.mjs`: startar den faktiska publiceringsbyggnaden i Chromium med WebGL, kontrollerar förflyttning, dörranimation, E-interaktion, giltig mark vid alla fem platsval, hjälp och mätläge. Testar mobil layout och styrreglagets verkliga touchinmatning inklusive avbrott, dödzon och responskurva samt den utjämnade titta-dragningens totala vridning via CDP.
- Webbläsartestet lägger in markörer under originalets lagringsnycklar och kontrollerar att de finns kvar och att inga nya lokala nycklar tillkommer. Försöker även ange gamla `cloud`- och `sync`-parametrar; de används inte av visningen.
- Alla sidans nätverksanrop registreras: inga externa tjänster tillåts. Fel i webbläsaren under testet ger underkänt.
- Separata komponentkontroller vid importen har byggt båda våningsplanens inredning och standardinredning i Chromium. Garage/trapphus har kontrollerats för öppningsbara dörrar och hissresor i alla fyra hus. Navigationskontroller täckte ursprunglig trappgeometri upp/ned och vägg-/dörrkollision.

Skärmbilder och maskinläsbara resultat sparas lokalt under `artifacts/` och checkas inte in. Visuellt granskade vyer: introduktion, område, L1007 och mobil vy av L1007.

## Begränsningar

Automatiserad mobilkontroll är Chromium-emulering, inte en fysisk iPhone eller Surface. Inga påståenden om uppmätt prestanda på sådan hårdvara görs. Modellens befintliga osäkerheter i mått och material kvarstår. Mätverktyget visar modellmått, inte verifierade bygghandlingsmått. Fast köksutrustning visas; vardagssimulering och löst innehåll ingår inte.

## Automatisk uppdatering och arbetsflöde, #1068

`CHROME_PATH=/sökväg/till/chrome node tools/update-check.mjs http://localhost:8164 /tmp/kvarteret-update-check` körs mot ett färdigt `dist/` på lokal server. Testet använder den riktiga uppdateringsmodulen i Chromium på dator och mobilstorlek: inaktivitet, avbruten nedräkning, hållen inmatning, samma innehåll, äldre version, nätfel, gammal ingångssida, inmatning under sista hämtningen och blockerad lagring. Separat engångsnyckel återläser position/blickriktning och raderas; originalets markörer kontrolleras.

Därefter laddas den riktiga WebGL-visningen, en andra Pages-publicering simuleras över nätverket och appen får ladda om med sina ordinarie timers. Testet kräver samma position/blickriktning i L1007, fortsatt aktiv visning, återupptagningsknapp för musen, borttagen engångsnyckel och oförändrad originallagring. Detta är en simulerad publicering i riktig webbläsare, inte bevis på en fysisk mobil.

Två byggen av samma innehåll ska ge samma innehållsversion trots skilda byggtider; dokumentation ingår inte i innehållshashen. Filnamn för JS/CSS och planritningens versionsparameter undviker blandade cacheversioner. Publicerad `version.json`, HTML och Pages-körningen kontrolleras efter push.

Arbetsinstruktionerna och `/orkester` finns i båda reporna. Den då införda centrala ärendekön ersätts av användarens senare instruktion: nya ärenden för Kvarteret Lunden spåras här i eget repo med `in-progress` endast under aktivt arbete och stängs efter verifierat resultat. Downstreamkommandot avgränsar bort originalets spelrapport-/molnflöden.

## Platsmeny och siffergenvägar, #2–#3 i detta repo

`tools/place-shortcuts-check.mjs` testar den riktiga fristående genvägsmodulen i Chromium: menyordning och synliga siffror för 5/6/7/9 platser, Digit/Numpad, tillgänglighetsattribut, välkomst-/readinessspärr, dialoger och redigerbara fält, modifierare, upprepning och förbrukade tangenttryckningar.

`CHROME_PATH=/sökväg/till/chrome node tools/places-browser-check.mjs http://localhost:8165 /tmp/kvarteret-places` körs mot färdigt `dist/`. Den riktiga WebGL-visningens sju mål kontrolleras med ordinarie siffertangenter: samma mål som menyn, stabil våningshöjd/mark och ingen vägg som trycker undan startpositionen. L1004 måste identifieras som L1004 av världens lägenhetsmodell. L1201 (#9) måste identifieras som L1201 med startpunkten i dess Hall på våning 3. En återupptagen visning från en äldre version med platsen `l1202` ska landa i L1201:s hall utan fel. Numeriskt tangentbord, välkomst-/hjälpspärr och samtliga menyval på 390 px bredd kontrolleras. Ingen webbläsarexception eller extern tjänst tillåts. Skärmbilder av L1004, L1201:s hall och smal meny granskas. Detta är Chromium med responsiv vy, inte fysisk telefon.

Den övre lägenheten i menyn är L1201 (#9), som ersätter det tidigare L1202-entrévalet utan interiör. L1004:s och L1201:s startpunkter följer deras befintliga VisitUnit-placering (`ox`/`oz`/`bottom`); L1201:s ligger i hallen innanför dörren från loftgången. Arkitekturgeometrin ändras inte.

## Musklick för interaktion, #5

`tools/click-browser-check.mjs BASE OUT` testar den faktiska WebGL-appen i Chromium med riktig inmatning: primärklick under muslås öppnar och stänger en riktad fysisk dörr; E finns kvar; höger-/mittklick ignoreras; ett första klick med fri mus fångar bara musen. Meny-/hjälpklick aktiverar inte modellen. Två klick i mätläget ger avstånd utan att samtidigt öppna dörren. Mobil med touch behåller sin titta-gest och separata Öppna-knapp. Kör mot ett serverat färdigt `dist/` med `CHROME_PATH` satt vid behov. Inga browserundantag tillåts; skärmbilder sparas och granskas. Detta är Chromium-emulering, inte fysisk mobil. Liksom övriga webbläsarkontroller pausas renderingsloopen innan välkomstknappen klickas: SwiftShader ritar hela scenen bakom välkomstrutan med långt under 1 bild/s, vilket annars får Playwrights bildrutebaserade klickkontroller att tidsgå ut (#13). I mobildelen fortsätter loopen men själva GPU-ritningen hoppas över tills Öppna-knappen visats; scenen ritas om före skärmbilden. Planrutten i `browser-check.mjs` matchar sökvägen oberoende av versionsfrågesträngen `?v=`.

## Hemskärmsikon, #7

Manifestet och `apple-touch-icon` följer [Apples Web Clip-dokumentation](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html) och [manifestets start_url](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/start_url). PNG-filerna är renderingar av projektets befintliga `icon.svg`, med opak bakgrund; Android har en separat maskbar ikon. Identitet, scope och startlänk är relativa till detta projekt och saknar versionsparametrar. Manifest och ikoner ingår i byggets innehållshash och statiska publiceringspaket.

`npm test` kontrollerar deklarationer, Pages-sökvägar, PNG-signaturer och verkliga bilddimensioner. `tools/icons-browser-check.mjs BASE OUT` serverar det riktiga byggpaketet under en Pages-liknande projektprefix, läser manifestet med Chromium/CDP, avkodar samtliga PNG-filer, kontrollerar opak bakgrund och maskningsmarginal samt sparar en ikonskiss för granskning. Scenens JavaScript hoppas över i just denna metadatakontroll. Ingen faktisk installation på fysisk iPhone/Android påstås; en tidigare tillagd genväg kan behöva skapas på nytt för att visa ny ikon. Denna ändring inför ingen offlinecache eller extern tjänst.

## Kompakt områdesmeny, #8

På skärmar upp till 960 px visas en liten knapp med vald plats i stället för en fullbred select eller knapprad. Knappen öppnar en meny med samma sju destinationsknappar som datorns rad. Menyn stängs vid val, utanförklick, Escape eller ändrad skärmstorlek. Enter/Space och Tab fungerar som vanliga knappar; piltangenter/Home/End kan användas i menyn. Escape återför fokus till områdesknappen. Ett utanförtryck i själva scenen stänger menyn utan att samtidigt öppna objekt eller välja mätpunkt.

Alla mål använder samma moveTo; knapptext, vald destination, siffergenvägar och återupptagning hålls synkroniserade. Kontroller är minst44px och popupen får vertikal scroll vid låg skärm, utan att bli bredare än vyn. Större skärmar behåller den numrerade raden. Userfeedback ersatte den första fullbreda select-designen inom samma återöppnade issue.

`tools/place-picker-check.mjs BASE OUT` verifierar den byggda riktiga appen med orörd bundle/lagringsnyckel i isolerade browserkontexter: liten knapp (Området cirka110px, högst240px), minst44px kontroller, sju val med riktiga touchtryck vid390/320px, popupens gränser/scroll i landskap, breakpoint960/961, Tab/Enter/Space/Arrow/Home/End, Escape/fokus/utanförklick, stängning vid resize, Digit/Numpad och faktisk takeResume. Start-/resume-/slutversion måste vara identisk genom kontrollen. Välkomstskärmen ska täcka knappen innan start. Slutkörningen och det äldre plats-/mark-/kollisionsprovet passerar; mobil är Chromium-emulering. Skärmbilder för liten knapp, öppen meny, smal skärm och välkomstvy granskas före publicering.

## Löst högskåp borttaget ur L1007:s toalett, #12

Originalets mörkgrå IKEA HAVBÄCK-högskåp i entréplanets badrum/toalett (`havback` i `src/interior.js`, `HAVBACK` i `src/config.js`, originalets #293) är lös möblering och byggs inte längre, varken som geometri, öppningsmål (`högskåpet`) eller kollisionsrektangel. Kommod, spegel, toalett, duschhörna och duschset finns kvar. Kontrollerade motsvarigheter: L1007:s övervåning (WC/dusch) hade aldrig skåpet; L1004 och L1201 använder `standardinterior.js`, som saknar skåpet; övriga hus A/B/C har ingen badrumsinredning med det. Verifierat i Chromium med skärmbilder före/efter och en gångprovning in mot hörnet: före stoppades kroppen vid z ≈ 7,03 av skåpet, efter når den väggen vid z ≈ 7,38.

## Egna touchknappar, #30

`CHROME_PATH=... node tools/touchcustom-check.mjs BASE OUT` kör det byggda `dist/` i mobil Chromium med CDP-touch. Den öppnar redigeraren från hjälpdialogen och flyttar spaken. Storlek ändras med reglage och nyp, och opaciteten sätts. Därefter kontrolleras att Avbryt kastar ändringarna, att en överdragning stannar inom säkra området och att speglingen flyttar spaken till höger och knapparna till vänster. Spara, omladdning, rotation och tillbaka samt Esc och Återställ standard (inga inlinestilar, lagringsnyckeln borttagen) testas också. En skalad spak ska fortfarande gå, och blockerad `localStorage` ska fungera under besöket. Datorn ska sakna ingången och ignorera en sparad layout. Originalets nyckel ska vara orörd. Ingen browserexception eller extern begäran tillåts. Detta är Chromium-emulering, inte en fysisk telefon. Emulerade dragningar vilar 200 ms före lyft, annars äter Chromiums kvarvarande fling nästa tryck.

## Gå och titta samtidigt på mobil, #31

`tools/browser-check.mjs` håller i mobil 390×844 spaken framåt med en CDP-touchpunkt och drar samtidigt med en andra i vyn, i båda ordningarna: kameran ska vrida exakt 1,3 × 0,0026 rad per px medan besökaren går fullt, och när ena fingret lyfts fortsätter det andra (spaken går vidare utan vridning, eller vyn vrids vidare utan gång). CDP:s `touchEnd` anger de punkter som lyfts. Spakens storlek och knoppens väg följer originalet (bas = 2 × väg + 12 px), så kontrollerna räknar vägen som (bredd − 12 px) / 2. Detta är Chromium-emulering, inte en fysisk telefon.


`CHROME_PATH=/sökväg/till/chrome node tools/patio-decor-check.mjs http://localhost:8157 /tmp/kvarteret-patio` körs mot källkoden på lokal server (#35). Den kontrollerar grannarnas möblerade uteplatser på Hus L:s gårdssida: alla utom L1007 möblerade med olika stilar, deterministiska layouter, fri dörr, passage och häck, växtkronor innanför skärmväggarna, stolar vända mot bordet, två sammanslagna meshar inom triangelbudgeten och att grinden döljer dem från gatan och på långt avstånd. Skärmbilder ovanifrån och från gården sparas och granskas.

`CHROME_PATH=/sökväg/till/chrome node tools/startup-error-check.mjs http://localhost:8157 /tmp/kvarteret-startfel` körs mot både `dist/` och källkoden (#37). I dator och 390×844 avbryts programfilen, avbryts `data/plan.json`, saknas WebGL och är planritningen trasig JSON; varje fall ska visa ”Fel i steget ”…”: …” med rätt steg och orsak över en fungerande Försök igen (avbruten plan startar den riktiga scenen efter omladdningen), utan CSP-fel. En vanlig start visar inget felmeddelande. Sedan #39 ska en vanlig start byta stegtext i ordning (Hämtar programfilerna, Startar 3D-grafiken, Hämtar planritningen, Bygger huset, Bygger trapphus och garage) med rörligt livstecken och förloppsstapel som rör sig inne i husbygget; stegraden försvinner när starten är klar eller felkortet visas. En kvarhållen `data/plan.json` med sänkt `stallMs` och en verklig 3 s blockering av huvudtråden ska frysa livstecknet och därefter visa ”Det här tar ovanligt lång tid.”, vars Försök igen laddar om till en fungerande start. Skärmbilderna granskas.

## Garagefönster mot parken, #42

`CHROME_PATH=/sökväg/till/chrome node tools/park-windows-check.mjs http://localhost:8795 /tmp/kvarteret-windows` kör den riktiga källappen. `--before` använder surroundings-modulen från `6b3af42` som jämförelse. Åtta utvändiga fönster ska få tre opaka glasrutor var framför den befintliga muren; från garageinsidan ska väggarna fortfarande skymma glaset. Testet sparar park-/garagevyer för C–B och B–A samt verkliga kollisionssegment i `result.json`; dessa ska vara identiska före/efter. Hus L saknar motsvarande stödmursrad och befintliga husfasader behålls. Detta verifierar modellens ändring, inte att antagna fönsterhöjder är verkliga mått.

För publiceringsbygget serveras reporoten och samma kontroll får URL `/dist/`; hjälpkontrollen läser endast Three.js och de väntade konfigurationsmåtten från den lokala reporoten, medan scenen byggs av den riktiga publiceringsbundlen. `--compare /sökväg/till/before/result.json` kräver identiska kollisionssegment.

`CHROME_PATH=/sökväg/till/chrome node tools/parkdoor-glass-check.mjs BASE OUT [baseline-garage.js]` körs mot repots rot på lokal server med byggt `dist/` (#43). Den kontrollerar Hus A/B:s parkdörrar: glasöppning i bladet (stråltest), glasets matris lika med bladets stängt/öppet, oförändrad animation, kollision, pickmål, nivågrind och 30 interna stålblad, ett extra ritanrop och därefter samma dörrar i publiceringsbyggets riktiga World. Med en äldre `garage.js` som tredje argument körs förläget och kräver opakt blad. `ANGLE=gl` använder riktig GPU för skärmbilder; standard är SwiftShader. Skärmbilderna granskas.
 
`CHROME_PATH=/sökväg/till/chrome node tools/loggiabasement-check.mjs BASE OUT` (#44) kontrollerar Hus A/B:s källarhörn där loggiorna ligger under marknivå. Den säkerställer att inga innerväggar eller loggiapelare genereras under markytan och tar granskad skärmbild av hörnet.

`CHROME_PATH=… node tools/farwalk-check.mjs http://localhost:8777 /tmp/farwalk` (mot `python3 -m http.server 8777` i repots rot) går i den riktiga världen ner till ån, över bägge broarna, runt skolbyggnaderna till Klockhusets fasad och tillbaka, och kontrollerar att byggnader, broräcke, ån och de fyra ytterkanterna (`WALK`) stoppar samt att den som hamnar i ån flyttas upp på stranden (#60). Inga webbläsarfel tillåts; skärmbilder av ån, klocktornet och skolbyggnaderna sparas för granskning.

`CHROME_PATH=… node tools/roofaudit-check.mjs http://localhost:8777` släpper en besökare över varje kartlagt byggnadstak (`bld-*`, #68) och kontrollerar att hen landar på taket och att takets ringväggar serveras av `Roofs.walls`. Inga webbläsarfel tillåts.


## Höjdrutnät och terräng, #69

Ändringen är verifierad med `npm test`, `npm run build` och en riktig WebGL-visning i Chromium: samma kamerapositioner före/efter över campus i norr, Sankt Lars väg, ådalen, väst, söder och en översikt (dagsljus, ingen webbläsarexception). Trianglar per bild är lägre än före ändringen (glesare terräng långt bort), anrop oförändrade. Byggnader och vägar följer terrängen via samma `terrainY`. `tools/elevationcompare.cjs` kräver en testingång (`window.__app`) som denna repo saknar och är bara en referens för att regenerera jämförelsetabellen i originalet.

## Hästhagen, #76

`node --test tools/paddockgeotest.mjs` kontrollerar staketlinje, stolpar, grind, stätta och att skjulet står på jämn mark (#80) mot den kartlagda ängen. `CHROME_PATH=… node tools/paddock-check.mjs http://localhost:8238 /tmp/paddock` (mot `python3 -m http.server 8238`) kör hagen i den riktiga världen: ett staketnät och ett ponnynät, trianglar inom budget, ponnyerna håller sig inom staketet i 10 simulerade minuter, inget ritas eller simuleras från innergården, strålar går igenom ponnyer och staket (ingen klappning eller interaktion), grind och staket stoppar en riktig gång och stättan går att gå över. Sedan #78 även betningen: gräset är ett instansierat nät med en ritanrop, startmasken är fläckig, en betande ponny äter gräset vid mulen, gräset växer långsamt tillbaka och snömånader döljer det. Sedan #87 kontrolleras också att två normalstora ponnyer går in i det synliga vinterskjulet utan att försvinna, står kvar på sina tilldelade platser, går ut på sommaren och åter ritas efter avståndsculling. Bilder: grinden, gräset, ovanifrån, stättan och det bebodda vinterskjulet.


Hästhagen-destinationen (#83/#88): `CHROME_PATH=… node tools/paddock-visit-check.mjs http://localhost:10767 /tmp/visit` kontrollerar plats utanför staketet, fri från träd, på marken, blick in mot hagen, att man kan gå vidare och sedan #88 att minst en ponny ligger i bildfältet och är minst 40 px hög vid ankomsten på både dator (1280x720) och mobil (390x844). `Paddock.greet` (anropas från `moveTo('paddock')`) placerar ponnyerna på stödpunkter 7-14 m framför besökaren, vända mot hen; i regn och snömånader görs ingenting (de står då under taket). Värden i `PADDOCK.visit`.

## Gångbaneanslutningar, #82

Kör `node --test tools/polygoncuttest.mjs` och öppna `tools/roadjunctiontest.html` mot källkoden efter `npm ci`. Komponenten använder samma lokala Three.js-version som visningen, kontrollerar alla ritade gångbanor/trottoarer mot körbanetrianglarna, sneda vägkanter, höjdplanet, bro-undantaget och den mjuka kartkopplingens matchande bredder. Den ritar en översikt som ska granskas. Komplettera med den byggda riktiga visningen vid Karpvägen/Sankt Lars väg, en promenad över korsningen, egna lagringsnycklar och inga externa anrop. Källor och aktuellt resultat finns i [importregistret](upstream.md#exakta-gångbaneanslutningar-82).


## Separata höjdreferenser, #85

Kopiera `docs/references/elevation-hoje-a/point-api-2026-10-19.json` till en privat temporär fil och kör `node tools/riverheight-api.mjs KOPIAN`. Befintliga koordinater, käll-URL, punktmängdens hash, latitud/longitud, höjdsvar och attribution ska valideras utan nytt nätanrop; 60 punkter och 0 NODATA. Blockera `globalThis.fetch` i ett Node-startskript för att kontrollera att återläsningen faktiskt är offline. Kör aldrig återläsningen direkt över originalreferensen: den sparar en ny avslutningstid. Kontrollera att JSON-källorna är byteidentiska med 9040a306 och att `npm test`/bygget fortfarande har samma 79-modulers appgraf. Referenser och Node-verktyg ska inte hamna i `dist/` eller lägga höjd-API:t i besökarens nätverksanrop. Runtimeprofilens kontroll hör till #90.


## Höje ås relativa fallprofil, #90

Kör `node --test tools/riverfalltest.mjs`, reproducera tolkningsrapporten med `node tools/riverfall.mjs INPUT OUTPUT`, samt `CHROME_PATH=… node tools/farwalk-check.mjs http://localhost:8880 OUTPUT`. Nativeproven binder koefficienten till referensens hash, kontrollerar faktiska vattenvertexhöjder och fasta bro-/stigdata samt lokal bankhöjd och nedgrävda rampfötter. Återkomsten från varje åankare (inkl. kröken vid ankare 14, #91) ligger utanför gångspärren och farwalk-check går vidare med W hållen därifrån. I riktig byggd/live visning: kontrollera vattenmesharnas lokala höjd vid ankare 1/8/16, minst 32 m gång under båda broarna och Navigation.rescue till torr strand där, samt oberoende originallagring och inga externa anrop. Granska före/efter av underfart, träbro, västra strand och översikt. De gamla absoluta vatten-/djupnivåerna är antaganden; se [tolkning och import](upstream.md#relativ-fallprofil-för-höje-å-90).


## Statiska dörratlaser på telefon, #93

`PLAYWRIGHT_MODULE=/sökväg/till/playwright CHROME_PATH=/sökväg/till/chrome SHOTS=/tmp/kvarteret-static node tools/staticcanvas-check.cjs http://localhost:8157` körs mot källservern, som behöver importmap. Tio riktiga WebGL-kontroller jämför pixlar före/efter frigjord CPU-kopia, alla A/B/C/L-atlaser och omritning av en dynamisk hisslabel. Full upplösning behålls fram till första upload; endast telefonernas statiska källcanvas blir1×1 efteråt. Datorn behåller sin canvas. Granska bilder och den byggda visningen; kontextåterställning ska fortfarande använda den befintliga egna omladdningen med sparad plats och loopskydd. Mätning och begränsningar finns i [överföringsregistret](upstream.md#statiska-dörrskyltars-telefonminne-93).


## Flodsökning och väggnärhet, #94

`node tools/riverat-check.mjs` laddar den frysta produktionskällan från `0afb8bd05853e4bda079717d3d527a238bf82a3d` via lokal git och kräver att den finns i klonens historik. Verktyget kör helt offline:20 000 flodpunkter (ankare, mittpunkter, deterministiska slumpvärden och upprepade uppslag) ska ge exakt samma alla numeriska fält. Ytterligare20 000 kollisionsfall kör verkliga gamla/nya `pushOut`, med exakta slutpositioner och beslut, även vid radiegränsen, ändpunkter, nollängd och höjdgränser. Sju uppvärmda timingpar rapporterar medianer och lika checksummor, utan en flakig hastighetsgräns.

Kör också `tools/farwalk-check.mjs` mot källservern före/efter och jämför alla24 slutresultat. Den byggda appen kontrolleras med `tools/browser-check.mjs`, inklusive riktig mus-/touchinmatning, gång, dörrar, mätning, same-origin och originalets lagringsmarkörer. Granska före/efterbilder. Mätning och anpassning är registrerade i [upstream](upstream.md#flodsökning-och-kollisionsnärhet-94).


Park route fittings (#95): `node --test tools/pathlampstest.mjs` (3/3) and native Chromium `tools/pathlampstest.cjs` (8/8, PLAYWRIGHT_MODULE/CHROME_PATH/SHOTS), frozen public baseline0d3ef4c. Test excludes walking strips, river/bridge and field; verifies tree avoidance and route coverage. Real street batches retain exact old road matrices/pool prefix, no new light objects or batches; every appended post/glow vertex follows the supplied sloped terrain. Review images before reporting appearance. Full component day/night is22/24draws unchanged, final40fittings add8000/22400triangles. The public app itself stays in fixed daylight; the night component test exercises only its already existing generic update.

The first built full-world triangle test caught a post2.215m below the timber bridge's earth ramp, despite the synthetic sloping-callback check passing. The public import now excludes `parkFillFootprint` with its existing path clearance; Node coverage includes both ramps. The corrected actual built world has40new/49total fixtures and all pole feet match its drawn `site-terrain` triangles within0.4µm in the desktop pass. This is an actual mesh sample, not a comparison back to the supplied callback. Source counterpart tracked as original#1378.

Corrected built app23b4575086f004bdddba7c09: both1000×700 desktop and390×844 touch profile pass real triangle support for all40new fixtures (max0.371µm),1.20m actual Navigation walk, finite positions, daylight lights off, no JavaScript exceptions/external requests and original storage sentinels untouched. Park/paddock and bounded night images opened. The component night is only a generic update exercise; no night UI or original service is imported.


## Vindskyddets placering, #102

`node --test tools/paddockgeotest.mjs` har två nya kontroller för gemensam rigid
flytt och oförändrad relativ ram på riktig publik mark, full trågmarginal, samt
fallback vid för brant mark, hinder eller saknade delar. Den frysta referensramen
är ett delprov; komplettera alltid med den riktiga publika solverns `paddock.spots`
och `paddock.ground` i webbläsaren. Kör hela befintliga `tools/paddock-check.mjs`
för regn, vinter/sommar, dekor/culling, staket/grind och faktisk gång över stättan.
Granska före/efter från grinden, framför skjulet och ovanifrån. Flytten får inte
sänka marginaler, platta till terrängen eller ändra budgetgränser. Källa och aktuella
mark-/budgetresultat finns i [importregistret](upstream.md#vindskydd-närmare-staketet-102).


## Miljöponnyernas vintertäcken, #103

`node --test tools/ponyblankettest.mjs` kontrollerar täckets öppna hals/undersida,
ändliga normaler,70trianglar per täcke, faktisk delad matris/skala och återanvändning
över säsonger. `CHROME_PATH=… node tools/ponyblanket-check.mjs BASE OUT` kör den
riktiga publika världen och mäter täcke av/på i samma frysta vintervy: endast ett
anrop/140trianglar tillkommer. Båda färgerna visas med normal kroppsstorlek och
fria huvud/ben, faktisk vintergång (vänta första0,6m, max10s), sommar och dold/långt
bort/återkomst. Originalets lagringsmarkörer ska vara kvar och inga externa anrop
eller JavaScriptfel får förekomma. Granska de båda sidobilderna, bebott vinterstall
och sommarbild före publicering, samt den byggda och publicerade visningen.
Se [selektiv import och antaganden](upstream.md#vintertäcken-till-miljöponnyerna-103).

## Kompletterande vägstolpar, #96

Källa `15f9b00569e194bfcc4382fa66955b974dbcc134` (original#1371), selektivt
`roadlamps.js`, `ROAD_LIGHTS` och små street-krokar. Public#95 bevaras. Kör
`node --test tools/roadlampstest.mjs tools/pathlampstest.mjs` (8/8),
`CHROME_PATH=… SHOTS=… node tools/roadlampstest.cjs BASE` (8/8) och
`CHROME_PATH=… node tools/roadlamps-check.mjs BASE OUT` (riktig World, seriellt
1100×700 och390×844). `npm test` granskar83moduler; `npm run build` passerar.

Komponenten tillför130stolpar till befintliga49, i samma22barn/batcher utan nya
ljuskällor. Alla gamla väg-/parkmatriser och ljusvertexprefix är byteidentiska.
Full komponent22dag/24natt-anrop både före/efter; +26000dag/+41600natt-trianglar,
under källans oförändrade50000-extra-natttriangelgräns. Nattprovet testar bara
komponentens gamla update; appen förblir dagsljus med släckta huvuden/markfläckar.
Native kontrollerar determinism, samtliga regioner, vägar/gångbanor/hållplats,
byggnader/träd, vatten/bro/ramp/hage/parkering, gamla stolpars frigång och det
befintliga plana sydmarkstödet.

Verklig World:11/11kontroller i vardera profil, inga JS-fel/externa anrop och
originalets lagringsmarkörer orörda. Samtliga130fötter jämförs mot faktiskt ritade
trianglar:96i `site-terrain`,34i `south-land`, maxavvikelse2,45µm. Fyra extrema
poolhörn för varje ny stolpe (520prov) följer samma verkliga mark med högst3,48µm
avvikelse; komponenten kontrollerar även varje ny poolvertex mot lutande mark.
Antal nya stolpar per region lokal/väst/nord/öst/syd:21/3/22/28/56.

Samma frysta kamerapar ger datoranrop13→15,103→103,13→15,53→53,532→532;
mobil13→15,75→75,13→15,40→40,51→51. De två tillkomna anropen i yttervyer är
samma gamla instansbatcher som tidigare låg utanför kamerans frustum, inte nya
batcher. Triangeldelta är35800 i dessa yttervyer och26000 i övriga. Publicdocs har
inte originalets generella370-anropstak. Inga befintliga gränser höjs. Före/efter-
bilder sparas för alla fem regioner och båda profilerna; kameran döljer första
öststolpen bakom ett hus, så en friare östvinkel tas i byggkontrollen.

Första Worldförsöket mätte bara huvudterrängen och använde felaktigt ett lånat
originaltak; loggen bevaras. Den utökade kontrollen fann två verkligt svävande
nytillkommande sydkandidater0,47044/0,13605m över befintligt plan. Importanpassningen
`roadLampGround` återanvänder därför endast för nya väginstanser/poolhörn
southbackdrops befintliga−3,01m efter configgränsen. Gamla prefix och terräng
ändras inte. Misslyckade försök finns i `browser-attempt1.log` och
`browser-before-ground-adaptation.log`, slutresultat i `browser.log` och
`desktop.json`/`mobile.json`, under `/tmp/public-roadlamps96-codex20/`.
Chromium-emulering, inget påstående om fysisk telefon-FPS.

Den byggda visningen (`25ce3870d1e50f399439c6ea`) har också kontrollerats vid
390×844touch:179instanser/130nya, samma22barn, släckta huvuden/dolda markfläckar,
samtliga34sydfötter exakt vid befintligt parkplan inom Float32-precision. En fri
östbild visar stolpen och dess fot vid vägens kant. Inga JS-fel/externa anrop,
originallagringen orörd. Kontrollskript och `built.log`/`built-mobile.png` ligger
med övriga artefakter.0nya batcher; verkliga yttervyer kan ge+2anrop när de redan
befintliga större instansbatcherna når kamerans frustum.

## Täta träbrons rampkanter, #107

Källa och selektiv import står i [upstream.md](upstream.md#täta-sidokanter-vid-träbrons-jordramper-107).
Starta källservern och kör `CHROME_PATH=… node tools/bridge-ramp-check.mjs BASE`.
Provet granskar den faktiska `site-terrain`-meshen och `renderedTerrainY`: samma
positioner/normaler för varje gammal toppvertex, nederkant på ritade trianglar,
åtta horisontella strålar från båda bankernas båda sidor mot synliga sidoytor,
vatten under brodäck samt en enda terrängmesh/material. Gång över bron åt båda
håll, utan steg i ramperna, ligger i `tools/farwalk-check.mjs`.

Före/efterbilder från fem identiska gånghöga kameror (NV, SÖ och under bron),
kamerapositioner, budgetvärden och browserloggar finns utanför repot under
`/tmp/orkester-katt-20261020/public-bridge107/`. Den byggda `dist/`-appen
kontrolleras med `tools/browser-check.mjs` inklusive mobil, dörrar, lokal lagring
och inga externa anrop. Slutresultat: 8/8 sidorayträffar, högsta nederkantsfel
0,0000071 m, +216 trianglar/+22 032 byte i samma batch och identiskt antal
ritanrop i matchade vyer. Lampplaceringarna passerar `pathlampstest.mjs` 3/3.

## Tomma vinterkronor, #104

Källa: original `b1568524d899704da443d18d1e8eae81490c6a72` (#1404).
Föreprovet använder verkliga public-modulen från `c4bae878:src/seasons.js`.
Native `node --test tools/seasoncrowntest.mjs`: 2/2 PASS för samtliga månader,
exakta matriser/färger, samma buffert-/geometri-/material-/bounds-/raycastobjekt,
första lövmånaden och återkomst efter vinter. `npm test`: 83 moduler PASS;
`npm run build`: PASS. Browserkontrollen mot byggt `dist/` passerar med gång,
dörr, mobil layout, lagringsmarkörer och same-origin-nätverk.
Riktad byggd kallstart med `?month=1`/`?month=7` har 20/20 registrerade batcher
osynliga/synliga: innergården på dator 821/664 296 → 830/712 260
ritanrop/trianglar, på 390×844 touch 297/524 412 → 303/559 812.
Inga sidfel, externa anrop eller ändringar i originalets lagringsmarkörer.

I verklig public-World registreras 20 säsongsbatcher: 18 trädceller,
`south-crowns` och innergårdens klängväxt. Den identiska kameran och sekvensen
vinterstart → mars → juli → december ger följande ritanrop/trianglar i vinter
(före → efter): område 528/647 285 → 517/577 541, gård 830/712 260 →
821/664 296, hage 33/250 848 → 29/221 628. Dessa differenser är exakt de
11/69 744, 9/47 964 och 4/29 220 säsongsbatcher/trianglar som faktiskt
ritades i respektive förebild. Inga säsongsbatcher skickas i de nya vintervyerna,
även efter upprepade bildrutor. Mars och juli återger exakt förelägets
ritanrop/trianglar och samma registrerade batcher. Ett dolt parentobjekt
förblir dolt under sommaren och visas åter genom dess egen culling; en fysisk
stam ger rayträff och en dörr växlar normalt. Buffertarnas SHA-256 för matriser
och färger matchar före/efter för varje batch och månad; geometri och objekt
behåller identitet inom respektive körning. Matchade vinter-/sommarbilder från
området och gården samt fulla pose-/render-/bufferloggar finns under
`/tmp/orkester-katt-20261020/public-winter104/{baseline,final}`.

Trädcellerna har exakt samma förberäknade bounds i båda körningarna.
Klängväxten och `south-crowns` får sina instans-bounds först vid första
renderingen i Three.js: de är `null` efter ny vinterstart och beräknas vid
lövens återkomst. Därför jämförs deras befintliga boundsobjekt i nativeprovet
och verkliga matriser/renderutfall i World-provet, inte numerisk likhet mellan
två olika tidpunkter för renderarens lata initiering. Inga JavaScriptfel eller
externa anrop förekom och originalets local-/sessionStorage-markörer låg kvar.
Detta är Chromium/SwiftShader, ingen uppmätt fysisk telefonprestanda.

## Södra GLO-platåns mark, #105

`node --test tools/southplateautest.mjs tools/paddockgeotest.mjs` kontrollerar alla
46 gamla rå-/markrader, refAbsM14.75, den nya67-raderstäckningen, exakt gammal
Catmull-Rom-klamp samt areabevarande projektion mot faktiskt använda undertrianglar.
Samtliga16 prov är gröna efter återbasering till a0b07c4.

`CHROME_PATH=… node tools/southplateau-check.mjs BASE OUT` bygger den riktiga publika
världen i1280×800 och390×844. Den kontrollerar faktiskt ritad mark, stolpfötter,
ljuspoolernas extremhörn, byggnadsplattformar, hageunderstöd och alla triangelmittpunkter
för hagefält/slitspår mot deras ursprungliga48/70mm-lyft. Nordens50 232 Float32-positioner
måste ge exakt hash71634f582304fb881e362d15869ac3ee4eac718d9df46423e302d37c9259f02e
från a0b07c4. Denna nya bas innehåller #107:s648 ytterligare rampbankspositioner.
Den gamla49 584-positionershashen gäller därför enbart den historiska basen.
Bilder sparas från hagen, ovanifrån, norrut och två parkeringsvyer. Parkeringskonturer
och ursprungligt24mm-linjelift behålls; en korrekt parkeringsplan hör till #100.

Före sessionskraschen registrerades native16/16, faktisk desktop+mobil10/10,
hage29/29 och gång24/24 samt byggd browserkontroll. Den då granskade parade världen
38b47817→efter behöll51/928/107ritanrop med +37770/+37770/+37734trianglar.
Dessa är historiskt dokumenterade observationer: de temporära före-/efterbilderna och
råloggarna för både godkända och underkända kandidater försvann vid omstarten.
Grov-grid-kandidaten underkändes för sjunkna mittpunkter; den slutliga opt-in
surfaceGrid() använder terrängens riktiga undertrianglar. Andra grid-konsumenter bevaras.

Efter återställningen sparas nya råloggar och bilder beständigt under
`/home/olw/.local/state/lunden-orkester/codex-surface-20261020/public105-recovery`.
`native16.log`, `npm-test.log`, `build.log` och `final/desktop.json`/`mobile.json`
är återkörda slutbevis. Ett första serverförsök gav endast connection-refused;
`world-retry.log` innehåller den riktiga körning som upptäckte #107:s ändrade nordbas.
`final-world.log` är grön totalt12/12 för båda profilerna. `final/` innehåller aktuella
bilder och JSON. `baseline.mjs` fryser endast /src-modulerna till a0b07c4 via
Playwright-routing; `before-a0b/` och `baseline-retry.log` innehåller nya parade
förebilder och samma50 232-positionershash. Baslinjen testar bara nordbevarande;
sydstöd är avsiktligt inte ett acceptanskrav för den äldre världen. Ett första
baslinjeförsök missade kompatibilitetsfallback för surfaceGrid; dess fel finns kvar.

Återkörd faktisk desktop+mobil:681spår-/4049fältmittpunkter håller70/48mm-lyft
inom4,40/4,00µm;56sydstolpar/224poolhörn inom2,14/3,48µm,21plattformar matchar exakt.
Alla fem parade desktopvyer behåller51/928/107/67/228ritanrop. Triangeldeltan är
+37702/+37702/+37734/+37734/+37702. Bygget efter återställningen är ff2310b2dfa3cc2dc56dc1b0.
Parade mobilvyer behåller28/708/85/27/188ritanrop, med
+37730/+37730/+37734/+37734/+37734trianglar. Inga JS-fel eller externa anrop i slutprofilerna.
Den återkörda hagekontrollen passerar29/29 med exit0 (`paddock.log`), inklusive
befintliga triangelbudgetar, regn/säsong/culling, staket/grind och verklig gång över stättan.

Återkörd `tools/farwalk-check.mjs` passerar24/24 med exit0 (`farwalk.log`), inklusive
broar, fria vägar, gång och lokal återhämtning längs hela ån.
`tools/browser-check.mjs` passerar med exit0 mot den byggda visningen
(`built.log`, `built/browser-results.json`): dator/mobil, gång/dörrar, touch,
originallagring och inga externa anrop. Hagens befintliga komponenttak
höjs inte, och inga nya globala budgettak införs. Navigation/kollision och Hus A/B/C/L:s
byggnadsdata är oförändrade. LM-förfiningen #106 och planparkeringen #100 återstår.

## Lokala LM-referenser och byggnadsaproner, #106

Källor och attribution: se docs/upstream.md. `node --test tools/southpointtest.mjs
 tools/southplateautest.mjs tools/paddockgeotest.mjs` passerar21/21. Exportens77svar
är låsta med SHA256 och har full providerattribution. Tio lokala referenser motsvarar
exakt arkivets RH2000 minus14,36m; både interpolation och `groundY` träffar dem inom
1e−12m. Nord, oanvända områden, övergång/radiekant, skilda callback-samplers samt
fotkanter och2m-apronprober för Sankt Lars väg41/45 kontrolleras. Gamla46-raders GLO
och dess klamp kontrolleras separat, utan att göra exportens refAbsM14,75 till LM-datum.

`CHROME_PATH=… node tools/southplateau-check.mjs http://localhost:8257 OUT` passerar
9/9 på1280×800 och390×844touch. Före/efterloggar och sju parade bilder per profil ligger i
`/tmp/lunden-orchestra-20261021/artifacts-106/{before-feet,final}`. `baseline.mjs` i samma
artefaktmapp fryser publicsidans `/src/` till den granskade HEAD-versionen före106.
Referensrayen väljer den översta riktiga terrängtriangeln, utan närmast-förväntad filtrering.
Emitterade lokala vertices överensstämmer med den sömlösa ritade ytans query inom2,12µm,
och tio riktiga markrayträffar med samma query inom0,070µm.

Den mjuka modellen och den befintliga grova trianguleringen är skilda approximationer.
Största avvikelsen vid de tio inre LM-punkterna är0,107013m vid(-170,272), i en12×8m
västcell. Detta är inget inmätt markfel eller ådjup. Första nya provet antog ett obeställt
8cm-tak och exakt byggnadsbas=analytisk mark; det underkändes. Slutprovet skiljer därför
exakta LM-samplers, faktiska sömlösa trianglar och rapporterad inre discretisering.
Ingen etablerad budget höjdes och inga nya terrängunderindelningar infördes.
Avsiktliga interpolerade kanter mot grövre grannceller kan avvika från den analytiska
samplern, så vertexprovet jämför med faktisk `renderedTerrainY`.

41/45 har analytiska apronplan1,83/1,94m. Byggnadens bas följer som tidigare max av
ritade hörn:1,832834/1,949791m; botten1,711008/1,829855m ligger under samtliga88
riktiga fotkantrays och väggen omsluter markkanten utan glipa. Största skillnad mellan
basens−1cm-gräsplan och ritad fotkant är19,89/10,67mm. De nära fotbilderna används för
att granska kontakten. Första45-kameran låg under en högre förgrundskant och förkastades;
slutbilden använder76/7/285, cirka1,84m över verklig mark. Inom den bevarade gånggränsen
walkar riktig navigation från(10,248)3,2m och stannar exakt på `groundY` på båda profilerna;
övriga LM-punkter utanför z250 är geometri-/markprov, inte påstådda gångpassager.

56sydliga stolpfötter och224poolhörn följer ritad mark inom2,18/3,48µm.21plattformar
träffar sina plan exakt.681spår- och4049fältmittpunkter behåller70/48mm-lyft inom
4,40/4,00µm. Nordens50 232 Float32-positioner har oförändrad hash
`71634f582304fb881e362d15869ac3ee4eac718d9df46423e302d37c9259f02e`.
Fem översikts-/parkeringsvyer behåller desktop51/928/107/67/228anrop och
mobil28/708/86/27/188anrop; uppmätta triangeldeltan i de sparade slutloggarna är desktop+1291..1319 och
mobil+1291..1323. Detta är hela World med dynamiska modeller efter separat laddning,
inte ett isolerat deterministiskt komponentkostnadsmått. Inga nya meshbatcher eller högre komponentbudgetar införs.

`tools/paddock-check.mjs` passerar29/29 med oförändrade tak:8330stakettri<12000,
540ponnytri<700,3362vinterdekortri<3500 och8509grästuvor/34036tri<50000 i ett anrop.
Skjulets verkliga relief är0,091143m, hon0,04m; grind/staket stoppar och stättan walkas.
`tools/farwalk-check.mjs` passerar24/24, inklusive båda broarna och lokal återhämtning
längs hela ån. `tools/bridge-ramp-check.mjs` bevarar exakta toppositioner,8/8sidorays,
7,08µm maximal nederkantssöm och vatten under bron. `npm test` granskar85moduler,
`npm run build` ger `d9f3e13acdbf44f3fe75e7b9`. Byggd `tools/browser-check.mjs` på8258
passerar dator/mobil, riktig gång/dörrar/touch, originallagring och nätverkskontroll.
Inga JavaScriptfel eller externa anrop i slutprofilerna. Chromium/SwiftShader-emulering,
inte fysisk telefonprestanda. Fulla råloggar finns i artefaktmappen ovan.

#100:s parkering och #99:s vägbank ingår inte. Föräldern#98 förblir öppen.
