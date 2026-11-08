---
name: tdd
description: Genomför ett utvecklingssteg ur docs/plan.md med testet först. Anrop: /tdd <steg>
---

Du ska genomföra följande steg ur planen: $Arguments

Arbeta alltid i denna strikta ordning och hoppa aldrig över något steg:
1. Läs `docs/plan.md` och förstå steget. Läs källkoden som berörs.
2. Skriv ett nytt test i `tests/` för det nya beteendet. Rör INTE koden i `src/` ännu.
3. Kör `npm test` och visa att det nya testet blir rött (misslyckas av rätt anledning).
4. Skriv den MINSTA koden i `src/` som får testet att bli grönt.
5. Kör `npm test` igen. Hela testsviten ska passera och bli grön.
6. Visa `git diff` och vänta på mänsklig granskning. Gör aldrig `git commit` automatiskt.
