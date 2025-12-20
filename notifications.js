// notifications.js
import { isFinanciallyRelaxed } from "./budget.js";

const LS = {
  lastBillPhone: "lastBillPhone",
  lastBillGas: "lastBillGas",
  lastWeekendSurprise: "lastWeekendSurprise",
};

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function showLocalNotification(title, body) {
  // încearcă Notification API, fallback alert
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, { body });
  } else {
    alert(`${title}\n\n${body}`);
  }
}

export async function ensureNotificationPermission() {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  const p = await Notification.requestPermission();
  return p === "granted";
}

export function runMonthlyBillsChecks() {
  const now = new Date();
  const day = now.getDate();
  const key = todayKey();

  // 12 -> telefon/internet
  if (day === 12 && localStorage.getItem(LS.lastBillPhone) !== key) {
    showLocalNotification("Plată: Telefon + Internet", "Azi e 12. Verifică și plătește telefonul/internetul.");
    localStorage.setItem(LS.lastBillPhone, key);
  }

  // 24 -> gaz/curent
  if (day === 24 && localStorage.getItem(LS.lastBillGas) !== key) {
    showLocalNotification("Plată: Gaz + Curent", "Azi e 24. Verifică și plătește gazul și curentul.");
    localStorage.setItem(LS.lastBillGas, key);
  }
}

// Surpriză weekend: doar dacă ești “relaxed”
export function maybeWeekendSurprise(budgetResult) {
  const now = new Date();
  const dow = now.getDay(); // 0 duminică, 6 sâmbătă
  const key = todayKey();

  // trimitem doar vineri (5) sau sâmbătă (6)
  if (!(dow === 5 || dow === 6)) return;

  // o dată la câteva zile ca să nu spameze
  const last = localStorage.getItem(LS.lastWeekendSurprise);
  if (last) {
    const lastDate = new Date(last);
    const diffDays = Math.floor((now - lastDate) / (1000*60*60*24));
    if (diffDays < 5) return;
  }

  if (isFinanciallyRelaxed(budgetResult, 20)) {
    showLocalNotification(
      "Surpriză de weekend 🎉",
      "Arată bine săptămâna asta. Ai buget pentru o mică ieșire la ceva bun și ieftin, fără vină."
    );
    localStorage.setItem(LS.lastWeekendSurprise, key);
  }
}
