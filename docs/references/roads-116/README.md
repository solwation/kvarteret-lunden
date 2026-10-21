# Källunderlag för norra serviceinfarten, #116

[Selektivt fyrvägsutdrag](source-four-ways.json) ur originalets oföränderliga
`docs/references/surrounding-views/osm-south-2026-10-08.json`, SHA256
`4c1734d408d4c23896c3ba672cf4e8ccb71537d2a06f23c00a8347192d22619d`.
Granskad originalimplementation #1432:
`9eb4ccfadfdf0ffd26ae7a20dfc1e3e50c22d1b8`.
[Arkiv vid exakt source-commit](https://github.com/solwation/lunden-3d-apartment/blob/9eb4ccfadfdf0ffd26ae7a20dfc1e3e50c22d1b8/docs/references/surrounding-views/osm-south-2026-10-08.json).

| Way | Kompletta primärpunkter | Råtyp |
| --- | --- | --- |
| 145221573 | 10 | `highway=service` |
| 145221582 | 2 | `highway=service` |
| 145221583 | 2 | `highway=service` |
| 145221596 | 2 | `highway=service` |

Utdraget bevarar arkivets fullständiga koordinater, råtaggar, API-källa,
hämtningsdatum 2026-10-08 och attribution. Det är ett urval ur arkivet, inte
nya API-svar med objektversioner. Inga extra hämtningar behövs för samma punkter.
Råtaggarna saknar bredd och beläggning. Nominellt 4,5 m/asfalt och exakta
civilnivåer är modellantaganden (*guess*), inga inmätningar. I publicanpassningen
får endast gren 145221582 bredd 4,4 m: den nominella 4,5 m-ytan skar en redan
levererad hel bilruta. Den lokala gissningen bevarar samma källpunkter och den
befintliga parkeringslayouten; övriga tre vägar använder 4,5 m.

Oförändrad projektion och gemensamma punkter ska ge faktisk anslutning:
573 möter befintlig 30633546 vid (3,68;236,83) och korrekt 145221590 vid
(−85,75;315,14), med de tre korta grenarnas ändpunkter på samma primärlinje.
Den publika appens egna marktrianglar och hus-/gårdshål gäller; originalets
hela terräng, privata funktioner eller budgetar importeras inte. Antagna
väglampor följer befintlig geometrisk placering, inte inmätta OSM-lampor.

Granskad anpassning och verifiering finns i [överföringsregistret](../../upstream.md)
och [verifieringen](../../verification.md). Befintliga GC-anslutningar, broar,
husfötter, aproner, parkeringsplan och gånggränser ska bevaras.

© OpenStreetMap contributors. Kartdata omfattas av
[Open Database License 1.0](https://opendatacommons.org/licenses/odbl/1-0/).
Se [OSM:s attribution och copyright](https://www.openstreetmap.org/copyright).
