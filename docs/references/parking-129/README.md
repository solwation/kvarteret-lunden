# Källunderlag för parkeringen vid hus 46, #129

Fryst officiellt OSM-svar hämtat 2026-10-21:
[way 850235113, full](https://api.openstreetmap.org/api/0.6/way/850235113/full.json),
[lokal exakt JSON](850235113-full.json). Way-version 2, daterad 2023-02-19.
Koordinater, nodidentiteter, attribution och licens bevaras.

Råtaggarna är `amenity=parking` och `area=yes`. **Kapacitet, beläggning,
orientering och höjder saknas i råtaggarna.** Källconfigens 25 och tidigare
publicconfigens 18 är antaganden. De fjorton olika hörnen bildar en konkav
kontur; asfalt får inte utökas över dess indrag för att ge plats åt fler bilar.
Rutornas mått, antal och orientering samt körgång/infart ska beskrivas som *guess*
och följa hela bilrektanglar och fri sammanhängande passage.

Konturkandidat: originalcommit `03d4c5201004540769c51cf62b7272f0a2c3caaf`.
Originalets höjdarbete #1440 finns i `3d9618f9ec9716a630e51ccf402988c57beef542`,
med höjdhjälpare från `02e3fa8d86540e6b7406f3b0415c0cbb3aadbef5` (#1442).
Den hjälparen tonar höjdändringen inne i polygonen och dess separata layout är
anpassad till en annan fyrhörnig parkering. Den är därför ingen direkt verifiering
av denna publika apps fullständiga konkava civilplan och layout. Granskad
anpassning redovisas i [överföringsregistret](../../upstream.md) och
[verifieringen](../../verification.md). Inga personliga data eller spelberoenden
följer med källgranskningen.

Asfalt, civilplan, övergångar och detaljerad parkeringsplan utan inmätning är
antaganden; OSM-planpunkter ersätter inte befintliga höjdkällor eller husstöd.
API-länken kan ändras; filen ovan bevarar exakt granskat underlag.

Infarten granskas mot [officiellt way 850235114-svar](https://api.openstreetmap.org/api/0.6/way/850235114/full.json),
[fryst version 4](850235114-full.json). Den verkliga korta serviceanslutningen
mellan befintlig 36918924-nod och parkeringen hålls skild från tidigare lokala
modellkurvor som hade fel OSM-identitet. Way 850235115:s redan frysta
[version 2-svar från #128](../parking-128/850235115-full.json) återanvänds;
ingen dubbelhämtning behövs. De verkliga råvägarna anger asfalt och parkeringskörgång,
men deras bredd och exakta civilhöjder saknar inmätning och förblir antaganden.

© OpenStreetMap contributors. Kartdata omfattas av
[Open Database License 1.0](https://opendatacommons.org/licenses/odbl/1-0/).
Se [OSM:s attribution och copyright](https://www.openstreetmap.org/copyright).
