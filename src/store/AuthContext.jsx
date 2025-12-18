import { createContext, useContext, useState, useEffect } from "react";
import { api } from "../utils/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    
    // Проверяем наличие токена при загрузке
    const token = localStorage.getItem("authToken");
    if (token) {
      // Проверяем валидность токена
      api.verifyToken(token)
        .then((response) => {
          if (!cancelled) {
            // verifyToken возвращает объект { valid: true } или { valid: false }
            setIsAuthenticated(response?.valid === true);
            setLoading(false);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setIsAuthenticated(false);
            setLoading(false);
          }
        });
    } else {
      setLoading(false);
    }
    
    return () => {
      cancelled = true;
    };
  }, []);

  const login = (token) => {
    // Убеждаемся, что токен сохранен перед установкой isAuthenticated
    if (token) {
      localStorage.setItem("authToken", token);
    }
    // Устанавливаем isAuthenticated синхронно, чтобы компоненты сразу обновились
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
