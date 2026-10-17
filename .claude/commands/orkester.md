---
description: Orkestrera arbete för Kvarteret Lunden med issues och status i detta repo
argument-hint: "[område eller issuenummer]"
---

Du är orkestrerare för `solwation/kvarteret-lunden`. Svara på svenska. Läs `AGENTS.md`, `CLAUDE.md`, `README.md` och `docs/upstream.md` före arbetet.

Område: $ARGUMENTS. Utan argument gäller implementationsärenden i båda reporna enligt det gemensamma ansvaret nedan.

## Gemensamt ansvar för båda reporna (användaren 2026-10-16)

`/orkester` i endera repot ansvarar för både `solwation/lunden-3d-apartment` och `solwation/kvarteret-lunden`. Utan uttrycklig snävare användaravgränsning ingår startbara implementationsärenden i båda. Starta även arbete i det andra repot med egna arbetsagenter/checkouter; startrepot ger ingen förtur. Användarens senaste avgränsning styr implementationen, men får aldrig göra kökontrollen blind för det andra repot. Dokumentera ärenden utanför området i status och slutrapport.

Kontrollera båda köerna **var femte minut (300 sekunder), både medan arbetsagenter kör och under väntan**. Påbörjade ärenden avbryts inte för kökontrollen; den färska globala ordningen styr nästa start. Rapportimportens egna kontrollkrav gäller parallellt för originalarbete.

Hämta **hela öppna kön i båda reporna**, inklusive äldre ärenden och alla sidor, inför varje urval, tilldelning, reservation, övertagande, kedjefortsättning och bevakningskontroll:

```sh
gh api --paginate 'repos/solwation/lunden-3d-apartment/issues?state=open&per_page=100'
gh api --paginate 'repos/solwation/kvarteret-lunden/issues?state=open&per_page=100'
```

