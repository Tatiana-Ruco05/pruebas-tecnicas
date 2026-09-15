import { useEffect, useRef, useState } from "react";
import api from "../api/axios";
import "./Board.css";

function Board() {
  const [notas, setNotas] = useState([]);
  const [editando, setEditando] = useState(null);
  const [arrastrando, setArrastrando] = useState(null);
  const notasRef = useRef([]);

  useEffect(() => {
    notasRef.current = notas;
  }, [notas]);

  // =========================
  // CARGAR NOTAS
  // =========================

  const cargarNotas = async () => {
    try {
      const respuesta = await api.get("/notas");

      setNotas(respuesta.data.notas || []);
    } catch (error) {
      console.error(error);

      alert("No se pudieron cargar las notas");
    }
  };

  useEffect(() => {
    const cargaInicial = window.setTimeout(cargarNotas, 0);

    return () => window.clearTimeout(cargaInicial);
  }, []);

  // =========================
  // VOLVER AL DASHBOARD
  // =========================

  const volverDashboard = () => {
    window.location.href = "/";
  };

  // =========================
  // CREAR NOTA
  // =========================

  const nuevaNota = async () => {
    try {
      const posicionX =
        40 + (notas.length % 4) * 310;

      const posicionY =
        40 +
        Math.floor(notas.length / 4) * 290;

      const respuesta = await api.post("/notas", {
        titulo: "Nueva nota",

        contenido:
          "Escribe aquí el contenido",

        estado: "PENDIENTE",

        posicion_x: posicionX,

        posicion_y: posicionY,
      });

      setNotas([
        ...notas,
        respuesta.data.nota,
      ]);
    } catch (error) {
      console.error(error);

      alert("No se pudo crear la nota");
    }
  };

  // =========================
  // EDITAR NOTA
  // =========================

  const editarNota = (nota) => {
    setEditando(nota.id);
  };

  // =========================
  // GUARDAR NOTA
  // =========================

  const guardarNota = async (nota) => {
    try {
      const respuesta = await api.put(
        `/notas/${nota.id}`,
        {
          titulo: nota.titulo,

          contenido: nota.contenido,

          estado: nota.estado,
        }
      );

      setNotas(
        notas.map((n) =>
          n.id === nota.id
            ? respuesta.data.nota
            : n
        )
      );

      setEditando(null);
    } catch (error) {
      console.error(error);

      alert("No se pudo guardar la nota");
    }
  };

  // =========================
  // ELIMINAR NOTA
  // =========================

  const eliminarNota = async (id) => {
    const confirmar = window.confirm(
      "¿Quieres eliminar esta nota?"
    );

    if (!confirmar) {
      return;
    }

    try {
      await api.delete(`/notas/${id}`);

      setNotas(
        notas.filter(
          (nota) => nota.id !== id
        )
      );

      setEditando(null);
    } catch (error) {
      console.error(error);

      alert("No se pudo eliminar la nota");
    }
  };

  // =========================
  // CAMBIAR CAMPO
  // =========================

  const cambiarCampo = (
    id,
    campo,
    valor
  ) => {
    setNotas(
      notas.map((nota) =>
        nota.id === id
          ? {
              ...nota,
              [campo]: valor,
            }
          : nota
      )
    );
  };

  // =========================
  // CAMBIAR ESTADO
  // =========================

  const cambiarEstado = async (
    nota,
    nuevoEstado
  ) => {
    try {
      const respuesta = await api.put(
        `/notas/${nota.id}`,
        {
          estado: nuevoEstado,
        }
      );

      setNotas(
        notas.map((n) =>
          n.id === nota.id
            ? respuesta.data.nota
            : n
        )
      );
    } catch (error) {
      console.error(error);

      alert(
        "No se pudo cambiar el estado"
      );
    }
  };

  // =========================
  // COMENZAR ARRASTRE
  // =========================

  const comenzarArrastre = (
    e,
    nota
  ) => {
    if (editando === nota.id) {
      return;
    }

    const tablero =
      document.querySelector(".board");

    const rect =
      tablero.getBoundingClientRect();

    setArrastrando({
      id: nota.id,

      offsetX:
        e.clientX -
        rect.left -
        nota.posicion_x,

      offsetY:
        e.clientY -
        rect.top -
        nota.posicion_y,
    });
  };

  // =========================
  // MOVER NOTA
  // =========================

  const moverNota = (e) => {
    if (!arrastrando) {
      return;
    }

    const tablero =
      document.querySelector(".board");

    if (!tablero) {
      return;
    }

    const rect =
      tablero.getBoundingClientRect();

    let x =
      e.clientX -
      rect.left -
      arrastrando.offsetX;

    let y =
      e.clientY -
      rect.top -
      arrastrando.offsetY;

    x = Math.max(0, x);

    y = Math.max(0, y);

    setNotas((notasActuales) => {
      const notasActualizadas = notasActuales.map((nota) =>
        nota.id === arrastrando.id
          ? {
              ...nota,
              posicion_x: x,
              posicion_y: y,
            }
          : nota
      );

      notasRef.current = notasActualizadas;
      return notasActualizadas;
    });
  };

  // =========================
  // SOLTAR NOTA
  // =========================

  const terminarArrastre = async () => {
    if (!arrastrando) {
      return;
    }

    const nota = notasRef.current.find(
      (n) =>
        n.id === arrastrando.id
    );

    if (nota) {
      try {
        await api.put(
          `/notas/${nota.id}`,
          {
            posicion_x: Math.round(
              nota.posicion_x
            ),

            posicion_y: Math.round(
              nota.posicion_y
            ),
          }
        );
      } catch (error) {
        console.error(
          "No se pudo guardar la posición",
          error
        );
      }
    }

    setArrastrando(null);
  };

  // =========================
  // CLASE SEGÚN ESTADO
  // =========================

  const obtenerClaseEstado = (
    estado
  ) => {
    if (estado === "PENDIENTE") {
      return "pendiente";
    }

    if (estado === "EN_CURSO") {
      return "en-curso";
    }

    if (estado === "HECHO") {
      return "hecho";
    }

    return "pendiente";
  };

  return (
    <div
      className="board-page"
      onMouseMove={moverNota}
      onMouseUp={terminarArrastre}
    >

      {/* =========================
          ENCABEZADO
      ========================= */}

      <header className="board-header">
        <div className="board-title">
          <h1>Tablero de equipo</h1>
          <p>Organiza las tareas y notas del equipo</p>
        </div>

        <div className="board-actions">
          <button className="back-button" onClick={volverDashboard}>
            ← Volver
          </button>

          <button className="new-note-button" onClick={nuevaNota}>
            + Nueva nota
          </button>
        </div>
      </header>

      {/* =========================
          TABLERO
      ========================= */}

      <main className="board">

        {notas.map((nota) => (

          <div
            className={`note ${obtenerClaseEstado(
              nota.estado
            )} ${
              arrastrando?.id ===
              nota.id
                ? "dragging"
                : ""
            }`}
            key={nota.id}
            style={{
              left: `${nota.posicion_x}px`,
              top: `${nota.posicion_y}px`,
            }}
            onMouseDown={(e) =>
              comenzarArrastre(
                e,
                nota
              )
            }
          >

            {editando === nota.id ? (

              /* =========================
                 MODO EDICIÓN
              ========================= */

              <>
                <input
                  className="note-title"
                  value={nota.titulo}
                  onMouseDown={(e) => e.stopPropagation()}
                  onChange={(e) =>
                    cambiarCampo(
                      nota.id,
                      "titulo",
                      e.target.value
                    )
                  }
                />

                <textarea
                  className="note-content"
                  value={
                    nota.contenido
                  }
                  onMouseDown={(e) => e.stopPropagation()}
                  onChange={(e) =>
                    cambiarCampo(
                      nota.id,
                      "contenido",
                      e.target.value
                    )
                  }
                />

                <select
                  className="note-status"
                  value={nota.estado}
                  onMouseDown={(e) => e.stopPropagation()}
                  onChange={(e) =>
                    cambiarCampo(
                      nota.id,
                      "estado",
                      e.target.value
                    )
                  }
                >

                  <option value="PENDIENTE">
                    Pendiente
                  </option>

                  <option value="EN_CURSO">
                    En curso
                  </option>

                  <option value="HECHO">
                    Hecho
                  </option>

                </select>

                <div className="note-buttons">

                  <button
                    className="save-button"
                    onMouseDown={(e) =>
                      e.stopPropagation()
                    }
                    onClick={() =>
                      guardarNota(
                        nota
                      )
                    }
                  >
                    Guardar
                  </button>

                  <button
                    className="cancel-button"
                    onMouseDown={(e) =>
                      e.stopPropagation()
                    }
                    onClick={() => {
                      setEditando(
                        null
                      );

                      cargarNotas();
                    }}
                  >
                    Cancelar
                  </button>

                </div>
              </>

            ) : (

              /* =========================
                 MODO NORMAL
              ========================= */

              <>
                <h2>
                  {nota.titulo}
                </h2>

                <p className="note-text">
                  {nota.contenido}
                </p>

                {/* ESTADO */}

                <div className="status-section">

                  <label>
                    Estado
                  </label>

                  <select
                    className="status-select"
                    value={nota.estado}
                    onChange={(e) =>
                      cambiarEstado(
                        nota,
                        e.target.value
                      )
                    }
                    onMouseDown={(e) =>
                      e.stopPropagation()
                    }
                  >

                    <option value="PENDIENTE">
                      Pendiente
                    </option>

                    <option value="EN_CURSO">
                      En curso
                    </option>

                    <option value="HECHO">
                      Hecho
                    </option>

                  </select>

                </div>

                {/* BOTONES */}

                <div className="note-buttons">

                  <button
                    className="edit-button"
                    onMouseDown={(e) =>
                      e.stopPropagation()
                    }
                    onClick={() =>
                      editarNota(
                        nota
                      )
                    }
                  >
                    Editar
                  </button>

                  <button
                    className="delete-button"
                    onMouseDown={(e) =>
                      e.stopPropagation()
                    }
                    onClick={() =>
                      eliminarNota(
                        nota.id
                      )
                    }
                  >
                    Eliminar
                  </button>

                </div>

              </>
            )}

          </div>

        ))}

      </main>

    </div>
  );
}

export default Board;
