import { useState } from "react";
import api from "../api/axios";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem(
        "usuario",
        JSON.stringify(response.data.usuario)
      );

      window.location.href = "/dashboard";

    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Error al iniciar sesión"
      );
    }
  };

  return (
    <div className="login-container">

      <div className="login-card">

        <h1>APP PRUEBA</h1>

        <p>Portal de Equipo</p>

        <form onSubmit={handleLogin}>

          <label>Correo electrónico</label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@apprueba.com"
            required
          />

          <label>Contraseña</label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            required
          />

          {error && (
            <div className="error">
              {error}
            </div>
          )}

          <button type="submit">
            Iniciar sesión
          </button>

        </form>

      </div>

    </div>
  );
}

export default Login;