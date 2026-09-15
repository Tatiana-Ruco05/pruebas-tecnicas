import { useEffect, useState } from "react";
import api from "../api/axios";
import "./Users.css";

const formularioInicial = {
  nombre: "",
  email: "",
  password: "",
  rol: "USER",
  activo: true,
};

function Users() {
  const usuarioActual = JSON.parse(localStorage.getItem("usuario") || "null");

  const [usuarios, setUsuarios] = useState([]);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [editandoId, setEditandoId] = useState(null);

  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  // Controla el modal de crear/editar
  const [mostrarModal, setMostrarModal] = useState(false);

  const cargarUsuarios = async () => {
    try {
      setCargando(true);

      const respuesta = await api.get("/usuarios");

      setUsuarios(respuesta.data.usuarios || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "No se pudieron cargar los usuarios"
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (usuarioActual?.rol !== "ADMIN") {
      window.location.href = "/";
      return;
    }

    const cargaInicial = window.setTimeout(cargarUsuarios, 0);

    return () => window.clearTimeout(cargaInicial);
  }, [usuarioActual?.rol]);

  // =========================
  // CAMBIAR FORMULARIO
  // =========================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormulario((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // =========================
  // ABRIR CREAR USUARIO
  // =========================

  const abrirCrearUsuario = () => {
    setFormulario(formularioInicial);
    setEditandoId(null);
    setError("");
    setMensaje("");
    setMostrarModal(true);
  };

  // =========================
  // CERRAR MODAL
  // =========================

  const cerrarModal = () => {
    setMostrarModal(false);
    setFormulario(formularioInicial);
    setEditandoId(null);
    setError("");
    setMensaje("");
  };

  // =========================
  // GUARDAR USUARIO
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMensaje("");

    if (!formulario.nombre || !formulario.email) {
      setError("Nombre y email son obligatorios");
      return;
    }

    if (!editandoId && !formulario.password) {
      setError(
        "La contraseña es obligatoria para crear un usuario"
      );
      return;
    }

    const payload = { ...formulario };

    if (!payload.password) {
      delete payload.password;
    }

    try {
      if (editandoId) {
        await api.put(`/usuarios/${editandoId}`, payload);
      } else {
        await api.post("/usuarios", payload);
      }

      const mensajeExito = editandoId
        ? "Usuario actualizado correctamente"
        : "Usuario creado correctamente";

      setMensaje(mensajeExito);

      await cargarUsuarios();

      // Cerramos después de guardar
      setTimeout(() => {
        cerrarModal();
      }, 700);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "No se pudo guardar el usuario"
      );
    }
  };

  // =========================
  // EDITAR USUARIO
  // =========================

  const editarUsuario = (usuario) => {
    setEditandoId(usuario.id);

    setFormulario({
      nombre: usuario.nombre,
      email: usuario.email,
      password: "",
      rol: usuario.rol,
      activo: usuario.activo,
    });

    setError("");
    setMensaje("");
    setMostrarModal(true);
  };

  // =========================
  // CAMBIAR ESTADO
  // =========================

  const cambiarEstado = async (usuario) => {
    try {
      setError("");

      await api.put(`/usuarios/${usuario.id}`, {
        activo: !usuario.activo,
      });

      await cargarUsuarios();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "No se pudo cambiar el estado"
      );
    }
  };

  // =========================
  // ELIMINAR USUARIO
  // =========================

  const eliminarUsuario = async (usuario) => {
    if (usuario.id === usuarioActual.id) {
      setError("No puedes eliminar tu propio usuario");
      return;
    }

    const confirmar = window.confirm(
      `¿Quieres eliminar a ${usuario.nombre}?`
    );

    if (!confirmar) return;

    try {
      setError("");

      await api.delete(`/usuarios/${usuario.id}`);

      await cargarUsuarios();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "No se pudo eliminar el usuario"
      );
    }
  };

  return (
    <div className="users-page">

      <main className="users-content">

        <section className="users-list-card">

          {/* ENCABEZADO DE LA LISTA */}

          <div className="users-list-header">

            <div>
              <h2>GESTION DE USUARIOS</h2>

              <p>
                Administra los usuarios registrados en el sistema.
              </p>
            </div>

            <button
              className="create-user-button"
              onClick={abrirCrearUsuario}
            >
              + Crear usuario
            </button>

          </div>

          {/* MENSAJE GENERAL */}

          {error && !mostrarModal && (
            <div className="form-error users-general-error">
              {error}
            </div>
          )}

          {/* LISTA */}

          {cargando ? (
            <div className="loading-users">
              <p>Cargando usuarios...</p>
            </div>
          ) : usuarios.length === 0 ? (
            <div className="empty-users">
              <div className="empty-users-icon">
                👥
              </div>

              <h3>No hay usuarios registrados</h3>

              <p>
                Utiliza el botón "Crear usuario" para agregar
                el primer usuario.
              </p>
            </div>
          ) : (
            <div className="users-table-wrapper">

              <table className="users-table">

                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>

                  {usuarios.map((usuario) => (

                    <tr key={usuario.id}>

                      <td>
                        <div className="user-name">
                          {usuario.nombre}
                        </div>
                      </td>

                      <td>
                        <div className="user-email">
                          {usuario.email}
                        </div>
                      </td>

                      <td>

                        <span
                          className={`role-badge ${usuario.rol.toLowerCase()}`}
                        >
                          {usuario.rol}
                        </span>

                      </td>

                      <td>

                        <span
                          className={
                            usuario.activo
                              ? "status active"
                              : "status inactive"
                          }
                        >
                          <span className="status-dot"></span>

                          {usuario.activo
                            ? "Activo"
                            : "Inactivo"}
                        </span>

                      </td>

                      <td className="user-actions">

                        <button
                          className="small-button edit"
                          onClick={() =>
                            editarUsuario(usuario)
                          }
                        >
                          Editar
                        </button>

                        <button
                          className="small-button warning"
                          onClick={() =>
                            cambiarEstado(usuario)
                          }
                        >
                          {usuario.activo
                            ? "Desactivar"
                            : "Activar"}
                        </button>

                        <button
                          className="small-button danger"
                          onClick={() =>
                            eliminarUsuario(usuario)
                          }
                        >
                          Eliminar
                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>
          )}

        </section>

      </main>

      {/* =================================================
          MODAL CREAR / EDITAR USUARIO
      ================================================= */}

      {mostrarModal && (

        <div
          className="user-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              cerrarModal();
            }
          }}
        >

          <div className="user-modal">

            {/* CABECERA */}

            <div className="user-modal-header">

              <div>
                <h2>
                  {editandoId
                    ? "Editar usuario"
                    : "Crear nuevo usuario"}
                </h2>

                <p>
                  {editandoId
                    ? "Modifica la información del usuario."
                    : "Completa los datos para registrar un nuevo usuario."}
                </p>
              </div>

              <button
                type="button"
                className="user-modal-close"
                onClick={cerrarModal}
              >
                ×
              </button>

            </div>

            {/* FORMULARIO */}

            <form
              onSubmit={handleSubmit}
              className="users-form"
            >

              <div className="form-grid">

                <label>
                  Nombre

                  <input
                    type="text"
                    name="nombre"
                    value={formulario.nombre}
                    onChange={handleChange}
                    placeholder="Nombre completo"
                    required
                  />
                </label>

                <label>
                  Email

                  <input
                    type="email"
                    name="email"
                    value={formulario.email}
                    onChange={handleChange}
                    placeholder="correo@ejemplo.com"
                    required
                  />
                </label>

                <label>
                  Contraseña

                  <input
                    type="password"
                    name="password"
                    value={formulario.password}
                    onChange={handleChange}
                    placeholder={
                      editandoId
                        ? "Dejar vacío para mantener"
                        : "Contraseña"
                    }
                  />
                </label>

                <label>
                  Rol

                  <select
                    name="rol"
                    value={formulario.rol}
                    onChange={handleChange}
                  >
                    <option value="USER">
                      USER
                    </option>

                    <option value="ADMIN">
                      ADMIN
                    </option>
                  </select>
                </label>

                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    name="activo"
                    checked={formulario.activo}
                    onChange={handleChange}
                  />

                  Usuario activo
                </label>

              </div>

              {error && (
                <div className="form-error">
                  {error}
                </div>
              )}

              {mensaje && (
                <div className="form-success">
                  {mensaje}
                </div>
              )}

              {/* BOTONES */}

              <div className="form-actions">

                <button
                  type="button"
                  className="secondary-button modal-cancel-button"
                  onClick={cerrarModal}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="primary-button"
                >
                  {editandoId
                    ? "Guardar cambios"
                    : "Crear usuario"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default Users;