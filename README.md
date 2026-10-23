# Kvarteret Lunden

En fristående, opersonlig 3D-visning av Kv. Lunden för den som vill utforska området och den modellerade bostaden L1007.

**[Öppna Kvarteret Lunden i 3D](https://solwation.github.io/kvarteret-lunden/)**

En första statisk 3D-visning finns i projektet. Den innehåller området, L1007 och ytterligare befintliga lägenhetsmodeller, trapphus med hissar och ett garage med tomma förråd.

## Omfattning

Behåll byggnader, omgivning, fast inredning, förflyttning, dörrar och mätverktyg. Ta bort personlig möblering, teckningar, foton, familjereferenser, karaktärer, poäng, leksaker och andra spelinslag.

Söder om träfotgängarbron ligger en inhägnad hage med två ponnyer (importerad från originalet, #76; skjulet står på jämn mark, #80, och har flyttats tillsammans med vattenhon närmare staketet med bibehållen passage, #102; placeringen är ett antagande). Ponnyerna är enbart miljö och går inte att klappa eller interagera med; de betar gräset i hagen (#78), som är en tät låg matta som växer tillbaka på 72 timmar verklig tid och sparas lokalt i webbläsaren (#84), tre skuggträd står i hagen och ponnyerna söker skydd i regn och står synliga inne i skjulet när det är snö (#79/#87; i snömånaderna har ponnyerna varsitt vintertäcke (#103), halm ligger i skjulet och en girlang med varma lampor hänger på framkanten, #92; saknar väder här, testa med `?paddockrain=0.8` och `?month=1`). Lägg till `?nopaddock` i adressen för att stänga av hagen.

När träden och gårdens klängväxt saknar löv vintertid ritas deras tomma lövbatcher inte (#104). Mars och sommar visar dem igen; stammar, vintergröna växter och snö är kvar.

Visningen ska vara statisk och fungera **utan Cloudflare-integration**. Originalets Workers, WebSockets, delade lagring och speltjänster ska inte användas. Eventuell lokal lagring ska ha egna namn och aldrig läsa eller ändra originalets data.

På telefoner frigörs CPU-kopian av trapphusens färdigritade dörrskyltar när bilden har laddats upp till grafiken. Skyltarnas upplösning och de uppdaterbara hissdisplayerna behålls.

Sydplatåns mark är lokalt förankrad i tio granskade LM-markpunkter och två byggnadsaproner (#106). Källans 77 markhöjdsvar och attribution är bevarade. RH2000 minus 14,36 m är en relativ modellreferens; horisontell registrering, interpolation och apronmått är antaganden. Punkten mäter mark, inte ådjup eller lägenhetsgolv. Den ritade triangelytan approximerar den mjuka markmodellen.

Uteplatshäckarnas åtta befintliga geometridelar ritas var för sig på datorn (#119). Telefonerna behåller originalets enda batch; lövform, färg, placering och gånghinder är oförändrade.

Takterrassernas fasta räcken delas på datorn per hel terrass och gavel (#118), så delar utanför kameran kan väljas bort. Telefoner behåller sin tidigare sammanslagna geometri; utseende och fysiska mått är oförändrade.

Gårdens 272 pergolalampor ritas i två kompletta grupper (#115), så lampor utanför kameran eller helt bakom ett tätt garagetak kan väljas bort per pergola. Placering, utseende och befintlig lampstyrning behålls.

De tolv befintliga loggiaöppningarna i hus A/B/C går att passera i båda riktningarna (#114). Kollisionen lämnar samma 0,85 m öppning som modellen visar; golv, glas och fasta väggar behålls.

Hållplatsens plattform och taktila yta följer de faktiskt ritade terrängtrianglarna (#113), så gräset hålls under beläggningen. Kartlagda gränser, kantsten och tidigare 4/4,4 cm ytlyft är bevarade.

Sankt Lars vägs södra broanslutning har ett högre vägkrön med separata lägre slänter åt väster och öster (#99), förankrat i elva LM-markpunkter och fem tvärsektioner. Väg-/gångcykelbroarnas datum −3 m, anslutningsramp och interpolation är antaganden; LM-punkterna mäter mark. Södra gångcykelbrons ritade anslutning följer nu den lokala gångmarken.

Höje ås vatten, stränder och dalbotten följer ett svagt fall nedströms, tolkat från markreferenser. Vattenstånd och djup är fortsatt uppskattningar.

Träbrons jordramper har sammanhängande grässidor ner till den ritade återrängen vid båda landfästena (#107). Gånghöjder och vattenpassagen under bron är oförändrade.

Parkens gångstråk, vägarna längs Höje å och de kartlagda kvartersvägarna i väster, norr, öster och söder har fasta lampstolpar som följer terrängen (#95/#96). Placeringar och mått är visuella antaganden; visningen behåller sitt fasta dagsljus.

Modellen är en fristående visualisering och kan innehålla avvikelser. Fast inredning och material i L1007 är ett exempel och utgör inte verifierad standard för samtliga bostäder. Projektet är inte Peabs officiella tjänst.

## Koppling till originalet

Original: [solwation/lunden-3d-apartment](https://github.com/solwation/lunden-3d-apartment).

Detta repo har en egen, ren historik för att inte kopiera originalets personliga filer och historik. Det fungerar som en vidareutveckling med originalet som `upstream`; det är inte en GitHub-fork och synkar inte automatiskt.

Förbättringar av byggnader, geometri, fast inredning, rendering och navigation ska löpande bedömas för överföring från originalet. Varje överföring granskas för beroenden, personligt innehåll, spelinslag och nätverksanrop innan den publiceras. Se [rutinen för uppdateringar](docs/upstream.md).

## Lokal start för utvecklare

```sh
git clone https://github.com/solwation/kvarteret-lunden.git
cd kvarteret-lunden
git remote add upstream https://github.com/solwation/lunden-3d-apartment.git
git fetch upstream main
```

Installera och starta visningen:

```sh
npm ci
npm run dev
```

Öppna http://localhost:8157. Bygg för publicering med `npm run build`; de statiska filerna hamnar i `dist/`. Ingen backend, Cloudflare-konfiguration eller driftcredential behövs. Tillfälliga fel vid hämtning av planritningen får ett automatiskt återförsök; permanent fel ger Försök igen. Välkomstkortet visar laddningssteget, sekunder och en förloppsstapel; står ett steg still länge visas ”Det här tar ovanligt lång tid” med Försök igen.

På dator används W A S D/piltangenter för att gå. Rikta mittpunkten mot en dörr eller lucka och klicka för att öppna/stänga; E fungerar också. Första klicket när musen är fri fångar bara musen. I mätläget väljer klick mätpunkter i stället för att öppna objekt. På mobil används styrreglaget och dragning i vyn, även samtidigt med två fingrar. På mobil och skärmar upp till 960 px visas en liten knapp med vald plats. Knappen öppnar en meny som stängs efter val, vid tryck utanför eller med Escape. Större skärmar har numrerade platsknappar. Platsmenyn och tangenterna 1–8 flyttar besökaren till området, L1007, L1004, L1201, innergården, trapphuset, garaget eller hästhagen, i den ordningen. Hästhagen placerar besökaren utanför grinden, med blicken in mot hagen; ponnyerna står vid ankomsten framför besökaren vid staketet (`Paddock.greet`, #88) och är tydligt i bild på både dator och mobil. L1004 och L1201 har modellerade interiörer. L1201:s val tar besökaren till lägenhetens entréhall på våning 3, innanför dörren från loftgången. Sifferraden och det numeriska tangentbordet fungerar under en aktiv visning; genvägar ignoreras i hjälpdialoger och textfält. Mät avstånd väljer två punkter på ytor. Alla mått är ungefärliga modellmått.

På datorn samlas områdets synliga träd och gatlyktor i färre ritningar; detaljerna behålls.

Häckarna vid Hus L:s uteplatser har en lätt bucklig, klippt form med mörkare fot och naturlig tonvariation. Formen är en visuell approximation; gångöppningar och modellens höjd är oförändrade.

Hus A/B:s gemensamma parkdörrar på plan −1 har genomskinligt glas i metallramen. Material och profilsnitt är visuella antaganden; dörrmått och utåtgående rörelse är oförändrade.

I Hus A och B:s källarplan är ytterhörnen hela tegelväggar där loggiorna ligger under marknivå.

Klocktornets fyra urtavlor visar besökarens lokala tid med tydliga visare och timmarkeringar.

Gångbanor och trottoarer ansluter längs körbanornas kanter även i sneda korsningar. Vid södra bro-/parkanslutningen möts de skurna ytorna längs samma trottoarkant, så överlappande asfalt inte bildar ljusa eller mörka triangelflisor (#124). Där följer gånghöjden de faktiskt ritade mark-/gångytorna, med en sammanhängande lokal övergång till omgivningens markfunktion (#135). Kartkopplingen vid Karpvägens mynning har en mjuk avrundning; dess radie är ett visuellt antagande.

På pekskärmar går man genom att sätta tummen var som helst på bildens vänstra del (under hjälpknappen och platsmenyn): spaken hamnar under tummen, följer med om tummen dras förbi kanten och återgår till sin vilande plats i hörnet när tummen lyfts. Höger del av bilden är för att titta. I hjälpdialogen finns **Anpassa touchknappar**: dra Öppna/Stäng och Mät avstånd dit du vill, ändra storlek på dem och spaken (nyp eller reglage) och genomskinlighet eller spegla allt för vänsterhänta. Spara, Avbryt och Återställ standard finns i redigerarens list. Layouten sparas bara på enheten i `localStorage` med nyckeln `kvarteret-lunden.touch-layout`; om lagringen är blockerad gäller den under besöket. Standardlayouten är tumbågen.

Vid automatisk uppdatering sparas plats och blickriktning tillfälligt i flikens egen `sessionStorage` med nyckeln `kvarteret-lunden.update-resume`. Uppgifterna läses och tas bort vid nästa start, godtas i högst fem minuter och berör aldrig originalets lagring. På mobil laddas sidan om automatiskt, med samma plats och vy, när grafiken (WebGL-kontexten) har tappats och återställts; nyckeln `kvarteret-lunden.gl-reload-at` begränsar det till en gång per minut, därefter visas en ruta med Ladda om. Visningen har inga externa nätverksanrop. Three.js ingår i publiceringspaketet.

## Lägg till på hemskärmen

På iPhone/iPad: öppna länken i Safari, välj Dela och Lägg till på hemskärmen. På Android: öppna webbläsarens meny och välj installation eller Lägg till på startskärmen, beroende på webbläsare. Appen har egen grön L-ikon, Apple Touch-ikon och manifest med ikoner för Android. Manifestet anger en beständig startlänk till projektets egen GitHub Pages-adress, utan tillfälliga versionsparametrar. En redan skapad genväg kan behöva tas bort och läggas till igen för att visa den nya ikonen.

## Publicering

Visningen är publicerad på **[solwation.github.io/kvarteret-lunden](https://solwation.github.io/kvarteret-lunden/)** via GitHub Pages. `.github/workflows/pages.yml` kör tester, bygger och publicerar automatiskt efter varje push till `main`. En misslyckad kontroll stoppar publiceringen. Publicering ska enbart innehålla de granskade statiska filer som visningen behöver.


En öppen visning kontrollerar nya versioner varje minut och när fliken blir synlig eller nätet återkommer. Efter tio sekunders inaktivitet visas en femsekunders nedräkning. Rörelse och annan inmatning avbryter nedräkningen; hjälp och mätning skjuter upp den. Plats och blickriktning återställs efter omladdningen. På dator klickar man Fortsätt utforska för att fånga musen igen. Om webbläsaren blockerar lagring startar den nya versionen från välkomstvyn. Ingen inloggning behövs. Nätfel låter den befintliga visningen fortsätta. Ändringar som bara berör dokumentation laddar inte om besökaren.

## Verifiering

Promenadytan sträcker sig ner till ån, över broarna och bland skolbyggnaderna till klocktornet (`WALK`, `src/farwalk.js`); `tools/farwalk-check.mjs` kontrollerar den. `node tools/riverat-check.mjs` jämför flod- och kollisionsresultat mot baslinjen och mäter kontrollernas kostnad.

`npm test` granskar importkedjan, planunderlaget och frånvaro av privata referenser och originalets tjänster. `npm run build` skapar det statiska publiceringspaketet. Kör `CHROME_PATH=/sökväg/till/chrome node tools/browser-check.mjs http://localhost:8157` mot en server för `dist/` för integrationstest i Chromium, inklusive mobil layout, gång, dörranimation, ursprunglig lagring och nätverksanrop. `tools/touchcustom-check.mjs` kontrollerar på samma sätt den egna touchlayouten. `tools/startup-error-check.mjs` kontrollerar laddningsstegen, stoppmeddelandet och felkortet med steg och Försök igen när starten misslyckas.

`node --test tools/seasoncrowntest.mjs` jämför samtliga månader med den frysta public-versionen före #104: exakt samma instansmatriser, färger, objekt och befintliga bounds, med synlighet bara när lövfaktorn är positiv. Se [verifieringen](docs/verification.md#tomma-vinterkronor-104) för World-mätningar.

`CHROME_PATH=… node tools/bridge-ramp-check.mjs http://localhost:8157` mot källservern kontrollerar träbrons sidoytor mot faktisk terrängtriangulering och vatten under bron; `tools/farwalk-check.mjs` går över den åt båda hållen.

Välj minsta tillräckliga kontroller enligt [verifieringspolicyn](docs/verification.md#verifieringspolicy). För arbete med issues, `in-progress`, stängning och `/orkester`, läs [CLAUDE.md](CLAUDE.md) och [orkesterkommandot](.claude/commands/orkester.md). Ärenden för detta projekt skapas här i [kvarteret-lunden](https://github.com/solwation/kvarteret-lunden/issues).

Orkesterarbete samordnas i [#4](https://github.com/solwation/kvarteret-lunden/issues/4). Den första importens historik finns i [originalets #1064](https://github.com/solwation/lunden-3d-apartment/issues/1064).


Finare öppna höjdreferenser för Höje å och ett separat verktyg för att hämta eller återläsa punkterna finns i [importregistret](docs/upstream.md#finare-höjdreferenser-för-höje-å-85). Markdata visar varken uppmätt undervattensbotten eller lägenhetens absoluta golvnivå.

Vägbelysningen kontrolleras med `node --test tools/roadlampstest.mjs`, `node tools/roadlampstest.cjs BASE` och `node tools/roadlamps-check.mjs BASE OUT` (riktig dator-/mobilvisning). Parkbelysningens placering och rendering kontrolleras med `node --test tools/pathlampstest.mjs` och `node tools/pathlampstest.cjs BASE` (PLAYWRIGHT_MODULE, CHROME_PATH och SHOTS kan anges).

Den södra bakgrundsmarken fortsätter nu över GLO-höjdplatån till modellens z460 (#105).
Byggnadsfötter, hage och befintlig beläggning följer samma mark. Höjder och mellanliggande
mark är relativa modellantaganden. Den lokala LM-förfiningen (#106) är levererad;
samtliga tolv södra parkeringskonturer är levererade i #125–#132.
Se [samlad leveransgranskning](docs/verification.md#slutgranskning-av-de-tolv-parkeringsytorna-100)
för källor, civilplan/radkärnor och verifierade begränsningar.

Östcampusets befintliga puts- och listmaterial grupperas efter hela byggnadsbidrag i tre fasta renderingsbatcher på datorn; telefoner behåller den ursprungliga gemensamma batchen (#120). Byggnadernas former och material ändras inte.

Östcampusets mobilgräns gäller hela gruppen, inklusive mark/access och klockinstanser
(#136): 38519 uppmätta trianglar mot en granskad asset-regressionsgräns 40843.
Den bevarar tidigare terrängprecision och ursprunglig absolut marginal; gränsen
är ingen validerad fysisk FPS-budget. Se [verifieringen](docs/verification.md).

Terrängen använder hela befintliga celler i två desktopgrupper (#121); telefonen
behåller sin enda mesh. Höjder, rays och gångstöd är oförändrade. Den uppmätta
exponerade flodvyn kostar ett extra ritanrop; se [verifieringen](docs/verification.md#kompletta-terrängceller-på-dator-121).

Gatulampornas befintliga markglöd tonas nu med scenens dimma (#122), så avlägsna
pooler inte lyser igenom fullt. Närglöd och dag/nattstyrning bevaras; se [verifieringen](docs/verification.md#gatulampornas-markglöd-i-dimma-122).

Mobilen kan konservativt avvisa extra frustumträffar med hela befintliga geometri-
bounds (#123); A/B/C:s enstaka plana entrérutor ritas i ett pass. Tre kontrollerade
mobilvyer behåller pixelparitet med färre anrop, utan nya kvalitets- eller budgetgränser.
Se [verifieringen](docs/verification.md#mobilens-konservativa-frustum-och-plana-glas-123).

Två källbelagda gatufickor vid servicevägen 30633545 har civilplan och sex
geometriskt inpassade rutor vardera (#125), utan påhittad intern körgång.
De ligger utanför gånggränsen; [källor och antaganden](docs/references/parking-125/README.md).

De två husnära fickorna i #126 har åtta respektive tre hela bilrutor. Den grundare
fickan använder ett uttryckligt antaget djup 4,7 m; husfötter och #125:s civilplan
bevaras. Se [rådata och antaganden](docs/references/parking-126/README.md).

Den indragna parkeringsytan i #127 behåller sin exakta L-kontur: sju hela rutor
lämnar en fri servicekorridor. Den smala grannfickan rymmer tre rutor, utan att
tvingas till en antagen kapacitet. [Källor och tolkning](docs/references/parking-127/README.md).

Parkeringen norr om hus 45 (#128) har två rader med hela bilrutor, sex meters
körgång och fria passager för samtliga tre befintliga lokala infartskurvor. Höjdplanet knyts
till LM-referensen och infarten; bankkrön samt hus 41/45:s apron skyddas.
[Källor och antaganden](docs/references/parking-128/README.md).

Den konkava parkeringen vid hus 46 (#129) behåller alla fjorton källhörn. Tre
hela bilrutor får ett gemensamt lokalt plan; den omarkerade kör- och övergångsytan
behåller nivåerna vid huset och den karterade infarten. Antalet är en layoutgissning,
inte en OSM-kapacitet. [Källor och antaganden](docs/references/parking-129/README.md).

Ytorna vid Nattsländegatan och hus 47 (#130) har sex respektive tre hela rutor
med fria karterade körgångar. Höjdplan och layout är uttryckliga antaganden,
inte OSM-kapaciteter. [Rådata och antaganden](docs/references/parking-130/README.md).

Två korta servicevägar har nu sina rätta OSM-identiteter och lägen (#133). De
tidigare stora GC-kurvorna behålls oförändrade som lokala modellanslutningar,
inklusive terrängklippningen. [Källor och tolkning](docs/references/roads-133/README.md).

Den norra serviceinfarten och tre korta grenar (#116) följer nu kompletta
källkoordinater och delade vägnoder. Befintliga hus, hela bilrutor och GC-passager
bevaras. [Primärdata och breddantaganden](docs/references/roads-116/README.md).

Södra tvärvägen och dess smala servicelänk (#117) följer källnoderna. Den smala
vägen behåller 3 m antagen bredd för att lämna hus 45 fritt; råtypen service
skiljs från gångvägar utan att ändra lampornas breddfilter.
[Källor och antaganden](docs/references/roads-117/README.md).

Den sexhörniga parkeringsytan väster om hus 41–43 (#131) behåller sitt indrag
och får tre hela rutor med ett lokalt antaget plan. Faktiska servicekorridorer
och husens skyddade markstöd lämnas fria. [Källor och antaganden](docs/references/parking-131/README.md).

Fyra källbundna inre servicevägar (#134) delar nu rätt noder med den korta
servicevägen vid hus 44. Den separata, 34,83 m långa källanslutningen till det
redan importerade vägnätet är levererad i #138.
[Källor och avgränsning](docs/references/roads-134/README.md).

Den inre serviceslingan är nu källnodsansluten till den befintliga yttre vägen (#138):
95036048 förlängs endast med nästa 34,83 m till 145221614. Bredd/asfalt är antaganden;
[fryst officiell v6 och attribution](docs/references/parking-130/README.md) återanvänds.

Parkeringen söder om hus 44 (#132) behåller sin exakta konkava åttahörning och får
bara tre hela bilrutor på en lokalt graderad radkärna. Resten är omarkerad kör-/övergångsyta;
alla verkliga servicevägar och den äldre lokala genomfarten lämnas fria.
[Primärkälla och antaganden](docs/references/parking-132/README.md).

Med `?perf` kan långa bildintervall mätas lokalt och exporteras utan en telemetritjänst; se [diagnostikprotokollet](docs/frame-intervals.md).

## Gemensam orkester

`/orkester` använder den modelloberoende kärnan i
[dirigenten-och-orkestern](https://github.com/solwation/dirigenten-och-orkestern),
versionslåst som Git subtree i `.orchestra/shared`. Vanlig kloning räcker.
Vid start eller återupptagning kontrollerar dirigenten nya stabila releaser och
versionstaggar, med högst ett dygns återanvändning av en lyckad kontroll. Relevanta
buggfixar ska ge uppdateringsförslag; övriga uppgraderingar är valfria. Importen
är fortsatt granskad och uttrycklig, utan automatisk uppdatering.
Kärnan kräver minsta tillräckliga modellkapacitet och resonemang när val stöds,
korta arbetsuppdrag och motiverad eskalering med bevarat arbete. Samma
resurshushållning gäller när modellvalet är låst; verifieringskraven behålls.
[Projektpolicy](.orchestra/project.md) anger Lundens köer och publiceringskrav samt
projektets hooks per fas (planering till uppföljning);
[Issueflow](.orchestra/shared/ISSUE-WORKFLOW.md) styr gemensamma etiketter och status.
Andra agentverktyg kan läsa samma filer direkt. Gemensamma förbättringar görs i
kärnans repo och införs här genom en granskad versionsuppdatering.
