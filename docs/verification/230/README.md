# #230 — vägar och trottoarer bort i dimman

Granskad originalkälla: `b7dbf569f3b55b8ee3d8fd71087dc3a40d384c4a`.
Publik bas före portning: `995ea013c450e567c87b68dfe6f6c14e614105df`.
Enbart neutral ROAD_ENDS/roadends/roadEndParts-kod och kontrakt överförda. Inga
originalbilder, personresurser, spelmoduler, tjänster, lagring eller git-historik.

## Kontroller

- `node tools/roadendstest.mjs`: 26 PASS. Alla sju valda ändar, kantfondens ändar,
  två trottoarer, bevarade källhörn/bredder, höjd över lokal mark/kantband och ändlig
  geometri. 336 kvartsmeterspunkter längs emitterade gamla/nya parkstråk, noll glipor.
  Syntetisk komponentmark: 4 358 nya trianglar. Två extra kontrakt vidgar tillfälligt
  den lokala WALK-rektangeln och kräver nya dimändpunkter; WALK återställs efter provet.
- `node tools/edgebackdroptest.mjs`: ALL PASS, befintliga fondkontrakt.
- `npm test`: PASS, 106 moduler granskade, importgraf/policy/identitet/ikoner gröna.
- `npm run build`: PASS. Testad efter-vy på byggversion `a57a6b2f48592ccd846b022c`.
  Slutversion `53bbd6d6b1dc0ecf1793b2fa` efter enbart placering av källkommentar/JSDoc;
  samma appfunktion och geometri. Slutliga npm test/build är gröna. Dokument är utanför
  byggets innehållshash. Ingen ny browserkörning för enbart kommentarflytten.
- `git diff --check`: PASS.

## Faktisk publik skolvy

Kör från projektroten med egen server på 8941:

```
BROWSERTEST_LOCK=/tmp/lunden-intake-20261102/browser.lock BROWSERTEST_TIMEOUT=5m CHROME_PATH=/home/olof/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome /tmp/lunden-orchestra-20261102/tools/browsertest.sh node tools/roadends-view-check.mjs http://localhost:8941 docs/verification/230 before
BROWSERTEST_LOCK=/tmp/lunden-intake-20261102/browser.lock BROWSERTEST_TIMEOUT=5m CHROME_PATH=/home/olof/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome /tmp/lunden-orchestra-20261102/tools/browsertest.sh node tools/roadends-view-check.mjs http://localhost:8941/dist docs/verification/230 after
```

Egna bilder tagna och granskade vid 1280×800, juni, samma kamera
(−215,66.7,−230), yaw47°, pitch−25°. Före-vyn visar den tvärt avklippta skolvägen;
efter-vyn visar väg och båda trottoarer vidare över befintlig mark mot dimman.

| Mått | Före | Efter |
| --- | ---: | ---: |
| Ritanrop | 23 | 23 |
| Trianglar i faktisk vy | 284 583 | 290 427 |
| Vertexar i befintlig edge-land | 12 450 | 29 982 |
| Browser-minnestopp | 1 013 MiB | 968 MiB |
| Externa anrop | 0 | 0 |
| Sidfel | 0 | 0 |

Tillägget i verklig terräng är 5 844 trianglar; skillnaden mot komponentmarken kommer
från befintlig terrängrutnätsdelning. Inga nya material, texturer, ljus eller ritanrop.

`before.json`/`after.json` bevarar kameran, renderantal och originalets oförändrade
localStorage/sessionStorage-markörer. Gamla cloud/sync-URL-parametrar ignoreras;
inga nya lokala lagringsnycklar tillkommer under kontrollen. Chromium med SwiftShader,
ingen fysisk telefon eller hårdvaruprestanda påstås. Ingen browserrunda per stråk;
alla stråk täcks av de riktade emitterade geometrikontrakten.
