# Verifiering av första arkitekturimporten

Källversion: `solwation/lunden-3d-apartment@c079371f6782225e29e9dac51518c509ed8c37e6`.

Denna import innehåller områdesgeometri, fast inredning, garderober utan innehåll, befintliga lägenhetsmodeller, trapphus/hissar och garage med tomma förråd. Privat möblering, gardiner, foton, teckningar, namn, fordon och spelfunktioner har tagits bort från den importerade koden. Varken personliga resurser eller originalets historik har kopierats.

## Kontroller

- `npm test`: granskar källfilerna för personliga namn, originalets tjänster och lagringsanrop; kontrollerar importkedjan och planunderlaget.
- `npm run build`: paketerar en statisk visning med lokalt Three.js. Publiceringen behöver inga externa skript, Workers eller backend.
- `tools/browser-check.mjs`: startar den faktiska publiceringsbyggnaden i Chromium med WebGL, kontrollerar förflyttning, dörranimation, E-interaktion, giltig mark vid alla fem platsval, hjälp och mätläge. Testar mobil layout och styrreglagets verkliga touchinmatning inklusive avbrott via CDP.
- Webbläsartestet lägger in markörer under originalets lagringsnycklar och kontrollerar att de finns kvar och att inga nya lokala nycklar tillkommer. Försöker även ange gamla `cloud`- och `sync`-parametrar; de används inte av visningen.
- Alla sidans nätverksanrop registreras: inga externa tjänster tillåts. Fel i webbläsaren under testet ger underkänt.
- Separata komponentkontroller vid importen har byggt båda våningsplanens inredning och standardinredning i Chromium. Garage/trapphus har kontrollerats för öppningsbara dörrar och hissresor i alla fyra hus. Navigationskontroller täckte ursprunglig trappgeometri upp/ned och vägg-/dörrkollision.

Skärmbilder och maskinläsbara resultat sparas lokalt under `artifacts/` och checkas inte in. Visuellt granskade vyer: introduktion, område, L1007 och mobil vy av L1007.

## Begränsningar

Automatiserad mobilkontroll är Chromium-emulering, inte en fysisk iPhone eller Surface. Inga påståenden om uppmätt prestanda på sådan hårdvara görs. Modellens befintliga osäkerheter i mått och material kvarstår. Mätverktyget visar modellmått, inte verifierade bygghandlingsmått. Fast köksutrustning visas; vardagssimulering och löst innehåll ingår inte.
