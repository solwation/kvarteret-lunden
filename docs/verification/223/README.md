# #223 Kallby ängar och bostäderna i norr

Källa: `solwation/lunden-3d-apartment` `cf116e20` (original #1798) och `b17e022f` (original #1808).

Chromium med SwiftShader, 1280x800, `?month=7`, samma kamerapositioner före och efter (kameran flyttas direkt, animationsloopen står still). Gränssnittet syns i bilderna.

- `fore-vast.png` / `efter-vast.png`: högt från (-250, 70, -60) västerut över nordvästra kvarteren.
- `fore-nordvast.png` / `efter-nordvast.png`: från (-300, 90, -250) mot nordväst.
- `fore-norr.png` / `efter-norr.png`: från (-150, 80, -330) norrut mot bostäderna norr om terrängen.

Före är det några gråa lådor i dimman; efter syns lamellhus med indragen takvåning, gårdar, radhus, garagelängor samt parkeringar, gräsytor, vägar och stigar.

| Vy | Ritanrop före/efter | Trianglar före/efter |
|---|---|---|
| vast | 24 / 24 | 289355 / 294621 |
| nordvast | 16 / 16 | 249309 / 254575 |
| norr | 20 / 20 | 259940 / 265206 |

`edge-houses` går från 912 till 3569 trianglar och `edge-land` från 1541 till 4150 (samma två mesher). Telefonprofil (390x800, touch): `edge-houses` byggs inte och `edge-land` är oförändrad (1541), det vill säga inget extra. Inga sidfel.
