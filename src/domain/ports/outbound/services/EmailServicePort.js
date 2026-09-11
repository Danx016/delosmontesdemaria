/**
 * Puerto de Salida (Driven/Outbound Port): EmailServicePort
 * Define el contrato que debe implementar cualquier adaptador de envío de correos (Brevo, Gmail SMTP, etc.)
 */
class EmailServicePort {
  /**
   * Envía un código OTP de verificación para compras o registros
   * @param {string} email
   * @param {string} codigo
   * @param {string} nombre
   * @returns {Promise<boolean>}
   */
  async enviarCodigoOTP(email, codigo, nombre) {
    throw new Error('Método enviarCodigoOTP no implementado');
  }

  /**
   * Envía el correo con el enlace o token de recuperación de contraseña
   * @param {string} email
   * @param {string} token
   * @param {string} nombre
   * @returns {Promise<boolean>}
   */
  async enviarRecuperacionContrasena(email, token, nombre) {
    throw new Error('Método enviarRecuperacionContrasena no implementado');
  }

  /**
   * Envía la factura digital o confirmación de compra al usuario
   * @param {Object} datosFactura
   * @returns {Promise<boolean>}
   */
  async enviarFacturaCompra(datosFactura) {
    throw new Error('Método enviarFacturaCompra no implementado');
  }

  /**
   * Envía notificación de actualización de estado de pedido
   * @param {string} email
   * @param {Object} ordenInfo
   * @returns {Promise<boolean>}
   */
  async enviarActualizacionPedido(email, ordenInfo) {
    throw new Error('Método enviarActualizacionPedido no implementado');
  }
}

module.exports = EmailServicePort;
