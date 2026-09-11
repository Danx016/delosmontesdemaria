/**
 * Adaptadores Secundarios / Salida (Driven Adapters): Persistencia MySQL
 */
module.exports = {
  db: require('./Database'),
  MySQLBannerRepository: require('./MySQLBannerRepository'),
  MySQLCategoriaRepository: require('./MySQLCategoriaRepository'),
  MySQLChatRepository: require('./MySQLChatRepository'),
  MySQLCompraRepository: require('./MySQLCompraRepository'),
  MySQLCouponRepository: require('./MySQLCouponRepository'),
  MySQLProductoRepository: require('./MySQLProductoRepository'),
  MySQLSoporteRepository: require('./MySQLSoporteRepository'),
  MySQLTokenRepository: require('./MySQLTokenRepository'),
  MySQLUsuarioRepository: require('./MySQLUsuarioRepository')
};
