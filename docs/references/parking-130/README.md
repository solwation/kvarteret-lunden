# Källunderlag för Nattsländegatan och hus 47, #130

Officiella OSM API-svar frysta 2026-10-21. Attribution, licens, koordinater,
nodidentiteter och objektversioner bevaras exakt.

| Way | Version och datum | Officiellt svar | Lokal fil |
| --- | --- | --- | --- |
| 145221624 | 1, 2012-01-12 | [OSM API, full](https://api.openstreetmap.org/api/0.6/way/145221624/full.json) | [JSON](145221624-full.json) |
| 145221626 | 1, 2012-01-12 | [OSM API, full](https://api.openstreetmap.org/api/0.6/way/145221626/full.json) | [JSON](145221626-full.json) |

Båda har endast råtaggen `amenity=parking`. **Kapacitet, beläggning, orientering
och höjder saknas i råtaggarna.** Källconfigens 15/20 och tidigare publicconfigens
12/16 är antaganden. Den första konturen är cirka 23,6×16 m, den andra cirka
47×11,8 m. Hela bilrutor och fri körning ska följa respektive ytas utrymme;
ett antaget antal får inte pressa in dubbelrader på den grundare ytan.

Konturkandidat: originalcommit `03d4c5201004540769c51cf62b7272f0a2c3caaf`.
Original #1442:s lösning `02e3fa8d86540e6b7406f3b0415c0cbb3aadbef5` har granskats;
dess höjdövergång och fyrhörnslayout är underlag för selektiv anpassning, inte
verifiering av denna publika apps mark- och infartshöjder. Layout, antal,
asfalt, civilplan och övergångar utan inmätning förblir *guess*. Befintliga
höjdkällor och husstöd ersätts inte av OSM-planpunkterna.

Anpassning och kontroll dokumenteras i [överföringsregistret](../../upstream.md)
och [verifieringen](../../verification.md). API-länkarna kan ändras; de lokala
filerna bevarar exakt granskade versioner.

Den nödvändiga serviceanslutningen granskas mot ett enda officiellt områdessvar,
[OSM API map](https://api.openstreetmap.org/api/0.6/map.json?bbox=13.1756814,55.6823068,13.1785795,55.6831726),
[exakt fryst JSON](access-map.json). Svaret innehåller hela inkluderade ways med
deras refererade noder, även utanför själva frågerutan.

| Way | Fryst version | Råtyp |
| --- | --- | --- |
| 95036048 | 6 | `highway=service` |
| 145221581 | 1 | `highway=service`, `service=parking_aisle` |
| 145221604 | 1 | `highway=service`, `service=parking_aisle` |
| 145221607 | 1 | `highway=service`, `service=parking_aisle` |

Endast nödvändiga verkliga kedjor till parkeringarna används. För väg 95036048
används den kortaste relevanta nodkedjan till en redan modellerad anslutning,
inte hela slingan eller andra förgreningar i områdessvaret. Vägarnas bredder,
asfalttolkning där `surface` saknas och exakta anläggningsnivåer är antaganden.
Oförändrade gemensamma nodidentiteter belägger anslutningen; en frihandsritad
förlängning skulle inte ha samma källstöd.

© OpenStreetMap contributors. Kartdata omfattas av
[Open Database License 1.0](https://opendatacommons.org/licenses/odbl/1-0/).
Se [OSM:s attribution och copyright](https://www.openstreetmap.org/copyright).
