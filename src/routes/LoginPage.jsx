import { useState } from "react";
import InputField from "../components/Forms/InputField.jsx";
import { api } from "../utils/api.js";

function LoginPage({ onLogin }) {
  const [form, setForm] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const token = await api.login(form.username, form.password);
      if (token) {
        // Сохраняем токен в localStorage
        localStorage.setItem("authToken", token);
        // Вызываем onLogin только после того, как токен сохранен
        // Используем setTimeout для гарантии, что токен сохранен перед следующей операцией
        await new Promise(resolve => setTimeout(resolve, 0));
        onLogin(token);
      } else {
        setError("Неверный логин или пароль");
      }
    } catch (err) {
      setError("Ошибка при входе. Проверьте подключение к серверу.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      minHeight: "100vh",
      background: "var(--bg-primary)"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "400px",
        padding: "32px",
        backgroundColor: "var(--bg-secondary)",
        borderRadius: "12px",
        boxShadow: "0 4px 6px var(--shadow)"
      }}>
        <h2 style={{ marginTop: 0, marginBottom: "24px", textAlign: "center" }}>
          Вход в систему
        </h2>
        
        <form onSubmit={handleSubmit}>
          <InputField
            label="Логин"
            value={form.username}
            onChange={(v) => setForm({ ...form, username: v })}
            required
            autoFocus
          />
          
          <InputField
            label="Пароль"
            type="password"
            value={form.password}
            onChange={(v) => setForm({ ...form, password: v })}
            required
          />

          {error && (
            <div style={{
              padding: "12px",
              marginBottom: "16px",
              backgroundColor: "#fee2e2",
              color: "#991b1b",
              borderRadius: "8px",
              fontSize: "14px"
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn"
            disabled={loading}
            style={{ width: "100%", marginTop: "8px" }}
          >
            {loading ? "Вход..." : "Войти"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
