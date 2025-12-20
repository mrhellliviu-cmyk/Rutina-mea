// app.js
import { loadState, saveState } from "./storage.js";
import { compute } from "./budget.js";
import { askNotificationPermission, monthlyReminders, weekendSurprise } from "./notifications.js";

let deferredPrompt = null;

const defaultState = {
  incomeWeekly: 565,
  foodWeekly: 50,
  miscWeekly: 0,
  rentMonthly: 700,
  gasElectricMonthly: 220,
  phoneInternetMonthly: 120,
  waterQuarterly: 240,
  aptDebtsMonthly: 0,
  debts: [],
};

const state = loadState() || defaultState;

function $(id){ return document.getElementById(id); }

function syncInputs() {
  $("incomeWeekly").value = state.incomeWeekly;
  $("foodWeekly").value = state.foodWeekly;
  $("miscWeekly").value = state.miscWeekly;

  $("rentMonthly").value = state.rentMonthly;
  $("gasElectricMonthly").value = state.gasElectricMonthly;
  $("phoneInternetMonthly").value = state.phoneInternetMonthly;
  $("waterQuarterly").value = state.waterQuarterly;
  $("aptDebtsMonthly").value = state.aptDebtsMonthly;
}

function renderDebts() {
  const box = $("debtsList");
  box.innerHTML = "";

  if (!state.debts.length) {
    box.innerHTML = `<p class="muted">Nu ai introdus încă datorii.</p>`;
    return;
  }

  state.debts
    .slice()
    .sort((a,b)=> (a.priority||999)-(b.priority||999))
    .forEach((d, idx) => {
      const div = document.createElement("div");
      div.className = "debtItem";
      div.innerHTML = `
        <div>
          <b>${d.name}</b>
          <div class="small">Total: ${d.total}€ • Minim/săpt: ${d.minWeekly}€ • Prioritate: ${d.priority}</div>
        </div>
        <button class="btn" style="margin:0;background:#ef4444" data-i="${idx}">Șterge</button>
      `;
      div.querySelector("button").addEventListener("click", () => {
        state.debts.splice(idx, 1);
        saveState(state);
        renderAll();
      });
      box.appendChild(div);
    });
}

function renderBudget() {
  const r = compute(state);

  $("fixedW").textContent = r.fixedW.toFixed(2) + " €";
  $("minDebtsW").textContent = r.minDebtsW.toFixed(2) + " €";
  $("leftW").textContent = r.leftW.toFixed(2) + " €";

  $("status").textContent = r.deficit > 0 ? `⚠️ Lipsește ${r.deficit.toFixed(2)}€/săpt` : "✔ Sub control";

  // notificări
  monthlyReminders();
  weekendSurprise(r);
}

function onInput(id, key) {
  $(id).addEventListener("input", (e) => {
    state[key] = Number(e.target.value || 0);
    saveState(state);
    renderBudget();
  });
}

function renderAll() {
  syncInputs();
  renderDebts();
  renderBudget();
}

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  $("installBtn").style.display = "inline-block";
});

$("installBtn").addEventListener("click", async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  $("installBtn").style.display = "none";
});

// Add debt
$("addDebtBtn").addEventListener("click", () => {
  const name = $("debtName").value.trim();
  const total = Number($("debtTotal").value || 0);
  const minWeekly = Number($("debtMinWeekly").value || 0);
  const priority = Number($("debtPriority").value || 1);

  if (!name || total <= 0) return alert("Completează numele și totalul datoriei.");

  state.debts.push({ name, total, minWeekly, priority });
  saveState(state);

  $("debtName").value = "";
  $("debtTotal").value = "";
  $("debtMinWeekly").value = "";
  $("debtPriority").value = "1";

  renderAll();
});

// routine button
$("dayOkBtn").addEventListener("click", () => alert("Bravo. Ține-o așa."));

onInput("incomeWeekly", "incomeWeekly");
onInput("foodWeekly", "foodWeekly");
onInput("miscWeekly", "miscWeekly");
onInput("rentMonthly", "rentMonthly");
onInput("gasElectricMonthly", "gasElectricMonthly");
onInput("phoneInternetMonthly", "phoneInternetMonthly");
onInput("waterQuarterly", "waterQuarterly");
onInput("aptDebtsMonthly", "aptDebtsMonthly");

(async () => {
  await askNotificationPermission();
  renderAll();
})();
