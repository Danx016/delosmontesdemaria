/**
 * Script de Verificación de Conexión a Base de Datos
 * Ejecuta: node scripts/verificar_conexion.js
 */
require('dotenv').config();
const mysql = require('mysql2/promise');

async function testConnection() {
  console.log('--- Comprobando conexión con la base de datos ---');
  console.log(`Host: ${process.env.DB_HOST || 'localhost'}`);
  console.log(`Port: ${process.env.DB_PORT || 3306}`);
  console.log(`User: ${process.env.DB_USER || 'admin'}`);
  console.log(`Database: ${process.env.DB_NAME || 'dbmontesdm'}`);
  console.log(`SSL: ${process.env.DB_SSL === 'true' ? 'Activado' : 'Desactivado'}`);

  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      user: process.env.DB_USER || 'admin',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'dbmontesdm',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
      connectTimeout: 7000
    });

    console.log('✅ Conexión establecida con éxito!');
    const [rows] = await conn.query('SHOW TABLES');
    const tables = rows.map(r => Object.values(r)[0]);
    console.log(`📊 Tablas encontradas (${tables.length}):`, tables.join(', '));

    const [[users]] = await conn.query('SELECT COUNT(*) as total FROM usuarios');
    const [[products]] = await conn.query('SELECT COUNT(*) as total FROM productos');
    console.log(`👤 Total Usuarios registrados: ${users.total}`);
    console.log(`📦 Total Productos en catálogo: ${products.total}`);

    await conn.end();
    console.log('\n🎉 ¡La base de datos está activa, accesible y funcionando al 100%!');
  } catch (err) {
    console.error('\n❌ Error al conectar a la base de datos:');
    console.error(err.message);
    process.exit(1);
  }
}

testConnection();
