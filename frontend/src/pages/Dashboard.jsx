import { useCallback, useEffect, useState } from "react";
import api from "../api/axios";
import "./Dashboard.css";

function Dashboard() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const metricsLambdaUrl = import.meta.env.VITE_METRICS_LAMBDA_URL;

  const [metricas, setMetricas] = useState({
    total: 0,
    pendientes: 0,
    enCurso: 0,
    hechas: 0,
  });

  const cargarMetricas = useCallback(async () => {
    try {
      let datosMetricas;

      if (metricsLambdaUrl) {
        const notasRespuesta = await api.get("/notas");
        const lambdaRespuesta = await fetch(metricsLambdaUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            notas: notasRespuesta.data.notas || [],
          }),
        });

        if (!lambdaRespuesta.ok) {
          throw new Error("No se pudieron calcular las métricas con Lambda");
        }

        datosMetricas = await lambdaRespuesta.json();
      } else {
        const respuesta = await api.get("/metricas");
        datosMetricas = respuesta.data;
      }

      setMetricas(datosMetricas.metricas || {
        total: 0,
        pendientes: 0,
        enCurso: 0,
        hechas: 0,
      });
    } catch (error) {
      console.error("Error cargando métricas:", error);
    }
  }, [metricsLambdaUrl]);

  useEffect(() => {
    const cargaInicial = window.setTimeout(cargarMetricas, 0);

    return () => window.clearTimeout(cargaInicial);
  }, [cargarMetricas]);

  const total = metricas.total;
  const pendientes = metricas.pendientes;
  const enCurso = metricas.enCurso;
  const hechas = metricas.hechas;

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.href = "/";
  };

  const irAlTablero = () => {
    window.location.href = "/board";
  };

  const irAUsuarios = () => {
    window.location.href = "/usuarios";
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

          <span className="role">
            {usuario?.rol}
          </span>

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

            <strong>{total}</strong>
          </div>

          <div className="metric-card">
            <span className="metric-title">
              Pendientes
            </span>

            <strong>{pendientes}</strong>
          </div>

          <div className="metric-card">
            <span className="metric-title">
              En curso
            </span>

            <strong>{enCurso}</strong>
          </div>

          <div className="metric-card">
            <span className="metric-title">
              Hechas
            </span>

            <strong>{hechas}</strong>
          </div>

        </section>

        <section className="dashboard-info">

          <h3>Tablero de equipo</h3>

          <p>
            Desde el tablero puedes crear, editar,
            cambiar el estado y eliminar las notas
            del equipo.
          </p>

          <div className="dashboard-actions">
            <button
              className="board-button"
              onClick={irAlTablero}
            >
              Ir al tablero
            </button>

            {usuario?.rol === "ADMIN" && (
              <button
                className="users-button"
                onClick={irAUsuarios}
              >
                Gestionar usuarios
              </button>
            )}
          </div>

        </section>

      </main>

    </div>
  );
}

export default Dashboard;
