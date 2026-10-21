# Källunderlag för parkeringsfickorna i #126

Frysta offentliga OSM API-svar, hämtade 2026-10-21 från de officiella länkarna
nedan. Ursprunglig attribution, licens, koordinater och objektversioner bevaras.

| Way | Fryst version | Rå kapacitet | Officiellt svar | Lokal fil |
| --- | --- | --- | --- | --- |
| 1379042106 | 1, 2025-04-20 | 8 | [OSM API, full](https://api.openstreetmap.org/api/0.6/way/1379042106/full.json) | [JSON](1379042106-full.json) |
| 1379043164 | 1, 2025-04-20 | 3 | [OSM API, full](https://api.openstreetmap.org/api/0.6/way/1379043164/full.json) | [JSON](1379043164-full.json) |

Båda har också `orientation=perpendicular` och `parking=street_side`.
De två råkapaciteterna belägger inte exakta rutmått, höjder eller en detaljerad
körplan. Den grundare kartkonturen måste bedömas som geometri; kapacitetstaggen
är inget belägg för fem meters rutdjup.

Väg 30633545 använder det redan frysta [underlaget från #125](../parking-125/README.md)
och dess [version 6-svar](../parking-125/30633545-full.json); inget nytt vägsvar
behövs för denna ändring. Vägbredd, beläggning, höjdplan, övergångar och modellens
exakta rutlayout är antaganden (*guess*), skilda från råtaggarna. Befintliga
höjdkällor och husens förankring ersätts inte av OSM-data.

Neutral datakandidat: originalcommit `03d4c5201004540769c51cf62b7272f0a2c3caaf`.
Anpassning och kontroll redovisas i [överföringsregistret](../../upstream.md)
och [verifieringen](../../verification.md). API-länkarna kan ändras; filerna ovan
bevarar det granskade versionsunderlaget.

© OpenStreetMap contributors. Kartdata omfattas av
[Open Database License 1.0](https://opendatacommons.org/licenses/odbl/1-0/).
Se [OSM:s attribution och copyright](https://www.openstreetmap.org/copyright).
