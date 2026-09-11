/**
 * Microservicio: Notification & Telegram Service Enterprise
 * Puerto: 3005 (por defecto o NOTIFICATION_SERVICE_PORT)
 * Responsabilidades: Gestión del bot oficial de Telegram (@montesdemariabot),
 * Webhook de comandos, notificaciones a campesinos y administradores,
 * y cola de envíos de correo transaccional (Brevo API y Gmail SMTP) mediante EventBus.
 * Trazabilidad: X-Correlation-ID
 * Eventos: Pub/Sub y Redis Streams con Consumer Groups
 * Resiliencia: Heartbeat a ServiceRegistry
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { EmailService, TelegramService, WhatsAppService } = require('../../src/infrastructure/adapters/driven/external');
const createTelegramRoutes = require('../../src/infrastructure/adapters/driving/http/routes/telegram.routes');

const { eventBus, CHANNELS, STREAMS, EVENTS } = require('../common/events/EventBus');
const { correlationMiddleware } = require('../common/tracing/correlation');
const { registry } = require('../common/registry/ServiceRegistry');

const app = express();
const PORT = process.env.NOTIFICATION_SERVICE_PORT || 3005;

// Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trazabilidad Distribuida (Correlation-ID)
app.use(correlationMiddleware('notification-service'));

// Inyección de adaptadores
const emailService = new EmailService();
const telegramService = new TelegramService({ emailService });
const whatsAppService = new WhatsAppService();

// Rutas del servicio (Webhook de Telegram)
app.use('/api/telegram', createTelegramRoutes(telegramService));

// Endpoint de prueba directa de WhatsApp
app.post('/api/notification/whatsapp/test', async (req, res) => {
  try {
    const { to, message } = req.body;
    if (!to) return res.status(400).json({ error: 'Falta el número de teléfono (to)' });
    const result = await whatsAppService.sendMessage(to, message || '🌾 ¡Hola desde De los Montes de María! Tu servicio de WhatsApp está activo.');
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Lógica de notificación de nueva compra
const procesarAlertaCompra = async (event, msgId = 'pubsub') => {
  if (event.type === EVENTS.ORDER_CREATED && event.data) {
    const trace = event.correlationId || 'N/A';
    const { orderId, total, items, shippingAddress, customerPhone, phone } = event.data;
    console.log(`📢 [Notification Service: ${msgId}] [Trace: ${trace}] Evento recibido: ORDER_CREATED #${orderId}`);

    // 1. Notificar por Telegram al administrador y campesinos
    try {
      const msg = `🌾 *¡NUEVA COMPRA EN LA PLATAFORMA!*\n\n` +
                  `📦 *Orden:* #${orderId || 'N/A'}\n` +
                  `💰 *Total:* $${Number(total || 0).toLocaleString('es-CO')}\n` +
                  `📍 *Dirección:* ${shippingAddress || 'Domicilio'}\n` +
                  `🛒 *Productos:* ${Array.isArray(items) ? items.length : 1} producto(s)\n` +
                  `🔍 *Trace:* \`${trace}\``;

      if (process.env.TELEGRAM_ADMIN_CHAT_ID) {
        await telegramService.sendMessage(process.env.TELEGRAM_ADMIN_CHAT_ID, msg);
        console.log(`  ✅ Alerta de venta enviada al Telegram de Administrador`);
      }
    } catch (err) {
      console.error(`⚠️ [Telegram Event Error: ${msgId}]:`, err.message);
    }

    // 2. Notificar por WhatsApp Oficial de Meta
    if (whatsAppService.isConfigured()) {
      try {
        const destPhone = customerPhone || phone || process.env.WHATSAPP_ADMIN_PHONE;
        if (destPhone) {
          await whatsAppService.sendOrderAlertToFarmer(destPhone, event.data);
          console.log(`  📲 Alerta de venta enviada por WhatsApp a: ${destPhone}`);
        }
      } catch (waErr) {
        console.error(`⚠️ [WhatsApp Event Error: ${msgId}]:`, waErr.message);
      }
    }
  }
};

// 1. Suscripción Pub/Sub en tiempo real
eventBus.subscribe(CHANNELS.ORDERS, procesarAlertaCompra);

// 2. Consumo persistente vía Redis Streams (Consumer Group)
eventBus.consumeStream({
  streamKey: STREAMS.ORDERS,
  groupName: 'cg:notifications',
  consumerName: `notif-${process.pid}`,
  handler: procesarAlertaCompra
}).catch(err => console.warn('⚠️ [Notification Stream Consumer Warning]:', err.message));

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
    correlationId: req.correlationId,
    eventBus: 'ACTIVE',
    timestamp: new Date().toISOString()
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`📢 [Notification Service Enterprise] corriendo en puerto ${PORT} suscrito a eventos y streams de Redis`);
    // Iniciar latido a Service Registry
    registry.startHeartbeat({ serviceName: 'notification-service', port: PORT });
  });
}

module.exports = app;
