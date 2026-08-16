import test from "node:test";
import assert from "node:assert/strict";
import { computeTotal, formatAmount, formatDisplayAmount } from "../logic.js";

test("computeTotal : une boite au prix courant", () => {
  assert.equal(computeTotal(1, 2.5), 2.5);
});

test("computeTotal : trois boites", () => {
  assert.equal(computeTotal(3, 2.5), 7.5);
});

test("computeTotal : arrondit a deux decimales malgre les flottants", () => {
  // 3 * 0.1 vaut 0.30000000000000004 en virgule flottante.
  assert.equal(computeTotal(3, 0.1), 0.3);
});

test("formatAmount : force deux decimales", () => {
  assert.equal(formatAmount(7.5), "7.50");
  assert.equal(formatAmount(2.5), "2.50");
  assert.equal(formatAmount(12), "12.00");
});

test("formatAmount : utilise un point decimal, jamais une virgule", () => {
  assert.ok(!formatAmount(7.5).includes(","));
});

test("formatDisplayAmount : convention francaise pour l'affichage", () => {
  assert.equal(formatDisplayAmount(7.5), "7,50 €");
  assert.equal(formatDisplayAmount(2.5), "2,50 €");
});
