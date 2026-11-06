# Verifiering för ärende #258

- `update-notice.png`: Visar uppdateringsmeddelandet vid automatisk uppdatering.
- `tools/updatecachetest.mjs` (PASS): Verkligt HTTP-cacheprov med Chromium bekräftar att omladdning med `_update`-parameter förbigår cachat äldre HTML-skal och laddar den nya versionen direkt.
- `npm test` och `npm run build` passerar utan anmärkning.
