/**
 * Controlador: CompraController
 * Maneja el flujo de compras, estados de despacho, OTP, recibos y Wompi
 */
const UpdateOrderStatus = require('../../domain/use-cases/purchase/UpdateOrderStatus');
const GenerateWompiSignature = require('../../domain/use-cases/purchase/GenerateWompiSignature');

function formatShippingAddress(addr, info) {
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

class CompraController {
  constructor({ compraRepository, productoRepository, usuarioRepository, tokenRepository, emailService, paymentService, couponRepository, telegramService }) {
    this.compraRepository = compraRepository;
    this.productoRepository = productoRepository;
    this.usuarioRepository = usuarioRepository;
    this.tokenRepository = tokenRepository;
    this.emailService = emailService;
    this.paymentService = paymentService;
    this.couponRepository = couponRepository;
    this.telegramService = telegramService;
    this.updateOrderStatus = new UpdateOrderStatus(compraRepository, usuarioRepository, emailService);
    this.generateWompiSignature = new GenerateWompiSignature(paymentService);
  }


  async wompiFirma(req, res) {
    try {
      const { reference, amountInCents, currency } = req.body;
      const signatureData = this.generateWompiSignature.execute(reference, amountInCents, currency);
      res.json(signatureData);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async obtenerCreditos(req, res) {
    try {
      const userId = req.user.id;
      const user = await this.usuarioRepository.buscarPorId(userId);
      res.json({ creditos: user ? user.creditos : 0 });
    } catch (error) {
      res.status(500).json({ error: 'Error al consultar créditos' });
    }
  }

  async crear(req, res) {
    try {
      let { productos, total, metodoPago, metodo_pago, direccion, direccion_envio, shippingInfo } = req.body;

      const userId = Number(req.user?.id || req.user?.id_usuario);
      if (!userId || !productos || productos.length === 0) {
        return res.status(400).json({ error: 'Datos de compra incompletos (usuario o productos requeridos).' });
      }

      const paymentMethod = metodoPago || metodo_pago || 'Contra Entrega (Efectivo)';
      const shippingAddress = formatShippingAddress(direccion || direccion_envio, shippingInfo);

      // Verificación de integridad de precios y stock contra la base de datos
      let calculatedSubtotal = 0;
      const verifiedProducts = [];

      for (const item of productos) {
        const prodId = item.idProducto || item.id_producto || item.id;
        const cantidad = Math.max(1, parseInt(item.cantidad, 10) || 1);
        if (!prodId) continue;

        const dbProd = await this.productoRepository.buscarPorId(prodId);
        if (!dbProd) {
          return res.status(400).json({ error: `El producto ID ${prodId} no está disponible.` });
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
        return res.status(400).json({ error: 'No se encontraron productos válidos para procesar la orden.' });
      }

      // Validar cupón en servidor si fue provisto
      let descuento = 0;
      const cuponCodigo = req.body.codigo_cupon || req.body.cupon || req.body.codigoCupon;
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
          console.warn('Advertencia al verificar cupón en compra:', cErr.message);
        }
      }

      const shippingCost = Math.max(0, parseFloat(req.body.shippingCost || req.body.costo_envio || 0));
      const calculatedTotal = Math.max(0, calculatedSubtotal - descuento + shippingCost);
      const finalTotal = calculatedTotal > 0 ? calculatedTotal : (parseFloat(total) || calculatedSubtotal);

      if (paymentMethod === 'Agro-Créditos') {
        const user = await this.usuarioRepository.buscarPorId(userId);
        if (!user || user.creditos < finalTotal) {
          return res.status(400).json({ error: 'Créditos insuficientes en tu cuenta.' });
        }
        await this.usuarioRepository.descontarCreditos(userId, finalTotal);
      }

      const compraCreada = await this.compraRepository.crear({
        id_usuario: userId,
        total: finalTotal,
        metodo_pago: paymentMethod,
        direccion_envio: shippingAddress,
        productos: verifiedProducts
      });

      // Incrementar uso de cupón si fue aplicado
      const cuponAplicado = req.body.codigo_cupon || req.body.cupon || req.body.codigoCupon;
      if (cuponAplicado && this.couponRepository) {
        try {
          await this.couponRepository.incrementarUso(cuponAplicado);
        } catch (couponErr) {
          console.warn('No se pudo incrementar uso de cupón:', couponErr.message);
        }
      }

      // Enviar factura por correo y notificar a Telegram en segundo plano
      setImmediate(async () => {
        try {
          const recibo = await this.compraRepository.obtenerReciboCompleto(compraCreada.id_compra);
          const buyerEmail = (
            recibo?.correo_cliente ||
            req.body.shippingInfo?.correo ||
            req.body.email ||
            req.user?.correo ||
            ''
          ).trim().toLowerCase();

          if (recibo) {
            recibo.correo_cliente = buyerEmail || recibo.correo_cliente;
            recibo.nombre_cliente = recibo.nombre_cliente || req.body.shippingInfo?.nombre_destinatario || req.user?.nombre || 'Cliente';
            recibo.direccion_envio = recibo.direccion_envio || shippingAddress;

            if (buyerEmail) {
              console.log(`✉️ [Compra #${compraCreada.id_compra}] Despachando factura de venta a: ${buyerEmail}`);
              const sent = await this.emailService.sendInvoiceEmail(recibo, buyerEmail);
              if (sent) {
                console.log(`✅ [Compra #${compraCreada.id_compra}] Factura enviada exitosamente por correo a: ${buyerEmail}`);
              } else {
                console.error(`❌ [Compra #${compraCreada.id_compra}] Falló el envío de factura por correo a: ${buyerEmail}`);
              }
            } else {
              console.warn(`⚠️ [Compra #${compraCreada.id_compra}] No se encontró correo para despachar la factura.`);
            }
          }

          if (this.telegramService) {
            const userBuyer = await this.usuarioRepository.buscarPorId(userId);
            await this.telegramService.notificarNuevaCompra({
              compra: compraCreada,
              usuario: userBuyer || { nombre: 'Cliente Web', correo: buyerEmail },
              productos,
              total,
              metodoPago: paymentMethod,
              direccion: shippingAddress,
            });

            // Verificar stock bajo de los productos comprados (stock <= 5)
            if (Array.isArray(productos)) {
              for (const item of productos) {
                const pId = item.id_producto || item.id;
                if (pId) {
                  const prodDb = await this.productoRepository.buscarPorId(pId);
                  if (prodDb && Number(prodDb.stock) <= 5) {
                    await this.telegramService.notificarStockBajo({
                      producto: prodDb,
                      stockRestante: prodDb.stock,
                    });
                  }
                }
              }
            }
          }
        } catch (bgErr) {
          console.warn('[Post-Compra Background Task Error]:', bgErr.message);
        }
      });

      res.status(201).json({
        id: compraCreada.id_compra,
        id_compra: compraCreada.id_compra,
        total: parseFloat(total),
        mensaje: 'Compra registrada con éxito'
      });
    } catch (error) {
      console.error('Error al procesar compra:', error);
      res.status(500).json({ error: error.message || 'Error al procesar la compra' });
    }
  }

  async historialUsuario(req, res) {
    try {
      const idUsuario = parseInt(req.params.id_usuario, 10);
      const role = Number(req.user.role || req.user.id_rol);
      const userId = Number(req.user.id || req.user.id_usuario);
      const isAdmin = role === 1 || req.user.username === 'admin';

      if (userId !== idUsuario && !isAdmin) {
        return res.status(403).json({ error: 'No tienes permiso para ver el historial de otro usuario.' });
      }

      const compras = await this.compraRepository.listarPorUsuario(idUsuario);
      res.json(compras.map(c => c.toJSON()));
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener historial de compras' });
    }
  }

  async obtenerRecibo(req, res) {
    try {
      const idCompra = req.params.id_compra;
      const recibo = await this.compraRepository.obtenerReciboCompleto(idCompra);
      if (!recibo) return res.status(404).json({ error: 'Recibo no encontrado' });

      const role = Number(req.user.role || req.user.id_rol);
      const userId = Number(req.user.id || req.user.id_usuario);
      const isOwner = userId === Number(recibo.id_usuario);
      const isAdmin = role === 1 || req.user.username === 'admin';

      let isSellerOfOrder = false;
      if (role === 2) {
        isSellerOfOrder = await this.compraRepository.verificarVendedorDeOrden(idCompra, userId);
      }

      if (!isOwner && !isAdmin && !isSellerOfOrder) {
        return res.status(403).json({ error: 'No tienes permiso para acceder a este recibo.' });
      }

      res.json(recibo);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener datos del recibo' });
    }
  }

  async enviarReciboCorreo(req, res) {
    try {
      const { idCompra, email } = req.body;
      const recibo = await this.compraRepository.obtenerReciboCompleto(idCompra);
      if (!recibo) return res.status(404).json({ error: 'Compra no encontrada' });

      const role = Number(req.user.role || req.user.id_rol);
      const userId = Number(req.user.id || req.user.id_usuario);
      const isOwner = userId === Number(recibo.id_usuario);
      const isAdmin = role === 1 || req.user.username === 'admin';

      let isSellerOfOrder = false;
      if (role === 2) {
        isSellerOfOrder = await this.compraRepository.verificarVendedorDeOrden(idCompra, userId);
      }

      if (!isOwner && !isAdmin && !isSellerOfOrder) {
        return res.status(403).json({ error: 'No tienes permiso para enviar este recibo.' });
      }

      const sent = await this.emailService.sendInvoiceEmail(recibo, email);
      if (!sent) {
        return res.status(502).json({ error: 'No se pudo despachar la factura al correo especificado.' });
      }
      res.json({ success: true, message: 'Factura enviada correctamente por correo electrónico.' });
    } catch (error) {
      res.status(500).json({ error: 'Error al enviar factura por correo' });
    }
  }

  async actualizarEstadoDespacho(req, res) {
    try {
      const { id_compra } = req.params;
      const { estado } = req.body;
      if (!estado) return res.status(400).json({ error: 'Falta especificar el estado de despacho' });

      const role = Number(req.user.role || req.user.id_rol);
      const userId = Number(req.user.id || req.user.id_usuario);
      const isAdmin = role === 1 || req.user.username === 'admin';

      if (!isAdmin) {
        const canManage = await this.compraRepository.verificarVendedorDeOrden(id_compra, userId);
        if (!canManage) {
          return res.status(403).json({ error: 'No tienes permiso para modificar un pedido que no contiene tus productos.' });
        }
      }

      const result = await this.updateOrderStatus.execute(id_compra, estado);

      // Notificar cambio de estado por Telegram
      if (this.telegramService) {
        this.telegramService.notificarCambioEstadoPedido({
          compra: { id_compra },
          nuevoEstado: estado,
        }).catch((tErr) => console.warn('[Telegram Status Warning]:', tErr.message));
      }

      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async listarTodasVendedor(req, res) {
    try {
      const sellerId = req.user?.id || req.user?.id_usuario;
      const isAdmin = req.user?.rol === 1 || req.user?.id_rol === 1 || req.user?.username === 'admin';
      const compras = await this.compraRepository.listarParaVendedores(isAdmin ? null : sellerId);
      res.json(compras);
    } catch (error) {
      console.error('Error al recuperar registros de pedidos:', error);
      res.status(500).json({ error: 'Error al recuperar registros de pedidos' });
    }
  }

  async enviarOtp(req, res) {
    try {
      const { email, nombre, total } = req.body;
      const targetEmail = (email || req.user?.correo || '').trim().toLowerCase();
      if (!targetEmail) {
        return res.status(400).json({ error: 'Falta especificar el correo electrónico.' });
      }

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      await this.tokenRepository.guardarOtp(targetEmail, code, 10);

      const sent = await this.emailService.sendPurchaseOtpEmail(targetEmail, nombre || req.user?.nombre, code, total);
      if (!sent) {
        console.error(`❌ [OTP Compra] No se pudo entregar código OTP a: ${targetEmail}`);
        return res.status(502).json({ 
          error: 'No fue posible entregar el código de seguridad a tu correo electrónico. Por favor verifica tu dirección de correo o intenta de nuevo en unos minutos.',
          email: targetEmail
        });
      }

      console.log(`✅ [OTP Compra] Código de seguridad enviado exitosamente a: ${targetEmail}`);
      res.json({ 
        success: true, 
        message: `Código de seguridad enviado a ${targetEmail}`
      });
    } catch (error) {
      console.error('Error al enviar OTP de compra:', error);
      res.status(500).json({ error: 'Error al enviar código de seguridad al correo' });
    }
  }

  async verificarOtp(req, res) {
    try {
      const { email, code } = req.body;
      const targetEmail = (email || req.user?.correo || '').trim().toLowerCase();
      if (!targetEmail || !code) {
        return res.status(400).json({ error: 'Faltan datos para verificar el código.' });
      }

      const verification = await this.tokenRepository.verificarOtp(targetEmail, code);
      if (!verification.valid) {
        return res.status(400).json({ error: verification.message });
      }

      res.json({ success: true, message: 'Código verificado con éxito' });
    } catch (error) {
      res.status(500).json({ error: 'Error al verificar el código de seguridad' });
    }
  }
}

module.exports = CompraController;