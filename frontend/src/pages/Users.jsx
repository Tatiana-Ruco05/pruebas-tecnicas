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

  const cargarUsuarios = async () => {
    try {
      setCargando(true);
      const respuesta = await api.get("/usuarios");
      setUsuarios(respuesta.data.usuarios || []);
    } catch (err) {
      setError(err.response?.data?.message || "No se pudieron cargar los usuarios");
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

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.href = "/";
  };

  const volverDashboard = () => {
    window.location.href = "/";
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormulario((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetFormulario = () => {
    setFormulario(formularioInicial);
    setEditandoId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");

    if (!formulario.nombre || !formulario.email) {
      setError("Nombre y email son obligatorios");
      return;
    }

    if (!editandoId && !formulario.password) {
      setError("La contraseña es obligatoria para crear un usuario");
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

      resetFormulario();
      setMensaje(editandoId ? "Usuario actualizado correctamente" : "Usuario creado correctamente");

      try {
        await cargarUsuarios();
      } catch (loadError) {
        console.warn("No se pudo recargar la lista tras guardar:", loadError);
      }
    } catch (err) {
      setError(err.response?.data?.message || "No se pudo guardar el usuario");
    }
  };

  const editarUsuario = (usuario) => {
    setEditandoId(usuario.id);
    setFormulario({
      nombre: usuario.nombre,
      email: usuario.email,
      password: "",
      rol: usuario.rol,
      activo: usuario.activo,
    });
  };

  const cambiarEstado = async (usuario) => {
    try {
      setError("");
      await api.put(`/usuarios/${usuario.id}`, {
        activo: !usuario.activo,
      });
      await cargarUsuarios();
    } catch (err) {
      setError(err.response?.data?.message || "No se pudo cambiar el estado");
    }
  };

  const eliminarUsuario = async (usuario) => {
    if (usuario.id === usuarioActual.id) {
      setError("No puedes eliminar tu propio usuario");
      return;
    }

    const confirmar = window.confirm(`¿Quieres eliminar a ${usuario.nombre}?`);
    if (!confirmar) return;

    try {
      setError("");
      await api.delete(`/usuarios/${usuario.id}`);
      await cargarUsuarios();
    } catch (err) {
      setError(err.response?.data?.message || "No se pudo eliminar el usuario");
    }
  };

  return (
    <div className="users-page">
      <header className="users-header">
        <div className="users-header__title">
          <h1>APP PRUEBA</h1>
          <p>Administración de usuarios</p>
        </div>

        <div className="users-header__actions">
          <button className="secondary-button" onClick={volverDashboard}>Dashboard</button>
          <button className="logout-button" onClick={cerrarSesion}>Cerrar sesión</button>
        </div>
      </header>

      <main className="users-content">
        <section className="users-form-card">
          <h2>{editandoId ? "Editar usuario" : "Crear usuario"}</h2>

          <form onSubmit={handleSubmit} className="users-form">
            <div className="form-grid">
              <label>
                Nombre
                <input
                  type="text"
                  name="nombre"
                  value={formulario.nombre}
                  onChange={handleChange}
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
                  placeholder={editandoId ? "Dejar vacío para mantener" : "Contraseña"}
                />
              </label>

              <label>
                Rol
                <select name="rol" value={formulario.rol} onChange={handleChange}>
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
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

            {error && <div className="form-error">{error}</div>}
            {mensaje && <div className="form-success">{mensaje}</div>}

            <div className="form-actions">
              <button type="submit" className="primary-button">
                {editandoId ? "Guardar cambios" : "Crear usuario"}
              </button>

              {editandoId && (
                <button type="button" className="secondary-button" onClick={resetFormulario}>
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="users-list-card">
          <h2>Usuarios</h2>

          {cargando ? (
            <p>Cargando usuarios...</p>
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
                      <td>{usuario.nombre}</td>
                      <td>{usuario.email}</td>
                      <td>
                        <span className={`role-badge ${usuario.rol.toLowerCase()}`}>
                          {usuario.rol}
                        </span>
                      </td>
                      <td>
                        <span className={usuario.activo ? "status active" : "status inactive"}>
                          {usuario.activo ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="user-actions">
                        <button className="small-button" onClick={() => editarUsuario(usuario)}>
                          Editar
                        </button>
                        <button className="small-button warning" onClick={() => cambiarEstado(usuario)}>
                          {usuario.activo ? "Desactivar" : "Activar"}
                        </button>
                        <button className="small-button danger" onClick={() => eliminarUsuario(usuario)}>
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
    </div>
  );
}

export default Users;
