# #232 — neutral promenadyta i väster

Exakt granskad originalkälla: `e69459ae71274ee8d87d325c8f834a90b562ac8a`.
Publik verifieringsbas: `995ea013c450e567c87b68dfe6f6c14e614105df`.
Endast WALK.x0 ändras från −260 till −285; övriga publika inställningar är orörda.
Ingen privat Player-kod, djur-/spelmekanik, bild, lagring, tjänst eller git-historik importerad.

## Riktade kontroller

- `node tools/walkboundstest.mjs`: två PASS-grupper. Alla övriga WALK-värden är exakt
  publicens tidigare värden; hela gångrektangeln ligger innanför befintlig terräng.
  Marginaler till ritad kant: väst65, öst20, nord140, syd8 meter.
- Faktisk public Navigation i Chromium: sammanhängande cirka100m-rutt från (−250,30)
  till (−280,30), (−280,20), (−280,40), (−250,40), tillbaka till start. Endast initial
  startteleport inom rutten; 3 788 update-anrop, noll flyg eller räddningsflyttar,
  största registrerade steg0,02680m. Alla fem mål nås utan att skära genom hinder.
- Gamla gränsen stoppade vid x−259,78; samma västetapp når nu x−279,813. Nya ytterkanten
  stoppar vid x−284,78. Separata korta kontrollförsök mot befintlig byggnad och vatten
  stoppas fortfarande (byggnad x27,68, vattenavstånd5,0838m vid kanalbredd6,1572m).
- Hela WALK-kanten samplas med5m avstånd (506punkter) mot faktisk ritmesh/grid och
  höjdfunktion: noll punkter utanför eller med ogiltig höjd. Mesh/grid täcker
  x−350…340 och z−340…460.
- Inga externa anrop eller sidfel. Efter-rutten lämnar originalets localStorage- och
  sessionStorage-markörer orörda och skapar inga nya lokala nycklar.
- `npm test`: PASS,105moduler, importgraf, same-origin-policy, identitet och ikoner.
- `npm run build`: PASS, version `6f5d7be3865697e38fe15112`.
- `git diff --check`: PASS.

Kommandon från projektroten, med egen källserver på port8943:

```
BROWSERTEST_LOCK=<state-dir>/browser.lock BROWSERTEST_TIMEOUT=5m CHROME_PATH=<playwright-chromium> <checkout>/tools/browsertest.sh node tools/westwalk-check.mjs http://localhost:8943 docs/verification/232 before
BROWSERTEST_LOCK=<state-dir>/browser.lock BROWSERTEST_TIMEOUT=5m CHROME_PATH=<playwright-chromium> <checkout>/tools/browsertest.sh node tools/westwalk-check.mjs http://localhost:8943 docs/verification/232 after
```

## Egna nådd-platsbilder och integrationsgräns

`before-west-reached.png` och `after-west-reached.png` är granskade faktiska vyer från
platsen som promenaden nådde, med samma östliga blickriktning och 1280×800, juni.
Före-bilden står vid gamla stoppet; efter-bilden står20m längre västerut på befintlig
mark. Exakta koordinater, markgränser, rutt och hinderresultat finns i JSON-filerna.
Browser-minnestopp1 031/1 055MiB av4GiB. Chromium/SwiftShader, ingen fysisk telefon.

Rutten z20–40 ligger långt från den ändrade åprofilen i parallella #231. En orelaterad
integration kräver därför ingen ny browserrunda. Harnesset är källbundet och kan köras
riktat om en berörd mark-/navigationskälla ändras. #230 var inte integrerad i denna bas;
dirigenten kör dess26 snabba WALK-beroende roadEnd-kontrakt på kombinationen230+232.
Detta är kvarvarande integrationskontroll, inte ett lokalt påstått grönt test.
