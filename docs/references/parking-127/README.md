# Källunderlag för parkeringarna vid hus 56 och 59, #127

Frysta offentliga svar från det officiella OSM API:t, hämtade 2026-10-21.
Originalens attribution, licens, koordinater, nodidentiteter och versioner bevaras.

| Way | Fryst version | Råtaggar | Officiellt svar | Lokal fil |
| --- | --- | --- | --- | --- |
| 1379042188 | 1, 2025-04-20 | `amenity=parking` | [OSM API](https://api.openstreetmap.org/api/0.6/way/1379042188/full.json) | [JSON](1379042188-full.json) |
| 1379042235 | 1, 2025-04-20 | `amenity=parking`, `orientation=perpendicular`, `parking=street_side` | [OSM API](https://api.openstreetmap.org/api/0.6/way/1379042235/full.json) | [JSON](1379042235-full.json) |
| 335403605 | 2, 2025-04-20 | `highway=service` | [OSM API](https://api.openstreetmap.org/api/0.6/way/335403605/full.json) | [JSON](335403605-full.json) |
| 335403606 | 4, 2020-09-22 | `highway=service`, `surface=paved` | [OSM API](https://api.openstreetmap.org/api/0.6/way/335403606/full.json) | [JSON](335403606-full.json) |

**Ingen av parkeringarna har en rå `capacity`-tagg.** Tidigare eller föreslagna
modellkapaciteter är därför antaganden, inte kartbelagda antal. 2188:s sex olika
hörn bildar en konkav kontur; den ska inte ersättas med en fyrhörning eller dess
konvexa hölje. 2235:s faktiska bredd begränsar hur många hela bilrutor som ryms.

Servicevägarna delar nod 1586522901. Behåll verkliga noder/anslutningar och skilj
fordonsservice från gångväg 335403596; denna referensmapp ger inget stöd för att
göra den gångvägen till bilinfart. Råtaggen `paved` belägger belagd yta på 606,
inte specifikt asfalt. Vägbredder saknas i båda vägsvaren. Exakt asfaltmaterial,
bredd, bilrutornas mått/layout och civilplan/övergångshöjder utan inmätning ska
redovisas som *guess*. OSM-planpunkter ersätter inte projektets höjdkällor eller
befintliga husförankring.

Neutral datakandidat för parkeringskonturerna: originalcommit
`03d4c5201004540769c51cf62b7272f0a2c3caaf`. Den granskade anpassningen och
verifieringen redovisas i [överföringsregistret](../../upstream.md) och
[verifieringen](../../verification.md). API-länkarna kan ändras; de lokala filerna
bevarar exakt granskat underlag.

© OpenStreetMap contributors. Kartdata omfattas av
[Open Database License 1.0](https://opendatacommons.org/licenses/odbl/1-0/).
Se [OSM:s attribution och copyright](https://www.openstreetmap.org/copyright).
