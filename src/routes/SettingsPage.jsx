import { useState } from "react";
import InputField from "../components/Forms/InputField.jsx";
import NumberField from "../components/Forms/NumberField.jsx";
import SelectField from "../components/Forms/SelectField.jsx";
import { useAppStore } from "../store/AppStoreContext.jsx";

function SettingsPage() {
  const { state, updateOrganization, updateAppSettings } = useAppStore();
  
  const defaultOrg = {
    name: "",
    inn: "",
    address: "",
    phone: "",
    email: "",
    website: "",
  };
  
  const defaultApp = {
    currency: "₽",
    dateFormat: "DD.MM.YYYY",
    language: "ru",
    taxPercent: "",
    theme: "light",
  };

  const [orgForm, setOrgForm] = useState(state.organization || defaultOrg);
  const [appForm, setAppForm] = useState(state.appSettings || defaultApp);

  const handleOrgSubmit = (e) => {
    e.preventDefault();
    updateOrganization(orgForm);
    alert("Настройки организации сохранены");
  };

  const handleAppSubmit = (e) => {
    e.preventDefault();
    updateAppSettings(appForm);
    alert("Настройки приложения сохранены");
  };

  return (
    <div>
      <div className="page-header">
        <h2>Настройки</h2>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0, marginBottom: 16 }}>Настройки организации</h3>
        <form onSubmit={handleOrgSubmit} className="grid">
          <InputField
            label="Название организации"
            value={orgForm.name}
            onChange={(v) => setOrgForm({ ...orgForm, name: v })}
          />
          <InputField
            label="ИНН"
            value={orgForm.inn}
            onChange={(v) => setOrgForm({ ...orgForm, inn: v })}
          />
          <InputField
            label="Адрес"
            value={orgForm.address}
            onChange={(v) => setOrgForm({ ...orgForm, address: v })}
          />
          <InputField
            label="Телефон"
            value={orgForm.phone}
            onChange={(v) => setOrgForm({ ...orgForm, phone: v })}
          />
          <InputField
            label="Email"
            type="email"
            value={orgForm.email}
            onChange={(v) => setOrgForm({ ...orgForm, email: v })}
          />
          <InputField
            label="Веб-сайт"
            value={orgForm.website}
            onChange={(v) => setOrgForm({ ...orgForm, website: v })}
          />
          <div style={{ marginTop: 8 }}>
            <button className="btn" type="submit">
              Сохранить
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0, marginBottom: 16 }}>Настройки приложения</h3>
        <form onSubmit={handleAppSubmit} className="grid">
          <InputField
            label="Валюта"
            value={appForm.currency}
            onChange={(v) => setAppForm({ ...appForm, currency: v })}
            placeholder="₽"
          />
          <SelectField
            label="Формат даты"
            value={appForm.dateFormat}
            onChange={(v) => setAppForm({ ...appForm, dateFormat: v })}
            options={[
              { value: "DD.MM.YYYY", label: "DD.MM.YYYY (31.12.2024)" },
              { value: "MM/DD/YYYY", label: "MM/DD/YYYY (12/31/2024)" },
              { value: "YYYY-MM-DD", label: "YYYY-MM-DD (2024-12-31)" },
            ]}
            placeholder="Выберите формат"
          />
          <SelectField
            label="Язык"
            value={appForm.language}
            onChange={(v) => setAppForm({ ...appForm, language: v })}
            options={[
              { value: "ru", label: "Русский" },
              { value: "en", label: "English" },
            ]}
            placeholder="Выберите язык"
          />
          <NumberField
            label="Процент налога по умолчанию"
            value={appForm.taxPercent}
            onChange={(v) => setAppForm({ ...appForm, taxPercent: v })}
            placeholder="Например, 20"
          />
          <SelectField
            label="Тема оформления"
            value={appForm.theme}
            onChange={(v) => setAppForm({ ...appForm, theme: v })}
            options={[
              { value: "light", label: "Светлая" },
              { value: "dark", label: "Темная" },
            ]}
            placeholder="Выберите тему"
          />
          <div style={{ marginTop: 8 }}>
            <button className="btn" type="submit">
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SettingsPage;



