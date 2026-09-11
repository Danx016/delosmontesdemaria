/**
 * Puerto de Salida (Driven/Outbound Port): TelegramServicePort
 * Define el contrato para el bot de Telegram y notificaciones móviles
 */
class TelegramServicePort {
  /**
   * Envía un mensaje a un canal o chat específico de Telegram
   * @param {string|number} chatId
   * @param {string} message
   * @param {Object} [options]
   * @returns {Promise<boolean>}
   */
  async sendMessage(chatId, message, options) {
    throw new Error('Método sendMessage no implementado');
  }

  /**
   * Procesa una actualización / webhook de Telegram
   * @param {Object} update
   * @returns {Promise<void>}
   */
  async handleUpdate(update) {
    throw new Error('Método handleUpdate no implementado');
  }
}

module.exports = TelegramServicePort;
