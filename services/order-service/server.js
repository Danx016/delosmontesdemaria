/**
 * Microservicio: Orders & Payment Service Enterprise
 * Puerto: 3003 (por defecto o ORDER_SERVICE_PORT)
 * Base de Datos Privada: db_orders
 * Responsabilidades: Gestión de compras, órdenes, cálculo de costos de envío,
 * cupones de descuento, firmas de pasarela Wompi y verificación OTP de entregas.
 * Trazabilidad: X-Correlation-ID
 * Eventos: Pub/Sub y Redis Streams persistentes
 * Resiliencia: Heartbeat a ServiceRegistry
 */
require('dotenv').config();
process.env.DB_NAME = process.env.ORDER_DB_NAME || 'db_orders';

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const {
  MySQLCompraRepository,
  MySQLProductoRepository,
  MySQLUsuarioRepository,
  MySQLTokenRepository,
  MySQLCouponRepository
} = require('../../src/infrastructure/adapters/driven/persistence');

const {
  EmailService,
  PaymentService,
  TelegramService
} = require('../../src/infrastructure/adapters/driven/external');

const {
  CompraController,
  CouponController
} = require('../../src/infrastructure/adapters/driving/http/controllers');

const createCompraRoutes = require('../../src/infrastructure/adapters/driving/http/routes/compra.routes');
const createCouponRoutes = require('../../src/infrastructure/adapters/driving/http/routes/coupon.routes');

const { eventBus, CHANNELS, STREAMS, EVENTS } = require('../common/events/EventBus');
const { correlationMiddleware } = require('../common/tracing/correlation');
const { registry } = require('../common/registry/ServiceRegistry');

const app = express();
const PORT = process.env.ORDER_SERVICE_PORT || 3003;

// Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trazabilidad Distribuida (Correlation-ID)
app.use(correlationMiddleware('order-service'));

// Inyección de dependencias
const compraRepository = new MySQLCompraRepository();
const productoRepository = new MySQLProductoRepository();
const usuarioRepository = new MySQLUsuarioRepository();
const tokenRepository = new MySQLTokenRepository();
const couponRepository = new MySQLCouponRepository();

const emailService = new EmailService();
const paymentService = new PaymentService();
const telegramService = new TelegramService({
  compraRepository,
  productoRepository,
  usuarioRepository,
  emailService
});

const compraController = new CompraController({
  compraRepository,
  productoRepository,
  usuarioRepository,
  tokenRepository,
  emailService,
  paymentService,
  couponRepository,
  telegramService
});

// Interceptar el método crear de CompraController para emitir EVENT_ORDER_CREATED en Redis
const originalCrear = compraController.crear.bind(compraController);
compraController.crear = async (req, res) => {
  const originalJson = res.json.bind(res);
  res.json = async function(data) {
    if (data && (data.id_compra || data.compra || (data.message && data.message.includes('exitosa')))) {
      const orderInfo = {
        orderId: data.id_compra || (data.compra && data.compra.id_compra),
        userId: req.user?.id || req.body.idUser || req.body.id_usuario,
        total: req.body.total,
        items: req.body.productos || [],
        paymentMethod: req.body.metodoPago || req.body.metodo_pago,
        shippingAddress: req.body.direccion || req.body.direccion_envio
      };

      const eventPayload = {
        type: EVENTS.ORDER_CREATED,
        correlationId: req.correlationId,
        data: orderInfo
      };

      // 1. Emitir evento volátil en Pub/Sub
      eventBus.publish(CHANNELS.ORDERS, eventPayload);

      // 2. Emitir evento persistente en Redis Stream (garantía de entrega)
      try {
        await eventBus.publishStream(STREAMS.ORDERS, eventPayload);
        console.log(`📢 [EventBus Stream] [Trace: ${req.correlationId}] Evento ORDER_CREATED guardado en Stream persistentemente para orden #${orderInfo.orderId}`);
      } catch (streamErr) {
        console.warn(`⚠️ [EventBus Stream Warning]:`, streamErr.message);
      }
    }
    return originalJson(data);
  };

  return originalCrear(req, res);
};

const couponController = new CouponController(couponRepository);

// Rutas del servicio
app.use('/api/compra', createCompraRoutes(compraController));
app.use('/api/compras', createCompraRoutes(compraController));
app.use('/api/cupones', createCouponRoutes(couponController));

// Health check
app.get('/health', (req, res) => {
  res.json({
    service: 'order-service',
    status: 'UP',
    database: process.env.DB_NAME,
    port: PORT,
    correlationId: req.correlationId,
    timestamp: new Date().toISOString()
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`💳 [Order & Payment Service Enterprise] corriendo en puerto ${PORT} conectado a [${process.env.DB_NAME}]`);
    // Iniciar latido a Service Registry
    registry.startHeartbeat({ serviceName: 'order-service', port: PORT });
  });
}

module.exports = app;
