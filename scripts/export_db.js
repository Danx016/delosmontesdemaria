const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function dump() {
  const conn = await mysql.createConnection({
    host: '149.130.189.158',
    port: 3306,
    user: 'admin',
    password: 'Danilo.1050',
    database: 'dbmontesdm',
    ssl: { rejectUnauthorized: false }
  });

  console.log('Conectado exitosamente a Oracle Cloud MySQL...');
  const [tables] = await conn.query('SHOW TABLES');
  const tableNames = tables.map(t => Object.values(t)[0]);
  console.log('Tablas detectadas (' + tableNames.length + '):', tableNames);

  let sqlDump = `-- ========================================================\n`;
  sqlDump += `-- MIGRACIÓN BASE DE DATOS: DE LOS MONTES DE MARÍA\n`;
  sqlDump += `-- Origen: Oracle Cloud (149.130.189.158)\n`;
  sqlDump += `-- Destino: Servidor Propio (Localhost / Ubuntu Server)\n`;
  sqlDump += `-- Fecha de volcado: ${new Date().toISOString()}\n`;
  sqlDump += `-- ========================================================\n\n`;
  sqlDump += `CREATE DATABASE IF NOT EXISTS \`dbmontesdm\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\n`;
  sqlDump += `USE \`dbmontesdm\`;\n\n`;
  sqlDump += `SET FOREIGN_KEY_CHECKS = 0;\n`;
  sqlDump += `SET NAMES utf8mb4;\n\n`;

  for (const table of tableNames) {
    const [[createTable]] = await conn.query(`SHOW CREATE TABLE \`${table}\``);
    sqlDump += `-- --------------------------------------------------------\n`;
    sqlDump += `-- Estructura de tabla: \`${table}\`\n`;
    sqlDump += `-- --------------------------------------------------------\n`;
    sqlDump += `DROP TABLE IF EXISTS \`${table}\`;\n`;
    sqlDump += `${createTable['Create Table']};\n\n`;

    const [rows] = await conn.query(`SELECT * FROM \`${table}\``);
    console.log(`Tabla ${table}: ${rows.length} registros`);
    if (rows.length > 0) {
      sqlDump += `-- Registros de \`${table}\`\n`;
      const cols = Object.keys(rows[0]).map(c => `\`${c}\``).join(', ');

      const rowValues = [];
      for (const row of rows) {
        const vals = Object.values(row).map(val => {
          if (val === null || val === undefined) return 'NULL';
          if (typeof val === 'number') return val;
          if (typeof val === 'boolean') return val ? 1 : 0;
          if (val instanceof Date) {
            return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
          }
          if (Buffer.isBuffer(val)) {
            return `X'${val.toString('hex')}'`;
          }
          const escaped = String(val)
            .replace(/\\/g, '\\\\')
            .replace(/'/g, "\\'")
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r');
          return `'${escaped}'`;
        });
        rowValues.push(`(${vals.join(', ')})`);
      }

      sqlDump += `INSERT INTO \`${table}\` (${cols}) VALUES\n${rowValues.join(',\n')};\n\n`;
    }
  }

  sqlDump += `SET FOREIGN_KEY_CHECKS = 1;\n`;
  const outputPath = path.join(__dirname, '..', 'backup_dbmontesdm.sql');
  fs.writeFileSync(outputPath, sqlDump, 'utf8');
  console.log(`\n🎉 Volcado completo guardado en: ${outputPath}`);
  await conn.end();
}

dump().catch(err => {
  console.error('❌ Error durante la exportación:', err);
  process.exit(1);
});
