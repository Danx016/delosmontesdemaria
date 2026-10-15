/**
 * Caso de Uso: GetProducts
 * Obtiene el catálogo completo o filtrado de productos agrícolas
 */
class GetProducts {
  constructor(productoRepository) {
    this.productoRepository = productoRepository;
  }

  async execute() {
    return await this.productoRepository.listarTodos();
  }

  async executeByCategory(categoria) {
    return await this.productoRepository.listarPorCategoria(categoria);
  }
}

module.exports = GetProducts;
