const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "app_prueba",
  user: process.env.DB_USER || "app_prueba",
  password: process.env.DB_PASSWORD || "app_prueba123",
});

module.exports = pool;