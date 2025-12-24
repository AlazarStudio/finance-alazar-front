import { useState, useMemo } from "react";

function Table({ columns, data, onRowClick, rowKey, totals, visibleColumns }) {
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc"); // "asc" | "desc"

  // Фильтруем колонки на основе visibleColumns
  const filteredColumns = visibleColumns
    ? columns.filter((col) => {
        const key = col.key || col.label;
        return visibleColumns[key] !== false;
      })
    : columns;

  // Сортируем данные
  const sortedData = useMemo(() => {
    if (!sortColumn) return data;

    return [...data].sort((a, b) => {
      const col = filteredColumns.find((c) => (c.key || c.label) === sortColumn);
      if (!col) return 0;

      // Если есть sortKey, используем его для сортировки
      const sortKey = col.sortKey || col.key || col.label;
      let aValue = a[sortKey];
      let bValue = b[sortKey];

      // Если значение undefined, используем sortKey если он указан
      if (aValue === undefined && col.sortKey) {
        aValue = a[col.sortKey];
      }
      if (bValue === undefined && col.sortKey) {
        bValue = b[col.sortKey];
      }
      
      // Если есть функция sortValue, используем её для получения значения для сортировки
      if (col.sortValue) {
        aValue = col.sortValue(a);
        bValue = col.sortValue(b);
      }

      // Обработка разных типов данных
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }

      if (aValue === null || aValue === undefined) aValue = "";
      if (bValue === null || bValue === undefined) bValue = "";

      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();

      if (sortDirection === "asc") {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });
  }, [data, sortColumn, sortDirection, filteredColumns]);

  const handleSort = (columnKey) => {
    if (sortColumn === columnKey) {
      // Переключаем направление сортировки
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Устанавливаем новую колонку и направление по умолчанию
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
  };

  const isSortable = (col) => {
    // Не сортируем колонки с действиями
    return col.key !== "actions" && !col.label.toLowerCase().includes("действия");
  };

  return (
    <table className="table">
      <thead>
        <tr>
          {filteredColumns.map((col) => {
            const columnKey = col.key || col.label;
            const sortable = isSortable(col);
            const isSorted = sortColumn === columnKey;

            return (
              <th
                key={columnKey}
                onClick={sortable ? () => handleSort(columnKey) : undefined}
                style={{
                  cursor: sortable ? "pointer" : "default",
                  userSelect: "none",
                  position: "relative",
                  paddingRight: sortable ? "20px" : undefined,
                }}
                onMouseEnter={(e) => {
                  if (sortable) {
                    e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (sortable) {
                    e.currentTarget.style.backgroundColor = "";
                  }
                }}
              >
                {col.label}
                {sortable && isSorted && (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      position: "absolute",
                      right: "4px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#ffffff",
                    }}
                  >
                    {sortDirection === "asc" ? (
                      <path d="M18 15l-6-6-6 6" />
                    ) : (
                      <path d="M6 9l6 6 6-6" />
                    )}
                  </svg>
                )}
                {sortable && !isSorted && (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      position: "absolute",
                      right: "4px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#ffffff",
                      opacity: 0.5,
                    }}
                  >
                    <path d="M8 9l4-4 4 4M8 15l4 4 4-4" />
                  </svg>
                )}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {sortedData.length === 0 ? (
          <tr>
            <td colSpan={filteredColumns.length}>Нет данных</td>
          </tr>
        ) : (
          <>
            {sortedData.map((row) => (
              <tr
                key={rowKey ? rowKey(row) : row.id || row._key || JSON.stringify(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                style={{ cursor: onRowClick ? "pointer" : "default" }}
              >
                {filteredColumns.map((col) => (
                  <td key={col.key || col.label}>
                    {col.render ? col.render(row) : row[col.key] || ""}
                  </td>
                ))}
              </tr>
            ))}
            {totals && (
              <tr style={{ backgroundColor: "var(--bg-tertiary)", fontWeight: "600" }}>
                {filteredColumns.map((col, index) => {
                  const totalValue = totals[col.key];
                  if (totalValue !== undefined && totalValue !== "") {
                    return (
                      <td key={col.key || col.label}>
                        {typeof totalValue === "number" ? totalValue.toLocaleString() : totalValue}
                      </td>
                    );
                  }
                  // Первая колонка показывает "Всего", если значение не задано
                  if (index === 0 && (totalValue === undefined || totalValue === "")) {
                    return <td key={col.key || col.label}>Всего</td>;
                  }
                  return <td key={col.key || col.label}></td>;
                })}
              </tr>
            )}
          </>
        )}
      </tbody>
    </table>
  );
}

export default Table;

