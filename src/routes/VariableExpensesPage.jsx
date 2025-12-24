import { useMemo, useState } from "react";
import Table from "../components/Table/Table.jsx";
import TableColumnSettings from "../components/Table/TableColumnSettings.jsx";
import InputField from "../components/Forms/InputField.jsx";
import NumberField from "../components/Forms/NumberField.jsx";
import SelectField from "../components/Forms/SelectField.jsx";
import AutocompleteSelectField from "../components/Forms/AutocompleteSelectField.jsx";
import TextAreaField from "../components/Forms/TextAreaField.jsx";
import Modal from "../components/Modal/Modal.jsx";
import { useAppStore } from "../store/AppStoreContext.jsx";
import { sumBy } from "../utils/math.js";
import { formatDate, isWithinRange } from "../utils/date.js";

const emptyVariable = { date: "", title: "", categoryId: "", amount: "", comment: "" };

function VariableExpensesPage() {
  const {
    state,
    addVariableExpense,
    updateVariableExpense,
    deleteVariableExpense,
  } = useAppStore();

  const [variableForm, setVariableForm] = useState(emptyVariable);
  const [variableEditId, setVariableEditId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({ from: "", to: "", categoryId: "", query: "" });
  const [visibleColumns, setVisibleColumns] = useState({});

  const variableExpensesColumns = [
    { label: "Дата", key: "date", render: (row) => formatDate(row.date) },
    { label: "Название", key: "title" },
    { label: "Категория", key: "category", render: (row) => state.expenseCategories.find((c) => c.id === row.categoryId)?.name || "—" },
    { label: "Сумма", key: "amount", render: (row) => Number(row.amount || 0).toLocaleString() },
    { label: "Комментарий", key: "comment" },
  ];

  const variableFiltered = useMemo(() => {
    return state.variableExpenses.filter((exp) => {
      if (!isWithinRange(exp.date, filters.from, filters.to)) return false;
      if (filters.categoryId && exp.categoryId !== filters.categoryId) return false;
      if (filters.query && !exp.title.toLowerCase().includes(filters.query.toLowerCase())) return false;
      return true;
    });
  }, [state.variableExpenses, filters]);

  const categoryOptions = state.expenseCategories.map((c) => ({ value: c.id, label: c.name }));
  const variableTotal = sumBy(variableFiltered, (e) => e.amount);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!variableForm.title || !variableForm.date || variableForm.amount === "") {
      alert("Дата, название и сумма обязательны");
      return;
    }
    if (variableEditId) {
      updateVariableExpense(variableEditId, variableForm);
    } else {
      addVariableExpense(variableForm);
    }
    setVariableForm(emptyVariable);
    setVariableEditId(null);
    setIsModalOpen(false);
  };

  const handleAdd = () => {
    setVariableEditId(null);
    setVariableForm(emptyVariable);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setVariableEditId(null);
    setVariableForm(emptyVariable);
  };

  const startEdit = (expense) => {
    setVariableEditId(expense.id);
    setVariableForm({ ...expense });
    setIsModalOpen(true);
  };

  const handleClearFilters = () => {
    setFilters({
      from: "",
      to: "",
      categoryId: "",
      query: "",
    });
  };

  return (
    <div>
      <div className="page-header">
        <h2>Разовые расходы</h2>
        <button className="btn" onClick={handleAdd}>
          Добавить
        </button>
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
              label="Категория"
              value={filters.categoryId}
              onChange={(v) => setFilters({ ...filters, categoryId: v })}
              options={[{ value: "", label: "Все" }, ...categoryOptions]}
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

      <div className="card" style={{ marginTop: 16 }}>
        <div className="page-header" style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <h3 style={{ margin: 0 }}>Список разовых расходов</h3>
            <TableColumnSettings
              columns={variableExpensesColumns}
              storageKey="variable-expenses-columns"
              onColumnsChange={setVisibleColumns}
            />
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div className="badge">Сумма: {variableTotal.toLocaleString()}</div>
          </div>
        </div>
        <Table
          data={variableFiltered}
          columns={[
            ...variableExpensesColumns,
            {
              label: "Действия",
              key: "actions",
              render: (row) => (
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn secondary" onClick={() => startEdit(row)}>
                    Редактировать
                  </button>
                  <button className="btn danger" onClick={() => { if (confirm("Удалить расход?")) deleteVariableExpense(row.id); }}>
                    Удалить
                  </button>
                </div>
              ),
            },
          ]}
          visibleColumns={visibleColumns}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={variableEditId ? "Редактирование разового расхода" : "Добавление разового расхода"}
        actions={
          <>
            <button type="button" className="btn secondary" onClick={handleCloseModal}>
              Отмена
            </button>
            <button type="submit" form="variable-form" className="btn">
              {variableEditId ? "Сохранить" : "Добавить"}
            </button>
          </>
        }
      >
        <form id="variable-form" onSubmit={handleSubmit} className="grid">
          <InputField label="Дата *" type="date" value={variableForm.date} onChange={(v) => setVariableForm({ ...variableForm, date: v })} required />
          <InputField label="Название *" value={variableForm.title} onChange={(v) => setVariableForm({ ...variableForm, title: v })} required />
          <SelectField label="Категория" value={variableForm.categoryId} onChange={(v) => setVariableForm({ ...variableForm, categoryId: v })} options={categoryOptions} placeholder="Выберите категорию" />
          <NumberField label="Сумма *" value={variableForm.amount} onChange={(v) => setVariableForm({ ...variableForm, amount: v })} required />
          <TextAreaField label="Комментарий" value={variableForm.comment} onChange={(v) => setVariableForm({ ...variableForm, comment: v })} />
        </form>
      </Modal>
    </div>
  );
}

export default VariableExpensesPage;

