function calcularMetricas(notas = []) {
  const metricas = {
    total: notas.length,
    pendientes: 0,
    enCurso: 0,
    hechas: 0,
  };

  for (const nota of notas) {
    const estado = String(nota?.estado || "").toUpperCase();

    if (estado === "PENDIENTE") {
      metricas.pendientes += 1;
    } else if (estado === "EN_CURSO") {
      metricas.enCurso += 1;
    } else if (estado === "HECHO") {
      metricas.hechas += 1;
    }
  }

  return metricas;
}

async function handler(event = {}) {
  let notas = [];

  if (Array.isArray(event.notas)) {
    notas = event.notas;
  } else if (event.body) {
    try {
      const parsed = JSON.parse(event.body);

      if (Array.isArray(parsed.notas)) {
        notas = parsed.notas;
      } else if (Array.isArray(parsed)) {
        notas = parsed;
      }
    } catch (error) {
      console.warn("No se pudo parsear el body de la Lambda:", error.message);
    }
  }

  const metricas = calcularMetricas(notas);

  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      metricas,
    }),
  };
}

if (require.main === module) {
  let input = process.argv.slice(2).join(" ") || JSON.stringify({
    notas: [
      { estado: "PENDIENTE" },
      { estado: "PENDIENTE" },
      { estado: "EN_CURSO" },
      { estado: "EN_CURSO" },
      { estado: "HECHO" },
    ],
  });

  try {
    const parsed = JSON.parse(input);
    handler(parsed)
      .then((resultado) => console.log(resultado.body))
      .catch((error) => {
        console.error("Error ejecutando Lambda:", error);
        process.exit(1);
      });
  } catch (error) {
    console.error("El argumento debe ser un JSON válido:", error.message);
    process.exit(1);
  }
}

module.exports = {
  handler,
  calcularMetricas,
};
