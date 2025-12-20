// storage.js
const KEY = "RUTINA_BUDGET_STATE_V1";

export function loadState() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "null") || null;
  } catch {
    return null;
  }
}

export function saveState(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}
