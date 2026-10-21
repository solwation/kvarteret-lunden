# Källunderlag för parkeringen väster om hus 41–43, #131

Fryst officiellt OSM-svar hämtat 2026-10-21:
[way 145221628, full](https://api.openstreetmap.org/api/0.6/way/145221628/full.json),
[lokal exakt JSON](145221628-full.json). Way-version 1, daterad 2012-01-12.
Originalets koordinater, noder, attribution och licens bevaras.

Råtaggen är endast `amenity=parking`. **Kapacitet, beläggning, orientering
och höjder saknas i råtaggarna.** Källconfigens 45 och tidigare publicconfigens
14 är modellantaganden. De sex olika hörnen bildar en konkav kontur; indraget
ska bevaras. Hela bilrutor, fri körning och verklig infart ska styra den användbara
layouten. Antal, asfalt och civilgradning utan inmätning förblir *guess*.

Neutral konturkandidat: originalcommit
`03d4c5201004540769c51cf62b7272f0a2c3caaf`.
Kartan ersätter inte befintliga höjdkällor, byggnadsfötter eller aproner. Den
konkreta infartens beroenden måste granskas mot verkliga gemensamma noder,
inte gamla felplacerade modellkurvors OSM-etiketter.
Anpassning och kontroll dokumenteras i [överföringsregistret](../../upstream.md)
och [verifieringen](../../verification.md). API-länken kan ändras; filen ovan
bevarar exakt granskad version.

© OpenStreetMap contributors. Kartdata omfattas av
[Open Database License 1.0](https://opendatacommons.org/licenses/odbl/1-0/).
Se [OSM:s attribution och copyright](https://www.openstreetmap.org/copyright).

Infarten är nu levererad av #116/#133: verklig 145221573 delar nod
1586523028 med 145221590 och ansluter till 30633546 via nod 1586523009.
Det frysta [infartsunderlaget](access-map.json) återanvänds utan ny hämtning.

Offentlig grundlayout: tre hela 2,5×5 m-rutor längs den intakta kanten 0–1,
med 0,10 m indrag och radcentrum 66 m längs kanten. Endast radkärnan får
ett gemensamt antaget höjdplan (cirka 5,07 %); en begränsad fyrameters
övergång inom konturen bevarar källgränsen och husens befintliga stöd.
Resten av den exakta sexhörningen är omarkerad asfalt och kör-/övergångsyta.
Samtliga aktuella vägars verkliga svepta bredder lämnas fria från bilrutor.
Ingen maximal kapacitet eller gemensam planhet för hela parkeringen påstås.
