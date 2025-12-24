import { useState, useRef, useEffect } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

function AutocompleteSelectField({ label, value, onChange, options, required, placeholder, onAddNew, showAddButton }) {
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = value ? options.find((opt) => opt.value === value) || null : null;

  return (
    <div className="input-group" style={{ position: "relative" }}>
      <label>
        {label} {required ? "*" : ""}
      </label>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
        <div style={{ flex: 1, position: "relative" }}>
          <Autocomplete
            value={selectedOption}
            onChange={(event, newValue) => {
              onChange(newValue ? newValue.value : "");
              if (!newValue) {
                setInputValue("");
              }
            }}
            inputValue={inputValue}
            onInputChange={(event, newInputValue) => {
              setInputValue(newInputValue);
            }}
            onOpen={() => setIsOpen(true)}
            onClose={() => setIsOpen(false)}
            options={options}
            getOptionLabel={(option) => option.label || ""}
            isOptionEqualToValue={(option, value) => option.value === value.value}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder={placeholder || "Выберите..."}
                required={required}
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    padding: "0 !important",
                    backgroundColor: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                    fontSize: "inherit",
                    fontFamily: "inherit",
                    borderRadius: "8px",
                    "& fieldset": {
                      borderColor: "var(--border-color-light)",
                      borderWidth: "1px",
                      borderRadius: "8px",
                    },
                    "&:hover fieldset": {
                      borderColor: "var(--border-color-light)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "var(--btn-primary)",
                      outline: "none",
                    },
                    "& input": {
                      padding: "10px 12px !important",
                      height: "auto",
                      color: "var(--text-primary)",
                      outline: "none",
                    },
                    "&:focus": {
                      outline: "none",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    display: "none",
                  },
                }}
              />
            )}
            sx={{
              "& .MuiAutocomplete-popper": {
                zIndex: 10000,
              },
            }}
            ListboxProps={{
              style: {
                backgroundColor: "var(--bg-secondary)",
                color: "var(--text-primary)",
                maxHeight: "300px",
                border: "1px solid var(--border-color-light)",
                borderRadius: "8px",
                marginTop: "4px",
                boxShadow: "0 4px 6px var(--shadow)",
                outline: "none",
              },
            }}
            noOptionsText="Нет вариантов"
            filterOptions={(options, { inputValue }) => {
              if (!inputValue) return options;
              const search = inputValue.toLowerCase();
              return options.filter((option) => option.label.toLowerCase().includes(search));
            }}
            componentsProps={{
              paper: {
                sx: {
                  backgroundColor: "var(--bg-secondary)",
                  color: "var(--text-primary)",
                  "& .MuiAutocomplete-noOptions": {
                    color: "var(--text-primary)",
                  },
                  "& .MuiAutocomplete-option": {
                    color: "var(--text-primary)",
                    "&:hover": {
                      backgroundColor: "var(--bg-tertiary)",
                    },
                    "&[aria-selected='true']": {
                      backgroundColor: "var(--bg-tertiary)",
                    },
                  },
                },
              },
            }}
          />
        </div>
        {showAddButton && onAddNew && (
          <button
            type="button"
            onClick={onAddNew}
            style={{
              marginTop: "0",
              width: "42px",
              height: "42px",
              borderRadius: "8px",
              border: "1px solid var(--border-color-light)",
              background: "var(--bg-secondary)",
              color: "var(--text-primary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              fontWeight: "bold",
              transition: "all 0.2s ease",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "var(--btn-primary)";
              e.target.style.color = "#fff";
              e.target.style.borderColor = "var(--btn-primary)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "var(--bg-secondary)";
              e.target.style.color = "var(--text-primary)";
              e.target.style.borderColor = "var(--border-color-light)";
            }}
            title="Добавить нового клиента"
          >
            +
          </button>
        )}
      </div>
    </div>
  );
}

export default AutocompleteSelectField;

