import { calcPrice } from "../src/pricing/legacyPrice";
import { closeDb, resetDb } from "./helpers/db";
import { db } from "../src/db";

beforeEach(resetDb);
afterAll(closeDb);

describe("Karakteriseringstester: src/legacy/price_calc.py", () => {
  it("Test 1: Order 1042 utan rabatt ger exakt net: 950.00, vat: 237.50, total: 1187.50", async () => {
    const res = await calcPrice(1042);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(Number(res.value.net)).toBe(950);
      expect(Number(res.value.vat)).toBe(237.5);
      expect(Number(res.value.total)).toBe(1187.5);
    }
  });

  it("Test 2: Order med 10 % rabattkod ger korrekt avdragen summa", async () => {
    // Lägg till 10% rabattkod på order 1042
    await db.query("UPDATE orders SET discount_code = 'SOMMAR10' WHERE id = 1042");
    await db.query(
      "INSERT INTO discounts (code, percent) VALUES ('SOMMAR10', 10) ON CONFLICT DO NOTHING",
    );

    const res = await calcPrice(1042);
    expect(res.ok).toBe(true);
    if (res.ok) {
      // 950 - 10% = 855 net, vat 25% = 213.75, total = 1068.75
      expect(Number(res.value.net)).toBe(855);
      expect(Number(res.value.vat)).toBe(213.75);
      expect(Number(res.value.total)).toBe(1068.75);
    }
  });

  it("Test 3: _kapa() trunkerar decimaler strikt utan matematisk avrundning", async () => {
    // 950,00 + 0,99 = 950,99 → moms 237,7475 → _kapa trunkerar till 237,74 (avrundat vore 237,75)
    await db.query(
      "INSERT INTO order_lines (order_id, product, quantity, unit_price) VALUES (1042, 'Kabel', 1, 0.99)",
    );

    const res = await calcPrice(1042);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.net).toBe("950.99");
      expect(res.value.vat).toBe("237.74");
      expect(res.value.total).toBe("1188.73");
    }
  });

  it("Test 4: Ogiltigt order-id returnerar not_found / finns inte", async () => {
    const res = await calcPrice(999999);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("not_found");
    }
  });

  it("Test 5: Order med 0 rader eller tom order ger total 0", async () => {
    // Skapa en order utan order_lines
    const orderRes = await db.query("INSERT INTO orders (customer_id) VALUES (1) RETURNING id");
    const emptyOrderId = orderRes.rows[0].id;

    const res = await calcPrice(emptyOrderId);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(Number(res.value.total)).toBe(0);
    }
  });
});
