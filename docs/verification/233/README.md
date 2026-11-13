# #233 — skolgräs med terrängens material och årstider

Exakt granskad originalkälla: `0519f127e9ec6574bdf9226c17aa0e2f244b8c2c`.
Publik bas: `9e27bbb30ca5422ffe293dcc41b6a22bc5b55bf9`.
Endast lawn-markering och delat gräsmaterial/batch överförda; åtta statiska gungsitsar
bevarade. Ingen originalbild, personlig resurs, gameplay, input, tjänst eller lagring importerad.

## Kontroller och mätvärden

`tools/schoolgrass-check.mjs` verifierar i den verkliga publika scenen:

- Exakt samma hash för51 798 positioner/normaler i access+lawn före/efter, samma antal
  och samtliga emitterade trianglar. Oförändrade lawn-/sand-/lekpolygoner och lyft.
- Oförändrad hash för icke-lawn-skolgeometri och åtta statiska gungsitsar.
- Fem lawn-poster (tre bas, två desktopdetaljer),5 385 lawn-vertexar, befintlig shader,
  standardgräsmaterial och world-metre UV. Tar emot men kastar inte skuggor.
- Sommar→höst→snö→sommar delar exakt färg och texture-map med standardterrängens gräs.
  Snön tar bort detaljtexturen; den återkommer efteråt.
- Inga externa nätanrop/sidfel och oförändrade localStorage/sessionStorage-markörer
  under originalets nycklar. Inga nya lokala nycklar skapas i kontrollen.

| Verklig vy | Före calls/trianglar | Efter calls/trianglar |
| --- | ---: | ---: |
| Juni | 880 /919 052 | 881 /919 052 |
| November | 881 /925 152 | 882 /925 152 |

En extra sammanhållen lawn-batch; inga nya texturer eller ljus. Browser-minnestopp
för giltiga slutbilder:1 035MiB före,1 039MiB efter av4GiB.

`npm test`: PASS,107moduler granskade, importgraf/same-origin-policy/identitet/ikoner gröna.
`npm run build`: PASS, slutversion `ec31d14f971c4fde86712ced`.
`git diff --check`: PASS. Ingen extra testomgång krävs för enbart följande dokumentation.

## Egna granskade bilder

- `before-summer.png`, `after-summer.png`
- `before-autumn.png`, `after-autumn.png`

Alla fyra granskade vid1280×800 från samma kamera (195,126.62,15), yaw40°, pitch−38°.
Före-läget laddar endast de två berörda filerna från exakt **publik** bas9e27bbb via
browser-route; övriga filer är samma bas. Arbetskopians produktfiler skrivs inte tillbaka.
`before.json`/`after.json` innehåller kontrakthashar, säsonger, renderantal och isoleringsresultat.

Första sommarfångsten var blank eftersom viewport-resize tömde bufferten efter manuell
rendering. De ogiltiga bildfilerna har ersatts: harnesset väntar två rAF efter resize och
alla fyra slutbilder är inspekterade. Inga ogiltiga bilder används som resultat.

Kommandon från projektroten med egen källserver på8944:

```
BROWSERTEST_LOCK=<state-dir>/browser.lock BROWSERTEST_TIMEOUT=5m CHROME_PATH=<playwright-chromium> <checkout>/tools/browsertest.sh node tools/schoolgrass-check.mjs http://localhost:8944 docs/verification/233 before
BROWSERTEST_LOCK=<state-dir>/browser.lock BROWSERTEST_TIMEOUT=5m CHROME_PATH=<playwright-chromium> <checkout>/tools/browsertest.sh node tools/schoolgrass-check.mjs http://localhost:8944 docs/verification/233 after
```

Chromium/SwiftShader, ingen fysisk telefon eller hårdvaruprestanda påstås.
