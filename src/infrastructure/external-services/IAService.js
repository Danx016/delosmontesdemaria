/**
 * Servicio externo: IAService
 * Integra OpenRouter / OpenAI para Asistente de Tienda, Asistente de Soporte y Asistente de Administrador con Function Calling
 */
const bcrypt = require('bcrypt');
const appConfig = require('../config/app.config');

class IAService {
  constructor(emailService) {
    this.emailService = emailService;
    this.pendingVerifications = new Map();
    this.pendingInput = new Map();
  }

  /**
   * Ejecuta llamadas seguras a OpenRouter con tolerancia a fallos, soporte de herramientas y recuperación de modelos
   */
  async callChatCompletion({ messages, tools = null, tool_choice = null, temperature = 0.7, max_tokens = 700, appTitle = 'De los Montes de Maria AI' }) {
    const apiKey = appConfig.openRouterApiKey;
    if (!apiKey || apiKey.startsWith('tu_clave')) {
      throw new Error('API Key de OpenRouter no configurada');
    }

    const preferredModel = (appConfig.openRouterModel && appConfig.openRouterModel !== 'openrouter/free')
      ? appConfig.openRouterModel
      : 'minimax/minimax-m3:free';

    const candidateModels = [
      preferredModel,
      'minimax/minimax-m3:free',
      'nvidia/nemotron-3.5-lightning:free',
      'google/gemma-4-31b-it:free',
      'google/gemma-4-26b-a4b-it:free',
      'minimax/minimax-m2.7:free',
      'openrouter/free'
    ].filter(Boolean);
    const modelsToTry = [...new Set(candidateModels)];

    let lastError = null;

    for (const model of modelsToTry) {
      try {
        const bodyPayload = {
          model,
          messages,
          temperature,
          max_tokens: Math.min(max_tokens, 800)
        };
        if (tools && Array.isArray(tools) && tools.length > 0) {
          bodyPayload.tools = tools;
          if (tool_choice) bodyPayload.tool_choice = tool_choice;
        }

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': appConfig.baseUrl || 'https://delosmontesdemaria.duckdns.org',
            'X-Title': appTitle
          },
          body: JSON.stringify(bodyPayload)
        });

