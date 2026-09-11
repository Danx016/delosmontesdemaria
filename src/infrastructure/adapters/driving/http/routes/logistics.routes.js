/**
 * Rutas Express: Logistics Routes
 */
const express = require('express');

function createLogisticsRoutes(controller) {
  const router = express.Router();

  // Tarifas y cotización
  router.get('/rates', (req, res) => controller.getRates(req, res));
  router.get('/calculate', (req, res) => controller.calculateFee(req, res));

  // Trazabilidad y tracking
  router.get('/track/:trackingNumber', (req, res) => controller.track(req, res));
  router.get('/order/:orderId', (req, res) => controller.getByOrder(req, res));

  // Gestión de envíos
  router.get('/shipments', (req, res) => controller.list(req, res));
  router.post('/shipments', (req, res) => controller.create(req, res));
  router.patch('/shipments/:id/status', (req, res) => controller.updateStatus(req, res));

  return router;
}

module.exports = createLogisticsRoutes;
