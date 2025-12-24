import { useMemo, useState } from "react";
import Table from "../components/Table/Table.jsx";
import TableColumnSettings from "../components/Table/TableColumnSettings.jsx";
import InputField from "../components/Forms/InputField.jsx";
import Modal from "../components/Modal/Modal.jsx";
import { useAppStore } from "../store/AppStoreContext.jsx";

function ClientsPage() {
  const { state, addClient, updateClient, deleteClient } = useAppStore();
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    organization: "",
    activityField: "",
    contactName: "",
    phone: "",
  });
  const [visibleColumns, setVisibleColumns] = useState({});

  const clientsColumns = [
    { label: "Название", key: "name" },
    { label: "Организация", key: "organization" },
    { label: "Сфера", key: "activityField" },
    { label: "Контакт", key: "contactName" },
    { label: "Телефон", key: "phone" },
  ];

  const filtered = useMemo(() => {
    const query = search.toLowerCase();
    return state.clients.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        (c.phone || "").toLowerCase().includes(query)
    );
  }, [state.clients, search]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      alert("Имя и телефон обязательны");
      return;
    }
    if (editingId) {
      updateClient(editingId, form);
    } else {
      addClient(form);
    }
    setForm({ name: "", organization: "", activityField: "", contactName: "", phone: "" });
    setEditingId(null);
    setIsModalOpen(false);
  };

  const startEdit = (client) => {
    setEditingId(client.id);
    setForm({
      name: client.name,
      organization: client.organization || "",
      activityField: client.activityField || "",
      contactName: client.contactName || "",
      phone: client.phone || "",
    });
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingId(null);
    setForm({ name: "", organization: "", activityField: "", contactName: "", phone: "" });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setForm({ name: "", organization: "", activityField: "", contactName: "", phone: "" });
  };

  const handleDelete = (id) => {
    if (confirm("Удалить клиента?")) {
      deleteClient(id);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Клиенты</h2>
        <InputField
          label="Поиск"
          value={search}
          placeholder="Поиск по названию или телефону"
          onChange={setSearch}
        />
      </div>

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <h3 style={{ margin: 0 }}>Список клиентов</h3>
            <TableColumnSettings
              columns={clientsColumns}
              storageKey="clients-columns"
              onColumnsChange={setVisibleColumns}
            />
          </div>
          <button className="btn" onClick={handleAdd}>
            Добавить
          </button>
        </div>
        <Table
          columns={[
            ...clientsColumns,
            {
              label: "Действия",
              key: "actions",
              render: (row) => (
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn secondary" onClick={() => startEdit(row)}>
                    Редактировать
                  </button>
                  <button className="btn danger" onClick={() => handleDelete(row.id)}>
                    Удалить
                  </button>
                </div>
              ),
            },
          ]}
          data={filtered}
          visibleColumns={visibleColumns}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingId ? "Редактирование клиента" : "Добавление клиента"}
        actions={
          <>
            <button type="button" className="btn secondary" onClick={handleCloseModal}>
              Отмена
            </button>
            <button type="submit" form="client-form" className="btn">
              {editingId ? "Сохранить" : "Добавить"}
            </button>
          </>
        }
      >
        <form id="client-form" onSubmit={handleSubmit} className="grid">
          <InputField label="Название *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
          <InputField label="Телефон *" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} required />
          <InputField label="Организация" value={form.organization} onChange={(v) => setForm({ ...form, organization: v })} />
          <InputField label="Сфера деятельности" value={form.activityField} onChange={(v) => setForm({ ...form, activityField: v })} />
          <InputField label="Контакт" value={form.contactName} onChange={(v) => setForm({ ...form, contactName: v })} />
        </form>
      </Modal>
    </div>
  );
}

export default ClientsPage;



