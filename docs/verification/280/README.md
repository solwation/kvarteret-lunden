# Drivande fläckar på Höje å, public #280

Små bleka fläckar och enstaka löv driver nedströms på Höje ås yta, så att det syns åt
vilket håll vattnet rinner. Avgränsad källa: original
`661ba70f06c0faac9fb6768a32877d42c44fc147` (original #1952), enbart de rena reglerna och
ytdelen. Undervattensdelen, simning, dykning, musslor, fiskmatning, haj och annan
spelinteraktion är inte överförda; se [överföringsnoteringen](../../upstream.md#drivande-fläckar-på-höje-å-280).

## Öppnade resultatbilder

Samma kamera på norra strandkanten vid station 430 m (ungefär x −48, z 146), ögat 1,6 m
över den ritade marken. Mellan bilderna har den riktiga `update` stegats 4,0 s.

| Vy | Bild |
| --- | --- |
| Från strandkanten | [Bild](strand-bild-1.png) |
| Samma vy 4 s senare | [Bild](strand-bild-2.png) |

Bilderna är öppnade och granskade: bleka avlånga fläckar ligger på vattenytan mellan
vassen, ingen på gräset, och de har flyttat sig åt vänster i bilden, alltså nedströms.

## Uppmätta värden

`node tools/riverdrift-check.mjs http://localhost:8160 docs/verification/280` mot källkoden
på lokal server, Chromium med mjukvarurendering, 1280 × 800. Råvärden: [result.json](result.json).

| Kontroll | Resultat |
| --- | --- |
| Gården (117 m från ån) | osynlig, 154 ritanrop med och utan nätet: +0 |
| Strandkanten | 34 ritanrop med, 33 utan: +1; 292 synliga fläckar |
| Vid vägbrons uppströmskant | 42 med, 41 utan: +1 |
| Fart mellan två bilder, 4,0 s | 278 följda fläckar, medel 0,348 m/s nedströms (0,327–0,369), 0,015 m/s i sidled; inställt 0,35 |
| Hela ån, 69 stationer var 12:e meter | 19 563 ritade fläckar: 0 utanför fåran, 0 över ritad mark, 0 i bropelare; närmast fårans kant 0,61 m; 343 under broarna, 1 129 i de två krökarna |
| Höjd över vattenlinjen | 0,014–0,016 m |
| Under marknivå (`hidden`) | ritas inte |
| `?nodrift` | inget objekt och inget nät i scenen |
| Isolering | inga sidfel, inga externa anrop, ingen lokal eller sessionslagring |

`node --test src/riverdrift.test.mjs`: 6 av 6 godkända mot publicens ådata (två av vägbrons
pelare står i fåran och hittas). `npm test` och `npm run build` är gröna.

## Begränsningar

Renderingsloopen är stoppad i webbläsarkontrollen eftersom mjukvarurenderingen ritar scenen
långt under en bild per sekund; tiden stegas därför genom den riktiga `update(dt, öga, dold)`
i steg om 1/60 s, inte med väggklocka. Ingen fysisk telefon eller Surface är provad och ingen
bildfrekvens är uppmätt. Natt, dimma och vintervy är inte granskade i bild. Fart, antal,
storlek, färg och marginaler är visuella antaganden, inte uppmätt flöde i Höje å.
