# #345 – diskret ånga från skorstenar och takhuvar i kyla (port av original #2204)

Källa: original `0638c8b1`. Urval, avvikelser och ej överfört: [docs/upstream.md](../../upstream.md#diskret-ånga-från-skorstenar-och-takhuvar-i-kyla-345).

## Kontroller

- `node --test tools/roofsteamtest.mjs`: 5/5 (originalets fyra, utan dygnscykelns ljusuniform, plus månadstabell/budget):
  tätheten växer i kyla och är 0 från +8 °C, tunnas av stark vind; plymen stiger lodrätt och böjs nedvind utan hopp; närmaste
  utlopp väljs begränsat; den riktiga `RoofSteam`-batchen följer temperatur, vind, avstånd och nivå, har en `Points`, kastar
  ingen skugga, skriver inget djup, telefon 6x12 mot desktop 20x24.
- `npm test`, `npm run build`: gröna.
- Egen browser `tools/roofsteam345browser.cjs http://localhost:8670 docs/verification/345` i den riktiga publika appen
  (Chromium/SwiftShader, 1280 x 720, `?month=1&temp=-8&wind=0.3,3&nocats&noriverfish`; kameran väljs per utlopp (12-20 m, ögonhöjd med huven, fri sikt, tvärs vinden) och utloppet måste ligga nära bildmitten): 49 befintliga utlopp (15 husens takhuvar i
  `surroundings`, 34 i `east-backdrop`: campus/skola och platta takenheter). Båda vyerna 480 punkter (20x24), +1 draw (287->288 och
  31->32), identiska trianglar, noll sid-/shaderfel och noll externa anrop. Grindar: varmt (+8 °C), långt borta (2000 m) och
  `setLevel(0)` döljer batchen, återställd nivå visar den; telefonläget ritar 72 punkter (6x12). Standardscenen (juli, 18 °C) ritar ingen ånga.
  Rådata: `browser.json`.

## Bilder (`before/<vy>.png` före = batchen dold, `<vy>.png` efter, samma kamera och frame)

- `houses.png`: två husens takhuvar sedda ~15 m bort i ögonhöjd med huvarna; ljusa mjuka plymer börjar vid huvarnas ovansida och böjs nedvind (åt höger) över taken.
- `campus.png`: skolans skorsten i förgrunden; en ljus mjuk plym börjar vid skorstenshuven och böjs nedvind mot höger (fler skorstenar bakom ger svagare plymer). Vinden är `wind=0.3` (3,6 m/s) för att böjen ska synas i bild.

## Gränser

Temperatur är en gissad månadstabell, inte väder; scenen är sommar om inte `?month=` sätts. Utseende och vilka utlopp som är aktiva är
*guess*. Färgen är ljus och mjuk (linjärt 0,9/0,92/0,94, lite ljusare än himlen) med en svag gråare kant för kontrast mot snö; alpha 0,4. Ingen global FPS- eller mobilmätning påstås.
