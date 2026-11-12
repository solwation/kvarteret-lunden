# Laststyrd aktiv kapacitet, public #273

Granskad neutral instruktionskälla: original #1935, `f464576038ded33b6ca8919c5ebb4699db7fcab5`, främst `.orchestra/project.md#dynamic-active-capacity` och motsvarande CLAUDE-sammanfattning. Uppdragets äldre planutkast nämnde ett tidigare lokalt SHA; aktuell issuekommentar och dirigentens exakta källval styr denna överföring. Historisk workerbas före integration var `75270c1bdb2f1ab96f3d720ea9a8a2f8ad682222`.

Endast lokala kapacitetsregler och deras historik ändras. Kapacitetstabellen och hjälptexten länkas till autonom upp-/nedskalning, räknar aktiv dirigent, implementerare, hjälpare och granskare, och skiljer aktiva roller från integration-ready-väntan/föräldrasammanfattningar. Den valda källan anpassas med explicita runtime2/4/okänd-exempel och publicens befintliga browserkö/låsreferens. Den lägger inte till ett fast fyratak, nya timers, processer eller övervakningstjänster. Ägarskap, original-före-public, public-low, isolering och ensam publicerare består. Källhänvisning finns i upstreamnotisen; ingen appkod, originalets rapportintag, personlig resurs, gameplay, lagring eller tjänst importeras och ingen ny resurslicens tillkommer.

Vid workeröverlämningen ägde public #272 den separata officiella kärnimporten, dess proveniens/pin, autostartingångar och hela projektavsnittet `Shared version and maintenance`. Dessa delar var byteidentiska med workerbasen. Den äldre tvåtakshänvisningen skulle rättas av #272 och de två patcharna granskas tillsammans före publicering. Detta stycke beskriver överlämningsläget före rebase. Tre äldre kapacitetsfraser i upstreamhistoriken (#265, #172 och #255) anges nu som dåvarande regler med hänvisning till aktuell policy.

## Kontrollgrupp 1: scenarier, diff, länkar och motsägelser

| Scenario | Förväntat beslut enligt granskad text |
| --- | --- |
| Ledig CPU/RAM, stabila körningar, flera oberoende startbara public-low-frågor | Skala försiktigt upp inom bekräftad runtime och granskningsförmåga, i ordinarie köordning; det gamla tvåtaket hindrar inte detta. |
| CPU-mättnad eller minskande tillgängligt minne/swaptryck | Håll ny dispatch eller skala ned. Låt avgränsat aktivt arbete bli klart, eller checkpointa enligt ägarregler. Total RAM ensam är inget beslutsunderlag. |
| API429, kvottryck eller upprepade spawnfel | Minska ny dispatch tills trycket lättar; upprepa bedömningen vid ändring, utan rutinfråga till användaren. |
| Bara kopplade uppgifter eller överlappande skrivningar återstår | Använd färre roller och kör beroenden seriellt; fyll inte platser med dubbelarbete eller framtidsclaims. |
| Dyr browser upptagen, oberoende billig dokumentuppgift startbar | Högst en dyr browser åt gången. Billigt arbete kan fortsätta inom prioritet, resurser och granskningsgenomströmning. Browserlåset är inte hela agenttaket. |
| Integration-ready-kön växer | Väntande handoffs räknas som noll aktiva roller, men deras kommande granskning motiverar minskad dispatch och att integrationskön dräneras. |
| Runtime2 med gott resursutrymme | Aktiv root plus högst en annan aktiv roll; root räknas även vid koordinering/granskning. |
| Runtime4 med gott resursutrymme | Aktiv root plus högst tre andra aktiva roller; fyra är ett tak i detta exempel, ingen regel för andra maskiner. |
| Runtimegräns/CPUkvot/cgroupgräns okänd | Rapportera det okända och använd bara bekräftad kapacitet. Logiska CPU bevisar varken agentplatser eller tilldelad CPUkvot. |
| En plats blir ledig eller arbets-/resurstrycket ändras | Bedöm på nytt själv, redovisa aktivt antal/vald kapacitet/runtime och ett konkret skäl om lämplig kapacitet lämnas ledig. |
| Denna körning: tre startbara uppgifter och runtime4 | Root #272 + worker #273 + worker #274 använder tre roller. Fjärde rollen behövs inte när inget fjärde oberoende arbete är startbart. |

Kort faktisk kontroll under arbetet: 16 logiska CPU, load cirka1,99/2,14/1,91, 26 875 MiB tillgängligt och 0 MiB swap använd. Runtimetaket4 är känt från agentmiljön; cgroup-/CPUkvoter är okända enligt dirigentens senaste mätning. Detta är en daterad lokal observation den 2026-11-12, inte ett permanent tak eller ett bevis på CPUkvot. Ingen ny agent eller browser startades.

Samlad diff, lokala länkar/ankare, scenarioresultat, orörd shared/versionsektion och orörda produkt-/modellfiler kontrolleras i `text-checks.log`. Inga tester som bara speglar proseimplementationen har lagts till.

## Kontrollgrupp 2: obligatoriska snabba kontroller

`npm test` passerar: 141 moduler granskas, importgraf, planunderlag, nätverkspolicy och appidentitet är gröna (`npm-test.log`). `npm run build` passerar med produktfingeravtryck `0aadfeb6003f23b3cdf3b109` (`npm-build.log`). Installerade publicberoenden återanvändes endast genom en tillfällig lässymlänk efter exakt identisk package-lock-SHA256; ingen install/ci kördes. Symlänken tas bort före handoff.

Ren instruktionstext behöver ingen browser, produktresultatbild, appchangelog eller ny modell-/prestandakörning. Befintligt publicmodellarbete och dess bevis lämnas orörda. Faktisk Pages-publicering, slutlig samstämmighet med #272 och issueavslut tillhör integratorn; lokala gröna kontroller påstår inte publicerad acceptans.

## Slutlig integration efter #272

Root återbaserade på levererad #272, `70734637b5edb7f3a16650fc1de016f8b558f403`. Sammanfogad kapacitet/autostart granskades även av en oberoende läsande agent: v0.13.1, exakt shared-träd, versionsavsnitt och #272:s övriga ingångar är bevarade; aktuella kapacitetsregler är konsekventa. Den gamla basen och hashvärdena i `text-checks.log` är uttryckligen historiska workerresultat. [Aktuell integrationsidentitet och länkkontroll](integration.json) gäller slutträdet. Obligatoriska snabba kontroller omkördes grönt efter rebase: `integrated-test.log` (141 moduler), `integrated-build.log` (0aadfeb6003f23b3cdf3b109). Endast bevistext ändrades efter dessa körningar; produktträdet är oförändrat. Ingen browser eller produktbild behövs för instruktionstext.
