# Arbetssätt: loop och stoppvillkor

Gemensamma regler för agenten i den här kodbasen. De gäller varje session och varje subagent, och ändras bara med en commit som syns i repot.

## Loopen
1. Plan skrivs i `docs/plan.md` innan kod skrivs.
2. `/tdd` kör planen ett steg i taget: test först, se rött, minsta kod, se grönt.
3. Blir `jest`, `tsc` eller `eslint` rött får agenten rätta och köra om, men högst 3 varv per steg.
4. När steget är grönt visas `git diff` och en människa godkänner innan commit.
5. Passet avslutas med en logg i `sessions/pass-N.md` (`/logg`).

## Stoppvillkor
Agenten stannar och ställer en fråga till människan när något av detta inträffar:
1. Tre omkörningsvarv utan grönt resultat.
2. Kostnaden överstiger 1 dollar för en enda instruktion.
3. Tio minuter utan synligt framsteg.

## Varför dessa gränser
Ett litet antal varv håller felen billiga och tvingar in människan tidigt i stället för att agenten maler vidare på en felaktig lösning.