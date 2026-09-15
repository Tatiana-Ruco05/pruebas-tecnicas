const express = require("express");
const pool = require("./db");
const { authenticateToken, requireActiveUser } = require("./middleware/auth");
const { handler: metricsHandler } = require("../../lambda/metrics");

const router = express.Router();

router.use(authenticateToken);
router.use(requireActiveUser);

router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT estado FROM notas");

    // En local se ejecuta el mismo handler que se despliega como Lambda.
    // El backend solo obtiene los datos persistidos y reenvía su respuesta.
    const lambdaResponse = await metricsHandler({
      body: JSON.stringify({ notas: result.rows }),
    });
    const payload = JSON.parse(lambdaResponse.body);

    return res.status(lambdaResponse.statusCode || 200).json(payload);
  } catch (error) {
    console.error("Error calculando métricas:", error);
    res.status(500).json({
      success: false,
      message: "Error calculando métricas",
    });
  }
});

module.exports = router;
