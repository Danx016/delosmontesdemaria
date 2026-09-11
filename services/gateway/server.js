/**
 * API Gateway Central - De los Montes de María
 * Puerto: 3000 (o PORT de entorno)
 * Enruta peticiones HTTP y WebSockets a los microservicios correspondientes.
 * Provee seguridad centralizada, CORS y servicio de estáticos para React SPA.
 */
require('dotenv').config();
const http = require('http');
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;

// Definición de destinos de los microservicios
const SERVICES = {
  auth: process.env.AUTH_SERVICE_URL || 'http://127.0.0.1:3001',
  catalog: process.env.CATALOG_SERVICE_URL || 'http://127.0.0.1:3002',
  order: process.env.ORDER_SERVICE_URL || 'http://127.0.0.1:3003',
  support: process.env.AI_SUPPORT_SERVICE_URL || 'http://127.0.0.1:3004',
  notification: process.env.NOTIFICATION_SERVICE_URL || 'http://127.0.0.1:3005'
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

// Archivos Estáticos
const rootDir = path.resolve(__dirname, '../..');
app.use('/uploads', express.static(path.join(rootDir, 'public/uploads'), { maxAge: '1d' }));
app.use('/img', express.static(path.join(rootDir, 'public/img'), { maxAge: '1d' }));
app.use(express.static(path.join(rootDir, 'public')));

const clientDistPath = path.join(rootDir, 'client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
}

// Health check consolidado
app.get('/health', async (req, res) => {
  res.json({
    gateway: 'UP',
    port: PORT,
    timestamp: new Date().toISOString(),
    services: SERVICES
  });
});

// Proxy para WebSockets (Socket.IO hacia ai-support-service)
const wsProxy = createProxyMiddleware({
  target: SERVICES.support,
  changeOrigin: true,
  ws: true,
  logLevel: 'silent'
});
app.use('/socket.io', wsProxy);

// Enrutamiento de Reverse-Proxy a Microservicios (Preservando URL completa)
app.use(createProxyMiddleware({
  pathFilter: (pathname) => pathname.startsWith('/api/auth') || pathname.startsWith('/api/user') || pathname.startsWith('/register') || pathname.startsWith('/login') || pathname.startsWith('/api/recover'),
  target: SERVICES.auth,
  changeOrigin: true,
  xfwd: true
}));

app.use(createProxyMiddleware({
  pathFilter: (pathname) => pathname.startsWith('/api/productos') || pathname.startsWith('/api/banners'),
  target: SERVICES.catalog,
  changeOrigin: true,
  xfwd: true
}));

app.use(createProxyMiddleware({
  pathFilter: (pathname) => pathname.startsWith('/api/compra') || pathname.startsWith('/api/compras') || pathname.startsWith('/api/cupones'),
  target: SERVICES.order,
  changeOrigin: true,
  xfwd: true
}));

app.use(createProxyMiddleware({
  pathFilter: (pathname) => pathname.startsWith('/api/soporte') || pathname.startsWith('/api/chat'),
  target: SERVICES.support,
  changeOrigin: true,
  xfwd: true
}));

app.use(createProxyMiddleware({
  pathFilter: (pathname) => pathname.startsWith('/api/telegram'),
  target: SERVICES.notification,
  changeOrigin: true,
  xfwd: true
}));

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
    console.log(`🌐 [API Gateway] corriendo en puerto ${PORT}`);
    console.log(`📡 Enrutando a los microservicios en puertos 3001 a 3005`);
  });
}

module.exports = { app, server };
