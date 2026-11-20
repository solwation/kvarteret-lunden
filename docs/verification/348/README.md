# Fönstervind bakom innerhinder, #348

Selektiv källa: original #2181 `11995f35d32105d017be0d4efb0883b2ee8bef7f`,
inklusive första hjälparna `18414a7451b072bb775dfbd8a5d898b92dffd9d0`.
Publik bas `c649ffa`; [exakta hashvärden och urval](selection.json).
[Bevarade publika källor/UI](preservation.json). Originalets hela audio.js,
historik, ljudfiler, personliga resurser eller spel/tjänster importeras inte.

## Gräns och anpassning

Originalets sista rättning undantar fönstervinden från generell occlusion för
att själva den öppna fasaden inte ska ge en andra förlust. Det gäller även
här: utomhus, annan bostad, trapphus/garage eller ej modellerad cell får ingen
ny skattning. Bara modellerade innerhinder mellan fönstrets rumssida och
lyssnaren i samma bostad dämpar den redan befintliga positionsgrenen. Den
icke-positionella vindbädden går samma gamla väg. Övriga sfx är tysta.

Publicens fönsterpanner står kvar vid ramen. World skickar dess redan
befintliga inåtnormal som metadata. `windowRoomPoint` söker första giltiga
rumscellen i den riktningen, på befintliga 5cm-gridens skala, högst1m (egen
avgränsad heuristik). Den flyttar ingen geometri, panner eller navigeringspunkt
eller uppfinner ett rum. Saknad rumsdata betyder ingen extra dämpning.

Audio använder öron/fönstercentrum med absoluta golv, eftersom Navigation och
VisitUnit.levelAt räknar fötter. L1004/L1201 använder egna världsväggsegment,
dörrar, rum och befintlig throughSlab inklusive trapphålet. L1007 använder
world.levels/roomMaps och den befintliga bjälklagsöppningen. Dörrens fasta
segmentAt(0) avgör om linjen går genom öppningen; live t avgör stängd/öppen.
Det undviker att den svängda dörrbladslinjen tappar den öppna dörrpassagen.
Det är en grov 2D-/rumsskattning, inte akustisk strålspårning eller simulering
av diffraktion, väggmaterial, efterklang eller alla delvis öppna vägar.

L1007, L1004 och L1201 har vardera6 faktiska vindfönster: samtliga18 löste
sina egna befintliga rumsceller i appen. Verkliga rumsfröfall gav
vägg/dörr/bjälklag också i båda besöksenheterna, inte bara i L1007. A/B/C:s faktiska CoreHouse-objekt
saknar RoomMaps och motsvarande öppningsbara vindkonsumenter; N/A, inga nya
ljudkällor har skapats där. Originalets playroom eller generell ljudmotor ingår inte.

## En befintlig ljudgren, inga extra noder

Den redan granskade #336-grafen behåller en procedural bruskälla, två
bakgrundsfilter och ett filter/gain/panner per öppet fönster. Dämpningen
multiplicerar bara fönstrets gain och ändrar dess befintliga lågpassmål. Samma
kvartsekundstick används. Avstängt default, geststart, paus/återstart av samma
AudioContext, inget sparat ljudval och samma vegetationsvind är kvar.

Först provades `min(vindHz,hinderHz)`. Faktisk OfflineAudioContext visade
att nivån sjönk men klangen inte ändrades: vindens tidigare300–930Hz ligger
redan under originalets hindergränser1000–9000Hz. Det är dokumenterat i
[den ersatta diagnostiken](initial-cutoff-diagnostic.json).

Slutversionen använder `vindHz / hypot(1, vindHz / hinderHz)` när ett hinder
finns och **exakt tidigare vindHz utan hinder**. Detta är en konstnärlig
bandbreddsskattning för att återanvända en enda biquad, **inte fysisk ekvivalens
till två seriekopplade filter**. Hindrets dB-förlust behåller originalvärdet;
ingen ny nod eller nivåförändring införs i vindbädden. Både originalnivåer och
den nya kombinationen är antaganden, inga uppmätta byggnadsakustiska värden.

## Tre kontroller

