# price_calc.py
# prisberakning for ordrar.
# Steg 1: Parametriserade SQL-frågor mot SQL-injektion
# OBS rör inte avrundningen (_kapa), ekonomi har stämt av mot den.

import os, sys, json, datetime
from decimal import Decimal
import psycopg

DB = os.environ.get("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/butik")
conn = psycopg.connect(DB, autocommit=True)

MOMS = 25
LOGG = os.path.join(os.path.dirname(__file__), "price_calc.log")


class Pris:
    def __init__(self, net, vat, total):
        self.net = net
        self.vat = vat
        self.total = total


def _kapa(x):
    # två decimaler, trunkering
    return Decimal(int(x * 100)) / 100


def calc_price(order_id):
    cur = conn.cursor()
    # Steg 1: Parametriserad fråga mot orders
    cur.execute("SELECT discount_code FROM orders WHERE id = %s", (order_id,))
    rad = cur.fetchone()
    if rad is None:
        return None
    kod = rad[0]

    # Steg 1: Parametriserad fråga mot order_lines
    cur.execute("SELECT quantity, unit_price FROM order_lines WHERE order_id = %s", (order_id,))
    summa = Decimal(0)
    for q, p in cur.fetchall():
        summa = summa + q * p

    # Steg 1: Parametriserad fråga mot discounts
    if kod:
        cur.execute("SELECT percent FROM discounts WHERE code = %s", (kod,))
        r = cur.fetchone()
        if r:
            summa = summa - summa * r[0] / 100

    net = _kapa(summa)
    vat = _kapa(net * MOMS / 100)
    total = net + vat

    try:
        f = open(LOGG, "a")
        f.write("%s %s %s\n" % (datetime.datetime.now().isoformat(), order_id, total))
        f.close()
    except:
        pass

    return Pris(net, vat, total)


if __name__ == "__main__":
    p = calc_price(int(sys.argv[1]))
    if p is None:
        print(json.dumps({"error": "finns inte"}))
        sys.exit(1)
    print(json.dumps({"net": str(p.net), "vat": str(p.vat), "total": str(p.total)}))