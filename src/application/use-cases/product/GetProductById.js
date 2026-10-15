/**
 * Caso de Uso: GetProductById
 * Consulta la información detallada de un producto por su identificador
 */
class GetProductById {
  constructor(productoRepository) {
    this.productoRepository = productoRepository;
  }

  async execute(idProducto) {
    if (!idProducto) throw new Error('ID de producto requerido');
    return await this.productoRepository.buscarPorId(idProducto);
  }
}

module.exports = GetProductById;
