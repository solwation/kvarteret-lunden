# Verifiering för ärende #261

- `help-dialog.png`: Hjälpdialogen beskriver Tab för nästa plats, omstart efter sista platsen, Shift+Tab och Esc för att välja i menyn; inga siffror nämns.
- `place-menu-desktop.png`: Platsmenyn på dator med tolv platser utan sifferprefix, efter tre Tab-tryck från Området (L1201 vald) och tipsraden `Tab · Byt plats  Esc · Meny`.
- `tools/place-cycle-check.mjs` (PASS): fristående modul i Chromium; Tab N→N+1, sista→första, Shift+Tab bakåt, siffror gör inget, Tab i dialoger, textfält, med fri mus och före start byter inte plats.
- `tools/places-browser-check.mjs` (PASS) mot byggt `dist/`: alla tolv platser nås med Tab under fångad mus, omstart och Shift+Tab, siffror ignoreras, Tab med fri mus och i hjälpdialogen byter inte plats.
- `tools/place-picker-check.mjs` (PASS) mot byggt `dist/`: menyn, touch och fokusnavigering oförändrade; siffror och Tab i öppen meny byter inte plats.
- `npm test` och `npm run build` passerar.
