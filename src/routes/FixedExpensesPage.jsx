import { useState } from "react";
import Table from "../components/Table/Table.jsx";
import InputField from "../components/Forms/InputField.jsx";
import NumberField from "../components/Forms/NumberField.jsx";
import Modal from "../components/Modal/Modal.jsx";
import { useAppStore } from "../store/AppStoreContext.jsx";
import { sumBy } from "../utils/math.js";

const emptyFixed = { name: "", amount: "", period: "" };

function FixedExpensesPage() {
  const {
    state,
    addFixedExpense,
    updateFixedExpense,
    deleteFixedExpense,
  } = useAppStore();

  const [fixedForm, setFixedForm] = useState(emptyFixed);
  const [fixedEditId, setFixedEditId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fixedTotal = sumBy(state.fixedExpenses, (e) => e.amount);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fixedForm.name || fixedForm.amount === "") {
      alert("Название и сумма обязательны");
      return;
    }
    if (fixedEditId) {
      updateFixedExpense(fixedEditId, fixedForm);
    } else {
      addFixedExpense(fixedForm);
    }
    setFixedForm(emptyFixed);
    setFixedEditId(null);
    setIsModalOpen(false);
  };

  const handleAdd = () => {
    setFixedEditId(null);
    setFixedForm(emptyFixed);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFixedEditId(null);
    setFixedForm(emptyFixed);
  };

  const startEdit = (expense) => {
    setFixedEditId(expense.id);
    setFixedForm({ name: expense.name, amount: expense.amount, period: expense.period || "" });
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="page-header">
        <h2>Постоянные расходы</h2>
        <button className="btn" onClick={handleAdd}>
          Добавить
        </button>
      </div>

      <div className="card">
        <div className="page-header" style={{ marginBottom: 8 }}>
          <h3 style={{ margin: 0 }}>Список постоянных расходов</h3>
          <div className="badge">Сумма: {fixedTotal.toLocaleString()}</div>
        </div>
        <Table
          data={state.fixedExpenses}
          columns={[
            { label: "Название", key: "name" },
            { label: "Сумма", render: (row) => Number(row.amount || 0).toLocaleString() },
            { label: "Период", key: "period" },
            {
              label: "Действия",
              render: (row) => (
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn secondary" onClick={() => startEdit(row)}>
                    Редактировать
                  </button>
                  <button className="btn danger" onClick={() => { if (confirm("Удалить расход?")) deleteFixedExpense(row.id); }}>
                    Удалить
                  </button>
                </div>
              ),
            },
          ]}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={fixedEditId ? "Редактирование постоянного расхода" : "Добавление постоянного расхода"}
        actions={
          <>
            <button type="button" className="btn secondary" onClick={handleCloseModal}>
              Отмена
            </button>
            <button type="submit" form="fixed-form" className="btn">
              {fixedEditId ? "Сохранить" : "Добавить"}
            </button>
          </>
        }
      >
        <form id="fixed-form" onSubmit={handleSubmit} className="grid">
          <InputField label="Название *" value={fixedForm.name} onChange={(v) => setFixedForm({ ...fixedForm, name: v })} required />
          <NumberField label="Сумма *" value={fixedForm.amount} onChange={(v) => setFixedForm({ ...fixedForm, amount: v })} required />
          <InputField label="Период" value={fixedForm.period} onChange={(v) => setFixedForm({ ...fixedForm, period: v })} placeholder="например, ежемесячно" />
        </form>
      </Modal>
    </div>
  );
}

export default FixedExpensesPage;

