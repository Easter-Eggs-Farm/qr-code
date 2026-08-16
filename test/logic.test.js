import test from "node:test";
import assert from "node:assert/strict";
import {
  computeTotal,
  formatAmount,
  formatDisplayAmount,
  buildPaypalUrl,
  isSellerConfigured,
  isWebsiteConfigured,
} from "../logic.js";

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

const CONFIG_TEST = {
  websiteUrl: "https://ferme-exemple.fr",
  pricePerBox: 2.5,
  currency: "EUR",
};

const VENDEUR_OK = { id: "v1", name: "Alice", paypalMe: "alicelaferme" };
const VENDEUR_PLACEHOLDER = { id: "v1", name: "Vendeur 1", paypalMe: "PSEUDO_PAYPAL_1" };

test("buildPaypalUrl : format exact attendu par PayPal", () => {
  assert.equal(
    buildPaypalUrl(VENDEUR_OK, 3, CONFIG_TEST),
    "https://paypal.me/alicelaferme/7.50EUR"
  );
});

test("buildPaypalUrl : une seule boite", () => {
  assert.equal(
    buildPaypalUrl(VENDEUR_OK, 1, CONFIG_TEST),
    "https://paypal.me/alicelaferme/2.50EUR"
  );
});

test("buildPaypalUrl : jamais de virgule decimale", () => {
  assert.ok(!buildPaypalUrl(VENDEUR_OK, 3, CONFIG_TEST).includes(","));
});

test("isSellerConfigured : detecte un pseudo placeholder", () => {
  assert.equal(isSellerConfigured(VENDEUR_PLACEHOLDER), false);
  assert.equal(isSellerConfigured(VENDEUR_OK), true);
});

test("isSellerConfigured : rejette un pseudo vide", () => {
  assert.equal(isSellerConfigured({ paypalMe: "" }), false);
});

test("isWebsiteConfigured : detecte l'URL placeholder", () => {
  assert.equal(isWebsiteConfigured({ websiteUrl: "https://example.com" }), false);
  assert.equal(isWebsiteConfigured({ websiteUrl: "https://ferme-exemple.fr" }), true);
});

test("buildPaypalUrl : refuse un vendeur non configure", () => {
  assert.throws(() => buildPaypalUrl(VENDEUR_PLACEHOLDER, 1, CONFIG_TEST));
});
