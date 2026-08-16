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
