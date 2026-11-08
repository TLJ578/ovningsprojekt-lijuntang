# Migreringsplan: Prisberäkning i databasen (Expand / Contract)

## Syfte
Avveckla Python-modulen `src/legacy/price_calc.py` och låta Express-API:t lagra och läsa förberäknade priser direkt i PostgreSQL, i reversibla steg utan nertid.

## Steg

### Steg 1: Expand (Reversibelt)
- Utöka tabellen `orders` med tre nya kolumner:
  ```sql
  ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_net NUMERIC(10, 2);
  ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_vat NUMERIC(10, 2);
  ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_price NUMERIC(10, 2);
  ```
- Den gamla Python-modulen fortsätter att fungera oförändrad.
- *Hur det backas:* `ALTER TABLE orders DROP COLUMN total_net, DROP COLUMN total_vat, DROP COLUMN total_price;`.

### Steg 2: Dubbelskrivning (Reversibelt)
- Vid skapande av en ny order (`createOrder`) beräknas och sparas priserna direkt i de nya kolumnerna.
- Python-skriptet finns kvar som reserv.
- *Hur det backas:* Slå av en feature flag i `orderService.ts`.

### Steg 3: Bakfyllning av historiska ordrar (Reversibelt)
- Kör ett nattligt batchskript (`jobs/backfill_order_prices.ts`) som räknar ut priser för gamla ordrar och fyller i `NULL`-värden i de nya kolumnerna.

### Steg 4: Läsning från nya kolumner (Reversibelt)
- Ändra `GET /orders/:id/price` och `nightly_report.py` till att läsa direkt från `orders.total_price` i stället för att starta Python-processen.
- *Hur det backas:* Slå tillbaka flaggan till att läsa via `legacyPrice.ts`.

### Steg 5: Contract (Irreversibelt – utförs manuellt av människa)
- När systemet har körts felfritt i produktion i minst 14 dagar:
  1. Ta bort `src/legacy/price_calc.py`.
  2. Ta bort `src/pricing/legacyPrice.ts`.
  3. Ta bort tabellen `price_calc.log`.
