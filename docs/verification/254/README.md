# Snabbare kantlinjer — #254

Selektiv originalkälla: `b01c076c0e607cf2dbd8b5977cdf33b921d22f89`,
[original #1871](https://github.com/solwation/lunden-3d-apartment/issues/1871).
Den nya hjälparen är Three.js r187 EdgesGeometry, MIT, med endast importanpassning
för fortsatt three@0.170.0. Originalets bilder eller appinnehåll kopieras inte.
Publicens egna båda kantmoduler använder hjälparen; övriga bygg-/renderregler bevaras.
Licensen följer dessutom den publicerade THIRD_PARTY_LICENSES.txt.

Kontroller 2026-11-05:

- `node tools/edgesbackporttest.mjs`: 30 byte-exakta jämförelser mot r170,
  inklusive indexerade/oindexerade geometrier, degenerering, dubbletter,
  kanttrösklar, kloning och parametrar.
- `tools/edgesbackportbrowser.mjs http://127.0.0.1:8172 docs/verification/254`,
  körd genom originalets minnes-/låswrapper med Chromium 1248/SwiftShader:
  3 683 faktiska bygganrop i båda publika kantmodulerna, 685 284 Float32-värden,
  noll skillnader. Varje anrop bygger båda versionerna i alternerad ordning.
  Ackumulerad konstruktortid 464,8 → 363,6 ms (21,8% mindre i just denna körning).
  Detta är inte total starttid, FPS eller fysisk GPU-/telefonprestanda.
- Browsern renderar områdesvy, hem och trapphus. Inga JS-/konsolfel, inga externa
  nätanrop och kontrollvärden i originalets localStorage/sessionStorage är orörda.
  Inga originaldata läses av appen; kontrollvärden läses enbart av testet.
- `npm test`: 139 moduler, importgraf, planritningar, nätpolicy och ikoner godkända.
- `npm run build`: godkänd, bygg-id `f82bc48d181c7f96222cfb76`.
- Diff, licens-/beroendegranskning; samma hjälparfil som den verifierade originalkällan.

Bilder: [område](area.png), [fast köksinredning och dörrkanter](home.png),
[trapphus](core.png). Fortsätt-knappen syns eftersom testet släpper pekarlåset.
Browserrådata finns i browser.json; källhashar i sources.json. Ingen full
Three.js-uppgradering eller WebGPU/meshlet-funktion ingår i den här porten.
