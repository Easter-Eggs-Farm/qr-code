// Fonctions pures, sans acces au DOM : ce module doit rester importable par node --test.

/** Total pour une quantite de boites, arrondi au centime. */
export function computeTotal(quantity, pricePerBox) {
  return Math.round(quantity * pricePerBox * 100) / 100;
}

/** Montant destine a PayPal : deux decimales, point decimal impose. */
export function formatAmount(amount) {
  return amount.toFixed(2);
}

/** Montant destine a l'affichage : convention francaise. */
export function formatDisplayAmount(amount) {
  return `${amount.toFixed(2).replace(".", ",")} €`;
}

/** Valeurs par defaut de config.js, a remplacer avant mise en ligne. */
export const PLACEHOLDERS = {
  website: "https://example.com",
  paypalPrefix: "PSEUDO_PAYPAL_",
};

/**
 * Normalise un pseudo PayPal saisi a la main : enleve un "@" ou un prefixe
 * "paypal.me/" en tete, et les espaces superflus. N'encode PAS l'URL.
 */
export function normalizePaypalHandle(raw) {
  let handle = String(raw ?? "").trim();
  if (handle.startsWith("@")) {
    handle = handle.slice(1);
  }
  handle = handle.replace(/^https:\/\/paypal\.me\//i, "").replace(/^paypal\.me\//i, "");
  return handle.trim();
}

/** Vrai si le vendeur a un vrai pseudo PayPal, pas un placeholder. */
export function isSellerConfigured(seller) {
  const pseudo = normalizePaypalHandle(seller?.paypalMe ?? "");
  return pseudo.length > 0 && !pseudo.startsWith(PLACEHOLDERS.paypalPrefix);
}

/** Vrai si l'URL du site a ete renseignee. */
export function isWebsiteConfigured(config) {
  const url = config?.websiteUrl ?? "";
  return url.length > 0 && url !== PLACEHOLDERS.website;
}

/**
 * Construit le lien de paiement PayPal.me avec le montant pre-rempli.
 * Format impose par PayPal : point decimal, deux decimales, devise collee.
 */
export function buildPaypalUrl(seller, quantity, config) {
  if (!isSellerConfigured(seller)) {
    throw new Error(`Vendeur non configure : ${seller?.id ?? "inconnu"}`);
  }
  const total = computeTotal(quantity, config.pricePerBox);
  const handle = encodeURIComponent(normalizePaypalHandle(seller.paypalMe));
  return `https://paypal.me/${handle}/${formatAmount(total)}${config.currency}`;
}

/**
 * Verifie les champs de config.js qui influencent directement le montant paye.
 * Retourne un tableau d'erreurs (vide = config valide). Ne lance jamais
 * d'exception : c'est a l'appelant de decider quoi faire d'une config invalide.
 */
export function validateConfig(config) {
  const errors = [];
  const c = config ?? {};

  if (typeof c.pricePerBox !== "number" || !Number.isFinite(c.pricePerBox) || c.pricePerBox <= 0) {
    errors.push("pricePerBox doit etre un nombre positif");
  }
  if (!Number.isInteger(c.maxQuantity) || c.maxQuantity <= 0) {
    errors.push("maxQuantity doit etre un entier positif");
  }
  if (!Number.isInteger(c.boxSize) || c.boxSize <= 0) {
    errors.push("boxSize doit etre un entier positif");
  }
  if (typeof c.currency !== "string" || c.currency.length === 0) {
    errors.push("currency doit etre une chaine non vide");
  }
  if (!Array.isArray(c.sellers) || c.sellers.length === 0) {
    errors.push("sellers doit etre un tableau non vide");
  }

  return errors;
}
