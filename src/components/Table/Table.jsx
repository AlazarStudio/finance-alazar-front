function Table({ columns, data, onRowClick, rowKey }) {
  return (
    <table className="table">
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.key || col.label}>{col.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.length === 0 ? (
          <tr>
            <td colSpan={columns.length}>Нет данных</td>
          </tr>
        ) : (
          data.map((row) => (
            <tr
              key={rowKey ? rowKey(row) : row.id || row._key || JSON.stringify(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              style={{ cursor: onRowClick ? "pointer" : "default" }}
            >
              {columns.map((col) => (
                <td key={col.key || col.label}>
                  {col.render ? col.render(row) : row[col.key] || ""}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

export default Table;

