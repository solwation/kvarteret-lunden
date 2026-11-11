# Orkesterkärnan v0.12.0, #265

Ärende: [public #265](https://github.com/solwation/kvarteret-lunden/issues/265),
motsvarande [original #1904](https://github.com/solwation/lunden-3d-apartment/issues/1904).

## Källor och omfattning

Installerat före import: v0.11.2 `6151b2e887ce4587285271708affc07af09fddb6`.
Granskad exakt källa: v0.12.0 `9e7c6e388df0ebdd25c0ba76d3debc73de3c41fa` från
[officiella releasen](https://github.com/solwation/dirigenten-och-orkestern/releases/tag/v0.12.0).
[Hela mellandiffen](https://github.com/solwation/dirigenten-och-orkestern/compare/6151b2e887ce4587285271708affc07af09fddb6...9e7c6e388df0ebdd25c0ba76d3debc73de3c41fa)
omfattar v0.11.3 (bildhosting), v0.11.4 (Markdown/HTTPS och egna bildstycken) samt
v0.12.0 (valfri expertpanel). Importen är en squashsubtree med bevarad mergeancestry
och `git-subtree-*`-trailers. Ingen originalappkod eller originalhistorik importeras.

Endast det gemensamma instruktionsträdet och lokal dokumentation ändras.
Värdens main-regel och befintliga bild-/leveranskrav går före generella hostingsexempel.
Ingen resursgren eller extern lagring införs. Expertpanelen aktiveras inte som krav.
Original-först, public-low, föräldratak, ägarskap, tvåarbetarkapacitet, timers,
publica innehålls-/lagrings-/tjänstegränser och stängningsgrindar bevaras.

## Verifiering

Verifierat i isolerad ext4-kopia på Linux med Python 3 och Node 22.
- Subtree-innehållet har exakt samma Git-träd som källreleasen:
  `0a766b02b018eb2cb186e3451297694042ec9c5a`. Importmergen har två föräldrar och
  squashcommitten behåller `git-subtree-dir` samt `git-subtree-split` till rätt SHA.
- `python3 .orchestra/shared/scripts/check-links.py`: 763 relativa länkar/ankare i
  81 spårade Markdownfiler passerar.
- `npm test`: 139 moduler granskade, importkedjan paketeras, två planritningar,
  same-origin-nätpolicy och app-/ikonidentitet passerar.
- `npm run build`: passerar, innehållsversion `2e57cebe2a63705414e288e4`.
- Hela diffen, `git diff --check` och scenariogranskning passerar: ett bildresultat
  behöver fortsatt värdens evidens/publicering; generella hostingsexempel ger ingen
  rätt att skapa resursgrenar. En ködränering använder ordinarie sessionsgranskning
  utan obligatorisk panel. En väntande integration behåller sin ägare och tar ingen
  aktiv slot; original-först och public-low gäller fortfarande.

## Begränsningar och uppföljning

Dokumentarbete saknar meningsfullt visuellt produktresultat: inga nya produktbilder,
browserprov eller changelog behövs. Ingen appfunktion eller fysisk enhet påstås vara
nytestad. Integrationsägaren granskar diff/evidens, publicerar till main och verifierar
den faktiska Pages-körningen före avslut. Pages-resultatet länkas i ärendet.
