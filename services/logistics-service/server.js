/**
 * Microservicio: Logistics & Tracking Service Enterprise
 * Puerto: 3006 (por defecto o LOGISTICS_SERVICE_PORT)
 * Base de Datos Privada: db_logistics
 * Responsabilidades: Trazabilidad de cosechas rurales, cálculo de fletes por municipio/vereda,
 * asignación de transportadores de Montes de María y generación automática de guías de despacho.
 * Trazabilidad: X-Correlation-ID
 * Eventos: Pub/Sub y Redis Streams con Consumer Groups y XACK
 * Resiliencia: Heartbeat a ServiceRegistry
 */
require('dotenv').config();
process.env.DB_NAME = process.env.LOGISTICS_DB_NAME || 'db_logistics';

const express = require('express');
const cors = require('cors');

const MySQLShipmentRepository = require('../../src/infrastructure/persistence/MySQLShipmentRepository');
const CreateShipment = require('../../src/application/use-cases/logistics/CreateShipment');
const TrackShipment = require('../../src/application/use-cases/logistics/TrackShipment');
const CalculateShippingRate = require('../../src/application/use-cases/logistics/CalculateShippingRate');
const UpdateShipmentStatus = require('../../src/application/use-cases/logistics/UpdateShipmentStatus');
const LogisticsController = require('../../src/infrastructure/adapters/driving/http/controllers/LogisticsController');
const createLogisticsRoutes = require('../../src/infrastructure/adapters/driving/http/routes/logistics.routes');

const { eventBus, CHANNELS, STREAMS, EVENTS } = require('../common/events/EventBus');
const { correlationMiddleware } = require('../common/tracing/correlation');
const { registry } = require('../common/registry/ServiceRegistry');

const app = express();
const PORT = process.env.LOGISTICS_SERVICE_PORT || 3006;

// Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trazabilidad Distribuida (Correlation-ID)
app.use(correlationMiddleware('logistics-service'));

// Inyección de dependencias (Arquitectura Hexagonal)
const shipmentRepository = new MySQLShipmentRepository();
const createShipment = new CreateShipment({ shipmentRepository });
const trackShipment = new TrackShipment({ shipmentRepository });
const calculateShippingRate = new CalculateShippingRate({ shipmentRepository });
const updateShipmentStatus = new UpdateShipmentStatus({ shipmentRepository });

const controller = new LogisticsController({
  createShipment,
  trackShipment,
  calculateShippingRate,
  updateShipmentStatus,
  shipmentRepository
});

// Rutas del servicio
app.use('/api/logistics', createLogisticsRoutes(controller));

// ==========================================
// CONSUMO DE EVENTOS (EVENT-DRIVEN SAGA)
// ==========================================

const procesarNuevaOrden = async (event, msgId = 'pubsub') => {
  if (event.type === EVENTS.ORDER_CREATED && event.data) {
    const trace = event.correlationId || 'N/A';
    const { orderId, shippingAddress, customerName, customerPhone, phone, total } = event.data;
    console.log(`🚛 [Logistics Service: ${msgId}] [Trace: ${trace}] Evento ORDER_CREATED recibido para orden #${orderId}`);

    try {
      // Extraer municipio o ciudad aproximada de la dirección
      let city = 'Cartagena';
      const addrLower = (shippingAddress || '').toLowerCase();
      if (addrLower.includes('carmen')) city = 'Carmen de Bolívar';
      else if (addrLower.includes('jacinto')) city = 'San Jacinto';
      else if (addrLower.includes('nepomuceno')) city = 'San Juan Nepomuceno';
      else if (addrLower.includes('ovejas')) city = 'Ovejas';
      else if (addrLower.includes('barranquilla')) city = 'Barranquilla';
      else if (addrLower.includes('sincelejo')) city = 'Sincelejo';
      else if (addrLower.includes('monter')) city = 'Montería';
      else if (addrLower.includes('bogot')) city = 'Bogotá';
      else if (addrLower.includes('medell')) city = 'Medellín';

      // Crear guía de despacho automáticamente
      const shipment = await createShipment.execute({
        orderId,
        customerName: customerName || 'Comprador Montes de María',
        customerPhone: customerPhone || phone,
        destinationCity: city,
        destinationAddress: shippingAddress || 'Domicilio Urbano',
        originRegion: 'Montes de María (Carmen de Bolívar)'
      });

      console.log(`  ✅ Guía de despacho generada: [${shipment.tracking_number}] - Destino: ${city} (Flete: $${shipment.shipping_cost})`);

      // Publicar evento SHIPMENT_CREATED en el bus
      await eventBus.publish(CHANNELS.ORDERS, {
        type: 'SHIPMENT_CREATED',
        correlationId: trace,
        data: {
          trackingNumber: shipment.tracking_number,
          orderId,
          status: shipment.status,
          destinationCity: city,
          estimatedDelivery: shipment.estimated_delivery
        }
      });
    } catch (err) {
      console.error(`❌ [Logistics Service] Error creando guía para orden #${orderId}:`, err.message);
    }
  }
};

// 1. Suscripción Pub/Sub
eventBus.subscribe(CHANNELS.ORDERS, procesarNuevaOrden);

// 2. Consumo persistente con Redis Streams y Consumer Group
eventBus.consumeStream({
  streamKey: STREAMS.ORDERS,
  groupName: 'cg:logistics',
  consumerName: `logistics-${process.pid}`,
  handler: procesarNuevaOrden
}).catch(err => console.warn('⚠️ [Logistics Stream Consumer Warning]:', err.message));

// Health check
app.get('/health', (req, res) => {
  res.json({
    service: 'logistics-service',
    status: 'UP',
    port: PORT,
    database: 'db_logistics',
    correlationId: req.correlationId,
    timestamp: new Date().toISOString()
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚛 [Logistics & Tracking Service Enterprise] corriendo en puerto ${PORT}`);
    console.log(`📦 Base de Datos Privada: db_logistics`);
    // Registrar latido en Redis Service Registry
    registry.startHeartbeat({ serviceName: 'logistics-service', port: PORT });
  });
}

module.exports = app;
