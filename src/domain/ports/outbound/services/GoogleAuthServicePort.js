/**
 * Puerto de Salida (Driven/Outbound Port): GoogleAuthServicePort
 * Define el contrato de validación de tokens de identidad de Google (OAuth2)
 */
class GoogleAuthServicePort {
  /**
   * Verifica un ID Token de Google y devuelve el payload del usuario
   * @param {string} token
   * @returns {Promise<Object>} Payload decodificado y verificado
   */
  async verifyIdToken(token) {
    throw new Error('Método verifyIdToken no implementado');
  }
}

module.exports = GoogleAuthServicePort;
