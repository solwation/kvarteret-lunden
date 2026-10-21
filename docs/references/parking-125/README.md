# Källunderlag för parkeringsfickorna i #125

Frysta offentliga OSM API-svar, hämtade 2026-10-21. Filerna behåller svarens
attribution, licens, nodversioner, koordinater, way-versioner och råtaggar.

| Way | Fryst version | Officiellt underlag | Lokal fil |
| --- | --- | --- | --- |
| 1379042014 | 1, 2025-04-20 | [OSM API, full](https://api.openstreetmap.org/api/0.6/way/1379042014/full.json) | [JSON](1379042014-full.json) |
| 1379043165 | 1, 2025-04-20 | [OSM API, full](https://api.openstreetmap.org/api/0.6/way/1379043165/full.json) | [JSON](1379043165-full.json) |
| 30633545 | 6, 2025-04-20 | [OSM API, full](https://api.openstreetmap.org/api/0.6/way/30633545/full.json) | [JSON](30633545-full.json) |

Båda parkeringsobjekten har råtaggarna `capacity=6`,
`orientation=perpendicular` och `parking=street_side`. Vägen har endast
`highway=service`; den råtaggen belägger ingen vägbredd eller beläggning.
API-länkarna visar aktuellt innehåll; de frysta filerna anger exakt vilket
versionsunderlag denna ändring granskar.

Underlaget belägger kartlagda konturer och råtaggar. Det belägger inte inmätta
höjder, byggda rutmått, en detaljerad körplan eller tillgänglighetsmått.
Modellens höjdplan, övergångar, vägbredd, ytskikt och exakta rutlayout är
antaganden (*guess*), skilda från dessa källdata. Befintliga höjdkällor ersätts
inte av OSM. Den granskade neutrala datakandidaten kommer från originalcommit
`03d4c5201004540769c51cf62b7272f0a2c3caaf`; slutlig anpassning redovisas i
[överföringsregistret](../../upstream.md) och [verifieringen](../../verification.md).

© OpenStreetMap contributors. Kartdata omfattas av
[Open Database License 1.0](https://opendatacommons.org/licenses/odbl/1-0/).
Se [OSM:s attribution och copyright](https://www.openstreetmap.org/copyright).
