const express = require("express");
const pool = require("./db");
const { authenticateToken, requireActiveUser } = require("./middleware/auth.middleware");

const router = express.Router();

router.use(authenticateToken);
router.use(requireActiveUser);

// Obtener todas las notas
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM notas ORDER BY id ASC"
    );

    res.json({
      success: true,
      notas: result.rows,
    });
  } catch (error) {
    console.error("Error obteniendo notas:", error);

    res.status(500).json({
      success: false,
      message: "Error obteniendo las notas",
    });
  }
});

// Crear una nota
router.post("/", async (req, res) => {
  try {
    const {
      titulo,
      contenido = "",
      estado = "PENDIENTE",
      posicion_x = 100,
      posicion_y = 100,
    } = req.body;

    if (!titulo || !titulo.trim()) {
      return res.status(400).json({
        success: false,
        message: "El título es obligatorio",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO notas
      (titulo, contenido, estado, posicion_x, posicion_y)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [
        titulo.trim(),
        contenido,
        estado,
        posicion_x,
        posicion_y,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Nota creada correctamente",
      nota: result.rows[0],
    });
  } catch (error) {
    console.error("Error creando nota:", error);

    res.status(500).json({
      success: false,
      message: "Error creando la nota",
    });
  }
});

// Actualizar una nota
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const {
      titulo,
      contenido,
      estado,
      posicion_x,
      posicion_y,
    } = req.body;

    const result = await pool.query(
      `
      UPDATE notas
      SET
        titulo = COALESCE($1, titulo),
        contenido = COALESCE($2, contenido),
        estado = COALESCE($3, estado),
        posicion_x = COALESCE($4, posicion_x),
        posicion_y = COALESCE($5, posicion_y),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
      `,
      [
        titulo,
        contenido,
        estado,
        posicion_x,
        posicion_y,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Nota no encontrada",
      });
    }

    res.json({
      success: true,
      message: "Nota actualizada correctamente",
      nota: result.rows[0],
    });
  } catch (error) {
    console.error("Error actualizando nota:", error);

    res.status(500).json({
      success: false,
      message: "Error actualizando la nota",
    });
  }
});

// Eliminar una nota
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM notas WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Nota no encontrada",
      });
    }

    res.json({
      success: true,
      message: "Nota eliminada correctamente",
    });
  } catch (error) {
    console.error("Error eliminando nota:", error);

    res.status(500).json({
      success: false,
      message: "Error eliminando la nota",
    });
  }
});

module.exports = router;