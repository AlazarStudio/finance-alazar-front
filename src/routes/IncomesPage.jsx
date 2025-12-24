import { useMemo, useState } from "react";
import Table from "../components/Table/Table.jsx";
import TableColumnSettings from "../components/Table/TableColumnSettings.jsx";
import InputField from "../components/Forms/InputField.jsx";
import SelectField from "../components/Forms/SelectField.jsx";
import AutocompleteSelectField from "../components/Forms/AutocompleteSelectField.jsx";
import MultiSelectField from "../components/Forms/MultiSelectField.jsx";
import NumberField from "../components/Forms/NumberField.jsx";
import TextAreaField from "../components/Forms/TextAreaField.jsx";
import SidePanel from "../components/SidePanel/SidePanel.jsx";
import Modal from "../components/Modal/Modal.jsx";
import { useAppStore } from "../store/AppStoreContext.jsx";
import { calculateProfit, sumBy } from "../utils/math.js";
import { formatDate, isWithinRange } from "../utils/date.js";

const emptyIncome = {
  date: "",
  title: "",
  clientId: "",
  employees: [],
  amount: "",
  taxPercent: "",
  taxAmount: "",
  npAmount: "",
  internalCosts: "",
  comment: "",
};

function IncomesPage() {
  const {
    state,
    addIncome,
    updateIncome,
    deleteIncome,
    addClient,
  } = useAppStore();

  const [filters, setFilters] = useState({
    from: "",
    to: "",
    clientId: "",
    employeeId: "",
    query: "",
  });
  const [form, setForm] = useState(emptyIncome);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedIncome, setSelectedIncome] = useState(null);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientForm, setClientForm] = useState({
    name: "",
    organization: "",
    activityField: "",
    contactName: "",
    phone: "",
  });
  const [visibleColumns, setVisibleColumns] = useState({});

  const getEmployeeNames = (income) => {
    if (!income.employees || !Array.isArray(income.employees)) return "—";
    return income.employees
      .map((emp) => {
        const employee = state.employees.find((e) => e.id === emp.employeeId);
        return employee?.fullName || "—";
      })
      .join(", ");
  };

  const incomesColumns = [
    { label: "Дата", key: "date", sortKey: "date", render: (row) => formatDate(row.date) },
    { 
      label: "Клиент", 
      key: "client", 
      sortValue: (row) => {
        const client = state.clients.find((c) => c.id === row.clientId);
        return client?.name || "—";
      },
      render: (row) => state.clients.find((c) => c.id === row.clientId)?.name || "—" 
    },
    { label: "Название", key: "title" },
    { 
      label: "Исполнители", 
      key: "employees", 
      sortValue: (row) => getEmployeeNames(row),
      render: (row) => getEmployeeNames(row) 
    },
    { label: "Сумма", key: "amount", sortKey: "amount", render: (row) => Number(row.amount || 0).toLocaleString() },
    { label: "Прибыль", key: "profit", sortKey: "profit", render: (row) => Number(row.profit || 0).toLocaleString() },
  ];

  // Миграция старых данных при загрузке
  const migratedIncomes = useMemo(() => {
    return state.incomes.map((income) => {
      // Если уже есть массив employees, возвращаем как есть
      if (income.employees && Array.isArray(income.employees)) {
        return income;
      }
      // Миграция старого формата
      if (income.employeeId) {
        return {
          ...income,
          employees: [
            {
              employeeId: income.employeeId,
              payoutType: income.employeePayoutType || "percent",
              payoutAmount: income.employeePayouts || 0,
            },
          ],
        };
      }
      return { ...income, employees: [] };
    });
  }, [state.incomes]);

  const filtered = useMemo(() => {
    return migratedIncomes.filter((income) => {
      if (!isWithinRange(income.date, filters.from, filters.to)) return false;
      if (filters.clientId && income.clientId !== filters.clientId) return false;
      if (filters.employeeId) {
        const hasEmployee = income.employees?.some((emp) => emp.employeeId === filters.employeeId);
        if (!hasEmployee) return false;
      }
      if (
        filters.query &&
        !income.title.toLowerCase().includes(filters.query.toLowerCase())
      )
        return false;
      return true;
    });
  }, [migratedIncomes, filters]);

  const totalAmount = sumBy(filtered, (i) => i.amount);
  const totalProfit = sumBy(filtered, (i) => i.profit);

  const clientOptions = state.clients.map((c) => ({ value: c.id, label: c.name }));
  const employeeOptions = state.employees.map((e) => ({ value: e.id, label: e.fullName }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.date || !form.title || !form.amount) {
      alert("Дата, название и сумма обязательны");
      return;
    }
    
    // Убеждаемся, что employees - это массив объектов
    const employees = (form.employees || []).map((empId) => {
      const existing = form.employeeData?.find((ed) => ed.employeeId === empId);
      if (existing) {
        return existing;
      }
      // Создаем новый объект сотрудника
      const employee = state.employees.find((e) => e.id === empId);
      return {
        employeeId: empId,
        payoutType: "percent",
        payoutAmount: employee && form.amount ? (Number(form.amount) * Number(employee.percent || 0)) / 100 : 0,
      };
    });

    const payload = {
      ...form,
      employees,
      profit: calculateProfit({ ...form, employees }),
    };
    
    // Удаляем временные поля
    delete payload.employeeData;
    
    if (editingId) {
      updateIncome(editingId, payload);
    } else {
      addIncome(payload);
    }
    setForm(emptyIncome);
    setEditingId(null);
    setIsModalOpen(false);
  };

  const startEdit = (income) => {
    setEditingId(income.id);
    const employeeIds = (income.employees || []).map((emp) => emp.employeeId);
    setForm({ 
      ...income, 
      employees: employeeIds,
      employeeData: income.employees || [],
    });
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingId(null);
    const defaultTaxPercent = state.appSettings?.taxPercent || "";
    setForm({ ...emptyIncome, taxPercent: defaultTaxPercent, employeeData: [] });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setForm(emptyIncome);
  };

  const handleDelete = (id) => {
    if (confirm("Удалить доход?")) {
      deleteIncome(id);
      if (selectedIncome && selectedIncome.id === id) {
        setSelectedIncome(null);
      }
    }
  };

  const handleClearFilters = () => {
    setFilters({
      from: "",
      to: "",
      clientId: "",
      employeeId: "",
      query: "",
    });
  };

  const handleChangeField = (key, value) => {
    const next = { ...form, [key]: value };

    if (key === "amount" || key === "taxPercent") {
      if (next.amount && next.taxPercent) {
        next.taxAmount = (Number(next.amount) * Number(next.taxPercent)) / 100;
      }
    }

    // Обновление выплат при изменении суммы или списка сотрудников
    if (key === "amount" || key === "employees") {
      if (next.employees && Array.isArray(next.employees)) {
        next.employeeData = next.employees.map((empId) => {
          const existing = next.employeeData?.find((ed) => ed.employeeId === empId);
          if (existing) {
            // Пересчитываем процентные выплаты
            if (existing.payoutType === "percent" && next.amount) {
              const employee = state.employees.find((e) => e.id === empId);
              if (employee && employee.percent) {
                existing.payoutAmount = (Number(next.amount) * Number(employee.percent)) / 100;
              }
            }
            return existing;
          }
          // Создаем новый объект сотрудника
          const employee = state.employees.find((e) => e.id === empId);
          return {
            employeeId: empId,
            payoutType: "percent",
            payoutAmount: employee && next.amount ? (Number(next.amount) * Number(employee.percent || 0)) / 100 : 0,
          };
        });
      }
    }

    setForm(next);
  };

  const handleEmployeeDataChange = (employeeId, field, value) => {
    const next = { ...form };
    if (!next.employeeData) {
      next.employeeData = [];
    }
    
    const index = next.employeeData.findIndex((ed) => ed.employeeId === employeeId);
    if (index >= 0) {
      next.employeeData[index] = { ...next.employeeData[index], [field]: value };
      
      // Пересчитываем выплату при изменении типа или суммы дохода
      if (field === "payoutType") {
        const employee = state.employees.find((e) => e.id === employeeId);
        if (value === "percent" && employee && form.amount) {
          next.employeeData[index].payoutAmount = (Number(form.amount) * Number(employee.percent || 0)) / 100;
        } else if (value === "fixed") {
          next.employeeData[index].payoutAmount = 0;
        }
      }
    }
    
    setForm(next);
  };

  const getEmployeePayoutTotal = () => {
    if (!form.employeeData || !Array.isArray(form.employeeData)) return 0;
    return form.employeeData.reduce((sum, emp) => sum + (Number(emp.payoutAmount) || 0), 0);
  };

  const getEmployeePayoutTotalForIncome = (income) => {
    if (!income.employees || !Array.isArray(income.employees)) return 0;
    return income.employees.reduce((sum, emp) => sum + (Number(emp.payoutAmount) || 0), 0);
  };

  return (
    <div>
      <div className="page-header">
        <h2>Доходы</h2>
      </div>

      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        <div className="filters" style={{ flex: 1 }}>
          <div style={{ minWidth: "300px" }}>
            <InputField
              label="Поиск по названию"
              value={filters.query}
              onChange={(v) => setFilters({ ...filters, query: v })}
            />
          </div>
          <div style={{ minWidth: "250px" }}>
            <AutocompleteSelectField
              label="Клиент"
              value={filters.clientId}
              onChange={(v) => setFilters({ ...filters, clientId: v })}
              options={[{ value: "", label: "Все" }, ...clientOptions]}
              placeholder="Все"
            />
          </div>
          <div style={{ minWidth: "250px" }}>
            <AutocompleteSelectField
              label="Исполнитель"
              value={filters.employeeId}
              onChange={(v) => setFilters({ ...filters, employeeId: v })}
              options={[{ value: "", label: "Все" }, ...employeeOptions]}
              placeholder="Все"
            />
          </div>
        </div>
        <div className="filters" style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          <InputField
            label="Дата с"
            type="date"
            value={filters.from || ""}
            onChange={(v) => setFilters({ ...filters, from: v })}
          />
          <InputField
            label="Дата по"
            type="date"
            value={filters.to || ""}
            onChange={(v) => setFilters({ ...filters, to: v })}
          />
          <div style={{ alignSelf: "flex-end" }}>
            <button type="button" className="btn secondary" onClick={handleClearFilters} style={{ padding: "12px 16px" }}>
              Очистить фильтры
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="page-header" style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <h3 style={{ margin: 0 }}>Список доходов</h3>
            <TableColumnSettings
              columns={incomesColumns}
              storageKey="incomes-columns"
              onColumnsChange={setVisibleColumns}
            />
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div className="badge">
              Итоги: доход {totalAmount.toLocaleString()} / прибыль {totalProfit.toLocaleString()}
            </div>
            <button className="btn" onClick={handleAdd}>
              Добавить
            </button>
          </div>
        </div>
        <Table
          data={filtered}
          onRowClick={setSelectedIncome}
          columns={[
            ...incomesColumns,
            {
              label: "Действия",
              key: "actions",
              render: (row) => (
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn secondary" onClick={(e) => { e.stopPropagation(); startEdit(row); }}>
                    Редактировать
                  </button>
                  <button className="btn danger" onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }}>
                    Удалить
                  </button>
                </div>
              ),
            },
          ]}
          visibleColumns={visibleColumns}
        />
      </div>

      {selectedIncome && (
        <SidePanel
          title="Детали дохода"
          onClose={() => setSelectedIncome(null)}
          actions={
            <>
              <button className="btn secondary" onClick={() => startEdit(selectedIncome)}>
                Редактировать
              </button>
              <button className="btn danger" onClick={() => handleDelete(selectedIncome.id)}>
                Удалить
              </button>
            </>
          }
        >
          <div className="section">
            <div className="section-title">Основное</div>
            <p>Дата: {formatDate(selectedIncome.date)}</p>
            <p>Клиент: {state.clients.find((c) => c.id === selectedIncome.clientId)?.name || "—"}</p>
            <p>Название: {selectedIncome.title}</p>
            <p>Исполнители: {getEmployeeNames(selectedIncome)}</p>
            <p>Сумма: {Number(selectedIncome.amount || 0).toLocaleString()}</p>
          </div>
          <div className="section">
            <div className="section-title">Расшифровка</div>
            <p>Налог, %: {selectedIncome.taxPercent || 0}</p>
            <p>Налог, сумма: {Number(selectedIncome.taxAmount || 0).toLocaleString()}</p>
            <p>НП: {Number(selectedIncome.npAmount || 0).toLocaleString()}</p>
            <p>Внутренние расходы: {Number(selectedIncome.internalCosts || 0).toLocaleString()}</p>
            <p>Выплаты исполнителям: {getEmployeePayoutTotalForIncome(selectedIncome).toLocaleString()}</p>
            {selectedIncome.employees && selectedIncome.employees.length > 0 && (
              <div style={{ marginTop: "12px", padding: "12px", backgroundColor: "var(--bg-tertiary)", borderRadius: "8px" }}>
                <div style={{ fontWeight: "bold", marginBottom: "8px" }}>Детали выплат:</div>
                {selectedIncome.employees.map((emp, idx) => {
                  const employee = state.employees.find((e) => e.id === emp.employeeId);
                  return (
                    <div key={idx} style={{ marginBottom: "8px", fontSize: "14px" }}>
                      {employee?.fullName || "—"}: {Number(emp.payoutAmount || 0).toLocaleString()} ({emp.payoutType === "percent" ? "процент" : "фиксировано"})
                    </div>
                  );
                })}
              </div>
            )}
            <p>Комментарий: {selectedIncome.comment || "—"}</p>
          </div>
          <div className="section">
            <div className="section-title">Итог</div>
            <p className="badge">
              Прибыль: {Number(selectedIncome.profit || 0).toLocaleString()}
            </p>
            <p>Формула: Прибыль = Сумма – Налог – НП – Внутренние расходы – Выплаты исполнителям</p>
          </div>
        </SidePanel>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingId ? "Редактирование дохода" : "Добавление дохода"}
        actions={
          <>
            <button type="button" className="btn secondary" onClick={handleCloseModal}>
              Отмена
            </button>
            <button type="submit" form="income-form" className="btn">
              {editingId ? "Сохранить" : "Добавить"}
            </button>
          </>
        }
      >
        <form id="income-form" onSubmit={handleSubmit} className="grid">
          <InputField label="Дата *" type="date" value={form.date} onChange={(v) => handleChangeField("date", v)} required />
          <AutocompleteSelectField 
            label="Клиент" 
            value={form.clientId} 
            onChange={(v) => handleChangeField("clientId", v)} 
            options={clientOptions} 
            placeholder="Выберите клиента"
            showAddButton={true}
            onAddNew={() => {
              setIsClientModalOpen(true);
            }}
          />
          <InputField label="Название *" value={form.title} onChange={(v) => handleChangeField("title", v)} required />
          
          <div style={{ gridColumn: "1 / -1" }}>
            <MultiSelectField
              label="Исполнители"
              value={form.employees || []}
              onChange={(v) => handleChangeField("employees", v)}
              options={employeeOptions}
              placeholder="Выберите исполнителей"
            />
          </div>

          {form.employees && form.employees.length > 0 && (
            <div style={{ gridColumn: "1 / -1", marginBottom: "16px" }}>
              <div style={{ padding: "12px", backgroundColor: "var(--bg-tertiary)", borderRadius: "8px" }}>
                <div style={{ fontWeight: "bold", marginBottom: "12px" }}>Настройка выплат:</div>
                {form.employees.map((empId) => {
                  const employee = state.employees.find((e) => e.id === empId);
                  const employeeData = form.employeeData?.find((ed) => ed.employeeId === empId) || {
                    employeeId: empId,
                    payoutType: "percent",
                    payoutAmount: employee && form.amount ? (Number(form.amount) * Number(employee.percent || 0)) / 100 : 0,
                  };
                  
                  return (
                    <div key={empId} style={{ marginBottom: "16px", padding: "12px", backgroundColor: "var(--bg-secondary)", borderRadius: "8px" }}>
                      <div style={{ fontWeight: "600", marginBottom: "8px" }}>{employee?.fullName || "—"}</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        <SelectField
                          label="Тип выплаты"
                          value={employeeData.payoutType}
                          onChange={(v) => handleEmployeeDataChange(empId, "payoutType", v)}
                          options={[
                            { value: "percent", label: `Процент (${employee?.percent || 0}%)` },
                            { value: "fixed", label: "Фиксированная сумма" },
                          ]}
                        />
                        <NumberField
                          label={employeeData.payoutType === "percent" ? "Выплата (авто)" : "Выплата"}
                          value={employeeData.payoutAmount}
                          onChange={(v) => handleEmployeeDataChange(empId, "payoutAmount", v)}
                          readOnly={employeeData.payoutType === "percent"}
                        />
                      </div>
                      {employeeData.payoutType === "percent" && form.amount && employee && (
                        <div style={{ marginTop: "8px", fontSize: "12px", color: "var(--text-secondary)" }}>
                          Расчет: {Number(form.amount || 0).toLocaleString()} × {employee.percent || 0}% = {Number(employeeData.payoutAmount || 0).toLocaleString()}
                        </div>
                      )}
                    </div>
                  );
                })}
                <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid var(--border-color-light)", fontWeight: "600" }}>
                  Итого выплат: {getEmployeePayoutTotal().toLocaleString()}
                </div>
              </div>
            </div>
          )}

          <NumberField label="Сумма *" value={form.amount} onChange={(v) => handleChangeField("amount", v)} required />
          <NumberField label="Налог, %" value={form.taxPercent} onChange={(v) => handleChangeField("taxPercent", v)} />
          <NumberField label="Налог, сумма" value={form.taxAmount} onChange={(v) => handleChangeField("taxAmount", v)} />
          <NumberField label="НП" value={form.npAmount} onChange={(v) => handleChangeField("npAmount", v)} />
          <NumberField label="Внутренние расходы" value={form.internalCosts} onChange={(v) => handleChangeField("internalCosts", v)} />
          <TextAreaField label="Комментарий" value={form.comment} onChange={(v) => handleChangeField("comment", v)} />
        </form>
      </Modal>

      <Modal
        isOpen={isClientModalOpen}
        onClose={() => {
          setIsClientModalOpen(false);
          setClientForm({ name: "", organization: "", activityField: "", contactName: "", phone: "" });
        }}
        title="Добавление клиента"
        actions={
          <>
            <button 
              type="button" 
              className="btn secondary" 
              onClick={() => {
                setIsClientModalOpen(false);
                setClientForm({ name: "", organization: "", activityField: "", contactName: "", phone: "" });
              }}
            >
              Отмена
            </button>
            <button 
              type="submit" 
              form="client-form" 
              className="btn"
            >
              Добавить
            </button>
          </>
        }
      >
        <form 
          id="client-form" 
          onSubmit={async (e) => {
            e.preventDefault();
            if (!clientForm.name || !clientForm.phone) {
              alert("Имя и телефон обязательны");
              return;
            }
            try {
              const newClient = await addClient(clientForm);
              handleChangeField("clientId", newClient.id);
              setIsClientModalOpen(false);
              setClientForm({ name: "", organization: "", activityField: "", contactName: "", phone: "" });
            } catch (error) {
              alert("Ошибка при добавлении клиента");
            }
          }} 
          className="grid"
        >
          <InputField 
            label="Название *" 
            value={clientForm.name} 
            onChange={(v) => setClientForm({ ...clientForm, name: v })} 
            required 
          />
          <InputField 
            label="Телефон *" 
            value={clientForm.phone} 
            onChange={(v) => setClientForm({ ...clientForm, phone: v })} 
            required 
          />
          <InputField 
            label="Организация" 
            value={clientForm.organization} 
            onChange={(v) => setClientForm({ ...clientForm, organization: v })} 
          />
          <InputField 
            label="Сфера деятельности" 
            value={clientForm.activityField} 
            onChange={(v) => setClientForm({ ...clientForm, activityField: v })} 
          />
          <InputField 
            label="Контакт" 
            value={clientForm.contactName} 
            onChange={(v) => setClientForm({ ...clientForm, contactName: v })} 
          />
        </form>
      </Modal>
    </div>
  );
}

export default IncomesPage;

