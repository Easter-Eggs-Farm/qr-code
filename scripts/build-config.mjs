// Genere config.js a partir de config.example.js en injectant les valeurs
// sensibles depuis l'environnement. Utilise par le workflow de deploiement.
//
// Le modele reste la source unique des valeurs non sensibles (prix, taille de
// boite, quantite max) : on ne remplace ici que les placeholders.
//
// Usage : node scripts/build-config.mjs
import { readFileSync, writeFileSync } from "node:fs";

const REMPLACEMENTS = [
  { placeholder: "PSEUDO_PAYPAL_1", variable: "PAYPAL_HANDLE_1", requis: true },
  { placeholder: "PSEUDO_PAYPAL_2", variable: "PAYPAL_HANDLE_2", requis: true },
  { placeholder: "Vendeur 1", variable: "SELLER_NAME_1", requis: true },
  { placeholder: "Vendeur 2", variable: "SELLER_NAME_2", requis: true },
  // Optionnel : tant qu'il n'est pas fourni, le bouton du site reste desactive.
  { placeholder: "https://example.com", variable: "WEBSITE_URL", requis: false },
];

let contenu = readFileSync("config.example.js", "utf8");
const manquants = [];

for (const { placeholder, variable, requis } of REMPLACEMENTS) {
  const valeur = process.env[variable];

  if (!valeur) {
    if (requis) manquants.push(variable);
    continue;
  }

  if (!contenu.includes(placeholder)) {
    throw new Error(
      `Placeholder "${placeholder}" introuvable dans config.example.js. ` +
        `Le modele a change sans que ce script soit mis a jour.`
    );
  }

  contenu = contenu.replaceAll(placeholder, valeur);
}

// On echoue bruyamment : un deploiement avec des placeholders produirait une
// page ou personne ne peut payer.
if (manquants.length > 0) {
  throw new Error(
    `Secrets manquants : ${manquants.join(", ")}. ` +
      `Les definir dans Settings -> Secrets and variables -> Actions.`
  );
}

writeFileSync("config.js", contenu);
console.log("config.js genere depuis config.example.js");
