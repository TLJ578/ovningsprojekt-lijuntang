# Granskning av agentgenererad kod (Utdelat PR)

## 1. Säkerhetsbrist (Säkerhet)
- **Rad:** Rad 34 i det granskade PR-förslaget.
- **Problem:** SQL-injektion vid sökning av kunder:
  `"SELECT * FROM customers WHERE email = '" + req.query.email + "'"`
- **Varför det är en brist:** En användare kan skicka in `' OR '1'='1` och dumpa alla kunders personuppgifter eller radera tabeller.
- **Kontroll i riggen som stoppat den:** ESLint-regel `security/detect-non-literal-fs-filename` eller en arkitekturhook som kräver parametriserade frågor (`$1, $2`).

## 2. Strukturell brist (Struktur)
- **Rad:** Rad 82 i PR.
- **Problem:** N+1-problemet med databasfrågor inuti en loop:
  `for (const order of customerOrders) { const lines = await db.query(...); }`
- **Varför det är en brist:** Om kunden har 100 ordrar skickas 101 separata frågor över nätverket till PostgreSQL i stället för en enda samlad fråga med `JOIN` eller `WHERE order_id IN (...)`.
- **Kontroll i riggen som stoppat den:** Subagenten `granskare` som flaggar loopade databasanrop och bristande relationseffektivitet.

## 3. Kodstandardsbrist (Kodstandard)
- **Rad:** Rad 12 i PR.
- **Problem:** Variabel med typen `any` och kvarglömd felsökningsutskrift:
  `console.log("Hittade order:", orderId)`
- **Varför det är en brist:** Tappar typsäkerhet i TypeScript och skräpar ner i produktionsloggarna.
- **Kontroll i riggen som stoppat den:** TypeScript-kompilatorn med `noImplicitAny: true` samt vår `Stop`-hook som blockerar kvarglömda `console.log` med exitkod 2.

## 4. Jämförelse: Automatik vs Människa
- **Vad automatiken hittade:** Typfel, syntax, Prettier-formatering och `console.log`.
- **Vad bara människan hittade:** Saknad behörighetskontroll (`customerId` kontrollerades inte mot inloggad användare i anropet), vilket hade tillåtit vem som helst att läsa andras ordrar trots helt gröna tester!
