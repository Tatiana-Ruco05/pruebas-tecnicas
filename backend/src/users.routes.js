const express = require("express");
const bcrypt = require("bcryptjs");
const pool = require("./db");
const { authenticateToken, requireAdmin } = require("./middleware/auth");

const router = express.Router();

async function garantizarAdminActivo(req, res, next) {
  try {
    const { id } = req.params;
    const { rol, activo } = req.body;

    const usuarioResult = await pool.query(
      "SELECT id, rol, activo FROM usuarios WHERE id = $1",
      [id]
    );

    if (usuarioResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    const usuarioObjetivo = usuarioResult.rows[0];
    const dejaDeSerAdminActivo =
      usuarioObjetivo.rol === "ADMIN" &&
      usuarioObjetivo.activo === true &&
      (rol === "USER" || activo === false);

    if (!dejaDeSerAdminActivo) {
      return next();
    }

    const countResult = await pool.query(
      "SELECT COUNT(*)::int AS total FROM usuarios WHERE rol = 'ADMIN' AND activo = TRUE"
    );

    const adminsActivos = Number(countResult.rows[0].total || 0);

    if (adminsActivos <= 1) {
      return res.status(400).json({
        success: false,
        message: "Debe existir al menos un administrador activo",
      });
    }

    return next();
  } catch (error) {
    console.error("Error validando regla de administradores:", error);
    return res.status(500).json({
      success: false,
      message: "Error validando permisos",
    });
  }
}

router.use(authenticateToken);

router.get("/", requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT id, nombre, email, rol, activo, created_at
      FROM usuarios
      ORDER BY id ASC
      `
    );

    res.json({
      success: true,
      usuarios: result.rows,
    });
  } catch (error) {
    console.error("Error listando usuarios:", error);
    res.status(500).json({
      success: false,
      message: "Error obteniendo usuarios",
    });
  }
});

router.post("/", requireAdmin, async (req, res) => {
  try {
    const { nombre, email, password, rol = "USER", activo = true } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Nombre, email y contraseña son obligatorios",
      });
    }

    const emailExiste = await pool.query(
      "SELECT id FROM usuarios WHERE email = $1",
      [email]
    );

    if (emailExiste.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "El correo ya está registrado",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `
      INSERT INTO usuarios (nombre, email, password, rol, activo)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, nombre, email, rol, activo
      `,
      [nombre, email, passwordHash, rol, activo]
    );

    res.status(201).json({
      success: true,
      message: "Usuario creado correctamente",
      usuario: result.rows[0],
    });
  } catch (error) {
    console.error("Error creando usuario:", error);
    res.status(500).json({
      success: false,
      message: "Error creando usuario",
    });
  }
});

router.put("/:id", requireAdmin, garantizarAdminActivo, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, rol, activo, password } = req.body;

    let query = `
      UPDATE usuarios
      SET nombre = COALESCE($1, nombre),
          email = COALESCE($2, email),
          rol = COALESCE($3, rol),
          activo = COALESCE($4, activo),
          updated_at = CURRENT_TIMESTAMP
    `;

    const params = [nombre, email, rol, activo];
    let index = 5;

    if (password) {
      const passwordHash = await bcrypt.hash(password, 10);
      query += `, password = $${index}`;
      params.push(passwordHash);
      index += 1;
    }

    query += ` WHERE id = $${index} RETURNING id, nombre, email, rol, activo`;
    params.push(id);

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    res.json({
      success: true,
      message: "Usuario actualizado correctamente",
      usuario: result.rows[0],
    });
  } catch (error) {
    console.error("Error actualizando usuario:", error);
    res.status(500).json({
      success: false,
      message: "Error actualizando usuario",
    });
  }
});

router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (Number(id) === Number(req.usuario.id)) {
      return res.status(400).json({
        success: false,
        message: "No puedes eliminarte a ti mismo",
      });
    }

    const usuarioResult = await pool.query(
      "SELECT id, rol, activo FROM usuarios WHERE id = $1",
      [id]
    );

    if (usuarioResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    const usuarioObjetivo = usuarioResult.rows[0];
    const esUltimoAdminActivo =
      usuarioObjetivo.rol === "ADMIN" &&
      usuarioObjetivo.activo === true &&
      Number(
        (
          await pool.query(
            "SELECT COUNT(*)::int AS total FROM usuarios WHERE rol = 'ADMIN' AND activo = TRUE"
          )
        ).rows[0].total
      ) <= 1;

    if (esUltimoAdminActivo) {
      return res.status(400).json({
        success: false,
        message: "Debe existir al menos un administrador activo",
      });
    }

    const result = await pool.query(
      "DELETE FROM usuarios WHERE id = $1 RETURNING id",
      [id]
    );

    res.json({
      success: true,
      message: "Usuario eliminado correctamente",
    });
  } catch (error) {
    console.error("Error eliminando usuario:", error);
    res.status(500).json({
      success: false,
      message: "Error eliminando usuario",
    });
  }
});

module.exports = router;
