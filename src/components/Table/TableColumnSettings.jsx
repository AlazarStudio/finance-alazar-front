import { useState, useRef, useEffect } from "react";
import Modal from "../Modal/Modal.jsx";

function TableColumnSettings({ columns, storageKey, onColumnsChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(() => {
    try {
      const saved = localStorage.getItem(`table-columns-${storageKey}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Проверяем, что все колонки есть в сохраненных настройках
        const allKeys = columns.map((col) => col.key || col.label);
        const savedKeys = Object.keys(parsed);
        const hasAllColumns = allKeys.every((key) => savedKeys.includes(key));
        if (hasAllColumns) {
          return parsed;
        }
      }
      // По умолчанию все колонки видимы
      const defaultVisible = {};
      columns.forEach((col) => {
        const key = col.key || col.label;
        defaultVisible[key] = true;
      });
      return defaultVisible;
    } catch (e) {
      const defaultVisible = {};
      columns.forEach((col) => {
        const key = col.key || col.label;
        defaultVisible[key] = true;
      });
      return defaultVisible;
    }
  });

  useEffect(() => {
    // Сохраняем в localStorage при изменении
    localStorage.setItem(`table-columns-${storageKey}`, JSON.stringify(visibleColumns));
    // Уведомляем родительский компонент
    if (onColumnsChange) {
      onColumnsChange(visibleColumns);
    }
  }, [visibleColumns, storageKey, onColumnsChange]);

  const toggleColumn = (key) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const resetToDefault = () => {
    const defaultVisible = {};
    columns.forEach((col) => {
      const key = col.key || col.label;
      defaultVisible[key] = true;
    });
    setVisibleColumns(defaultVisible);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
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
        title="Настройки колонок"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="currentColor"
          style={{ display: "block" }}
        >
          <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5a3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97c0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.4-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1c0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66Z" />
        </svg>
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Настройка отображения колонок"
        actions={
          <>
            <button type="button" className="btn secondary" onClick={resetToDefault}>
              Сбросить
            </button>
            <button type="button" className="btn" onClick={() => setIsOpen(false)}>
              Закрыть
            </button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {columns.map((col) => {
            const key = col.key || col.label;
            const isVisible = visibleColumns[key] !== false;
            return (
              <label
                key={key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "8px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "background-color 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <input
                  type="checkbox"
                  checked={isVisible}
                  onChange={() => toggleColumn(key)}
                  style={{ cursor: "pointer" }}
                />
                <span>{col.label}</span>
              </label>
            );
          })}
        </div>
      </Modal>
    </>
  );
}

export default TableColumnSettings;

