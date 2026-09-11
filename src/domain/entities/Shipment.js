/**
 * Entidad de dominio: Shipment (Envío Rural / Despacho)
 * Representa la trazabilidad y la logística de una cosecha desde la vereda hasta el destino.
 */
class Shipment {
  static STATES = {
    PENDIENTE_RECOLECCION: 'PENDIENTE_RECOLECCION',
    RECOLECTADO_EN_FINCA: 'RECOLECTADO_EN_FINCA',
    EN_CENTRO_ACOPIO: 'EN_CENTRO_ACOPIO',
    EN_RUTA: 'EN_RUTA',
    ENTREGADO: 'ENTREGADO',
    CANCELADO: 'CANCELADO'
  };

  constructor({
    id,
    tracking_number,
    order_id,
    customer_name,
    customer_phone,
    origin_region = 'Montes de María (Carmen de Bolívar)',
    destination_city,
    destination_address,
    shipping_cost = 12000,
    carrier_name = 'Red de Transporte Rural Montes de María',
    status = Shipment.STATES.PENDIENTE_RECOLECCION,
    estimated_delivery,
    notes,
    created_at = new Date(),
    updated_at = new Date(),
    history = []
  }) {
    this.id = id;
    this.tracking_number = tracking_number;
    this.order_id = order_id;
    this.customer_name = customer_name;
    this.customer_phone = customer_phone;
    this.origin_region = origin_region;
    this.destination_city = destination_city;
    this.destination_address = destination_address;
    this.shipping_cost = Number(shipping_cost);
    this.carrier_name = carrier_name;
    this.status = status;
    this.estimated_delivery = estimated_delivery ? new Date(estimated_delivery) : null;
    this.notes = notes;
    this.created_at = new Date(created_at);
    this.updated_at = new Date(updated_at);
    this.history = history;
  }

  static generateTrackingNumber(orderId) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `MDM-TRK-${orderId}-${randomSuffix}`;
  }

  updateStatus(newStatus, location, description) {
    if (!Shipment.STATES[newStatus]) {
      throw new Error(`Estado de envío inválido: ${newStatus}`);
    }

    this.status = newStatus;
    this.updated_at = new Date();

    const event = {
      status: newStatus,
      location: location || this.origin_region,
      description: description || `Estado actualizado a ${newStatus}`,
      timestamp: new Date()
    };

    this.history.unshift(event);
    return event;
  }

  isDelivered() {
    return this.status === Shipment.STATES.ENTREGADO;
  }
}

module.exports = Shipment;
