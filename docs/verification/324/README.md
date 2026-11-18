# #324 – ponnyernas sekundärrörelse (port av original #2127)

Källa: original `09d773af` / `b040a13c` (#2127). Urval och ej tillämpliga delar: [docs/upstream.md](../../upstream.md#ponnyernas-sekundärrörelse-324).

## Kontroller

- `node --test tools/ponymotiontest.mjs`: 9/9. Originalets sex rena tester för `ponymotion.js` (allt begränsat genom alla
  tillstånd, kuling, flugor och 0,1 s-bilder; vinden driver man och svans nedvinds i ponnyns ram; svanslederna släpar som en
  kedja; flugor bara juni–augusti och torrt; viktskifte medan den står; betesstegens timing) plus tre mot publikens riktiga
  `Paddock` i node: rullningen ligger i instansmatrisen som täcket delar, svans-/öron-/mankanalerna är ändliga, begränsade och
  vinddrivna (manen vilar i stiltje), en betande ponny på avbetat gräs tar långsamma steg (huvudet nere, innanför staketet,
  mindre bensving än gång), och shaderns hårrad flyttar bara accenthåret i det befintliga programmet.
- `tools/ponyblankettest.mjs` 3/3, `tools/paddockgeotest.mjs` 10/10, `tools/sitewindtest.mjs` 7/7, `npm test`, `npm run build`: gröna.
- Egen browser (`BEFORE_PADDOCK=<före-paddock.js> node tools/ponymotion324browser.mjs before|after <ut> http://127.0.0.1:8344`)
  i den riktiga publika appen, `?month=7&wind=0.75,0`, vindklockan stegad i 1/30 s, samma placering i båda faserna: noll
  externa anrop, inga websockets, inga sid- eller shaderfel, lagringsnycklarna oförändrade (`kvarteret-lunden.paddockGrass`
  och en orelaterad provnyckel). Rådata: `browser-before.json`, `browser-after.json`.

## Bilder (8 bilder à 0,4 s, vänster till höger, uppifrån)

Den ljusgrå ponnyn betar i förgrunden, den bruna står bakom; vinden kommer från höger. Gräsmattans avbetade fläckar slumpas per
session och skiljer sig därför mellan faserna.

- `before-sequence.jpg`: före. Bara den befintliga svansviftningen och halsgungningen.
- `after-sequence.jpg`: efter. Båda svansarna blåser åt vänster i den byiga vinden (bas 0,16–0,22 rad), den bruna slår med
  svansen mot en fluga (−0,78 rad, sista bilden) och lägger örat bakåt, kropparna lutar lite (rullning ≈ −0,017…−0,022 rad), manen
  rör sig (upp till 0,038 m).
- `after-view.jpg`: sista bilden i full storlek (800 × 500).

Betessteg (efter, 5 s efter att biten betats av): 0,42 m på 45 stegbilder, halsen 1,51 (huvudet nere), tillstånd `graze`, innanför staketet.

## Kostnad

Inga nya draws, texturer, program eller pass: 17 calls, 67 program och 68 texturer i båda faserna (trianglarna 352 021 → 352 053
efter betessteget, utan nya meshar; skillnaden kommer från grässynlighet/kamera, inte från ponnyerna, vars instansnät har fast
storlek). CPU: `stepPonyMotion` ≈ 0,4 µs per ponny och bild (node), plus en kvaternionmultiplikation per ponny. Shader: några
ALU-operationer per ponnyvertex. `src/ponymotion.js` 7,6 kB.

## Begränsningar

Publikens instansierade ponny har inga ben-/öron-/huvudben: inget vilande bakben, öronen vrids inte var för sig (bara bakåt vid en
fluga), inget extra tuggnick och ingen hudryckning. Svansen är en stel del, så bara kedjans bas syns (originalets reservnät gör
likadant). Manens förskjutning görs före halsens vridning, så med huvudet nere blir den delvis en vertikal rörelse. Ingen mobilvy
togs; telefonen använder samma program.
