# Källunderlag för södra inre serviceslingan, #134

[Selektivt fyrvägsutdrag](source-four-ways.json) ur originalets frysta
`docs/references/surrounding-views/osm-south-2026-10-08.json`, SHA256
`4c1734d408d4c23896c3ba672cf4e8ccb71537d2a06f23c00a8347192d22619d`.
Granskad originalimplementation #1435:
`4b8105adcd63f14b889aa4f99f4f3605966c95c1`.
[Arkiv vid exakt källcommit](https://github.com/solwation/lunden-3d-apartment/blob/4b8105adcd63f14b889aa4f99f4f3605966c95c1/docs/references/surrounding-views/osm-south-2026-10-08.json).

| Way | Kompletta primärpunkter | Råtyp |
| --- | --- | --- |
| 145221585 | 2 | `highway=service` |
| 145221592 | 2 | `highway=service` |
| 145221599 | 3 | `highway=service` |
| 145221614 | 7 | `highway=service` |

Utdraget bevarar originalets fullständiga koordinater, råtaggar, API-källa,
hämtningsdatum 2026-10-08 och attribution. Det är ett arkivutdrag, inte ett
nytt API-svar med objektversioner. Råtaggarna saknar bredd och beläggning;
asfalt och modellbredder är uttryckliga *guess*, inga inmätta fakta.

Oförändrad projektion och verkliga delade punkter styr anslutningar. Endast
dessa fyra vägar ingår; yttre ringslinga, separat gångväg och parkering
är egna uppgifter. Publicens befintliga terrängtrianglar, huskroppar med
gårdshål och hela tidigare bilrutor ska bevaras. Ingen privat funktion,
originalbudget eller Cloudflare-tjänst överförs.

Granskning och kontroll redovisas i [överföringsregistret](../../upstream.md)
och [verifieringen](../../verification.md).

© OpenStreetMap contributors. Kartdata omfattas av
[Open Database License 1.0](https://opendatacommons.org/licenses/odbl/1-0/).
Se [OSM:s attribution och copyright](https://www.openstreetmap.org/copyright).

Nodgrafens begränsning: dessa fyra vägar och befintliga 145221588 delar
ännu ingen källnod med det övriga importerade vägnätet. Nästa konsekutiva
segment i redan delvis importerade 95036048, från nod 1586522906
(97,32;385,52) till 1586522929 (68,88;405,62), är cirka 34,83 m och
slutar i 614:s ändnod. Det avgränsade stödet hanteras i #138; ingen
full ytterring behövs. Officiell v6-kedja finns i
[redan fryst åtkomstkarta](../parking-130/access-map.json).
