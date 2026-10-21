# Källunderlag för södra tvärvägen och smala servicelänken, #117

[Selektivt tvåvägsutdrag](source-two-ways.json) ur originalets oföränderliga
`docs/references/surrounding-views/osm-south-2026-10-08.json`, SHA256
`4c1734d408d4c23896c3ba672cf4e8ccb71537d2a06f23c00a8347192d22619d`.
Granskad originalimplementation #1433:
`80c78366de5d041c073f10872873195920453ff2`.
[Arkiv vid exakt source-commit](https://github.com/solwation/lunden-3d-apartment/blob/80c78366de5d041c073f10872873195920453ff2/docs/references/surrounding-views/osm-south-2026-10-08.json).

| Way | Kompletta primärpunkter | Råtyp | Antagen modellbredd |
| --- | --- | --- | --- |
| 145221576 | 4 | `highway=service` | 4,5 m |
| 199056948 | 3 | `highway=service` | 3,0 m |

Utdraget bevarar fullständiga koordinater, råtaggar, officiell API-källa,
hämtningsdatum 2026-10-08 och attribution. Det är arkivutdrag, inte nya
API-svar med objektversioner. Råtaggarna saknar bredd och beläggning; asfalt
samt båda bredderna är *guess*, inga inmätningar. Den smala länken får inte
vidgas till 4–4,5 m genom en huskropp för att passa en generell breddregel.

Oförändrad projektion och gemensamma punkter binder befintlig 36918924 och
levererad 145221573 till de två nya servicevägarna. Den separata verkliga
gångvägen 199056947 ska behålla sin typ. Uttrycklig råtyp `service` tillåter
fordonsklassning vid den antagna tremetersbredden; äldre otypade posters
breddregel och den befintliga lampfunktionens breddfilter bevaras.

Den publika appens egna marktrianglar, huskroppar med gårdshål, tidigare hela
bilrutor och höjder gäller. Inga originalbudgetar, privata system eller ny
terrängmodell importeras. Granskning och kontroll redovisas i
[överföringsregistret](../../upstream.md) och [verifieringen](../../verification.md).

© OpenStreetMap contributors. Kartdata omfattas av
[Open Database License 1.0](https://opendatacommons.org/licenses/odbl/1-0/).
Se [OSM:s attribution och copyright](https://www.openstreetmap.org/copyright).