        if (!response.ok) {
          const errText = await response.text();
          console.warn(`⚠️ [OpenRouter ${model} Status ${response.status}]:`, errText.slice(0, 150));
          lastError = new Error(`Status ${response.status}: ${errText.slice(0, 100)}`);

          // Si falla con herramientas (ej: 400 Bad Request), reintentar el mismo modelo sin tools
          if (response.status === 400 && tools && tools.length > 0) {
            try {
              const fallbackPayload = {
                model,
                messages,
                temperature,
                max_tokens: Math.min(max_tokens, 800)
              };
              const resNoTools = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${apiKey}`,
                  'HTTP-Referer': appConfig.baseUrl || 'https://delosmontesdemaria.duckdns.org',
                  'X-Title': appTitle
                },
                body: JSON.stringify(fallbackPayload)
              });
              if (resNoTools.ok) {
                const dataNoTools = await resNoTools.json();
                const choiceNoTools = dataNoTools?.choices?.[0];
                if (choiceNoTools?.message) {
                  let content = choiceNoTools.message.content || choiceNoTools.message.reasoning || '';
                  if (typeof content === 'string') content = content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
                  return {
                    modelUsed: model,
                    choice: choiceNoTools,
                    message: { ...choiceNoTools.message, content },
                    tool_calls: []
                  };
                }
              }
            } catch (_) {}
          }
          continue;
        }

        const data = await response.json();
        if (data.error) {
          console.warn(`⚠️ [OpenRouter ${model} Error]:`, data.error);
          lastError = new Error(data.error.message || 'Error en OpenRouter');
          continue;
        }

        const choice = data?.choices?.[0];
        if (!choice) continue;

        const message = choice.message || {};
        let content = message.content;

        if (!content && message.reasoning) {
          content = message.reasoning;
        }

        if (typeof content === 'string') {
          content = content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
        }

        return {
          modelUsed: model,
          choice,
          message: {
            ...message,
            content
          },
          tool_calls: message.tool_calls || []
        };
      } catch (err) {
        console.warn(`⚠️ [OpenRouter Exception con ${model}]:`, err.message);
        lastError = err;
      }
    }

    throw lastError || new Error('No se pudo obtener respuesta de ningún modelo de IA disponible.');
  }

  // ==========================================
  // 1. ASISTENTE PÚBLICO DE LA TIENDA (AgroAsistente)
  // ==========================================
  async procesarChatPublico(message, history = [], productos = []) {
    const apiKey = appConfig.openRouterApiKey;
    const model = appConfig.openRouterModel;

    if (!apiKey || apiKey.startsWith('tu_clave')) {
      return '⚠️ **Configuración Requerida:** Configure una clave de API válida en `OPENROUTER_API_KEY` para activar el Asistente de IA.';
    }

    const offTopicPatterns = [
      /\b(presidente|politica|política|gobierno|guerra|conflicto|noticias|deporte|fútbol|futbol|música|musica|película|pelicula|serie|netflix|youtube|twitter|facebook|instagram|tiktok|chiste|broma|poema|cuento|filosofia|filosofía|matemática|matematica|programar|código|codigo|python|javascript|java|html|css)\b/i,
      /\b(quién es|quien es|que es el|qué es el|dime sobre|cuéntame sobre|cuentame sobre|explícame|explicame|háblame de|hablame de)\b(?!.*(producto|semilla|abono|fertilizante|herramienta|pago|envío|envio|carrito|tienda|montes de maria|agroasistente|catalogo|catálogo|stock|precio|presentacion|disponibilidad|receta|cocina|cultivo|cosecha|riego|campo|animal|lácteo|lacteo|fruta|verdura|hortaliza))/i
    ];

    if (offTopicPatterns.some(pattern => pattern.test(message))) {
      return `Lo siento, solo puedo ayudarte con temas relacionados a **De los Montes de María** 🌾\n\nPuedo asistirte con:\n- 🌱 **Nuestro catálogo** de semillas, abonos, herramientas y nutrición animal\n- 🍳 **Recetas e ideas** con nuestros productos\n- 🔧 **Recomendaciones de herramientas** para tu finca o cultivo\n- 💳 **Métodos de pago y envíos**\n\n¿En qué puedo ayudarte hoy?`;
    }

    const systemInstruction = `Eres AgroAsistente, el asistente virtual oficial de "De los Montes de María", tienda agropecuaria colombiana en El Carmen de Bolívar.
Conoces a fondo todos los productos del catálogo:
${JSON.stringify(productos)}

Medios de pago: Tarjeta de Crédito/Débito, Agro-Créditos, Wompi, ePayco y PayPal.
Envíos a toda Colombia.

REGLAS DE FORMATO:
- Cuando recomiendes un producto, INCLUYE SIEMPRE la etiqueta especial:
  * **Insumo:** [Nombre]
  * **Precio:** $[Precio] COP
  * **Presentación:** [Presentación] | **Disponibilidad:** [Cantidad]
  [AGRO_ADD_CART: id_producto|nombre_producto|precio|presentacion|disponibilidad|imagen]`;

    const messages = [{ role: 'system', content: systemInstruction }];
    history.forEach(item => {
      messages.push({
        role: item.role === 'user' ? 'user' : 'assistant',
        content: item.text || item.content
      });
    });
    messages.push({ role: 'user', content: message });

    try {
      const completion = await this.callChatCompletion({
        messages,
        temperature: 0.7,
        max_tokens: 600,
        appTitle: 'De los Montes de Maria Store AI'
      });
      return completion.message?.content || 'Entendido.';
    } catch (err) {
      console.error('Error en procesarChatPublico:', err);
      return `❌ Error al conectar con el Asistente de IA: ${err.message}`;
    }
  }

  // ==========================================
  // ==========================================
  // 2. ASISTENTE DE ADMINISTRACIÓN (AdminIA)
  // ==========================================
  async procesarChatAdmin(prompt, history = [], adminUserId = 1, repositories = {}) {
    const apiKey = appConfig.openRouterApiKey;
    if (!apiKey || apiKey.startsWith('tu_clave')) {
      return { respuesta: '⚠️ La API Key de OpenRouter no está configurada en las variables de entorno.' };
    }

    const {
      usuarioRepository,
      productoRepository,
      compraRepository,
      categoriaRepository,
      bannerRepository,
      couponRepository,
      soporteRepository
    } = repositories;

    // 1. Obtener métricas e inventario en tiempo real para contexto gerencial
    let liveStatsText = '';
    try {
      const [prods, usrs, ords, cats, cupons, banners] = await Promise.all([
        productoRepository ? productoRepository.listarTodos() : [],
        usuarioRepository ? usuarioRepository.listarTodos() : [],
        compraRepository ? compraRepository.listarTodas() : [],
        categoriaRepository ? categoriaRepository.listar() : [],
        couponRepository ? couponRepository.obtenerTodos() : [],
        bannerRepository ? bannerRepository.obtenerTodos() : []
      ]);

      const totalProds = Array.isArray(prods) ? prods.length : 0;
      const lowStockProds = Array.isArray(prods)
        ? prods.filter(p => Number(p.stock) <= 5).map(p => `${p.nombre_producto || 'Sin nombre'} (Stock: ${p.stock ?? 0})`)
        : [];
      const totalUsrs = Array.isArray(usrs) ? usrs.length : 0;
      const campesinos = Array.isArray(usrs)
        ? usrs.filter(u => u.rolNombre === 'Campesino' || u.id_rol === 3 || u.rol === 'campesino' || (u.municipio && u.municipio.trim() !== '')).length
        : 0;
      const admins = Array.isArray(usrs)
        ? usrs.filter(u => u.rolNombre === 'Administrador' || u.id_rol === 1 || u.rol === 'admin').length
        : 0;
      const totalOrders = Array.isArray(ords) ? ords.length : 0;
      const pendingOrders = Array.isArray(ords) ? ords.filter(o => o.estado === 'pendiente' || !o.estado || o.estado === 'Pedido recibido').length : 0;
      const deliveredOrders = Array.isArray(ords) ? ords.filter(o => o.estado === 'entregado').length : 0;
      const totalSales = Array.isArray(ords)
        ? ords.filter(o => o.estado !== 'cancelado').reduce((sum, o) => sum + Number(o.total || 0), 0)
        : 0;
      const catNames = Array.isArray(cats) ? cats.map(c => c.nombre_categoria || c.nombre || c.slug).filter(Boolean).join(', ') : '';
      const totalCupons = Array.isArray(cupons) ? cupons.length : 0;
      const totalBanners = Array.isArray(banners) ? banners.length : 0;

      liveStatsText = `
MÉTRICAS Y ESTADO DEL SISTEMA EN TIEMPO REAL:
- Catálogo: ${totalProds} productos activos
- Productos con Stock Crítico (<= 5 unidades): ${lowStockProds.length > 0 ? lowStockProds.slice(0, 10).join(', ') : 'Ninguno, inventario abastecido'}
- Usuarios Registrados: ${totalUsrs} usuarios (${campesinos} campesinos/productores, ${admins} administradores)
- Pedidos: ${totalOrders} compras registradas (${pendingOrders} pendientes, ${deliveredOrders} entregados)
- Volumen Total de Ventas: $${totalSales.toLocaleString('es-CO')} COP
- Categorías Activas: ${catNames || 'Cosechas, Transformados, Insumos, Artesanías, Lácteos'}
- Cupones de Descuento: ${totalCupons} cupones
- Banners del Carrusel: ${totalBanners} diapositivas
`;
    } catch (metricErr) {
      console.warn('⚠️ [AdminIA] Advertencia cargando métricas en tiempo real:', metricErr.message);
    }

    const ADMIN_TOOLS = [
      // 1. PRODUCTOS
      {
        type: 'function',
        function: {
          name: 'list_products',
          description: 'Obtiene la lista de productos del catálogo con su stock, precio y vendedor asignado.',
          parameters: { type: 'object', properties: { search: { type: 'string', description: 'Término de búsqueda opcional' } } }
        }
      },
      {
        type: 'function',
        function: {
          name: 'create_product',
          description: 'Crea un nuevo producto en el catálogo.',
          parameters: {
            type: 'object',
            properties: {
              nombre: { type: 'string' },
              precio: { type: 'number' },
              stock: { type: 'number', description: 'Cantidad en inventario inicial' },
              descripcion: { type: 'string' },
              categoria: { type: 'string' },
              presentacion: { type: 'string' },
              origen: { type: 'string' },
              cuidado: { type: 'string' },
              id_vendedor: { type: 'integer' }
            },
            required: ['nombre', 'precio']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'update_product',
          description: 'Modifica o actualiza el precio, stock, descripción, categoría u origen de un producto existente.',
          parameters: {
            type: 'object',
            properties: {
              id_producto: { type: 'integer' },
              nombre_busqueda: { type: 'string' },
              precio: { type: 'number' },
              stock: { type: 'number' },
              descripcion: { type: 'string' },
              categoria: { type: 'string' },
              presentacion: { type: 'string' },
              origen: { type: 'string' },
              cuidado: { type: 'string' },
              id_vendedor: { type: 'integer' }
            }
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'delete_product',
          description: 'Elimina un producto por ID o nombre del catálogo.',
          parameters: {
            type: 'object',
            properties: {
              id_producto: { type: 'integer' },
              nombre: { type: 'string' }
            }
          }
        }
      },

      // 2. CATEGORÍAS
      {
        type: 'function',
        function: {
          name: 'list_categories',
          description: 'Lista todas las categorías de productos disponibles.',
          parameters: { type: 'object', properties: {} }
        }
      },
      {
        type: 'function',
        function: {
          name: 'create_category',
          description: 'Crea una nueva categoría de productos.',
          parameters: {
            type: 'object',
            properties: {
              nombre_categoria: { type: 'string' },
              descripcion: { type: 'string' },
              icono: { type: 'string' }
            },
            required: ['nombre_categoria']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'delete_category',
          description: 'Elimina una categoría por su ID.',
          parameters: {
            type: 'object',
            properties: { id_categoria: { type: 'integer' } },
            required: ['id_categoria']
          }
        }
      },

      // 3. USUARIOS Y CAMPESINOS
      {
        type: 'function',
        function: {
          name: 'list_users',
          description: 'Lista y busca usuarios registrados (campesinos, administradores, clientes).',
          parameters: { type: 'object', properties: { search: { type: 'string' } } }
        }
      },
      {
        type: 'function',
        function: {
          name: 'update_user',
          description: 'Actualiza datos de un usuario, como su rol, estado (activo/suspendido), teléfono o municipio.',
          parameters: {
            type: 'object',
            properties: {
              id_usuario: { type: 'integer' },
              correo_busqueda: { type: 'string' },
              id_rol: { type: 'integer', description: '1: Admin, 2: Cliente, 3: Campesino/Vendedor' },
              estado: { type: 'string', description: 'activo o suspendido' },
              nombre: { type: 'string' },
              municipio: { type: 'string' },
              telefono: { type: 'string' }
            }
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'delete_user',
          description: 'Elimina permanentemente una cuenta de usuario.',
          parameters: {
            type: 'object',
            properties: { id_usuario: { type: 'integer' } },
            required: ['id_usuario']
          }
        }
      },

      // 4. PEDIDOS Y COMPRAS
      {
        type: 'function',
        function: {
          name: 'list_orders',
          description: 'Lista los pedidos y compras registradas en el sistema.',
          parameters: { type: 'object', properties: { search: { type: 'string' }, id_compra: { type: 'integer' } } }
        }
      },
      {
        type: 'function',
        function: {
          name: 'update_order',
          description: 'Actualiza el estado de entrega de una compra (ej: En camino, entregado, cancelado).',
          parameters: {
            type: 'object',
            properties: {
              id_compra: { type: 'integer' },
              estado: { type: 'string', description: 'Pedido recibido | En preparación | En camino | entregado | cancelado' }
            },
            required: ['id_compra', 'estado']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'delete_order',
          description: 'Elimina una orden de compra permanentemente.',
          parameters: {
            type: 'object',
            properties: { id_compra: { type: 'integer' } },
            required: ['id_compra']
          }
        }
      },

      // 5. CUPONES DE DESCUENTO
      {
        type: 'function',
        function: {
          name: 'list_coupons',
          description: 'Lista todos los cupones de descuento activos e inactivos.',
          parameters: { type: 'object', properties: {} }
        }
      },
      {
        type: 'function',
        function: {
          name: 'create_coupon',
          description: 'Crea un nuevo cupón de descuento promocional.',
          parameters: {
            type: 'object',
            properties: {
              codigo: { type: 'string' },
              descuento_porcentaje: { type: 'number' },
              descuento_fijo: { type: 'number' },
              monto_minimo: { type: 'number' },
              uso_limite: { type: 'number' },
              descripcion: { type: 'string' },
              fecha_expiracion: { type: 'string' }
            },
            required: ['codigo']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'toggle_coupon',
          description: 'Activa o desactiva un cupón de descuento.',
          parameters: {
            type: 'object',
            properties: { id_cupon: { type: 'integer' } },
            required: ['id_cupon']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'delete_coupon',
          description: 'Elimina un cupón de descuento.',
          parameters: {
            type: 'object',
            properties: { id_cupon: { type: 'integer' } },
            required: ['id_cupon']
          }
        }
      },

      // 6. BANNERS Y CARRUSEL HERO
      {
        type: 'function',
        function: {
          name: 'list_banners',
          description: 'Lista las diapositivas y banners configurados en la página principal.',
          parameters: { type: 'object', properties: {} }
        }
      },
      {
        type: 'function',
        function: {
          name: 'create_banner',
          description: 'Registra una nueva diapositiva o banner en el carrusel de inicio.',
          parameters: {
            type: 'object',
            properties: {
              titulo: { type: 'string' },
              subtitulo: { type: 'string' },
              boton_principal_texto: { type: 'string' },
              boton_principal_link: { type: 'string' },
              etiqueta: { type: 'string' },
              color_acento: { type: 'string' }
            },
            required: ['titulo']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'delete_banner',
          description: 'Elimina un banner del carrusel por su ID.',
          parameters: {
            type: 'object',
            properties: { id_banner: { type: 'integer' } },
            required: ['id_banner']
          }
        }
      }
    ];

    const executeTool = async (name, args) => {
      try {
        // PRODUCTOS
        if (name === 'list_products' && productoRepository) {
          const rows = args.search ? await productoRepository.buscar(args.search) : await productoRepository.listarTodos();
          return { success: true, count: rows.length, productos: rows.slice(0, 15) };
        }
        if (name === 'create_product' && productoRepository) {
          const prod = await productoRepository.crear({
            nombre_producto: args.nombre,
            precio: args.precio,
            stock: args.stock !== undefined ? args.stock : 10,
            descripcion: args.descripcion || '',
            categoria: args.categoria || 'cosechas',
            presentacion: args.presentacion || 'Por Kilo',
            origen: args.origen || 'Montes de María',
            cuidado: args.cuidado || 'Lugar fresco y seco',
            id_vendedor: args.id_vendedor || null,
            imagen: '/img/Logo.jpg'
          });
          return { success: true, message: `Producto "${args.nombre}" creado exitosamente`, producto: prod };
        }
        if (name === 'update_product' && productoRepository) {
          let targetId = args.id_producto;
          if (!targetId && args.nombre_busqueda) {
            const found = await productoRepository.buscar(args.nombre_busqueda);
            if (found && found.length > 0) targetId = found[0].id_producto;
          }
          if (!targetId) return { success: false, error: 'Producto no encontrado' };

          const updateData = {};
          if (args.precio !== undefined) updateData.precio = args.precio;
          if (args.stock !== undefined) updateData.stock = args.stock;
          if (args.descripcion !== undefined) updateData.descripcion = args.descripcion;
          if (args.categoria !== undefined) updateData.categoria = args.categoria;
          if (args.presentacion !== undefined) updateData.presentacion = args.presentacion;
          if (args.origen !== undefined) updateData.origen = args.origen;
          if (args.cuidado !== undefined) updateData.cuidado = args.cuidado;
          if (args.id_vendedor !== undefined) updateData.id_vendedor = args.id_vendedor;

          await productoRepository.actualizar(targetId, updateData);
          return { success: true, message: `Producto #${targetId} actualizado con éxito.`, camposModificados: Object.keys(updateData) };
        }
        if (name === 'delete_product' && productoRepository) {
          let targetId = args.id_producto;
          if (!targetId && args.nombre) {
            const found = await productoRepository.buscar(args.nombre);
            if (found && found.length > 0) targetId = found[0].id_producto;
          }
          if (!targetId) return { success: false, error: 'Producto no encontrado' };
          await productoRepository.eliminar(targetId);
          return { success: true, message: `Producto #${targetId} eliminado correctamente.` };
        }

        // CATEGORÍAS
        if (name === 'list_categories' && categoriaRepository) {
          const rows = await categoriaRepository.listar();
          return { success: true, count: rows.length, categorias: rows };
        }
        if (name === 'create_category' && categoriaRepository) {
          const cat = await categoriaRepository.crear({
            nombre_categoria: args.nombre_categoria,
            descripcion: args.descripcion,
            icono: args.icono || 'fa-box'
          });
          return { success: true, message: `Categoría "${args.nombre_categoria}" creada exitosamente.`, categoria: cat };
        }
        if (name === 'delete_category' && categoriaRepository) {
          await categoriaRepository.eliminar(args.id_categoria);
          return { success: true, message: `Categoría #${args.id_categoria} eliminada exitosamente.` };
        }

        // USUARIOS
        if (name === 'list_users' && usuarioRepository) {
          const rows = await usuarioRepository.listarTodos(args.search);
          return { success: true, count: rows.length, usuarios: rows.slice(0, 15) };
        }
        if (name === 'update_user' && usuarioRepository) {
          let targetId = args.id_usuario;
          if (!targetId && args.correo_busqueda) {
            const found = await usuarioRepository.buscarPorCorreo(args.correo_busqueda);
            if (found) targetId = found.id_usuario || found.id;
          }
          if (!targetId) return { success: false, error: 'Usuario no encontrado' };

          const updateData = {};
          if (args.id_rol !== undefined) updateData.id_rol = args.id_rol;
          if (args.estado !== undefined) updateData.estado = args.estado;
          if (args.nombre !== undefined) updateData.nombre = args.nombre;
          if (args.municipio !== undefined) updateData.municipio = args.municipio;
          if (args.telefono !== undefined) updateData.telefono = args.telefono;

          await usuarioRepository.actualizar(targetId, updateData);
          return { success: true, message: `Usuario #${targetId} actualizado con éxito (${JSON.stringify(updateData)}).` };
        }
        if (name === 'delete_user' && usuarioRepository) {
          await usuarioRepository.eliminar(args.id_usuario);
          return { success: true, message: `Usuario #${args.id_usuario} eliminado exitosamente.` };
        }

        // COMPRAS / PEDIDOS
        if (name === 'list_orders' && compraRepository) {
          const rows = await compraRepository.listarTodas(args.search);
          return { success: true, count: rows.length, compras: rows.slice(0, 15) };
        }
        if (name === 'update_order' && compraRepository) {
          await compraRepository.actualizarEstado(args.id_compra, args.estado);
          return { success: true, message: `Compra #${args.id_compra} actualizada a estado: ${args.estado}` };
        }
        if (name === 'delete_order' && compraRepository) {
          await compraRepository.eliminar(args.id_compra);
          return { success: true, message: `Compra #${args.id_compra} eliminada exitosamente.` };
        }

        // CUPONES
        if (name === 'list_coupons' && couponRepository) {
          const rows = await couponRepository.obtenerTodos();
          return { success: true, count: rows.length, cupones: rows };
        }
        if (name === 'create_coupon' && couponRepository) {
          const c = await couponRepository.crear({
            codigo: args.codigo,
            descuento_porcentaje: args.descuento_porcentaje || 0,
            descuento_fijo: args.descuento_fijo || 0,
            monto_minimo: args.monto_minimo || 0,
            uso_limite: args.uso_limite || null,
            descripcion: args.descripcion || '',
            fecha_expiracion: args.fecha_expiracion || null,
            activo: 1
          });
          return { success: true, message: `Cupón "${args.codigo}" creado exitosamente.`, cupon: c };
        }
        if (name === 'toggle_coupon' && couponRepository) {
          await couponRepository.toggleActivo(args.id_cupon);
          return { success: true, message: `Estado del cupón #${args.id_cupon} modificado.` };
        }
        if (name === 'delete_coupon' && couponRepository) {
          await couponRepository.eliminar(args.id_cupon);
          return { success: true, message: `Cupón #${args.id_cupon} eliminado.` };
        }

        // BANNERS
        if (name === 'list_banners' && bannerRepository) {
          const rows = await bannerRepository.obtenerTodos();
          return { success: true, count: rows.length, banners: rows };
        }
        if (name === 'create_banner' && bannerRepository) {
          const b = await bannerRepository.crear({
            titulo: args.titulo,
            subtitulo: args.subtitulo || '',
            boton_principal_texto: args.boton_principal_texto || 'Ver Catálogo',
            boton_principal_link: args.boton_principal_link || '/catalogo',
            color_acento: args.color_acento || '#22c55e',
            activo: 1
          });
          return { success: true, message: `Banner "${args.titulo}" registrado exitosamente.`, banner: b };
        }
        if (name === 'delete_banner' && bannerRepository) {
          await bannerRepository.eliminar(args.id_banner);
          return { success: true, message: `Banner #${args.id_banner} eliminado.` };
        }

        return { success: false, error: 'Herramienta no reconocida' };
      } catch (toolExecErr) {
        return { success: false, error: toolExecErr.message };
      }
    };

