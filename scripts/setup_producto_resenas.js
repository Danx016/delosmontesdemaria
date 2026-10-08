/**
 * Script de Creación y Población de Tabla: producto_resenas
 * Ejecuta: node scripts/setup_producto_resenas.js
 */
require('dotenv').config();
const mysql = require('mysql2/promise');

async function setupReviews() {
  console.log('🔄 Conectando a MySQL para configurar tabla de reseñas...');

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || '149.130.189.158',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'admin',
    password: process.env.DB_PASS || 'Danilo.1050',
    database: process.env.DB_NAME || 'dbmontesdm',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    connectTimeout: 8000
  });

  console.log('✅ Conexión establecida.');

  // Crear tabla si no existe
  await conn.query(`
    CREATE TABLE IF NOT EXISTS producto_resenas (
      id_resena INT AUTO_INCREMENT PRIMARY KEY,
      id_producto INT NOT NULL,
      id_usuario INT DEFAULT NULL,
      nombre_usuario VARCHAR(150) NOT NULL,
      ciudad VARCHAR(100) DEFAULT 'Montes de María',
      rating INT NOT NULL DEFAULT 5,
      comentario TEXT NOT NULL,
      foto_url VARCHAR(500) DEFAULT NULL,
      verificado TINYINT(1) DEFAULT 1,
      fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_producto (id_producto),
      CONSTRAINT fk_resena_producto FOREIGN KEY (id_producto) REFERENCES productos(id_producto) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  console.log('✅ Tabla "producto_resenas" lista o verificada.');

  // Verificar si ya hay reseñas
  const [[{ total }]] = await conn.query('SELECT COUNT(*) as total FROM producto_resenas');
  if (total === 0) {
    console.log('🌱 Insertando reseñas reales iniciales de prueba con fotos del campo...');

    // Obtener algunos productos
    const [prods] = await conn.query('SELECT id_producto, nombre_producto FROM productos LIMIT 6');

    for (const p of prods) {
      await conn.query(`
        INSERT INTO producto_resenas (id_producto, nombre_usuario, ciudad, rating, comentario, foto_url, verificado)
        VALUES 
        (?, 'María Camargo', 'El Carmen de Bolívar', 5, 'Excelente calidad, producto fresco recién cortado. Llegó en perfecto estado a mi casa.', 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80', 1),
        (?, 'Carlos Mendoza', 'Cartagena', 5, 'Súper recomendado. Apoyar a los campesinos de nuestra tierra es lo mejor, el sabor es inigualable.', NULL, 1)
      `, [p.id_producto, p.id_producto]);
    }

    console.log('✅ Reseñas iniciales agregadas con éxito.');
  } else {
    console.log(`ℹ️ Ya existen ${total} reseñas en la base de datos.`);
  }

  await conn.end();
  console.log('🎉 Migración de reseñas completada exitosamente.');
}

setupReviews().catch((err) => {
  console.error('❌ Error en setupReviews:', err.message);
  process.exit(1);
});
