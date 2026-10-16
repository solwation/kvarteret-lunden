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

På dator används W A S D/piltangenter för att gå. Rikta mittpunkten mot en dörr eller lucka och klicka för att öppna/stänga; E fungerar också. Första klicket när musen är fri fångar bara musen. I mätläget väljer klick mätpunkter i stället för att öppna objekt. På mobil används styrreglaget och dragning i vyn. På mobil och skärmar upp till 960 px visas en liten knapp med vald plats. Knappen öppnar en meny som stängs efter val, vid tryck utanför eller med Escape. Större skärmar har numrerade platsknappar. Platsmenyn och tangenterna 1–7 flyttar besökaren till området, L1007, L1004, L1202:s entré, innergården, trapphuset eller garaget, i den ordningen. L1004 har en modellerad interiör. L1202:s val tar besökaren till rätt entré på loftgången; dess interiör finns ännu inte i modellen. Sifferraden och det numeriska tangentbordet fungerar under en aktiv visning; genvägar ignoreras i hjälpdialoger och textfält. Mät avstånd väljer två punkter på ytor. Alla mått är ungefärliga modellmått.

Klocktornets fyra urtavlor visar besökarens lokala tid med tydliga visare och timmarkeringar.

Vid automatisk uppdatering sparas plats och blickriktning tillfälligt i flikens egen `sessionStorage` med nyckeln `kvarteret-lunden.update-resume`. Uppgifterna läses och tas bort vid nästa start, godtas i högst fem minuter och berör aldrig originalets lagring. Visningen har inga externa nätverksanrop. Three.js ingår i publiceringspaketet.

## Lägg till på hemskärmen

På iPhone/iPad: öppna länken i Safari, välj Dela och Lägg till på hemskärmen. På Android: öppna webbläsarens meny och välj installation eller Lägg till på startskärmen, beroende på webbläsare. Appen har egen grön L-ikon, Apple Touch-ikon och manifest med ikoner för Android. Manifestet anger en beständig startlänk till projektets egen GitHub Pages-adress, utan tillfälliga versionsparametrar. En redan skapad genväg kan behöva tas bort och läggas till igen för att visa den nya ikonen.

## Publicering

Visningen är publicerad på **[solwation.github.io/kvarteret-lunden](https://solwation.github.io/kvarteret-lunden/)** via GitHub Pages. `.github/workflows/pages.yml` kör tester, bygger och publicerar automatiskt efter varje push till `main`. En misslyckad kontroll stoppar publiceringen. Publicering ska enbart innehålla de granskade statiska filer som visningen behöver.


En öppen visning kontrollerar nya versioner varje minut och när fliken blir synlig eller nätet återkommer. Efter tio sekunders inaktivitet visas en femsekunders nedräkning. Rörelse och annan inmatning avbryter nedräkningen; hjälp och mätning skjuter upp den. Plats och blickriktning återställs efter omladdningen. På dator klickar man Fortsätt utforska för att fånga musen igen. Om webbläsaren blockerar lagring startar den nya versionen från välkomstvyn. Ingen inloggning behövs. Nätfel låter den befintliga visningen fortsätta. Ändringar som bara berör dokumentation laddar inte om besökaren.

## Verifiering

`npm test` granskar importkedjan, planunderlaget och frånvaro av privata referenser och originalets tjänster. `npm run build` skapar det statiska publiceringspaketet. Kör `CHROME_PATH=/sökväg/till/chrome node tools/browser-check.mjs http://localhost:8157` mot en server för `dist/` för integrationstest i Chromium, inklusive mobil layout, gång, dörranimation, ursprunglig lagring och nätverksanrop.

För arbete med issues, `in-progress`, stängning och `/orkester`, läs [CLAUDE.md](CLAUDE.md) och [orkesterkommandot](.claude/commands/orkester.md). Ärenden för detta projekt skapas här i [kvarteret-lunden](https://github.com/solwation/kvarteret-lunden/issues).

Orkesterarbete samordnas i [#4](https://github.com/solwation/kvarteret-lunden/issues/4). Den första importens historik finns i [originalets #1064](https://github.com/solwation/lunden-3d-apartment/issues/1064).
