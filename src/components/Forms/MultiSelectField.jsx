import { useState, useRef, useEffect } from "react";

function MultiSelectField({ label, value = [], onChange, options, required, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const toggleOption = (optionValue) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  const selectedLabels = options
    .filter((opt) => value.includes(opt.value))
    .map((opt) => opt.label)
    .join(", ");

  return (
    <div className="input-group" ref={containerRef}>
      <label>
        {label} {required ? "*" : ""}
      </label>
      <div style={{ position: "relative" }}>
        <div
          onClick={() => setIsOpen(!isOpen)}
          style={{
            padding: "10px 12px",
            borderRadius: "8px",
            border: "1px solid var(--border-color-light)",
            background: "var(--bg-secondary)",
            color: "var(--text-primary)",
            cursor: "pointer",
            minHeight: "42px",
            display: "flex",
            alignItems: "center",
            transition: "border-color 0.3s ease",
            outline: "none",
          }}
          onFocus={(e) => {
            e.target.style.outline = "none";
          }}
        >
          <span style={{ flex: 1, color: selectedLabels ? "var(--text-primary)" : "var(--text-secondary)" }}>
            {selectedLabels || placeholder || "Не выбрано"}
          </span>
          <span style={{ marginLeft: "8px" }}>{isOpen ? "▲" : "▼"}</span>
        </div>
        {isOpen && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              marginTop: "4px",
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-color-light)",
              borderRadius: "8px",
              boxShadow: "0 4px 6px var(--shadow)",
              zIndex: 1000,
              maxHeight: "200px",
              overflowY: "auto",
              outline: "none",
            }}
          >
            {options.map((opt) => (
              <div
                key={opt.value}
                onClick={() => toggleOption(opt.value)}
                style={{
                  padding: "10px 12px",
                  cursor: "pointer",
                  backgroundColor: value.includes(opt.value) ? "var(--bg-tertiary)" : "transparent",
                  color: "var(--text-primary)",
                  transition: "background-color 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (!value.includes(opt.value)) {
                    e.target.style.backgroundColor = "var(--bg-tertiary)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!value.includes(opt.value)) {
                    e.target.style.backgroundColor = "transparent";
                  }
                }}
              >
                <input
                  type="checkbox"
                  checked={value.includes(opt.value)}
                  onChange={() => {}}
                  style={{ marginRight: "8px" }}
                />
                {opt.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MultiSelectField;

