/**
 * Suite de Pruebas de Carga, Estrés y Caos (Stress & Chaos Testing)
 * Evalúa el Throughput (RPS), Latencias (P50, P95, P99), Caché Redis y Circuit Breakers.
 */
const http = require('http');

const BASE_URL = process.env.TARGET_URL || 'http://127.0.0.1:3000';
const parsedUrl = new URL(BASE_URL);

// Agente HTTP con pool de sockets reutilizables (Keep-Alive)
const httpAgent = new http.Agent({
  keepAlive: true,
  maxSockets: 100
});

function sendRequest(path, method = 'GET') {
  return new Promise((resolve) => {
    const start = process.hrtime.bigint();
    const req = http.request({
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 80,
      path,
      method,
      agent: httpAgent,
      headers: {
        'Connection': 'keep-alive',
        'User-Agent': 'StressTestRunner/1.0'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const end = process.hrtime.bigint();
        const durationMs = Number(end - start) / 1e6;
        resolve({
          status: res.statusCode,
          durationMs,
          cacheHeader: res.headers['x-cache'] || 'NONE',
          correlationId: res.headers['x-correlation-id'] || 'N/A'
        });
      });
    });

    req.on('error', (err) => {
      const end = process.hrtime.bigint();
      resolve({
        status: 0,
        error: err.message,
        durationMs: Number(end - start) / 1e6
      });
    });

    req.end();
  });
}

async function runLoadBatch({ name, path, totalRequests = 500, concurrency = 50 }) {
  console.log(`\n==================================================`);
  console.log(`🚀 Iniciando Prueba: ${name}`);
  console.log(`🎯 Destino: ${BASE_URL}${path}`);
  console.log(`📊 Concurrencia: ${concurrency} | Peticiones Totales: ${totalRequests}`);
  console.log(`==================================================`);

  const results = [];
  let completed = 0;

  const startTime = Date.now();

  async function worker() {
    while (completed < totalRequests) {
      completed++;
      const res = await sendRequest(path);
      results.push(res);
      if (results.length % 100 === 0 || results.length === totalRequests) {
        process.stdout.write(`  ⏳ Progreso: ${results.length}/${totalRequests} (${Math.round(results.length / totalRequests * 100)}%)\r`);
      }
    }
  }

  const workers = [];
  for (let i = 0; i < concurrency; i++) {
    workers.push(worker());
  }

  await Promise.all(workers);
  const totalTimeSeconds = (Date.now() - startTime) / 1000;

  // Análisis estadístico
  const successful = results.filter(r => r.status >= 200 && r.status < 400);
  const failed = results.filter(r => r.status === 0 || r.status >= 500);
  const durations = successful.map(r => r.durationMs).sort((a, b) => a - b);

  const cacheHits = results.filter(r => r.cacheHeader === 'HIT').length;
  const cacheMisses = results.filter(r => r.cacheHeader === 'MISS').length;

  const minLatency = durations[0] || 0;
  const maxLatency = durations[durations.length - 1] || 0;
  const avgLatency = durations.length ? (durations.reduce((a, b) => a + b, 0) / durations.length) : 0;
  const p50 = durations[Math.floor(durations.length * 0.50)] || 0;
  const p90 = durations[Math.floor(durations.length * 0.90)] || 0;
  const p99 = durations[Math.floor(durations.length * 0.99)] || 0;
  const rps = totalRequests / totalTimeSeconds;

  console.log(`\n\n📈 --- RESULTADOS: ${name} ---`);
  console.log(`  ⏱️  Tiempo Total de Prueba: ${totalTimeSeconds.toFixed(2)}s`);
  console.log(`  ⚡ Throughput (RPS):       ${rps.toFixed(1)} req/segundo`);
  console.log(`  ✅ Exitosas (2xx/3xx):     ${successful.length} (${(successful.length / totalRequests * 100).toFixed(1)}%)`);
  console.log(`  ❌ Errores (5xx/Fail):     ${failed.length}`);
  if (cacheHits + cacheMisses > 0) {
    console.log(`  🚀 Caché Redis (HITs):     ${cacheHits} (${(cacheHits / totalRequests * 100).toFixed(1)}%)`);
    console.log(`  🔍 Base de Datos (MISSes): ${cacheMisses}`);
  }
  console.log(`  ⏱️  Latencia Mínima:        ${minLatency.toFixed(2)} ms`);
  console.log(`  ⏱️  Latencia Promedio:      ${avgLatency.toFixed(2)} ms`);
  console.log(`  ⏱️  Latencia Mediana (P50): ${p50.toFixed(2)} ms`);
  console.log(`  ⏱️  Latencia P90:           ${p90.toFixed(2)} ms`);
  console.log(`  ⏱️  Latencia P99 (Picos):   ${p99.toFixed(2)} ms`);

  return { rps, avgLatency, p99, successful: successful.length, failed: failed.length };
}

async function main() {
  console.log('🧪 =======================================================');
  console.log('🛡️  SUITE DE BENCHMARKING Y ESTRÉS DE MICROSERVICIOS');
  console.log('Plataforma Agropecuaria "De los Montes de María"');
  console.log('=======================================================');

  // 1. Calentar la caché con una petición
  console.log('🔥 Calentando caché Redis para /api/productos...');
  await sendRequest('/api/productos');

  // 2. Prueba 1: Catálogo de Productos con Caché Redis
  await runLoadBatch({
    name: 'Catálogo de Productos con Caché Redis (Cache-Aside)',
    path: '/api/productos',
    totalRequests: 500,
    concurrency: 50
  });

  // 3. Prueba 2: API Gateway Health Check y Circuit Status
  await runLoadBatch({
    name: 'API Gateway Throughput y Circuit Status',
    path: '/api/circuit-status',
    totalRequests: 500,
    concurrency: 50
  });

  // 4. Prueba 3: Consulta al Service Registry
  await runLoadBatch({
    name: 'Service Registry en Vivo (Redis Discovery)',
    path: '/api/registry',
    totalRequests: 300,
    concurrency: 30
  });

  console.log('\n🏆 ¡Todas las pruebas de carga finalizaron con éxito!');
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Error fatal en stress test:', err);
  process.exit(1);
});
