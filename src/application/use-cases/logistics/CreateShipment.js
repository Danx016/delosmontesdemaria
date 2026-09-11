/**
 * Caso de Uso: CreateShipment
 * Crea una guía de envío rural a partir de una orden de compra generada.
 */
const Shipment = require('../../../domain/entities/Shipment');

class CreateShipment {
  constructor({ shipmentRepository }) {
    this.shipmentRepository = shipmentRepository;
  }

  async execute({
    orderId,
    customerName,
    customerPhone,
    destinationCity,
    destinationAddress,
    originRegion = 'Montes de María (Carmen de Bolívar)'
  }) {
    if (!orderId) throw new Error('El ID de orden es obligatorio para generar el despacho.');
    if (!destinationAddress) throw new Error('La dirección de destino es obligatoria.');

    // Calcular tarifa y tiempo estimado
    const city = destinationCity || 'Cartagena';
    const rate = await this.shipmentRepository.getShippingRate(city);
    const shippingCost = rate ? rate.base_fee : 14000.00;
    const estimatedHours = rate ? rate.estimated_hours : 24;

    const estimatedDelivery = new Date(Date.now() + estimatedHours * 60 * 60 * 1000);
    const trackingNumber = Shipment.generateTrackingNumber(orderId);

    const shipment = new Shipment({
      tracking_number: trackingNumber,
      order_id: orderId,
      customer_name: customerName || 'Comprador Montes de María',
      customer_phone: customerPhone,
      origin_region: originRegion,
      destination_city: city,
      destination_address: destinationAddress,
      shipping_cost: shippingCost,
      carrier_name: 'Red Campesina de Transporte Montes de María',
      status: Shipment.STATES.PENDIENTE_RECOLECCION,
      estimated_delivery: estimatedDelivery,
      notes: `Despacho rural programado desde ${originRegion}.`
    });

    const savedShipment = await this.shipmentRepository.createShipment(shipment);
    return savedShipment;
  }
}

module.exports = CreateShipment;
