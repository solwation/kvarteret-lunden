# #325 – ekorrarnas svans, ätande, grävande och spanande (port av original #2128)

Källa: original `e5784ceb` (#2128). Urval och ej tillämpliga delar: [docs/upstream.md](../../upstream.md#ekorrarnas-svans-ätande-grävande-och-spanande-325).

## Kontroller

- `node --test tools/squirrellifetest.mjs`: 8/8. Originalets rena tester för `squirrellife.js` (årstider, svansens begränsade S-våg,
  motsvängen mot hoppen, öppning i språng, tätare krull sittande, deterministisk; spanande huvud med stilla lägen och snabba ryck;
  begränsade ättassar) plus publikens egna: hjärnan begraver de flesta fynd i oktober (> 0,6), äter dem i mars (< 0,25), sommaren
  däremellan, gräver bara på vårvintern och äter sedan, spanar sittande på marken under alla årstider, är deterministisk och flyr från
  varje paus när besökaren kommer nära; morfmålen (relativa, svansmålen rör bara svansen, +pitch krullar framåt, smulan är en liten
  klump); svansmappningen (pitch exakt per led, yaw minsta-kvadrat-anpassad och aldrig sämre än ingen yaw); och den riktiga
  `Squirrels`-värden (ätpose med tassar vid munnen och smula, sitter upp 1,05 rad, spanar med tassar mot bröstet och ryckiga
  huvudvridningar, nosen ned vid grävning, inga nya objekt, inga interaktions-/lagrings-/nätverksord i ekorrmodulerna).
- `tools/squirrelambienttest.mjs` 2/2, `npm test`, `npm run build`: gröna.
- Egen browser (`BEFORE_DIR=<före-src> node tools/squirrel325browser.mjs before|after <ut> http://127.0.0.1:8345`) i den riktiga
  publika appen med `?month=10&wind=0.75,0&nocats`: en ekorre hålls på marken i åparken med fryst hjärna och samma posefält i båda
  faserna. Noll externa anrop, inga websockets, inga sid- eller shaderfel, lagringen oförändrad (bara den orelaterade provnyckeln).
  Före = de förändrade modulerna (`squirrels`, `squirrelbrain`, `squirrelmodel`, `config`) från `10c4e34`. Rådata och
  morfvikter per bild: `browser-before.json`, `browser-after.json`.

## Bilder

- `before-poses.jpg` / `after-poses.jpg` (vänster till höger, uppifrån): stilla, hopp, äter, spanar, gräver, språng. Före sitter
  ekorren aldrig upp (äter/spanar finns inte, och svansen är stel); efter har svansen fransig kontur, krullar mot hoppet, sitter upp
  med tassarna vid munnen (smulan syns knappt bakom tassarna från sidan) eller mot bröstet när den spanar, och svansen öppnar sig
  bakåt i språnget. Grävbilden har samma nos-ned-pose i båda faserna eftersom posefältet sätts direkt (före-hjärnan gräver aldrig).
- `before-tail.jpg` / `after-tail.jpg`: sex bilder à 0,3 s av en stillastående ekorre. Före byts bara viftmorfen; efter böljar
  svansen i en S-våg (ledvikter −0,31…+0,34 × 0,25 rad) och huvudet hoppar mellan stilla lägen.

## Kostnad

Fortfarande en draw per ekorre och samma material; 663/664 calls, 82/83 program och 82 texturer efter/före i den breda vyn (skillnaden
på ett kommer inte från ekorrarna, vars meshantal är oförändrat). Geometrin: 1 902 → 1 950 hörn nära (smulan), 873 → 897 långt bort,
morfmål 3 → 14 (relativa). Morftexturen ≈ 0,87 MB nära + 0,40 MB långt per utseende (tre unika utseenden: ≈ 3,8 MB GPU, tidigare
≈ 0,8 MB). Byggtid för alla ekorrgeometrier i node 87 → 191 ms vid start. CPU per bild: `poseLife` ≈ 0,9 µs per synlig ekorre.
`src/squirrellife.js` 5,1 kB.

## Begränsningar

Publikens ekorre saknar ben: lederna är linjära morfmål (små vinklar, ±0,5 rad per led), svansens sidosväng är en tvåtermsanpassning
och spetsleden har ingen punkt efter sig. Nötens vridning syns inte, och smulan är liten. Inga nötter, gömmor eller annat lämnas
kvar på marken. Ingen mobilvy togs; telefonen använder samma mesh och program.

Publicerad: `1870e5d`, Pages 44422179891 success.
