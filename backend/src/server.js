const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./auth.routes");
const notesRoutes = require("./notes.routes");
const usersRoutes = require("./users.routes");
const metricsRoutes = require("./metrics.routes");

const app = express();

const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "APP Prueba funcionando",
  });
});

// Rutas de autenticación
app.use("/api/auth", authRoutes);
app.use("/api/notas", notesRoutes);
app.use("/api/usuarios", usersRoutes);
app.use("/api/metricas", metricsRoutes);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`APP Prueba ejecutándose en http://localhost:${PORT}`);
});