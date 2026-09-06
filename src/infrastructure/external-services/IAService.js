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
  // 2. ASISTENTE DE ADMINISTRACIÓN (AdminIA)
  // ==========================================
  async procesarChatAdmin(prompt, history = [], adminUserId = 1, repositories = {}) {
    const apiKey = appConfig.openRouterApiKey;
    if (!apiKey || apiKey.startsWith('tu_clave')) {
      return { respuesta: '⚠️ La API Key de OpenRouter no está configurada en las variables de entorno.' };
    }

    const { usuarioRepository, productoRepository, compraRepository, categoriaRepository } = repositories;

    // 1. Obtener métricas e inventario en tiempo real para contexto gerencial
    let liveStatsText = '';
    try {
      const [prods, usrs, ords, cats] = await Promise.all([
        productoRepository ? productoRepository.listarTodos() : [],
        usuarioRepository ? usuarioRepository.listarTodos() : [],
        compraRepository ? compraRepository.listarTodas() : [],
        categoriaRepository ? categoriaRepository.listar() : []
      ]);

      const totalProds = Array.isArray(prods) ? prods.length : 0;
      const lowStockProds = Array.isArray(prods)
        ? prods.filter(p => Number(p.stock) <= 5).map(p => `${p.nombre_producto || 'Sin nombre'} (Stock: ${p.stock ?? 0})`)
        : [];
      const totalUsrs = Array.isArray(usrs) ? usrs.length : 0;
      const campesinos = Array.isArray(usrs)
        ? usrs.filter(u => u.rolNombre === 'Campesino' || u.id_rol === 3 || u.rol === 'campesino' || (u.municipio && u.municipio.trim() !== '')).length
        : 0;
      const totalOrders = Array.isArray(ords) ? ords.length : 0;
      const pendingOrders = Array.isArray(ords) ? ords.filter(o => o.estado === 'pendiente' || !o.estado || o.estado === 'Pedido recibido').length : 0;
      const deliveredOrders = Array.isArray(ords) ? ords.filter(o => o.estado === 'entregado').length : 0;
      const totalSales = Array.isArray(ords)
        ? ords.filter(o => o.estado !== 'cancelado').reduce((sum, o) => sum + Number(o.total || 0), 0)
        : 0;
      const catNames = Array.isArray(cats) ? cats.map(c => c.nombre_categoria || c.nombre || c.slug).filter(Boolean).join(', ') : '';

      liveStatsText = `
MÉTRICAS DEL SISTEMA EN TIEMPO REAL:
- Catálogo de Productos Activos: ${totalProds} productos
- Productos con Stock Crítico (<= 5 unidades): ${lowStockProds.length > 0 ? lowStockProds.slice(0, 10).join(', ') : 'Ninguno, inventario abastecido'}
- Usuarios Registrados: ${totalUsrs} usuarios (${campesinos} identificados como campesinos/productores)
- Pedidos Registrados: ${totalOrders} pedidos (${pendingOrders} pendientes por procesar/entregar, ${deliveredOrders} entregados)
- Volumen Total de Ventas: $${totalSales.toLocaleString('es-CO')} COP
- Categorías Disponibles: ${catNames || 'Cosechas, Transformados, Insumos, Artesanías, Lácteos'}
`;
    } catch (metricErr) {
      console.warn('⚠️ [AdminIA] Advertencia cargando métricas en tiempo real:', metricErr.message);
    }

    const ADMIN_TOOLS = [
      {
        type: 'function',
        function: {
          name: 'list_products',
          description: 'Obtiene la lista de productos del catálogo con su stock y precio.',
          parameters: { type: 'object', properties: { search: { type: 'string' } } }
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
              descripcion: { type: 'string' },
              categoria: { type: 'string' },
              imagen: { type: 'string' }
            },
            required: ['nombre', 'precio']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'delete_product',
          description: 'Elimina un producto por ID o nombre.',
          parameters: {
            type: 'object',
            properties: {
              id_producto: { type: 'integer' },
              nombre: { type: 'string' }
            }
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'list_users',
          description: 'Lista los usuarios registrados en la plataforma.',
          parameters: { type: 'object', properties: { search: { type: 'string' } } }
        }
      },
      {
        type: 'function',
        function: {
          name: 'list_orders',
          description: 'Lista los pedidos y compras registradas.',
          parameters: { type: 'object', properties: { search: { type: 'string' }, id_compra: { type: 'integer' } } }
        }
      },
      {
        type: 'function',
        function: {
          name: 'update_order',
          description: 'Actualiza el estado de una compra.',
          parameters: {
            type: 'object',
            properties: {
              id_compra: { type: 'integer' },
              estado: { type: 'string' }
            },
            required: ['id_compra', 'estado']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'delete_order',
          description: 'Elimina una compra permanentemente.',
          parameters: {
            type: 'object',
            properties: { id_compra: { type: 'integer' } },
            required: ['id_compra']
          }
        }
      }
    ];

    const executeTool = async (name, args) => {
      if (name === 'list_products' && productoRepository) {
        const rows = args.search ? await productoRepository.buscar(args.search) : await productoRepository.listarTodos();
        return { success: true, count: rows.length, productos: rows.slice(0, 15) };
      }
      if (name === 'create_product' && productoRepository) {
        const prod = await productoRepository.crear({
          nombre_producto: args.nombre,
          precio: args.precio,
          descripcion: args.descripcion || '',
          categoria: args.categoria || 'cosechas',
          imagen: args.imagen || '/img/Logo.jpg'
        });
        return { success: true, message: `Producto "${args.nombre}" creado exitosamente`, producto: prod };
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
      if (name === 'list_users' && usuarioRepository) {
        const rows = await usuarioRepository.listarTodos(args.search);
        return { success: true, count: rows.length, usuarios: rows.slice(0, 15) };
      }
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
      return { success: false, error: 'Herramienta no reconocida' };
    };

    const systemMessage = {
      role: 'system',
      content: `Eres el "Asistente IA Gerencial y Estratégico" de la plataforma agropecuaria "De los Montes de María S.A.S" (El Carmen de Bolívar, Montes de María, Colombia).
Tu labor es brindar soporte de alto nivel a la Dirección y Administración General en toma de decisiones, análisis comercial, inventario, precios justos y apoyo al campesinado.

${liveStatsText}

PAUTAS DE COMPORTAMIENTO Y FORMATO:
1. Responde de forma ejecutiva, estructurada, profesional y empática, usando formato Markdown (títulos, negritas, listas y emojis representativos).
2. Para consultas sobre ventas, métricas o inventario, usa las cifras en tiempo real indicadas arriba.
3. Para estrategias de mercado o producción agropecuaria, toma en cuenta la vocación agrícola de la subregión Montes de María (ñame diamante/espino, yuca, cacao, aguacate, plátano, maíz, miel de abejas, tabaco, palma, frutas y artesanías).
4. Si el administrador solicita expresamente crear, modificar o eliminar registros operativos (productos, usuarios, pedidos), utiliza las herramientas integradas cuando sea necesario.`
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
        max_tokens: 700,
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
          max_tokens: 700,
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
