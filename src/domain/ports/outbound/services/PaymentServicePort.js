/**
 * Puerto de Salida (Driven/Outbound Port): PaymentServicePort
 * Define el contrato que debe implementar cualquier pasarela de pago (Wompi, MercadoPago, Stripe, etc.)
 */
class PaymentServicePort {
  /**
   * Genera la firma de integridad para la pasarela de pagos
   * @param {string} reference - Referencia única del pago
   * @param {number} amountInCents - Monto en centavos
   * @param {string} currency - Moneda (ej. 'COP')
   * @returns {Object} Objeto con la firma, referencia y llave pública
   */
  generateIntegritySignature(reference, amountInCents, currency) {
    throw new Error('Método generateIntegritySignature no implementado');
  }

  /**
   * Valida un webhook o evento de confirmación de pago
   * @param {Object} payload
   * @returns {boolean}
   */
  validateWebhook(payload) {
    throw new Error('Método validateWebhook no implementado');
  }
}

module.exports = PaymentServicePort;
