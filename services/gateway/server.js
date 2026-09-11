/**
 * API Gateway Central Enterprise - De los Montes de María
 * Puerto: 3000 (o PORT de entorno)
 * Características avanzadas:
 * 1. Trazabilidad Distribuida: Inyección y propagación de X-Correlation-ID
 * 2. Circuit Breakers: Protección contra fallas en cascada y timeouts
 * 3. Service Registry: Descubrimiento de microservicios vivos en Redis
 * 4. Inspección de Dead Letter Queue (DLQ)
 * 5. Servido de SPA React y proxy WebSocket
 */
require('dotenv').config();
const http = require('http');
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { createProxyMiddleware } = require('http-proxy-middleware');

const { correlationMiddleware } = require('../common/tracing/correlation');
const { CircuitBreaker } = require('../common/resilience/CircuitBreaker');
const { registry } = require('../common/registry/ServiceRegistry');
const { eventBus } = require('../common/events/EventBus');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;

// Destinos de los microservicios
const SERVICES = {
  auth: process.env.AUTH_SERVICE_URL || 'http://127.0.0.1:3001',
  catalog: process.env.CATALOG_SERVICE_URL || 'http://127.0.0.1:3002',
  order: process.env.ORDER_SERVICE_URL || 'http://127.0.0.1:3003',
  support: process.env.AI_SUPPORT_SERVICE_URL || 'http://127.0.0.1:3004',
  notification: process.env.NOTIFICATION_SERVICE_URL || 'http://127.0.0.1:3005'
};

// Circuit Breakers por servicio
const circuits = {
  auth: new CircuitBreaker('auth-service', { failureThreshold: 5, recoveryTimeout: 10000 }),
  catalog: new CircuitBreaker('catalog-service', { failureThreshold: 5, recoveryTimeout: 10000 }),
  order: new CircuitBreaker('order-service', { failureThreshold: 5, recoveryTimeout: 10000 }),
  support: new CircuitBreaker('ai-support-service', { failureThreshold: 5, recoveryTimeout: 10000 }),
  notification: new CircuitBreaker('notification-service', { failureThreshold: 5, recoveryTimeout: 10000 })
};

app.set('trust proxy', 1);

