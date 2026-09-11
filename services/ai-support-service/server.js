/**
 * Microservicio: AI & Support Service Enterprise
 * Puerto: 3004 (por defecto o AI_SUPPORT_SERVICE_PORT)
 * Base de Datos Privada: db_support
 * Responsabilidades: Tickets de soporte al cliente, Socket.IO para soporte en tiempo real
 * y Asistente IA (OpenRouter / LLM) para la tienda y consultas.
 * Trazabilidad: X-Correlation-ID
 * Resiliencia: Heartbeat a ServiceRegistry
 */
require('dotenv').config();
process.env.DB_NAME = process.env.SUPPORT_DB_NAME || 'db_support';

const http = require('http');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { Server } = require('socket.io');

const {
  MySQLSoporteRepository,
  MySQLUsuarioRepository,
  MySQLProductoRepository,
  MySQLCompraRepository
} = require('../../src/infrastructure/adapters/driven/persistence');

const {
  EmailService,
  IAService,
  TelegramService
} = require('../../src/infrastructure/adapters/driven/external');

const SocketHandler = require('../../src/infrastructure/adapters/driving/websocket/SocketHandler');

const {
  SoporteController,
  ChatController
} = require('../../src/infrastructure/adapters/driving/http/controllers');

const createSoporteRoutes = require('../../src/infrastructure/adapters/driving/http/routes/soporte.routes');
const createChatRoutes = require('../../src/infrastructure/adapters/driving/http/routes/chat.routes');

const { correlationMiddleware } = require('../common/tracing/correlation');
const { registry } = require('../common/registry/ServiceRegistry');

const app = express();
const server = http.createServer(app);
const PORT = process.env.AI_SUPPORT_SERVICE_PORT || 3004;

// Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trazabilidad Distribuida (Correlation-ID)
app.use(correlationMiddleware('ai-support-service'));

// Configuración de Socket.IO
const io = new Server(server, {
  cors: { origin: true, credentials: true },
  path: '/socket.io'
});
const socketHandler = new SocketHandler(io);

// Inyección de dependencias
const soporteRepository = new MySQLSoporteRepository();
const usuarioRepository = new MySQLUsuarioRepository();
const productoRepository = new MySQLProductoRepository();
const compraRepository = new MySQLCompraRepository();

const emailService = new EmailService();
const iaService = new IAService(emailService);
const telegramService = new TelegramService({
  soporteRepository,
  iaService,
  productoRepository,
  usuarioRepository,
  compraRepository,
  emailService
});
telegramService.socketHandler = socketHandler;

const soporteController = new SoporteController({
  soporteRepository,
  usuarioRepository,
  productoRepository,
  compraRepository,
  emailService,
  iaService,
  socketHandler,
  telegramService
});

const chatController = new ChatController({
  iaService,
  productoRepository,
  usuarioRepository,
  compraRepository
});

// Rutas del servicio
app.use('/api/soporte', createSoporteRoutes(soporteController));
app.use('/api/chat', createChatRoutes(chatController));

// Health check
app.get('/health', (req, res) => {
  res.json({
    service: 'ai-support-service',
    status: 'UP',
    database: process.env.DB_NAME,
    port: PORT,
    correlationId: req.correlationId,
    timestamp: new Date().toISOString()
  });
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`🤖 [AI & Support Service Enterprise] corriendo en puerto ${PORT} conectado a [${process.env.DB_NAME}]`);
    // Iniciar latido a Service Registry
    registry.startHeartbeat({ serviceName: 'ai-support-service', port: PORT });
  });
}

module.exports = { app, server };
