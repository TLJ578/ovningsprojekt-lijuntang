# Missat av min agent, hittat av andra (Seminarium PR 214)

Detta dokument analyserar de brister i PR 214 (`POST /orders/:id/returns`) som **min agent missade**, men som **kurskamraterna identifierade** under seminariets gruppdiskussion (Steg 5).

Dokumentet är förankrat i och synkroniserat med projektets inlämningsmall **`kursprojekt-d2-lijun`** (Lijun Tang, `github.com/TLJ578/ovningsprojekt-lijuntang`, tagg: `inlamning`), med särskild koppling till avsnitten om **Riggens delar (Sida 5)**, **Granskningslagren och Människans roll (Sida 7)**, **Mätningar (Sida 8)** samt **Riggen i ett team och risker (Sida 9)**.

---

## 1. Sammanställning från gruppdiskussionen (Steg 5)

Under seminariediskussionen jämfördes resultaten med kurskamraterna Fia, Tina och Patrik. Följande tre brister flaggades inte av min agent:

| # | Typ | Fil och rad i PR 214 | Vad bristen är | Vem som hittade den |
|---|---|---|---|---|
| 1 | **Struktur** | `src/services/returnService.ts:16` | **Risk för race condition / dubbelretur vid samtidiga anrop:** Tjänsten saknar radlåsning (`SELECT ... FOR UPDATE`) eller en unik databasbegränsning (`UNIQUE(order_id)`) i tabellen `returns`. Två samtidiga förfrågningar kan båda läsa ordern innan någon returpost har skapats, vilket leder till dubbla återbetalningar. | **Fia** |
| 2 | **Säkerhet** | `src/services/returnService.ts:32` | **API-nyckel exponeras i URL query parameter:** Frakttjänstens API-nyckel skickas som URL-parameter (`?key=${FRAKT_API_KEY}`) i stället för i en säker HTTP-header (`Authorization: Bearer <key>`). Query-parametrar sparas och exponeras i klartext i webbservrars, proxys och webbläsares accessloggar. | **Tina** |
| 3 | **Struktur** | `docs/api.md:13` | **Ofullständigt API-kontrakt i dokumentationen:** Ändringen i `docs/api.md` angav enbart statuskoden `201` och utelämnade helt specifikation av relevanta felfall (400, 401, 403, 404), vilket bryter mot projektets dokumentationskrav. | **Patrik** |

---

## 2. Grundorsaksanalys: Varför missade min agent dessa brister?

Analysen förklarar hur riggens arkitektur och avgränsningar i `kursprojekt-d2-lijun` påverkade resultatet:

### 1. Fias fynd: Samtidighet och race conditions i databasen
- **Hur min agent arbetade:** Subagenten `granskare` (`.claude/agents/granskare.md`) kördes på **Claude 3.5 Sonnet** (Sida 5 & 6 i mallen) med instruktioner inriktade på funktionell affärslogik, SQL-injektion och N+1-problem.
- **Varför det missades:** Granskaren analyserade källkoden som ett linjärt, sekventiellt flöde (`SELECT` följt av `INSERT`). Agenten simulerade inte samtidiga anrop och undersökte inte om PostgreSQL saknade transaktionell isolering eller radlåsning. Dessutom fanns inte skydd mot race conditions explicit omnämnt under *Databas* i `docs/standard.md`. Subagenten `arkitekt` (Opus), som har djupare resonemangsförmåga för databaskonstruktioner, kopplades enbart in på schemat och inte på tjänstelagrets samtidighet.

### 2. Tinas fynd: Transportmetod för API-nyckel (URL vs HTTP-header)
- **Hur min agent arbetade:** Min agent upptäckte visserligen att nyckeln var en hårdkodad hemlighet på rad 3 (`const FRAKT_API_KEY = "frakt_live_..."`) och flaggade den som ett allvarligt brott mot `docs/standard.md` under *Hemligheter och loggar*.
- **Varför det missades:** Agenten stannade vid att konstatera att nyckeln ska ligga i miljövariabler (`process.env`). Den reflekterade inte över nätverkstransporten på rad 32: att även om nyckeln läses från `.env` är det osäkert att skicka hemligheter i URL query-parametrar eftersom dessa exponeras i nätverksloggar. Riggens `PreToolUse`-hook (`skydda-filer.mjs`) och behörighetsreglerna i `.claude/settings.json` (`Read(./.env)` i `deny`) skyddar lokala miljöfiler, men kontrollerar inte hur externa URL-strängar konstrueras.

