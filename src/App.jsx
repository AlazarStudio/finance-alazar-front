import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout/Layout.jsx";
import LoginPage from "./routes/LoginPage.jsx";
import DashboardPage from "./routes/DashboardPage.jsx";
import ClientsPage from "./routes/ClientsPage.jsx";
import EmployeesPage from "./routes/EmployeesPage.jsx";
import IncomesPage from "./routes/IncomesPage.jsx";
import FixedExpensesPage from "./routes/FixedExpensesPage.jsx";
import VariableExpensesPage from "./routes/VariableExpensesPage.jsx";
import ReportsPage from "./routes/ReportsPage.jsx";
import SettingsPage from "./routes/SettingsPage.jsx";
import { AppStoreProvider, useAppStore } from "./store/AppStoreContext.jsx";
import { AuthProvider, useAuth } from "./store/AuthContext.jsx";

function ThemeProvider({ children }) {
  const { state } = useAppStore();

  useEffect(() => {
    const theme = state.appSettings?.theme || "light";
    if (theme === "dark") {
      document.body.classList.add("dark-theme");
    } else {
      document.body.classList.remove("dark-theme");
    }
  }, [state.appSettings?.theme]);

  return <>{children}</>;
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <div>Загрузка...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppRoutes() {
  const { isAuthenticated, login, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <div>Загрузка...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={login} />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/clients" element={<ClientsPage />} />
        <Route path="/employees" element={<EmployeesPage />} />
        <Route path="/incomes" element={<IncomesPage />} />
        <Route path="/fixed-expenses" element={<FixedExpensesPage />} />
        <Route path="/variable-expenses" element={<VariableExpensesPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppStoreProvider>
        <ThemeProvider>
          <AppRoutes />
        </ThemeProvider>
      </AppStoreProvider>
    </AuthProvider>
  );
}

export default App;



