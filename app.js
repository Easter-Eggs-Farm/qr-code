import { CONFIG } from "./config.js";
import {
  computeTotal,
  formatDisplayAmount,
  buildPaypalUrl,
  isSellerConfigured,
  isWebsiteConfigured,
  validateConfig,
} from "./logic.js";

const el = (id) => document.getElementById(id);

// Etat de l'ecran de paiement.
let selectedSeller = null;
let quantity = 1;

// Config invalide (prix pas un nombre, quantite max manquante, etc.) : on
// n'essaie surtout pas de "reparer" a la volee, on affiche l'erreur et on
// bloque le paiement.
const configErrors = validateConfig(CONFIG);
const configValid = configErrors.length === 0;

// --- Ecran d'accueil ---------------------------------------------------

function setupHome() {
  if (!configValid) {
    el("price-note").textContent = "Configuration invalide, voir un administrateur.";
  } else {
    el("price-note").textContent =
      `${formatDisplayAmount(CONFIG.pricePerBox)} la boite de ${CONFIG.boxSize}`;
  }

  const website = el("btn-website");
  if (isWebsiteConfigured(CONFIG)) {
    website.href = CONFIG.websiteUrl;
    website.textContent = "Voir le site";
    website.removeAttribute("aria-disabled");
  } else {
    // Le site n'existe pas encore. On garde le bouton visible pour annoncer
    // qu'il arrive, mais sans href : pas de lien mort.
    website.removeAttribute("href");
    website.setAttribute("aria-disabled", "true");
    website.textContent = "Site bientot disponible";
  }

  el("btn-goto-pay").addEventListener("click", () => showScreen("pay"));
  el("btn-back").addEventListener("click", () => showScreen("home"));
}

function showScreen(name) {
  el("screen-home").classList.toggle("hidden", name !== "home");
  el("screen-pay").classList.toggle("hidden", name !== "pay");
  window.scrollTo(0, 0);
}

// --- Vendeurs ----------------------------------------------------------

function setupSellers() {
  if (!configValid) {
    el("pay-warning").textContent =
      "Configuration invalide, voir un administrateur.";
    el("pay-warning").classList.remove("hidden");
    return;
  }

  const container = el("sellers");

  for (const seller of CONFIG.sellers) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "seller";
    btn.textContent = seller.name;
    btn.setAttribute("aria-pressed", "false");
    btn.disabled = !isSellerConfigured(seller);
    btn.addEventListener("click", () => selectSeller(seller));
    container.appendChild(btn);
  }

  const configuredCount = CONFIG.sellers.filter(isSellerConfigured).length;

  if (configuredCount === 0) {
    // Aucun vendeur n'a de vrai pseudo PayPal.
    el("pay-warning").classList.remove("hidden");
  } else if (configuredCount < CONFIG.sellers.length) {
    // Au moins un vendeur est encore un placeholder.
    el("pay-warning").textContent =
      "Certains vendeurs ne sont pas encore disponibles.";
    el("pay-warning").classList.remove("hidden");
  }
}

function selectSeller(seller) {
  selectedSeller = seller;
  const buttons = el("sellers").querySelectorAll(".seller");
  CONFIG.sellers.forEach((s, i) => {
    buttons[i].setAttribute("aria-pressed", String(s.id === seller.id));
  });
  render();
}

// --- Quantite ----------------------------------------------------------

function setupQuantity() {
  el("qty-minus").addEventListener("click", () => changeQuantity(-1));
  el("qty-plus").addEventListener("click", () => changeQuantity(+1));
}

function changeQuantity(delta) {
  if (!configValid) return;
  quantity = Math.min(CONFIG.maxQuantity, Math.max(1, quantity + delta));
  render();
}

// --- Rendu -------------------------------------------------------------

function render() {
  if (!configValid) {
    // Config cassee : jamais de montant, jamais de lien PayPal.
    const payBtn = el("btn-pay");
    payBtn.removeAttribute("href");
    payBtn.textContent = "Choisissez un vendeur";
    payBtn.setAttribute("aria-disabled", "true");
    return;
  }

  el("qty-value").textContent = String(quantity);
  el("qty-minus").disabled = quantity <= 1;
  el("qty-plus").disabled = quantity >= CONFIG.maxQuantity;

  const total = computeTotal(quantity, CONFIG.pricePerBox);
  const boites = quantity > 1 ? "boites" : "boite";
  el("summary").textContent =
    `${quantity} ${boites} = ${formatDisplayAmount(total)}`;

  const payBtn = el("btn-pay");
  const ready = selectedSeller !== null && isSellerConfigured(selectedSeller);

  if (ready) {
    payBtn.href = buildPaypalUrl(selectedSeller, quantity, CONFIG);
    payBtn.textContent = `Payer ${formatDisplayAmount(total)} via PayPal`;
    payBtn.removeAttribute("aria-disabled");
  } else {
    payBtn.removeAttribute("href");
    payBtn.textContent = "Choisissez un vendeur";
    payBtn.setAttribute("aria-disabled", "true");
  }
}

try {
  setupHome();
  setupSellers();
  setupQuantity();
  render();
} catch (err) {
  // Filet de securite : quoi qu'il arrive, le bouton payer reste bloque.
  // (voir aussi l'etat par defaut de #btn-pay dans index.html)
  console.error("Erreur d'initialisation :", err);
  const payBtn = el("btn-pay");
  if (payBtn) {
    payBtn.removeAttribute("href");
    payBtn.setAttribute("aria-disabled", "true");
  }
  const warning = el("pay-warning");
  if (warning) {
    warning.textContent = "Configuration invalide, voir un administrateur.";
    warning.classList.remove("hidden");
  }
}
