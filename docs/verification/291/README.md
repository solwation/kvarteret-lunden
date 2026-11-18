# Egen publik parkettverifiering — #291

Selektiv originalkälla: **3515bf9981c0f3df79d84d66305a24a7f16ffe9c** (#2069).
Publik förebas: **f4afd632ae8eb9f4f8cc6c07164f00f4dc60e954**.
`result.json` binder körningen till SHA256 för publicens levererade moduler och testfixtur.
Originalets avvisade mellanrevision 785a5b90 används inte.

`chalk-comparison.jpg` och `standard-comparison.jpg` är **nya publika bilder**:
före till vänster, efter till höger; nära golvvy överst och rumsvy under.
Ek Chalk respektive standard trestav behåller baspalett, mått och förskjutning,
men den raka breda randningen ersätts av finare böjda/förgrenade fibrer.
Glansfältet följer fibrerna och är fortsatt lugnt och matt.

## Kontroller

- `npm test`: pass, 150 moduler, importgraf, planritningar, same-origin-policy,
  förbjudna konsumenter/ord, appidentitet och ikonkontrakt (`npm-test.txt`).
- `npm run build`: pass, publicens vanliga statiska bygge (`npm-build.txt`).
- `node tools/parquet291-check.mjs http://localhost:8186 docs/verification/291` via
  värdens browserwrapper: pass. Chromium/SwiftShader, 900×600, DPR1, MSAA och
  NeutralToneMapping. Samma plan, produktionsfunktioner, material, kamera och ljus
  före/efter; noll sid-/konsolfel och noll externa anrop. Roughnesskartornas gröna
  kanal 234–255 respektive 236–255; färgkartorna opaka, kartparen cachade och meterskalan
  lika. Hela resultatet och källhasharna finns i `result.json`.

Alla tidigare publika konfigurationsbytes är oförändrade när det enda nya
`PARQUET_SURFACE`-blocket räknas bort. Den nya modulen jämfördes med exakt originalkälla:
enbart kommentaren med ärendenummer skiljer. Ingen originalkonfiguration eller historia
importerades. Diff och båda bildpar granskade.

| Publik vy | Ritanrop före/efter | Ritade trianglar före/efter | Byggda geometritrianglar före/efter |
| --- | ---: | ---: | ---: |
| Ek Chalk nära | 1 / 1 | 2 / 2 | 2 / 2 |
| Ek Chalk rum | 262 / 262 | 36228 / 36228 | 40052 / 40052 |
| Standard nära | 1 / 1 | 2 / 2 | 2 / 2 |
| Standard rum | 185 / 185 | 28574 / 28574 | 30296 / 30296 |

Geometrins begränsningslådor är exakt lika; samtliga mätvärden gäller just komponentfixturen,
inte hela appens renderbudget. Ingen geometri, kollision, gångyta, extra lampa, pass eller
ritanrop ändras. Standard-materialet får en extra roughness-textursampling med dess UV-varying.
Detta är inte en kostnadsfri shaderförändring.

## Texturminne

| Delad finish/karta | Dimensioner | RGBA8-basbytes | Hela nominella mipkedjan |
| --- | --- | ---: | ---: |
| Ek Chalk färg, oförändrad | 324×1200 | 1555200 | 2073140 |
| Ek Chalk roughness, ny | 162×600 | 388800 | 517940 |
| Standard färg, oförändrad | 360×1320 | 1900800 | 2534032 |
| Standard roughness, ny | 180×660 | 475200 | 633232 |

Tillkommande summa: **864000 basbytes / 1151172 nominella mipbytes** (cirka 1,10 MiB).
Måtten avlästes från de verkliga canvaskartorna; mipnivåerna summeras med golvhalverade
dimensioner till 1×1. Föraroverhead, CPU-canvaskopior och eventuell annan allokering ingår
inte i denna bytekalkyl. Browserkörningens topp var 522 MiB. Ingen GPU-tid, FPS-vinst eller
fysisk enhetsprestanda påstås.

## Fixtur och avgränsning

Playwright lägger genom request-routing endast till export av befintliga privata
`M`, `SM`, `buildLevel` och `plate`; funktionskropparna ersätts inte. Rumsvyn använder
den riktiga publika våningsbyggaren och standardflaggan på den gemensamma plan som
L1004 använder. Närvyn använder det riktiga golvplanet med samma material/meterskala.
Det är en komponent med produktionskonsumenter, inte hela World/start/navigeringsflödet.
L1201 använder samma standardmaterial; dess egen rumsgeometri byggdes inte om här.
Inga originalbilder, personliga möbler, spel/tjänster eller Cloudflare ingår.

Kör med publicens vanliga npm-beroenden och en lokal server på 8186. Browserwrappern
väljer full Chromium; fixturen använder enbart resurser från sin egen server:

```sh
npm test
npm run build
/path/to/original/tools/browsertest.sh node tools/parquet291-check.mjs http://localhost:8186 docs/verification/291
```

Endast de granskade parade bilderna behålls; lösa före-/efterbilder tas bort av kontrollen.
Dirigenten ansvarar för publicering, SHA-pinnad bildkommentar före stängning och faktisk
Pages-verifiering. Ingen appändringslogg finns i public; README beskriver förbättringen.

## Publicering

Kod/bilder `e4e9f8544997a8575fc53dfcf120d1095c483bad`. Pages44264253076 success på exakt revision, båda bilder HTTP200 och inbäddade före stängning: https://github.com/solwation/kvarteret-lunden/issues/291#issuecomment-6972813586. Dokumentkvittot ändrar inte appkällan; dess separata utlösta run följs av dirigenten.
