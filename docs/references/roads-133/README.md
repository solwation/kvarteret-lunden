# Källunderlag för servicevägarna 145221588 och 145221590, #133

[Selektivt tvåvägsutdrag](source-two-ways.json) ur originalets oföränderliga
`docs/references/surrounding-views/osm-south-2026-10-08.json`, SHA256
`4c1734d408d4c23896c3ba672cf4e8ccb71537d2a06f23c00a8347192d22619d`.
Granskad originalversion: `03d4c5201004540769c51cf62b7272f0a2c3caaf`.
[Originalarkiv vid exakt commit](https://github.com/solwation/lunden-3d-apartment/blob/03d4c5201004540769c51cf62b7272f0a2c3caaf/docs/references/surrounding-views/osm-south-2026-10-08.json).

Arkivet anger officiell API-källa, hämtning 2026-10-08, attribution och båda
vägarnas fullständiga tvåpunktskoordinater samt råtaggen `highway=service`.
Utdraget bevarar dessa uppgifter; det är ett urval ur arkivet, inte ett nytt
API-svar med objektversioner. Ingen ny hämtning eller källa till påhittade
höjder följer av utdraget.

| Way | Projekterade punkter i modellen | Råtyp |
| --- | --- | --- |
| 145221590 | (−85,75;315,14) → (−76,77;327,58) | `highway=service` |
| 145221588 | (27,71;396,53) → (9,95;373,66) | `highway=service` |

Råtaggarna saknar bredd och beläggning. Modellens 4,5 m och asfalt är *guess*;
projektets oförändrade projektion och höjdsamplare ska användas. Delade noder
mot nya servicestråk granskas dessutom i de frysta offentliga kartunderlagen
för #131/#130. Den exakta nodpunkten 1586523028 delas med norra servicen 573;
1586522957 delas med serviceslingan 614.

De två äldre stora kurvorna vid GC-bron var andra lokala modellgeometrier med
fel OSM-etiketter. Deras läge, bredd och tidigare terrängklippning ska bevaras
under ärliga lokala identiteter. Utdraget belägger de verkliga korta vägarna;
det ger inget kartstöd åt de äldre kurvornas form.

Anpassning och kontroll redovisas i [överföringsregistret](../../upstream.md)
och [verifieringen](../../verification.md).

© OpenStreetMap contributors. Kartdata omfattas av
[Open Database License 1.0](https://opendatacommons.org/licenses/odbl/1-0/).
Se [OSM:s attribution och copyright](https://www.openstreetmap.org/copyright).
