// budget.js
const n = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
export const monthlyToWeekly = (m) => (n(m) * 12) / 52;
export const quarterlyToWeekly = (q) => (n(q) * 4) / 52;

export function compute(state) {
  const fixedW =
    monthlyToWeekly(state.rentMonthly) +
    monthlyToWeekly(state.gasElectricMonthly) +
    monthlyToWeekly(state.phoneInternetMonthly) +
    monthlyToWeekly(state.aptDebtsMonthly) +
    quarterlyToWeekly(state.waterQuarterly);

  const minDebtsW = state.debts.reduce((s, d) => s + n(d.minWeekly), 0);

  const essentialsW = fixedW + n(state.foodWeekly) + n(state.miscWeekly);
  const leftW = n(state.incomeWeekly) - essentialsW - minDebtsW;

  return {
    fixedW,
    minDebtsW,
    leftW,
    deficit: leftW < 0 ? Math.abs(leftW) : 0,
    extraForDebts: Math.max(0, leftW),
  };
}

export function relaxed(result, minExtraWeekly = 20) {
  return result.deficit === 0 && result.extraForDebts >= minExtraWeekly;
}
