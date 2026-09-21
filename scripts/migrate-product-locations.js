require('dotenv').config();
const db = require('../src/infrastructure/adapters/driven/persistence/Database');

async function migrate() {
  console.log('🚀 Iniciando migración de geolocalización para productos...');

  const queryAsync = (sql, params = []) => new Promise((resolve, reject) => {
    db.query(sql, params, (err, res) => {
      if (err) return reject(err);
      resolve(res);
    });
  });

  const cols = await queryAsync("SHOW COLUMNS FROM productos");
  const colNames = cols.map(c => c.Field);

  if (!colNames.includes('latitud')) {
    await queryAsync("ALTER TABLE productos ADD COLUMN latitud DECIMAL(10, 8) NULL DEFAULT NULL");
    console.log('✅ Columna latitud agregada a productos.');
  } else {
    console.log('ℹ️ Columna latitud ya existe.');
  }

  if (!colNames.includes('longitud')) {
    await queryAsync("ALTER TABLE productos ADD COLUMN longitud DECIMAL(11, 8) NULL DEFAULT NULL");
    console.log('✅ Columna longitud agregada a productos.');
  } else {
    console.log('ℹ️ Columna longitud ya existe.');
  }

  if (!colNames.includes('ubicacion_nombre')) {
    await queryAsync("ALTER TABLE productos ADD COLUMN ubicacion_nombre VARCHAR(255) NULL DEFAULT NULL");
    console.log('✅ Columna ubicacion_nombre agregada a productos.');
  } else {
    console.log('ℹ️ Columna ubicacion_nombre ya existe.');
  }

  const prods = await queryAsync("SELECT id_producto, nombre_producto, origen FROM productos WHERE latitud IS NULL OR longitud IS NULL");
  console.log(`📦 Productos que requieren coordenadas iniciales: ${prods.length}`);

  const locations = [
    { name: 'El Carmen de Bolívar', lat: 9.7174, lng: -75.1213 },
    { name: 'San Jacinto', lat: 9.8294, lng: -75.1216 },
    { name: 'San Juan Nepomuceno', lat: 9.9511, lng: -75.0825 },
    { name: 'Ovejas', lat: 9.5333, lng: -75.2333 },
    { name: 'Colosó', lat: 9.4939, lng: -75.3536 },
    { name: 'Chalán', lat: 9.5539, lng: -75.3142 },
    { name: 'Los Palmitos', lat: 9.3811, lng: -75.2639 }
  ];

  for (let i = 0; i < prods.length; i++) {
    const p = prods[i];
    const orig = (p.origen || '').toLowerCase();
    let chosen = locations.find(l => orig.includes(l.name.toLowerCase()));
    if (!chosen) {
      chosen = locations[i % locations.length];
    }
    const jitterLat = (Math.random() - 0.5) * 0.015;
    const jitterLng = (Math.random() - 0.5) * 0.015;
    const finalLat = parseFloat((chosen.lat + jitterLat).toFixed(6));
    const finalLng = parseFloat((chosen.lng + jitterLng).toFixed(6));
    const finalName = p.origen || `${chosen.name}, Montes de María`;

    await queryAsync(
      "UPDATE productos SET latitud = ?, longitud = ?, ubicacion_nombre = ? WHERE id_producto = ?",
      [finalLat, finalLng, finalName, p.id_producto]
    );
  }

  console.log('🎉 Migración de geolocalización completada con éxito.');
  process.exit(0);
}

migrate().catch(e => {
  console.error('❌ Error en la migración:', e);
  process.exit(1);
});
