/**
 * Microservicio: Orders & Payment Service
 * Puerto: 3003 (por defecto o ORDER_SERVICE_PORT)
 * Responsabilidades: Gestión de compras, órdenes, cálculo de costos de envío,
 * cupones de descuento, firmas de pasarela Wompi y verificación OTP de entregas.
 */
require('dotenv').config();
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

const app = express();
const PORT = process.env.ORDER_SERVICE_PORT || 3003;

// Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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

const couponController = new CouponController(couponRepository);

// Rutas del servicio
app.use('/api/compra', createCompraRoutes(compraController));
app.use('/api/compras', createCompraRoutes(compraController));
app.use('/api/cupones', createCouponRoutes(couponController));

// Health check
app.get('/health', (req, res) => {
  res.json({ service: 'order-service', status: 'UP', port: PORT });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`💳 [Order Service] corriendo en puerto ${PORT}`);
  });
}

module.exports = app;
