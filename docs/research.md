# Research: Databas och endpoints för orderavbrytning

## Syfte
Undersöka hur ordrar lagras och hur vi bäst implementerar avbrytning inom 30 minuter.

## Kartläggning
- `db/schema.sql`: Tabellen `orders` har kolumnerna `id`, `customer_id`, `status` (default `'new'`), `discount_code`, `created_at` (default `now()`).
- Tidsstämpeln `created_at` sätts automatiskt vid insert och sparas med tidszon (`TIMESTAMPTZ`).
- `src/services/orderService.ts`: Funktionerna `createOrder` och `getOrder` returnerar typade `Result<Order>`.
- `src/routes/orders.ts`: Autentisering sker via Express-middleware `requireCustomer` som injicerar `customerId` i `req`.

## Riskbedömning
1. **Tidszonsförskjutning:** Beräkningen måste använda UTC eller databasens egen klocka (`now() - created_at`) för att undvika problem med sommartid/vintertid.
2. **Kapplöpningstillstånd (Race condition):** Om ordern skickas samtidigt som kunden avbryter. SQL-villkoret måste kräva `WHERE id = $1 AND status = 'new'`.
