# #327 – trädens artformer (port av original #2131)

Källa: original `184b4fa7` (#2131). Urval och ej tillämpliga delar: [docs/upstream.md](../../upstream.md#trädens-artformer-327).

## Kontroller

- `node --test tools/treeformtest.mjs tools/barksurfacetest.mjs tools/lodtest.mjs`: 16/16. `treeformtest` är originalets
  funktionstester mot publikens `treeform.js`/`foliage.js`: art och form deterministiska från positionen, artblandningen nära
  `TREE_FORM.mix`, arterna skiljer sig (björkar smala, lindar kupoler, ekar lutar och är skeva), budget per träd (≤ 6 lober,
  stam 166 trianglar dator / 64 mobil, fjärrstam 32 / 14), lober kring den lutande stammen och skeletthjälpen `treeSkeleton`.
  `barksurfacetest` jämför nu stamgeometrin med `trunkTriangles()` i stället för de gamla fasta 46/14.
- `npm test`, `npm run build`: gröna.
- Egen browser `node tools/treeform327browser.cjs http://127.0.0.1:8347 docs/verification/327` i den riktiga publika appen
  (Chromium/SwiftShader, 960 × 600 per halva, `?nocats`, fast klocka). Före = `10c4e34`:s `foliage.js`/`surroundings.js`/`config.js`
  serverade i stället för arbetsfilerna; samma kamera i båda faserna (riktad mot närmaste trädfot), månad via `applySeason`.
  Noll externa anrop, inga sid- eller shaderfel, lagringsnycklarna oförändrade (`kvarteret-lunden.paddockGrass` och en
  orelaterad provnyckel). Rådata: `browser.json`.
- Känt, inte orsakat här: `tools/leafrgbtest.mjs` test 11 jämför hela `config.js`/`foliage.js` mot en fryst baslinje
  (`553aa04`) och faller redan på `10c4e34` före ändringen.

## Bilder (före till vänster, efter till höger)

- `park-near-m7.jpg`, `park-near-m1.jpg`: åparkens stora träd nära, juli och januari. Fler, tunnare grenordningar genom
  kronan; på vintern bär grenverket silhuetten i stället för några få tjocka grenstumpar, stammarna lutar lite olika.
- `bridge-m7.jpg`, `bridge-m1.jpg`: vid bron.
- `park-far-m7.jpg`, `park-far-m1.jpg`: parken på avstånd, 30 m upp. Kronorna är oregelbundnare och olika breda;
  björkarna smala; vintertid syns grenar på fjärrstammarna (tre förtjockade huvudgrenar på dator).
- `courtyard-m7.jpg`, `courtyard-m1.jpg`: gårdens träd mellan husen; kronorna hålls fria från fasaderna (`fitCrown`).

## Kostnad

| Vy | calls före/efter | trianglar före → efter |
|---|---|---|
| park-near juli / jan | 36 / 33 (lika) | 437 463 → 438 787 / 413 331 → 413 215 |
| bridge juli / jan | 39 / 36 (lika) | 459 316 → 473 256 / 426 976 → 434 280 |
| park-far juli / jan | 43 / 38 (lika) | 526 396 → 543 952 / 448 096 → 454 476 |
| courtyard juli / jan | 90 / 84 (lika) | 647 593 → 664 977 / 584 605 → 586 581 |

Inga nya draws, texturer eller program (68–71 texturer, 68–76 program i båda faserna); +1 geometri (björkarnas egen stam).
Trianglar −0,03 … +3,3 %. Stamgeometrin 46 → 166 trianglar (mobil 64), fjärrstammen 14 → 32 på dator (mobil oförändrad 14);
färre staminstanser eftersom åparkens separata vinklade gren-instanser utgår, fler kroninstanser (flera lober per träd, högst 6;
mobil 1–4). CPU: `treeForm` ≈ 9–18 ms för 504 träd vid uppstart (node), inget per bildruta. `src/treeform.js` 10,8 kB.
504 artformer i scenen: 207 ekar, 148 lönnar, 127 lindar, 13 björkar, 9 unga lönnar.

## Begränsningar

Arterna är en deterministisk dragning per position, inte en inventering; alla formvärden är *guess*. Mobilprofilen är bara
kontrollerad på funktionsnivå (lobtak och stamtrianglar), inte i en mobilbrowser. `treeForms`/`treeSkeleton` har ännu ingen
konsument i publiken (#328). Bladkortens uttoning (#331) ingår inte.
