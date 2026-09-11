/**
 * Microservicio: Catalog & Product Service Enterprise
 * Puerto: 3002 (por defecto o CATALOG_SERVICE_PORT)
 * Base de Datos Privada: db_catalog
 * Responsabilidades: Catálogo de productos agropecuarios, categorías,
 * filtros de búsqueda, inventario y banners dinámicos.
 * Trazabilidad: X-Correlation-ID
 * Eventos: Pub/Sub y Redis Streams con Consumer Groups y XACK
 * Resiliencia: Heartbeat a ServiceRegistry
 */
require('dotenv').config();
process.env.DB_NAME = process.env.CATALOG_DB_NAME || 'db_catalog';

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const {
  MySQLProductoRepository,
  MySQLCategoriaRepository,
  MySQLBannerRepository,
  db
} = require('../../src/infrastructure/adapters/driven/persistence');

const {
  ProductoController,
  BannerController
} = require('../../src/infrastructure/adapters/driving/http/controllers');

const createProductoRoutes = require('../../src/infrastructure/adapters/driving/http/routes/producto.routes');
const createBannerRoutes = require('../../src/infrastructure/adapters/driving/http/routes/banner.routes');

const { eventBus, CHANNELS, STREAMS, EVENTS } = require('../common/events/EventBus');
const { correlationMiddleware } = require('../common/tracing/correlation');
const { registry } = require('../common/registry/ServiceRegistry');

const app = express();
const PORT = process.env.CATALOG_SERVICE_PORT || 3002;

// Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trazabilidad Distribuida (Correlation-ID)
app.use(correlationMiddleware('catalog-service'));

// Inyección de dependencias
const productoRepository = new MySQLProductoRepository();
const categoriaRepository = new MySQLCategoriaRepository();
const bannerRepository = new MySQLBannerRepository();

const productoController = new ProductoController({
  productoRepository,
  categoriaRepository
});
const bannerController = new BannerController(bannerRepository);

// Rutas del servicio
app.use('/api/productos', createProductoRoutes(productoController));
app.use('/api/banners', createBannerRoutes(bannerController));

// Lógica de procesamiento de orden (actualización de inventario)
const procesarOrdenInventario = async (event, msgId = 'pubsub') => {
  if (event.type === EVENTS.ORDER_CREATED && event.data && Array.isArray(event.data.items)) {
    const trace = event.correlationId || 'N/A';
    console.log(`📦 [Catalog Event: ${msgId}] [Trace: ${trace}] Procesando orden #${event.data.orderId || ''}, actualizando stock...`);
    for (const item of event.data.items) {
      const prodId = item.id_producto || item.id;
      const cant = Number(item.cantidad || item.quantity || 1);
      if (prodId && cant > 0) {
        await new Promise((resolve) => {
          db.query(
            'UPDATE productos SET stock = GREATEST(0, stock - ?) WHERE id_producto = ?',
            [cant, prodId],
            (err) => {
              if (err) console.error(`⚠️ Error al decrementar stock para producto #${prodId}:`, err.message);
              else console.log(`  ✅ Stock decrementado para producto #${prodId} (-${cant} unidades)`);
              resolve();
            }
          );
        });
      }
    }
  }
};

// 1. Suscripción en tiempo real vía Pub/Sub
eventBus.subscribe(CHANNELS.ORDERS, procesarOrdenInventario);

// 2. Consumo garantizado persistente vía Redis Streams (Consumer Group)
eventBus.consumeStream({
  streamKey: STREAMS.ORDERS,
  groupName: 'cg:catalog',
  consumerName: `catalog-${process.pid}`,
  handler: procesarOrdenInventario
}).catch(err => console.warn('⚠️ [Catalog Stream Consumer Init Warning]:', err.message));

// Health check
app.get('/health', (req, res) => {
  res.json({
    service: 'catalog-service',
    status: 'UP',
    database: process.env.DB_NAME,
    port: PORT,
    correlationId: req.correlationId,
    timestamp: new Date().toISOString()
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`📦 [Catalog Service Enterprise] corriendo en puerto ${PORT} conectado a [${process.env.DB_NAME}]`);
    // Iniciar latido a Service Registry
    registry.startHeartbeat({ serviceName: 'catalog-service', port: PORT });
  });
}

module.exports = app;
