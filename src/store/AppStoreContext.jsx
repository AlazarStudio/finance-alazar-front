import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../utils/api.js";
import { useAuth } from "./AuthContext.jsx";

const defaultAppState = {
  clients: [],
  employees: [],
  expenseCategories: [],
  fixedExpenses: [],
  variableExpenses: [],
  incomes: [],
  organization: {
    name: "",
    inn: "",
    address: "",
    phone: "",
    email: "",
    website: "",
  },
  appSettings: {
    currency: "₽",
    dateFormat: "DD.MM.YYYY",
    language: "ru",
    taxPercent: "",
    theme: "light",
  },
};

const AppStoreContext = createContext(null);

function generateId() {
  if (window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 10);
}

export function AppStoreProvider({ children }) {
  const [state, setState] = useState(defaultAppState);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Загружаем данные только если пользователь авторизован
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    // Загрузка данных с сервера
    const loadData = async () => {
      try {
        const data = await api.getData();
        setState({
          ...defaultAppState,
          ...data,
          organization: data.organization || defaultAppState.organization,
          appSettings: data.appSettings || defaultAppState.appSettings,
        });
      } catch (error) {
        console.error("Failed to load data from server:", error);
        // Если сервер недоступен, используем данные по умолчанию
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated]);

  const actions = useMemo(() => {
    const updateState = (updater) => {
      setState((prev) => {
        const newState = typeof updater === "function" ? updater(prev) : updater;
        // Сохранение на сервер в фоне
        api.updateData(newState).catch((error) => {
          console.error("Failed to save data to server:", error);
        });
        return newState;
      });
    };

    return {
      state,
      setState: updateState,
      loading,
      // Clients
      addClient: async (client) => {
        try {
          const newClient = await api.addClient(client);
          updateState((prev) => ({
            ...prev,
            clients: [...prev.clients, newClient],
          }));
          return newClient;
        } catch (error) {
          console.error("Failed to add client:", error);
          throw error;
        }
      },
      updateClient: async (id, patch) => {
        try {
          const updated = await api.updateClient(id, patch);
          updateState((prev) => ({
            ...prev,
            clients: prev.clients.map((item) => (item.id === id ? updated : item)),
          }));
          return updated;
        } catch (error) {
          console.error("Failed to update client:", error);
          throw error;
        }
      },
      deleteClient: async (id) => {
        try {
          await api.deleteClient(id);
          updateState((prev) => ({
            ...prev,
            clients: prev.clients.filter((item) => item.id !== id),
          }));
        } catch (error) {
          console.error("Failed to delete client:", error);
          throw error;
        }
      },

      // Employees
      addEmployee: async (employee) => {
        try {
          const newEmployee = await api.addEmployee(employee);
          updateState((prev) => ({
            ...prev,
            employees: [...prev.employees, newEmployee],
          }));
          return newEmployee;
        } catch (error) {
          console.error("Failed to add employee:", error);
          throw error;
        }
      },
      updateEmployee: async (id, patch) => {
        try {
          const updated = await api.updateEmployee(id, patch);
          updateState((prev) => ({
            ...prev,
            employees: prev.employees.map((item) => (item.id === id ? updated : item)),
          }));
          return updated;
        } catch (error) {
          console.error("Failed to update employee:", error);
          throw error;
        }
      },
      deleteEmployee: async (id) => {
        try {
          await api.deleteEmployee(id);
          updateState((prev) => ({
            ...prev,
            employees: prev.employees.filter((item) => item.id !== id),
          }));
        } catch (error) {
          console.error("Failed to delete employee:", error);
          throw error;
        }
      },

      // Incomes
      addIncome: async (income) => {
        try {
          const newIncome = await api.addIncome(income);
          updateState((prev) => ({
            ...prev,
            incomes: [...prev.incomes, newIncome],
          }));
          return newIncome;
        } catch (error) {
          console.error("Failed to add income:", error);
          throw error;
        }
      },
      updateIncome: async (id, patch) => {
        try {
          const updated = await api.updateIncome(id, patch);
          updateState((prev) => ({
            ...prev,
            incomes: prev.incomes.map((item) => (item.id === id ? updated : item)),
          }));
          return updated;
        } catch (error) {
          console.error("Failed to update income:", error);
          throw error;
        }
      },
      deleteIncome: async (id) => {
        try {
          await api.deleteIncome(id);
          updateState((prev) => ({
            ...prev,
            incomes: prev.incomes.filter((item) => item.id !== id),
          }));
        } catch (error) {
          console.error("Failed to delete income:", error);
          throw error;
        }
      },

      // Fixed expenses
      addFixedExpense: async (expense) => {
        try {
          const newExpense = await api.addFixedExpense(expense);
          updateState((prev) => ({
            ...prev,
            fixedExpenses: [...prev.fixedExpenses, newExpense],
          }));
          return newExpense;
        } catch (error) {
          console.error("Failed to add fixed expense:", error);
          throw error;
        }
      },
      updateFixedExpense: async (id, patch) => {
        try {
          const updated = await api.updateFixedExpense(id, patch);
          updateState((prev) => ({
            ...prev,
            fixedExpenses: prev.fixedExpenses.map((item) => (item.id === id ? updated : item)),
          }));
          return updated;
        } catch (error) {
          console.error("Failed to update fixed expense:", error);
          throw error;
        }
      },
      deleteFixedExpense: async (id) => {
        try {
          await api.deleteFixedExpense(id);
          updateState((prev) => ({
            ...prev,
            fixedExpenses: prev.fixedExpenses.filter((item) => item.id !== id),
          }));
        } catch (error) {
          console.error("Failed to delete fixed expense:", error);
          throw error;
        }
      },

      // Variable expenses
      addVariableExpense: async (expense) => {
        try {
          const newExpense = await api.addVariableExpense(expense);
          updateState((prev) => ({
            ...prev,
            variableExpenses: [...prev.variableExpenses, newExpense],
          }));
          return newExpense;
        } catch (error) {
          console.error("Failed to add variable expense:", error);
          throw error;
        }
      },
      updateVariableExpense: async (id, patch) => {
        try {
          const updated = await api.updateVariableExpense(id, patch);
          updateState((prev) => ({
            ...prev,
            variableExpenses: prev.variableExpenses.map((item) => (item.id === id ? updated : item)),
          }));
          return updated;
        } catch (error) {
          console.error("Failed to update variable expense:", error);
          throw error;
        }
      },
      deleteVariableExpense: async (id) => {
        try {
          await api.deleteVariableExpense(id);
          updateState((prev) => ({
            ...prev,
            variableExpenses: prev.variableExpenses.filter((item) => item.id !== id),
          }));
        } catch (error) {
          console.error("Failed to delete variable expense:", error);
          throw error;
        }
      },

      // Expense categories
      addExpenseCategory: async (category) => {
        try {
          const newCategory = await api.addExpenseCategory(category);
          updateState((prev) => ({
            ...prev,
            expenseCategories: [...prev.expenseCategories, newCategory],
          }));
          return newCategory;
        } catch (error) {
          console.error("Failed to add expense category:", error);
          throw error;
        }
      },
      updateExpenseCategory: async (id, patch) => {
        try {
          const updated = await api.updateExpenseCategory(id, patch);
          updateState((prev) => ({
            ...prev,
            expenseCategories: prev.expenseCategories.map((item) => (item.id === id ? updated : item)),
          }));
          return updated;
        } catch (error) {
          console.error("Failed to update expense category:", error);
          throw error;
        }
      },
      deleteExpenseCategory: async (id) => {
        try {
          await api.deleteExpenseCategory(id);
          updateState((prev) => ({
            ...prev,
            expenseCategories: prev.expenseCategories.filter((item) => item.id !== id),
          }));
        } catch (error) {
          console.error("Failed to delete expense category:", error);
          throw error;
        }
      },

      // Organization settings
      updateOrganization: async (patch) => {
        try {
          const updated = await api.updateOrganization(patch);
          updateState((prev) => ({
            ...prev,
            organization: updated,
          }));
          return updated;
        } catch (error) {
          console.error("Failed to update organization:", error);
          throw error;
        }
      },

      // App settings
      updateAppSettings: async (patch) => {
        try {
          const updated = await api.updateAppSettings(patch);
          updateState((prev) => ({
            ...prev,
            appSettings: updated,
          }));
          return updated;
        } catch (error) {
          console.error("Failed to update app settings:", error);
          throw error;
        }
      },
    };
  }, [state, loading]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <div>Загрузка...</div>
      </div>
    );
  }

  return <AppStoreContext.Provider value={actions}>{children}</AppStoreContext.Provider>;
}

export function useAppStore() {
  const ctx = useContext(AppStoreContext);
  if (!ctx) {
    throw new Error("useAppStore must be used within AppStoreProvider");
  }
  return ctx;
}



