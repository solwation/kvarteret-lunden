# Kvarteret Lunden

En fristående, opersonlig 3D-visning av Kv. Lunden för den som vill utforska området och den modellerade bostaden L1007.

Projektet är under uppbyggnad. Ingen färdig 3D-visning är publicerad ännu.

## Omfattning

Behåll byggnader, omgivning, fast inredning, förflyttning, dörrar och mätverktyg. Ta bort personlig möblering, teckningar, foton, familjereferenser, karaktärer, poäng, leksaker och andra spelinslag.

Visningen ska vara statisk och fungera **utan Cloudflare-integration**. Originalets Workers, WebSockets, delade lagring och speltjänster ska inte användas. Eventuell lokal lagring ska ha egna namn och aldrig läsa eller ändra originalets data.

Modellen är en fristående visualisering och kan innehålla avvikelser. Fast inredning och material i L1007 är ett exempel och utgör inte verifierad standard för samtliga bostäder. Projektet är inte Peabs officiella tjänst.

## Koppling till originalet

Original: [solwation/lunden-3d-apartment](https://github.com/solwation/lunden-3d-apartment).

Detta repo har en egen, ren historik för att inte kopiera originalets personliga filer och historik. Det fungerar som en vidareutveckling med originalet som `upstream`; det är inte en GitHub-fork och synkar inte automatiskt.

Förbättringar av byggnader, geometri, fast inredning, rendering och navigation ska löpande bedömas för överföring från originalet. Varje överföring granskas för beroenden, personligt innehåll, spelinslag och nätverksanrop innan den publiceras. Se [rutinen för uppdateringar](docs/upstream.md).

## Lokal start för utvecklare

```sh
git clone https://github.com/solwation/kvarteret-lunden.git
cd kvarteret-lunden
git remote add upstream https://github.com/solwation/lunden-3d-apartment.git
git fetch upstream main
```

Det finns ännu ingen applikationskod eller lokal 3D-server att starta. Hämta inte över hela originalets filträd: första importen ska vara granskad och rensad.

## Publicering

Planerad publicering: GitHub Pages på `https://solwation.github.io/kvarteret-lunden/`. Adressen är inte aktiverad ännu. Publicering ska enbart innehålla de granskade statiska filer som visningen behöver.
