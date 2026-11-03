# Public #239 – Passiv luftballong

Selektiv originalkälla `578ecc09b02c7355e299fc58d0e0127b622ee85a`. Endast sammanslagen balloonGeometry/stripeAt och rena balloonScale/balloonPos har överförts. Publikens egen klocka driver visningen. Korgen är ritad form; inga fysiska ytor, targets, player/world-kopplingar, öl/poäng, ljud, tjänster eller lagring finns. [Exakt import och configgissningar](../../upstream.md#passiv-luftballong-på-himlen-239).

## Kontroller

- `node tools/balloon-check.mjs`: schemafönstrets gränser, mjuk in-/uttoning och negativ tid; deterministisk cirkel och renderingsmatris; aktiv rörelse; instrumenterad tidig retur utanför fönstret som inte får läsa kamera/position/scale eller anropa matrisarbete; avstånds-/garagegräns; en opersonlig mesh utan raycast, skugga, textur, barn eller fysik-/tjänste-/lagringskoppling. Geometri 996 trianglar, ett material och ett ritanrop.
- `npm test` och `npm run build`: gröna (117 JS-moduler kontrollerade, importgraf, publik innehålls-/lagrings-/nätgräns, två planritningar och appidentitet).
- `node tools/balloon-view-check.mjs http://localhost:8911 docs/verification/239` via delat browserlås: verklig publikapp, +1 draw/+996 trianglar, cirka 17,478 m rörelse på fem sekunder, exakt samma position efter omladdning vid samma Date.now. Off-window-retur fungerar även med kamera-Proxy som kastar på varje läsning; ingen world.balloon finns. Originalets local/sessionStorage-sentineler är orörda och inga externa anrop eller sidfel finns. Äldre `&balloon` kringgår inte tidsfönstret.

Första kameran stod under en trädkrona. Dess funktionella mätning och omladdningskontroll är giltiga i `result.json`, men dess skymda bild används inte som synlighetsbevis. `CAPTURE_ONLY=1` använder en markpunkt med fri sikt snett upp mot ballongen och gör endast bild/drawkontroll på oförändrad produktkälla. `capture-result.json` och `park-sky.png` är slutligt synlighetsbevis. Bildfixturen aktiverar tillfälligt ballongens vanliga Three-raycast och kräver att ballongen är första synliga träff i hela scenen, därefter återställs dess icke-klickbara raycast. Ingen extra enhetsprofil eller bred testsvit kördes.

## Avgränsning och bild

Slutvyn mäter 44→45 ritanrop och 445 382→446 378 trianglar: +1 draw/+996 tri i samma kamera med ballongen dold/visad.

`park-sky.png` är en egen bild från faktisk publikscen, visuellt granskad. Kameran står på publik markhöjd +1,6 m och tittar upp på den regnbågsfärgade ballongen i normal fast belysning. Klockan låses till 2026-11-01 00:05 UTC, inne i ett riktigt schemalagt fönster; publikens säsongsval är juni. Ingen produkt-debugparameter krävs.

Perioden är 40 minuter, med 36 minuters synlighet och 25 sekunders mjuk in-/uttoning. Radie 100 m och hastighet 3,5 m/s behålls. Två dokumenterade visuella configgissningar anpassar originalets molnhöjd: floor 250→90 m och far 900→400 m för publikens dimma 200–650 m/kamera 700 m. Övrig geometri och regnbågsfält behålls. Geometrin byggs en gång; utanför fönstret sker inget position-/skal-/matrisarbete i update och lokal matrixAutoUpdate är avstängd.

Chromium 1248/SwiftShader, 1280×800. Ingen fysisk telefon eller hårdvaruprestanda påstås. Kameran placeras genom befintlig scenfixture; ingen genomspelad promenad behövs för denna himmelsdekor. Inga byggnads-, mark- eller navigationsmått ändras; A/B/C/L-layoutsvep är inte tillämpligt.