### 3. Patriks fynd: API-dokumentation och kontraktkonsistens
- **Hur min agent arbetade:** Min agent fokuserade sin analys på diffen i källkod och testfiler (`src/` och `tests/`).
- **Varför det missades:** Granskarens prompt i `.claude/agents/granskare.md` innehöll ingen instruktion om att verifiera samstämmighet mellan nya rutter och API-dokumentationen i `docs/api.md`. Agenten kontrollerade därför inte att dokumentationen saknade felkoder som 400, 401, 403 och 404, trots att projektets kodstandard kräver tydliga felkontrakt med `{ error: { code, message } }`.

---

## 3. Konkreta åtgärder i riggen (enligt mallens teamprincip)

I `kursprojekt-d2-lijun` (**Sida 9: Riggen i ett team**) fastslås teamets gyllene regel:
> *"Regel: uppstår samma fel två gånger, gör vi en hook eller en lintregel av det. Teamet äger riggen gemensamt i repot. Ändringar i hooks och regler görs med en pull request som en kollega granskar."*

Med utgångspunkt i denna princip genomförs följande förbättringar av riggen:

### Åtgärd 1: Skydd mot race conditions och databaslåsning (Fias fynd)
1. **Regel i `docs/standard.md` under Databas:**
   Lägg till kravet:
   > *"Vid finansiella transaktioner, utbetalningar och statusövergångar ska koden skydda mot race conditions antingen via explicit radlåsning (`SELECT ... FOR UPDATE`), transaktionell isolering, eller unika databasbegränsningar (t.ex. `UNIQUE(order_id)` i tabellen `returns`)."*
2. **Uppdatering av subagenterna `arkitekt` och `granskare`:**
   Komplettera `.claude/agents/granskare.md` och `.claude/agents/arkitekt.md` med en explicit kontrollpunkt för samtidighet:
   > *"Undersök strukturella problem: N+1-frågor, samt risk för race conditions och dubbeltransaktioner vid samtidiga anrop."*

### Åtgärd 2: Säker transport av hemligheter (Tinas fynd)
1. **Regel i `docs/standard.md` under Hemligheter och loggar:**
   Lägg till kravet:
   > *"API-nycklar, tokens och lösenord får aldrig skickas som URL query-parametrar i HTTP-anrop eftersom dessa loggas i klartext i servrars och proxys accessloggar. Autentiseringsuppgifter ska alltid skickas via standardiserade HTTP-headers (t.ex. `Authorization: Bearer <token>`)."*
2. **Instruktion i subagenten `granskare`:**
   Instruera granskaren att flagga externa API-anrop där URL-strängar byggs med nycklar (`?key=`, `?token=`, `?apiKey=`).

### Åtgärd 3: Kontraktsvalidering i dokumentation (Patriks fynd)
1. **Uppdatering av `.claude/agents/granskare.md`:**
   Lägg till en ny kontrollpunkt i granskarens instruktioner:
   > *"5. Dokumentation: Om rutter i `src/routes/` ändras eller tillkommer, kontrollera att `docs/api.md` är uppdaterad med fullständigt kontrakt inklusive alla relevanta statuskoder (både 200/201 och felfall som 400, 401, 403, 404)."*
2. **Koppling till `/tdd`:**
   Säkerställ att skillen `/tdd` (`.claude/skills/tdd/SKILL.md`) inleder varje byggsteg med att läsa och uppdatera kontraktet i `docs/api.md` innan testerna för nya svarskoder skrivs.

---

## 4. Slutsats och lärdomar för kursprojektet

Erfarenheterna från seminariet och gruppdiskussionen förstärker de centrala slutsatserna i `kursprojekt-d2-lijun`:

1. **Varför människan är Lager 5 i granskningen (Sida 7):**
   Automatiska verktyg (Prettier, `tsc`, ESLint) och AI-subagenter (Sonnet/Opus) är oumbärliga för att fånga typfel, syntax och explicita regelbrott. Men precis som redovisas på Sida 7 under *Vad bara jag hittade*:
   > *"Bara jag hittade: att anropet saknade behörighetskontroll (`order.customerId === req.customerId`), så vem som helst kunde läsa och avbryta andras beställningar trots helt gröna tester."*
   Agenten kan generera kod och tester som bekräftar dess egna snäva antaganden. Endast en människa med helhetsblick kan granska behörighet, samtidighet och affärsrisker före commit.

2. **Riggens iterativa utveckling i ett team (Sida 9):**
   En effektiv rigg är aldrig statisk. Genom att systematiskt dokumentera missade brister och omvandla dem till regler i `docs/standard.md`, subagentprompter och automatiserade hooks höjs lägstanivån för hela teamet inför framtida utvecklingspass.
