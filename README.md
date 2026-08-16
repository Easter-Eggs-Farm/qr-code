# Easter Eggs — page de vente des oeufs

Micro-ferme : on eleve quelques poules dans le jardin, en bio, et on vend le
surplus d'oeufs aux voisins pour payer le grain. Ce depot contient la page
web atteinte en scannant le QR code colle sur les boites.

Le nom du projet joue sur les deux sens du mot : l'oeuf de poule, et l'easter
egg cache dans un logiciel.

## Comment ca marche

1. L'acheteur scanne le QR code en forme d'oeuf imprime sur la boite.
2. Il arrive sur cette page, qui lui propose deux choses :
   - consulter le site de la ferme (a venir) ;
   - payer ses oeufs, en choisissant lequel des deux vendeurs encaisse.
3. Il choisit le vendeur et le nombre de boites, voit le total se calculer,
   puis part sur PayPal avec le montant deja pre-rempli.

Page statique : pas de build, pas de dependance, pas de serveur. Elle est
servie telle quelle par GitHub Pages et devrait tenir des annees sans
maintenance.

## Le QR code

Le QR code a ete genere avec **QRCodeChimp**, sur le compte de Sigrid :

https://www.qrcodechimp.com/qr-code-generator-for-url/6a8051eebd722305be27c2fc

C'est un **QR code dynamique** : le motif imprime sur les boites ne contient
pas l'adresse de la page, mais celle d'un lien de redirection gere par
QRCodeChimp. L'URL de destination se change donc depuis le compte QRCodeChimp,
sans jamais reimprimer les etiquettes.

Consequence pratique : quand l'adresse de la page change (mise en ligne,
changement de domaine), il faut mettre a jour la destination dans QRCodeChimp
— et rien d'autre.

Le fichier `assets/qr-code-egg.png` est l'artwork a imprimer sur les boites.
Il n'est pas utilise par la page elle-meme.

## Configurer

`config.js` **n'est pas versionne** : il contient les pseudos PayPal, qu'on
garde hors du depot. Le fichier versionne est `config.example.js`, qui sert de
modele.

En local, une seule fois :

```bash
cp config.example.js config.js
# puis renseigner les vraies valeurs dans config.js
```

En production, `config.js` est genere automatiquement au deploiement a partir
du modele et des Secrets du depot (voir la section Deployer).

> A savoir : ceci protege le **depot**, pas la page. Un site statique doit
> connaitre l'adresse `paypal.me/...` pour y envoyer l'acheteur : elle est donc
> forcement lisible dans la page publiee. Ce qu'on evite ici, c'est que les
> pseudos soient indexes par les moteurs de recherche et graves dans
> l'historique Git.

Les champs :

| Champ | Role |
|---|---|
| `websiteUrl` | Site de la ferme. Tant qu'il vaut `https://example.com`, le bouton reste affiche mais desactive, libelle "Site bientot disponible". Des qu'une vraie URL est mise, il devient "Voir le site" et cliquable. |
| `pricePerBox` | Prix d'une boite, en euros. |
| `boxSize` | Nombre d'oeufs par boite. |
| `maxQuantity` | Nombre maximum de boites commandables. |
| `sellers[].name` | Prenom affiche sur la carte. |
| `sellers[].paypalMe` | Pseudo PayPal.me **seul**, sans `paypal.me/` devant. Tant qu'il commence par `PSEUDO_PAYPAL_`, le vendeur est desactive. |

La page se protege des erreurs de saisie : un prix invalide ou un vendeur mal
configure desactive le paiement avec un message, plutot que d'envoyer un
acheteur vers un lien mort ou un mauvais montant.

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

Le deploiement est automatique : tout push sur `main` declenche le workflow
`.github/workflows/deploy.yml`, qui lance les tests, genere `config.js` a
partir des Secrets, puis publie sur GitHub Pages.

### A faire une seule fois

1. **Settings -> Pages -> Source : GitHub Actions** (et non "Deploy from a
   branch").
2. **Settings -> Secrets and variables -> Actions -> New repository secret**,
   creer :

   | Secret | Contenu | Requis |
   |---|---|---|
   | `PAYPAL_HANDLE_1` | Pseudo PayPal du premier vendeur | oui |
   | `PAYPAL_HANDLE_2` | Pseudo PayPal du second vendeur | oui |
   | `SELLER_NAME_1` | Prenom affiche du premier vendeur | oui |
   | `SELLER_NAME_2` | Prenom affiche du second vendeur | oui |
   | `WEBSITE_URL` | URL du site de la ferme | non, tant qu'il n'existe pas |

   Si un secret requis manque, le deploiement echoue au lieu de publier une
   page ou personne ne peut payer.

3. Recuperer l'URL `github.io` obtenue, et la mettre comme destination du QR
   code dynamique dans QRCodeChimp (lien plus haut).

Le QR code imprime n'est jamais modifie : seule la destination change.

### Changer un prix

Le prix n'est pas un secret : il vit dans `config.example.js`. On le modifie,
on pousse sur `main`, et le deploiement le reprend.

## Structure

| Fichier | Role |
|---|---|
| `index.html` | Les deux ecrans (accueil et paiement) et le sprite de la poule. |
| `style.css` | Theme, mise en page, animations du sprite. |
| `config.example.js` | Modele de configuration, versionne. Prix et reglages non sensibles. |
| `config.js` | Configuration reelle, **non versionnee**. Locale, ou generee au deploiement. |
| `scripts/build-config.mjs` | Genere `config.js` depuis le modele et les Secrets. |
| `.github/workflows/deploy.yml` | Tests, generation de config, publication sur Pages. |
| `logic.js` | Fonctions pures : calcul du total, URL PayPal, validation de config. Sans DOM, testable. |
| `app.js` | Cablage de l'interface. Le seul fichier qui touche au DOM. |
| `test/logic.test.js` | Tests de la logique liee a l'argent. |
| `assets/qr-code-egg.png` | Artwork du QR a imprimer sur les boites. |
