const bcrypt = require("bcryptjs");
const pool = require("./db");

async function esperarBaseDatos(maxIntentos = 20, retrasoMs = 2000) {
  for (let intento = 1; intento <= maxIntentos; intento += 1) {
    try {
      await pool.query("SELECT 1");
      return;
    } catch (error) {
      if (intento === maxIntentos) {
        throw error;
      }
      console.log(`Base de datos no lista (${intento}/${maxIntentos}), reintentando...`);
      await new Promise((resolve) => setTimeout(resolve, retrasoMs));
    }
  }
}

async function crearUsuarios() {
  try {
    await esperarBaseDatos();

    const passwordAdmin = await bcrypt.hash("Admin123*", 10);
    const passwordUsuario = await bcrypt.hash("Usuario123*", 10);

    await pool.query(
      `
      INSERT INTO usuarios (nombre, email, password, rol, activo)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email)
      DO NOTHING
      `,
      [
        "Administrador Demo",
        "admin@apprueba.com",
        passwordAdmin,
        "ADMIN",
        true,
      ]
    );

    await pool.query(
      `
      INSERT INTO usuarios (nombre, email, password, rol, activo)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email)
      DO NOTHING
      `,
      [
        "Usuario Demo",
        "usuario@apprueba.com",
        passwordUsuario,
        "USER",
        true,
      ]
    );

    const notasExistentes = await pool.query("SELECT COUNT(*)::int AS total FROM notas");

    if ((notasExistentes.rows[0].total || 0) === 0) {
      await pool.query(
        `
        INSERT INTO notas (titulo, contenido, estado, posicion_x, posicion_y)
        VALUES
          ('Revisar backlog', 'Preparar tareas del sprint', 'PENDIENTE', 40, 50),
          ('Diseño de login', 'Corregir estilos del login', 'PENDIENTE', 360, 80),
          ('API usuarios', 'Finalizar gestión de permisos', 'EN_CURSO', 120, 280),
          ('QA de tablero', 'Validar drag and drop', 'EN_CURSO', 430, 320),
          ('Documentación', 'Preparar README final', 'HECHO', 200, 500)
        `
      );
    }

    console.log("Usuarios demo creados/actualizados correctamente.");
    console.log("");
    console.log("ADMIN");
    console.log("Correo: admin@apprueba.com");
    console.log("Contraseña: Admin123*");
    console.log("");
    console.log("USER");
    console.log("Correo: usuario@apprueba.com");
    console.log("Contraseña: Usuario123*");

  } catch (error) {
    console.error("Error creando usuarios:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

crearUsuarios();
