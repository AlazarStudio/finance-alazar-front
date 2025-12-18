function InputField({ label, value, onChange, required, type = "text", placeholder }) {
  return (
    <div className="input-group">
      <label>
        {label} {required ? "*" : ""}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        required={required}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export default InputField;




