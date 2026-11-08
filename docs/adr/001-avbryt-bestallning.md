# ADR 001: Mjuk avbokning av beställning inom 30 minuter

## Status
Beslutad

## Kontext
Enligt User Story 2 vill kunder kunna ångra eller avbryta en lagd beställning inom 30 minuter. Vi behövde besluta hur avbrytningen ska representeras i databasen och API:t.

## Alternativ som övervägdes
1. **Hård borttagning med SQL `DELETE FROM orders WHERE id = $1`:**
   - *Fördelar:* Enkelt att implementera.
   - *Nackdelar:* All orderhistorik försvinner. Omöjligt att spåra för ekonomi, lager eller kundtjänst. Bryter mot bokförings- och revisionsregler.
2. **HTTP DELETE `/orders/:id` med mjuk statusflagga:**
   - *Fördelar:* Följer generell REST-CRUD.
   - *Nackdelar:* `DELETE` signalerar ofta resursutradering. Kan förvirra klienter som förväntar sig att resursen försvinner helt vid efterföljande `GET`.
3. **Mjuk avbrytning via `POST /orders/:id/cancel` (Valt):**
   - *Fördelar:* Explicit RPC-liknande subresurs-URL som tydligt beskriver en tillståndsövergång. Bevarar alla rader i tabellen `orders` och sätter `status = 'cancelled'`.

## Beslut
Vi inför endpointen `POST /orders/:id/cancel` och sätter `status = 'cancelled'` om ordern är i status `'new'` och lades för högst 30 minuter sedan.

## Konsekvenser
- Revisionshistoriken bevaras till 100 %.
- Kundtjänst kan se vilka ordrar som avbrutits och när.
- API:t returnerar `400 Bad Request` med kod `too_late` om 30 minuter har passerat, eller `invalid_state` om ordern redan har skickats.
