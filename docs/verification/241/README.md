# Public #241 – Snabbare Shift-löpning ute

Originalkälla `04dcf10f34f5a2b133c419ad0c0ef4bb06c5f712`. Bara utomhustempo och regionval har anpassats till publikens Navigation; [granskning och avgränsning](../../upstream.md#snabbare-utomhuslöpning-med-shift-241).

## Kontroller

- `node tools/sprint-check.mjs`: verklig Navigation på kontrollerad plan yta med regionboolean och vägg-/dörrsegment. En sekund ger gång 1,6 m, outdoor Shift 4,8 m, indoor Shift 3,2 m, full analog 1,6 m, halv analog 0,8 m och kryp med Shift 0,8 m. Vägg och stängd dörr stoppar vid kroppsradiens 0,22 m; öppnad dörr släpper igenom. Samma kontroll vid dt 1/60, 1/30 och 0,1 s; produktionens subdivision och kollisionsalgoritm används. Mark/region är en avgränsad fixture, inte påstående om alla verkliga dörrar.
- `npm test`, `npm run build`: gröna, 121 JS-moduler granskas för importgraf, person-/lagrings-/servicegräns, två planritningar och egen appidentitet.
- `node tools/sprint-view-check.mjs http://localhost:8911 docs/verification/241` via delat browserlås: faktisk publik värld med native W+Shift, kontrollerat 180×1/60 s efter en enda startplacering. Ingen teleport under rutten. Före serveras endast gamla Navigation från publik bas `db9695948d95ec8d21789056e474276b4d325a96`; efter använder slutlig modul, övrig scen/config är samma. Efter tre sekunder: 9,600 m före och 14,400 m efter. Inga sidfel, externa anrop eller ändrade original-lagringssentineler.

## Verkliga regioner och husvarianter

| Region | Representativa fötter x,y,z | Resultat Shift |
|---|---|---:|
| L trapphus | −17,785 / 0 / 8,595 | 3,2 m/s |
| A trapphus | −0,125 / 0 / 41,4 | 3,2 m/s |
| B trapphus | −32,12 / 0 / 45,87 | 3,2 m/s |
| C trapphus | −61,39 / 0 / 25,33 | 3,2 m/s |
| L1007 | 2 / 0 / 2 | 3,2 m/s |
| L1004 | −21,9485 / 0 / 6,3495 | 3,2 m/s |
| Garage | −70,225 / −3 / 44 | 3,2 m/s |

Både respektive CoreHouse.contains och sammansatta Core.contains är true för A/B/C; Navigation.cores har fyra poster, world.core.parts tre. Trapphus och garage är true i den äldre outdoors-gettern, så de uttryckliga inCore/below-villkoren behövs. Egen/besökt lägenhet klassas via inFootprint/unit. Detta kontrollerar verklig gemensam regionrepresentation för alla fyra hus; inga layout-/geometriändringar eller breda husvandringar behövs.

## Bilder och begränsningar

`before-three-seconds.png` och `after-three-seconds.png` visar slutpunkterna från samma start (−250,30) och blick längs +x. Efterbilden har nått 4,8 meter längre längs byggnaden och gångvägen efter samma tre sekunder. Båda egna bilder är visuellt granskade; inga originalbilder importerades. Råa start-/slutkoordinater och regioner finns i `result.json`.

Chromium 1248/SwiftShader, 1280×800, juni och fast Date.now. Native tangenter styr riktig Navigation; tiden stegas deterministiskt med samma update som appen använder, inte tre uppmätta väggklocksekunder. Ingen fysisk telefon eller ny touchfunktion testas/påstås. Full-stick utan Shift behåller gång, också kontrollerat i komponenten. 4,8 m/s är en dokumenterad fartgissning; inga kaffeboostar, avatarer eller spelräknare ingår. Render-/geometribudget är oförändrad och behöver ingen ny renderprofil.
