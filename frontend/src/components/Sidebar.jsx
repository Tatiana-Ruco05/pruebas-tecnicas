function Sidebar({ usuario, activePage, onNavigate }) {
  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.href = "/";
  };

  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">AP</div>
        <div>
          <h1>APP PRUEBA</h1>
          <span>Portal de Equipo</span>
        </div>
      </div>

      <nav className="sidebar-menu">
        <button
          className={`sidebar-item ${activePage === "dashboard" ? "active" : ""}`}
          onClick={() => onNavigate("dashboard")}
        >
          <span className="sidebar-icon">⌂</span>
          <span>Dashboard</span>
        </button>

        <button
          className={`sidebar-item ${activePage === "board" ? "active" : ""}`}
          onClick={() => onNavigate("board")}
        >
          <span className="sidebar-icon">▣</span>
          <span>Tablero</span>
        </button>

        {usuario?.rol === "ADMIN" && (
          <button
            className={`sidebar-item ${activePage === "users" ? "active" : ""}`}
            onClick={() => onNavigate("users")}
          >
            <span className="sidebar-icon">♙</span>
            <span>Gestionar usuarios</span>
          </button>
        )}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            {usuario?.nombre?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="sidebar-user-data">
            <strong>{usuario?.nombre}</strong>
            <span>{usuario?.rol}</span>
          </div>
        </div>

        <button className="sidebar-logout" onClick={cerrarSesion}>
          <span className="sidebar-icon">↪</span>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
