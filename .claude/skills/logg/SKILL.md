---
name: logg
description: Skapar eller uppdaterar sessionsloggen för det aktuella arbetspasset. Anrop: /logg <passnummer>
---

Skapa eller uppdatera filen `sessions/pass-$Arguments.md`.

Innehållet ska ha följande format:
# Pass $Arguments: [Kort rubrik om vad som gjordes]

## Gjort
- [Konkret sak 1 med filnamn]
- [Konkret sak 2 med filnamn]

## Bevis
- npm test: [antal passerade tester] passed
- commit: [commit-hash eller rubrik]
- Verifierade resultat

## Förbrukning
- Tokens: input / output
- Kostnad (USD / SEK)

## Nästa
- [Nästa tekniska steg]
- [Öppna frågor som kräver mänskligt beslut]
