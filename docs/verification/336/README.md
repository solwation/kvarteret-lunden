# #336 – neutralt vindsus

Granskad originalkälla `26fa2762aa43792163904aa8721db95091b2e329` (#2177), publik bas `a08a6f3`. `selection.json` anger exakt källurval och käll-/resultathashar. Ingen full originalfil `audio.js`, personlig resurs, ljudfil, väder-/spel-/tjänstekod eller originalhistorik överförs. Originalets neutrala filterparametrar och falloffvärden återanvänds; ljudnivåerna är konstnärliga antaganden, inga uppmätta verkliga vindar.

Publikens tidigare ljudmodul var en helt tyst stub. Nu finns endast procedural vind: en gemensam bruskälla via lågpass och bandpass, samt en positionsdämpad filtergren per öppet fönster. Alla övriga `sfx` förblir tysta. `world.js` har kvar sin befintliga fönsterkonsument, även om fönstret öppnades innan ljudet slogs på. Källans separata LFO/brusslingor, reverb och andra ljud importerades inte.

Vegetation och ljud delar `siteWind.power`, `siteWind.time`, `siteWind.dir` och exakt `SITE_WIND.gust`-fas vid besökarens plats. Ingen ny väderkälla eller klocka. Publiken behåller sin fasta `SITE_WIND.calm` = 0,12, och `?wind=power[,seconds]` kan låsa det som tidigare. Bladtäckning följer publikens redan befintliga månad, närhet befintliga träd; dämpningen använder `Navigation.outdoors/below/inCore`. Uppdatering var 0,25 s och parameterutjämning 0,6 s, originalets antagna värden.

I Hjälp finns **Vindljud: av/på**. Före det uttryckliga trycket skapas ingen AudioContext eller ljudnod. Knappen börjar av varje besök, sparar ingenting och återanvänder samma kontext/bruskälla vid av/på. Av slår master till noll och pausar kontexten. Den nya kontrollen är granskad i sin ursprungliga proportion i `wind-control.png` (520×792, verkliga appens hjälpdialog). Det finns ingen meningsfull före/efter-scenbild för ljudförändringen; före-stubbens frånvaro av graf och efter-ljudets numeriska värden är beviset.

Tre avgränsade kontroller passerade:

1. `node --test tools/windsoundtest.mjs`: **7/7** portade tester för styrka/filter, samma byfas/riktning, sommar/vinter, inomhus, träd och fönster. `pure-test.txt`.
2. `npm test` (**184 moduler**, publik-/lagrings-/nätgränser, importgraf och två planritningar) och `npm run build` (**ca839d069df600d14ab94fbc**). Loggar sparade.
3. Ett eget browserpass med verklig publik app och den faktiska produktionsgrafen i **11 OfflineAudioContext-renderingar**, **14/14 kontroller**, **0 fel**, **0 externa anrop**, **0 läsningar/skrivningar av originalets lagring**. Fem egna syntetiska originalnamnrymdssentineller var orörda. `result.json` innehåller alla värden och isoleringslogg.

```sh
python3 -m http.server 8446 --bind 127.0.0.1
PLAYWRIGHT_MODULE=/path/to/playwright /path/to/original/tools/browsertest.sh \
  node tools/windsound336browser.cjs http://localhost:8446 docs/verification/336
```

Den faktiska appkontrollen öppnar ett riktigt fönster innan opt-in, slår på via knappens användargest, kontrollerar att ett enda noise-source och tre filter (två ute + det öppna fönstrets) skapades, stänger fönstret, stänger av/pausar och slår på igen utan ny bruskälla. Före: noll kontexter; efter: en kontext, en källa. Parametrarnas upprepade uppdateringar skapar inga noder. Övriga sfx är fortfarande tysta.

Offlinebeviset renderar samma `createWindGraph` som appen med samma seedade brus (48 kHz, sista halva sekunden mäts). Styrkan är direkt delad effekt 0…1, inte m/s. Här används neutral byfas för att isolera styrkeeffekten; det rena testet verifierar vegetationens riktiga fas/riktning. Testet förkortar utjämningen till 0,001 s för att mäta stabila nivåer, utan att ändra produktionsvärdet.

| Tillstånd | RMS ute | RMS inne |
| --- | ---: | ---: |
| Vindstyrka 0 | 0,000516 | 0,000093 |
| Publik lätt bris 0,12 | 0,002187 | 0,000383 |
| Låst full styrka 1 | 0,041330 | 0,004484 |

Fönster ensamt: RMS **0,003299 → 0,014989** från styrka 0,12 till 1; stoppat fönster **0**. Sommarens löv gav differensbaserad spektralindikator cirka3385 Hz mot vinterns cirka911 Hz vid styrka0,7 (indikatorn är ingen exakt FFT-centroid). Dessa är syntetiska numeriska jämförelser, ingen fysisk lyssnings-, rumsakustik- eller telefonprestandaverifiering.

Kostnad: inga ändrade WebGL-draws/material/geometrier eller bildresurser. Efter opt-in finns en noise-source, två filter och tre gainnoder för bädden; varje öppet fönster lägger till ett filter, en gain och en panner men ingen ny bruskälla. De kopplas bort vid stängning. Brusbufferten är 2 sekunder mono Float32, 384000 byte vid 48 kHz, delas av alla grenar. Ingen ny rAF, timer, nätanslutning eller lagringsnyckel. Appens befintliga renderloop sköter kvartsekundsuppdateringen. Browserwrappen saknade systemd-scope på värden; någon hård minnesgräns verifierades därför inte.

Root-dirigenten äger integration/publicering och slutlig releasekontroll. Inga tjänster startades utöver det egna tillfälliga lokala HTTP-testet; det och browsern stoppas före överlämning. Ingen push eller stängning från arbetaren.
