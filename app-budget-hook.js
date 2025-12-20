// app-budget-hook.js
import { computeBudget } from "./budget.js";
import { runMonthlyBillsChecks, maybeWeekendSurprise, ensureNotificationPermission } from "./notifications.js";

const state = JSON.parse(localStorage.getItem("APP_STATE") || "{}");

const merged = {
  incomeWeekly: state.incomeWeekly ?? 565,
  foodWeekly: state.foodWeekly ?? 50,
  miscWeekly: state.miscWeekly ?? 0,

  rentMonthly: state.rentMonthly ?? 700,
  gasElectricMonthly: state.gasElectricMonthly ?? 220,
  phoneInternetMonthly: state.phoneInternetMonthly ?? 120,
  waterQuarterly: state.waterQuarterly ?? 240,

  debts: state.debts ?? [],
};

ensureNotificationPermission();

const result = computeBudget(merged);

// 🔗 legăm DIRECT de elementele tale existente
const foodLbl = document.getElementById("foodLbl");
const debtTargetLbl = document.getElementById("debtTargetLbl");
const freeLbl = document.getElementById("freeLbl");
const debtTargetBig = document.getElementById("debtTargetBig");
const debtStatus = document.getElementById("debtStatus");

if (foodLbl) foodLbl.textContent = result.essentialsW.toFixed(2) + " €";
if (debtTargetLbl) debtTargetLbl.textContent = result.minDebtsW.toFixed(2) + " €";
if (freeLbl) freeLbl.textContent = result.leftoverAfterMin.toFixed(2) + " €";

if (debtTargetBig) debtTargetBig.textContent = result.extraForDebts.toFixed(2) + " €";
if (debtStatus) {
  debtStatus.textContent = result.deficit > 0
    ? "⚠️ Ajustare necesară"
    : "✔️ Sub control";
}

// 🔔 notificări
runMonthlyBillsChecks();
maybeWeekendSurprise(result);
