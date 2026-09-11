/**
 * Microservicio: Notification & Telegram Service
 * Puerto: 3005 (por defecto o NOTIFICATION_SERVICE_PORT)
 * Responsabilidades: Gestión del bot oficial de Telegram (@montesdemariabot),
 * Webhook de comandos, notificaciones a campesinos y administradores,
 * y cola de envíos de correo transaccional (Brevo API y Gmail SMTP).
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const {
  MySQLSoporteRepository,
  MySQLProductoRepository,
  MySQLUsuarioRepository,
  MySQLCompraRepository
} = require('../../src/infrastructure/adapters/driven/persistence');

const {
  EmailService,
  IAService,
  TelegramService
} = require('../../src/infrastructure/adapters/driven/external');

const createTelegramRoutes = require('../../src/infrastructure/adapters/driving/http/routes/telegram.routes');

const app = express();
const PORT = process.env.NOTIFICATION_SERVICE_PORT || 3005;

// Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Inyección de dependencias
const soporteRepository = new MySQLSoporteRepository();
const productoRepository = new MySQLProductoRepository();
const usuarioRepository = new MySQLUsuarioRepository();
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

// Rutas del servicio
app.use('/api/telegram', createTelegramRoutes(telegramService));

// Health check
app.get('/health', (req, res) => {
  res.json({ service: 'notification-service', status: 'UP', port: PORT });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`📢 [Notification Service] corriendo en puerto ${PORT}`);
  });
}

module.exports = app;
