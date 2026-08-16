// Modele de configuration. C'est CE fichier qui est versionne ; config.js ne
// l'est pas, pour garder les pseudos PayPal hors du depot.
//
// En local : copier ce fichier en config.js et y mettre les vraies valeurs.
//   cp config.example.js config.js
//
// En production : le workflow GitHub Actions genere config.js a partir de ce
// modele en remplacant les valeurs sensibles par les Secrets du depot.
//
// Les valeurs non sensibles (prix, taille de boite, quantite max) se modifient
// ICI et sont reprises telles quelles au deploiement.
export const CONFIG = {
  // Tant que cette valeur vaut le placeholder, le bouton du site reste
  // affiche mais desactive, libelle "Site bientot disponible".
  websiteUrl: "https://example.com",

  pricePerBox: 2.5,
  boxSize: 6,
  currency: "EUR",
  maxQuantity: 12,

  // paypalMe = le pseudo seul. Un "@" ou un prefixe "paypal.me/" est tolere,
  // il sera nettoye automatiquement.
  sellers: [
    { id: "vendeur1", name: "Vendeur 1", paypalMe: "PSEUDO_PAYPAL_1" },
    { id: "vendeur2", name: "Vendeur 2", paypalMe: "PSEUDO_PAYPAL_2" },
  ],
};
