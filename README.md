# qr-code

Landing page atteinte en scannant le QR code en forme d'oeuf colle sur les
boites d'oeufs. Elle propose deux choses : consulter le site de la ferme, ou
payer ses oeufs via PayPal en choisissant lequel des deux vendeurs encaisse.

Page statique, sans build ni dependance, servie par GitHub Pages.

## Configurer

Tout se passe dans `config.js` — c'est le seul fichier a editer.

| Champ | Role |
|---|---|
| `websiteUrl` | Site de la ferme. Tant qu'il vaut `https://example.com`, le bouton "Voir le site" est masque. |
| `pricePerBox` | Prix d'une boite, en euros. |
| `boxSize` | Nombre d'oeufs par boite. |
| `maxQuantity` | Nombre maximum de boites commandables. |
| `sellers[].name` | Prenom affiche sur la carte. |
| `sellers[].paypalMe` | Pseudo PayPal.me **seul**, sans `paypal.me/` devant. Tant qu'il commence par `PSEUDO_PAYPAL_`, le vendeur est desactive. |

## Tester en local

Les ES modules ne se chargent pas en `file://`. Il faut un serveur :

```bash
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

Tests de la logique de calcul et des URLs PayPal :

```bash
npm test
```

## Deployer

1. Pousser sur `main`.
2. Dans les reglages GitHub du repo : Pages -> Source = branche `main`, dossier `/ (root)`.
3. Repointer le lien de redirection du QR vers l'URL `github.io` obtenue.

Le QR code imprime n'est jamais modifie : seule la cible de la redirection change.
