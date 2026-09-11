/**
 * Microservicio: Auth & User Service Enterprise
 * Puerto: 3001 (por defecto o AUTH_SERVICE_PORT)
 * Base de Datos Privada: db_auth
 * Responsabilidades: Autenticación (Login, Registro, Google OAuth), Tokens JWT,
 * Gestión de usuarios, perfiles y direcciones.
 * Trazabilidad: X-Correlation-ID
 * Eventos: Pub/Sub y Redis Streams con Consumer Groups
 * Resiliencia: Heartbeat a ServiceRegistry
 */
require('dotenv').config();
process.env.DB_NAME = process.env.AUTH_DB_NAME || 'db_auth';

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const { MySQLUsuarioRepository } = require('../../src/infrastructure/adapters/driven/persistence');
const { EmailService, GoogleAuthService, TelegramService } = require('../../src/infrastructure/adapters/driven/external');
const { AuthController, UsuarioController, AdminController } = require('../../src/infrastructure/adapters/driving/http/controllers');
const createAuthRoutes = require('../../src/infrastructure/adapters/driving/http/routes/auth.routes');
const createUsuarioRoutes = require('../../src/infrastructure/adapters/driving/http/routes/usuario.routes');
const createAdminRoutes = require('../../src/infrastructure/adapters/driving/http/routes/admin.routes');

const { eventBus, CHANNELS, STREAMS, EVENTS } = require('../common/events/EventBus');
const { correlationMiddleware } = require('../common/tracing/correlation');
const { registry } = require('../common/registry/ServiceRegistry');

const app = express();
const PORT = process.env.AUTH_SERVICE_PORT || 3001;

// Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trazabilidad Distribuida (Correlation-ID)
app.use(correlationMiddleware('auth-service'));

// Inyección de dependencias
const usuarioRepository = new MySQLUsuarioRepository();
const emailService = new EmailService();
const googleAuthService = new GoogleAuthService();
const telegramService = new TelegramService({ usuarioRepository, emailService });

const authController = new AuthController({
  usuarioRepository,
  emailService,
  googleAuthService
});

const usuarioController = new UsuarioController({
  usuarioRepository,
  emailService,
  telegramService
});

const adminController = new AdminController({
  usuarioRepository,
  emailService
});

// Rutas del servicio
app.use('/api/auth', createAuthRoutes(authController));
app.use('/api/user', createUsuarioRoutes(usuarioController));
app.use('/api/admin', createAdminRoutes(adminController));
app.use('/register', createAuthRoutes(authController));
app.use('/login', createAuthRoutes(authController));
app.use('/api/recover', createAuthRoutes(authController));

// Lógica de procesamiento de recompensas por compra
const procesarCreditosCompra = async (event, msgId = 'pubsub') => {
  if (event.type === EVENTS.ORDER_CREATED && event.data && event.data.userId) {
    const trace = event.correlationId || 'N/A';
    try {
      const { userId, total } = event.data;
      const creditosGanados = Math.floor(Number(total || 0) * 0.01); // 1% de cashback en créditos
      if (creditosGanados > 0) {
        const usuario = await usuarioRepository.buscarPorId(userId);
        if (usuario) {
          const nuevosCreditos = (usuario.creditos || 0) + creditosGanados;
          await usuarioRepository.actualizarCreditos(userId, nuevosCreditos);
          console.log(`✨ [Auth Service Event: ${msgId}] [Trace: ${trace}] Se asignaron ${creditosGanados} créditos al usuario #${userId}`);
        }
      }
    } catch (err) {
      console.error(`⚠️ [Auth Service Event Error: ${msgId}] [Trace: ${trace}]:`, err.message);
      throw err; // Permite reintento en streams si falla
    }
  }
};

// 1. Suscripción en tiempo real vía Pub/Sub
eventBus.subscribe(CHANNELS.ORDERS, procesarCreditosCompra);

// 2. Consumo persistente con Redis Streams (Consumer Group)
eventBus.consumeStream({
  streamKey: STREAMS.ORDERS,
  groupName: 'cg:auth',
  consumerName: `auth-${process.pid}`,
  handler: procesarCreditosCompra
}).catch(err => console.warn('⚠️ [Auth Stream Consumer Init Warning]:', err.message));

// Health check
app.get('/health', (req, res) => {
  res.json({
    service: 'auth-service',
    status: 'UP',
    database: process.env.DB_NAME,
    port: PORT,
    correlationId: req.correlationId,
    timestamp: new Date().toISOString()
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🔐 [Auth Service Enterprise] corriendo en puerto ${PORT} conectado a [${process.env.DB_NAME}]`);
    // Iniciar latido a Service Registry
    registry.startHeartbeat({ serviceName: 'auth-service', port: PORT });
  });
}

module.exports = app;
