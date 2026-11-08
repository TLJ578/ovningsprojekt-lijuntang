# Plan: Avbryta beställning inom 30 minuter (User story 2)

## Bakgrund
Kunder ska kunna avbryta en lagd order inom 30 minuter via `POST /orders/:id/cancel` med headern `X-Customer-Id`.

## Steg (Test först, npm test efter varje steg)

1. **Test för lyckad avbrytning:**
   - Lägg till test i `tests/orders.test.ts` som skapar/hämtar en order med status `'new'` och anropar `POST /orders/:id/cancel`.
   - Förvänta HTTP 200 och att ordern har `status: "cancelled"`.
   - Verifiera rött test.

2. **Implementera `cancelOrder` i `src/services/orderService.ts`:**
   - Kontrollera att ordern finns (annars `not_found`).
   - Kontrollera att `order.customerId === customerId` (annars `forbidden`).
   - Kontrollera att `status === 'new'` (annars `invalid_state`).
   - Kontrollera att ordern lades för <= 30 minuter sedan (annars `too_late`).
   - Uppdatera ordern med SQL: `UPDATE orders SET status = 'cancelled' WHERE id = $1 RETURNING ...`.

3. **Exponera endpoint i `src/routes/orders.ts`:**
   - Registrera `POST /orders/:id/cancel` med `requireCustomer`.
   - Kör `npm test` och bekräfta grönt test.

4. **Tester för felhantering och gränsfall:**
   - Test för `400 too_late` när ordern är äldre än 30 minuter.
   - Test för `403 forbidden` när en annan kund försöker avbryta.
   - Test för `404 not_found` för okänt id.
   - Test för `400 invalid_state` om ordern redan är skickad eller avbruten.

5. **Granskning och verifiering:**
   - Kör subagenten `granskare`.
   - Kör `npm run lint` och `npm run typecheck`.
   - Granska diffen och committa.
