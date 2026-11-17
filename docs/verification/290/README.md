# Trapporna i hus A/B/C går på stegen — #290

Selektiv överföring från originalets `314e8d246f6049c69e3b17f1644f3bd171918cfe` ([#2029](https://github.com/solwation/lunden-3d-apartment/issues/2029)), publik baslinje `7d6d4ba`. Enda produktionsändringen: `treadTop` i `src/corehouse.js` för de två `out.push`-raderna i `CoreHouse.heights`. `stairY` och räcken är oförändrade. Inga avatarer, fot-IK, spel, personligt innehåll eller tjänster.

## Egna publika kontroller

- `node tools/stairtread290-check.mjs` ([logg](check.txt), [rådata](result.json)): PASS i hus A, B och C. Gånghöjden jämförs med ovansidan av de ritade stegens rektanglar (rakt steg ur z-intervallet, hus C:s −1-lopp ur loppets egna steg) på 10 640 / 9 546 / 16 218 prov: största fel 0 m (krav 1 cm). Samtliga vinkel-/solfjädersteg och mellanplanet ger helt antal stigningar (35 188 prov, 0 avvikande). Prov exakt på en trappnos hoppas över.
- Ögonspår (samma skript, Navigations regler: stöd ≤ fötter + stepUp, ögat jämnas med takt 14/s, 60 Hz, löpfart 3,2 m/s): största ögonrörelse per bildruta 5,6–6,1 cm (ramplinjen 3,6–4,0 cm); aldrig en hel stigning (18,75 cm) i en bildruta.
- `tools/stairtread290-view-check.mjs` mot `dist/` ([rådata](browser.json)): riktiga `Navigation.update` upp för västra loppet i hus A, B och C i Chromium/SwiftShader, fötter = stegets ovansida (fel 0 m, 32–37 prov per hus), ögat högst 4,9–5,1 cm per bildruta, uppstigning 0,9375 m (5 steg). Inga sidfel.
- `npm test` ([logg](npm-test.txt)) och `npm run build` ([logg](npm-build.txt)): godkända.

## Utjämning av ögat

Publika `Navigation.update` jämnar redan ögat (`eyeY` närmar sig fötternas höjd + ögonhöjd med `1 − exp(−14·dt)`), så ingen ny utjämning behövs; stegtrappan syns som snabbt mjukade steg, inte ryck. `stepUp` 0,45 m är större än en stigning (0,1875 m), så stegen går att gå upp; nedför faller fötterna ett steg åt gången.

## Bilder

[Hus A](stair-house-A.png), [hus B](stair-house-B.png), [hus C](stair-house-C.png): ögonvy från första steget uppåt i västra loppet (granskad: hus A). Detta är Chromium/SwiftShader, ingen fysisk enhet. Hus A/B/C kontrollerades; hus L och besöksbara lägenheter använder inte CoreHouse och berörs inte.
