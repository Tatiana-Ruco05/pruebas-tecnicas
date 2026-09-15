const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("./db");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "app_prueba_secret_123";

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Correo y contraseña son obligatorios",
      });
    }

    const result = await pool.query(
      `
      SELECT id, nombre, email, password, rol, activo
      FROM usuarios
      WHERE email = $1
      `,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Correo o contraseña incorrectos",
      });
    }

    const usuario = result.rows[0];

    if (!usuario.activo) {
      return res.status(403).json({
        success: false,
        message: "El usuario está inactivo",
      });
    }

    const passwordValida = await bcrypt.compare(
      password,
      usuario.password
    );

    if (!passwordValida) {
      return res.status(401).json({
        success: false,
        message: "Correo o contraseña incorrectos",
      });
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol,
        activo: usuario.activo,
      },
      JWT_SECRET,
      {
        expiresIn: "8h",
      }
    );

    res.json({
      success: true,
      message: "Inicio de sesión exitoso",
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        activo: usuario.activo,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);

    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
});

module.exports = router;
