/**
 * Adaptador de Entrada: LogisticsController
 * Expone endpoints HTTP REST para la consulta de fletes, trazabilidad y gestión de despachos.
 */
class LogisticsController {
  constructor({
    createShipment,
    trackShipment,
    calculateShippingRate,
    updateShipmentStatus,
    shipmentRepository
  }) {
    this.createShipment = createShipment;
    this.trackShipment = trackShipment;
    this.calculateShippingRate = calculateShippingRate;
    this.updateShipmentStatus = updateShipmentStatus;
    this.shipmentRepository = shipmentRepository;
  }

  // GET /api/logistics/rates
  async getRates(req, res) {
    try {
      const rates = await this.shipmentRepository.listAllRates();
      res.json({ success: true, rates });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // GET /api/logistics/calculate?city=Cartagena
  async calculateFee(req, res) {
    try {
      const { city } = req.query;
      if (!city) {
        return res.status(400).json({ success: false, error: 'Debe especificar el parámetro "city".' });
      }
      const estimate = await this.calculateShippingRate.execute({ city });
      res.json({ success: true, estimate });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // GET /api/logistics/track/:trackingNumber
  async track(req, res) {
    try {
      const { trackingNumber } = req.params;
      const shipment = await this.trackShipment.execute({ trackingNumber });

      if (!shipment) {
        return res.status(404).json({
          success: false,
          error: `Guía de envío [${trackingNumber}] no encontrada.`
        });
      }

      res.json({ success: true, shipment });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // GET /api/logistics/order/:orderId
  async getByOrder(req, res) {
    try {
      const { orderId } = req.params;
      const shipment = await this.trackShipment.execute({ orderId: Number(orderId) });

      if (!shipment) {
        return res.status(404).json({
          success: false,
          error: `No hay despacho registrado para la orden #${orderId}.`
        });
      }

      res.json({ success: true, shipment });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // POST /api/logistics/shipments (Creación manual de guía)
  async create(req, res) {
    try {
      const { orderId, customerName, customerPhone, destinationCity, destinationAddress, originRegion } = req.body;
      const shipment = await this.createShipment.execute({
        orderId,
        customerName,
        customerPhone,
        destinationCity,
        destinationAddress,
        originRegion
      });

      res.status(201).json({ success: true, shipment });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  // PATCH /api/logistics/shipments/:id/status
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, location, description } = req.body;

      const updated = await this.updateShipmentStatus.execute({
        shipmentId: Number(id),
        status,
        location,
        description
      });

      res.json({ success: true, shipment: updated });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  // GET /api/logistics/shipments (Listado de envíos para panel admin)
  async list(req, res) {
    try {
      const { limit = 30, offset = 0, status } = req.query;
      const shipments = await this.shipmentRepository.listShipments({ limit, offset, status });
      res.json({ success: true, shipments });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}

module.exports = LogisticsController;
