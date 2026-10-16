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

Första granskade importen utgår från `c079371f6782225e29e9dac51518c509ed8c37e6` i originalet. Världsbyggaren, fast inredning, navigation, garage/trapphus och hjälpfunktioner har anpassats. `data/plan.json` är det geometriska underlaget. Inga personliga bild-, ljud- eller fontresurser har importerats.

`src/world.js` bygger arkitekturen; `src/interior.js` och `src/standardinterior.js` bygger enbart fast inredning. `src/navigation.js` är anpassad från originalets förflyttning. `src/config.js` är ett beskuret arkitektururval. `src/patio.js` innehåller enbart markmaterial. Garage och trapphus har separata `architectural-settings.js`, `architectural-edges.js` och `fixed-racks.js` för fasta byggdelar.

Nästa import ska granskas mot dessa anpassningar. Ersätt inte nedströmsfilerna med originalets fullständiga versioner.

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

Automatisk publicering till GitHub Pages är aktiverad vid varje push till detta repos `main`, efter godkända tester och bygge. Automatisk import från originalet är inte konfigurerad. Om uppdateringarna blir frekventa kan gemensam arkitektur och navigation brytas ut till en delad komponent, med en separat ändring och verifiering i båda projekten.

## Register

- Senast granskade originalversion: `ac413b321681ba7fcc2dfb24b2339cce5b64e693`.
- Importerade ändringar: första rensade arkitekturimporten; se filkartan ovan. Verifiering beskrivs i README och docs/verification.md.


## Startåterhämtning, #1065

Importerad från `502404a25063b954349a858edf72a74eaa02d14e`: avgränsad hämtning av planritningen med högst två försök, 15 sekunder per försök och 250 ms mellanrum. Ett tillfälligt nätfel, timeout eller HTTP408/429/5xx får ett nytt försök utan att läsa ett cachat felsvar;404 och felaktig JSON avbryter direkt. `src/startup.js` innehåller endast den rena hämtningsfunktionen, med parametrar i `src/config.js`. Originalets felrapportering och sessionStorage-diagnostik har inte importerats.

Verifiering: `npm test`, bygg och hela Chromium-kontrollen för dator/mobil med en injicerad första plan503. Den verkliga scenen startar efter exakt två hämtningar, inga externa anrop sker och originalets sparade markörer är orörda.


## Fungerande klocktorn, #1067

Importerad från `ac413b321681ba7fcc2dfb24b2339cce5b64e693`: `towerclock.js`, de avgränsade ändringarna i `campusfacades.js`, `sitebackdrop.js` och `surroundings.js` samt enbart `TOWER_CLOCK`-parametrarna. Tidigare rensningar av omgivningarna är bevarade. Tornets plats, storlek och urtavlornas radie är oförändrade.

I originalet får alla fyra sidor samma simulerade tid som köksklockan. Här finns inga personliga klockor eller spelkontroller; tornet följer besökarens lokala klocka och uppdateras även före Börja. Inga nätverksanrop, molntjänster eller sparade klocktillstånd har tillkommit. Originalets mellanliggande kattändring är inte tillämplig på den opersonliga visningen.

Verifiering omfattar den riktiga visningens klocka vid start och vid ändrad lokal tid, samt dator-/mobilvyer, gång, dörrar, ursprunglig lagring och nätverkskontrollen. Originalets komponentprov i WebGL täcker alla fyra urtavlorna, båda detaljnivåerna och köksklockans tidskontroller.


## Golvbrunnar, #14

Importerad från `6ddb7ba` (original #1072): `floorDrain`, `showerDrainAt` och `laundryDrainAt` i `interior.js`, anropen i duscharna och framför tvättmaskinerna i `interior.js` och `standardinterior.js` samt enbart `FLOOR_DRAIN` i `config.js`. Alla mått är antaganden; golvet förblir plant i kollisionen. Originalets ändringslogg och dokumentation har inte importerats.

Verifiering: `npm test`, bygg och Chromium-bilder av duscharna i L1007 (Badrum, WC/dusch), Tvätt, L1004 och L1201 (båda planen). Ritanrop vid samma vyer ökade med 0–3.


## Radiatorer under fönstren, #15

Importerad från `5ced7a8` (original #1071): `addRadiator` och dess anrop i fönsterloopen i `src/world.js` samt enbart `RADIATOR` i `src/config.js`. Varje fönster får en vit kompakt panelradiator centrerad under fönsterbänken, med termostatventil och två rör ned i golvet, i L1007 och de besöksbara L1004/L1201. Peabs planförklaring anger radiator under fönster; alla mått är antaganden. Radiatorn utelämnas över skåp, över bjälklagsöppningar (L1201:s fönster över det öppna rummet) och där bröstningen är för låg. Den använder fönsterkarmarnas material, ger inga extra ritanrop och ingen kollision (den sticker ut 6,5 cm, inom besökarens väggavstånd).

Verifiering: `npm test`, `npm run build`, `tools/browser-check.mjs` samt skärmbilder i Chromium av L1007 (kök, vardagsrum, sovrum), L1004 och L1201 med oförändrat antal ritanrop per vy före/efter.
