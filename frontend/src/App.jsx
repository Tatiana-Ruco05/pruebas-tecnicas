import { useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Board from "./pages/Board";
import Users from "./pages/Users";
import Sidebar from "./components/Sidebar";
import "./pages/Dashboard.css";

function App() {
  const token = localStorage.getItem("token");
  const usuario = JSON.parse(localStorage.getItem("usuario") || "null");
  const path = window.location.pathname;
  const paginaInicial = path === "/board"
    ? "board"
    : path === "/usuarios" && usuario?.rol === "ADMIN"
      ? "users"
      : "dashboard";
  const [paginaActiva, setPaginaActiva] = useState(paginaInicial);

  if (!token || !usuario || usuario.activo === false) {
    if (token || usuario) {
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
    }
    return <Login />;
  }

  return (
    <div className="dashboard">
      <Sidebar
        usuario={usuario}
        activePage={paginaActiva}
        onNavigate={setPaginaActiva}
      />
      <main className="dashboard-main">
        {paginaActiva === "board" && <Board />}
        {paginaActiva === "users" && usuario.rol === "ADMIN" && <Users />}
        {paginaActiva === "dashboard" && <Dashboard />}
      </main>
    </div>
  );
}

export default App;