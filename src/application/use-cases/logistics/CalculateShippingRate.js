/**
 * Caso de Uso: CalculateShippingRate
 * Calcula el costo de flete y tiempo estimado según la ciudad o municipio de entrega.
 */
class CalculateShippingRate {
  constructor({ shipmentRepository }) {
    this.shipmentRepository = shipmentRepository;
  }

  async execute({ city }) {
    if (!city) {
      throw new Error('La ciudad o municipio de destino es obligatoria.');
    }

    const rate = await this.shipmentRepository.getShippingRate(city);
    if (rate) {
      return {
        city: rate.city,
        department: rate.department,
        zone: rate.zone,
        baseFee: Number(rate.base_fee),
        estimatedHours: rate.estimated_hours,
        estimatedDays: Math.ceil(rate.estimated_hours / 24)
      };
    }

    // Tarifa genérica por defecto si la ciudad no está en la tabla
    return {
      city,
      department: 'N/A',
      zone: 'NACIONAL',
      baseFee: 16000.00,
      estimatedHours: 48,
      estimatedDays: 2
    };
  }
}

module.exports = CalculateShippingRate;
