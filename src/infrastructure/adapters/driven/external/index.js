/**
 * Adaptadores Secundarios / Salida (Driven Adapters): Servicios Externos
 */
module.exports = {
  EmailService: require('./EmailService'),
  GoogleAuthService: require('./GoogleAuthService'),
  IAService: require('./IAService'),
  PaymentService: require('./PaymentService'),
  TelegramService: require('./TelegramService')
};
