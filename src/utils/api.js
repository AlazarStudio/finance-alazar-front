const API_BASE_URL = "https://backendfinance.demoalazar.ru/api";

async function request(endpoint, options = {}) {
  try {
    // Позволяем передать токен напрямую в options для избежания race condition
    const token = options.token || localStorage.getItem("authToken");
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Удаляем token из options, чтобы не отправлять его в body
    const { token: _, ...fetchOptions } = options;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers,
      ...fetchOptions,
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Токен недействителен, удаляем его
        localStorage.removeItem("authToken");
        // Не делаем редирект здесь, пусть AuthContext обработает это
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
}

export const api = {
  // Авторизация
  login: async (username, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.token;
    } catch (error) {
      console.error("Login failed:", error);
      return null;
    }
  },

  verifyToken: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        return { valid: false };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return { valid: false };
    }
  },

  // Получить все данные
  getData: () => request("/data"),

  // Обновить все данные
  updateData: (data) => request("/data", { method: "PUT", body: JSON.stringify(data) }),

  // Clients
  getClients: () => request("/clients"),
  addClient: (client) => request("/clients", { method: "POST", body: JSON.stringify(client) }),
  updateClient: (id, client) => request(`/clients/${id}`, { method: "PUT", body: JSON.stringify(client) }),
  deleteClient: (id) => request(`/clients/${id}`, { method: "DELETE" }),

  // Employees
  getEmployees: () => request("/employees"),
  addEmployee: (employee) => request("/employees", { method: "POST", body: JSON.stringify(employee) }),
  updateEmployee: (id, employee) => request(`/employees/${id}`, { method: "PUT", body: JSON.stringify(employee) }),
  deleteEmployee: (id) => request(`/employees/${id}`, { method: "DELETE" }),

  // Incomes
  getIncomes: () => request("/incomes"),
  addIncome: (income) => request("/incomes", { method: "POST", body: JSON.stringify(income) }),
  updateIncome: (id, income) => request(`/incomes/${id}`, { method: "PUT", body: JSON.stringify(income) }),
  deleteIncome: (id) => request(`/incomes/${id}`, { method: "DELETE" }),

  // Fixed Expenses
  getFixedExpenses: () => request("/fixed-expenses"),
  addFixedExpense: (expense) => request("/fixed-expenses", { method: "POST", body: JSON.stringify(expense) }),
  updateFixedExpense: (id, expense) => request(`/fixed-expenses/${id}`, { method: "PUT", body: JSON.stringify(expense) }),
  deleteFixedExpense: (id) => request(`/fixed-expenses/${id}`, { method: "DELETE" }),

  // Variable Expenses
  getVariableExpenses: () => request("/variable-expenses"),
  addVariableExpense: (expense) => request("/variable-expenses", { method: "POST", body: JSON.stringify(expense) }),
  updateVariableExpense: (id, expense) => request(`/variable-expenses/${id}`, { method: "PUT", body: JSON.stringify(expense) }),
  deleteVariableExpense: (id) => request(`/variable-expenses/${id}`, { method: "DELETE" }),

  // Expense Categories
  getExpenseCategories: () => request("/expense-categories"),
  addExpenseCategory: (category) => request("/expense-categories", { method: "POST", body: JSON.stringify(category) }),
  updateExpenseCategory: (id, category) => request(`/expense-categories/${id}`, { method: "PUT", body: JSON.stringify(category) }),
  deleteExpenseCategory: (id) => request(`/expense-categories/${id}`, { method: "DELETE" }),

  // Organization
  getOrganization: () => request("/organization"),
  updateOrganization: (org) => request("/organization", { method: "PUT", body: JSON.stringify(org) }),

  // App Settings
  getAppSettings: () => request("/app-settings"),
  updateAppSettings: (settings) => request("/app-settings", { method: "PUT", body: JSON.stringify(settings) }),
};

