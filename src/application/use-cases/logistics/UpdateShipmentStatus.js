/**
 * Caso de Uso: UpdateShipmentStatus
 * Actualiza el estado de la guía e inserta el hito en el historial de trazabilidad.
 */
class UpdateShipmentStatus {
  constructor({ shipmentRepository }) {
    this.shipmentRepository = shipmentRepository;
  }

  async execute({ shipmentId, status, location, description }) {
    if (!shipmentId) throw new Error('El ID de envío es obligatorio.');
    if (!status) throw new Error('El nuevo estado es obligatorio.');

    const updatedShipment = await this.shipmentRepository.updateStatus(
      shipmentId,
      status,
      location || 'Centro de Distribución Rural',
      description || `Envío actualizado a ${status}`
    );

    return updatedShipment;
  }
}

module.exports = UpdateShipmentStatus;
