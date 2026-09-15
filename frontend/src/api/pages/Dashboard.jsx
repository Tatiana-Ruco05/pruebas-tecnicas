import "./Dashboard.css";

function Dashboard() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.reload();
  };

  return (
    <div className="dashboard">

      <header className="dashboard-header">
        <div>
          <h1>APP PRUEBA</h1>
          <p>Portal de Equipo</p>
        </div>

        <div className="user-info">
          <span>{usuario?.nombre}</span>
          <span className="role">{usuario?.rol}</span>

          <button onClick={cerrarSesion}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="dashboard-content">

        <h2>Dashboard</h2>

        <p className="welcome">
          Bienvenido, {usuario?.nombre}
        </p>

        <section className="metrics">

          <div className="metric-card">
            <span className="metric-title">
              Total de notas
            </span>

            <strong>0</strong>
          </div>

          <div className="metric-card">
            <span className="metric-title">
              Pendientes
            </span>

            <strong>0</strong>
          </div>

          <div className="metric-card">
            <span className="metric-title">
              En curso
            </span>

            <strong>0</strong>
          </div>

          <div className="metric-card">
            <span className="metric-title">
              Hechas
            </span>

            <strong>0</strong>
          </div>

        </section>

        <section className="dashboard-info">

          <h3>Tablero de equipo</h3>

          <p>
            Desde el tablero podrás crear, editar, mover y
            eliminar las notas del equipo.
          </p>

          <button className="board-button">
            Ir al tablero
          </button>

        </section>

      </main>

    </div>
  );
}

export default Dashboard;