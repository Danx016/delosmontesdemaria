/**
 * Microservicio: Catalog & Product Service
 * Puerto: 3002 (por defecto o CATALOG_SERVICE_PORT)
 * Responsabilidades: Catálogo de productos agropecuarios, categorías,
 * filtros de búsqueda, inventario y banners dinámicos.
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const {
  MySQLProductoRepository,
  MySQLCategoriaRepository,
  MySQLBannerRepository
} = require('../../src/infrastructure/adapters/driven/persistence');

const {
  ProductoController,
  BannerController
} = require('../../src/infrastructure/adapters/driving/http/controllers');

const createProductoRoutes = require('../../src/infrastructure/adapters/driving/http/routes/producto.routes');
const createBannerRoutes = require('../../src/infrastructure/adapters/driving/http/routes/banner.routes');

const app = express();
const PORT = process.env.CATALOG_SERVICE_PORT || 3002;

// Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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

// Health check
app.get('/health', (req, res) => {
  res.json({ service: 'catalog-service', status: 'UP', port: PORT });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`📦 [Catalog Service] corriendo en puerto ${PORT}`);
  });
}

module.exports = app;
