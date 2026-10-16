# Kvarteret Lunden

En fristående, opersonlig 3D-visning av Kv. Lunden för den som vill utforska området och den modellerade bostaden L1007.

**[Öppna Kvarteret Lunden i 3D](https://solwation.github.io/kvarteret-lunden/)**

En första statisk 3D-visning finns i projektet. Den innehåller området, L1007 och ytterligare befintliga lägenhetsmodeller, trapphus med hissar och ett garage med tomma förråd.

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

Installera och starta visningen:

```sh
npm ci
npm run dev
```

Öppna http://localhost:8157. Bygg för publicering med `npm run build`; de statiska filerna hamnar i `dist/`. Ingen backend, Cloudflare-konfiguration eller driftcredential behövs. Tillfälliga fel vid hämtning av planritningen får ett automatiskt återförsök; permanent fel ger Försök igen.

På dator används W A S D/piltangenter, mus och E för dörrar. På mobil används styrreglaget och dragning i vyn. Platsmenyn flyttar besökaren till området, L1007, innergården, trapphuset eller garaget. Mät avstånd väljer två punkter på ytor. Alla mått är ungefärliga modellmått.

Klocktornets fyra urtavlor visar besökarens lokala tid med tydliga visare och timmarkeringar.

Visningen sparar inget i webbläsaren och har inga externa nätverksanrop. Three.js ingår i publiceringspaketet.

## Publicering

Visningen är publicerad på **[solwation.github.io/kvarteret-lunden](https://solwation.github.io/kvarteret-lunden/)** via GitHub Pages. `.github/workflows/pages.yml` publicerar granskade ändringar på `main`. Publicering ska enbart innehålla de granskade statiska filer som visningen behöver.


## Verifiering

`npm test` granskar importkedjan, planunderlaget och frånvaro av privata referenser och originalets tjänster. `npm run build` skapar det statiska publiceringspaketet. Kör `CHROME_PATH=/sökväg/till/chrome node tools/browser-check.mjs http://localhost:8157` mot en server för `dist/` för integrationstest i Chromium, inklusive mobil layout, gång, dörranimation, ursprunglig lagring och nätverksanrop.

Arbetet samordnas i [lunden-3d-apartment #1064](https://github.com/solwation/lunden-3d-apartment/issues/1064).
