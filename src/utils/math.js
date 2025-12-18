// Utility to calculate profit for an income record.
export function calculateProfit(income) {
  const amount = Number(income.amount) || 0;
  const taxAmount = Number(income.taxAmount) || 0;
  const npAmount = Number(income.npAmount) || 0;
  const internalCosts = Number(income.internalCosts) || 0;
  
  // Поддержка нового формата с массивом сотрудников
  let employeePayouts = 0;
  if (income.employees && Array.isArray(income.employees)) {
    employeePayouts = income.employees.reduce((sum, emp) => sum + (Number(emp.payoutAmount) || 0), 0);
  } else {
    // Обратная совместимость со старым форматом
    employeePayouts = Number(income.employeePayouts) || 0;
  }

  return amount - taxAmount - npAmount - internalCosts - employeePayouts;
}

export function sumBy(items, selector) {
  return items.reduce((acc, item) => acc + (Number(selector(item)) || 0), 0);
}