// Seguridad HTTP
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: false
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? (process.env.PRODUCTION_URL || true)
    : ['http://localhost:3000', 'http://localhost:3443', 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

// Trazabilidad Distribuida: inyectar X-Correlation-ID en toda petición
app.use(correlationMiddleware('gateway'));

// Archivos Estáticos
const rootDir = path.resolve(__dirname, '../..');
app.use('/uploads', express.static(path.join(rootDir, 'public/uploads'), { maxAge: '1d' }));
app.use('/img', express.static(path.join(rootDir, 'public/img'), { maxAge: '1d' }));
app.use(express.static(path.join(rootDir, 'public')));

const clientDistPath = path.join(rootDir, 'client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
}

// ==========================================
// ENDPOINTS DE OBSERVABILIDAD Y MONITOREO
// ==========================================

// Health check consolidado
app.get(['/health', '/api/health'], async (req, res) => {
  const circuitStatus = {};
  for (const [key, circuit] of Object.entries(circuits)) {
    circuitStatus[key] = circuit.state;
  }

  res.json({
    gateway: 'UP',
    port: PORT,
    correlationId: req.correlationId,
    timestamp: new Date().toISOString(),
    services: SERVICES,
    circuitBreakers: circuitStatus
  });
});

// Estado detallado de los Circuit Breakers
app.get('/api/circuit-status', (req, res) => {
  const status = {};
  for (const [key, circuit] of Object.entries(circuits)) {
    status[key] = circuit.getStatus();
  }
  res.json({
    correlationId: req.correlationId,
    circuits: status
  });
});

// Service Registry en vivo (instancias vivas descubiertas en Redis)
app.get('/api/registry', async (req, res) => {
  const services = await registry.getAllServices();
  res.json({
    correlationId: req.correlationId,
    count: services.length,
    instances: services
  });
});

// Inspección de Dead Letter Queue (DLQ)
app.get('/api/dlq', async (req, res) => {
  const messages = await eventBus.getDLQMessages(20);
  res.json({
    correlationId: req.correlationId,
    count: messages.length,
    messages
  });
});

// Resetear un Circuit Breaker manualmente desde el panel de control
app.post('/api/circuit-status/reset/:service', (req, res) => {
  const { service } = req.params;
  const circuit = circuits[service];
  if (!circuit) {
    return res.status(404).json({ error: `Circuito para servicio [${service}] no encontrado.` });
  }
  circuit.state = 'CLOSED';
  circuit.failureCount = 0;
  res.json({ success: true, message: `Circuito [${service}] reseteado a CLOSED exitosamente.` });
});

// Limpiar mensajes acumulados de la DLQ
app.post('/api/dlq/clear', async (req, res) => {
  try {
    const redis = registry.getRedisClient();
    await redis.del('stream:dlq');
    res.json({ success: true, message: 'Dead Letter Queue vaciada exitosamente.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Proxy para WebSockets (Socket.IO hacia ai-support-service)
const wsProxy = createProxyMiddleware({
  target: SERVICES.support,
  changeOrigin: true,
  ws: true,
  logLevel: 'silent',
  onProxyReq: (proxyReq, req) => {
    if (req.correlationId) {
      proxyReq.setHeader('X-Correlation-ID', req.correlationId);
    }
  }
});
app.use('/socket.io', wsProxy);

// ==========================================
// PROXY RESILIENTE CON CIRCUIT BREAKER
// ==========================================

function createResilientProxy(circuit, targetUrl, pathFilterRule) {
  const proxy = createProxyMiddleware({
    pathFilter: pathFilterRule,
    target: targetUrl,
    changeOrigin: true,
    xfwd: true,
    proxyTimeout: 10000,
    timeout: 10000,
    onProxyReq: (proxyReq, req) => {
      // Propagar Correlation-ID hacia el microservicio
      if (req.correlationId) {
        proxyReq.setHeader('X-Correlation-ID', req.correlationId);
      }
    },
    onProxyRes: (proxyRes, req, res) => {
      if (proxyRes.statusCode >= 500) {
        circuit.recordFailure(`HTTP ${proxyRes.statusCode}`);
      } else {
        circuit.recordSuccess();
      }
    },
    onError: (err, req, res) => {
      circuit.recordFailure(err);
      if (!res.headersSent) {
        res.status(503).json({
          success: false,
          error: `Error de conexión con el microservicio [${circuit.serviceName}].`,
          details: err.message,
          circuitState: circuit.state,
          correlationId: req.correlationId
        });
      }
    }
  });

  return [
    (req, res, next) => {
      if (pathFilterRule(req.path)) {
        return circuit.middleware()(req, res, next);
      }
      next();
    },
    proxy
  ];
}

// 1. Auth Service (3001)
app.use(createResilientProxy(
  circuits.auth,
  SERVICES.auth,
  (p) => p.startsWith('/api/auth') || p.startsWith('/api/user') || p.startsWith('/register') || p.startsWith('/login') || p.startsWith('/api/recover')
));

// 2. Catalog Service (3002)
app.use(createResilientProxy(
  circuits.catalog,
  SERVICES.catalog,
  (p) => p.startsWith('/api/productos') || p.startsWith('/api/banners')
));

// 3. Order Service (3003)
app.use(createResilientProxy(
  circuits.order,
  SERVICES.order,
  (p) => p.startsWith('/api/compra') || p.startsWith('/api/compras') || p.startsWith('/api/cupones')
));

// 4. Support Service (3004)
app.use(createResilientProxy(
  circuits.support,
  SERVICES.support,
  (p) => p.startsWith('/api/soporte') || p.startsWith('/api/chat')
));

// 5. Notification Service (3005)
app.use(createResilientProxy(
  circuits.notification,
  SERVICES.notification,
  (p) => p.startsWith('/api/telegram') || p.startsWith('/api/notification') || p.startsWith('/api/whatsapp')
));

// Fallback SPA React
app.use((req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/img') || req.path.startsWith('/socket.io')) {
    return next();
  }
  const indexPath = path.join(clientDistPath, 'index.html');
  if (req.accepts('html') && fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  next();
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`🌐 [API Gateway Enterprise] corriendo en puerto ${PORT}`);
    console.log(`🛡️ Circuit Breakers activos para todos los microservicios.`);
    console.log(`🔍 Trazabilidad X-Correlation-ID y Service Discovery activados.`);
  });
}

module.exports = { app, server };
