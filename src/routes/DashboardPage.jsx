import { useMemo, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
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

  // Итоговый результат: прибыль минус все расходы
  const netResult = totals.incomeProfit - totals.variableExpenses - totals.fixedExpenses;
  const isPositive = netResult >= 0;

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
      .slice(0, 6);
  }, [incomesInRange, state.employees]);

  // Данные для круговой диаграммы доходов по клиентам
  const incomeByClientData = useMemo(() => {
    const map = new Map();
    incomesInRange.forEach((i) => {
      const clientName = state.clients.find((c) => c.id === i.clientId)?.name || "Без клиента";
      map.set(clientName, (map.get(clientName) || 0) + (Number(i.amount) || 0));
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Топ 8 клиентов
  }, [incomesInRange, state.clients]);

  // Данные для круговой диаграммы расходов по категориям
  const expensesByCategoryData = useMemo(() => {
    const map = new Map();
    variableInRange.forEach((e) => {
      const categoryName = state.expenseCategories.find((c) => c.id === e.categoryId)?.name || "Без категории";
      map.set(categoryName, (map.get(categoryName) || 0) + (Number(e.amount) || 0));
    });
    // Добавляем постоянные расходы как отдельную категорию
    if (state.fixedExpenses.length > 0) {
      const fixedTotal = sumBy(state.fixedExpenses, (e) => e.amount);
      if (fixedTotal > 0) {
        map.set("Постоянные расходы", (map.get("Постоянные расходы") || 0) + fixedTotal);
      }
    }
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Топ 8 категорий
  }, [variableInRange, state.fixedExpenses, state.expenseCategories]);

  // Цвета для графиков
  const COLORS = [
    "#2563eb", "#22c55e", "#eab308", "#f97316", "#ef4444",
    "#8b5cf6", "#06b6d4", "#ec4899", "#84cc16", "#14b8a6"
  ];

  const [chartType, setChartType] = useState("incomes"); // "incomes" | "expenses"

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
          <h3 style={{ marginTop: 0 }}>Финансовые итоги</h3>
          <p>Общий доход: {totals.incomeAmount.toLocaleString()}</p>
          <p>Общая прибыль: {totals.incomeProfit.toLocaleString()}</p>
          <p>Разовые расходы: {totals.variableExpenses.toLocaleString()}</p>
          <p>Постоянные расходы: {totals.fixedExpenses.toLocaleString()}</p>
          <div
            style={{
              marginTop: "16px",
              padding: "12px",
              borderRadius: "8px",
              backgroundColor: isPositive ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
              border: `1px solid ${isPositive ? "rgba(34, 197, 94, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
            }}
          >
            <div style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "4px" }}>
              Итоговый результат:
            </div>
            <div
              style={{
                fontSize: "20px",
                fontWeight: "600",
                color: isPositive ? "#22c55e" : "#ef4444",
              }}
            >
              {isPositive ? "+" : ""}
              {netResult.toLocaleString()}
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
              {isPositive ? "В плюсе" : "В минусе"} на {Math.abs(netResult).toLocaleString()}
            </div>
          </div>
        </div>
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ margin: 0 }}>
              {chartType === "incomes" ? "Доходы по клиентам" : "Расходы по категориям"}
            </h3>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="button"
                onClick={() => setChartType("incomes")}
                className={chartType === "incomes" ? "tab active" : "tab"}
                style={{
                  padding: "6px 12px",
                  fontSize: "14px",
                }}
              >
                Доходы
              </button>
              <button
                type="button"
                onClick={() => setChartType("expenses")}
                className={chartType === "expenses" ? "tab active" : "tab"}
                style={{
                  padding: "6px 12px",
                  fontSize: "14px",
                }}
              >
                Расходы
              </button>
            </div>
          </div>
          {chartType === "incomes" ? (
            incomeByClientData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart style={{ outline: "none" }}>
                  <Pie
                    data={incomeByClientData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    style={{ outline: "none" }}
                  >
                    {incomeByClientData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} style={{ outline: "none" }} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name, props) => {
                      const itemName = props.payload?.name || name;
                      return [`${value.toLocaleString()} ₽`, itemName];
                    }}
                    labelFormatter={(label) => label}
                    labelStyle={{
                      color: "#ffffff",
                    }}
                    contentStyle={{
                      backgroundColor: "var(--bg-secondary)",
                      border: "1px solid var(--border-color-light)",
                      borderRadius: "8px",
                      color: "#ffffff",
                      outline: "none",
                    }}
                    itemStyle={{
                      color: "#ffffff",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ textAlign: "center", color: "var(--text-secondary)", padding: "40px 0" }}>
                Нет данных за выбранный период
              </p>
            )
          ) : (
            expensesByCategoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart style={{ outline: "none" }}>
                  <Pie
                    data={expensesByCategoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    style={{ outline: "none" }}
                  >
                    {expensesByCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} style={{ outline: "none" }} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name, props) => {
                      const itemName = props.payload?.name || name;
                      return [`${value.toLocaleString()} ₽`, itemName];
                    }}
                    labelFormatter={(label) => label}
                    labelStyle={{
                      color: "#ffffff",
                    }}
                    contentStyle={{
                      backgroundColor: "var(--bg-secondary)",
                      border: "1px solid var(--border-color-light)",
                      borderRadius: "8px",
                      color: "#ffffff",
                      outline: "none",
                    }}
                    itemStyle={{
                      color: "#ffffff",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ textAlign: "center", color: "var(--text-secondary)", padding: "40px 0" }}>
                Нет данных за выбранный период
              </p>
            )
          )}
        </div>
      </div>

      <div className="grid two">
        <div className="card">
          <h3 style={{ marginTop: 0 }}>ТОП клиентов</h3>
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
          <h3 style={{ marginTop: 0 }}>ТОП исполнителей</h3>
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

