# #352 – porlande å och avlägset stadsbrus (ljud, ingen bild)

Källa: original #2190, `f58e50a021517558cf272924397a1c342399553f`; publik bas `d487969`. Mätt med `tools/ambientbed352browser.cjs`: den riktiga `createWindGraph` i en OfflineAudioContext (48 kHz, 1 s, RMS efter 0,5 s, vind avstängd), [metrics.json](metrics.json). Raderna "river" innehåller även nattens stadsbrusgolv (0,00034).

| Fall | RMS |
|---|---:|
| å, vid fåran | 0,0173 |
| å, 10 m | 0,0168 |
| å, 25 m | 0,0101 |
| å, 50 m | 0,0008 |
| å, 70 m / 150 m | 0,00034 (bara stadsgolvet) |
| å vid fåran, inomhus | 0,0011 |
| stad 03:00 | 0,0003 |
| stad 08:00 / 17:00 | 0,0048 |
| stad 12:00 | 0,0021 |
| stad 22:00 | 0,0009 |
| stad 08:00 inomhus | 0,0010 |

Källor och filter byggs en gång (3 källor, 4 filter utan fönster); `setAmbient` skapar inga noder. `node --test tools/ambientbedtest.mjs` 6/6. Nivåerna är gissningar; ingen avlyssning eller fysisk enhet testad. Ingen meningsfull bild för ljud.
