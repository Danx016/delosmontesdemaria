/**
 * Script de Migración: Descomposición de Base de Datos Central a Bases de Datos por Microservicio
 * Crea db_auth, db_catalog, db_orders y db_support, y transfiere los datos desde dbmontesdm.
 */
require('dotenv').config();
const mysql = require('mysql2/promise');

const SOURCE_DB = process.env.DB_NAME || 'dbmontesdm';

const DB_MAPPING = {
  db_auth: [
    'roles',
    'usuarios',
    'direcciones',
    'telegram_auth_codigos',
    'telegram_sesiones'
  ],
  db_catalog: [
    'categorias',
    'productos',
    'banners_hero',
    'proveedores'
  ],
  db_orders: [
    'cupones',
    'compras',
    'compra_detalles'
  ],
  db_support: [
    'soporte_tickets',
    'soporte_mensajes',
    'soporte_calificaciones'
  ]
};

async function migrar() {
  console.log('🚀 Iniciando migración a Bases de Datos Aisladas por Microservicio...\n');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
  });

  try {
    // Desactivar temporalmente chequeo de foreign keys durante la copia
    await connection.query('SET FOREIGN_KEY_CHECKS = 0;');

    for (const [targetDb, tables] of Object.entries(DB_MAPPING)) {
      console.log(`📦 Configurando base de datos privada: [${targetDb}]...`);
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${targetDb}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);

      for (const table of tables) {
        // Verificar si la tabla existe en la fuente
        const [tableExists] = await connection.query(
          `SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
          [SOURCE_DB, table]
        );

        if (tableExists.length === 0) {
          console.warn(`  ⚠️ Tabla [${table}] no existe en [${SOURCE_DB}], omitiendo...`);
          continue;
        }

        // Crear tabla en destino y transferir datos
        await connection.query(`DROP TABLE IF EXISTS \`${targetDb}\`.\`${table}\`;`);
        await connection.query(`CREATE TABLE \`${targetDb}\`.\`${table}\` LIKE \`${SOURCE_DB}\`.\`${table}\`;`);
        
        // Copiar registros
        const [insertResult] = await connection.query(`INSERT INTO \`${targetDb}\`.\`${table}\` SELECT * FROM \`${SOURCE_DB}\`.\`${table}\`;`);
        
        // Contar registros copiados
        const [[{ count }]] = await connection.query(`SELECT COUNT(*) as count FROM \`${targetDb}\`.\`${table}\`;`);
        console.log(`  ✅ Tabla [${table}] migrada con éxito -> ${count} registros.`);
      }
      console.log(`🎉 [${targetDb}] completada con éxito.\n`);
    }

    // Crear Vistas de Lectura (CQRS Projections) para desacoplamiento y compatibilidad
    console.log('🔗 Configurando Vistas de Lectura seguras (Read Projections)...');
    
    // En db_catalog: Vista de solo lectura de usuarios vendedores
    await connection.query(`
      CREATE OR REPLACE VIEW \`db_catalog\`.\`usuarios\` AS 
      SELECT id_usuario, nombre, apodo, avatar, foto_portada 
      FROM \`db_auth\`.\`usuarios\`;
    `);
    console.log('  ✅ [db_catalog.usuarios] vista creada.');

    // En db_orders: Vistas de solo lectura de usuarios y productos
    await connection.query(`
      CREATE OR REPLACE VIEW \`db_orders\`.\`usuarios\` AS 
      SELECT id_usuario, nombre, apodo, correo, telefono, direccion, creditos 
      FROM \`db_auth\`.\`usuarios\`;
    `);
    await connection.query(`
      CREATE OR REPLACE VIEW \`db_orders\`.\`productos\` AS 
      SELECT id_producto, nombre_producto, precio, stock, imagen, id_vendedor 
      FROM \`db_catalog\`.\`productos\`;
    `);
    console.log('  ✅ [db_orders.usuarios y productos] vistas creadas.');

    // En db_support: Vistas de solo lectura para soporte
    await connection.query(`
      CREATE OR REPLACE VIEW \`db_support\`.\`usuarios\` AS 
      SELECT id_usuario, nombre, apodo, correo, avatar, id_rol 
      FROM \`db_auth\`.\`usuarios\`;
    `);
    await connection.query(`
      CREATE OR REPLACE VIEW \`db_support\`.\`productos\` AS 
      SELECT id_producto, nombre_producto, precio, imagen 
      FROM \`db_catalog\`.\`productos\`;
    `);
    await connection.query(`
      CREATE OR REPLACE VIEW \`db_support\`.\`compras\` AS 
      SELECT * 
      FROM \`db_orders\`.\`compras\`;
    `);
    console.log('  ✅ [db_support.usuarios, productos y compras] vistas creadas.');

    await connection.query('SET FOREIGN_KEY_CHECKS = 1;');
    console.log('\n🏆 ¡MIGRACIÓN DE TODAS LAS BASES DE DATOS COMPLETADA CON ÉXITO!');

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

migrar();
