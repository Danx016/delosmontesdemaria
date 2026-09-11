/**
 * Caso de Uso: TrackShipment
 * Consulta la trazabilidad completa y el historial de estados de una guía o número de orden.
 */
class TrackShipment {
  constructor({ shipmentRepository }) {
    this.shipmentRepository = shipmentRepository;
  }

  async execute({ trackingNumber, orderId }) {
    if (!trackingNumber && !orderId) {
      throw new Error('Debe proporcionar un número de guía (trackingNumber) o ID de orden.');
    }

    let shipment = null;
    if (trackingNumber) {
      shipment = await this.shipmentRepository.findByTrackingNumber(trackingNumber);
    } else if (orderId) {
      shipment = await this.shipmentRepository.findByOrderId(orderId);
    }

    if (!shipment) {
      return null;
    }

    return shipment;
  }
}

module.exports = TrackShipment;
