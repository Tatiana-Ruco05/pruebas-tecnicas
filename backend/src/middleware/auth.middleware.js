const jwt = require("jsonwebtoken");
const pool = require("../db");

const JWT_SECRET = process.env.JWT_SECRET || "app_prueba_secret_123";

async function getUsuarioActivoPorId(id) {
  const result = await pool.query(
    "SELECT id, nombre, email, rol, activo FROM usuarios WHERE id = $1",
    [id]
  );

  return result.rows[0] || null;
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Token no proporcionado",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token inválido o expirado",
    });
  }
}

async function requireActiveUser(req, res, next) {
  try {
    const usuario = await getUsuarioActivoPorId(req.usuario.id);

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    if (!usuario.activo) {
      return res.status(403).json({
        success: false,
        message: "El usuario está inactivo",
      });
    }

    req.usuarioActual = usuario;
    return next();
  } catch (error) {
    console.error("Error validando usuario activo:", error);
    return res.status(500).json({
      success: false,
      message: "Error validando permisos",
    });
  }
}

async function requireAdmin(req, res, next) {
  try {
    const usuario = await getUsuarioActivoPorId(req.usuario.id);

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    if (!usuario.activo) {
      return res.status(403).json({
        success: false,
        message: "El usuario está inactivo",
      });
    }

    if (usuario.rol !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos de administrador",
      });
    }

    req.usuarioActual = usuario;
    return next();
  } catch (error) {
    console.error("Error validando admin:", error);
    return res.status(500).json({
      success: false,
      message: "Error validando permisos",
    });
  }
}

module.exports = {
  authenticateToken,
  requireActiveUser,
  requireAdmin,
};
