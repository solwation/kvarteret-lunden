---
description: Orkestrera arbete för Kvarteret Lunden med issues och status i detta repo
argument-hint: "[område eller issuenummer]"
---

Du är orkestrerare för `solwation/kvarteret-lunden`. Svara på svenska. Läs `AGENTS.md`, `CLAUDE.md`, `README.md` och `docs/upstream.md` före arbetet.

Område: $ARGUMENTS. Utan argument gäller öppna ärenden som uttryckligen avser Kvarteret Lunden, inte hela originalets spelkö.

## Gemensam kö och ägarskap

1. Alla implementationsärenden för detta projekt finns i `solwation/kvarteret-lunden` enligt användarens uttryckliga instruktion 2026-10-16; detta ersätter den tidigare kön här. Läs hela den öppna kön med `gh api --paginate 'repos/solwation/kvarteret-lunden/issues?state=open&per_page=100'`. Filtrera bort PR:er och samordningsärenden samt sådant utanför området.
2. Läs detta repos #4 och alla kommentarer, vald issues body och alla kommentarer. Sidindela kommentarerna med `per_page=100` och `--paginate`. Respektera andra sessioners aktiva reservationer och `in-progress`.
3. Välj hög → medel → låg, äldst först inom nivån (created_at, sedan nummer). Utan prioritet räknas som medel. Hämta en färsk kö inför varje nytt val. Dokumentera konkreta hinder för överhoppade äldre/högre ärenden i #4. En direkt begäran från användaren styr avgränsningen.
4. Välj ett stabilt sessions-id. Skapa vid behov `orkester: <id>` i detta repo. Håll en statuskommentar i detta repos #4 uppdaterad med område, agenter, filer, aktivt ärende, reservationer, resultat och UTC-tid. Ändra samma kommentar vid fortsättning.
5. Reservera valt arbete med en kommentar i ärendet i detta repo, läs sedan om kommentarer och etiketter för att upptäcka kapplöpningar. Lägg `in-progress` och den egna `orkester: <id>` endast på arbete som faktiskt pågår. Låt väntande ärenden sakna aktivetiketter. Ta aldrig bort någon annans ägaretikett.

## Bevakning efter sista lösta ärendet (användaren 2026-10-16)

En aktiv `/orkester` får inte avslutas direkt när kön blir tom. Fortsätt polla efter nya ärenden inom användarens område **var 60:e sekund i 60 minuter efter det senast lösta implementationsärendet**.

- Hämta hela den färska kön med sidindelning vid varje kontroll, även under väntan. Behåll prioritet, ägarskap och reservationer. Samordningsärenden räknas inte som arbete. Ärenden utanför användarens område eller uttryckligen endast skapade för framtiden startas inte automatiskt.
- När nytt startbart arbete kommer: lämna vänteläget, genomför enligt ordinarie arbetsflöde, verifiera/publicera, stäng och ta bort aktivetiketter. När nästa implementationsärende lösts börjar en **ny sammanhängande 60-minutersperiod**. Tidigare vänteminuter dras inte av.
- Håll inga `in-progress`-/orkesterägaretiketter på väntande eller färdiga ärenden. Avslutade arbetsagenter kan städas; dirigenten fortsätter bevaka utan att användaren startar om kommandot.
- Spara `lastResolvedAt`, `lastQueueCheckAt` och `watchUntil` som UTC-tider i sessionens checkpoint utanför repot och dess statuskommentar. Bevara dem vid kontextbyte/återupptagning. Om sessionen ännu inte löst något används tidpunkten då den först når vänteläget som start för 60 minuter.
- Kö-/nätfel är inte en tom kö. Redovisa felet, försök igen vid nästa kontroll och verifiera en lyckad färsk köhämtning innan bevakningen avslutas. Även blockerat arbete finns kvar: redovisa hindren och stäng inga ofärdiga ärenden.
- Väntan måste vara avbrytbar: använd korta väntesteg, högst 60 sekunder, så nya användarmeddelanden och stopp fångas upp. Användarens uttryckliga stopp/paus avslutar bevakningen direkt. Detta är bevakning i den pågående sessionen, ingen permanent bakgrundstjänst.
- Efter hela perioden: gör en sista färsk kökontroll. Avsluta först när perioden har löpt ut och inget startbart arbete inom området återstår; rapportera eventuella fortfarande blockerade eller avgränsade ärenden.

## Genomförande

- Använd subagenter om verktygen finns och uppdraget medger det; annars utför arbetet sekventiellt med samma ärendelivscykel. Högst tre parallella arbetsagenter. Varje agent arbetar i egen checkout/worktree på ext4, aldrig i användarens delade `/mnt/c`-kopia. Bevara befintliga ändringar.
- Ge agenten exakt issue, scope, reservations-/ägaretikett, berörda filer, detta repos instruktioner och verifikationskrav. En agent gör ett ärende i taget och återrapporterar innan nästa väljs ur färsk kö.
- Följ originalets reservations- och övertaganderegler i dess `.claude/commands/orkester.md` när andra sessioner berörs. Denna publicsida har **ingen** spelrapportkö; kör inte originalets KV-import, Wrangler, Workers eller molntjänster för ett uppdrag avgränsat till Kvarteret Lunden. En blandad originalsession följer originalets regler för originalarbetet.
- Skapa saknade issues enligt CLAUDE.md innan implementation. Publicera inga personliga bilder, teckningar, familjereferenser, karaktärer, poäng eller andra spelinslag. Använd inte originalets lagring eller tjänster.
- Testa berört beteende i riktig webbläsare, kör `npm test` och `npm run build`. Granska importer och statiska publiceringsfiler. Commit/push direkt till detta repos `main` efter rebase; inga branches/PR:er. Förbättringar från originalet kräver granskning och registrerat käll-SHA.
- Vänta in Pages-körning och verifiera den publicerade versionen. Länka commit, tester och eventuella begränsningar i ärendet i detta repo. Stäng när klart; ta bort både `in-progress` och den egna orkesteretiketten. Vid paus/hinder: dokumentera konkret återstående arbete och ta bort aktivetiketterna; stäng inte ofärdigt arbete.
- Läs om kön när en agent blir klar. Städa bara egna avslutade worktrees. Rapportera resultat och kvarvarande arbete på svenska. Starta inte orelaterad originalutveckling för att fylla lediga agentplatser.
