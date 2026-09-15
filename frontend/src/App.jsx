import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Board from "./pages/Board";
import Users from "./pages/Users";

function App() {
  const token = localStorage.getItem("token");
  const usuario = JSON.parse(localStorage.getItem("usuario") || "null");
  const path = window.location.pathname;

  if (!token || !usuario || usuario.activo === false) {
    if (token || usuario) {
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
    }
    return <Login />;
  }

  if (path === "/board") {
    return <Board />;
  }

  if (path === "/usuarios") {
    if (usuario.rol !== "ADMIN") {
      return <Dashboard />;
    }
    return <Users />;
  }

  return <Dashboard />;
}

export default App;