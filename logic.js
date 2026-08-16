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

/** Vrai si le vendeur a un vrai pseudo PayPal, pas un placeholder. */
export function isSellerConfigured(seller) {
  const pseudo = seller?.paypalMe ?? "";
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
  return `https://paypal.me/${seller.paypalMe}/${formatAmount(total)}${config.currency}`;
}