    const systemMessage = {
      role: 'system',
      content: `Eres el "Asistente IA Gerencial y Operativo Integral" de "De los Montes de María S.A.S" (El Carmen de Bolívar, Montes de María, Colombia).
Tienes facultades plenas otorgadas por la Gerencia General para:
1. GESTIÓN OPERATIVA COMPLETA: Crear, actualizar y eliminar productos, modificar stock, ajustar precios, gestionar categorías, administrar usuarios (roles, suspensión o activación), actualizar estados de compras/pedidos, crear y controlar cupones de descuento, y administrar banners del carrusel.
2. CONSULTORÍA Y ESTRATEGIA COMERCIAL: Analizar métricas reales, proyecciones de ventas, vocación agrícola (ñame, yuca, cacao, aguacate, plátano, miel, tabaco), precios justos, logística hacia el Caribe colombiano y apoyo solidario al campesinado.

${liveStatsText}

PAUTAS CRÍTICAS:
- Cuando el usuario te pida realizar una acción administrativa (ej: "crea un producto", "aumenta el stock de X a 50", "suspende a tal usuario", "cambia el estado del pedido 3 a En camino", "crea un cupón de 15%"), INVOCA LA HERRAMIENTA CORRESPONDIENTE INMEDIATAMENTE.
- Responde siempre con formato profesional, claro y enriquecido (Markdown, tablas, emojis y viñetas).`
    };

