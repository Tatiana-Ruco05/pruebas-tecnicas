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
          throw new Error(
            "No se pudieron calcular las métricas con Lambda"
          );
        }

        datosMetricas = await lambdaRespuesta.json();
      } else {
        const respuesta = await api.get("/metricas");
        datosMetricas = respuesta.data;
      }

      setMetricas(
        datosMetricas.metricas || {
          total: 0,
          pendientes: 0,
          enCurso: 0,
          hechas: 0,
        }
      );
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

  return (
    <div className="dashboard-content">

        {/* ENCABEZADO DEL CONTENIDO */}

        <div className="dashboard-top">

          <div>
            <h2>Dashboard</h2>

            <p>
              Bienvenido, {usuario?.nombre}
            </p>
          </div>

          <div className="dashboard-role">
            {usuario?.rol}
          </div>

        </div>

        {/* =================================================
            MÉTRICAS
        ================================================= */}

        <section className="metrics-section">

          <div className="metrics-header">
            <h3>Indicadores clave</h3>
          </div>

          <div className="metrics">

            <div className="metric-card">

              <span className="metric-title">
                Total de registros
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
                Finalizadas
              </span>

              <strong>{hechas}</strong>

            </div>

          </div>

        </section>

    </div>
  );
}

export default Dashboard;