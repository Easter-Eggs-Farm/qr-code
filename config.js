// Source de verite unique du projet.
// C'est le SEUL fichier a editer pour changer un prix, un vendeur ou l'URL du site.
export const CONFIG = {
  // Tant que cette valeur vaut le placeholder, le bouton "Voir le site" est masque.
  websiteUrl: "https://example.com",

  pricePerBox: 2.5,
  boxSize: 6,
  currency: "EUR",
  maxQuantity: 12,

  // Remplacer name et paypalMe par les vraies valeurs avant la mise en ligne.
  // paypalMe = le pseudo seul, sans "paypal.me/" devant.
  sellers: [
    { id: "vendeur1", name: "Vendeur 1", paypalMe: "PSEUDO_PAYPAL_1" },
    { id: "vendeur2", name: "Vendeur 2", paypalMe: "PSEUDO_PAYPAL_2" },
  ],
};
