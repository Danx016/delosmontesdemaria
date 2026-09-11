/**
 * Microservicio: Auth & User Service
 * Puerto: 3001 (por defecto o AUTH_SERVICE_PORT)
 * Base de Datos Privada: db_auth
 * Responsabilidades: Autenticación (Login, Registro, Google OAuth), Tokens JWT,
 * Gestión de usuarios, perfiles y direcciones.
 */
require('dotenv').config();
process.env.DB_NAME = process.env.AUTH_DB_NAME || 'db_auth';

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const { MySQLUsuarioRepository } = require('../../src/infrastructure/adapters/driven/persistence');
const { EmailService, GoogleAuthService, TelegramService } = require('../../src/infrastructure/adapters/driven/external');
const { AuthController, UsuarioController } = require('../../src/infrastructure/adapters/driving/http/controllers');
const createAuthRoutes = require('../../src/infrastructure/adapters/driving/http/routes/auth.routes');
const createUsuarioRoutes = require('../../src/infrastructure/adapters/driving/http/routes/usuario.routes');
const { eventBus, CHANNELS, EVENTS } = require('../common/events/EventBus');

const app = express();
const PORT = process.env.AUTH_SERVICE_PORT || 3001;

// Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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

// Rutas del servicio
app.use('/api/auth', createAuthRoutes(authController));
app.use('/api/user', createUsuarioRoutes(usuarioController));
app.use('/register', createAuthRoutes(authController));
app.use('/login', createAuthRoutes(authController));
app.use('/api/recover', createAuthRoutes(authController));

// Suscripción a eventos de dominio: cuando hay una compra, sumar créditos
eventBus.subscribe(CHANNELS.ORDERS, async (event) => {
  if (event.type === EVENTS.ORDER_CREATED && event.data && event.data.userId) {
    try {
      const { userId, total } = event.data;
      const creditosGanados = Math.floor(Number(total || 0) * 0.01); // 1% de cashback en créditos
      if (creditosGanados > 0) {
        const usuario = await usuarioRepository.buscarPorId(userId);
        if (usuario) {
          const nuevosCreditos = (usuario.creditos || 0) + creditosGanados;
          await usuarioRepository.actualizarCreditos(userId, nuevosCreditos);
          console.log(`✨ [Auth Service Event] Se asignaron ${creditosGanados} créditos al usuario #${userId}`);
        }
      }
    } catch (err) {
      console.error('⚠️ [Auth Service Event Error]:', err.message);
    }
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    service: 'auth-service',
    status: 'UP',
    database: process.env.DB_NAME,
    port: PORT
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🔐 [Auth Service] corriendo en puerto ${PORT} conectado a [${process.env.DB_NAME}]`);
  });
}

module.exports = app;
