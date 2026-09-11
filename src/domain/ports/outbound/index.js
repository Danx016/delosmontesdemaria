/**
 * Exportador central de Puertos de Salida (Driven / Outbound Ports)
 */
module.exports = {
  // Puertos de Repositorios (Persistencia)
  BannerRepositoryPort: require('./repositories/BannerRepository'),
  CategoriaRepositoryPort: require('./repositories/CategoriaRepository'),
  ChatRepositoryPort: require('./repositories/ChatRepository'),
  CompraRepositoryPort: require('./repositories/CompraRepository'),
  CouponRepositoryPort: require('./repositories/CouponRepository'),
  ProductoRepositoryPort: require('./repositories/ProductoRepository'),
  SoporteRepositoryPort: require('./repositories/SoporteRepository'),
  TokenRepositoryPort: require('./repositories/TokenRepository'),
  UsuarioRepositoryPort: require('./repositories/UsuarioRepository'),

  // Puertos de Servicios Externos
  EmailServicePort: require('./services/EmailServicePort'),
  PaymentServicePort: require('./services/PaymentServicePort'),
  AIServicePort: require('./services/AIServicePort'),
  TelegramServicePort: require('./services/TelegramServicePort'),
  GoogleAuthServicePort: require('./services/GoogleAuthServicePort'),
};
