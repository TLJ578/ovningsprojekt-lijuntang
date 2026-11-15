# Pass 3: Slutkontroll inför inlämning

## Gjort
- Räddade `jobs/nightly_report.py`, som moderniseringen av `price_calc.py` hade brutit: skriptet importerade `conn` som inte längre finns som global. Det använder nu `_get_connection()` från `price_calc`, och datumfrågan är parametriserad (en strängbyggd SQL med `%` följde med från originalet).
- Lade till testet för `400 invalid_state` i `tests/orders.test.ts` (avbryta redan avbruten beställning) – det saknades trots att `docs/granskning.md` och API-kontraktet lovade det.
- Skärpte karakteriseringstest 3 i `tests/price_calc.test.ts`: det kontrollerar nu exakta värden (net 950,99 / vat 237,74 / total 1 188,73) så att _kapa-trunkeringen verkligen är fryst, inte bara typen av svaret. OBS `unit_price` är `NUMERIC(10,2)` – 0,999 i testet avrundades av databasen och testade ingenting.
- Skrev ner loop- och stoppvillkoren i `docs/arbetssatt.md` så att de ligger i repot och inte bara i chatten.
- Arbetsfördelningen pass 1–2 i två git worktrees (ny funktion resp. modernisering) för att inte blanda TypeScript- och Python-ändringar; det noteras här i loggen.

## Bevis
- `python -m py_compile`: OK på `jobs/nightly_report.py` och `src/legacy/price_calc.py`.
- `npm run typecheck` och `npm run lint`: OK.
- `npm test`: [för in antal passed efter körning mot butik_test – sviten borde nu vara 26 tester].
- Det här passet avslutar med taggen: `git tag inlamning && git push origin main --tags`.

## Kontrollerna under hela kursen (samlat från pass 1–2 och verktygsloggen)
Ca 19 fel stoppades innan commit: 12 typfel av `tsc` i PostToolUse-hooken, 3 kvarglömda `console.log` av Stop-hooken, 2 ändringsförsök i `.env` av PreToolUse-hooken och 2 logikfel på 30-minutersgränsen av supertest-testerna.

## Förbrukning
- Tokens: [för in tokens för passet]
- Kostnad (USD / SEK): [för in]

## Nästa
- Verifiera hela sviten mot `butik_test` och stäm av antalet tester mot loggen.
- Skapa och pusha taggen `inlamning` – sista steget före inlämning.
- Redovisning: kunna visa en hook som stoppar, återuppta från `sessions/pass-1.md` och förklara commit `b79060d`.