function SelectField({ label, value, onChange, options, required, placeholder }) {
  return (
    <div className="input-group">
      <label>
        {label} {required ? "*" : ""}
      </label>
      <select value={value || ""} required={required} onChange={(e) => onChange(e.target.value)}>
        <option value="">{placeholder || "Не выбрано"}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default SelectField;




