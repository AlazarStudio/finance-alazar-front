import { useMemo, useState } from "react";
import DateRangeFilter from "../components/Filters/DateRangeFilter.jsx";
import Table from "../components/Table/Table.jsx";
import { useAppStore } from "../store/AppStoreContext.jsx";
import { isWithinRange } from "../utils/date.js";
import { sumBy } from "../utils/math.js";

function DashboardPage() {
  const { state } = useAppStore();
  const [filters, setFilters] = useState({ from: "", to: "" });

  const incomesInRange = useMemo(
    () => state.incomes.filter((i) => isWithinRange(i.date, filters.from, filters.to)),
    [state.incomes, filters]
  );

  const variableInRange = useMemo(
    () => state.variableExpenses.filter((e) => isWithinRange(e.date, filters.from, filters.to)),
    [state.variableExpenses, filters]
  );

  const totals = {
    incomeAmount: sumBy(incomesInRange, (i) => i.amount),
    incomeProfit: sumBy(incomesInRange, (i) => i.profit),
    variableExpenses: sumBy(variableInRange, (e) => e.amount),
    fixedExpenses: sumBy(state.fixedExpenses, (e) => e.amount),
  };

  const topClients = useMemo(() => {
    const map = new Map();
    incomesInRange.forEach((i) => {
      map.set(i.clientId, (map.get(i.clientId) || 0) + (Number(i.amount) || 0));
    });
    return Array.from(map.entries())
      .map(([clientId, amount]) => ({
        client: state.clients.find((c) => c.id === clientId)?.name || "Без клиента",
        amount,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [incomesInRange, state.clients]);

  const topEmployees = useMemo(() => {
    const map = new Map();
    incomesInRange.forEach((i) => {
      // Поддержка нового формата с массивом сотрудников
      if (i.employees && Array.isArray(i.employees)) {
        i.employees.forEach((emp) => {
          const employeeId = emp.employeeId;
          map.set(employeeId, (map.get(employeeId) || 0) + (Number(i.profit) || 0));
        });
      } else if (i.employeeId) {
        // Обратная совместимость со старым форматом
        map.set(i.employeeId, (map.get(i.employeeId) || 0) + (Number(i.profit) || 0));
      }
    });
    return Array.from(map.entries())
      .map(([employeeId, profit]) => ({
        employee: state.employees.find((e) => e.id === employeeId)?.fullName || "Без исполнителя",
        profit,
      }))
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 5);
  }, [incomesInRange, state.employees]);

  return (
    <div>
      <div className="page-header">
        <h2>Общий отчёт</h2>
      </div>
      <DateRangeFilter
        from={filters.from}
        to={filters.to}
        onChangeFrom={(v) => setFilters({ ...filters, from: v })}
        onChangeTo={(v) => setFilters({ ...filters, to: v })}
      />

      <div className="grid two">
        <div className="card">
          <h3>Финансовые итоги</h3>
          <p>Общий доход: {totals.incomeAmount.toLocaleString()}</p>
          <p>Общая прибыль: {totals.incomeProfit.toLocaleString()}</p>
          <p>Разовые расходы: {totals.variableExpenses.toLocaleString()}</p>
          <p>Постоянные расходы: {totals.fixedExpenses.toLocaleString()}</p>
        </div>
        <div className="card">
          <h3>Комментарий</h3>
          <p>
            Здесь суммируются доходы и прибыль за выбранный период. Постоянные расходы считаются как
            полная сумма всех записей, а разовые — только попавшие в выбранный период.
          </p>
        </div>
      </div>

      <div className="grid two">
        <div className="card">
          <h3>ТОП клиентов</h3>
          <Table
            data={topClients}
            rowKey={(row, idx) => `${row.client}-${idx}`}
            columns={[
              { label: "Клиент", key: "client" },
              { label: "Доход", render: (row) => Number(row.amount || 0).toLocaleString() },
            ]}
          />
        </div>
        <div className="card">
          <h3>ТОП исполнителей</h3>
          <Table
            data={topEmployees}
            rowKey={(row, idx) => `${row.employee}-${idx}`}
            columns={[
              { label: "Исполнитель", key: "employee" },
              { label: "Прибыль", render: (row) => Number(row.profit || 0).toLocaleString() },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;

