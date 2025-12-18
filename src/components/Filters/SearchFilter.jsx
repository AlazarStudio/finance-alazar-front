import InputField from "../Forms/InputField.jsx";

function SearchFilter({ value, onChange, placeholder }) {
  return (
    <div className="filters">
      <InputField label="Поиск" value={value} onChange={onChange} placeholder={placeholder} />
    </div>
  );
}

export default SearchFilter;




