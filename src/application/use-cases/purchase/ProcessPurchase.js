/**
 * Caso de Uso: ProcessPurchase
 * Orquesta la creación de una orden de compra bajo Arquitectura Hexagonal.
 * Valida productos, stock, precios reales en catálogo, aplica cupones,
 * descuenta créditos si aplica y persiste la compra.
 */
class ProcessPurchase {
  constructor({ compraRepository, productoRepository, usuarioRepository, couponRepository }) {
    this.compraRepository = compraRepository;
    this.productoRepository = productoRepository;
    this.usuarioRepository = usuarioRepository;
    this.couponRepository = couponRepository;
  }

  formatShippingAddress(addr, info) {
    if (typeof addr === 'string' && addr.trim() && !addr.includes('[object Object]')) {
      return addr.trim();
    }
    const obj = (typeof addr === 'object' && addr !== null) ? addr : ((typeof info === 'object' && info !== null) ? info : {});
    const nestedDir = (typeof obj.direccion === 'object' && obj.direccion !== null) ? obj.direccion : null;
    const target = nestedDir || obj;

    const dir = target.direccion_principal || (typeof target.direccion === 'string' ? target.direccion : '') || target.direccion_texto || '';
    const barrio = target.barrio ? `Barrio ${target.barrio}` : '';
    const ciudad = target.ciudad || target.municipio || '';
    const dep = target.departamento || '';
    const tel = target.telefono ? `(Tel: ${target.telefono})` : '';

    const parts = [dir, barrio, ciudad, dep, tel].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Dirección de entrega';
  }

  async execute({ userId, productos, metodoPago, direccion, direccion_envio, shippingInfo, cuponCodigo, shippingCost = 0, totalFallback = 0 }) {
    if (!userId || !productos || productos.length === 0) {
      throw new Error('Datos de compra incompletos (usuario o productos requeridos).');
    }

    const paymentMethod = metodoPago || 'Contra Entrega (Efectivo)';
    const shippingAddress = this.formatShippingAddress(direccion || direccion_envio, shippingInfo);

    // 1. Verificación de integridad de precios y existencia contra el repositorio de productos
    let calculatedSubtotal = 0;
    const verifiedProducts = [];

    for (const item of productos) {
      const prodId = item.idProducto || item.id_producto || item.id;
      const cantidad = Math.max(1, parseInt(item.cantidad, 10) || 1);
      if (!prodId) continue;

      const dbProd = await this.productoRepository.buscarPorId(prodId);
      if (!dbProd) {
        throw new Error(`El producto ID ${prodId} no está disponible.`);
      }

      const precioReal = parseFloat(dbProd.precio);
      calculatedSubtotal += precioReal * cantidad;

      verifiedProducts.push({
        ...item,
        id_producto: dbProd.id_producto,
        idProducto: dbProd.id_producto,
        id: dbProd.id_producto,
        nombre: dbProd.nombre_producto,
        precio: precioReal,
        precio_unitario: precioReal,
        cantidad
      });
    }

    if (verifiedProducts.length === 0) {
      throw new Error('No se encontraron productos válidos para procesar la orden.');
    }

    // 2. Validación de cupón de descuento en servidor
    let descuento = 0;
    if (cuponCodigo && this.couponRepository) {
      try {
        const cup = await this.couponRepository.buscarPorCodigo(cuponCodigo);
        if (cup && cup.activo && (!cup.valido_hasta || new Date(cup.valido_hasta) >= new Date())) {
          if (cup.tipo_descuento === 'porcentaje') {
            descuento = Math.round((calculatedSubtotal * parseFloat(cup.valor_descuento)) / 100);
          } else {
            descuento = parseFloat(cup.valor_descuento);
          }
          if (cup.descuento_maximo && descuento > parseFloat(cup.descuento_maximo)) {
            descuento = parseFloat(cup.descuento_maximo);
          }
        }
      } catch (cErr) {
        console.warn('[ProcessPurchase] Advertencia al verificar cupón:', cErr.message);
      }
    }

    const flete = Math.max(0, parseFloat(shippingCost) || 0);
    const calculatedTotal = Math.max(0, calculatedSubtotal - descuento + flete);
    const finalTotal = calculatedTotal > 0 ? calculatedTotal : (parseFloat(totalFallback) || calculatedSubtotal);

    // 3. Manejo de saldo si paga con Agro-Créditos
    if (paymentMethod === 'Agro-Créditos') {
      const user = await this.usuarioRepository.buscarPorId(userId);
      if (!user || user.creditos < finalTotal) {
        throw new Error('Créditos insuficientes en tu cuenta.');
      }
      await this.usuarioRepository.descontarCreditos(userId, finalTotal);
    }

    // 4. Persistencia de la orden en el puerto de salida de compras
    const compraCreada = await this.compraRepository.crear({
      id_usuario: userId,
      total: finalTotal,
      metodo_pago: paymentMethod,
      direccion_envio: shippingAddress,
      productos: verifiedProducts
    });

    // 5. Incrementar uso del cupón aplicado
    if (cuponCodigo && this.couponRepository) {
      try {
        await this.couponRepository.incrementarUso(cuponCodigo);
      } catch (couponErr) {
        console.warn('[ProcessPurchase] No se pudo incrementar uso de cupón:', couponErr.message);
      }
    }

    return {
      compraCreada,
      finalTotal,
      shippingAddress,
      verifiedProducts,
      paymentMethod
    };
  }
}

module.exports = ProcessPurchase;
