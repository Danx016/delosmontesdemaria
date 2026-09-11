/**
 * Microservicio: Notification & Telegram Service
 * Puerto: 3005 (por defecto o NOTIFICATION_SERVICE_PORT)
 * Responsabilidades: Gestión del bot oficial de Telegram (@montesdemariabot),
 * Webhook de comandos, notificaciones a campesinos y administradores,
 * y cola de envíos de correo transaccional (Brevo API y Gmail SMTP) mediante EventBus.
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
const { eventBus, CHANNELS, EVENTS } = require('../common/events/EventBus');

const app = express();
const PORT = process.env.NOTIFICATION_SERVICE_PORT || 3005;

// Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Inyección de adaptadores
const emailService = new EmailService();
const telegramService = new TelegramService({ emailService });

// Rutas del servicio (Webhook de Telegram)
app.use('/api/telegram', createTelegramRoutes(telegramService));

// Suscripciones al Bus de Eventos Redis (Event-Driven Notifications)
eventBus.subscribe(CHANNELS.ORDERS, async (event) => {
  if (event.type === EVENTS.ORDER_CREATED && event.data) {
    const { orderId, total, items, customerEmail, shippingAddress } = event.data;
    console.log(`📢 [Notification Service] Evento recibido: ORDER_CREATED #${orderId}`);

    // 1. Notificar por Telegram al administrador y campesinos
    try {
      const msg = `🌾 *¡NUEVA COMPRA EN LA PLATAFORMA!*\n\n` +
                  `📦 *Orden:* #${orderId || 'N/A'}\n` +
                  `💰 *Total:* $${Number(total || 0).toLocaleString('es-CO')}\n` +
                  `📍 *Dirección:* ${shippingAddress || 'Domicilio'}\n` +
                  `🛒 *Productos:* ${Array.isArray(items) ? items.length : 1} producto(s)`;

      if (process.env.TELEGRAM_ADMIN_CHAT_ID) {
        await telegramService.sendMessage(process.env.TELEGRAM_ADMIN_CHAT_ID, msg);
        console.log(`  ✅ Alerta de venta enviada al Telegram de Administrador`);
      }
    } catch (err) {
      console.error('⚠️ [Telegram Event Error]:', err.message);
    }
  }
});

eventBus.subscribe(CHANNELS.AUTH, async (event) => {
  if (event.type === EVENTS.USER_REGISTERED && event.data) {
    const { nombre, correo, apodo } = event.data;
    console.log(`✉️ [Notification Service] Enviando correo de bienvenida a: ${correo}`);
    try {
      await emailService.sendWelcomeEmail(nombre, correo, apodo);
    } catch (err) {
      console.error('⚠️ [Email Welcome Error]:', err.message);
    }
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    service: 'notification-service',
    status: 'UP',
    port: PORT,
    eventBus: 'ACTIVE'
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`📢 [Notification Service] corriendo en puerto ${PORT} suscrito a eventos de Redis`);
  });
}

module.exports = app;
