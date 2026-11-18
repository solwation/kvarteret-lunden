# #322 – levande utekatter (port av original #2125)

Källa: original `6bbfb282` / `238e0946` (#2125). Urval och ej tillämpliga delar: [docs/upstream.md](../../upstream.md#levande-utekatter-322).

## Kontroller

- `node --test tools/catlifetest.mjs`: 7/7. Originalets rena tester för `catlife.js` (sittval, svansfjäder, öron, stretch) samt
  publikens egna: svansen runt framtassarna i ett lindningsblock, öronryck inom `twitchAmp`, stretchen sänker huvudet och böjer
  kroppen, endast svansens hörn rör sig när riggen böjer svansen på CPU:n, ett delat pälsmaterial (`|catfur1`, slack 0,3 m,
  `uCatTail.z = 0`), loopkattens vilklocka (`restDone`) och inga besökar-/ljud-/byteskällor i konsumenterna.
- `npm test`, `npm run build`, `node tools/outdoorcats-check.mjs`, `src/outdoorcatroute.test.mjs`, `tools/normalpackingtest.mjs`: gröna.
- Egen browser (`node tools/catlife322browser.mjs before|after docs/verification/322 http://127.0.0.1:8342`) i den riktiga
  publika appen, `?month=6`, fryst klocka i 0,1 s-steg, samma tider i båda faserna: noll externa anrop, inga websockets, inga
  sidfel (bortsett från headless pekarlåset), lagringsnycklarna oförändrade. Rådata: `browser-before.json`, `browser-after.json`.

## Bilder (övre rad före, nedre efter)

- `stretch-sequence.jpg`: loopkatt 4 de sista 3 s av en 90 s vila. Före: den tvättar sig tills den går. Efter: upp i en stretch
  (framben ut, bröstet ner, `bow.k` 0,92 → 1 → 0,79) innan den går vidare.
- `wrap-sequence.jpg`: samma katt under ett sittblock med lindning: svansen glider in runt framtassarna (`tailWrap` 0,37 → 1)
  medan huvudet ser sig omkring.
- `before-fur.jpg` / `after-fur.jpg`: närbild i sol: svaga strandklumpar och glans längs pälsen, samma färg.

## Kostnad

Draws och trianglar oförändrade (169/79/470 calls i respektive vy före och efter, en draw per katt), inga nya texturer eller
geometrier. Ett shaderprogram till (69 → 70; pälsvarianten av det delade kattmaterialet). CPU för kattuppdateringen med en nära
katt: 0,71 ms före, 0,53 ms efter per uppdatering över 400 bilder (brus; svansböjen läggs i den befintliga per-bild-skrivningen
av närriggen). Avlägsna katter använder de cachade poserna oförändrat (endast shadern tillkommer).

## Begränsningar

Ingen öronvändning mot besökare, dörrar eller ljud, inget smygande mot byte (publikens katter är passiv miljö utan byte).
Svansens vändningssväng syns bara när en nära katt vrider sig; ställningen hoppar som tidigare direkt mellan sitta och stå.
Stretchen gäller vilor på marken på minst 20 s. Mobil (`lowMemory`) använder samma material; ingen separat mobilvy togs.

Publicerad: `fd70e53`, Pages 44418079990 success.
