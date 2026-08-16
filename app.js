import { CONFIG } from "./config.js";
import {
  computeTotal,
  formatDisplayAmount,
  buildPaypalUrl,
  isSellerConfigured,
  isWebsiteConfigured,
} from "./logic.js";

const el = (id) => document.getElementById(id);

// Etat de l'ecran de paiement.
let selectedSeller = null;
let quantity = 1;

// --- Ecran d'accueil ---------------------------------------------------

function setupHome() {
  el("price-note").textContent =
    `${formatDisplayAmount(CONFIG.pricePerBox)} la boite de ${CONFIG.boxSize}`;

  const website = el("btn-website");
  if (isWebsiteConfigured(CONFIG)) {
    website.href = CONFIG.websiteUrl;
  } else {
    // Le site n'existe pas encore : on masque plutot que d'offrir un lien mort.
    website.classList.add("hidden");
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

  // Si aucun vendeur n'a de vrai pseudo PayPal, on le dit explicitement.
  if (!CONFIG.sellers.some(isSellerConfigured)) {
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
  quantity = Math.min(CONFIG.maxQuantity, Math.max(1, quantity + delta));
  render();
}

// --- Rendu -------------------------------------------------------------

function render() {
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

setupHome();
setupSellers();
setupQuantity();
render();
