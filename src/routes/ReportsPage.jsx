import { useMemo, useState, useEffect } from "react";
import InputField from "../components/Forms/InputField.jsx";
import SelectField from "../components/Forms/SelectField.jsx";
import AutocompleteSelectField from "../components/Forms/AutocompleteSelectField.jsx";
import MultiSelectField from "../components/Forms/MultiSelectField.jsx";
import Table from "../components/Table/Table.jsx";
import TableColumnSettings from "../components/Table/TableColumnSettings.jsx";
import { useAppStore } from "../store/AppStoreContext.jsx";
import { formatDate, isWithinRange } from "../utils/date.js";
import * as XLSX from "xlsx";

const STORAGE_KEY_FILTERS = "reports-filters";
const STORAGE_KEY_COLUMNS_INCOMES = "reports-columns-incomes";
const STORAGE_KEY_COLUMNS_EXPENSES = "reports-columns-expenses";

function ReportsPage() {
  const { state } = useAppStore();

  // Загружаем фильтры из localStorage
  const loadFilters = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FILTERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          reportType: parsed.reportType || "general",
          dateFrom: parsed.dateFrom || "",
          dateTo: parsed.dateTo || "",
          selectedClients: parsed.selectedClients || [],
          selectedEmployees: parsed.selectedEmployees || [],
          dataType: parsed.dataType || "incomes", // incomes, expenses, both
        };
      }
    } catch (e) {
      console.error("Failed to load filters", e);
    }
    return {
      reportType: "general",
      dateFrom: "",
      dateTo: "",
      selectedClients: [],
      selectedEmployees: [],
      dataType: "incomes",
    };
  };

  const initialFilters = loadFilters();

  const [reportType, setReportType] = useState(initialFilters.reportType);
  const [dateFrom, setDateFrom] = useState(initialFilters.dateFrom);
  const [dateTo, setDateTo] = useState(initialFilters.dateTo);
  const [selectedClients, setSelectedClients] = useState(initialFilters.selectedClients);
  const [selectedEmployees, setSelectedEmployees] = useState(initialFilters.selectedEmployees);
  const [dataType, setDataType] = useState(initialFilters.dataType);
  const [incomesVisibleColumns, setIncomesVisibleColumns] = useState({});
  const [expensesVisibleColumns, setExpensesVisibleColumns] = useState({});

  // Сохраняем фильтры в localStorage при изменении
  useEffect(() => {
    const filters = {
      reportType,
      dateFrom,
      dateTo,
      selectedClients,
      selectedEmployees,
      dataType,
    };
    localStorage.setItem(STORAGE_KEY_FILTERS, JSON.stringify(filters));
  }, [reportType, dateFrom, dateTo, selectedClients, selectedEmployees, dataType]);

  const clientOptions = state.clients.map((c) => ({ value: c.id, label: c.name }));
  const employeeOptions = state.employees.map((e) => ({ value: e.id, label: e.fullName }));

  const filteredIncomes = useMemo(() => {
    let filtered = state.incomes.filter((income) => {
      if (!isWithinRange(income.date, dateFrom, dateTo)) return false;
      
      if (reportType === "client" && selectedClients.length > 0) {
        if (!selectedClients.includes(income.clientId)) return false;
      }
      
      if (reportType === "employee" && selectedEmployees.length > 0) {
        // Поддержка нового формата с массивом сотрудников
        if (income.employees && Array.isArray(income.employees)) {
          const hasSelectedEmployee = income.employees.some((emp) => 
            selectedEmployees.includes(emp.employeeId)
          );
          if (!hasSelectedEmployee) return false;
        } else if (income.employeeId) {
          // Обратная совместимость со старым форматом
          if (!selectedEmployees.includes(income.employeeId)) return false;
        } else {
          return false;
        }
      }
      
      return true;
    });

    if (reportType === "client" && selectedClients.length > 0) {
      filtered = filtered.filter((income) => selectedClients.includes(income.clientId));
    }
    
    if (reportType === "employee" && selectedEmployees.length > 0) {
      filtered = filtered.filter((income) => {
        if (income.employees && Array.isArray(income.employees)) {
          return income.employees.some((emp) => selectedEmployees.includes(emp.employeeId));
        } else if (income.employeeId) {
          return selectedEmployees.includes(income.employeeId);
        }
        return false;
      });
    }

    return filtered;
  }, [state.incomes, dateFrom, dateTo, reportType, selectedClients, selectedEmployees]);

  const filteredVariableExpenses = useMemo(() => {
    return state.variableExpenses.filter((exp) => {
      if (!isWithinRange(exp.date, dateFrom, dateTo)) return false;
      return true;
    });
  }, [state.variableExpenses, dateFrom, dateTo]);

  // Подготовка данных для таблицы доходов
  const incomesTableData = useMemo(() => {
    return filteredIncomes.map((income) => {
      let employeeNames = "—";
      let employeePayouts = 0;
      
      if (income.employees && Array.isArray(income.employees)) {
        employeeNames = income.employees
          .map((emp) => state.employees.find((e) => e.id === emp.employeeId)?.fullName || "—")
          .join(", ");
        employeePayouts = income.employees.reduce((sum, emp) => sum + (Number(emp.payoutAmount) || 0), 0);
      } else if (income.employeeId) {
        employeeNames = state.employees.find((e) => e.id === income.employeeId)?.fullName || "—";
        employeePayouts = Number(income.employeePayouts || 0);
      }
      
      return {
        id: income.id,
        date: formatDate(income.date),
        client: state.clients.find((c) => c.id === income.clientId)?.name || "—",
        title: income.title || "—",
        employees: employeeNames,
        amount: Number(income.amount || 0),
        taxPercent: Number(income.taxPercent || 0),
        taxAmount: Number(income.taxAmount || 0),
        npAmount: Number(income.npAmount || 0),
        internalCosts: Number(income.internalCosts || 0),
        employeePayouts: employeePayouts,
        profit: Number(income.profit || 0),
        comment: income.comment || "—",
      };
    });
  }, [filteredIncomes, state.clients, state.employees]);

  // Подсчет итогов для таблицы доходов
  const incomesTotals = useMemo(() => {
    if (incomesTableData.length === 0) return null;
    return {
      date: "Всего",
      client: "",
      title: "",
      employees: "",
      amount: incomesTableData.reduce((sum, row) => sum + row.amount, 0),
      taxPercent: "",
      taxAmount: incomesTableData.reduce((sum, row) => sum + row.taxAmount, 0),
      npAmount: incomesTableData.reduce((sum, row) => sum + row.npAmount, 0),
      internalCosts: incomesTableData.reduce((sum, row) => sum + row.internalCosts, 0),
      employeePayouts: incomesTableData.reduce((sum, row) => sum + row.employeePayouts, 0),
      profit: incomesTableData.reduce((sum, row) => sum + row.profit, 0),
      comment: "",
    };
  }, [incomesTableData]);

  // Подготовка данных для таблицы расходов
  const expensesTableData = useMemo(() => {
    const variableData = filteredVariableExpenses.map((exp) => ({
      id: exp.id,
      date: formatDate(exp.date),
      title: exp.title || "—",
      category: state.expenseCategories.find((c) => c.id === exp.categoryId)?.name || "—",
      amount: Number(exp.amount || 0),
      comment: exp.comment || "—",
      type: "variable",
    }));

    const fixedData = state.fixedExpenses.map((exp) => ({
      id: exp.id,
      date: "Постоянный",
      title: exp.name || "—",
      category: "Постоянный расход",
      amount: Number(exp.amount || 0),
      comment: exp.period || "—",
      type: "fixed",
    }));

    return [...variableData, ...fixedData];
  }, [filteredVariableExpenses, state.fixedExpenses, state.expenseCategories]);

  // Подсчет итогов для таблицы расходов
  const expensesTotals = useMemo(() => {
    if (expensesTableData.length === 0) return null;
    return {
      date: "Всего",
      title: "",
      category: "",
      amount: expensesTableData.reduce((sum, row) => sum + row.amount, 0),
      comment: "",
    };
  }, [expensesTableData]);

  const totalIncome = useMemo(() => {
    return filteredIncomes.reduce((sum, i) => sum + Number(i.amount || 0), 0);
  }, [filteredIncomes]);

  const totalProfit = useMemo(() => {
    return filteredIncomes.reduce((sum, i) => sum + Number(i.profit || 0), 0);
  }, [filteredIncomes]);

  const totalExpenses = useMemo(() => {
    return expensesTableData.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  }, [expensesTableData]);

  const generateExcel = () => {
    if (!dateFrom || !dateTo) {
      alert("Укажите период для отчета");
      return;
    }

    if (reportType === "client" && selectedClients.length === 0) {
      alert("Выберите хотя бы одного клиента");
      return;
    }

    if (reportType === "employee" && selectedEmployees.length === 0) {
      alert("Выберите хотя бы одного исполнителя");
      return;
    }

    const wb = XLSX.utils.book_new();
    const fileName = `Отчет_${dateFrom}_${dateTo}.xlsx`;

    // Генерируем данные в зависимости от выбранного типа
    if (dataType === "incomes" || dataType === "both") {
      // Подготовка данных для доходов
      const incomesData = filteredIncomes.map((income) => {
      // Получаем список исполнителей
      let employeeNames = "—";
      let employeePayouts = 0;
      
      if (income.employees && Array.isArray(income.employees)) {
        employeeNames = income.employees
          .map((emp) => state.employees.find((e) => e.id === emp.employeeId)?.fullName || "—")
          .join(", ");
        employeePayouts = income.employees.reduce((sum, emp) => sum + (Number(emp.payoutAmount) || 0), 0);
      } else if (income.employeeId) {
        // Обратная совместимость
        employeeNames = state.employees.find((e) => e.id === income.employeeId)?.fullName || "—";
        employeePayouts = Number(income.employeePayouts || 0);
      }
      
      return {
        Дата: formatDate(income.date),
        Клиент: state.clients.find((c) => c.id === income.clientId)?.name || "—",
        Название: income.title || "—",
        Исполнители: employeeNames,
        Сумма: Number(income.amount || 0),
        "Налог, %": Number(income.taxPercent || 0),
        "Налог, сумма": Number(income.taxAmount || 0),
        НП: Number(income.npAmount || 0),
        "Внутренние расходы": Number(income.internalCosts || 0),
        "Выплаты исполнителям": employeePayouts,
        Прибыль: Number(income.profit || 0),
        Комментарий: income.comment || "—",
      };
    });

      // Добавляем итоговую строку для доходов
      const totalIncomeForExcel = filteredIncomes.reduce((sum, i) => sum + Number(i.amount || 0), 0);
      const totalProfitForExcel = filteredIncomes.reduce((sum, i) => sum + Number(i.profit || 0), 0);
      incomesData.push({
        Дата: "ИТОГО",
        Клиент: "",
        Название: "",
        Исполнители: "",
        Сумма: totalIncomeForExcel,
        "Налог, %": "",
        "Налог, сумма": "",
        НП: "",
        "Внутренние расходы": "",
        "Выплаты исполнителям": "",
        Прибыль: totalProfitForExcel,
        Комментарий: "",
      });

      const wsIncomes = XLSX.utils.json_to_sheet(incomesData);
      XLSX.utils.book_append_sheet(wb, wsIncomes, "Доходы");
    }

    if (dataType === "expenses" || dataType === "both") {
      // Подготовка данных для расходов
      const expensesData = filteredVariableExpenses.map((exp) => ({
        Дата: formatDate(exp.date),
        Название: exp.title || "—",
        Категория: state.expenseCategories.find((c) => c.id === exp.categoryId)?.name || "—",
        Сумма: Number(exp.amount || 0),
        Комментарий: exp.comment || "—",
      }));

      // Добавляем постоянные расходы
      const fixedExpensesData = state.fixedExpenses.map((exp) => ({
        Дата: "Постоянный",
        Название: exp.name || "—",
        Категория: "Постоянный расход",
        Сумма: Number(exp.amount || 0),
        Комментарий: exp.period || "—",
      }));

      const allExpenses = [...expensesData, ...fixedExpensesData];

      // Добавляем итоговую строку для расходов
      const totalExpensesForExcel = allExpenses.reduce((sum, e) => sum + Number(e.Сумма || 0), 0);
      allExpenses.push({
        Дата: "ИТОГО",
        Название: "",
        Категория: "",
        Сумма: totalExpensesForExcel,
        Комментарий: "",
      });

      const wsExpenses = XLSX.utils.json_to_sheet(allExpenses);
      XLSX.utils.book_append_sheet(wb, wsExpenses, "Расходы");
    }

    // Сохранение файла
    XLSX.writeFile(wb, fileName);
  };

  const handleClearFilters = () => {
    setDateFrom("");
    setDateTo("");
    setSelectedClients([]);
    setSelectedEmployees([]);
    setReportType("general");
    setDataType("both");
    localStorage.removeItem(STORAGE_KEY_FILTERS);
  };

  // Определяем колонки для таблиц
  const incomesColumns = [
    { label: "Дата", key: "date" },
    { label: "Клиент", key: "client" },
    { label: "Название", key: "title" },
    { label: "Исполнители", key: "employees" },
    { label: "Сумма", key: "amount", render: (row) => row.amount.toLocaleString() },
    { label: "Налог, %", key: "taxPercent", render: (row) => row.taxPercent },
    { label: "Налог, сумма", key: "taxAmount", render: (row) => row.taxAmount.toLocaleString() },
    { label: "НП", key: "npAmount", render: (row) => row.npAmount.toLocaleString() },
    { label: "Внутр. расходы", key: "internalCosts", render: (row) => row.internalCosts.toLocaleString() },
    { label: "Выплаты", key: "employeePayouts", render: (row) => row.employeePayouts.toLocaleString() },
    { label: "Прибыль", key: "profit", render: (row) => row.profit.toLocaleString() },
    { label: "Комментарий", key: "comment" },
  ];

  const expensesColumns = [
    { label: "Дата", key: "date" },
    { label: "Название", key: "title" },
    { label: "Категория", key: "category" },
    { label: "Сумма", key: "amount", render: (row) => row.amount.toLocaleString() },
    { label: "Комментарий", key: "comment" },
  ];

  return (
    <div>
      <div className="page-header">
        <h2>Отчеты</h2>
        <button
          type="button"
          onClick={handleClearFilters}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--text-secondary)",
            cursor: "pointer",
            padding: "4px 8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
            transition: "color 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.target.style.color = "var(--text-primary)";
          }}
          onMouseLeave={(e) => {
            e.target.style.color = "var(--text-secondary)";
          }}
          title="Сбросить фильтры"
        >
          🔄
        </button>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0, marginBottom: 16 }}>Параметры отчета</h3>
        <div className="grid">
          <AutocompleteSelectField
            label="Тип отчета"
            value={reportType}
            onChange={(v) => {
              setReportType(v);
              setSelectedClients([]);
              setSelectedEmployees([]);
            }}
            options={[
              { value: "general", label: "Общий" },
              { value: "client", label: "По клиенту" },
              { value: "employee", label: "По исполнителю" },
            ]}
            placeholder="Выберите тип"
          />
          <AutocompleteSelectField
            label="Тип данных"
            value={dataType}
            onChange={setDataType}
            options={[
              { value: "both", label: "Доходы и расходы" },
              { value: "incomes", label: "Доходы" },
              { value: "expenses", label: "Расходы" },
            ]}
            placeholder="Выберите тип данных"
          />
          <InputField
            label="Дата с *"
            type="date"
            value={dateFrom}
            onChange={(v) => setDateFrom(v)}
            required
          />
          <InputField
            label="Дата по *"
            type="date"
            value={dateTo}
            onChange={(v) => setDateTo(v)}
            required
          />
          {reportType === "client" && (
            <MultiSelectField
              label="Клиенты *"
              value={selectedClients}
              onChange={setSelectedClients}
              options={clientOptions}
              placeholder="Выберите клиентов"
              required
            />
          )}
          {reportType === "employee" && (
            <MultiSelectField
              label="Исполнители *"
              value={selectedEmployees}
              onChange={setSelectedEmployees}
              options={employeeOptions}
              placeholder="Выберите исполнителей"
              required
            />
          )}
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button className="btn secondary" onClick={handleClearFilters}>
              Очистить
            </button>
          </div>
        </div>
      </div>

      {dateFrom && dateTo && (
        <>
          {(dataType === "incomes" || dataType === "both") && (
            <div className="card">
              <div className="page-header" style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <h3 style={{ margin: 0 }}>Доходы</h3>
                  <TableColumnSettings
                    columns={incomesColumns}
                    storageKey={STORAGE_KEY_COLUMNS_INCOMES}
                    onColumnsChange={setIncomesVisibleColumns}
                  />
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div className="badge">
                    Записей: {incomesTableData.length} | Сумма: {totalIncome.toLocaleString()} | Прибыль: {totalProfit.toLocaleString()}
                  </div>
                  <button className="btn" onClick={generateExcel}>
                    Скачать Excel
                  </button>
                </div>
              </div>
              {incomesTableData.length > 0 ? (
                <Table
                  data={incomesTableData}
                  columns={incomesColumns}
                  rowKey={(row) => row.id}
                  totals={incomesTotals}
                  visibleColumns={incomesVisibleColumns}
                />
              ) : (
                <p style={{ padding: "20px", textAlign: "center", color: "var(--text-secondary)" }}>
                  Нет данных за выбранный период
                </p>
              )}
            </div>
          )}

          {(dataType === "expenses" || dataType === "both") && (
            <div className="card" style={{ marginTop: 16 }}>
              <div className="page-header" style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <h3 style={{ margin: 0 }}>Расходы</h3>
                  <TableColumnSettings
                    columns={expensesColumns}
                    storageKey={STORAGE_KEY_COLUMNS_EXPENSES}
                    onColumnsChange={setExpensesVisibleColumns}
                  />
                </div>
                <div className="badge">
                  Записей: {expensesTableData.length} | Сумма: {totalExpenses.toLocaleString()}
                </div>
              </div>
              {expensesTableData.length > 0 ? (
                <Table
                  data={expensesTableData}
                  columns={expensesColumns}
                  rowKey={(row) => `${row.type}-${row.id}`}
                  totals={expensesTotals}
                  visibleColumns={expensesVisibleColumns}
                />
              ) : (
                <p style={{ padding: "20px", textAlign: "center", color: "var(--text-secondary)" }}>
                  Нет данных за выбранный период
                </p>
              )}
            </div>
          )}
        </>
      )}

      {(!dateFrom || !dateTo) && (
        <div className="card">
          <p style={{ padding: "20px", textAlign: "center", color: "var(--text-secondary)" }}>
            Укажите период для формирования отчета
          </p>
        </div>
      )}
    </div>
  );
}

export default ReportsPage;

