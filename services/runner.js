/**
 * Orquestador Local de Microservicios
 * Inicia el API Gateway y todos los microservicios en simultáneo con logs identificados.
 */
const { spawn } = require('child_process');
const path = require('path');

const SERVICES = [
  { name: 'AUTH', script: 'services/auth-service/server.js', port: 3001, color: '\x1b[33m' },         // Amarillo
  { name: 'CATALOG', script: 'services/catalog-service/server.js', port: 3002, color: '\x1b[32m' },     // Verde
  { name: 'ORDERS', script: 'services/order-service/server.js', port: 3003, color: '\x1b[35m' },       // Magenta
  { name: 'SUPPORT', script: 'services/ai-support-service/server.js', port: 3004, color: '\x1b[36m' },  // Cyan
  { name: 'NOTIFY', script: 'services/notification-service/server.js', port: 3005, color: '\x1b[34m' }, // Azul
  { name: 'GATEWAY', script: 'services/gateway/server.js', port: 3000, color: '\x1b[31m' }             // Rojo/Destacado
];

const RESET = '\x1b[0m';
const processes = [];

console.log('\n🚀 Iniciando Ecosistema de Microservicios De los Montes de María...\n');

SERVICES.forEach(service => {
  const child = spawn('node', [service.script], {
    cwd: path.resolve(__dirname, '..'),
    env: { ...process.env, PORT: service.port },
    stdio: ['inherit', 'pipe', 'pipe']
  });

  const prefix = `${service.color}[${service.name}:${service.port}]${RESET} `;

  child.stdout.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach(line => {
      if (line.trim()) console.log(`${prefix}${line}`);
    });
  });

  child.stderr.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach(line => {
      if (line.trim()) console.error(`${prefix}\x1b[31m${line}${RESET}`);
    });
  });

  child.on('close', (code) => {
    console.log(`${prefix}Detenido con código ${code}`);
  });

  processes.push(child);
});

// Manejo de apagado graceful
function shutdown() {
  console.log('\n🛑 Deteniendo todos los microservicios...\n');
  processes.forEach(child => {
    try {
      child.kill('SIGINT');
    } catch (e) {}
  });
  setTimeout(() => process.exit(0), 1000);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
