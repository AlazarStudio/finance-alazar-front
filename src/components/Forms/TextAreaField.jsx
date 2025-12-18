function TextAreaField({ label, value, onChange, required, placeholder }) {
  return (
    <div className="input-group">
      <label>
        {label} {required ? "*" : ""}
      </label>
      <textarea
        rows="3"
        value={value || ""}
        placeholder={placeholder}
        required={required}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export default TextAreaField;




