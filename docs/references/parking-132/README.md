# Källunderlag för parkeringen söder om hus 44, #132

Officiellt OSM API-svar fryst 2026-10-21:
[way 145221629, full](https://api.openstreetmap.org/api/0.6/way/145221629/full.json),
[lokal exakt JSON](145221629-full.json). Way-version 1, daterad 2012-01-12.
Koordinater, noder, attribution och licens bevaras.

Råtaggen är endast `amenity=parking`. **Kapacitet, beläggning, orientering
och höjder saknas.** Källconfigens 40 och äldre publicconfigens 22 är gissningar.
Den åtta hörn stora konkava konturen ska behålla sina indrag; användbara hela
bilrutor och fri sammanhängande körning ska bestämma layouten. Antal, asfalt,
civilhöjder och övergångar utan inmätning är *guess*.

Neutral konturkandidat: originalcommit
`03d4c5201004540769c51cf62b7272f0a2c3caaf`.
Infarten granskas mot det redan frysta [officiella kartsvaret från #130](../parking-130/access-map.json).
Den verkliga serviceslingan 145221614 genom parkeringen har samma nod
1586522957 som 145221588. Dessa vägdelar är levererade i public #134 respektive
#133. #138 ansluter 614:s ändnod 1586522929 till den redan importerade
95036048 via dess nästa verkliga 34,83 m-segment. En äldre modellkurva är
inte i sig bevis för kartlagd infart; den bevaras med ärligt lokalt namn
och dess verkliga korridor lämnas fri i parkeringslayouten.
Befintliga höjdkällor, husstöd och gånggränser ska bevaras.

Granskad anpassning dokumenteras i [överföringsregistret](../../upstream.md)
och [verifieringen](../../verification.md). API-länkarna kan ändras; de frysta
filerna bevarar granskade versioner.

© OpenStreetMap contributors. Kartdata omfattas av
[Open Database License 1.0](https://opendatacommons.org/licenses/odbl/1-0/).
Se [OSM:s attribution och copyright](https://www.openstreetmap.org/copyright).

Den offentliga grundlayouten använder tre hela 2,5×5 m-rutor längs kanten
0–1, med radcentrum 14 m längs kanten och 0,10 m indrag. Bara den användbara
radkärnan får ett gemensamt antaget plan, cirka 3,79 %. Befintlig begränsad
fyrametersövergång inom källkonturen bevarar dess hörn och närliggande
husstöd. Resten är omarkerad asfalt och kör-/övergångsyta, inte en
påstått plan hel parkering. Första enkla fungerande läget används utan
kapacitetsmaximering. Antal, beläggning och civilgradering är *guess*.
