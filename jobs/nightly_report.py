# nattlig rapport: summerar dagens betalda ordrar. körs av cron på driftservern.
import os, sys, datetime
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src", "legacy"))
from price_calc import _get_connection, calc_price

dag = sys.argv[1] if len(sys.argv) > 1 else datetime.date.today().isoformat()
conn = _get_connection()
cur = conn.cursor()
cur.execute("select id from orders where status = 'paid' and created_at::date = %s::date", (dag,))
summa = 0
antal = 0
for (oid,) in cur.fetchall():
    p = calc_price(oid)
    summa += p.total
    antal += 1
conn.close()
print("%s: %d betalda ordrar, totalt %s kr" % (dag, antal, summa))
