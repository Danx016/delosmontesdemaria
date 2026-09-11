/**
 * Script de Configuración: Creación de db_logistics y tablas de logística rural
 */
require('dotenv').config();
const mysql = require('mysql2/promise');

async function setup() {
  console.log('🚛 Configurando Base de Datos db_logistics...');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'admin',
    password: process.env.DB_PASS || '',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
  });

  try {
    // 1. Crear base de datos aislada
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`db_logistics\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    console.log('✅ Base de datos `db_logistics` verificada/creada.');

    await connection.changeUser({ database: 'db_logistics' });

    // 2. Tabla de Envíos / Despachos
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`envios\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`tracking_number\` VARCHAR(60) NOT NULL UNIQUE,
        \`order_id\` INT NOT NULL,
        \`customer_name\` VARCHAR(150) NOT NULL,
        \`customer_phone\` VARCHAR(50),
        \`origin_region\` VARCHAR(150) NOT NULL DEFAULT 'Montes de María (Carmen de Bolívar)',
        \`destination_city\` VARCHAR(100) NOT NULL,
        \`destination_address\` TEXT NOT NULL,
        \`shipping_cost\` DECIMAL(10, 2) NOT NULL DEFAULT 12000.00,
        \`carrier_name\` VARCHAR(120) NOT NULL DEFAULT 'Red de Transporte Rural Montes de María',
        \`status\` ENUM('PENDIENTE_RECOLECCION', 'RECOLECTADO_EN_FINCA', 'EN_CENTRO_ACOPIO', 'EN_RUTA', 'ENTREGADO', 'CANCELADO') NOT NULL DEFAULT 'PENDIENTE_RECOLECCION',
        \`estimated_delivery\` DATETIME NULL,
        \`notes\` TEXT NULL,
        \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_order (order_id),
        INDEX idx_tracking (tracking_number),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ Tabla `envios` lista.');

    // 3. Tabla de Historial / Trazabilidad de Estados
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`envio_historial\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`shipment_id\` INT NOT NULL,
        \`status\` VARCHAR(60) NOT NULL,
        \`location\` VARCHAR(150) NOT NULL,
        \`description\` TEXT NOT NULL,
        \`timestamp\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_shipment (shipment_id),
        CONSTRAINT fk_envio FOREIGN KEY (\`shipment_id\`) REFERENCES \`envios\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ Tabla `envio_historial` lista.');

    // 4. Tabla de Tarifas de Flete según destino regional
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`tarifas_flete\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`city\` VARCHAR(100) NOT NULL UNIQUE,
        \`department\` VARCHAR(100) NOT NULL,
        \`zone\` ENUM('MONTES_DE_MARIA', 'COSTA_CARIBE', 'NACIONAL') NOT NULL DEFAULT 'COSTA_CARIBE',
        \`base_fee\` DECIMAL(10, 2) NOT NULL,
        \`estimated_hours\` INT NOT NULL DEFAULT 24,
        \`active\` BOOLEAN NOT NULL DEFAULT TRUE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ Tabla `tarifas_flete` lista.');

    // Sembrar tarifas iniciales
    const [existingRates] = await connection.query(`SELECT COUNT(*) as count FROM tarifas_flete`);
    if (existingRates[0].count === 0) {
      await connection.query(`
        INSERT INTO tarifas_flete (city, department, zone, base_fee, estimated_hours) VALUES
        ('Carmen de Bolívar', 'Bolívar', 'MONTES_DE_MARIA', 6000.00, 4),
        ('San Jacinto', 'Bolívar', 'MONTES_DE_MARIA', 7000.00, 6),
        ('San Juan Nepomuceno', 'Bolívar', 'MONTES_DE_MARIA', 8000.00, 8),
        ('Ovejas', 'Sucre', 'MONTES_DE_MARIA', 8000.00, 8),
        ('Cartagena', 'Bolívar', 'COSTA_CARIBE', 14000.00, 24),
        ('Barranquilla', 'Atlántico', 'COSTA_CARIBE', 16000.00, 24),
        ('Sincelejo', 'Sucre', 'COSTA_CARIBE', 12000.00, 12),
        ('Montería', 'Córdoba', 'COSTA_CARIBE', 18000.00, 36),
        ('Bogotá', 'Cundinamarca', 'NACIONAL', 22000.00, 48),
        ('Medellín', 'Antioquia', 'NACIONAL', 20000.00, 48);
      `);
      console.log('🌱 Tarifas de flete iniciales sembradas.');
    }

    console.log('\n🎉 ¡db_logistics configurada exitosamente!');
  } catch (err) {
    console.error('❌ Error configurando db_logistics:', err);
    throw err;
  } finally {
    await connection.end();
  }
}

if (require.main === module) {
  setup().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = setup;
