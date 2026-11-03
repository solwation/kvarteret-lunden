# Public #236 – Generiska utekatter

Källa: original `578ecc09b02c7355e299fc58d0e0127b622ee85a`. Endast neutral procedurgeometri, gång-/tvätt-/sömnposer och fyra klockscheman har överförts. Rutter, form och storlek är visuella antaganden. Raser, individuella namn, promotion, interaktion, matning, klapp/bärning, ljud, spår, kort, poäng, tjänster och originalets lagring saknas. Se [importgranskningen](../../upstream.md#generiska-passiva-utekatter-236).

## Kontroller

- `npm test` och `npm run build`: gröna (112 JS-moduler kontrollerade, bundling, nät-/lagrings-/personreferensgräns, arkitekturdata och appidentitet).
- `node --test src/outdoorcatroute.test.mjs`: 4/4 gröna rena originalkontrakt: period, samma klocka, gång/vila och slingan.
- `node tools/outdoorcats-check.mjs`: 766 verkliga ruttsampel med offentlig markmodell, inga väg-/vattenpunkter; samma klocka ger exakt samma state och emitterad pose efter ny konstruktion; tvättpose ändras över tid; geometri är ändlig, en mesh/katt, inga texturer eller träffmål; ritgräns 32 m/18 m och närgräns 7 m; vinter-/inne-hide; inga förbjudna källkopplingar. Det första testutkastet valde en sovande pose för animationskontrollen; kontrollen väljer nu uttryckligen tvätt, som ska röra sig.
- `node tools/outdoorcats-view-check.mjs http://localhost:8911 docs/verification/236` via gemensamt browserlås: faktisk app på desktop och mobil/lowmem, gårds- och parkvy, exakt samma schemastate efter desktop-omladdning vid låst `Date.now()` (2026-06-15 10:00 UTC). Originalets local/sessionStorage-sentineler är oförändrade trots ignorerade `cloud`/`sync`-parametrar. Inga externa anrop eller sidfel.

Närposen uppdaterar befintliga positions-/normalbuffer; fjärrposen är cachad. Ett vertexfärgat material och ett ritanrop per synlig katt, inga extra ljus/skuggor. Alla fyra riggar och cachade poser byggs lokalt; ritanrop och uppdatering av närgeometri begränsas av avstånd. Grundgeometrin har 2 040 trianglar/katt. Inga navigations- eller byggnadsändringar; A/B/C/L-layoutkontroll är inte tillämplig. Båda habitatens verkliga terräng kontrolleras.

## Mätning i samma kamera

Katterna döljs tillfälligt för referensmätningen och återställs inför bild/resultat. Detta är samma scen och fasta klocka, utan övriga kvalitetsändringar.

| Vy | Utan katter: calls / tri | Med katter: calls / tri | Skillnad |
|---|---:|---:|---:|
| Desktop gård | 695 / 784 995 | 696 / 787 035 | +1 / +2 040 |
| Desktop park | 92 / 585 352 | 93 / 587 392 | +1 / +2 040 |
| Telefon gård | 284 / 728 517 | 285 / 730 557 | +1 / +2 040 |
| Telefon park | 55 / 536 757 | 56 / 538 797 | +1 / +2 040 |

`result.json` innehåller råresultat och exakt kameradata. Bilderna är egna, skapade i publikappen och visuellt granskade: `desktop-courtyard.png`, `desktop-park.png`, `phone-courtyard.png`, `phone-park.png`. Efter första gröna körningen behövde bara bilderna förnyas eftersom en asynkron resume-knapp täckte kattens tassar. `CAPTURE_ONLY=1` döljer den endast i bildfixturen och hoppar över omladdningskontrollen; `capture-result.json` bevaras separat från acceptansresultatet. Produktkällorna ändrades inte för bildförnyelsen.

Chromium 1248/SwiftShader, desktop 1280×800, emulerad touchtelefon 430×850 med `?lowmem`, juni vald genom publikens befintliga säsongsparameter. Telefonen är emulerad; detta är draw-/geometrimätning, inte fysisk hårdvaruprestanda. Skärmbilderna använder manuellt placerad kamera i verklig scen, inte en genomspelad promenad. Katterna möter eller följer inte besökaren; de håller sina passiva scheman. Vid fjärravstånd visas stilla sitt-/gångpose, tvätt/sömnens detaljer animeras bara nära.
