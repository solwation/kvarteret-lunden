# Källunderlag för parkeringen norr om hus 45, #128

Fryst svar från det officiella OSM API:t, hämtat 2026-10-21:
[way 145221619, full](https://api.openstreetmap.org/api/0.6/way/145221619/full.json),
[lokal exakt JSON](145221619-full.json). Way-version 1, daterad 2012-01-12.
Originalets koordinater, nodidentiteter, attribution och licens bevaras.

Råtaggen är endast `amenity=parking`. **Det finns ingen rå kapacitet, orientering,
ytbeläggning eller inmätt höjd.** Källconfigens 30 och tidigare publicconfigens 28
är modellantaganden, inte belagda OSM-antal. Den fyra hörn stora planpolygonen
är underlag för utbredningen; bilrutornas storlek/antal, körgång och infart måste
väljas efter verkligt geometriskt utrymme och redovisas som *guess*.

Neutral konturkandidat: originalcommit
`03d4c5201004540769c51cf62b7272f0a2c3caaf`.
Asfalttolkning, civilplan, graderade övergångar och exakt anslutningsutbredning
utan inmätning är också antaganden. OSM-planpunkterna ersätter inte befintliga
höjdkällor, bankkrön eller hus 45:s förankring/apron.
Granskning och anpassning dokumenteras i [överföringsregistret](../../upstream.md)
och [verifieringen](../../verification.md). API-länken kan ändras; den lokala
filen bevarar exakt granskad version.

Den befintliga publika kurvan märkt 30633544 korsar denna parkeringsyta.
[Officiellt way 30633544-svar](https://api.openstreetmap.org/api/0.6/way/30633544/full.json),
[fryst version 3](30633544-full.json), visar att det verkliga objektet ligger
betydligt längre söderut. Den korsande modellkurvan bevaras geometriskt med
ärlig lokal modellidentitet och får fri passage genom parkeringslayouten;
det separata verkliga objektets geografi importeras inte i parkeringsärendet.
Detta underlag belägger identitetsskillnaden, inte att den äldre modellkurvan
har inmätt geografiskt stöd.

Även den befintliga kurvan märkt 850235115 korsar parkeringsytan.
[Officiellt way 850235115-svar](https://api.openstreetmap.org/api/0.6/way/850235115/full.json),
[fryst version 2](850235115-full.json), visar en annan verklig geografi.
Modellkurvan bevaras med ärlig lokal identitet och fri passage; den separata
verkliga vägen importeras inte här. Den redan lokalt namngivna äldre servicekurvan
från #125 korsar också ytan och behåller sin fria passage. En planprojektion
av samtliga befintliga vägstråks bredder mot parkeringen hittade dessa totalt
tre korsande modellkurvor. Rutantalet härleds efter deras fria korridorer;
inget rådatastöd finns för att tvinga in ett visst antal bilar.

© OpenStreetMap contributors. Kartdata omfattas av
[Open Database License 1.0](https://opendatacommons.org/licenses/odbl/1-0/).
Se [OSM:s attribution och copyright](https://www.openstreetmap.org/copyright).