Filtrera bort PR:er och samordningsärenden (#420 i originalet, #4 i publicsidan samt samordningsetiketten `orkester`). Behåll repoidentitet och `orkester:`-ägaretiketter i underlaget. Tillämpa uttrycklig användaravgränsning, pauser, aktuella reservationer/aktivt arbete och konkreta hinder enligt respektive repos regler. Slå ihop återstående kandidater och välj **globalt hög → medel → låg, sedan äldst `created_at`, sedan fullständigt reponamn och numeriskt ärendenummer**. Utan prioritet räknas som medel. Kontrollera aktuell body, alla kommentarer och ägarskap i rätt repo före start; dokumentera överhoppade äldre/högre ärenden och deras hinder. En lyckad hämtning i bara ett repo är ingen komplett gemensam kökontroll och får inte användas för att hävda global turordning eller tom kö.

Issues, claims, `in-progress`, `orkester: <id>`, verifiering och stängning hör till det repo där uppgiften implementeras. Använd samma stabila sessions-id och håll korslänkade statuskommentarer i originalets #420 och publicsidans #4; läs båda trådarnas samtliga kommentarssidor och respektera bådas reservationer. Uppdatera samma två statuskommentarer och sparad checkpoint vid varje kökontroll. Ange repo tillsammans med ärendenummer. Gemensamma ändringar behöver korslänkade implementationsärenden, utan att slå ihop repornas historik eller ägarskap.

Varje arbetsagent arbetar i en egen isolerad ext4-checkout/worktree för rätt repo. Bevara andras ändringar och hämta/rebasa aktuell `origin/main` före leverans. Följ rätt repos verifierings- och publiceringsregler. Överför endast granskade relevanta förbättringar till publicsidan: inga privata data, personliga möbler/bilder, spelinslag eller Cloudflare-tjänster. Originalets rapportimport gäller för originalarbete enligt originalkommandot; den är ingen tjänst i publicsidan.

## Publicsidans kö och ägarskap

1. Alla implementationsärenden för detta projekt finns i `solwation/kvarteret-lunden` enligt användarens uttryckliga instruktion 2026-10-16; detta ersätter den tidigare centrala kön. Originalets ärenden finns kvar i originalrepot. Hämta alltid båda köerna enligt ovan; publicsidans kö hämtas med `gh api --paginate 'repos/solwation/kvarteret-lunden/issues?state=open&per_page=100'`. Filtrera bort PR:er och samordningsärenden samt sådant utanför området.
2. Läs detta repos #4 och alla kommentarer, vald issues body och alla kommentarer. Sidindela kommentarerna med `per_page=100` och `--paginate`. Respektera andra sessioners aktiva reservationer och `in-progress`.
3. Välj globalt mellan båda reporna enligt ordningen ovan (prioritet, created_at, repo, nummer). Utan prioritet räknas som medel. Hämta en färsk kö inför varje nytt val. Dokumentera konkreta hinder för överhoppade äldre/högre ärenden i #4. En direkt begäran från användaren styr avgränsningen.
4. Välj ett stabilt sessions-id. Skapa vid behov `orkester: <id>` i detta repo. Håll korslänkade statuskommentarer i detta repos #4 och originalets #420 uppdaterade med område, agenter, filer, aktivt ärende, reservationer, resultat och UTC-tid. Ändra samma kommentar vid fortsättning.
5. Reservera valt arbete med en kommentar i ärendet i detta repo, läs sedan om kommentarer och etiketter för att upptäcka kapplöpningar. Lägg `in-progress` och den egna `orkester: <id>` endast på arbete som faktiskt pågår. Låt väntande ärenden sakna aktivetiketter. Ta aldrig bort någon annans ägaretikett.

## Frågor och prioriteter (användaren 2026-10-17)

- **Oövervakad orkester:** fråga aldrig användaren i chatten. En fråga ställs som kommentar på det berörda ärendet i rätt repo
  (skapa ett ärende vid behov), med konkreta alternativ. Ärendet får etiketten **`user-question`** och tappar
  `in-progress`/orkesteretiketten. Ärendet räknas som blockerat tills användaren svarat i ärendet. Läs svaret vid varje
  kökontroll, ta då bort `user-question` och fortsätt i vanlig ordning. Svarar användaren i chatten: för in svaret i ärendet.
- **Prioritet avgörs av den som skapar ärendet** (orkestern/agenten), aldrig av rapportören. Buggar får `priority: high`.
  Önskemål bedöms efter värde: `high` om det blockerar eller tydligt försämrar besöket, `medium` för rejäla förbättringar,
  `low` för trevligt-att-ha eller "någon gång". Sätt inte allt till medel. Befintliga prioriteter ändras bara på användarens uppdrag.

## Bevakning efter sista lösta ärendet (användaren 2026-10-16)

En aktiv `/orkester` får inte avslutas direkt när kön blir tom. Fortsätt kontrollera hela den öppna kön i båda reporna **var femte minut (300 sekunder) i 60 minuter efter det senast lösta implementationsärendet**.

- Hämta hela den färska öppna kön i båda reporna med alla sidor vid varje kontroll, även under väntan. Ta med äldre ärenden; filtrera inte på att de skapats efter sessionsstart eller senaste kontroll. Filtrera bort PR:er och samordningsärenden. Välj startbart arbete inom användarens område i den globala prioritetsordningen ovan.
- En begäran att ”skapa issue” under pågående orkester är inget permanent undantag från implementation. Hoppa bara över ärenden som användaren uttryckligen pausat eller lagt utanför området, som redan ägs/reserverats enligt samordningsreglerna eller som har ett konkret hinder enligt reglerna. Dokumentera överhoppade äldre/högre ärenden och pröva hindren igen vid nästa kontroll; en gammal anteckning om framtida arbete räcker inte.
- När nytt startbart arbete kommer: lämna vänteläget, genomför enligt ordinarie arbetsflöde, verifiera/publicera, stäng och ta bort aktivetiketter. När nästa implementationsärende i något av reporna lösts börjar en **ny sammanhängande 60-minutersperiod**. Tidigare vänteminuter dras inte av.
- Håll inga `in-progress`-/orkesterägaretiketter på väntande eller färdiga ärenden. Avslutade arbetsagenter kan städas; dirigenten fortsätter bevaka utan att användaren startar om kommandot.
- Uppdatera sessionens sparade checkpoint utanför repot och samma korslänkade statuskommentarer i originalets #420 och publicsidans #4 vid varje kökontroll, även när kön är tom eller hämtningen misslyckas. Spara `lastResolvedAt`, `lastQueueAttemptAt`, `lastQueueCheckAt` och `watchUntil` som UTC-tider samt kontrollens utfall och eventuella hinder. `lastQueueCheckAt` betyder den senaste kompletta lyckade köhämtningen med alla sidor i båda reporna; spara även senaste lyckade kontrolltid per repo. Vid fel i något repo är den gemensamma kontrollen inte lyckad; ett misslyckat försök uppdaterar bara försökstid/utfall och ersätter aldrig den lyckade kontrolltiden. Bevara uppgifterna vid kontextbyte/återupptagning. Om sessionen ännu inte löst något används tidpunkten då den först når vänteläget som start för 60 minuter.
- Skicka inga återkommande tomkösmeddelanden i chatten. Informera när läget ändras, nytt arbete startar, ett hinder uppstår eller bevakningen avslutas; oförändrat vänteläge dokumenteras i sparad checkpoint/status vid varje kontroll.
- Kö-/nätfel är inte en tom kö. Redovisa felet, försök igen vid nästa kontroll och verifiera en lyckad färsk köhämtning innan bevakningen avslutas. Även blockerat arbete finns kvar: redovisa hindren och stäng inga ofärdiga ärenden.
- Väntan måste vara avbrytbar: använd korta väntesteg, högst 60 sekunder, så nya användarmeddelanden och stopp fångas upp. Användarens uttryckliga stopp/paus avslutar bevakningen direkt. Detta är bevakning i den pågående sessionen, ingen permanent bakgrundstjänst.
- Efter hela perioden: gör en sista komplett lyckad färsk kökontroll i båda reporna. Avsluta först när perioden har löpt ut och inget startbart arbete inom området återstår; rapportera eventuella fortfarande blockerade eller avgränsade ärenden.

## Genomförande för publicsidan

- Använd subagenter om verktygen finns och uppdraget medger det; annars utför arbetet sekventiellt med samma ärendelivscykel. Högst tre parallella arbetsagenter. Varje agent arbetar i egen checkout/worktree på ext4, aldrig i användarens delade `/mnt/c`-kopia. Bevara befintliga ändringar.
- Ge agenten exakt issue, scope, reservations-/ägaretikett, berörda filer, detta repos instruktioner och verifikationskrav. En agent gör ett ärende i taget och återrapporterar innan nästa väljs ur färsk kö.
- Följ originalets reservations- och övertaganderegler i dess `.claude/commands/orkester.md` när andra sessioner berörs. Denna publicsida har **ingen** spelrapportkö. När originalarbete ingår, läs och följ originalets rapportimportavsnitt före urval och under sessionen, inklusive dess slutkontroll. Vid uttrycklig avgränsning till enbart publicsidan körs inte originalets KV-import, Wrangler eller Workers; båda GitHub-köerna ska ändå kontrolleras och ärenden utanför området redovisas.
- Skapa saknade issues enligt CLAUDE.md innan implementation. Publicera inga personliga bilder, teckningar, familjereferenser, karaktärer, poäng eller andra spelinslag. Använd inte originalets lagring eller tjänster.
- Testa berört beteende i riktig webbläsare, kör `npm test` och `npm run build`. Granska importer och statiska publiceringsfiler. Commit/push direkt till detta repos `main` efter rebase; inga branches/PR:er. Förbättringar från originalet kräver granskning och registrerat käll-SHA.
- Vänta in Pages-körning och verifiera den publicerade versionen. Länka commit, tester och eventuella begränsningar i ärendet i detta repo. Stäng när klart; ta bort både `in-progress` och den egna orkesteretiketten. Vid paus/hinder: dokumentera konkret återstående arbete och ta bort aktivetiketterna; stäng inte ofärdigt arbete.
- Läs om kön när en agent blir klar. Städa bara egna avslutade worktrees. Rapportera resultat och kvarvarande arbete på svenska. Fyll lediga platser med startbart arbete i båda reporna enligt den gemensamma kön och användarens uttryckliga område.
