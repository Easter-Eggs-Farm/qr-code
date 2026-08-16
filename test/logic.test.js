import test from "node:test";
import assert from "node:assert/strict";
import {
  computeTotal,
  formatAmount,
  formatDisplayAmount,
  buildPaypalUrl,
  isSellerConfigured,
  isWebsiteConfigured,
  normalizePaypalHandle,
  validateConfig,
} from "../logic.js";
import { CONFIG } from "../config.js";

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

test("buildPaypalUrl : borne haute, 12 boites", () => {
  assert.equal(
    buildPaypalUrl(VENDEUR_OK, 12, CONFIG_TEST),
    "https://paypal.me/alicelaferme/30.00EUR"
  );
});

test("buildPaypalUrl : le suffixe vient de config.currency, pas d'une valeur en dur", () => {
  const url = buildPaypalUrl(VENDEUR_OK, 1, { ...CONFIG_TEST, currency: "USD" });
  assert.ok(url.endsWith("USD"));
  assert.ok(!url.endsWith("EUR"));
});

test("normalizePaypalHandle : enleve le prefixe paypal.me/", () => {
  assert.equal(normalizePaypalHandle("paypal.me/bob"), "bob");
  assert.equal(normalizePaypalHandle("https://paypal.me/bob"), "bob");
});

test("normalizePaypalHandle : enleve un @ en tete", () => {
  assert.equal(normalizePaypalHandle("@bob"), "bob");
});

test("normalizePaypalHandle : trim les espaces", () => {
  assert.equal(normalizePaypalHandle(" bob "), "bob");
});

test("buildPaypalUrl : normalise le pseudo avant de construire l'URL", () => {
  const variants = ["paypal.me/bob", "https://paypal.me/bob", "@bob", " bob "];
  for (const paypalMe of variants) {
    assert.equal(
      buildPaypalUrl({ id: "v", paypalMe }, 1, CONFIG_TEST),
      "https://paypal.me/bob/2.50EUR"
    );
  }
});

test("buildPaypalUrl : encode un pseudo contenant un espace, jamais d'espace brut", () => {
  const url = buildPaypalUrl({ id: "v", paypalMe: "bob dupont" }, 1, CONFIG_TEST);
  assert.ok(!url.includes(" "));
  assert.ok(url.includes("bob%20dupont"));
});

test("isSellerConfigured : detecte un placeholder meme avec un @ devant", () => {
  assert.equal(isSellerConfigured({ paypalMe: "@PSEUDO_PAYPAL_1" }), false);
});

test("validateConfig : rejette un pricePerBox en chaine", () => {
  const errors = validateConfig({ ...CONFIG, pricePerBox: "2.50" });
  assert.ok(errors.length > 0);
});

test("validateConfig : rejette un maxQuantity manquant", () => {
  const { maxQuantity, ...rest } = CONFIG;
  const errors = validateConfig(rest);
  assert.ok(errors.length > 0);
});

test("validateConfig : rejette un tableau sellers vide", () => {
  const errors = validateConfig({ ...CONFIG, sellers: [] });
  assert.ok(errors.length > 0);
});

test("validateConfig : accepte la vraie CONFIG du projet", () => {
  assert.deepEqual(validateConfig(CONFIG), []);
});
