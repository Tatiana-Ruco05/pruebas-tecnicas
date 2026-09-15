import { useEffect, useRef, useState } from "react";
import api from "../api/axios";
import "./Board.css";

function Board() {
  const [notas, setNotas] = useState([]);
  const [editando, setEditando] = useState(null);
  const [arrastrando, setArrastrando] = useState(null);

  // =========================
  // MODAL PARA CREAR
  // =========================

  const [modalCrear, setModalCrear] = useState(false);

  const [nuevoTitulo, setNuevoTitulo] = useState("");
  const [nuevoContenido, setNuevoContenido] = useState("");
  const [nuevoEstado, setNuevoEstado] =
    useState("PENDIENTE");

  const notasRef = useRef([]);

  // =========================
  // MANTENER REFERENCIA
  // =========================

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
    const cargaInicial = window.setTimeout(
      cargarNotas,
      0
    );

    return () =>
      window.clearTimeout(cargaInicial);
  }, []);

  // =========================
  // ABRIR MODAL NUEVA NOTA
  // =========================

  const abrirNuevaNota = () => {
    setNuevoTitulo("");
    setNuevoContenido("");
    setNuevoEstado("PENDIENTE");

    setModalCrear(true);
  };

  // =========================
  // CERRAR MODAL
  // =========================

  const cerrarModalCrear = () => {
    setModalCrear(false);

    setNuevoTitulo("");
    setNuevoContenido("");
    setNuevoEstado("PENDIENTE");
  };

  // =========================
  // CREAR NOTA
  // =========================

  const crearNota = async (e) => {
    e.preventDefault();

    if (!nuevoTitulo.trim()) {
      alert(
        "Por favor escribe un título para la nota"
      );

      return;
    }

    try {
      const posicionX =
        40 + (notas.length % 4) * 310;

      const posicionY =
        40 +
        Math.floor(notas.length / 4) * 290;

      const respuesta = await api.post(
        "/notas",
        {
          titulo: nuevoTitulo.trim(),

          contenido:
            nuevoContenido.trim(),

          estado: nuevoEstado,

          posicion_x: posicionX,

          posicion_y: posicionY,
        }
      );

      setNotas((notasActuales) => [
        ...notasActuales,
        respuesta.data.nota,
      ]);

      cerrarModalCrear();
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
  // GUARDAR NOTA EDITADA
  // =========================

  const guardarNota = async (nota) => {
    if (!nota.titulo.trim()) {
      alert(
        "El título de la nota no puede estar vacío"
      );

      return;
    }

    try {
      const respuesta = await api.put(
        `/notas/${nota.id}`,
        {
          titulo: nota.titulo.trim(),

          contenido:
            nota.contenido.trim(),

          estado: nota.estado,
        }
      );

      setNotas((notasActuales) =>
        notasActuales.map((n) =>
          n.id === nota.id
            ? respuesta.data.nota
            : n
        )
      );

      setEditando(null);
    } catch (error) {
      console.error(error);

      alert(
        "No se pudo guardar la nota"
      );
    }
  };

  // =========================
  // CANCELAR EDICIÓN
  // =========================

  const cancelarEdicion = () => {
    setEditando(null);

    cargarNotas();
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

      setNotas((notasActuales) =>
        notasActuales.filter(
          (nota) => nota.id !== id
        )
      );

      setEditando(null);
    } catch (error) {
      console.error(error);

      alert(
        "No se pudo eliminar la nota"
      );
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
    setNotas((notasActuales) =>
      notasActuales.map((nota) =>
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

      setNotas((notasActuales) =>
        notasActuales.map((n) =>
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

  const comenzarArrastre = (e, nota) => {
    if (e.button !== 0) {
      return;
    }

    const elemento = e.target;

    // No arrastrar al interactuar
    // con botones, selectores o campos.
    if (
      elemento.closest("button") ||
      elemento.closest("select") ||
      elemento.closest("input") ||
      elemento.closest("textarea")
    ) {
      return;
    }

    const tablero =
      document.querySelector(".board");

    if (!tablero) {
      return;
    }

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
      const notasActualizadas =
        notasActuales.map((nota) =>
          nota.id === arrastrando.id
            ? {
                ...nota,
                posicion_x: x,
                posicion_y: y,
              }
            : nota
        );

      notasRef.current =
        notasActualizadas;

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

  const obtenerClaseEstado = (estado) => {
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
      onMouseLeave={terminarArrastre}
    >
      <main className="board-content">
        <section className="board-card">
          <div className="board-list-header">
            <div className="board-title">
              <h2>Tablero de equipo</h2>

              <p>
                Organiza las tareas y notas del equipo
              </p>
            </div>

            <div className="board-actions">
              <button
                className="new-note-button"
                onClick={abrirNuevaNota}
              >
                + Nueva nota
              </button>
            </div>
          </div>

          <div className="board">
        {notas.map((nota) => (
          <div
            className={`note ${obtenerClaseEstado(
              nota.estado
            )} ${
              arrastrando?.id === nota.id
                ? "dragging"
                : ""
            }`}
            key={nota.id}
            style={{
              left: `${nota.posicion_x}px`,
              top: `${nota.posicion_y}px`,
            }}
            onMouseDown={(e) =>
              comenzarArrastre(e, nota)
            }
          >
            {editando === nota.id ? (
              <>
                {/* =========================
                    EDICIÓN DIRECTA
                ========================= */}

                <input
                  type="text"
                  className="note-title"
                  value={nota.titulo || ""}
                  placeholder="Título de la nota"
                  onMouseDown={(e) =>
                    e.stopPropagation()
                  }
                  onClick={(e) =>
                    e.stopPropagation()
                  }
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
                    nota.contenido || ""
                  }
                  placeholder="Escribe el contenido..."
                  onMouseDown={(e) =>
                    e.stopPropagation()
                  }
                  onClick={(e) =>
                    e.stopPropagation()
                  }
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
                  onMouseDown={(e) =>
                    e.stopPropagation()
                  }
                  onClick={(e) =>
                    e.stopPropagation()
                  }
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
                    type="button"
                    className="save-button"
                    onMouseDown={(e) =>
                      e.stopPropagation()
                    }
                    onClick={(e) => {
                      e.stopPropagation();

                      guardarNota(nota);
                    }}
                  >
                    Guardar
                  </button>

                  <button
                    type="button"
                    className="cancel-button"
                    onMouseDown={(e) =>
                      e.stopPropagation()
                    }
                    onClick={(e) => {
                      e.stopPropagation();

                      cancelarEdicion();
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* =========================
                    VISTA NORMAL
                ========================= */}

                <h2>{nota.titulo}</h2>

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
                    type="button"
                    className="edit-button"
                    onMouseDown={(e) =>
                      e.stopPropagation()
                    }
                    onClick={(e) => {
                      e.stopPropagation();

                      editarNota(nota);
                    }}
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    className="delete-button"
                    onMouseDown={(e) =>
                      e.stopPropagation()
                    }
                    onClick={(e) => {
                      e.stopPropagation();

                      eliminarNota(nota.id);
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
          </div>
        </section>
      </main>

      {/* =========================
          MODAL SOLO PARA CREAR
      ========================= */}

      {modalCrear && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (
              e.target === e.currentTarget
            ) {
              cerrarModalCrear();
            }
          }}
        >
          <div
            className="note-modal"
            onMouseDown={(e) =>
              e.stopPropagation()
            }
          >
            <div className="modal-header">
              <div>
                <h2>
                  Nueva nota
                </h2>

                <p>
                  Completa la información de la nota
                </p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={cerrarModalCrear}
              >
                ×
              </button>
            </div>

            <form onSubmit={crearNota}>
              {/* TÍTULO */}

              <div className="form-group">
                <label htmlFor="nuevo-titulo">
                  Título
                </label>

                <input
                  id="nuevo-titulo"
                  type="text"
                  value={nuevoTitulo}
                  onChange={(e) =>
                    setNuevoTitulo(
                      e.target.value
                    )
                  }
                  placeholder="Escribe el título de la nota"
                  maxLength={150}
                  autoFocus
                />
              </div>

              {/* CONTENIDO */}

              <div className="form-group">
                <label htmlFor="nuevo-contenido">
                  Contenido
                </label>

                <textarea
                  id="nuevo-contenido"
                  value={nuevoContenido}
                  onChange={(e) =>
                    setNuevoContenido(
                      e.target.value
                    )
                  }
                  placeholder="Escribe aquí el contenido de la nota..."
                  rows="6"
                />
              </div>

              {/* ESTADO */}

              <div className="form-group">
                <label htmlFor="nuevo-estado">
                  Estado
                </label>

                <select
                  id="nuevo-estado"
                  value={nuevoEstado}
                  onChange={(e) =>
                    setNuevoEstado(
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
              </div>

              {/* BOTONES */}

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-modal-button"
                  onClick={cerrarModalCrear}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="save-modal-button"
                >
                  Crear nota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Board;