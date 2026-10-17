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

