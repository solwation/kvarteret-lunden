# Verifieringspolicy

Välj 2–3 minsta tillräckliga kontroller före arbetet och stoppa när de passerar.
[Orkesterns riskbaserade policy](../.orchestra/shared/ORCHESTRA.md#verify-the-affected-behavior)
gäller också pågående arbete: dokument behöver diff/länkar/motsägelsegranskning,
inte WebGL eller triangelräkning. Lokala ändringar behöver berörd komponent och
verklig rutt/vy; fler plattformar/orienteringar eller fullprofiler kräver ändrad
gren/UI eller konkret global risk. Återanvänd giltiga käll-SHA-/indata-/kvalitetsbundna
resultat efter orelaterad rebase; räkna inte oförändrad geometri igen. Dirigenten
granskar resultaten utan rutinmässiga omkörningar och omprövar kostnaden kring
10 minuters verifiering. Uttryckliga användarkrav, hårda kontrakt, publicens
innehålls-/lagrings-/nätverksgränser och reproducerade buggar gäller fortfarande.
Ett historiskt gissat triangeltak motiverar ensamt ingen optimeringskedja.

Nedan följer daterade resultat och möjlig testtäckning, inte en obligatorisk
minimilista för varje ändring. Utöka gröna planer bara vid ny kod, fel eller
konkret materiell risk; ta bara om felaktiga kamerapositioner. Befintliga snabba
`npm test`/bygge och automatisk Pages-status kvarstår; dokument kräver ingen ny
livebrowserkontroll av oförändrad app.

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

`tools/place-picker-check.mjs BASE OUT` verifierar den byggda riktiga appen med orörd bundle/lagringsnyckel i isolerade browserkontexter: liten knapp (Området cirka110px, högst240px), minst44px kontroller, sju val med riktiga touchtryck vid 390/320px, popupens gränser/scroll i landskap, breakpoint960/961, Tab/Enter/Space/Arrow/Home/End, Escape/fokus/utanförklick, stängning vid resize, Digit/Numpad och faktisk takeResume. Start-/resume-/slutversion måste vara identisk genom kontrollen. Välkomstskärmen ska täcka knappen innan start. Slutkörningen och det äldre plats-/mark-/kollisionsprovet passerar; mobil är Chromium-emulering. Skärmbilder för liten knapp, öppen meny, smal skärm och välkomstvy granskas före publicering.

## Löst högskåp borttaget ur L1007:s toalett, #12

Originalets mörkgrå IKEA HAVBÄCK-högskåp i entréplanets badrum/toalett (`havback` i `src/interior.js`, `HAVBACK` i `src/config.js`, originalets #293) är lös möblering och byggs inte längre, varken som geometri, öppningsmål (`högskåpet`) eller kollisionsrektangel. Kommod, spegel, toalett, duschhörna och duschset finns kvar. Kontrollerade motsvarigheter: L1007:s övervåning (WC/dusch) hade aldrig skåpet; L1004 och L1201 använder `standardinterior.js`, som saknar skåpet; övriga hus A/B/C har ingen badrumsinredning med det. Verifierat i Chromium med skärmbilder före/efter och en gångprovning in mot hörnet: före stoppades kroppen vid z ≈ 7,03 av skåpet, efter når den väggen vid z ≈ 7,38.

## Egna touchknappar, #30

`CHROME_PATH=... node tools/touchcustom-check.mjs BASE OUT` kör det byggda `dist/` i mobil Chromium med CDP-touch. Den öppnar redigeraren från hjälpdialogen och flyttar spaken. Storlek ändras med reglage och nyp, och opaciteten sätts. Därefter kontrolleras att Avbryt kastar ändringarna, att en överdragning stannar inom säkra området och att speglingen flyttar spaken till höger och knapparna till vänster. Spara, omladdning, rotation och tillbaka samt Esc och Återställ standard (inga inlinestilar, lagringsnyckeln borttagen) testas också. En skalad spak ska fortfarande gå, och blockerad `localStorage` ska fungera under besöket. Datorn ska sakna ingången och ignorera en sparad layout. Originalets nyckel ska vara orörd. Ingen browserexception eller extern begäran tillåts. Detta är Chromium-emulering, inte en fysisk telefon. Emulerade dragningar vilar 200 ms före lyft, annars äter Chromiums kvarvarande fling nästa tryck.

## Gå och titta samtidigt på mobil, #31

`tools/browser-check.mjs` håller i mobil 390×844 spaken framåt med en CDP-touchpunkt och drar samtidigt med en andra i vyn, i båda ordningarna: kameran ska vrida exakt 1,3 × 0,0026 rad per px medan besökaren går fullt, och när ena fingret lyfts fortsätter det andra (spaken går vidare utan vridning, eller vyn vrids vidare utan gång). CDP:s `touchEnd` anger de punkter som lyfts. Spakens storlek och knoppens väg följer originalet (bas = 2 × väg + 12 px), så kontrollerna räknar vägen som (bredd − 12 px) / 2. Detta är Chromium-emulering, inte en fysisk telefon.


`CHROME_PATH=/sökväg/till/chrome node tools/patio-decor-check.mjs http://localhost:8157 /tmp/kvarteret-patio` körs mot källkoden på lokal server (#35). Den kontrollerar grannarnas möblerade uteplatser på Hus L:s gårdssida: alla utom L1007 möblerade med olika stilar, deterministiska layouter, fri dörr, passage och häck, växtkronor innanför skärmväggarna, stolar vända mot bordet, två sammanslagna meshar inom triangelbudgeten och att grinden döljer dem från gatan och på långt avstånd. Skärmbilder ovanifrån och från gården sparas och granskas.

`CHROME_PATH=/sökväg/till/chrome node tools/startup-error-check.mjs http://localhost:8157 /tmp/kvarteret-startfel` körs mot både `dist/` och källkoden (#37). I dator och 390×844 avbryts programfilen, avbryts `data/plan.json`, saknas WebGL och är planritningen trasig JSON; varje fall ska visa ”Fel i steget ”…”: …” med rätt steg och orsak över en fungerande Försök igen (avbruten plan startar den riktiga scenen efter omladdningen), utan CSP-fel. En vanlig start visar inget felmeddelande. Sedan #39 ska en vanlig start byta stegtext i ordning (Hämtar programfilerna, Startar 3D-grafiken, Hämtar planritningen, Bygger huset, Bygger trapphus och garage) med rörligt livstecken och förloppsstapel som rör sig inne i husbygget; stegraden försvinner när starten är klar eller felkortet visas. En kvarhållen `data/plan.json` med sänkt `stallMs` och en verklig 3 s blockering av huvudtråden ska frysa livstecknet och därefter visa ”Det här tar ovanligt lång tid.”, vars Försök igen laddar om till en fungerande start. Skärmbilderna granskas.

`CHROME_PATH=… node tools/importretry-check.mjs http://localhost:8157` (#170) kontrollerar omförsöket av startimporten: normal start gör en begäran; en första begäran som ger 404 eller avbryts ger ett nytt försök med `r=1` och den riktiga scenen startar; ihållande 404 ger en omladdning per session och därefter felkortet; ett hängt import räknas som fel bara medan inget laddas klart och bara under ”Hämtar programfilerna”. `startup-error-check.mjs` (avbruten programfil) tar därmed längre tid (omförsök, omladdning) innan felkortet visas.

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
batcher. Triangeldelta är35800 i dessa yttervyer och 26000 i övriga. Publicdocs har
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
fotkanter och 2m-apronprober för Sankt Lars väg41/45 kontrolleras. Gamla46-raders GLO
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

56sydliga stolpfötter och 224poolhörn följer ritad mark inom2,18/3,48µm.21plattformar
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

## Södra vägbanken och GC-anslutningar, #99

Källa `a0c66ef68ee78dcae68f5c3dd0aeb1a5d7bd59bc`; publik bas
`e79f47327eee78cfb71822cf6d7473bd938f1f29`. `node --test tools/southbanktest.mjs
 tools/southpointtest.mjs tools/southplateautest.mjs tools/paddockgeotest.mjs`
passerar27/27. Ett prov med vinklad referensterräng kontrollerar även den selektiva exakta
triangelkrokens höjder och areabevarande8m²-fotavtryck. Elva väg- och50tvärsektionspunkter matchar den bevarade77-punkts-
exporten. Provet skiljer de fem tvärsektionernas båda sidor, kontrollerar monotont
krön/platåförbindning, lokala kanter/fade, alla tio platåreferenser och oförändrat
antaget däckdatum−3m. #106:s befintliga fot-/apronprov är oförändrade och gröna.
Källans post-pad-overlay underkändes eftersom41:s norra fot sänktes0,211755m;
den publika pre-pad-anpassningen behåller samma förankrade1,83m-plan.

`tools/southbank-check.mjs BASE OUT [BEFORE]` bygger riktig World på1280×800 och
390×844touch. `BASELINE_REF=e79f47327eee78cfb71822cf6d7473bd938f1f29` fryser alla
publika källmoduler med Playwright-routing utan att importera originalhistorik.
Båda profilerna går verkligt över vägbron och GC-bron i båda riktningar, inom
publicsidans gamla gånggräns. Slutpunkterna uppnås inom0,2m och landar exakt på
`groundY`; vägkrönet vid sista kontrollen är0,597610m i stället för tidigare
−1,774534m. GC-anslutningen landar på−0,300896m mot tidigare−3,046884m.

För z155/165/180 är krönet−0,325/−0,225/−0,020m, västsidan
−4,355/−4,115/−4,025m och östsidan−3,621667/−3,175/−2,525m. De separata
lägre slänterna syns i parade väst-/östbilder, med väg/GC-anslutning, ovanifrån
samt hagen. Höjderna är relativa marktolkningar, inte broinmätning eller ådjup.

Bankens källbundna laterala stöd, fade och kartlagda gren plus angränsande
coarse-cellskanter används som skyddsmask.54 968 utanförliggande Float32-positioner
har exakt samma SHA256 före/efter:
`0e8ee8e620d00e9fedd99c73de8f38131792e44a5dd02a6c74363243484dad0a`.
Terrängens79 318trianglar och betong-/stål-/vatten-/träbropositionerna är bytebevarade.
Det gamla hela nordhashkravet inkluderade själva banken och ändras därför avsiktligt.
Efter99 är det nya hela nordhashvärdet för samma50 232positioner
`75b9dc296b0450819a10d8f3a5080aaee5b3b5a62b954ee51bb78aef9bfd3fe5`.
Första körningen av det historiska hashkravet underkändes och är bevarad i
`plateau.log`; `plateau-final.log` passerar18/18 med det nya referensvärdet.

Väg/GC-prov omfattar faktiska emitterade asfalttrianglar skurna mot befintlig finterräng,
med riktiga topprays vid styckvis plana extrempunkter. Dessutom samplas hela de avsedda
väg-/GC-bredderna:4 299/516rays per profil, inga saknade asfaltträffar. Detta verifierar
både ytinträngning och hål. Hörnprov är separat:288emitterade GC-hörn följer
max(gångmark,ritad mark)+25mm inom4,42µm. Terrängray och renderedTerrainY stämmer
inom0,293µm i bankens kontrollnät. De inre exakta LM-referenserna är fortfarande samma.

Pixelprovenans vid(481,553) i road-join-bilden visade site-terrain över south-land
på kartlagda asfaltvägen145221590 vid(31,297;154,664). En lokal fin-grid-koppling ensam lämnade13,89mm inträngning; exakt klippning mot
en lokal/coarse grid var också otillräcklig på stråkens andra redan förfinade delar
(87,95mm). Båda underkända loggar bevaras. Bara de två kopplade GC-stråken väljer nu
den granskade exakta triangelkroken från9eb4ccfadfdf0ffd26ae7a20dfc1e3e50c22d1b8
med hela deras befintliga surfaceGrid; bilden med dold terräng är diagnostik, inte slutbevis.
Befintliga vita trottoarhack/överlapp dokumenteras separat i#124. Inga nya globala
budgetar eller större gränser har införts. Prestandadeltan avser hela World efter
separata laddningar med dynamiska miljömodeller, inte isolerade kostnadsmätningar.

Råloggar och parade bilder: `/tmp/lunden-orchestra-20261021/artifacts-99/`,
`before/`, `final/`, `native.log`, `final-world.log`, `plateau-final.log`,
`bridge.log`, `farwalk.log`, `built/`; diagnostiken finns i `diagnostic.json`
och `diagnostic-{before,hidden}.png`. Träbrons prov bevarar exakta toppositioner,
8/8sidorays och7,08µm nederkantssöm samt vatten under bron. Verklig långgång24/24
passerar. Ingen kontroll här påstår fysisk telefonprestanda.

Slutlig World passerar18/18 (9per profil).3371väg-,2924GC- och5432kartlagda
GC-asfaltextrempunkter per profil ger minst8,849/3,533/24,997mm fri höjd till
faktisk terräng. De två exakta GC-stråken behåller därmed25mm-lyftet inom3,0µm.
Inga hål i de4299/516avsedda väg-/GC-breddproberna. I ordningen väst/öst/
väganslutning/GC-anslutning/ovanifrån/hage är de sparade slutmätningarna:
desktop: oförändrade56/148/50/48/921/51ritanrop, triangeldeltan+2089/2117/2117/2089/2089/2117.
mobile: oförändrade40/52/36/36/96/28ritanrop, triangeldeltan+2089/2117/2117/2089/2089/1763.
Ingen mesh/materialbatch tillkommer; samma79 318terrängtrianglar och oförändrade
komponenttak. `npm test` granskar86moduler och `npm run build` ger
`4e914d7f27ebd236904c5816`. Byggd faktisk dator/mobil-browserkontroll passerar
med riktig gång/dörrar/touch, orörd originallagring, inga JavaScriptfel och inga
externa anrop. Övriga redan gröna bro-/långgångsprov har inte körts om utan orsak.

## Hållplatsens faktiska plattform och taktila yta, #113

Källa `397ce2652aca30e7a2787dbb48a3b227741ae98e`, publik bas
`b81cc49a85dbf8b1f1c11994bc7497befd22fa83`. `node --test
 tools/busstopplatformtest.mjs tools/busstopgeotest.mjs` passerar9/9: faktisk
uppdelad geometri över vinklad referensterräng, oförändrad yta/gränser/lyft, uppåtvända
normaler, prioritet för `surfaceGrid`, fungerande grid-fallback och oförändrad1m-fallback
utan grid. Det gamla hörnprovet korsar bevisligen referensytans veck.

`CHROME_PATH=… node tools/busstop-platform-check.mjs http://localhost:8257 OUT BEFORE`
passerar8/8 totalt på1280×800 och390×844touch. `BASELINE_REF=b81cc49a85dbf8b1f1c11994bc7497befd22fa83`
fryser den gamla publika källan för riktiga parade före/eftervärldar.60faktiska
ytriangelmittpunkter och732fullbreddsprober per profil jämförs med oberoende topprays
mot verkliga terräng-/plattformmeshar. Före fanns6,593004cm mark över plattformen vid
fullbreddsproberna (och 4,120875cm vid de gamla56triangelmittpunkterna). Efter finns
inga hål/intrång: min3,999926cm och max4,400014cm frihöjd, med samma gamla lyft.

Båda verkliga gångriktningarna längs den fria delen av plattformen tar714uppdateringar
(1/60s) och kommer inom0,195172m från målet, helt inom publicsidans befintliga WALK.
Samtliga tidigare kerbpositioner och hållplatsens övriga möbel-/glas-/skyltgeometri
samt kollisionssegment har identiska hashar före/efter. Detsamma gäller hela
site-terrain, south-land (inklusive #110/#99-asfalt), brovatten och träbro.
Fotavtrycket är samma21,235171×3,6m rektangel inom Float32-noggrannhet.

Plattformsmeshen har152→156trianglar (beläggning44→48, taktilyta12oförändrad,
kantstenar oförändrade). Hela hållplatsen394→398trianglar; exakt samma4meshar,
4material och1textur. I ordningen första änden/andra änden/översikt behålls
desktop33/108/42anrop och mobil33/49/33anrop, med exakt+4trianglar i varje
parad vy. Inga nya batcher, material, texturer eller höjda budgettak.

`npm test` granskar86moduler, `npm run build` ger `28ba69c341e5cd81e3a57ccb`.
Byggd dator/mobil-browserkontroll granskar riktig gång/dörrar/touch, originallagring
och nätverk. Artefakter: `/tmp/lunden-orchestra-20261021/artifacts-113/`, särskilt
`before/`, `final/`, `native.log`, `final-world.log`, `npm-test.log`, `build.log` och
`built/`. Bilder visar båda ändar och översikt på båda profilerna och har granskats;
Chromium/SwiftShader, inte fysisk telefonprestanda.

## Loggiaöppningarnas verkliga passager (#114)

Källa `14530bfe11fe8958068ed36f992feffd26c368ea`, publik före-bas
`ec420445b79f85076667b5aa6527cc373fecf5fd`. Native:
`node --test tools/segmentopeningstest.mjs` —4/4: exakta kvarsegment och
riktning, vertikal/horizontal öppning, överlappande/reverserad intervallunion,
klippning vid segmentänden, icke-kollineära orörda väggar och samtliga tolv
befintliga A/B/C-intervall på exakt0,85m.

`tools/loggia-walk-check.mjs` kör den publika visningens riktiga `Navigation` i
Chromium, dator1280×800 och mobil390×844 med touch. Varje öppning provas in och
ut genom72riktiga uppdateringar à1/60s, från0,8m utanför/innanför fasaden. Före
stoppar alla24rutter0,22m före fasadlinjen. Efter går alla24rutter1,12m förbi
linjen (1,92m gång); även C:s östra vertikala öppning. Ingen rutt hamnar under
marken. Slutpositionens golv är exakt den befintliga `groundY`:0m eller−3m.
De fyra norra A/B-loggiornas åtta riktningar startar och slutar vid levererat0m-golv.
Ingen support eller golvpatch har tillförts. Tolv angränsande solida väggpartier
stoppar fortfarande0,22m före linjen. Hus L:s båda separata rutter går1,92m vid0m.

Före/efterkontrollen väntar första riktiga renderframe och fryser sedan
animationen. Klockan fryses till samma datum/tid, så tornklockans
rörliga instansmatris inte förväxlas med en byggändring. Alla502positions-/normal-/
UV-/index-/instansarrayer i omgivningsgruppen (27 292 216byte) jämförs med SHA256,
liksom samtliga öppningsändpunkter. Parade vyer visar A:s norra öppning och C:s
östra öppning från vanliga kameror ovan mark. Alla fyra parade PNG-filer är
byteidentiska. I ordningen A-norr/C-öst behålls dator104/85anrop och
543257/499650trianglar; mobil93/78anrop och522385/472232trianglar.
Delta är0trianglar och0anrop; inga material, texturer eller budgettak tillkommer.
Ingen visuell kod ändras.

`npm test` granskar87moduler; `npm run build` ger `0302497310cd80fe414b8b9b`.
Byggd dator-/mobilkontroll testar verklig gång, dörrar, hissar, touch, nätverk och
isolerad lagring utan fel eller externa anrop. Artefakter:
`/tmp/lunden-orchestra-20261021/artifacts-114/`, med `native.log`,
`npm-test.log`, `build.log`, `built-browser.log`, `built/`,
`before-valid/`, `final-valid/` och deras råloggar. Chromium/SwiftShader används;
fysisk mobilprestanda har inte mätts.

## Kompletta pergolalampgrupper och publik mätning (#115)

Källa `426f9922f1dbf5e129af568af9cd2e09df352e57`, publik före-bas
`13e3efe60b4cb6ff2798a4688a136199864e275c`. Native:
`node --test tools/ceilingbatchtest.mjs` —7/7, inklusive befintliga konservativa
helbox-/tak-/hål-/kant-/kamera-/skugg-/warmup-prov, explicit förbud mot att
kombinera olika takrektanglar och kompletta faktiska pergolaenvelopper.

`tools/ceilingbatch-check.mjs` granskar alla lampobjekt, inte sista träffen med
samma namn. Riktig World körs på1280×800 dator samt390×844 och844×390 touch.
Den tidigare källmodulen laddas oföränderligt med `BASELINE_REF` för parade
före/eftervärldar. För att även köra riktig Garage/Core-livscykel exponerar
verktygets testrespons publicappens befintliga `frame`/klocka i debugobjektet,
med fast1/60s-steg. Endast hagens slumpade gräsfrö hålls till11521021 i
båda testresponserna, så skilda sessionsbetningar inte förväxlas med lampkostnad.
Produktkoden ändras inte för detta. Vanlig opåverkad app provas också med browserkontrollen. Varje vy placerar riktiga Navigation, kör
samma frame och dess normala uppdateringar; ingen syntetisk garage-synlighet.
Källare/hall har fötter−3m, ögon−1,38m och `below=true`; takkant/utomhus har
fötter0m/ögon1,62m, och C:s öppna kärna har befintligt källargolv−3m.

Samtliga272instansmatriser jämförs i sammanlagd ordning;152+120instanser delas
på två kompletta pergolor. Alla sfärens positioner/normaler/UV/index är identiska,
och båda grupper delar samma geometri och material i minnet. Bounds inkluderar
0,03m sfärradie samt sista tvärradens0,12m z-offset; höjd2,420000..2,830000m.
Publika callbacken `world.windowLights.update` provas med dag, natt och
strömavbrott: färg0x2a2620→0xffd08a→0x2a2620, båda grupper samtidigt. Appens
vanliga start är dagläge; inget nytt natt-/strömgränssnitt eller system tillkommer.

Takfilter jämförs exakt med faktisk `GARAGE.rects` för gemensamma A/B/C/L,
med samtliga `core`/`outside`-öppningar kvar. Samma5mm-marginal och en enda
hel rektangel krävs, utan kombination av mindre rektanglar. Båda batchers
layer0/7, ursprunglig geometri, `visible` och fysiska0|7-strålar granskas.
Per-kamera återställning till0, skuggkamera och all-layer-warmup-mask bevaras.

Publicappens riktiga visuella mått-/interaktionscaster använder layer0. Verktyget
aktiverar den riktiga mätknappen och Q-händelsen och jämför utsatt punkt med
första fysisk0|7-yta genom samma faktiska värld/garage/core. Källare, båda
pergolorna och öppen kärna provas; även legitim ingen träff/ingen punkt räknas.
Ingen ray-policy ändras. Byggd browserkontroll testar också verkliga E-dörrar,
gång, hissar och både telefonlayouterna, utan JavaScriptfel eller externa anrop.

Historiska #108:s formulering att en bred världsbox aldrig kan döljas var för
stark: projektionen från kameran avgör. I dessa prov är redan den gamla gruppen
dold under källar-/halltaket; där tillskrivs #115 ingen besparing. Frustum- och
ocklusionsvinster redovisas endast i faktiskt parade vyer nedan.

Kostnadsdiagnos: `renderer.shadowMap.enabled` ärfalse i publicappen. Tidiga
varierande råtotaler berodde på två `streetLampPools` à18780trianglar som
fortfarande tonade ut efter provets natt/på/av-anrop, samt sessionens olika
`paddock-grass`-antal (exempel8499/8497instanser,33996/33988trianglar).
Lampstyrningsprovet sker därför efter parade bilder/mått; en fast gräsdomänseed
används för själva jämförelsen. Varken gatulampor eller hage ändras i produkten.
`diagnostic-before/`, `diagnostic-final/`, `before-real/`, `final-real/` och
`before-pass/`/`final-pass/` behåller råspår med namngivna huvudpassritningar.

Slutlig matchad jämförelse ligger i `before-matched/` och `final-matched/`:
24/24kontroller gröna, och samtliga18parade PNG-bilder är byteidentiska.
I ordningen källare/hall/pergolaA/pergolaB/takkant/kärnöppning är triangeländringen
0/0/−9600/−12160/−12160/−12160; ritanropsändringen är0 i varje parad vy.
Huvudpasset mäts genom faktiska `renderBufferDirect`-anrop med objektnamn, inte
uppskattning från bounds. Under taket ritas inga pergolalampor vare sig före
eller efter. Ute ritas gamla gruppens21760lamptrianglar mot12160förA eller
9600förB. I öppningsvyn är nya maskerna128/1; den gamla hela gruppen har1.
Frustumvinsten för de mindre grupperna hålls åtskild från den konservativa
takgaten: ingen ny underjordisk besparing utlovas av dessa prov.

De272instanserna kostar samma17 408byte matriser totalt; sfärens geometri och
material finns fortfarande i en delad kopia. Objektantalet ökar med en
InstancedMesh och en gate; om båda pergolor samtidigt syns kan båda batcher
behöva ritas. Inga nya material, texturer, privata prestandaprofiler eller
höjda budgettak har införts. Originalets återstående helspelsbudget följs separat i original#1439;
publicsidans befintliga kontrollkrav behålls.

`npm test` granskar87moduler; `npm run build` ger `8b37574c3508913624710afd`.
Ordinarie opatchad byggd browserkontroll passerar E-dörrar, gång, hissar, touch,
isolerad lagring och nätverk på dator och båda telefonlayouter. Artefakter:
`/tmp/lunden-orchestra-20261021/artifacts-115/`, särskilt `native.log`,
`npm-test.log`, `build.log`, `built-final-browser.log`, `built-final/`,
`before-matched/`, `final-matched/` och deras råloggar. Chromium/SwiftShader,
ingen fysisk telefonprestandamätning.

## Hela fasta takterrassräcken (#118)

Källa `41447a8f7f3397f3e2553e6794fe578aef7a71bf`, publik före-bas
`2b2b6b51753c3fb40ef1f2f2a0829bbd71100be4`. `tools/terrace-rails-check.mjs`
kör faktisk World på dator 1280×800 och Android Mobile UA i både 390×844 och
844×390. Den uttryckliga UA:n behövs: enbart Playwrights `isMobile`/touch väljer
inte automatiskt publicappens `lowMemory`-gren. Grenen kontrolleras som false på
dator och true på båda telefonprofilerna.

18/18 kontroller passerar. Datorns tidigare enda räckesmesh blir nio hela
källterrasser och två hela gavlar (11 meshar), med ett delat material.
Telefonen behåller exakt en mesh. Verkliga ordnade arrayer jämförs sammanlagda:
54 216 Float32-värden för position, 54 216 för normaler och 36 144 UV-värden, totalt 578 304
byte och 6 024 trianglar. Attributen är fulla, inte tömda CPU-arrayer; dessa
räcken använder exteriors direkta merge och kräver ingen `keepgeo`-override.
Index är fortsatt null. Unionen av boundingboxarna är exakt identisk:
x −41,724998..11,550000, y 9,750000..10,560000, z 10,799000..12,629000 m.
Materialtyp, färg, roughness 0,45, metalness 0,2, sida, opacity, transparent,
depthWrite och avsaknad av textur är identiska. Telefonens hela ordnade
buffert-/bounds-/flaggsnapshot är dessutom exakt identisk med dess egen före-bas.

33 oberoende positiva fysiska strålar (tre på varje terrass och tre per gavel)
träffar samma faktiska ytor före/efter. Två vanliga perspektivkameror och två
vanliga ortografiska skuggkameror granskar frustumsfärerna vid båda gavlarna:
exponerad hel terrass/gavel behålls, övriga grupper kan väljas bort utan
lagermutation. `frustumCulled`, `castShadow`, `receiveShadow` och layer 0 är
bevarade på samtliga meshar. Public renderer har skuggkartor avstängda;
ingen visuell skuggjämförelse påstås.

Riktiga publika Navigation och befintlig frame/Core/Garage-uppdatering används
med samma fasta 1/60 s-steg och Date som i #115. Endast hagens gräsdomänfrö
hålls till 11521021 i båda testresponserna; inga produktkällor får determinism.
Kamerorna på takterrasserna har fötter på befintligt 9,46 m-däck, ögon 11,08 m;
källar-/hallvyerna har −3/−1,38 m och den exponerade markvyn 0/1,62 m.
Samtliga 18 parade PNG-bilder (sex vyer per profil) är byteidentiska och
visar väst-/östterrass, gavel/takkant, exponerad räckesvy, källare och hall.

Faktiska huvudpassritningar i ordningen västterrass/östterrass/gavel/exponerad/
källare/hall ger på dator:

| Vy | Ändrade ritanrop | Ändrade trianglar |
| --- | ---: | ---: |
| Västterrass | 0 | −5 364 |
| Östterrass | 0 | −5 364 |
| Gavel | +1 | −5 160 |
| Exponerad | +6 | −2 112 |
| Källare | −1 | −6 024 |
| Hall | +7 | −1 488 |

Båda telefonprofilerna har exakt 0 ändrade anrop och 0 ändrade trianglar i
samtliga sex vyer. Datorns uppdelning byter mindre triangelytor mot fler anrop
i vissa vyer; båda kostnaderna redovisas. Samma totala attributbytes, ett
material och inga nya texturer; datorn får tio extra mesh-/geometryobjekt.
Ingen ny gate, avståndsregel, kvalitetsändring eller höjd budgetgräns införs.
Originalets helspelsbudget är separat och används inte som publik mätning.

`npm test` granskar 87 moduler; `npm run build` ger `87ee407bc7eb7a70e2de9bed`.
Ordinarie opatchad byggd browserkontroll passerar riktig E-dörr, gång, hissar,
mätreglage, touch, isolerad lagring och nätverk. Samma kontroll passerar också
med `MOBILE_UA` för verklig Android/lowMemory, utan JavaScriptfel eller externa
anrop. Ingen separat testhelper i produkten behövs; geometri/frustum/rays provas
mot riktiga Three-objekt. Artefakter:
`/tmp/lunden-orchestra-20261021/artifacts-118/`, särskilt `before/`, `final/`,
`before.log`, `final-world.log`, `matched-summary.json`, `npm-test.log`,
`build.log`, `built-browser.log`, `built/`, `built-phone-browser.log` och
`built-phone/`. Chromium/SwiftShader, ingen fysisk telefonprestandamätning.

## Hela uteplatshäckars submission (#119)

Källa `117851d7c2ed1cfefcef5dfbc52223d158b1e1d8`, publik före-bas
`47eeb85f0d88290638bd0c6fc8b92f29ff34b8f9`. Faktiska Worldprov i
`tools/patio-hedges-check.mjs` kör dator 1280×800 samt Android Mobile UA i
390×844 och 844×390, med uttrycklig kontroll av lowMemory false/true/true.
Telefonernas enda sammanslagna batch behålls; datorn får de åtta befintliga
hela källorna, utan ändrad form eller ny cullingpolicy.

Varje faktisk datormesh jämförs med sin kanoniska publika `patioHedgeGeometry`
från planens häckrektangel och riktiga layoutförskjutning. Samtliga ordnade
position/normal/UV/color/hedgeLow-värden är exakta även sammanlagda mot före-bas:
112 032 Float32-värden vardera för position, normal och color, 74 688 för UV,
37 344 för hedgeLow; totalt 1 792 512 byte, 12 448 trianglar och fortsatt
null-index. Fulla CPU-arrayer granskas, inte tomma attribut. Unionbounds är
exakt x −40,213501..11,041300, y 0,019029..1,129126, z 16,799168..17,602558 m.
Telefonernas hela ursprungliga ordnade batch-/bounds-/material-/flaggsnapshot
är identisk. Samtliga #118-räckens ordnade attribut och gruppantal är oförändrade.

Samma ursprungliga material delas av alla åtta meshar. Färg, leaf/bump-textur,
vertexColors, shaderpatchens funktion/cachekey `hedge-form-1143`, roughness,
bumpScale, side/opacity/depthWrite och texturstorlek är identiska. Färger och
hedgeLow följer varje hela källa och shaderns bakade positionskoordinater ändras
inte. Publicens `customDepthMaterial` och `customDistanceMaterial` är båda null
före/efter; inga privata depth-/vindadaptrar kopieras. `visible`, castShadow,
receiveShadow, frustumCulled och layer 0 bevaras. Riktiga perspektiv- och
ortografiska skuggkameror kontrollerar vanliga frustumsfärer. Public renderer
har skuggkartor avstängda; ingen visuell skuggjämförelse påstås.

24 oberoende positiva fysiska strålar (tre per källa) träffar exakt samma ytor
och avstånd. Riktig publik Navigation går mot egen och grannens häck i båda
riktningarna med KeyW i 72 steg à1/60 s, utan påhittat stöd eller ändrad
kollision. Alla fyra rutterna stoppas exakt 0,22 m från den befintliga
rektangeln med fötter 0 m; start/slutpositioner är identiska före/efter.
Den befintliga frame/Core/Garage-uppdateringen och Date/gräsdomänfrö följer
#115/#118:s redovisade testupplägg; produktens tid och slump ändras inte.

Slutliga parade bilder använder `before-valid/`/`final-valid/`; den första
provade hörnkameran bakom en tät uteplatsskärm sparas bara som rådiagnostik i
`before/`/`final/`. Den slutliga kameran visar häckens exponerade vänsterände
från den riktiga uteplatsen. Alla 18 slutliga parade PNG-filer är byteidentiska:
egen häck, grannhäck, hörn, utsida, källare och hall på samtliga tre profiler.
21/21 slutliga kontroller passerar.

Faktiska huvudpassritningar ger följande datortradeoff:

| Vy | Ändrade ritanrop | Ändrade trianglar |
| --- | ---: | ---: |
| Egen häck | 0 | −10 892 |
| Grannhäck | 0 | −10 892 |
| Hörn/ände | +1 | −9 336 |
| Utsida | 0 | −10 892 |
| Källare | +1 | −9 336 |
| Hall | +7 | 0 |

I hallvyn behålls alla åtta källor i frustum: samma 12 448 häcktrianglar kräver
åtta anrop i stället för ett. Detta är en redovisad nackdel, inte en uppmätt
FPS-vinst. Båda telefonprofilerna har exakt 0 ändrade anrop/trianglar i varje
parad vy. Totalt samma attributbytes och ett delat material; datorn får sju
extra mesh-/geometryobjekt, utan nya texturer eller höjda budgettak.
Originalets separata fullspelsbudget är inte ett publikt mätresultat.

`npm test` granskar 87 moduler; `npm run build` ger `14d90e7eaefbd1270fc27344`.
Ordinarie opatchad byggd dator-/Android-UA-browserkontroll passerar riktig
E-dörr, gång, hissar, mätreglage, båda touchlayouter, isolerad lagring och
nätverk utan JavaScriptfel eller externa anrop. Artefakter:
`/tmp/lunden-orchestra-20261021/artifacts-119/`, särskilt `before-valid/`,
`final-valid/`, deras råloggar, `matched-summary.json`, `npm-test.log`,
`build.log`, `built-browser.log` och `built/`. Chromium/SwiftShader,
ingen fysisk telefonprestandamätning.

## Södra trottoarens korsande ytor (#124, 2026-10-21)

`tools/pavement-check.mjs` jämför verkligt emitterade ytor mot publik bas
`d0ff7993234463f8de660a65fd9819c2a37dead6`. Profiler: dator 1280×800,
Android-UA/lowMemory 390×844 och 844×390. Nio parade före/eftervyer visar
väganslutningen från båda sidor och GC-anslutningen. Testresponsens fasta
klocka/steg och enbart hagens gräsdomänfrö följer #115; produktionen ändras
inte. Publikens skuggkartor är avstängda. Vanlig byggd browserkontroll och
Android-UA-kontroll körs också utan geometri-/slumpinstrumentering.

Rotorsaken är trottoarens gamla quad-veck och park-/GC-/södra asfalt som
överlappade dess planprojektion på nästan samma höjd. Ursprungliga 3 440
väg-/trottoarprov hade däremot inga överlapp mellan fordonsasfalt och
vit trottoar. Ursprungliga trottoarcentroider avvek −15,68..+2,04 cm från
sin egen analytiska sampler; slutnätet avviker −20,83..+1,50 cm. Exakta
marktriangelsnitt innebär alltså inte exakt interpolation av den
icke-linjära analytiska max-samplern; några sådana avvikelser blir större.

Slutresultat: 12 740 fotavtrycksprov utan överlapp mellan vit trottoar och
alla fyra asfaltfamiljer. 3 499 fullbreddsprov har inga hål eller terräng
ovanför gångytan. Faktiska triangel-/terrängsnitt och centroider ger
3 945/3 009/3 340/11 337/2 697 prov för trottoar/väg/GC/park/södra asfalt;
minsta frigång är 8,00/8,85/8,00/5,83/8,00 mm. Dessa prov omfattar även
parkasfalten där en tidigare prototyp skapade en grön spricka.

818 direkta gemensamma kantträffar överensstämmer inom −3,58/+3,82 µm.
Delade noders T-kantsprov ger 0 avvikelse på trottoaren och högst 1,79 µm
på södra asfalten. Den färdiga synliga övergången saknar prototypernas
centimeterstora veck. En liten synlig södra restyta vid (29,251;150,850)
har fortfarande lutning 1,593 över 2,44 mm, höjdskillnad 3,89 mm och area
2,40 cm²; nästa större provyta har lutning 1,126. Parkens extrema numeriska
restyta har area 0,0282 cm² och 0,462 mm tvärhöjd. Det är inte ett påstående
att varje numerisk triangel understiger publikens `WALK.maxSlope=1.2`.
GC:s högsta synliga provlutning är 0,828 och trottoarens 0,640.

Terrain, betong, stål, vatten, träbro, hela fordonsvägen och övriga ytor
utanför fasta granskningsrutan x=13..36, z=143..192 har identiska
positionshashar. Södra asfaltens exteriör får ekvivalent underindelning,
inte identisk triangelordning. `tools/pavement-exterior-probe.mjs` sparar
verkliga färgseparerade buffertar; `tools/pavement-exterior-check.mjs`
jämför båda riktningarnas slutna fotavtryck och källplan. Noll saknade
slutna prov, högsta planfel 0,230/0,194 µm, kvarvarande numerisk area
0,151/0,119 mm² över 13,1356 m². Annan södra geometri/färg är byteidentisk.
Den råa rayavvikelsen 9,08 mm exakt på z=192 är en gammal angränsande
plankant: topmost-rays på kanten och ±1/2 Float32-koordinatsteg matchar
före/efter inom 4 nm. Kontrollens toleranser härleds ur koordinatupplösning
och randlängd; inga hål undantas. Vid ändrad södra primitivhash kräver
huvudverktygets före-jämförelse detta separata `EXTERIOR_PROOF`.

Riktig publik Navigation klarar sex rutter: båda riktningar över vägbron,
GC-bron och korsningen vid z=152,17, inom WALK-gränser och med oförändrad
ordinarie markfunktion. Fotens avstånd till synlig topmost-yta mäts också:
väg oförändrat 10,01/10,03 cm; GC 13,46/14,31→10,73/11,26 cm;
korsningen 62,45/63,19→35,57/38,71 cm. Punkt (17;152,17) förbättras
+64,66→+45,57 cm. Det kvarvarande analytiska/synliga höjdkontraktet är
separat #135, inte löst av denna rättning.

Trianglar före→efter: trottoar 10 338→10 113, park 4 072→5 749,
GC/broasfalt 178→1 020, södra batch 44 637→45 173, fordonsväg 4 775
oförändrat. Alla nio matchade vyer: +2 830 trianglar, 0 extra draw calls,
geometriobjekt eller texturer. Lokal nodinfogning bearbetar som mest 795
noder/594 polygoner per anrop. Testinstrumenterad hjälptid totalt
445/310/544 ms; goto→första frame före 15,414/16,046/14,683 s och efter
15,161/21,898/16,254 s. Detta inkluderar mjukvarurenderare och samtidiga
browserprov; baslinjen läser dessutom git-moduler. Det är en grov
startkostnadsredovisning, ingen kontrollerad prestanda- eller FPS-vinst.

`npm test`: 87 moduler; `npm run build`: `1f8fa0182a1ef809e91c763c`.
Råartefakter: `/tmp/lunden-orchestra-20261021/artifacts-124/`, särskilt
`before-final/`, `final-canonical/`, `matched-summary.json` (24 kontroller),
`exterior-equivalence.json`, `npm-final.log`, `build-final.log`,
`built-canonical.log` och `built-android.log`. Tidigare kataloger är
utredning/prototyper, inte slutbevis. Återskapa källjämförelsen med
`BASELINE_REF=d0ff799 CHROME_PATH=<Chromium> node tools/pavement-check.mjs <URL> <före>`
och samma kommando utan BASELINE_REF för efter. Spara exteriörerna med
`tools/pavement-exterior-probe.mjs <URL> <katalog>` och jämför deras
`desktop.json` med `tools/pavement-exterior-check.mjs <före.json> <efter.json> <bevis.json>`.

## Faktiskt lokalt gångstöd (#135, 2026-10-21)

Bas `4b22570ef661996b9ffac850609a4998b871a8d7`; dator 1280×800 och riktig
Android Mobile UA/lowMemory i 390×844 och 844×390. Testresponser håller
Date, befintlig frame och enbart hagens gräsdomänfrö fasta enligt #115.
Produktionens klocka/slump ändras inte. Skuggkartor är avstängda.

`tools/walking-support-check.mjs` kör faktisk World/Navigation, topmost-rays,
sex rutter och parade vyer. `tools/walking-support-compare.mjs` ger 21
kontroller PASS. Alla nio statiska anslutningsbilder är byteidentiska;
parade `walking-eye` visar däremot den riktiga kamerans nya, nedsänkta
fot-/ögonhöjd efter vanlig gravitationssättning. Terräng, brokonstruktioner,
vatten, träbro, hela väg-/trottoar-/park-/GC-/södra positionsbuffertar och
skyddad exteriör har exakt samma hash. Alla nio vyer har 0 ändrade draw
calls, trianglar, geometriobjekt eller texturer. #124:s samtliga fem
markfrigångsprov och överlappskontroller är fortsatt identiska/gröna.

Punkt (17;152,17) går från foten 45,57 cm över synlig parkasfalt till
avvikelse under 0,000001 mm (numerisk avrundning). De 504 kärnprov som
ligger söder om den uttryckligt bevarade däckkanten överensstämmer med
faktiska topmost-rays inom 0,000001 mm. Däckkantsproven redovisas separat:
Navigation behåller gammalt däckdatum; avståndet till broasfaltens ovansida
är som tidigare upp till cirka 2,25 cm.

Alla sex verkliga rutter når sina mål: vägbron båda riktningar, GC-bron
båda riktningar och park-/trottoarkorsningen båda riktningar. Korsningens
satta waypoint-fötter, inklusive gräsytan, förbättras från 82,77/78,16 cm
avvikelse till numeriskt noll. De tidigare rörliga asfaltproven var
35,57/38,76 cm; detta är olika provmängder och ska inte blandas ihop. Uppförgående rörelse följer ytan; nedförgående rörelse kan
fortfarande tillfälligt ligga 38,50 cm över ytan medan oförändrad gravitation
följer de befintliga 20/34 cm nivåkanterna. Detta är uttryckligen skilt från
satt fotstöd. Väg-/GC-rörelseprovens största lokala transienter är
0,29/4,15/4,47/3,81 cm. Ingen global gravitations-/steghöjdsändring döljer
skillnaden. Bro-/ruttpartier utanför kärnan behåller tidigare kontrakt.

`tools/walksupport-test.mjs` prövar verkliga Float32-plan, överlappande
stödlager, upp-/nedvänd orientering, bucket-/triangelkanter och alla fyra
rand-/hörnövergångar. `tools/walking-support-component.mjs` kör riktiga
Navigation mot kontrollerade emitterade plan via enbart testresponsens
fixture: 44 cm steg passerar uppåt, 46 cm spärras, nedåt och diagonalt
prövas i båda riktningarna, faktisk lutning 1,3 spärras av befintliga 1,2.
Åtta vanliga publika rutter genom övergångsringen når målet i båda
riktningar med satt markfel 0. Norrut används vägbron för att inte påstå
en gångrutt genom vattnet. Täta 21-punktsprofiler vid alla fyra ytterkanter
och fyra hörn jämför gamla/nya 0,3 m-lutningar: noll nya spärrar, exakt
oförändrad höjd på randen och högst 44,7 nm korrektion 1 mm innanför.
De två broarnas däck-/underpassquery är exakt oförändrade. Separata
låga offdeck-prov i kärna och ring använder samma stöd även när fötterna
är under −3,5 m; den gamla underpassgränsen får inte felaktigt byta till
rå mark utanför ett faktiskt däck. Utanför stödregionen bevaras äldre beteende.

Indexet behåller 5 669 uppåtvända lokala plan i 800 buckets; representativa
sökningar prövar i medel 20,37, som mest 262 kandidater. 10 000 kompletta
markqueries tar 35/62/45 ms i dessa tre mjukvarurenderade browserprofiler.
Det redovisar extra CPU/indexarbete utan FPS- eller fysisk telefonprestanda-
påstående; inga nya kvalitets- eller budgetgränser införs.

`npm test`: 88 moduler; `npm run build`: `3f40963b734f066566bbdf67`.
Ordinarie opatchad byggd browserkontroll med Android-UA provar dörr, gång,
hissar, mätreglage och båda touchlayouter, utan JavaScriptfel/externa anrop.
Råartefakter: `/tmp/lunden-orchestra-20261021/artifacts-135/`, särskilt
`before-matched/`, `final/`, `summary.json`, `component-final/results.json`, `component-lowbank-final/results.json`,
`native.log`, `npm-test.log`, `build.log` och `built-final.log`.
Återskapa med `BASELINE_REF=4b22570 CHROME_PATH=<Chromium> node tools/walking-support-check.mjs <URL> <före>`,
samma kommando utan BASELINE_REF för efter, och
`node tools/walking-support-compare.mjs <före> <efter> <sammanfattning.json>`.
Den äldre markapproximationen utanför kärnan och den kontinuerliga ringens
avsiktliga blandning ska inte förväxlas med exakt topmost-stöd överallt.

## Östcampusets hela puts-/listbidrag (#120, 2026-10-21)

Publik bas `0be15abfa6fa0cdd142e1397eff961749446b9ce`, selektiv källa
`35a75c93cefb1fc52ec8aa3fe8ce50fde418f432`. Dator 1280×800 och riktig
Android Mobile UA/lowMemory 390×844 samt 844×390 kör faktisk publik World.
`tools/east-campus-check.mjs` bygger oberoende kanoniska bidrag med de
oförändrade campus-/skolbyggarna, verkliga källpolygoner och World-recordens
base/bottom/eave. Nio campusbyggnader och klassiska NTI-skolan ingår;
NTI ligger i sista gruppen före 2/4/88. Ett första test som glömde NTI
misslyckades även mot baslinjen och sparas enbart som diagnostik.

Datorns tre hela källintervall är geometrier 0..4037, 4037..6841,
6841..12001: 15 580, 11 784 och 21 674 trianglar. Varje faktiskt intervall
har exakt samma ordnade positioner, normaler, färger och bounds som sitt
kanoniska fulla byggnadsbidrag. Unionen har 49 038 trianglar och
5 296 104 attributbyte. UV saknas i detta material både före och efter;
inga tomma attribut räknas som bevis. Andra östmaterial samt väst-/nord-
byggarnas fulla attribut och bounds är identiska före/efter.

Telefonens enda faktiska `east-modern`-batch är exakt oförändrad:
16 155 trianglar, 1 744 740 attributbyte, null-index, ordning, bounds,
flaggor och material. `?keepgeo` behåller fulla CPU-attribut enbart för de
matchade identitetsproven; riktig Android-UA ger fortfarande lowMemory.
Den ordinarie byggda telefonkontrollen körs utan keepgeo. Samma delade
materialobjekt, shader/cachekey, färger, roughness, custom depth/distance-
status, cast/receiveShadow, layer 0 och native frustumCulled bevaras.
60 positiva fysiska rays och oberoende perspektiv-/ortografiska skuggkamera-
frustums visar att exponerade bidrag behålls. Publikens skuggkartor är
avstängda; ingen aktiv skuggpass-/skuggbildsvinst påstås.

Matchade bilder använder fast Date, befintlig main.frame med 1/60-steg
och enbart hagens gräsdomänfrö enligt #115. Produktens tid/slump ändras inte.
Vanlig publik frame uppdaterar kamera, Navigation och övrig livscykel före
kostnadsprovet. Slutliga fem vyer är nordfasad, västfasad, tydlig östlig
hörn-/takände, hall och garage. Alla 15 bildpar är byteidentiska.
Den första östkameran blev en nära väggvy efter vanlig Navigation-räddning;
den gamla hörnkameran låg under en förgrundsyta. Dessa två kameror används
inte som slutbevis. Hörnet är omtaget separat från (138;15;−82) mot
(123;7;−64), med faktiskt uppdaterad ögonposition sparad i råloggen.

Egen publik renderkostnad, vyordning nord/väst/hörn/hall/garage:

| Profil | Ändrade anrop | Ändrade trianglar | GPU-geometrier | Texturer |
|---|---|---|---|---|
| Dator | +2/+2/+2/+2/−1 | 0/0/0/0/−49 038 | +2 i alla vyer | 0 |
| Android stående | 0 i alla | 0 i alla | 0 | 0 |
| Android liggande | 0 i alla | 0 i alla | 0 | 0 |

Fyra datorvyer får alltså två extra anrop utan triangelbesparing; garagevyn
slipper hela den gamla masterbatchen. Ingen snabbare FPS påstås.

Separat befintlig budgetreferens: den verkliga hela telefoncampusen,
inklusive klockans meshbarn, har 38 519 trianglar både före och efter mot
konfigurationens `CAMPUS_LOD.maxTris=36000`. Detta är inte ett godkänt
budgetprov och inte en införd ökning. Fältet används inte av produktens
runtime och avsedd omfattning behöver klarläggas i fristående #136; en
triangelräkning ensam påstår inte fysisk telefonprestandaförlust. Datorns
hela campus har oförändrat 80 178 trianglar. Inget originalbudgettak eller
nytt kvalitets-/avståndstak importeras eller höjs här.

`tools/east-campus-compare.mjs` ger 45 geometri-/regressionskontroller PASS
(17 dator, 14 per telefon); budgetavvikelsen ovan redovisas separat som
metadata, inte som ett grönt takprov. `npm test`: 88 moduler; build
`813c44faa8ca5186eb2741fd`. Ordinarie byggd dator-/Android-UA-browserkontroll
passerar gång, dörrar, hissar, mätreglage och båda touchlayouter utan
JavaScriptfel eller externa anrop.

Råartefakter: `/tmp/lunden-orchestra-20261021/artifacts-120/`, särskilt
`before-lifecycle/`, `final-lifecycle/` för nord/väst/hall/garage och
`before-edge/`, `final-edge/` för det giltiga hörnet, `summary.json`,
`npm-test.log`, `build.log` och `built-browser.log`. Tidigare kataloger är
utredning, inte slutbevis. Reproducera källparen med
`BASELINE_REF=0be15ab CHROME_PATH=<Chromium> node tools/east-campus-check.mjs <URL> <före>`
och samma kommando utan BASELINE_REF för efter. `POSE=edge` tar bara hörnet.
För de sparade separata hörnproven körs jämförelsen med
`EDGE_BEFORE=<före-hörn> EDGE_AFTER=<efter-hörn> node tools/east-campus-compare.mjs <före-livscykel> <efter-livscykel> <sammanfattning.json>`.
Chromium/SwiftShader är inte fysisk telefonprestanda.

## Fullständigt mobilbudgetkontrakt för östcampus (#136)

Kontrollen gäller hela `east-backdrop`, inklusive mark/access och alla klockinstanser,
precis som originalets `tools/eastbackdroptest.html`. `CAMPUS_LOD.maxTris` är en
asset-regressionsgräns, inte en validerad fysisk telefon- eller FPS-budget.
Original `fb629ce99b6ff9ec78d5f2eb22ad902e8fb8c2b2` (#589) angav uttryckligen
36000 som *gissning* efter minskningen 75351→33676. Publicimporten
`8c54ef1f0c0dbee3d7930fa8e2ac3e24fc51bfb8` behöll denna fullgruppsgräns.
Den äldre budgetavvikelsen noterad i #120 är nu utredd; dess geometri ändras inte.

| Publikt steg | Hela gruppen | Access | Förklaring |
|---|---:|---:|---|
| 8c54ef1f | 33676 | 6304 | ursprunglig mobilversion |
| fb34e48 | 33756 | 6304 | fungerande klocka, netto +80 |
| 7f6c358 | 45233 | 17781 | GLO-terräng |
| de29199 | 33511 | 6059 | exakta terrängceller för polygoner |
| 4b6648a, 2026-10-19 | 38459 | 11007 | #74: terrängriktiga gångvägar, gröna hål bort |
| 9b260ef | 38505 | 11053 | väganslutningar |
| 5eea435 | 38519 | 11067 | nuvarande, före #136 |

Den accepterade ökningen är 4843: access +4763 och klocka netto +80.
Gränsen blir därför 40843 = 38519 + samma ursprungliga absoluta marginal 2324.
Det är en granskad engångsjustering; framtida tillväxt får inte automatiskt höja
gränsen. `curve:3`, `roofGrid:2`, samtliga geometrier och markprecision bevaras.
Ingen arkitektur-only avgränsning eller privat desktopbudget används.

Reproducerbar full-SHA-/byggnads-/material-/resursledger finns i
[referensen](references/campus-budget/2026-10-21.json). Kör från reporoten:

```sh
node tools/campus-budget-counter-test.mjs
CHROME_PATH=/path/to/chrome node tools/campus-budget-history.mjs /tmp/campus-history 8c54ef1f fb34e48 7f6c358 de29199 4b6648a 9b260ef 5eea435
CHROME_PATH=/path/to/chrome node tools/campus-budget-check.mjs http://localhost:8257 /tmp/campus-budget
```

Historieprovet bygger enbart publika gitreferenser. World-provet kör vanlig
Android-UA i 390×844 och 844×390, utan `keepgeo`, med fast testdatum/bildsteg
och endast haggräsets domänseed fixerad i testsvar. Produktionsslump ändras inte.
De 16 hela byggnadsbidragen, access och klockans 4 urtavlor/8 visare summeras
oberoende. Räknaren använder index när det finns och multiplicerar instansantal,
även noll; nativeprovet täcker dessa fall. Både detta prov och #120:s befintliga
campusprov upprätthåller nu fullgruppsgränsen i mobil-läge.

Båda Android-formaten mäter 38519: arkitekturbatcher 27308, access 11067,
klocka 144. Tio geometriobjekt, tio material och fem unika texturer används.
Alla 4065292 byte vertex-/index-/instansdata korreleras med observerade inhemska
WebGL `bufferData`-uppladdningar. Detta är inte total VRAM; texturernas redovisade
mått är CPU-källbilder efter uppladdning, inte GPU-allokeringar. Nära campus
ritas 8 egna anrop/38375 trianglar; i fjärrvyn 10/38519 inklusive klockan.
Publika skuggor är avstängda. SwiftShader-mätningar ger ingen fysisk FPS-slutsats.

Före/efter i båda faktiska Android-formaten har identiska 16 byggnadsledgers,
fullgruppsräkning, direkta batchers positionshashar, resursinventering och
namngivna/totala ritanrop/trianglar. Alla fyra när-/fjärrbildpar är byteidentiska.
Nära helvärld: porträtt 202 anrop/578843 trianglar, landskap 922/798293;
fjärrvärld: 204/586095 respektive 926/805301. Ingen renderkostnad ändras.
Tidigare #120:s fullständiga ordnade attribut-/material-/boundsbevis återanvänds;
#136 ändrar endast budgetfältet, inte byggarna. `npm test` godkänner 88 moduler,
nativeräknaren passerar och bygget är `91c2a64a918d66cdfd27828a`.
Slutbevis sparas i `/tmp/lunden-orchestra-20261021/artifacts-136/`.

## Kompletta terrängceller på dator (#121)

Källa `625979e78b413c59e58fb4870b406b44bc68f4e4`, publik föreversion
`1914c816e5118610b3ffdad1d8db67d658f9b5de`. Avgränsad plan: två källnära
nativefall, en gemensam World-körning (före/efter dator + vanlig Android-UA
390×844), sedan befintligt npm-test/bygge. Inga fullprofiler eller nya budgetar.

`node --test tools/terraincellstest.mjs` passerar 2/2: fullständiga indexintervall,
exakt attribut-/materialdelning, referensbaserade bounds, bevarad master och
positiva default-layer-rays utan proxyträffar. Kör World-kontrollen med
`CHROME_PATH=/path/to/chrome node tools/terrain-cell-check.mjs http://localhost:8257 /tmp/terrain-cell 1914c81`.
Den återanvänder appens normala navigation/renderare, fast testdatum och endast
haggräsets domänseed i testsvar; ingen produktionshook eller global slump ändras.

Alla tre World-versioner har exakt samma positions-/normal-/UV- och masterindexhash,
materialdata och positiva terrängrayhöjder −3.060153663/−3.060153804 m.
De två grupperna är en exakt partition av alla 79318 befintliga trianglar:
51046 återstod och 28272 sydost. Alla attributobjekt och material delas.
Querymasterns 475908 byte index behålls; desktopgruppernas index tillför lika mycket
CPU-indexdata, medan attributens 1833120 byte inte kopieras. Inga nya materiella
resurser eller mark-/gånghöjder skapas. Telefonen har fortfarande en synlig master,
inga rendergrupper och samma fullständiga buffrar.

#135:s verkliga navigationspunkt (17,152.17) landar fortfarande på
−0.9306880812492491 m, exakt samma gångstöd före/efter och på Android.
`renderedTerrainY`-samplerns −1.152485578 m är inte en mätning av punktens
synliga vägyta och är oförändrad.
Datorns före/efter-bilder är byteidentiska. Den granskade exponerade flodvyn ritar båda grupperna: 1→2 terränganrop och
79318→79318 trianglar. Detta är en uttrycklig lokal kostnad, ingen uppmätt FPS-vinst;
andra kameravinklar har inte profilerats. Publicens skuggor är avstängda.

`npm test`: 89 moduler gröna. Slutbygge `0fab2954f6d39b34cb349e88` efter integrationsanpassningen nedan.
Rådata och de tre granskade bilderna finns i
`/tmp/lunden-orchestra-20261021/artifacts-121/world/`; ingen ny fullvärldsprofil
eller fysisk telefonprestanda hävdas. Befintliga #124/#135-bevis återanvänds för
oförändrad väg-/gånggeometri; den berörda mastern och gångpunkten kontrolleras ovan.

Den generiska Raycaster-kontrollen ovan täckte inte publicappens eget filter
`object.visible`. Vid slutgranskningen hittades därför en orsakad integrationslucka:
osynlig querymaster måste fortfarande få väljas av mätning och skymma dörrmål.
Endast den renderbackade terrängmastern markeras uttryckligen; båda anropen i
`main.js` använder samma `surfaceVisible`, med oförändrade föräldra- och materialfilter.
Andra dolda meshar blir inte valbara och mobilgrenen saknar markeringen.
En riktad vanlig byggd desktopapp fick en verklig Q-mätmarkör på terrängen vid
(80,110), y −5.458000182962418 mot masterhöjd −5.458000183105469. Första rena
terrängprovet hade bara ett felaktigt exakt-XZ-test: vertikal `lookAt` ger z
109.99998 (0.02 mm avvikelse); sparad diagnostik visar att det var ett testfel.
Den redan startade riktade körningen hann avslutas före stoppförsöket och passerade
med markören exakt lika med masterns verkliga rayträff (ingen utökad tolerans).
Gångpunkten från #135, två rendergrupper och attributdelning passerade samtidigt.
Tidigare buffert-/bildbevis återanvänds eftersom denna lilla urvalsfix inte ändrar
geometrin; npm-test/bygge kontrollerades på den nya relevanta koden.

## Gatulampornas markglöd i dimma (#122)

Källa `a59dea6d18194ac282382fef1623cf8d3393ea33`. Avgränsat prov:
`node --test tools/groundglowfogtest.mjs` (2/2: bevarad hook/materialkontext,
renderer och fail-closed vid saknat dimfragment), sedan en enda vanlig byggd
World med materialbyte före/efter och två kameror. Kör med
`CHROME_PATH=/path/to/chrome node tools/street-glow-fog-check.mjs http://localhost:8258 /tmp/glow-fog`.

Publicappen startar vid dag (12,0); provet anropar dess befintliga
`world.windowLights.update(23,1,true)` för glöd och senare (12,0,true) igen.
Detta är en kvällscallback-diagnostik i oförändrad dagsljusscen, inte en ny kvälls-UI.
Samma poolgeometri jämförs i samma World mot en klon med tidigare `fog:false`;
appens scen, belysning och linjära dimma 200–650 m ändras inte.

GPU-shadern kompilerar med alfahooken, opacity når 0.55 och återgår till dold/0
vid dag. Närvyn 17.89 m är pixelidentisk (0 ändrade RGB-kanaler); fjärrmålets
djup 519.71 m ger dimfaktor 0.7971 och de bortre ljusa ovalerna tonas bort.
36795 RGB-kanaler ändras i fjärrbilden. Summerat poolbidrag mot samma vy med
poolerna dolda minskar 1448991→1092774; detta är bilddiagnostik, inte fysisk
luminans eller FPS. Alla lampor i vyn ligger inte på målets djup.

Båda bildparen är granskade; inga browser-/shaderkonsolfel. Inga fullprofiler,
triangelinventeringar eller mobilmatriser behövdes för denna materialändring.
`npm test` (89 moduler) och bygge `7f1cd95514f84ff11067e074` är gröna.
Rådata/bilder: `/tmp/lunden-orchestra-20261021/artifacts-122/world/`.

## Mobilens konservativa frustum och plana glas (#123)

Källor `43f6701ccd576f73edda46663f394a08b4d90fea` och
`38be175ccfddd97bc3179ac3ff0d6dee4e50c32f`. Avgränsad plan:
`node --test tools/tightfrustumtest.mjs` (12/12), en faktisk Android-World
390×844 med områdesvy och A-rutans fram-/baksida, sedan snabba npm-test/bygge.
Nativefallen täcker fulla aktuella bounds/instanser, okända shader-/deformationsveto,
maskåterställning, render targets, nästlade kameror, shadow-reentry och undantag.
Publicens LOD-ägargräns har ett extra fall: adapterändrade masker får inte återställas
av frustumhooken. Publicskuggor är avstängda; ingen visuell skuggjämförelse hävdas.

Kör `CHROME_PATH=/path/to/chrome node tools/phone-frustum-check.mjs http://localhost:8257 /tmp/phone-frustum`.
En och samma World jämför originalregler (hook av/två glaspass) med ny mobilhook/
enplansflagga. Område: 468→461 anrop; A-ruta fram: 473→466; bak: 106→81.
Det är kombinerade lokala resultat, ingen FPS-vinst eller heltäckande budgetprofil.
Alla tre bildpar har 0 ändrade kanaler och alla masker återställs.
A/B/C:s faktiska glasspann har varsin konstant axel; L:s separata batch behåller två
pass. Okänd glödshader avvisas. Positiva terrängrays är exakt oförändrade och
#135:s verkliga gångpunkt är fortsatt −0.9306880812492491 m.

Extra frustumkontroll körs bara på mobil; enplansglasets gemensamma materialflagga
gäller båda plattformar. #121:s geometri/querymaster ändras inte. Native-/Worldbeviset
återanvänds efter en ren kommentarplacering och exponering av samma kontroll i det
befintliga lokala diagnostikhandtaget, utan nytt Worldsvep. `npm test` (91 moduler)
och slutbygge `290b29795fe72e6a45327e76` är gröna. Inga triangelinventeringar,
19-vyprofiler, orienteringsmatriser eller privata budgetmål användes.
Rådata/bilder: `/tmp/lunden-orchestra-20261021/artifacts-123/world/`.

## Två gatufickor med lokala civilplan (#125)

Plan: två nativefall för källkoppling/layout/lokal terrängpatch; en gemensam
World-batch på desktop och faktisk Android-UA; snabba npm-test/bygge.
`node --test tools/roadsideparkingtest.mjs` passerar 2/2: båda fickorna rymmer sex
hela 2,5×5 m-rektanglar, målningskanterna ligger i kartkonturen och vägens båda
ändar är nuvarande 1147690112-noder. Ingen påhittad intern körgång.

Höjdplanen följer befintlig marks höjder vid vägprojektionerna: ungefär 8,2 %
respektive 0,25 % längslutning, tvärfall noll (*guess*, inte inmätning).
Kontakthöljet når cirka 1,7 m till vägmittlinjen; övergången ligger utanför hela
fickan/kontakten och använder fickans eget cirka 5,2 m-djup som längd.
Råa LM/DEM-data och globala rutnätsaxlar ändras inte. Gamla lokala vägkurvan och
skogsluckan behålls med uttryckliga lokala identiteter; de är inte korrekt OSM.
Den gamla p-ytan vid 24,6/193 överlappar fortfarande bevarad vägasfalt, vilket
inte är en kvarvarande felplacerad parkeringspolygon.

`CHROME_PATH=/path/to/chrome node tools/roadside-parking-check.mjs http://localhost:8257 /tmp/parking-125`
kontrollerar faktisk terrängmaster och sammanslagen sydasfalt/linjer: 30 positiva
punkter per plattform (rutor, linjer, vägkontakter). Query mot faktisk terrängray
skiljer högst 8e−15 m; avsett asfalt-/målningslyft 25/28 mm skiljer högst
0,00066 mm efter Float32. Båda markytorna är synliga i när-/översiktsbilder utan
markgenomslag. Desktop behåller två kompletta rendergrupper med full indexpartition;
Android behåller en mesh. Positionbuffer ökar lokalt 687420→703188 byte; inga nya
material eller renderobjekt införs. #135:s verkliga kritiska gångpunkt är fortsatt
−0.9306880812492491 m. De nya fickorna ligger utanför WALK; ingen gångtur dit hävdas.

Första World-försöket stoppades av en saknad `cutAtTerrain`-import, rättad före
slutkörningen. Diagnostiken avbryter nu direkt vid pageerror. Slutbatchen har inga
page-/konsolfel. `npm test` (92 moduler) och bygge
`248a33cce7214f0a28dd96fc` passerar. Inga fullprofiler eller budgetändringar.
Rådata/bilder: `/tmp/lunden-orchestra-20261021/artifacts-125/world/`.

## Husnära fickor och skyddade överlapp (#126)

Planen återanvänder #125:s native-/Worldverktyg: fyra avgränsade nativefall, en
samlad lokal desktop-/Android-kontroll, snabba npm-test/bygge. Nya officiella rådata
belägger kapacitet 8/3, men hela rektanglarnas faktiska passning styr layouten:
åtta 2,5×5 m respektive tre 2,5×4,7 m. Det senare djupet är en uttrycklig gissning;
konturen är cirka 4,8 m djup och blir inte godtyckligt utdragen till fem meter.
Ingen polygon överlappar en byggnadsfot. Ingen intern körgång läggs i fickorna.

Övergångsboxen för 3164 överlappar #125:s 3165. Därför används inte längre första
träffande bbox som ensam ägare: alla aktiva gränser skärs och viktfältet har en
sammanhängande gräns mot hela plan. #125:s faktiska Float32-patch byggs först;
nya vikter skyddar både dess hela fickor och närliggande byggnadsfötter.
Hus 59/61/62 och 145221625 saknar #106:s lokala LM-ankare/fyrametersaproner.
Deras generiska yttre markgradering påverkas lokalt. Den första varianten behöll
husnivåerna men skapade en verklig 0,75 m-stigning på cirka 8 cm bakom 3164.
Därför förankras endast denna fickas plan i två faktiska annexkantpunkter och
vägkontaktens faktiska medelnivå. Slutplanets gradient är cirka 10,1 % (*guess*,
inte inmätning, normmått eller tillgänglighetsbelägg). Samma tvärsnitt stiger nu
6,22636→6,25548 m över 8 cm, med högst cirka 0,474 lokal rise/run i provpunkterna,
och fortsätter över fickans fulla djup. Ingen hårfin 75 cm-grav lämnas vid väggen.
Alla fyra skyddade husens hörn bevaras inom 0,48 µm i slutprovet.
En tidigare 0,129 mm-hörnrest och överstrikt 5 µm-assertion finns kvar i råloggen;
ingen geometrioptimering gjordes för att jaga den numeriska detaljen.

Native 4/4 passerar inklusive hela bilrektanglar, överlappande plan och skyddade
byggnadsgränser och det nya trepunktsplanet. Den faktiska Worldkontrollen provar 28 nya ytpunkter och återanvänder
30 #125-punkter per plattform: markquery/ray skiljer högst 2,35e−8 m, avsett
asfalt-/målningslyft högst 0,00066 mm. #125-punkternas höjder ändras högst 2,35e−8 m.
Terränggruppspartition och #135:s kritiska gångpunkt −0.9306880812492491 m bevaras.
Diagnostiken fångar den emitterade #125-baslinjen före andra passet i testsvaret;
ingen produkthook införs. Två skymda närkameror togs om med fria ovanmarksvyer,
utan nya vyer eller helscenssvep. Slutbilderna visar öppna vägfronter och hela rutor.

Positionbuffer 703188→738864 byte; inga nya renderobjekt/material eller budgethöjningar.
`npm test` (92 moduler) och slutbygge `66506544ba3facd7aee0de0d` passerar.
Desktop och verklig Android-UA har inga page-/konsolfel. Ytorna ligger utanför WALK;
#125:s oförändrade telefon-/master-, bro-, LM- och navigationsbevis återanvänds.
Efter planrättelsen återanvänds övriga gröna desktop-/Android-prov; bara 3164,
annexsektionen, husfötterna och närmaste skyddade #125-kontakt kontrolleras igen
på desktop med samma verktygs `annex`-läge. Inga nya plattformsgrenar ändras.
Rådata: `/tmp/lunden-orchestra-20261021/artifacts-126/final/` och `annex/`;
första strikta assertionsutfallet finns kvar i `world.log`/`world/`.

## Konkav parkering med verklig servicekorridor (#127)

Avgränsad plan: utöka befintliga komponentprov, en lokal desktop-/Android-batch,
snabba npm-test/bygge. De fyra officiella OSM-svaren är frysta med versioner/licens
[i källarkivet](references/parking-127/README.md); båda parkeringarnas råkapacitet
saknas. Kandidat `03d4c5201004540769c51cf62b7272f0a2c3caaf` matchar projektionen.
335403605/606 ansluter via gemensam nod och exakt befintlig punkt 167,1/334,61;
ingen gångväg görs om till bilväg. 4,5 m vägbredd, asfalttolkning, höjdplan och
layout är gissningar, inte inmätning eller normbedömning.

Native 5/5: sju hela 2,5×5 m-bilar längs 2188:s intakta kant, minst sex meter fri
servicekorridor, exakt sexhörnig konkav yta med ofyllt indrag; 2235 rymmer tre hela
2,5×5 m-rutor längs cirka 8,69 m, inte fyra. Baklinjen för den indragna radens
bakåtvända kant provas separat så att korridorfronten är öppen. Befintlig
ShapeUtils-triangulering används, utan nytt konvext asfalthölje eller intern
körväg på en femmetersficka.

Faktisk World desktop och Android-UA: 35 positiva ytpunkter vardera, markquery
mot emitterad ray inom 9,8e−15 m och asfalt-/målningslyft inom 0,00049 mm.
Hus 56/58/59:s verkliga hörn/maxhörnsbas bevaras inom 0,802 µm mot föregående
emitterade gradering. #125:s skyddade kontakt och #135:s kritiska gångpunkt
−0.9306880812492491 m är oförändrade; #121:s två desktopgrupper och telefonens
enda mesh behåller full indexpartition. Bilderna visar fria infarter, hela rutor
och gräs i indraget. Efter en rättelse av endast radens baklinje kontrollerades
bara den berörda raden på desktop (`row`-läge), medan övriga gröna plattformsprov
återanvändes. Ingen helscens-/orienterings-/triangelmatris kördes.

Gammal platshållarparkering skär ingen skogsregion ens med bbox, så ingen extra
legacy-lucka införs. Tidigare höjdkällor och parkeringsplan bevaras genom tre
explicita emitterade steg. Positionbuffer 738864→787356 byte; inga nya renderobjekt,
material eller budgetgränser. `npm test` (92 moduler), nativeprov och slutbygge
`941bd1d1eea46b1c2327e269` är gröna. Inga page-/konsolfel. Ytorna ligger utanför
WALK; ingen påhittad gångtur dit hävdas.
Rådata/bilder: `/tmp/lunden-orchestra-20261021/artifacts-127/world/` och `row/`.

## Dubbelradig parkering vid hus 45 (#128)

Plan: befintliga komponentprov, en lokal yta/infart med faktiska rays och gång,
snabba npm-test/bygge. Råkontur 145221619 v1 från 2012 och granskad kandidat
`03d4c5201004540769c51cf62b7272f0a2c3caaf` matchar. Råkapacitet saknas.
Slutlayouten på 57×16,9 m har tio hela 2,5×5 m-rutor i två rader, sex meters
körgång och tre fria tvärkorridorer för samtliga befintliga modellkurvor.
Antalet följer den konservativa passningen, inte en antagen kapacitet 30.
Befintlig lokal infart går från 30633546-noden 8,31/233,97; ingen ny apron byggs.
Alla tre kurvors geometri bevaras. Två felaktiga OSM-identiteter ersätts med ärliga
lokala identiteter; den tredje var redan lokal från #125. De verkliga objekten
30633544/850235115 dokumenteras i råarkivet men importeras inte.

Civilplanet ankras i nominell LM-referens 10/248/1,26, faktisk tidigare emitterad
mark + befintligt 1 cm-sampleroffset vid infarten 11,91360656/236,74640104
(1,11718396 m), och hus 45:s ankarnivå 1,94 m vid bakhörnet 37,02/239,75.
Gradienten är 3,54781 %. Hörnnivåerna blir cirka 0,55384/1,39336/1,94/1,10079 m.
Detta är ett uttryckligt civilmodellantagande med tidigare datum-/RH-osäkerhet,
inte inmätta parkeringsnivåer eller norm-/tillgänglighetsbelägg. Renderad jord
ligger fortsatt 1 cm under samplern. Tidigare analysfält vid LM-punkten ersätts
lokalt av civilplanet som hedrar råreferensen; själva källdata ändras inte.

Hela bankens ±4 m-krön och konservativa fyrametersapronhöljen runt hus 41/45
skyddas; nativeprovet visar att de inte skär hela parkeringsplanet. I faktisk
geometri är krön-/apronavvikelse högst 5,7 µm och hushörn högst 0,14 µm mot
föregående emitterade mark. Oförändrade bevis från #125–127 återanvänds.
In- och utgång provas på riktigt inom WALK: 8,31/233,97 via den bevarade kurvan
till 16,89/245,24 och tillbaka. Ingen promenad utanför z=250 hävdas.

Verifieringen fångade en verklig startupkostnad: linjär sökning genom 13404 lokala
faces tog cirka 53 s för 471000 relevanta höjdfrågor. Nollareapolygoner släpps nu
även mellan klippstegen med samma befintliga areakriterium. Ett lokalt faceindex
använder redan befintliga terrängcellaxlar för höjd och klippning, med ordnade,
avduplicerade kandidater och befintlig 1e−8-kantmarginal. Native 6/6 provar exakt
samma emitterade buffers, höjdfrågor på/kring cellgränser och klippresultat med
index respektive linjär referens. Inga nya terrängavstånd eller triangelbudgetar.

Ett första nästan kolinjärt ankarsätt gav 49 % lutning och blockerad infart;
det ersattes av den faktiska infartsanknytningen ovan. Sista ytkontrollen fångade
också gräsgenomslag i den gamla ungefärliga vägtesselleringen. Endast befintliga
30633546-/de tre lokalkurvornas quads som berör graderingsstödet får därför befintlig
exakt terrängklippning. En vald quad kan sträcka sig utanför boxen över sin
befintliga källsegmentgräns; övriga quads behåller tidigare kodväg. Bankens
marknivåer och vägarnas XY ändras inte. Misslyckade råloggar behålls; inga
fysiktrösklar höjs och inga fel maskeras med godtyckliga lyft.

Telefonens oförändrade gruppgren återanvänds från #127. Gammal platshållaryta
skär ingen skogsregion ens med bbox; ingen extra skogslucka införs. Riktade
omkörningar gäller endast de reproducerade felen ovan, inte helscensprofiler.
Rådata/bilder: `/tmp/lunden-orchestra-20261021/artifacts-128/`.

Den statiska genomgången av samtliga befintliga sydvägars svepta bredder hittar
exakt tre korsningar genom konturen. Alla tre får konservativa fria sexmetershöljen;
därför blir slutlayouten tio hela rutor, inte den första variantens 32. Ytterligare
kapacitets-/detaljoptimering behövs inte. Nativeprovet jämför hela korsningslistan
med de reserverade vägarna och provar varje hel bilrektangel mot samtliga höljen.
Samtliga tre gamla kurvors XY och verkliga anslutningsnoder bevaras. De får samma
begränsade befintliga terrängklippning som huvudvägen där nya graderingen berör dem.

Slutprov `final-ready/`: 14 faktiska ytpunkter, query/ray inom 8,44e−15 m;
topmost asfalt/målning inom 2,08 µm från avsett 25/28 mm-lyft. Bilden visar hela
bilrutor, fria korsningar och inga nya markhål i de berörda vägytorna. In- och
utgång passerar, inga page-/konsolfel. Hus-/krönbevis återanvänds eftersom deras
skydd/terräng inte ändrats av de sista layout-/asfaltjusteringarna. Terrängens
positionbuffer ökar lokalt 787356→1279620 byte; inga nya renderobjekt/material
eller budgethöjningar. `npm test` (92 moduler), native 6/6 och slutbygge
`918a18f1905e2463a75a8e21` passerar. Ingen fortsatt profilering krävs.

## Konkav parkering vid hus 46 (#129)

2026-10-21, bas `8b66148379d7ec3e03069d0ec0c7b9957af7e58f`. Avgränsad plan:
komponentprov för layout/källanslutning/gradering, en datorbatch med faktisk
terräng/asfalt/målning, huskant och infart samt snabba npm-kontroller. Oförändrad
telefon-/terränggrupperingsgren återanvänder #127/#128:s bevis.

Tre hela 2,5×5 m-rutor ryms inom den konkava fjortonhörningen och lämnar minst
2,27088 m från närmaste hörn till den verkliga 4,5 m-körgångens centrumlinje.
Rutornas gemensamma plan har 6,0688 % lutning, beräknad från tre tidigare faktiskt
emitterade stödpunkter innan browserstart. Detta är en modellgissning utan inmätning,
inte en uppmätt eller normgodkänd anläggning. Ett plan genom hela parkeringen
skulle strida mot befintlig huskant/infart; därför graderas endast den användbara
raden, med kontinuerlig övergång på övrig omarkerad yta och bevarad källgräns.

Sju nativefall passerar, inklusive tre hela bilrektanglar, fri serviceväg,
exakt fjortonhörnig asfalt, noll höjdvikt på källgränsen och verklig väganslutning.
En riktig World-batch gav 22 oberoende lodräta prov: query/terräng högst
1,03e−14 m från varandra, rutplanet högst 1,40 µm från faktisk Float32-mark;
asfalt/målning 25/28 mm över terrängen. Vid den exakta gamla36918924/nya114-noden
ligger två överlappande vägytor 26,363/24,756 mm över terrängen; det är en
befintlig vägs approximativa anslutning, ingen ny marknivå eller exakt 25 mm-garanti
i just den skarven. Det första alltför strikta lift-assertet sparas i råloggen.
Alla andra fyra infartsprov ligger vid 25 mm inom mikrometerprecision.

Alla fjorton källhörn bevarar marken inom 0,733 µm, hus46:s faktiska hörnstöd
inom 0,390 µm. Verklig Navigation når infarten åt båda håll inom WALK-gränsen;
#135:s kontrollpunkt stannar −0,9306880812492491 m. Nära-/översiktsbilder visar
hela rutor, fria körvägar och bevarade indrag utan gräsinträngning. Inga nya
triangeltak eller prestandapåståenden. `npm test` (92 moduler), native7 och
`npm run build` passerar. Rådata/bilder: orkesterartefakter `artifacts-129/world/`;
källor och licens finns i [referensmappen](references/parking-129/README.md).

## Nattsländegatan och hus 47 (#130)

2026-10-21, bas `4fbb141ff81a2e74a22bd4d78d4c49de96ec0b58`. Minsta plan:
komponent/layout/källanslutning, en samlad datorbatch för de två nya ytorna och
berörda hus/infarter samt npm test/build. Oförändrad telefon-/terränggrupperingsgren
återanvänder #127–129:s bevis; inga nya fullprofiler eller triangelbudgetar.

Före browserstart kontrollerades alla aktuella vägbredder mot källkonturerna:
ingen tidigare väg skar dem. Officiell lokal OSM-karta belägger de nödvändiga
servicevägarna; deras kompletta nya vägbredder skär inget hus. Nodgrafen ansluter
607 till befintlig 36918924 och 604 via581/nordliga95036048 till befintlig
1147690112. Ingen gångväg görs om till bilväg. Gamla felplacerade ytor tas bort;
de ligger utanför skogens sådomäner och behöver ingen extra legacy-clearing.

Åtta nativefall passerar: tio levererade parkeringsytor behåller hela rutor,
624 har sex 2,5×5 m-rutor kring fri 6 m mittgång, 626 har tre hela enkelradsrutor.
Minsta rutavstånd till karterad körgångs centrumlinje är 2,433/2,402 m, alltså
utanför dess antagna halva bredd 2,25 m. Civilplanen beräknades billigt före
browserstart: lutning 0,260681/0,407452 %, hörnnivåer 4,371–4,441 respektive
4,248–4,441 m. Nivåer och utformning är modellantaganden utan inmätning.

En riktig World-batch gav 59 oberoende lodräta prov. Query och faktisk terräng
skiljer högst 0,082 µm; uppmätt avvikelse från respektive civilplan högst
0,192/0,134 µm. Asfalt/målning ligger 25/28 mm över samma faktiska terräng,
inklusive rutkanter. Alla tio nya vägprov innehåller den nya vägytan vid
25 mm inom 0,5 µm. Befintliga överlappande vägytor vid den gamla anslutningsnoden
167,1;334,61 ligger även vid 28,617 mm; dessa gamla ytor ändras inte.

Hus46/47:s samtliga faktiska hörnstöd bevaras inom 0,337 µm. Båda yttre
anslutningsnoderna behåller tidigare terräng inom 0,03 µm. #135:s kritiska punkt
stannar −0,9306880812492491 m. Nära bilder per yta och gemensam översikt visar
hela rutor och fria körgångar utan gräsintrång. Båda nya ytorna ligger utanför
WALK, så inga falska gångprov utfördes. Browserfel: inga. `npm test` (92 moduler),
native8, build och diffkontroll passerar. Rådata/bilder: orkesterartefakter
`artifacts-130/world/`; [primärkällor/ODbL](references/parking-130/README.md).

## Rätta servicevägar och bevarade GC-kurvor (#133)

2026-10-21, bas `4ccf324164a19263972dce7b577b03bc18370f86`. Minsta plan:
primärkoordinater/ID-användningar och komponentprov, en datorbatch med nya
vägytor och representativ gammal GC-beläggning samt npm test/build. Giltiga
#99/#124/#135- och oförändrade telefonbevis återanvänds, inga fullprofiler.

Tre nativefall passerar: oförändrad 58°-projektion av båda kompletta primärvägarna,
råtyp/gissningar/normal fordons- och lampklassning; båda tidigare kurvornas
ordnade koordinater/bredd/material samt faktiska pathStrip-attribut/index är
byteidentiska med fryst basfixture när samma klippning används. Enbart gamla
ID:n byts till tydliga lokala modellnamn; explicit terrängflagga bevarar #99.
De två kompletta 4,5 m-vägbredderna kontrolleras även mot samtliga befintliga
husfotspolygoner utan någon överlappning.

En riktig World-batch ger 18 oberoende lodräta vägprov (tre längdpositioner ×
tre positioner över bredden per ny väg) och sex positiva gamla GC-prov.
Terrängquery/faktisk mesh skiljer högst 0,109 µm, nya vägar ligger 25 mm över
terrängen inom 1,164 µm. Alla gamla GC-prov har positiv beläggning cirka 25 mm
över samma terräng. #135:s kritiska fotpunkt är oförändrad
−0,9306880812492491 m; inga browserfel. Bilder för båda nya vägarnas sammanhang
sparade. Dessa isolerade serviceändar förbinds av separata #116/#134; ingen
påhittad anslutning eller gång utanför WALK lades till.

`npm test` (92 moduler), native3, bygge och diffkontroll passerar.
Råresultat/bilder: orkesterartefakter `artifacts-133/world/`;
[primärutdrag och ODbL](references/roads-133/README.md). Ingen FPS- eller
budgetvinst påstås; två nödvändiga vägytor och ordinarie antagna lampor tillkommer.

## Norra serviceinfarten (#116)

2026-10-21, bas `4198570f7ee973edcf743a7433b502005a2fc6b7`. Plan: primärdata/
anslutning/fullbreddshus+gårdshål och befintliga bilrutor, en samlad datorbatch
med faktiska ytor/infart samt npm test/build. Oförändrade telefon-/terräng-/GC-bevis
återanvänds; inga fullprofiler eller nya triangelgränser.

Sju nativefall passerar. Fyra kompletta primärlinjer/projektion, anslutande
grenar och befintliga 30633546/590 är exakta. Faktiska pathStrip-trianglar skär
inga triangulerade huskroppar; gårdshålen bevaras i provet. Samtliga tidigare
hela parkeringsrektanglar är fria efter endast 582:s antagna bredd ändrats 4,5→4,4 m.
Den tidigare överlappningen 0,033595 m² försvinner, närmaste bilhörn får 10,727 mm
modellmarginal; detta är ingen inmätt eller normgodkänd anläggning. Inga bilrutor
flyttas. Normal `roadLampSpots([],[])` ger 4 nya 573-stolpar och 2 borttagna gamla
(30633546/590), utan ny lampadapter; verkliga träd kan filtrera följden annorlunda.

En World-batch sparar 52 punkter: mitt över varje nytt segment i tre breddslägen
och alla källnoder. 582:s justering följs bara upp med fem riktade prov, ingen
hel omkörning. De 51 slutliga browserproven har positiv asfalt cirka 25 mm över
terrängen och query/terräng skiljer högst 0,083 µm. Vid exakt Float64-källcap för 596
missar rayn Float32-kanten; den ursprungliga assertionen/loggen bevaras. Samma
faktiskt emitterade pathStrip+terrainSurfaceGrid visar 25 mm positiv asfalt redan
en koordinat-ULP (30,518 µm) inåt, även två ULP inåt. Ingen geometri eller lyft
ändras för denna normala capavrundning.

Verklig Navigation når 573:s infart `(3,68;236,83)↔(11,51;247,67)` åt båda håll
inom WALK. Inga rutter utanför gränsen påstås. #135-punkten är oförändrad
−0,9306880812492491 m. Översikt/infartsbild visar nya stråk och fria hus-/
parkeringsytor; inga browserfel. Bilderna före 582:s 10 cm smalare bredd återanvänds
med den riktade slutliga ytkontrollen. Native7, `npm test` (92 moduler), bygge och
diffkontroll passerar. Råresultat finns i orkesterartefakter `artifacts-116/world/`,
`targeted-582/`, `cap-emitted.json` och `lamps-delta.json`;
[primärkällor](references/roads-116/README.md).

## Södra tvärvägen (#117)

2026-10-21, bas `f96b93ea2a048ce8b3ccfc98709b99fe7eaf557b`. Plan: komplett
primär-/nod-/typkontroll och faktiska fullbreddsytor mot hus med gårdshål/alla
gamla hela bilrutor, en samlad faktisk datorbatch och npm test/build. Oförändrade
telefon-/mark-/GC-bevis återanvänds; inga nya fullprofiler eller triangelbudgetar.

Åtta nativefall passerar, utökade med två nya primärlinjer och tre delade
anslutningar. Faktiska emitterade pathStrip-trianglar skär inga huskroppar eller
levererade bilrutor. 3 m råtyp service är fordon, medan 3 m gångväg/otypad väg
förblir icke-fordon och äldre otypade vägars breddregel (≥3,9 m) bevaras. Lampornas breddfilter
är oförändrat; tomträdsfixturen ger fem nya 576-stolpar och inga borttagna, inga
stolpar längs 3 m-länken. Detta är en villkorad modellföljd, inget faktiskt FPS-tal.

En riktig World-batch ger 22 faktiska lodräta prov över varje nytt segments
bredd och källnoderna, inklusive tre anslutningar. Alla har positiv asfalt;
21 innehåller den nya ytan 25 mm över terrängen inom 1,040 µm. Query/terräng
skiljer högst 0,085 µm. Vid exakt Float64-cap 576/36918924 `(76,61;264,96)`
missar den nya Float32-capens ray; gamla anslutningsytor ligger där positivt
24,534/23,558 mm över marken. Samma faktiskt emitterade terräng/pathStrip ger
ny 25 mm-yta redan en koordinat-ULP (30,518 µm) inåt och vid två ULP. Första
strikta assertionsloggen sparas; inga höjder eller geometrier justeras för
normal capavrundning, ingen World-omkörning behövs. Det isolerade andra
ytterändprovet använder uttryckligen en koordinat-ULP inåt från början.

Översikt och närbild visar fria sammanhängande stråk. #135-punkten stannar
−0,9306880812492491 m och browserfel saknas. Alla nya vägar ligger utanför WALK,
så inga falska promenadprov utförs. Native8, `npm test` (92 moduler), bygge och
diffkontroll passerar. Rådata/bilder: orkesterartefakter `artifacts-117/world/`,
`cap-emitted.json`, `lamps-delta.json`; [primärkällor](references/roads-117/README.md).

## Parkering väster om husen (#131)

2026-10-21, bas `8dc09daabce4bd536722fc9a7a015079c8519b2f`. Plan: källkontur/
hela bilrutor/samtliga verkliga vägfootprints och CPU-plan, en lokal datorbatch
för faktiska ytor/husstöd samt npm test/build. Oförändrad mobil-/markgruppering
återanvänder tidigare giltiga bevis; inga fullprofiler eller triangelbudgetprov.

Tre hela 2,5×5 m-rutor ryms i den exakta konkava sexhörningen. Alla aktuella
vägars faktiska emitterade fullbreddsytor är fria från dem. Radplanet beräknat
före browser har 5,065812 % lutning, hörn 3,419/3,643/3,439/3,214 m. En första
mittplacering med 25 % tvärfall förkastades billigt; några få enkla lägen provades
och inget flerplats-/optimeringsarbete gjordes. Källa, gradering och antal
skiljs tydligt: OSM har ingen kapacitet/höjd, tre platser och civilplan är *guess*.

Nio nativefall passerar: hela rutor/målning, exakt källindrag/pinnad gräns,
alla vägclearances och radens hela 4 m räckvidd utanför 4 m-apronomslag för 41/42/43.
Den äldre #128-testens korsningsinventering uppdateras till de tre gamla lokala
kurvorna plus levererade 573/582; samtliga bilrutor förblir fria.

En riktig World-batch ger 22 lodräta asfalt/målnings-/vägprov: query/faktisk
terräng skiljer högst 1,43e−14 m, asfalt/målning 25/28 mm inom 0,331 µm.
Radplanets största faktiska Float32-kantavvikelse är 0,0245 mm; ingen onödig
finjustering görs. Hus 41/42/43:s samtliga faktiska hörnstöd bevaras inom 0,767 µm,
sex källhörn inom 2,976 µm och befintliga infartsnoder inom 0,066 µm. #135-punkten
stannar −0,9306880812492491 m. Nära-/översiktsbilder visar hela rutor, fria
servicekorridorer och bevarat indrag; browserfel saknas. All ny parkering ligger
utanför WALK, inga falska gångprov utförs. Native9, `npm test` (92 moduler),
bygge och diffkontroll passerar. Råresultat: orkesterartefakter
`artifacts-131/world/`, `few-candidates.json`, `clearance-final.json`;
[primärkällor/ODbL](references/parking-131/README.md).

## Inre serviceslingan (#134)

2026-10-21, bas `162f368a8800d50a2fef2d7bfe6804d20be4db5b`. Minsta plan:
primärdata/nodgraf och fullbreddsytor mot hus med gårdshål/alla gamla hela
bilrutor, en lokal datorbatch samt npm test/build. Äldre issuebodys föreslagna
plattformsmatris ersätts av den nu gällande riskpolicyn: oförändrad mobilgren
återanvänder giltiga tidigare bevis, inga fullprofiler eller triangelbudgetprov.

Före appändring identifierades det exakta separata anslutningsbehovet #138:
34,825904 m mellan två konsekutiva 95036048-noder. De fyra vägarna och 588 är
internt sammanhängande, inte ännu källnodanslutna till övrigt importerat nät.
Inga påhittade anslutningar tillförs och ingen annan väg importeras här.

Nio nativefall passerar: kompletta primärlinjer/delade noder, alla faktiskt
emitterade vägtrianglar mot huskroppar med bevarade gårdshål samt alla 11 tidigare
civilparcellers hela bilrutor. Lampfunktionen ändras inte. Före #134 var 573-fixturens
antal redan två efter #131, så det gamla förväntade fyra ersätts med den stabila
klassnings-/parkeringsclearanceinvarianten; de två blockerade gamla positionernas
assertions behålls. Villkorad tomträdsdelta för #134 är 6 till/1 bort, separat från
någon fysisk mobil-/World-budget.

En riktig World-batch ger 44 oberoende lodräta prov: tre breddslägen mitt på
alla tio nya segment samt alla 14 källnoder. Fem isolerade yttercaps provas
uttryckligen en Float32-koordinat-ULP inåt; primärkoordinaterna flyttas inte.
Alla prov har positiv asfalt 25 mm över terrängen inom 1,045 µm, query/terräng
skiljer högst 0,222 µm. Inga browserfel, #135-punkten är oförändrad
−0,9306880812492491 m. Översikt/närbild visar fria sammanhängande ytor.
Alla nya stråk ligger utanför WALK, inga falska promenadprov utförs. Native9,
`npm test` (92 moduler), bygge och diffkontroll passerar. Rådata/bilder:
orkesterartefakter `artifacts-134/world/`, `graph-risk.json`, `lamps-before.json`,
`lamps-delta.json`; [källor/ODbL](references/roads-134/README.md).

## Anslutning till inre serviceslingan (#138)

Minsta plan: primärnodgraf/fullbreddsgeometri, en berörd desktopbatch och
snabba npmtest/build. Oförändrad mobilgren och äldre segmentbevis återanvänds;
nya vägen ligger utanför WALK. Ingen full scen-/triangel-/plattformsmatris.

Tio nativefall passerar, inklusive exakt fyrnodsprefix ur officiell 95036048 v6,
bevarade tre äldre noder och samma ändnod som 145221614. Faktiska pathStrip-trianglar
lämnar alla huskroppar med gårdshål och samtliga tidigare hela bilrutor fria.
Befintliga material, markkällor, husstöd, parkeringsplan och gånggränser ändras inte.
En villkorad lampdelta med tom trädlista ger en till/ingen bort, inte en fysisk
World-budget. [Befintlig primärkälla/ODbL](references/parking-130/README.md).

Den enda faktiska World-batchen provar segmentets tre breddslägen och båda
skarvnoderna: samtliga har 25 mm positiv asfaltfrigång inom 0,236 µm;
query/ritad terräng skiljer högst 0,018 µm. Kontextbilden visar obruten anslutning.
#135-punkten är oförändrad −0,9306880812492491 m, browserfel saknas. Native10,
`npm test` (92 moduler), bygge och diffkontroll passerar. Rådata/bild finns i
orkesterartefakter `artifacts-138/world/`, lampdelta i `lamps-delta.json`.

## Parkering söder om hus 44 (#132)

Minsta plan enligt aktuell policy: billig CPU-layout/plan och nativekontroll,
EN berörd desktopWorld med faktisk terräng/asfalt/målning och hus-/gränsstöd,
snabba npmtest/build. Oförändrad mobilgren och äldre civilplanbevis återanvänds;
hela objektet ligger utanför WALK. Ingen full scen-/triangel-/plattformsmatris.

Första enkla läget på kant 0→1 (`rowAlong=14`) ger tre hela 2,5×5 m-rutor.
Tre oberoende befintliga emitterade höjdankare ger 3,7908 % radplan före browser;
hela source-ringens åtta hörn och indrag bevaras. Tio nativefall passerar, inklusive
faktiska pathStrip-trianglar från ALLA aktuella vägar mot hela nya rutor, full
radkärna+4 m räckvidd mot ALLA husens konservativa 4 m apronhöljen, source-ringens
nollvikt vid gränsen samt riktig infart614→950:s delade nod. Inga väg-/husflyttar.
Antagna höjder/layout/material och [officiell primärkälla/ODbL](references/parking-132/README.md)
är åtskilda. Rå CPU-ankare/clearance finns i `artifacts-132/candidates.json`,
`native.log`; inga nya kartanrop utfördes.

Den enda World-batchen sparar 17 asfalt-/målningsprov på centrum/hörn/linjer samt
fyra väganslutningar. 20 faktiska positiva rays visar 25/28 mm lyft inom 0,306 µm;
query/terräng skiljer högst 8,9e−15 m. Det fjärde vägprovet, isolerade 614-capens
exakta Float64-källpunkt `(-10,57;376,93)`, missar Float32-meshkanten. Råassertionen
behålls; billig CPU-kontroll av samma emitterade väg en/två koordinat-ULP (30,52 µm)
inåt ger 24,999859 mm. Ingen geometriändring eller Worldomkörning görs.

62 faktiska husrays skiljer högst 0,727 µm från baseline före stage7; åtta
källgränspunkter högst 1,601 µm, tre anslutningspunkter högst 0,129 µm.
En extra punkt från den breda huslistan `(84,5;467,19)` ligger utanför terrainmesh:
endast query/baseline redovisas där, exakt oförändrad −3,0099999866229763 m,
inte ett positivt terrängraybevis. Närbild/översikt visar hela rutor och fria
passager utan gräsintrång. #135-punkten är oförändrad −0,9306880812492491 m,
browserfel saknas. Sparade data valideras efter dessa uttryckliga klassificeringar
utan ny browserstart (`summary.json`, `cap.json`, ursprunglig `world.log`). Native10,
`npm test` (92 moduler), bygge och diffkontroll passerar. Föräldrar #100/#98 hålls öppna.

## Slutgranskning av de tolv parkeringsytorna (#100)

Samtliga tolv källkonturer är levererade. Tabellen länkar varje slutförd vertikal
med dess commit och befintliga native-, bild-, Pages- och vanliga livebevis.
De granskades vid leveransen och återanvänds här med samma källdata/berörda
kodgrenar; denna slutgranskning ändrar bara dokument, inte geometri eller provkrav.

| Barn / källkonturer | Hela visuella rutor | Leveranscommit | Befintliga prov och publicering |
| --- | --- | --- | --- |
| #125: 1379042014, 1379043165 | 6 + 6 | [61f18ca](https://github.com/solwation/kvarteret-lunden/commit/61f18cafa46880810f6d5ce4711e69bfa893abb9) | [native, desktop/Android-ytor/bilder, Pages/live](https://github.com/solwation/kvarteret-lunden/issues/125#issuecomment-6319366294) |
| #126: 1379042106, 1379043164 | 8 + 3 | [9dfd22b](https://github.com/solwation/kvarteret-lunden/commit/9dfd22b28ac887875e7c4f9ce6a0cfa60a2e3f11) | [native, hus-/annexsektion, ytor/bilder, Pages/live](https://github.com/solwation/kvarteret-lunden/issues/126#issuecomment-6319791252) |
| #127: 1379042188, 1379042235 | 7 + 3 | [e9767d1](https://github.com/solwation/kvarteret-lunden/commit/e9767d1dce37eaff0c21dff5ab2eda68b6eed4cb) | [native, desktop/Android-ytor/bilder, Pages/live](https://github.com/solwation/kvarteret-lunden/issues/127#issuecomment-6320157384) |
| #128: 145221619 | 10 | [8b66148](https://github.com/solwation/kvarteret-lunden/commit/8b66148379d7ec3e03069d0ec0c7b9957af7e58f) | [native, bank/hus/infartsgång, ytor/bild, Pages/live](https://github.com/solwation/kvarteret-lunden/issues/128#issuecomment-6321008586) |
| #129: 850235113 | 3 | [4fbb141](https://github.com/solwation/kvarteret-lunden/commit/4fbb141ff81a2e74a22bd4d78d4c49de96ec0b58) | [native, hus-/infartsstöd, ytor/bilder, Pages/live](https://github.com/solwation/kvarteret-lunden/issues/129#issuecomment-6321358741) |
| #130: 145221624, 145221626 | 6 + 3 | [4ccf324](https://github.com/solwation/kvarteret-lunden/commit/4ccf324164a19263972dce7b577b03bc18370f86) | [native, hus/nodgraf, ytor/bilder, Pages/live](https://github.com/solwation/kvarteret-lunden/issues/130#issuecomment-6321609534) |
| #131: 145221628 | 3 | [162f368](https://github.com/solwation/kvarteret-lunden/commit/162f368a8800d50a2fef2d7bfe6804d20be4db5b) | [native, alla vägkorridorer/aproner, ytor/bilder, Pages/live](https://github.com/solwation/kvarteret-lunden/issues/131#issuecomment-6322791560) |
| #132: 145221629 | 3 | [d4e0440](https://github.com/solwation/kvarteret-lunden/commit/d4e0440e860fd35f63f19fbd2280bf241c7a62cf) | [native, alla vägkorridorer/aproner, ytor/bilder, Pages/live](https://github.com/solwation/kvarteret-lunden/issues/132#issuecomment-6323340308) |

Rutorna är hela 2,5×5 m, utom den verkligt grundare 1379043164:s uttryckligt
antagna 2,5×4,7 m. Antalen är visuella tolkningar, inte försök att maximera en
kapacitetstagg. [125:s rådata](references/parking-125/README.md) har kapacitet 6/6,
[126:s](references/parking-126/README.md) 8/3; övriga frysta parkeringsobjekt saknar
råkapacitet. Varje barns källfolder bevarar officiella versioner, ODbL-attribution
och separationen mellan kartkontur/råtaggar och antagna höjder, layout och ytskikt.
Neutral konturkandidat är `03d4c5201004540769c51cf62b7272f0a2c3caaf`.

#125–#128 och #130 har sammanhängande antagna civilplan över sina parkeringsytor,
med skyddade husnivåer och begränsad yttre övergång. #129, #131 och #132 har i stället
ett gemensamt lokalt plan ENDAST under respektive användbar radkärna; den återstående
asfalterade källkonturen är omarkerad kontinuerlig kör-/övergångsyta med pinnade
hus-/gränsnivåer. De senare är alltså inte hela plana parkeringsgårdar. Alla
asfalt-/målningsytor använder samma faktiskt graderade terrängstöd. Käll-DEM/LM,
byggnadernas fötter, bankkrön och äldre skyddade civilplan flyttas inte för att
passa fler rutor. De ursprungliga synliga felmönstren med täta capacity-remsor
eller begravd målning ersätts utan ett nytt detalj-/triangelbudgetmål.

Nödvändiga kartlagda infarter är levererade i respektive barn samt
[#133](https://github.com/solwation/kvarteret-lunden/issues/133),
[#116](https://github.com/solwation/kvarteret-lunden/issues/116),
[#117](https://github.com/solwation/kvarteret-lunden/issues/117),
[#134](https://github.com/solwation/kvarteret-lunden/issues/134) och
[#138](https://github.com/solwation/kvarteret-lunden/issues/138).
Äldre modellkurvor behåller ärliga lokala identiteter och fria passager.
#128:s faktiska infart inom WALK är gångproverad; avlägsna ytor har inga påstådda
promenader eller utvidgade gånggränser. Senare leveranser återanvänder giltiga
mobilbevis för oförändrad kodgren. Dokumenterade Float32-cap-/kantapproximationer
är redovisade i barnens råloggar och inte dolda genom godtyckliga geometriändringar.

Slutkontrollen för #100 består av evidenskorsreferens, dokumentdiff/länkar och
motsägelser samt automatisk Pages-release. Ingen appkod, ny browserbatch,
triangel-/plattformsmatris eller manuell npm/build-omkörning behövs för denna
sammanställning. #98 hålls öppet för separat leveransgranskning.


## Områdets färgbatcher, #139

Kör `node --test tools/siteinstancebatchtest.mjs tools/tightfrustumtest.mjs`, `npm test`
och `npm run build`. Kör sedan `CHROME_PATH=… node tools/siteinstance-check.mjs BASE OUT`
mot servern för `dist/`. Jämför de avkodade PNG-paren för uteplatshörnet och områdesvyn.
Båda är pixelidentiska; före/efter867/829066→845/759110 respektive810/847052→784/773030.
Kontrollen stänger av enbart de nya skrivbordskontrollerna i föreläget och behåller samma
World, material, kamera och tid. Den kräver fullbordad appstart, färre anrop/trianglar,
0sidfel och0externa anrop. Nativefallen skyddar aktuella matriser/färger/antal, positiva
fysiska rays, källa/skugga-identitet, okända shaderprogram, LOD-undantag och återställning
vid nästlad kamera/fel. Telefonens befintliga frustum och originalpopulationer bevaras.
Se [källgranskningen](upstream.md#färre-färgritningar-runt-uteplatserna-139).


## Täta grannhusens gavlar, #150

2026-10-23, baslinje `2fcadd0` (byggversion `4924034576740755531b6624`),
slutbygge `86886c6772c54f65038a45ce`. Selektiv väggändring från original
`bad16e072f7a883bc7f8f99281af6b677a393855`; övrig appkod är identisk.

Riktad komponentkontroll bygger verklig generisk geometri för väst/öst/norr med
plan mark och utan särskilda fasadbyggare eller tillfarter. Tolv hus har totalt
24 väggkanter som korsar nocken. Tre korta horisontella strålar per korsning,
20/50/80 procent upp i den tidigare öppna triangeln, ger 0/72 väggträffar före
och 72/72 efter. Komponenternas batchantal är oförändrat 3/3/4; trianglarna
ökar 796→812, 788→812 och 2040→2048, exakt två per delad kant. A/B/C/L:s egna
husbyggare och södermodulen berörs inte; den senare följs separat i #158.

Faktiska byggda WebGL-scenen provas i headless Chromium/SwiftShader, 1000×700,
med samma fasta datum och identiska kameror före/efter. Consensums västgavel och
Norra tegelpaviljongens östgavel är visuellt granskade: väggen fyller nu hela
triangeln fram till nocken. Ritanrop är 53→53 respektive 32→32; ritade trianglar
427896→427920 respektive 296650→296674. Inga sidfel eller externa anrop.
Detta är riktade scenvyer, ingen fysisk telefonprestandamätning eller full
navigationsomkörning. Consensumvyn har en befintlig fönsterram och träd i
förgrunden, medan den norra gaveln syns fritt.

`npm test` (94 moduler), `npm run build` och `git diff --check` passerar.
Evidens utanför repot: `/tmp/kvarteret-orkester-20261023/evidence150/`, med
`component.mjs`, `component-before.json`, `component-after.json`,
`component-summary.json`, `browser.mjs`, `browser-results.json`,
`before-consensum.png`, `after-consensum.png`, `before-north.png`,
`after-north.png`, `npm-test.log` och `build.log`. Pages och publicerad vy
verifieras av integrationsägaren före stängning.

Granskade offentliga bildpar: [Consensum före](../artifacts/150/before-consensum.png)
och [efter](../artifacts/150/after-consensum.png), [nordgavel före](../artifacts/150/before-north.png)
och [efter](../artifacts/150/after-north.png). [Byggidentitet, kameror och ritanrop](../artifacts/150/browser-results.json)
är sparade tillsammans med bilderna. Dessa evidensfiler ingår inte i publiceringspaketet.


## Sankt Lars väg 41, #151 (2026-10-23)

Plan: riktat nativeprov av vånings-/takgeometri och batchbudget; två byggda
före/efter-vyer vid 41A/41B med oförändrad kamera och ritningsjämförelse;
obligatoriska `npm test` och `npm run build`. Det är en separat OSM-byggnad
(145221569); A/B/C/L använder andra byggare och ändras inte.

`node --test tools/stlars41test.mjs` passerar 5/5: oförändrad OSM-kontur,
tre våningar över sockeln och lägre tvåvåningsflygel, högre trapptorn,
valmade tak med motsvarande `roofY`, skorstenar förankrade i taket och
merge-kompatibla attribut. Byggnaden använder en geometri i var och en av
befintliga fasad-/tak-/glasbatcher. 1 946 + 20 + 544 = 2 510 trianglar
passerar källprovets oförändrade tak `<4000`. Inga budgetgränser höjs.
`npm test` passerar (94 moduler och publik isolering); bygget är grönt.

Faktisk byggd Chromium-vy (headless, SwiftShader, 1280×800, juli):
baslinje `4924034576740755531b6624` från public `2fcadd0`,
slutbygge `f29b1c3fb80fcba1e49a96ee`. Två parade kameror ger
917→917 respektive 37→37 draw calls och +2 092 trianglar vardera. Hela
södergruppens geometrimängd är 105 557→107 649 trianglar; detta är en
resursräkning, inget nytt globalt budgettak. Inga JavaScriptundantag eller
externa anrop. Bilderna har granskats: tre våningar, lägre flygel, båda
trapptornen, valmade tak och skorstenar syns; mark och omgivning ligger kvar.

Egna sparade bevis: [41B före](../artifacts/151/before-41b.png),
[41B efter](../artifacts/151/after-41b.png),
[41A före](../artifacts/151/before-41a.png),
[41A efter](../artifacts/151/after-41a.png) och
[rådata med byggversioner](../artifacts/151/browser-results.json).
Arbetsloggar och den riktade browserkontrollen finns under
`/tmp/kvarteret-orkester-20261023/evidence151/`.

Originalets äldre ”bounded far detail”-grind har ingen motsvarighet i denna
publika checkout; dess eventuella röda baslinje överförs inte och inget tak
höjs för att kringgå den. Här verifieras den ändrade komponentens befintliga
triangeltak och faktiska ritningsmängd. Ingen fysisk telefonprestanda,
uppmätning av byggnaden eller bred profilmatris påstås. Publicering och
kontroll av berörd livevy återstår för dirigenten.


## Vägbrons räcken och trottoar, #153

2026-10-23, selektiv originalkälla `ef5c6ef1fc2bb92e45348defd386958b42521c41`.
Publik baslinje `c26ca6abbd10872e2316a76d3ec51d0a9ad19636`, byggversion
`535a37c55f70735b14b51893`; slutbygge `45fa024ca4325a7f8fd4bdd0`.
Vägbrons nya tvärsnitt och GC-fackverkets färg använder exakt de granskade
originaldelarna. Publicens `trimApproach` och anslutningskod är bevarade.

`node --test tools/riverfalltest.mjs tools/southbanktest.mjs` passerar 12/12:
nya granskade brobuffertar, oförändrade parkstråk, vattenfall, däckdatum,
undersidor och GC-anslutningens terrängföljning. `npm test` (94 moduler),
`npm run build` och `git diff --check` passerar också.

Separat faktisk komponentjämförelse visar exakt lika `bridgeRecords`,
`pierBoxes`, vattenpositioner, båda `trimApproach`-anropens geometri/bredd/höjder,
`deckAt`/`deckUnderAt` och ritade undersidor vid tre punkter per bro.
`farWalls` ger identiska kollisionssegment på och under båda broarna vid samma
punkter. Fyra materialbatcher behålls; komponenten ökar 2770→4714 trianglar.
Betong/stål får vertexfärger och trottoaren tillför 12 asfalttrianglar.
[Sammanfattning](../artifacts/153/component-summary.json),
[rådata före](../artifacts/153/component-before.json) och
[efter](../artifacts/153/component-after.json).

Den verkliga byggda WebGL-scenen provas i headless Chromium/SwiftShader,
1000×700, med fast datum och identiska kameror före/efter. Bilderna är granskade:
[längs vägbron före](../artifacts/153/before-along.png) och
[efter](../artifacts/153/after-along.png),
[båda broarna från åsidan före](../artifacts/153/before-river.png) och
[efter](../artifacts/153/after-river.png). Trottoar, granitkant, grönt kryssräcke,
vägräcken och svart plåträcke syns i längsvyn; GC-fackverket är grönt i översikten.
Ritanrop är 894→894 respektive 46→46 och trianglar 819501→821445 respektive
443721→445665. Inga sidfel eller externa anrop. [Byggidentitet, kameror och råresultat](../artifacts/153/browser-results.json).
Dessa evidensfiler följer inte med publiceringspaketet.

Kontrollen gäller broarnas berörda geometri och befintliga kollisionsdata, ingen
ny full navigationsinventering eller fysisk telefonprestanda. Alla nya mått och
färger är visuella antaganden. Skript/loggar och båda frysta byggen finns utanför
repot under `/tmp/kvarteret-orkester-20261023/evidence153/`. Dirigenten verifierar
Pages och publicerad vy före stängning.


## Höje ås brovy med vass, #154 (2026-10-23)

Plan: ett avgränsat nativepaket för ånivåer, gång/frigång och vegetation;
byggd före/efter-vy från GC-brons västkant, inklusive faktisk gång under
båda broarna; obligatoriska `npm test` och `npm run build`. Ingen husvariant
A/B/C/L har motsvarande åfåra; inga husgeometrier ändras.

`node --test tools/riverbridgeviewtest.mjs tools/riverfalltest.mjs tools/southbanktest.mjs`
passerar 14/14. Gångvägen vid z111 är torr med ståhöjd och kan gås
10→32 och 32→10 i x-led. Originalets fyrameterspunkt kontrolleras som
torr bank med ståhöjd under varje bro; publicen har ingen jetpack.
240 vassruggar har fötterna på bank/botten, mer än en tredjedel i vatten,
med blad ovan vattnet och fria gångvägar/däck. Hängbjörk och pil finns
bland trädpunkterna; undervegetationen står ovan vattnet. Parkens fyra
materialbatcher behålls. Befintliga fall-, strand-, ramp- och återhämtningsprov
passerar. Icke-vattenbroarnas hashprov är oförändrat i denna port.

Native före/efter ger exakt identiska höjder för 45 punkter längs gångstråket,
samma broposter, däck/undersidor/vattennivåer, pelare och kartlagda gångvägar
([invarianter](../artifacts/154/invariants.json)).
`tools/riverat-check.mjs` passerar 20 000 åfrågor och 20 000 kollisioner;
det tillkomna `valley`-fältet undantas när äldre returvärden jämförs mot
referensalgoritmen. [Native-logg](../artifacts/154/native.log),
[riverAt-logg](../artifacts/154/riverat.log). `npm test` passerar (94 moduler,
publik isolering), liksom bygge och diffkontroll.

Faktisk byggd Chromium/SwiftShader (headless, 1280×800, juli):
public bas `c26ca6a`, bygge `535a37c55f70735b14b51893` före och
`f7a7b4675a0f520f0d901ab2` efter. Kameran står på (16,5; −1,38; 123)
och riktas mot (−30; −4,8; 130). Den verkliga navigationen
går under broarna i båda riktningarna före/efter, med samma slutpunkter.
Inga sidfel eller externa anrop. Det granskade bildparet visar smalare
vattenfåra, vass, hängande trädkronor och tätare vegetation i fonden.

Parkens geometri är 10 115→12 035 trianglar, exakt +1 920 för vassen;
asfalt, grus och träbro har samma geometrimängder. Fyra parkbatcher
behålls. Den parade vyn har 53→54 draw calls och 405 257→422 792
ritade trianglar, när ytterligare trädgeometri blir synlig. Originalets
HTML-prov har ett historiskt `<12000`-tak, men den fixturen och något
motsvarande accepterat parktak finns inte i publicen. Publicens egna
bevarade vägklippning ger 35 fler trianglar än källtaket; ingen gräns
höjs och ingen geometri justeras enbart för detta historiska tak.

Egna [före](../artifacts/154/before-gc-west.png)/[efter](../artifacts/154/after-gc-west.png)
och [rådata](../artifacts/154/browser-results.json). Fulla arbetsloggar och
browserkontrollen finns i `/tmp/kvarteret-orkester-20261023/evidence154/`.
Den separata broporten #153 ingår inte i den parade baslinjen. Dirigenten
integrerar den före #154 och kontrollerar sampublicerad livevy efter Pages.
Ingen fysisk telefonprestanda eller oberoende uppmätning av referensfotot påstås.


## HepCat-husets tak och fasader, #155

2026-10-23: exakt originalkälla `e6652e3b07f30ae17416521b4fcb0f86c20f0211`,
publik baslinje `ad5e82e07776070db2967a29ad61e823926aa60d`, byggd föreversion
`45fa024ca4325a7f8fd4bdd0`, efterversion `05bd882587d6a59900da21a4`.
Butiksbokstäverna är bortvalda; geometri, fotavtryck, fasta detaljer och
fönster/takfunktioner är det granskade offentliga urvalet. Detta är en separat
byggnad utan motsvarande variant i hus A/B/C/L. #154:s åvegetation ingår inte.

`node --test tools/hepcattest.mjs` passerar 5/5: bevarade fotavtryck, nordvalm,
sydgavel upp till nocken, högre tvärtak, skorsten, takhöjd mot ritad geometri,
utåtvända väggar/atlas-UV och komponentbudget. [Komponentens rådata](../artifacts/155/native-summary.json).
`npm test` (95 moduler), `npm run build` och `git diff --check` passerar.

Den verkliga byggda scenen provas i headless Chromium/SwiftShader, 1000×700,
med samma fasta datum och identiska kameror före/efter. Alla sex bilder är
granskade: [norr före](../artifacts/155/before-north.png) och
[efter](../artifacts/155/after-north.png),
[västfasad före](../artifacts/155/before-front.png) och
[efter](../artifacts/155/after-front.png),
[södergavel före](../artifacts/155/before-south.png) och
[efter](../artifacts/155/after-south.png). Nordvalm, högre vit mittdel, svart
falsat tak, spetsbågiga gavelfönster, nummer 21 och stensockel syns i slutvyerna.
[Den faktiska atlasen](../artifacts/155/atlas-after.png) är 512×512 och saknar
butiksbokstäver. Ritanrop norr/väst/söder är 71→69, 55→53 och 67→65;
trianglar 459776→460218, 463949→464391 och 354490→354932. Inga sidfel eller
externa anrop. [Byggidentitet, kameror, takgång och resursrådata](../artifacts/155/browser-results.json).

Offentlig motsvarighet till originalets `rooftest`: den byggda appens riktiga
`Navigation.groundAt`, `Roofs.topAt` och 15 navigationssteg à 1/120 sekund
provas på fyra berörda takpunkter. Nordvalmens 5,55 m, vingnockens 7,275 m,
tvärtakets 8,2 m och sydgavelns 7,275 m ger samma stöd och stabil fothöjd
(4/4). Originalets globala takinventering importeras inte.

WebGL-anrop för texturallokering (`texStorage2D`/`texImage2D`, genererade
mipnivåer och borttagning) observeras i samma offentliga scen. Kända format ger
31037852→32052108 byte (29,60→30,57 MiB), delta +1014256 byte (0,967 MiB).
Inga okända format. Antalet observerade allokeringar sjunker 52→51 och
rendererregistrerade texturer 50→49. Detta är texelminne från faktisk allokering,
inklusive mipnivåer; drivrutinens overhead och fysisk GPU-minnesförbrukning
påstås inte. Ingen gräns höjs och originalets globala textursiffror används inte.

Evidensfilerna följer inte med publiceringspaketet. Skript, loggar och frysta
före/efterbyggen finns i `/tmp/kvarteret-orkester-20261023/evidence155/`.
Detta är riktad geometri/takgång i Chromium, ingen fysisk telefonprofil.
Dirigenten verifierar integrerad byggversion, Pages och publicerad vy före closure.


## Realgymnasiet, Sankt Lars väg 20, #156 (2026-10-23)

Plan: riktat nativeprov av volymer/tak/markföljande fönster; byggd berörd
vy före/efter och faktisk publik östcampusbudget; obligatoriska `npm test`
och `npm run build`. OSM-byggnaden 130681301 använder en egen mall;
A/B/C/L och deras separata mått/öppningar ändras inte. #150:s rättade
gavlar i den generiska byggaren behålls.

`node --test tools/realgym20test.mjs` passerar 5/5: oförändrad OSM-kontur,
gavelhus/lägre länga/hög hall, trapptornets höjd, ritade tak i förhållande
till `roofY`, fönster över den stigande marken och ändliga kompatibla
attribut inom konturen. En geometri var i befintliga fasad-/glas-/takbatcher.
Den verkliga scenvarianten har 180 + 1 024 + 67 = 1 271 trianglar, under
komponentprovets oförändrade `<3000`. Kroken skickar publicens `ground`;
sockel/fönster och husets golvreferens använder den verkliga markfunktionen.
`npm test` passerar (95 moduler och publik isolering), liksom bygge och
diffkontroll. [Native-logg](../artifacts/156/native.log).

Byggd Chromium/SwiftShader (headless, juli), public bas `7d8f9cb6`: före
`682a06f93ac8b4242cf4cece`, efter `5b5c5f2fe46e4b254bc35c9f`.
Dator 1280×800: sydvästkameran (9; 6; 78) mot (49; 4; 40),
längkameran (13; 5; 26) mot (46; 4; 35). Namngivna östanrop har
identiska namn/ordning före/efter: 12→12 respektive 9→9. Android-UA
390×844 har 8→8 i sydvästvyn. Slutsatsen om oförändrade ritanrop
gäller östgruppen; scenens globala totaler finns också som diagnostik.
Inga sidfel eller externa anrop. Bilderna har granskats: gavelhus,
längans kupor och trapptorn samt den höga hallen är synliga.

Publik fullgruppsbudget mäts med den oförändrade
`tools/campus-budget-counter.mjs`, samma räknare och omfattning som
`tools/campus-budget-check.mjs`: alla östmeshar, access och klockans
indexerade instanser. Räknarens eget nativeprov passerar
([logg](../artifacts/156/counter.log)). Vanlig Android-UA utan `keepgeo`
ger 38 543→39 548 trianglar, båda under det oförändrade publika taket
40 843, med 1 295 trianglars marginal efter porten. Access är kvar på
11 067 och klockan på 144. Tillväxten är exakt +1 005 i fasad/glas/tak;
övriga batchmängder och meshlistan är oförändrade. Datorns fulla
resursräkning är 80 202→81 207; 40 843 är Androidgränsen.
Originalets historiskt röda budget importeras inte. Inget tak höjs.
Budgetverktygets befintliga byggnadsledger har anpassats till den nya
mallens tidiga `continue` och syntaxkontrollerats; den avgränsade
byggda mätningen använder räknaren direkt på verkliga scenen.

Egna bildpar: [sydväst före](../artifacts/156/desktop-before-southwest.png)/
[sydväst efter](../artifacts/156/desktop-after-southwest.png),
[längan före](../artifacts/156/desktop-before-range.png)/
[längan efter](../artifacts/156/desktop-after-range.png),
[Android före](../artifacts/156/android-before-southwest.png)/
[Android efter](../artifacts/156/android-after-southwest.png).
[Rådata och byggversioner](../artifacts/156/browser-results.json).
Fulla arbetsloggar och riktad browserkontroll finns i
`/tmp/kvarteret-orkester-20261023/evidence156/`.

Ingen fysisk telefon-FPS eller oberoende uppmätning av byggnaden påstås.
Dirigenten integrerar ovanpå parallella #155, publicerar och kontrollerar
den sampublicerade livevyn efter Pages.


## Busskur i skolmurens östra ände, #157

2026-10-23: selektiv källa `a9776336eeaf4f9e98e384a9403db19acefea60c`
(original #1534), publik baslinje `0ee351487ca61b361021b22f4c7cbe52c9ce81f8`.
Byggd föreversion `e365fb89afcdd1bbf6bc4170`, efterversion
`8753dcc49615fdd52bd446ff`. #146:s murkollision utvidgas till den gemensamma
mur-/kurplanen utan att skapa en stängd framsida. Detta är en fristående
skolgårdsdetalj utan motsvarande variant i hus A/B/C/L.

`node --test tools/schoolwalltest.mjs` passerar 3/3: källmodellens vägg-/takmått,
öppen entré, solida bak-/gavelväggar, verkliga `farSegments` för alla väggar och
stolpen samt flyttat växthus; tidigare mur utan kur är fortsatt möjlig.
[Plan och verkliga kollisionssegment](../artifacts/157/native-summary.json).
`tools/farwalk-check.mjs` har källans uppdaterade väg runt öständen, nytt
murändprov och två kurprov; den breda historiska gånginventeringen körs inte om.
`npm test` (96 moduler), `npm run build` och `git diff --check` passerar.

Riktad faktisk byggd WebGL-scen i headless Chromium/SwiftShader, 1000×700,
fast datum och samma två kameror före/efter. Bildparen är granskade:
[mur före](../artifacts/157/before-wall.png) och
[efter](../artifacts/157/after-wall.png),
[entré före](../artifacts/157/before-shelter.png) och
[efter](../artifacts/157/after-shelter.png). Kortare mur, tegelkur, platt tak,
stolpe, fast bänk, papperskorg, plattor, flyttad skylt och flyttat växthus syns.
Porten återanvänder befintliga mur-/tak-/ram-/kantstensbatcher och texturer.
Ritanrop 58→58 i översikten och 40→41 vid entrén; trianglar
351239→351511 och 317600→317968. Ingen ny materialbatch införs; ändrad
geometri/placering ger annan synlighet i entrévyn. Inga sidfel eller externa anrop.
[Byggidentitet, kameror och råresultat](../artifacts/157/browser-results.json).

Sex gångprov använder den byggda appens riktiga `Navigation`, hållen W/Shift
och 1/60-sekundssteg (6/6). Murens mitt och östände stoppar vid z −31,78;
entrén når z −32,467 under taket; bakväggen stoppar vid z −33,08;
västgaveln stoppar inifrån vid x 13,82; östpassagen når z −37,853.
Föreversionen hindrade entrén och östpassagen med den gamla långa muren.
Alla nya mått och placeringar är visuella antaganden, ingen inmätning eller
fysisk telefonprofil. Evidensfilerna följer inte med publiceringspaketet.
Skript, loggar och frysta byggen finns under
`/tmp/kvarteret-orkester-20261023/evidence157/`. Dirigenten verifierar Pages
samt integrerad publicerad vy före stängning.


## Hela södergavlar upp till nocken, #158 (2026-10-23)

Plan: samma komponentmetod som #150, med strålar genom tidigare glipor
och exakt geometridifferens; en byggd faktisk gavelvy före/efter med
ritningsjämförelse; obligatoriska `npm test` och `npm run build`.
Rättningen gäller söderbyggarens generiska sadeltak. Valmade tak,
St Lars 41:s specialmodell och A/B/C/L:s separata byggare behålls.

`node --test tools/southgabletest.mjs` passerar 2/2. Provet kör denna
publika söderbyggare före/efter mot public bas `674a299`, stoppar efter
de fyra verkliga materialbatcherna före canvas/trädkronor och jämför
geometrin. Vid 92 nockkorsande kanter på samtliga 46 generiska
sadeltakskroppar träffar tre strålar per tidigare glipa den rättade fasaden
(20/50/80 % av glipans höjd): 276 bommar före, 276 träffar efter.
Fasaden ökar 3 766→3 950 trianglar, exakt +2 per delad kant.

Tak-, glas-/fönster- och markattribut är byteidentiska. Valmade tak och
St Lars 41 byggs dessutom separat före/efter med identiska attribut i alla
sina batcher. Komponentprovet använder publicens befintliga fjärrdatum
−3,01 m utanför terränggränsen. Fönsterlogiken fortsätter använda hela
originalkanten, medan enbart den övre fasadremsan delas vid nocken.
[Native-logg](../artifacts/158/native.log),
[strålar, differens och attribut-SHA](../artifacts/158/component-results.json).

Faktisk byggd Chromium/SwiftShader (headless, 1000×700, juli):
public bas `674a2994d5124047be2d2764a80d33a0a671e673`, före
`9a76df45252310b1ceb31a6c`, efter `cd26e8112639fecc5816627d`.
Nattsländegatan 2 (OSM 333642387) ses från
(117,133155; 7,5840124; 177,748891) mot
(127,945; 7,5840124; 192,14), samma kamera i båda fallen.
Det granskade bildparet visar att de tidigare himmelöppningarna i
gavelraden är stängda. Totala ritanrop är 24→24, södergruppens
namngivna anrop 4→4. Ritade trianglar är 289 194→289 378, exakt +184.
Takets 670, glasets 4 104 och markens 95 469 trianglar är oförändrade.
Inga sidfel eller externa anrop. Egna [före](../artifacts/158/before-gable.png)/
[efter](../artifacts/158/after-gable.png),
[rådata och byggversioner](../artifacts/158/browser-results.json).

`npm test` passerar (97 moduler och publik isolering), liksom bygge och
diffkontroll. Fulla arbetsloggar och browserkontrollen finns i
`/tmp/kvarteret-orkester-20261023/evidence158/`. Ingen bred profilmatris,
fysisk telefonprestanda eller oberoende uppmätning av byggnader påstås.
Dirigenten granskar/integrerar, publicerar och kontrollerar berörd livevy
efter grön Pages-körning.


## Västra servicevägen 145221612, #148 (2026-10-23)

Återupptagen leverans: tidigare ägares bevarade config-/test-/dokumentpatch
har granskats och återanvänts på public bas `1e1d9f8`; den gamla checkouten
är orörd. Sex primärpunkter har kontrollerats mot originalets exakta
`e1963a313512e4eaea1261217f82a9c0e2e5113f` och samma frysta OSM-underlag
som tidigare vägportar. Äldre World-bevis `633102778d383182f52587ef`
bevaras där; de nu redovisade bilderna och mätningarna är tagna på aktuell bas.

Plan: riktade servicewest/serviceroad- och lampregelprov; verklig byggd
vägyta/skarvar/armaturer före/efter; obligatoriska `npm test`/`npm run build`.
Ingen bred profil eller utökad gånggräns. Byggnader A/B/C/L har ingen
motsvarande ny kartväg; deras geometri och #158:s gavlar behålls.

`node --test tools/servicewest1463test.mjs tools/serviceroadtest.mjs tools/roadlampstest.mjs`
passerar 19/19. Den kompletta sexnodsvägen är 113,32 m, asfalt/bredd
4,5 m är antaganden, typen är `highway=service` och terrängvalet
`triangles`. Kartans tre anslutningar behålls, och änden mot framtida
95036048 lämnas bar. Inga andra vägar importeras. Hela bilrutor,
byggnadskroppar, gårdshål och skogsmarginaler skyddas av proven.
Den befintliga 58°-projektionen och WALK.z1=250 är oförändrade; den nya
sträckan ligger bortom gånggränsen och är ingen ny utlovad gångrutt.
[Native-logg](../artifacts/148/native.log).

Den oförändrade lampregeln ger 159→161 kandidater med tom träd-/befintlig
armatur-lista. Fyra kandidater tillkommer på 145221612; de tidigare
ändlägena på 145221573 och 145221576 tas bort. Det berörda äldre
serviceroad-testets antal för 145221576 uppdateras från fem till fyra.
Den nya testfilen använder ingen historisk global totalsiffra som grind.
Originalets 126→128 behöver inte motsvara den fristående publicscenen.

Byggd Chromium/SwiftShader, headless 1280×800 i juli: före
`cd26e8112639fecc5816627d`, efter `3bbed599544c9effc3f21fb6`.
Strålar mot faktisk sammanslagen `south-land` och terrängens ritade
frågemesh kontrollerar centrum och ±2,1 m vid 25/50/75 % av alla fem
segment. Före får 0/45 stöd vid den nya asfaltens höjd; efter får 45/45
stöd vid terräng +25 mm. Största höjdfel är 0,0000021 m. Fem punkter
kring vardera av tre anslutningar, böjen och ytteränden (två meter in)
ger 25/25 träffar; största fel 0,000425 m, under provets 2 mm tolerans.

Den faktiska World-modellen har 148→150 kompletterande vägarmaturer:
fyra nya och två borttagna ändarmaturer från samma två källvägar.
De nya stolparnas fötter avviker högst 0,00000017 m från terrängen;
armaturhuvud och stolpe har identiska instansmatriser. Samma 22
gatumeshar behålls och söderfasadens 3 950 trianglar från #158 är kvar.
Aktuella parkeringsplan och markkällor är inte ändrade. Inga sidfel
eller externa anrop. [Sammanfattning](../artifacts/148/summary.json),
[byggversioner, strålar och berörda armaturer](../artifacts/148/browser-results.json).

Granskade egna bildpar: [översikt före](../artifacts/148/before-overview.png)/
[översikt efter](../artifacts/148/after-overview.png),
[anslutning före](../artifacts/148/before-junction.png)/
[anslutning efter](../artifacts/148/after-junction.png).
`npm test` passerar (97 moduler och publik isolering), liksom bygge och
diffkontroll. Fulla arbetsloggar och browserverktyget finns i
`/tmp/kvarteret-orkester-20261023/evidence148/`. Ingen fysisk telefon-FPS
eller oberoende inmätning påstås. Dirigenten publicerar, kontrollerar
Pages och berörd livevy och stänger först därefter.


## Befintliga serviceinfarters råsemantik, #149 (2026-10-23)

Granskningen visade att OSM 335403605/606 redan ritades i publicen från
#127, commit `e9767d1dce37eaff0c21dff5ab2eda68b6eed4cb`. Punkten i
originalets lista efter #148 beskriver dess importordning. Publicens
befintliga ordning behålls och inga dubbla vägar införs. Endast saknad
`highway: 'service'` och normaliserad ytproveniens kompletteras på de
två posterna. 605:s asfalt/bredd är antaganden. 606:s `osm:paved`
belägger hårdgjord yta; valet av asfalt som material är fortsatt ett
antagande, liksom bredden.

Plan: anpassat käll-/geometri-/parkeringsprov och befintlig lampregel;
#148:s byggda ray-/armaturharness återanvänds för aktuella vägskarvar
och bildpar; obligatoriska `npm test`/`npm run build`. A/B/C/L berörs
inte. Parkeringsplan, hus, markkällor och gånggräns behålls.

`node --test tools/servicepark1449test.mjs tools/roadlampstest.mjs tools/roadsideparkingtest.mjs`
passerar 19/19. Proven kontrollerar fulla frysta primärpunkter och råtaggar,
56,40 m/omkring 31 m väg, `terrain: 'triangles'`, gissad bredd 4,5 m,
kartnoderna vid 36918924/1147690112 och 605:s slut inne i parkering
1379042188. Gångvägar förblir gångvägar. Kompletta remsor undviker hus
och skogsmarginaler. Befintliga hela rutor och fria infarter bevaras.
Ett separat jämförelseprov skyddar samma vägformer/accessordning och
berörda parkeringsposter mot public bas `2899dcdd`.
[Native-logg](../artifacts/149/native.log). Den oförändrade lampregeln
ger exakt samma fulla kandidatlista utan träd/befintliga armaturer,
161→161; originalets 128→130 är ingen gräns för publicen.

Byggd faktisk Chromium/SwiftShader (headless, 1280×800, juli): före
`3bbed599544c9effc3f21fb6`, efter `51318a46c9d9cb578b5f5839`.
63 centrum-/sidstrålar (±2,1 m) längs alla sju segment, 50 prov runt
noder/ändar och fyra strålar 5 cm innanför ändarna träffar faktisk
sammanslagen vägyta vid ritad terräng +25 mm. Största felen är
0,000000812 m, 0,000000769 m respektive 0,000000407 m, under
provets 2 mm tolerans. Samma gröna stöd finns före kompletteringen.

Den faktiska World-scenen har 150→150 vägarmaturer; de två befintliga
armaturerna på dessa källvägar står kvar och deras stolp-/huvudmatriser
matchar. Alla World-lampplaceringar är identiska. Hela stolpinstansmatrisen
och positionerna i faktisk south-land/terräng har identiska SHA-256 före
och efter. Båda granskade PNG-bildparen är byteidentiska. Inga sidfel
eller externa anrop. [Sammanfattning](../artifacts/149/summary.json),
[rådata, geometri-/matrishashar och PNG-hashar](../artifacts/149/browser-results.json).

Egna bilder: [översikt före](../artifacts/149/before-overview.png)/
[översikt efter](../artifacts/149/after-overview.png),
[gemensam nod före](../artifacts/149/before-junction.png)/
[gemensam nod efter](../artifacts/149/after-junction.png).
`npm test` passerar (97 moduler och publik isolering), liksom bygge och
diffkontroll. Arbetsloggar och browserverktyget finns i
`/tmp/kvarteret-orkester-20261023/evidence149/`. Ingen fysisk
telefonprestanda påstås. Dirigenten publicerar, kontrollerar Pages/
berörd livevy och stänger därefter.


## Hela serviceringen och separat gångväg, #152 (2026-10-23)

Plan: frysta råpunkter, prefix/nodgraf, hela geometrier och lampklassning;
byggda före/efter-vyer, faktisk väg-/nod-/gränsstöd och armaturmatriser;
obligatoriska `npm test`/`npm run build`. Söder om z460 används ritad mark,
ingen fortsatt höjdsampler. Parkeringsplan/markkällor/hus och A/B/C/L:s
separata geometrier bevaras.

`node --test tools/servicering1464test.mjs tools/servicewest1463test.mjs tools/serviceroadtest.mjs tools/roadlampstest.mjs`
passerar 23/23. Serviceväg 95036048 har 17 frysta primärpunkter och
514,23 m; gångväg 199056947 har två punkter och 40,37 m. Bredder
4,5/2 m och asfalt är antaganden. De fyra tidigare officiella prefixnoderna
bevaras, liksom innerslingans anslutningar och 145221612:s ytterände.
Hela remsor håller undan från hus, gårdshål, skogsmarginaler och tidigare
hela bilrutor. Gångvägen är ingen fordonsväg och får inga vägarmaturer.
WALK.z1=250 är oförändrat; bakgrundsvägarna är ingen ny utlovad gångrutt.
[Native-logg](../artifacts/152/native.log).

Tom träd-/befintlig-armatur-lista ger 161→171 kandidater: tolv nya
ringlägen och två nu blockerade lägen på 145221614/599 bort. Tre
ringlägen fanns redan på prefixet. Originalets 130→142 är inget publikt
måltal. Faktisk byggd World ger 150→160 vägarmaturer: samma tolv
till och två bort. Ringen har 15 armaturer; gångvägen har noll.
Stolp-/huvudmatriser och fötter mot ritad mark kontrolleras. Samma
gatumeshar återanvänds; söderfasadens 3 950 trianglar från #158 behålls.

Byggd Chromium/SwiftShader, headless 1280×800 i juli: public bas
`1512835ad6d7d80bcc4fc27fa0784da35a75d3dd`, före
`51318a46c9d9cb578b5f5839`, efter `21eec28c6c4e1471a9b971c9`.
153 centrum-/sidprov längs 17 segment (service ±2,15 m, gångväg ±0,9 m),
95 prov kring de 19 noderna och 18 särskilda prov vid de två
z460-korsningarna passerar. Maxfel mot väglyftet 25 mm är
0,00000409 m för segment, 0,00179134 m för noder och 0,00000666 m
vid rutnätsgränsen, samtliga under 2 mm tolerans.
[Parad sammanfattning](../artifacts/152/summary.json),
[rådata, byggversioner och berörda armaturer](../artifacts/152/browser-results.json).

En enda fokuserad efterkontroll använder den översta faktiskt emitterade
uppåtvända gräsytan bortom z460; den antar ingen bestämd gräsfärg.
Alla 266 strålar passerar, varav 97 utanför rutnätet. Där är största fel
0,0000000954 m; lägsta och högsta grästräff har identisk höjd på denna
baslinje. Inga konkreta väg-/markglapp finns i provpunkterna.
[Synlig toppyta](../artifacts/152/visible-grass-summary.json),
[alla toppytestrålar](../artifacts/152/visible-grass-rays.json).

Den separata #160-rampen är inte inblandad här. Ringens z460-korsningar
ligger omkring x−8 och x−39, medan 18 av dess provpunkter närmar sig
#160:s lilla rampområde x−32…−28/z460…472. Exakta
[kontaktpunkter](../artifacts/152/ramp-contact-points.json) är sparade för
minsta kombinerade slutkontroll mot den synliga övre rampytan efter
integration. Ingen terrängfunktion har ändrats i #152.

Granskade egna bildpar: [ring före](../artifacts/152/before-overview.png)/
[ring efter](../artifacts/152/after-overview.png),
[södra markkant före](../artifacts/152/before-southern-edge.png)/
[södra markkant efter](../artifacts/152/after-southern-edge.png),
[gångväg före](../artifacts/152/before-footway.png)/
[gångväg efter](../artifacts/152/after-footway.png).
Inga sidfel eller externa anrop. `npm test` passerar (97 moduler och publik
isolering), liksom bygge och diffkontroll. Arbetsloggar och båda fokuserade
browserverktygen finns i `/tmp/kvarteret-orkester-20261023/evidence152/`.
Ingen fysisk telefonprestanda påstås. Dirigenten publicerar #152 och
verifierar Pages/live före separat #160-integration och dess kombinationsprov.


## Sammanhängande fjärrgräs i söder, #160

2026-10-23: exakt källa `0ff9d52fc8dc3ff61a347dd0b0d3008d7a60d946`,
publik baslinje `1512835ad6d7d80bcc4fc27fa0784da35a75d3dd`.
Byggd föreversion `51318a46c9d9cb578b5f5839`, efterversion
`8c49436b00dc1dfad5ddee64`. Endast gräsmedelfärg/fjärrplan och positiv
12 m kantramp ändras. Ingen motsvarande husvariant i A/B/C/L berörs.

`node --test tools/southfar-ground-test.mjs tools/southgabletest.mjs` passerar
5/5: korrekt gammakonverterad gräsmedelfärg på en känd canvasfixture,
ursprungliga höga/plana kantankare, endast positiv ramp inom 1 cm, oförändrade
fyra ursprungliga geometri-/materialbatcher före träden samt isolerade gavelstrålar.
Gavelharnessen bygger nu båda varianterna från aktuell markkod och byter enbart
väggloopen mot pre-#158-koden från `674a299`; båda får samma neutrala gräsfixture
för DOM-fri geometrijämförelse. Den jämför därmed gaveln utan att felaktigt
avvisa senare godkända markändringar. `npm test`, `npm run build` och
`git diff --check` passerar. [Native-rådata](../artifacts/160/native-summary.json).

Publicens emitterade kant mättes före porten: 151 unika hörn vid z 460,
huvudhöjning vid x −98/−94/−90/−86 och liten höjning vid x −30.
Maxhöjd −1,843816876 m vid x −94 motsvarar 1,16618 m över fjärrplanet.
[Ursprungliga kantvärden](../artifacts/160/edge-before.json).
Rampen täcker x −102…−82 och −32…−28, z 460…472; endast överhöjd byggs.

Byggd faktisk scen i headless Chromium/SwiftShader, 1000×700, samma sneda kamera,
juli 12:00 Europe/Stockholm och visningens fasta klara dagsljus.
[Före](../artifacts/160/before.png) och [efter](../artifacts/160/after.png)
är granskade: den raka ljusa färgkanten är borta och högre kanten möter fjärrmarken.
En befintlig byggnad täcker del av förgrunden; det numeriska provet täcker hela kanten.
Ritanrop 16→16, texturer 43→43, ritade trianglar 259208→259304.
`south-land` ökar 96198→96294 trianglar; samma fyra grundmeshar
(`south-facade/roof/glass/land`) och två befintliga trädinstansmeshar är kvar.
Det finns exakt en landmesh, inget nytt material. Inga sidfel eller externa anrop.

En oberoende beräkning från den faktiska 256×256-gräskartan ger linjärt medel
[0,7966933, 0,7966933, 0,6883625]. Fjärrfärgens RGB är
[0,131559715, 0,205692545, 0,054253962], största avvikelse från förväntad
sommarfärg × kartmedel × blåtonsvärme är 4,19×10⁻⁹ (före 0,1756).
[Byggidentitet, kamera, färg och resurser](../artifacts/160/browser-results.json).

En enda kompletterande byggd kontroll jämför strålar mot verklig `site-terrain`
och ramptrianglarna i `south-land`, utan att förväxla rampens topp med planet under.
Högsta sömfel är 0,003988 m. Rådatans ramputdrag omfattar trianglar med minst
ett hörn mer än 4 mm över fjärrplanet (94 trianglar); hela landmeshens differens
är 96 trianglar. Vid den separat arbetade #152-vägens sista krök är ramptoppen
vid (−32,469) −3,009003 m och vid (−30,469) −3,008006 m, alltså cirka
1–2 mm över planet; (−28,470) och (−27,471) ligger på planet.
[Byggd kant-/rampprovning](../artifacts/160/ramp-built.json).
Integrationsägaren gör minsta kombinerade väg-/rampprov efter #152:s integration.

Rampens längd och fjärrfärgens jämna representation är visuella antaganden,
ingen inmätning eller ny fysisk telefonprofil. Evidensfilerna följer inte med
publiceringspaketet. Skript/loggar/frysta byggen finns under
`/tmp/kvarteret-orkester-20261023/evidence160/`. Pages och publicerad berörd
vy kontrolleras av dirigenten före stängning.


Sampublicering med #152 verifierad på byggversion `96c7b68499addd36f6bd6d6e`.
De 18 sparade kontaktpunkterna mäts mot den **översta synliga** gräsytan,
inklusive den lilla rampen. Asfalt ligger 22,740556–24,986803 mm över gräset;
signerad ändring från tidigare 25 mm är −2,259444…−0,013197 mm. Ingen punkt
saknar stöd och ingen asfalt skärs eller döljs av rampen. Den granskade
[julivyn](../artifacts/160/combined-july.png) visar sammanhängande gräs/asfalt;
[rådata](../artifacts/160/combined-results.json) sparar alla punkter och byggidentitet.
Fyra kärnbatcher och två befintliga trädinstansmeshar, 43 texturer samt
World 160 vägarmaturer/15 ring/0 gångväg bevaras. Denna nya kameras 914 anrop
är ingen före/efterjämförelse. Inga sidfel eller externa anrop. Inga
produktjusteringar görs för den lilla avsiktliga skillnaden i dekallyft.
Integrerade nativeprov för mark/gavlar/ring/västväg passerar 13/13,
liksom `npm test` (97 moduler), bygge och diffkontroll.

## Brofäste och antagen parkering (#161)

Källa `f9ef2cc0f527af9423b1e5f366af868ae013e9ba`, förebas `c4a37167`.
Byggda revisioner `96c7b68499addd36f6bd6d6e` → `cf63d599b7a51acbc39e82a9`.
Tre riktade [nativeprov](../artifacts/161/native.log) passerar: hela rutor och
anslutning, markföljande refug med utåtvända sidor/fria gångvägar samt
markföljande zebraränder. 16 hela 2,5×5 m-rutor ryms mot antagen kapacitet 25;
de gamla lotterna behåller 36 respektive 10 rutor. Refugen ligger 14,5 cm över
marken (12 cm över modellens asfaltlyft), med två gula pollare och mer än en
meters fri väg på båda sidor. Den är visuell; provet påstår inte ny fysisk
kollision eller verifierad tillgänglighetsstandard. Inga nya stolpar ligger på
mappade gångvägar.

Byggd headless Chromium i juli, samma kameror/tid före och efter:
[brofäste före](../artifacts/161/desktop-before-bridgehead.png) /
[efter](../artifacts/161/desktop-after-bridgehead.png),
[parkering före](../artifacts/161/desktop-before-parking.png) /
[efter](../artifacts/161/desktop-after-parking.png), samt
[Android efter](../artifacts/161/android-after-bridgehead.png).
Bilderna är egna och granskade; antagen parkering, fyra zebraränder,
refug/pollare, blå skyltar och enfärgad orange flagga syns.
31 vertikala rays mäter mot den faktiskt byggda terrängmeshen: 12 randprov,
4 refugprov och 15 parkeringsprov. Maxfel mot respektive avsiktligt marklyft
45/145/20 mm är 0,0912/0,2308/0,000132 mm; ingen yta saknar markstöd.

Den befintliga offentliga Androidgrinden hålls: hela östcampus inklusive
access/instanser ökar 39 548 → 40 022 trianglar (+474), under oförändrade
40 843 med marginal 821. Alla tio campusmeshar bevaras, `east-access`
11 067 → 11 541. Desktophelgruppen är 81 207 → 81 681 (diagnostik, inget nytt
tak). Street går 22 → 28 meshar genom sex nya skylt-/flaggfaces; befintliga
materialbatcher för refug, pollare och ränder återanvänds. Uppmätta scenanrop
för brofäste är desktop 339 → 345 och Android 49 → 56; parkeringskameran
40 → 47. Detta är faktiska kamerautfall, inte en ny global budget eller
påstående om oförändrade scenanrop.

Worlds vägarmaturer går 160 → 159 med befintlig lot-exkludering. En separat
[källbunden kontroll utan träd/befintliga armaturer](../artifacts/161/lamp-diff.json)
ger 171 → 170, endast kandidaten för way 44447967 vid
`(52.40507129450392, 67.29084650491701)`, yaw `2.9770831068702743`, försvinner
inne i nya loten; inga kandidater tillkommer. Inga omplaceringar eller
specialregler införs. Harnessen hade ett extra, felaktigt antagande om identiskt
World-antal; efter att detta identifierats bedömdes redan sparade gröna rays,
budgetar och bilder direkt, utan fler browserprofiler.

[Rå browserdata](../artifacts/161/browser-results.json) och
[sammanställda rays/budgetar](../artifacts/161/summary.json) sparar byggversioner,
kameror och resultat. Inga sidfel eller externa anrop i någon profil.
[`npm test`](../artifacts/161/npm-test.log) (97 moduler) och
[`npm run build`](../artifacts/161/after-build.log) passerar.
Ingen bred inventering, historisk originalbudget eller fysisk FPS-mätning görs.
Publicering och separat livekontroll hanteras av dirigenten.


## Delad tegelstil för södra paviljonger, #164

Källa `c3b468830bfc8cb869b8332377c830cdd7454ecd`; publik förebas
`f6d4d1d`, förebygge `cf63d599b7a51acbc39e82a9`, efterbygge
`8124ee637074927d1ac64549`. `npm test` passerar (98 moduler och
publik import-/innehålls-/nätgräns); `npm run build` passerar med låsta
oförändrade beroenden. `node --test --test-isolation=none
 tools/brickstyletest.mjs tools/stlars41test.mjs tools/southgabletest.mjs`
passerar 10/10: alla sju valda fyravåningshus, stilgeometrins färg/höjd/
kontur/batchning, nr 41:s arkitektur och den tidigare gavelrättningen.
Det nya hashprovet visar identiska ordnade attribut i nr 41:s alla tre
geometrier. Alla tidigare `SITE.south`-data jämfördes exakt före/efter,
med endast nya `brickStyle` undantagen.

Faktisk byggd publik app kördes i Chromium 145/SwiftShader med en
matchad rapportliknande södervy på dator (960×540) och Android-UA/
lowMemory (844×390), DPR 1. Ögat `(75,62,216)` riktas mot
`(−15,4,370)`, månad 10 och samma deterministiska slumpindata i båda
versionerna. Exakt ursprunglig kamerametadata saknas, så bildkompositionen
är återskapad ungefärligt från originalets rapportvy; våra egna före/efter-
kameror är exakt identiska. Ingen kvalitets-, ljus- eller budgetgräns ändras.

| Profil | Scenanrop före → efter | Scenans trianglar | Hela sydgruppen |
| --- | ---: | ---: | ---: |
| Dator | 27 → 27 | 296 015 → 302 391 | 112 622 → 118 998 |
| Android | 30 → 30 | 376 303 → 382 679 | 112 202 → 118 578 |

Ökningen är 6 376 trianglar; samma sydmeshar och materialbatcher används.
Hela östcampus är oförändrat: 81 681 på datorn och 40 022 på Android,
under befintliga 40 843 med 821 marginal. Public har inget lokalt
sydtak; originalets höjda tak importeras inte. Detta är riktade verkliga
kamerautfall, inga nya globala maxvärden eller fysisk FPS-mätning.

Alla 54 byggnadsregister behåller polygoner/hål, våningar, bas/fot,
takfot och takprov exakt. Faktiska positionsbuffertar i `south-roof`,
`south-land` och `site-terrain` är SHA-256-identiska före/efter, även
parkerings-/vägytorna. De tre originallagringsmarkörerna behålls;
inga nya lagringsnycklar, externa anrop, WebSockets eller sidfel.
A/B/C/L byggs separat och använder inte den nya stilmodulen.

Egna inspekterade bilder: [dator före](verification/164/desktop-before-report.png) /
[efter](verification/164/desktop-after-report.png) samt
[Android före](verification/164/phone-before-report.png) /
[efter](verification/164/phone-after-report.png). JSON per vy och
`browser-results.json` sparar faktiska kameror, register, positionshashar,
renderkostnad och isoleringsresultat lokalt under `artifacts/164/`.
Ingen originalbild eller rapportmetadata ingår i publiceringspaketet.

Verifieringen hölls till komponentbevarande och en parvis faktisk vy per
profil. Två desktopbilder ersattes efter egeninspektion för att få bort
Fortsätt-knappen genom riktigt muslås; gröna funktionsprov upprepades inte.
Ingen fysisk telefon eller global värstafallsprofil påstås.

## Mjukare kantlinjer, #165

Källa `814603f755e69da5e7d1d6adcb32a2a23ce21e35`; publik förebas `16f73fe`.
`npm test` och `npm run build` passerar; `node --test tools/architectureedgestest.mjs`
passerar 8/8 för båda kantbyggarna (kompakta normaliserade färger, ett batch och
ett material, olika tint per yta och per materialgrupp, ingen extra
geometri). Faktisk app i Chromium/SwiftShader, 960×540, fast klocka
(`tools/architectureedges-check.mjs`), före → efter, identiskt:

| Vy | Ritanrop | Trianglar | Linjer | Kantbatchar |
| --- | ---: | ---: | ---: | ---: |
| Trapphus | 191 → 191 | 450 249 → 450 249 | 3 824 → 3 824 | 232 → 232 |
| Lägenhet | 412 → 412 | 716 978 → 716 978 | 6 280 → 6 280 | 232 → 232 |
| Gård | 844 → 844 | 698 295 → 698 295 | 11 843 → 11 843 | 232 → 232 |

Alla 232 batchar har färgattribut efter ändringen (0 före). Bilder:
[före](verification/165/before-home.png) / [efter](verification/165/after-home.png);
mätdata i `verification/165/*.json`. Ingen fysisk enhet testad.

## Kantlinjernas konstruktionsdata frigörs, #166

Källa: original `aee89d9` (#1590). Ren refaktorering: shaderkoden och kantgeometrin är
oförändrade, `edgeDepthOffset`/`noRaycast` ligger på modulnivå i båda kantfilerna.
`npm test`, `npm run build` och `tools/architectureedgestest.mjs` gröna.

Visuellt: `tools/architectureedges-check.mjs` (trapphus, lägenhet, gård; 960×540)
före och efter ger byte-identiska PNG-filer och oförändrade räknare (232 kantbatchar,
48 092 kantvertex, 191/412/844 ritanrop).

JS-heap, iPhone-lik profil (852×393, DPR 3, iOS-UA, touch; Chromium/SwiftShader;
CDP `Performance.getMetrics` `JSHeapUsedSize`, efter två `HeapProfiler.collectGarbage`,
5 s efter första ritade bildrutor), MB:

| | före | efter |
| --- | ---: | ---: |
| JS-heap efter GC | 274,5 (1 körning) | 110,1 / 110,4 (2 körningar) |
| JS-heap, provtagen topp (100 ms) | 340 (1 körning) | 224 / 266 |

Toppen är grovt provtagen och brusig; värdet efter GC är det stabila. En enda körning
före (en andra hängde sig). Ingen fysisk enhet testad.

## Tegelhusens vindning, #167

`node --test tools/brickstyletest.mjs tools/stlars41test.mjs`: 10/10. Utan ändringen i
`src/brickstyle.js` underkänns vindningstesterna (nr 42: 816 av 1632, nr 41: 926 av 1946
fasadtrianglar omvända) och byte-för-byte-testet. `npm test` och `npm run build` gröna.
Riktig WebGL-visning i Chromium/SwiftShader (`window.lundenViewer`, samma kameror före/efter):
solsidorna är ljust tegelröda och nr 41:s takfall belysta i stället för nästan svarta, inga
sidfel: [paviljong 42](verification/167/paviljong-42-fore-efter.jpg),
[nr 41](verification/167/nr41-fore-efter.jpg). Ingen fysisk enhet testad.

## Kantlinjer på vertexfärgade ytor, #168

`node --test tools/architectureedgestest.mjs`: 10/10; det nya vertexfärgade fallet underkänns
för båda byggarna utan ändringen. `npm test` och `npm run build` gröna. Riktig WebGL-visning i
Chromium/SwiftShader (`window.lundenViewer`, platsen Trapphuset): kantbatcharna har 226 olika
färgtoner mot 44 före, med samma 49 556 hörn; inga sidfel. Ingen bild: kamerans flytt till
platsen gav olika vyer före/efter, så en jämförelsebild hade inte visat samma sak. Ingen
fysisk enhet testad.

## Blågrå campustak, #173

`npm test` och `npm run build` gröna. Riktig WebGL-visning i Chromium/SwiftShader
(`window.lundenViewer`, samma kameror före/efter, östra campus från sydost): taken är blågrå
i stället för nästan svarta i juli ([före till vänster, efter till höger](verification/173/campustak-juli-fore-efter.jpg));
`?month=1` ger oförändrade, ljusa snötak, eftersom vertexfärgerna stängs av i snömånaderna
([januari](verification/173/campustak-januari-fore-efter.jpg)). `renderer.info.render.calls`
oförändrat före/efter: 918 i juli, 915 i januari; inga sidfel. Takfärgerna är *guess*.
Ingen fysisk enhet testad.

## Karpvägen: färger och våningar, #174

`npm test` och `npm run build` gröna. Riktig WebGL-visning i Chromium/SwiftShader
(`window.lundenViewer`, kameran satt på marken vid Karpvägen med samma pose före/efter):
Östra långan har ljusare, gråvit fasad och en våning till
([juli, före till vänster, efter till höger](verification/174/karpvagen-juli-langan-fore-efter.jpg)).
De tre tegelhusen sedda från sydost har oförändrad tegelfasad; de mörkare blågrå taken syns
bara svagt från marken ([juli](verification/174/karpvagen-juli-vast-fore-efter.jpg)).
Med `?month=1` ([långan](verification/174/karpvagen-januari-langan-fore-efter.jpg),
[tegelhusen](verification/174/karpvagen-januari-vast-fore-efter.jpg)) ligger snön kvar på marken
och taken är opåverkade av tonen; från marken syns inga takytor på långan, så snötakens vithet
är inte visuellt belagd i just dessa vyer (båda takmaterialen är oförändrade i koden).
`renderer.info.render.calls` oförändrat (juli 36/40/39, januari 35/39/37); trianglar +188 i alla
tre vyer (den extra våningen); inga sidfel. Värdena är *guess*. Ingen fysisk enhet testad.

## Tätare skog i ådalen, #175

`npm test` och `npm run build` gröna. Riktig WebGL-visning i Chromium/SwiftShader
(`window.lundenViewer`, juli, samma kameror före/efter; vänster före, höger efter):
de två OSM-skogsplättarna fylls med stora, breda kronor
([från norra bron](verification/175/adalen-fran-norr-fore-efter.jpg),
[sydväst i dalen](verification/175/adalen-sydvast-fore-efter.jpg),
[mot busshållplatsen](verification/175/adalen-busshallplats-fore-efter.jpg)).
`renderer.info.render.calls` oförändrat (36/86/92); trianglar +4,3 %, +1,3 % och +3,1 %
(364 125→379 959, 539 087→546 251, 539 359→556 017); inga sidfel. Träden ligger på marken
utan att ha granskats mot stigar numerärt: `tools/riverparktest.html` finns inte nedströms och
`clear()` är oförändrad, så stig-/bro-/hållplatsfriheten är bara visuellt sedd, inte uppmätt.
`n` och `scale` är *guess*. Ingen fysisk enhet testad.

## Grönare gräsmark, höstbrunning från oktober, #176

`npm test` och `npm run build` gröna. Riktig WebGL-visning i Chromium/SwiftShader
(`window.lundenViewer`, samma kamerapose före/efter, området sett från sydväst; vänster före, höger efter):
gräset är grönare i [juli](verification/176/graesmark-juli-fore-efter.jpg) och i
[september](verification/176/graesmark-september-fore-efter.jpg) (`?month=9`, tidigare redan halmfärgat,
nu bara 12 % höstton). Med `?month=1` ligger snön kvar och bilden är oförändrad
([januari](verification/176/graesmark-januari-fore-efter.jpg)). `renderer.info.render.calls` och trianglar
oförändrade före/efter (juli och september 53 ritanrop / 439 779 trianglar, januari 51 / 399 579); inga sidfel.
Oktober och november (50 %/60 % höstton) är inte avbildade och värdena är *guess*. Läsreservens
(`grassMeanColor`, helt nollad avläsning) gren är inte provkörd; den är identisk med originalets. Ingen fysisk enhet testad.

## Ån ligger nere i marken, #177

`npm test`, `npm run build` och `node --test tools/riverfalltest.mjs` (7 av 7) gröna. Riktig WebGL-visning i
Chromium/SwiftShader (`window.lundenViewer`, juli, samma kameror före/efter; vänster före, höger efter):
vattnet ligger 1,5 m under strandplanet i stället för 0,7 m och vattenbandet slutar där slänten möter vattnet,
så ingen hård vattenskiva svävar över gräset
([från ån, ögonhöjd på stranden](verification/177/an-fran-norra-stranden-fore-efter.jpg),
[vid gång- och cykelbron](verification/177/an-vid-gc-bron-fore-efter.jpg),
[från gång- och cykelbron](verification/177/an-fran-gc-bron-fore-efter.jpg),
[från vägbron](verification/177/an-fran-vagbron-fore-efter.jpg)).
`renderer.info.render.calls` oförändrat (40/39/39/40); trianglar något färre (−0,1 % till −0,2 %); inga sidfel.
Brodäck (`deckY`), plattjocklek och räcken är oförändrade; bara landfästen och pelare når 0,8 m djupare
(betongkontrollsumman i `riverfalltest.mjs` omräknad, samma värde som originalet). Det nya korridortestet visar
krön ≥ 1,3 m över vattnet och att varje nedsänkt markpunkt ligger under vattenbandet längs hela ån.
Bro-, stig- och navigeringskoden använder bara `waterYAt`/`shoreYAt` relativt, så ingen logik ändrades;
`node --test tools/riverbridgeviewtest.mjs` (stigar, rev och gång över broarna mot vattnet, 2 av 2) är grön.
`waterY`/`bedY` är *guess*. Ingen fysisk enhet testad.

## Telefonprofilen: frigjord geometri, #178

`npm test` och `npm run build` gröna. `node --test tools/lowmemcanarytest.mjs` (three 0.170.0 från `node_modules`) ger 3 av 3
gröna med ändringen och 0 av 3 (alla röda) med `src/lowmemory.js` från `origin/main` `6d0b1a0`: en frigjord normal/uv som
får `needsUpdate = true` höjer inte `version`, loggas en gång via `console.error` med `attribute=…` och `geometry=…`, och
three `WebGLAttributes.update` (mockad GL) kastar inte. Helsidesladdning i Chromium/SwiftShader (25 s) på skrivbord och med
`?lowmem`: canvas skapas, 0 sidfel, 0 `console.error`. Det visar att telefonprofilen startar, inte att något frigjort attribut
faktiskt markerades i en riktig session; guarden är provad med enhetstest. Ingen fysisk enhet testad. Testet ingår inte i `npm test`.

## Stora lövträd mellan sjukhushusen, #179

`npm test` och `npm run build` gröna. Riktig WebGL-visning i Chromium/SwiftShader (`window.lundenViewer`, juli, samma kameror före/efter;
vänster före, höger efter): gamla, bredkronade lövträd står på gräsytorna mellan paviljongerna (nr 41–47) i stället för bara de
glesa skogsträden
([vid vägen mot söder](verification/179/fran-vagen-vid-nr-45-mot-soder-fore-efter.jpg),
[västra gräsytan mot öster](verification/179/vastra-grasytan-mot-ost-fore-efter.jpg),
[södra gräsytan mot söder](verification/179/sodra-grasytan-mot-soder-fore-efter.jpg)).
`renderer.info.render.calls` oförändrat (18/24/18); trianglar per vy +0,4 % (275 642 → 276 838, 293 723 → 294 919, 272 066 → 273 262),
alltså under det ~3 % som ärendet tillåter. `south-crowns.count` 70 → 93: 23 stora träd (originalet 27; nedströms har fler
mappade vägar i `SITE.south.access`, så fler slumppositioner faller bort). Avstånden är mätta på de 23 faktiska positionerna mot
`SITE.south`-data: minst 5,56 m till byggnadskant (krav 5), 3,85 m till vägkant (3,5), 3,70 m till parkering (3), 0 träd i fält
eller inne i fotavtryck. Inga sidfel. Paviljongernas och parkeringarnas polygoner (nr 41–47) är identiska med originalet; nedströms
räknas även `legacyClearings` som parkering. Originalets `tools/southbackdroptest.html` finns inte nedströms, så ingen triangelgräns
uppdaterades. Träden ingår som i originalet inte i markskuggan (`userData.trees` innehåller bara skogsträden). `bigTrees`-placering är *guess*. Ingen
fysisk enhet testad; telefonprofilen (`?lowmem`) är inte provkörd.

