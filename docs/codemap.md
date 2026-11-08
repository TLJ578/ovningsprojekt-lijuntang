# Codemap: src/legacy/price_calc.py

## Syfte
Beräknar nettosumma, moms (25 %) och totalsumma för en given beställning, inklusive eventuell rabattkod ur tabellen `discounts`.

## In och Ut
- **Indata:** `order_id` (heltal) som argument via kommandorad eller funktionsanrop.
- **Utdata:** JSON-sträng på stdout med `{ net: string, vat: string, total: string }` eller instans av klassen `Pris`.
- **Fel:** Returnerar `None` eller skriver JSON `{"error": "finns inte"}` och sätter processens exitkod till 1.

## Beroenden & Anropare
1. `src/pricing/legacyPrice.ts`: Anropar `price_calc.py` som en underprocess (subprocess) för endpointen `GET /orders/:id/price`.
2. `jobs/nightly_report.py`: Anropar modulen för att beräkna dagliga försäljningssiffror.
3. PostgreSQL-databasen via modulen `psycopg`.

## Sidoeffekter
- Skriver en loggrad med tidsstämpel, order_id och total till filen `src/legacy/price_calc.log`.

## Antaganden
- Moms är hårdkodad till 25 %.
- `_kapa(x)` kapar av decimaler (`Decimal(int(x * 100)) / 100`) utan matematisk eller bankavrundning. Ekonomiavdelningen har stämt av räkenskaperna mot detta specifika trunkeringsbeteende!

## Identifierade risker och brister
1. **SQL-injektion:** `cur.execute("select discount_code from orders where id = %s" % order_id)` och `cur.execute("select percent from discounts where code = '%s'" % kod)`.
2. **Global databasanslutning:** `conn` öppnas direkt vid modulimport, vilket gör modulen svårtestad och låser anslutningar.
3. **Dold filloggning:** Tyst `try/except: pass` döljer diskfel och gör funktionen oren.
