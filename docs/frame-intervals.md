# Lokal bildintervallsdiagnostik (#140)

Öppna visningen med `?perf`. Inget skickas till en tjänst eller sparas i webbläsarlagring.
I Console används `lundenViewer.intervals.start()` för att nollställa,
`.stop().summary` för statistik och `.download()` för JSON-filen. Ändra inte fönster,
DPR eller inställningar mellan jämförda varv. Anteckna revision, skärmens Hz,
Chrome-version och WebGL/WebGL2/GL_RENDERER/Problems Detected från `chrome://gpu`.
GPU-strängen i exporten bevisar inte hårdvaruacceleration.

Fast rutt: 1280×800, zoom 100 %, samma testprofil och startdestination Området.
Starta Chrome Performance utan CPU-/nätstrypning eller skärmbilder. Starta lokal logg,
gå till Hus L:s ytterdörr, öppna/stäng med E, gå tillbaka och vänd ett helt varv.
Stoppa efter cirka 20–30 s eller ett hack och spara både Performance-spåret och JSON.
Upprepa samma varv utan omladdning och håll första/upprepade resultat åtskilda.
Granska webbadresser och maskinuppgifter innan ett Chrome-spår delas offentligt.

Loggen är begränsad till 3600 intervall; överskrivna prover redovisas. Median,
nearest-rank p95/p99/max, provantal, längd och antal strikt över 50/100/250 ms avser
kvarvarande prover. Hela callback-intervallet mäts före Clock/clamp. `previousWork`
är föregående callbacks CPU-faser update/render; resterande väggtid är inte GPU-tid.
Introduktionskort/hjälpdialog märks paused och flikbakgrund background. Längd ensam
innebär aldrig paus. Öppna/stäng hjälpen respektive växla flik som kontrollprov.
Den publika loopen startar efter att modellen byggts; inga påhittade bygg-/warmup-
eller privata spelfaser importeras. `diagnosticMs` omfattar bara loggens callback/
complete-arbete, inte Chrome-inspelning/export/all annan instrumentering.

`timeOrigin + startMs/endMs` tidsankrar varje intervall. User Timing-markören
`lunden-perf-start` och `lunden-perf-gap` (>50 ms) ligger i pågående Performance-spår;
sidans egna markörlistor rensas direkt för att begränsa minne.

Verifiera med `node --test tools/frameintervalstest.mjs`, `npm test`, `npm run build`
och riktig browser med ett avsiktligt synligt >250 ms-stopp, hjälpdialog och verklig
bakgrundsflik. Detta visar diagnostikens funktion; SwiftShader visar inte prestandan
på en fysisk användares GPU. Ingen geometri, navigation, lagringsnyckel eller tjänst ändras.
