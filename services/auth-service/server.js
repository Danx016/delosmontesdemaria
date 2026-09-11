/**
 * Microservicio: Auth & User Service
 * Puerto: 3001 (por defecto o AUTH_SERVICE_PORT)
 * Responsabilidades: Autenticación (Login, Registro, Google OAuth), Tokens JWT,
 * Gestión de usuarios, perfiles y direcciones.
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const { MySQLUsuarioRepository } = require('../../src/infrastructure/adapters/driven/persistence');
const { EmailService, GoogleAuthService, TelegramService } = require('../../src/infrastructure/adapters/driven/external');
const { AuthController, UsuarioController } = require('../../src/infrastructure/adapters/driving/http/controllers');
const createAuthRoutes = require('../../src/infrastructure/adapters/driving/http/routes/auth.routes');
const createUsuarioRoutes = require('../../src/infrastructure/adapters/driving/http/routes/usuario.routes');

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

// Health check
app.get('/health', (req, res) => {
  res.json({ service: 'auth-service', status: 'UP', port: PORT });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🔐 [Auth Service] corriendo en puerto ${PORT}`);
  });
}

module.exports = app;