    // Normalizar historial
    const normalizedHistory = Array.isArray(history)
      ? history.map(item => ({
          role: item.role === 'user' ? 'user' : 'assistant',
          content: item.content || item.text || ''
        })).filter(h => Boolean(h.content))
      : [];

    const messages = [systemMessage, ...normalizedHistory, { role: 'user', content: prompt }];

    try {
      const completion = await this.callChatCompletion({
        messages,
        tools: ADMIN_TOOLS,
        tool_choice: 'auto',
        temperature: 0.7,
        max_tokens: 800,
        appTitle: 'De los Montes de Maria Admin IA'
      });

      const message = completion.message;
      if (message.tool_calls && message.tool_calls.length > 0) {
        messages.push(message);
        for (const toolCall of message.tool_calls) {
          let fnArgs = {};
          try { fnArgs = JSON.parse(toolCall.function.arguments); } catch (_) {}
          const toolResult = await executeTool(toolCall.function.name, fnArgs);
          messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            name: toolCall.function.name,
            content: JSON.stringify(toolResult)
          });
        }

        const secondCompletion = await this.callChatCompletion({
          messages,
          temperature: 0.7,
          max_tokens: 800,
          appTitle: 'De los Montes de Maria Admin IA'
        });

        return { respuesta: secondCompletion.message?.content || 'Acción ejecutada con éxito.', reloadData: true };
      }

      return { respuesta: message.content || 'Entendido.' };
    } catch (err) {
      console.error('Error en procesarChatAdmin:', err);
      return { respuesta: `⚠️ Error al procesar solicitud con la IA: ${err.message}` };
    }
  }

  // ==========================================
  // 3. ASISTENTE DE SOPORTE EN VIVO
  // ==========================================
  async procesarMensajeSoporte({ session_id, ticket, mensaje, id_usuario, repositories }) {
    const { usuarioRepository, productoRepository, compraRepository } = repositories;
    const correo = ticket.correo_cliente;

    const pendingInput = this.pendingInput.get(session_id);
    if (pendingInput && pendingInput.action === 'set_new_password') {
      if (mensaje.trim().length < 8) return 'La contraseña debe tener al menos 8 caracteres. Intenta de nuevo:';
      this.pendingInput.delete(session_id);
      await usuarioRepository.actualizarContrasena(pendingInput.id_usuario, mensaje.trim());
      return 'Tu contraseña ha sido actualizada exitosamente.';
    }

    if (/^\d{6}$/.test(mensaje.trim()) && this.pendingVerifications.has(session_id)) {
      const pv = this.pendingVerifications.get(session_id);
      if (Date.now() > pv.expires) {
        this.pendingVerifications.delete(session_id);
        return 'El código ha expirado. Por favor solicita el cambio nuevamente.';
      }
      if (mensaje.trim() === pv.code) {
        this.pendingVerifications.delete(session_id);
        if (pv.action === 'cambiar_nombre') {
          await usuarioRepository.actualizar(pv.id_usuario, { nombre: pv.data.nuevo_nombre });
          return `Tu nombre ha sido actualizado a **${pv.data.nuevo_nombre}**.`;
        }
        if (pv.action === 'cambiar_apodo') {
          await usuarioRepository.actualizar(pv.id_usuario, { apodo: pv.data.nuevo_apodo });
          return `Tu apodo ha sido actualizado a **${pv.data.nuevo_apodo}**.`;
        }
        if (pv.action === 'cambiar_correo') {
          await usuarioRepository.actualizar(pv.id_usuario, { correo: pv.data.nuevo_correo });
          return `Tu correo ha sido actualizado a **${pv.data.nuevo_correo}**.`;
        }
        if (pv.action === 'cambiar_password') {
          this.pendingInput.set(session_id, { action: 'set_new_password', id_usuario: pv.id_usuario });
          return 'Código verificado correctamente. Por favor ingresa tu **nueva contraseña** (mínimo 8 caracteres):';
        }
        if (pv.action === 'eliminar_cuenta') {
          await usuarioRepository.eliminar(pv.id_usuario);
          return 'Tu cuenta ha sido eliminada permanentemente del sistema.';
        }
      } else {
        return 'Código incorrecto. Verifica e intenta de nuevo.';
      }
    }

    const apiKey = appConfig.openRouterApiKey;
    if (!apiKey || apiKey.startsWith('tu_clave')) {
      return 'El asistente de IA no está configurado. Presiona **"Hablar con un asesor"** para contactar con soporte humano.';
    }

    const SUPPORT_TOOLS = [
      {
        type: 'function',
        function: {
          name: 'get_user_orders',
          description: 'Obtiene los pedidos y compras del usuario.',
          parameters: { type: 'object', properties: {} }
        }
      },
      {
        type: 'function',
        function: {
          name: 'get_products',
          description: 'Busca productos en la tienda.',
          parameters: { type: 'object', properties: { busqueda: { type: 'string' } } }
        }
      },
      {
        type: 'function',
        function: {
          name: 'request_change_password',
          description: 'Inicia cambio de contraseña enviando código de seguridad al correo.',
          parameters: { type: 'object', properties: {} }
        }
      }
    ];

    const executeTool = async (name, args) => {
      if (name === 'get_user_orders') {
        if (!id_usuario) return { found: false, message: 'Usuario no autenticado' };
        const orders = await compraRepository.listarPorUsuario(id_usuario);
        return { found: true, pedidos: orders.slice(0, 5) };
      }
      if (name === 'get_products') {
        const prods = await productoRepository.buscar(args.busqueda || '');
        return { found: prods.length > 0, productos: prods.slice(0, 5) };
      }
      if (name === 'request_change_password') {
        if (!id_usuario) return { error: 'Debes iniciar sesión para cambiar contraseña' };
        const code = String(Math.floor(100000 + Math.random() * 900000));
        this.pendingVerifications.set(session_id, {
          action: 'cambiar_password',
          code,
          expires: Date.now() + 600000,
          id_usuario
        });
        await this.emailService.sendSecurityCodeEmail(correo, code, 'cambio de contraseña');
        return { sent: true, message: `Código de seguridad enviado a ${correo}` };
      }
      return { error: 'Herramienta desconocida' };
    };

    const systemPrompt = `Eres el asistente virtual de soporte de "De los Montes de María".
Cliente: ${ticket.nombre_cliente} (${correo}).
Responde con amabilidad, precisión y concisión. Usa las herramientas cuando sea necesario.`;

    const messages = [{ role: 'system', content: systemPrompt }, { role: 'user', content: mensaje }];

    try {
      const completion = await this.callChatCompletion({
        messages,
        tools: SUPPORT_TOOLS,
        tool_choice: 'auto',
        temperature: 0.7,
        max_tokens: 500,
        appTitle: 'De los Montes de Maria Support IA'
      });

      const aiMsg = completion.message;
      if (aiMsg.tool_calls && aiMsg.tool_calls.length > 0) {
        const toolCall = aiMsg.tool_calls[0];
        let toolArgs = {};
        try { toolArgs = JSON.parse(toolCall.function.arguments); } catch (_) {}
        const toolResult = await executeTool(toolCall.function.name, toolArgs);

        messages.push(aiMsg);
        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          name: toolCall.function.name,
          content: JSON.stringify(toolResult)
        });

        const secondCompletion = await this.callChatCompletion({
          messages,
          temperature: 0.7,
          max_tokens: 500,
          appTitle: 'De los Montes de Maria Support IA'
        });

        return secondCompletion.message?.content || 'Solicitud procesada.';
      }

      return aiMsg.content || 'Entendido.';
    } catch (err) {
      console.error('Error en procesarMensajeSoporte:', err);
      return 'Ocurrió un error. Haz clic en **"Hablar con un asesor"** para ser atendido por un agente.';
    }
  }

  // ==========================================
  // 4. GENERADOR RÁPIDO DE RESPUESTAS DE SOPORTE PARA ADMIN
  // ==========================================
  async generarRespuestaSoporte(mensaje, contexto = '') {
    const apiKey = appConfig.openRouterApiKey;
    if (!apiKey || apiKey.startsWith('tu_clave')) {
      return null;
    }

    const messages = [
      {
        role: 'system',
        content: `Eres el asistente de soporte de "De los Montes de María", tienda de productos agrícolas directos de familias campesinas de Montes de María, Colombia.
Genera una respuesta cordial, clara, concisa y empática para el cliente en máximo 2 o 3 párrafos cortos.
Contexto: ${contexto}`
      },
      { role: 'user', content: mensaje }
    ];

    try {
      const completion = await this.callChatCompletion({
        messages,
        temperature: 0.7,
        max_tokens: 300,
        appTitle: 'De los Montes de Maria Quick Support Reply'
      });
      return completion.message?.content || null;
    } catch (err) {
      console.error('[IAService generarRespuestaSoporte Error]:', err);
      return null;
    }
  }
}

module.exports = IAService;
