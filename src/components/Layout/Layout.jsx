import { NavLink } from "react-router-dom";
import { useAuth } from "../../store/AuthContext.jsx";

const navItems = [
  { to: "/", label: "Общий отчёт" },
  { to: "/clients", label: "Клиенты" },
  { to: "/employees", label: "Сотрудники" },
  { to: "/incomes", label: "Доходы" },
  { to: "/fixed-expenses", label: "Постоянные расходы" },
  { to: "/variable-expenses", label: "Разовые расходы" },
  { to: "/reports", label: "Отчеты" },
  { to: "/calculator", label: "Калькулятор" },
  { to: "/settings", label: "Настройки" },
];

function Layout({ children }) {
  const { logout } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h1>Finance Admin</h1>
        <nav>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div>
          <button
            className="btn secondary"
            onClick={logout}
            style={{ width: "100%" }}
          >
            Выйти
          </button>
        </div>
      </aside>
      <main className="content">{children}</main>
    </div>
  );
}

export default Layout;



