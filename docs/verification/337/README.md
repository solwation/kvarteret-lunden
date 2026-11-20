# Public #337: rum bakom grannfönstren

Publik bas `a08a6f3` (före = basens `config.js`, `exterior.js`, `glasspanes.js`, `surroundings.js`), granskad originalkälla
`dd7e6697d58465db68b2f3d1d61412e9b25707cb` ([original #2180](https://github.com/solwation/lunden-3d-apartment/issues/2180)).
Egen körning av den riktiga publika appen (`tools/roommap337browser.cjs`, Chromium/SwiftShader, fast klocka, native 1200x800, JPEG);
rådata i [browser.json](browser.json). `husL-*` = Hus L:s grannar, `abc-*` = Hus A-C från gården; `dag` = `windowLights.update(12, 0)`,
`natt` = `update(22.5, 1)` med scenljuset dämpat till 8 % (publicen har ingen dygnscykel).

Före: `abc-dag-before.jpg`, `abc-natt-before.jpg`, `husL-dag-before.jpg`, `husL-natt-before.jpg`. Efter: motsvarande `-after.jpg`
(`abc-dag-after.jpg` och `husL-dag-after.jpg` visar rum, gardiner, persienner och slöjor bakom rutorna; `*-natt-after.jpg` dunkla rum och tända
fönster som lampupplysta rum).

Mätt i samma vyer (före -> efter): draw calls oförändrade (426/434/531/539), trianglar oförändrade, shaderprogram +1 per vy
(76->77, 79->80, 81->82), texturer oförändrade, inga fel, inga externa anrop. Inga nya texturer, ljus eller pass; en uniform
(`uRoomLevel`) och tolv bakade vertexfloats per glasvertex. Telefonprofilen (`lowMemory`) är oförändrad: ingen patch, inga attribut.
Rummen är påhittade, alla värden i `ROOM_MAP` (`src/config.js`) är *guess*.
