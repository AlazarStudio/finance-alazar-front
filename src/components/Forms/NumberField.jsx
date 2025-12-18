function NumberField({ label, value, onChange, required, min, max, step, readOnly }) {
  return (
    <div className="input-group">
      <label>
        {label} {required ? "*" : ""}
      </label>
      <input
        type="number"
        value={value ?? ""}
        min={min}
        max={max}
        step={step}
        required={required}
        readOnly={readOnly}
        onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
        style={readOnly ? { backgroundColor: "#f1f5f9", cursor: "not-allowed" } : {}}
      />
    </div>
  );
}

export default NumberField;



