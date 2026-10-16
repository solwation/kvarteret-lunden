# Förbättringar från originalet

## Princip

`lunden-3d-apartment` är källan till gemensamma förbättringar. `kvarteret-lunden` behåller en ren historik och ett mindre innehåll. Originalets ändringar ska föras över löpande efter granskning, inte genom en blind merge eller en automatisk kopiering av hela projektet.

En GitHub-fork skulle inte heller uppdatera sig själv. Fördelen med denna struktur är att vi kan återanvända relevanta förbättringar utan att publicera originalets personliga historik här.

## Första importen

1. Välj och dokumentera ett exakt commit-SHA i originalet.
2. Importera endast granskad kod och resurser för området, byggnaderna, fast inredning och visningens styrning. Kontrollera även transienta beroenden och innehåll i fasta skåp.
3. Dokumentera ursprungliga filvägar och nödvändiga anpassningar. Behåll tillämpliga licenser och källhänvisningar.
4. Kontrollera i webbläsare att visningen fungerar utan originalets data, spelmoment och Cloudflare. Granska även publiceringspaketet.
5. Registrera importerad version och verifiering i denna fil.

Ingen applikationskod har importerats ännu. När repo-upplägget skapades observerades `1281bfc5b643afdf7543f8818155439d45d91614` i originalets primära lokala checkout; detta är en orienteringspunkt, inte en importerad eller verifierad version.

## Löpande uppdateringar

```sh
git remote add upstream https://github.com/solwation/lunden-3d-apartment.git
# Behövs bara en gång per lokal klon.
git fetch upstream main
git log --oneline <senast-granskade-original-SHA>..upstream/main
git show <original-SHA> -- <relevanta-filer>
```

- Bedöm förbättringar av geometri, fasader, trappor, dörrar, fast inredning, rendering, prestanda, navigation och mobilstöd för överföring.
- För över enbart relevanta delar. Anpassa blandade commits; kopiera inte automatiskt `main.js`, `config.js`, `interior.js` eller hela resurskataloger.
- Ta aldrig med Cloudflare-konfiguration, Workers, WebSocket-tjänster, originalets delade data, personliga resurser eller spelinslag. Granska nya beroenden och nätverksanrop.
- Verifiera berörda funktioner i webbläsare och att originalets lokala lagring inte används eller ändras. Två GitHub Pages-projekt under samma värd delar origin.
- Ange originalets commit-SHA i importens commitmeddelande och uppdatera registret nedan. Skilj mellan senast granskad commit och faktiskt importerade ändringar.

Automatisk publicering kan införas för detta repos egna granskade commits. Automatisk import från originalet är inte konfigurerad. Om uppdateringarna blir frekventa kan gemensam arkitektur och navigation brytas ut till en delad komponent, med en separat ändring och verifiering i båda projekten.

## Register

- Senast granskade originalversion: ingen.
- Importerade ändringar: inga.
