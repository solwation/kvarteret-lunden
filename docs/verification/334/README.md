# Rumsreflektioner på fasta ytor, #334

**Integrerad efter budgetbeslut (2026-11-21).** Användaren godkände på #334
(2026-11-20) två fler aktiva skärmprogram (48 → 50) för rumsreflexerna. Den
granskade [patchen](proposal.patch) från källrevision
`808be761957511177ceeadae4834336f9bafd246` är applicerad på `main`
`739314ab51f01a259eb7e9d93f00fcda39e588f9` och aktiv som standard
(`?quality=0`/`?noprobe` stänger av). Se [Integration](#integration-2026-11-21)
för de nya mätningarna; avsnitten nedan beskriver checkpointen.

Granskad originalkälla: `7adb45fd27ebec7fb811cb67fb09ae5d1a4bca69` (#2151).
Publik bas: `a08a6f3836b823f334f4ff73700f9b1781582d44`.
[Exakt urval och filhashar](selection.json). Senare moduländring `b85bd611`
(#2179) gäller fönster och ingår inte. Inga originalbilder eller personliga
resurser, möbler, spel/tjänster, WindowLight/lights.js eller originalhistorik importeras.

## Publik anpassning

Endast redan befintliga fasta material märks: krom, stål, porslin, mörkt
apparatglas, vitvaror och diskret kakel. Ytornas geometri, färg, roughness,
metalness och vanliga pass behålls. De svarta blandarna får ingen kromtagg.
Fönster och speglar omfattas inte; Reflector-objekt döljs under kubfångst.
Procedurritad neutral reservkarta används tills den första fångsten finns.

Sonden är 64 px, en kubsida per tillåten appbildruta och högst sex rum i LRU.
Efter en ny zon väntar den 0,6 s, utom vid första fångsten. Publiken har fast
dagsljus: signaturen `public-day` ersätter originalets lamp-/natt-/strömvärld.
Hela scenen är färdigbyggd och minst en vanlig bildruta ritad innan kubarbete
får börja. Det finns inget original-WarmUp/Quality-system här; därför ingår
riktig kall kompilering i kostnaden nedan. Skuggspärren respekteras om en
framtida publik renderer aktiverar skuggkartor; sådana används inte i dagens loop.

`?quality=0`/`?noprobe` skapar inga sonder/kartor och lämnar materialens envMap
som före portningen. Det är ett publikt avstängningsval, ingen import av en
kvalitetskontroll. Befintlig lowMemory-detektion väljer högst en fångst,
RGBA8/sRGB och frigör kub/PMREM-generator efteråt; inga senare zonbyten fångas.
En fysisk mobil och återställning efter GPU-kontextförlust har inte körts här.

L1007 använder sina befintliga publika RoomMaps. Besökbara L1004/L1201 använder
sina egna rumsnamn, lokala koordinater och absoluta våningshöjder. Appens
faktiska data finns i [browser.json](browser.json): L1004 offset −24,825/0,
golv 0/3,25; L1201 offset −41,475/1,57, golv 6,4/9,4. Inga personliga
rumsdata har lagts till. De tre faktiska A/B/C CoreHouse-objekten har inga
RoomMaps; där saknas motsvarande modellerade kök/badrum. Befintlig
lägenhetsspecifik finish påstås inte vara allmän standard.

## Kontroller och egna bilder

1. `node --test tools/roomprobetest.mjs`: 11 gröna fall för nivå/avstängning,
   telefonens engångspolicy, zon/offset/golv, hysteresis, settle, LRU och
   start-/skuggspärr med högst en sida per tillåten update. De sista två
   kontrollerar publik materialbevaring respektive scheduler utan WebGL.
2. `npm test` och `npm run build`: gröna; 184 moduler och oberoende nät-/lagringsgränser.
3. Eget riktigt publikt app-pass via värdens browserwrapper, Chromium 1248,
   SwiftShader, 1000×700, DPR1. `tools/roomprobe334browser.cjs` laddar vanliga
   publika index/main och byter bara de sex berörda modulerna till den publika
   Git-basen i före-fasen. Samma kamera, fast klocktid och vind 0. Inga
   produktionskällor ändrades under passet. Inga originalbilder används.

Fyra egna PNG granskades i full storlek: `kitchen-before.png`,
`kitchen-after.png`, `bath-before.png`, `bath-after.png`. Köket får diskret
rumsfärg i glas och diskho, medan badrummets krom/porslin får den ljusa
omgivningen. Inga nya objekt eller förflyttade ytor syns. Rotdirigenten
publicerar bilder från commit-SHA före borttagning enligt bildpolicyn.

Noll externa anrop/sid-/konsolfel. Både localStorage- och sessionStorage-
sentinellen är kvar i båda faserna. [Rådata](browser.json) innehåller verkliga
taggar, enhetsdata, zonnycklar och varje mätt probe-update.

## Kostnad och ärliga gränser

| Ordinarie skärmrender | Före | Efter |
| --- | ---: | ---: |
| Kök, ritanrop | 156 | 156 |
| Kök, trianglar | 604935 | 604935 |
| Kök, hela programcachen | 67 | 129 |
| Kök, texturer i renderern | 70 | 75 |
| Badrum, ritanrop | 149 | 149 |
| Badrum, trianglar | 612250 | 612250 |
| Badrum, hela programcachen | 69 | 131 |
| Badrum, texturer i renderern | 71 | 77 |

Programcachen ökar med 62; totalparitet påstås inte. Originalet hade redan
spegel-/miljökartsvarianter som den publika appen saknar. Kub/HDR/PMREM
kompilerar sådana varianter vid första användning. Vanliga skärmbildrutor
får inget extra ritpass. Distinkta faktiskt använda skärmprogram mäts i en
enda riktad komplettering efter att cacheökningen upptäcktes, separat från
den samlade cachen; se [screen.json](screen.json).

66 uppmätta vanliga probe-update: median 0 ms, max 1 ms vid browserns
tidsupplösning. Tolv fångst-update (två rum, sex sidor vardera): median 10 ms,
max 7197 ms. Första kub-/materialkompilering tog upp till 7197 ms; första
slutsteget inklusive PMREM tog 5547 ms. Nästa rums sex sidor tog 5–12 ms per
update. Detta är synkron CPU/driver-tid i SwiftShader, ingen GPU-query,
FPS-garanti eller representativ fysisk hårdvarumätning. Kostnaden är sällsynt
men verklig; originalets förkompileringsantagande har inte dolts i publiken.

Alla tolv fångst-update ritade exakt en kubsida; övriga inga. PMREM:s
filterpass körs vid sjätte sidan och kan vara flera interna ritningar.
`facesPerFrame=1` betyder därför inte ett enda totalt GL-anrop i slutsteget.
Ingen bredare profil eller extra bildserie behövs.


## Riktad komplettering: öppet programvillkor

`tools/roomprobe334screen.cjs` laddar en enda riktig publik app och väntar på
badrummets fångst. Därefter stoppas animationen. WebGL drawArrays/drawElements,
instanced-varianter och WEBGL_multi_draw registrerar det faktiskt aktiva
GL-programmet per ritning. Samma frysta scen/kamera ritas först med rumskartan,
sedan med just de 51 sondmaterialens envMap satta till null (publikens tidigare
materialtillstånd), därefter med samma kartor återställda. Ingen kubfångst körs
i de tre mätta skärmrenderingarna, inga nya bilder tas och inga produktionskällor ändras.

| Fryst vanlig badrumsbild | Utan miljökartor | Med rumskarta | Återställd rumskarta |
| --- | ---: | ---: | ---: |
| Distinkta faktiskt använda skärmprogram | 48 | 50 | 50 |
| Ritanrop | 149 | 149 | 149 |
| Trianglar | 612250 | 612250 | 612250 |
| Hela programcachen | 132 | 132 | 132 |

**Programasserten fallerade i checkpointen på 50 ≠ 48; efter beslutet tillåter den högst +2.** Den ursprungliga
acceptansen kräver oförändrat programantal i vanliga bildrutor. Detta är en
verklig ökning med två, inte bara de separat redovisade kub-/PMREM-programmen.
Ingen optimering görs på chans efter denna diagnos. Handoff är en trygg
kod-/evidenscheckpoint med öppet krav, inte en slutgodkänd integration.

Samma enda pass samlade verkliga A/B/C-material (alla tomma tagglistor och
hasRoomMaps=false), L1004/L1201:s materialklasser och probeZone-nycklar med
befintliga lokala rum/golv. Ingen ny scen, bred profil eller telefonkörning
lades till. Det är en materialablation i samma app, inte ett nytt separat
förebygge. Baseline-bildparen ovan använder däremot de riktiga gamla modulerna.

Omfattning: undersökning/anpassning cirka 5 min, implementation/test cirka
3 min, två riktade browserpass sammanlagt cirka 5 min, dokumentation/handoff
cirka 3 min. Inga fler verifieringsrundor behövs före dirigentens disposition.

Läsdiagnos utan ny körning: Three r170:s `WebGLPrograms` tar med envMap-mode,
kub-UV-höjd och envMap-flagga i programnyckeln; `WebGLProgram` skapar
`USE_ENVMAP`/`ENVMAP_TYPE_CUBE_UV`. Material med rumskarta får alltså en annan
shaderfamilj än kvarvarande otaggade MeshStandard-material. De berörda
källtyperna är släta fittings samt kakel med map+bumpMap+roughnessMap; det är
en rimlig förklaring till två extra sambruksvarianter. Sparad diagnostik
innehåller antal, inte program-ID→materialtabell: exakt tilldelning av de två
programmen till dessa typer är **inferens**, inte verifierad individuell
shaderidentifiering. Ingen liten bevisad korrigering finns i denna checkpoint;
att miljökartlägga otaggade ytor bara för att slå ihop program skulle ändra
annat materialutseende och ingår inte.

Efter den fallerande programasserten validerades sparade data separat utan ny
browser: identiska återställda renderingstal, noll externa/fel, A/B/C utan
taggar/RoomMaps, L:s materialklasser och 24 giltiga enhetszoner med rätt namn,
nyckel och absolut golvhöjd. Samtliga frysta produktionsfilhashar matchade
`selection.json`. Slutlig snabb kontroll: 11 Nodefall, npm test och build gröna.


## Integration 2026-11-21

Patchen applicerades med `git apply --3way`; endast tre textkonflikter mot
nyare publika ändringar löstes (sektion i `docs/upstream.md`, `ROOM_PROBE`
efter `ROOF_STEAM` i `src/config.js`, `roofSteam` och `roomProbe` båda i
`window.lundenViewer`). Ingen kodändring i sonden. `tools/roomprobe334screen.cjs`
tillåter nu högst två extra vanliga skärmprogram (beslutet på #334);
`tools/roomprobe334browser.cjs` jämför mot integrationsbasen (`BASELINE` kan sättas).

Kontroller: `node --test tools/roomprobetest.mjs` 11/11, `npm test` (193 moduler)
och `npm run build` gröna. Båda browserskripten kördes mot riktig app (Chromium,
SwiftShader, 1000×700, DPR1), noll konsol-/sidfel och externa anrop; bilderna
här är ersatta med denna körning och granskade i full storlek.

| Vanlig skärmrender, aktuell main | Före | Efter |
| --- | ---: | ---: |
| Kök, ritanrop / trianglar | 156 / 604935 | 156 / 604935 |
| Badrum, ritanrop / trianglar | 149 / 612250 | 149 / 612250 |
| Badrum, distinkta skärmprogram (fryst, envMap av/på) | 50 | 52 |
| Kök / badrum, hela programcachen | 70 / 72 | 135 / 137 |

Baslinjen är nu 50 skärmprogram eftersom main fått andra varianter sedan
checkpointen; ökningen från sonden är fortfarande exakt två, som godkänt.
46 mätta probe-update, tolv ritade exakt en kubsida, max 1816 ms (första
kall kompilering i SwiftShader). Fysisk mobil och GPU-kontextförlust är
fortfarande inte körda.
