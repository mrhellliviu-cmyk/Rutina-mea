// budget.js
export function monthlyToWeekly(m) { return (Number(m || 0) * 12) / 52; }
export function quarterlyToWeekly(q) { return (Number(q || 0) * 4) / 52; }

export function computeBudget(state) {
  const incomeW = Number(state.incomeWeekly || 0);
  const foodW = Number(state.foodWeekly || 0);
  const miscW = Number(state.miscWeekly || 0);

  const fixedW =
    monthlyToWeekly(state.rentMonthly) +
    monthlyToWeekly(state.gasElectricMonthly) +
    monthlyToWeekly(state.phoneInternetMonthly) +
    quarterlyToWeekly(state.waterQuarterly);

  const debts = Array.isArray(state.debts) ? state.debts : [];
  const minDebtsW = debts.reduce((s, d) => s + Number(d.minWeekly || 0), 0);

  // “nu rămân fără mâncare” = prioritizăm mâncarea
  const essentialsW = fixedW + foodW + miscW;
  const leftoverAfterMin = incomeW - essentialsW - minDebtsW;

  const deficit = leftoverAfterMin < 0 ? Math.abs(leftoverAfterMin) : 0;
  const extraForDebts = Math.max(0, leftoverAfterMin);

  // Plan simplu: extra pe prioritatea 1 (cea mai urgentă)
  const sorted = [...debts].sort((a,b) => Number(a.priority||999) - Number(b.priority||999));
  let extra = extraForDebts;
  const debtPlan = sorted.map(d => {
    const minW = Math.max(0, Number(d.minWeekly || 0));
    const remaining = Math.max(0, Number(d.total || 0));
    let add = 0;
    if (extra > 0 && remaining > 0) { add = extra; extra = 0; }
    return { ...d, payWeekly: minW + add };
  });

  return { incomeW, fixedW, essentialsW, minDebtsW, leftoverAfterMin, deficit, extraForDebts, debtPlan };
}

export function isFinanciallyRelaxed(result, minExtraWeekly = 20) {
  return result.deficit === 0 && result.extraForDebts >= minExtraWeekly;
}
