import InputField from "../Forms/InputField.jsx";

function DateRangeFilter({ from, to, onChangeFrom, onChangeTo }) {
  return (
    <div className="filters">
      <InputField label="Дата с" type="date" value={from || ""} onChange={onChangeFrom} />
      <InputField label="Дата по" type="date" value={to || ""} onChange={onChangeTo} />
    </div>
  );
}

export default DateRangeFilter;




