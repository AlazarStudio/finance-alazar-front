import { useMemo, useState } from "react";
import Table from "../components/Table/Table.jsx";
import InputField from "../components/Forms/InputField.jsx";
import NumberField from "../components/Forms/NumberField.jsx";
import Modal from "../components/Modal/Modal.jsx";
import { useAppStore } from "../store/AppStoreContext.jsx";

function EmployeesPage() {
  const { state, addEmployee, updateEmployee, deleteEmployee } = useAppStore();
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ fullName: "", position: "", percent: 0 });

  const filtered = useMemo(() => {
    const query = search.toLowerCase();
    return state.employees.filter(
      (e) =>
        e.fullName.toLowerCase().includes(query) ||
        (e.position || "").toLowerCase().includes(query)
    );
  }, [state.employees, search]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.fullName) {
      alert("ФИО обязательно");
      return;
    }
    if (form.percent < 0 || form.percent > 100) {
      alert("Процент должен быть 0-100");
      return;
    }
    if (editingId) {
      updateEmployee(editingId, form);
    } else {
      addEmployee(form);
    }
    setForm({ fullName: "", position: "", percent: 0 });
    setEditingId(null);
    setIsModalOpen(false);
  };

  const startEdit = (emp) => {
    setEditingId(emp.id);
    setForm({ fullName: emp.fullName, position: emp.position || "", percent: emp.percent || 0 });
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingId(null);
    setForm({ fullName: "", position: "", percent: 0 });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setForm({ fullName: "", position: "", percent: 0 });
  };

  const handleDelete = (emp) => {
    const used = state.incomes.some((income) => income.employeeId === emp.id);
    const message = used
      ? "Сотрудник используется в доходах. Удалить?"
      : "Удалить сотрудника?";
    if (confirm(message)) {
      deleteEmployee(emp.id);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Сотрудники</h2>
        <InputField label="Поиск" value={search} onChange={setSearch} placeholder="Поиск по ФИО" />
      </div>

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>Список сотрудников</h3>
          <button className="btn" onClick={handleAdd}>
            Добавить
          </button>
        </div>
        <Table
          columns={[
            { label: "ФИО", key: "fullName" },
            { label: "Должность", key: "position" },
            { label: "Процент", render: (row) => `${row.percent || 0}%` },
            {
              label: "Действия",
              render: (row) => (
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn secondary" onClick={() => startEdit(row)}>
                    Редактировать
                  </button>
                  <button className="btn danger" onClick={() => handleDelete(row)}>
                    Удалить
                  </button>
                </div>
              ),
            },
          ]}
          data={filtered}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingId ? "Редактирование сотрудника" : "Добавление сотрудника"}
        actions={
          <>
            <button type="button" className="btn secondary" onClick={handleCloseModal}>
              Отмена
            </button>
            <button type="submit" form="employee-form" className="btn">
              {editingId ? "Сохранить" : "Добавить"}
            </button>
          </>
        }
      >
        <form id="employee-form" onSubmit={handleSubmit} className="grid">
          <InputField label="ФИО *" value={form.fullName} onChange={(v) => setForm({ ...form, fullName: v })} required />
          <InputField label="Должность" value={form.position} onChange={(v) => setForm({ ...form, position: v })} />
          <NumberField label="Процент (0-100)" value={form.percent} min={0} max={100} onChange={(v) => setForm({ ...form, percent: v })} />
        </form>
      </Modal>
    </div>
  );
}

export default EmployeesPage;



