/**
 * Puerto de Salida: WhatsAppServicePort
 * Contrato de Dominio para el envío de notificaciones por WhatsApp.
 */
class WhatsAppServicePort {
  /**
   * Envía una plantilla o mensaje de texto de WhatsApp a un número destinatario
   * @param {string} to - Número de teléfono internacional (ej: 573001234567)
   * @param {Object} options - Parámetros del mensaje
   */
  async sendMessage(to, text) {
    throw new Error('Método sendMessage() no implementado en WhatsAppServicePort');
  }

  /**
   * Envía una notificación formateada de nueva orden al campesino / vendedor
   */
  async sendOrderAlertToFarmer(to, orderData) {
    throw new Error('Método sendOrderAlertToFarmer() no implementado en WhatsAppServicePort');
  }

  /**
   * Envía confirmación de orden al comprador
   */
  async sendOrderConfirmationToBuyer(to, orderData) {
    throw new Error('Método sendOrderConfirmationToBuyer() no implementado en WhatsAppServicePort');
  }
}

module.exports = WhatsAppServicePort;
