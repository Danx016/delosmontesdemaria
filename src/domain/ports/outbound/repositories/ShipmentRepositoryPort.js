/**
 * Puerto de Salida: ShipmentRepositoryPort
 * Define las operaciones abstractas para la persistencia de envíos y logística rural.
 */
class ShipmentRepositoryPort {
  async createShipment(shipment) {
    throw new Error('Método createShipment() no implementado');
  }

  async findByTrackingNumber(trackingNumber) {
    throw new Error('Método findByTrackingNumber() no implementado');
  }

  async findByOrderId(orderId) {
    throw new Error('Método findByOrderId() no implementado');
  }

  async updateStatus(shipmentId, status, location, description) {
    throw new Error('Método updateStatus() no implementado');
  }

  async listShipments({ limit, offset, status } = {}) {
    throw new Error('Método listShipments() no implementado');
  }

  async getShippingRate(city) {
    throw new Error('Método getShippingRate() no implementado');
  }

  async listAllRates() {
    throw new Error('Método listAllRates() no implementado');
  }
}

module.exports = ShipmentRepositoryPort;
