# Public #272: automatisk orkesterstart

Vald neutral originalinstruktion: `94b8963a854a2e356d208a2100effb1f034b1d11`
(original #1934). Officiell kärna v0.13.1:
`78fb119b8b37e645a303f40b86551815fd5e095b`, uppdaterad från v0.12.0
`9e7c6e388df0ebdd25c0ba76d3debc73de3c41fa`.

Både fulla officiella releaser och versionstaggar kontrollerades färskt 2026-11-12;
v0.13.1 är senaste stabila semantiska version och taggen pekar på exakt granskad
releasecommit. Hela mellandiffen är läst: v0.12.1 privata bild-/dashboardrättigheter,
v0.13.0 dynamisk kapacitet/integrationsflöde och v0.13.1 värdstyrt ärendeintag.
Detta är ingen egen patch av vendorerad shared: officiellt `git subtree pull --squash`
bevarar publicens mergeancestry och git-subtree-dir/split-trailers. Det installerade
trädet är exakt releasecommitens rotträd enligt [import-/regelgranskningen](review.json).

AGENTS, CLAUDE, lokal projectpolicy, orkesteradapter och README säger nu samma sak: när
agenten registrerar/lägger till ett arbetsärende startar den värdens kösession om
ingen orkester kör, även efter avslutad idle, annars återanvänds den aktiva dirigenten.
”Skapa issue” ensam är inte uppskov. Uttryckligt scope, avgränsat uppdrag/pass,
registrera-bara/börja-inte, diskussion, uppskov och tidigare stopp går före.
Återanvändning av aktiv körning ändrar inte dess scope eller idledeadline bara för
att ett ärende tillkommer. Regeln hanteras av en redan aktiv agentsession; ingen
extern daemon/GitHub-hook som kan starta agent ur ingenting har installerats.

Två tillräckliga kontrollgrupper:

1. Hela core-/hostdiffen, exakt sharedträdpin och ancestry, lokal gräns och länkar
   granskade. Nio scenarier för första start, aktiv dirigent, avslutad idle, explicit
   scope, single-task/pass, issue-only-formulering, faktiskt uppskov/stopp, ingen
   agentsession och oförändrade bild-/publiceringsrättigheter. [Resultat](review.json).
   De 48 lokala ingångslänkarna har befintliga mål. Kärnans tidigare gröna
   versionsbundna länkgranskning återbrukas för exakt samma officiella träd.
2. Obligatoriska `npm test` (141 moduler) och `npm run build`
   (`0aadfeb6003f23b3cdf3b109`) passerar. Ingen src/modell/app-/lagrings-/tjänstkod
   ändras. Därför ingen ny browser, produktbild, triangelsvit eller spelarchangelog.
   Faktisk Pages för publicerad revision krävs före avslut.

Original före public/public low, prioritetstak, claims/handoffs, en integrationsägare,
300s-poll, 60min-watch, hjärtslag och ordinarie publiceringsgrindar bevaras. Lokalt
agentantal har en separat granskad ändring i public #273; #272 uppdaterar endast sin
egen föråldrade versionssammanfattning till en neutral hänvisning dit. Ingen personlig
originaldata, gameplay, originalets lagring eller tjänst-/apphistorik importeras.
Den generiska privata tokenbeskrivningen ger inte nya krav på publika bildlänkar,
och expertpanelen förblir valfri.

En oberoende read-only granskning bekräftade 50 lokala länkar inklusive 20 ankare och samstämmiga fyra agentingångar. Den upptäckte ett kvarvarande gammalt v0.8.2/scoped-only-stycke i README; endast detta instruktionsstycke uppdaterades till aktuell exakt pin och samma intag/undantag. Appens källor och tidigare gröna fastchecks är oförändrade.
