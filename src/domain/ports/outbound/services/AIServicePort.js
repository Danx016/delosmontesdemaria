/**
 * Puerto de Salida (Driven/Outbound Port): AIServicePort
 * Define el contrato de integración con modelos de lenguaje (OpenRouter, OpenAI, etc.)
 */
class AIServicePort {
  /**
   * Procesa una consulta para el asistente público
   * @param {string} prompt
   * @param {Array} history
   * @returns {Promise<string>}
   */
  async processPublicChat(prompt, history) {
    throw new Error('Método processPublicChat no implementado');
  }

  /**
   * Procesa una consulta para el asistente de soporte al cliente
   * @param {string} prompt
   * @param {Array} history
   * @param {Object} context
   * @returns {Promise<string>}
   */
  async processSupportChat(prompt, history, context) {
    throw new Error('Método processSupportChat no implementado');
  }

  /**
   * Procesa una consulta para el asistente de administración y análisis
   * @param {string} prompt
   * @param {Array} history
   * @param {Object} adminContext
   * @returns {Promise<string>}
   */
  async processAdminChat(prompt, history, adminContext) {
    throw new Error('Método processAdminChat no implementado');
  }
}

module.exports = AIServicePort;
