/**
 * Caso de Uso: GetPurchases
 * Consulta el historial de compras por usuario o lista general
 */
class GetPurchases {
  constructor(compraRepository) {
    this.compraRepository = compraRepository;
  }

  async executeByUser(idUsuario) {
    if (!idUsuario) throw new Error('ID de usuario requerido');
    return await this.compraRepository.listarPorUsuario(idUsuario);
  }

  async executeAll() {
    return await this.compraRepository.listarTodas();
  }
}

module.exports = GetPurchases;
