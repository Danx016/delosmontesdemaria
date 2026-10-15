/**
 * Caso de Uso: GetPurchaseById
 * Obtiene el recibo detallado de una compra con sus ítems
 */
class GetPurchaseById {
  constructor(compraRepository) {
    this.compraRepository = compraRepository;
  }

  async execute(idCompra) {
    if (!idCompra) throw new Error('ID de compra requerido');
    const recibo = await this.compraRepository.obtenerReciboCompleto(idCompra);
    if (!recibo) throw new Error('Recibo no encontrado');
    return recibo;
  }
}

module.exports = GetPurchaseById;