1. `node --test tools/soundocclusiontest.mjs`: 9 gröna rena fall. Samma rum,
   vägg, fast dörröppning/stängd→öppen, annan vånings dörr, öron/fötter,
   bjälklag/trapphål, öppen fasad/okänd cell, rumsportal, besöksenhetens egna
   väggar/dörrar/absoluta golv samt exakt fri och lägre blockerad cutoff.
2. `npm test` (187 moduler) och `npm run build` (`10b5ef84eaaf14a437acaf9f`): slutligt gröna. Basens orelaterade #340
   hade en personlig sökväg i dokumenterad kommandorad; dirigentens kända
   `a669c198423f0e9e3b5c492160f72f18cac504b1` korrigerar den. Samma granskade
   docfix är lokalt cherry-pickad som `0a1559a`; ingår inte i #348:s egen port.
3. `tools/windowocclusion348browser.cjs` i riktig publik app, Chromium1248 /
   SwiftShader via värdens browserwrapper på tilldelad8452; 480×320 för att
   begränsa WebGL-kostnaden. 16 gröna kontroller och8 produktiongraf-renderingar
   i OfflineAudioContext, 48kHz. Inga nya scen-/UI-bilder: ingen UI har ändrats.

Det första riktade passet hittade cutoff-risken ovan. Efter en avgränsad
formelrättning passerade samma app/ljudkontroll; inga breda profiler,
telefonvarianter eller bildserier lades till. Produktionskällorna var frysta
under respektive pass. Appen laddade sin riktiga World/Navigation, öppnade
sina verkliga fönster och ändrade en befintlig dörrs t för stängd/öppen.
Riktig runtime-window-handle följde en blockerad lyssnarposition och tillbaka
till fri väg. Den frystes sedan för numeriska ljudkontroller, inte en ersatt scen.

## Numeriskt ljudbevis

[Alla faktiska källpositioner, normaler, rum, lyssnarpunkter och resultat](result.json).
Offline använder exakt produktionens createWindGraph och verkliga hinderparametrar
från appen. Panner/lyssnare står på samma plats i offlinefallen så att
avståndsförlust inte förväxlas med hindret. Vindstyrka0,7, samma deterministiska
brus, sista0,5s av1s mäts. Ljusstyrkemåttet är differensenergi relativt
signalenergi, ingen uppmätt akustisk frekvensrespons.

| Fönsterfall | RMS | Spektrummått Hz |
| --- | ---: | ---: |
| Fri väg | 0,010283367 | 735,159 |
| Verklig innervägg | 0,003429246 | 661,350 |
| Verkligt bjälklag | 0,002563311 | 592,816 |
| Verklig stängd dörr | 0,004998368 | 698,131 |
| Samma dörr öppen | 0,008939167 | 732,790 |
| Hinder borttaget/återställd fri väg | 0,010283367 | 735,159 |

Vindbädden med/utan fönsterhindret gav exakt samma RMS0,023494845 och
spektrummått3384,566. Fri återställd fönsterväg gav samma numeriska resultat
som före hindret. Den riktiga stängd/öppen-dörren var i L1007 övre plan:
källan(1,79475;4,825;0,07), lyssnaren(2,15175;4,87;5,6145).

Opt-in skapade exakt1 källa och3 filter med ett öppet fönster (2 bädd+1 fönster).
Kontrollen öppnade/stängde alla18 fönster och återöppnade det första; dess
**kumulativa** nodräknare slutade på1 källa/21 filter/22 gain/19 panner, inte
samtidigt levande19 grenar. Upprepade dämpningsuppdateringar tillförde0 noder.
Varje separat offlinegraf höll1 källa/3 filter/4 gain/1 panner även efter
upprepade måländringar; stängning kopplade bort hela fönstergrenen.

Noll externa anrop, noll sid-/konsolfel. Fem syntetiska originalnamnrymds-
sentineller var kvar och Storage-hooken registrerade0 åtkomster till dem.
Av/paus och på återanvände samma enda kontext/källa. Ingen lyssningsbedömning,
fysisk telefon-, GPU-/FPS- eller allmän akustikprestanda påstås.

Grova faser: källgranskning/avgränsning3min, implementation/rena tester4min,
två små app/offlinepasscirka3min, dokumentation/slutkontroll3min. Ingen mer
browser behövs efter de gröna riktade kontrollerna. Rotdirigenten äger
integration, Pages-verifiering och stängning.
